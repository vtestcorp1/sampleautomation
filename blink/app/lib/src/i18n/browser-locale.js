// https://github.com/maxogden/browser-locale

'use strict';

(function (global) {
    global.getBrowserLocale = function() {
        var lang;

        // Note: 2nd part of this if check is added by us, publicly available version doesn't have
        // this guard. There is already a pull-request but it hasn't been merge yet:
        // https://github.com/maxogden/browser-locale/pull/1
        if (navigator.languages && !navigator.languages.isEmpty()) {
            // chrome does not currently set navigator.language correctly https://code.google.com/p/chromium/issues/detail?id=101138
            // but it does set the first element of navigator.languages correctly
            lang = navigator.languages[0];
        } else if (navigator.userLanguage) {
            // IE only
            lang = navigator.userLanguage;
        } else {
            // as of this writing the latest version of firefox + safari set this correctly
            lang = navigator.language;
        }

        return lang;
    };
})(window);