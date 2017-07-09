/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster detail pinboard to show snapshots.
 */

'use strict';

blink.app.directive('clusterDetailSnapshotViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/cluster-detail-snapshot-viz/cluster-detail-snapshot-viz.html',
        controller: 'ClusterDetailSnapshotViz'
    };
}]);
