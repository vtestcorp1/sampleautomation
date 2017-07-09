/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 */

#include <unicode/locid.h>
#include <unicode/unistr.h>
#include <unicode/uenum.h>
#include <unicode/ucurr.h>
#include <unicode/ures.h>
#include <unicode/compactdecimalformat.h>

#ifndef BUILD_PACKAGE_SCRIPT
#include <emscripten/bind.h>
#endif

#include <string>
#include <iostream> // NOLINT
#include <sstream>
#include <set>

#include "number_format.h" // NOLINT
#include "util.h" // NOLINT

using std::string;
using std::wstring;
using std::wstringstream;
using std::cout;
using std::wcout;
using std::endl;
using std::map;
using std::set;
using std::extent;
using std::copy;
using std::ostream_iterator;

using icu::Locale;
using icu::DecimalFormat;
using icu::DecimalFormatSymbols;
using ENumberFormatSymbol = icu::DecimalFormatSymbols::ENumberFormatSymbol;
using icu::UnicodeString;
using FormattableType = icu::Formattable::Type;

using icu4js::Error;
using icu4js::Util;
using icu4js::FormatInfo;

static const char* kDefaultLocale = "en_US";

/**
 * In an ideal world we could simply call applyPattern/applyLocalizedPattern
 * on a decimal format and every formatting requirement would be taken care
 * of. Unfortunately this doesn't work. For example, there is no way to
 * specify using format pattern that a number be formatted as a percentage
 * and still be able to localize the formatting. Calling applyPattern with
 * #,##0.##% will always place the % at the end without any space even in
 * fr_FR locale (which would be incorrect). Similarly the positioning of
 * currency symbols will lose locale specific behavior is applied via
 * format patterns (e.g. #,##0.###% with applyPattern on fr_FR decimal
 * format will result in loss of space before the % symbol).
 * This behavior is consistent with Java standard library's NumberFormat.
 *
 * Our solution to this problem is to never directly use applyPattern/
 * applyLocalizedPattern on the decimal format we are using for formatting.
 * We effectively parse the number format pattern to derive attributes values
 * it encodes and apply those attribute values explicitly on the decimal format
 * we are using.
 *
 * Since DecimalFormatPatternParser is not part of the public API there
 * is no direct way to do parse a format pattern. The workaround is to
 * keep an auxiliary DecimalFormat instance for every DecimalFormat instance
 * that we use for formatting. This auxiliary format acts as the place where
 * we `convert` the format pattern string into format pattern attribute, value
 * pairs (which will then be applied to the mail DecimalFormat instance that
 * we use for formatting).
 *
 *
 * The list of attributes that we derive out of the format pattern by applying
 * it to the auxiliary DecimalFormat instance is created by removing from
 * UNumberFormatAttribute enum all the dervied attributes (e.g. UNUM_INTEGER_DIGITS
 * is derived from UNUM_MAX_INTEGER_DIGITS, UNUM_MIN_INTEGER_DIGITS). We need
 * to drop the derived attributes as setting them will conflict with setting
 * the value of the base attributes they are derived from.
 */
static const
UNumberFormatAttribute
kNumFmtAttrsReadFromPattern[] = {
    UNUM_GROUPING_USED,
    UNUM_DECIMAL_ALWAYS_SHOWN,
    UNUM_MAX_INTEGER_DIGITS,
    UNUM_MIN_INTEGER_DIGITS,
    UNUM_MAX_FRACTION_DIGITS,
    UNUM_MIN_FRACTION_DIGITS,
    UNUM_MULTIPLIER,
    UNUM_GROUPING_SIZE,
    UNUM_ROUNDING_MODE,
    UNUM_ROUNDING_INCREMENT,
    UNUM_FORMAT_WIDTH,
    UNUM_PADDING_POSITION,
    UNUM_SECONDARY_GROUPING_SIZE,
    UNUM_MIN_SIGNIFICANT_DIGITS,
    UNUM_MAX_SIGNIFICANT_DIGITS,
    UNUM_SIGNIFICANT_DIGITS_USED,
    UNUM_LENIENT_PARSE,
    UNUM_SCALE,
    UNUM_CURRENCY_USAGE,
    UNUM_FORMAT_FAIL_IF_MORE_THAN_MAX_DIGITS,
    UNUM_PARSE_NO_EXPONENT,
    UNUM_PARSE_DECIMAL_MARK_REQUIRED
};

