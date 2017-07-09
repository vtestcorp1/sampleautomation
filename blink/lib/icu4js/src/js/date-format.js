/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview: JS interface for date formatting related functionality of icu4js
 */

'use strict';

(function(global){
    // Note (sunny): C++ objects need to be explicitly deleted. Keep
    // only one instance whenever possible. We'll let this instance
    // stay alive as long as the parent page is alive.
    var icu4jsDateFormat;
    var error = new Module.Error();


    function initialize() {
        error.reset();

        if (!!icu4jsDateFormat) {
            icu4jsDateFormat.delete();
            icu4jsDateFormat = null;
        }

        icu4jsDateFormat = new Module.DateFormat(error);
        if (!error.isSuccess()) {
            if (icu4jsDateFormat) {
                icu4jsDateFormat.delete();
            }
            icu4jsDateFormat = null;
        }
        icu4js._util.checkForError(error);

        // Do a sanity check to ensure formatting is working
        // for this locale. this will throw an error if number formatting
        // failed for some reason which will be caught by the loader and
        // possibly used to fall back to
        formatDate(123456.78, 'dd/MM/YYYY');
    }

    /**
     *
     * @param {number} epochMillis
     * @param {string} pattern
     * @param {number} [yearStartMonth=0] The index of month where the year
     *     is supposed to start. 0 based. Useful for supporting custom
     *     fiscal calendars where the year starts at a month other than
     *     January.
     * @param {boolean} [noLocalization=false] If set __pattern__ is used
     *     as provided (and not localized).
     * @returns {string}
     */
    function formatDate(epochMillis, pattern, yearStartMonth, noLocalization) {
        error.reset();

        if (yearStartMonth === void 0) {
            yearStartMonth = 0;
        }

        var formattedValue = icu4jsDateFormat.format(
            epochMillis,
            pattern,
            yearStartMonth,
            noLocalization,
            error
        );
        icu4js._util.checkForError(error);

        return formattedValue;
    }

    /**
     * Parses a formatted date string into a epoch value. Returns
     * NaN if parsing failed.
     * @param {string} formattedDate
     * @param {boolean} lenient Whether to be lenient about deviations from
     *     the specified formatPattern. Assumed to be true unless formatPattern
     *     is specified.
     * @param {string} formatPattern The format pattern to interpret the formatted
     *     date by. If not specified best effort parsing is applied.
     * @returns {Number}
     */
    function parseDate(formattedDate, lenient, formatPattern) {
        error.reset();

        lenient = !!lenient;

        if (!formatPattern) {
            lenient = true;
        }

        formatPattern = formatPattern || '';

        var timestamp = icu4jsDateFormat.parse(
            formattedDate,
            lenient,
            formatPattern,
            error
        );

        if (!error.isSuccess()) {
            if (error.getCode() === Module.ErrorCode.PARSING_FAILURE) {
                return Number.NaN;
            }
            icu4js._util.checkForError(error);
        }

        return timestamp;
    }

    /**
     * Given a non-localized format pattern converts it into a format
     * pattern suitable for current locale. This does not support
     * embedded literals in the patterns. Any non date format specifier
     * character will be ignored and not be a part of the returned pattern.
     *
     * @TODO (sunny): Support custom calendar.
     *
     * @param nonLocalizedPattern
     * @returns {*}
     */
    function getLocalizedPattern(nonLocalizedPattern) {
        error.reset();

        var localizedPattern = icu4jsDateFormat.getLocalizedPattern(
            nonLocalizedPattern,
            error
        );
        icu4js._util.checkForError(error);

        return localizedPattern;
    }

    function setTimeZone(timeZoneName) {
        error.reset();

        icu4jsDateFormat.setTimeZone(timeZoneName, error);
        icu4js._util.checkForError(error);
    }

    function getTimeZoneOffset(timestamp, timeZoneName, isLocalTimestamp) {
        error.reset();

        isLocalTimestamp = !!isLocalTimestamp;

        var offset = Module.DateFormat.getTimeZoneOffset(
            timestamp,
            timeZoneName,
            isLocalTimestamp,
            error
        );
        icu4js._util.checkForError(error);

        return offset;
    }

    /**
     * Returns the value __fieldName__ of the moment represented by __epochMillis__
     * moment.
     * @param {number} epochMillis
     * @param {icu4js.dateFormat.CalendarDateField} fieldName
     * @returns {number}
     */
    function getField(epochMillis, fieldName) {
        error.reset();

        var fieldValue = icu4jsDateFormat.getField(
            epochMillis,
            fieldName,
            error
        );
        icu4js._util.checkForError(error);
        return fieldValue;
    }

    /**
     * Set the __fieldName__ of the moment represented by __epochMillis__
     * to __fieldValue__ and returns the timestamp for the resulting
     * moment.
     * @param {number} epochMillis
     * @param {icu4js.dateFormat.CalendarDateField} fieldName
     * @param {number} fieldValue
     * @returns {number}
     */
    function setField(epochMillis, fieldName, fieldValue) {
        error.reset();

        var updatedTimestamp = icu4jsDateFormat.setField(
            epochMillis,
            fieldName,
            fieldValue,
            error
        );
        icu4js._util.checkForError(error);
        return updatedTimestamp;
    }

    /**
     * Increments __delta__ to the value of __fieldName__ of the
     * moment represented by __epochMillis__ and returns
     * the timestamp for the resulting moment. __delta__ may be
     * negative.
     * @param {number} epochMillis
     * @param {icu4js.dateFormat.CalendarDateField} fieldName
     * @param {number} fieldValue
     * @returns {number}
     */
    function addToField(epochMillis, fieldName, delta) {
        error.reset();

        var updatedTimestamp = icu4jsDateFormat.addToField(
            epochMillis,
            fieldName,
            delta,
            error
        );
        icu4js._util.checkForError(error);
        return updatedTimestamp;
    }

    /**
     * Returns the number of units of __fieldName__ in the interval
     * between __beginEpochMillis__ and __endEpochMillis__.
     * @param {number} beginEpochMillis
     * @param {number} endEpochMillis
     * @param {icu4js.dateFormat.CalendarDateField} fieldName
     */
    function getFieldDifference(beginEpochMillis, endEpochMillis, fieldName) {
        error.reset();

        var delta = icu4jsDateFormat.getFieldDifference(
            beginEpochMillis,
            endEpochMillis,
            fieldName,
            error
        );
        icu4js._util.checkForError(error);
        return delta;
    }

    function getStartOfField(epochMillis, fieldName) {
        error.reset();

        var start = icu4jsDateFormat.getStartOfField(
            epochMillis,
            fieldName,
            error
        );
        icu4js._util.checkForError(error);
        return start;
    }

    function getEndOfField(epochMillis, fieldName) {
        error.reset();

        var end = icu4jsDateFormat.getEndOfField(
            epochMillis,
            fieldName,
            error
        );
        icu4js._util.checkForError(error);
        return end;
    }

    function formatRelative(durationMillis) {
        error.reset();

        var formattedDuration = icu4jsDateFormat.formatRelative(
            durationMillis,
            error
        );
        icu4js._util.checkForError(error);
        return formattedDuration;
    }

    function getYear(timestamp) {
        return getField(timestamp, Module.CalendarDateField.YEAR);
    }

    function getMonth(timestamp) {
        return getField(timestamp, Module.CalendarDateField.MONTH);
    }

    function getDayOfMonth(timestamp) {
        return getField(timestamp, Module.CalendarDateField.DATE);
    }

    function getHourOfDay(timestamp) {
        return getField(timestamp, Module.CalendarDateField.HOUR_OF_DAY);
    }

    function getMinute(timestamp) {
        return getField(timestamp, Module.CalendarDateField.MINUTE);
    }

    function getSecond(timestamp) {
        return getField(timestamp, Module.CalendarDateField.SECOND);
    }

    global.icu4js = global.icu4js || {};
    global.icu4js.dateFormat = {
        CalendarDateField: Module.CalendarDateField,
        initialize: initialize,
        format: formatDate,
        parse: parseDate,
        getLocalizedPattern: getLocalizedPattern,
        formatRelative: formatRelative,
        setTimeZone: setTimeZone,
        getTimeZoneOffset: getTimeZoneOffset,
        getField: getField,
        setField: setField,
        addToField: addToField,
        getFieldDifference: getFieldDifference,
        getStartOfField: getStartOfField,
        getEndOfField: getEndOfField,
        getYear: getYear,
        getMonth: getMonth,
        getDayOfMonth: getDayOfMonth,
        getHourOfDay: getHourOfDay,
        getMinute: getMinute,
        getSecond: getSecond
    };
})(window);
