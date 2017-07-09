/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var csv = require('csv-write-stream');
var fs = require('fs-extra');
var lodash = require('../../../app/lib/src/lodash/lodash.js');
var moment = require('moment');
var newGuid = require('node-uuid').v4;
var os = require('os');
var path = require('path');
var perfReader = require('./perf-reader.js');
var prettysize = require('prettysize');
var request = require('request');
var timelinePlugin = require('protractor-timeline-plugin');
var traceUtil = require('./trace-util.js');

var performance = {
    printMemoryStats: function() {
        return browser.driver.executeScript(function () {
            return window.stableGC();
        }).then(function (result) {
            if (!!result) {
                console.log(
                    "heap: [limit=" + prettysize(result.jsHeapSizeLimit) +
                        ", total=" + prettysize(result.totalJSHeapSize) +
                        ", used=" + prettysize(result.usedJSHeapSize) + "]");
            }
            return true;
        });
    }
};

// Returns true if the tests should run only once, set through command line,
// if not set the test runs thrice (average case run,
// cached run and uncached run).
function onlyOnce() {
    // We pass browser params through 2 ways -
    //   1. Grunt option parses `true` or `false` as Boolean type.
    //   2. Raw node command parses `true` or `false` as String type
    // To support both, we do a comparison check against both string and bool.
    return browser.params.onlyOnce === 'true'
      || browser.params.onlyOnce === true;
}

// Returns current epoch in milliseconds.
function epochMs() {
    return new Date().getTime();
}

// Returns tag, if any, associated with the test run.
function tag() {
    return browser.params.tag || '';
}

// Returns dataset name if set as command line parameter, otherwise returns
// "unknown".
function datasetName() {
    return browser.params.datasetName || 'unknown';
}

// Returns numRuns if set as command line parameter, otherwise returns 1.
function numRuns() {
    if (!lodash.isNumber(browser.params.numRuns)) {
        return 1;
    }
    return Number.parseInt(browser.params.numRuns);
}

// Returns jenkinsId if set as command line parameter, otherwise returns
// undefined.
function jenkinsId() {
    if (!lodash.isNumber(browser.params.jenkinsId)) {
        return undefined;
    }
    return Number.parseInt(browser.params.jenkinsId);
}

// Returns username used to run perf tests.
function username() {
    return browser.params.username || 'tsadmin';
}

// Returns directory where results of perf tests should be stored.
function outdir() {
    return browser.params.outdir || 'benchmark';
}

// Returns directory where traces (if generated) for perf tests should be
// stored.
function inTracedir() {
    return browser.params.tracedir || path.join(outdir(), 'traces/in');
}

// Returns directory where traces (if generated) for perf tests should be
// stored.
function outTracedir() {
    return browser.params.tracedir || path.join(outdir(), 'traces/out');
}

// Returns true if the client should generate and submit traces to the server,
// false otherwise.
function shouldGenerateTrace() {
    // We pass browser params through 2 ways -
    //   1. Grunt option parses `true` or `false` as Boolean type.
    //   2. Raw node command parses `true` or `false` as String type
    // To support both, we do a comparison check against both string and bool.
    return browser.params.generateTrace === 'true'
      || browser.params.generateTrace === true;
}

// Sends a get request to backendHost to @path and executes callback @cb when
// done.
function makeBackendGetRequest(path, cb) {
    if (!browser.params.backendHost) {
        cb('No backendHost.');
        return;
    }
    var url = 'http://' + browser.params.backendHost + ':' +
        browser.params.backendPort + path;
    var options = {
        url: url,
        rejectUnauthorized: false
    };
    request(options, cb);
}

// Returns a deferred object that resolves when SERVER_SHA has been populated.
var SERVER_SHA = "";
function populateServerSha() {
    var deferred = protractor.promise.defer();
    if (SERVER_SHA !== "") {
        deferred.fulfill(true);
        return deferred.promise;
    }
    makeBackendGetRequest('/release', function(error, resp, body) {
        deferred.fulfill(true);
        if (resp && resp.statusCode === 200) {
            SERVER_SHA = body;
        } else {
            SERVER_SHA = 'UNKNOWN';
        }
    });
    return deferred.promise;
}

// Returns a deferred object that resolves when CLIENT_SHA has been populated.
var CLIENT_SHA = "";
function populateClientSha() {
    var deferred = protractor.promise.defer();
    if (CLIENT_SHA !== "") {
        deferred.fulfill(true);
        return deferred.promise;
    }
    browser.executeScript('return blink.commitId').then(function(id) {
        CLIENT_SHA = id;
        deferred.fulfill(true);
    });
    return deferred.promise;
}

