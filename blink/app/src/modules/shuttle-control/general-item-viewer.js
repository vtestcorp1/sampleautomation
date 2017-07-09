/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Pradeep Dorairaj (pradeep.dorairaj@thoughtspot.com)
 *
 * @fileoverview Directive to visualize tables
 */

'use strict';

blink.app.directive("generalItemViewer", [function() {

    return {
        restrict: 'E',
        templateUrl: 'src/modules/shuttle-control/general-item-viewer.html',
        controller: 'GeneralItemViewerController',
        scope: {
            config: '=',
            items: '=',
            getSubItems: '=',
            disabledTip: '='
        }
    };
}]);

blink.app.controller("GeneralItemViewerController", ['$scope',
    'itemViewerService',
    function($scope,
         itemViewerService) {

        $scope.isItemUnchecked = itemViewerService.isItemUnchecked;
        $scope.isItemChecked = itemViewerService.isItemChecked;
        $scope.isItemPartiallyChecked = itemViewerService.isItemPartiallyChecked;

        $scope.isUpdating = function (item) {
            return !!item.isUpdating;
        };

        function setCheckedStateForSubItems(item) {
            var isItemChecked = itemViewerService.isItemChecked(item);
            item.subItems.forEach(function(subItem) {
                subItem.isChecked = !subItem.isDisabled && isItemChecked;
                if(subItem.isChecked) {
                    item.subItemSelectionCount++;
                }
            });
        }

        $scope.onItemExpanded = function (item) {
            if(!item.subItems.length) {
                item.isUpdating = true;
                $scope.getSubItems(item.name).
                then(function(subItems) {
                    item.subItemSelectionCount = 0;
                    item.subItems = subItems.map(function(subItem) {
                        var listSubItem = {
                            name: subItem.name,
                            isChecked: false,
                            isDisabled: subItem.isDisabled,
                            dataType: subItem.dataType
                        };
                        if(!!subItem.isChecked) {
                            $scope.toggleSubItemSelection(item, listSubItem);
                        }
                        return listSubItem;
                    });
                    item.isUpdating = false;
                    if(item.subItemSelectionCount === 0) {
                        setCheckedStateForSubItems(item);
                    }
                });
            }
        };

        $scope.toggleItemSelection = function (item) {
            itemViewerService.toggleSelectionState(item);
            if(!item.subItems.length) {
                return;
            }

            setCheckedStateForSubItems(item);
        };

        $scope.toggleSubItemSelection = function (item, subItem) {
            if(subItem.isDisabled) {
                return;
            }

            subItem.isChecked = !subItem.isChecked;

            item.subItemSelectionCount = (subItem.isChecked) ?
            item.subItemSelectionCount + 1 : item.subItemSelectionCount - 1;

            if(!item.subItemSelectionCount) {
                item.checkedState = itemViewerService.CheckedStates.unchecked;
            } else if (item.subItemSelectionCount === item.subItems.length) {
                item.checkedState = itemViewerService.CheckedStates.checked;
            } else {
                item.checkedState = itemViewerService.CheckedStates.partial;
            }
        };

        $scope.getTooltip = function (subItem) {
            return (!!subItem.isDisabled)
            ? $scope.disabledTip || ''
            : '';
        };

    }]);
