/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

blink.app.factory('ScheduledJobListController', ['$q',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'CancelablePromise',
    'JobsListController',
    'jsonConstants',
    'listActionUtil',
    'listFiltersService',
    'listUtils',
    'loadingIndicator',
    'MetadataListController',
    'PaginatedListModel',
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
             loadingIndicator,
             MetadataListController,
             PaginatedListModel,
             strings,
             timelyServices,
             UserAction,
             util) {

        function ScheduledJobsListController(onRowClick, onRefresh, onShowRunClick, pinboardId) {

            var blinkStrings = strings.metadataListPage.dataManagement.tables;

            var columns =  [
                listUtils.columns.nameCol,
                listUtils.columns.authorCol,
                listUtils.columns.descriptionCol,
                listUtils.jobColumns.statusCol,
                listUtils.jobColumns.dateCreatedCol,
                listUtils.jobColumns.runHistory,
                listUtils.jobColumns.recipientsCol
            ];
            listUtils.jobColumns.runHistory.onClick = onShowRunClick;


            var filters = []; // callosum has no author filtering support now

            var actionItems = [
                listActionUtil.getPauseAction(this),
                listActionUtil.getResumeAction(this),
                listActionUtil.getDeleteAction(this)
            ];
            this.pinboardId = pinboardId;

            ScheduledJobsListController.__super.call(
                this,
                blinkStrings,
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

        util.inherits(ScheduledJobsListController, JobsListController);

        ScheduledJobsListController.prototype.loadData = function (pageNumber) {
            pageNumber = _.isNil(pageNumber) ? 0 : pageNumber;
            var pageSize = blinkConstants.METADATA_PAGE_SIZE;
            var offset = pageNumber * pageSize;
            var self = this;
            var promise =  timelyServices.getListOfJobsForPinboard(
                this.pinboardId,
                offset,
                pageSize
            ).then(function(jobs){

                jobs.forEach(function(job){
                    job.name = job.getName();
                    job.description = job.getDescription();
                });

                var items = jobs;
                self.listModel.setData(
                    items,
                    true, // hasMoreData is always set to true for now.
                    pageNumber
                );
                if (self.onRefresh) {
                    self.onRefresh();
                }
                return items;

            });
            return promise;
        };
        ScheduledJobsListController.prototype.init = function () {
            this.listModel = new PaginatedListModel(
                this.columns,
                blinkConstants.METADATA_PAGE_SIZE,
                this.onPaginate.bind(this),
                this.onFiltering.bind(this),
                this.titleFunction.bind(this),
                true, /* selection-enabled */
                true,  /* header-enabled */
                void 0,
                void 0
            );

            this.listModel.noContentMessage = blinkConstants.metadataListPage.jobs.noContentMessage;
            this.refreshList(0);
        };

        return ScheduledJobsListController;
    }]);