static void printFormatInfo(FormatInfo format_info) {
    string default_pattern_utf8;
    format_info.default_pattern->toUTF8String(default_pattern_utf8);

    UnicodeString format_pattern;
    format_info.format->toPattern(format_pattern);
    string format_pattern_utf8;
    format_pattern.toUTF8String(format_pattern_utf8);

    UnicodeString aux_format_pattern;
    format_info.auxiliary_format->toPattern(aux_format_pattern);
    string aux_format_pattern_utf8;
    aux_format_pattern.toUTF8String(aux_format_pattern_utf8);

    string message =
        "pattern: "
        + default_pattern_utf8 + " | "
        + format_pattern_utf8  + " | "
        + aux_format_pattern_utf8 + " | "
        + std::to_string((*format_info.default_attrs)[UNUM_MULTIPLIER]);

    cout << message << endl;
}

static DecimalFormat* createCompactDecimalFormat(UNumberFormatStyle style,
                                                 const Locale& locale,
                                                 Error& error) { // NOLINT
    UErrorCode error_code = U_ZERO_ERROR;

    UNumberCompactStyle compact_style = UNUM_SHORT;
    if (style == UNumberFormatStyle::UNUM_DECIMAL_COMPACT_LONG) {
        compact_style = UNUM_LONG;
    }

    CompactDecimalFormat* format
        = CompactDecimalFormat::createInstance(locale,
                                               compact_style,
                                               error_code);


    if (U_FAILURE(error_code)) {
        error.Set(error_code,
                  "Failed to initialize icu::CompactDecimalFormat");
        if (format) {
            delete format;
        }
        return NULL;
    }
    return format;
}

static DecimalFormat* createDecimalFormat(UNumberFormatStyle style,
                                          const Locale& locale,
                                          Error& error) {
    error.Reset();

    // some styles are not yet supported by NumberFormat::CreateInstance
    // see https://github.com/icu-project/icu4c/blob/bbd17a792336de5873550794f8304a4b548b0663/source/i18n/numfmt.cpp#L1311
    switch (style) {
        case UNumberFormatStyle::UNUM_DECIMAL_COMPACT_SHORT:
        case UNumberFormatStyle::UNUM_DECIMAL_COMPACT_LONG:
            return createCompactDecimalFormat(style, locale, error);
        default:
            break;
    }

    UErrorCode error_code = U_ZERO_ERROR;

    using NF = icu::NumberFormat;
    NF *format = NF::createInstance(locale,
                                    style,
                                    error_code);

    if (!U_SUCCESS(error_code)) {
        wstring error_message =
            L"Failed to initialize icu::NumberFormat: "
                + Util::StringToWString(u_errorName(error_code));
        error.Set(Error::kGenericError, error_message);

        if (format) {
            delete format;
        }
        return NULL;
    }

    return static_cast<DecimalFormat*>(format);
}

static DecimalFormat*
createDecimalFormatWithCurrentLocale(UNumberFormatStyle style,
                                     Error& error) {
    Locale locale = Locale::getDefault();
    return createDecimalFormat(style, locale, error);
}

static int32_t
getNonFormatSymbolIndex(const UnicodeString& pattern,
                        DecimalFormatSymbols* symbols) {
    set<UnicodeString> symbol_set;

    unsigned int i;
    for (i = DecimalFormatSymbols::kDecimalSeparatorSymbol;
         i < DecimalFormatSymbols::kFormatSymbolCount;
         ++i) {
        ENumberFormatSymbol symbol_name
            = static_cast<ENumberFormatSymbol>(i);
        UnicodeString symbol = symbols->getSymbol(symbol_name);
        symbol_set.insert(symbol);
    }

    int32_t pattern_length = pattern.length();
    int32_t range_begin = 0;
    int32_t range_end = 1;

    while (range_begin < pattern_length) {
        UnicodeString range =
            pattern.tempSubStringBetween(range_begin, range_end);
        while (!Util::IsValueInSet(symbol_set, range)) {
            range_end++;

            if (range_end > pattern_length) {
                return range_begin;
            }
        }
        range_begin = range_end;
        range_end = range_begin + 1;
    }

    return -1;
}

