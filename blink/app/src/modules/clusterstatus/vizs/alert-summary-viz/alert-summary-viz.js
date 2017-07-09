/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster admin pinboard to show alert information.
 */

'use strict';

blink.app.directive('alertSummaryViz', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/alert-summary-viz/alert-summary-viz.html',
        controller: 'AlertSummaryVizController'
    };

}]);

blink.app.controller('AlertSummaryVizController', ['$scope',
    'blinkConstants',
    'strings',
    function ($scope,
    blinkConstants, strings) {

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.ALERT_TITLE);
        }

        init();
    }]);
