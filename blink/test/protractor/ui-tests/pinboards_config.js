"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');
var config = base.BaseConfig();


config.specs = ['all-pinboards-scenarios.js'];
config.onPrepare = function () {
    base.prepare();
    base.goToPinboards();
    browser.params.pinboards = [];
    browser.params.answers = [];
    return base.readPinboards().then(function (pinboards) {
        browser.params.pinboards = pinboards;
    });
};
config.params = {
    shouldLogin: true
};

exports.config = config;
