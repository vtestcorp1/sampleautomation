/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var browserUtil = require('../browser-utils');
var util = common.util;
var nav = common.navigation;
var leftPanel = require('../sage/data-panel/data-panel.js');
var answer = require('../viz-layout/answer/answer');
var sage = require('../sage/sage.js');

describe('Alert cases', function () {
    beforeAll(function() {
        common.navigation.goToHome();
        common.navigation.addUrlParameter('successAlertHidingDelay', 5000);
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    afterAll(function() {
        common.navigation.goToHome();
        common.navigation.removeUrlParameter('successAlertHidingDelay');
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    it('should trigger a download trace report for an error callosum response', function() {
        browserUtil.transformer.addRequestTransformer(function(config) {
            if (config.url === '/callosum/v1/security/effectivepermission') {
                config.data.type = 'random';
                config.data.id = 'random';
            }
        });

        browser.executeScript(function(){
            window.blink.test = {};
            window.blink.test.isDocumentSubmitted = false;
            window.blink.test.submit = window.HTMLFormElement.prototype.submit;
            window.HTMLFormElement.prototype.submit = function() {
                window.blink.test.isDocumentSubmitted = true;
            };
        });

        nav.goToAnswerSection();
        util.waitForVisibilityOf(common.util.selectors.ERROR_NOTIF);
        element(common.util.locators.WHAT_HAPPENED_LINK).click();
        util.waitForAndClick(common.util.selectors.DOWNLOAD_TRACE).click();

        browser.executeScript(function(){
            window.HTMLFormElement.prototype.submit = window.blink.test.submit;
            window.blink.test.submit = null;
            return window.blink.test.isDocumentSubmitted;
        }).then(function(submitted){
            expect(submitted).toBe(true);
        });

        browserUtil.transformer.resetRequestTransformers();
    });

    it('should display completion ratio warning', function() {
        browserUtil.transformer.addSuccessResponseTransformer(function(response) {
            if (response.config.url === '/callosum/v1/data/reportbook') {
                response.data.completionRatio = .2;
            }
        });

        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        sage.sageInputElement.enter('revenue color');
        util.waitForVisibilityOf(common.util.selectors.PROBLEM_NOTIF);
        browserUtil.transformer.resetResponseTransformers();
    });
});
