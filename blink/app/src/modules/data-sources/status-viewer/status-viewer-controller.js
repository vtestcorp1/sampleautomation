/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Controller for the status viewer directive.
 */

'use strict';

blink.app.controller('StatusViewerController', ['$scope',
    '$q',
    'alertService',
    'blinkConstants',
    'strings',
    'dataManagementService',
    'dateUtil',
    'ListModel',
    'listUtils',
    'loadingIndicator',
    'schedulerService',
    'UserAction',
    'userDialogs',
    function ($scope,
          $q,
          alertService,
          blinkConstants,
          strings,
          dataManagementService,
          dateUtil,
          ListModel,
          listUtils,
          loadingIndicator,
          schedulerService,
          UserAction,
          userDialogs){

    //region Globals
        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
    //endregion

    //region UI methods
        $scope.onEditClick = function () {
            $scope.itemDetails.onEdit($scope.itemDetails.dataSource.id);
        };

        $scope.refreshStatus = function () {
            $scope.refresh($scope.itemDetails.dataSource);
        };

        $scope.openScheduler = function() {
            var scheduleConfig = schedulerService
            .getConfigFromBackendJson($scope.itemDetails.schedule);
            // TODO(Rahul.b): Need a better way than this to show the disable checkbox. Probably
            // would need to move that out of the scheduler. Currently that poses an issue as we
            // have a linker based functionality which needs to be applied on the rest of the dom
            // elements when the disable checkbox is checked, which essentially grays out the doms.
            scheduleConfig.showDisable = true;
            userDialogs.showSchedulerDialog(
            scheduleConfig,
            $scope.itemDetails.dataSource,
            updateScheduler
        ).then(
            function() {
                $scope.itemDetails.schedule =
                    schedulerService.getBackendJsonFromConfig(scheduleConfig);
            }
        );
        };

        $scope.canDownloadTrace = function (selectedItem) {
            return !!selectedItem
            && (selectedItem.status === listUtils.StatusEnum.SUCCESS
            || selectedItem.status === listUtils.StatusEnum.FAILED);
        };

        $scope.$watch('itemDetails.status', function(status) {
            $scope.selectedItem = null;
            if(!status) {
                return;
            }

            $scope.listModel.setData(status);
        });
    //endregion

    //region Helper methods
        var updateScheduler = function(data) {
            loadingIndicator.show();

        // If scheduled is disabled by user.
            if(data.schedulerConfig.enabled === false) {
                return disableSchedule(data).finally(function () {
                    loadingIndicator.hide();
                });
            }

            var userAction = new UserAction(UserAction.DATA_SOURCE_UPDATE_SCHEDULE);
            var backendJson = schedulerService.getBackendJsonFromConfig(data.schedulerConfig);
            var errorData = {};
            if (!isBackEndJsonValid(backendJson, errorData)) {
                loadingIndicator.hide();
                return $q.reject(errorData);
            }

            return dataManagementService.enableSchedule(data.datasource.id)
            .then(function() {
                return dataManagementService.updateSchedule(
                        data.datasource.id,
                        backendJson);
            }
            )
            .then(function(response) {
                alertService.showUserActionSuccessAlert(userAction, response);
                $scope.itemDetails.schedule = backendJson;
                $scope.itemDetails.schedule.enabled = true;
            }, function(response) {
                var errorData = alertService.getUserActionFailureAlertContent(userAction,
                    response, response.param);
                errorData.data = response.data;
                return $q.reject(errorData);
            })
            .finally(function () {
                loadingIndicator.hide();
            });
        };

        var isBackEndJsonValid = function(backendJson, errorData) {
            if(backendJson.startTime === void 0 ) {
                errorData.message = blinkConstants.scheduler.START_TIME_NULL_MSG;
                return false;
            }
            if(backendJson.startTime < Date.now() ) {
                errorData.message = blinkConstants.scheduler.START_TIME_ERROR;
                return false;
            }
            if(backendJson.startTime > backendJson.endTime ) {
                errorData.message = blinkConstants.scheduler.END_TIME_ERROR;
                return false;
            }
            return true;
        };

        var disableSchedule = function(data) {
            var userAction = new UserAction(UserAction.DATA_SOURCE_DELETE_SCHEDULE);
            return dataManagementService.disableSchedule(data.datasource.id)
            .then(function(response) {
                $scope.itemDetails.schedule.enabled = false;
                alertService.showUserActionSuccessAlert(
                    userAction,
                    response);
            }, function(response) {
                var errorData = alertService.getUserActionFailureAlertContent(
                    userAction,
                    response,
                    response.param);
                errorData.data = response.data;
                return $q.reject(errorData);
            });
        };

        function isRestartEnabled(objects) {
            return objects.length > 0 && objects.every(function(object) {
                return object.status !== listUtils.StatusEnum.SCHEDULED
                && object.status !== listUtils.StatusEnum.INPROGRESS;
            });
        }

        function isAbortEnabled(objects) {
            return objects.length > 0 && objects.every(function(object) {
                return object.status === listUtils.StatusEnum.INPROGRESS
                || object.status === listUtils.StatusEnum.UNKNOWN;
            });
        }

        function getTableNames(rows) {
            return rows.map(function(row) {
                return row.name;
            });
        }
    //endregion

    //region ------- UI Configuarations --------
        var columns = [
            listUtils.columns.nameCol,
            listUtils.columns.statusViewerStatusCol,
            _.assign({}, listUtils.columns.dateModifiedCol, {
                format: function(row) {
                    return dateUtil.epochToTimeAgoString(row.lastLoadTime);
                }
            })
        ];
        var filterFunction = function(row, filterText) {
            if (!filterText || !filterText.length) {
                return true;
            }

            var regex = new RegExp(filterText.escapeRegExp(), 'gi');
            return !!row.name.match(regex);
        };

        $scope.listModel = new ListModel(columns, [], filterFunction, void 0, true);

        $scope.onRowClick = function(row) {
            $scope.selectedItem = row;
        };

        var statusActionButtons = [
            {
                icon: blinkConstants.metadataListPage.actions.reset.icon,
                text: strings.metadataListPage.actions.reset.text,
                isEnabled: isRestartEnabled,
                onClick: function(rows) {
                    var tableNames = getTableNames(rows);
                    var userAction = new UserAction(UserAction.DATA_SOURCE_RELOAD_TASKS);
                    dataManagementService.reloadTasks($scope.itemDetails.dataSource.id, tableNames).
                    then($scope.refreshStatus).
                    then(function() {
                        alertService.showUserActionSuccessAlert(userAction);
                    });
                }
            },
            {
                icon: blinkConstants.metadataListPage.actions.abort.icon,
                text: strings.metadataListPage.actions.abort.text,
                isEnabled: isAbortEnabled,
                onClick: function (rows) {
                    var tableNames = getTableNames(rows);
                    var userAction = new UserAction(UserAction.DATA_SOURCE_STOP_TASKS);
                    dataManagementService.stopLoadTasks($scope.itemDetails.dataSource.id, tableNames).
                    then(function(response) {
                        alertService.showUserActionSuccessAlert(userAction, response);
                    }, function(response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        return $q.reject(response.data);
                    });
                }
            }
        ];

        $scope.actionItems = statusActionButtons;
    //endregion

        $scope.refreshStatus();
    }]);
