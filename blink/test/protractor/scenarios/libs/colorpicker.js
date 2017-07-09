/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview APIs to expose testability of bootstap library widgets.
 */

'use strict';

var common = require('../common');
var sprintf = require('sprintf-js').sprintf;
var util = common.util;

var selectors = {};
selectors.COLOR_PICKER_ANCHOR = '.bk-color-picker-anchor.colorpicker-element';

function setColor(pickerSelector, color) {
    pickerSelector.click();

    var colorPickerScript = sprintf(
        '$(arguments[0]).colorpicker("setValue", "%s").colorpicker("hide")',
        color
    );
    browser.executeScript(colorPickerScript,
        pickerSelector.$(selectors.COLOR_PICKER_ANCHOR).getWebElement()
    );
}

function getColor(pickerFillElement) {
    return pickerFillElement.getCssValue('background-color');
}

module.exports = {
    getColor: getColor,
    setColor: setColor
};
