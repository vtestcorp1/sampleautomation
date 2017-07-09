/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Entry point for the blink app. This file needs to be included before any other app js files.
 */
'use strict';

// Top level namespace
window.blink = window.blink || {};

// Declare app level modules
angular.module('blink.accessories', []);
blink.app = angular.module('blink.app', [
    '$strap.directives',
    'blink.accessories',
    'blink.filters',
    'jsonFormatter',
    'localytics.directives',
    'mentio',
    'ngAnimate',
    'ngDialog',
    'ngRoute',
    'ngSanitize',
    'ngStorage',
    'resourceCache',
    'sf.virtualScroll',
    'templates',
    'ui.layout',
    'ui.tree',
    'ui.ace',
    'infinite-scroll',
    'ui.select',
    'ui.bootstrap',
    'angularResizable',
    'dx',
    'vs-repeat'
]);

// Route config for the main app
blink.app.config(['$routeProvider',
    '$httpProvider',
    '$provide',
    '$rootScopeProvider',
    '$animateProvider',
    '$compileProvider',
    function ($routeProvider,
              $httpProvider,
              $provide,
              $rootScopeProvider,
              $animateProvider,
              $compileProvider) {
        $routeProvider
            .when('/', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.HOME })
            .when('/pinboards', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.PINBOARDS })
            .when('/answers', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.ANSWERS })
            .when('/insights', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.INSIGHTS })
            .when('/insights/:tabId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.INSIGHTS })
            .when('/insight/:pinboardId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.INSIGHT })
            .when('/saved-answer/:documentId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.SAVED_ANSWER })
            .when('/replay-answer/:answerId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.REPLAY_ANSWER })
            .when('/pinboard/:pinboardId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.PINBOARD })
            .when('/pinboard/:pinboardId/', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.PINBOARD })
            .when('/pinboard/:pinboardId/snapshot/:snapshotId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.PINBOARD })
            // NOTE(joy/vibhor): We learned the hard way that a missing trailing '/' can create all the headaches with the
            // angularjs routing mechanism.
            // Especially, when you have 2 routes, one prefix of the other, it can lead to weird redirect behavior.
            .when('/answer/', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.ANSWER })
            .when('/answer/:sageContextId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.ANSWER })
            .when('/aggregated-worksheet/:documentId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.AGGREGATED_WORKSHEET})
            // Redirect worksheet to worksheet create page
            .when('/worksheet/', { redirectTo: '/worksheet/create/'})
            .when('/worksheet/create/', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.WORKSHEET, mode: blink.app.modes.WORKSHEET_CREATE})
            .when('/worksheet/create/:encodedQuestion', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.WORKSHEET, mode: blink.app.modes.WORKSHEET_CREATE})
            // Note (Shikhar) - We assume that worksheet Id can never be equal to "create"
            .when('/worksheet/:worksheetId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.WORKSHEET, mode: blink.app.modes.WORKSHEET_SAVED})
            .when('/worksheet/:worksheetId/:encodedQuestion', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.WORKSHEET, mode: blink.app.modes.WORKSHEET_SAVED})
            .when('/admin', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.ADMIN })
            .when('/cluster-status', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.CLUSTER_STATUS })
            .when('/debug', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.DEBUG })
            .when('/help', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.HELP })
            .when('/user-preference', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.USER_PREFERENCE })
            .when('/data/', { redirectTo: '/data/tables/'})
            .when('/data/tables', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.DATA, canvasSubstate: blink.app.canvasSubstates.TABLE_LIST })
            .when('/data/explore/:selectedTableId', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.DATA, canvasSubstate: blink.app.canvasSubstates.EXPLORE_DATA})
            .when('/data/link/:selectedTableId', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.DATA, canvasSubstate: blink.app.canvasSubstates.EXPLORE_DATA, mode: blink.app.modes.RELATIONSHIP_MODE})
            .when('/data/rls/:selectedTableId', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.DATA, canvasSubstate: blink.app.canvasSubstates.EXPLORE_DATA, mode: blink.app.modes.SECURITY_MODE})
            .when('/schedules/:pinboardId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.REPORT_LIST})
            .when('/schedule/:pinboardId/:jobId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.CREATE_REPORT})
            .when('/schedule/:pinboardId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.CREATE_REPORT})
            .when('/importdata', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.IMPORT_DATA })
            .when('/importdatasource', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.IMPORT_DATA_SOURCE})
            .when('/importdatasource/:existingDataId', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.IMPORT_DATA_SOURCE})
            .when('/create-schema', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.CREATE_SCHEMA})
            .when('/data/impds', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.DATA, canvasSubstate: blink.app.canvasSubstates.DATA_SOURCES})
            .when('/importdata/:existingDataId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.IMPORT_DATA })
            .when('/login', { page: blink.app.pages.LOGIN, canvasState: blink.app.canvasStates.LOGIN })
            .when('/embed/viz/:documentId/:vizId?/:encodedParameters?', { page: blink.app.pages.EMBED, canvasState: blink.app.canvasStates.EMBED, canvasSubstate: blink.app.canvasSubstates.EMBED_VIZ})
            .when('/print/:documentId/:vizId?', { page: blink.app.pages.PRINT, canvasState: blink.app.canvasStates.PRINT, canvasSubstate: blink.app.canvasSubstates.PRINT_VIZ})
            .when('/authorize-slack', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.SLACK_AUTH })
            .when('/schema-viewer/:type/:objectId', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.SCHEMA_VIEWER})
            .when('/schema-viewer/:type', { page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.SCHEMA_VIEWER})
            .when('/slack-register/:slackId', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.SLACK_REGISTER})
            .when('/related-link/:relatedLinkId', {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.RELATED_LINK})
            .otherwise({ redirectTo: '/' });

    // Note (joy): To make $http.post() work we need to set these up. The default settings will send the
    // post data in json format which is not working out right now.
    // Use x-www-form-urlencoded Content-Type
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    // Override $http service's default transformRequest, so that {foo: 'bar'} becomes foo=bar
        $httpProvider.defaults.transformRequest = function (data) {
            return angular.isObject(data) ? $.param(data) : data;
        };

        $httpProvider.interceptors.push('responseInterceptor');
        $httpProvider.interceptors.push('requestInterceptor');

    // Only the elements with bk-animate classes will be animated by angular
    // due to performance reasons.
        $animateProvider.classNameFilter(/bk-animate/);

    // Due to https://github.com/angular/angular.js/issues/6440 and the fact that we use templateCache with deeply
    // nested ng-include tree, we have to override the angular ttl (as suggested in the issue thread).
        $rootScopeProvider.digestTtl(30);
        blink.app.compileProvider = $compileProvider;
        blink.app.Provider = $provide;
    }]);


