/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating cluster detail information.
 */

'use strict';

blink.app.factory('ClusterDetailInfoVizModel', ['blinkConstants',
    'strings',
    'ClusterDetailInfoModel',
    'dateUtil',
    'Logger',
    'TableVizModel',
    'util',
    function (blinkConstants,
    strings,
    ClusterDetailInfoModel,
    dateUtil,
    Logger,
    TableVizModel,
    util) {

        var logger = Logger.create('cluster-detail-info-viz-model');

        function ClusterDetailInfoVizModel(params) {
            ClusterDetailInfoVizModel.__super.call(this, params);
            this.detail = [];
        }
        util.inherits(ClusterDetailInfoVizModel, TableVizModel);

        ClusterDetailInfoVizModel.prototype.pushClusterDetail = function (key, value) {
            var clusterDetailInfoModel = new ClusterDetailInfoModel(key, value);
            this.detail.push(clusterDetailInfoModel);
        };

        // Data will be loaded when this function gets called.
        /* eslint camelcase: 1 */
        ClusterDetailInfoVizModel.prototype.updateData = function(data) {

            this.pushClusterDetail(strings.adminUI.captions.CLUSTER_NAME, data.cluster_name);

            this.pushClusterDetail(strings.adminUI.captions.CLUSTER_ID, data.cluster_id);

            var release_name;
            if (Object.has(data, 'release_name')) {
                release_name = data.release_name;
            } else {
                release_name = strings.adminUI.messages.NOT_AVAILABLE_MESSAGE;
            }
            this.pushClusterDetail(strings.adminUI.captions.RELEASE, release_name);

            var lastUpdateTime;
            if (Object.has(data, 'last_update_time_since_epoch') &&
            (data.last_update_time_since_epoch > 0)) {
                lastUpdateTime = dateUtil.formatDate(
                data.last_update_time_since_epoch * 1000,
                strings.adminUI.DEFAULT_TIME_FORMAT
            );
            } else {
                lastUpdateTime = strings.adminUI.messages.NOT_AVAILABLE_MESSAGE;
            }
            this.pushClusterDetail(strings.adminUI.captions.LAST_UPDATE_TIME, lastUpdateTime);

            var zookeeperNodes = data.config.zoo_server.map(function(zooServer) {
                return zooServer.host + ':' + zooServer.port;
            });

            this.pushClusterDetail(strings.adminUI.captions.ZOOKEEPER_SERVERS, zookeeperNodes.join(','));

            var hdfsNameNodes = data.config.hdfs.default_cluster.name_node.map(function(nameNodes) {
                return nameNodes.host + ':' + nameNodes.port;
            });
            this.pushClusterDetail(strings.adminUI.captions.HDFS_NAME_NODES, hdfsNameNodes);

            var clusterAlertEmail;
            if (data.hasOwnProperty('monitoring') && data.monitoring.hasOwnProperty('config')) {
                clusterAlertEmail = data.monitoring.config.cluster_alert_email;
            } else {
                clusterAlertEmail = strings.adminUI.messages.NOT_AVAILABLE_MESSAGE;
            }
            this.pushClusterDetail(strings.adminUI.captions.CLUSTER_ALERT_EMAIL, clusterAlertEmail);

            var periodicSnapshotMode = strings.adminUI.messages.PERIODIC_SNAPSHOT_DISABLED;
            if (data.hasOwnProperty('periodic_snapshot')) {
                var periodicSnapshotConfig = data.periodic_snapshot;
                if (periodicSnapshotConfig.hasOwnProperty('enabled')) {
                    if (periodicSnapshotConfig.enabled) {
                        periodicSnapshotMode = strings.adminUI.messages.PERIODIC_SNAPSHOT_ENABLED;
                    }
                }
            }
            this.pushClusterDetail(strings.adminUI.captions.PERIODIC_SNAPSHOT_MODE, periodicSnapshotMode);
        };

        return ClusterDetailInfoVizModel;
    }]);
