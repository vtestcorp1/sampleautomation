/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview A service that post processes logs obtained from debugInfoCollector
 * (e.g. anotates them with collected debug info)
 * */

'use strict';

blink.app.factory('debugInfoCollector', ['PerfLogger', 'serviceNames', function (PerfLogger, serviceNames) {

    function DebugInfoCollector () {
        this.log = new PerfLogger();
        this.reset();
    }

    function timestamp() {
        return new Date().getTime();
    }

    /*
     * Collects a service response. Debug info will be automatically extracted
     * and the type of response will be identified by @service parameter.
     *
     * @param {string} service
     * @param {Object} info
     */
    DebugInfoCollector.prototype.collect = function (service, info) {
        if (service && info) {
            var entry = _.clone(info);
            entry.service = service;
            if (entry.timestamp) {
                entry.duration = timestamp() - entry.timestamp;
            }
            this.log.push(entry);
        }
    };

    /*
     * Retrieves part of log in given timeframe [from, to]. Can also be filtered by
     * service names.
     *
     * @param {number} from
     * @param {number} to
     * @param {Array} services
     *
     * @returns {Array}
     */
    DebugInfoCollector.prototype.retrieve = function (from, to, services) {
        return this.log.retrieve(from, to).filter(function (entry) {
            return !services || !!services.find(entry.service);
        });
    };

    DebugInfoCollector.prototype.reset = function () {
        this.log.reset();
    };

    return new DebugInfoCollector();
}]);
