/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview An script to to extract all the protract test IDs from the source code.
 */

var fs = require('fs');
var vm = require('vm');
var _ = require('lodash');

// Returns a list of absolute path of files within a given directory.
var walkSync = function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};

// Capitalize each word, and remove all spaces and other non alphanumeric characters.
var sanitizeName = function(name) {
    return name
        .replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        })
        .replace(/\W/g, '');
};


var handler = {
    get: function(target, name) {
        return new Proxy(_.noop, handler);
    },
    apply: function(target, name) {
        return new Proxy(_.noop, handler);
    }
};

// Creating a infinite proxy object, this will allow p.foo().bar.etc().. to not throw any error.
var proxy = new Proxy(_.noop, handler);

// We prefix the ID of each test with the description given to it's parent describe() block.
var testIDPrefix;
var testIDs = [];


var processTest = function(desc, test) {
    testIDs.push(testIDPrefix + '_' + sanitizeName(desc));
};
var processSuite = function(desc, suite) {
    testIDPrefix = sanitizeName(desc);
    suite();
};

var sandbox = {
    require: proxy,
    beforeEach: proxy,
    afterEach: proxy,
    beforeAll: proxy,
    afterAll: proxy,

    describe: processSuite,
    xdescribe: processSuite,
    fdescribe: processSuite,

    it: processTest,
    xit: processTest,
    fit: processTest
};
var context = vm.createContext(sandbox);

var allFiles = walkSync(__dirname + '/../test/protractor/scenarios/');
allFiles.forEach(function(file) {
    if (_.endsWith(file, '-scenarios.js')) {
        var script = new vm.Script(fs.readFileSync(file));
        script.runInContext(context);
    }
});


// Print on standard output
console.log(testIDs.join('\n'));