static void setFormatAttribute(DecimalFormat* format,
                               UNumberFormatAttribute attr,
                               int32_t attr_val,
                               Error& error) {
    error.Reset();

    UErrorCode err_code = U_ZERO_ERROR;

    format->setAttribute(attr, attr_val, err_code);
    if (!U_SUCCESS(err_code)) {
        if (err_code == U_UNSUPPORTED_ERROR) {
            // this format does not care about this
            // attribute, we don't either
            return;
        }

        wstring error_message =
            L"Failed to set format attribute "
                + Util::StringToWString(u_errorName(err_code));
        error.Set(Error::kGenericError, error_message);
    }
}

static int32_t getFormatAttribute(DecimalFormat* format,
                                  UNumberFormatAttribute attr,
                                  Error& error) {
    UErrorCode err_code = U_ZERO_ERROR;

    int32_t attr_val = format->getAttribute(attr, err_code);

    if (!U_SUCCESS(err_code)) {
        if (err_code == U_UNSUPPORTED_ERROR) {
            return -1;
        }

        wstring error_message =
            L"Failed to get format attribute "
                + Util::StringToWString(u_errorName(err_code));
        error.Set(Error::kGenericError, error_message);
        return -1;
    }

    return attr_val;
}

static DecimalFormatSymbols* createSymbols(string locale_name,
                                           Error& error) {
    error.Reset();

    UErrorCode err_code = U_ZERO_ERROR;

    Locale symbols_locale(locale_name.c_str());
    DecimalFormatSymbols* symbols =
        new DecimalFormatSymbols(symbols_locale, err_code);

    if (!U_SUCCESS(err_code)) {
        wstring error_message =
            L"Failed to initialize DecimalFormatSymbols "
                + Util::StringToWString(u_errorName(err_code));
        error.Set(Error::kGenericError, error_message);
        return symbols;
    }

    return symbols;
}

static double convertFormattableToNumber(const Formattable formattable,
                                         Error& error) { // NOLINT
    error.Reset();

    double numeric_val;

    UErrorCode error_code = U_ZERO_ERROR;
    switch (formattable.getType()) {
        case FormattableType::kDouble:
            numeric_val = formattable.getDouble(error_code);
            break;
        case FormattableType::kInt64:
            // JS numbers are all 64 bit doubles
            numeric_val
                = static_cast<double>(formattable.getInt64(error_code));
            break;
        case FormattableType::kLong:
            numeric_val
                = static_cast<double>(formattable.getLong(error_code));
            break;
        default:
            // this should never happen
            string message = "Not a number";
            error.Set(Error::kGenericError, message);
            return 0;
    }

    if (U_FAILURE(error_code)) {
        string message = "Error in parsing";
        error.Set(error_code, message);
        return 0;
    }

    return numeric_val;
}

icu4js::NumberFormat::NumberFormat(Error& error) { // NOLINT
    this->default_symbols = createSymbols(kDefaultLocale, error);
    if (!error.IsSuccess()) {
        return;
    }
}

icu4js::NumberFormat::~NumberFormat() {
    // TODO(sunny): use smart pointers
    map<UNumberFormatStyle, FormatInfo>::iterator it;
    for (it = this->format_style_to_format_info.begin();
         it != this->format_style_to_format_info.end();
         ++it) {
        FormatInfo format_info = it->second;
        if (format_info.format) {
            delete format_info.format;
            format_info.format = NULL;
        }
        if (format_info.auxiliary_format) {
            delete format_info.auxiliary_format;
            format_info.auxiliary_format = NULL;
        }
        if (format_info.default_pattern) {
            delete format_info.default_pattern;
            format_info.default_pattern = NULL;
        }
        if (format_info.default_currency) {
            delete format_info.default_currency;
            format_info.default_currency = NULL;
        }
        if (format_info.default_attrs) {
            delete format_info.default_attrs;
            format_info.default_attrs = NULL;
        }
    }

    this->format_style_to_format_info.clear();

    if (this->default_symbols) {
        delete this->default_symbols;
        this->default_symbols = NULL;
    }
}

