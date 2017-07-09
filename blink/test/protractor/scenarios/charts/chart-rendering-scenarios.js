/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answerPage = require('../viz-layout/answer/answer.js');
var charts = require('./charts.js');
var common = require('../common.js');
var dialog = require('../dialog.js');
var sage = require('../sage/sage.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var formula = require('../formula/formula');
var table = require('../table/table');

describe('Chart rendering checks', function () {

    beforeAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        answerListPage.goToAnswer();
        answerPage.clearVizDisplayPreference();
    });

    afterAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    it('[SMOKE][IE] should display right axis titles and labels', function () {
        answerPage.queryAndWaitForChart('revenue brand1 color', 'COLUMN');
        expect(charts.getXAxisTitle()).toBe('Brand1');
        // Expect the correct x axis labels for the first categories
        // because of rotation of labels the text can be truncated in e2e window
        expect(charts.getXAxisLabels().first().getText()).toMatch(/^mfgr#111$/);
        expect(charts.getYAxisTitle()).toBe('Total Revenue');
        expect(element.all(by.css(charts.selectors.LEGEND_ITEM)).count()).toBe(0);
    });

    it('[SMOKE][IE] should display a chart with date values in the x-axis', function () {
        answerPage.queryAndWaitForChart('revenue color order date detailed', 'LINE');
        // When there is a time dimension, we want to put it on the x-axis. Verify that order date
        // is on x-axis
        expect(charts.getXAxisTitle()).toBe('Order Date');
    });

    it('should check show data labels by default for waterfall chart and retain user change', function () {
        var query = 'revenue brand1 color';
        answerPage.queryAndWaitForChart(query, 'COLUMN');

        answerPage.openVizEditorPanel();
        charts.waitForShowDataLabelsUnChecked();

        answerPage.navigateAndWaitForChartType('WATERFALL');
        answerPage.openVizEditorPanel();
        charts.waitForShowDataLabelsChecked();

        charts.toggleShowDataLabelsCheckbox();
        var answerName = 'worksheetChartAnswer';
        answerPage.saveCurrentUnsavedAnswer(answerName);
        answerPage.openVizEditorPanel();
        charts.waitForShowDataLabelsUnChecked();

        answerListPage.deleteAnswer(answerName);
    });

    it('should be able to view line-combo chart', function () {
        var query = 'revenue tax order date';
        answerPage.queryAndWaitForChart(query);
        answerPage.navigateAndWaitForChartType('LINE_COLUMN');
    });

    it('should display scatter plot on group sum as there are multi-y per x', function () {
        var query = 'customer region';
        answerPage.queryAndWaitForTable(query);
        formula.createAndSaveFormulaInAnswer(
            'group_sum(revenue, customer nation)',
            'pinned formula'
        );
        answerPage.waitForChartToLoad('SCATTER');
    });

    it('PARETO chart should show x axis values in descending order of measure', function() {
        var query = 'revenue by color';
        answerPage.queryAndWaitForChart(query);
        answerPage.navigateAndWaitForChartType('PARETO');
        charts.waitForYAxisLabel(0, 1, '3.61B');
        expect(charts.getXAxisLabels().first().getText()).toBe('beige');
        expect(charts.getXAxisLabels().last().getText()).toBe('smoke');
    });

    it('LINE chart should use rainbow colors', function () {
        answerPage.queryAndWaitForChart('revenue line number commit date', 'LINE');
        var primaryColors = ['rgb(255,148,25)',
            'rgb(247,85,52)',
            'rbg(227,86,197)',
            'rgb(148,80,230)',
            'rbg(57,86,204)',
            'rgb(45,144,225)',
            'rgb(26,197,219)',
            'rgb(70,194,123)'];
        charts.verifyLineChartColor(primaryColors, 0);
        charts.verifyLineChartColor(primaryColors, 1);
        charts.verifyLineChartColor(primaryColors, 4);
    });
});
