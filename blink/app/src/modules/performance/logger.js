/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview Service that can store a log of objects
 * and maintain the maximum size of log in given boundaries
 **/

'use strict';

/* global addBooleanFlag */
/* global flags */

addBooleanFlag('trackPerformance', 'Enables performance metric tracking when set to true', false);

blink.app.factory('PerfLogger', ['jsUtil', function (jsUtil) {

    var PerfLogger = function () {
        this.reset();
    };

    /*
     * Proxy function for timestamp implementation
     *
     * @returns {number}
     */
    PerfLogger.prototype.timestamp = function() {
        return new Date().getTime();
    };

    /*
     * Proxy function for event uid implementation. Should return random string
     * for each call.
     *
     * @returns {string}
     */
    PerfLogger.prototype.guid = function() {
        return jsUtil.generateUUID();
    };

    /*
     * Will add @obj to the log and cleanup old log records if
     * necessary. Object will be annotated with timestamp and guid.
     *
     * @param {Object} obj
     */
    PerfLogger.prototype.push = function (obj) {
        // Do not store anything if performance tracking
        // is not enabled.
        // Eventually we should enable performance tracking by default, so it
        // should be fine to place this flag check right here temporarily.
        if (!flags.getValue('trackPerformance')) {
            return;
        }
        obj.timestamp = obj.timestamp || this.timestamp();
        obj.guid = this.guid();
        this.log.push(obj);

        if (this.log.length >= maxLogSize) {
            this.cleanup();
        }
    };

    /*
     * Will return par of log in [from, to] time frame or the whole
     * log if frame is not specified.
     *
     * @param {number} from
     * @param {number} to
     *
     * @returns {Array}
     */
    PerfLogger.prototype.retrieve = function (from, to) {
        // TODO(maxim): maybe use binary search here to improve performance
        return this.log.filter(function (entry) {
            var match = true;
            if (from) {
                match = match && entry.timestamp >= from;
            }
            if (to) {
                match = match && entry.timestamp <= to;
            }
            return match;
        }).sort(function (l, r) {
            return l.timestamp - r.timestamp;
        });
    };

    /*
     * Purges the log.
     */
    PerfLogger.prototype.reset = function () {
        this.log = [];
    };

    /*
     * Sets the maximum number of items that log can store.
     *
     * @param {number} size
     */
    PerfLogger.prototype.setMaxLogSize = function (size) {
        maxLogSize = size;
    };

    /*
     * Gets the maximum number of items that log can store.
     *
     * @returns {Number}
     */
    PerfLogger.prototype.getMaxLogSize = function (size) {
        return maxLogSize;
    };

    /*
     * Removes the oldest part of log in order to maintain log
     * length under maxLogSize
     */
    PerfLogger.prototype.cleanup = function () {
        this.log.splice(0, maxLogSize * (1 - logCutoffValue));
    };

    /*
     * Maximum number of entries that can be stored in the log
     */
    var maxLogSize = 100000;

    /*
    * Log will be reduced to this size after raching maxLogSize size.
    * Oldest items will be deleted
    * Values specifies fracture of maxLogSize
    */
    var logCutoffValue = 0.7;

    // Test hook for mocking timestamp function
    // TODO(maxim): refactor tests, so they don't require any hooks
    // in app code
    PerfLogger.prototype._mockTimestamp = function (mock) {
        PerfLogger.prototype._oldTimestamp = PerfLogger.prototype.timestamp;
        PerfLogger.prototype.timestamp = mock;
    };

    PerfLogger.prototype._resetTimestampMock = function () {
        if (PerfLogger.prototype._oldTimestamp) {
            PerfLogger.prototype.timestamp = PerfLogger.prototype._oldTimestamp;
        }
    };

    return PerfLogger;
}]);
