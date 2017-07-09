"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var baseConfig = require('../base-config');
var login = require('./login/login');
var path = require('path');

var config = baseConfig.BaseConfig([path.join(__dirname, '**/*-scenarios.js')], 'IE');

// Use the default grunt selenium
config.seleniumAddress = undefined;
config.jasmineNodeOpts.grep = 'IE';
config.params = {
    shouldLogin: true,
    waitTimeout: 120000,
    label: 'e2e-ie'
};

var basePrepare = config.onPrepare;
config.onPrepare = function() {
    return basePrepare().then(function() {
        return login.login();
    });
};

exports.config = config;
