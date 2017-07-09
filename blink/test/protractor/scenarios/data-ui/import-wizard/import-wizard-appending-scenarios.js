/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';
var importSchema = require('../import-schema/import-schema');
var dataUI = require('../data-ui.js');
var table = require('../../table/table');
var functions = require('./import-wizard.js');



describe('Appending to system tables', function() {
    // System table details
    var tableName = 'TEST_SYSTEM_TABLE';
    var CSV_FILE_NAME = 'test.csv';
    var FILE_PATH = 'data-ui/import-wizard/test-files/';


    beforeEach(function() {
        // Create empty system table
        importSchema.uploadAndExecuteSQL(FILE_PATH + 'create-table.sql');
    });
    afterEach(function() {
        // Delete system table
        importSchema.uploadAndExecuteSQL(FILE_PATH + 'drop-db.sql');
    });

    it('should update system table using csv', function() {
        // Verify count of data rows in table to be 0
        dataUI.goToTableByName(tableName);
        dataUI.goToDataView();
        table.waitForTableRowCountToBe(dataUI.selectors.EXPLORER_TABLE, 0);

        // Upload the new data in append mode
        functions.testUpdatingData(FILE_PATH + CSV_FILE_NAME, tableName, true /*append*/);

        // Check if new data has resulted in increase in data rows
        dataUI.goToTableByName(tableName);
        dataUI.goToDataView();
        table.waitForTableRowCountToBe(dataUI.selectors.EXPLORER_TABLE, 1);
    });
});
