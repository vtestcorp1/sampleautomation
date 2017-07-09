/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var fontPreview = require('./font-preview-po.js');

var locators = {
    FONT_CREATE_BUTTON: by.css('.bk-font-selector-create-button'),
    SELECTED_FONT_PREVIEW: by.css('.bk-font-selector-select-selected-preview')
};

function getSelectedFontProperty(rootElement, propertyName) {
    return fontPreview.getSelectedFontProperty(
        rootElement.element(locators.SELECTED_FONT_PREVIEW),
        propertyName
    );
}

module.exports = {
    locators: locators,
    getSelectedFontProperty: getSelectedFontProperty
};
