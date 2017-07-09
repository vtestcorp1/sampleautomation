/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');

var util = common.util;

var CONTENT_SELECTOR = '.bk-cb-filter-content';
var EXCLUDE_CONTENT_SELECTOR = '.bk-exclude-cb-filter-content';
var CHECKBOX_CONTAINER = '.bk-checkbox-container';
var CHECKBOX_SELECTOR = '.bk-checkbox';
var ALL_CHECKBOX_CONTAINER = util.joinSelectors(CONTENT_SELECTOR, CHECKBOX_CONTAINER);
var ALL_CHECKBOX_SELECTOR = util.joinSelectors(CONTENT_SELECTOR, CHECKBOX_SELECTOR);
var EXCLUDE_ALL_CHECKBOX_CONTAINER = util.joinSelectors(EXCLUDE_CONTENT_SELECTOR, CHECKBOX_CONTAINER);
var EXCLUDE_ALL_CHECKBOX_SELECTOR = util.joinSelectors(EXCLUDE_CONTENT_SELECTOR, CHECKBOX_SELECTOR);
var SELECTED_CB_SECTION_SELECTOR = '.bk-selected-checkboxes';
var SELECTED_CHECKBOX_SELECTOR =  util.joinSelectors(SELECTED_CB_SECTION_SELECTOR, CHECKBOX_SELECTOR);
var UNSELECTED_CB_SECTION_SELECTOR = '.bk-unselected-checkboxes';
var UNSELECTED_CHECKBOX_SELECTOR =  util.joinSelectors(UNSELECTED_CB_SECTION_SELECTOR, CHECKBOX_SELECTOR);
var CHECKED_ITEM_SELECTOR = CONTENT_SELECTOR + ' .bk-checkbox-container.bk-checked';
var CHECKBOX_CONTAINER_SELECTOR = CONTENT_SELECTOR + ' .bk-checkbox-container';
var ADD_VALUES_IN_BULK_SELECTOR = '.bk-add-bulk-filter-link';
var SEARCH_INPUT = CONTENT_SELECTOR + ' .bk-search-input';
var SWITCH_TO_EXCLUDE = '.bk-switch-to-exclude-mode-link';
var SHOW_ALL_VALUE_CONTAINER = '.bk-show-all-values-toggler-checkbox';
var SHOW_ALL_VALUES = SHOW_ALL_VALUE_CONTAINER + ' ' + '.bk-checkbox-container';
var CHECKBOX_TITLE = '.bk-checkbox-title';

function waitForFilterLoad() {
    return util.waitForElementCountToBeMoreThan(ALL_CHECKBOX_SELECTOR, 0);
}

function toggleCheckboxState(title, isExclude) {
    var parentSelector = isExclude
        ? EXCLUDE_ALL_CHECKBOX_CONTAINER
        : ALL_CHECKBOX_CONTAINER;
    var container = element(util.contains(parentSelector, title));
    util.waitForElement(container);
    return container.element(by.css(CHECKBOX_SELECTOR)).click();
}

function waitForFilterCheckedItem(count, showingAllPossibleValues) {
    // NOTE: There is a checkbox for show all possible values hence
    // we increase the count by 1.
    count = !!showingAllPossibleValues ? count + 1 : count;
    util.waitForElementCountToBe(CHECKED_ITEM_SELECTOR, count);
}

function verifyCheckedState(title, isSelected) {
    var elem = element(by.cssContainingText(CHECKBOX_CONTAINER_SELECTOR, title));

    if (isSelected) {
        elem = elem.element(by.css('.bk-checked'));
    }
    util.waitForElement(elem);
}

function verifyTooManyValues(isTrue) {
    var count = isTrue ? 1 : 0 ;
    util.waitForElementCountToBe('.bk-filter-too-many-values', count);
}

function verifyRefineUnselectedItemsMessage(isPresent) {
    var count = isPresent ? 1 : 0;
    util.waitForElementCountToBe('.bk-search-unselected-items-msg', count);
}

function verifySelectedFilterItemsCount(count) {
    util.waitForElementCountToBe(SELECTED_CHECKBOX_SELECTOR, count);
}

function verifyUnselectedFilterItemsCount(count) {
    util.waitForElementCountToBe(UNSELECTED_CHECKBOX_SELECTOR, count);
}

function verifyFilterItemsCount(count) {
    // NOTE: There is a checkbox for show all possible values hence
    // we increase the count by 1.
    util.waitForElementCountToBe(ALL_CHECKBOX_SELECTOR, count + 1);
}

function setSearchText(text) {
    $(SEARCH_INPUT).clear();
    return $(SEARCH_INPUT).sendKeys(text);
}

function openExcludeSection() {
    util.waitForAndClick(SWITCH_TO_EXCLUDE);
}

function showAllValues() {
    util.waitForAndClick(SHOW_ALL_VALUES);
}

function hoverOnDataCheckboxTitle(title) {
    var elem = element(by.cssContainingText(CHECKBOX_TITLE, title));
    util.mouseMoveToElement(elem);
}

module.exports = {
    openBulkFilter: function () {
        util.waitForAndClick(ADD_VALUES_IN_BULK_SELECTOR);
    },
    waitForFilterLoad: waitForFilterLoad,
    openExcludeSection: openExcludeSection,
    toggleCheckboxState: toggleCheckboxState,
    waitForFilterCheckedItem: waitForFilterCheckedItem,
    setSearchText: setSearchText,
    verifyCheckedState: verifyCheckedState,
    verifyTooManyValues: verifyTooManyValues,
    verifyFilterItemsCount: verifyFilterItemsCount,
    verifyRefineUnselectedItemsMessage: verifyRefineUnselectedItemsMessage,
    verifySelectedFilterItemsCount: verifySelectedFilterItemsCount,
    verifyUnselectedFilterItemsCount: verifyUnselectedFilterItemsCount,
    showAllValues: showAllValues,
    hoverOnDataCheckboxTitle: hoverOnDataCheckboxTitle,
    selectors: {
        CONTENT_SELECTOR: CONTENT_SELECTOR
    }
};
