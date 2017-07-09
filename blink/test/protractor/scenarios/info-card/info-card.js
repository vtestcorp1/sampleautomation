/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Test APIs for info card.
 */

'use strict';

var common = require('../common');
var util = common.util;

var selectors = {};
selectors.INFO_CARD_BUTTON = '.bk-infocard-button';
selectors.INFO_CARD = '.bk-info-card';
selectors.INFO_CARD_BODY = '.bk-info-card-body';
selectors.NATURAL_QUERY_OUTPUT_COLUMN = selectors.INFO_CARD_BODY + ' .bk-output-column';
selectors.NATURAL_QUERY_GROUPING_COLUMN = selectors.INFO_CARD_BODY + ' .bk-grouping-column';

function waitForInfoCardButton(isVisible) {
    isVisible
        ? util.waitForVisibilityOf(selectors.INFO_CARD_BUTTON)
        : util.waitForInvisibilityOf(selectors.INFO_CARD_BUTTON);
}

function waitForInfoCard(isVisible) {
    var count = isVisible ? 1 : 0;
    util.waitForElementCountToBe(selectors.INFO_CARD, count);
}

function toggleInfoCard() {
    util.waitForAndClick(selectors.INFO_CARD_BUTTON);
}

function waitForInfoCardContainingText(text) {
    util.waitForElement(by.cssContainingText(selectors.INFO_CARD, text));
}

function waitForOutputColumnContainingText(text) {
    util.waitForElement(by.cssContainingText(selectors.NATURAL_QUERY_OUTPUT_COLUMN, text));
}

function waitForGroupingColumnContainingText(text) {
    util.waitForElement(by.cssContainingText(selectors.NATURAL_QUERY_GROUPING_COLUMN, text));
}

module.exports = {
    selectors: selectors,
    waitForInfoCardButton: waitForInfoCardButton,
    waitForInfoCard: waitForInfoCard,
    toggleInfoCard: toggleInfoCard,
    waitForInfoCardContainingText: waitForInfoCardContainingText,
    waitForOutputColumnContainingText: waitForOutputColumnContainingText,
    waitForGroupingColumnContainingText: waitForGroupingColumnContainingText
};
