/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * Utility API for charts
 *
 */

'use strict';


var answer = require('../viz-layout/answer/answer');
var chart = require('./charts');
var common = require('../common.js');
var metricPanel = require('../metrics/metric-panel');
var sage = require('../sage/sage');
var sprintf = require('sprintf-js').sprintf;

function openMetricsPanel() {
    chart.columnLabelMenu.openForYAxis();
    chart.columnLabelMenu.clickMetrics();
}

function addEmptyMetrics() {
    openMetricsPanel();
    metricPanel.applyMetrics();
}

function createAndAddMetrics(metricsParams, query) {
    answer.queryAndWaitForChart(query === void 0 ? "revenue market segment" : query);
    openMetricsPanel();
    metricsParams.forEach(function (metricsParam) {
        metricPanel.addNewMetric(metricsParam[0], metricsParam[1], metricsParam[2]);
    });
}

function verifyMetricsApplied(metricsParams) {
    expectColumnToHaveFillMatching(0, metricsParams[1][2]);
    expectColumnToHaveFillMatching(1, metricsParams[1][2]);
    expectColumnToHaveFillMatching(2, metricsParams[0][2]);
    expectColumnToHaveFillMatching(3, metricsParams[1][2]);
}

function expectColumnToHaveFillMatching(columnIndex, color) {
    var columnCellContent = $$(chart.selectors.CHART_COLUMN).get(columnIndex);
    expect(columnCellContent.getAttribute('fill')).toBe(color);
}


module.exports =  {
    addEmptyMetrics: addEmptyMetrics,
    createAndAddMetrics: createAndAddMetrics,
    expectColumnToHaveFillMatching: expectColumnToHaveFillMatching,
    openMetricsPanel: openMetricsPanel,
    verifyMetricsApplied: verifyMetricsApplied
};
