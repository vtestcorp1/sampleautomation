/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for the a3 analysis context menu item.
 */

'use strict';

blink.app.controller('MenuItemA3AnalysisController', ['$scope',
    'autoAnalyzerService',
    'strings',
    'vizContextMenuUtil',
    'Logger',
    function ($scope,
              autoAnalyzerService,
              strings,
              vizContextMenuUtil,
              Logger) {
        $scope.strings = strings;

        $scope.triggerA3 = function () {
            var contextMenuData = $scope.getData();
            var vizModel = $scope.getData().vizModel;
            var vizColumns = [];
            var selectedData = [];

            vizContextMenuUtil.parseVizDataForA3(
                contextMenuData,
                vizColumns,
                selectedData
            );
            autoAnalyzerService.triggerDataAnalysis(
                vizModel,
                vizColumns,
                selectedData
            );
            $scope.close(vizContextMenuUtil.VizContextMenuOptionType.A3_ANALYSIS);
        };
    }]);
