#!/usr/bin/env node

/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

'use strict';

var fs = require('fs-extra');
var https = require('https');
var http= require('http');
var path = require('path');
var request = require('request');
var tsProto = require('../../../app/lib/gen-files/ts-proto-node.js');
var lodash = require('../../../app/lib/src/lodash/lodash.js');
var perfReader = require('./perf-reader.js');
var Promise = require('bluebird');

// Adds @k, @v as key value pair to trace.
function addKeyValueInfo(trace, k, v) {
    var key = ".net.KeyValueDebugInfo.trace";
    if (!trace[key]) {
        trace[key] = new tsProto.net.KeyValueDebugInfo();
    }
    var info = trace[key];
    info.item.push(createKeyValue(k, v));
}

// Returns KeyValue proto with k as key and v as value.
function createKeyValue(k, v) {
    var kv = new tsProto.common.KeyValue();
    kv.setKey(k);
    kv.setValue(new tsProto.common.ValueProto());
    if (lodash.isInteger(v)) {
        kv.getValue().setType(tsProto.common.ValueProto.Type.TYPE_INT64);
        kv.getValue().setI64(v);
    } else if (lodash.isNumber(v)) {
        kv.getValue().setType(tsProto.common.ValueProto.Type.TYPE_DOUBLE);
        kv.getValue().setD(v);
    } else if (lodash.isBoolean(v)) {
        kv.getValue().setType(tsProto.common.ValueProto.Type.TYPE_BOOL);
        kv.getValue().setB(v);
    } else if (lodash.isString(v)) {
        kv.getValue().setType(tsProto.common.ValueProto.Type.TYPE_STRING);
        kv.getValue().setS(v);
    } else if (lodash.isObject(v)) {
        kv.getValue().setType(tsProto.common.ValueProto.Type.TYPE_STRING);
        kv.getValue().setS(v.toString());
    }
    return kv;
}

function parseTraceEvent(clientName, output, dbg) {
    var logs = dbg.logs;
    var seleniumLogs = dbg.selenium;

    var Event = tsProto.net.TraceEvent;
    var root = new Event();
    var startEpochMs = output.startEpochMs;
    var endEpochMs = output.endEpochMs;
    root.setName(output.suite + '-' + output.test);
    root.setStartUs(Math.floor(startEpochMs * 1000));
    root.setDurationUs(Math.floor(output.val * 1000));
    root.setChronoType(Event.ChronoType.CHRONO_CONCURRENT);
    root.setHost(clientName);

    var childTraces = [];

    for (var i = 0; i < logs.length; ++i) {
        var serviceTrace = new Event();
        var log = logs[i];
        serviceTrace.setName(log.service + '-' + log.url);
        serviceTrace.setStartUs(log.timestamp * 1000);
        serviceTrace.setDurationUs(log.duration * 1000);
        serviceTrace.setChronoType(Event.ChronoType.CHRONO_SEQUENTIAL);

        // If this requests ends after the test trace has ended, shorten its
        // duration and mark the event as expired.  This makes sure that the
        // trace is not messed up on the tracez page.
        var serviceEndEpochMs = log.timestamp + log.duration;
        if (serviceEndEpochMs > endEpochMs) {
            var duration = endEpochMs - log.timestamp;
            serviceTrace.setDurationUs(duration * 1000);
            serviceTrace.setDeadlineExpired(true);
            serviceTrace.error.push('duration: ' + log.duration);
        }

        // Add flattened debug info as debug properties of the trace event.
        var flattened = perfReader.flattenObject(logs[i]);
        Object.keys(flattened).forEach(function (key) {
            addKeyValueInfo(serviceTrace, key, flattened[key]);
        });

        if (log.traceId && log.traceId !== '') {
            var rpc = new Event();
            rpc.setTraceId(log.traceId);
            serviceTrace.child.push(rpc);
            var clockAlign = new tsProto.net.TraceEvent.ClockAlign();
            clockAlign.setType(
                tsProto.net.TraceEvent.ClockAlign.Type.REMOTE_CLOCK_UNKNOWN);
            serviceTrace.setClockAlign(clockAlign);
        }

        childTraces.push(serviceTrace);
    }

    for (var i = 0; i < seleniumLogs.length; ++i) {
        var log = seleniumLogs[i];
        if (log.start < startEpochMs || log.end > endEpochMs) {
            continue;
        }

        var seleniumTrace = new Event();
        seleniumTrace.setName(log.command.name_ || log.command);
        seleniumTrace.setStartUs(log.start * 1000);
        seleniumTrace.setDurationUs((log.end - log.start) * 1000);
        seleniumTrace.setChronoType(Event.ChronoType.CHRONO_SEQUENTIAL);

        childTraces.push(seleniumTrace);
    }

    // Sorting child traces by their start times.
    childTraces.sort(function (traceA, traceB) {
        return traceA.getStartUs() - traceB.getStartUs();
    });

    root.child = childTraces;

    var putTraceRequest = new tsProto.net.PutTraceRequest();
    putTraceRequest.setId(output.id.toString());
    putTraceRequest.tag.push(output.suite);
    putTraceRequest.tag.push(output.test);
    putTraceRequest.setTrace(root);
    putTraceRequest.setCollector('PerfTest');
    return putTraceRequest;
}

