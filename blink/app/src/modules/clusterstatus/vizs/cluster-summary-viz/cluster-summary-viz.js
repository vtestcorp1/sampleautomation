/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster admin pinboard to show cluster statistics information.
 */

'use strict';

blink.app.directive('clusterSummaryViz', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/cluster-summary-viz/cluster-summary-viz.html',
        controller: 'ClusterSummaryVizController'
    };

}]);

blink.app.controller('ClusterSummaryVizController', ['$scope',
    'blinkConstants',
    'strings',
    function ($scope,
    blinkConstants, strings) {

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.clusterSummaryViz.CLUSTER_TITLE);
        }

        $scope.clusterName = strings.adminUI.clusterSummaryViz.CLUSTER_NAME;
        $scope.release = strings.adminUI.clusterSummaryViz.RELEASE;
        $scope.numberOfNodes = strings.adminUI.clusterSummaryViz.NUMBER_OF_NODES;
        $scope.lastSnapshotTime = strings.adminUI.clusterSummaryViz.LAST_SNAPSHOT_TIME;

        init();
    }]);
