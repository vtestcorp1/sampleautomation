/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview A service that post processes logs obtained from eventTracker
 * (e.g. anotates them with collected debug info)
 * */

'use strict';

blink.app.factory('PerformanceAnalyzer', [function () {

    var PerformanceAnalyzer = function (tracker, collector) {
        this.tracker = tracker;
        this.collector = collector;
    };

    var AnnotatedEvent = function (trackedEvent, services, collector) {
        // We don't want to modify original event and we don't want to maintain
        // link to it, so that garbage collector can pick up old events if
        // tracker log exceeds it's maximum size.  So, we just copy everything
        // we need to a new objects, which supposed to be short living
        // (unlinked right after usage)
        this.startTime = trackedEvent.getStartTime();
        this.endTime = trackedEvent.getEndTime();
        this.duration = trackedEvent.getDuration();
        this.meta = trackedEvent.meta;
        this.tag = trackedEvent.tag;
        this.guid = trackedEvent.guid;
        this.debugLogs = retrieveDebugLogs(this, services, collector);
    };

    /*
     * Should annotate current AnnotatedEvent object with debug logs
     * in [this.startTime, this.endTime] time frame. It's possible
     * to only include debug responses only from services you're
     * interested in.
     *
     * @param {Array} services
     */
    function retrieveDebugLogs(evt, services, collector) {
        return collector.retrieve(evt.startTime, evt.endTime, services);
    }

    /*
     * Retrieve list of AnnotatedEvent objects for a given time frame and
     * set of tags. Events will be annotated with debug logs from service
     * respoces that were captured during the lifetime of event. You can
     * limit deug info to a subset of supported services.
     *
     * @param {number} from
     * @param {number} to
     * @param {Array} tags
     * @param {Array} services
     *
     * @returns {Array}
     */
    PerformanceAnalyzer.prototype.getLog = function (from, to, tags, services) {
        var that = this;
        return this.tracker.getLog(from, to, tags).map(function (evt) {
            return new AnnotatedEvent(evt, services, that.collector);
        });
    };

    /**
     * Retrieves debug logs between @from and @to.
     * @param {number} from
     * @param {number} to
     * @returns {Array}
     */
    PerformanceAnalyzer.prototype.getDebugLog = function (from, to) {
        return this.collector.retrieve(from, to);
    };

    /*
     * For a given time frame it will return all AnnotatedEvent objects
     * filtered by tags and organized into a tree structure matching your @tags
     * parameter.  Ob the root level you will have all events with tag in
     * tags[0] and every object on level 0 will have .children property
     * pointing to the list of tags[1] events happened in the time frame of the
     * parent event.
     *
     * Sample call:
     *          analyzer.getGroupedLog(from, to, [['tag1'], ['tag2', 'tag3'], ['tag4']]
     * Sample return:
     *          [{
     *                  guid: '...',
     *                  tag: 'tag1',
     *                  ...
     *                  children: [{
     *                          guid: '...',
     *                          tag: 'tag2',
     *                          ...
     *                          children: [...]
     *                  }, {
     *                          guid: '...',
     *                          tag: 'tag3',
     *                          ...
     *                          children: [{
     *                                  guid: '...',
     *                                  tag: 'tag4',
     *                                  ...
     *                                  children: []
     *                          }]
     *                  }]
     *           }, {
     *                  guid: '...',
     *                  tag: 'tag1',
     *                  ...
     *                  children: [...]
     *           }, ...]
     *
     * @param {number} from
     * @param {number} to
     * @param {Array} tags
     * @param {Array} services
     *
     * @returns {Object}
     */
    PerformanceAnalyzer.prototype.getGroupedLog = function (from, to, tags, services) {
        // Retrieve linear log for them same time frame and tag set
        var log = this.getLog(from, to, _.flatten(tags), services);

        if (tags.length === 0) {
            return log.map(function (entry) {
                entry.children = [];
            });
        }

        if (log.length !== 0) {
            from = from || 0;
            to = to || Number.POSITIVE_INFINITY;
        }

        function getLayer(from, to, layer) {
            var result = log.filter(function (entry) {
                return entry.startTime >= from && entry.endTime <= to &&
                tags[layer].find(entry.tag);
            });
            result.forEach(function (entry) {
                if (layer + 1 < tags.length) {
                    entry.children = getLayer(entry.startTime, entry.endTime, layer + 1);
                } else {
                    entry.children = [];
                }
            });
            return result;
        }

        // Recursively search for events on every layer
        return getLayer(from, to, 0);
    };

    PerformanceAnalyzer.prototype.reset = function () {
        this.tracker.reset();
        this.collector.reset();
    };

    return PerformanceAnalyzer;
}]);
