/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Abstract Class for various job lists
 *
 *
 */

'use strict';

blink.app.factory('JobsListController', ['$q',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'CancelablePromise',
    'jsonConstants',
    'listActionUtil',
    'listFiltersService',
    'listUtils',
    'MetadataListController',
    'ListModel',
    'loadingIndicator',
    'strings',
    'sessionService',
    'timelyServices',
    'UserAction',
    'util',
    function($q,
          alertConstants,
          alertService,
          blinkConstants,
          CancelablePromise,
          jsonConstants,
          listActionUtil,
          listFiltersService,
          listUtils,
          MetadataListController,
          ListModel,
          loadingIndicator,
          strings,
          sessionService,
          timelyServices,
          UserAction,
          util) {

        function JobsListController(strings,
                                columns,
                                filters,
                                actionItems,
                                onRowClick,
                                onRefresh) {
            // calling MetadataListController
            JobsListController.__super.call(
            this,
            strings,
            null,
            columns,
            filters,
            actionItems,
            onRowClick,
            onRefresh,
            null, // stickers
            null, // sortKey
            false // sortReverse
        );
        }

        util.inherits(JobsListController, MetadataListController);

        /**
         * If hideIndicator is true, we do not show the loading indicator.
         * When auto refresh is enabled, its annoying to see the loading indicator
         * popping up for every refresh.
         * @param pageNumber
         * @param hideIndicator
         */
        JobsListController.prototype.refreshList = function(pageNumber, hideIndicator) {
            var self = this;

            var showLoadingIndicator = true;

            if (hideIndicator === true) {
                showLoadingIndicator = false;
            }
            if (showLoadingIndicator) {
                this.showLoadingIndicator();
            }
            return this.loadData(pageNumber)
                .finally(function() {
                    if (showLoadingIndicator) {
                        self.hideLoadingIndicator();
                    }
                }
            );
        };

        JobsListController.prototype.filterFunction = function(row, filterText) {
            if (!filterText || !filterText.length) {
                return true;
            }

            var regex = new RegExp(filterText.escapeRegExp(), 'gi');
            return !!row.name.match(regex);
        };

        JobsListController.prototype.canDelete = function (jobs) {
            return this.canExecuteAction(jobs);
        };

        JobsListController.prototype.canShare = function () {
            return false;
        };

        JobsListController.prototype.canTag = function () {
            return false;
        };

        JobsListController.prototype.canExport = function () {
            return false;
        };

        JobsListController.prototype.showLoadingIndicator = function () {
            loadingIndicator.show({
                anchorElementOrSelector : 'body'
            });
        };
        JobsListController.prototype.hideLoadingIndicator = function () {
            loadingIndicator.hide();
        };

        JobsListController.prototype.onDeleteAction = function (items) {

            this.showConfirmDeleteDialog(items)
            .then(loadingIndicator.show.bind(loadingIndicator))
            .then(this.delete.bind(this, items))
            .then(this.refreshList.bind(this));
        };

        JobsListController.prototype.delete = function (items) {
            return this.executeAction(timelyServices.deleteJob(getItemIds(items)),
            UserAction.DELETE_JOB);
        };

        JobsListController.prototype.canPause = function (items) {
            if (!this.canExecuteAction(items)) {
                return false;
            }
            return !_.some(items, function (item) {
                return !item.isPausable();
            });
        };

        JobsListController.prototype.canResume = function (items) {
            if (!this.canExecuteAction(items)) {
                return false;
            }
            return !_.some(items, function (item) {
                return !item.isSchedulable();
            });
        };

        JobsListController.prototype.pauseJob = function (items) {
            return this.executeAction(timelyServices.
            pauseJob(getItemIds(items)), UserAction.PAUSE_JOB);
        };

        JobsListController.prototype.resumeJob = function (items) {
            return this.executeAction(timelyServices.
            resumeJob(getItemIds(items)), UserAction.RESUME_JOB);
        };

        JobsListController.prototype.onSuccess = function (userAction, data) {
            alertService.showUserActionSuccessAlert(userAction, data);
            return data;
        };
        JobsListController.prototype.onFailure = function (userAction, data) {
            alertService.showUserActionFailureAlert(userAction, data);
            return $q.reject(data);
        };

        JobsListController.prototype.destructor = function () {
        //
        };

        JobsListController.prototype.isAuthor = function(jobs) {
            return !_.some(jobs, function (job) {
                return sessionService.getUserGuid() != job.getAuthor();
            });
        };

        JobsListController.prototype.canExecuteAction = function(jobs) {
            return this.isAuthor(jobs) || sessionService.hasAdminPrivileges();
        };

        JobsListController.prototype.executeAction = function (action, userActionConstant) {

            var userAction = new UserAction(userActionConstant);
            var onSuccess = this.onSuccess.bind(this, userAction);
            var onFailure = this.onFailure.bind(this, userAction);
            loadingIndicator.show();
            return action
            .then(onSuccess, onFailure)
            .then(this.refreshList.bind(this))
            .finally(loadingIndicator.hide.bind(loadingIndicator));
        };

        function getItemIds(items) {
            return items.map(function (item) {
                return item.getId();
            });
        }

        return JobsListController;
    }]);
