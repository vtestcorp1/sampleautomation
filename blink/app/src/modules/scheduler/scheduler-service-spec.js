/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 */


'use strict';

/* eslint camelcase: 1 , no-undef: 0 */

describe('Scheduler Service', function () {
    var schedulerService, blinkConstants;

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            schedulerService = $injector.get('schedulerService');
            blinkConstants = $injector.get('blinkConstants');
            var util = $injector.get('util');
            var dateUtil = $injector.get('dateUtil');

            util.formatNumber = function(value, d, fmt) {
                if(value <= 9) {
                    return '0' + value;
                }
                return value.toString();
            };

            dateUtil.getMomentObjectForTimestamp = function (ts) {
                return moment(ts).tz('America/Los_Angeles');
            };
        });

    });

    var backendConfigRef1 = {
        "startTime": 1459896900000,
        "interval": "MINUTELY",
        "frequency": 20,
        "rangeStartTime": {
            "hourOfDay": 5,
            "minute": 0,
            "second": 0
        },
        "rangeEndTime": {
            "hourOfDay": 0,
            "minute": 0,
            "second": 0
        },
        "endTime": 1461658200000,
        "timeZone": 'GMT',
        "weekDays": [
            "TUESDAY",
            "SATURDAY"
        ],
        "enabled": true,
        "scheduleType" :'ICS'
    };

    var schedulerConfigRef1 = {
        "hour": "15",
        "min": "55",
        "startHour": "05",
        "startMin": "00",
        "endHour": "00",
        "endMin": "00",
        "repeatHour": "01",
        "repeatMin": "10",
        "checkedDays": {
            "TUESDAY": true,
            "SATURDAY": true
        },
        "startDate": "04/05/2016",
        "interval": "MINUTELY",
        "frequency": 20,
        "timeRange": "between",
        "endDate": "04/26/2016",
        "repeatOption": "repeatUntil",
        "timeZone": 'America/Los_Angeles',
        "enabled": true,
        "scheduleType" :'ICS'

    };

    var backendConfigRef2 = {
        "startTime": 1459896900000,
        "interval": "MONTHLY",
        "rangeStartTime": {
            "hourOfDay": 5,
            "minute": 0,
            "second": 0
        },
        "rangeEndTime": {
            "hourOfDay": 0,
            "minute": 0,
            "second": 0
        },
        "endTime": 1461658200000,
        "timeZone": 'GMT',
        "weekOfMonth": "SECOND",
        "dayOfWeek": "MONDAY",
        "enabled": true,
        "scheduleType" :'ICS'
    };

    var schedulerConfigRef2 = {
        "hour": "15",
        "min": "55",
        "startHour": "05",
        "startMin": "00",
        "endHour": "00",
        "endMin": "00",
        "repeatHour": "01",
        "repeatMin": "10",
        "startDate": "04/05/2016",
        "interval": "MONTHLY",
        "monthOption": "weekday",
        "weekOfMonth": "second",
        "dayOfWeek": "MONDAY",
        "timeRange": "between",
        "endDate": "04/26/2016",
        "repeatOption": "repeatUntil",
        "timeZone": 'America/Los_Angeles',
        "frequency": undefined,
        "checkedDays": {},
        "enabled": true,
        "scheduleType" :'ICS'
    };

    it('should return correct SchedulerConfig given the backendConfig', function () {
        schedulerService.initialize();
        var schedulerConfig = schedulerService.getConfigFromBackendJson(backendConfigRef1);
        expect(schedulerConfig).toEqual(schedulerConfigRef1);

        schedulerConfig = schedulerService.getConfigFromBackendJson(backendConfigRef2);
        expect(schedulerConfig).toEqual(schedulerConfigRef2);
    });

    it('validate api should throw proper error', function () {
        var config = _.cloneDeep(schedulerConfigRef1);
        // Valid time range.
        config.startDate = "04/05/2217";
        config.endDate = "09/05/2217";
        var error = schedulerService.isScheduleConfigValid(config);
        expect(error).toEqual(void 0);
        //  start time > end time.
        config.startDate = "04/05/2227";
        error = schedulerService.isScheduleConfigValid(config);
        expect(error).not.toEqual(void 0);
        //  start time > now
        config.startDate = "04/05/2007";
        error = schedulerService.isScheduleConfigValid(config);
        expect(error).not.toEqual(void 0);
        //  start time > now
        config.startDate = "04/05/2007";
        error = schedulerService.isScheduleConfigValid(config);
        expect(error).not.toEqual(void 0);
        // blank checked days.
        config.checkedDays = {};
        error = schedulerService.isScheduleConfigValid(config);
        expect(error).not.toEqual(void 0);
    });

    //TODO(Ashish): Enable after mocking timezone for running on jenkins.
    xit('should return correct backendConfig given the schedulerConfig', function () {
        var backendConfig = schedulerService.getBackendJsonFromConfig(schedulerConfigRef1);
        expect(backendConfig).toEqual(backendConfigRef1);
    });
});
