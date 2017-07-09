/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Utility API for Table
 */

'use strict';

var answer = require('../viz-layout/answer/answer');
var common = require('../common');
var dialog = require('../dialog');
var metricPanel = require('../metrics/metric-panel');
var sage = require('../sage/sage');
var table = require('../table/table');

function expectCellToHaveBackgroundMatching(row, column, matchRegex) {
    var columnCellContent = table.getNthCell(row, column).$(table.selectors.TABLE_CELL_CONTENT);
    expect(columnCellContent.getCssValue('background-color')).toMatch(matchRegex);
}

function createAndAddMetrics(metricParams, query) {
    answer.queryAndWaitForChart(query === void 0 ? "revenue customer address" : query);
    answer.navigateAndWaitForChartType('TABLE');
    table.openColumnMenu('Revenue');
    table.chooseColumnMenuItem('Conditional Formatting');
    dialog.waitForDialogPresent();
    metricParams.forEach(function (metricsParam) {
        metricPanel.addNewMetric(metricsParam[0], metricsParam[1], metricsParam[2]);
    });
}

function verifyMetricsApplied(metricColors, column) {
    column = column || 1;
    metricColors.forEach(function(color, index){
        expectCellToHaveBackgroundMatching(index, column, color);
    });
}

function addEmptyMetrics() {
    table.openColumnMenu('Revenue');
    table.chooseColumnMenuItem('Conditional Formatting');
    dialog.waitForDialogPresent();
    metricPanel.applyMetrics();
}

module.exports = {
    addEmptyMetrics: addEmptyMetrics,
    createAndAddMetrics: createAndAddMetrics,
    exceptCellToHaveBackgroundMatching: expectCellToHaveBackgroundMatching,
    verifyMetricsApplied: verifyMetricsApplied
};