// Returns hostname for the machine on which the test is being run.
function clientName() {
    var network = os.networkInterfaces();
    var getEth = function (eth) {
        if (network.hasOwnProperty(eth)) {
            var bound = network[eth];
            if (bound && bound.length > 0) {
                return bound[0].address;
            }
        }
        return null;
    };
    if (getEth('eth2')) {
        return getEth('eth2');
    }
    if (getEth('eth0')) {
        return getEth('eth0');
    }
    if (getEth('eth1')) {
        return getEth('eth1');
    }
    return os.hostname();
}

// Sets the env variable app to ignore cache to true in the app, which in turn
// triggers all callosum requests to be called with ignoreCache header set.
function disableCache() {
    return browser.executeScript(function () {
        $(document.body).injector().get('env').ignoreCache = true;
    });
}

// Sets the env variable app to ignore cache to false in the app, which in turn
// triggers all callosum requests to be called with ignoreCache header unset.
function enableCache() {
    return browser.executeScript(function () {
        $(document.body).injector().get('env').ignoreCache = false;
    });
}

// Creates a new flavor for TestRuns with name @name.  @setupFn is called before
// each run of the Test flavor.
function newFlavor(name, setupFn) {
    return {
        name: name,
        setupFn: setupFn,
        runData: []
    };
}

// RunData contains information related to each run of the test.
function newRunData(runId, suffix) {
    return {
        // Integer id for multiple iterations of the test.
        runId: runId,
        // Suffix appended to test name.  Usually @flavor.name.
        suffix: suffix,
        // End to end timing information for this test.
        timing: {},
        // List of timing information of the tracked actions of the test.
        subActionTimings: [],
        // True if test passed successfully, false otherwise.
        success: false
    };
}

// Test class encapsulates a group of actions that should be benchmarked.
// Output for each run of the test is forwarded to @output via addRun,
// addDbg & add*Report method for later analysis.
function Test(name, suiteName, output, only) {
    this._name = name;
    this._suiteName = suiteName;
    this._output = output.newSuite(suiteName);
    // List of actions specified by the test.
    this._actions = [];
    // Action to be run before each run of the test.
    this._beforeRun = protractor.promise.fulfilled.bind(void 0, true);
    // Action to be run after each run of the test.
    this._afterRun = protractor.promise.fulfilled.bind(void 0, true);
    // Action to be run before the first run of this test.
    this._beforeTest = protractor.promise.fulfilled.bind(void 0, true);
    // Action to be run after the last run of this test.
    this._afterTest = protractor.promise.fulfilled.bind(void 0, true);
    this._bounds = {};
    this._onlyOnce = false;
    this._only = only;
    this._flavors = {
        uncached: newFlavor('-no-cache', disableCache),
        cached: newFlavor('-cached', enableCache)
    };
}

// Actions performed during @before and @after phase are not included in the
// time reported for a test run.
Test.prototype.before = function(fn) {
    this._beforeRun = fn;
    return this;
};

Test.prototype.after = function(fn) {
    this._afterRun = fn;
    return this;
};

// Set of actions that are to be performed before the first run of this test.
Test.prototype.beforeAll = function(fn) {
    this._beforeTest = fn;
    return this;
};

// Set of actions that are to be performed after the last run of this test.
Test.prototype.afterAll = function(fn) {
    this._afterTest = fn;
    return this;
};

// Defines bounds in which the test is supposed to run. Tests running outside
// these bounds (if defined) are reported.
Test.prototype.withBounds = function (bounds) {
    this._bounds = bounds || {};
    return this;
};

// Runs the test only once (doesn't test cache / cache invalidation).
Test.prototype.onlyOnce = function(shouldRunOnlyOnce) {
    this._onlyOnce = shouldRunOnlyOnce;
    return this;
};

// Adds action to the list of actions to be performed by the test.
Test.prototype.then = function(action) {
    if (typeof action !== 'function') {
        throw new Exception('Invalid action ' + action);
    }
    this._actions.push(action);
    return this;
};

