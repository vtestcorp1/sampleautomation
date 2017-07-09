/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving editing existing answers
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Answer Editing Scenarios', function () {

    beforeEach(function() {
        goToAnswer();
        selectSageSources(TPCH_TABLES);
    });

    it ('should open an answerbook and see same results as when searching', function() {
        var sageQuery = 'revenue color';
        var answerBookName = '[saved answerbook with chart]';

        createAndSaveAnswer(sageQuery, answerBookName);
        openSavedAnswerContaining(answerBookName);

        expect(sageBarValue()).toBe(sageQuery);
        waitForHighcharts();
        expect(element(CHART_VIZ).count()).toBe(1);
        waitForTableAnswerVisualizationMode();
        expect(element(TABLE_VIZ).count()).toBe(1);
        deleteSavedAnswer(answerBookName);
    });

    it('should be able to show phrase boxes in sage and highlight selected columns from left panel', function () {
        var answerName = '[test answer for verifying correct display of phrase boxes]';
        var sageQuery = 'growth of revenue by commit date for color red';

        sageInputElement().enter(sageQuery);
        waitForHighcharts();
        saveCurrentAnswer(answerName);
        openSavedAnswerContaining(answerName);

        expect(sagePhraseBox('growth of revenue by commit date').count()).toBe(1);
        // filter should be on left panel
        expect(element(contains(FILTER_TEXT,'Color')).count()).toBe(1);
        expect(sagePhraseBox('for color red').count()).toBe(1);
        deleteSavedAnswer(answerName);
    });

    it('should be able to edit an answer by changing sage query', function() {
        var sageQuery = 'revenue color';
        var newSageQuery = 'revenue color ship mode';
        var answerBookName = '[test answer for verifying change in sage query]';

        sageInputElement().enter(sageQuery);
        waitForHighcharts();
        saveCurrentAnswer(answerBookName);
        openSavedAnswerContaining(answerBookName);
        sageInputElement().enter(newSageQuery);

        waitForTableAnswerVisualizationMode();
        waitForHeadline('Ship Mode');

        saveCurrentAnswer();
        expectSuccessNotif('saved');

        openSavedAnswerContaining(answerBookName, 'table');
        expect(sageBarValue()).toBe(newSageQuery);
        waitForHeadline('Ship Mode');

        deleteSavedAnswer(answerBookName);
    });


    it('should be able to change answer query by removing phrase boxes from sage bar on columns', function() {
        var sageQuery = 'growth of revenue by commit date for color red';

        sageInputElement().enter(sageQuery);
        waitForHighcharts();
        removeSagePhraseBox('for color red');
        sleep(1);
        expect(sageInputElement().val()).toBe('growth of revenue by commit date');
    });

    it('should be able to change answer query by adding columns from the left bar', function() {
        var sageQuery = 'customer city customer custkey';
        var tblName = 'CUSTOMER';

        sageInputElement().enter(sageQuery);
        waitForTableAnswerVisualizationMode();
        expandListArrow(tblName);
        sageDataColumnItemMenuAddSearch('Customer Name');
        waitForTableAnswerVisualizationMode();
        expect(sageInputElement().val()).toBe('customer city customer custkey customer name');
    });

    it('should be able to change answer query by adding filters from the sage bar', function() {
        var sageQuery = 'customer city sort by customer city',
            sageFilter = ' for customer region america';
        var expectedFirstThreeRows = 'algeria 0,algeria 1,algeria 2',
            filteredFirstThreeRows = 'argentina0,argentina1,argentina2';

        sageInputElement().enter(sageQuery);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData(expectedFirstThreeRows, 3);
        sageInputElement().enter("");
        waitForElementCountToBe(TABLE_VIZ, 0);
        sleep(1);
        sageInputElement().enter(sageQuery+sageFilter);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData(filteredFirstThreeRows, 3);
    });

    it('should be able to change answer query and chart by sorting on table', function() {
        var unsortedQuery = 'revenue by customer custkey',
            sortQuery = unsortedQuery + ' sort by revenue descending';
        var expectedUnsortedResult = '16,797,025,28,17,623,486,46,5,472,640',
            expectedSortedReuslt = '21628,71,867,452,139,61,847,098,16397,58,943,530';

        checkTableResult(TPCH_TABLES, unsortedQuery, 6, expectedUnsortedResult);
        checkTableResult(TPCH_TABLES, sortQuery, 6, expectedSortedReuslt);
    });

    it('should be able to save table in new pinboard', function() {
        var pinboardName = '[qa test pinboard new]';
        var sageQuery = 'growth of revenue by commit date for color red';
        selectSageSources(TPCH_TABLES);
        sageInputElement().enter(sageQuery);
        waitForHighcharts();
        waitForTableAnswerVisualizationMode();
        addShowingVizToNewPinboard(TABLE_VIZ, false, pinboardName);
        delPinboard(pinboardName);
    });

    it('should be able do filter attributes on table', function() {
        var answerName = '[test answer for verifying table filter function 1]';
        var sageQuery = 'customer custkey customer name';
        var expectedFilteredResult = '26134,customer#000026134';

        selectSageSources(TPCH_TABLES);
        sageInputElement().enter(sageQuery);
        waitForTableAnswerVisualizationMode();
        checkBoxFilterSimple('Customer Name', '26134');
        // check if filter shows up on left panel

        verifyAnswerTableData(expectedFilteredResult);
    });
});
