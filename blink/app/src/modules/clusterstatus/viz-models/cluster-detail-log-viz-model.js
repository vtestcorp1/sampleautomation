/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating cluster logs on cluster detail page.
 */

'use strict';

blink.app.factory('ClusterDetailLogVizModel', ['blinkConstants',
    'strings',
    'ClusterDetailLogModel',
    'dateUtil',
    'Logger',
    'TableVizModel',
    'util',
    function (blinkConstants,
          strings,
    ClusterDetailLogModel,
    dateUtil,
    Logger,
    TableVizModel,
    util) {

        var logger = Logger.create('cluster-detail-log-viz-model');

        function ClusterDetailLogVizModel(params) {
            ClusterDetailLogVizModel.__super.call(this, params);
            this.events = [];
        }
        util.inherits(ClusterDetailLogVizModel, TableVizModel);

    // Data will be loaded when this function gets called.
        ClusterDetailLogVizModel.prototype.updateData = function(data) {
            this.events = this.generateData(data.log, 'event', ClusterDetailLogModel);
            if (data.log.hasOwnProperty('install')) {
                this.events.unshift(new ClusterDetailLogModel(data.log.install));
            }
        };
        return ClusterDetailLogVizModel;
    }]);
