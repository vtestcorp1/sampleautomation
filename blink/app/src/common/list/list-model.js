/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Model for the List Directive
 */

'use strict';

blink.app.factory('ListModel', function() {

    var ListModel = function (columns,
        data,
        filter,
        titleFunction,
        isSelectionEnabled,
        isHeaderEnabled,
        groupByColumn,
        groupMarkerTemplate) {

        this.page = 0;
        this.columns = columns;
        this.data = data;
        this.filter = filter;
        this.titleFunction = titleFunction;
        this.selectionEnabled = isSelectionEnabled;
        this.headerEnabled = isHeaderEnabled;
        this.groupByColumn = groupByColumn;
        this.groupMarkerTemplate = groupMarkerTemplate;

        this.data = this.filteredData = data;
    };

    ListModel.prototype.isPaginated = function() {
        return false;
    };

    ListModel.prototype.isSelectionEnabled = function() {
        return this.selectionEnabled;
    };

    ListModel.prototype.isHeaderEnabled = function() {
        return this.headerEnabled;
    };

    ListModel.prototype.isGrouped = function () {
        return !!this.groupByColumn;
    };

    ListModel.prototype.getColumns = function() {
        return this.columns;
    };

    /*
     * This method will be called on every iteration when rendering a list
     * and should answer the question whether we're starting to render a new group
     * (and should render a group separator) or not. Only applies for grouped lists.
     */
    ListModel.prototype.showGroupMarker = function (index) {
        var column = this.groupByColumn;
        return (index === 0) ||
            this.filteredData[index][column] != this.filteredData[index - 1][column];
    };

    ListModel.prototype.filterData = function() {
        var filterText = this.searchText;
        if (!filterText || !filterText.length) {
            this.filteredData = this.data;
        }

        var self = this;
        this.filteredData = this.data.filter(function(item) {
            if(!!self.filter) {
                return self.filter(item, filterText);
            }
            return item;
        });

        this.sortFilteredDataIfNeeded();

    };

    ListModel.prototype.sortFilteredDataIfNeeded = function () {
        // If list supposed to be grouped by some column,
        // we should sort it by this column
        var that = this;
        if (this.isGrouped()) {
            this.filteredData.sort(function (a, b) {
                var column = that.groupByColumn;
                if (a[column] < b[column]) {
                    return -1;
                } else if (a[column] > b[column]) {
                    return 1;
                }
                return 0;
            });
        }
    };

    ListModel.prototype.getFilteredData = function() {
        return this.filteredData;
    };

    ListModel.prototype.addItem = function(item) {
        return this.data.push(item);
    };

    ListModel.prototype.hasNoData = function () {
        if (!this.data) {
            return false;
        }
        return !this.data.length;
    };

    ListModel.prototype.getData = function() {
        return this.data;
    };

    ListModel.prototype.setData = function(data) {
        this.searchText = '';
        this.data = data;
        this.filteredData = data;
        this.sortFilteredDataIfNeeded();
    };

    ListModel.prototype.getSearchText = function() {
        return this.searchText || '';
    };

    ListModel.prototype.clearSearchText = function() {
        this.searchText = '';
    };

    ListModel.prototype.getSelectedItems = function () {
        if (!this.data) {
            return [];
        }
        var selectedItems = this.data.filter(function (item) {
            return item._selected;
        });

        return selectedItems || [];
    };

    ListModel.prototype.allItemsSelected = function() {
        if (!this.filteredData || !this.filteredData.length) {
            return false;
        }
        return this.filteredData.every(function(item) {
            return item._selected;
        });
    };

    ListModel.prototype.noItemsSelected = function() {
        if (!this.filteredData || !this.filteredData.length) {
            return true;
        }
        return this.filteredData.every(function(item) {
            return !item._selected;
        });
    };

    ListModel.prototype.getTitle = function() {
        if(!this.titleFunction) {
            return null;
        }
        return this.titleFunction(this.data);
    };

    ListModel.prototype.canShowTitle = function() {
        return !!this.titleFunction;
    };

    return ListModel;
});
