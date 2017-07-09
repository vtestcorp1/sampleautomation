/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('User workflows', function () {

    var dropCommands = [
        'DROP DATABASE "broken_worksheets";'
    ];

    var createDBCommands = [
        'CREATE DATABASE "broken_worksheets";',

        'CREATE TABLE "broken_worksheets"."falcon_default_schema"."REGULAR" ( ' +
          '"company" VARCHAR(32), ' +
          '"ticker" VARCHAR(10), ' +
         'PRIMARY KEY ("ticker" ) ' +
        ');',

        'CREATE TABLE "broken_worksheets"."falcon_default_schema"."HIDDEN_COLUMN" ( ' +
          '"h_ticker" VARCHAR(10), ' +
          '"open_price" DOUBLE, ' +
          '"to_be_hidden" VARCHAR(32) ' +
        ');',

        'CREATE TABLE "broken_worksheets"."falcon_default_schema"."DELETED_COLUMN" ( ' +
          '"d_ticker" VARCHAR(10), ' +
          '"close_price" DOUBLE, ' +
          '"to_be_deleted" VARCHAR(32) ' +
        ');',

        'CREATE TABLE "broken_worksheets"."falcon_default_schema"."RELATED_TABLE_1" ( ' +
          '"name1" VARCHAR(10), ' +
          '"weight" DOUBLE, ' +
          '"description" VARCHAR(32) ' +
        ');',

        'CREATE TABLE "broken_worksheets"."falcon_default_schema"."RELATED_TABLE_2" ( ' +
          '"name2" VARCHAR(10), ' +
          '"length" DOUBLE, ' +
          '"notes" VARCHAR(32) ' +
        ');',

        'ALTER TABLE "broken_worksheets"."falcon_default_schema"."RELATED_TABLE_1" ADD RELATIONSHIP "r1" WITH "broken_worksheets"."falcon_default_schema"."RELATED_TABLE_2" AS "name1"="name2";',

        'ALTER TABLE "broken_worksheets"."falcon_default_schema"."HIDDEN_COLUMN" ADD CONSTRAINT FOREIGN KEY ("h_ticker" ) REFERENCES "broken_worksheets"."falcon_default_schema"."REGULAR" ("ticker");',

        'ALTER TABLE "broken_worksheets"."falcon_default_schema"."DELETED_COLUMN" ADD CONSTRAINT FOREIGN KEY ("d_ticker" ) REFERENCES "broken_worksheets"."falcon_default_schema"."REGULAR" ("ticker");'
    ];

    var dropColumnCommands = [
        'ALTER TABLE "broken_worksheets"."falcon_default_schema"."DELETED_COLUMN" DROP COLUMN "to_be_deleted";',
    ];

    var dropRelationshipCommands = [
        'ALTER TABLE "broken_worksheets"."falcon_default_schema"."RELATED_TABLE_1" DROP RELATIONSHIP "r1";',
    ];

    function recreateDB () {
        dataTab().click();
        uploadAndExecuteSQL("dropDB", dropCommands);
        uploadAndExecuteSQL("createDBCommands", createDBCommands);
        waitForSuccessDisplay();
        dataTab().click();
        waitForDataItemCountToBe("DELETED_COLUMN", 1);
        waitForDataItemCountToBe("HIDDEN_COLUMN", 1);
        waitForDataItemCountToBe("RELATED_TABLE_1", 1);
        waitForDataItemCountToBe("RELATED_TABLE_2", 1);
        sleep(5);
    }

    function hideColumn(table, column) {
        dataTab().click();
        element(metadataListSelectorContaining(table)).click();
        var hiddenSwitchSelector = '.ui-widget-content:contains("' + column + '") .r6 .onoffswitch';
        waitForElement(hiddenSwitchSelector);
        element(hiddenSwitchSelector).click();
        element(SAVE_METADATA_BTN).click();
    }

    function deleteColumnFromWs(wsName, column) {
        dataTab().click();
        element(metadataListSelectorContaining(wsName)).click();
        element('.bk-metadata-edit').click();
        var columnCheckboxSelector = '.slick-row:contains("' + column + '") input[type=checkbox]';
        waitForElement(columnCheckboxSelector);
        element(columnCheckboxSelector).click();
        element('.bk-btn.delete-action').click();
        expect(element(columnCheckboxSelector).count()).toBe(0);
        saveBtn().click();
        expectSuccessNotif();
    }

    function prepareTest(wsName, tables) {
        recreateDB();

        deleteWorksheet(wsName, true);

        createSimpleWorksheet({
            sources: tables,
            title: wsName,
        });
    }

    it('should drop the relationship and fix the worksheet', function () {
        var wsName = '[dropped relationship ws]';
        prepareTest(wsName, ['RELATED_TABLE_1', 'RELATED_TABLE_2']);
        uploadAndExecuteSQL("dropRelationship", dropRelationshipCommands);
        sleep(5);
        fixWorksheet(wsName);
        deleteWorksheet(wsName, true);
    });

    it('should drop the relationship and fix the worksheet with answer that depends on it', function () {
        var wsName = '[dropped relationship ws]';
        var answerName = '[relation ws answer]';
        deleteSavedAnswer(answerName, true);
        prepareTest(wsName, ['RELATED_TABLE_1', 'RELATED_TABLE_2']);
        answerTab().click();
        deselectAllSources();
        selectSourcesByName([wsName]);
        createAndSaveAnswer('name1 name2 weight length', answerName, true);
        uploadAndExecuteSQL("dropRelationship", dropRelationshipCommands);
        sleep(5);
        fixWorksheet(wsName);
        deleteSavedAnswer(answerName, true);
        deleteWorksheet(wsName, true);
    });

    it('should delete hidden column from worksheet', function () {
        var wsName = '[hidden column ws]';
        prepareTest(wsName, ['REGULAR', 'HIDDEN_COLUMN']);
        hideColumn('HIDDEN_COLUMN', 'to_be_hidden');
        deleteColumnFromWs(wsName, 'to_be_hidden');
        deleteWorksheet(wsName, true);
    });

    it('should delete hidden column from worksheet with answer that depends on it', function () {
        var wsName = '[hidden column ws]';
        var answerName = '[ws hidden column answer]';
        deleteSavedAnswer(answerName, true);
        prepareTest(wsName, ['REGULAR', 'HIDDEN_COLUMN']);
        answerTab().click();
        deselectAllSources();
        selectSourcesByName([wsName]);
        createAndSaveAnswer('ticker company to_be_hidden', answerName, true);
        hideColumn('HIDDEN_COLUMN', 'to_be_hidden');
        deleteColumnFromWs(wsName, 'to_be_hidden');
        deleteSavedAnswer(answerName, true);
        deleteWorksheet(wsName, true);
    });

    it('should fix worksheet with deleted column', function () {
        var wsName = '[deleted column ws]';
        prepareTest(wsName, ['REGULAR', 'DELETED_COLUMN']);
        uploadAndExecuteSQL("dropColumn", dropColumnCommands);
        sleep(5);
        fixWorksheet(wsName);
        deleteWorksheet(wsName, true);
    });

    it('should fix worksheet with deleted column with answer that depends on it', function () {
        var wsName = '[deleted column ws]';
        var answerName = '[ws deleted column answer]';
        deleteSavedAnswer(answerName, true);
        prepareTest(wsName, ['REGULAR', 'DELETED_COLUMN']);
        answerTab().click();
        deselectAllSources();
        selectSourcesByName([wsName]);
        createAndSaveAnswer('ticker company to_be_deleted', answerName, true);
        uploadAndExecuteSQL("dropColumn", dropColumnCommands);
        sleep(5);
        fixWorksheet(wsName);
        deleteSavedAnswer(answerName, true);
        deleteWorksheet(wsName, true);
    });
});
