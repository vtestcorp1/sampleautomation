/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var Builder = require('systemjs-builder');

// optional constructor options
// sets the baseURL and loads the configuration file
var builder = new Builder();

builder.config({
    baseURL: 'node_modules',
    packages: {
        './target/app/app/src': {
            format: 'system',
            defaultExtension: 'js'
        },
        './app/resources/strings/strings': {
            defaultExtension: false
        }
    },
    paths: {
        'src/*' : './target/app/app/src/*',
        'app/src/*' : './target/app/app/src/*',
        'translations': './app/resources/strings/strings'
    },
    packageConfigPaths: ['./node_modules/*/package.json']
});

builder
    .bundle('app/src/base/bootstrap.js', './target/app/js/system-app.min.js', {
        sourceMaps: true,
        minify: true,
        externals: ['translations'],
        normalize: true
    })
    .then(function() {
        console.log('Build complete');
    })
    .catch(function(err) {
        console.log('Build error');
        console.log(err);
    });
