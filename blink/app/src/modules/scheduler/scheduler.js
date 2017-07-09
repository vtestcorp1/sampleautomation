/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Pradeep Dorairaj (pradeep.dorairaj@thoughtspot.com)
 *
 * @fileoverview Directive for scheduler
 */

'use strict';

blink.app.directive("bkScheduler", ['util', function(util) {

    function linker(scope, $element) {
        // We disable all input and select elements here, when the fields
        // are to be shown as disabled.
        scope.scheduleConfig.initSchedulerFields = function(disable) {
            $element.find('input').prop('disabled', disable);
            $element.find('select').prop('disabled', disable);
        };
        // Based on the schedule type (hourly, daily, weekly) selected , we ng-include
        // a snippet of code to populate the html. To make sure that the added elements are
        // also taken disabled, if needed, we do the following below.
        util.executeInNextEventLoop(function () {
            if (scope.scheduleConfig) {
                scope.scheduleConfig.initSchedulerFields(!scope.scheduleConfig.enabled);
            }
        });
        scope.$watch(function(){
            return scope.scheduleConfig.enabled;
        }, function(value) {
            if (scope.scheduleConfig) {
                scope.scheduleConfig.initSchedulerFields(!scope.scheduleConfig.enabled);
            }
        });
    }

    return {
        restrict: 'E',
        templateUrl: 'src/modules/scheduler/scheduler.html',
        controller: 'ScheduleController',
        link: linker,
        scope: {
            scheduleConfig: '='
        }
    };

}]);

blink.app.controller("ScheduleController", ['$scope',
    'blinkConstants',
    'strings',
    'CheckboxComponent',
    'schedulerService',
    function($scope,
         blinkConstants,
         strings,
         CheckboxComponent,
         schedulerService) {

        $scope.uiConfig = schedulerService.getUIConfig();
        $scope.dateFormat = $scope.uiConfig.dateFormat.toLowerCase();

        $scope.timeRangeOptions = schedulerService.options.timeRange;
        var intervalOptions = schedulerService.options.interval;

        if ($scope.scheduleConfig.strings) {
            $scope.schedulerUIText = $scope.scheduleConfig.strings
        } else {
            $scope.schedulerUIText = strings.scheduler;
        }


        if ($scope.scheduleConfig.scheduleJob) {
            $scope.schedulerUIText.intervals = angular.copy($scope.schedulerUIText.intervals);
            delete $scope.schedulerUIText.intervals.NONE;

        }
        $scope.check = function(day) {
            if (!$scope.scheduleConfig.enabled) {
                return;
            }
            $scope.scheduleConfig.checkedDays = $scope.scheduleConfig.checkedDays || {};
            $scope.scheduleConfig.checkedDays[day] = !$scope.scheduleConfig.checkedDays[day];
        };


        $scope.isChecked = function(day) {
            return $scope.scheduleConfig.checkedDays &&
        $scope.scheduleConfig.checkedDays[day];
        };

        $scope.dayCheckboxCtrls = $scope.uiConfig.daysOfWeek.map(function (day) {
            return new CheckboxComponent(day.camelize(), function () {
                return $scope.isChecked(day);
            }).setOnClick(function ($event) {
                $scope.check(day);
            });
        });

        $scope.shouldShowOptionEveryNMins = function() {
            return $scope.scheduleConfig.interval === intervalOptions.MINUTELY;
        };

        $scope.shouldShowOptionHourly = function() {
            return $scope.scheduleConfig.interval === intervalOptions.HOURLY;
        };

        $scope.shouldShowOptionDaily = function() {
            return $scope.scheduleConfig.interval === intervalOptions.DAILY;
        };

        $scope.shouldShowOptionWeekly = function() {
            return $scope.scheduleConfig.interval === intervalOptions.WEEKLY;
        };

        $scope.shouldShowOptionMonthly = function() {
            return $scope.scheduleConfig.interval === intervalOptions.MONTHLY;
        };

        $scope.shouldShowOptionAt = function() {
            return (
            $scope.shouldShowOptionMonthly()
            || $scope.shouldShowOptionDaily()
            || $scope.shouldShowOptionWeekly()
            ) && !!$scope.scheduleConfig.scheduleJob;

        };

        $scope.shouldShowStatusMessage = function() {
            return !!$scope.scheduleConfig.statusMessage;
        };

        $scope.disableScheduleCtrl = new CheckboxComponent(
            strings.statusViewer.DISABLE_SCHEDULE,
            function () {
                return !$scope.scheduleConfig.enabled;
            }
        ).setOnClick(function ($event) {
            $scope.scheduleConfig.enabled = !$scope.scheduleConfig.enabled;
        });
    }]);
