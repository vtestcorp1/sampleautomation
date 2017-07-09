/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview PO for dialo-action-buttons widget
 */
'use strict';
var util = require('../common').util;

var selectors = {
    PRIMARY_BTN: '.bk-dialog-action-buttons .bk-primary-button',
    SECONDARY_BTN: '.bk-dialog-action-buttons .bk-secondary-button'
};

function clickPrimaryButton(container) {
    util.waitForAndClick(
        util.getElementInContainer(container, selectors.PRIMARY_BTN)
    );
}

function clickSecondaryButton(container) {
    util.waitForAndClick(
        util.getElementInContainer(container, selectors.SECONDARY_BTN)
    );
}

module.exports = {
    clickPrimaryButton,
    clickSecondaryButton
};
