/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');

var util = common.util;
var dialog = require('../dialog');

var selectors = {};
selectors.FILTER_PANEL_SELECTOR = '.bk-filter-panel';
selectors.FILTER_ICON = '.bk-style-icon-filter';
selectors.FILTER_PANEL_ITEM_SELECTOR = selectors.FILTER_PANEL_SELECTOR + ' .bk-filter-list-item';
selectors.FILTER_PANEL_ITEM_TITLE_TEXT_SELECTOR = selectors.FILTER_PANEL_ITEM_SELECTOR + ' .filter-title-text';
selectors.CLOSE_ICON_SELECTOR = '.close-icon';
selectors.FILTER_DONE_BUTTON = '.bk-dialog-ok-btn';
selectors.UNSUPPORTED_FILTER = '.bk-unsupported-filter-placeholder';
selectors.READ_ONLY_FILTER = '.bk-filter-read-only';

function clickFilterItem(title, isVizContext) {
    var filterItemSelector = util.contains(selectors.FILTER_PANEL_ITEM_TITLE_TEXT_SELECTOR, title);
    if (!!isVizContext) {
        filterItemSelector = util.getSelectorInVizContext(filterItemSelector);
    }
    util.waitForAndClick(filterItemSelector);
}

function waitForFilterItem(title, isVizContext) {
    var filterItemSelector = util.contains(selectors.FILTER_PANEL_ITEM_TITLE_TEXT_SELECTOR, title);
    if (!!isVizContext) {
        filterItemSelector = util.getSelectorInVizContext(filterItemSelector);
    }
    return util.waitForElement(filterItemSelector, 'waiting for filter item to show in panel');
}

function waitForFilterItems(count) {
    return util.waitForElementCountToBe(selectors.FILTER_PANEL_ITEM_SELECTOR, count);
}

function waitForUnsupportedFilterPlaceHolder() {
    return util.waitForElement(selectors.UNSUPPORTED_FILTER);
}

function removeFilter(name) {
    var selector = util.contains(selectors.FILTER_PANEL_ITEM_SELECTOR, name);
    var el = element(selector).element(by.css(selectors.CLOSE_ICON_SELECTOR));
    util.mouseMoveToElement(selector);
    util.waitForAndClick(el);
}

module.exports = {
    clickFilterItem: clickFilterItem,
    selectors: selectors,
    waitForFilterItems: waitForFilterItems,
    waitForFilterItem: waitForFilterItem,
    waitForUnsupportedFilterPlaceHolder: waitForUnsupportedFilterPlaceHolder,
    removeFilter: removeFilter
};
