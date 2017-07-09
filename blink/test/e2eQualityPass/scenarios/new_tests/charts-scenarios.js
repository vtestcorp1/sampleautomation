/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around charts
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

function legendCloseBtn(idx) {
    return element(nth(CHART_AXIS_SELECTOR_SELECTOR, idx) + ' .ui-select-match-close');
}
var CHART_DONE_BTN = '.bk-chart-editor-done-btn';

describe('test charts: ', function() {

    beforeEach(function() {
        answerTab().click();
        selectSageSources(TPCH_TABLES);
    });

    // TODO(Shitong): fix and enable legend test
    xit('should test deletion from legend', function() {
        sageInputElement().enter('customer region revenue market segment');
        waitForTableAnswerVisualizationMode();
        selectViz('column');
        checkChart('column', 'Market Segment', 'Total Revenue', 'Customer Region', 5);

        selectViz(CHART_TYPE_LINE);
        expect(element('.highcharts-markers').count()).toBe(5);
        legendCloseBtn(3).click();
        element(CHART_DONE_BTN).click();
        expect(element('.highcharts-markers').count()).toBe(1);
    });

    it('should test deselection from legend', function() {
        sageInputElement().enter('ship mode tax supplier region');
        waitForTableAnswerVisualizationMode();
        selectViz('column');
        checkChart('column', 'Ship Mode', 'Total Tax', 'Supplier Region', 5);
        checkColumnChartBars(5);
        clickLegend('africa');
        checkColumnChartBars(4);
    });

    // bug: SCAL-9205
    xit('should test selection from legend: (fail: SCAL-9205)', function() {
        sageInputElement().enter('revenue by quantity supplier region');
        waitForTableAnswerVisualizationMode();
        selectViz('column');
        element(CHART_AXIS_SELECTOR_SELECTOR + ':eq(0) .search-choice-close').click();
        element(CHART_DONE_BTN).click();
        selectAxisColumns(X_AXIS_SELECT_SELECTOR, ['0']);
        selectAxisColumns(LEGEND_SELECT_SELECTOR, ['1']);
        checkColumnChartBars(20);
        clickLegend('21');
        checkColumnChartBars(21);
    });

    // bug: SCAL-9688
    xit('should test enable/disable shared y-axis: (fail: SCAL-9688)', function() {
        var position1 = false,
            position2 = false,
            position3 = false,
            position4 = false,
            position5 = false;

        sageInputElement().enter('revenue discount tax customer nation');
        waitForTableAnswerVisualizationMode();
        selectViz('column');

        // check y-axis positions before and after linking y-axis
        position1 = callFunctionWithElement(null, function($body, appWindow, $) {
            return parseFloat($('.highcharts-axis span').filter(function() {return $(this).find('.bk-axis-label-title').text() === "Total Revenue";}).css('left')) < 0;
        });
        expect(position1).toBe(true);
        position2 = callFunctionWithElement(null, function($body, appWindow, $) {
            return parseFloat($('.highcharts-axis span').filter(function() {return $(this).find('.bk-axis-label-title').text() === "Total Discount";}).css('left')) > 0;
        });
        expect(position2).toBe(true);
        position3 = callFunctionWithElement(null, function($body, appWindow, $) {
            return parseFloat($('.highcharts-axis span').filter(function() {return $(this).find('.bk-axis-label-title').text() === "Total Tax";}).css('left')) > 0;
        });
        expect(position3).toBe(true);
        position4 = callFunctionWithElement(null, function($body, appWindow, $) {
            return parseFloat($('.highcharts-axis span').filter(function() {return $(this).find('.bk-axis-label-title').text() === "Total Tax";}).css('left')) > parseFloat($('.highcharts-axis span').filter(function() {return $(this).find('.bk-axis-label-title').text() === "Total Discount";}).css('left'));
        });
        expect(position4).toBe(true);

        element(Y_AXIS_SHARING_BUTTON_SELECTOR).click();
        position5 = callFunctionWithElement(null, function($body, appWindow, $) {
            return parseFloat($('.highcharts-axis span').filter(function() {return $(this).find('.bk-axis-label-title').text() === "Total RevenueTotal DiscountTotal Tax";}).css('left')) < 0;
        });
        expect(position5).toBe(true);
    });

    it('should test show data label', function() {
        sageInputElement().enter('extended price customer nation');
        waitForHighcharts();
        selectChartType(CHART_TYPE_WATERFALL);
        chartFunctions.waitForShowDataLabelsChecked();
    });

    it('should test maximization and minimization', function() {
        sageInputElement().enter('customer region extended price');
        waitForHighcharts();
        selectChartType(CHART_TYPE_COLUMN);
        element(CHART_VIZ + MAXIMIZATION).click();
        waitForElement('.bk-slide-active[type=chart]');
        element('.bk-close-btn').click();
        waitForNotContain('.bk-slide-active[type=chart]');
    });

    it('should test changing chart type', function() {
        sageInputElement().enter('customer region extended price');
        waitForTableAnswerVisualizationMode();
        selectViz('column');
        checkChart('column', 'Customer Region', 'Total Extended Price');

        selectViz(CHART_TYPE_LINE);
        selectViz(CHART_TYPE_COLUMN);
        selectViz(CHART_TYPE_PIE);
        selectViz(CHART_TYPE_SCATTER);
        selectViz('area');
    });

    // TODO(Shitong): fix and enable legend test
    xit('should test add legend', function() {
        sageInputElement().enter('order total price revenue supplier region ship mode');
        waitForTableAnswerVisualizationMode();
        selectViz('scatter');
        checkChart('scatter', 'Total Order Total Price', 'Total Revenue');

        selectViz('bubble');
        checkChart('bubble', 'Ship Mode', 'Total Revenue');

        selectAxisColumns(LEGEND_SELECT_SELECTOR, ['0']);
        checkChart('bubble', 'Ship Mode', 'Total Revenue', 'Supplier Region', 5);

        selectViz('stacked_column');
        checkChart('stacked_column', 'Ship Mode', 'Total Order Total Price', 'Supplier Region', 5);
    });
});
