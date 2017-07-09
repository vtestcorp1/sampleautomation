/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

#include <unicode/locid.h>
#include <unicode/decimfmt.h>
#include <unicode/uclean.h>
#include <unicode/ures.h>

#ifndef BUILD_PACKAGE_SCRIPT
#include <emscripten/bind.h>
#endif

#include <string>
#include <iostream> // NOLINT

#include "icu4js.h" // NOLINT
#include "util.h" // NOLINT

using std::string;
using std::wstring;
using std::endl;
using std::cout;
using std::wcout;

using icu::Locale;

using icu4js::Error;

// TODO(sunny): For consistency use wstring for locale_name as well
static Locale parseLocale(string locale_name,
                          Error& error) { // NOLINT
    error.Reset();

    // basic sanity check, every locale at least has a language.
    Locale locale = Locale::createCanonical(locale_name.c_str());
    string locale_language = locale.getLanguage();
    if (locale_language.empty()) {
        string error_message =
            "Couldn't parse locale: "
            + locale_name;
        error.Set(Error::kInvalidLocale, error_message);

        return locale;
    }

    string locale_base_name = locale.getBaseName();

    int32_t locale_count = -1;
    const Locale* available_locales
        = Locale::getAvailableLocales(locale_count);
    for (int i = 0; i < locale_count; ++i) {
        icu::Locale supported_locale = available_locales[i];
        if (supported_locale.getName() == locale_base_name
            || supported_locale.getBaseName() == locale_base_name) {
            return locale;
        }
    }

    string error_message =
        "Unsupported locale: "
        + locale_name;
    error.Set(Error::kUnsupportedLocale, error_message);

    return locale;
}

void icu4js::ICU4JS::Initialize(const string data_dir,
                                const string locale_name,
                                Error& error) {
    error.Reset();
    u_cleanup();

    u_setDataDirectory(data_dir.c_str());

    UErrorCode status = U_ZERO_ERROR;
    u_init(&status);

    if (!U_SUCCESS(status)) {
        wstring error_message =
            L"Failure in initializing ICU. Error code: "
                + Util::StringToWString(u_errorName(status));
        error.Set(Error::kInvalidICUData, error_message);
        u_cleanup();
        return;
    }

    if (!locale_name.empty()) {
        SetLocale(locale_name, error);
        if (!error.IsSuccess() && !error.IsWarning()) {
            u_cleanup();
        }
    }
}

void icu4js::ICU4JS::SetLocale(const string locale_name,
                               Error& error) {
    UErrorCode status = U_ZERO_ERROR;
    Locale locale = parseLocale(locale_name, error);
    if (!error.IsSuccess()) {
        return;
    }

    Locale::setDefault(locale, status);
    if (!U_SUCCESS(status)) {
        wstring error_message =
            L"Failure in setting locale. Error code: "
                + Util::StringToWString(u_errorName(status));
        error.Set(Error::kInvalidLocale, error_message);
        return;
    }
}

string icu4js::ICU4JS::GetLocale() {
    Locale locale = Locale::getDefault();
    return locale.getName();
}

bool icu4js::ICU4JS::IsRightToLeft() {
    Locale locale = Locale::getDefault();
    return locale.isRightToLeft();
}

bool icu4js::ICU4JS::IsCurrentLocale(const string locale_name,
                                     Error& error) { // NOLINT
    Locale locale = parseLocale(locale_name, error);
    if (!error.IsSuccess()) {
        return FALSE;
    }
    return locale == Locale::getDefault();
}

wstring
icu4js::ICU4JS::GetLocaleForHTTPAcceptLanguage(const wstring accept_language,
                                               Error& error) { // NOLINT
    UErrorCode error_code = U_ZERO_ERROR;
    char locale_name[ULOC_FULLNAME_CAPACITY];
    UAcceptResult accept_result;
    string accept_language_string = Util::WStringToString(accept_language);

    UEnumeration* available_locales
        = ures_openAvailableLocales(NULL, &error_code);
    if (!U_SUCCESS(error_code)) {
        wstring error_message =
            L"Failed to get a list of all available locales: "
                + Util::StringToWString(u_errorName(error_code));
        error.Set(Error::kGenericError, error_message);
        return L"";
    }

    int32_t locale_name_len = uloc_acceptLanguageFromHTTP(locale_name,
                                              ULOC_FULLNAME_CAPACITY,
                                              &accept_result,
                                              accept_language_string.c_str(),
                                              available_locales,
                                              &error_code);
    if (!U_SUCCESS(error_code)) {
        wstring error_message =
            L"Failed to parse locale from HTTP Accept-Language: "
                + Util::StringToWString(u_errorName(error_code));
        error.Set(Error::kGenericError, error_message);
        return L"";
    }

    string locale_name_string = string(locale_name, locale_name_len);
    return Util::StringToWString(locale_name_string);
}

vector<wstring>
icu4js::ICU4JS::GetSupportedCurrencyISOCodes(Error& error) { // NOLINT
    error.Reset();

    vector<wstring> supported_iso_codes;

    UErrorCode error_code = U_ZERO_ERROR;
    uint32_t currType = UCURR_COMMON|UCURR_NON_DEPRECATED;

    UEnumeration* curr_enum = ucurr_openISOCurrencies(currType, &error_code);
    if (!U_SUCCESS(error_code)) {
        wstring error_message =
            L"Failed get list of supported currency codes: "
                + Util::StringToWString(u_errorName(error_code));
        error.Set(Error::kGenericError, error_message);
        return supported_iso_codes;
    }

    const char* curr;
    while ( (curr = uenum_next(curr_enum, NULL, &error_code)) != NULL ) {
        if (!U_SUCCESS(error_code)) {
            wstring error_message =
                L"Failed enumerate list of supported currency codes: "
                    + Util::StringToWString(u_errorName(error_code));
            error.Set(Error::kGenericError, error_message);
            return supported_iso_codes;
        }

        string curr_str = string(curr);
        wstring curr_wstr = Util::StringToWString(curr_str);
        supported_iso_codes.push_back(curr_wstr);
    }
    return supported_iso_codes;
}

#ifndef BUILD_PACKAGE_SCRIPT

EMSCRIPTEN_BINDINGS(icu4js) {
    emscripten::register_vector<string>("StringVector");
    emscripten::register_vector<wstring>("WStringVector");

    emscripten::class_<icu4js::ICU4JS>("ICU4JS")
    .constructor<>()
    .class_function("initialize", &icu4js::ICU4JS::Initialize)
    .class_function("setLocale", &icu4js::ICU4JS::SetLocale)
    .class_function("getLocale", &icu4js::ICU4JS::GetLocale)
    .class_function("isRightToLeft", &icu4js::ICU4JS::IsRightToLeft)
    .class_function("isCurrentLocale", &icu4js::ICU4JS::IsCurrentLocale)
    .class_function("getLocaleForHTTPAcceptLanguage",
                    &icu4js::ICU4JS::GetLocaleForHTTPAcceptLanguage)
    .class_function("getSupportedCurrencyISOCodes",
              &icu4js::ICU4JS::GetSupportedCurrencyISOCodes);
}

#endif  // BUILD_PACKAGE_SCRIPT

