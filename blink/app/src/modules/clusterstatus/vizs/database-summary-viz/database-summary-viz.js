/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster admin pinboard to show falcon statistics information.
 */

'use strict';

blink.app.directive('databaseSummaryViz', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/database-summary-viz/database-summary-viz.html',
        controller: 'DatabaseSummaryVizController'
    };
}]);

blink.app.controller('DatabaseSummaryVizController', ['$scope',
    'blinkConstants',
    'strings',
    'util',
    function ($scope,
          blinkConstants,
          strings,
          util) {

        $scope.databaseSummaryViz = strings.adminUI.databaseSummaryViz;
        $scope.contentTitle = $scope.databaseSummaryViz.CONTENT_TITLES;
        $scope.viz.getModel().setTitle($scope.databaseSummaryViz.DATABASE_TITLE);

        function getToolTip(rawValue, formatedValue) {
            if (rawValue == formatedValue) {
                return;
            }
            return util.formatDataLabel(rawValue);
        }
        $scope.tablesLoaded = $scope.viz.getModel().getNumReadyTables() + $scope.viz.getModel().getNumStaleTables();
        $scope.numRows = util.formatBusinessNumber($scope.viz.getModel().getNumRows());
        $scope.numRowsTooltip =  getToolTip($scope.viz.getModel().getNumRows(), $scope.numRows);
    }]);
