/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */
var base = require('../base-do-not-use');
var config = base.BaseConfig();

config.specs = ['./**/*-scenarios.js'];
// Use the default grunt selenium
config.seleniumAddress = undefined;
config.params = {
    shouldLogin: true,
    label: 'e2e-data-connect'
};
exports.config = config;
