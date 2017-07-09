/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in alerts detail pinboard to show notifications information.
 */

'use strict';

blink.app.directive('alertDetailNotificationsViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl:
            'src/modules/clusterstatus/vizs/alert-detail-notifications-viz/alert-detail-notifications-viz.html',
        controller: 'AlertDetailNotificationsViz'
    };
}]);