void
icu4js::NumberFormat::ApplyPatternToDecimalFormat(const UnicodeString& pattern,
                                                  DecimalFormat* format,
                                                  bool validate,
                                                  Error& error) {
    error.Reset();

    if (validate) {
        // Note (sunny): We currently don't support embedded literals inside
        // format patterns. This block checks that the pattern is composed
        // entirely of symbols adopted by the format.
        // Also note that we currently don't support specifying localized
        // format patterns hence we'll use the default symbols and not
        // the ones in the current locale's format. We assume that
        // en_US symbols are the same as the default symbols and get the
        // symbols from an instance of en_US decimal format.
        int32_t error_index = getNonFormatSymbolIndex(pattern,
                                                      this->default_symbols);
        if (error_index >= 0) {
            UnicodeString error_message_pattern = pattern;

            wstring error_message =
                L"Invalid symbol(s) found at index: "
                + std::to_wstring(error_index)
                + L" in ("
                + Util::UnicodeStringToWString(error_message_pattern)
                + L")";
                error.Set(Error::kBadFormat, error_message);
            return;
        }
    }

    UErrorCode error_code = U_ZERO_ERROR;
    UParseError parse_error;

    format->applyPattern(pattern, parse_error, error_code);

    if (!U_SUCCESS(error_code)) {
        if (parse_error.offset >= 0) {
            icu::UnicodeString pre_context(parse_error.preContext);
            icu::UnicodeString post_context(parse_error.postContext);

            wstring error_message =
                L"Line: "
                + std::to_wstring(parse_error.line)
                + L", Offset: "
                + std::to_wstring(parse_error.offset)
                + L" (`"
                + Util::UnicodeStringToWString(pre_context)
                + L"\u2038"
                + Util::UnicodeStringToWString(post_context)
                + L"`)";

            error.Set(Error::kBadFormat, error_message);
        } else {
            error.Set(Error::kGenericError, u_errorName(error_code));
        }
    }
}

FormatInfo
icu4js::NumberFormat::GetFormatInfoForStyle(UNumberFormatStyle style,
                                            Error& error) {
    map<UNumberFormatStyle, FormatInfo>::iterator it;
    it = this->format_style_to_format_info.find(style);

    if (it != this->format_style_to_format_info.end()) {
        return it->second;
    }

    FormatInfo format_info;
    DecimalFormat *format
        = createDecimalFormatWithCurrentLocale(style, error);
    if (!error.IsSuccess()) {
        if (format) {
            delete format;
        }
        return format_info;
    }

    DecimalFormat *auxiliary_format
        = createDecimalFormatWithCurrentLocale(style, error);
    if (!error.IsSuccess()) {
        if (format) {
            delete format;
        }
        if (auxiliary_format) {
            delete auxiliary_format;
        }
        return format_info;
    }

    UnicodeString* pattern = new UnicodeString();
    format->toPattern(*pattern);

    // getCurrency returns null terminated UChar array
    UnicodeString* currency = new UnicodeString(format->getCurrency());

    map<UNumberFormatAttribute, int32_t>* default_attrs
        = new map<UNumberFormatAttribute, int32_t>();

    format_info.format = format;
    format_info.auxiliary_format = auxiliary_format;
    format_info.default_pattern = pattern;
    format_info.default_currency = currency;
    format_info.default_attrs = default_attrs;

    this->format_style_to_format_info[style] = format_info;

    unsigned int num_attrs_to_copy
        = extent<decltype(kNumFmtAttrsReadFromPattern)>::value;
    for (unsigned int i = 0; i < num_attrs_to_copy; ++i) {
        UNumberFormatAttribute attr = kNumFmtAttrsReadFromPattern[i];

        int32_t attr_val = getFormatAttribute(format, attr, error);
        if (!error.IsSuccess()) {
            return format_info;
        }

        (*format_info.default_attrs)[attr] = attr_val;
    }

    return format_info;
}

