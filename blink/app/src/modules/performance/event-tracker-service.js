/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview A service that provides an interface for tracking
 * event duration and retrieve event logs for a given timeframe.
 *
 * */

'use strict';

blink.app.factory('eventTracker', ['$rootScope', 'Logger', 'PerfLogger', 'util',
    function ($rootScope, Logger, PerfLogger, util) {

    /*
     * Tracker class. Supposed to be a singleton to maintain a single
     * event log for the whole app.
     */
        function EventTracker() {
            this.log = new PerfLogger();
        }

        var _logger = Logger.create('event-tracker');

    /*
     * Handle class for each tracker event.
     */
        function TrackedEvent(tag, meta) {
            this.tag = tag;
            this.meta = meta || {};
            this._nextPending = 0;
            this._pendingEvents = {};
            this._cancelled = false;
            this._markedFinish = false;
            this._finished = false;

            this._tryFinish = function() {
                if (this.isFinished()) {
                    return;
                }
                if (Object.keys(this._pendingEvents).length > 0 ||
                !this._markedFinish) {
                    return;
                }
                this.duration = PerfLogger.prototype.timestamp() - this.timestamp;
                this._finished = true;
                _logger.log('finish event=%s. start=%d, end=%d, duration=%d',
                        this.tag, this.getStartTime(), this.getEndTime(), this.duration);
            };
        }

    /*
     * Waits for @event on @scope before marking the event as finished. Users
     * can set @filter to filter out events that should not mark the end of the
     * event.
     */
        TrackedEvent.prototype.waitFor = function(scope, event, filter) {
            if (this.isFinished()) {
                return this;
            }
            var eventId = this._nextPending++;
            scope = scope || $rootScope;
            var cancelCb = scope.$on(event, (function() {
                _logger.log('received event=%s, eventId=%d', event, eventId);
                if (filter && filter.apply(this, arguments) === false) {
                    return;
                }
                this._pendingEvents[eventId].cancelCb();
                delete this._pendingEvents[eventId];
                this._tryFinish();
            }).bind(this));
            this._pendingEvents[eventId] = {
                event: event,
                cancelCb: cancelCb
            };
            return this;
        };

    /*
     * Finish method should be called when event has finished.
     * It will record a finish timestamp and change state to finished.
     */
        TrackedEvent.prototype.finish = function () {
            this._markedFinish = true;
            this._tryFinish();
            return this;
        };

    /*
     * Finishes current event by cancelling it.
     */
        TrackedEvent.prototype.cancel = function() {
            if (this.isFinished()) {
                return;
            }
            this._cancelled = true;
            this._markedFinish = true;
            for (var eventId in this._pendingEvents) {
                if (this._pendingEvents.hasOwnProperty(eventId)) {
                    this._pendingEvents[eventId].cancelCb();
                    delete this._pendingEvents[eventId];
                }
            }
            this._tryFinish();
        };

    /*
     * @returns {number}
     */
        TrackedEvent.prototype.getStartTime = function () {
            return this.timestamp;
        };

    /*
     * @returns {number}
     */
        TrackedEvent.prototype.getEndTime = function () {
            return this.getStartTime() + this.duration;
        };

    /*
     * @returns {boolean}
     */
        TrackedEvent.prototype.isFinished = function () {
            return this._finished || this._cancelled;
        };

    /*
     * @returns {boolean}
     */
        TrackedEvent.prototype.isCancelled = function () {
            return this._cancelled;
        };

    /*
     * Duration in milliseconds
     *
     * @returns {number}
     */
        TrackedEvent.prototype.getDuration = function () {
            return this.duration;
        };

        EventTracker.prototype.reset = function () {
            this.log.reset();
        };

    /*
     * Should be called at the beginning of every event that you'd like to
     * track. Will record start time, tag and any metadata you'd like to
     * associate with the event. Will return TrackedEvent object on which
     * you should call .finish() when your event has finished.
     *
     * @param {string} tag
     * @param {Object} meta
     *
     * @returns {TrackedEvent}
     */
        EventTracker.prototype.trackEvent = function (tag, meta) {
            var handle = new TrackedEvent(tag, meta);
            this.log.push(handle);
            _logger.log('start event=%s, start=%d', tag, handle.getStartTime());
            return handle;
        };

    /*
     * Retrieves part of the log in a given time window [from, to],
     * filtered by tags and ordered by event.startTime.
     * Returns list of TrackedEvents.
     *
     * @param {number} from
     * @param {number} to
     * @param {Array} tags
     *
     * @returns {Array}
     */
        EventTracker.prototype.getLog = function (from, to, tags) {
            var results = this.log.retrieve(from, to);
            return results.filter(function (evt) {
                var match = evt.isFinished() && !evt.isCancelled();
                if (tags) {
                    match = match && tags.find(evt.tag);
                }
                if (_.isNumber(from)) {
                    match = match && evt.getStartTime() >= from;
                }
                if (_.isNumber(to)) {
                    match = match && evt.getEndTime() <= to;
                }
                return match;
            }).sort(function (a, b) {
                return a.getStartTime() - b.getStartTime();
            });
        };

        return new EventTracker();
    }]);
