/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in alert details pinboard to show alert information.
 */

'use strict';

blink.app.directive('alertDetailAlertsViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/alert-detail-alerts-viz/alert-detail-alerts-viz.html',
        controller: 'AlertDetailAlertsViz'
    };
}]);
