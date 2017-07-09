/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com), Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Defines a default environment. The defaults can be overwritten in blink.env.
 */

'use strict';

blink.app.factory('env', ['$window', function ($window) {

    var me = {};

    var _defaultEnv = {

        // this param is true if the app is running in test capture mode. This is different from e2eTest mode which is
        // meant for replaying test cases.
        testCapture: false,

        // true for e2e test mode. in this mode we should disable delays in the code to keep the e2e tests as fast as possible.
        e2eTest: false,

        // if true, then we get data from a local file like foo.bar.json instead of calling /foo/bar api
        fakeApi: false,

        // callosum path info. this is a prefix, more params are added after this to make the complete path.
        callosumBasePath: '/callosum/v1',

        // sage path info. the trailing slash is very important.
        sageBasePath: '/sage/',

        // sage path info. the trailing slash is very important.
        sageBasePathV2: '/complete/',

        // for callosum api
        batchSize: '',

        // for callosum api - flag to indicate if only table viz is to be generated in answer generation
        // this helps in debugging performance with Falcon
        tableVizOnly: false,

        // for callosum api - deadline in ms. If the query does not complete before the deadline, returns with either
        // no results or with partial results depending on the allowPartialResults flag below. Deadline of -1 implies
        // no deadline.
        deadlineMs: 60000,

        // for callosum data explorer api - deadline in ms. We use higher deadline for data explorer.
        deadlineExplorerMs: 300000,

        // used in association with deadlineMs. If a deadline is set, this flag determines if partial results are
        // returned to the client when the deadline is hit
        allowPartialResults: true,

        // used in association with deadlineExplorerMs. If a deadline is set, this flag determines if partial results
        // are returned to the client when the deadline is hit
        allowPartialResultsExplorer: true,

        // to prevent boundless growth of the sage cache, limit to a max number of states it can hold
        maxItemsInSageCache: 5,

        // max number of tokens to get from sage
        maxSageCompletions: 20,

        // show a loading spinner after this much delay in msecs while still waiting for results
        loadingIndicatorDelay: 400,

        // Number of milliseconds, thrift autocomplete client will wait before calling the error callback.
        sageTimeout: 20000,

        // Timeout for the a3 service queries.
        a3Timeout: 300000,

        // Number of milliseconds we expect sage rpc to spend on network. This is just an estimate to
        // provide a reasonable time budget to the server.
        sageNetworkBudget: 200,

        // number of milliseconds before callosum call will be canceled
        callosumTimeout: 300000,

        // If true, the viz tiles do not have any size specific rendering decisions.
        disableResponsiveTiles: false,

        // If true, the filter data is not fetched with reportbook until needed. (perf tweak).
        onDemandFilter: true,

        // Set to 0 in e2e to make the tests not wait for the alert to disappear.
        successAlertHidingDelay: 3500,

        confirmPinboardVizRemoval: true,

        // Minimum width for each table column
        minTableColumnWidth: 120,

        attributeFilterMaxValues: 100,

        attributeFilterSearchDelay: 100,

        // When true, the user is limited to a smaller set of keywords to keep things simpler.
        basicMode : false,

        keywordCompletions : false,

        disableAppTourOnOlderIE: true,

        enableAppTour: false,

        // Log env variables

        // optional comma separated logger names for their for log() statements to be unmuted
        // if 'all' then all loggers are unmuted. This only affects client side logging
        log: 'all',

        // Say debug=sage,pinboard as shortcut to say log=sage,pinboard&clientLogLevel=debug.
        //
        // Will override log and clientLogLevel parameter.
        debug: '',
        // Say trace=sage,pinboard as shortcut to say log=sage,pinboard&clientLogLevel=trace.
        //
        // Will override log and clientLogLevel parameter.
        // Will also override debug parameter.
        trace: '',

        // Client side logging level. On client side, logs would of the services which are unmuted (specified by env.log)
        // and whose logging level > clientLoggingLevel. If clientLogLevel >= debug (1), then we also enable all
        // console.time() and console.group() outputs.
        clientLogLevel: 'WARN', // WARN

        // In /answer calls, Callosum provides an option to specify the "instant" to use when computing filter
        // time ranges for date functions e.g. 'revenue yesterday' by default will use the current system time to
        // determine the time range for yesterday; if a value is set for this parameter, Callosum will use this
        // as the instant instead of the current system time. The value for this parameter is Epoch in milli-seconds.
        currentEpochOverrideMs: 0,

        // Enables profiling of request in sage.
        enableSageRequestProfile: false,

        // Number of tokens in sage bar after which user will always see small dropdown (single token suggestions).
        numTokensThresholdForSmallDropdown: 3,

        // Limits the number of suggestions in sage bar.
        maxNumCompletionsInSage: 4,

        maxCompletionsInSageForAmbiguity: 20,

        // The option controls whether to show "View more" button when clamping sage suggestions.
        showViewMoreOptionInDropdown: false,

        minWaitTimeBeforeRendering: 500,

        filterThrottlingDelay: 750,

        enableFilterSlider: false,

        maxColumnsAllowedInQuery: 100,

        // a flag to force worksheets to go into an auto upgrade cycle on open
        // regardless of whether anything was broken. this is a one shot flag
        // which is turned off once used. this is done to avoid getting into
        // upgrade loop.
        forceWorksheetUpgrade: false,

        defaultLocale: void 0,

        customBrandingEnabled: false,
        customBrandingFontCustomizationEnabled: false,
        ignoreCache: false
    };

    // If user has provided foo=bar in the query string, then it can override the default if any
    // Note(joy): Also keep track of the params specified in url because data from /session/info can't override them.
    var _queryParams = (function (a) {
        if (!a[0]) { return {}; }
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) { continue; }
            var k = decodeURIComponent(p[1].replace(/\+/g, " "));
            // cast "true" or "false" to boolean
            if (k.match(/^true$|^false$/i)) {
                k = !!k.match(/^true$/i);
            }
            if (b[p[0]] === void 0) {
                b[p[0]] = k;
            } else {
                b[p[0]] = [k].concat(b[p[0]]);
            }
        }
        return b;
    })($window.location.search.substr(1).split('&'));

    if (_queryParams.hasOwnProperty('debug')) {
        _queryParams.log = _queryParams.debug;
        _queryParams.clientLogLevel = 'DEBUG';
    }
    if (_queryParams.hasOwnProperty('trace')) {
        _queryParams.log = _queryParams.trace;
        _queryParams.clientLogLevel = 'TRACE';
    }

    me.isAppTourEnabled = function () {
        if (!me.enableAppTour) {
            return false;
        }
        if (me.isOlderThanIE10() && me.disableAppTourOnOlderIE) {
            return false;
        }
        return true;
    };

    me.isOlderThanIE10 = function () {
        if (!blink.app.isIE) {
            return false;
        }

        var browserVersion = parseInt($.browser.version, 10);
        return browserVersion < 10;
    };

    me.getQueryParameters = function () {
        return _queryParams;
    };

    $.extend(true, me, _defaultEnv, blink.env, _queryParams);

    // don't clobber objects in defaults, and don't modify the defaults
    return me;

}]);
