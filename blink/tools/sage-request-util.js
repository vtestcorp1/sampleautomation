'use strict';

/* jshint camelcase: false */
/* global process, Buffer */

function generateSources() {
    var thriftGenerator = require('../scripts/generate-sources.js');
    thriftGenerator.generateSources('./tools/gen-files/', function () {
        console.log('source generation complete.');
    });
}

var fs = require('fs');

function prettyPrint(obj) {
    if (typeof obj === 'object') {
        obj = JSON.stringify(obj, null, 4);
    }
    return obj;
}

var Thrift = require('thrift');
var connection = Thrift.createHttpConnection('for-fake-client', 0, {
    transport: Thrift.TFramedTransport,
    protocol: Thrift.TJSONProtocol
});

connection.on('error', function(err) {
    console.error(err);
});

require('./gen-files/sage_types');
require('./gen-files/AutoComplete_types');
require('./gen-files/AutoComplete');

var client = Thrift.createHttpClient(thrift.Sage.AutoComplete.AutoCompleteClient, connection);

var SageDecoder = function () {
    this.completionRequest = null;
    this.completionResponse = null;
};

SageDecoder.prototype.Complete = function (request, callback) {
    this.completionRequest = request;
};

SageDecoder.prototype._responseHandler = function (err, response) {
    this.completionResponse = response;
};

SageDecoder.prototype.decodeResponse = function (serializedResponse) {
    var otransport = new Thrift.TFramedTransport(new Buffer(serializedResponse)),
        oprotocol = new Thrift.TJSONProtocol(otransport);

    oprotocol.readMessageBegin();
    client._reqs['fake-call'] = this._responseHandler.bind(this);
    client.recv_Complete(oprotocol, thrift.Thrift.MessageType.REPLY, 'fake-call');

    return this.completionResponse;
};

var http = require('http'),
    https = require('https');

function replayRequest(encodedRequest, clusterHost, clusterPort, isHttps) {
    if (!clusterHost) {
        console.error('Can not replay sage request without a valid cluster address');
    }
    var reqProtocol = isHttps && https || http;
    var req = reqProtocol.request({
        hostname: clusterHost,
        port: clusterPort || (isHttps && 443) || 8088,
        path: '/sage/',
        method: 'POST',
        rejectUnauthorized: false
    }, function (response) {
        var data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            try {
                console.log(prettyPrint((new SageDecoder()).decodeResponse(data)));
            } catch (e) {
                logIncompatibleVersionAndExit(e);
            }
        });
    });

    req.setHeader('Content-Length', encodedRequest.length);
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    req.setHeader('User-Agent',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Safari/537.36');
    req.write(encodedRequest);
    req.end();
}

exports.generateSources = generateSources;
exports.replayRequest = replayRequest;
exports.SageDecoder = SageDecoder;