// Adds a tracked action to the list of actions to be performed by the test.
// A tracked action execution timings are captured and reported at the end
// of the test.
Test.prototype.sthen = function(name, action, bounds) {
    if (typeof action !== 'function') {
        throw new Exception('Invalid action ' + action);
    }
    this._actions.push(function (runData) {
        var start = epochMs();
        return action().then(function () {
            var end = epochMs();
            runData.subActionTimings.push({
                name: name,
                start: start,
                end: end,
                bounds: bounds
            });
            return protractor.promise.fulfilled(true);
        }.bind(this));
    }.bind(this));
    return this;
};

// Reports tests that have not completed in the bounds defined.
Test.prototype._reportBounds = function() {
    var flavors = this._flavors;
    lodash.forOwn(flavors, function (flavor) {
        var runData = flavor.runData;
        if (runData.length === 0) {
            return;
        }
        var success = lodash.reduce(runData, function (success, iteration) {
            return success && iteration.success;
        }, true);
        if (!success) {
            this._output.addFailReport(this._name + flavor.name);
            return;
        }
        var subActions = {};
        var totalRuntime = lodash.reduce(runData, function (sum, iteration) {
            lodash.forOwn(iteration.subActionTimings, function (action) {
                if (!subActions.hasOwnProperty(action.name)) {
                    subActions[action.name] = {
                        duration: 0,
                        bounds: action.bounds
                    };
                }
                subActions[action.name].duration += action.end - action.start;
            });
            return sum + (iteration.timing.end - iteration.timing.start);
        }, 0);
        var avgRuntime = totalRuntime / runData.length;
        console.log('Suite=' + this._suiteName +
            ', Test=' + this._name + flavor.name +
            ', runs=' + runData.length + ', avg=' + avgRuntime.toFixed(2) +
            ', bounds=' + JSON.stringify(this._bounds));
        if (!!this._bounds.lower) {
            expect(avgRuntime).toBeGreaterThan(this._bounds.lower,
                `Suite=${this._suiteName},Test=${this._name + flavor.name}`);
        }
        if (!!this._bounds.upper) {
            expect(avgRuntime).toBeLessThan(this._bounds.upper,
                `Suite=${this._suiteName},Test=${this._name + flavor.name}`);
        }
        this._output.addSuccessReport(
            this._name + flavor.name,
            'duration_ms',
            avgRuntime,
            this._bounds.lower,
            this._bounds.upper);
        lodash.forEach(subActions, function (runTime, actionName) {
            if (!runTime.bounds) {
                return;
            }
            this._output.addSuccessReport(
                this._name + '-' + actionName + runData.suffix,
                'duration_ms',
                runTime.duration / runData.length,
                runTime.bounds.lower,
                runTime.bounds.upper);
        }.bind(this));
    }.bind(this));
};

// Marks the end of the test.  Forwards all collected metrics to @this._output.
Test.prototype._done = function() {
    var before = function() {
        return populateClientSha()
            .then(populateServerSha)
            .then(performance.printMemoryStats)
            .then(this._beforeRun);
    }.bind(this);
    var after = function() {
        return this._afterRun()
            .then(performance.printMemoryStats);
    }.bind(this);

    var bit = this._only ? fit : it;
    // Run uncached flavor when running the test only once, to make sure bounds
    // are reported accurately.
    if (this._onlyOnce) {
        delete this._flavors.cached;
    }
    // Schedule a run for each flavor, `cached` and `uncached`, `numRuns` times.
    // Cache management is done through setupFn provided by flavor, before each
    // run.
    var scheduleFlavor = function (flavor) {
        for (var i = 0; i < numRuns(); i++) {
            bit(`Test=${this._name} RunId=${i} Caching=${flavor.name}`,
                function(runId) {
                    var runData = newRunData(runId, flavor.name);
                    flavor.runData.push(runData);
                    return flavor.setupFn()
                        .then(before)
                        .then(this._newRun.bind(this, runData))
                        .then(after);
                }.bind(this, i));
        }
    }.bind(this);
    // First schedule uncached flavor so that cached flavor gets cached hits.
    if (this._flavors.uncached) {
        scheduleFlavor(this._flavors.uncached);
    }
    if (this._flavors.cached) {
        scheduleFlavor(this._flavors.cached);
    }
};

// Kicks off the runs of the test, generating a perf report of the ran test in
// the end.
Test.prototype._report = function (only) {
    var bdescribe = only ? fdescribe : describe;
    bdescribe(`Suite=${this._suiteName}, Test=${this._name}`, function () {
        beforeAll(this._beforeTest.bind(this));
        this._done();
        afterAll(function () {
            this._afterTest();
            this._reportBounds();
        }.bind(this));
    }.bind(this));
};

