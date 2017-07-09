/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */


var sage = require('../sage/sage.js');
var common = require('../common.js');
var util = common.util;
var charts = require('../charts/charts.js');
var dataUI = require('../data-ui/data-ui.js');
var importUtils = require('../data-ui/import-wizard/import-wizard.js');
var answerPage = require('../viz-layout/answer/answer.js');

describe('currency scenarios', function() {

    var CSV_FILE_NAME = './data-ui/import-wizard/currency_sample.csv';
    var CSV_TABLE_NAME = 'currency_sample';
    var columns = {
        TID: 'tid',
        REVENUE: 'revenue',
        ISO_CODE: 'iso_code'
    };

    function importCurrencyDataTable() {
        common.navigation.goToUserDataSection();
        importUtils.importSimpleCSVTable(CSV_FILE_NAME, 5);
        // We choose this option so that the table we just imported gets added in the left panel
        // automatically.
        importUtils.goToAskQuestion();
    }

    function deleteCurrencyDataTable() {
        importUtils.deleteMockCSV(CSV_TABLE_NAME);
    }

    function updateCurrencyInfo(forColumn, choice, additionalValue) {
        dataUI.goToDataUI();
        util.waitForElement(by.css('.bk-list'));
        dataUI.goToTableByName(CSV_TABLE_NAME);
        dataUI.setCurrencyTypeInfo(forColumn, choice, additionalValue);
        dataUI.saveChanges();
    }

    beforeAll(function () {
        importCurrencyDataTable();
    });

    afterAll(function () {
        deleteCurrencyDataTable();
    });

    beforeEach(function(){
        common.navigation.goToHome();
    });

    it('It should automatically split revenue for each currency', function() {
        updateCurrencyInfo(columns.REVENUE, 'From a column', columns.ISO_CODE);
        common.navigation.goToQuestionSection();
        answerPage.queryAndWaitForSageIndexing('revenue');
        answerPage.waitForAnswerToLoad();
        answerPage.selectTableType();
        util.waitForElement(by.tagName('blink-viz-table'));
        var table = $('blink-viz-table');
        var rows = table.all(by.css('.slick-row'));
        // Should be two rows for revenue, 1 for USD and 1 for INR.
        expect(rows.count()).toBe(2);
        expect(rows.first().isElementPresent(by.cssContainingText('.slick-cell', '₹2,300.00')))
            .toBe(true);
        expect(rows.last().isElementPresent(by.cssContainingText('.slick-cell', '$450.00')))
            .toBe(true);
    });

    // [SCAL-20562] Enable once backend issue is fixed.
    xit('Should show currency codes on y-axis only if there is a unique currency', function() {
        updateCurrencyInfo(columns.REVENUE, 'From a column', columns.ISO_CODE);
        common.navigation.goToQuestionSection();
        sage.sageInputElement.enter("revenue tid");
        answerPage.waitForAnswerToLoad();
        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        util.waitForElement(by.tagName('blink-viz-chart'));
        var yAxisLabels = charts.getFirstYAxisLabels();
        expect(yAxisLabels.count()).toBeGreaterThan(0);
        yAxisLabels.each(function (label) {
            expect(label.getText()).not.toMatch("\\$");
            expect(label.getText()).not.toMatch('₹');
        });

        sage.sageInputElement.enter("revenue tid usd");
        util.waitForElement(by.tagName('blink-viz-chart'));
        yAxisLabels = charts.getFirstYAxisLabels();
        expect(yAxisLabels.count()).toBeGreaterThan(0);
        yAxisLabels.each(function (label) {
            expect(label.getText()).toMatch("\\$");
        });

        sage.sageInputElement.enter("revenue tid inr");
        util.waitForElement(by.tagName('blink-viz-chart'));
        yAxisLabels = charts.getFirstYAxisLabels();
        expect(yAxisLabels.count()).toBeGreaterThan(0);
        yAxisLabels.each(function (label) {
            expect(label.getText()).toMatch('₹');
        });
    });

    it('Should always show currency code on y-axis if iso code is specified', function (){
        updateCurrencyInfo(columns.REVENUE, 'Specify ISO Code', 'INR');
        common.navigation.goToQuestionSection();
        sage.sageInputElement.enter("revenue tid");
        answerPage.waitForAnswerToLoad();
        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        charts.waitForChartVizToLoad();
        var yAxisLabels = charts.getFirstYAxisLabels();
        expect(yAxisLabels.count()).toBeGreaterThan(0);
        yAxisLabels.each(function (label) {
            expect(label.getText()).toMatch('₹');
        });
    });
});
