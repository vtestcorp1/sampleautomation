/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E interaction scenarios involving saved answers.
 */

'use strict';

var answerListPage = require('../answers/answer-list-page');
var answerPage = require('../viz-layout/answer/answer');
var chart = require('../charts/charts');
var common = require('../common');
var dialog = require('../dialog');
var filterPanel = require('../filters/filter-panel');
var filterDialog = require('../filters/filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel');
var pinboards = require('../pinboards/pinboards');
var rangeFilter = require('../filters/range-filter');
var sage = require('../sage/sage');

describe('Sage saved answer interaction', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
        answerPage.clearVizDisplayPreference();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    afterAll(function () {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
    });

    it('[SMOKE][IE] should be able to show correct document title', function() {
        var savedAnswerName = 'Nested Viz';
        var expectedQueryText = 'revenue by brand1';

        answerListPage.goToSavedAnswer(savedAnswerName);
        sage.sageInputElement.waitForValueToBe(expectedQueryText);
        answerPage.waitForAnswerName(savedAnswerName);
    });

    it('[SMOKE][IE] should load new saved answer on url change', function () {
        browser.setLocation('saved-answer/4f28ae5d-7ef8-40f7-a3e5-84b6fdb574e3');
        answerPage.waitForAnswerWithQuery('revenue by brand1 year');
        browser.setLocation('saved-answer/540c45f4-397b-4455-b576-2ddf9af0a33c');
        answerPage.waitForAnswerWithQuery('revenue by brand1');
    });

    it('[SMOKE][IE] should save an answer with tokens and show phrase boxes when' +
        ' loading saved answer', function () {
        var query = 'growth of revenue by commit date for color red';
        var answerName = 'Test answer for verifying phrase boxes';

        answerPage.createAndSaveAnswer(query, answerName, false, chart.vizTypes.CHART);
        answerListPage.goToSavedAnswer(answerName);
        sage.waitForPhraseContainingText('growth of revenue by commit date');
        sage.waitForPhraseContainingText('for color red');

        answerListPage.deleteAnswer(answerName);
    });

    it('SCAL-12456 Saved answer accessible tables', function () {
        var sageQuery = 'revenue ship mode';
        var answerName = 'SCAL-12456';

        answerPage.createAndSaveAnswer(sageQuery, answerName, false, chart.vizTypes.CHART);
        answerListPage.goToSavedAnswer(answerName);
        leftPanel.openAndChooseSources(['CUSTOMER']);
        leftPanel.clickDone();
        leftPanel.waitForEnabledSource('CUSTOMER');
        answerListPage.deleteAnswer(answerName);
    });

    it('[SCAL-13070] should prevent navigation away from saved answer', function() {
        common.navigation.goToHome();
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
        var query = 'revenue customer region';
        var answerName = 'SCAL-13070';
        var pinboardName = answerName;

        answerPage.createAndSaveAnswer(query, answerName, false, chart.vizTypes.CHART);
        answerPage.waitForAnswerName(answerName);
        sage.sageInputElement.enter('revenue customer region africa');
        chart.waitForChartVizToLoad();
        answerPage.addShowingVizToNewPinboard(pinboardName);
        common.util.openSuccessLink();
        dialog.checkIfDialogExist();
        dialog.clickPrimaryButton();

        pinboards.deletePinboard(pinboardName);
        answerListPage.deleteAnswer(answerName);
        common.navigation.goToHome();
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    it('should be able to edit filter in a saved answer', function () {
        var filterBook = 'answerbook with a filter';
        var query = 'revenue for revenue > 1000000';

        answerPage.createAndSaveAnswer(query, filterBook, false, chart.vizTypes.TABLE);
        answerListPage.goToSavedAnswer(filterBook);
        answerPage.waitForAnswerToLoad();
        filterPanel.clickFilterItem('Revenue');
        // Change to '<'
        rangeFilter.changeFirstPredicate('<');
        filterDialog.clickDone();
        var transformedQuery = 'revenue revenue < 1000000';
        sage.sageInputElement.waitForValueToBe(transformedQuery);
        answerPage.waitForAnswerWithQuery(transformedQuery);
        answerPage.updateSavedAnswer();
        answerListPage.deleteAnswer(filterBook);
    });
});
