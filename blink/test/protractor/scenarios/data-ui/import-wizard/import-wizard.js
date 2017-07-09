/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var dataUI = require('../data-ui');
var util = common.util;
var actionBtns = require('../../actions-button');
var dialog = require('../../dialog');


var selectors = {
    LINK_EXISTING_DATA: '.bk-link-existing-data',
    ASK_A_QUESTION: '.bk-ask-a-question',
    HEADERS_YES: '.bk-upload-question-choice#yes',
    HEADER_NO: '.bk-upload-question-choice#no',
    UPLOAD_QUESTION_CHOICE: '.bk-upload-question-choice',
    NEXT_BTN: '.bk-wizard-btn-group     .bk-next-button',
    IMPORT_BTN: '.bk-wizard-btn-group .bk-finish-button',
    IMPORT_SUCCESS:'.bk-import-success',
    ERROR_STEP: '.bk-wizard-step-error',
    IMPORTED_NUMBER: '.bk-imported-rows-number',
    HEADER_ROWS: '.bk-userdata-header-row .bk-select-box',
    HEADER_NAME_ROW : '.bk-column-header-names .bk-header-cell-container input',
    HEADER_TYPE_ROW : '.bk-column-types',
    HEADER_TYPE_ROW_VALUES : '.bk-column-types span span',
    DATA_ROW : '.bk-userdata-data-row',
    DATA_CELL : '.bk-cell',
    DATA_ROW_CELLS : '.bk-userdata-data-row .bk-cell-content',
    ERROR_DATA_CELL : '.bk-error-cell',
    APPEND_OPTION: '.bk-upload-question-choice#append',
    OVERWRITE_OPTION: '.bk-upload-question-choice#overwrite'
};

var locators = {
    BACK_BTN: by.cssContainingText('.bk-secondary-button.bk-button-body .bk-text', 'Back'),
    CANCEL_BTN: by.cssContainingText('.bk-wizard-btn-group .bk-button-wrapper .bk-text', 'Cancel')
};

var dataType = {
    TRUE_FALSE: 'TRUE/FALSE',
    INTEGER: 'INTEGER',
    LARGE_INTEGER: 'LARGE INTEGER'
};

var deleteMockCSV = function (csvFileName) {
    dataUI.goToDataUI();
    dataUI.deleteMetadataItems([csvFileName]);
};

var mockUploadFile = function (fileName) {
    util.uploadFile(fileName);
    util.waitForElement(util.selectors.LOADING_INDICATOR_OVERLAY);
    util.waitForInvisibilityOf(
        util.selectors.LOADING_INDICATOR_OVERLAY
    );
};

var setHeaderDefined = function (defined) {
    var selector = defined ? selectors.HEADERS_YES
        : selectors.HEADER_NO;
    util.waitForAndClick(selector);
};

var setAppendOrOverwrite = function(append) {
    if(!!append) {
        $(selectors.APPEND_OPTION).click();
    } else {
        $(selectors.OVERWRITE_OPTION).click();
    }
};

var setColumnSeparator = function(separator) {
    $('#' + separator + selectors.UPLOAD_QUESTION_CHOICE).click();
};

var clickNext = function () {
    $(selectors.NEXT_BTN).click();
};

var clickBack = function () {
    element(locators.BACK_BTN).click();
};

var clickImportButton = function () {
    $(selectors.IMPORT_BTN).click();
};

var goToLinkingView = function () {
    $(selectors.LINK_EXISTING_DATA).click();
};
var goToAskQuestion = function () {
    $(selectors.ASK_A_QUESTION).click();
};

var verifySuccessStepVisible = function (numRowsImported) {
    expect($(selectors.IMPORT_SUCCESS).isPresent()).toBeTruthy();
    if (numRowsImported !== void 0) {
        expect($(selectors.IMPORTED_NUMBER).getText()).toMatch('' + numRowsImported);
    }
};

function verifyStepError(errorMessage) {
    util.waitForElementCountToBe(by.cssContainingText(selectors.ERROR_STEP, errorMessage), 1);
}

var selectTypeForColumn = function(columnNumber, type) {
    util.waitForElement(selectors.HEADER_ROWS);
    element.all(by.css(selectors.HEADER_ROWS)).get(columnNumber).click();
    util.waitForElementToBeClickable('.bk-column-data-type.select2-dropdown-open.open');
    element(util.contains('.ui-select-choices-row-inner', 'TRUE/FALSE')).click();
};

function cancelImport() {
    element(locators.CANCEL_BTN).click();
    dialog.clickPrimaryButton(true);
}

function getRowValues(selector, valueGetter) {
    return $$(selector).map(valueGetter);
}

function importCSVData(filePath, tableName, isHeaderDefined, deleteExisting) {
    if(!!deleteExisting) {
        deleteMockCSV(tableName);
    }
    dataUI.goToImportData();
    mockUploadFile(filePath);
    setHeaderDefined(!!isHeaderDefined);
    clickNext();
    clickNext();
    clickImportButton();
    verifySuccessStepVisible();
}

function verifyColumnHeaderNames(header) {
    expect(getRowValues(selectors.HEADER_NAME_ROW, function($e){
        return $e.getAttribute('value');
    })).toEqual(header.split(','));
}

function verifyColumnHeaderTypes(typesList) {
    expect(getRowValues(selectors.HEADER_TYPE_ROW_VALUES, function($e){
        return $e.getText();
    })).toEqual(typesList);
}

function verifyColumnData(data) {
    expect(getRowValues(selectors.DATA_ROW_CELLS, function($e){
        return $e.getText();
    })).toEqual(data.split(','));
}

function checkIfDataUploadBtnDisabled() {
    return actionBtns.checkIfButtonIsDisabled(actionBtns.actionLabels.IMPORT_DATA);
}

function testUpdatingData(file, tableName, append) {
    //append to the data we just added
    dataUI.goToDataUI();
    dataUI.goToTableByName(tableName);
    dataUI.loadDataOnSelectedItem();

    setHeaderDefined(true);
    setAppendOrOverwrite(append);
    mockUploadFile(file);
    clickNext();

    if (!append) {
        dialog.clickPrimaryButton(true);
    }

    clickImportButton();
    verifySuccessStepVisible();
}

function importSimpleCSVTable(csvFileName, numberOfRows) {
    dataUI.goToImportData();
    mockUploadFile(csvFileName);
    setHeaderDefined(true);
    clickNext();
    clickNext();
    clickImportButton();
    verifySuccessStepVisible(numberOfRows);
}

module.exports = {
    selectors,
    dataType,
    deleteMockCSV,
    mockUploadFile,
    setHeaderDefined,
    setColumnSeparator,
    clickNext,
    clickBack,
    clickImportButton,
    cancelImport,
    goToLinkingView,
    goToAskQuestion,
    verifySuccessStepVisible,
    verifyStepError,
    selectTypeForColumn,
    verifyColumnHeaderNames,
    verifyColumnHeaderTypes,
    verifyColumnData,
    importCSVData,
    importSimpleCSVTable,
    setAppendOrOverwrite,
    checkIfDataUploadBtnDisabled,
    testUpdatingData
};
