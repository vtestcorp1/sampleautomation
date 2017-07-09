/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Directive for table viz column menu
 */

'use strict';

blink.app.directive('columnMenu', [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            sageClient: '=',
            columnModel: '=',
            tableModel: '=',
            isEditable: '=',
            onTableRedrawRequired: '&?'
        },
        controller: 'ColumnMenuController',
        templateUrl: 'src/modules/viz-layout/viz/table/column-menu/body/column-menu-body.html'
    };
}]);

blink.app.controller('ColumnMenuController', ['$scope',
    'columnMenuUtil',
    'events',
    'FilterControllerV2',
    'filterUtil',
    'ColumnMetricsComponent',
    'ActionMenuComponent',
    'filterDialog',
    'conditionalFormattingDialog',
    function($scope,
             columnMenuUtil,
             events,
             FilterController,
             filterUtil,
             ColumnMetricsComponent,
             ActionMenuComponent,
             filterDialog,
             conditionalFormattingDialog) {
        $scope.isFilterModelAvailable = false;
        $scope.onTableRedrawRequired = $scope.onTableRedrawRequired || angular.noop;
        $scope.columnActionMenu = new ActionMenuComponent([
            {
                label: 'Filters',
                id: 'filters',
                showWhen: function() {
                    return $scope.isEditable ||
                        columnMenuUtil.hasFiltersForColumn($scope.tableModel, $scope.columnModel);
                },
                onClick: onFilterActionClick
            },
            {
                label: 'Conditional Formatting',
                id: 'metrics',
                showWhen: function() {
                    return ($scope.isEditable && $scope.columnModel.isEffectivelyNumeric())
                        || columnMenuUtil.hasMetricsForColumn($scope.tableModel, $scope.columnModel);
                },
                onClick: onConditionalFormattingClick
            }
        ]);

        function onFilterActionClick($event) {
            var getMatchingModelPromise = filterUtil.getMatchingFilterModel(
                $scope.columnModel,
                $scope.tableModel,
                $scope.sageClient
            );
            getMatchingModelPromise.then(function(filterModel) {
                $scope.isFilterModelAvailable = true;
                var filterController = new FilterController(
                    filterModel,
                    !$scope.isEditable
                );
                $scope.$emit(events.CLEAR_AND_HIDE_POPUP_MENU);
                filterDialog.show(filterController).then(function(queryTransformations) {
                    $scope.sageClient.transformTable(queryTransformations);
                });
            });
        }

        function onConditionalFormattingClick($event) {
            $scope.$emit(events.CLEAR_AND_HIDE_POPUP_MENU);
            var columnMetricsComponent = new ColumnMetricsComponent(
                $scope.columnModel.getMetricsDefinition(),
                $scope.isEditable
            );
            conditionalFormattingDialog.show(columnMetricsComponent).then(function(result) {
                var newDefinition = result.newDefinition;
                var hasChanges = result.hasChanges;
                if (hasChanges) {
                    $scope.columnModel.setMetricsDefinition(newDefinition);
                    $scope.onTableRedrawRequired();
                }
            });
        }
    }]);
