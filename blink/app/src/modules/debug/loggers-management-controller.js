/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview Controller for debug page
 */

'use strict';

blink.app.controller('LoggersManagementController', ['$scope',
    '$q',
    '$rootScope',
    'adminService',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'strings',
    'Command',
    'UserAction',
    function ($scope,
          $q,
          $rootScope,
          adminService,
          alertConstants,
          alertService,
          blinkConstants,
          strings,
          Command,
          UserAction) {

        var fetchLoggers = function () {
            var userAction = new UserAction(UserAction.FETCH_LOGGERS);
            return adminService.getLoggerNames()
            .then(function (response) {
                var loggersData = response.data;
                var loggers = loggersData.map(function (logger) {
                    return {
                        name: logger.name,
                        description: logger.description,
                        currentLevel: logger.level,
                        originalLevel: logger.level,
                        timeout: {
                            title: 'Never',
                            value: 0
                        }
                    };
                });
                return loggers;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };

        $scope.isLoading = true;

        fetchLoggers().then(function (loggers) {
            $scope.loggers = loggers;
            $scope.selectedLogger = loggers[0];
        }, $scope.onError).finally(function () {
            $scope.isLoading = false;
        });

        $scope.logLevels = [
            'DEBUG',
            'INFO',
            'WARN',
            'TRACE',
            'ERROR',
            'empty',
        ];

        $scope.timeouts = [
            {
                title: '10 min',
                value: 600
            },
            {
                title: '30 min',
                value: 1800
            },
            {
                title: '60 min',
                value: 3600
            },
            {
                title: 'Never',
                value: 0
            }
        ];

        $scope.onLevelApplyClick = function (logger) {
            var userAction = new UserAction(UserAction.SET_LOG_LEVEL);
            adminService.setLogLevel(
                {
                    name: logger.name,
                    level: logger.currentLevel
                }
        ).then(function (response) {
            alertService.showUserActionSuccessAlert(userAction, response);
            logger.originalLevel = logger.currentLevel;
            return response.data;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
        };
    }]);
