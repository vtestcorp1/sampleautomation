/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jeff Tran, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving worksheets
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
var CSV_FILE_NAME = 'User_Data_Transactions';
var TABLE_NAME = 'Formula_Test_Data';
var JOINING_TABLE_NAMES_1 = ['CUSTOMER', 'SUPPLIER', 'LINEORDER'];
var JOINING_TABLE_NAMES_2 = ['CUSTOMER', 'LINEORDER'];

function deleteWorksheetColBtn() {
    return element('.bk-delete-action');
}

function columnNameCell(colNumber) {
    return '.ui-widget-content:eq(' + colNumber + ') .column-name-cell';
}

function renameWorksheetCol(colNumber, newName) {
    element(columnNameCell(colNumber)).click();
    blinkInput(columnNameCell(colNumber) + ' input').enter(newName);
    blinkInput(columnNameCell(colNumber) + ' input').pressEnter();
}

function deleteWorksheetCol(colNumber) {
    element('.ui-widget-content:eq(' + colNumber + ') input').click();
    deleteWorksheetColBtn().click();
}


describe('Specific worksheet', function() {

    it('should create a worksheet with a csv source', function() {
        var WS_NAME = '[imported data worksheet]';
        createSimpleWorksheet({
            dataScope: {
                importedData: [CSV_FILE_NAME]
            },
            sources: [CSV_FILE_NAME]
        }, true);
        saveCurrentAnswer(WS_NAME);
        dataTab().click();
        expect(worksheetContaining(WS_NAME).count()).toBe(1);
        deleteWorksheet(WS_NAME);
    });

    it('should be able to add, edit, and remove columns in the worksheet and save', function() {
        var worksheetName = '[qa test worksheet]';

        createSimpleWorksheet({
            title: worksheetName,
            sources: [TABLE_NAME]
        });
        deleteWorksheetCol(1);
        renameWorksheetCol(1, '[qa new col]');
        saveBtn().click();
        expect(element(columnNameCell(1)).text()).toBe('[qa new col]');
        deleteWorksheet(worksheetName);
    });

    it('should be able to add columns from multiple joining tables', function() {
        var worksheetName = '[Test joining columns from more than two tables]',
            formulaName = '[test formula]',
            formulaContent = 'contains ( supplier city , "japan") and contains ( customer city, "jordan") and revenue > 2000000';

        createSimpleWorksheet( {
            title: worksheetName,
            sources: JOINING_TABLE_NAMES_1
        });

        createFormulaAndSave(formulaName, formulaContent);
        verifyFormulaResult(formulaName, ['false', 'true', 'false']);
    });


    describe('Worksheet Operations', function () {
        it('should open, rename, and save a worksheet', function() {
            var worksheetName = '[test worksheet]';
            var newWorksheetName = '[new worksheet]';
            createSimpleWorksheet({
                title: worksheetName,
                sources: ['CUSTOMER', 'LINEORDER']
            });
            dataTab().click();
            expect(worksheetContaining(worksheetName).count()).toBe(1);
            openSavedWorksheetContaining(worksheetName);
            setMetaItemHeaderTextTo(newWorksheetName);
            saveBtn().click();
            dataTab().click();
            expect(worksheetContaining(worksheetName).count()).toBe(0);
            expect(worksheetContaining(newWorksheetName).count()).toBe(1);
            deleteWorksheet(newWorksheetName);
        });
    });


});