void icu4js::NumberFormat::ApplyPatternPreservingStyle(FormatInfo format_info,
                                                   const UnicodeString& pattern,
                                                   UNumberFormatStyle style,
                                                   Error& error) {
    DecimalFormat* format = format_info.format;
    DecimalFormat* aux_format = format_info.auxiliary_format;

    // reset both format patterns
    ApplyPatternToDecimalFormat(*format_info.default_pattern,
                                format,
                                false,
                                error);
    if (!error.IsSuccess()) {
        return;
    }

    ApplyPatternToDecimalFormat(*format_info.default_pattern,
                                aux_format,
                                false,
                                error);
    if (!error.IsSuccess()) {
        return;
    }

    unsigned int num_attrs_to_copy
        = extent<decltype(kNumFmtAttrsReadFromPattern)>::value;

    for (unsigned int i = 0; i < num_attrs_to_copy; ++i) {
        UNumberFormatAttribute attr = kNumFmtAttrsReadFromPattern[i];

        int32_t attr_default_val = (*format_info.default_attrs)[attr];
        if (attr_default_val < 0) {
            continue;
        }

        setFormatAttribute(format, attr, attr_default_val, error);
        if (!error.IsSuccess()) {
            return;
        }

        setFormatAttribute(aux_format, attr, attr_default_val, error);
        if (!error.IsSuccess()) {
            return;
        }
    }

    // if the pattern is not supplied, defaults are used
    if (pattern.isEmpty()) {
        return;
    }

    // apply the pattern to the auxiliary format
    // this will apply all the info contained in the
    // format to the aux format state. we'll copy this
    // state to our main format, while preserving the
    // style related info
    ApplyPatternToDecimalFormat(pattern,
                                aux_format,
                                true,
                                error);
    if (!error.IsSuccess()) {
        return;
    }

    for (unsigned int i = 0; i < num_attrs_to_copy; ++i) {
        UNumberFormatAttribute attr = kNumFmtAttrsReadFromPattern[i];
        int32_t attr_val = getFormatAttribute(aux_format, attr, error);
        if (!error.IsSuccess()) {
            return;
        }

        setFormatAttribute(format, attr, attr_val, error);
        if (!error.IsSuccess()) {
            return;
        }
    }

    // Special handling for perecent style
    // In case the format pattern is missing a '%'
    // the multiplier can be lost on application
    // of the pattern. We need to explicitly restore
    // this.
    if (style == UNumberFormatStyle::UNUM_PERCENT) {
        int32_t multiplier = (*format_info.default_attrs)[UNUM_MULTIPLIER];
        format->setMultiplier(multiplier);
    }
}

void
icu4js::NumberFormat::PopulateCurrencyCodeToLocalesMap(Error& error) { // NOLINT
    error.Reset();

    UErrorCode status = U_ZERO_ERROR;

    int32_t locale_count;
    const Locale *locales = Locale::getAvailableLocales(locale_count);

    vector<wstring> error_locales;

    for (int i = 0; i < locale_count; ++i) {
        const Locale locale = locales[i];
        const char* locale_name = locale.getName();
        wstring locale_name_wstring = Util::StringToWString(locale_name);

        status = U_ZERO_ERROR;

        UChar curr_iso_chars[4];
        int32_t curr_iso_length = ucurr_forLocale(locale_name,
                                                   curr_iso_chars,
                                                   4,
                                                   &status);
        if (!U_SUCCESS(status) || curr_iso_length <= 0) {
            // Note (sunny): even if there is an error while processing
            // one locale we don't stop processing other locales. This
            // prevents one bad locale from crashing the whole system.
            error_locales.push_back(locale_name_wstring);
        } else {
            UnicodeString curr_iso_unicode(curr_iso_chars, 3);
            wstring curr_iso = Util::UnicodeStringToWString(curr_iso_unicode);

            set<wstring>& locales_for_curr
                = this->currency_code_to_locales[curr_iso];
            locales_for_curr.insert(locale_name_wstring);
        }
    }

    if (error_locales.size() != 0) {
        wstring error_message =
            L"Failed to populate currency code to locales map for some locales "
                + Util::JoinVector(error_locales, L", ");
        error.Set(Error::kErrorWarning, error_message);
    }
}

