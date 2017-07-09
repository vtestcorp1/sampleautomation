/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

(function (global) {
    global.blink = global.blink || {};
    global.blink.supportedLocales = {
        'en-US': 'en-US',
        'en': 'en-US',
        'hi': 'hi',
        'ja': 'ja',
        'de-DE': 'de-DE',
        'de': 'de-DE',
        'af': 'af'
    };

    global.blink.getAppLocale = function (locale) {
        locale = locale || global.getBrowserLocale();
        if(!!global.blink.supportedLocales[locale]) {
            return global.blink.supportedLocales[locale];
        }
        return 'en-US';
    }
})(window);