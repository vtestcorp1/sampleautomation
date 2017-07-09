/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');

var locators = {
    INPUT_FIELD: by.css('.bk-text-box-input')
};

function setInputFieldValue(rootElement, value) {
    rootElement.element(locators.INPUT_FIELD).clear();
    return rootElement.element(locators.INPUT_FIELD).sendKeys(value);
}

module.exports = {
    locators: locators,
    setInputFieldValue: setInputFieldValue
};
