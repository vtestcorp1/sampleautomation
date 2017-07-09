/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var functions = require('./import-wizard.js');
var dataUI = require('../data-ui.js');
var blinkList = require('../../list/blink-list.js');
var common = require('../../common.js');
var util = common.util;
var dialog = require('../../dialog');
var table = require('../../table/table');

describe('import data wizard', function() {

    afterAll(function () {
        util.reLogin();
    });

    beforeEach(function() {
        dataUI.goToDataUI();
        dialog.abortUnloadDialog();
    });

    afterEach(function() {
        dialog.cleanupDialog();
    });

    var CSV_HEADER = 'Date,Vendor,Amount,Transaction Type,Category,Account Name',
        CSV_VALID_ROWS = ['01/13/2012,IKEA,113.91,debit,Furnishings,BUSINESS CHECKING', '01/22/2012,DIKEA,1113.91,credit,Durnishings,DUSINESS CHECKING'],
        CSV_AMBIGUOUS_ROW = '01/01/2013,IKEA,113.91,debit,Furnishings,BUSINESS CHECKING',
        CSV_INVALID_ROWS = ['1/0014/14,IKEA,yolo,debit,Furnishings,BUSINESS CHECKING', '02/01/2013,IKEA,yolo,debit,Furnishings,BUSINESS CHECKING'],
        CSV_HEADER_TYPES = ['DATE', 'TEXT', 'DECIMAL', 'TEXT', 'TEXT', 'TEXT'],
        FILE_PATH = 'data-ui/import-wizard/test-files/';

    it('should disable user data upload for users without data upload permission', function () {
        util.reLogin('guest4', 'guest4');
        common.navigation.goToUserDataSection();
        functions.checkIfDataUploadBtnDisabled();
        util.reLogin();
    });

    it("should not be stuck if warning popup is dismissed", function() {
        dataUI.goToImportData();
        functions.mockUploadFile(FILE_PATH + 'mock.csv');
        functions.setHeaderDefined(true);
        functions.clickNext();
        functions.clickNext();
        functions.selectTypeForColumn(5, functions.dataType.TRUE_FALSE);
        functions.clickImportButton();
        functions.clickImportButton();
        dialog.checkDismissal();
        functions.cancelImport();
    });

    it('should allow linking after importing data to guests', function () {
        var CSV_FILE_NAME = 'mock.csv';
        var TABLE_NAME = 'mock';
        util.reLogin('guest1', 'guest1');
        dataUI.goToDataUI();
        dataUI.goToImportData();
        functions.mockUploadFile(FILE_PATH + CSV_FILE_NAME);
        functions.setHeaderDefined(true);
        functions.clickNext();
        functions.clickNext();
        functions.clickImportButton();
        functions.verifySuccessStepVisible(2 /* Number of rows imported */);

        functions.goToLinkingView();
        blinkList.clearSearchBox(dataUI.selectors.DATA_UI_LIST);
        blinkList.selectItemByName(dataUI.selectors.DATA_UI_LIST, TABLE_NAME);
        dataUI.expectTableAsRelationshipTarget('LINEORDER');
        dataUI.closeExplorer();
        dataUI.goToTableByName('LINEORDER');
        dataUI.goToRelationshipView();
        $(dataUI.selectors.ADD_RELATIONSHIP).click();
        dataUI.expectTableAsRelationshipTarget(TABLE_NAME);
        dataUI.closeExplorer();

        functions.deleteMockCSV(TABLE_NAME);
        util.reLogin();
    });

    it('[SMOKE] should allow import of valid user data csv', function () {
        var CSV_FILE_NAME = FILE_PATH + 'mock.csv';
        var CSV_TABLE_NAME = 'mock';

        dataUI.goToImportData();
        functions.mockUploadFile(CSV_FILE_NAME);
        functions.setHeaderDefined(true);
        functions.clickNext();
        functions.verifyColumnHeaderNames(CSV_HEADER);
        functions.verifyColumnData(CSV_VALID_ROWS.join(','));
        functions.clickNext();
        functions.verifyColumnHeaderTypes(CSV_HEADER_TYPES);
        functions.clickImportButton();
        functions.verifySuccessStepVisible(2 /* Number of rows imported */);
        functions.deleteMockCSV(CSV_TABLE_NAME);
    });

    it('[SMOKE] should allow appending to existing user data', function () {
        var CSV_TABLE_NAME = 'mock';
        var CSV_FILE = FILE_PATH + 'mock.csv';

        functions.importCSVData(CSV_FILE, CSV_TABLE_NAME, true, false);
        functions.testUpdatingData(CSV_FILE, CSV_TABLE_NAME, true /*append*/);
        functions.verifySuccessStepVisible(2);
        functions.deleteMockCSV(CSV_TABLE_NAME);
    });

    it('should allow overwriting existing user data', function () {
        var CSV_TABLE_NAME = 'mock';
        var CSV_FILE = FILE_PATH + 'mock.csv';

        functions.importCSVData(CSV_FILE, CSV_TABLE_NAME, true, false);
        functions.testUpdatingData(CSV_FILE, CSV_TABLE_NAME, false /*append*/);
        functions.verifySuccessStepVisible(2);
        functions.deleteMockCSV(CSV_TABLE_NAME);
    });

    it('should show value error if date values in invalid format', function () {
        var CSV_TABLE_NAME = 'mock-invalid';
        var CSV_FILE = FILE_PATH + 'mock-invalid.csv';
        dataUI.goToImportData();
        functions.mockUploadFile(CSV_FILE);
        functions.setHeaderDefined(true);
        functions.clickNext();
        functions.clickNext();
        functions.clickImportButton();
        functions.verifyStepError('Inconsistencies between the column ' +
            'data and its type have been detected.');
        dataUI.goToDataUI();
        dialog.clickPrimaryButton();
    });

    it('should show recoverable error if column row(s) are invalid', function () {
        var CSV_TABLE_NAME = 'mock-invalid-recoverable';
        var CSV_FILE = FILE_PATH + 'mock-invalid-recoverable.csv';
        dataUI.goToImportData();
        functions.mockUploadFile(CSV_FILE);
        functions.setHeaderDefined(true);
        functions.clickNext();
        functions.clickNext();
        functions.clickImportButton();
        functions.verifyStepError('Please hover over the cells marked in ' +
            'red to view more details.');
        dataUI.goToDataUI();
        dialog.clickPrimaryButton(true);
    });

    it('should allow abort dialog to work when back button is used', function(){
        var CSV_FILE_NAME = FILE_PATH + 'mock.csv';

        dataUI.goToImportData();
        functions.mockUploadFile(CSV_FILE_NAME);
        functions.setHeaderDefined(true);
        functions.clickNext();
        browser.navigate().back();
        util.waitForElement(dialog.selectors.DIALOG);
        dialog.clickPrimaryButton();
        util.waitForElementToNotBePresent(dialog.selectors.DIALOG);
    });

    it('should allow different separators for column data during csv upload', function() {
        dataUI.goToImportData();
        var headerColumns = 'Column1,Column2';
        var data = 'D1,D2';

        // Comma separated data
        var fileName = FILE_PATH + 'comma-sep.csv';

        functions.mockUploadFile(fileName);
        functions.setHeaderDefined(true);
        functions.setColumnSeparator('comma');
        functions.clickNext();
        functions.verifyColumnHeaderNames(headerColumns);
        functions.verifyColumnData(data);

        functions.clickBack();
        // Semicolon separated data
        fileName = FILE_PATH + 'semicolon-sep.csv';

        functions.mockUploadFile(fileName);
        functions.setHeaderDefined(true);
        functions.setColumnSeparator('semicolon');
        functions.clickNext();
        functions.verifyColumnHeaderNames(headerColumns);
        functions.verifyColumnData(data);

        functions.clickBack();
        // Pipe separated data
        fileName = FILE_PATH + 'pipe-sep.csv';

        functions.mockUploadFile(fileName);
        functions.setHeaderDefined(true);
        functions.setColumnSeparator('pipe');
        functions.clickNext();
        functions.verifyColumnHeaderNames(headerColumns);
        functions.verifyColumnData(data);

        functions.clickBack();
        // Space separated data
        fileName = FILE_PATH + 'space-sep.csv';

        functions.mockUploadFile(fileName);
        functions.setHeaderDefined(true);
        functions.setColumnSeparator('space');
        functions.clickNext();
        functions.verifyColumnHeaderNames(headerColumns);
        functions.verifyColumnData(data);

        functions.clickBack();
        // Tab separated data
        fileName = FILE_PATH + 'tab-sep.csv';

        functions.mockUploadFile(fileName);
        functions.setHeaderDefined(true);
        functions.setColumnSeparator('tab');
        functions.clickNext();
        functions.verifyColumnHeaderNames(headerColumns);
        functions.verifyColumnData(data);
        dataUI.goToDataUI();
        util.waitForElement(dialog.selectors.DIALOG);
        dialog.clickPrimaryButton();
        util.waitForElementToNotBePresent(dialog.selectors.DIALOG);
    });
});
