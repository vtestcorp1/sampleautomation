/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating single alert.
 */

'use strict';

blink.app.factory('ClusterAlertModel', ['blinkConstants',
    'strings',
    'dateUtil',
    'jsonConstants',
    function (blinkConstants,
          strings,
    dateUtil,
    jsonConstants) {

        function ClusterAlertModel(data) {
        /* eslint camelcase: 1 */
            this.type = data.system_info.type;
            this.message = data.system_info.msg;
            this.time = data.at;
            this.title = data.id;
        }

        function isStatus(clusterAlertModel, value) {
            return clusterAlertModel.type === value;
        }

        ClusterAlertModel.prototype.isInfo = function() {
            return isStatus(this, jsonConstants.adminUI.INFO_ALERT);
        };

        ClusterAlertModel.prototype.isWarning = function() {
            return isStatus(this, jsonConstants.adminUI.WARNING_ALERT);
        };

        ClusterAlertModel.prototype.isCritical = function(alert) {
            return isStatus(this, jsonConstants.adminUI.CRITICAL_ALERT);
        };

        ClusterAlertModel.prototype.getHumanReadableTime = function() {
            return dateUtil.formatDate(
            this.time * 1000,
            strings.adminUI.DEFAULT_TIME_FORMAT
        );
        };

        ClusterAlertModel.prototype.getTimeAgoString = function() {
            return dateUtil.epochToTimeAgoString(this.time * 1000);
        };

        ClusterAlertModel.prototype.getAlertTitle = function() {
            return this.title;
        };

        ClusterAlertModel.prototype.getAlertMessage = function() {
            return this.message;
        };

        ClusterAlertModel.prototype.getDetailTableRow = function() {
            var data = {
                type: this.getAlertTitle(),
                message: this.getAlertMessage(),
                time: this.getHumanReadableTime()
            };
            return data;
        };

        return ClusterAlertModel;
    }]);
