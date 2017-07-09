/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var util = require('util');

var common = require('../common.js');

var selectors = {
    ROOT: '.bk-style-color-configurator-color-picker',
    COLOR_PICKER_ANCHOR: '.bk-color-picker-anchor'
};

var locators = {
    ROOT: by.css(selectors.ROOT),
    COLOR_PICKER_ANCHOR: by.css(selectors.COLOR_PICKER_ANCHOR)
};

function setColor(rootElement, color) {
    rootElement.element(locators.ROOT).click();

    var anchor = rootElement.element(
        by.css(
            common.util.joinSelectors(
                selectors.ROOT,
                selectors.COLOR_PICKER_ANCHOR
            )
        )
    );

    var colorPickerScript = util.format(
        '$(arguments[0]).colorpicker("setValue", "%s").colorpicker("hide")',
        color
    );
    browser.executeScript(colorPickerScript, anchor.getWebElement());
}

module.exports = {
    locators: locators,
    setColor: setColor
};