// Creates an event object.
Test.prototype._createEvent = function(suffix, runId, startMs, endMs) {
    return {
        id: newGuid(),
        suite: this._suiteName,
        test: this._name + suffix,
        runId: runId,
        startEpochMs: startMs,
        endEpochMs: endMs,
        metric: 'duration_ms',
        val: endMs - startMs
    };
};

// Captures traces for a given event.
Test.prototype._captureEvent = function (output, event) {
    var seleniumLogs = timelinePlugin.testTimeline;
    return perfReader.getDebugLog(event.startEpochMs)
        .then(function(debugLogs) {
            var dbg = {
                logs: debugLogs,
                selenium: seleniumLogs
            };
            var writeTrace = this._writeTrace.bind(this, event, dbg);
            return output.addRun(event)
                .then(output.addDbg.bind(output, event.id, dbg))
                .then(writeTrace);
        }.bind(this));
};

// Captures traces for all the tracked actions from the latest test run.
Test.prototype._captureSubActions = function (runData) {
    var runId = runData.runId;
    if (runData.subActionTimings.length === 0) {
        return protractor.promise.fulfilled(true);
    }
    var capturePromises = [];
    runData.subActionTimings.forEach(function (action) {
        var event = this._createEvent(
            '-' + action.name + runData.suffix,
            runId,
            action.start,
            action.end);
        capturePromises.push(this._captureEvent(this._output, event));
    }.bind(this));
    return protractor.promise.all(capturePromises);
};

// Captures end to end traces of the latest run.
Test.prototype._captureEndToEnd = function(runData) {
    var runId = runData.runId;
    var event = this._createEvent(
        runData.suffix,
        runId,
        runData.timing.start,
        runData.timing.end);
    return this._captureEvent(this._output, event);
};

// Captures traces (tracked actions and end to end) of the latest run.
Test.prototype._capture = function(runData) {
    runData.timing.end = epochMs();
    runData.success = true;
    return this._captureSubActions(runData)
        .then(this._captureEndToEnd.bind(this, runData))
        .then(perfReader.reset);
};

// Returns a function that executes all @actions and writes outputs to @_writer.
Test.prototype._newRun = function(runData) {
    if (!this._actions || this._actions.length === 0) {
        throw new Exception('No actions specified for %s', this._name);
    }
    var d = null;
    // Run data corresponding to the currently active run.
    runData.timing.start = epochMs();
    console.log('[%s] Begin %s ...',
                moment(runData.timing.start).format('MM-DD HH:mm:ss.SSS'),
                this._suiteName + '-' + this._name + runData.suffix);
    var args = [].slice.call(arguments, 1);
    // Appends actions to executed after events scheduled in @d.
    var next = function(action) {
        if (d) {
            d = d.then(action);
            return;
        }
        // If no action has been started yet, start the first scheduled
        // action to get deferred.
        var result = action.apply(this, args);
        if (result.then) {
            d = result;
        } else {
            args = [result];
        }
    };
    for (var i = 0; i < this._actions.length; ++i) {
        var action = this._actions[i];
        next(action.bind(this, runData));
    }
    next(this._capture.bind(this, runData));
    return d;
};

// Writes trace output to @tracedir().
Test.prototype._writeTrace = function(event, dbg) {
    if (!shouldGenerateTrace()) {
        var deferred = protractor.promise.defer();
        deferred.fulfill(true);
        return deferred.promise;
    }

    var putTraceRequest = traceUtil.parseTraceEvent(clientName(), event, dbg);
    traceUtil.writeTrace(inTracedir(), putTraceRequest);
    return traceUtil.syncTrace(
        browser.params.backendHost,
        browser.params.backendPort,
        browser.params.backendHttps,
        putTraceRequest,
        outTracedir()
    );
};

//////////////////////////////// OutputCaptor ///////////////////////////////////

// Status enums for tests written as output.
var TEST_PASSED = 'PASSED';
var TEST_IMPROVED = 'IMPROVED';
var TEST_REGRESSED = 'REGRESSED';
var TEST_FAILED = 'FAILED';