function normalizeBase64String(string) {
    if (!string) {
        return string;
    }

    var mismatchIndex = string.length % 4;
    if (mismatchIndex !== 0) {
        var stringToAppend = '';
        var numCharactersNeeded = 4 - mismatchIndex;
        for (var i = 0; i < numCharactersNeeded; i++) {
            stringToAppend += '=';
        }
        string += stringToAppend;
    }

    return string;
}

function parsePutTraceRequest(serialized) {
    var normalized = normalizeBase64String(serialized);
    return tsProto.net.PutTraceRequest.decode64(normalized);
}

function parseGetTraceResponse(serialized) {
    var normalized = normalizeBase64String(serialized);
    return tsProto.net.GetTraceResponse.decode64(normalized);
}

function makeGetTraceRequest(traceId) {
    var getTraceRequest = new tsProto.net.GetTraceRequest();
    getTraceRequest.setId(traceId);
    return getTraceRequest;
}

function writeTrace(outDir, putTraceRequest) {
    var serialized = putTraceRequest.encode64().split('=')[0];
    fs.writeFileSync(
        path.join(outDir, putTraceRequest.getId()), serialized);
}

function makeRequest(host, port, isHttps, serializedRequest, path) {
    var options = {
        host: host,
        port: port,
        path: path,
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'text',
            'Content-Length': Buffer.byteLength(serializedRequest)
        }
    };

    return new Promise(function (resolve, reject) {
        isHttps = isHttps === 'true' || isHttps === true;
        var transport = isHttps ? https : http;
        var request = transport.request(options,
            function (response) {
                response.setEncoding('utf8');
                var data = '';
                response.on('data', function (chunk) {
                    data += chunk;
                });
                response.on('end', function () {
                    resolve(data);
                });
            }, function (error) {
                reject();
                console.log(error);
            });
        request.write(serializedRequest);
        request.end();
    });
}

// Sends put trace request @putTraceRequest to trace vault.
function putTrace(host, port, isHttps, putTraceRequest) {
    var serialized = putTraceRequest.encode64().split('=')[0];
    return makeRequest(host, port, isHttps, serialized, '/tracevault/puttrace');
}

// Sends put trace request @getTraceRequest to trace vault.
function getTrace(host, port, isHttps, getTraceRequest) {
    var serialized = getTraceRequest.encode64().split('=')[0];
    return makeRequest(host, port, isHttps, serialized, '/tracevault/gettrace');
}

function parsePutRequestFromGetTraceResponse(traceId, getTraceResponse) {
    var putTraceRequest = new tsProto.net.PutTraceRequest();
    putTraceRequest.setId(traceId);
    putTraceRequest.setTag(getTraceResponse.getTag());
    putTraceRequest.setTrace(getTraceResponse.getTrace());
    return putTraceRequest;
}

function syncTrace(server, port, isHttps, putTraceRequest, outDirPath) {
    var traceId = putTraceRequest.getId();
    var getTraceRequest = makeGetTraceRequest(traceId);
    return putTrace(server, port, isHttps, putTraceRequest)
        .then(function () {
            return getTrace(server, port, isHttps, getTraceRequest);
        })
        .then(function (response) {
            var getTraceResponse = parseGetTraceResponse(response);
            putTraceRequest = parsePutRequestFromGetTraceResponse(traceId, getTraceResponse);
            fs.writeFileSync(path.join(outDirPath, traceId), putTraceRequest.encode64().split('=')[0], 'utf-8');
        });
}

if (require.main === module) {
    if (process.argv.length != 6) {
        console.log('Require server path, port to upload to and directory path to upload traces from.');
    } else {
        var server =  process.argv[2];
        var port =  process.argv[3];
        var isHttps = process.argv[4];
        var dirPath = process.argv[5];
        fs.readdirSync(dirPath).forEach(function (fileName) {
            var content = fs.readFileSync(path.join(dirPath, fileName), 'utf-8');
            var putTraceRequest = parsePutTraceRequest(content);
            putTrace(server, port, isHttps, putTraceRequest)
        });
    }
} else {
    module.exports = (function () {
        return {
            writeTrace: writeTrace,
            parseTraceEvent: parseTraceEvent,
            syncTrace: syncTrace
        };
    }());
}
