"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var glob = require('glob');
var jasminePatcher = require('./jasmine-patcher');
var jasmineReporters = require('jasmine-reporters');
var lodash = require('lodash');
var paramUtil = require('../../scripts/param-util');
var path = require('path');
var remote = require('selenium-webdriver/remote');
var SpecReporter = require('jasmine-spec-reporter');
var VideoReporter = require('protractor-video-reporter');
var TestBalancer = require('./blink-test-balancer.js').TestBalancer;
var URI = require('urijs');

var BROWSER_WIDTH = 1800;
var BROWSER_HEIGHT = 1200;
// This is used by protractor for async scripts to finish
// wait for angular to settle.
var PROTRACTOR_ALL_SCRIPTS_TIMEOUT = 180000;
var SINGLE_TEST_TIMEOUT = 300000;
var BROWSER = 'chrome';
var BASE_URL = 'http://localhost:8000';
var HOME_URL = BASE_URL;

// TODO(Jasmeet):
// Utility to shard tests by the history of their run times.
// After each run, test run times are reported by file names to
// blinkReportServer, and that data is utilized to distribute the spec files
// so that they take roughly equal times.
var testBalancer;
// The endpoint identifier to report test run times to.
var testMode;

var URL_QUERY = {
    e2eTest: true,
    trackPerformance: true,
    enableAnswers: true,
    disableSuccessNotificationAutoHide: true
};

function resolveSpecPatterns(patterns) {
    var resolvedFiles = [];
    var cwd = process.cwd();
    patterns.forEach(function (fileName) {
        var matches = glob.sync(fileName, { cwd: cwd });
        matches.forEach(function (match) {
            var resolvedPath = path.resolve(cwd, match);
            resolvedFiles.push(resolvedPath);
        });
    });
    return resolvedFiles;
}

// This is the list of all useful params.
var params;
function getParams() {
    if (!params) {
        params = {};
        var inputParams = paramUtil.getArguments();
        console.log(inputParams);
        params.browserName = lodash.get(inputParams, 'browser', BROWSER);
        params.hosts = lodash.get(inputParams, 'params.hosts');
        params.baseUrl = lodash.get(inputParams, 'params.baseUrl');
        params.failedSpecs  = lodash.get(inputParams, 'failedSpecs', void 0);
        params.testAttempt = lodash.get(inputParams, 'testAttempt', 0);
    }
    return params;
}

function getBaseConfigParamsOverride() {
    var params = getParams();
    var overrides = {};
    if (!!params.browserName) {
        overrides.browserName = params.browserName;
    }
    return overrides;
}

function getCapabilitiesParamsOverride() {
    var cliArgs = paramUtil.getArguments();
    var passedCapabilities = cliArgs['capabilities'];
    var overrideCapabilities = passedCapabilities ? passedCapabilities : {};
    var paramBrowser = cliArgs['browser'];
    if (paramBrowser) {
        overrideCapabilities.browserName = paramBrowser;
    }
    return overrideCapabilities;
}

// These settings are set in the environment of the system running the
// protractor tests.
// These are either baked into the kubernetes or overriden by the job
// in jenkins.
var environmentSettings;
function getEnvironmentSettings() {
    if (!environmentSettings) {
        var env = process.env;
        environmentSettings = {};
        // This server is used to collect run times of tests to be able
        // to shard the tests evenly in subsequent runs.
        environmentSettings.blinkReportServer = env.BLINK_REPORT_SERVER;
        // Test timeout can be overriden in Jenkins job.
        environmentSettings.singleTestTimeout =
            parseInt(env.PROTRACTOR_DEFAULT_TIMEOUT) || SINGLE_TEST_TIMEOUT;
        // These are all settings related to sauce labs.
        environmentSettings.sauce = {};
        environmentSettings.sauce.user = env.SAUCE_USER;
        environmentSettings.sauce.key = env.SAUCE_KEY;
        environmentSettings.sauce.seleniumAddress = env.SAUCE_SELENIUM_ADDRESS;
    }
    return environmentSettings;
}

