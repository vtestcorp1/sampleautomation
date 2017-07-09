/**
 * Copyright Thoughtspot Inc. 2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * Test all the a3 analysis triggers.
 * NOTE: The intent of tests here is not to test job creation,
 * execution, pinboard creation, quality of results etc.
 */
'use strict';

var actions = require('../actions-button');
var answer = require('../viz-layout/answer/answer');
var answerListPage = require('../answers/answer-list-page');
var common = require('../common');
var charts = require('../charts/charts');
var contextMenu = require('../context-menu/context-menu-po');
var pinboards = require('../pinboards/pinboards.js');
var sage = require('../sage/sage');

describe('A3 trigger testing', function () {
    function verifyTrigger() {
        common.util.expectSuccessNotif();
        common.util.dismissNotificationIfPresent();
    }

    it('[SMOKE] should allow auto analysis from ad-hoc answer', function () {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        answer.doAdhocQuery(query, sources);
        actions.selectActionButtonAction(actions.actionLabels.AUTO_ANALYSE);
        verifyTrigger();
    });

    it('show allow auto analysis from saved answer', function () {
        var savedAnswerName = 'Nested Viz';
        var expectedQueryText = 'revenue by brand1';

        answerListPage.goToSavedAnswer(savedAnswerName);
        sage.sageInputElement.waitForValueToBe(expectedQueryText);
        answer.waitForAnswerName(savedAnswerName);
        actions.selectActionButtonAction(actions.actionLabels.AUTO_ANALYSE);
        verifyTrigger();
    });

    it('should allow auto analysis from viz context', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Basic Pinboard 1');
        var pinboardElement = pinboards.getVizElementByName('Visualization 1');
        pinboards.openVizEditor(pinboardElement);
        answer.waitForAnswerToLoad();
        actions.selectActionButtonAction(
            actions.actionLabels.AUTO_ANALYSE,
            pinboards.selectors.VIZ_CONTEXT
        );
        verifyTrigger();
        pinboards.closeVizEditor();
    });

    it('should allow auto analysis from pinboard tile', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Basic Pinboard 1');
        var pinboardElement = pinboards.getVizElementByName('Visualization 1');
        pinboards.autoAnalyzeViz(pinboardElement);
        verifyTrigger();
    });


    xit('[SMOKE] should allow auto analysis from chart context menu', function () {
        common.navigation.goToQuestionSection();
        var question = 'revenue by color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(question, sources, charts.vizTypes.CHART);
        answer.waitForChartToLoad();
        // Click the selector button.
        answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        var el = $$(charts.selectors.CHART_COLUMN).get(0);
        common.util.rightClickElement(el);
        common.util.waitForAndClick(contextMenu.locators.AUTO_ANALYZE);
        verifyTrigger();
    });

    // TODO(Jasmeet):
    // 1. fix the point analysis on charts
    // 2. Add tests
    // Custom Analysis
    // context menu table

    // Custom analysis from jobs page
    // Custom analysis from insights page
});
