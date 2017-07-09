/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview E2E scenario to test sage bar interactivity.
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var sageBarBackspace = angular.scenario.dsl('sageBarBackspace', function () {
    return function () {
        return this.addFutureAction('Backspace in the sage bar', function (appWindow, $document, done) {
            var $ = appWindow.$,
                $sageInput = $('.bk-sage-real-input');
            var e = $.Event('keydown', { keyCode: 8 });
            $(appWindow).trigger(e);
            e = $.Event('keyup', { keyCode: 8 });
            $(appWindow).trigger(e);
            // Jquery keydown trigger will only execute the handler. It doesn't actually delete the character.
            // We still want to update the value in sage bar programatically.
            $sageInput.val($sageInput.val().slice(0, -1));
            $sageInput.scope().sageInput = $sageInput.val();
            done(null, {});
        });
    };
});

describe('Sage interactivity test', function () {
    // TODO(Jasmeet): 3.1 There is some timing issue in answer-document/answer-sage-client. This doenst
    // happen when these steps are done manually. This probably reflects a underlying problem with cancelling of
    // callbacks.
    // SCAL-10976 Sage bar perf issue.
    xit('should type a long query and multiple backspaces in the sage bar', function () {
        sageInputElement().focus();
        var attempt = 0, i = 0;
        // Try to redo the sequence of steps multiple times to allow for any memory leak to build up that can adversly
        // affect the perf.
        for (attempt = 0; attempt < 5; ++attempt) {
            // Clear the sage bar and wait for the answer to be cleared up
            sageInputElement().enter('');
            waitFor(function (appWindow) {
                return appWindow.$(HEADLINE_VIZ).length === 0;
            });
            // This query is made to retain a table view selection.
            queryAndWaitForHeadline('revenue color');
            // Enter a long query that can bring up a filter and a chart and other heavy stuff.
            sageInputElement().enter('revenue tax ship mode order date between 11/01/1992 and 03/01/1993 customer region = africa');
            waitFor(function (appWindow) {
                return appWindow.$(HEADLINE_VIZ).length === 3;
            });
            sageInputElement().focus();
            // Delete the query until it becomes 'revenue tax'.
            for (i = 0; i < 80; ++i) {
                sageBarBackspace();
            }

            sageInputElement().triggerChange();
            waitForAnswerToLoad('revenue tax');
        }  // end for
        // After the initial priming of the app state, let us now measure the typing performance.
        // Start timer.
        var startTime = this.addFuture('Future timestamp', function (done) {
            done(null, (new Date()).getTime());
        });

        // Try doing backspace number of times. Expectation is that deleting 80 characters should be smooth enough that the action can complete in 2s.
        for (attempt = 0; attempt < 5; ++attempt) {
            // Enter a long query that can bring up a filter and a chart and other heavy stuff.
            sageInputElement().enter('revenue tax ship mode order date between 11/01/1992 and 03/01/1993 customer region = africa');
            sageInputElement().focus();
            // Delete the query until it becomes 'revenue tax'.
            for (i = 0; i < 80; ++i) {
                sageBarBackspace();
            }

            sageInputElement().triggerChange();
            waitForAnswerToLoad('revenue tax');
        }

        // End the timer.
        var endTime = this.addFuture('Future timestamp', function (done) {
            done(null, (new Date()).getTime());
        });
        // We don't expect 5 attempts of deleting 80chars in each attempt to take more than 25s.
        expect(differenceOfFutures(endTime, startTime)).not().toBeGreaterThan(25000);
    });
});
