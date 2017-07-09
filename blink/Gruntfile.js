/*global module:false*/

'use strict';

var generateSources = require('./scripts/generate-sources.js').generateSources;
var generateStrings = require('./scripts/generate-strings');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var proxyServer = require('./setup/grunt-helpers/grunt-proxy-server.js');
var VideoReporter = require('protractor-video-reporter');
var util = require('util');
var sourceFiles = require('./setup/grunt-helpers/source-files');

module.exports = function (grunt) {

    // Constants


    var UNIT_BROWSER = grunt.option('browser') || 'Chrome',
        WEB_BROWSER = grunt.option('browser') || 'Chrome-Big',
        PROTRACTOR_BROWSER = grunt.option('browser') || 'chrome',
        ALL_WEB_BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Chrome-Big'],

        LIB_CSS = sourceFiles.libCssFiles,

        APP_LESS_FILES = sourceFiles.lessFiles,

        // If expand is not performed uglify is not able to process the
        // 'app/lib/src/**/*.js'
        STATIC_LIB_JS = grunt.file.expand(sourceFiles.staticLibFiles),

        // These files are generated dynamically and there would not be a part
        // of grunt.file.expand above.
        DYNAMIC_LIB_FILES = sourceFiles.dynamicLibFiles,

        LIB_JS = STATIC_LIB_JS.concat(DYNAMIC_LIB_FILES),

        // NOTE: Uglify crashes with '[RangeError: Maximum call stack size
        // exceeded]' when minimizing large libraries (OpenLayers).
        // We manually create minified files for such targets and add it to the
        // repository.
        MINIFIED_LIB_MAPPINGS = sourceFiles.minifiedLibMappings,

        APP_JS = sourceFiles.appFiles.concat(
            sourceFiles.appFilesExcludes.map(function (filePattern) {
                return `!${filePattern}`;
            })
        ),

        UNIT_FILES = LIB_JS
            .concat(sourceFiles.unitHelperFiles),

        PRE_CACHED_RESOURCES = sourceFiles.preCachedResources,

        tsLintTargets = sourceFiles.allTSFiles,

        E2E_TEST_ENV = {
            mode: grunt.option('test-mode') || 'SMOKE',
            testCaseFilter: grunt.option('testcase-filter') || ''
        },

        CAPTURE_FAILURES = !!grunt.option('capture-failures'),

        DEV_CSS_PATH = 'app/.tmp/dev.css',

        // app ports
        appPort = parseInt(grunt.option('appPort'), 10) || 8001,
        appProxyPort = parseInt(grunt.option('appProxyPort'), 10) || 8000,
        libsPort = parseInt(grunt.option('libsPort'), 10) || 8004,

        // e2e test ports
        testPort = parseInt(grunt.option('testPort'), 10) || 8003,
        testProxyPort = parseInt(grunt.option('testProxyPort'), 10) || 8002,
        libsTestPort = parseInt(grunt.option('libsTestPort'), 10) || 8006,

        backendHost = grunt.option('backendHost') || 'localhost',
        backendHttps = grunt.option('backendHttps') || false,
        backendPort = grunt.option('backendPort') || (grunt.option('backendHttps') ? 443 : 8088),
        backendHttpsStr = backendHttps ? 'https' : 'http',
        defaultBaseUrl = `${backendHttpsStr}://${backendHost}:${backendPort}`,

        // karma runner port
        karmaPort = parseInt(grunt.option('karmaPort'), 10) || 9876,

        // Flag whether to run tests in separate xvfb session
        useXvfb = !!grunt.option('xvfb'),
        //Xvfb display number
        xvfbDisplay = parseInt(grunt.option('xvfbDisplay'), 10) || 50,

        // Set this option to true if you don't want karma to kill the browser while debugging
        karmaNoTimeout = grunt.option('karmaNoTimeout') || false,

        karmaUnitReporters = ['junit', 'progress'],

        hosts = (grunt.option('hosts') || "").split(","),

        logDir = grunt.option('logdir') || os.tmpDir(),

        commitId;

    /**
     * Converts a file array to a string that can be included in the HTML for include-source processing
     */
    function arrayToString(array) {
        var string = '[',
            comma;
        array.forEach(function (item, index) {
            comma = (index != array.length - 1) ? ',' : '';
            string += '"' + item + '"' + comma;
        });
        return string + ']';
    }

    /**
     * Removes the passed in root dir from file paths
     *     E.g.: With rootDir 'blink': 'blink/app/src/base/app.js' -> 'app/src/base/app.js'
     *           With rootDir 'app': '!app/src/base/app.js' -> '!src/base/app.js'
     * @param {Array} array     An array of file paths
     * @param {string} rootDir  The root directory to remove
     * @return {Array}
     */
    function filterOutRootDir(array, rootDir) {
        return array.map(function (item) {
            if (!item) {
                return;
            }
            var regexp = new RegExp('^(!)?' + rootDir + '\/');
            return item.replace(regexp, '$1');
        });
    }

    var lintTargets = sourceFiles.allJSFiles;

    // Use --lintfiles=<file-pattern1>,<file-pattern2> to restrict linting certain files.
    // File pattern accepts grunt globbing patterns (like **, ! etc).
    if (grunt.option('lintfiles')) {
        lintTargets = grunt.option('lintfiles').split(',');
    }

    /**
     * This option is used by the pre-commit script for linting javascript files
     * Since the pre-commit script sends paths based on the git repo root instead
     * of the blink dir, we filter out the blink root directory from the paths.
     * (e.g. blink/app/src/base/app.js -> app/src/base/app.js)
     */
    if (grunt.option('gitlintfiles')) {
        lintTargets = filterOutRootDir(grunt.option('gitlintfiles').split(','), 'blink');
    }

    lintTargets = lintTargets.concat(
        sourceFiles.lintExcludes.map(function (filePattern) {
            return `!${filePattern}`;
        })
    );


    /**
     * Converts a file array to a string with paths based on the app directory instead of blink, for include-source processing
     */
    function toHtmlIncludeString(array) {
        return arrayToString(filterOutRootDir(array, 'app'));
    }

    if (grunt.option('coverage')) {
        karmaUnitReporters.push('coverage');
    }

    // Project configuration.
    var gruntConfig = {
        meta: {
            banner: '/** ThoughtSpot ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* http://www.thoughtspot.com/\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ThoughtSpot \n' +
            '*/\n',
            jsWrapperStart: "(function(){\n",
            jsWrapperEnd: "}());"
        },
        allJsPath: 'app/.tmp/all.js',
        processedCssPath: 'app/.tmp/processed.css',
        eslint: {
            options: {
                configFile: 'eslint.json',
                fix: !!grunt.option('fixlint')
            },
            target: lintTargets
        },
        tslint: {
            options: {
                configuration: "tslint.json",
                fix: !!grunt.option('fixlint')
            },
            files: {
                src: tsLintTargets
            }
        },
        less: {
            main: {
                options: {
                    paths: 'app',
                    // NOTE(vibhor): Due to https://github.com/gruntjs/grunt-contrib-less/issues/166, we have to
                    // set the compress off.
                    compress: false,
                    cleancss: true
                },
                files: {
                    '<%= processedCssPath %>': 'app/.tmp/concated.less'
                }
            }
        },
        concat: {
            lessFiles: {
                src: [ APP_LESS_FILES ],
                dest: 'app/.tmp/concated.less'
            },
            devCss: {
                src: [
                    LIB_CSS,
                    '<%= processedCssPath %>'
                ],
                dest: DEV_CSS_PATH
            },
            lib: {
                // Populated dynamically with paths of the auto generated
                // uglified lib files.
                src: [],
                dest: 'target/app/js/lib.min.js'
            },
            js: {
                src: APP_JS,
                dest: '<%= allJsPath %>'
            },
            css: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src: [
                    LIB_CSS,
                    '<%= processedCssPath %>'
                ],
                dest: 'target/app/resources/css/all.css'
            }
        },
        uglify: {
            options: {
                compress: true,
                mangle: true
            },
            target: {
                src: ['<%= allJsPath %>'],
                dest: 'target/app/js/all.min.js'
            }
        },
        copy: {
            ts: {
                cwd: 'app/.tmp/ts-out',
                src: '**',
                expand: true,
                dest: 'target/app/app'
            },
            target: {
                files: [
                    {
                        src: 'app/resources/img/**',
                        dest: 'target/'
                    },
                    {
                        src: 'app/src/base/l10n/messages/**/*.json',
                        dest: 'target/'
                    },
                    {
                        src: 'app/resources/messaging/message_codes.bin',
                        dest: 'target/'
                    },
                    {
                        src: 'app/resources/font/**',
                        dest: 'target/'
                    },
                    {
                        src: 'app/resources/geo/**',
                        dest: 'target/'
                    },
                    {
                        src: 'app/resources/icu4js/**',
                        dest: 'target/'
                    },
                    {
                        src: 'app/resources/proto/**',
                        dest: 'target/'
                    },
                    {
                        src: 'app/resources/zeroclipboard/**',
                        dest: 'target/'
                    },
                    {
                        src: 'release/release-notes/**',
                        flatten: true,
                        expand: true,
                        filter: 'isFile',
                        dest: 'target/app/version/release-notes/'
                    },
                    {
                        src: 'app/external/**',
                        dest: 'target/'
                    },
                    {
                        src: 'app/api/**',
                        dest: 'target/app/js/'
                    },
                    {
                        src: 'app/404/**',
                        flatten: true,
                        expand: true,
                        filter: 'isFile',
                        dest: 'target/app/'
                    },
                    {
                        src: 'app/lib/min/**/*.map',
                        flatten: true,
                        expand: true,
                        filter: 'isFile',
                        dest: 'target/app/js/'
                    }, {
                        src: 'app/lib/min/zeroclipboard/ZeroClipboard.swf',
                        flatten: true,
                        expand: true,
                        filter: 'isFile',
                        dest: 'target/app/js/'
                    }
                ]
            },
            simulatejs: {
                files: [{
                    src: 'app/lib/src/jquery.simulate.js',
                    dest: 'target/'
                }]
            }
        },
        shell: {
            xvfb: {
                command: 'Xvfb :' + xvfbDisplay + ' -ac -screen 0 1900x1200x24',
                options: {
                    async: true
                }
            },
            deploy: {
                // TODO(vibhor): We have a temp hack to copy the non-uglified source files in the
                // pack served by nginx. Instead, make a provision to switch the version at
                // run time using a url argument.
                command: 'cp -Lr app/ target/app/ && cd target/app && tar -czf ../blink.tar.gz *'
            },
            options: {
                stdout: true
            },
            getcommit: {
                command: 'git show --summary | grep -e "^commit"',
                options: {
                    stdout: false,
                    stderr: false,
                    callback: function (err, stdout, stderr, done) {
                        grunt.config.set('commitId', stdout.replace(/commit /, '').trim());
                        done();
                    }
                }
            },
            getbranch: {
                command: 'git branch | grep -e "^\\*"',
                options: {
                    stdout: false,
                    stderr: false,
                    callback: function (err, stdout, stderr, done) {
                        grunt.config.set('gitBranch', stdout.replace(/\* /, '').trim());
                        done();
                    }
                }
            },
            generateBinaryMessagingResource: {
                command: 'scripts/messaging/message_codes_proto_converter.par --input app/resources/messaging/message_codes  --output app/resources/messaging/message_codes.bin'
            },
            protractorFlake: {
                command: './node_modules/protractor-flake/bin/protractor-flake ' +
                '--protractor-path=./node_modules/protractor/bin/protractor ' +
                '--parser standard --node-bin node --max-attempts=3 --color=magenta ' +
                '-- test/protractor/scenarios/smoke-config.js ' +
                '--params.captureFailures=' + (grunt.option('captureFailures') || 'false') + ' ' +
                '--params.hosts=' + grunt.option('hosts') + ' ' +
                '--params.browser=' + PROTRACTOR_BROWSER + ' '
            }
        },
        replace: {
            gitLabels: {
                options: {
                    patterns: [{
                        match: 'commitId',
                        expression: false,
                        replacement: function () {
                            return grunt.config.get('commitId') || 'Please run grunt shell:getcommit during package.';
                        }
                    }, {
                        match: 'gitBranch',
                        expression: false,
                        replacement: function () {
                            return grunt.config.get('gitBranch') || 'Please run grun shell:getcommit during package.';
                        }
                    }, {
                        match: 'buildTimeStamp',
                        expression: false,
                        replacement: '<%= grunt.template.today() %>'
                    }]
                },
                files: [{
                    src: 'app/prod.tpl.html',
                    dest: 'target/app/index.html'
                }]
            },
            dev: {
                options: {
                    patterns: [{
                        match: 'LIB_JS',
                        expression: false,
                        replacement: toHtmlIncludeString(LIB_JS)
                    }, {
                        match: 'APP_JS',
                        expression: false,
                        replacement: toHtmlIncludeString(APP_JS)
                    }, {
                        match: 'DEV_CSS',
                        expression: false,
                        replacement: toHtmlIncludeString([ DEV_CSS_PATH ])
                    }, {
                        match: 'commitId',
                        expression: false,
                        replacement: function () {
                            return grunt.config.get('commitId') || 'Please run grunt shell:getcommit during package.';
                        }
                    }, {
                        match: 'gitBranch',
                        expression: false,
                        replacement: function () {
                            return grunt.config.get('gitBranch') || 'Please run grun shell:getcommit during package.';
                        }
                    }, {
                        match: 'buildTimeStamp',
                        expression: false,
                        replacement: '<%= grunt.template.today() %>'
                    }]
                },
                files: [{
                    src: 'app/dev.tpl.html',
                    dest: 'app/index.html'
                }]
            },
            sandbox: {
                options: {
                    patterns: [{
                        match: 'LIB_JS',
                        expression: false,
                        replacement: toHtmlIncludeString(LIB_JS)
                    }, {
                        match: 'APP_JS',
                        expression: false,
                        replacement: toHtmlIncludeString(APP_JS)
                    }, {
                        match: 'DEV_CSS',
                        expression: false,
                        replacement: toHtmlIncludeString([ DEV_CSS_PATH ])
                    }]
                },
                files: [{
                    src: 'app/pattern.tpl.html',
                    dest: 'app/pattern.html'
                }]
            },
            releaseFlags: {
                options: {
                    patterns: [{
                        match: 'RELEASE_FLAGS',
                        expression: false,
                        replacement: JSON.stringify(grunt.file.readJSON('release/flags-override.json'))
                    }]
                },
                files: [{
                    src: 'release/flag-setter.tpl.js',
                    dest: 'app/.tmp/release-flags-setter.js'
                }]
            }
        },
        clean: {
            target: 'target/',
            genFiles: ['app/lib/gen-files/'],
            html2js: 'test/unit/natural-query-templates.js',
            tmp: 'app/.tmp/',
            simulatejs: 'target/app/lib',
            devCss: DEV_CSS_PATH
        },
        watch: {
            devIndexTemplate: {
                files: ['app/dev.tpl.html'],
                tasks: ['generateDevIndexHtml']
            },
            devSourceFiles: {
                files: ['app/src/**/*.js', 'lib/**/*.js'],
                tasks: ['generateDevIndexHtml'],
                options: {
                    event: ['added', 'deleted']  // We don't want to run the watch when a js file changes.
                }
            },
            devTypescriptFiles: {
                files: !!grunt.option('disable-ts-watch') ? [] : sourceFiles.allTSFiles,
                tasks: ['ts'],
                options: {
                    spawn: false
                }
            },
            devCssFiles: {
                files: APP_LESS_FILES.concat(LIB_CSS),
                tasks: ['generateDevCss'],
                options: {
                    spawn: false
                }
            },
            genFiles: {
                files: [
                    '../callosum/client/preference.proto',
                    '../net/rpc/info.proto',
                    '../net/trace/trace.proto',
                    '../net/trace/trace_vault.proto',
                    '../sage/public/auto_complete.proto',
                    '../sage/a3/public/sage_a3_interface.proto',
                    '../orion/timely/job.proto',
                    '../orion/timely/job_manager_interface.proto'                ] ,
                tasks: ['generate-sources']
            },
            genStrings: {
                files: ['../common/localization/strings.po'],
                tasks: ['generate-strings']
            },
            messageCodes: {
                files: ['app/resources/messaging/message_codes'] ,
                tasks: ['shell:generateBinaryMessagingResource']
            }
        },
        karma: {
            options: {
                // base path, that will be used to resolve files and exclude
                basePath: '',
                // list of files / patterns to load in the browser
                plugins: [
                    'karma-jasmine',
                    'karma-systemjs-imports',
                    'karma-source-map-support',
                    'karma-junit-reporter',
                    'karma-coverage',
                    'karma-chrome-launcher',
                    'karma-safari-launcher',
                    'karma-firefox-launcher',
                    require('./scripts/blink-test-reporter'),
                ],
                // test results reporter to use
                // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
                reporters: karmaUnitReporters,
                preprocessors: {
                    'app/src/**/!(*spec).js': 'coverage'
                },
                coverageReporter: {
                    type: 'cobertura',
                    dir: 'test/coverage'
                },
                // enable / disable colors in the output (reporters and logs)
                colors: true,
                // change this to 'debug' if you need more info
                logLevel: 'info',
                // Karma supports: Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS, IE (only Windows)
                browsers: grunt.option('all') ? ALL_WEB_BROWSERS : [WEB_BROWSER],
                // If browser does not capture in given timeout [ms], kill it
                captureTimeout: 60000,
                browserDisconnectTolerance: 4,
                browserDisconnectTimeout: karmaNoTimeout ? 10000000 : 240000,
                browserNoActivityTimeout: karmaNoTimeout ? 0 : 240000,

                singleRun: !grunt.option('autowatch'),
                autoWatch: !!grunt.option('autowatch'),
                urlRoot: '/karma',
                proxies: {
                    '/': 'http://localhost:' + testProxyPort + '/'
                },
                customLaunchers: {
                    'Chrome-Big': {
                        base: 'Chrome',
                        flags: [
                            '--window-size=1900,1200',
                            '--disable-save-password-bubble=true',
                            '--js-flags=--expose_gc',
                            '--no-sandbox'
                        ]
                    }
                }
            },
            unit: {
                options: {
                    frameworks: ['systemjs-imports', 'source-map-support', 'jasmine'],
                    browsers: [WEB_BROWSER],
                    files: UNIT_FILES.concat([
                        // JSON fixture
                        {
                            pattern:  'test/unit/testdata/*.json',
                            watched:  true,
                            served:   true,
                            included: false
                        }
                    ]),
                    junitReporter: {
                        outputDir: './test/results',
                        outputFile: 'unit-test-results.xml',
                        useBrowserName: false,
                        suite: 'UNIT'
                    },
                    systemjs: {
                        importFiles: grunt.file.expand([
                            'app/src/**/*-spec.ts'
                        ])
                    }
                }
            }
        },
        // This task is used to convert the natural query html templates into a templates.js file so that unit test
        // requiring to test the template logic can include the module and avoid mocking http request for each template.
        html2js: {
            options: {
                base: 'app',
                htmlmin: {
                    removeComments: true
                }
            },
            templates: {
                options: {
                    module: 'templates'
                },
                src: [ 'app/src/**/*.html', '!app/external/**/*.html' ],
                dest: 'target/app/js/templates.js'
            }
        },
        cacheBust: {
            options: {
                baseDir: 'target/app',
                assets: ['js/*.js', 'resources/css/*.css'],
                deleteOriginals: true,
                rename: true
            },
            src: ['target/app/index.html']
        },
        express: {
            'fake-api': {
                options: {
                    script: 'fake-api/fake-api.js'
                }
            }
        },
        env: {
            xvfb: {
                DISPLAY: ':' + xvfbDisplay
            }
        },
        parallel: {
            webFake: {
                options: {
                    stream: true
                },
                tasks: [
                    {
                        grunt: true,
                        args: ['express:fake-api']
                    },
                    {
                        grunt: true,
                        args: ['watch']
                    }
                ]
            },
            packageClean: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['clean:tmp']
                }, {
                    grunt: true,
                    args: ['clean:target']
                }, {
                    grunt: true,
                    args: ['clean:genFiles']
                }]
            },
            packageGenerate: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['less']
                }, {
                    grunt: true,
                    args: ['generate-sources']
                }, {
                    grunt: true,
                    args: ['html2js:templates']
                }]
            },
            packageConcat: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['concat:lib']
                }, {
                    grunt: true,
                    args: ['concat:js']
                }, {
                    grunt: true,
                    args: ['concat:css']
                }]
            },
            uglifyLib: {
                // Will be populated with grunt tasks to uglify all lib files.
                // All uglified files are written to app/.tmp/lib/
                tasks: []
            }
        },
        includeSource: {
            options: {
                basePath: 'app'
            },
            dev: {
                files: {
                    'app/index.html': 'app/index.html'
                }
            },
            sandbox: {
                files: {
                    'app/pattern.html': 'app/pattern.html'
                }
            }
        },
        ts: {
            default : {
                tsconfig: {
                    tsconfig: '.',
                    passThrough: true
                }
            }
        },
        execute: {
            bundle: {
                src: ['app.bundle.js'],
                after: function(grunt, options) {
                    console.log("Bundling complete", options);
                }
            }
        },
        protractor: {
            options: {
                configFile: (E2E_TEST_ENV.mode === 'SMOKE')
                    ? "test/protractor/scenarios/smoke-config.js"
                    : "test/protractor/scenarios/config.js",
                keepAlive: false,
                noColor: false,
                webdriverManagerUpdate: true,
                args: {
                }
            },
            QA: {
                options: {
                    configFile: "test/protractor/e2e-QA/config.js",
                    args: {
                        params: {
                            baseUrl: 'http://localhost:' + testProxyPort + '/',
                            captureFailures: CAPTURE_FAILURES
                        },
                        browser: PROTRACTOR_BROWSER
                    }
                }
            },
            e2e: {
                options: {
                    args: {
                        params: (function () {
                            var params = {
                                baseUrl: 'http://localhost:' + testProxyPort + '/',
                                captureFailures: CAPTURE_FAILURES,
                            };
                            // We want to add .backends parameter only when we have --hosts passed
                            // That's why it's wrapped in self executing function, it would be even
                            // less readable if this logic defined somewhere far away from here.
                            // BLAME(maxim)
                            if (grunt.option('hosts')) {
                                params.hosts = grunt.option('hosts');
                            }
                            return params;
                        }) (),
                        browser: PROTRACTOR_BROWSER
                    }
                }
            },
            golden: {
                options: {
                    args: {
                        params: {
                            baseUrl: 'http://localhost:' + testProxyPort + '/',
                            skipExisting: grunt.option('skipExisting') || false,
                            currentEpochOverrideMs: grunt.option('currentEpochOverrideMs'),
                            metadataBatchSize: grunt.option('metadataBatchSize'),
                        }
                    }
                }
            },
            perfTPCH: {
                options: {
                    configFile: "test/protractor/performance/config/tpch-config.js",
                    args: {
                        params: {
                            baseUrl: defaultBaseUrl,
                            hosts: grunt.option('hosts'),
                            username: grunt.option('username') || 'tsadmin',
                            password: grunt.option('password') || 'admin',
                            backendHost: backendHost,
                            backendPort: backendPort,
                            backendHttps: backendHttps,
                            jenkinsId: grunt.option('jenkinsId'),
                            outdir: grunt.option('outdir') || 'benchmark',
                            onlyOnce: grunt.option('onlyOnce') || false,
                            generateTrace: grunt.option('generateTrace') || false,
                            tag: grunt.option('tag') || '',
                            datasetName: grunt.option('dataset'),
                            numRuns: grunt.option('numRuns') || 1
                        },
                        browser: PROTRACTOR_BROWSER
                    }
                }
            },
            perfSage: {
                options: {
                    configFile: "test/protractor/sage-usecase/sage-usecase-config.js",
                    args: {
                        params: {
                            baseUrl: defaultBaseUrl,
                            username: grunt.option('username') || 'tsadmin',
                            password: grunt.option('password') || 'admin',
                            backendHost: backendHost,
                            backendPort: backendPort,
                            backendHttps: backendHttps,
                            useCaseSpec: grunt.option('useCaseJSON')
                        },
                        browser: PROTRACTOR_BROWSER
                    }
                }
            },
            perfDogfood: {
                options: {
                    configFile: "test/protractor/performance/config/dogfood-config.js",
                    args: {
                        params: {
                            baseUrl: defaultBaseUrl,
                            hosts: grunt.option('hosts'),
                            username: grunt.option('username') || 'perf@thoughtspot.int',
                            password: grunt.option('password') || 'perf',
                            backendHost: backendHost,
                            backendPort: backendPort,
                            backendHttps: backendHttps,
                            jenkinsId: grunt.option('jenkinsId'),
                            outdir: grunt.option('outdir') || 'benchmark',
                            onlyOnce: grunt.option('onlyOnce') || false,
                            generateTrace: grunt.option('generateTrace') || false,
                            tag: grunt.option('tag') || '',
                            dataset: grunt.option('dataset'),
                            numRuns: grunt.option('numRuns') || 1
                        },
                        browser: PROTRACTOR_BROWSER
                    }
                }
            },
            perfSchwab: {
                options: {
                    configFile: "test/protractor/performance/config/schwab-config.js",
                    args: {
                        params: {
                            baseUrl: defaultBaseUrl,
                            hosts: grunt.option('hosts'),
                            username: grunt.option('username') || 'tsadmin',
                            password: grunt.option('password') || 'admin',
                            backendHost: backendHost,
                            backendPort: backendPort,
                            backendHttps: backendHttps,
                            jenkinsId: grunt.option('jenkinsId'),
                            outdir: grunt.option('outdir') || 'benchmark',
                            onlyOnce: grunt.option('onlyOnce') || false,
                            generateTrace: grunt.option('generateTrace') || false,
                            tag: grunt.option('tag') || '',
                            dataset: grunt.option('dataset'),
                            numRuns: grunt.option('numRuns') || 1
                        },
                        browser: PROTRACTOR_BROWSER
                    }
                }
            },
            dataConnect: {
                options: {
                    configFile: "test/protractor/data-connect/config.js",
                    args: {
                        params: {
                            baseUrl: 'http://localhost:' + testProxyPort + '/',
                            testMode: E2E_TEST_ENV.mode
                        },
                        browser: PROTRACTOR_BROWSER
                    }
                }
            }
        }
    };

    var proxyServerInitConfig = proxyServer.getInitConfig(grunt);
    Object.assign(gruntConfig, proxyServerInitConfig);

    // Populate @gruntConfig to generate minified versions of lib files.  User
    // needs to executes the following two target to generate minified lib
    // files -
    //   1. parallel:uglifyLib - Uglifies all lib files in parallel.
    //   2. concat:lib - concats all generated min files and writes it to
    //   target/app/js/lib.min.js.
    LIB_JS.forEach(function(libPath) {
        // Replace / with _ to create target name.
        var targetName = libPath.replace(/\//g, '_');
        var dest = 'app/.tmp/lib/' + targetName;
        // If an minified file already exists just add a the path the minified
        // to concat task that produces final output.
        if (MINIFIED_LIB_MAPPINGS.hasOwnProperty(libPath)) {
            gruntConfig.concat.lib.src.push(MINIFIED_LIB_MAPPINGS[libPath]);
            return;
        }
        // Add one target each to uglify secion.
        gruntConfig.uglify[targetName] = {
            src: [libPath],
            dest: dest
        };
        var task = {
            grunt: true,
            args: ['uglify:' + targetName]
        };
        // Also add a task that to uglify all targets in parallel.
        gruntConfig.parallel.uglifyLib.tasks.push(task);
        gruntConfig.concat.lib.src.push(dest);
    });

    grunt.initConfig(gruntConfig);

    // Load Npm Tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-proxy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-parallel');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-continue');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-tslint');

    grunt.registerTask('lint', ['tslint', 'eslint']);

    // Generate dev version of index.html
    grunt.registerTask('generateDevIndexHtml', [
        'replace:releaseFlags',
        'shell:getcommit',
        'shell:getbranch',
        'replace:gitLabels',
        'replace:dev',
        'includeSource:dev',
        'replace:sandbox',
        'includeSource:sandbox'
    ]);

    grunt.registerTask('generateDevCss', ['clean:devCss', 'concat:lessFiles', 'less', 'concat:devCss']);

    // Web task - Start a web server
    grunt.registerTask('web', ['buildDevServer', 'devServer', 'watch']);

    // run proxy etc on a separate set of ports so that e2e tests can run without stopping the main web task
    grunt.registerTask('buildDevServer', [
        'clean:genFiles',
        'clean:tmp',
        'generate-sources',
        'generate-strings',
        'shell:generateBinaryMessagingResource',
        'generateDevCss',
        'generateDevIndexHtml',
        'ts'
    ]);

    proxyServer.registerTasks(grunt);

    // Unit test task
    grunt.registerTask('unit', [
        'generate-sources',
        'generate-strings',
        'shell:generateBinaryMessagingResource',
        'html2js:templates',
        'pre-cache-resources',
        'buildDevServer',
        'testServer',
        'karma:unit',
        'clean:html2js'
    ]);

    function getWrapperSubTasks(subTask, useXvfb) {
        if (useXvfb) {
            return ['shell:xvfb', 'env:xvfb', subTask, 'shell:xvfb:kill'];
        } else {
            return [subTask];
        }
    }

    grunt.registerTask('protractor-e2e-wrapper', getWrapperSubTasks('protractor:e2e', useXvfb));
    grunt.registerTask('protractor-e2e-flake-wrapper', getWrapperSubTasks('shell:protractorFlake', useXvfb));
    grunt.registerTask('protractor-e2eQA-wrapper',  getWrapperSubTasks('protractor:QA', useXvfb));
    grunt.registerTask('protractor-golden-wrapper',  getWrapperSubTasks('protractor:golden', useXvfb));
    grunt.registerTask('e2eDataConnectWrapper',  getWrapperSubTasks('protractor:dataConnect', useXvfb));
    grunt.registerTask('perfDogfoodWrapper',  getWrapperSubTasks('protractor:perfDogfood', useXvfb));
    grunt.registerTask('perfSchwabWrapper',  getWrapperSubTasks('protractor:perfSchwab', useXvfb));
    grunt.registerTask('perfTPCHWrapper',  getWrapperSubTasks('protractor:perfTPCH', useXvfb));
    grunt.registerTask('perfSageWrapper',  getWrapperSubTasks('protractor:perfSage', useXvfb));

    grunt.registerTask('e2eProtractor', ['buildDevServer', 'testServer', 'protractor-e2e-wrapper']);
    grunt.registerTask('e2eProtractorFlake', ['buildDevServer', 'testServer', 'protractor-e2e-flake-wrapper']);
    grunt.registerTask('e2eDataConnect', ['buildDevServer', 'testServer', 'e2eDataConnectWrapper']);
    grunt.registerTask('e2eGolden', ['buildDevServer', 'testServer', 'protractor-golden-wrapper']);
    grunt.registerTask('e2eQAProtractor', ['buildDevServer', 'testServer', 'protractor-e2eQA-wrapper']);
    grunt.registerTask('perfDogfood', ['generate-sources', 'perfDogfoodWrapper']);
    grunt.registerTask('perfSchwab', ['generate-sources', 'perfSchwabWrapper']);
    grunt.registerTask('perfTPCH', ['generate-sources', 'perfTPCHWrapper']);
    grunt.registerTask('perfSage', ['generate-sources', 'perfSageWrapper']);

    // Test tasks (e2e tests with fries and soda)
    grunt.registerTask('test', ['lint', 'unit', 'e2e']);
    grunt.registerTask('test-prod', ['lint', 'unit', 'package', 'e2eProtractor']);

    grunt.registerTask('generate-sources', function () {
        generateSources('./app/lib/gen-files/');
    });

    grunt.registerTask('generate-strings', function () {
        var done = this.async();
        var suffix = grunt.config.get('commitId') || '';
        console.log('The suffix is:' , suffix);
        generateStrings(suffix, done);
    });

    grunt.registerTask('pre-cache-resources', function(){
        var resourceFiles = grunt.file.expand(PRE_CACHED_RESOURCES);
        var resourceFilePathNames = resourceFiles.map(function(filePath){
            // remove the app prefix in the paths to match the relative path
            // of the resource in dev mode
            filePath = filePath.replace(/(^app\/)/, '');
            return util.format("'%s'", filePath);
        });

        var resourceCacheModuleJS = util.format("angular.module('resourceCache', [%s])", resourceFilePathNames);
        var resourceModuleJs = resourceFiles.map(function(fileDiskPath, filePathIndex){
            var filePathName = resourceFilePathNames[filePathIndex];
            var fileContent = fs.readFileSync(fileDiskPath).toString();
            var fileLines = fileContent.split('\n');

            fileContent = fileLines.map(function(fileLine){
                return util.format("'%s\\n'", fileLine.replace(/'/g, "\\'"));
            }).join('+\n');

            return util.format(
                "angular.module(%s, []).run(['resourceCachingService', " +
                "function(resourceCachingService) { resourceCachingService.putResource(%s, %s);}]);",
                filePathName,
                filePathName,
                fileContent
            );
        });

        resourceCacheModuleJS += '\n' + resourceModuleJs.join('\n') + '\n';
        fs.writeFileSync('target/app/js/resource-cache.js', resourceCacheModuleJS);
    });

    grunt.registerTask('package', [
        'parallel:packageClean',
        'shell:getcommit',
        'shell:getbranch',
        'concat:lessFiles',
        'parallel:packageGenerate',
        'generate-strings',
        'replace:releaseFlags',
        'ts',
        'copy:ts',
        'execute:bundle',
        'parallel:uglifyLib',
        'parallel:packageConcat',
        'uglify:target',
        'pre-cache-resources',
        'shell:generateBinaryMessagingResource',
        'copy:target',
        'replace:gitLabels',
        'cacheBust',
        'clean:tmp',
        'shell:deploy'
    ]);

    grunt.registerTask('test', ['shell:getcommit', 'generate-strings']);

    // Build tasks
    grunt.registerTask('build-no-test', ['lint', 'package']);
    grunt.registerTask('default', ['test', 'package']);
};
