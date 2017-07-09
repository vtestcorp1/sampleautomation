"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../../base-config');
var paramUtil = require('../../../../scripts/param-util');
var path = require('path');
var login = require('../../scenarios/login/login');

function PerfConfig(dataset) {
    var perfSpecs = [path.join(__dirname, '../test/**/*-scenarios.js')];
    var baseConfig = new base.BaseConfig(perfSpecs, 'PERF');

    // Use the default grunt selenium
    baseConfig.seleniumAddress = undefined;
    baseConfig.params = {
        // Jun 8 2016
        // We want all perf test to run with this date passed as a current instant,
        // otherwise we will be getting different results every day.  In
        // particular, if we don't upgrade data in our dogfood snapshot, we're
        // running against, eventually every quest with 'last N days' statement
        // will become empty.
        currentEpochOverrideMs: '1465426742000',
        waitTimeout: 120000,
        shouldLogin: false,
        dataset: dataset,
        datasetName: dataset.name,
        label: dataset.label
    };

    var inputParams = paramUtil.getArguments();
    var outDir = inputParams.outdir || 'benchmark';

    var timelinePlugin = {
        package: 'protractor-timeline-plugin',
        // Output json and html will go in this folder.
        outdir: outDir + '/timelines',
        // Set the name of the html file. Defaults to index.html.
        outputHtmlFileName: 'results.html'
    };

    baseConfig.plugins = baseConfig.plugins || [];
    baseConfig.plugins.push(timelinePlugin);
    baseConfig.allScriptsTimeout = 60000;

    var basePrepare = baseConfig.onPrepare;
    baseConfig.onPrepare = function() {
        // Timeout while waiting for actions during perf tests.
        var TIMEOUT_MS = 240 * 1000;  // 4mins
        // Increase default jasmine timeout for perftests.
        jasmine.DEFAULT_TIMEOUT_INTERVAL = TIMEOUT_MS;

        return basePrepare()
            .then(function() {
                login.login();
            });
    };

    return baseConfig;
}

module.exports = PerfConfig;
