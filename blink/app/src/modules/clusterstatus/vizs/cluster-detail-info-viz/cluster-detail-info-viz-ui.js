/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster detail pinboard to show information.
 */

'use strict';

blink.app.directive('clusterDetailInfoViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/cluster-detail-info-viz/cluster-detail-info-viz.html',
        controller: 'ClusterDetailInfoViz'
    };
}]);
