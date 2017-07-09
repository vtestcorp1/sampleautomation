/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtpot.com)
 *
 * @fileoverview Controller for checkbox filter implementation.
 *
 */

'use strict';
blink.app.factory('CheckboxFilterControllerV2', ['$q',
    'blinkConstants',
    'strings',
    'CheckboxCollectionController',
    'env',
    'filterUtil',
    'Logger',
    'util',
    function($q,
         blinkConstants,
         strings,
         CheckboxCollectionController,
         env,
         filterUtil,
         Logger,
         util) {

        var _logger = Logger.create('checkbox-filter-controller');

        var FILTER_LIST_PAGE_SIZE = 100,
            SAMPLE_VALUE_COUNT = 4,
            EMPTY_VALUE_TEXT = strings.EMPTY_VALUE_PLACEHOLDER_LABEL.toLowerCase();

        var filterListSectionTypes = {
            SELECTED: 'SELECTED',
            ALL:      'ALL'
        };

    // NOTE(Jasmeet): In the current extension model. We cannot have base types on this that we
    // want access to as they are copied as new objects in angular scope. Whereas for other objects
    // reference is copied.
        function SelectedRows(selectedRows) {
            this.selectedRows = {};
            $.extend(true, this.selectedRows, selectedRows);
        }

        function CheckboxFilterController(filterModel, isReadOnly) {
            this.filterModel = filterModel;
            this.isReadOnly = !!isReadOnly;

            this.searchText = '';
            this.showLoadingIndicator = false;
            this.selectedSection =
            isReadOnly ? filterListSectionTypes.SELECTED : filterListSectionTypes.ALL;
            this.selectedTabCheckboxCollectionCtrl = null;
            this.allTabCheckboxCollectionCtrl = null;
            this.allTabCheckboxCollection = [];
            this.selectedTabCheckboxCollection = [];

            this.selectedRows = new SelectedRows(filterModel.getSelectedFilterItems());

            this.displayTextValues = strings.checkboxFilter;
        }

        CheckboxFilterController.prototype.changeSectionTo = function (section) {
            this.searchText = '';
            this.selectedSection = filterListSectionTypes[section];
            this.setCheckboxItems();
        };

        CheckboxFilterController.prototype.inAllSection = function () {
            return this.selectedSection === filterListSectionTypes.ALL;
        };

        CheckboxFilterController.prototype.inSelectedSection = function () {
            return this.selectedSection === filterListSectionTypes.SELECTED;
        };

        CheckboxFilterController.prototype.hasMoreValuesThanPageSize = function () {
            var allMatchesCount = this.allTabCheckboxCollection.length;
            return allMatchesCount > FILTER_LIST_PAGE_SIZE;
        };

        CheckboxFilterController.prototype.getTooManyValuesMessage = function () {
            if (!this.searchText) {
                return this.displayTextValues.TRY_REDUCING_VALUES.assign(env.attributeFilterMaxValues);
            }
            return this.displayTextValues.KEEP_TRYING;
        };

        CheckboxFilterController.prototype.getSampleValues = function () {
            var sampleRows = util.getSamples(this.allTabCheckboxCollection, SAMPLE_VALUE_COUNT);
            var sampleValues = sampleRows.map(function(sampleCheckboxItem) {
                return sampleCheckboxItem.title;
            });

            return sampleValues;
        };

        CheckboxFilterController.prototype.onSelectionChange = function(title, value) {
            if (value) {
                this.selectedRows.selectedRows[title] = true;
            } else {
                delete this.selectedRows.selectedRows[title];
            }
        };

        function getRowLabel (title, searchText) {
            if (!title) {
                return '';
            }
            var value = util.formatDataLabel(title, {
                checkOnlySpecialFormat: true
            });

            return util.boldMatchingText(
            value,
            searchText
        );
        }

        function getCheckboxItemFromFilterRow(searchText, title, value) {
            var rowLabel = getRowLabel(title, searchText);
            return {
                title: rowLabel,
                isChecked: value
            };
        }

        function getCheckboxItemsFromFilterItems (filterItems, searchText) {
            var checkboxCollection = [];
            Object.keys(filterItems).forEach(function(title){
                var value = filterItems[title];
                var checkboxItem = getCheckboxItemFromFilterRow(searchText, title, value);
                checkboxCollection.push(checkboxItem);
            });

            return checkboxCollection;
        }

        function doesKeyMatchQuery(key, queryString) {
            key = ('' + key).toLowerCase();
            queryString = queryString.toLowerCase();

            if (key.indexOf(queryString) >= 0) {
                return true;
            }

            if (EMPTY_VALUE_TEXT.indexOf(queryString) >= 0 && key === '') {
                return true;
            }

            return false;
        }

        CheckboxFilterController.prototype.setCheckboxItems = function() {
            this.showLoadingIndicator = true;
            var ctrl = this;
            var searchText = this.searchText;
            var filterModel = this.filterModel;

            var onChange = ctrl.onSelectionChange.bind(ctrl);

            if (this.inSelectedSection()) {
                var selectedFilterRows = this.selectedRows.selectedRows;
                $q.when(selectedFilterRows)
                .then(function(selectedFilterRows) {
                    var checkboxCollection = getCheckboxItemsFromFilterItems(
                        selectedFilterRows,
                        searchText
                    );
                    var matchingCheckboxItems = checkboxCollection.filter(function(checkboxItem){
                        return doesKeyMatchQuery(checkboxItem.title, searchText);
                    });

                    ctrl.selectedTabCheckboxCollection = matchingCheckboxItems;
                    var selectedTabCollectionCtrl = new CheckboxCollectionController(
                        matchingCheckboxItems,
                        onChange,
                        ctrl.isReadOnly
                    );
                    ctrl.selectedTabCheckboxCollectionCtrl = selectedTabCollectionCtrl;
                    ctrl.showLoadingIndicator = false;
                });
            } else {
                var updateValuesPromise =
                filterUtil.updateFilterModelWithValues(this.filterModel, searchText);
                var containsValuePromise =
                filterUtil.filterColumnContainsValue(this.filterModel, searchText);

                util.getAggregatedPromise([updateValuesPromise, containsValuePromise])
                .then(function(data) {
                    ctrl.updateCheckboxItems(searchText, data[1] /*exact match*/);
                }, function(response) {
                    _logger.warn('Failed to fetch filter data.');
                    ctrl.updateCheckboxItems(searchText, false /*exact match*/);
                })
                .finally(function() {
                    ctrl.showLoadingIndicator = false;
                });
            }
        };

        CheckboxFilterController.prototype.updateCheckboxItems = function(searchText, exactMatch) {
            var allFilterRows = this.filterModel.getFilterItems();

            var checkboxCollection = getCheckboxItemsFromFilterItems(
            allFilterRows,
            searchText
        );
            var matchingCheckboxItems = checkboxCollection.filter(function(checkboxItem){
                return doesKeyMatchQuery(checkboxItem.title, searchText);
            });

        // Adding the exact match element.
            if (!allFilterRows.hasOwnProperty(searchText) && exactMatch) {
                var exactMatchCheckboxItem = {
                    title : searchText,
                    isChecked: !!this.selectedRows.selectedRows[searchText]
                };

                matchingCheckboxItems.unshift(exactMatchCheckboxItem);
            }

            this.allTabCheckboxCollection = matchingCheckboxItems;

            var allTabCollectionCtrl = new CheckboxCollectionController(
            matchingCheckboxItems,
            this.onSelectionChange.bind(this),
            this.isReadOnly
        );

            this.allTabCheckboxCollectionCtrl = allTabCollectionCtrl;
        };

        CheckboxFilterController.prototype.onSearchTextChange = function() {
            var fn = this.setCheckboxItems.bind(this);
            util.debounce(fn, env.attributeFilterSearchDelay)();
        };

        CheckboxFilterController.prototype.hideSearchBar = function() {
            var inSelectedSection = this.inSelectedSection();
            var hasNoSelectedValues = this.selectedRows.selectedRows.length === 0;
            return inSelectedSection && hasNoSelectedValues;
        };

        CheckboxFilterController.prototype.getSelectedItems = function() {
            var selectedItems = {};
            util.iterateObject(this.selectedRows.selectedRows, function(key, value) {

                var keyValue = key.unescapeHTML().stripTags('b');
                selectedItems[keyValue] = value;
            });
            return selectedItems;
        };

        return CheckboxFilterController;
    }]);
