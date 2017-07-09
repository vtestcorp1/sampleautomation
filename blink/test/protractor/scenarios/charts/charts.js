/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var sage = require('../sage/sage');
var sprintf = require('sprintf-js').sprintf;

var selectors = {
    VIZ: '.bk-chart-viz',
    VIZ_INNER: '.bk-viz-inner',
    VIZ_NO_CONTENT_PLACEHOLDER: '.bk-viz .bk-no-content-placeholder',
    CHART_DATA_NOT_SUPPORTED_PLACEHOLDER: '.bk-viz-chart .chartDataNotSupported',
    TABLE_VIZ: '.bk-viz-table',
    CHART_VIZ: '.bk-viz-chart',
    HIGHCHART_CONTAINER: '.bk-viz-chart .highcharts-container',
    CHART_VIZ_OF_TYPE: '.bk-viz-chart .bk-chart[chart-type="%s"]',
    CHART_COLUMN: '.highcharts-series > rect',
    PIE_SLICES: '.highcharts-series > path',
    FUNNEL_ENTITIES: '.highcharts-series > path',
    LINE_CHART_STROKE: '.highcharts-series > path',
    TABLE_SELECTOR_BUTTON: '.bk-style-icon-table',
    CHART_SELECTOR_BUTTON: '.bk-chart-selector-button',
    CHART_SELECTOR_OPTION: '.bk-viz-type-selector',
    CHART_SELECTOR_PANEL_SELECTOR: '.bk-chart-type-selector-panel',
    CHART_TYPE_PIE_BUTTON_SELECTOR: '.bk-style-icon-chart-pie',
    CHART_TYPE_BUBBLE_SELECTOR: '.bk-style-icon-chart-bubble',
    CHART_TYPE_COLUMN_SELECTOR: '.bk-style-icon-chart-column',
    CHART_TYPE_STACKED_COLUMN: '.bk-style-icon-chart-stacked_column',
    CHART_TYPE_FUNNEL_BUTTON_SELECTOR: '.bk-style-icon-chart-funnel',
    CHART_TYPE_GEO_BUBBLE_SELECTOR: '.bk-style-icon-chart-geo_bubble',
    CHART_TYPE_WATERFALL_SELECTOR: '.bk-style-icon-chart-waterfall',
    CHART_TYPE_LINE_COLUMN: '.bk-style-icon-chart-line_column',
    CHART_TYPE_LINE: '.bk-style-icon-chart-line',
    CHART_TYPE_SCATTER: '.bk-style-icon-chart-scatter',
    Y_AXIS_LABEL_TSPANS: '.highcharts-yaxis-labels tspan',
    HIGHCHART_PATH: '.highcharts-series > path',
    CHART_AXES_SELECTORS: '.bk-chart-axes-selectors',
    CHART_AXIS_SELECTOR: '.bk-chart-axis-selector',
    CHART_X_AXIS_INPUT: '.bk-x-axis-selector-input',
    CHART_X_AXIS_ERROR_STATE: '.bk-x-axis-selector-input.bk-invalid-selection',
    CHART_Y_AXIS_INPUT: '.bk-y-axis-selector-input',
    CHART_Y_AXIS_ERROR_STATE: '.bk-y-axis-selector-input.bk-invalid-selection',
    CHART_LEGEND_AXIS_INPUT: '.bk-legend-axis-selector-input',
    CHART_LEGEND_AXIS_ERROR_STATE: '.bk-legend-axis-selector-input.bk-invalid-selection',
    SELECT_MATCH_ITEM: '.ui-select-match-item',
    SELECT_MATCH_CLOSE: '.ui-select-match-close',
    SELECT_CHOICES_ROW: '.ui-select-choices-row',
    SELECT_SEARCH_INPUT: '.ui-select-search',
    AXIS_LABELS: '.highcharts-axis-labels',
    X_AXIS_LABEL_TSPAN: '.highcharts-xaxis-labels > text > tspan',
    Y_AXIS_LABELS: '.highcharts-yaxis-labels',
    DATA_LABEL_TEXT: '.highcharts-data-labels text',
    COLUMN_CONTROL : '.column-control',
    METRICS_CONTROL_OPTION : '.bk-metrics',
    PRESENTATION_MODE_CONTAINER : '.bk-presentation-mode-container',
    VISIBLE_CHART_SERIES : '.bk-viz-chart .highcharts-series[visibility=\'visible\']',
    VISIBLE_MENU_ARROW : '.bk-icon-arrow-down:not(.ng-hide)',
    LEGEND_SINGULAR_BUTTON : '.bk-legend-singular-select',
    LEGEND_SINGULAR_SELECTED : '.bk-legend-singular-select-selected',
    SHOW_DATA_LABEL_CHECKBOX : '.bk-show-data-label .bk-checkbox-container .bk-checkbox',
    SHOW_DATA_LABEL_CHECKED : '.bk-show-data-label .bk-checkbox-container .bk-checkbox.bk-checked',
    CHART_ZOOM_MENU: '.bk-chart-zoom',
    CHART_ZOOM_BUTTON: '.bk-chart-zoom .bk-area-select',
    X_AXIS_TITLE : '.highcharts-xaxis-title .bk-axis-label-title',
    X_AXIS_TITLE_DETAIL: '.highcharts-xaxis-title i',
    Y_AXIS_TITLE : '.highcharts-yaxis-title .bk-axis-label-title',
    LEGEND_TITLE: '.bk-legend .bk-legend-title',
    Y_AXIS_SHARING_BUTTON: '.bk-chart-shared-y-axis-button',
    SHOW_DATA_LABEL : '.bk-show-data-label .bk-checkbox-container .bk-checkbox',
    AXIS_SELECTOR : '.bk-chart-axes-selectors .bk-chart-axis-selector',
    LEGEND_PICKER: '.bk-legend',
    LEGEND_ITEM: '.bk-viz-chart .bk-legend .bk-legend-item',
    SELECTED_LEGEND_ITEM: '.bk-viz-chart .bk-legend .bk-legend-item.bk-selected',
    LEGEND_LABEL: '.bk-legend-item .bk-legend-label',
    CHART_AXIS_PANEL_BUTTON: '.bk-chart-editor',
    CHART_CONFIG_PANEL_BUTTON: '.bk-config',
    CHART_ZOOM_PANEL_BUTTON: '.bk-chart-zoom',
    CHART_EDITOR_DONE: '.bk-chart-editor-done',
    CHART_SETTINGS_MENU_BTN: '.bk-viz .bk-chart-editor',
    CONTEXT_MENU_ITEMS: '.context-sub-menu-title-container',
    HIGHCHARTS_RECT: '.bk-viz-chart g.highcharts-tracker rect',
    COLUMN_LABEL_MENU_PANEL: '.bk-column-control',
    ZOOM_BUTTON_SELECTED: '.bk-chart-zoom .bk-area-select.bk-active',
    ZOOM_BUTTON_DESELECTED: '.bk-chart-zoom .bk-area-select:not(.bk-active)',
    ZOOM_RESET_BUTTON_ENABLED:
        '.bk-chart-zoom .bk-zoom-reset:not(.bk-disabled)',
    ZOOM_RESET_BUTTON_DISABLED: '.bk-chart-zoom .bk-zoom-reset.bk-disabled',
    AXIS_TITLE_LABEL: '.bk-axis-label',
    HIGHCHARTS_YAXIS: '.highcharts-yaxis-title',
    HIGHCHARTS_XAXIS: '.highcharts-xaxis-title',
    AXIS_LABEL_CONTROL: '.bk-axis-label-control',
    Y_AXIS_RANGE_CONFIGURATOR: '.bk-y-axis-range',
    Y_AXIS_SHOW_AS_PERCENT: '.bk-show-yaxis-as-percent',
    AXIS_LOCK_ICON: '.bk-chart-locker-button'
};
selectors.CHART_CONFIGURATOR = '.bk-chart-configurator-container';
selectors.COLUMN_LABEL_MENU_OPTION_SORT = common.util.joinSelectors(
    selectors.COLUMN_LABEL_MENU_PANEL,
    '.bk-sort'
);
selectors.COLUMN_LABEL_MENU_OPTION_FILTER = common.util.joinSelectors(
    selectors.COLUMN_LABEL_MENU_PANEL,
    '.bk-filter'
);
selectors.COLUMN_LABEL_MENU_OPTION_METRICS = common.util.joinSelectors(
    selectors.COLUMN_LABEL_MENU_PANEL,
    '.bk-metrics'
);
selectors.COLUMN_LABEL_MENU_OPTION_AGGREGATION = common.util.joinSelectors(
    selectors.COLUMN_LABEL_MENU_PANEL,
    '.bk-aggregates'
);
selectors.COLUMN_LABEL_MENU_OPTION_TIME_BUCKET = common.util.joinSelectors(
    selectors.COLUMN_LABEL_MENU_PANEL,
    '.bk-time-buckets'
);
selectors.Y_AXIS_COLUMN_LABEL_MENU_LINK = common.util.joinSelectors(
    selectors.HIGHCHARTS_YAXIS,
    selectors.AXIS_LABEL_CONTROL
);
selectors.X_AXIS_COLUMN_LABEL_MENU_LINK = common.util.joinSelectors(
    selectors.HIGHCHARTS_XAXIS,
    selectors.AXIS_LABEL_CONTROL
);
selectors.AXIS_TITLE_MENU_ARROW = common.util.joinSelectors(
    selectors.AXIS_TITLE_LABEL,
    selectors.VISIBLE_MENU_ARROW
);
selectors.X_AXIS_MENU_ARROW = common.util.joinSelectors(
    selectors.HIGHCHARTS_XAXIS,
    selectors.AXIS_TITLE_MENU_ARROW
);
selectors.Y_AXIS_MENU_ARROW = common.util.joinSelectors(
    selectors.HIGHCHARTS_YAXIS,
    selectors.AXIS_TITLE_MENU_ARROW
);
selectors.Y_AXIS_RANGE_CONFIGURATOR_MIN = common.util.joinSelectors(
    selectors.Y_AXIS_RANGE_CONFIGURATOR,
    '.bk-chart-config-range-start-value'
);
selectors.Y_AXIS_RANGE_CONFIGURATOR_MAX = common.util.joinSelectors(
    selectors.Y_AXIS_RANGE_CONFIGURATOR,
    '.bk-chart-config-range-end-value'
);
selectors.X_AXIS_SORT_ICON_DOWN = common.util.joinSelectors(
    selectors.AXIS_TITLE_LABEL,
    '.bk-sort-indicator.down'
);
selectors.X_AXIS_SORT_ICON_UP = common.util.joinSelectors(
    selectors.AXIS_TITLE_LABEL,
    '.bk-sort-indicator.up'
);
selectors.Y_AXIS_SORT_ICON_LEFT = common.util.joinSelectors(
    selectors.AXIS_TITLE_LABEL,
    '.bk-sort-indicator.left'
);
selectors.Y_AXIS_SORT_ICON_RIGHT = common.util.joinSelectors(
    selectors.AXIS_TITLE_LABEL,
    '.bk-sort-indicator.right'
);
selectors.TOOLTIP_BLOCK = '.chart-tooltip-block';

