/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Controller for list directive
 */

'use strict';

blink.app.controller('ListController', ['$scope', 'events', 'CheckboxComponent', 'checkbox',
    function($scope, events, CheckboxComponent, checkbox) {
        $scope.sortColIdx = -1;
        $scope.sortReverse = false;

    /**
     * Called when the user clicks on the checkbox for a specific item
     */
        $scope.toggleSelectionSpecificItem = function ($event, item) {
            if ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            }
            item._selected = !item._selected;
        };

        $scope.setSortingColumn = function(column, idx, reverse) {
        // sortBy Could be a function or an expression or nothing
            if ($scope.model.isPaginated()) {
                if (!!column.sortKey) {
                    $scope.sortColIdx = idx;
                    $scope.model.setSortKey(column.sortKey);
                }
            } else {
                if (!!column.sortBy) {
                    $scope.sortBy = column.sortBy;
                    $scope.sortColIdx = idx;
                    $scope.sortReverse = (angular.isDefined(reverse)) ? reverse : !$scope.sortReverse;
                }
            }
        };

    /**
     * Called when the user clicks on the checkbox for all items
     */
        $scope.toggleSelectionAllItems = function($event) {
            if ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            var selectionState = $scope.model.noItemsSelected();

        // if the list has not been scrolled, getFilteredData() returns only the
        // displayed items, in this case, we want to have all the items
            $scope.model.getFilteredData(true).forEach(function (item) {
                item._selected = selectionState;
            });
        };

        $scope.selectAllCheckbox = new CheckboxComponent(
            null,
            function () {
                if ($scope.model.allItemsSelected()) {
                    return checkbox.CheckboxState.CHECKED;
                }
                if (!$scope.model.allItemsSelected() && !$scope.model.noItemsSelected()) {
                    return checkbox.CheckboxState.PARTIAL;
                }
                return checkbox.CheckboxState.UNCHECKED;
            }
        ).setTriStateMode(true).setOnClick(function ($event) {
            $scope.toggleSelectionAllItems($event);
        });

        // Map from item id to it's checkbox ctrl.
        var itemCheckboxCtrlMap = {};
        var uniqueId = 0;
        $scope.getItemCheckboxCtrl = function (item) {
            if (!item.checkboxId) {
                item.checkboxId = ++uniqueId;
            }
            if (!itemCheckboxCtrlMap[item.checkboxId]) {
                itemCheckboxCtrlMap[item.checkboxId] = new CheckboxComponent(
                    null /* no label */,
                    function() {
                        return item._selected;
                    }).setOnClick(function($event) {
                        $scope.toggleSelectionSpecificItem(null, item);
                    }
                );
            }
            return itemCheckboxCtrlMap[item.checkboxId];
        };
    }]);

blink.app.directive('blinkList', ['Logger', function (Logger) {

    var _logger = Logger.create('list-ui');

    return {
        restrict: 'E',
        scope: {
            model: '=',
            onColumnClick: '=',
            onRenderComplete: '='
        },
        replace: true,
        controller: 'ListController',
        templateUrl: 'src/common/list/list/list.html'
    };
}]);
