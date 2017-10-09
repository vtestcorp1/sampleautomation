/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

'use strict';

var common = require('../../common.js');
var util = common.util;
var uiSelect = require('../../libs/ui-select.js');
var answer = require('../answer/answer.js');

var selectors = {
    HEADLINE: '.bk-headline-viz',
    HEADLINE_VALUE: '.bk-headline-value',
    HEADLINE_COLUMN_NAME: '.bk-headline-title',
    HEADLINE_AGGR_SELECTOR: '.bk-headline-aggregation-selector',
    HEADLINE_PINNER: '.bk-add-to-pinboard'
};

var locators = {
    HEADLINE: by.css(selectors.HEADLINE),
    HEADLINE_CONTAINER: by.css('.bk-answer-headline-viz-container'),
    HEADLINE_VALUE: by.css(selectors.HEADLINE_VALUE),
    HEADLINE_COLUMN_NAME: by.css(selectors.HEADLINE_COLUMN_NAME),
    HEADLINE_AGGR_SELECTOR: by.css(selectors.HEADLINE_AGGR_SELECTOR)
};

function getHeadline(columnName, overrideLocator) {
    overrideLocator = overrideLocator ? overrideLocator : locators.HEADLINE;
    return element.all(overrideLocator).filter(function(headline) {
        return headline.element(locators.HEADLINE_COLUMN_NAME).getText().then(function(text) {
            return text === columnName;
        });
    }).first();
}

function changeAggregation(columnName, aggregation) {
    waitForHeadline(columnName);
    var headline = getHeadline(columnName);
    // we need to manually open the ui-select, cause the selector is extracted from its
    // parent and appended to the body
    common.util.waitForElement(headline);
    uiSelect.openSelector(headline);
    uiSelect.waitForList(element(by.tagName('body')));
    uiSelect.selectSingle(element(by.tagName('body')), aggregation);
}

function pinHeadline(headlineColumn, pinboardName) {
    var headline = getHeadline(headlineColumn, locators.HEADLINE_CONTAINER);
    var headlinePinner = headline.element(by.css(selectors.HEADLINE_PINNER));
    util.mouseMoveToElement(headline);
    util.waitForAndClick(headlinePinner);
    answer.makeSelectionInPinboard(pinboardName);

}

function waitForHeadline(title) {
    common.util.waitForElement(by.cssContainingText(selectors.HEADLINE_COLUMN_NAME, title));
}

function verifyHeadlineFontSize(title, size) {
    common.util.waitForElement(by.cssContainingText(selectors.HEADLINE_COLUMN_NAME, title));
    var headline = element(by.cssContainingText(selectors.HEADLINE, title));
    var headlineValue = headline.element(locators.HEADLINE_VALUE);
    expect(headlineValue.getCssValue('font-size')).toBe(size);
}

function waitForHeadlineWithValue(title, value) {
    waitForHeadline(title);
    var headline = element(by.cssContainingText(selectors.HEADLINE, title));
    var headlineValue = headline.element(locators.HEADLINE_VALUE);
    var headlineValueText = headlineValue.getText();
    expect(headlineValueText).toBe(value.trim());
}

function waitForHeadlineCount(count) {
    common.util.waitForElementCountToBe(selectors.HEADLINE, count);
}

function verifyAggregationSelector(title, isPresent) {
    waitForHeadline(title);
    var headline = getHeadline(title);
    var count = isPresent ? 1 : 0;
    expect(headline.all(locators.HEADLINE_AGGR_SELECTOR).count()).toBe(count);
}

function verifyAggregation(title, aggregation) {
    waitForHeadline(title);
    var headline = getHeadline(title);
    expect(headline.element(by.css('.bk-select-box')).getText()).toBe(aggregation);
}

function verifyHeadlineValue(headlineValue) {
    var headlineLocator = by.cssContainingText(selectors.HEADLINE_VALUE,
        headlineValue);
    util.waitForElementCountToBe(headlineLocator, 1);
}

function verifyHeadlineValues(headlines) {
    headlines.forEach(function (headlineValue) {
        verifyHeadlineValue(headlineValue);
    });
}

module.exports = {
    selectors: selectors,
    changeAggregation: changeAggregation,
    waitForHeadline: waitForHeadline,
    waitForHeadlineCount: waitForHeadlineCount,
    waitForHeadlineWithValue: waitForHeadlineWithValue,
    verifyAggregationSelector: verifyAggregationSelector,
    verifyAggregation: verifyAggregation,
    verifyHeadlineValue: verifyHeadlineValue,
    verifyHeadlineValues: verifyHeadlineValues,
    pinHeadline: pinHeadline,
    verifyHeadlineFontSize: verifyHeadlineFontSize
};
