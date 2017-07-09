/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh
 *
 * @fileoverview E2E tests for Analyzer Component. Analyzer component analyzes a metatada object,
 * fetches the list of remarks and then presents in the UI via the Analyzer Component.
 *
 * Conceptually this is similar to linting of TS files. We anaylze (lint) the metadata object by
 * performing static analysis of metadata.
 *
 * More info in:
 * PRD: https://docs.google.com/document/d/1Q6djsiZ0J-sJLu3cwIoqc626Ao_CDr9HONfNGD0bXZ4
 * Rules: https://docs.google.com/spreadsheets/d/1GvyRDtXWbnx7KtC6XOMcmEU7_Oz4tTPevwvx1tcZFq8
 *
 */
'use strict';

var common = require('../../common.js');
var dataUI = require('../data-ui');
var analyzeUI = require('./analyze-ui');
var importSchema = require('../import-schema/import-schema');
var util = common.util;

describe('Verify analyzer remarks of data tables.', function () {

    var FILE_PATH = './data-ui/analyze/test-files/';
    var CREATE_SQL_FILE_NAME = FILE_PATH + 'create-analyze-table.sql';
    var DELETE_SQL_FILE_NAME = FILE_PATH + 'drop-analyze-db.sql';

    beforeAll(function () {
        // create table
        importSchema.uploadAndExecuteSQL(DELETE_SQL_FILE_NAME);
        importSchema.uploadAndExecuteSQL(CREATE_SQL_FILE_NAME);
        importSchema.waitForSuccessDisplay(4);
        util.reLogin('tsadmin', 'admin');
    });

    afterAll(function () {
        // delete table
        importSchema.uploadAndExecuteSQL(DELETE_SQL_FILE_NAME);
        importSchema.waitForSuccessDisplay(1);
        util.reLogin('tsadmin', 'admin');
    });

    it('[SMOKE] Should analyze LINEORDER system table and find no remarks.', function () {
        dataUI.goToTableByName('LINEORDER');
        dataUI.goToSuggestionsView();
        var countText = dataUI.getSuggestionsTotalCount();
        expect(countText.getText()).toContain('(0)');
    });

    it('Should analyze rls-chasm-ws worksheet and find chasm remarks.', function () {
        dataUI.goToTableByName('rls-chasm-ws');
        dataUI.goToSuggestionsView();
        var countText = dataUI.getSuggestionsTotalCount();
        expect(countText.getText()).toContain('(1)');
    });

    it('Should verify long column and a chasm trap', function () {
        dataUI.goToTableByName('Aggr_WS_On_Table_AggrWs_Chasm_Join_With_Filter');
        dataUI.goToSuggestionsView();
        analyzeUI.verifyTotalCount(2);
        analyzeUI.verifyChasmCount(1);
        analyzeUI.verifyLongColumnCount(1);
    });

    it('Should analyze a poorly written table schema and act on suggestions to fix it', function () {
        var longTableName = 'LongAnalyzeTableName_1234567890123456789012345678901234567890123456' +
            '789012345678901234567890';

        dataUI.goToTableByName(longTableName);
        dataUI.goToSuggestionsView();

        // verify count starts with as expected below.
        analyzeUI.verifyTotalCount(20);
        analyzeUI.verifyLongTableCount(1);
        analyzeUI.verifyLongColumnCount(12);
        analyzeUI.verifySystemKeywordsCount(2);
        analyzeUI.verifyCommonPrefixCount(3);
        analyzeUI.verifyManyColumnsCount(1);
        analyzeUI.verifyManyIndexedColumnsCount(1);

        // Rename long table name and count decreases by 1
        analyzeUI.renameLongTable('LongAnalyzeTableName');
        analyzeUI.verifyTotalCount(19);

        // rename 1 long column name and count decreases by 1
        var originalName = 'LongColumnName1_12345678901234567890';
        var newName = 'LongColumnName1';
        analyzeUI.renameLongColumn(originalName, newName);
        // verify long column count is now 11
        analyzeUI.verifyLongColumnCount(11);
        analyzeUI.verifyTotalCount(18);

        // rename next long column name and count decreases by 1
        originalName = 'LongColumnName2_12345678901234567890';
        newName = 'LongColumnName2';
        analyzeUI.renameLongColumn(originalName, newName);
        analyzeUI.verifyLongColumnCount(10);
        analyzeUI.verifyTotalCount(17);

        // rename next long column name and count decreases by 1
        originalName = 'LongColumnName3_12345678901234567890';
        newName = 'LongColumnName3';
        analyzeUI.renameLongColumn(originalName, newName);
        analyzeUI.verifyLongColumnCount(9);
        analyzeUI.verifyTotalCount(16);


        originalName = 'CommonPrefixSet2_12345678901234567890_Violet';
        newName = 'Violet';
        analyzeUI.renameCommonPrefixColumn(originalName, newName);
        analyzeUI.verifyTotalCount(14);
        analyzeUI.verifyLongColumnCount(8);
        analyzeUI.verifyCommonPrefixCount(2);

        // rename next long column name and count decreases by 1
        originalName = 'CommonPrefixSet2_12345678901234567890_Indigo';
        newName = 'Indigo';
        analyzeUI.renameLongColumn(originalName, newName);
        analyzeUI.verifyTotalCount(13);
        analyzeUI.verifyLongColumnCount(7);
        analyzeUI.verifyCommonPrefixCount(2);


        originalName = 'CommonPrefixSet3_12345678901234567890_Blue';
        newName = 'Blue';
        analyzeUI.renameCommonPrefixColumn(originalName, newName);
        analyzeUI.verifyTotalCount(12);
        analyzeUI.verifyLongColumnCount(6);
        analyzeUI.verifyCommonPrefixCount(2);

        originalName = 'CommonPrefixSet3_12345678901234567890_Green';
        newName = 'Green';
        analyzeUI.renameCommonPrefixColumn(originalName, newName);
        analyzeUI.verifyTotalCount(10);
        analyzeUI.verifyLongColumnCount(5);
        analyzeUI.verifyCommonPrefixCount(1);

        // rename next long column name and count decreases by 1
        originalName = 'CommonPrefixSet3_12345678901234567890_Yellow';
        newName = 'Yellow';
        analyzeUI.renameLongColumn(originalName, newName);
        analyzeUI.verifyTotalCount(9);
        analyzeUI.verifyLongColumnCount(4);


        // fix system keywords in column name
        originalName = 'top sales';
        newName = 'sales';
        // verify common-prefix count is now 2, long column count is 8
        analyzeUI.renameSystemKeywordColumn(originalName, newName);
        analyzeUI.verifyTotalCount(8);
        analyzeUI.verifySystemKeywordsCount(1);

        originalName = 'bottom performers';
        newName = 'performers';
        // verify common-prefix count is now 2, long column count is 8
        analyzeUI.renameSystemKeywordColumn(originalName, newName);
        analyzeUI.verifyTotalCount(7);
    });
});
