/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides timeout ability to the app.
 * - We have setTimeout which is not tied to angular apply/digest cycle.
 * - We have $timeout which abstracts the apply part but the short coming
 * is in tests as its a blocking step in tests. This fundamentally breaks
 * the notion of e2e to be testable as end user.
 * NOTE: browser.ignoreSynchronization is a possible way to work around this
 * but in the protractor implementation browswer.wait will not inherit that
 * http://stackoverflow.com/questions/28808463/what-is-browser-ignoresynchronization-in-protractor
 */

'use strict';

blink.app.factory('blinkTimeout', ['$rootScope',
    'safeApply',
    function ($rootScope, safeApply) {
        var blinkTimeout = function(timeoutFunc, timeout) {
            var cancelId = setTimeout(function () {
                timeoutFunc();
                safeApply($rootScope);
            }, timeout);
            return function () {
                clearTimeout(cancelId);
            }
        };

        return blinkTimeout;
    }]);
