/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview A directive to give some basic column controls
 */

'use strict';

blink.app.directive('columnControl', [ function() {
    return {
        restrict: 'E',
        scope: {
            sageClient: '=',
            vizModel: '=',
            vizColumn: '=',
            closeColumnControl: '&?',
            onChartRedrawNeeded: '&?'
        },
        controller: 'ColumnControlController',
        templateUrl: 'src/modules/viz-layout/viz/column-control/column-control.html'
    };
}]);

blink.app.controller('ColumnControlController', [ '$rootScope',
    '$scope',
    'dateUtil',
    'columnMenuUtil',
    'events',
    'FilterControllerV2',
    'filterUtil',
    'util',
    'vizColTransformationService',
    'ColumnMetricsComponent',
    'conditionalFormattingDialog',
    'filterDialog',
    function($rootScope,
         $scope,
         dateUtil,
         columnMenuUtil,
         events,
         FilterController,
         filterUtil,
         util,
         vizColTransformationService,
         ColumnMetricsComponent,
         conditionalFormattingDialog,
         filterDialog) {

        $scope.isFilterModelAvailable = false;

        var showMetrics = false;

        $scope.timeBuckets = dateUtil.getSupportedTimeBuckets(
            $scope.vizColumn.getEffectiveDataType()
        );
        $scope.closeColumnControl = $scope.closeColumnControl || _.noop;
        $scope.onChartRedrawNeeded = $scope.onChartRedrawNeeded || _.noop;

        $scope.timeBucketFormat = function(timeBucket){
            return dateUtil.formatTimeBucketLabel(timeBucket);
        };

        $scope.aggregates = util.aggregateTypeLabelsToType;
        var permission = $scope.vizModel.getContainingAnswerModel().getPermission();
        $scope.isEditable = !!permission ? !permission.isMissingUnderlyingAccess() : false;

        $scope.onAggregationClick = function(aggregation) {
            var aggregationTransform = vizColTransformationService.getAggregationTransform($scope.vizColumn, aggregation);
            $scope.sageClient.transformTable(aggregationTransform);
            $scope.closeColumnControl();
        };

        $scope.onTimeBucketingClick = function(bucketing) {
            var bucketingTransform = vizColTransformationService.getDateBucketingTransform($scope.vizColumn, bucketing);
            $scope.sageClient.transformTable(bucketingTransform);
            $scope.closeColumnControl();
        };

        $scope.onSortClick = function() {
            var colSortPair = {
                id: $scope.vizColumn.getSageOutputColumnId(),
                isAscending: $scope.vizColumn.getNewSortingOrder()
            };
            var sortingTransform = vizColTransformationService
                .getSortingTransform($scope.vizModel, [colSortPair]);
            $scope.sageClient.transformTable(sortingTransform);
            $scope.closeColumnControl();
        };

        $scope.onFilterClick = function($evt) {
            $scope.closeColumnControl();
            var getMatchingModelPromise = filterUtil.getMatchingFilterModel(
                $scope.vizColumn,
                $scope.vizModel,
                $scope.sageClient
            );
            getMatchingModelPromise.then(function(filterModel) {
                $scope.isFilterModelAvailable = true;
                var filterController = new FilterController(
                    filterModel,
                    !$scope.isEditable
                );
                filterDialog.show(filterController).then(function(queryTransformations) {
                    $scope.sageClient.transformTable(queryTransformations);
                });
            });
        };

        $scope.onMetricsClick = function () {
            $scope.closeColumnControl();
            var columnMetricsController = new ColumnMetricsComponent(
                $scope.vizColumn.getMetricsDefinition(),
                $scope.isEditable
            );
            conditionalFormattingDialog.show(columnMetricsController).then(function (result) {
                var newDefinition = result.newDefinition;
                var hasChanges = result.hasChanges;
                if (hasChanges) {
                    $scope.vizColumn.setMetricsDefinition(newDefinition);
                    $scope.onChartRedrawNeeded();
                }
            });
        };

        $scope.shouldShowMetricsOption = function () {
            return ($scope.isEditable && $scope.vizColumn.isEffectivelyNumeric())
            || columnMenuUtil.hasMetricsForColumn($scope.vizModel, $scope.vizColumn);
        };

        $scope.shouldShowFiltersOption = function() {
            return $scope.isEditable || columnMenuUtil.hasFiltersForColumn($scope.vizModel, $scope.vizColumn);
        };

        $scope.shouldShowMetricsUI = function () {
            return showMetrics;
        };

        $scope.shouldShowAggregates = function () {
            return $scope.vizColumn.supportsAggregationChange() && $scope.isEditable;
        };

        $scope.shouldShowTimeBuckets = function () {
            return $scope.vizColumn.supportsDateBucketizationChange() && $scope.isEditable;
        };

        $scope.$on(events.CLEAR_AND_HIDE_POPUP_MENU, function() {
            $scope.closeColumnControl();
        });
    }]);
