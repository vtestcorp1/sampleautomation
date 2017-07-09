"use strict";

var PerfConfig = require('./perf-config');
var tpch = require('./tpch');

var config = PerfConfig(tpch);

exports.config = config;
