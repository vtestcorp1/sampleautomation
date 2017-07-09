/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for dateUtil methods
 */

'use strict';

describe('dateUtil', function() {
    var dateUtil, $rootScope, $timeout, mockSessionService, mockSession, sessionService;

    function setQuarterStartMonth(month) {
        mockSessionService.getDefaultCalendar.and.returnValue({
            quarterStartMonth: month
        });
        dateUtil.initialize();
    }

    /* global addCustomMatchers */
    beforeEach(addCustomMatchers());

    beforeEach(function() {
        module('blink.app');

        /* global mockSessionTimezone */
        mockSession = mockSessionTimezone();

        inject(function($injector) {
            dateUtil = $injector.get('dateUtil');
            $rootScope = $injector.get('$rootScope');
            $timeout = $injector.get('$timeout');

            dateUtil.initialize();

            sessionService = $injector.get('sessionService');
            /* global spyOnSessionQuarterStartMonth */
            mockSessionService = spyOnSessionQuarterStartMonth(sessionService);
        });
    });

    afterEach(function() {
        setQuarterStartMonth(1); // Jan
    });

    it('should format a date as expected', function() {
        var date = new Date(1382509366000);
        expect(dateUtil.formatDate(date, 'yyyy')).toBe('2013');
        expect(dateUtil.formatDate(date, 'yy')).toBe('13');
        // We don't support literals in format patterns as that
        // conflicts with localization. Support for already localized
        // format patterns can be added in the future.
        expect(dateUtil.formatDate(date, 'qqq-yyyy')).toBe('Q4 2013');
        expect(dateUtil.formatDate(date, 'qqq yyyy')).toBe('Q4 2013');
        expect(dateUtil.formatDate(date, 'MM-yyyy')).toBe('10/2013');
        expect(dateUtil.formatDate(date, 'MM/yyyy')).toBe('10/2013');
        expect(dateUtil.formatDate(date, 'MM yyyy')).toBe('10/2013');
        expect(dateUtil.formatDate(date, 'MMM-yyyy')).toBe('Oct 2013');
        expect(dateUtil.formatDate(date, 'MMM, yyyy')).toBe('Oct 2013');
        expect(dateUtil.formatDate(date, 'MMM yyyy')).toBe('Oct 2013');
        expect(dateUtil.formatDate(date, 'MMMM-yyyy')).toBe('October 2013');
        expect(dateUtil.formatDate(date, 'MMMM, yyyy')).toBe('October 2013');
        expect(dateUtil.formatDate(date, 'MMMM yyyy')).toBe('October 2013');
        expect(dateUtil.formatDate(date, 'D-yyyy')).toBe('295 2013');
        expect(dateUtil.formatDate(date, 'D yyyy')).toBe('295 2013');
        expect(dateUtil.formatDate(date, 'dd/MM/yyyy')).toBe('10/22/2013');
        expect(dateUtil.formatDate(date, 'MM/dd/yyyy')).toBe('10/22/2013');
        expect(dateUtil.formatDate(date, 'MM/dd/yyyy \'Week\'')).toBe('10/22/2013');
        expect(dateUtil.formatDate(date, "'MM/dd/yyyy'")).toBe('10/22/2013');
    });

    it('should convert a number of milliseconds ago to a user readable string', function() {
        var cases = [
            [10, '1 second ago'],
            [60000, '1 minute ago'],
            [3540000, '59 minutes ago'],
            [3600000, '1 hour ago'],
            [82800000, '23 hours ago'],
            [86400000, 'yesterday'],
            [518400000, '6 days ago'],
            [604800000, 'last week'],
            [1814400000, '3 weeks ago'],
            [2419200000, '4 weeks ago'],
            [26611200000, '10 months ago'],
            [31622400000, 'last year'],
            [2874009600000, '91 years ago'],
            [3162240000000, '100 years ago']
        ];

        cases.forEach(function(caze){
            expect(dateUtil.epochToTimeAgoString(Date.now() - caze[0])).toBe(caze[1]);
        });
    });



    function getPSTDateObject(dateString) {
        // First get the epoch value for the given date string at local timezone.
        var localDate = new Date(dateString);
        // Now compute a future epoch value that represents the same date string in the PST zone.
        return new Date(localDate.getTime() - (localDate.getTimezoneOffset() - 480) * 60000);
    }

    function getDailyBoundaries(dateValue) {
        return dateUtil.getDailyBoundaries(dateValue.getTime()).map(function (epoch) {
            return dateUtil.formatDate(epoch, 'MM/dd/yyyy HH:mm');
        });
    }

    it('should compute daily boundary of a date', function () {
        expect(getDailyBoundaries(getPSTDateObject('1/1/2012 15:00'))).toBeListOf([
            '01/01/2012, 00:00',
            '01/01/2012, 23:59'
        ]);
        expect(getDailyBoundaries(getPSTDateObject('1/7/2012 23:59'))).toBeListOf([
            '01/07/2012, 00:00',
            '01/07/2012, 23:59'
        ]);
        expect(getDailyBoundaries(getPSTDateObject('1/8/2012 00:00'))).toBeListOf([
            '01/08/2012, 00:00',
            '01/08/2012, 23:59'
        ]);
    });

    function getWeeklyBoundaries(dateValue) {
        return dateUtil.getWeeklyBoundaries(dateValue.getTime()).map(function (epoch) {
            return dateUtil.formatDate(epoch, 'MM/dd/yyyy');
        });
    }

    it('should compute weekly boundary of a date', function () {
        expect(getWeeklyBoundaries(getPSTDateObject('1/1/2012'))).toBeListOf(['12/26/2011', '01/01/2012']);
        expect(getWeeklyBoundaries(getPSTDateObject('1/7/2012'))).toBeListOf(['01/02/2012', '01/08/2012']);
        expect(getWeeklyBoundaries(getPSTDateObject('1/8/2012'))).toBeListOf(['01/02/2012', '01/08/2012']);
        expect(getWeeklyBoundaries(getPSTDateObject('1/9/2012'))).toBeListOf(['01/09/2012', '01/15/2012']);
    });

    function getMonthlyBoundaries(dateValue) {
        return dateUtil.getMonthlyBoundaries(dateValue.getTime()).map(function (epoch) {
            return dateUtil.formatDate(epoch, 'MM/dd/yyyy');
        });
    }

    it('should compute monthly boundary of a date', function () {
        expect(getMonthlyBoundaries(getPSTDateObject('1/1/2012'))).toBeListOf(['01/01/2012', '01/31/2012']);
        expect(getMonthlyBoundaries(getPSTDateObject('1/6/2012'))).toBeListOf(['01/01/2012', '01/31/2012']);
        expect(getMonthlyBoundaries(getPSTDateObject('1/31/2012'))).toBeListOf(['01/01/2012', '01/31/2012']);
        expect(getMonthlyBoundaries(getPSTDateObject('2/29/2012'))).toBeListOf(['02/01/2012', '02/29/2012']);
        expect(getMonthlyBoundaries(getPSTDateObject('12/31/2012'))).toBeListOf(['12/01/2012', '12/31/2012']);
    });

    function getQuarterlyBoundaries(dateValue) {
        return dateUtil.getQuarterlyBoundaries(dateValue.getTime()).map(function (epoch) {
            return dateUtil.formatDate(epoch, 'MM/dd/yyyy');
        });
    }

    it('should compute quarterly boundary of a date', function () {
        expect(getQuarterlyBoundaries(getPSTDateObject('1/1/2012'))).toBeListOf(['01/01/2012', '03/31/2012']);
        expect(getQuarterlyBoundaries(getPSTDateObject('2/29/2012'))).toBeListOf(['01/01/2012', '03/31/2012']);
        expect(getQuarterlyBoundaries(getPSTDateObject('3/31/2012'))).toBeListOf(['01/01/2012', '03/31/2012']);
        expect(getQuarterlyBoundaries(getPSTDateObject('12/31/2012'))).toBeListOf(['10/01/2012', '12/31/2012']);
        expect(getQuarterlyBoundaries(getPSTDateObject('04/01/2012'))).toBeListOf(['04/01/2012', '06/30/2012']);
    });

    it('should compute quarterly boundary of date with custom quarterStartMonth', function(){
        setQuarterStartMonth(2); // Feb

        expect(getQuarterlyBoundaries(getPSTDateObject('1/1/2012'))).toBeListOf(['11/01/FY 2012', '01/31/FY 2012']);
        expect(getQuarterlyBoundaries(getPSTDateObject('2/29/2012'))).toBeListOf(['02/01/FY 2013', '04/30/FY 2013']);
        expect(getQuarterlyBoundaries(getPSTDateObject('04/01/2012'))).toBeListOf(['02/01/FY 2013', '04/30/FY 2013']);
        expect(getQuarterlyBoundaries(getPSTDateObject('12/31/2012'))).toBeListOf(['11/01/FY 2013', '01/31/FY 2013']);
    });

    it('should get the start boundary by time bucket', function() {

        var month = dateUtil.getTimeBucketStart(
            getPSTDateObject('10/11/2015 15:00:00').getTime(), 'M');
        expect(dateUtil.formatDate(month, 'MM/dd/yyyy')).toEqual('10/01/2015');
        var week = dateUtil.getTimeBucketStart(
            getPSTDateObject('10/11/2015 15:00:00').getTime(), 'w');
        expect(dateUtil.formatDate(week, 'MM/dd/yyyy')).toEqual('10/05/2015');
    });

    it('should format weekly buckets for a date with custom quarterStartMonth', function () {
        setQuarterStartMonth(2); // Feb

        expect(getWeeklyBoundaries(getPSTDateObject('1/1/2012'))).toBeListOf(['12/26/FY 2012', '01/01/FY 2012']);
        expect(getWeeklyBoundaries(getPSTDateObject('3/1/2012'))).toBeListOf(['02/27/FY 2013', '03/04/FY 2013']);
        expect(getWeeklyBoundaries(getPSTDateObject('8/1/2012'))).toBeListOf(['07/30/FY 2013', '08/05/FY 2013']);
        expect(getWeeklyBoundaries(getPSTDateObject('11/1/2012'))).toBeListOf(['10/29/FY 2013', '11/04/FY 2013']);
    });

    it('should format monthly buckets for a date with custom quarterStartMonth', function () {
        setQuarterStartMonth(2); // Feb

        expect(dateUtil.formatDate(getPSTDateObject('1/1/2012'), 'MMM yy')).toBe('Jan FY 12');
        expect(dateUtil.formatDate(getPSTDateObject('3/31/2012'), 'MMM yy')).toBe('Mar FY 13');
        expect(dateUtil.formatDate(getPSTDateObject('4/1/2012'), 'MMM yy')).toBe('Apr FY 13');
        expect(dateUtil.formatDate(getPSTDateObject('12/31/2012'), 'MMM yy')).toBe('Dec FY 13');
    });

    it('should format quarter for a date', function () {
        expect(dateUtil.formatDate(getPSTDateObject('1/1/2012'), 'qqq yy')).toBe('Q1 12');
        expect(dateUtil.formatDate(getPSTDateObject('3/31/2012'), 'qqq yy')).toBe('Q1 12');
        expect(dateUtil.formatDate(getPSTDateObject('4/1/2012'), 'qqq yy')).toBe('Q2 12');
        expect(dateUtil.formatDate(getPSTDateObject('7/1/2012'), 'qqq yy')).toBe('Q3 12');
        expect(dateUtil.formatDate(getPSTDateObject('11/1/2012'), 'qqq yy')).toBe('Q4 12');
        expect(dateUtil.formatDate(getPSTDateObject('12/31/2012'), 'qqq yy')).toBe('Q4 12');
    });

    it('should format quarter for a date with custom quarterStartMonth', function () {
        setQuarterStartMonth(2); // Feb

        expect(dateUtil.formatDate(getPSTDateObject('1/1/2012'), 'qqq yy')).toBe('Q4 FY 12');
        expect(dateUtil.formatDate(getPSTDateObject('3/31/2012'), 'qqq yy')).toBe('Q1 FY 13');
        expect(dateUtil.formatDate(getPSTDateObject('4/1/2012'), 'qqq yy')).toBe('Q1 FY 13');
        expect(dateUtil.formatDate(getPSTDateObject('12/31/2012'), 'qqq yy')).toBe('Q4 FY 13');
    });

    it('should format quarterly buckets for a date with custom quarterStartMonth ' +
        'greater than timestamp month: SCAL-15272',
        function () {
            setQuarterStartMonth(11); // Nov

            expect(dateUtil.formatDate(getPSTDateObject('1/1/2012'), 'qqq yy')).toBe('Q1 FY 12');
            expect(dateUtil.formatDate(getPSTDateObject('3/31/2012'), 'qqq yy')).toBe('Q2 FY 12');
            expect(dateUtil.formatDate(getPSTDateObject('5/1/2012'), 'qqq yy')).toBe('Q3 FY 12');
            expect(dateUtil.formatDate(getPSTDateObject('9/1/2012'), 'qqq yy')).toBe('Q4 FY 12');
            expect(dateUtil.formatDate(getPSTDateObject('12/31/2012'), 'qqq yy')).toBe('Q1 FY 13');
        }
    );

    function getYearlyBoundaries(dateValue) {
        return dateUtil.getYearlyBoundaries(dateValue.getTime()).map(function (epoch) {
            return dateUtil.formatDate(epoch, 'MM/dd/yyyy');
        });
    }

    it('should compute yearly boundary of a date', function () {
        expect(getYearlyBoundaries(getPSTDateObject('1/1/2012'))).toBeListOf(['01/01/2012', '12/31/2012']);
        expect(getYearlyBoundaries(getPSTDateObject('2/29/2012'))).toBeListOf(['01/01/2012', '12/31/2012']);
        expect(getYearlyBoundaries(getPSTDateObject('12/31/2012'))).toBeListOf(['01/01/2012', '12/31/2012']);
        expect(getYearlyBoundaries(getPSTDateObject('02/29/2012'))).toBeListOf(['01/01/2012', '12/31/2012']);
        expect(getYearlyBoundaries(getPSTDateObject('04/01/2013'))).toBeListOf(['01/01/2013', '12/31/2013']);
    });

    it('should compute yearly boundary of a date with custom quarterStartMonth', function () {
        setQuarterStartMonth(2); // Feb

        expect(getYearlyBoundaries(getPSTDateObject('1/1/2012'))).toBeListOf(['02/01/FY 2012', '01/31/FY 2012']);
        expect(getYearlyBoundaries(getPSTDateObject('2/1/2012'))).toBeListOf(['02/01/FY 2013', '01/31/FY 2013']);
        expect(getYearlyBoundaries(getPSTDateObject('12/31/2012'))).toBeListOf(['02/01/FY 2013', '01/31/FY 2013']);

        setQuarterStartMonth(12); // Dec

        expect(getYearlyBoundaries(getPSTDateObject('02/13/2012'))).toBeListOf(['12/01/FY 2012', '11/30/FY 2012']);
        expect(getYearlyBoundaries(getPSTDateObject('01/01/2013'))).toBeListOf(['12/01/FY 2013', '11/30/FY 2013']);
    });

    it('should getNextDateAxisTick correctly by tz', function () {
        mockSession.getInfo.and.returnValue({
            timezone: "Etc/UTC"
        });
        dateUtil.initialize();

        var ts = 1446336000000; //Sat Oct 31 2015 17:00:00 GMT-0700 (PDT)
        var nextTick = dateUtil.getNextDateAxisTick(ts, 'M', 31 * 86400 * 1000);
        expect(nextTick).toBe(1448928000000); //Mon Nov 30 2015 16:00:00 GMT-0800 (PST)
    });

    it('should return correct time bucketing options', function() {
        expect(dateUtil.getSupportedTimeBuckets('TIME')).toEqual({NO_BUCKET: 'ms', HOURLY: 'h'});
        expect(dateUtil.getSupportedTimeBuckets('DATE_TIME')).toEqual(dateUtil.timeBuckets);
        expect(dateUtil.getSupportedTimeBuckets('DATE')).toEqual(dateUtil.timeBuckets);
    });

    describe('should format date num values', function(){
        var cases = [
            [['DATE_NUM_ABS_DAY', null], '{Null}'],
            [['DATE_NUM_ABS_DAY', 100], '100'],
            [['DATE_NUM_ABS_MONTH', 132], '132'],
            [['DATE_NUM_ABS_QUARTER', 44], '44'],
            [['DATE_NUM_ABS_YEAR', 1995], '1995'],
            [['DATE_NUM_DAY_IN_MONTH', 1], '1st day of month'],
            [['DATE_NUM_DAY_IN_QUARTER', 5], '5th day of quarter'],
            [['DATE_NUM_DAY_IN_YEAR', 3], '3rd day of year'],
            [['DATE_NUM_DAY_OF_WEEK', 3, 'e'], 'Wednesday'],
            [['DATE_NUM_DAY_OF_WEEK', 3], '3'],
            [['DATE_NUM_MONTH_IN_QUARTER', 2], '2nd month of quarter'],
            [['DATE_NUM_MONTH_IN_YEAR', 11], '11'],
            [['DATE_NUM_QUARTER_IN_YEAR', 1], 'Q1'],
            [['DATE_NUM_WEEK_IN_YEAR', 43], '43rd week of year']
        ];

        cases.forEach(function(caze){
            var effectiveDataType = caze[0][0];
            it('for ' + effectiveDataType, function(){
                expect(dateUtil.formatDateNum(effectiveDataType, caze[0][1], caze[0][2])).toEqual(caze[1]);
            });
        });
    });
});
