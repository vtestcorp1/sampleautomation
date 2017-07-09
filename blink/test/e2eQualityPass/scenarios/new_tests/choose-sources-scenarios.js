/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around choose sources functionality
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test choosing sources: ', function() {
    beforeEach(function() {
        deselectAllTableSources();
        goToAnswer();
    });

    it('should test all selected sources', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('CUSTOMER').click();
        sageDataSourceItem('DATE').click();
        sageDataSourceItem('PART').click();
        sageDataSourceItem('SUPPLIER').click();
        sageDataSourceItem('TEST1').click();
        sageDataSourceItem('TEST2').click();
        checkTableNames(7, ['CUSTOMER', 'DATE', 'LINEORDER', 'PART', 'SUPPLIER', 'TEST1', 'TEST2']);
        sageInputElement().enter('extended price by customer city');
        waitForTableAnswerVisualizationMode();
        checkTableNames(5, ['CUSTOMER', 'DATE', 'LINEORDER', 'PART', 'SUPPLIER']);
        sageInputElement().enter('');
        waitForNotContain('.bk-viz-table');
        waitForNotContain('.bk-viz-chart');
        checkTableNames(7, ['CUSTOMER', 'DATE', 'LINEORDER', 'PART', 'SUPPLIER', 'TEST1', 'TEST2']);
    });

    it('should ignore tables without any existing schema', function() {
        selectSource('test1');
        checkTableNames(1, ['TEST1']);
    });

    it('should select sources by label', function() {
        var labelName = 'tpch_testing';
        dataTab().click();
        addLabel(labelName);

        tagTables(labelName, ['CUSTOMER', 'LINEORDER', 'SUPPLIER']);
        goToAnswer();
        selectDataset(labelName);
        checkTableNames(3, ['CUSTOMER', 'LINEORDER', 'SUPPLIER']);

        answersTab().click();
        deleteLabel(labelName);
    });
});
