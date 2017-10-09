/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Utility API for Table
 */

'use strict';

var answer = require('../viz-layout/answer/answer');
var chart = require('../charts/charts');
var common = require('../common');
var dialog = require('../dialog');
var metricPanel = require('../metrics/metric-panel');
var sage = require('../sage/sage');
var table = require('../table/table');
var pinboard = require('../pinboards/pinboards.js');
var util = common.util;

function expectCellToHaveBackgroundMatching(row, matchRegex) {
    var columnCellContent = $$(table.selectors.TABLE_ROW).get(row).$(table.selectors.TABLE_CELL_CONTENT);
    expect(columnCellContent.getCssValue('background-color')).toMatch(matchRegex);
}

function createAndAddMetrics(metricParams, query) {
    answer.queryAndWaitForChart(query === void 0 ? "revenue customer address" : query);
    answer.navigateAndWaitForChartType('TABLE');
    table.openColumnMenu('Revenue');
    table.chooseColumnMenuItem('Conditional Formatting');
    metricParams.forEach(function (metricsParam) {
        metricPanel.addNewMetric(metricsParam[0], metricsParam[1], metricsParam[2]);
    });
}

function verifyMetricsApplied(metricColors) {
    metricColors.forEach(function(color, index){
        expectCellToHaveBackgroundMatching(index, color);
    });
}

function addEmptyMetrics() {
    table.openColumnMenu('Revenue');
    table.chooseColumnMenuItem('Conditional Formatting');
    metricPanel.applyMetrics();
}

function getMetricCssvalue(){
    util.waitForElement(element(by.css(pinboard.selectors.BACK_COLOR)));
    return element(by.css(pinboard.selectors.BACK_COLOR)).getCssValue('background-color');
}

function getMetricCssvalueBlank(){
    util.waitForElement(element(by.css(pinboard.selectors.BLANK_COLOR)));
    return element(by.css(pinboard.selectors.BLANK_COLOR)).getCssValue('background-color');
}

module.exports = {
    addEmptyMetrics: addEmptyMetrics,
    createAndAddMetrics: createAndAddMetrics,
    exceptCellToHaveBackgroundMatching: expectCellToHaveBackgroundMatching,
    verifyMetricsApplied: verifyMetricsApplied,
    getMetricCssvalue : getMetricCssvalue,
    getMetricCssvalueBlank : getMetricCssvalueBlank
};
