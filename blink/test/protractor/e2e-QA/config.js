"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

var config = base.BaseConfig();

config.specs = ['./**/*-scenarios.js'];
// Use the default grunt selenium
config.seleniumAddress = undefined;
config.params = {
    shouldLogin: true,
    label: 'e2e-full'
};

exports.config = config;
