/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *         Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for show underlying data context menu.
 */

'use strict';

blink.app.controller('MenuItemLeafDataController', ['$scope',
    'blinkConstants',
    'strings',
    'vizContextMenuUtil',
    'showUnderlyingDataService',
    function ($scope,
          blinkConstants,
          strings,
          vizContextMenuUtil,
          showUnderlyingDataService) {
        $scope.strings = strings;
        $scope.launchLeafLevelData = function () {
            var contextMenuData = $scope.contextMenuData;

            if (contextMenuData.type == strings.DRILL_TYPE_VIZ_LEVEL) {
                showUnderlyingDataService.launchVizLevelUnderlyingData(
                contextMenuData.vizModel,
                contextMenuData.sageClient
            );
            } else {
                showUnderlyingDataService.launchPointUnderlyingData(contextMenuData);
            }

            $scope.close(vizContextMenuUtil.VizContextMenuOptionType.LEAF_LEVEL);
        };
    }]);
