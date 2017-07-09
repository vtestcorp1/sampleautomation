/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating alerts summary.
 */

'use strict';

blink.app.factory('AlertSummaryVizModel', ['ClusterAlertModel',
    'GenericVizModel',
    'Logger',
    'util',
    function (ClusterAlertModel,
          GenericVizModel,
          Logger,
          util)
{
        var MAX_ALERTS_NUM = 5;

        var logger = Logger.create('alert-summary-viz-model');

        function AlertSummaryVizModel(params) {
            AlertSummaryVizModel.__super.call(this, params);
            this.alerts = [];
        }
        util.inherits(AlertSummaryVizModel, GenericVizModel);

    // Data will be loaded when this function gets called.
        AlertSummaryVizModel.prototype.updateData = function(data) {
            if (Object.has(data, 'alert')) {
                this.alerts = data.alert.map(function(alertInfo) {
                    return new ClusterAlertModel(alertInfo);
                });
                this.alerts = this.alerts.filter(function(alert) {
                    return (alert.isCritical() || alert.isWarning());
                });
            } else {
                this.alerts = [];
            }
        };

        AlertSummaryVizModel.prototype.getNumAlerts = function() {
            return this.alerts.length;
        };

        AlertSummaryVizModel.prototype.getAlerts = function() {
            return this.alerts;
        };

        AlertSummaryVizModel.prototype.getRecentAlerts = function () {
            return this.alerts.slice(0, MAX_ALERTS_NUM);
        };

        return AlertSummaryVizModel;
    }]);
