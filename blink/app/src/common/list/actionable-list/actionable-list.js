/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview An actionable list directive
 */

'use strict';



blink.app.controller('ActionableListController', ['$scope',
    'safeApply',
    'sessionService',
    'util',
    function($scope,
         safeApply,
         sessionService,
         util) {
        var searchDebouncingInMS = sessionService.getListSearchDebouncingInMS();
        if (!searchDebouncingInMS || searchDebouncingInMS < 0) {
            searchDebouncingInMS = 500;
        }

        $scope.isActionItemDisabled = function(actionItem) {
            var selectedItems = $scope.listModel.getSelectedItems();
            if (actionItem.isEnabled) {
                return !actionItem.isEnabled(selectedItems);
            }
            return false;
        };

        $scope.onActionItemClick = function(actionItem) {
            if ($scope.isActionItemDisabled(actionItem)) {
                return;
            }

            var selectedItems = $scope.listModel.getSelectedItems();
            actionItem.onClick(selectedItems);
        };

    // if internal datas has changed, we must update the
    // filtered datas of the list model
        $scope.$watchCollection('listModel.data', function() {
            refreshListModel($scope.listModel.searchText);
        });

        function reloadListModel(newFilterVal, oldFilterVal) {
            if (newFilterVal === oldFilterVal) {
                return;
            }
            if (!!$scope.listModel) {
                $scope.listModel.onRefresh();
            }
        }

        function refreshListModel(newFilterVal, oldFilterVal) {
            if (newFilterVal === oldFilterVal) {
                return;
            }
            if (!!$scope.listModel) {
                $scope.listModel.filterData(newFilterVal);
            }

            if (!$scope.listModel.isPaginated()) {
                safeApply($scope, angular.noop);
            }
        }

        $scope.onEnterCallback = _.noop;


        /**
         * If this method returns true, then the onRowClick is called,
         * otherwise the click event is not propagated
         *
         * @param column
         * @param row
         */
        $scope.onColumnClicked = function(column, row, $event) {
            if (!column.onClick || column.onClick(row)) {
                $scope.onRowClick(row, $event);
            }
        };

        if ($scope.listModel.isPaginated()) {
            $scope.onEnterCallback = reloadListModel;
            $scope.$watch('listModel.searchText', util.debounce(reloadListModel, searchDebouncingInMS));
        } else {
            $scope.$watch('listModel.searchText', util.debounce(refreshListModel, 300));
        }
    }]);

blink.app.directive('actionableList', ['Logger', function (Logger) {
    var _logger = Logger.create('actionable-list-ui');

    return {
        restrict: 'E',
        scope: {
            listModel: '=',
            actionItems: '=',
            onRowClick: '=',
            swapHeaderItems: '=',
            onRenderComplete: '='
        },
        replace: true,
        controller: 'ActionableListController',
        templateUrl: 'src/common/list/actionable-list/actionable-list.html'
    };
}]);
