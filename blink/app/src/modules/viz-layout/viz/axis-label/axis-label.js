/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Directive for the chart axis label
 */

'use strict';

blink.app.controller('AxisLabelController', ['$scope',
    'util',
    'vizColTransformationService',
    'events',
    function($scope,
         util,
         vizColTransformationService,
         events) {
        $scope.columnControlTemplateUrl = 'column-control.html';
        $scope.isColumnControlOpened = false;

        $scope.areAxisOperationsAllowed = function() {

            var answerSheet = $scope.vizModel.getContainingAnswerModel().getCurrentAnswerSheet();
            var hasAvailableInteractions =
            ($scope.vizColumn.isEffectivelyNumeric() && $scope.isEditable) ||
            ($scope.isEditable || answerSheet.hasFilterForColumn($scope.vizColumn)) ||
            ($scope.vizColumn.supportsAggregationChange() && $scope.isEditable) ||
            ($scope.vizColumn.supportsDateBucketizationChange() && $scope.isEditable);

            return hasAvailableInteractions;
        };


        $scope.isSortedByColumn = function() {
            return $scope.vizColumn.isSortKey() && $scope.isEditable;
        };

        $scope.onSortClick = function() {
            var colSortPair = {
                id: $scope.vizColumn.getSageOutputColumnId(),
                isAscending: $scope.vizColumn.getNewSortingOrder()
            };

            var sortingTransform = vizColTransformationService
                .getSortingTransform($scope.vizModel, [colSortPair]);
            $scope.sageClient.transformTable(sortingTransform);
        };

        $scope.getDirectionClass = function() {
            if ($scope.vizColumn.isSortKey()) {
                if ($scope.vizColumn.isAscendingSort()) {
                    return $scope.isAxisVertical ? 'right' : 'up';
                } else {
                    return $scope.isAxisVertical ? 'left' : 'down';
                }
            }
        };

        $scope.openColumnControls = function() {
            if (!$scope.areAxisOperationsAllowed()) {
                return;
            }

            $scope.isColumnControlOpened = true;
        };

        $scope.closeColumnControls = function() {
            $scope.isColumnControlOpened = false;
        };

        $scope.onChartRedrawNeeded = function() {
            $scope.$emit(events.CHART_NEEDS_REDRAW_U);
        };

        var relativePositionToPopoverDirection = {};
        relativePositionToPopoverDirection[util.relativePositions.UP] = util.popoverPositions.BOTTOM;
        relativePositionToPopoverDirection[util.relativePositions.DOWN] = util.popoverPositions.TOP;
        relativePositionToPopoverDirection[util.relativePositions.LEFT] = util.popoverPositions.RIGHT;
        relativePositionToPopoverDirection[util.relativePositions.RIGHT] = util.popoverPositions.LEFT;

        $scope.getColumnControlPopoverDirection = function () {
            return relativePositionToPopoverDirection[$scope.axisRelativePosition];
        };

        var permission = $scope.vizModel.getContainingAnswerModel().getPermission();
        $scope.isEditable = !!permission ? !permission.isMissingUnderlyingAccess() : false;
    }]);

blink.app.directive('axisLabel', [ function() {
    return {
        restrict: 'E',
        scope: {
            sageClient: '=',
            vizModel: '=',
            vizColumn: '=',
            isAxisVertical: '=',
            axisRelativePosition: '='
        },
        templateUrl: 'src/modules/viz-layout/viz/axis-label/axis-label.html',
        controller: 'AxisLabelController'
    };
}]);
