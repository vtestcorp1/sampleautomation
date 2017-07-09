'use strict';

(function () {

    var express = require('express'),
        app = express(),
        fs = require('fs'),

        FAKE_DATA_PATH = 'fake-api/fake-data/';

    app.get('/sage/*', function(req, res) {
        handleRequest(req, res, true);
    });

    app.post('/sage/*', function(req, res) {
        handleRequest(req, res, true);
    });

    app.get('/callosum/*', function(req, res) {
        handleRequest(req, res);
    });

    app.post('/callosum/*', function(req, res) {
        handleRequest(req, res);
    });

    function filterPath(path, isSageRequest) {
        var match;
        if (isSageRequest) {
            match = path.match(/\/sage\/(.*)/);
        } else {
            match = path.match(/\/callosum\/v1\/((\w+)\/(\w+))(\/.*)?/);
        }
        if (!match || match.length < 2) {
            return;
        }
        return match[1].replace('/', '-');
    }

    function handleRequest(req, res, isSageRequest) {
        var apiCall = filterPath(req._parsedUrl.pathname, isSageRequest) || 'default',
            dir = (isSageRequest) ? 'sage' : 'callosum',
            filePath = FAKE_DATA_PATH + dir + '/' + apiCall;
        if (fs.existsSync(filePath)) {
            res.set('Content-Type', 'application/json');
            res.sendfile(filePath);
        } else {
            res.send('No fake data for: ' + apiCall);
        }
    }

    app.listen(8088);

}());
