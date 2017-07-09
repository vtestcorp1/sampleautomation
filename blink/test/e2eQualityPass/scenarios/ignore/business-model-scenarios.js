/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview e2e scenarios around business data models
 * the file covers most modeling functionalities, including
 *   changing column name
 *   add column description
 *   change measure type to attribute
 *   change aggregation type
 *   change number/date format
 *   hide column
 *   synonyms
 * the tests are currently disabled. For some reason, after running each test, we need a page reload to access the dataTab
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var MODEL_TEST_FILE = 'Model_File_Experiment';

describe('Data Model Scenarios', function() {

    function exploreTable(tblName) { // open explore data view from table sources
        answerTab().click();
        waitForElement('.bk-sources-container .bk-btn:contains(Choose sources)', 'waiting for choose sources btn');
        chooseSourcesBtn().click();
        element(EXPLORE_ALL_DATA).click();
        blinkInput('.bk-explorer-table-search').enter(tblName);
        sleep(1);
    }


    it('should change column name to Foo', function() {
        var colName = 'ChangeNameToNewName';

        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter(colName);
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: colName
            }
        ]);

        // change column name
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.setModelColumnName(colName, 'Foo');
        // verify change of column name
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter('Foo');
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: 'Foo'
            }
        ]);
    });

    it('should be able to add description to column', function() {
        var colName = 'HiddenColumn';
        var description = 'this is a hidden column';

        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.addDescription(colName, description);

        // verify description has been correctly added to the table sources
        exploreTable(MODEL_TEST_FILE);
        var cell = contains('.ui-widget-content', colName) + ' .r1';
        expect(element(cell).text()).toBe(description);
    });

    it('should be able to change column type from measure to attribute', function() {
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter('attributetype');
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '125K',
                hc: 'Total AttributeType'
            }
        ]);

        // change column type to attribute
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.setColumnType('AttributeType', 'ATTRIBUTE');
        // table query should now reflect the fact that column is of type attribute
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter('attributetype');
        waitForTableAnswerVisualizationMode();
        // verify table result reflects the fact that column is still additive
        verifyAnswerTableData('-20,000', 1);
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: 'AttributeType'
            }
        ]);
    });

    it('should change aggregation type to average', function() {
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter('AggAvg');
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '1.8K',
                hc: 'Total AggAvg'
            }
        ]);

        // change aggregation type to average
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.setAggregation('AggAvg', 'AVERAGE');
        // verify change of column name
        answerTab();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter('AggAvg');
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '300',
                hc: 'Avg AggAvg'
            }
        ]);
    });

    it('should be able to hide a column', function() {
        var column = 'HiddenColumn';
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        expandListArrow(MODEL_TEST_FILE);
        expect(element(contains('.bk-column-name', column)).count()).toBe(1);
        sageInputElement().enter(column);
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: 'HiddenColumn'
            }
        ]);

        // change column type to hidden
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.flipHidden(column);
        // verify column is hidden from left panel
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        expandListArrow(MODEL_TEST_FILE);
        expect(element(contains('.bk-column-name', column)).count()).toBe(0);
    });

    it('should be able to change integer column to non additive', function() {
        var column = 'AggNone';
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter(column);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData('70', 1);
        checkSimpleHeadlines([
            {
                hv: '70',
                hc: 'Total AggNone'
            }
        ]);

        // change column to be non additive
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.flipAdditive(column);
        // verify that table result reflects the fact that column is non additive

    });

    it('should be able to set format for date columns', function() {
        var column = 'DateCol';
        var query = 'datecol detailed';
        var result1 = '10/10/2000';
        var format = 'MM/YYYY'; // new format
        var result2 = '10/2000';

        // original date format should be in the mm/dd/yyyy format
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData(result1, 1);
        checkSimpleHeadlines([
            {
                hv: '10/10/2000-10/10/2004',
                hc: 'DateCol'
            }
        ]);
        // change date format to mm/yyyy
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.changeFormat(column, format);

        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData(result2, 1);
        checkSimpleHeadlines([
            {
                hv: '10/2000-10/2004',
                hc: 'DateCol'
            }
        ]);
    });

    it('should be able to set format for integer columns', function() {
        var column = 'AddStd';
        var query = 'addstd';
        var result1 = '1,500';
        var format = '####'; // new format, we omit thousand separators
        var result2 = '1500';

        // original number format should be in the #,### format
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData(result1, 1);
        checkSimpleHeadlines([
            {
                hv: '1.5K',
                hc: 'Total AddStd'
            }
        ]);
        // change number format to #,###
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.changeFormat(column, format);

        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData(result2, 1);
        checkSimpleHeadlines([
            {
                hv: '1.5K',
                hc: 'Total AddStd'
            }
        ]);
    });

    it('should be able to assign synonyms to columns', function() {
        var column = 'PriorityLowest';
        var synonyms = 'Inferior, Lack';
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter(column);
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: column
            }
        ]);

        // add two synonyms to column
        dataTab().click();
        searchByName(MODEL_TEST_FILE);
        metadataListContaining(MODEL_TEST_FILE).click();
        businessModelFunctions.addSynonyms(column, synonyms);
        // synonym headline should still match original column name
        answerTab().click();
        selectSageSources(MODEL_TEST_FILE);
        sageInputElement().enter('Inferior');
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: column
            }
        ]);
        sageInputElement().enter('Lack');
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: column
            }
        ]);
        sageInputElement().enter(column);
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '6',
                hc: column
            }
        ]);
    });
});
