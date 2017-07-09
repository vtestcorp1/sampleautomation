/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A class of utility functions using across the project.
 *
 */

#ifndef ICU4JS_UTIL_H // NOLINT
#define ICU4JS_UTIL_H

#include <unicode/utypes.h>
#include <unicode/unistr.h>

#include <string>
#include <vector>
#include <set>
#include <map>

#include "error.h"// NOLINT

using std::string;
using std::wstring;
using std::vector;
using std::set;
using std::map;
using icu4js::Error;

namespace icu4js {
    class Util;
};

class icu4js::Util {
public: // NOLINT
    virtual ~Util() {};

    template <typename T>
    static bool IsValueInSet(const set<T>& s, const T& value) {
        return s.find(value) != s.end();
    }

    template <typename K, typename V>
    static bool IsKeyInMap(const map<K, V>& m, const K& key) {
        return m.find(key) != m.end();
    }

    static wstring JoinVector(const vector<wstring> vec,
                              const wstring delimiter);

    static UnicodeString WStringToUnicodeString(const wstring& w_string);

    static wstring UnicodeStringToWString(const UnicodeString& unicode);

    static string UnicodeStringToUTF8(const UnicodeString& unicode);

    static wstring StringToWString(string str);

    static string WStringToString(wstring wstr);

    static bool IsStringNumeric(const string& str);

private: // NOLINT
    Util() {};
};

#endif  // ICU4JS_H // NOLINT
