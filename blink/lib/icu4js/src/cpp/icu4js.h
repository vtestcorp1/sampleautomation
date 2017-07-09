/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A simple class to handle core icu related functionality.
 *
 */

#ifndef ICU4JS_H // NOLINT
#define ICU4JS_H

#include <unicode/utypes.h>

#include <string>
#include <vector>

#include "error.h" // NOLINT


using std::string;
using std::wstring;
using std::vector;
using icu4js::Error;

namespace icu4js {
    class ICU4JS;
};

class icu4js::ICU4JS {
 public:
    ICU4JS() {};
    virtual ~ICU4JS() {};

    static void Initialize(const string data_dir,
                           const string locale_name,
                           Error& error); // NOLINT

    static void SetLocale(const string locale_name,
                          Error& error); // NOLINT

    static string GetLocale(); // NOLINT

    static bool IsRightToLeft();

    static bool IsCurrentLocale(const string locale_name,
                                Error& error); // NOLINT

    static wstring
    GetLocaleForHTTPAcceptLanguage(const wstring accept_language,
                                   Error& error); // NOLINT

    static vector<wstring> GetSupportedCurrencyISOCodes(Error& error); // NOLINT
};

#endif  // ICU4JS_H // NOLINT
