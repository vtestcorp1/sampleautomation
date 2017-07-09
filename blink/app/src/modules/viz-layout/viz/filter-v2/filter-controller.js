/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Base filter controller
 */

'use strict';
blink.app.factory('FilterControllerV2', ['$q',
    'AttributeFilterComponent',
    'blinkConstants',
    'strings',
    'DateFilterController',
    'filterTransformationUtil',
    'Logger',
    'RangeFilterController',
    function($q,
             AttributeFilterComponent,
             blinkConstants,
             strings,
             DateFilterController,
             filterTransformationUtil,
             Logger,
             RangeFilterController) {
        var _logger = Logger.create('filter-controller');

        var filterTypes = {
            RangeFilter: 'RangeFilter',
            DateFilter: 'DateFilter',
            AttributeFilter: 'AttributeFilter'
        };

        function FilterController(filterModel, isReadOnly) {
            this.filterModel = filterModel;
            this.isReadOnly = isReadOnly;
            this.filterTypes = filterTypes;

            this.loadingFilter = false;

            this.readOnlyFilterMessage = strings.filtersMessages.READONLY;
            this.doneButtonText = strings.DONE;
            this.cancelButtonText = strings.CANCEL;
            this.okButtonText = strings.OK;

            this.initialize();
        }

        FilterController.prototype.setFilterModel = function(filterModel) {
            this.filterModel = filterModel;
        };

        FilterController.prototype.setIsReadOnly = function(isReadOnly) {
            this.isReadOnly = isReadOnly;
        };

        FilterController.prototype.setRemoveElementOnCompletion= function(removeElementOnCompletion) {
            this.removeElementOnCompletion = removeElementOnCompletion;
        };

        function getFilterType(filterModel) {
            var columnModel = filterModel.getColumn();
            if (columnModel.isMeasure()) {
                return filterTypes.RangeFilter;
            } else if (columnModel.isDateColumn()) {
                return filterTypes.DateFilter;
            } else {
                return filterTypes.AttributeFilter;
            }
        }

        FilterController.prototype.getRangeFilterController = function() {
            var onEnter = angular.noop;
            var onEscape = angular.noop;
            var rangeFilterController = new RangeFilterController(
            this.filterModel,
            this.isReadOnly,
            onEnter,
            onEscape,
            onEnter,
            onEscape
        );

            return rangeFilterController;
        };

        FilterController.prototype.getDateFilterController = function() {
            var onEnter = angular.noop;
            var onEscape = angular.noop;
            var dateFilterController = new DateFilterController(
            this.filterModel,
            this.isReadOnly,
            onEnter,
            onEscape,
            onEnter,
            onEscape
        );

            return dateFilterController;
        };

        FilterController.prototype.getAttributeFilterController = function() {
            var attributeFilterComponent =
            new AttributeFilterComponent(this.filterModel, this.isReadOnly);
            return attributeFilterComponent;
        };

        FilterController.prototype.getQueryTransformationOnDone = function() {
            var filterType = getFilterType(this.filterModel);
            var queryTransformations;
            if (filterType === filterTypes.RangeFilter) {
                queryTransformations = this.rangeFilterController.getRequiredQueryTransformations();
                return $q.when(queryTransformations);
            } else if(filterType === filterTypes.DateFilter) {
                queryTransformations = this.dateFilterController.getRequiredQueryTransformations();
                return $q.when(queryTransformations);
            } else {
                return this.attributeFilterComponent.getRequiredQueryTransformations();
            }
        };

        FilterController.prototype.getFilterType = function () {
            return this.filterType;
        };

        FilterController.prototype.initialize = function() {
            if (!this.filterModel.isSupportedByUI()) {
                return;
            }
            var filterType = getFilterType(this.filterModel);
            if (filterType === filterTypes.RangeFilter) {
                this.rangeFilterController = this.getRangeFilterController();
            } else if (filterType === filterTypes.DateFilter) {
                this.dateFilterController = this.getDateFilterController();
            } else if (filterType === filterTypes.AttributeFilter) {
                this.attributeFilterComponent = this.getAttributeFilterController();
            } else {
                _logger.error('Unknown filter type');
                return;
            }
            this.filterType = filterType;
        };

        return FilterController;
    }]);
