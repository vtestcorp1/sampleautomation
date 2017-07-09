/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview: This files is a collectino of global localization related methods
 * provided by icu4js
 */

'use strict';

(function(global){
    var cachedSupportedCurrencyCodes = null;
    var error = new Module.Error();

    function initializeModules(callback) {
        // initialize all formatters. This will also help
        // catch any issues with support for the current locale
        // up front allowing us to re-try with the default locale.
        try {
            icu4js.numberFormat.initialize();
            icu4js.dateFormat.initialize();
            callback(null);
        } catch (e) {
            callback(e);
        }
    }

    function getLocale() {
        return Module.ICU4JS.getLocale();
    }

    function isRightToLeft() {
        return Module.ICU4JS.isRightToLeft();
    }

    function setLocale(localeName, callback) {
        error.reset();

        // Don't trigger another load of data if this is the same locale
        // as the current.
        var isSameLocale = Module.ICU4JS.isCurrentLocale(localeName, error);
        var jsErr = icu4js._util.convertICUErrorToJSError(error);
        if (!!jsErr) {
            callback(jsErr);
            return;
        }
        if (isSameLocale) {
            Module.ICU4JS.setLocale(localeName, error);
            if (!error.isSuccess()) {
                callback(new Error(error.getMessage()));
                return;
            }
            initializeModules(callback);
            return;
        }

        icu4js.loadLocales(
            [localeName],
            function(err){
                if (!!err) {
                    callback(err);
                    return;
                }

                error.reset();
                Module.ICU4JS.setLocale(localeName, error);
                if (!error.isSuccess()) {
                    callback(new Error(error.getMessage()));
                    return;
                }
                initializeModules(callback);
            }
        );
    }

    function getSupportedCurrencyISOCodes() {
        if (!!cachedSupportedCurrencyCodes) {
            return cachedSupportedCurrencyCodes.slice();
        }

        error.reset();

        var supportedCurrencyCodeVector
            = Module.ICU4JS.getSupportedCurrencyISOCodes(error);

        try {
            icu4js._util.checkForError(error);
            cachedSupportedCurrencyCodes
                = icu4js._util.convertVectorToArray(supportedCurrencyCodeVector);

            return cachedSupportedCurrencyCodes.slice();

        } finally {
            supportedCurrencyCodeVector.delete();
        }
    }

    function getLocalesForCurrencyISOCodes(isoCodes) {
        error.reset();

        var isoCodesVector = icu4js._util.convertArrayToVector(isoCodes);
        var localesVector
            = Module.ICU4JS.getLocalesForCurrencyISOCodes(isoCodesVector, error);

        try {
            icu4js._util.checkForError(error);
            return icu4js._util.convertVectorToArray(localesVector);
        } finally {
            isoCodesVector.delete();
            localesVector.delete();
        }
    }

    function getLocaleForHTTPAcceptLanguage(acceptLanguageValue) {
        error.reset();

        var localeName
            = Module.ICU4JS.getLocaleForHTTPAcceptLanguage(acceptLanguageValue, error);
        icu4js._util.checkForError(error);
        return localeName;
    }

    global.icu4js = global.icu4js || {};
    global.icu4js.setLocale = setLocale;
    global.icu4js.getLocale = getLocale;
    global.icu4js.isRightToLeft = isRightToLeft;
    global.icu4js.getSupportedCurrencyISOCodes = getSupportedCurrencyISOCodes;
    global.icu4js.getLocalesForCurrencyISOCodes = getLocalesForCurrencyISOCodes;
    global.icu4js.getLocaleForHTTPAcceptLanguage = getLocaleForHTTPAcceptLanguage;
})(window);
