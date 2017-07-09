/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A class to provide i18n number formatting ability to Javascript.
 *
 * Note that we can't directly expose the icu4c C++ classes to JS as most of the
 * method expect UErrorCode enum to be passed by reference which is not supported
 * by emscripten.
 *
 * Also note that icu::DecimalFormat is not supposed to be subclassed (see the note in
 * API doc). Naive attempt at subclassing seemed to cause broken behavior
 * (e.g. messed up formats). Hence we are going with a composition type
 * inheritance model although it might have been easier to do a simple subclassing
 * of C++ classes and mimic the API.
 *
 */

#ifndef ICU4JS_NUMBER_FORMAT_H // NOLINT
#define ICU4JS_NUMBER_FORMAT_H

#include <unicode/unum.h>
#include <unicode/decimfmt.h>
#include <string>
#include <map>
#include <set>
#include <vector>
#include "error.h" // NOLINT

using std::wstring;
using std::map;
using std::set;
using std::vector;
using icu::DecimalFormat;
using icu::DecimalFormatSymbols;
using icu::UnicodeString;
using icu::Formattable;
using icu4js::Error;

namespace icu4js {
    class NumberFormat;

    struct FormatInfo {
        DecimalFormat* format;
        DecimalFormat* auxiliary_format;
        UnicodeString* default_pattern;
        UnicodeString* default_currency;
        map<UNumberFormatAttribute, int32_t>* default_attrs;
    };
};

class icu4js::NumberFormat {
 public:
    explicit NumberFormat(Error& error); // NOLINT
    virtual ~NumberFormat();

    wstring Format(double number,
                   UNumberFormatStyle style,
                   const wstring pattern,
                   const int fraction_digits,
                   const wstring currency_code,
                   Error& error);

    double ParseFloat(wstring str,
                      bool lenient,
                      Error& error); // NOLINT

    // numbers in JS are all 64 bit double precision
    // hence parseInt returns a double instead of a 32
    // bit or 64 single precision value
    double ParseInt(wstring str,
                    bool lenient,
                    Error& error); // NOLINT

    wstring GetPatternValidationError(wstring pattern,
                                      UNumberFormatStyle style,
                                      Error& error);

    vector<wstring>
    GetLocalesForCurrencyISOCodes(const vector<wstring> curr_iso_codes,
                                  Error& error); // NOLINT

 private:
    map<UNumberFormatStyle, FormatInfo> format_style_to_format_info;
    map<wstring, set<wstring>> currency_code_to_locales;
    DecimalFormatSymbols* default_symbols;

    FormatInfo GetFormatInfoForStyle(UNumberFormatStyle style,
                                     Error& error);
    void ApplyPatternToDecimalFormat(const UnicodeString& pattern,
                                     DecimalFormat* format,
                                     bool validate,
                                     Error& error);
    void ApplyPatternPreservingStyle(FormatInfo format_info,
                                     const UnicodeString& pattern,
                                     UNumberFormatStyle style,
                                     Error& error);
    void PopulateCurrencyCodeToLocalesMap(Error& error); // NOLINT

    Formattable Parse(wstring str,
                      bool lenient,
                      Error& error); // NOLINT
};

#endif  // ICU4JS_NUMBER_FORMAT_H // NOLINT
