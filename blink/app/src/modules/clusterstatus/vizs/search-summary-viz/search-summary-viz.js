/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster admin pinboard to show sage statistics information.
 */

'use strict';

blink.app.directive('searchSummaryViz', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/search-summary-viz/search-summary-viz.html',
        controller: 'SearchSummaryVizController'
    };

}]);

blink.app.controller('SearchSummaryVizController', ['$scope',
    'blinkConstants',
    'strings',
    'util',
    function ($scope,
    blinkConstants,
    strings,
    util) {

        $scope.hasFailure = function() {
            return $scope.viz.getModel().getFailTime() > 0;
        };
        $scope.searchSummaryViz = strings.adminUI.searchSummaryViz;
        $scope.contentTitle = $scope.searchSummaryViz.CONTENT_TITLES;
        $scope.viz.getModel().setTitle($scope.searchSummaryViz.SEARCH_TITLE);

        function getToolTip(rawValue, formatedValue) {
            if (rawValue == formatedValue) {
                return;
            }
            return util.formatDataLabel(rawValue);
        }
        $scope.numTokenIndexed = util.formatBusinessNumber($scope.viz.getModel().getNumTokens());
        $scope.tokenIndexedTooltip = getToolTip($scope.viz.getModel().getNumTokens(), $scope.numTokenIndexed);
        $scope.newTablesIndexedNum = $scope.viz.getModel().getNumBuildingAndNotServing();

        $scope.notSearchable = function() {
            if($scope.newTablesIndexedNum > 0){
                return true;
            }
            return false;
        };
    }]);