function getEnvironmentConfigOverrides() {
    var environmentSettings = getEnvironmentSettings();
    var overrides = {};
    if (environmentSettings.sauce.user) {
        overrides.sauceUser = environmentSettings.sauce.user;
    }
    if (environmentSettings.sauce.key) {
        overrides.sauceKey = environmentSettings.sauce.key;
    }
    if (environmentSettings.sauce.seleniumAddress) {
        overrides.sauceSeleniumAddress = environmentSettings.sauce.seleniumAddress;
    }
    if (environmentSettings.singleTestTimeout) {
        overrides.jasmineNodeOpts = {};
        overrides.jasmineNodeOpts.defaultTimeoutInterval = environmentSettings.singleTestTimeout;
    }
    return overrides;
}

function loadApplication() {
    // it takes longer to load app in ie, so waiting for app to be angular page fails
    // set ignoreSynchronization to be true to get around this problem
    browser.ignoreSynchronization = true;
    browser.driver.get(HOME_URL);
    browser.sleep(500);
    browser.manage().deleteAllCookies();
    browser.ignoreSynchronization = false;
}

function onPrepare() {
    return browser.getProcessedConfig().then(function (config) {
        browser.driver.manage().window().setSize(BROWSER_WIDTH, BROWSER_HEIGHT);
        browser.setFileDetector(new remote.FileDetector());

        var multiHostUrl = lodash.get(config, 'capabilities.backendUrl', null);
        if (multiHostUrl) {
            BASE_URL = multiHostUrl;
        } else if (getParams().baseUrl) {
            BASE_URL = getParams().baseUrl;
        }

        var uri = new URI(BASE_URL);
        uri.setQuery(URL_QUERY);
        HOME_URL = uri.toString();
        var jasmineEnv = jasmine.getEnv();
        var environmentSettings = getEnvironmentSettings();

        if (!!environmentSettings.blinkReportServer) {
            jasminePatcher.patchJasmine(jasmineEnv);

            var timeSpecReporter = {
                suiteStarted: function(result) {
                    this.specStartTime = Date.now()
                },
                suiteDone: function(result) {
                    var seconds = Math.floor((Date.now() - this.specStartTime) / 1000);
                    // add the time for the current file
                    var filename = result._filename;
                    // If test status is not finished. Ignore reporting times
                    // for those to test balancer.
                    if (result.status === 'finished') {
                        testBalancer.addResult(filename, seconds);
                    }

                }
            };
            jasmine.getEnv().addReporter(timeSpecReporter);
        }

        var testReportFilePrefix = 'protractor-' + browser.params.label;
        if (config && config.capabilities.name) {
            testReportFilePrefix += '-' + config.capabilities.name;
        }

        var testAttempt = getParams().testAttempt;
        if (!!testAttempt) {
            testReportFilePrefix += '-' + testAttempt;
        }

        jasmineEnv.addReporter(new jasmineReporters.JUnitXmlReporter({
            consolidateAll: true,
            savePath: './test/results/',
            filePrefix: testReportFilePrefix
        }));

        jasmineEnv.addReporter(new SpecReporter({
            displayStacktrace: 'all',
            displayPendingSummary: false
        }));

        if (browser.params.captureFailures === 'true') {
            jasmineEnv.addReporter(new VideoReporter({
                baseDirectory: './test/results/videos/',
                singleVideo: false,
                singleVideoPath: 'fullName',
                ffmpegArgs: [
                    '-y',
                    '-r', '30',
                    '-f', 'x11grab',
                    '-s', '1920x1080',
                    '-i', process.env.DISPLAY,
                    '-g', '300',
                    '-vcodec', 'mpeg4',
                ]
            }));
        }

        loadApplication();
    });
}

function onComplete() {
    console.log('Tests complete!');

    console.log('Browser console error!');
    // http://stackoverflow.com/questions/22082395/
    // view-console-log-output-in-angular-protractor-jasmine-test
    var log = browser.manage().logs();
    if (log.get) {
        log.get('browser').then(function(browserLogs) {
            // browserLogs is an array of objects with level and message fields
            browserLogs.forEach(function(log) {
                if (log.level.value > 900) { // it's an error log
                    console.log(log.message);
                }
            });
        });
    }
    return testBalancer.postResultsToServer();
}

var baseCapabilities = {
    browserName: BROWSER
};

