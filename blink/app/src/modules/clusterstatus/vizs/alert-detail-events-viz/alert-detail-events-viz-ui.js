/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in alerts detail pinboard to show event information.
 */

'use strict';

blink.app.directive('alertDetailEventsViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/alert-detail-events-viz/alert-detail-events-viz.html',
        controller: 'AlertDetailEventsViz'
    };
}]);
