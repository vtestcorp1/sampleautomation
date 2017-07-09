/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating events on alert detail page.
 */

'use strict';

blink.app.factory('AlertDetailEventsVizModel', ['ClusterEventModel',
    'Logger',
    'TableVizModel',
    'util',
    function (ClusterEventModel,
    Logger,
    TableVizModel,
    util) {

        var logger = Logger.create('alert-detail-events-viz-model');

        function AlertDetailEventsVizModel(params) {
            AlertDetailEventsVizModel.__super.call(this, params);
            this.events = [];
        }
        util.inherits(AlertDetailEventsVizModel, TableVizModel);

    // Data will be loaded when this function gets called.
        AlertDetailEventsVizModel.prototype.updateData = function(data) {
            this.events = this.generateData(data, 'event', ClusterEventModel);
            this.events = this.events.filter(function (entry) {
                if ((entry.hasOwnProperty('type')) && (entry.type == 'CONFIG')) {
                    return true;
                } else {
                    return false;
                }
            });
        };

        AlertDetailEventsVizModel.prototype.getNumEvents = function() {
            return this.events.length;
        };

        AlertDetailEventsVizModel.prototype.getEvents = function() {
            return this.events;
        };

        return AlertDetailEventsVizModel;
    }]);
