/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Test Apis for search doctor.
 */

'use strict';

var common = require('../common');
var sage = require('../sage/sage');

var selectors = {};

selectors.SEARCH_DOCTOR = '.search-doctor';

selectors.ADVANCED_SEARCH = selectors.SEARCH_DOCTOR + ' .advanced-search';
selectors.CHOOSE_SOURCES = selectors.SEARCH_DOCTOR + ' .choose-sources';
selectors.HELP_TIP = selectors.SEARCH_DOCTOR + ' .help-tip';
selectors.KNOW_YOUR_DATA = selectors.SEARCH_DOCTOR + ' .know-your-data';
selectors.NEXT_ARROW = selectors.SEARCH_DOCTOR + ' .arrowRight';
selectors.SEARCH_VIDEO  = selectors.SEARCH_DOCTOR + ' .search-video';
selectors.QUERY_COMPLETION = selectors.SEARCH_DOCTOR + ' .bk-query-completions';
selectors.LIST_ROW = '.bk-list-row';
selectors.LIST_ROW_HEADER = selectors.LIST_ROW + ' .row-header';
selectors.LIST_ROW_SUBTEXT = selectors.LIST_ROW + ' .row-subtext';
selectors.LIST_ROW_LINEAGE = selectors.LIST_ROW + ' .lineage';
selectors.QUERY_COMPLETION_ROW = selectors.QUERY_COMPLETION + ' ' + selectors.LIST_ROW;
selectors.MATCHED_SUBSTRING = '.matched-substring';
selectors.OBJECT_LIST = selectors.SEARCH_DOCTOR + ' .bk-object-list';
selectors.OBJECT_LIST_HEADER = selectors.OBJECT_LIST + selectors.LIST_ROW_HEADER;


var locators = {};
locators.MATCHED_SUBSTRING = by.css(selectors.MATCHED_SUBSTRING);

function waitForSearchDoctor() {
    common.util.waitForElement(selectors.SEARCH_DOCTOR);
}

function goToNextSlide() {
    common.util.waitForAndClick(selectors.NEXT_ARROW);
}

function verifyMatchedSubstring(containerSelector, text) {
    var elem = element(containerSelector).element(locators.MATCHED_SUBSTRING);
    expect(elem.getText()).toBe(text);
}

function openSearchDoctor(incorrectToken) {
    sage.sageInputElement.enter(incorrectToken);
    sage.waitForSageDropdown();
    sage.sageInputElement.append(protractor.Key.ENTER);
}

function clearSearchDoctor() {
    sage.sageInputElement.fastEnter(' ');
}

function getListElements(textToMatch, lineage, highlightedText) {
    var listElement =
        element.all(by.cssContainingText(selectors.LIST_ROW, textToMatch));
    if (!!lineage) {
        listElement = element
            .all(by.cssContainingText(selectors.LIST_ROW, textToMatch))
            .filter(function (suggestionElem) {
                return suggestionElem.element(by.cssContainingText(
                    selectors.LIST_ROW_LINEAGE, lineage))
                    .isPresent();
            });
    }
    return listElement;
}

function getFirstListElement(textToMatch, lineage) {
    return getListElements(textToMatch, lineage).first();
}

function waitForListItem(suggestion, lineage) {
    common.util.waitForElement(getFirstListElement(suggestion, lineage));
}

function clickListItem(suggestion, lineage) {
    common.util.waitForAndClick(getFirstListElement(suggestion, lineage));
}

module.exports = {
    selectors: selectors,
    clearSearchDoctor: clearSearchDoctor,
    goToNextSlide: goToNextSlide,
    openSearchDoctor: openSearchDoctor,
    verifyMatchedSubstring: verifyMatchedSubstring,
    waitForSearchDoctor: waitForSearchDoctor,
    waitForListItem: waitForListItem,
    clickListItem: clickListItem
};
