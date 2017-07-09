/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var action = require('../actions-button.js');
var answerPage = require('../viz-layout/answer/answer.js');
var common = require('../common.js');
var dataUI = require('../data-ui/data-ui.js');
var dialog = require('../dialog.js');
var sage = require('../sage/sage.js');
var leftPanel = require('../sage/data-panel/data-panel');
var util = require('../common.js').util;

describe('Aggregated worksheets', function () {

    beforeAll(function(){
        browser.executeScript('window.blink.env.enableUnsavedChangesAlert = true');
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'CUSTOMER', 'PART']);
        leftPanel.clickDone();
    });

    afterAll(function(){
        browser.executeScript('window.blink.env.enableUnsavedChangesAlert = false');
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    it('should not throw an error when navigating away from aggregated worksheet: SCAL-11338', function () {
        dataUI.goToTableByName('RevenueAggrWs');
        dataUI.editSelectedItem();
        dataUI.goToDataUI();
        util.expectNoErrorNotif();
    });

    xit('should save worksheet on update: SCAL-11338', function () {
        common.navigation.goToQuestionSection();
        answerPage.queryAndWaitForSageIndexing('revenue customer region');
        answerPage.waitForAnswerWithQuery('revenue customer region');
        action.selectActionButtonAction(action.actionLabels.SAVE_AS_WORKSHEET);
        dialog.clickPrimaryButton();
        answerPage.waitForAnswerToLoad();
        sage.sageInputElement.append(' market segment');
        answerPage.waitForAnswerWithQuery('revenue customer region market segment');
        dataUI.goToDataUI();
        dialog.clickPrimaryButton();
        dataUI.goToTableByName('Total Revenue by Customer Region');
        dataUI.editSelectedItem();
        answerPage.waitForAnswerWithQuery('revenue customer region market segment');
        dataUI.goToDataUI();
        dataUI.deleteMetadataItems(['Total Revenue by Customer Region']);
    });
});
