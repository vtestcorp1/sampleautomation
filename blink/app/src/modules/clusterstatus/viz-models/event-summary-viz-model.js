/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating events summary.
 */

'use strict';

blink.app.factory('EventSummaryVizModel', ['ClusterEventModel',
    'GenericVizModel',
    'Logger',
    'util',
    function (ClusterEventModel,
          GenericVizModel,
          Logger,
          util) {

        var MAX_EVENTS_NUM = 5;

        var logger = Logger.create('event-summary-viz-model');

        function EventSummaryVizModel(params) {
            EventSummaryVizModel.__super.call(this, params);
            this.events = [];
        }
        util.inherits(EventSummaryVizModel, GenericVizModel);

    // Data will be loaded when this function gets called.
        EventSummaryVizModel.prototype.updateData = function(data) {
            if (Object.has(data, 'event')) {
                this.events = data.event.map(function(eventInfo) {
                    return new ClusterEventModel(eventInfo);
                });
                this.events = this.events.filter(function (event) {
                    return (event.type === 'CONFIG' && event.getEventCategory() !== '');
                });
            } else {
                this.events = [];
            }
        };

        EventSummaryVizModel.prototype.getNumEvents = function() {
            return this.events.length;
        };

        EventSummaryVizModel.prototype.getEvents = function() {
            return this.events;
        };

        EventSummaryVizModel.prototype.getRecentEvents = function () {
            return this.events.slice(0, MAX_EVENTS_NUM);
        };

        return EventSummaryVizModel;
    }]);
