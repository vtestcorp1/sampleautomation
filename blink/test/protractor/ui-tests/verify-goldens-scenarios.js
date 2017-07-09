'use strict';

/* eslint camelcase: 1, no-undef: 0 */
var base = require('../base-do-not-use.js');
var answerPage = require('../scenarios/viz-layout/answer/answer.js');
var common = require('../scenarios/common.js');
var tag = require('../scenarios/tagging/tag.js');
var savedAnswers = require('../scenarios/saved-answers/saved-answers.js');
var fs = require('fs-extra');
var path = require('path');
var dialog = require('../scenarios/dialog.js');


describe('Answers', function () {
    var originalTimeout;

    beforeEach(function() {
        // here we have to increase the default timeout interval to download
        // the trace asynchronously
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
    });

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        dialog.confirmDialogIfOpen();
    });

    browser.params.answers.forEach(function (answer){
        if (base.shouldSkipDownload(answer.name.replace(/\:/, '-'), "/tmp/")) {
            return;
        }
        it('should download trace of ' + answer.name, function () {
            var pro;
            var testOutput = answer.name;
            (function (answerId, answerName) {
                var nextPromise = base.openAnswerById(answer.owner)
                    .then(function () {
                        answerPage.navigateToChartType('TABLE');
                        return base.waitForLoaderOrError().then(function (error) {
                        });
                    }).then(function () {
                        return savedAnswers.verifyAnswerOpenable(answerId, "");
                    }).then(function () {
                        browser.executeScript(
                            "window.testCapture.captureAndDownload('" + answerName + ".json');");
                        browser.driver.wait(function () {
                            return fs.existsSync('/tmp/' + answerName.replace(/\:/, '-') + ".json");
                        }, 60000);
                    });
                if (!pro) {
                    pro = nextPromise;
                } else {
                    pro = pro.then(function () {
                        return nextPromise;
                    });
                }
            })(answer.id, testOutput);
        });
    });

});
