/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var locators = {
    PREVIEW_TEXT: by.css('.bk-font-preview-text')
};

function getSelectedFontProperty(rootElement, cssProperty) {
    return rootElement
        .element(locators.PREVIEW_TEXT)
        .getCssValue(cssProperty);
}

module.exports = {
    locators: locators,
    getSelectedFontProperty: getSelectedFontProperty
};
