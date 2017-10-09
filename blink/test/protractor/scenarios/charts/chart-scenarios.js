/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var actionsButton = require('../actions-button.js');
var answerListPage = require('../answers/answer-list-page.js');
var answerPage = require('../viz-layout/answer/answer');
var blinkList = require('../list/blink-list.js');
var charts = require('./charts.js');
var common = require('../common.js');
var dialog = require('../dialog.js');
var sage = require('../sage/sage.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var pinboards = require('../pinboards/pinboards.js');

describe('chart rendering', function() {

    // Client state of the panel is persisted by Callosum, so we make sure
    // that no sources are left selected before and after the test
    // Same goes for chart-panel, as tests can be shuffled, we need to be
    // sure that there is no persisted state
    beforeAll(function() {
        answerListPage.goToAnswer();
        answerPage.clearVizDisplayPreference();
    });

    beforeEach(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    afterEach(function(){
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    it('[SMOKE][IE] should allow chart type switching ' +
        '+ should render pie chart for time series', function() {
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        var query = 'revenue order date yearly';
        answerPage.queryAndWaitForChart(query);
        answerPage.navigateAndWaitForChartType('PIE');
        expect(charts.getPieSlices().count()).toBe(7);
    });

    it('should render funnel chart for time series', function() {
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        var query = 'revenue order date yearly';
        sage.sageInputElement.enter(query);
        answerPage.navigateAndWaitForChartType('FUNNEL');
        expect(charts.getFunnelEntities().count()).toBe(7);
    });

    it('should save chart with correct axis config', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue color customer region';
        sage.sageInputElement.enter(query);
        charts.waitForVisibleSeriesCount(5);
        actionsButton.selectActionButtonAction(actionsButton.actionLabels.SAVE);
        dialog.clickPrimaryButton();
        answerPage.waitForAnswerTitle('Total Revenue by Color and Customer Region');
        charts.waitForVisibleSeriesCount(5);
        answerListPage.deleteAnswer('Total Revenue by Color and Customer Region');
        answerListPage.goToAnswer();
    });

    it('should sort data based on total stack height', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER', 'SUPPLIER']);
        leftPanel.clickDone();
        var query = 'revenue customer region supplier region sort by revenue';
        sage.sageInputElement.enter(query);
        charts.waitForVisibleSeriesCount(5);
        answerPage.navigateAndWaitForChartType('STACKED_COLUMN');
        expect(charts.getXAxisLabels().get(0).getText()).toBe('africa');
        expect(charts.getXAxisLabels().get(1).getText()).toBe('europe');
        expect(charts.getXAxisLabels().get(2).getText()).toBe('america');
        expect(charts.getXAxisLabels().get(3).getText()).toBe('middle east');
        expect(charts.getXAxisLabels().get(4).getText()).toBe('asia');
    });

    // xit('should sort data based on day text in day of week', function() {
    //     leftPanel.openAndChooseSources(['LINEORDER']);
    //     leftPanel.clickDone();
    //     var query = 'revenue day of week';
    //     sage.sageInputElement.enter(query);
    //     common.util.waitForAndClick(
    //         by.cssContainingText(sage.selectors.SAGE_SUGGESTION_ITEM, 'Order Date in Lineorder')
    //     );
    //     charts.waitForColumnCountToBe(1);
    //     answerPage.navigateAndWaitForChartType('COLUMN');
    //     expect(charts.getXAxisLabels().get(0).getText()).toBe('Monday');
    //     expect(charts.getXAxisLabels().get(1).getText()).toBe('Tuesday');
    //     expect(charts.getXAxisLabels().get(2).getText()).toBe('Wednesday');
    //     expect(charts.getXAxisLabels().get(3).getText()).toBe('Thursday');
    //     expect(charts.getXAxisLabels().get(4).getText()).toBe('Friday');
    //     expect(charts.getXAxisLabels().get(5).getText()).toBe('Saturday');
    //     expect(charts.getXAxisLabels().get(6).getText()).toBe('Sunday');
    // });

    xit('should correctly sort stacked column chart', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue supplier region color sort by revenue';
        sage.sageInputElement.enter(query);
        charts.waitForVisibleSeriesCount(5);
        expect(charts.getXAxisLabels().first().getText()).toBe('pale');
        charts.toggleChartLegendItem('africa');
        charts.waitForVisibleSeriesCount(4);
        charts.waitForVisibleSeriesCount(4);
        expect(charts.getXAxisLabels().first().getText()).toBe('snow');
    });

    it('pareto axis should be x-axis sorted in ascending order', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER', 'SUPPLIER']);
        leftPanel.clickDone();
        var query = 'revenue customer region supplier region sort by revenue';
        sage.sageInputElement.enter(query);
        charts.waitForVisibleSeriesCount(5);
        answerPage.navigateAndWaitForChartType(charts.chartTypes.PARETO);
        expect(charts.getXAxisLabels().get(0).getText()).toBe('africa');
        expect(charts.getXAxisLabels().get(1).getText()).toBe('europe');
        expect(charts.getXAxisLabels().get(2).getText()).toBe('america');
        expect(charts.getXAxisLabels().get(3).getText()).toBe('middle east');
        expect(charts.getXAxisLabels().get(4).getText()).toBe('asia');
    });

    it('should allow setting yAxis range, also save correctly', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue supplier region';
        answerPage.queryAndWaitForChart(query);
        answerPage.openVizEditorPanel();
        charts.chartEditor.setYAxisRange('0', '100000000');
        expect(charts.getFirstYAxisLabels().last().getText()).toBe('100M');
        var answerName = 'yAxisRange';
        answerPage.saveCurrentAnswer(answerName);
        answerPage.waitForAnswerTitle(answerName);
        charts.waitForChartVizToLoad();
        expect(charts.getFirstYAxisLabels().last().getText()).toBe('100M');
        common.navigation.goToAnswerSection();
        dialog.confirm();
        answerListPage.deleteAnswer(answerName);
        answerListPage.goToAnswer();
    });

    it('SCAL-18604 should allow setting yAxis range', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue supplier region';
        answerPage.queryAndWaitForChart(query);
        answerPage.openVizEditorPanel();
        charts.chartEditor.setYAxisRange('1', '4000000000');
        charts.waitForYAxisLabel(0, 0, '500M');
        charts.waitForYAxisLabel(0, 7, '4B');
        charts.chartEditor.setYAxisRange('1000000000', '4000000000');
        charts.waitForYAxisLabel(0, 0, '1B');
    });

    it('SCAL-19818 Updating chart with y axis range should render', function() {
        var pinboardName = 'SCAL-19818';
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue supplier region';
        answerPage.queryAndWaitForChart(query);
        answerPage.openVizEditorPanel();
        charts.chartEditor.setYAxisRange('1', '4000000000');
        charts.waitForYAxisLabel(0, 0, '500M');
        charts.waitForYAxisLabel(0, 7, '4B');
        answerPage.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        var viz = pinboards.getVizElementByName('Total Revenue by Supplier Region');
        pinboards.openVizEditor(viz);
        answerPage.openVizEditorPanel();
        charts.chartEditor.setYAxisRange('1000000000', '4000000000');
        pinboards.closeVizEditor(true, true);
        charts.waitForHightchartRectCount(5);
    });

    it('SCAL-18267 should show yAxis as percent', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue color customer region';
        answerPage.queryAndWaitForChart(query);
        expect(charts.getFirstYAxisLabels().last().getText()).toBe('350M');
        answerPage.openVizEditorPanel();
        charts.chartEditor.toggleYAxisAsPercent();
        expect(charts.getFirstYAxisLabels().last().getText()).toBe('100.00%');
    });

    it('SCAL-18534 Chart colors for pie and funnel chart not persisted.', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue customer region';
        answerPage.queryAndWaitForChart(query);
        answerPage.navigateAndWaitForChartType(charts.chartTypes.PIE);

        var colorInAnswer = charts.pieChart.getFirstPieColor();
        var answerName = 'persistPieChartColors';
        answerPage.saveCurrentAnswer(answerName);
        answerPage.waitForAnswerTitle(answerName);
        charts.waitForChartVizToLoad();
        expect(charts.pieChart.getFirstPieColor()).toBe(colorInAnswer);
        common.navigation.goToAnswerSection();
        answerListPage.deleteAnswer(answerName);
        answerListPage.goToAnswer();
    });

    it('SCAL-18861 Data labels toggle should setup axis', function() {
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        var query = 'revenue customer region';
        answerPage.queryAndWaitForChart(query);
        common.util.waitForElementCountToBe(charts.selectors.Y_AXIS_MENU_ARROW, 1);
        answerPage.openVizEditorPanel();
        charts.toggleShowDataLabelsCheckbox();
        common.util.waitForElementCountToBe(charts.selectors.Y_AXIS_MENU_ARROW, 1);
    });
});
