/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var util = require('../common').util;

var selectors = {
    DROPDOWN_VALUE_ITEM: '.select2-result-label',
    CONTAINER: '.select2-container',
    CHOSEN_VALUE: '.select2-choice'
};

var locators = {
    DROPDOWN_VALUE_ITEM: by.css(selectors.DROPDOWN_VALUE_ITEM),
    CHOSEN_VALUE: by.css(selectors.CHOSEN_VALUE)
};

function getSelectedOptionElement(rootElement) {
    return rootElement.element(locators.CHOSEN_VALUE);
}

function setSingleValue(rootElement, value) {
    rootElement.click();

    // TODO (sunny): support exact match
    var dropdownValueItem = by.cssContainingText(
        selectors.DROPDOWN_VALUE_ITEM,
        value
    );
    element(dropdownValueItem).click();
}

function hoverSingleValue(rootElement, value) {
    rootElement.click();
    var dropdownValueItem = by.cssContainingText(
        selectors.DROPDOWN_VALUE_ITEM,
        value
    );
    util.mouseMoveToElement(dropdownValueItem);
}

module.exports = {
    selectors: selectors,
    locators: locators,
    setSingleValue: setSingleValue,
    getSelectedOptionElement: getSelectedOptionElement,
    hoverSingleValue: hoverSingleValue
};
