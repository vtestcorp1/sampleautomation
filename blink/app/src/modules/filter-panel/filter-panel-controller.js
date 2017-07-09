/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com),
 * Vibhor Nanavati (vibhor@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class representing filter panel controller.
 */

'use strict';

blink.app.factory('FilterPanelController', ['blinkConstants',
    'strings',
    'FilterControllerV2',
    'filterUtil',
    'UIFilter',
    'util',
    'filterDialog',
    function (blinkConstants,
          strings,
          FilterController,
          filterUtil,
          UIFilter,
          util,
          filterDialog) {
        var MAX_FILTER_NAME_CHARS_IN_SUMMARY = 40;

        function OpenedFilterIdWrapper(id){
            this.id = id;
        }

        function FilterControllerWrapper(filterController) {
            this.filterController = filterController;
        }

        function FilterPanelController(
        filterModels,
        isReadOnly,
        onFilterRemoval,
        onFilterChange,
        onFilterHide)
    {
            this.isReadOnly = !!isReadOnly;
            this.filterModels = filterModels || [];
            this.onFilterChange = onFilterChange;
            this.onFilterRemoval = onFilterRemoval;
            this.onFilterHide = onFilterHide || angular.noop;

            this.filterController = new FilterControllerWrapper(null);
            this.filterList = this.filterModels.map(function(filterModel){
            // TODO(Jasmeet): Define semantics for is active here and pass correct value.
                return new UIFilter(filterModel, true);
            });
            this.openedFilterId = new OpenedFilterIdWrapper(null);
        }

        FilterPanelController.prototype.hideFilter = function() {
            var currentFilterModel = this.filterModels.find(function(filterModel) {
                return filterModel.getId() === this.openedFilterId.id;
            }, this);

            this.onFilterHide(currentFilterModel);
            this.openedFilterId.id = null;
        };

        FilterPanelController.prototype.showFilter = function(filterId) {
            var filterModel = this.filterModels.find(function(filterModel){
                return filterModel.getId() === filterId;
            });

            this.filterController.filterController = new FilterController(
                filterModel,
                this.isReadOnly
            );

            this.openedFilterId.id = filterId;
            var self = this;
            // promise will be resolved/rejected based on viewer clicked done or cancel.
            filterDialog.show(this.filterController.filterController)
                .then(function(queryTransformations) {
                    self.onFilterChange(queryTransformations, filterModel);
                    self.onFilterHide(filterModel);
                }, function() {
                    self.hideFilter();
                });
        };

        FilterPanelController.prototype.getFilterDisplayName = function(uiFilter) {
            var filterModel = uiFilter.getFilterModel();
            var filterColumn = filterModel.getColumn();
            var val = filterColumn.getName();

            val = util.truncate(val, MAX_FILTER_NAME_CHARS_IN_SUMMARY);

            if (filterModel.isSupportedByUI()) {
                val = val + ':';
            }

            return val;
        };

        FilterPanelController.prototype.getFilterValueText = function(uiFilter) {
            var filterModel = uiFilter.getFilterModel();
            if (!filterModel.isSupportedByUI()) {
                return strings.checkboxFilter.emptyFilterTextPlaceholder;
            }
            var filterValueText = filterUtil.getFilterValueSummary(filterModel);
            return filterValueText === ''
            ? strings.checkboxFilter.emptyFilterTextPlaceholder
            : filterValueText;
        };

        FilterPanelController.prototype.onFilterItemClick = function(uiFilter) {
            if (this.isFilterOpened(uiFilter)) {
                this.hideFilter();
            } else {
                var filterModel = uiFilter.getFilterModel();
                this.showFilter(filterModel.getId());
            }
        };

        FilterPanelController.prototype.shouldDisplay = function(uiFilter) {
            return uiFilter.getFilterMode().shouldDisplay();
        };

        FilterPanelController.prototype.isFilterOpened = function(uiFilter){
            return uiFilter.getFilterModel().getId() === this.openedFilterId.id;
        };

        FilterPanelController.prototype.isFilterActive = function(uiFilter){
            return true;
        // TODO(Jasmeet): Perhaps this can be calculated
        };

        FilterPanelController.prototype.onDeleteFilterClick = function($evt, filter) {
            $evt.stopPropagation();
            var filterModel = filter.getFilterModel();
            this.onFilterRemoval(filterModel);
        };

        FilterPanelController.prototype.showPanel = function() {
            return this.filterList.length > 0;
        };

        return FilterPanelController;
    }]);
