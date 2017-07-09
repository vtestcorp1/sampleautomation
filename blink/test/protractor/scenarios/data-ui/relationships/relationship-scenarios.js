/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var dataUI = require('../data-ui');
var functions = require('./relationship');
var worksheets = require('../../worksheets/worksheets.js');
var uiSelect = require('../../libs/ui-select.js');
var util = common.util;

describe('Relationship manager', function () {
    it('Should not allow unprivileged user to delete/update relationships', function () {
        util.reLogin('guest', 'guest');

        dataUI.goToTableByName('TEST1');
        dataUI.goToRelationshipView();
        expect($$(functions.selectors.RELATIONSHIP_UPDATE_BTN).count()).toBe(0);
        expect($$(functions.selectors.RELATIONSHIP_DELETE_BTN).count()).toBe(0);
        util.reLogin();
    });

    it("should not allow creation of relation between worksheet", function() {
        var worksheetName = '[customerwks]';
        var worksheetName2 = '[lineorderwks]';

        worksheets.createSimpleWorksheet(['CUSTOMER'], worksheetName);
        common.navigation.goToUserDataSection();
        worksheets.createSimpleWorksheet(['LINEORDER'], worksheetName2);
        common.navigation.goToUserDataSection();
        dataUI.goToTableByName(worksheetName);
        dataUI.goToRelationshipView();

        uiSelect.checkForOption($(functions.selectors.RELATIONSHIP_HEADER), worksheetName2, 0);

        common.navigation.goToUserDataSection();
        worksheets.deleteWorksheet(worksheetName);
        worksheets.deleteWorksheet(worksheetName2);
    });

    it('should show relationship editor for table with no relationships and viewer for one with relationships', function() {
        dataUI.goToTableByName('Phone Dimension');
        dataUI.goToRelationshipView();

        functions.checkUIState(1, 0);

        dataUI.goToTableByName('Phone Sales');
        dataUI.goToRelationshipView();

        functions.checkUIState(0, 2);
    });

    it("should be able to change the name/description of a relationship", function(){

        var destinationTable = 'User_Data_Transactions';
        var sourceTable = "CUSTOMER";
        var sourceColumn = ['Customer City'];
        var destinationColumn = ['Vendor'];

        functions.createRelationship(sourceTable, destinationTable, sourceColumn, destinationColumn, false, false);
        functions.editRelationship('Untitled', '[TESTNAME]', '[TESTDESCRIPTION]', true);
        functions.checkUIState(0, 1);
        functions.deleteRelationship(sourceColumn);
        functions.checkUIState(1, 0);
    });

    it('should be able to create a relationship with multiple columns', function() {

        var sourceTableName = 'User_Data_Transactions';
        var destinationTableName = 'User_Data_Linorder_Link_Table';
        var destinationColumns = ['Created', 'Key'];
        var sourceColumns = ['Date', 'Vendor'];

        functions.createRelationship(sourceTableName, destinationTableName, sourceColumns, destinationColumns, true);
        functions.deleteRelationship(sourceColumns[0]);

        functions.checkUIState(1, 0);
    });

    it("non admin with no specific privilege should no been able to edit/create relationships", function(){

        dataUI.goToTableByName('TEST1');
        dataUI.goToRelationshipView();

        functions.checkUIState(0, 2);

        util.reLogin('guest','guest');
        dataUI.goToTableByName('LINEORDER');
        dataUI.goToRelationshipView();

        functions.checkUIState(0, 5);
        util.waitForElementCountToBe($$(functions.selectors.RELATIONSHIP_UPDATE_BTN), 0);
        util.reLogin();
    });

    it('[SMOKE] should be able to create and delete a relationship between system tables', function() {
        functions.createRelationship('Phone Dates', 'DATE', ['Date Key'],  ['Datekey']);
        functions.checkUIState(0, 1);
        functions.deleteRelationship('Date Key');
        functions.checkUIState(1, 0);
    });

    it('should go back to viewer when cancel pressed on editor', function() {
        dataUI.goToTableByName('TEST1');
        dataUI.goToRelationshipView();

        functions.checkUIState(0, 2);

        util.waitForAndClick($(functions.selectors.ADD_RELATIONSHIP_BTN));
        util.waitForElementCountToBe($$(functions.selectors.RELATIONSHIP_EDITOR), 1);

        util.waitForAndClick($(functions.selectors.CANCEL_BTN_SELECTOR));
        functions.checkUIState(0, 2);
    });

    it('should be able to create and delete a relationship between user-defined tables', function() {
        functions.createRelationship('User_Data_Transactions',
            'User_Data_Linorder_Link_Table', ['Date'], ['Created']);

        functions.checkUIState(0, 1);
        functions.deleteRelationship('Date');
        util.waitForElementCountToBe($$(functions.selectors.RELATIONSHIP_EDITOR), 1);
        util.waitForElementCountToBe($$(functions.selectors.RELATIONSHIP_VIEWER), 0);
        functions.checkUIState(1, 0);
    });

    it("should be able to create a relationship between a worksheets and a table", function(){

        var worksheetName = '[customerwks]';
        worksheets.createSimpleWorksheet(['CUSTOMER'], worksheetName);
        common.navigation.goToUserDataSection();

        var destinationTable = 'User_Data_Transactions';
        var sourceColumn = ['Customer City'];
        var destinationColumn = ['Vendor'];
        functions.createRelationship(worksheetName, destinationTable, sourceColumn, destinationColumn, true);
        functions.deleteRelationship(sourceColumn[0]);
        functions.checkUIState(1, 0);
        // there is no need to wait for this button at that point
        $(dataUI.selectors.CLOSE_EXPLORER_SELECTOR).click();
        worksheets.deleteWorksheet(worksheetName);
    });

    afterAll(function () {
        util.reLogin('tsadmin', 'admin');
    });
});
