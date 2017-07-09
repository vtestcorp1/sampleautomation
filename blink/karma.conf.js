/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview This file contains all the logic around hosting a local proxy server
 * for testing local client changes.
 */

"use strict";

var sourceFiles = require('./setup/grunt-helpers/source-files.js');
var StaticServer = require('static-server');
var appServer = new StaticServer({
    rootPath: './app',
    port: 8002
});
appServer.start(function () {
    console.log('Server listening to', appServer.port);
});
var nodeModulesServer = new StaticServer({
    rootPath: './node_modules',
    port: 8006
});
nodeModulesServer.start(function () {
    console.log('Server listening to', nodeModulesServer.port);
});

var files = sourceFiles.staticLibFiles
    .concat(sourceFiles.dynamicLibFiles)
    .concat(sourceFiles.unitHelperFiles);

module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '',

        // url root
        urlRoot: '/karma',

        // frameworks to use
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: files,

        // list of files / patterns to load in the browser
        exclude: sourceFiles.unitTestExclusions,

        proxies: {
            '/': 'http://localhost:8002/',
            '/node_modules': 'http://localhost:8006/'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Display the output of console.log to stdout.
        captureConsole: true,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['Chrome'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'app/src/**/!(*spec).js': 'coverage'
        },

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};
