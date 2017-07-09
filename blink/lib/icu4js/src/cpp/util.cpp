/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 */

#include "util.h" // NOLINT

#include <sstream>
#include <map>
#include <set>
#include <algorithm>

using std::wstringstream;
using std::ostream_iterator;

wstring icu4js::Util::JoinVector(const vector<wstring> vec,
                                 const wstring delimiter) {
    wstringstream ss;
    copy(vec.begin(),
         vec.end(),
         ostream_iterator<wstring, wchar_t>(ss, delimiter.c_str()));
    return ss.str();
}

UnicodeString icu4js::Util::WStringToUnicodeString(const wstring& w_string) {
    UnicodeString unicode;
    unsigned int num_chars = w_string.length();
    for (unsigned int i = 0; i < num_chars; ++i) {
        unicode += (UChar)w_string[i];
    }
    return unicode;
}

wstring icu4js::Util::UnicodeStringToWString(const UnicodeString& unicode) {
    wstring w_string;
    unsigned int num_chars = unicode.length();
    for (unsigned int i = 0; i < num_chars; ++i) {
        w_string += (wchar_t)unicode[i];
    }
    return w_string;
}

string icu4js::Util::UnicodeStringToUTF8(const UnicodeString& unicode) {
    string utf8;
    return unicode.toUTF8String(utf8);
}

wstring icu4js::Util::StringToWString(string str) {
    return wstring(str.begin(), str.end());
}

string icu4js::Util::WStringToString(wstring wstr) {
    UnicodeString unicode = WStringToUnicodeString(wstr);
    string utf8;
    unicode.toUTF8String(utf8);
    return utf8;
}

bool icu4js::Util::IsStringNumeric(const string& str) {
    if (str.empty()) {
        return FALSE;
    }
    auto non_digit_char = std::find_if(str.begin(),
                                       str.end(),
                                       [](char c) {
                                           return !std::isdigit(c);
                                       });
    return non_digit_char == str.end();
}
