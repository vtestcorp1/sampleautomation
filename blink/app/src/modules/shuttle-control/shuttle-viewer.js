/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Pradeep Dorairaj (pradeep.dorairaj@thoughtspot.com)
 *
 * @fileoverview Directive for shuttle view
 */

'use strict';

blink.app.directive("shuttleViewer", [function() {

    return {
        restrict: 'E',
        templateUrl: 'src/modules/shuttle-control/shuttle-viewer.html',
        controller: 'ShuttleViewerController',
        scope: {
            shuttleModel: '=',
            getSubItems: '=',
            disabledTip: '='
        }
    };

}]);

blink.app.controller("ShuttleViewerController", ['$scope',
    'itemViewerService',
    'util',
    function($scope,
         itemViewerService,
         util) {

        function nameComparator(item1, item2) {
            return item1.name.localeCompare(item2.name);
        }

        $scope.itemSelectorConfig = {
            selectionAllowed: true
        };

        $scope.moveRight = function() {
            var itemsToMove = util.findAndRemoveAll(
            $scope.shuttleModel.availableItems,
            function (item) {
                return !itemViewerService.isItemUnchecked(item);
            }
        );

            $scope.shuttleModel.selectedItems = util.mergeSortedArrays(
            $scope.shuttleModel.selectedItems,
            itemsToMove,
            nameComparator);
        };

        $scope.moveAllRight = function() {
            $scope.shuttleModel.selectedItems =
            util.mergeSortedArrays($scope.shuttleModel.selectedItems,
                $scope.shuttleModel.availableItems, nameComparator);
            $scope.shuttleModel.availableItems = [];
        };

        $scope.moveLeft = function() {
            var itemsToMove = util.findAndRemoveAll(
            $scope.shuttleModel.selectedItems,
            function (item) {
                return !itemViewerService.isItemUnchecked(item);
            }
        );

            $scope.shuttleModel.availableItems =
            util.mergeSortedArrays($scope.shuttleModel.availableItems, itemsToMove, nameComparator);
        };

        $scope.moveAllLeft = function() {
            $scope.shuttleModel.availableItems =
            util.mergeSortedArrays($scope.shuttleModel.availableItems,
                $scope.shuttleModel.selectedItems, nameComparator);
            $scope.shuttleModel.selectedItems = [];
        };

        $scope.onEnterCallback = function() {
            $scope.shuttleModel.listSearch($scope.shuttleModel.searchText).then(
            function() {
                var selectedObjNameMap = $scope.shuttleModel.selectedItems.reduce(function(map, item) {
                    map[item.name] = 1;
                    return map;
                }, {});
                $scope.shuttleModel.availableItems =
                    $scope.shuttleModel.availableItems.filter(function(item) {
                        return selectedObjNameMap[item.name] != 1;
                    });
            }
        );
        };
    }]);
