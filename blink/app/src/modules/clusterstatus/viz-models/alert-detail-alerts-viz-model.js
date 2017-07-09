/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating alerts on alert detail page.
 */

'use strict';

blink.app.factory('AlertDetailAlertsVizModel', ['ClusterAlertModel',
    'Logger',
    'TableVizModel',
    'util',
    function (ClusterAlertModel,
    Logger,
    TableVizModel,
    util) {

        var logger = Logger.create('alert-detail-alerts-viz-model');

        function AlertDetailAlertsVizModel(params) {
            AlertDetailAlertsVizModel.__super.call(this, params);
            this.alerts = [];
        }
        util.inherits(AlertDetailAlertsVizModel, TableVizModel);

    // Data will be loaded when this function gets called.
        AlertDetailAlertsVizModel.prototype.updateData = function(data) {
            this.alerts = this.generateData(data, 'alert', ClusterAlertModel);
        };

        return AlertDetailAlertsVizModel;
    }]);
