/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around activity panel (home page)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var CSV_HEADER = 'Date,Vendor,Amount,Transaction Type,Category,Account Name',
    CSV_VALID_ROWS = ['01/13/2012,IKEA,113.91,debit,Furnishings,BUSINESS CHECKING', '01/22/2012,DIKEA,1113.91,credit,Durnishings,DUSINESS CHECKING'],
    CSV_HEADER_TYPES = ['DATE', 'TEXT', 'DECIMAL', 'TEXT', 'TEXT', 'TEXT'];

describe('test activity pane: ', function() {

    it('should show user has uploaded data', function () {
        var CSV_FILE_NAME = 'dummy.csv',
            CSV_TABLE_NAME = 'dummy';

        userDataUploadFunctions.deleteMockCSV(CSV_TABLE_NAME);
        dataTab().click();
        clickImportDataButton();
        userDataUploadFunctions.mockUploadFile(CSV_FILE_NAME, [CSV_HEADER, CSV_VALID_ROWS[0]].join('\n'));
        userDataUploadFunctions.setHeaderDefined(true);
        userDataUploadFunctions.clickNext();
        verifyColumnHeaderNames(CSV_HEADER);
        verifyColumnData(CSV_VALID_ROWS[0]);
        userDataUploadFunctions.clickNext();
        verifyColumnHeaderTypes(CSV_HEADER_TYPES);
        userDataUploadFunctions.clickNext();
        userDataUploadFunctions.clickImportButton();
        verifySuccessStepVisible();
        verifyNumberOfRowsInTable(CSV_TABLE_NAME, 1);
        checkActivity('A', 'Administrator', 'edited imported data', CSV_TABLE_NAME);
        userDataUploadFunctions.deleteMockCSV(CSV_TABLE_NAME);
    });

    it('should show user has created pinboards', function() {
        createPinboards('abc123_testing');
        checkActivity('A', 'Administrator', 'created a pinboard', 'abc123_testing');
    });

    it('should show user has created answers', function() {
        var query = 'revenue by customer nation';
        var answer = 'activity_test';
        // create new answer
        answerTab().click();
        selectSageSources(TPCH_TABLES);
        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        saveCurrentAnswer(answer);
        checkActivity('A', 'Administrator', 'asked a question', answer);
    });
});
