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

describe('Advanced rendering checks', function() {

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

    it('[SMOKE][IE] should display a chart with no-data label', function() {
        sage.sageInputElement.enter('revenue customer region sum revenue < 0');
        answerPage.waitForEmptyVizToLoad();
    });

    it('should format xAxis labels properly if xAxis is datetime but plot is not a time series: SCAL 2064', function() {
        sage.sageInputElement.enter('revenue commit date yearly');
        answerPage.waitForChartToLoad();
        expect(charts.getXAxisLabels().first().getText()).toBe('1992');
    });

    it('should show sorted date labels on Y-Axis for Scatter', function() {
        answerPage.queryAndWaitForChart('commit date yearly revenue');
        answerPage.navigateAndWaitForChartType('SCATTER');
        answerPage.openVizEditorPanel();
        charts.addYAxisColumn('Yearly (Commit Date)');
        charts.removeYAxisColumn('Total Revenue');
        charts.addXAxisColumn('Total Revenue');
        charts.removeXAxisColumn('Yearly (Commit Date)');
        expect(charts.getFirstYAxisLabels().first().getText()).toBe('1991');
        expect(charts.getFirstYAxisLabels().last().getText()).toBe('1999');
    });

    it('should display percentage values on the y-axis - SCAL-3097', function() {
        answerPage.queryAndWaitForChart('growth of count color by commit date monthly');
        charts.getFirstYAxisLabels().map(function(element) {
            return element.getText();
        }).then(function(labelValues) {
            //all y-values should have '%' suffix
            for (var i = 0; i < labelValues.length; i++) {
                expect(labelValues[i]).toMatch(/\%$/);
            }
            // sort the labels in the decreasing order of value.
            return labelValues.sort(function(a, b) {
                return parseFloat(b.slice(0, -1)) - parseFloat(a.slice(0, -1));
            });
        }).then(function(labelValues) {
            expect(parseFloat(labelValues[0].slice(0, -1))).toBeGreaterThan(100);
        });
    });

    it('should not have bar charts stacked over each other - SCAL 3219', function() {
        answerPage.queryAndWaitForChart('quantity tax customer region', 'COLUMN');
        charts.verifyNonOverlappingBars();
    });

    it('should not have bar charts stacked over each other in case of descending sort on x-axis - SCAL-6482', function() {
        answerPage.queryAndWaitForChart('customer region revenue sort by customer region descending', 'COLUMN');
        charts.verifyNonOverlappingBars();
    });

    it('should respect descending sort on x-axis', function() {
        answerPage.queryAndWaitForChart('revenue sort by customer region descending');
        expect(charts.isXAxisLabelsSortedDesc()).toBe(true);
    });

    // SCAL-14234
    xit('should sort all x-axis labels in multi-series chart', function() {
        answerPage.queryAndWaitForChart('revenue customer phone manufacturer');
        expect(charts.isXAxisLabelsSortedAsc()).toBe(true);
    });

    it('should not have negative y-axis ticks if all data points are positive', function() {
        answerPage.queryAndWaitForChart('revenue commit date');
        //for usual e2e window size negative points are not added by highcharts, we make the chart bigger by
        //maximizing it to trigger the highcharts logic for this feature
        charts.getFirstYAxisLabels().first().getText().then(function (text) {
            expect(text[0]).not.toBe('-');
        });
    });

    it('should link y-axes automatically when appropriate SCAL-6163', function() {
        answerPage.queryAndWaitForChart(
            'growth of average tax count customer custkey by commit date'
        );
        // one x-axis and one y-axis
        expect(charts.getAxesCount()).toBe(2);
    });

    it('should be able to chart additive numeric attributes', function() {
        answerPage.queryAndWaitForTable('customer region by tax');
        answerPage.navigateAndWaitForChartType('SCATTER');
    });

    it('should correctly format y-axis values like measures for measure as attribute scenario', function() {
        answerPage.queryAndWaitForTable('customer region by order total price');
        answerPage.navigateAndWaitForChartType('SCATTER');
        expect(charts.getFirstYAxisLabels().last().getText()).toMatch(/M$/);
    });

    it('should allow selecting only one series', function() {
        answerPage.queryAndWaitForChart('revenue customer region customer address');
        answerPage.navigateAndWaitForChartType('COLUMN');
        answerPage.openVizEditorPanel();
        charts.addXAxisColumn('Customer Region');
        charts.removeXAxisColumn('Customer Address');
        charts.addLegendColumn('Customer Address');
        charts.removeLegendColumn('Customer Region');
        charts.waitForVisibleSeriesCount(40);

        // select only one series
        charts.singularSelectLegendItem(',0aotnncjfhuam');
        charts.waitForVisibleSeriesCount(1);

        // restore default series selection
        charts.singularDeselectLegendItem(',0aotnncjfhuam');
        charts.waitForVisibleSeriesCount(40);


        // click on a series not already in chart to add it and make it the singular selection
        charts.singularSelectLegendItem('0svt1japfcykycsdtcq1p39y');
        charts.waitForVisibleSeriesCount(1);

        // reverting singular selection should keep the late-added series in the chart
        charts.singularDeselectLegendItem('0svt1japfcykycsdtcq1p39y');
        charts.waitForVisibleSeriesCount(40);
    });

    it('should render multiple measure on y-axis with linked axis (SCAL-9082)', function() {
        answerPage.queryAndWaitForChart('growth of revenue quantity by order date');
        browser.executeScript(
            'return arguments[0].getBoundingClientRect();',
            charts.getHighchartPaths().get(0).getWebElement()
        ).then(function (rect) {
            var lineSeriesWidth = rect.width;
            expect(lineSeriesWidth).toBeGreaterThan(0);
        });
    });

    it('should clear visible series names when legend is removed: SCAL-11103', function() {
        answerPage.queryAndWaitForChart('revenue customer region market segment');
        charts.toggleChartLegendItem('africa');
        charts.toggleChartLegendItem('asia');
        answerPage.openVizEditorPanel();
        charts.removeLegendColumn('Customer Region');
        charts.waitForHightchartRectCount(5);
    });

    it('should allow chart legend singular-selection to work with custom series selection: SCAL-11383', function() {
        var answerBookName = '[SCAL-11383 Answer]';

        answerPage.queryAndWaitForChart('revenue customer region market segment');
        charts.waitForVisibleSeriesCount(5);

        charts.singularSelectLegendItem('asia');
        charts.waitForVisibleSeriesCount(1);

        answerPage.saveCurrentUnsavedAnswer(answerBookName);
        charts.waitForVisibleSeriesCount(1);
        charts.singularDeselectLegendItem('asia');
        charts.waitForVisibleSeriesCount(5);
        common.navigation.goToAnswerSection();
        dialog.confirm();
        answerListPage.deleteAnswer(answerBookName);
    });

    it('should clear legend selection on chart legend change SCAL-11470', function() {
        answerPage.queryAndWaitForTable(
            'revenue customer region market segment customer nation'
        );
        answerPage.navigateAndWaitForChartType('LINE');
        charts.waitForVisibleSeriesCount(25);

        // select only one series
        charts.singularSelectLegendItem('africa, automobile');
        charts.waitForVisibleSeriesCount(1);

        leftPanel.expandSource('CUSTOMER');
        leftPanel.ensureCheckMark('Customer Nation');
        leftPanel.removeColumn('Customer Nation');
        charts.waitForChartVizToLoad('COLUMN');
        charts.waitForVisibleSeriesCount(5);
    });

    it('should show chart on save', function() {
        answerPage.queryAndWaitForChart('revenue customer region');
        charts.waitForHightchartRectCount(5);

        var answerName = 'test';
        answerPage.saveCurrentUnsavedAnswer(answerName);
        answerPage.waitForAnswerTitle(answerName);
        expect(browser.getCurrentUrl()).toContain('saved-answer');
        charts.waitForHightchartRectCount(5);
        answerListPage.deleteAnswer(answerName);
    });

    it('should show saved chart without axis config', function() {
        answerListPage.goToSavedAnswer('Brand Revenue');
        charts.waitForHightchartRectCount(20);
    });

    it('should show chart with multiple y axis on navigation from table SCAL-15408', function() {
        var answerName = 'SCAL-15408';
        answerPage.setVizDisplayPreferenceToTable();
        answerPage.queryAndWaitForTable('tax discount customer region supplier region');
        answerPage.saveCurrentUnsavedAnswer(answerName);
        answerListPage.goToSavedAnswer(answerName);
        table.waitForTable();
        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        answerPage.waitForChartToLoad();
        charts.waitForHightchartRectCount(10);
        // To avoid running into unsaved changes dialog.
        answerPage.selectTableType();
        answerListPage.deleteAnswer(answerName);
    });

    it('[SMOKE] should allow to view line stacked column without errors', function() {
        answerPage.queryAndWaitForChart('tax discount customer region supplier region', 'COLUMN');
        answerPage.navigateAndWaitForChartType('LINE_STACKED_COLUMN');
        answerPage.openVizEditorPanel();
        charts.toggleShareYAxis();
        charts.waitForChartVizToLoad();
    });

    it('should allow navigation from line stacked column to stacked column SCAL-15438', function() {
        answerPage.queryAndWaitForChart('tax discount customer region supplier region', 'COLUMN');
        answerPage.navigateAndWaitForChartType('LINE_STACKED_COLUMN');

        answerPage.openVizEditorPanel();
        charts.toggleShareYAxis();

        answerPage.navigateAndWaitForChartType('STACKED_COLUMN');
        charts.waitForHightchartRectCount(25);
    });

    it('should error on negative value on pie chart SCAL-15077', function() {
        answerPage.queryAndWaitForTable('color');
        formula.createAndSaveFormulaInAnswer('revenue * -1', 'neg');
        charts.waitForChartVizToLoad();
        answerPage.navigateToChartType(charts.chartTypes.PIE);
        answerPage.waitForChartDataNotSupported();
    });

    it('[SMOKE][IE] should show tooltip', function() {
        answerPage.queryAndWaitForChart('revenue customer region');
        charts.waitForChartVizToLoad();
        charts.waitForHightchartRectCount(5);
        common.util.mouseMoveToElement(charts.getColumnRectangles().first());
        common.util.mouseMoveToElement(charts.getColumnRectangles().last());
        charts.waitForTooltip();
    })
});