blink.app.run(['$injector',
    function ($injector) {
        blink.app.injector = $injector;
    }]);

// Page types
blink.app.pages = {
    APP_CANVAS: 'app-canvas',
    LOGIN: 'login',
    EMBED: 'embed',
    PRINT: 'print',
    APP_INITIALIZATION_INTERSTITIAL: 'app-initialization-interstitial'
};

// Canvas states
blink.app.canvasStates = {
    HOME: 'home',
    LOGIN: 'login',
    EMBED: 'EMBED',
    PRINT: 'PRINT',
    ANSWERS: 'answers',
    PINBOARDS: 'pinboards',
    INSIGHTS: 'insights',
    INSIGHT: 'insight',
    SAVED_ANSWER: 'saved-answer',
    REPLAY_ANSWER: 'replay-answer',
    ANSWER: 'answer',
    PINBOARD: 'pinboard',
    WORKSHEET: 'worksheet',
    AGGREGATED_WORKSHEET: 'aggregated-worksheet',
    ADMIN: 'admin',
    CLUSTER_STATUS: 'cluster-status',
    DEBUG: 'debug',
    HELP: 'help',
    USER_PREFERENCE: 'user-preference',
    DATA: 'data',
    IMPORT_DATA: 'importdata',
    SLACK_AUTH: 'slack-auth',
    IMPORT_DATA_SOURCE: 'importdatasource',
    CREATE_REPORT: 'schedule',
    REPORT_LIST: 'schedules',
    CREATE_SCHEMA: 'create-schema',
    SCHEMA_VIEWER: 'schema-viewer',
    SLACK_REGISTER: 'slack-register',
    RELATED_LINK: 'related-link'
};

