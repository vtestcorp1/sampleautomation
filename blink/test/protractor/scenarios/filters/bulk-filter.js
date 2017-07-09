/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Test APIs for bulk filter.
 */

'use strict';

var checkbox = require('../widgets/checkbox-item');
var common = require('../common');
var util = common.util;

var BULK_FILTER_SELECTOR = '.bk-bulk-filter';
var selectors = {
    BULK_FILTER_SELECTOR: BULK_FILTER_SELECTOR,
    BULK_FILTER_TEXT_AREA_SELECTOR: util.joinSelectors(
        BULK_FILTER_SELECTOR,
        '.bk-bulk-filter-text-area'
    ),
    UNMATCHED_VALUES_ERROR: '.bk-bulk-filter-unmatched-error',
    INVALID_VALUES_ERROR: '.bk-bulk-filter-invalid-values-error',
    ONE_TIME_LIMIT_ERROR: '.bk-bulk-filter-one-time-error',
    FILTER_VALUE_LIMIT_ERROR: '.bk-bulk-filter-limit-error',
    ADD_BUTTON: '.bk-bulk-filter-add-btn',
    CHECKBOX_ITEM: util.joinSelectors(BULK_FILTER_SELECTOR, checkbox.selectors.CHECKBOX)
};

var mismatchString = 'We couldn\'t find these values in the column you\'re ' +
    'filtering. {1} errors.';
var invalidValuesString = 'Invalid filter values: {1}';

function setTextAreaValue (text) {
    util.waitForElement(selectors.BULK_FILTER_TEXT_AREA_SELECTOR);
    var textAreaElement = element(by.css(selectors.BULK_FILTER_TEXT_AREA_SELECTOR));
    textAreaElement.clear();
    textAreaElement.sendKeys(text);
}

function fastEnterText(text) {
    var cmd = '$("' + selectors.BULK_FILTER_TEXT_AREA_SELECTOR + '")' +
        '.val("' + text + '")' +
        '.trigger("change")';
    return browser.executeScript(cmd);
}

function waitForTextAreaValueToBe(text) {
    return util.waitForValueToBe(selectors.BULK_FILTER_TEXT_AREA_SELECTOR, text);
}

function waitForValidValues(count) {
    util.waitForElementCountToBe(selectors.CHECKBOX_ITEM, count);
}

function toggleCheckedState(name) {
    util.waitForAndClick(by.cssContainingText(selectors.CHECKBOX_ITEM, name));
}

function waitForBulkFilter() {
    common.util.waitForElement(selectors.BULK_FILTER_SELECTOR);
}

function verifyMismatchString(count) {
    var selector = by.cssContainingText(
        selectors.UNMATCHED_VALUES_ERROR,
        mismatchString.replace('{1}', count)
    );
    common.util.waitForElement(selector);
}

module.exports = {
    selectors: selectors,
    waitForBulkFilter: waitForBulkFilter,
    setTextAreaValue: setTextAreaValue,
    fastEnterText: fastEnterText,
    waitForTextAreaValueToBe: waitForTextAreaValueToBe,
    waitForValidValues: waitForValidValues,
    toggleCheckedState: toggleCheckedState,
    verifyMismatchString: verifyMismatchString
};
