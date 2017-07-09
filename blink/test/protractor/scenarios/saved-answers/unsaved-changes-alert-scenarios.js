/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This suite contains tests for answers when user navigates away with unsaved
 * changes.
 */

'use strict';

var common = require('../common');
var answer = require('../viz-layout/answer/answer.js');
var answerListPage = require('../answers/answer-list-page.js');
var chart = require('../charts/charts.js');
var table = require('../table/table');
var dialog = require('../dialog.js');
var headline = require('../viz-layout/headline/headline.js');
var dataPanel = require('../sage/data-panel/data-panel');
var pinboards = require('../pinboards/pinboards.js');

describe('unsaved changes alerting for saved answers', function(){
    var originalQuery = 'quantity revenue color',
        savedDocumentName = 'unsaved changes alert',
        saveAsDocumentName = 'copy unsaved changes alert';

    beforeEach(function () {
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER', 'PART']);
        dataPanel.clickDone();
        answer.createAndSaveAnswer(originalQuery, savedDocumentName, false);
    });

    afterEach(function () {
        answerListPage.deleteAnswer(savedDocumentName);
    });

    it('should show up on query change and path doesnt change on cancellation', function() {
        answer.queryAndWaitForAnswer('quantity revenue color tax');
        var beforePath = browser.getLocationAbsUrl();
        element(common.navigation.locators.HOME).click();
        dialog.waitForDialogPresent();
        dialog.clickCancelButton();
        expect(browser.getLocationAbsUrl()).toBe(beforePath);
        answer.updateSavedAnswer();
    });

    it('should show up on headline aggregation change', function() {
        answer.selectTableType();
        headline.changeAggregation('Quantity', 'AVG');
        element(common.navigation.locators.HOME).click();
        dialog.waitForDialogPresent();
        dialog.clickCancelButton();
        answer.updateSavedAnswer();
    });

    it('should show up on chart change', function() {
        answer.navigateAndWaitForChartType(chart.chartTypes.COLUMN);
        answer.waitForChartToLoad();
        element(common.navigation.locators.HOME).click();
        dialog.waitForDialogPresent();
        dialog.clickCancelButton();
        answer.updateSavedAnswer();
    });

    it('should not show up on a saved answer', function() {
        answer.navigateAndWaitForChartType(chart.chartTypes.COLUMN);
        answer.waitForChartToLoad();
        answer.updateSavedAnswer();
        element(common.navigation.locators.HOME).click();
        dialog.waitForDialogAbsent();
    });

    // TODO (Jasmeet/Rahul): Has an issue with content editable check. Needs fix.
    // it('should not show up on "make a copy"', function() {
    //     answer.queryAndWaitForAnswer('quantity size');
    //     answer.makeACopy(saveAsDocumentName);
    //     answer.waitForAnswerName(saveAsDocumentName);
    //     element(common.navigation.locators.HOME).click();
    //     dialog.waitForDialogAbsent();
    //     answerUI.deleteAnswer(saveAsDocumentName);
    // });

    it('[SMOKE][IE] should save and exit on clicking "save & exit"', function() {
        var newQuery = 'quantity revenue color tax';
        answer.queryAndWaitForAnswer(newQuery);
        element(common.navigation.locators.HOME).click();
        dialog.waitForDialogPresent();
        dialog.clickPrimaryButton();
        common.navigation.goToAnswerSection();
    });

    it('[SMOKE][IE] should discard and exit on clicking "discard & exit"', function(){
        var newQuery = 'quantity revenue color tax';
        answer.queryAndWaitForAnswer(newQuery);
        element(common.navigation.locators.HOME).click();
        dialog.waitForDialogPresent();
        dialog.confirm();
        common.util.waitForElement(common.navigation.locators.HOME_SAGE_BAR);
        common.navigation.goToAnswerSection();
    });

    it('SCAL-18423 should not show up on pinning to pinboard', function() {
        var pinboardName = 'unsavedAlertTestPinboard1';
        answer.addShowingVizToNewPinboard(pinboardName);
        // Navigate away w/o making any changes to the answer
        common.navigation.goToAnswerSection();
        dialog.waitForDialogAbsent();
        pinboards.deletePinboard(pinboardName);
    });
});
