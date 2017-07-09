/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating cluster logs on cluster detail page.
 */

'use strict';

blink.app.factory('ClusterDetailSnapshotVizModel', ['blinkConstants',
    'strings',
    'ClusterDetailSnapshotModel',
    'dateUtil',
    'Logger',
    'TableVizModel',
    'util',
    function (blinkConstants,
    strings,
    ClusterDetailSnapshotModel,
    dateUtil,
    Logger,
    TableVizModel,
    util) {

        var logger = Logger.create('cluster-detail-snapshot-viz-model');

        function ClusterDetailSnapshotVizModel(params) {
            ClusterDetailSnapshotVizModel.__super.call(this, params);
            this.snapshots = [];
        }
        util.inherits(ClusterDetailSnapshotVizModel, TableVizModel);

        // Data will be loaded when this function gets called.
        ClusterDetailSnapshotVizModel.prototype.updateData = function(data) {
            this.snapshots = this.generateData(data, 'snapshot', ClusterDetailSnapshotModel);
            this.snapshots.reverse();
            this.periodicSnapshots = this.generateData(
                data, 'periodic_snapshot', ClusterDetailSnapshotModel);
            this.periodicSnapshots.reverse();
            this.snapshots = this.snapshots.concat(this.periodicSnapshots);
        };

        return ClusterDetailSnapshotVizModel;
    }]);