wstring
icu4js::NumberFormat::Format(double number,
                             UNumberFormatStyle style,
                             const wstring pattern,
                             const int fraction_digits,
                             const wstring currency_code,
                             Error& error) {
    error.Reset();

    UnicodeString pattern_unicode
        = Util::WStringToUnicodeString(pattern);

    FormatInfo format_info = GetFormatInfoForStyle(style, error);
    if (!error.IsSuccess()) {
        return L"";
    }

    // this will also handle invalid format detection
    // and will make sure to ignore empty patterns
    ApplyPatternPreservingStyle(format_info,
                                pattern_unicode,
                                style,
                                error);
    if (!error.IsSuccess()) {
        return L"";
    }

    UErrorCode error_code = U_ZERO_ERROR;

    // apply any setting overriding format pattern
    if (fraction_digits >= 0) {
        format_info.format->setMaximumFractionDigits(fraction_digits);
        format_info.format->setMinimumFractionDigits(fraction_digits);
    }

    const UChar* default_currency
        = format_info.format->getCurrency();

    UnicodeString curr_code_unicode
        = currency_code.empty()
            ? *(format_info.default_currency)
                : Util::WStringToUnicodeString(currency_code);

    const UChar* curr_code_uchar
        = curr_code_unicode.getTerminatedBuffer();
    format_info.format->setCurrency(curr_code_uchar, error_code);

    if (U_FAILURE(error_code)) {
        wstring error_message =
            L"Failed to format number, error in setting currency code: "
                + Util::StringToWString(u_errorName(error_code));
        error.Set(Error::kFormattingFailure, error_message);
        return L"";
    }

    UnicodeString formatted_value;
    icu::FieldPosition field_position;

    // TODO(sunny): add support for FieldPosition info
    format_info.format->format(number,
                               formatted_value,
                               field_position,
                               error_code);

    if (U_FAILURE(error_code)) {
        wstring error_message =
            L"Failed to format number: "
                + Util::StringToWString(u_errorName(error_code));
        error.Set(Error::kFormattingFailure, error_message);
        return Util::UnicodeStringToWString(formatted_value);
    }

    return Util::UnicodeStringToWString(formatted_value);
}

Formattable
icu4js::NumberFormat::Parse(wstring str,
                            bool lenient,
                            Error& error) { // NOLINT
    error.Reset();
    Formattable result;

    FormatInfo format_info
        = GetFormatInfoForStyle(UNumberFormatStyle::UNUM_DECIMAL,
                                error);
    if (!error.IsSuccess()) {
        return result;
    }

    // reset the format patterns
    ApplyPatternPreservingStyle(format_info,
                                "",
                                UNumberFormatStyle::UNUM_DECIMAL,
                                error);
    if (!error.IsSuccess()) {
        return result;
    }

    ParsePosition pos;
    UnicodeString str_unicode = Util::WStringToUnicodeString(str);
    format_info.format->parse(str_unicode, result, pos);
    if (!lenient) {
        if (pos.getIndex() != str_unicode.length()) {
            string message = "Invalid symbol at "
                + std::to_string(pos.getIndex());
            error.Set(Error::kParsingFailure, message);
            return result;
        }
    }

    if (!result.isNumeric()) {
        string message = "Not a number, type = "
            + std::to_string(result.getType());
        error.Set(Error::kParsingFailure, message);
        return result;
    }

    return result;
}

double
icu4js::NumberFormat::ParseFloat(wstring str,
                                 bool lenient,
                                 Error& error) {
    error.Reset();
    Formattable result = Parse(str, lenient, error);
    if (!error.IsSuccess()) {
        return 0;
    }
    return convertFormattableToNumber(result, error);
}

double
icu4js::NumberFormat::ParseInt(wstring str,
                               bool lenient,
                               Error& error) {
    error.Reset();
    Formattable result = Parse(str, lenient, error);
    if (!error.IsSuccess()) {
        return 0;
    }

    FormattableType type = result.getType();
    if (!lenient && type != FormattableType::kInt64
        && type != FormattableType::kLong) {
        string message = "Not an integer, type = "
            + std::to_string(result.getType());
        error.Set(Error::kParsingFailure, message);
        return 0;
    }

    return convertFormattableToNumber(result, error);
}

wstring
icu4js::NumberFormat::GetPatternValidationError(wstring pattern,
                                                UNumberFormatStyle style,
                                                Error& error) {
    error.Reset();

    FormatInfo format_info = GetFormatInfoForStyle(style, error);
    if (!error.IsSuccess()) {
        return L"";
    }

    if (!format_info.auxiliary_format) {
        error.Set(Error::kFormattingFailure,
                  "Failed to get DecimalFormat");
        return L"";
    }

    UnicodeString pattern_unicode
        = Util::WStringToUnicodeString(pattern);
    ApplyPatternToDecimalFormat(pattern_unicode,
                                format_info.auxiliary_format,
                                true,
                                error);

    // since bad format is an expected error in this scenario
    // we clear the outbound error in this case
    bool succcess = error.IsSuccess();
    if (!succcess && error.GetCode() == Error::kBadFormat) {
        wstring message = error.GetMessage();
        error.Reset();
        return message;
    }

    return L"";
}