var locators = {
    CHART_VIZ: by.css(selectors.CHART_VIZ),
    CHART_COLUMN: by.css(selectors.CHART_COLUMN),
    HIGHCHART_PATH: by.css(selectors.HIGHCHART_PATH),
    DRILL_DOWN: by.cssContainingText(selectors.CONTEXT_MENU_ITEMS, 'Drill down'),
    SHOW_DATA_LABEL_CHECKED: by.css(selectors.SHOW_DATA_LABEL_CHECKED),
    VISIBLE_CHART_SERIES: by.css(selectors.VISIBLE_CHART_SERIES),
    LEGEND_PICKER: by.css(selectors.LEGEND_PICKER),
    LEGEND_LABEL: by.css(selectors.LEGEND_LABEL),
    CHART_AXIS_PANEL_BUTTON: by.css(selectors.CHART_AXIS_PANEL_BUTTON),
    CHART_EDITOR_DONE: by.css(selectors.CHART_EDITOR_DONE)
};

var chartTypes = {
    BAR: 'BAR',
    COLUMN: 'COLUMN',
    STACKED_COLUMN: 'STACKED_COLUMN',
    PARETO: 'PARETO',
    LINE: 'LINE',
    AREA: 'AREA',
    SCATTER: 'SCATTER',
    BUBBLE: 'BUBBLE',
    PIE: 'PIE',
    GEO_AREA: 'GEO_AREA',
    GEO_BUBBLE: 'GEO_BUBBLE',
    GEO_HEATMAP: 'GEO_HEATMAP',
    GEO_EARTH_AREA: 'GEO_EARTH_AREA',
    GEO_EARTH_BUBBLE: 'GEO_EARTH_BUBBLE',
    GEO_EARTH_BAR: 'GEO_EARTH_BAR',
    GEO_EARTH_HEATMAP: 'GEO_EARTH_HEATMAP',
    GEO_EARTH_GRAPH: 'GEO_EARTH_GRAPH',
    WATERFALL: 'WATERFALL',
    TREEMAP: 'TREEMAP',
    HEATMAP: 'HEATMAP',
    STACKED_AREA: 'STACKED_AREA',
    LINE_COLUMN: 'LINE_COLUMN',
    FUNNEL: 'FUNNEL',
    PIVOT_TABLE: 'PIVOT_TABLE',
    LINE_STACKED_COLUMN: 'LINE_STACKED_COLUMN'
};

