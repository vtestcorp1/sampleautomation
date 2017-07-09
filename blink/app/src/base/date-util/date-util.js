/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Misc global date utilities
 */

'use strict';

/* eslint no-bitwise: 1 */
/* global moment */

blink.app.factory('dateUtil', ['blinkConstants',
    'strings',
    'jsonConstants',
    'localizationService',
    'Logger',
    'session',
    'sessionService',
    'util',
    function (blinkConstants,
          strings,
          jsonConstants,
          localizationService,
          Logger,
          session,
          sessionService,
          util) {

        var DEFAULT_QUARTER_START_MONTH = 0;

        var timeBuckets = {
            NO_BUCKET: 'ms',
            HOURLY: 'h',
            DAILY: 'd',
            WEEKLY: 'w',
            MONTHLY: 'M',
            QUARTERLY: 'Q',
            YEARLY: 'y'
        };

        var timeBucketValueToSageValue = {
            d: sage.TimeBucket.DAILY,
            w: sage.TimeBucket.WEEKLY,
            M: sage.TimeBucket.MONTHLY,
            Q: sage.TimeBucket.QUARTERLY,
            y: sage.TimeBucket.YEARLY,
            h: sage.TimeBucket.HOURLY,
            ms: sage.TimeBucket.NO_BUCKET
        };

        var millisecondsInIntervalConstants = {
            YEAR: 366 * 86400 * 1000,
        // using 31 days for a month can cause highcharts' computations to go wrong.
        // it's safer to approximate an interval as a lower value than a higher value
        // because of the way highcharts does its calculations
            QUARTER: 3 * 30 * 86400 * 1000,
            MONTH: 31 * 86400 * 1000,
            WEEK: 7 * 86400 * 1000,
            DAY: 86400 * 1000,
            HOUR: 60 * 60 * 1000,
            NO_BUCKET: 1
        };

        var dateNumTypes = {
            DATE_NUM_ABS_DAY: 'DATE_NUM_ABS_DAY',
            DATE_NUM_ABS_MONTH: 'DATE_NUM_ABS_MONTH',
            DATE_NUM_ABS_QUARTER: 'DATE_NUM_ABS_QUARTER',
            DATE_NUM_ABS_YEAR: 'DATE_NUM_ABS_YEAR',
            DATE_NUM_DAY_IN_MONTH: 'DATE_NUM_DAY_IN_MONTH',
            DATE_NUM_DAY_IN_QUARTER: 'DATE_NUM_DAY_IN_QUARTER',
            DATE_NUM_DAY_IN_YEAR: 'DATE_NUM_DAY_IN_YEAR',
            DATE_NUM_DAY_OF_WEEK: 'DATE_NUM_DAY_OF_WEEK',
            DATE_NUM_MONTH_IN_QUARTER: 'DATE_NUM_MONTH_IN_QUARTER',
            DATE_NUM_MONTH_IN_YEAR: 'DATE_NUM_MONTH_IN_YEAR',
            DATE_NUM_QUARTER_IN_YEAR: 'DATE_NUM_QUARTER_IN_YEAR',
            DATE_NUM_WEEK_IN_YEAR: 'DATE_NUM_WEEK_IN_YEAR'
        };

    // TODO (sunny): get rid of this hack. Ask backend to follow the
    // standard at http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
        var callosumICU4JSPatternMap = {
            'q yyyy': 'qqq yyyy' // SCAL-14527
        };

        var logger = Logger.create('date-util');
        var quarterStartMonth = DEFAULT_QUARTER_START_MONTH;

        function getQuarterStartMonth(){
            var defaultCalendar = sessionService.getDefaultCalendar();
            if (Object.has(defaultCalendar, jsonConstants.CALENDAR_QUARTER_START_MONTH_KEY)) {
            // callosum's months are 1 indexed, icu4js's are 0 indexed
                return defaultCalendar[jsonConstants.CALENDAR_QUARTER_START_MONTH_KEY] - 1;
            }
            return DEFAULT_QUARTER_START_MONTH;
        }

        function isCustomCalendar() {
            var defaultCalendar = sessionService.getDefaultCalendar();
            var isCustomCalendarState = false;
        // NOTE: Currently we have 2 properties startOfQuarter and startOfWeek which can be
        // overridden. The default values are 1 hence we iterate all values and check for
        // any value to not be 1.
            _.forIn(defaultCalendar, function(value) {
                if (value !== 1) {
                    isCustomCalendarState = true;
                }
            });

            return isCustomCalendarState;
        }

        function getSessionTimeZone() {
            var sessionInfo = session.getInfo();
            return sessionInfo && sessionInfo.timezone;
        }

        function initialize() {
            var sessionTimeZone = getSessionTimeZone();
            if (sessionTimeZone) {
                icu4js.dateFormat.setTimeZone(sessionTimeZone);
            }
            quarterStartMonth = getQuarterStartMonth();
            customizeMomentJs();

            Highcharts.setOptions({
                global: {
                    getTimezoneOffset: function (timestamp) {
                        return getMomentObjectForTimestamp(timestamp).zone();
                    }
                }
            });
        }

        function getSupportedTimeBuckets(effectiveDataType) {
            var supportedBuckets = timeBuckets;
            if (effectiveDataType == 'TIME') {
                supportedBuckets = _.pickBy(timeBuckets, function (value) {
                    return value == timeBuckets.NO_BUCKET || value == timeBuckets.HOURLY;
                });
            }
            return supportedBuckets;
        }

        function customizeMomentJs() {
            moment.fn.customYear = function (proxiedYearFn) {
                proxiedYearFn = proxiedYearFn || moment.fn.year;
            // Note (sunny): When quarterStartMonth preference is set to non-default we
            // assume that the intent is to work in fiscal year format. In this format
            // the year of a date is the calendar year in which the fiscal year ends. E.g.
            // if the start month is Feb, [Feb 2015, Jan 2016] are in the year 2016 whereas
            // Jan 2015 is in the year 2015.
                var monthCalendar = this.month();
                if (monthCalendar >= quarterStartMonth) {
                    return proxiedYearFn.call(this) + 1;
                }
                return proxiedYearFn.call(this);
            };
        }

        function sanitizeDate(inputDate) {
            var specialValue = util.getSpecialFormatData(inputDate);
            if (!!specialValue) {
                return specialValue;
            }

            if (typeof inputDate === 'string') {
                if (!isNaN(inputDate)) {
                    return parseInt(inputDate, 10);
                }
                return icu4js.dateFormat.parse(inputDate, true);
            }
            return inputDate;
        }

        function sanitizeFormat(dateFormat) {
            // SCAL-17439 Omitting block quotes(') as they are escape characters in
            // ICU date format, and cause parsing problems.
            return dateFormat.replace(/^\'|\'$/, "");
        }

        function formatDateNum(effectiveDataType, value, formatPattern) {
            if (value === void 0 || value === null) {
                return strings.NULL_VALUE_PLACEHOLDER_LABEL
            }
            var specialVal = util.getSpecialFormatData(value);
            if (!!specialVal) {
                return specialVal;
            }

            var date  = null;
        // TODO(sunny): sage currently does not support most of the dateUtil.dateNumTypes
        // types. once it starts supporting it (depending on the language that sage
        // recognizes) we'll have to update this function to format values as sage
        // recognizes it.
            switch (effectiveDataType) {
                case dateNumTypes.DATE_NUM_ABS_DAY:
                case dateNumTypes.DATE_NUM_ABS_MONTH:
                case dateNumTypes.DATE_NUM_ABS_QUARTER:
                case dateNumTypes.DATE_NUM_ABS_YEAR:
                    return value + '';
                case dateNumTypes.DATE_NUM_DAY_IN_MONTH:
                    return '{1} day of month'.assign((value).ordinalize());
                case dateNumTypes.DATE_NUM_DAY_IN_QUARTER:
                    return '{1} day of quarter'.assign((value).ordinalize());
                case dateNumTypes.DATE_NUM_DAY_IN_YEAR:
                    return '{1} day of year'.assign((value).ordinalize());
                case dateNumTypes.DATE_NUM_DAY_OF_WEEK:
                    return formatPattern === blinkConstants.DAY_OF_WEEK_FORMAT
                        ? getDayOfWeek(value)
                        : value + '';
                case dateNumTypes.DATE_NUM_MONTH_IN_QUARTER:
                    return '{1} month of quarter'.assign((value).ordinalize());
                case dateNumTypes.DATE_NUM_MONTH_IN_YEAR:
                    return value + '';
                case dateNumTypes.DATE_NUM_QUARTER_IN_YEAR:
            // Falcon returns quarter as 1 indexed, which is passed on by
            // callosum to blink, so we can use value instead of value + 1.
                    return 'Q{1}'.assign(value);
                case dateNumTypes.DATE_NUM_WEEK_IN_YEAR:
                    return '{1} week of year'.assign((value).ordinalize());
                default:
                    logger.warn('unknown effectiveDataType for date num', effectiveDataType);
                    return value;
            }
        }

    /**
     * Returns timezone offset in milliseconds at __timestamp__ in the __timezone__.
     * If __isTimestampLocal__  __timestamp__ is considered to be the time in
     * __timezone__ otherwise it is assumed to be in UTC. The offset includes
     * DST if applicable.
     * @param {number} timestamp
     * @param {string} [timezone] Default to current session timezone
     * @param {boolean} [isTimestampLocal=false]
     * @returns {number}
     */
        function getTimeZoneOffset(timestamp, timezone, isTimestampLocal) {
            timezone = timezone || getSessionTimeZone();

            return icu4js.dateFormat.getTimeZoneOffset(
            timestamp,
            timezone,
            !!isTimestampLocal
        );
        }

        function getMomentObjectForTimestamp(timestamp) {
            var sessionTimeZone = getSessionTimeZone();
            if (sessionTimeZone) {
                return moment(timestamp).tz(sessionTimeZone);
            } else {
                return moment(timestamp);
            }
        }

    /**
     * Returns minimum umber of milliseconds in a time interval represented by an instance of util.timeBuckets
     * @param timeBucket {dateUtil.timeBuckets}
     * @returns {number}
     */
        function getIntervalMillisForTimeBucket(timeBucket) {
            switch (timeBucket)  {
                case timeBuckets.HOURLY:
                    return millisecondsInIntervalConstants.HOUR;
                case timeBuckets.DAILY:
                    return millisecondsInIntervalConstants.DAY;
                case timeBuckets.WEEKLY:
                    return millisecondsInIntervalConstants.WEEK;
                case timeBuckets.MONTHLY:
                    return millisecondsInIntervalConstants.MONTH;
                case timeBuckets.QUARTERLY:
                    return millisecondsInIntervalConstants.QUARTER;
                case timeBuckets.YEARLY:
                    return millisecondsInIntervalConstants.YEAR;
                case timeBuckets.NO_BUCKET:
                    return millisecondsInIntervalConstants.NO_BUCKET;
                default:
                    return 0;
            }
        }

        function getCalendarFieldForTimeBucket(timeBucket) {
            switch (timeBucket) {
                case timeBuckets.HOURLY:
                    return icu4js.dateFormat.CalendarDateField.HOUR;
                case timeBuckets.DAILY:
                    return icu4js.dateFormat.CalendarDateField.DATE;
                case timeBuckets.WEEKLY:
                    return icu4js.dateFormat.CalendarDateField.WEEK_OF_MONTH;
                case timeBuckets.MONTHLY:
                case timeBuckets.QUARTERLY:
            // quarter math has to be done locally, quarter
            // type is not natively supported by icu
                    return icu4js.dateFormat.CalendarDateField.MONTH;
                case timeBuckets.YEARLY:
                    return icu4js.dateFormat.CalendarDateField.YEAR;
                case timeBuckets.NO_BUCKET:
                    return icu4js.dateFormat.CalendarDateField.MILLISECOND;
                default:
                    return icu4js.dateFormat.CalendarDateField.MILLISECOND;
            }
        }

        function getNextBucketEpoch(currentEpoch, bucketization) {
            var epochMoment = getMomentObjectForTimestamp(currentEpoch);

            switch (bucketization) {
                case timeBuckets.HOURLY:
                    return epochMoment.add(1, 'hour').valueOf();
                case timeBuckets.DAILY:
                    return epochMoment.add(1, 'day').valueOf();
                case timeBuckets.WEEKLY:
                    return epochMoment.add(1, 'week').valueOf();
                case timeBuckets.MONTHLY:
                    return epochMoment.add(1, 'month').valueOf();
                case timeBuckets.QUARTERLY:
                    return epochMoment.add(3, 'month').valueOf();
                case timeBuckets.YEARLY:
                    return epochMoment.add(1, 'year').valueOf();
                default:
                    logger.error('Unsupported bucketization');
            }
        }

    /**
     * Given a current tick, get the next tick's epoch based on tickInterval and
     * the time bucket
     * @param currentTickEpoch Epoch value of the current tick in milliseconds
     * @param timeBucket Bucket of time like day/month/week etc
     * @param tickInterval The tickInterval in milliseconds
     * @returns {Number} The next tick's epoch in milliseconds
     */
        function getNextDateAxisTick(currentTickEpoch, timeBucket, tickInterval) {
        // Note (sunny): We don't use real calendar here to compute the number of
        // units of timeBucket in the tickInterval. This is because the tickeInterval
        // itself has been computed in a calendar agnostic way. E.g. if the intent was
        // to bucket quarterly the tickInterval will always be equivalent to 90 days
        // even if for the given timestamp range and the current calendar the quarter
        // was longer.
            var delta = tickInterval / getIntervalMillisForTimeBucket(timeBucket);
            if (timeBucket === timeBuckets.QUARTERLY) {
                delta *= 3;
            }

            var field = getCalendarFieldForTimeBucket(timeBucket);
            return icu4js.dateFormat.addToField(
            currentTickEpoch,
            field,
            delta
        );
        }

        function getFieldBoundaries(epochMillis, fieldName) {
            return [
                icu4js.dateFormat.getStartOfField(epochMillis, fieldName),
                icu4js.dateFormat.getEndOfField(epochMillis, fieldName)
            ];
        }

    /**
     *
     * @param {number} epochMillis
     * @return {Array.<number>} beginning value inclusive, end value exclusive
     */
        function getHourlyBoundaries(epochMillis) {
            return getFieldBoundaries(epochMillis, icu4js.dateFormat.CalendarDateField.HOUR);
        }

    /**
     *
     * @param {number} epochMillis
     * @return {Array.<number>} beginning value inclusive, end value exclusive
     */
        function getDailyBoundaries(epochMillis) {
            return getFieldBoundaries(epochMillis, icu4js.dateFormat.CalendarDateField.DATE);
        }

    /**
     *
     * @param epochValue
     * @return {Array.<number>|null} beginning value inclusive, end value exclusive
     */
        function getWeeklyBoundaries(epochValue) {
        // TODO (sunny): port this to icu4js ensuring correct handling of first
        // week of the year
            var epochMoment = getMomentObjectForTimestamp(epochValue);
            var beginningOfWeek = epochMoment.startOf('isoWeek').toDate().getTime(),
                endOfWeek = epochMoment.endOf('isoWeek').toDate().getTime();
            return [beginningOfWeek,  endOfWeek];
        }

    /**
     *
     * @param epochMillis
     * @return {Array.<number>|null} beginning value inclusive, end value exclusive
     */
        function getMonthlyBoundaries(epochMillis) {
            return getFieldBoundaries(epochMillis, icu4js.dateFormat.CalendarDateField.MONTH);
        }

    /**
     *
     * @param epochValue
     * @return {Array.<number>|null} beginning value inclusive, end value exclusive
     */
        function getQuarterlyBoundaries(epochValue) {
        // 13th July 2015 (e.g.)
            var epochMoment = getMomentObjectForTimestamp(epochValue);

        // 1 (custom calendar year starts in Feb.)
            var quarterStartCustom = getQuarterStartMonth();

        // 6 (July)
            var monthCalendar = epochMoment.month();

        // 5 (July is now the 6th month of the year)
        // negative months work well with momentjs
            var monthCustom = monthCalendar - quarterStartCustom;

        // 1 (this date now falls in the second quarter of the custom calendar)
            var quarterCustom = Math.floor(monthCustom/3);

        // 3 (the second quarter of the custom calendar starts at the 4th month)
            var quarterStartMonthCustom = quarterCustom * 3;

        // 4 (the second quarter in custom calendar is the 5th month in gregorian calendar)
            var quarterStartMonthCalendar = quarterStartMonthCustom + quarterStartCustom;

            var quarterBeginMoment = epochMoment.month(quarterStartMonthCalendar).startOf('month');
            var quarterBeginTime = quarterBeginMoment.toDate().getTime();
            var quarterEndMoment = quarterBeginMoment.add(2, 'month').endOf('month');

            return [quarterBeginTime, quarterEndMoment.toDate().getTime()];
        }

    /**
     *
     * @param epochValue
     * @return {Array.<number>|null} beginning value inclusive, end value exclusive
     */
        function getYearlyBoundaries (epochValue) {
            var epochMoment = getMomentObjectForTimestamp(epochValue);
            var quarterStartCustom = getQuarterStartMonth();
            var monthCalendar = epochMoment.month();

            var beginningOfYearMoment, endOfYearMoment;
        // if quarter start month is X, the year starts at the *previous* X
            if (monthCalendar < quarterStartCustom) {
                endOfYearMoment =  epochMoment.month(quarterStartCustom - 1).endOf('month');
                var endOfYearTime = endOfYearMoment.toDate().getTime();
                beginningOfYearMoment = endOfYearMoment.add(-11, 'month').startOf('month');
                return [beginningOfYearMoment.toDate().getTime(), endOfYearTime];
            } else {
                beginningOfYearMoment = epochMoment.month(quarterStartCustom).startOf('month');
                var beginningOfYearTime = beginningOfYearMoment.toDate().getTime();
                endOfYearMoment = beginningOfYearMoment.add(11, 'month').endOf('month');
                return [beginningOfYearTime, endOfYearMoment.toDate().getTime()];
            }
        }

    /**
     * Get the start of the time bucket, for the current time.
     * @param timeBucket
     * @returns {*}
     */
        function getTimeBucketStart(epochValue, timeBucket) {
            switch (timeBucket)  {
                case timeBuckets.HOURLY:
                    return getHourlyBoundaries(epochValue)[0];
                case timeBuckets.DAILY:
                    return getDailyBoundaries(epochValue)[0];
                case timeBuckets.WEEKLY:
                    return getWeeklyBoundaries(epochValue)[0];
                case timeBuckets.MONTHLY:
                    return getMonthlyBoundaries(epochValue)[0];
                case timeBuckets.QUARTERLY:
                    return getQuarterlyBoundaries(epochValue)[0];
                case timeBuckets.YEARLY:
                    return getYearlyBoundaries(epochValue)[0];
                case timeBuckets.NO_BUCKET:
                    return epochValue;
                default:
                    return epochValue;
            }
        }

    /**
     * Convert from number of milliseconds since epoch to a user readable
     * string expressing how long ago the date was.
     * @param {number} msSinceEpoch    Number of milliseconds since epoch
     * @return {string}
     */
        function epochToTimeAgoString(msSinceEpoch) {
            if (!_.isNumber(msSinceEpoch)) {
                return 'N/A';
            }
            var msDelta = msSinceEpoch - Date.now();
            return icu4js.dateFormat.formatRelative(msDelta);
        }

    /**
     *
     * @param {number|string} inputDate Can be either a parseable format of date or an epoch value.
     * @param {string} format A format value that matches one of the keys of dateFormats above.
     * @param {boolean} noLocalization If set __format__ is used as provided and not localized.
     * @param {boolean} useSystemCalendar If any custom calendar setting (e.g. quarterStartMonth)
     *     is to be ignored.
     * @return {string} Returns the formatted date per the format.
     */
        function formatDate(inputDate, format, noLocalization, useSystemCalendar) {
            if (inputDate === void 0 || inputDate === null) {
                return strings.NULL_VALUE_PLACEHOLDER_LABEL
            }
            if (!format) {
                format = 'MM/dd/yyyy';
            }
            format = callosumICU4JSPatternMap[format] || format;
            format = sanitizeFormat(format);

        // SCAL-15326: If localization is not in effect don't localize
        // date formats. Using en_US to localize date format in this
        // case will mean dd/MM/yyyy will always become MM/dd/yyy.
            if (noLocalization === void 0) {
                noLocalization = !localizationService.isLocalizationEnabled();
            }

            if (inputDate === strings.NULL_VALUE_PLACEHOLDER_LABEL
            || inputDate === strings.EMPTY_VALUE_PLACEHOLDER_LABEL
            || inputDate === strings.OTHER_VALUE_PLACEHOLDER_LABEL) {
                return inputDate;
            }
            inputDate = sanitizeDate(inputDate);

            if(isNaN(inputDate)) {
                return strings.NULL_VALUE_PLACEHOLDER_LABEL;
            }

            var epochMillis = inputDate;
            if (_.isDate(epochMillis)) {
                epochMillis = inputDate.getTime();
            }

            if (!_.isNumber(epochMillis)) {
                logger.warn('formatDate could not convert input date to a timestamp', inputDate);
                return inputDate + '';
            }

            return icu4js.dateFormat.format(
            epochMillis,
            format,
            useSystemCalendar ? 0 : quarterStartMonth,
            !!noLocalization
        );
        }

        function formatTimeOfDay(msSinceStartOfDay, format, noLocalization) {
            return formatDate(msSinceStartOfDay, format, noLocalization);
        }

        function formatTimeBucketLabel(timeBucket){
            var bucketLabel = strings.timeBucketLabels[timeBucket];
            return bucketLabel;
        }

    /**
     * Returns then {numberOfOccurences} of a given {cronPattern}
     *
     * @param  {string} cronPattern
     * @return Date[] Next occurences of cron pattern
     *
     */
        function getNextOccurencesOfCronPattern(cronPattern, numberOfOccurences) {
            var schedule = later.parse.cron(cronPattern);
            var compiledSchedule = later.schedule(schedule);
            var nextOccurences = compiledSchedule.next(numberOfOccurences);
            if (!Array.isArray(nextOccurences)) {
                nextOccurences = [nextOccurences];
            }
            return nextOccurences;
        }


        function addDays(baseDate, days) {
            var dat = new Date(baseDate.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }

        function getDayOfWeek(num) {
            var currentDate = new Date();
            var currentDay = currentDate.getDay();
            var delta = num - currentDay;
            var modifiedDate = addDays(currentDate, delta);
            var userLocale = blink.getAppLocale();
            return modifiedDate.toLocaleString(userLocale, {  weekday: 'long' });
        }

        return {
            timeBuckets: timeBuckets,
            timeBucketValueToSageValue: timeBucketValueToSageValue,
            dateNumTypes: dateNumTypes,
            initialize: initialize,
            getSupportedTimeBuckets: getSupportedTimeBuckets,
            getHourlyBoundaries: getHourlyBoundaries,
            getIntervalMillisForTimeBucket: getIntervalMillisForTimeBucket,
            getMomentObjectForTimestamp: getMomentObjectForTimestamp,
            getNextDateAxisTick: getNextDateAxisTick,
            getDailyBoundaries: getDailyBoundaries,
            getWeeklyBoundaries: getWeeklyBoundaries,
            getNextOccurencesOfCronPattern: getNextOccurencesOfCronPattern,
            getMonthlyBoundaries: getMonthlyBoundaries,
            getQuarterlyBoundaries: getQuarterlyBoundaries,
            getYearlyBoundaries: getYearlyBoundaries,
            getTimeBucketStart: getTimeBucketStart,
            getTimeZoneOffset: getTimeZoneOffset,
            getTimeZone: getSessionTimeZone,
            formatDate: formatDate,
            formatDateNum: formatDateNum,
            formatTimeOfDay: formatTimeOfDay,
            epochToTimeAgoString: epochToTimeAgoString,
            formatTimeBucketLabel: formatTimeBucketLabel,
            isCustomCalendar: isCustomCalendar,
            getNextBucketEpoch: getNextBucketEpoch,
            getDayOfWeek: getDayOfWeek
        };
    }]);
