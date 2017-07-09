/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview This file contains the file-paths for all css, less, ts, js or
 * other resource files being used inside app/tests.
 * These files are used by GruntFile to define various tasks associated with
 * app as well as karma conf to allow running unit tests from the IDE.
 * Note that karma conf does not support '!' notation for exclusions, and all
 * exclusions need to explicitly stated. As karma conf is also a consumer of
 * this file, this file is also not supposed to have any '!' notation.
 */

"use strict";

let libCssFiles = [
    'app/resources/css/lib/**/*.css',
    'node_modules/ng-dialog/css/ngDialog.css',
    'node_modules/ng-dialog/css/ngDialog-theme-default.css',
];

let lessFiles = [
    'app/resources/css/**/*.less',
    'app/src/**/*.less'
];

let allJSFiles = [
    '**/*.js'
];

let staticLibFiles = [
    'app/lib/src/jquery-2.1.1.js',
    'app/lib/src/jquery-migrate-1.2.1.js',
    'app/lib/src/jquery-ui.js',
    'app/lib/src/jquery.event.drag-2.0.min.js',
    'app/lib/src/angular/angular.js',
    'app/lib/src/angular/angular*.js',
    'app/lib/src/bootstrap.js',
    'app/lib/src/bootstrap-datepicker.js',
    'app/lib/src/highstock.js',
    'app/lib/src/moment.min.js',
    'app/lib/src/moment-timezone-with-data.min.js',
    'app/lib/src/highcharts-more.js',
    'app/lib/src/highcharts-heatmap.js',
    'app/lib/src/highcharts-treemap.src.js',
    'app/lib/src/threejs/three.js',
    'app/lib/src/protobufjs/long.js',
    'app/lib/src/linkify/linkify.js',
    'app/lib/src/linkify/linkify-jquery.js',
    'app/lib/src/icu4js/icu4js.src.js',
    'app/lib/src/jszip/jszip.js',
    'app/lib/src/packery/packery.pkgd.js',
    'app/lib/src/packery/draggabilly.pkgd.js',
    'app/lib/src/i18n/browser-locale.js',
    'app/lib/src/**/*.js',
    'app/api/api.js',
    // Done because we do pattern matching on the app/ prefix.
    'app/../node_modules/core-js/client/shim.js',
    'app/../node_modules/systemjs/dist/system.src.js',
    'app/../node_modules/ng-dialog/js/ngDialog.js'
];

let dynamicLibFiles = [
    'app/lib/gen-files/ts-proto.js',
    'app/lib/gen-files/thrift_common_types.js',
    'app/lib/gen-files/AutoCompleteV2_types.js',
    'app/lib/gen-files/AutoCompleteV2.js'
];

let minifiedLibMappings = {
    'app/lib/src/openlayers/openlayers.js':
        'app/lib/min/openlayers/openlayers.min.js'
};

let appFiles = [
    'app/src/base/ui-selectors.js',
    'app/src/base/app.js',
    'app/src/base/flags.js',
    'app/src/base/proto/sage-namespace-translator.js',
    'app/src/base/proto/*.js',
    'app/src/**/*.js',
    'app/.tmp/release-flags-setter.js',
];

let appFilesExcludes = [
    'app/src/**/*-spec.js',
    'app/external/**',
    'app/api/**'
];

let unitHelperFiles = [
    'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
    'test/unit/lib/angular-mocks.js',
    'app/src/base/app.js',
    'target/app/js/templates.js',
    'target/app/js/resource-cache.js',
    'test/unit/base.js',
    'test/unit/**/*.js',
    'app/src/base/flags.js',
    'app/src/base/proto/sage-namespace-translator.js',
    'app/src/base/proto/*',
    'app/src/**/*.js'
];

let lintExcludes = [
    'release/**',
    'app/lib/**',
    'scripts/**',
    'tools/**',
    'test/coverage/**',
    'test/e2e/testdata/**',
    'test/unit/lib/**',
    'test/unit/testdata/**',
    'node_modules/**',
    'target/**',
    'app/src/common/plugins/**',
    'app/resources/strings/translations/*',
    'app/external/**',
    'app/api/**/*.min.js',
    'app/src/modules/formula-editor/formula-examples-data.js',
    'test/e2eQualityPass/testdata/**',
    'karma.conf.js',
    'karma.e2e.conf.js',
    'video_recorder/node_modules/**',
    'app/src/base/csv-parser-service.js',
    'lib/icu4js/build/*.js',
    'app/src/modules/wootric/wootric.js'
];

let allTSFiles = [
    'app/src/**/*.ts'
];

let preCachedResources = [
    'app/src/**/*.glsl'
];

module.exports = {
    libCssFiles,
    lessFiles,
    allJSFiles,
    staticLibFiles,
    dynamicLibFiles,
    minifiedLibMappings,
    appFiles,
    appFilesExcludes,
    unitHelperFiles,
    lintExcludes,
    allTSFiles,
    preCachedResources
};
