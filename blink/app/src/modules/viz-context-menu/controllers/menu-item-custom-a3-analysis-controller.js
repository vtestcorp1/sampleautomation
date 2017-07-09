/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for the a3 analysis operation.
 */

'use strict';

blink.app.controller('MenuItemCustomA3AnalysisController', ['$scope',
    'A3DialogPopupComponent',
    'a3RequestGenerator',
    'vizContextMenuUtil',
    'strings',
    function ($scope,
              A3DialogPopupComponent,
              a3RequestGenerator,
              vizContextMenuUtil,
              strings) {
        $scope.strings = strings;

        $scope.launchCustomAnalysis = function () {
            var contextMenuData = $scope.getData();
            var vizColumns = [];
            var selectedData = [];

            // NOTE: Parsing of data is done here as table selection is lost
            // when the new popup is launched.
            vizContextMenuUtil.parseVizDataForA3(
                contextMenuData,
                vizColumns,
                selectedData
            );
            var a3Request = a3RequestGenerator.getA3DataAnalysisRequest(
                contextMenuData.vizModel,
                vizColumns,
                selectedData,
                void 0
            );
            var a3p = new A3DialogPopupComponent(a3Request, contextMenuData.sageClient);
            $scope.close(vizContextMenuUtil.VizContextMenuOptionType.CUSTOM_A3_ANALYSIS);
            a3p.show();
        };
    }]);
