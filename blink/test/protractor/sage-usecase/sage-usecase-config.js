"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

var config = base.BaseConfig();
config.specs = ['./sage-usecase-scenarios.js'];
// Use the default grunt selenium.
config.seleniumAddress = undefined;
config.params = {
    waitTimeout: 60000,
    shouldLogin: false
};

config.allScriptsTimeout = 60000;

exports.config = config;
