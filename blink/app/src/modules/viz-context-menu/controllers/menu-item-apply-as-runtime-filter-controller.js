/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh
 *
 * @fileoverview Applies as runtime filter.
 */

'use strict';

blink.app.controller('MenuItemApplyAsRuntimeFilterController', [
    '$scope',
    'strings',
    'RuntimeFilterUtil',
    'blinkConstants',
    'navService',
    function ($scope,
              strings,
              RuntimeFilterUtil,
              blinkConstants,
              navService) {
        $scope.strings = strings;
        $scope.applyAsRuntimeFilter = function() {
            // from contextMenuData we get the columnValuePairs which contains the selected row data
            // that will be used to build a runtime filter.
            var filters = RuntimeFilterUtil.getApplyAsFilters(this.contextMenuData);
            var type = (this.contextMenuData.vizModel.isPinboardViz()) ?
                blinkConstants.PINBOARD_TYPE
                : blinkConstants.ANSWER_TYPE;
            navService.navigateTo(
                type,
                this.contextMenuData.documentModel.getId(),
                filters);
            this.close();
        }
    }
]);
