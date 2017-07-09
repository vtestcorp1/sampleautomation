/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating cluster status summary.
 */

'use strict';

blink.app.factory('ClusterSummaryVizModel', ['blinkConstants',
    'strings',
    'dateUtil',
    'GenericVizModel',
    'Logger',
    'jsonConstants',
    'util',
    function (blinkConstants,
    strings,
    dateUtil,
    GenericVizModel,
    Logger,
    jsonConstants,
    util) {

        var logger = Logger.create('cluster-summary-viz-model');

        function ClusterSummaryVizModel(params) {
            ClusterSummaryVizModel.__super.call(this, params);
            this.clusterName = '';
            this.release = '';
            this.numNodes = 0;
            this.lastSnapshotTime = 0;
        }
        util.inherits(ClusterSummaryVizModel, GenericVizModel);

        // Data will be loaded when this function gets called.
        ClusterSummaryVizModel.prototype.updateData = function(data) {
            data = angular.extend(data[0], data[1]);
            this.clusterName = data[jsonConstants.adminUI.CLUSTER_NAME];
            if (Object.has(data, jsonConstants.adminUI.RELEASE)) {
                this.release = data[jsonConstants.adminUI.RELEASE];
            }
            this.numNodes = data[jsonConstants.adminUI.NODE_INFO].length;
            if (data.hasOwnProperty('snapshot') && data.snapshot.length > 0) {
                this.lastSnapshotTime = data.snapshot[data.snapshot.length - 1][jsonConstants.adminUI.LAST_SNAPSHOT_TIME];
            }
            if (data.hasOwnProperty('periodic_snapshot') && data.periodic_snapshot.length > 0) {
                this.lastPeriodicSnapshotTime =
                    data.periodic_snapshot[data.periodic_snapshot.length - 1][jsonConstants.adminUI.LAST_SNAPSHOT_TIME];
            }
            if (this.lastPeriodicSnapshotTime > this.lastSnapshotTime) {
                this.lastSnapshotTime = this.lastPeriodicSnapshotTime;
            }
        };

        ClusterSummaryVizModel.prototype.getClusterName = function() {
            return this.clusterName;
        };

        ClusterSummaryVizModel.prototype.getRelease = function() {
            if (this.release !== '') {
                return this.release;
            } else {
                return strings.adminUI.messages.NOT_AVAILABLE_MESSAGE;
            }
        };

        ClusterSummaryVizModel.prototype.getNumNodes = function() {
            return this.numNodes;
        };

        ClusterSummaryVizModel.prototype.getLastSnapshotTime = function () {
            if (this.lastSnapshotTime > 0) {
                return dateUtil.formatDate(this.lastSnapshotTime * 1000, strings.adminUI.DEFAULT_TIME_FORMAT);
            } else {
                return strings.adminUI.messages.NOT_AVAILABLE_MESSAGE;
            }
        };

        return ClusterSummaryVizModel;
    }]);
