var os = require('os');
var path = require('path');
var fs = require('fs');
var log4js = require('log4js');
var util = require('util');

var BlinkTestReporter = function(baseReporterDecorator, config, logger, helper, formatError) {
    var successLogger = log4js.getLogger('blink - PASSED');
    var failureLogger = log4js.getLogger('blink - FAILED');
    var skipLogger = log4js.getLogger('blink - SKIPPING');
    var genericLogger = log4js.getLogger('blink');

    this.onBrowserError = function (browser, error) {
        genericLogger.error('Error triggered in browser ', browser);
        console.log(error);
    };

    this.onBrowserLog = function (browser, log, type) {
    };

    var skippedCount = 0;
    this.onSpecComplete = function (browser, result) {
        var specName = result.suite.join(' ') + ' ' + result.description;

        if (result.skipped) {
            skippedCount++;
            return;
        } else if (result.success) {
            successLogger.info('"%s"', specName);
        } else {
            failureLogger.error('"%s"', specName);
            var msg = '';
            result.log.forEach(function(log) {
                msg += formatError(log, '\t');
            });
            console.log(msg);
        }

        var results = browser.lastResult,
            totalExecuted = results.success + results.failed;
        if (!skippedCount) {
            genericLogger.info('Completed %d of %d tests', totalExecuted, results.total);
        } else {
            genericLogger.info('Completed %d of %d tests, skipped %d tests', totalExecuted, results.total, skippedCount);
        }
    };

    this.onBrowserComplete = function() {};

    this.onRunStart = function(browsers) {
    };

    this.onRunComplete = function(browsers, results) {
        if (browsers.length >= 1 && !results.disconnected) {
            var logPreamble = '';
            if (config.reportingSetName) {
                logPreamble = util.format('Set: %s -', config.reportingSetName);
            }
            if (!results.failed) {
                if (!skippedCount) {
                    genericLogger.info('%s TOTAL: %d PASSED', logPreamble, results.success);
                } else {
                    genericLogger.info('%s TOTAL: %d PASSED, %d SKIPPED', logPreamble, results.success, skippedCount);
                }
            } else {
                if (!skippedCount) {
                    genericLogger.error('%s TOTAL: %d FAILED, %d PASSED', logPreamble, results.failed, results.success);
                } else {
                    genericLogger.error('%s TOTAL: %d FAILED, %d PASSED, %d SKIPPED', logPreamble, results.failed, results.success, skippedCount);
                }
            }
        }
    };
};

BlinkTestReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:blinkTestReporter': ['type', BlinkTestReporter]
};
