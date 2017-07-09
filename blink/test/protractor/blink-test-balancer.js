'use strict';

var curl = require('curlrequest');
var syncRequest = require('sync-request');

/**
 * This class abstracts the test load distribution.
 *
 * Blink maintains a server that tracks results from past runs on a server
 * which are used to distribute test files across parallel runs such that
 * expected time of each run is even.
 * Goal here is to distribute files such that test run time is minimized.
 * NOTE: TestMode is critical as we can have different run times per file
 * based on filters applied in the test mode.
 *
 * @param server Address of the server maintaining historical data.
 * @param testMode Name of the test type.
 * @constructor
 */
var TestBalancer = function(server, testMode) {
    this.server = server;
    this.testMode = testMode;
    this.tracker = {};
    this.tracker.byFiles = {};
};

/**
 *
 * @param files Flat list of all the files to be used in the test run
 * @param numShards number of shards to distribute load.
 */
TestBalancer.prototype.distributeFiles = function(files, numShards) {
    let results = [];
    let durations = this._tryToFetchTestReport();
    if (Object.keys(durations).length === 0) {
        durations.getDuration = function () {
            return 1;
        }
    } else {
        // Since the file names provided here are absolute path, and the path
        // reported to server are relative to Thoughtspot root directory,
        // we identify the absolute path of the Thoughtspot directory here.
        let blinkPathLeftIndex  = this._computeIndex(Object.keys(durations), files);
        console.log('Thoughtspot Root Dir', files[0].substr(0, blinkPathLeftIndex),
            'index', blinkPathLeftIndex);
        durations.getDuration = function (fileName) {
            fileName = fileName.substr(blinkPathLeftIndex);
            return this[fileName] || 1;
        }
    }

    files = files.sort((a, b) => {
        return durations.getDuration(b) - durations.getDuration(a);
    });
    let totalDurations = [];
    for (let i = 0; i < numShards; i++) {
        results.push([]);
        totalDurations.push(0);
    }
    for (let i = 0; i < files.length; i++) {
        let min = Number.MAX_SAFE_INTEGER;
        let minShard = 0;
        for (let j = 0; j <= results.length; j++) {
            if (totalDurations[j] < min) {
                min = totalDurations[j];
                minShard = j;
            }
        }
        results[minShard].push(files[i]);
        totalDurations[minShard] += durations.getDuration(files[i]);
    }
    console.log("sharding repartition", results);
    console.log("sharding total time", totalDurations);

    return results;
};

TestBalancer.prototype.addResult = function(fileName, time) {
    this.tracker.byFiles[fileName]
        ? this.tracker.byFiles[fileName] += time
        : this.tracker.byFiles[fileName] = time;
};

TestBalancer.prototype.postResultsToServer = function () {
    var shouldPostData = Object.keys(this.tracker.byFiles).length > 0;
    if (!shouldPostData) {
        console.log('There are no specs results recorded');
        return;
    }

    if (!this.server) {
        console.log('No blink report server defined');
        return;
    }

    var serverAddress = `http://${this.server}/report/${this.testMode}`;

    console.log('Post test run data to ', serverAddress, ' test mode is ', this.testMode);
    console.log('post content', this.tracker.byFiles);

    var options = {
        data: JSON.stringify(this.tracker.byFiles),
        headers: {"Content-Type": "application/json"},
        url: serverAddress,
        include: true
    };

    return new Promise(function(resolve, reject){
        curl.request(options, function (err, parts) {
            if (err) {
                console.log('Sharding Request failed', err);
                // do not propagate the error
                resolve();
            } else {
                console.log("Sharding Request successful");
                resolve();
            }
        });
    });
};

TestBalancer.prototype._tryToFetchTestReport = function() {
    try{
        if (this.server) {
            var result = syncRequest('GET', `http://${this.server}/report/${this.testMode}`, {
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
};

TestBalancer.prototype._computeIndex = function(durations, specs) {
    var index = -1;
    for (var i = 0; i < specs.length && index === -1; i++) {
        for (var j = 0; j < durations.length && index === -1; j++ ) {
            index = specs[i].indexOf(durations[j])
        }
    }
    return index;
};

module.exports = {
    TestBalancer: TestBalancer
};
