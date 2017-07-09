"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

var config = base.BaseConfig();

config.specs = ['answer-page-scenarios.js'];
config.params = {
    shouldLogin: true
};

exports.config = config;