var vizTypes = {
    CHART: 'CHART',
    TABLE: 'TABLE',
    HEADLINE: 'HEADLINE'
};

function waitForChartVizToLoad(chartType) {
    if (chartType) {
        return common.util.waitForElement(getChartWithTypeSelector(chartType));
    }
    return common.util.waitForElement(selectors.CHART_VIZ);
}

function waitForChartVizToBeAbsent(chartType) {
    return common.util.waitForElementCountToBe(getChartWithTypeSelector(chartType), 0);
}

function getChartWithTypeSelector(chartType) {
    return sprintf(selectors.CHART_VIZ_OF_TYPE, chartType);
}

// The following APIs take a root element to serve for
// viz context and pinboard elements as well.

function getChartColumnFillColor(rootElement, index) {
    return rootElement
        .all(locators.CHART_COLUMN)
        .get(index)
        .getAttribute('fill');
}

function getPieSlices(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement
        .all(locators.HIGHCHART_PATH);
}

function getFunnelEntities(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement
        .all(locators.HIGHCHART_PATH);
}

function getHighchartPaths() {
    return element.all(by.css(selectors.HIGHCHART_PATH));
}

function waitForHightchartRectCount(count) {
    common.util.waitForChildElementCountToBe(
        element(locators.CHART_VIZ),
        selectors.HIGHCHARTS_RECT,
        count
    );
}

