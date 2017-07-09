/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

#include <unicode/utypes.h>

#ifndef BUILD_PACKAGE_SCRIPT
#include <emscripten/bind.h>
#endif

#include "error.h" // NOLINT

using std::string;
using std::wstring;
using icu4js::Error;

static wstring stringToWString(string str) {
    return wstring(str.begin(), str.end());
}

Error::ErrorCode icu4js::Error::GetCode() {
    return this->code;
}

wstring icu4js::Error::GetMessage() {
    return this->message;
}

void icu4js::Error::Reset() {
    this->code = kErrorNone;
    this->message = L"";
}

void icu4js::Error::Set(Error::ErrorCode code, wstring message) {
    this->code = code;
    this->message = message;
}

void icu4js::Error::Set(Error::ErrorCode code, string message) {
    Set(code, stringToWString(message));
}

void icu4js::Error::Set(UErrorCode icu_err_code,
                        wstring message,
                        Error::ErrorCode icu4js_err_code) {
    wstring error_message
        = message + L": " + stringToWString(u_errorName(icu_err_code));
    Set(icu4js_err_code, error_message);
}

void icu4js::Error::Set(UErrorCode icu_err_code,
                        string message,
                        Error::ErrorCode icu4js_err_code) {
    Set(icu_err_code,
        stringToWString(message),
        icu4js_err_code);
}

bool icu4js::Error::IsSuccess() {
    return this->code == Error::ErrorCode::kErrorNone;
}

bool icu4js::Error::IsWarning() {
    return this->code == Error::ErrorCode::kErrorWarning;
}

#ifndef BUILD_PACKAGE_SCRIPT

EMSCRIPTEN_BINDINGS(icu4js_error) {
    emscripten::enum_<icu4js::Error::ErrorCode>("ErrorCode")
    .value("NO_ERROR", icu4js::Error::ErrorCode::kErrorNone)
    .value("NO_FILE_ACCESS", icu4js::Error::ErrorCode::kErrorFileAccess)
    .value("INVALID_ICU_DATA", icu4js::Error::ErrorCode::kInvalidICUData)
    .value("INVALID_ICU4JS_DATA", icu4js::Error::ErrorCode::kInvalidICU4JSData)
    .value("INVALID_LOCALE", icu4js::Error::ErrorCode::kInvalidLocale)
    .value("UNSUPPORTED_LOCALE", icu4js::Error::ErrorCode::kUnsupportedLocale)
    .value("BAD_FORMAT", icu4js::Error::ErrorCode::kBadFormat)
    .value("FORMATTING_FAILURE", icu4js::Error::ErrorCode::kFormattingFailure)
    .value("PARSING_FAILURE", icu4js::Error::ErrorCode::kParsingFailure)
    .value("INVALID_STATE", icu4js::Error::ErrorCode::kInvalidState)
    .value("GENERIC_ERROR", icu4js::Error::ErrorCode::kGenericError)
    .value("WARNING", icu4js::Error::ErrorCode::kErrorWarning)
    .value("INVALID_ARGUMENT", icu4js::Error::ErrorCode::kInvalidArgument)
    .value("UNSUPPORTED_ARGUMENTS",
           icu4js::Error::ErrorCode::kUnsupportedArguments);

    emscripten::class_<icu4js::Error>("Error")
    .constructor()
    .function("reset", &icu4js::Error::Reset)
    .function("getCode", &icu4js::Error::GetCode)
    .function("getMessage", &icu4js::Error::GetMessage)
    .function("isSuccess", &icu4js::Error::IsSuccess)
    .function("isWarning", &icu4js::Error::IsWarning);
}

#endif  // BUILD_PACKAGE_SCRIPT
