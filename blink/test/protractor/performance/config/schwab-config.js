"use strict";

var PerfConfig = require('./perf-config');
var schwab = require('./schwab');

var config = PerfConfig(schwab);

exports.config = config;
