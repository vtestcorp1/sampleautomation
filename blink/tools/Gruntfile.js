/*global module:false*/

var thriftGenerator = require('../scripts/generate-sources.js');
var exec = require('child_process').exec;

module.exports = function (grunt) {

    'use strict';

    grunt.registerTask('gen-thrift', function () {
        var done = this.async();
        var thriftBin = thriftGenerator.getThriftBinPath();
        exec(thriftBin + ' -gen js:node ../../thrift/sage.thrift', function (err, stdout, stderr) {
            done();
        });
    });
};
