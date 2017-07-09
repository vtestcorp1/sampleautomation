/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview The common setup called before each test case.
 */

'use strict';

/* eslint no-undef: 0 */
/* global getLoggedErrors, waitFor */

// Note (joy/vibhor): unless we set callosumTimeout=0 the angular scenario will wait for the default 1 min by
// $http call. this is a workaround for the angular scenario specific behavior.
var HOME_URL = '/?e2eTest=true' +
    '&scenarios=true' +
    '&log=all&clientLogLevel=warn' +
    '&disableResponsiveTiles=true' +
    '&successAlertHidingDelay=0' +
    '&enableAnswers=true';

var GC_PAUSE = 2000;

var appLoaded = false;

var snapScreenShot = (function () {
    var Events = {
            REQUEST: 'blink-get-screen-shot-request',
            RESPONSE: 'blink-get-screen-shot-response'
        },
        screenShotServerSocket = null,
        screenShootingUnavailable = false;

    function getScreenShotSocket(cb) {
        if (!!screenShotServerSocket) {
            cb(screenShotServerSocket);
            return;
        }
        if (screenShootingUnavailable) {
            cb(null);
            return;
        }

        screenShotServerSocket = new WebSocket('ws://localhost:9065');
        screenShotServerSocket.onopen = function(){
            screenShotServerSocket.onopen = screenShotServerSocket.onerror = null;
            cb(screenShotServerSocket);
        };
        screenShotServerSocket.onerror = function (error) {
            console.log('unable to find screen shooting service', error);
            screenShotServerSocket.onopen = screenShotServerSocket.onerror = null;
            screenShootingUnavailable = true;
            screenShotServerSocket = null;
            cb(null);
        };
    }

    return function (name, cb) {
        getScreenShotSocket(function(socket){
            if (!socket) {
                cb();
                return;
            }
            socket.onmessage = function (event) {
                socket.onmessage = null;
                cb();
            };

            socket.send(JSON.stringify({
                command: Events.REQUEST,
                name: name
            }));
        });
    };
})();


/**
 * Appends the jQuery Simulate JS script, but does not wait for it to load
 */
angular.scenario.dsl('addSimulateJsScript', function () {
    return function () {
        return this.addFutureAction('Add jQuery Simulate JS', function (appWindow, $document, done) {
            appWindow.$('head').append('<script src="/lib/src/jquery.simulate.js"></script>');
            done();
        });
    };
});

/**
 * Loads jQuery Simulate JS and waits for it to load
 */
function loadSimulateJs() {
    addSimulateJsScript();
    waitFor(function (appWindow) {
        return !!appWindow.$.simulate;
    });
}

var numRefreshFailed=0;
/**
 * Refresh the app through future actions
 *
 * @param {boolean} firstLoad  If true, login
 */
function refreshApp(firstLoad) {
    if (numRefreshFailed > 2) {
        // Reaching this point most probably means that backend is unavailable
        // To avoid waiting a long time waiting until all the tests will try to
        // refresh the app and get the timeout, we just instantly fail it here.
        throw "Unable to refresh the app more than 2 times, seems that backend have failed.";
    }
    browser().navigateTo(HOME_URL);
    // Load jQuery Simulate Javascript
    loadSimulateJs();
    if (firstLoad) {
        // Login
        waitForElement(LOGIN_FORM, 'login page');
        input('user.username').enter(ADMIN_USERNAME);
        input('password').enter(ADMIN_PASSWORD);
        element('.bk-login-section .bk-login-btn').click();
    }

    waitForElement(HOME_TAB);
    callFunctionWithElement(null, function ($body, appWindow, $jquery) {
        if (!$jquery(ANSWER_TAB).length) {
            numRefreshFailed++;
            throw "Uable to refresh app.";
        }
    });
    goToAnswer();
}

var numTestsRun = 0;
beforeEach(function () {
    // After every 10 tests, reload the app (to work around a long running memory leak issue).
    if (!appLoaded || (numTestsRun > 0 && numTestsRun % 10 === 0)) {
        refreshApp(!appLoaded);
        appLoaded = true;
    } else {
        goToAnswer();
    }

    waitForElement(SAGE_DATA_PANEL, 'waiting for sage data panel');
    element('.bk-choose-sources-btn').click();
    waitForElement('.bk-sage-data .bk-sources-container .bk-list-item');
    clearVizDisplayPreference();
    deselectAllSources();
    selectAllTableSources();
    numTestsRun++;
});

afterEach(function () {

    resetResponseTransformers();

    // Note (sunny): disabling screenshots until it is fully fixed.
    /*
    var runner = this;
    this.addFutureAction('wait for screen shot for failed test case', function (appWindow, $document, done) {
        if (!runner.error) {
            done(null, {});
            return;
        }

        var name = runner.spec.definition.name;
        while (runner.parent && runner.parent.name) {
            name = runner.parent.name + ' ' + name;
        }
        name += ' ' + runner.spec.name;

        snapScreenShot(name, function(){
            done(null, {});
        });
    });*/

    this.addFutureAction('check for app errors', function (appWindow, $document, done) {
        var appErrors = getLoggedErrors(appWindow, 'ERROR');
        clearLoggedErrors(appWindow);
        if (!appErrors) {
            done(null, {});
        } else {
            done('App encountered following errors: ' + appErrors, {});
        }
    });

    this.addFutureAction('trigger garbage collection', function (appWindow, $document, done) {
        if (numTestsRun === 0 || numTestsRun % 10 !== 0) {
            done();
            return;
        }

        // large objects logged in the console can stay alive
        if (appWindow.console) {
            appWindow.console.clear();
        }

        // Note (sunny): for reasons not clear to me a few calls to
        // gc seem to be necessary to force chrome to shed some weight
        if (appWindow.gc) {
            appWindow.gc();
            appWindow.gc();

            appWindow.gc();
            appWindow.gc();
        }

        setTimeout(done, GC_PAUSE);
    });

});