// OutputCaptor captures output of all test runs and writes formatted results to
// provided output dir as CSV.
function OutputCaptor() {
    fs.ensureDirSync(outdir());
    // Schema of runs.csv generated by benchmark.
    this._outputFields = {
        id: 0,  // string
        jenkinsId: 1,  // int64
        suite: 2,  // string
        test: 3,  // string
        serverName: 4,  // string
        serverSha: 5,  // string
        clientName: 6,  // string
        clientSha: 7,  // string
        tag: 8,  // string
        user: 9,  // string
        dataset: 10,  // string
        runId: 11,  // int
        startEpochMs: 12,  // int64
        endEpochMs: 13,  // int64
        rundate: 14,  // datetime
        metric: 15,  // string
        val: 16  // float
    };
    // Schema of the dbg.csv generated by benchmark.
    this._dbgFields = {
        id: 0,  // string
        requestId: 1,  // string
        metric: 2,  // string
        val: 3,  // float
        stringVal: 4  // string
    };
    // Schema for report.csv generated by benchmark.
    this._reportFields = {
        suite: 0,  // string
        test: 1,  // string
        status: 2,  // string (REGRESSED|IMPROVED|PASSED|FAILED)
        metric: 3,  // string (Name of the metric being tracked)
        val: 4,  // float (Value of the metric)
        lb: 5,  // float (Defined lower bound on metric)
        ub: 6  // float (Defined upper bound on metric)
    };
    this._runs = this._createCsvStream(
        path.join(outdir(), 'runs.csv'), this._outputFields);
    this._dbg = this._createCsvStream(
        path.join(outdir(), 'dbg.csv'), this._dbgFields);
    this._report = this._createCsvStream(
        path.join(outdir(), 'report.csv'), this._reportFields);
}

// Returns a csv stream that writes its output to @filename.  Created cvs file
// has @headers as its output column.
OutputCaptor.prototype._createCsvStream = function(filename, headers) {
    var fields = Object.keys(headers);
    Array.prototype.sort(fields, function(h1, h2) {
        return headers[h1] < headers[h2];
    });
    var fileExists = true;
    try {
        fs.statSync(filename);
    } catch (ex) {
        console.log('exception=%s', ex);
        fileExists = false;
    }
    var writer = csv({
        headers: fields,
        sendHeaders: !fileExists
    });
    var file = fs.createWriteStream(filename, { flags: 'a' });
    writer.pipe(file);
    return writer;
};

// Returns a wrapper around OutputCaptor that obviates passing suite name as
// argument.
OutputCaptor.prototype.newSuite = function(suite) {
    return new SuiteOutput(this, suite);
};

// SuiteOutput is a wrapper around OutputCaptor that obviates passing suite name
// as argument to all it's method.
function SuiteOutput(outputCaptor, suite) {
    this._output = outputCaptor;
    this._suite = suite;
}

// Adds a row to run.csv with provided values.
SuiteOutput.prototype.addRun = function(event) {
    console.log('[%s] Done %s in %sms ...',
                moment(event.endEpochMs).format('MM-DD HH:mm:ss.SSS'),
                this._suite + '-' + event.test,
                (event.endEpochMs - event.startEpochMs).toFixed(3));
    var deferred = protractor.promise.defer();
    var finish = function () {
        this._output._runs.removeListener('error', finish);
        deferred.fulfill(true);
    }.bind(this);
    var row = {
        id: event.id,
        jenkinsId: jenkinsId(),
        suite: this._suite,
        test: event.test,
        serverName: browser.params.backendHost,
        serverSha: SERVER_SHA,
        clientName: clientName(),
        clientSha: CLIENT_SHA,
        tag: tag(),
        user: username(),
        dataset: datasetName(),
        runId: event.runId,
        startEpochMs: event.startEpochMs,
        endEpochMs: event.endEpochMs,
        rundate: Math.floor(event.startEpochMs / 1000),
        metric: event.metric,
        val: event.val
    };
    this._output._runs.on('error', finish);
    this._output._runs.write(row, undefined, finish);
    return deferred.promise;
};

// Writes debug output of a test run to debug output stream.
SuiteOutput.prototype.addDbg = function(id, dbg) {
    var logs = dbg.logs;
    var debugWriter = this._output._dbg;
    var deferred = protractor.promise.defer();
    var finish = function () {
        deferred.fulfill(true);
        debugWriter.removeListener('error', finish);
    };
    debugWriter.on('error', finish);
    if (!logs || logs.length === 0) {
        finish();
        return deferred.promise;
    }
    var expected = 0;
    var written = 0;
    var done = function() {
        ++written;
        if (written === expected) {
            finish();
        }
    };
    for (var i = 0; i < logs.length; ++i) {
        var flattened = perfReader.flattenObject(logs[i]);
        Object.keys(flattened).forEach(function (key) {
            var val = flattened[key];
            var debug = {
                id: id,
                requestId: i,
                metric: key
            };
            if (lodash.isNumber(val)) {
                debug.val = val;
            } else if (val) {
                debug.stringVal = val.toString();
            }
            ++expected;
            debugWriter.write(debug, undefined, done);
        });
        var dump = {
            id: id,
            requestId: i,
            metric: 'dbg',
            stringVal: JSON.stringify(logs[i])
        };
        ++expected;
        debugWriter.write(dump, undefined, done);
    }
    return deferred.promise;
};