function waitForTooltip() {
    common.util.waitForVisibilityOf(selectors.TOOLTIP_BLOCK);
}

function getXAxisLabels(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement.all(by.css(selectors.X_AXIS_LABEL_TSPAN));
}

function getFirstYAxisLabels(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement.all(by.css(selectors.Y_AXIS_LABELS)).first().all(by.css('tspan'));
}

function getSecondYAxisLabels(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement.all(by.css(selectors.Y_AXIS_LABELS)).get(1).all(by.css('tspan'));
}

function getNthYAxisLabels(idx, rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement.all(by.css(selectors.Y_AXIS_LABELS)).get(idx).all(by.css('tspan'));
}

function waitForYAxisLabel(axisIdx, labelIdx, expectedText, rootElement) {
    common.util.waitForCondition(function() {
        return getNthYAxisLabels(axisIdx, rootElement)
            .get(labelIdx)
            .getText()
            .then(function(text) {
                return text === expectedText;
            });
    });
}

function getDataLabels(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement.all(by.css(selectors.DATA_LABEL_TEXT));
}

function getAxesCount(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement.all(by.css(selectors.AXIS_LABELS)).count();
}

function getColumnRectangles(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    return rootElement.all(by.css(selectors.CHART_COLUMN));
}

function waitForShowDataLabelsChecked() {
    common.util.waitForElement(locators.SHOW_DATA_LABEL_CHECKED);
}

function waitForShowDataLabelsUnChecked () {
    var locator = locators.SHOW_DATA_LABEL_CHECKED;
    common.util.waitForElementCountToBe(locator, 0);
}

function toggleShowDataLabelsCheckbox() {
    // the one that shows gear icon
    var checkbox = element(by.css(selectors.SHOW_DATA_LABEL_CHECKBOX));
    common.util.waitForAndClick(checkbox);
}

function waitForVisibleSeriesCount(count, rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    var locator = locators.VISIBLE_CHART_SERIES;
    common.util.waitForChildElementCountToBe(rootElement, locator, count);
}

