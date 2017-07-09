/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster detail pinboard to show logs.
 */

'use strict';

blink.app.directive('clusterDetailLogViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/cluster-detail-log-viz/cluster-detail-log-viz.html',
        controller: 'ClusterDetailLogViz'
    };
}]);
