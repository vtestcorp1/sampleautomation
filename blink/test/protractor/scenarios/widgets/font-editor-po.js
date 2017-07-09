/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var blobUploader = require('./blob-uploader-po.js');
var colorConfigurator = require('./color-configurator-po.js');
var select = require('../libs/ui-select.js');

var selectors = {
    EDITOR_PROPERTY_FIELD: '.bk-font-editor-prop-field'
};

var locators = {
    ROOT: by.css('.bk-font-editor'),
    FONT_UPLOADER: by.css('.bk-font-editor-font-uploader'),
    FONT_NAME_FIELD: by.css('.bk-font-editor-property-family ' + selectors.EDITOR_PROPERTY_FIELD),
    COLOR_CONFIGURATOR: by.css('.bk-font-editor-color-configurator'),
    WEIGHT_SELECTOR: by.css('.bk-font-editor-property-weight-selector'),
    STYLE_SELECTOR: by.css('.bk-font-editor-property-style-selector'),
    SAVE_BUTTON: by.css('.bk-font-editor-save-button')
};

function uploadFontFile(fontFilePath) {
    blobUploader.uploadFile(
        element(locators.ROOT).element(locators.FONT_UPLOADER),
        fontFilePath
    );
}

function setFontName(fontName) {
    element(locators.ROOT)
        .element(locators.FONT_NAME_FIELD)
        .clear()
        .sendKeys(fontName);
}

function setFontColor(color) {
    colorConfigurator.setColor(
        element(locators.ROOT)
            .element(locators.COLOR_CONFIGURATOR),
        color
    );
}

function setFontWeight(weight) {
    select.changeSelection(
        element(locators.ROOT)
            .element(locators.WEIGHT_SELECTOR),
        weight
    );
}

function setFontStyle(style) {
    select.changeSelection(
        element(locators.ROOT)
            .element(locators.STYLE_SELECTOR),
        style
    );
}

function saveFont() {
    element(locators.ROOT)
        .element(locators.SAVE_BUTTON)
        .click();
}

module.exports = {
    locators: locators,
    uploadFontFile: uploadFontFile,
    setFontName: setFontName,
    setFontColor: setFontColor,
    setFontWeight: setFontWeight,
    setFontStyle: setFontStyle,
    saveFont: saveFont
};