var baseConfig = {
    browserName: BROWSER,
    jasmineNodeOpts: {
        // onComplete will be called just before the driver quits.
        onComplete: null,
        // If true, display spec names.
        isVerbose: false,
        // If true, print colors to the terminal.
        showColors: true,
        // If true, include stack traces in failures.
        includeStackTrace: true,
        // Default time to wait in ms before a test fails.
        defaultTimeoutInterval: SINGLE_TEST_TIMEOUT,
        print: function () {}
    },
    allScriptsTimeout: PROTRACTOR_ALL_SCRIPTS_TIMEOUT,
    onPrepare: onPrepare,
    onComplete: onComplete
};

function buildBaseConfig() {
    lodash.assign(baseConfig, getEnvironmentConfigOverrides(), getBaseConfigParamsOverride());
    return baseConfig
}

function extendBrowserSpecificCapabilities(capabilities) {
    var browserName = capabilities.browserName;
    if (browserName === 'chrome') {
        lodash.assign(capabilities, {
            'chromeOptions': {
                'args': [
                    'enable-automation',
                    'lang=en-US',
                    'enable-precise-memory-info' ,
                    'js-flags=--expose-gc'
                ],
                'prefs': {
                    'download': {
                        'prompt_for_download': false,
                        // Can be changed via command line by providing
                        // --capabilities.chromeOptions.prefs.download \
                        // .default_directory='/home/hudson/desiredDirectory'
                        'default_directory': '/tmp'
                    }
                }
            }
        });
    }
    if (browserName === 'internet explorer') {
        // https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
        lodash.extend(capabilities, {
            enablePersistentHover: false,
            nativeEvents: true,
            unexpectedAlertBehaviour: 'accept',
            ignoreProtectedModeSettings: true,
            requireWindowFocus: true,
            screenResolution: '1680x1050',
            maxDuration: 10800,
            seleniumVersion: '3.3.1',
            iedriverVersion: '3.3.0'
        });
    }
}

function buildCapabilities() {
    lodash.assign(baseCapabilities, getCapabilitiesParamsOverride());
    extendBrowserSpecificCapabilities(baseCapabilities);
    return baseCapabilities;
}

function buildMultiCapabilities(specs, commonTestUtils) {
    var baseCapabilities = buildCapabilities();
    var allFiles = resolveSpecPatterns(specs);
    var backends = getParams().hosts;
    var testFilesSplit = testBalancer.distributeFiles(
        allFiles,
        backends.length
    );
    backends = backends.filter(function(backend, i) {
        return testFilesSplit[i].length > 0;
    });

    testFilesSplit.forEach(function(shard) {
        Array.prototype.push.apply(shard, commonTestUtils);
    });
    var namePrefix = "";
    if (process.env.BUILD_ID) {
        namePrefix = '[' + process.env.BUILD_ID + '] ';
    }

    return backends.map(function (backend, i) {
        return lodash.assign({
            'name': namePrefix + 'thread-' + i,
            'backendUrl': backend,
            'specs': testFilesSplit[i]
        }, baseCapabilities);
    });
}

function BaseConfig(specs, inputTestMode) {
    var envSettings = getEnvironmentSettings();
    testMode = inputTestMode || 'DEFAULT';
    testBalancer = new TestBalancer(envSettings.blinkReportServer, testMode);
    var baseConfig = buildBaseConfig();

    // The base config has all configurations other than capabilities.
    var hosts = getParams().hosts;
    // Protractor flake passes in pruned list of specs as specs.
    var failedSpecs = getParams().failedSpecs;
    if (!!failedSpecs && !Array.isArray(failedSpecs)) {
        failedSpecs = [failedSpecs];
    }
    var effectiveSpecs = failedSpecs || specs;
    var sharded = hosts && hosts.length > 1;
    var cleanScript = __dirname + '/' + 'protractor-cleanup.js';
    if (sharded) {
        lodash.extend(baseConfig, {
            multiCapabilities: buildMultiCapabilities(effectiveSpecs, [cleanScript])
        });
    } else {
        lodash.extend(baseConfig, {
            capabilities: buildCapabilities()
        });
    }

    baseConfig.specs = (sharded) ? [] : [...effectiveSpecs, cleanScript];
    console.log('======================Protractor Base config ======================');
    console.log(baseConfig);
    return baseConfig;
}

module.exports = {
    BaseConfig: BaseConfig,
    HOME_URL: HOME_URL
};
