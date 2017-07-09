/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey(francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E API for import-schema page
 */

'use strict';

var actions = require('../../actions-button');
var common = require('../../common.js');
var nav = common.navigation;
var util = common.util;

var selectors = {
    RESET_BTN: '.create-schema-content .reset-btn',
    EXECUTE_BTN: '.create-schema-content .bk-primary-button',
    IMPORT_BTN: '.bk-file-upload-btn',
    SCHEMA_IMPORT_SUCCESS_DIALOG: '.bk-import-success .bk-import-success-text',
    SCHEMA_EXECUTED_STATEMENTS_NUMBER: '.bk-imported-rows-number'
};

function waitForSuccessDisplay(numberOfStatements) {
    util.waitForVisibilityOf(selectors.SCHEMA_IMPORT_SUCCESS_DIALOG);
    expect($(selectors.SCHEMA_EXECUTED_STATEMENTS_NUMBER).getText()).toBe(numberOfStatements + '');
}

function uploadAndExecuteSQL(fileName) {
    nav.goToUserDataSection();
    actions.selectActionButtonAction(actions.actionLabels.IMPORT_SCHEMA);
    util.uploadFile(fileName);
    this.clickExecute();
}
function clickReset() {
    util.waitForAndClick(selectors.RESET_BTN);
}
function clickExecute() {
    util.waitForAndClick(selectors.EXECUTE_BTN);
}
function clickImportButton() {
    util.waitForAndClick(selectors.IMPORT_BTN);
}

module.exports = {
    clickExecute: clickExecute,
    clickImportButton: clickImportButton,
    clickReset: clickReset,
    uploadAndExecuteSQL: uploadAndExecuteSQL,
    waitForSuccessDisplay: waitForSuccessDisplay
};