function waitForLegendPickerToAppear(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    var locator = rootElement.element(locators.LEGEND_PICKER);
    common.util.waitForElement(locator);
}

function waitForLegendPickerToDisappear(rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    var locator = rootElement.element(locators.LEGEND_PICKER);
    common.util.waitForElementToNotBePresent(locator);
}

function waitForColumnCountToBe(rootElement, count) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    var locator = locators.CHART_COLUMN;
    common.util.waitForChildElementCountToBe(rootElement, locator, count);
}

function waitForLegendItemSelected(itemName) {
    common.util.waitForElement(common.util.contains(selectors.SELECTED_LEGEND_ITEM, itemName));
}

function waitForLegendItemDeselected(itemName) {
    common.util.waitForElementToNotBePresent(
        common.util.contains(selectors.SELECTED_LEGEND_ITEM, itemName)
    );
}

function toggleChartLegendItem(itemName, rootElement) {
    rootElement = rootElement || element(locators.CHART_VIZ);
    var locator = rootElement.element(common.util.contains(selectors.LEGEND_LABEL, itemName));
    common.util.waitForAndClick(locator);
}

function singularSelectLegendItem(itemName) {
    waitForLegendPickerToAppear();
    var item = element(by.cssContainingText(selectors.LEGEND_ITEM, itemName));
    item.isElementPresent(by.css(selectors.LEGEND_SINGULAR_SELECTED)).then(function (isPresent) {
        if (!isPresent) {
            common.util.mouseMoveToElement(item);
            item.$(selectors.LEGEND_SINGULAR_BUTTON).click();
        }
    });
}

function singularDeselectLegendItem(itemName) {
    waitForLegendPickerToAppear();
    var item = element(by.cssContainingText(selectors.LEGEND_ITEM, itemName));
    item.isElementPresent(by.css(selectors.LEGEND_SINGULAR_SELECTED)).then(function (isPresent) {
        if (isPresent) {
            common.util.mouseMoveToElement(item);
            item.$(selectors.LEGEND_SINGULAR_BUTTON).click();
        }
    });
}

function waitForChartAxisPanel() {
    common.util.waitForVisibilityOf(selectors.CHART_AXES_SELECTORS);
}

function waitForChartConfigPanel() {
    common.util.waitForVisibilityOf(selectors.CHART_CONFIGURATOR);
}

function addAxisColumn(columnName, axisIndex) {
    var axisSelector = element.all(by.css(selectors.CHART_AXIS_SELECTOR)).get(axisIndex);
    var input = axisSelector.$(selectors.SELECT_SEARCH_INPUT);
    input.click();
    axisSelector.element(by.cssContainingText(selectors.SELECT_CHOICES_ROW, columnName)).click();
}

function removeAxisColumn(columnName, axisIndex) {
    var axisSelector = element.all(by.css(selectors.CHART_AXIS_SELECTOR)).get(axisIndex);
    axisSelector
        .element(by.cssContainingText(selectors.SELECT_MATCH_ITEM, columnName))
        .$(selectors.SELECT_MATCH_CLOSE)
        .click();
}

function addXAxisColumn(columnName, rootElement) {
    addAxisColumn(columnName, 0, rootElement);
}

function removeXAxisColumn(columnName, rootElement) {
    removeAxisColumn(columnName, 0, rootElement);
}

function addYAxisColumn(columnName, rootElement) {
    addAxisColumn(columnName, 1, rootElement);
}

function removeYAxisColumn(columnName, rootElement) {
    removeAxisColumn(columnName, 1, rootElement);
}

function addLegendColumn(columnName, rootElement) {
    addAxisColumn(columnName, 2, rootElement);
}

function removeLegendColumn(columnName, rootElement) {
    removeAxisColumn(columnName, 2, rootElement);
}

function waitForLegendSelectorToShow() {
    common.util.waitForVisibilityOf(
        element.all(by.css(selectors.CHART_AXIS_SELECTOR)).get(2)
    );
}

function waitForAxisConfigValidationError(errorMessage) {
    common.util.waitForElement(common.util.contains(
        '.bk-chart-axis-errors .validation-error-message',
        errorMessage
    ));
}

function waitForXAxisValidationToPass() {
    common.util.waitForElementToNotBePresent(selectors.CHART_X_AXIS_ERROR_STATE);
}

function waitForYAxisValidationToPass() {
    common.util.waitForElementToNotBePresent(selectors.CHART_Y_AXIS_ERROR_STATE);
}

