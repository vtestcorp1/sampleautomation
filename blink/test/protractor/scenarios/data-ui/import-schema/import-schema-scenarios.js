/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Vishwas B Sharma (vishwas.sharma@thoughtspot.com)
 * (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for importing schema through UI.
 */
'use strict';
var actions = require('../../actions-button');
var blinkListFunctions = require('../../list/blink-list.js');
var common = require('../../common.js');
var importSchemaPage = require('./import-schema');

var nav = common.navigation;

describe('Import Schema', function () {

    var tableName = 'TRIAL_NODE';
    var CREATE_SQL_FILE_NAME = './data-ui/import-schema/create_table.sql';
    var DELETE_SQL_FILE_NAME = './data-ui/import-schema/drop_db.sql';

    it('should create and delete a new table using schema UI without errors', function () {
        // Create a table
        importSchemaPage.uploadAndExecuteSQL(CREATE_SQL_FILE_NAME);
        importSchemaPage.waitForSuccessDisplay(4);
        nav.goToUserDataSection();
        blinkListFunctions.waitForItemCountToBe('', tableName, 1);
        // Delete the table
        importSchemaPage.uploadAndExecuteSQL(DELETE_SQL_FILE_NAME);
        importSchemaPage.waitForSuccessDisplay(1);
        nav.goToUserDataSection();
        blinkListFunctions.waitForItemCountToBe('', tableName, 0);
    });
});

