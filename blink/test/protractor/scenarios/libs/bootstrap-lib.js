/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview APIs to expose testability of bootstap library widgets.
 */

'use strict';

var common = require('../common');
var util = common.util;

var selectors = {};
selectors.TOOLTIP = '.tooltip';
selectors.TOOLTIP_INNER = selectors.TOOLTIP + ' .tooltip-inner';
selectors.POPOVER = '.popover';

function waitForToolTipContainingText(text) {
    util.waitForElement(by.cssContainingText(selectors.TOOLTIP_INNER, text));
}

function waitForPopoverContainingText(text) {
    util.waitForElement(by.cssContainingText(selectors.POPOVER, text));
}

module.exports = {
    tooltip: {
        waitForToolTipContainingText: waitForToolTipContainingText
    },
    popover: {
        waitForPopoverContainingText: waitForPopoverContainingText
    }
};
