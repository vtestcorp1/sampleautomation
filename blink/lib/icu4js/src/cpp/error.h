/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A class representing error in the C++ world in emscripten. This
 *               is used to carry runtime errors from C++ worlds to JS world.
 *
 * Notes:
 *     Since emscripten does not allow passing primitive types by reference and
 *     icu4c library uses an enum passed by reference to do error handling we
 *     a custom error carrier. Also note that exception are very costly in emscripten
 *     world and hence shouldn't be used for error handling.
 */
#ifndef ICU4JS_ERROR_H // NOLINT
#define ICU4JS_ERROR_H

#include <unicode/utypes.h>

#include <string>

using std::string;
using std::wstring;

namespace icu4js {
    class Error;
};

class icu4js::Error {
 public:
    // Note (sunny): for any change in here,
    // update the emscripten bindings
    enum ErrorCode {
        kErrorNone = 0,
        kErrorFileAccess,
        kInvalidICUData,
        kInvalidICU4JSData,
        kInvalidLocale,
        kUnsupportedLocale,
        kBadFormat,
        kFormattingFailure,
        kParsingFailure,
        kInvalidState,
        kGenericError,
        kErrorWarning,
        kInvalidArgument,
        kUnsupportedArguments
    };

    // TODO(sunny): is there a way to use smart pointers
    // or a static shared error instance to minimize leaks
    // because the users of this class in JS forgot to delete
    // an error instance created using `new`?

    ErrorCode GetCode();
    wstring GetMessage();
    void Reset();
    void Set(ErrorCode code, wstring message);
    void Set(ErrorCode code, string message);
    void Set(UErrorCode icu_err_code,
             wstring message,
             ErrorCode icu4js_err_code = ErrorCode::kGenericError);
    void Set(UErrorCode icu_err_code,
             string message,
             ErrorCode icu4js_err_code = ErrorCode::kGenericError);
    bool IsSuccess();
    bool IsWarning();

 private:
    ErrorCode code;
    wstring message;
};

#endif  // ICU4JS_ERROR_H // NOLINT