// Canvas substates
blink.app.canvasSubstates = {
    WORKSHEET_LIST: 'worksheet-list',
    TABLE_LIST: 'table-list',
    IMPORTED_DATA_LIST: 'imported-data-list',
    DB_VIEW_LIST: 'db-view-list',
    EXPLORE_DATA: 'data-explorer',
    DATA_COLUMNS: 'columns',
    DATA_SOURCES: 'data-sources',

    EMBED_VIZ: 'embed-viz',
    PRINT_VIZ: 'print-viz'
};

//Canvas Modes
blink.app.modes = {
    RELATIONSHIP_MODE: 'relationship',
    SECURITY_MODE: 'security',
    WORKSHEET_CREATE: 'create',
    WORKSHEET_SAVED: 'saved'
};

/**
 * Special variable under api module - a fake data cache so it is easy to define fake data json in js files
 * Example: '/callosum/v1/answer' -> {...}
 *
 * @type {Object.<string, Object>}
 */
blink.app.fakeData = {};

blink.app.isIE = $.browser.msie || navigator.userAgent.match(/Trident\/7/);
blink.app.isFF = !blink.app.isIE && $.browser.mozilla;
blink.app.isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);
blink.app.isChrome = $.browser.chrome;

// Note (sunny): Overriding user agent is currently broken in headless chromium.
// Once it is fixed upstream we should get rid of this special handling
var isHeadlessChrome = navigator.userAgent.indexOf('HeadlessChrome') >= 0;
if (isHeadlessChrome) {
    blink.app.isChrome = true;
    $.browser.version = 52;
}

// If the browser is IE, we use jquery to add a class to the header to then apply the fixes.
if (blink.app.isIE) {
    $('html').addClass('ie');
}

// If the browser is IE 9, we add a class to the header for IE 9 specific use cases
if (blink.app.isIE && parseInt($.browser.version, 10) == 9) {
    $('html').addClass('ie9');
}

// If the browser is IE 10, we add a class to the header for IE 10 specific use cases
if (blink.app.isIE && parseInt($.browser.version, 10) == 10) {
    $('html').addClass('ie10');
}

// If the browser is FF, we use jquery to add a class to the header to then apply the fixes.
if (blink.app.isFF) {
    $('html').addClass('ff');
}

// If the browser is Safari, we use jquery to add a class to the header to then apply the fixes.
if (blink.app.isSafari) {
    $('html').addClass('safari');
}

