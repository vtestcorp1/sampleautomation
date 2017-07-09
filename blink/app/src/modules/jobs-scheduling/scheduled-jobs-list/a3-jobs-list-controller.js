/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

blink.app.factory('A3JobsListController', ['$q',
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
    'loadingIndicator',
    'metadataService',
    'metadataUtil',
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
             MetadataListController,
             loadingIndicator,
             metadataService,
             metadataUtil,
             PaginatedListModel,
             strings,
             timelyServices,
             UserAction,
             util) {
        function A3JobsListController(onRowClick, onRefresh) {
            var dataManagementTableStrings = strings.metadataListPage.dataManagement.tables;

            var columns =  [
                listUtils.jobColumns.nameWithLinkCol,
                listUtils.columns.authorCol,
                listUtils.jobColumns.statusCol,
                listUtils.jobColumns.dateModifiedCol,
                listUtils.a3JobCols.resultCol
            ];

            var filters = [
            ];

            var actionItems = [
                listActionUtil.getPauseAction(this),
                listActionUtil.getResumeAction(this),
                listActionUtil.getDeleteAction(this)
            ];

            // calling JobsListController
            A3JobsListController.__super.call(
                this,
                dataManagementTableStrings,
                columns,
                filters,
                actionItems,
                onRowClick,
                onRefresh
            );
        }

        util.inherits(A3JobsListController, JobsListController);

        A3JobsListController.prototype.loadData = function (pageNumber) {
            pageNumber = _.isNil(pageNumber) ? 0 : pageNumber;
            var self = this;
            var pageSize = blinkConstants.METADATA_PAGE_SIZE;
            var offset = pageNumber * pageSize;
            var pattern = this.listModel.getSearchText();
            var orderBy = this.listModel.getSortKey();
            var sortAsc = this.listModel.isSortedReverse();

            return timelyServices.getA3JobsWithRuns(offset, pageSize, pattern, orderBy, sortAsc).then(
                function(a3JobsResponse){
                    var hasMoreData = false === a3JobsResponse.isLastPage;
                    var items = a3JobsResponse.a3Jobs;
                    items.forEach(function(item){
                        item.name = item.getName();
                        item.resultSummary = item.getResultSummary();
                    });
                    self.listModel.setData(
                        items,
                        hasMoreData,
                        pageNumber
                    );
                    if (_.isFunction(self.onRefresh)) {
                        self.onRefresh();
                    }
                    return items;

                });
        };
        A3JobsListController.prototype.init = function () {
            this.listModel = new PaginatedListModel(
                this.columns,
                blinkConstants.METADATA_PAGE_SIZE,
                this.onPaginate.bind(this),
                this.onFiltering.bind(this),
                this.titleFunction.bind(this),
                true, /* selection-enabled */
                true,  /* header-enabled */
                void 0, /* sortKey */
                void 0 /* sortReverse */
            );

            this.refreshList(0);
        };

        return A3JobsListController;
    }
]);
