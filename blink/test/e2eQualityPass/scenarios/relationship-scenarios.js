/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview e2e scenarios around adding and editing relationships
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var relationshipFunctions = (function() {

    var relTabEl = '.mode-item:contains(Relationships)',
        relNameEl = '.bk-editable-input.bk-visible:eq(6)',
        select2El = '.select2-chosen',
        relDelEl = contains('bk-button', 'Delete'),
        keyAddEl = contains('bk-button', 'Add Key'),
        relAddEl = contains('bk-button', 'Add Relationship'),
        relUpdateEl = contains('bk-button', 'Update'),
        addNewEl = '.bk-add-mode-btn';


    return {
        openRelationshipsView : function(tblName) {
            dataTab().click();
            searchByName(tblName);
            metadataListContaining(tblName).click();
            waitForElement(relTabEl, 'waiting for relationship tab');
            element(relTabEl).click();
        },

        // link source (a fact table) to destination
        addLink: function (sourceTbl, destTbl, sourceCol, destCol, relName, addNew) {
            this.openRelationshipsView(sourceTbl);
            if (!!addNew) {
                element(addNewEl).click();
            }

            blinkInput(relNameEl).enter(relName);
            // select destination table
            element(contains(select2El, 'Destination')).click();
            blinkInput('.ui-select-search.ng-touched').enter(destTbl);
            element(contains('span', destTbl)).click();
            // enter source column
            element(contains(select2El, 'Source column')).click();
            blinkInput('.ui-select-search.ng-touched').enter(sourceCol);
            element(contains('span', sourceCol)).click();
            // enter destination column
            element(contains(select2El, 'Destination column')).click();
            blinkInput('.ui-select-search.ng-touched').enter(destCol);
            element(contains('span', destCol)).click();
            // add relationship
            element(keyAddEl).click();
            element(relAddEl).click();
        },
        renameLink: function(data, index, linkName) {
            this.openRelationshipsView(data);
            blinkInput(nth('.key-value-pair:contains(Relationship Name)', index) + ' input').enter(linkName);
            element(relUpdateEl).click();
        },
        removeLink: function(data, index) {
            this.openRelationshipsView(data);
            element(nth(relDelEl, index)).click();
        }
    };
})();


describe('Relationship Scenarios--General', function() {

    var table1 = 'Relationship_Test_1',
        table2 = 'Relationship_Test_2',
        table3 = 'Relationship_Test_3';

    it('should show relationships of selected table', function () {
        relationshipFunctions.openRelationshipsView('chasm_bid_event_trades');
        expect(element('.key-value-pair').count()).toBeGreaterThan(1);
    });

    it('should be able to add relationships', function () {
        relationshipFunctions.addLink(table2, table1, 'Customer', 'CustomerName', 'test relationship 1');
        sleep(15); // wait for sage indexing
        // verify that relationship has been successfully created and we can run queries on joining tables
        answerTab().click();
        selectSageSources([table1, table2]);
        sageInputElement().enter('transactionamount customerregion');
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData('asia,110,europe,125');
    });

    it('should be able to edit existing relationship', function () {
        relationshipFunctions.renameLink(table2, 1, 'renamed relationship');
        // verify that relationship is still existing
        answerTab().click();
        selectSageSources([table1, table2]);
        sageInputElement().enter('transactionamount customerregion');
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData('asia,110,europe,125');
    });

    it('should be able to remove relationships', function () {
        relationshipFunctions.removeLink(table2, 1);
        expect(element('.key-value-pair').count()).toBe(0);

        // verify relationship is successfully deleted
        sleep(15);
        answerTab().click();
        selectSageSources([table1, table2]);
        sageInputElement().enter('transactionamount');
        sleep(1);
        expect(element('.bk-source-item.bk-disabled').count()).toBe(1);
    });

    it('should be able to add multiple relationships', function () {
        relationshipFunctions.addLink(table2, table1, 'Customer', 'CustomerName', 'test relationship 2');
        relationshipFunctions.addLink(table2, table3, 'Part', 'PartName', 'test relationship 3', true);

        sleep(15); // wait for sage indexing
        answerTab().click();
        selectSageSources([table1, table2, table3]);
        sageInputElement().enter('transactionamount customerregion container sort by transactionamount descending');
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData('asia,jar,85,europe,jar,70', 6);

        relationshipFunctions.removeLink(table2, 2);
        relationshipFunctions.removeLink(table2, 1);
    });

});


describe('Relationship Scenarios -- Advanced Data Sources', function() {

    var table1 = 'Relationship_Test_1',
        table2 = 'Relationship_Test_2',
        table3 = 'Relationship_Test_3';

    it('should allow relationships between Aggr Worksheets', function() {
        var worksheet1 = 'relationship aggr 1',
            worksheet2 = 'relationship aggr 2';

        // create aggr worksheets
        answerTab().click();
        selectSageSources([table1]);
        sageInputElement().enter('customerid customername customerregion');
        waitForTableAnswerVisualizationMode();
        saveCurrentAnswerAsWorksheet(worksheet1);

        answerTab().click();
        selectSageSources([table2]);
        sageInputElement().enter('customer part transactionamount transactiondiscount transactionvolume');
        waitForTableAnswerVisualizationMode();
        saveCurrentAnswerAsWorksheet(worksheet2);

        // create relationship
        relationshipFunctions.addLink(worksheet2, worksheet1, 'Customer', 'CustomerName', 'test aggr relationship');
        sleep(15);

        // check relationship has been successfully created
        answerTab().click();
        selectSageSources([worksheet1, worksheet2], 'Worksheet');
        sageInputElement().enter('total transactionamount customerregion');
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData('asia,110,europe,125');

        // delete worksheets
        dataTab().click();
        deleteWorksheet(worksheet1);
        deleteWorksheet(worksheet2);
    });
});
