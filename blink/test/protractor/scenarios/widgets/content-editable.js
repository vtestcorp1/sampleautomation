/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E test API for content editable.
 */

'use strict';

var common = require('../common');
var util = common.util;

var selectors = {
    INPUT: '.bk-editable-input',
    TEXTAREA: '.bk-description-editarea'
};

function waitForInputText(parentSelector, text) {
    var selector = parentSelector + ' ' + selectors.INPUT;
    util.waitForValueToBe(selector, text);
}

function enterName(parentSelector, text) {
    var selector = parentSelector + ' ' + selectors.INPUT;
    util.waitForVisibilityOf(selector);
    $(selector).clear();
    return $(selector).sendKeys(text);
}

function enterText(parentSelector, text) {
    var selector = parentSelector + ' ' + selectors.INPUT;
    $(selector).click();
    $(selector).clear();
    $(selector).sendKeys(text, protractor.Key.ENTER);
}

function enterDescription(parentSelector, text) {
    var selector = parentSelector + ' ' + selectors.TEXTAREA;
    util.waitForVisibilityOf(selector);
    $(selector).clear();
    $(selector).sendKeys(text);
    util.waitForValueToBe(selector, text);
}

function clearDescription(parentSelector) {
    var selector = parentSelector + ' ' + selectors.TEXTAREA;
    util.waitForVisibilityOf(selector);
    $(selector).clear();
}

function waitForDescriptionText(parentSelector, text) {
    var selector = parentSelector + ' ' + selectors.TEXTAREA;
    util.waitForVisibilityOf(selector);
    util.waitForValueToBe(selector, text);
}


module.exports = {
    waitForInputText: waitForInputText,
    enterName: enterName,
    enterText: enterText,
    enterDescription: enterDescription,
    clearDescription: clearDescription,
    waitForDescriptionText: waitForDescriptionText
};
