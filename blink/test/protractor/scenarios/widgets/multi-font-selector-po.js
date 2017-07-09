/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var fontSelector = require('./font-selector-po.js');

var locators = {
    FONT_SELECTOR: by.css('.bk-multi-font-selector-font-selector')
};

function getSelectedFontProperty(rootElement, propertyName) {
    return fontSelector.getSelectedFontProperty(
        rootElement.element(locators.FONT_SELECTOR),
        propertyName
    );
}

module.exports = {
    locators: locators,
    getSelectedFontProperty: getSelectedFontProperty
};