vector<wstring>
icu4js::NumberFormat::GetLocalesForCurrencyISOCodes(
                                    const vector<wstring> curr_iso_codes,
                                    Error& error) { // NOLINT
    // TODO(sunny): handle the case where the population always
    // fails causing us to try repeatedly
    if (this->currency_code_to_locales.size() == 0) {
        PopulateCurrencyCodeToLocalesMap(error);
    }

    if (!error.IsSuccess() && !error.IsWarning()) {
        return vector<wstring>();
    }

    set<wstring> all_locales;
    for (wstring curr_iso_code : curr_iso_codes) {
        bool is_curr_code_known = Util::IsKeyInMap(
                                           this->currency_code_to_locales,
                                           curr_iso_code);
        if (!is_curr_code_known) {
            continue;
        }

        set<wstring>& curr_locales
            = this->currency_code_to_locales[curr_iso_code];

        all_locales.insert(curr_locales.begin(), curr_locales.end());
    }
    // embind does not have a way to bind std::set to any JS type
    // so we return a vector
    return vector<wstring>(all_locales.begin(), all_locales.end());
}


#ifndef BUILD_PACKAGE_SCRIPT

EMSCRIPTEN_BINDINGS(icu4js_number_format) {
    // TODO(sunny): some enum values are in draft in icu4c 56.1.
    // To keep our API simple we have built our icu4c with drafts
    // enabled. Any upgrade will have to ensure that the APIs in
    // draft that we use were promoted to stable.
    // One way to verify this could be to build without --enable-drafts
    // first and see if our code compiles. If it does we can drop the
    // --enable-drafts flag.
    emscripten::enum_<UNumberFormatStyle>("NumberFormatStyle")
    .value("PATTERN_DECIMAL",
           UNumberFormatStyle::UNUM_PATTERN_DECIMAL)
    .value("DECIMAL",
           UNumberFormatStyle::UNUM_DECIMAL)
    .value("CURRENCY",
           UNumberFormatStyle::UNUM_CURRENCY)
    .value("PERCENT",
           UNumberFormatStyle::UNUM_PERCENT)
    .value("SCIENTIFIC",
           UNumberFormatStyle::UNUM_SCIENTIFIC)
    .value("ORDINAL",
           UNumberFormatStyle::UNUM_ORDINAL)
    .value("DURATION",
           UNumberFormatStyle::UNUM_DURATION)
    .value("DURATION",
           UNumberFormatStyle::UNUM_DURATION)
    .value("PATTERN_RULEBASED",
           UNumberFormatStyle::UNUM_PATTERN_RULEBASED)
    .value("CURRENCY_ISO",
           UNumberFormatStyle::UNUM_CURRENCY_ISO)
    .value("CURRENCY_PLURAL",
           UNumberFormatStyle::UNUM_CURRENCY_PLURAL)
    .value("CURRENCY_ACCOUNTING",
           UNumberFormatStyle::UNUM_CURRENCY_ACCOUNTING)
    .value("CASH_CURRENCY",
           UNumberFormatStyle::UNUM_CASH_CURRENCY)
    .value("DECIMAL_COMPACT_SHORT",
           UNumberFormatStyle::UNUM_DECIMAL_COMPACT_SHORT)
    .value("DECIMAL_COMPACT_LONG",
           UNumberFormatStyle::UNUM_DECIMAL_COMPACT_LONG)
    .value("CURRENCY_STANDARD",
           UNumberFormatStyle::UNUM_CURRENCY_STANDARD)
    .value("FORMAT_STYLE_COUNT",
           UNumberFormatStyle::UNUM_FORMAT_STYLE_COUNT)
    .value("DEFAULT",
           UNumberFormatStyle::UNUM_DEFAULT);

    emscripten::class_<icu4js::NumberFormat>("NumberFormat")
    .constructor<Error&>()
    .function("getPatternValidationError",
              &icu4js::NumberFormat::GetPatternValidationError)
    .function("format", &icu4js::NumberFormat::Format)
    .function("parseFloat", &icu4js::NumberFormat::ParseFloat)
    .function("parseInt", &icu4js::NumberFormat::ParseInt)
    .function("getLocalesForCurrencyISOCodes",
              &icu4js::NumberFormat::GetLocalesForCurrencyISOCodes);
}
#endif  // BUILD_PACKAGE_SCRIPT


