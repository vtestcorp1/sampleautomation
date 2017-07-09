'use strict';

/* eslint camelcase: 1, no-undef: 0 */
var base = require('../base-do-not-use.js');
var answerPage = require('../scenarios/viz-layout/answer/answer.js');
var common = require('../scenarios/common.js');
var nav = common.navigation;
var dialog = require('../scenarios/dialog.js');

describe('Answers', function () {

    beforeAll(function () {
        return nav.goToAnswerSection();
    });

    afterEach(function () {
        dialog.confirmDialogIfOpen();
    });
    // safeguard for case where skip is specified in params instead of start/end
    var start = -1;
    var end = -1;
    if (!!browser.params.skip) {
        console.log("skip is specified in params");
        start = browser.params.skip;
        end = browser.params.answers.length;
    } else {
        start = browser.params.start;
        end = browser.params.end;
    }
    console.log("start = " + start + ", end = " + end);
    var length =  end - start + 1;

    function processAnswer(answer, screenShotName) {
        return base.hasErrorAlert().then(function (hasAlert) {
            if (hasAlert) {
                base.expandError();
            }
            base.takeScreenshot(
                screenShotName,
                'Screenshot for answer "' + answer.name + '" (' + answer.owner + ')',
                hasAlert);
        });
    }


    // browser.params.answers is populated in onPrepare method of
    // answers_config.js
    // this is a bit hacky way to get list of all answers before describing tests
    base.forEachWithSlice(browser.params.answers, function (answer) {
        var name = 'answer-' + answer.name + '[' + answer.owner + ']';
        if (base.shouldSkipTest(name)) {
            return;
        }
        it('should open answer ' + answer.name, function () {
            // We need to repeat this check here because by the time
            // this tests got called, some other process might have created
            // a screenshot
            if (base.shouldSkipTest(name)) {
                return;
            }
            base.openAnswerById(answer.owner);
            answerPage.waitForAnswerToLoad();
            processAnswer(answer, name);
        });

    }, start, length);
});
