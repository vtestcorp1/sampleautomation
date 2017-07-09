/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This file contains all the logic around hosting a local proxy server
 * for testing local client changes.
 */

"use strict";

var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

function getInitConfig(grunt) {
    // app ports
    var appPort = parseInt(grunt.option('appPort'), 10) || 8001,
        appProxyPort = parseInt(grunt.option('appProxyPort'), 10) || 8000,
        libsPort = parseInt(grunt.option('libsPort'), 10) || 8004,

        // e2e test ports
        testPort = parseInt(grunt.option('testPort'), 10) || 8003,
        testProxyPort = parseInt(grunt.option('testProxyPort'), 10) || 8002,
        libsTestPort = parseInt(grunt.option('libsTestPort'), 10) || 8006;

    // api host:port info
    var callosumHost = grunt.option('callosumHost') || grunt.option('backendHost') || 'localhost',
        callosumHttps = grunt.option('callosumHttps') || grunt.option('backendHttps'),
        httpsPort = grunt.option('backendHttpsPort') || 443,
        callosumPort = callosumHttps ? httpsPort : grunt.option('callosumPort') || grunt.option('backendPort') || 8088,

        // api host:port info
        periscopeHost = grunt.option('periscopeHost') || grunt.option('backendHost') || 'localhost',
        periscopeHttps = grunt.option('periscopeHttps') || grunt.option('backendHttps'),
        periscopePort = periscopeHttps ? httpsPort : grunt.option('periscopePort') || grunt.option('backendPort') || 8088,

        // sage host:port info
        sageHost = grunt.option('sageHost') || grunt.option('backendHost') || 'localhost',
        sageHttps = grunt.option('sageHttps') || grunt.option('backendHttps'),
        sagePort = sageHttps ? httpsPort : grunt.option('sagePort') || grunt.option('backendPort') || 8088,

        // video recorder
        recorderHost = grunt.option('backendHost') || 'localhost',
        recorderHttps = grunt.option('backendHttps'),
        recorderPort = recorderHttps ? 8008 : grunt.option('backendPort') || 8088,

        // maptiles
        mapTilesHost = grunt.option('mapTilesHost') || grunt.option('backendHost') || 'localhost',
        mapTilesHttps = grunt.option('mapTilesHttps') || grunt.option('backendHttps'),
        mapTilesPort = mapTilesHttps ? httpsPort : grunt.option('mapTilesPort') || grunt.option('backendPort') || 8088,

        // tracevault host:port info
        traceHost = grunt.option('traceHost') || grunt.option('backendHost') || 'localhost',
        traceHttps = grunt.option('traceHttps') || grunt.option('backendHttps'),
        tracePort = traceHttps ? httpsPort : grunt.option('tracePort') || grunt.option('backendPort') || 8088,

        // orion host:port info
        orionHost = grunt.option('orionHost') || grunt.option('backendHost') || 'localhost',
        orionHttps = grunt.option('orionHttps') || grunt.option('backendHttps'),
        orionPort = 2201,

        // specify --hostname='*' to make the webserver bind to all interfaces (and not just localhost).
        hostname = (grunt.option('hostname') === '*') ? '0.0.0.0' : 'localhost';

    return {
        // How the app works in dev mode:
        // The main app is served from say, port 8001 on localhost.
        // appProxy runs on say, port 8000. For any request to /callosum, it goes to callosum host:port, else localhost:8001
        // Similar mechanism for e2e testing, only on separate ports so that we don't have to stop the app server.
        connect: {
            app: {
                options: {
                    port: appPort,
                    hostname: hostname,
                    base: grunt.option('prod') ? './target/app' : './app'
                }
            },
            libs: {
                options: {
                    port: libsPort,
                    hostname: hostname,
                    base: grunt.option('prod') ? './target/app' : './'
                }
            },
            appProxy: {
                options: {
                    port: appProxyPort,
                    hostname: hostname,
                    base: grunt.option('prod') ? './target/app' : './app',
                    middleware: function (connect) {
                        return [
                            proxySnippet
                        ];
                    }
                },
                proxies: [
                    {
                        context: '/release',
                        host: callosumHost,
                        port: callosumPort,
                        https: callosumHttps,
                        changeOrigin: true // important. otherwise for proxy will say that it got data from localhost which is actually from the remote host
                    },
                    {
                        context: '/callosum',
                        host: callosumHost,
                        port: callosumPort,
                        https: callosumHttps,
                        changeOrigin: true // important. otherwise for proxy will say that it got data from localhost which is actually from the remote host
                    },
                    {
                        context: '/periscope',
                        host: periscopeHost,
                        port: periscopePort,
                        https: periscopeHttps,
                        changeOrigin: true
                    },
                    {
                        context: '/complete',
                        host: sageHost,
                        port: sagePort,
                        https: sageHttps,
                        changeOrigin: true // important. otherwise for proxy will say that it got data from localhost which is actually from the remote host
                    },
                    {
                        context: '/recorder',
                        host: recorderHost,
                        port: recorderPort,
                        https: recorderHttps,
                        changeOrigin: true // important. otherwise for proxy will say that it got data from localhost which is actually from the remote host
                    },
                    {
                        context: '/maptiles',
                        host: mapTilesHost,
                        port: mapTilesPort,
                        https: mapTilesHttps,
                        changeOrigin: true // important. otherwise for proxy will say that it got data from localhost which is actually from the remote host
                    },
                    {
                        context: '/tracevault',
                        host: traceHost,
                        port: tracePort,
                        https: traceHttps,
                        changeOrigin: true // important. otherwise for proxy will say that it got data from localhost which is actually from the remote host
                    },
                    {
                        context: '/node_modules',
                        host: hostname,
                        port: libsPort,
                        https: false,
                        changeOrigin: false
                    },
                    {
                        context: '/',
                        host: hostname,
                        port: appPort,
                        https: false,
                        changeOrigin: false
                    }
                ]
            },
            test: {
                options: {
                    port: testPort,
                    base: './app'
                }
            },
            testLibs: {
                options: {
                    port: libsTestPort,
                    hostname: hostname,
                    base: './'
                }
            },
            testProxy: {
                options: {
                    port: testProxyPort,
                    hostname: hostname,
                    base: './app',
                    middleware: function (connect) {
                        return [
                            proxySnippet
                        ];
                    }
                },
                proxies: [
                    {
                        context: '/callosum',
                        host: callosumHost,
                        port: callosumPort,
                        https: callosumHttps,
                        changeOrigin: true
                    },
                    {
                        context: '/periscope',
                        host: periscopeHost,
                        port: periscopePort,
                        https: periscopeHttps,
                        changeOrigin: true
                    },
                    {
                        context: '/complete',
                        host: sageHost,
                        port: sagePort,
                        https: sageHttps,
                        changeOrigin: true
                    },
                    {
                        context: '/statusz',
                        host: orionHost,
                        port: orionPort,
                        https: orionHttps,
                        changeOrigin: true
                    },
                    {
                        context: '/node_modules',
                        host: hostname,
                        port: libsTestPort,
                        https: false,
                        changeOrigin: false
                    },
                    {
                        context: '/',
                        host: hostname,
                        port: testPort,
                        https: false,
                        changeOrigin: false
                    }
                ]
            },
            prodTest: {
                options: {
                    port: testPort,
                    base: './target/app'
                }
            },
            prodTestProxy: {
                options: {
                    port: testProxyPort,
                    hostname: hostname,
                    base: './target/app',
                    middleware: function (connect) {
                        return [
                            proxySnippet
                        ];
                    }
                }
            }
        }
    }
}

function registerTasks(grunt) {
    grunt.registerTask('devServer', [
        'configureProxies:appProxy',
        'connect:appProxy',
        'connect:app',
        'connect:libs'
    ]);
    grunt.registerTask('testServer', [
        'configureProxies:testProxy',
        'connect:testProxy',
        'connect:test',
        'connect:testLibs'
    ]);
    grunt.registerTask('prodTestServer', [
        'configureProxies:testProxy',
        'connect:prodTestProxy',
        'connect:prodTest'
    ]);
}

module.exports = {
    getInitConfig: getInitConfig,
    registerTasks: registerTasks
};
