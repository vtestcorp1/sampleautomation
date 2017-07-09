/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var dialog = require('../dialog');

var selectors = {};
selectors.FILTER_PANEL_POPOVER_SELECTOR = '.bk-filter-panel-popover';

function clickDone() {
    dialog.clickPrimaryButton();
    dialog.waitForDialogAbsent();
}

function clickDoneWithoutExpectingItToDisappear() {
    dialog.clickPrimaryButton();
}

function clickCancel() {
    dialog.clickCancelButton();
    dialog.waitForDialogAbsent();
}

function waitForDialog(isOpened) {
    var count = isOpened ? 1 : 0;
    return common.util.waitForElementCountToBe(selectors.FILTER_PANEL_POPOVER_SELECTOR, count);
}

function waitForItToAppear() {
    waitForDialog(true);
}

function waitForItToDisappear() {
    waitForDialog(false);
}

module.exports = {
    clickDone: clickDone,
    clickDoneWithoutExpectingItToDisappear: clickDoneWithoutExpectingItToDisappear,
    clickCancel: clickCancel,
    waitForItToAppear: waitForItToAppear,
    waitForItToDisappear: waitForItToDisappear
};