// NOTE(vibhor): Because we may show this browser warning on platform where angular may not be supported,
// we have to keep the implementation outside of the scope of angularjs.
$(document).ready(function () {
    var BROWSER_WARNING_TEMPLATE =
        '<div class="bk-permanent-browser-warning" style="display: none;">' +
            '<span>Some of the features might not work properly in your current browser.</span>' +
            '<a>Click here to see a list of recommended browsers.</a>' +
            '<span class="bk-close">&times;</span>' +
        '</div>' +
        '<div class="bk-dialog-overlay bk-browser-upgrade-dialog" style="display: none;">' +
            '<div class="bk-dialog modal">' +
                '<div class="modal-header">' +
                    '<a class="bk-close">&times;</a>' +
                    '<h3>Current Browser version is not supported!</h3>' +
                '</div>' +
            '<div class="modal-body">' +
                '<span>Some of the features might not work properly in your current browser. <br>' +
                'For best experience during beta version, we recommend upgrading to the following browsers:</span>' +
                    '<p></p>' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
            '</div>' +
        '</div>';
    var BROWSER_UPGRADE_DIALOG = '.bk-browser-upgrade-dialog',
        BROWSER_UPGRADE_DIALOG_CLOSE = BROWSER_UPGRADE_DIALOG + ' .bk-close',
        BROWSER_PERMANENT_WARNING = '.bk-permanent-browser-warning',
        BROWSER_PERMANENT_WARNING_CLOSE = BROWSER_PERMANENT_WARNING + ' .bk-close',
        BROWSER_SEE_RECOMMENDED_LIST_LINK = BROWSER_PERMANENT_WARNING + ' a';

    var supportedBrowsers = ['chrome', 'safari', 'mozilla', 'msie', 'webkit'];

    var browsers = {
        chrome: {
            label: 'Google Chrome',
            downloadUrl: 'http://www.google.com/chrome',
            url: '/resources/img/browsers/browser_chrome.png',
            minVersion: 20
        },
        safari: {
            label: 'Safari',
            downloadUrl: 'http://www.apple.com/safari/',
            url: '/resources/img/browsers/browser_safari.png',
            minVersion: 5
        },
        mozilla: {
            label: 'Mozilla Firefox',
            downloadUrl: 'http://www.mozilla.com/firefox/',
            url: '/resources/img/browsers/browser_firefox.png',
            minVersion: 14
        },
        msie: {
            label: 'Internet Explorer',
            downloadUrl: 'http://www.microsoft.com/windows/Internet-explorer/',
            url: '/resources/img/browsers/browser_msie.png',
            minVersion: 10
        },
        webkit: {
            label: 'PhantomJS',
            minVersion: 500
        }
    };

    var isBrowserSupported = supportedBrowsers.any(function (supportedBrowser) {
        return $.browser[supportedBrowser] &&
            parseInt($.browser.version, 10) >= browsers[supportedBrowser].minVersion;
    });

    if (!isBrowserSupported && !!$.cookie) {
        $('body').append(BROWSER_WARNING_TEMPLATE);
        var recommendedList = $(BROWSER_UPGRADE_DIALOG + ' ul');
        supportedBrowsers.each(function (supportedBrowser) {
            var supportedBrowserConfig = browsers[supportedBrowser];
            recommendedList.append(
                ('<li class="bk-supported-browser-link">' +
                    '<a href="{downloadUrl}" target="_blank">' +
                    '<img src="{imageUrl}" title="{browserLabel} ({minVersion} or higher)"/>' +
                '</a></li>').assign({
                    downloadUrl: supportedBrowserConfig.downloadUrl,
                    imageUrl: supportedBrowserConfig.url,
                    browserLabel: supportedBrowserConfig.label,
                    minVersion: supportedBrowserConfig.minVersion
                }));
        });

        $(BROWSER_UPGRADE_DIALOG_CLOSE).click(function () {
            $(BROWSER_UPGRADE_DIALOG).hide();
            $(BROWSER_PERMANENT_WARNING).show();
        });

        $(BROWSER_PERMANENT_WARNING_CLOSE).click(function () {
            $(BROWSER_PERMANENT_WARNING).hide();
        });

        $(BROWSER_SEE_RECOMMENDED_LIST_LINK).click(function () {
            $(BROWSER_UPGRADE_DIALOG).show();
            $(BROWSER_PERMANENT_WARNING).hide();
        });

        var BROWSER_UPGRADE_COOKIE = 'thoughtspot_browserupgradewarning';
        if (!$.cookie(BROWSER_UPGRADE_COOKIE)) {
            $(BROWSER_UPGRADE_DIALOG).show();
            // Set a cookie that expires after 30 days. It is an arbitrarily long enough expiration that doesn't feel
            // annoying and yet ensures that user is reminded again automatically in 30 days.
            $.cookie(BROWSER_UPGRADE_COOKIE, 'true', { expires: 30});
        } else {
            $(BROWSER_PERMANENT_WARNING).show();
        }
    }
});

blink.app.DynamicController = function DynamicController($scope, $parse, $attrs, Logger) {

    var logger = Logger.create('dynamic-controller');
    var controllerGetter = $parse($attrs.bkCtrl);

    $scope.$watch(
        function(){
            return controllerGetter($scope.$parent);
        },
        function(newValue, oldValue){
            if (newValue === oldValue) {
                return;
            }
            $scope.$ctrl = newValue;
        }
    );

    if (!!this.bkCtrl) {
        return this.bkCtrl;
    } else {
        logger.error('No controller passed in', $attrs);
    }

};

blink.app.DynamicController.$inject = ['$scope', '$parse', '$attrs', 'Logger'];
