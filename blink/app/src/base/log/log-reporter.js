/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Reporter to send logs from log queue to /admin/log
 */

'use strict';

angular.module('blink.accessories').factory('logReporter', ['$injector',
    'env',
    function ($injector,
          env) {

        var me = {}, _logs = [];

    /**
     * Report a log.
     * Logs are placed in an array, that can be retrieved later.
     *
     * @param {string} incidentId   The log incidentId
     * @param {string} severity     The log severity ('INFO', 'WARN' or 'ERROR')
     */
        me.reportLog = function (incidentId, severity) {
            if (env.e2eTest) {
                var message = Array.prototype.slice.call(arguments, 2).reduce(function (prevValue, arg) {
                    try {
                        return prevValue + ' ' + JSON.stringify(arg);
                    } catch (e) {
                        return prevValue + ' ' + arg;
                    }
                }, '');
                _logs.push({
                    incidentId: incidentId,
                    message: message,
                    severity: severity || 'INFO'
                });
            }
        };

        if (env.e2eTest) {
            me.getLogQueue = function () {
                return _logs;
            };

            me.clearLog = function () {
                _logs = [];
            };
        }

        return me;

    }]);
