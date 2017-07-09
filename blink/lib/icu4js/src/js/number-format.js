/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview: JS interface for number formatting related functionality of icu4js
 */

'use strict';

(function(global){
    // Note (sunny): C++ objects need to be explicitly deleted. Keep
    // only one instance whenever possible. We'll let this instance
    // stay alive as long as the parent page is alive.
    var icu4jsNumberFormat;
    var error = new Module.Error();


    function initialize() {
        error.reset();

        if (!!icu4jsNumberFormat) {
            icu4jsNumberFormat.delete();
            icu4jsNumberFormat = null;
        }

        icu4jsNumberFormat = new Module.NumberFormat(error);
        if (!error.isSuccess()) {
            if (icu4jsNumberFormat) {
                icu4jsNumberFormat.delete();
            }
            icu4jsNumberFormat = null;
        }
        icu4js._util.checkForError(error);

        // Do a sanity check to ensure formatting numbers is working
        // for this locale. this will throw an error if number formatting
        // failed for some reason which will be caught by the loader and
        // possibly used to fall back to
        formatNumber(123456.78, true, '#,###.00');
    }

    /**
     *
     * @param number
     * @param {boolean} isDouble
     * @param {string} [pattern=]
     * @param {Number} [nDecimal=] defaults to as dictated by the pattern
     * @param {icu4js.numberFormat.Style} [style=icu4js.numberFormat.Style.DECIMAL] An optional style
     *     parameter that can affect the formatting. The details of the effect of this parameter can
     *     be found in icu docs.
     * @param {string} [currencyCode=] An ISO 4217 currency code, default to the one implied by
     *     current icu4js locale.
     * @returns {string}
     */
    function formatNumber(number, isDouble, pattern, nDecimal, style, currencyCode) {
        error.reset();

        if (pattern === void 0) {
            pattern = '';
        }
        if (nDecimal === void 0) {
            nDecimal = -1;
        }

        if (style === void 0) {
            style = Module.NumberFormatStyle.DECIMAL;
        }

        if (currencyCode === void 0) {
            currencyCode = '';
        }

        var formattedValue = icu4jsNumberFormat.format(
            number,
            style,
            pattern,
            nDecimal,
            currencyCode,
            error
        );
        icu4js._util.checkForError(error);

        return formattedValue;
    }

    /**
     * Parses a numeric integer string in a locale aware manner. E.g. 100,000
     * would parse to 100000. If __lenient__ is set it will try to ignore
     * any extraneous characters in the string (e.g. 123abc will evaluate
     * to 123). Will return Number.NaN if the __lenient__ is not set and
     * the string cannot be interpreted as an integer.
     * @param {string} string
     * @param {boolean} [lenient=false]
     * @returns {*}
     */
    function parseInt(string, lenient) {
        error.reset();
        lenient = !!lenient;

        var number = icu4jsNumberFormat.parseInt(
            string,
            lenient,
            error
        );
        if (!error.isSuccess()) {
            if (error.getCode() === Module.ErrorCode.PARSING_FAILURE) {
                return Number.NaN;
            }
            icu4js._util.checkForError(error);
        }
        return number;
    }

    /**
     * Parses a numeric floating number string in a locale aware manner. E.g.
     * 123,456 will evaluate to 123456 in en_US but 123.456 in fr_FR.
     * If __lenient__ is set it will try to ignore any extraneous characters
     * in the string (e.g. 123.456abc will evaluate
     * to 123.456). Will return Number.NaN if the __lenient__ is not set and
     * the string cannot be interpreted as a number (e.g. 123x45).
     * @param {string} string
     * @param {boolean} [lenient=false]
     * @returns {*}
     */
    function parseFloat(string, lenient) {
        error.reset();
        lenient = !!lenient;

        var number = icu4jsNumberFormat.parseFloat(
            string,
            lenient,
            error
        );

        if (!error.isSuccess()) {
            if (error.getCode() === Module.ErrorCode.PARSING_FAILURE) {
                return Number.NaN;
            }
            icu4js._util.checkForError(error);
        }
        return number;
    }

    /**
     * Returns true iff the string can be parsed as a number in
     * a locale aware manner.
     *
     * TODO (sunny): Currently returns true if there is a alpha
     * prefix because icu4c seems to not reports errors in this
     * case. We need to fix this possibly by adding a locale
     * insensitive alpha prefix check.
     * @param {string} string
     * @param {boolean} [lenient=false]
     * @returns {boolean}
     */
    function isValidNumericString(string, lenient) {
        var number = parseFloat(string, lenient);
        return !isNaN(number);
    }

    /**
     *
     * @param {string} pattern
     * @param {icu4js.numberFormat.Style} [style=icu4js.numberFormat.Style.DECIMAL] An optional style
     *     parameter that can affect the formatting. The details of the effect of this parameter can
     *     be found in icu docs.
     * @returns {boolean}
     */
    function getPatternValidationError(pattern, style) {
        error.reset();

        if (style === void 0) {
            style = Module.NumberFormatStyle.DECIMAL;
        }

        var validationErrorMessage = icu4jsNumberFormat.getPatternValidationError(
            pattern,
            style,
            error
        );
        icu4js._util.checkForError(error);

        return validationErrorMessage;
    }

    global.icu4js = global.icu4js || {};
    global.icu4js.numberFormat = {
        Style: Module.NumberFormatStyle,
        initialize: initialize,
        getPatternValidationError: getPatternValidationError,
        format: formatNumber,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isValidNumericString: isValidNumericString
    };
})(window);
