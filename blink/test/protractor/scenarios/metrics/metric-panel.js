/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E API for chart metrics
 */

'use strict';

var colorPicker = require('../libs/colorpicker');
var common = require('../common');
var dialog = require('../dialog');
var util = common.util;

var selectors = {
    METRICS_WIDGET: '.bk-column-metrics-widget',
    ADD_METRIC_BUTTON: '.bk-column-metric-add .bk-icon',
    METRIC_ROW:'.bk-column-metric',
    METRIC_RANGE_MIN: '.bk-numeric-metric-value-min input',
    METRIC_RANGE_MAX: '.bk-numeric-metric-value-max input',
    COLOR_PICKER: '.bk-metric-color-picker',
    COLOR_PICKER_FILL: '.bk-color-picker-fill',
    READ_ONLY_FILTER: '.bk-filter-read-only'
};

function addNewMetric(rangeMin, rangeMax, color) {
    $(util.joinSelectors(selectors.METRICS_WIDGET, selectors.ADD_METRIC_BUTTON)).click();
    var lastRow = $$(selectors.METRIC_ROW).last();
    lastRow.$(selectors.METRIC_RANGE_MIN).sendKeys(rangeMin);
    lastRow.$(selectors.METRIC_RANGE_MAX).sendKeys(rangeMax);
    colorPicker.setColor(lastRow.$(selectors.COLOR_PICKER), color);
}

function getMetricColor(metricIndex) {
    //getMetricRow(metricIndex)
    //var selector = nth(METRICS_WIDGET + ' ' + COLOR_PICKER, metricIndex + 1) + ' ' + COLOR_PICKER_FILL;
    return colorPicker.getColor(
        getMetricRow(metricIndex).$(selectors.COLOR_PICKER + ' ' + selectors.COLOR_PICKER_FILL)
    );
}

function applyMetrics(dontWait) {
    dialog.clickPrimaryButton(!dontWait);
}

function cancel() {
    dialog.clickSecondaryButton();
}

function getMetricsCount() {
    return $$(util.joinSelectors(selectors.METRICS_WIDGET, selectors.METRIC_ROW)).count();
}

function getMetricRow(metricIndex) {
    return $$(selectors.METRIC_ROW).get(metricIndex);
}

function getMetricMin(metricIndex) {
    return getMetricRow(metricIndex).$(selectors.METRIC_RANGE_MIN).getAttribute('value');
}

function getMetricMax(metricIndex) {
    return getMetricRow(metricIndex).$(selectors.METRIC_RANGE_MAX).getAttribute('value');
}

module.exports = {
    selectors: selectors,
    addNewMetric: addNewMetric,
    applyMetrics: applyMetrics,
    cancel: cancel,
    getMetricColor: getMetricColor,
    getMetricsCount: getMetricsCount,
    getMetricMin: getMetricMin,
    getMetricMax: getMetricMax
};
