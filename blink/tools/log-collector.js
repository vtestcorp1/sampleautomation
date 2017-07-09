/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @collectLogs function for collecting and parsing logs after
 * running e2e test suite on multiple hosts in parallel using
 * grunt e2e-multihost command.
 */

var util = require('util');
var os = require('os');
var fs = require('fs');
var path = require('path');

var ERRORS_TEMPLATE = "Errors:\n\n\n%s";

var SUMMARY_TEMPLATE = "Test results:\n" +
    "Total executed: %s\n" +
    "Passed: %s\n" +
    "Failed: %s\n" +
    "Skipped: %s\n";

var ERROR_TEMPLATE = "-----------------------------------------------------\n" +
    "%s\n" +
    "-----------------------------------------------------\n";

var ERROR_REGEX = /(\[ERROR\] blink - FAILED - [\s\S]+?)\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\]/gm;
var TOTAL_REGEX = /^.+-\s*TOTAL: (.+)$/gm
var TEST_REGEX = /blink - (FAILED|PASSED) - \".+ \[(.+\.js)\]\"/g
var RUNNING_REGEX = /Running "karma:e2e\d*"/g

function tabs(size) {
    var result = "";
    for (var i = 0; i < size; i++) {
        result += "\t";
    }
    return result;
}

function printPerFileSummary(stats, grunt) {
    /*
     * Prints a tree folder structure with
     * (failed/passed) summary for each test file
     */
    keys = Object.keys(stats);
    keys.sort(function (path1, path2) {
        if (path1.split('/').length != path2.split('/').length) {
            return path1.split('/').length - path2.split('/').length;
        } else {
            return path1.localeCompare(path2);
        }
    });
    path = [];
    grunt.log.writeln("Test run drilldown (failed/passed):")
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i].split('/');
        var j = 0;
        while (j < key.length - 1) {
            if (j < path.length && path[j] == key[j]) {
                j++;
                continue;
            } else if (j < path.length) {
                path = path.slice(0, j);
            }
            path.push(key[j]);
            grunt.log.writeln(tabs(path.length - 1) + key[j]);
            j++;
        }
        grunt.log.writeln(
                tabs(path.length) + key[key.length - 1] + ' - ' +
                '(' + stats[keys[i]].failed + '/' +
                stats[keys[i]].passed + ')'
            )
    }
}

function printSummary(total, totalPassed, totalSkipped, totalFailed, perFileStats, errors, grunt) {
    if (totalFailed) {
        grunt.log.writeln(util.format(ERRORS_TEMPLATE, errors));
    }
    grunt.log.writeln(util.format(SUMMARY_TEMPLATE, total, totalPassed, totalFailed, totalSkipped));
    printPerFileSummary(perFileStats, grunt);
};

function collectLogs(numHosts, grunt, logDir) {
    // This function:
    // - parses logs from each test run (for each host)
    // - summarizes the number of tests ran, passed, failed or skipped
    // - extracts the errors and prints them before the summary
    // - prints summary
    // - fails if there're errors
    grunt.log.writeln("Collecting logs...");
    var total = 0,
        totalPassed = 0,
        totalSkipped = 0,
        totalFailed = 0,
        perFileStats = {},
        skippedLogs = 0;
    var errors = "";
    for (var i = 0; i < numHosts; i++) {
        var tmpdir = os.tmpDir();
        var logFn = path.join(logDir, '/grunt_parallel_log_' + i);
        var log = fs.readFileSync(logFn, 'utf8');
        grunt.log.writeln(log);
        var match = ERROR_REGEX.exec(log);
        while (match) {
            errors += util.format(ERROR_TEMPLATE, match[1]);
            match = ERROR_REGEX.exec(log);
        }
        // Parse summary lines from each log to print a global
        // summary
        var totalLines = log.match(TOTAL_REGEX);
        var runningLines = log.match(RUNNING_REGEX);
        // We expect at least one total line in each log file
        // And number of e2eSets started must match the number
        // of totalLines found, otherwise we consider this log
        // inconsistent and skip parsing
        if (!totalLines || !runningLines || (totalLines.length != runningLines.length)) {
            grunt.log.error("Unable to parse log from " + logFn);
            grunt.log.writeln("Printing log contents:\n");
            grunt.log.writeln(log);
            skippedLogs += 1;
            continue;
        }
        for (var j = 0; j < totalLines.length; j++) {
            var totalLine = totalLines[j];
            match = /(\d+) FAILED/.exec(totalLine);
            if (match) {
                total += parseInt(match[1], 10);
                totalFailed += parseInt(match[1], 10);
            }
            match = /(\d+) PASSED/.exec(totalLine);
            if (match) {
                total += parseInt(match[1], 10);
                totalPassed += parseInt(match[1], 10);
            }
            match = /(\d+) SKIPPED/.exec(totalLine);
            if (match) {
                totalSkipped += parseInt(match[1], 10);
            }
        }
        // Parse each test log output for detailed per-file summary
        testOutput = TEST_REGEX.exec(log);
        while (testOutput) {
            // test_name is a file name
            test_name = testOutput[2];
            // FAILED or PASSED
            test_status = testOutput[1];
            if (!perFileStats.hasOwnProperty(test_name)) {
                perFileStats[test_name] = { failed: 0, passed: 0 }
            }
            if (test_status === 'FAILED') {
                perFileStats[test_name].failed += 1;
            } else {
                perFileStats[test_name].passed += 1;
            }
            testOutput = TEST_REGEX.exec(log);
        }
    }
    printSummary(total, totalPassed, totalSkipped, totalFailed, perFileStats, errors, grunt);
    if (!!skippedLogs) {
        grunt.log.error("Some logs were skipped.");
        grunt.log.error("Total number of tests in summary info may be less than actual number of tests ran.");
        grunt.log.error("Please check the full log for detailed failure information.");
        grunt.log.error("Number of skipped logs: " + skippedLogs);
    }
    if (totalFailed || skippedLogs) {
        grunt.fail.fatal("Not all tests passed");
    }
};

module.exports = {
    collectLogs: collectLogs
}
