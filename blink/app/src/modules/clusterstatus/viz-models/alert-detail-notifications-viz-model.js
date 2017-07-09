/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating notifications on alert detail page.
 */

'use strict';

blink.app.factory('AlertDetailNotificationsVizModel', ['ClusterEventModel',
    'Logger',
    'TableVizModel',
    'util',
    function (ClusterEventModel,
          Logger,
          TableVizModel,
          util) {

        var logger = Logger.create('alert-detail-notifications-viz-model');

        function AlertDetailNotificationsVizModel(params) {
            AlertDetailNotificationsVizModel.__super.call(this, params);
            this.events = [];
        }
        util.inherits(AlertDetailNotificationsVizModel, TableVizModel);

    // Data will be loaded when this function gets called.
        AlertDetailNotificationsVizModel.prototype.updateData = function(data) {
            this.events = this.generateData(data, 'event', ClusterEventModel);
            this.events = this.events.filter(function (entry) {
                if ((entry.hasOwnProperty('type')) && (entry.type == 'NOTIFICATION')) {
                    return true;
                } else {
                    return false;
                }
            });
        };

        AlertDetailNotificationsVizModel.prototype.getNumEvents = function() {
            return this.events.length;
        };

        AlertDetailNotificationsVizModel.prototype.getEvents = function() {
            return this.events;
        };

        return AlertDetailNotificationsVizModel;
    }]);