function waitForLegendAxisValidationToPass() {
    common.util.waitForElementToNotBePresent(selectors.CHART_LEGEND_AXIS_ERROR_STATE);
}

function waitForXAxisColumnsToMatch(columnNames) {
    var matchItemSelector =
        common.util.joinSelectors(selectors.CHART_X_AXIS_INPUT, selectors.SELECT_MATCH_ITEM);
    common.util.waitForElementCountToBe(matchItemSelector, columnNames.length);
    columnNames.forEach(function(colName) {
        common.util.waitForElement(common.util.contains(
            matchItemSelector,
            colName
        ));
    });
}

function waitForYAxisColumnsToMatch(columnNames) {
    var matchItemSelector =
        common.util.joinSelectors(selectors.CHART_Y_AXIS_INPUT, selectors.SELECT_MATCH_ITEM);
    common.util.waitForElementCountToBe(matchItemSelector, columnNames.length);
    columnNames.forEach(function(colName) {
        common.util.waitForElement(common.util.contains(
            matchItemSelector,
            colName
        ));
    });
}

function waitForLegendAxisColumnsToMatch(columnNames) {
    var matchItemSelector =
        common.util.joinSelectors(selectors.CHART_LEGEND_AXIS_INPUT, selectors.SELECT_MATCH_ITEM);
    common.util.waitForElementCountToBe(matchItemSelector, columnNames.length);
    columnNames.forEach(function(colName) {
        common.util.waitForElement(common.util.contains(
            matchItemSelector,
            colName
        ));
    });
}

function getXAxisTitle() {
    common.util.waitForElement(selectors.X_AXIS_TITLE);
    return element(by.css(selectors.X_AXIS_TITLE)).getText();
}

function getXAxisTitleDetail() {
    return $(selectors.X_AXIS_TITLE_DETAIL).isPresent().then(function (isPresent) {
        if (isPresent) {
            return $(selectors.X_AXIS_TITLE_DETAIL).getText();
        } else {
            return '';
        }
    });
}

function getYAxisTitle() {
    common.util.waitForElement(selectors.Y_AXIS_TITLE);
    return element(by.css(selectors.Y_AXIS_TITLE)).getText();
}

function toggleShareYAxis() {
    $(selectors.Y_AXIS_SHARING_BUTTON).click();
}

function verifyNonOverlappingBars() {
    element.all(by.css(selectors.CHART_COLUMN)).map(function(elm) {
        return {
            min: elm.getAttribute('x'),
            width: elm.getAttribute('width')
        };
    }).then(function (ranges) {
        return ranges.sort(function (r1, r2) {
            return parseFloat(r1.min) - parseFloat(r2.min);
        });
    }).then(function(sortedRanges) {
        var max0 = parseFloat(sortedRanges[0].min) + parseFloat(sortedRanges[0].width);
        var min1 = parseFloat(sortedRanges[1].min);
        expect(min1+1).toBeGreaterThan(max0);
    });
}

function isXAxisLabelsSortedDesc() {
    return getXAxisLabels().map(function(element) {
        return element.getText();
    }).then(function(labels) {
        for(var i = 0; i < labels.length - 1; i++) {
            if (labels[i] < labels[i+1]) {
                return false;
            }
        }
        return true;
    });
}

function isXAxisLabelsSortedAsc() {
    return getXAxisLabels().map(function(element) {
        return element.getText();
    }).then(function(labels) {
        for(var i = 0; i < labels.length - 1; i++) {
            if (labels[i] > labels[i+1]) {
                return false;
            }
        }
        return true;
    });
}

function openXAxisColumnLabelMenu() {
    common.util.waitForAndClick(selectors.X_AXIS_COLUMN_LABEL_MENU_LINK).click();
    common.util.waitForElement(selectors.COLUMN_LABEL_MENU_PANEL);
}

function openYAxisColumnLabelMenu() {
    common.util.waitForAndClick(selectors.Y_AXIS_COLUMN_LABEL_MENU_LINK).click();
    common.util.waitForElement(selectors.COLUMN_LABEL_MENU_PANEL);
}

function columnMenuChooseSort() {
    common.util.waitForAndClick(selectors.COLUMN_LABEL_MENU_OPTION_SORT);
}

