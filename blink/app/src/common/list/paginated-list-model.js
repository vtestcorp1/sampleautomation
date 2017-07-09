/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Model for the Paginated List Directive
 */

'use strict';

blink.app.factory('PaginatedListModel', ['ListModel',
    'util',
    function(ListModel,
         util) {
        var PaginatedListModel = function(columns,
                                      batchSize,
                                      pageChangeCallback,
                                      refreshCallback,
                                      titleFunction,
                                      isSelectionEnabled,
                                      isHeaderEnabled,
                                      sortKey,
                                      sortReverse
    ) {
            var truthyFilterFunction = function() {
                return true;
            };
            PaginatedListModel.__super.call(
            this,
            columns,
            [],
            truthyFilterFunction,
            titleFunction,
            isSelectionEnabled,
            isHeaderEnabled
        );

            this.page = 0;
            this.batchSize = batchSize;
            this.columns = columns;
            this.titleFunction = titleFunction;
            this.pageChangeCallback = pageChangeCallback;
            this.refreshCallback = refreshCallback;
            this.sortKey = sortKey;
            this.sortReverse = false;
            this.sortReverse = !!sortReverse;
        };

        util.inherits(PaginatedListModel, ListModel);

        PaginatedListModel.prototype.isPaginated = function() {
            return true;
        };

        PaginatedListModel.prototype.getSortKey = function() {
            return this.sortKey;
        };

        PaginatedListModel.prototype.isSortedReverse = function() {
            return this.sortReverse;
        };

        PaginatedListModel.prototype.getTitle = function() {
            if(!this.titleFunction) {
                return null;
            }
            return this.titleFunction(this.data, this.page, this.batchSize);
        };

        PaginatedListModel.prototype.getCurrentPage = function() {
            return this.page;
        };

        PaginatedListModel.prototype.hasPrevPage = function() {
            return this.page > 0;
        };

        PaginatedListModel.prototype.hasNextPage = function() {
            return this.hasMoreData;
        };

        PaginatedListModel.prototype.setData = function(data, hasMoreData, page) {
            this.data = this.filteredData = data;
            this.page = page;
            this.hasMoreData = hasMoreData;
        };

        PaginatedListModel.prototype.onNextClick = function() {
            if (!this.hasNextPage()) {
                return void 0;
            }
            this.pageChangeCallback(this.page + 1);
        };

        PaginatedListModel.prototype.onPrevClick = function() {
            if (!this.hasPrevPage()) {
                return void 0;
            }
            this.pageChangeCallback(this.page - 1);
        };


        PaginatedListModel.prototype.setSortKey = function(sortKey) {
            this.sortKey = sortKey;
            this.sortReverse = !this.sortReverse;
            this.refreshCallback();
        };

        PaginatedListModel.prototype.onRefresh = function() {
            this.refreshCallback();
        };

        PaginatedListModel.prototype.hasNoData = function() {
            return false;
        };

        return PaginatedListModel;
    }]);
