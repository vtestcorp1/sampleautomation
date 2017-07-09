/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview A directive for showing alert messages which update themselves at regular intervals
 */

'use strict';

blink.app.controller('timedAlertController', ['$scope', '$timeout', 'Logger', function($scope, $timeout, Logger) {

    var _logger = Logger.create('timed-alert-controller');
    var running = false;
    var model = $scope.model;
    model.sortBy(function(a) {
        return a.time;
    });
    var updateMessagePromise;
    var hideMessagePromise;

    $scope.start = function() {
        if (running) {
            $scope.stop();
        }
        running = true;
        alertMessageAndScheduleNextIteration(0);
    };

    $scope.stop = function() {
        $scope.toggleAlertVisibility(false);
        $timeout.cancel(hideMessagePromise);
        hideMessagePromise = null;
        $timeout.cancel(updateMessagePromise);
        updateMessagePromise = null;
        running = false;
    };

    function alertMessageAndScheduleNextIteration(index) {
        var updateMessageDelay = (index === 0) ? model[index].time : model[index].time - model[index - 1].time;
        updateMessagePromise = $timeout(function() {
            $scope.message = model[index].message;
            $scope.toggleAlertVisibility(true);
            $scope.setType(model[index].type);
            hideMessagePromise = $timeout(function() {
                $scope.toggleAlertVisibility(false);
            }, model[index].duration * 1000);

            // If this is the last message, do not schedule the next iteration
            if (index + 1 < model.length) {
                alertMessageAndScheduleNextIteration(index + 1);
            }
        }, updateMessageDelay * 1000);
    }
}]);

blink.app.directive('timedAlert', ['angularUtil', function(angularUtil) {
    function linker(scope, $timedAlert, attrs) {
        var $alert = $('<div class="bk-timed-alert-wrapper"><div class="bk-timed-alert">{{message}}</div></div>');

        $('body').append($alert);
        angularUtil.getCompiledElement($alert, scope);

        var StyleClasses = ['bk-warn', 'bk-error'];

        scope.toggleAlertVisibility = function(show) {
            var display = show ? 'block' : 'none';
            $alert.css({'display': display});
        };

        scope.setType = function(type) {
            StyleClasses.forEach(function(styleClass) {
                $alert.removeClass(styleClass);
            });
            $alert.addClass('bk-' + type);
        };

        $timedAlert.on('start', function() {
            scope.start();
        });

        $timedAlert.on('stop', function() {
            scope.stop();
        });

        scope.$on('$destroy', function() {
            scope.stop();
        });

        $timedAlert.on('$destroy', function () {
            $alert.remove();
        });
    }

    return {
        scope: {
            model: '='
        },
        restrict: 'E',
        controller: 'timedAlertController',
        link: linker
    };
}]);