function columnMenuChooseMetrics() {
    common.util.waitForAndClick(selectors.COLUMN_LABEL_MENU_OPTION_METRICS);
}

function columnMenuChooseFilter() {
    common.util.mouseMoveToElement(selectors.COLUMN_LABEL_MENU_OPTION_FILTER);
    common.util.waitForElementToBeClickable(selectors.COLUMN_LABEL_MENU_OPTION_FILTER);
    common.util.waitForAndClick(selectors.COLUMN_LABEL_MENU_OPTION_FILTER);
}

function columnMenuChooseAggregationType(type) {
    common.util.waitForAndClick(
        common.util.contains(selectors.COLUMN_LABEL_MENU_OPTION_AGGREGATION, type)
    );
}

function columnMenuChooseTimeBucket(bucket) {
    common.util.waitForAndClick(
        common.util.contains(selectors.COLUMN_LABEL_MENU_OPTION_TIME_BUCKET, bucket)
    );
}

// chart zooming.
function waitForZoomButtonToBeSelected() {
    common.util.waitForElement(
        selectors.ZOOM_BUTTON_SELECTED
    );
}

function waitForZoomButtonToBeDeselected() {
    common.util.waitForElement(
        selectors.ZOOM_BUTTON_DESELECTED
    );
}

function waitForResetButtonToBeEnabled() {
    common.util.waitForElement(
        selectors.ZOOM_RESET_BUTTON_ENABLED
    );
}

function waitForResetButtonToBeDisabled() {
    common.util.waitForElement(
        selectors.ZOOM_RESET_BUTTON_DISABLED
    );
}

function clickZoomButton() {
    $(selectors.CHART_ZOOM_BUTTON).click();
}

function setYAxisRange(min, max) {
    element(by.css(selectors.Y_AXIS_RANGE_CONFIGURATOR_MIN)).clear().sendKeys(min);
    element(by.css(selectors.Y_AXIS_RANGE_CONFIGURATOR_MAX)).clear().sendKeys(max);
}

function toggleYAxisAsPercent() {
    common.util.waitForAndClick(selectors.Y_AXIS_SHOW_AS_PERCENT);
}

function verifyLineChartColor(primaryColors, index) {
    var lineContent = $$(selectors.LINE_CHART_STROKE).get(index);

    function getColor(elm) {
        return elm.getAttribute('stroke');
    };

    browser.executeScript(
        getColor,
        lineContent.getWebElement())
        .then(function (color) {
            expect(primaryColors).toContain(color);
        });
}

function getFirstPieColor() {
    var firstPieContent = $$(selectors.PIE_SLICES).get(0);
    function getColor(elm) {
        return elm.getAttribute('fill');
    };
    return browser.executeScript(getColor, firstPieContent.getWebElement());
}

function verifyChartLocked() {
    expect(element(by.css(selectors.AXIS_LOCK_ICON)).getAttribute('src'))
        .toMatch('/resources/img/viz-selector-icons/chart-icons/lock_closed_icon_24.svg');
}

function verifyChartUnlocked() {
    expect(element(by.css(selectors.AXIS_LOCK_ICON)).getAttribute('src'))
        .toMatch('/resources/img/viz-selector-icons/chart-icons/lock_open_icon_24.svg');
}

function toggleChartConfigLockState() {
    common.util.waitForAndClick(selectors.AXIS_LOCK_ICON);
}

function sortXAxisAscendingUsingIcon() {
    common.util.waitForAndClick(selectors.X_AXIS_SORT_ICON_DOWN);
}

function sortXAxisDescendingUsingIcon() {
    common.util.waitForAndClick(selectors.X_AXIS_SORT_ICON_UP);
}

