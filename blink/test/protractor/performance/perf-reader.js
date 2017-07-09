/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

'use strict';

var util = require('util');

// Set of metrics written out to debugFields:metric.
var DBG_METRIC_KEYS = {
    'callosum.debugInfo.falcon.duration': true,
    'callosum.debugInfo.memcacheAccessDetails.numCacheMisses': true,
    'callosum.debugInfo.memcacheAccessDetails.numCacheHits': true,
    'callosum.debugInfo.memcacheAccessDetails.totalTimeUs': true,
    'callosum.debugInfo.postgres.duration': true,
    'callosum.debugInfo.postgres.count': true,
    'callosum.debugInfo.requestCacheAccessDetails.numCacheMisses': true,
    'callosum.debugInfo.requestCacheAccessDetails.numCacheHits': true,
    'callosum.debugInfo.requestCacheAccessDetails.totalTimeUs': true,
    'callosum.debugInfo.serviceInvocTime': true,
    'callosum.duration': true,
    'callosum.traceId': true,
    'callosum.method': true,
    'callosum.requestSize': true,
    'callosum.responseSize': true,
    'callosum.status': true,
    'callosum.timestamp': true,
    'callosum.url': true,
    'dbg': true,
    'sage.duration': true,
    'sage.method': true,
    'sage.incidentId': true,
    'sage.requestSize': true,
    'sage.responseSize': true,
    'sage.status': true,
    'sage.timestamp': true,
    'sage.url': true,
    'render.guid': true,
    'render.duration': true,
    'render.type': true
};

// Returns a deferred vector of DebugLogs from PerfomanceAnalyzer that
// happened between @from and @to.
function getDebugLog(from, to) {
    var cmd = util.format(
        'return performanceAnalyzer.getDebugLog(%s, %s)', from, to);
    return browser.executeScript(cmd);

}

// Serializes @tags string so that it can be sent to the browser for execution.
function stringifyTags(tags) {
    if (!tags) {
        return 'null';
    }
    if (tags instanceof Array) {
        return "[" + tags.map(function (tag) { return stringifyTags(tag); }).join(', ') + "]";
    } else {
        return "perfEvents." + tags;
    }
}

// Returns a deferred vector of AnnotatedEvents from PerfomanceAnalyzer that
// happened between @from and @to and contain one of the tag in @tags.
function getPerfLog(from, to, tags) {
    var tagsStr = stringifyTags(tags);
    var cmd = util.format(
        'return performanceAnalyzer.getLog(%s, %s, %s)', from, to, tagsStr);
    return browser.executeScript(cmd);
}

// Flattens nested @object to create a 1 level deep object with keys that are
// concatenation nested keys.
function flattenObject(object) {
    var output = {};
    var seen = new Set();
    var flatten = function(prefix, obj) {
        if (obj === null || obj === undefined) {
            return;
        }
        switch (typeof obj) {
            case 'boolean':
            case 'number':
            case 'string':
                if (DBG_METRIC_KEYS.hasOwnProperty(prefix)) {
                    output[prefix] = obj;
                }
                break;
            case 'object':
                if (seen.has(obj)) {
                    return;
                }
                seen.add(obj);
                for (var k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        var key = k;
                        if (prefix !== "") {
                            key = prefix + "." + key;
                        }
                        flatten(key, obj[k]);
                    }
                }
                break;
            default:
                break;
        }
    };
    var service = (object && object.service) || 'default';
    flatten(service, object);
    return output;
}

// Returns the deferred hierarchy of AnnotatedEvents from PerfomanceAnalyzer
// that happened between @from and @to and contain one of the tag in @tags.
function getGroupedPerfLog(from, to, tags) {
    var tagsStr = stringifyTags(tags);
    var cmd = util.format(
        'return performanceAnalyzer.getGroupedLog(%s, %s, %s)',
        from,
        to,
        tagsStr);
    return browser.executeScript(cmd);
}

// Clears the logs collected by performanceAnalyzer in the app.
function reset() {
    // Pre-4.2 app did not have the performanceAnalyzer.reset method defined.
    // To handle that case, we call reset on tracker and collector individually
    // if the method reset does not exist on the performanceAnalyzer.
    var cmd =
        'if (!!performanceAnalyzer.reset) {' +
        '   performanceAnalyzer.reset();' +
        '} else {' +
        '   performanceAnalyzer.tracker.reset();' +
        '   performanceAnalyzer.collector.reset();' +
        '}';
    return browser.executeScript(cmd);
}

module.exports = (function() {
    return {
        getPerfLog: getPerfLog,
        getDebugLog: getDebugLog,
        flattenObject: flattenObject,
        reset: reset
    };
}());
