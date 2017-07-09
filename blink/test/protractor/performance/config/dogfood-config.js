"use strict";

var PerfConfig = require('./perf-config');
var dogfood = require('./dogfood');

var config = PerfConfig(dogfood);

exports.config = config;
