/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster admin pinboard to show configuration event information.
 */

'use strict';

blink.app.directive('eventSummaryViz', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/event-summary-viz/event-summary-viz.html',
        controller: 'EventSummaryVizController'
    };

}]);

blink.app.controller('EventSummaryVizController', ['$scope',
    'blinkConstants',
    'strings',
    function ($scope,
    blinkConstants, strings) {

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.EVENT_TITLE);
        }

        init();
    }]);
