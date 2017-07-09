/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answerPage = require('../viz-layout/answer/answer.js');
var charts = require('./charts.js');
var sage = require('../sage/sage.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var filterDialog = require('../filters/filter-dialog');
var rangeFilter = require('../filters/range-filter');

describe('Chart column label menu', function() {

    beforeAll(function() {
        answerListPage.goToAnswer();
        answerPage.clearVizDisplayPreference();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
    });

    beforeEach(function() {
        answerListPage.goToAnswer();
    });

    afterAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    it('should be able to sort correctly from the column label control', function() {
        answerPage.queryAndWaitForChart('revenue color');
        charts.columnLabelMenu.openForYAxis();
        charts.columnLabelMenu.clickSort();
        sage.sageInputElement.waitForValueToBe('revenue color sort by revenue descending');
    });

    it('should be able to sort correctly from the column label control for x-axis', function() {
        answerPage.queryAndWaitForChart('order total price customer nation revenue ' +
            'sort by customer nation descending');
        charts.columnLabelMenu.openForXAxis();
        charts.columnLabelMenu.clickSort();
        sage.sageInputElement.waitForValueToBe('order total price customer nation revenue ' +
            'sort by customer nation');
    });

    it('should be able to sort correctly by clicking sort icon on x-axis', function() {
        answerPage.queryAndWaitForChart('order total price customer nation revenue ' +
            'sort by customer nation');
        charts.sortXAxisDescendingUsingIcon();
        sage.sageInputElement.waitForValueToBe('order total price customer nation revenue ' +
            'sort by customer nation descending');
    });

    it('should be able to change aggregation from the column label control', function() {
        answerPage.queryAndWaitForChart('revenue commit date');
        charts.columnLabelMenu.openForYAxis();
        charts.columnLabelMenu.chooseAggregationType('MAX');
        sage.sageInputElement.waitForValueToBe('max revenue commit date');
    });

    it('should be able to date bucketing the column label control', function() {
        answerPage.queryAndWaitForChart('revenue commit date');
        charts.columnLabelMenu.openForXAxis();
        charts.columnLabelMenu.chooseTimeBucket('DAILY');
        sage.sageInputElement.waitForValueToBe('revenue commit date daily');
    });

    // Enable once [SCAL-18155] is fixed.
    it('should be able to apply filter from column label control', function() {
        answerPage.queryAndWaitForChart('revenue color');
        charts.columnLabelMenu.openForYAxis();
        charts.columnLabelMenu.clickSort();
        sage.sageInputElement.waitForValueToBe('revenue color sort by revenue descending');

        charts.columnLabelMenu.openForYAxis();
        charts.columnLabelMenu.clickFilter();
        filterDialog.waitForItToAppear();

        rangeFilter.changeFirstPredicate('>=');
        rangeFilter.setFirstOperandValue('200000000');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe(
            'revenue color sort by revenue descending sum revenue >= 200000000'
        );
    });

    it('should move the year to the X-Axis title, if all values are in the same year', function() {
        answerPage.queryAndWaitForChart(
            'revenue order date order date >= 01/02/1994 order date <= 12/31/1994'
        );

        expect(charts.getXAxisTitle()).toBe('Weekly (Order Date)');
        expect(charts.getXAxisTitleDetail()).toBe('');

        answerListPage.goToAnswer();
        answerPage.queryAndWaitForChart(
            'revenue order date order date >= 01/02/1994 order date <= 12/31/1994 detailed'
        );
        expect(charts.getXAxisTitle()).toBe('Order Date');
        expect(charts.getXAxisTitleDetail()).toBe('for 1994');
    });

    //SCAL-16052
    it('Pareto chart should have maximum value on left axis', function() {
        answerPage.queryAndWaitForChart(
            'revenue order date order date >= 01/02/1994 order date <= 01/15/1994'
        );
        answerPage.navigateToChartType(charts.chartTypes.PARETO);
        expect(charts.getFirstYAxisLabels().first().getText()).toBe('0');
        expect(charts.getFirstYAxisLabels().last().getText()).toBe('141M');
        expect(charts.getSecondYAxisLabels().first().getText()).toBe('0%');
        expect(charts.getSecondYAxisLabels().last().getText()).toBe('100%');
    });
});
