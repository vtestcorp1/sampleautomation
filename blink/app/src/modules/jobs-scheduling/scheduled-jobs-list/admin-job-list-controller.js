/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';



/* global addBooleanFlag */
addBooleanFlag('debugJob', 'Add a cron schedule for jobs', false);

blink.app.factory('AdminJobListController', ['$q',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'CancelablePromise',
    'JobsListController',
    'jsonConstants',
    'listActionUtil',
    'listFiltersService',
    'listUtils',
    'MetadataListController',
    'ListModel',
    'loadingIndicator',
    'metadataService',
    'metadataUtil',
    'strings',
    'timelyServices',
    'UserAction',
    'util',
    function($q,
             alertConstants,
             alertService,
             blinkConstants,
             CancelablePromise,
             JobsListController,
             jsonConstants,
             listActionUtil,
             listFiltersService,
             listUtils,
             MetadataListController,
             ListModel,
             loadingIndicator,
             metadataService,
             metadataUtil,
             strings,
             timelyServices,
             UserAction,
             util) {

        function AdminJobListController(onRowClick, onRefresh, pinboardId) {
            var strings1 = strings.metadataListPage.dataManagement.tables;
            var constants = blinkConstants.metadataListPage.dataManagement.tables;

            var columns =  [
                listUtils.jobColumns.nameWithLinkCol,
                listUtils.columns.authorCol,
                listUtils.columns.descriptionCol,
                listUtils.jobColumns.statusCol,
                listUtils.jobColumns.dateCreatedCol,
                listUtils.jobColumns.recipientsCol
            ];

            /* global flags */
            if (flags.getValue('debugJob')) {
                columns.push(listUtils.jobColumns.cronSchedule);
            }

            var filters = [
                listFiltersService.standardFilters.authorFilter
            ];

            var actionItems = [
                listActionUtil.getPauseAction(this),
                listActionUtil.getResumeAction(this),
                listActionUtil.getDeleteAction(this)
            ];
            this.pinboardId = pinboardId;

            AdminJobListController.__super.call(
                this,
                strings1,
                columns,
                filters,
                actionItems,
                onRowClick,
                onRefresh,
                null,
                null,
                false
            );
        }

        util.inherits(AdminJobListController, JobsListController);

        AdminJobListController.prototype.loadData = function () {

            var self = this;
            var promise =  timelyServices.getListOfJobsForPinboard().then(function(jobs){

                var items = jobs;
                items.forEach(function(item){
                    item.description = item.getDescription();
                    item.name = item.getName();
                    item.href = item.getLinkToEditPage();
                });
                self.listModel.setData(items);
                if (_.isFunction(self.onRefresh)) {
                    self.onRefresh();
                }
                return items;

            });
            return promise;
        };
        AdminJobListController.prototype.init = function () {
            this.listModel = new ListModel(
                this.columns,
                [],
                this.filterFunction.bind(this),
                this.titleFunction.bind(this),
                true,
                true
            );

            this.refreshList();
        };

        AdminJobListController.prototype.titleFunction = function() {
            return this.listModel.filteredData.length + ' Jobs';
        };

        return AdminJobListController;
    }
]);
