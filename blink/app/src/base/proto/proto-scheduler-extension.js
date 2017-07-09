/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi
 *
 * @fileoverview A wrapper over proto interface to give accessor
 * methods and utility functions.
 */


'use strict';
/* eslint camelcase: 1, no-undef: 0 */

// This wrapping is needed so that the strict mode only applies to this scope
(function() {
    tsProto.scheduler.CronSchedule.prototype.isEmpty = function () {
        var values = Object.values(this);
        var hasValues = values.some(function (val) {
            return !_.isNil(val);
        });
        return !hasValues;
    };
})();
