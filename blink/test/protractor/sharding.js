'use strict';

var glob = require('glob');
var path = require('path');
var process = require('process');
var curl = require('curlrequest');
var request = require('sync-request');
var _= require('lodash');

function parseParam(paramName) {
    var argv = process.argv;
    for (var i = 2; i < argv.length; i++) {
        if (argv[i] == paramName) {
            return argv[i + 1];
        }
        if (argv[i].startsWith(paramName + '=')) {
            return argv[i].split('=')[1];
        }
    }
    return undefined;
}

var tracker = {};

function parseCapabilities() {
    var paramName = '--capabilities.';
    var argv = process.argv;
    var result = {};
    for (var i = 2; i < argv.length; i++) {
        if (argv[i].startsWith(paramName)) {
            if (argv[i].indexOf('=') !== -1) {
                var capName = argv[i].split(paramName)[1].split('=')[0];
                result[capName] = argv[i].split('=')[1];
            } else {
                result[argv[i].split(paramName)[1]] = argv[i + 1];
            }
        }
    }
    return result;
}

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

function tryToFetchTestReport(testMode) {

    try{
        if (process.env.BLINK_REPORT_SERVER) {
            let server = process.env.BLINK_REPORT_SERVER;
            let result = request('GET', `http://${server}/report/${testMode}`, {
                'headers': {
                    'Content-Type': 'application/json'
                }
            });
            if (result.statusCode === 200) {
                return JSON.parse(result.getBody('utf-8'));
            }
        }
    } catch (e) {
        console.log('Error trying to fetch test report', e);
    }

    return {};
}

function computeIndex(durations, specs) {
    var index = -1;
    for (var i = 0; i < specs.length, index == -1; i++) {
        for (var j = 0; j < durations.length, index == -1; j++ ) {
            index = specs[i].indexOf(durations[j])
        }
    }
    return index;
}


function shardSpecs(specs, numShards, testMode) {
    let allSpecs = resolveSpecPatterns(specs);
    let perShard = allSpecs.length / numShards;
    let results = [];
    let durations = tryToFetchTestReport(testMode);
    if (Object.keys(durations).length === 0) {
        durations.getDuration = function (fileName) {
            return 1;
        }
    } else {
        let blinkPathLeftIndex  = computeIndex(Object.keys(durations), allSpecs);
        console.log('find index', blinkPathLeftIndex);
        durations.getDuration = function (fileName) {
            fileName = fileName.substr(blinkPathLeftIndex);
            return this[fileName] || 1;
        }
    }

    allSpecs = allSpecs.sort((a, b) => {
        return durations.getDuration(b) - durations.getDuration(a);
    });
    let totalDurations = [];
    for (let i = 0; i < numShards; i++) {
        results.push([]);
        totalDurations.push(0);
    }
    for (let i = 0; i < allSpecs.length; i++) {
        let min = Number.MAX_SAFE_INTEGER;
        let minShard = 0;
        for (let j = 0; j <= results.length; j++) {
            if (totalDurations[j] < min) {
                min = totalDurations[j];
                minShard = j;
            }
        }
        results[minShard].push(allSpecs[i]);
        totalDurations[minShard] += durations.getDuration(allSpecs[i]);
    }
    console.log("sharding repartition", results);
    console.log("sharding total time", totalDurations);

    return results;
}

function shardTestsAcrossCapabilities(
    specs,
    commonTestUtils,
    browser,
    desiredCapabilities,
    testMode
) {
    var specs = specs || [];
    var browser = parseParam('--browser') || browser;
    browser = browser.replace("\"", "");
    var backends = parseParam('--params.hosts');
    if (!backends) {
        return [];
    }
    backends = backends.split(",");
    var shards = shardSpecs(specs, backends.length, testMode);
    // common test utils must execute on each shard.
    shards.forEach(function(shard) {
        Array.prototype.push.apply(shard, commonTestUtils);
    });

    var passedCapabilities = parseCapabilities();
    var namePrefix = "";
    if (process.env.BUILD_ID) {
        namePrefix = '[' + process.env.BUILD_ID + ']';
    }
    return backends.map(function (backend, i) {
        return _.extend({
            'browserName': browser,
            'name': namePrefix + 'thread-' + i,
            'backendUrl': backend,
            'specs': shards[i]
        }, passedCapabilities, desiredCapabilities);
    });
}

function hasShardingDataToSend() {
    return  tracker && tracker.bySpecs &&
            Object.keys(tracker.bySpecs).length > 0 &&
            Object.keys(tracker.byFiles).length > 0;
}

module.exports = {
    shardTestsAcrossCapabilities: shardTestsAcrossCapabilities,
    parseBackends: function () {
        var result = parseParam("--params.hosts");
        if (!result) {
            return [];
        }
        return result.split(",");
    },
    initTracker: function() {
        console.log('Resetting tracker...');
        tracker = {
            byFiles: {},
            bySpecs: {}
        };
    },
    addResultToTracker: function(specName, fileName, time) {
        tracker.bySpecs[specName] = time;
        tracker.byFiles[fileName] ?
            tracker.byFiles[fileName] += time
            : tracker.byFiles[fileName]  = time;
    },
    postTracker: function(testMode) {
        if (!hasShardingDataToSend() ) {
            console.log('There are no specs results recorded');
            return;
        }

        let server = process.env.BLINK_REPORT_SERVER;

        if (!server || server.length === 0) {
            console.log('No blink report server defined');
            return;
        }

        let serverAddress = `http://${server}/report/${testMode}`;

        console.log('should post to ', serverAddress, ' test mode is ',testMode);
        console.log('post content', tracker.byFiles);

        var options = {
            data: JSON.stringify(tracker.byFiles),
            headers: {"Content-Type": "application/json"},
            url: serverAddress,
            include: true
        };

        return new Promise(function(resolve, reject){
            curl.request(options, function (err, parts) {
                if (err) {
                    console.log('Sharding Request failed', err);
                    // do not propagate the error
                    resolve()
                } else {
                    console.log("Sharding Request successful");
                    resolve();
                }
            });
        });
    }
};
