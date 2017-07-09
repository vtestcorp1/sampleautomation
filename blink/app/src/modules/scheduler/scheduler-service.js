/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *         Pradeep Dorairaj (pradeep.dorairaj@thoughtspot.com),
 *
 * @fileoverview All the services used by the scheduler ui
 */

'use strict';

blink.app.factory('schedulerService', ['blinkConstants',
    'dateUtil',
    'Logger',
    'sessionService',
    'util',
    function (blinkConstants,
          dateUtil,
          Logger,
          sessionService,
          util) {

        var logger = Logger.create('scheduler');

        var options = {
            interval : {
                NONE: 'NONE',
                MINUTELY: 'MINUTELY',
                HOURLY: 'HOURLY',
                DAILY: 'DAILY',
                WEEKLY: 'WEEKLY',
                MONTHLY: 'MONTHLY'
            },
            timeRange : {
                BETWEEN: 'between',
                ALL_DAY: 'all_day',
                DATE: 'date',
                WEEKDAY: 'weekday'
            },
            repetition: {
                INDEFINITELY: 'indefinitely',
                UNTIL: 'repeatUntil'
            }
        };

        var hourMinFormat = "00";
        var logger = Logger.create('scheduler-service');
        var UIConfig;

        function initialize() {
            UIConfig = {
                hourMinFormat: hourMinFormat,
                everyNMinutes: [5, 10, 15, 20, 30, 45],
                daysOfWeek: moment.weekdays().map(function (day) {
                    return day.toUpperCase();
                }),
                weeksOfMonth: ['first', 'second', 'third', 'fourth', 'last'],
                daysOfMonth: Number.range(1, 28).every(),
                hrly: [1, 2, 3, 4, 6, 8, 12],
                hours: util.formatNumericArray(Number.range(0, 24).every(), hourMinFormat),
                minutes: util.formatNumericArray(Number.range(0, 55).every(5), hourMinFormat),
                dateFormat: 'MM/dd/yyyy'
            };

        }

        function getUIConfig() {
            if (!UIConfig) {
                logger.error('App is trying to use scheduler-services, but it is not initialized');
            }
            return UIConfig;
        }

        function formatHourMin(value) {
            return util.formatNumber(value,
            true,
            UIConfig.hourMinFormat);
        }

        var defaults = {
            hour: "00",
            min: "00",
            startHour: "00",
            startMin: "00",
            endHour: "00",
            endMin: "00",
            repeatHour: "00",
            repeatMin: "00",
            checkedDays: {},
            timeZone: 'America/Los_Angeles',
            enabled: true,
            scheduleType: '',
            interval: ''
        };

        function SchedulerConfig(backendConfig) {
            this._config = _.cloneDeep(defaults);

            if(!backendConfig || Object.isEmpty(backendConfig)) {
                return;
            }

            this.setStart(backendConfig.startTime);
            this.setInterval(backendConfig.interval);
            this.setFrequency(backendConfig.frequency);
            this.setMonthOption(
            backendConfig.interval,
            backendConfig.dayOfMonth,
            backendConfig.weekOfMonth,
            backendConfig.dayOfWeek
        );
            this.setTimeRange(backendConfig.rangeStartTime, backendConfig.rangeEndTime);
            this.setRepeatOptions(backendConfig.endTime);
            this.setCheckedDays(backendConfig.weekDays);
            this.setScheduleEnabled(backendConfig.enabled);
            this.setScheduleType(backendConfig.scheduleType);
        }

        SchedulerConfig.prototype.setScheduleEnabled = function(enabled) {
            this._config.enabled = enabled;
        };

        SchedulerConfig.prototype.setScheduleType = function(scheduleType) {
            this._config.scheduleType = scheduleType;
        };

        SchedulerConfig.prototype.setStart = function (startTime) {
            _.extend(this._config, {
                startDate: dateUtil.formatDate(startTime, UIConfig.dateFormat, void 0, true),
                hour: formatHourMin(icu4js.dateFormat.getHourOfDay(startTime)),
                min: formatHourMin(icu4js.dateFormat.getMinute(startTime))
            });
        };

        SchedulerConfig.prototype.setInterval = function (interval) {
            this._config.interval = interval;
        };

        SchedulerConfig.prototype.setFrequency = function (frequency) {
            this._config.frequency = frequency;
        };

        SchedulerConfig.prototype.setMonthOption = function (interval,
                                                         dayOfMonth,
                                                         weekOfMonth,
                                                         dayOfWeek) {
            if (interval !== options.interval.MONTHLY) {
                return;
            }

            if(!!dayOfMonth && dayOfMonth !== '') {
                this._config.monthOption = options.timeRange.DATE;
                this._config.dayOfMonth = dayOfMonth;
            } else {
                this._config.monthOption = options.timeRange.WEEKDAY;
                this._config.weekOfMonth = weekOfMonth && weekOfMonth.toLowerCase();
                this._config.dayOfWeek = dayOfWeek;
            }
        };

        SchedulerConfig.prototype.setTimeRange = function (start, end) {
            if(!!start && start !== '') {
                this._config.timeRange = options.timeRange.BETWEEN;
                this._config.startHour = formatHourMin(start.hourOfDay);
                this._config.startMin = formatHourMin(start.minute);
                this._config.endHour = formatHourMin(end.hourOfDay);
                this._config.endMin = formatHourMin(end.minute);
            } else {
                this._config.timeRange = options.timeRange.ALL_DAY;
            }
        };

        SchedulerConfig.prototype.setRepeatOptions = function (endTime) {
            if(!!endTime && endTime !== '') {
                angular.extend(this._config, {
                    endDate: dateUtil.formatDate(endTime, UIConfig.dateFormat, void 0, true),
                    repeatHour: formatHourMin(icu4js.dateFormat.getHourOfDay(endTime)),
                    repeatMin: formatHourMin(icu4js.dateFormat.getMinute(endTime)),
                    repeatOption: options.repetition.UNTIL
                });
            } else {
                this._config.repeatOption = options.repetition.INDEFINITELY;
            }
        };

        SchedulerConfig.prototype.setCheckedDays = function (weekDays) {
            var self = this;
            if(!!weekDays) {
                weekDays.forEach(function(day) {
                    self._config.checkedDays[day] = true;
                });
            }
        };

        SchedulerConfig.prototype.getConfig = function () {
            return this._config;
        };

        function BackendSchedulerConfig(sConfig) {
            this._config = {};
            // Check if the passed schedule config is a simple default config, with no changes in
            // UI. This indicates that the user has added no schedule.
            var defaultConfig = true;
            _.forEach(defaults, function(value, key) {
                if(!_.isEqual(value, sConfig[key])) {
                    defaultConfig = false;
                }
            });
            if (defaultConfig) {
                // since the config passed is default, we return here.
                return;
            }

            this._config.timeZone = defaults.timeZone; // This value is hardcoded right now.

            this.setStartTime(sConfig.startDate, sConfig.hour, sConfig.min);
            this.setInterval(
            sConfig.interval,
            sConfig.monthOption,
            sConfig.dayOfMonth,
            sConfig.weekOfMonth,
            sConfig.dayOfWeek
        );
            this.setFrequency(sConfig.frequency);
            this.setTimeRange(
            sConfig.timeRange,
            sConfig.startHour,
            sConfig.startMin,
            sConfig.endHour,
            sConfig.endMin
        );
            this.setRepeatOptions(
            sConfig.repeatOption,
            sConfig.endDate,
            sConfig.repeatHour,
            sConfig.repeatMin
        );
            this.setWeekDays(sConfig.checkedDays);
            this.setScheduleEnabled(sConfig.enabled);
            this.setScheduleType(sConfig.scheduleType);
        }

        BackendSchedulerConfig.prototype = {
            setStartTime : function (date, hour, min) {
                this._config.startTime = dateUtil.getMomentObjectForTimestamp(date)
                .hour(Number.parseInt(hour, 10))
                .minute(Number.parseInt(min, 10))
                .valueOf();
            },
            setInterval: function (interval,
                               monthOption,
                               dayOfMonth,
                               weekOfMonth,
                               dayOfWeek) {
                this._config.interval = interval;

                if (interval == options.interval.MONTHLY) {
                    if (monthOption === options.timeRange.DATE) {
                        this._config.dayOfMonth = dayOfMonth;
                    } else if (monthOption === options.timeRange.WEEKDAY) {
                        this._config.weekOfMonth = weekOfMonth && weekOfMonth.toUpperCase();
                        this._config.dayOfWeek = dayOfWeek;
                    }
                }
            },
            setFrequency: function (frequency) {
                this._config.frequency = frequency;
            },
            setTimeRange: function (timeRange, sHour, sMin, eHour, eMin) {
                if(timeRange === options.timeRange.BETWEEN) {
                    this._config.rangeStartTime = {
                        hourOfDay : Number.parseInt(sHour),
                        minute : Number.parseInt(sMin),
                        second : 0
                    };
                    this._config.rangeEndTime = {
                        hourOfDay : Number.parseInt(eHour),
                        minute : Number.parseInt(eMin),
                        second : 0
                    };
                }
            },
            setRepeatOptions: function(option, date, hour, min) {
                if(option === options.repetition.UNTIL) {
                    this._config.endTime = dateUtil.getMomentObjectForTimestamp(date)
                    .hour(Number.parseInt(hour, 10))
                    .minute(Number.parseInt(min, 10))
                    .valueOf();
                }
            },
            setWeekDays: function (checkedDays) {
                this._config.weekDays = Object.keys(checkedDays || {}).
                filter(function(day) {
                    return checkedDays[day];
                });
            },
            getConfig: function () {
                return this._config;
            },
            setScheduleEnabled : function(enabled) {
                this._config.enabled = enabled;
            },
            setScheduleType : function(type) {
                this._config.scheduleType = type;
            }
        };

        function isCorrectlySetted(schedulerConfig) {

            if  (!schedulerConfig.interval) {
                return false;
            }

            var hasTimeSetted = !!schedulerConfig.hour
            && !!schedulerConfig.min;

            if (schedulerConfig.interval === options.interval.DAILY) {
                return !!schedulerConfig.dayOption
                && hasTimeSetted;
            }

            if (schedulerConfig.interval === options.interval.MONTHLY) {
                return !!schedulerConfig.monthOption
                && !!schedulerConfig.dayOfMonth
                && hasTimeSetted;
            }

            var days = [];
            if (schedulerConfig.checkedDays) {
                days = Object.keys(schedulerConfig.checkedDays || {}).
                filter(function(day) {
                    return schedulerConfig.checkedDays[day];
                });
            }

            if (schedulerConfig.interval === options.interval.MINUTELY
            || schedulerConfig.interval === options.interval.HOURLY) {
                return  !!days.length && !!schedulerConfig.frequency;
            }



            if (schedulerConfig.interval === options.interval.WEEKLY) {
                return !!days.length
                && hasTimeSetted;
            }
        }

        function isScheduleConfigValid(config) {
            var backEndConfig = getBackendConfigFromSchedulerConfig(config);
            // If config is empty, that means there is no schedule defined. We consider that as a
            // correct use case as the user doesnt intend to schedule his job.
            if( _.isEmpty(backEndConfig)) {
                return void 0;
            }

            // Verify that all the fields are filled properly.
            if(! isCorrectlySetted(config)) {
                return {
                    message: blinkConstants.scheduler.SCHEDULE_INCORRECTLY_SET
                };
            }
            // Verifies if the schedule config has valid start and end time set.

            if(backEndConfig.startTime === void 0 || isNaN(backEndConfig.startTime) ) {
                return {
                    message: blinkConstants.scheduler.START_TIME_NULL_MSG
                };
            }
            if(backEndConfig.startTime < Date.now() ) {
                return {
                    message: blinkConstants.scheduler.START_TIME_ERROR
                };

            }
            if(backEndConfig.endTime != void 0 && backEndConfig.startTime > backEndConfig.endTime )
            {
                return {
                    message: blinkConstants.scheduler.END_TIME_ERROR
                };
            }
            return void 0;
        }

        function convertCronPatternToSchedule(cronPattern, isPeriodicScheduledJob) {

            var schedulerConfig = {
                min: '00',
                hour: '00'
            };

            if (cronPattern.minute != '*' && cronPattern.minute != '0'
         && cronPattern.hour === '*') {
            // interval MINUTELY
                schedulerConfig.interval = options.interval.MINUTELY;
                schedulerConfig.frequency = parseInt(cronPattern.minute.split(',')[1], 10);
            } else if (cronPattern.hour != '*' && cronPattern.hour != '0'
            && cronPattern.month === '*' && cronPattern.getDayOfMonth() === '*'
            && cronPattern.hour.split(',').length > 1
        ) {
                schedulerConfig.frequency = parseInt(cronPattern.hour.split(',')[1], 10);
                schedulerConfig.interval = options.interval.HOURLY;
            } else if (cronPattern.getMonth() === '*' && cronPattern.getDayOfMonth() === '*') {
                if (cronPattern.getDayOfWeek() === [1,2,3,4,5].join(',')) {
                    schedulerConfig.dayOption = 'WEEKDAY';
                    schedulerConfig.interval = options.interval.DAILY;
                } else if (cronPattern.getDayOfWeek() === [0,1,2,3,4,5,6].join(',')) {
                    schedulerConfig.dayOption ='ALL';
                    schedulerConfig.interval = options.interval.DAILY;
                } else {
                    schedulerConfig.interval = options.interval.WEEKLY;
                }
                setupMinuteAndHour();
            } else if (cronPattern.getDayOfMonth() != '*' && cronPattern.month === '*') {
                schedulerConfig.interval = options.interval.MONTHLY;
                schedulerConfig.dayOfMonth = parseInt(cronPattern.getDayOfMonth(), 10);
                schedulerConfig.monthOption = 'date';
                setupMinuteAndHour();
            } else if (isPeriodicScheduledJob) {
                logger.error('Failed to configure scheduler', cronPattern);
            }

            function setupMinuteAndHour() {
                var hour = parseInt(cronPattern.hour, 10);
                if (hour > 9) {
                    schedulerConfig.hour = hour.toString();
                } else {
                    schedulerConfig.hour = '0' + hour;
                }
                schedulerConfig.min = parseInt(cronPattern.minute).toString();
            }

            schedulerConfig.checkedDays = computeDayOptionFromCronSchedule(cronPattern.getDayOfWeek());
            schedulerConfig.monthOption = 'date';
            return schedulerConfig;
        }

        function computeDayOptionFromCronSchedule(cronPattern) {

            var checkedDays = {};

            if (cronPattern === '*') {
                UIConfig.daysOfWeek.forEach(function(day){
                    checkedDays[day] = true;
                });
                return checkedDays;
            }

            var days = cronPattern.split(',');
            days.each(function(dayOfWeek){
                if (dayOfWeek !== -1) {
                    checkedDays[UIConfig.daysOfWeek[dayOfWeek]] = true;
                }
            });

            return checkedDays;
        }

        function JobScheduleConfig(sConfig) {
            this._config = {};

            this.defaultCronPattern = {
                second: '0',
                minute: '0',
                hour: '*',
                dayOfMonth: '*',
                month: '*',
                dayOfWeek: '*'
            };

            this.cronPattern = Object.assign({}, this.defaultCronPattern);

            this._config.timeZone = defaults.timeZone; // This value is hardcoded right now.
            this.setFrequency(sConfig.frequency);

            switch(sConfig.interval)
        {
                case options.interval.MINUTELY:
                    var f = this._config.frequency;
                    var minutes = [];
                    for (var m = 0; m < 60; m = m + f) {
                        minutes.push(m);
                    }
                    this.cronPattern.minute = minutes.join(',');
                    this.computeCronPattern(sConfig.checkedDays);
                    break;
                case options.interval.HOURLY:

                    var hf = this._config.frequency;
                    var hours = [];
                    for (var h = 0; h < 24; h = h + hf) {
                        hours.push(h);
                    }
                    this.cronPattern.hour = hours.join(',');
                    this.computeCronPattern(sConfig.checkedDays);
                    break;

                case options.interval.DAILY:

                    if (sConfig.dayOption === 'WEEKDAY') {
                        this.cronPattern.dayOfWeek = [1, 2, 3, 4, 5].join(',');
                    } else if (sConfig.dayOption === 'ALL') {
                        this.cronPattern.dayOfWeek = [0, 1, 2, 3, 4, 5, 6].join(',');
                    }
                    this.computeHourMinutePattern(sConfig.hour, sConfig.min);
                    break;

                case options.interval.WEEKLY:
                    this.computeCronPattern(sConfig.checkedDays);
                    this.computeHourMinutePattern(sConfig.hour, sConfig.min);
                    break;

                case options.interval.MONTHLY:
                    this.cronPattern.dayOfMonth = sConfig.dayOfMonth.toString();
                    this.computeHourMinutePattern(sConfig.hour, sConfig.min);
                    break;
                default:
            }
        }

        JobScheduleConfig.prototype.computeHourMinutePattern = function(hour, minute) {
            this.cronPattern.hour = hour.toString();
            this.cronPattern.minute = minute.toString();
        };
        JobScheduleConfig.prototype.setFrequency = BackendSchedulerConfig.prototype.setFrequency;
        JobScheduleConfig.prototype.computeCronPattern = function(checkedDays) {
            var days = Object.keys(checkedDays).
            filter(function(day) {
                return day !== 'undefined' && checkedDays[day];
            }).map(function(item){
                return UIConfig.daysOfWeek.indexOf(item);
            });
            this.cronPattern.dayOfWeek = days.join(',');
        };
        JobScheduleConfig.prototype.toString = function() {
            var minute = this.cronPattern.minute,
                hour = this.cronPattern.hour,
                month = this.cronPattern.month,
                dayOfMonth = this.cronPattern.dayOfMonth,
                dayOfWeek = this.cronPattern.dayOfWeek;

            var cronPattern = minute + ' ' + hour + ' ' +
            month + ' ' + dayOfMonth + ' ' + dayOfWeek;
            return cronPattern;
        };


        var getBackendConfigFromSchedulerConfig = function (schedulerConfig) {
            var backendConfig = new BackendSchedulerConfig(schedulerConfig);
            return backendConfig.getConfig();
        };

        var getSchedulerConfigFromBackendConfig = function (backendConfig) {
            var schedulerConfig = new SchedulerConfig(backendConfig);
            return schedulerConfig.getConfig();
        };

        function getJobScheduleFromConfig(schedulerConfig) {
            return new JobScheduleConfig(schedulerConfig);
        }

        return {
            options: options,
            getUIConfig: getUIConfig,
            initialize: initialize,
            convertCronPatternToSchedule: convertCronPatternToSchedule,
            getBackendJsonFromConfig: getBackendConfigFromSchedulerConfig,
            getJobScheduleFromConfig: getJobScheduleFromConfig,
            getConfigFromBackendJson: getSchedulerConfigFromBackendConfig,
            isCorrectlySetted: isCorrectlySetted,
            isScheduleConfigValid: isScheduleConfigValid
        };
    }]);
