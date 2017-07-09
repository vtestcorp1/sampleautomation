/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: ashish shubham (ashish@thoughtspot.com)
 *
 * @fileoverview drilldown page object
 */
'use strict';

var answerPage = require('../../viz-layout/answer/answer');
var charts = require('../../charts/charts');
var contextMenu = require('../context-menu-po');
var common = require('../../common');
var util = common.util;

var selectors = {};
selectors.DROPDOWN = contextMenu.selectors.DROPDOWN;
selectors.DROPDOWN_SUBMENU_OPTION = selectors.DROPDOWN + ' .bk-drill-sub-menu .context-sub-menu-title-container';
selectors.DROPDOWN_ITEM = selectors.DROPDOWN + ' .bk-drill-sub-menu .bk-items .bk-item';
selectors.NO_MATCHES_ITEM = selectors.DROPDOWN + ' .bk-drill-sub-menu .bk-items .bk-no-select';
selectors.DRILL_ITEMS = '.bk-drill-sub-menu .bk-item';
selectors.DRILL_SEARCH = '.bk-drill-sub-menu input';

function waitForDrillDownPopup() {
    return util.waitForAndClick(selectors.DRILL_SEARCH);
}

function switchToColumnAndDrillOnFirstColumn(drillSearchText) {
    answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
    var el = $$(charts.selectors.CHART_COLUMN).get(0);
    util.rightClickElement(el);
    util.waitForAndClick(charts.locators.DRILL_DOWN);
    util.waitForElement(selectors.DRILL_SEARCH);

    $(selectors.DRILL_SEARCH).sendKeys(drillSearchText);
    return selectDrillItem(drillSearchText);
}

function selectDrillItem(text) {
    return util.waitForAndClick(by.cssContainingText(selectors.DROPDOWN_ITEM, text));
}

//Note(chab) we do this process for avoiding stale references
//This method assume that only one element will be present
function typeTextInSearch(text) {
    fastType(text);
    util.waitForElementCountToBe(this.selectors.DRILL_ITEMS, 1);
    return util.waitForElementCountToBe(this.selectors.DROPDOWN_ITEM, 1);
}

function fastType(query) {
    var cmd = '$("' + selectors.DRILL_SEARCH + '")' +
            '.val("' + query + '")' +
            '.trigger("click")' +
            '.trigger("input")' +
            '.blur()';
    return browser.executeScript(cmd);
}

module.exports = {
    selectors,
    waitForDrillDownPopup,
    switchToColumnAndDrillOnFirstColumn,
    selectDrillItem,
    typeTextInSearch
};
