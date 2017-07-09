/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in database details pinboard to show information.
 */

'use strict';

blink.app.directive('databaseDetailViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/database-detail-viz/database-detail-viz.html',
        controller: 'DatabaseDetailViz'
    };
}]);