// Adds a row to report.csv with provided values.
SuiteOutput.prototype.addSuccessReport = function(test, metric, val, lb, ub) {
    var deferred = protractor.promise.defer();
    var finish = function () {
        this._output._report.removeListener('error', finish);
        deferred.fulfill(true);
    }.bind(this);
    var row = {
        suite: this._suite,
        test: test,
        status: this._getStatus(val, lb, ub),
        metric: metric,
        val: val,
        lb: lb,
        ub: ub
    };
    this._output._report.on('error', finish);
    this._output._report.write(row, undefined, finish);
    return deferred.promise;
};

// Adds a row to report for failed test.
SuiteOutput.prototype.addFailReport = function(test) {
    var deferred = protractor.promise.defer();
    var finish = function () {
        this._output._report.removeListener('error', finish);
        deferred.fulfill(true);
    }.bind(this);
    var row = {
        suite: this._suite,
        test: test,
        status: TEST_FAILED
    };
    this._output._report.on('error', finish);
    this._output._report.write(row, undefined, finish);
    return deferred.promise;
};

// Returns status for @val with bounds as [lb, ub].
SuiteOutput.prototype._getStatus = function(val, lb, ub) {
    if (val < lb) {
        return TEST_IMPROVED;
    }
    if (val > ub) {
        return TEST_REGRESSED;
    }
    return TEST_PASSED;
};

///////////////////////////////////////////////////////////////////////////////

// Suite encapsulates a series of tests that are run together.
function Suite(suiteName, output) {
    this._suiteName = suiteName;
    this._output = output;
    this._tests = [];
}

// Registers a new test to be benchmarked.
//
// @suiteName: Name of the suite running this benchmark.
// @name: Name of the test.
Suite.prototype.register = function(testName, only) {
    var test = new Test(testName, this._suiteName, this._output, only);
    test.onlyOnce(onlyOnce());
    this._tests.push(test);
    return test;
};

// Same as `register`, but if any of the tests are registered via `iregister`,
// only those tests are run, otherwise all the registered tests are run.
Suite.prototype.iregister = function(testName) {
    this.register(testName, true);
};

// Kicks off the runs of the registered tests, generating a perf report of
// the ran tests in the end.
Suite.prototype.report = function (only) {
    lodash.forEach(this._tests, function (test) {
        test._report(only);
    });
};

// Same as `report` but if any of the suite's has been called with `ireport`
// only those suites will be run, otherwise all the suites will be run.
Suite.prototype.ireport = function () {
    this.report(true);
};

////////////////////////////////////////////////////////////////////////////////

// Benchmark framework lets users specify and run perf tests within protractor
// environment.
//
// Sample usage:
//
// var benchmark = require('benchmark.js');
// var suite = benchmark.suite('saved-answer');
// suite.register('answer-name')
//   .before(function() { base.goToAnswerListPage(); })
//   // Multiple steps (then and sthen) can be added between before and after.
//   // Traces of these steps is measured as the duration of the test. Steps in
//   // sthen are traced separately.
//   .then(function() { base.openAnswer(); })
//   .sthen('sage_bar_type', function() {
//      sage.sageInputElement.type('revenue color');
//      answer.waitForAnswerToLoad();
//   })
//   .after(function() { base.goToAnswerListPage(); })
//   .report();
// });
//
// NOTE: Each specified test is run multiple times to get performance under
// various scenarios.  Currently, the framework runs each test three times -
//   1. First run captures the test time for average cases.
//   2. Second run captures the test time when results are cached.
//   3. Third run captures the test time when cache in empty.
var outputCaptor = null;
(function Init() {
    outputCaptor = new OutputCaptor();
    fs.ensureDirSync(inTracedir());
    fs.ensureDirSync(outTracedir());
})();

module.exports = {
    suite: function(suitName) {
        return new Suite(suitName, outputCaptor);
    },
    epochMs: epochMs
};