module.exports = {
    selectors: selectors,
    locators: locators,
    vizTypes: vizTypes,
    chartTypes: chartTypes,
    getChartWithTypeSelector: getChartWithTypeSelector,
    getChartColumnFillColor: getChartColumnFillColor,
    verifyLineChartColor: verifyLineChartColor,
    getPieSlices: getPieSlices,
    getColumnRectangles: getColumnRectangles,
    getAxesCount: getAxesCount,
    getFirstYAxisLabels: getFirstYAxisLabels,
    getSecondYAxisLabels: getSecondYAxisLabels,
    getDataLabels: getDataLabels,
    waitForChartVizToLoad: waitForChartVizToLoad,
    waitForChartVizToBeAbsent: waitForChartVizToBeAbsent,
    waitForLegendPickerToAppear: waitForLegendPickerToAppear,
    waitForLegendPickerToDisappear: waitForLegendPickerToDisappear,
    getFunnelEntities: getFunnelEntities,
    getHighchartPaths: getHighchartPaths,
    waitForHightchartRectCount: waitForHightchartRectCount,
    waitForShowDataLabelsChecked: waitForShowDataLabelsChecked,
    waitForShowDataLabelsUnChecked: waitForShowDataLabelsUnChecked,
    toggleShowDataLabelsCheckbox: toggleShowDataLabelsCheckbox,
    waitForVisibleSeriesCount: waitForVisibleSeriesCount,
    waitForColumnCountToBe: waitForColumnCountToBe,
    getXAxisLabels: getXAxisLabels,
    waitForLegendItemSelected: waitForLegendItemSelected,
    waitForLegendItemDeselected: waitForLegendItemDeselected,
    toggleChartLegendItem: toggleChartLegendItem,
    addXAxisColumn: addXAxisColumn,
    removeXAxisColumn: removeXAxisColumn,
    addYAxisColumn: addYAxisColumn,
    removeYAxisColumn: removeYAxisColumn,
    addLegendColumn: addLegendColumn,
    removeLegendColumn: removeLegendColumn,
    waitForLegendSelectorToShow: waitForLegendSelectorToShow,
    waitForAxisConfigValidationError: waitForAxisConfigValidationError,
    waitForXAxisValidationToPass: waitForXAxisValidationToPass,
    waitForYAxisValidationToPass: waitForYAxisValidationToPass,
    waitForLegendAxisValidationToPass: waitForLegendAxisValidationToPass,
    waitForXAxisColumnsToMatch: waitForXAxisColumnsToMatch,
    waitForYAxisColumnsToMatch: waitForYAxisColumnsToMatch,
    waitForLegendAxisColumnsToMatch: waitForLegendAxisColumnsToMatch,
    getXAxisTitle: getXAxisTitle,
    getXAxisTitleDetail: getXAxisTitleDetail,
    getYAxisTitle: getYAxisTitle,
    toggleShareYAxis: toggleShareYAxis,
    verifyNonOverlappingBars: verifyNonOverlappingBars,
    isXAxisLabelsSortedDesc: isXAxisLabelsSortedDesc,
    isXAxisLabelsSortedAsc: isXAxisLabelsSortedAsc,
    singularSelectLegendItem: singularSelectLegendItem,
    singularDeselectLegendItem: singularDeselectLegendItem,
    chartEditor: {
        waitForChartAxisPanel: waitForChartAxisPanel,
        waitForChartConfigPanel: waitForChartConfigPanel,
        setYAxisRange: setYAxisRange,
        toggleYAxisAsPercent: toggleYAxisAsPercent,
        chartConfigLocking: {
            toggleChartConfigLockState: toggleChartConfigLockState,
            verifyChartLocked: verifyChartLocked,
            verifyChartUnlocked: verifyChartUnlocked
        }
    },
    columnLabelMenu: {
        openForXAxis: openXAxisColumnLabelMenu,
        openForYAxis: openYAxisColumnLabelMenu,
        clickMetrics: columnMenuChooseMetrics,
        clickSort: columnMenuChooseSort,
        clickFilter: columnMenuChooseFilter,
        chooseAggregationType: columnMenuChooseAggregationType,
        chooseTimeBucket: columnMenuChooseTimeBucket
    },
    zoom: {
        clickZoomButton: clickZoomButton,
        waitForZoomButtonToBeSelected: waitForZoomButtonToBeSelected,
        waitForZoomButtonToBeDeselected: waitForZoomButtonToBeDeselected,
        waitForResetButtonToBeEnabled: waitForResetButtonToBeEnabled,
        waitForResetButtonToBeDisabled: waitForResetButtonToBeDisabled
    },
    waitForTooltip: waitForTooltip,
    pieChart: {
        getFirstPieColor: getFirstPieColor
    },
    waitForYAxisLabel: waitForYAxisLabel,
    sortXAxisAscendingUsingIcon: sortXAxisAscendingUsingIcon,
    sortXAxisDescendingUsingIcon: sortXAxisDescendingUsingIcon
};
