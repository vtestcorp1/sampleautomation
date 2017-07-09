/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shikar Agrawal(shikar.agrawall@thoughtspot.com)
 * Francois Chabbey(francois.chabey@thoughtspot.com)
 * @fileoverview E2E scenarios involving sage.
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var sage = require('./sage.js');
var admin = require('../admin-ui/admin-ui');
var headline = require('../viz-layout/headline/headline');
var common = require('../common.js');
var nav = common.navigation;
var util = common.util;
var answer = require('../viz-layout/answer/answer.js');
var leftPanel = require('./data-panel/data-panel.js');
var answerListPage = require('../answers/answer-list-page');

describe('Sage data columns', function () {

    beforeAll(function () {
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    beforeEach(function(){
        nav.goToQuestionSection();
    });

    afterEach(function () {
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    var sources = ['Chasmtrap', 'CUSTOMER', 'DATE', 'LINEORDER'];

    it('should show no columns when no source is selected', function () {
        util.waitForElementCountToBe(leftPanel.selectors.DATA_SOURCE_ITEM_NAME, 0);
    });

    it('should show columns when a source is selected', function () {
        leftPanel.openAndChooseSources(['CUSTOMER']);
        util.waitForElementCountToBe(leftPanel.selectors.DATA_SOURCE_ITEM_NAME, 1);
    });

    it('should disable non-accessible sources when a column is added from left panel', function () {
        leftPanel.openAndChooseSources(sources);
        var colName1 = 'Tax';
        //leftPanel.
        leftPanel.expandSource('LINEORDER');
        leftPanel.addColumn(colName1);
        // headline should appears
        headline.waitForHeadline(colName1);
        leftPanel.waitForEnabledSource(sources[3]);
        leftPanel.waitForEnabledSource(sources[1]);
        leftPanel.waitForDisabledSource(sources[0]);

        // NOTE: On refresh we want to still show correct accessible table.
        browser.refresh();
        headline.waitForHeadline(colName1);
        leftPanel.waitForEnabledSource(sources[3]);
        leftPanel.waitForEnabledSource(sources[1]);
        leftPanel.waitForDisabledSource(sources[0]);
    });

    it('should mark unjoinable data sources as disabled in left panel', function() {
        leftPanel.openAndChooseSources(['CUSTOMER', 'Phone Bills']);
        leftPanel.clickDone();
        sage.sageInputElement.enter('customer region');
        answer.waitForAnswerToLoad('customer region');
        leftPanel.waitForDisabledSource('Phone Bill');
        sage.sageInputElement.enter('');
        // Should re-enable on clearing up query
        leftPanel.waitForEnabledSource('Phone Bill');
        sage.sageInputElement.enter('customer address');
        answer.waitForAnswerToLoad('customer address');
        // On re-adding the token, should re-disable.
        leftPanel.waitForDisabledSource('Phone Bill');
    });

    it('should not show inaccessible sources in left panel when loading saved answer', function () {
        leftPanel.openAndChooseSources();
        leftPanel.selectAllTables();
        sage.sageInputElement.enter('revenue color');
        answer.waitForAnswerToLoad();

        var testBookName = '[SCAL-4844]';
        answer.saveCurrentAnswer(testBookName);

        answerListPage.goToSavedAnswer(testBookName);

        leftPanel.waitForEnabledSource('LINEORDER');
        util.waitForInvisibilityOf(leftPanel.enabledSource('TEST1'));
        // Delete the saved answer.
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(testBookName);
    });

    it('[SMOKE][IE] should make sage queries when columns are added from left panel', function () {
        leftPanel.openAndChooseSources(['CUSTOMER']);
        leftPanel.expandSource('CUSTOMER');
        var colName1 = 'Customer Address';
        leftPanel.addColumn(colName1);
        // headline should come
        headline.waitForHeadline('Customer Address');
        // Make the sage input blank so that we can clear the sage sources.
        sage.sageInputElement.enter('');
    });

    it('[SCAL-14825] Should not error on sample values for tables with No data', function () {
        leftPanel.openAndChooseSources(['TEST4']);
        leftPanel.expandSource('TEST4');
        leftPanel.expectColumnsListElementsCountToBe('TEST4', 2);
        leftPanel.expectColumnSampleValuesTooltipToContainValue('T4_ID', 'NAME');
        leftPanel.addColumn('T4_ID');
        headline.waitForHeadline('T4_ID');
    });

    it('Should show correct sample data for tables with hidden columns', function () {
        leftPanel.openAndChooseSources(['TEST1']);
        leftPanel.expandSource('TEST1');
        leftPanel.expectColumnsListElementsCountToBe('TEST1',1);
        leftPanel.expectColumnSampleValuesTooltipToContainValue('T1_NAME', 'redwood city');
    });

    it('should collapse non-accessible data source',function() {
        leftPanel.openAndChooseSources(sources);
        var colName1 = 'Tax';
        leftPanel.expandSource('Chasmtrap');
        leftPanel.expandSource('LINEORDER');
        leftPanel.addColumn(colName1);
        leftPanel.expandSource('DATE');
        leftPanel.expandSource('CUSTOMER');
        headline.waitForHeadline(colName1);
        // Protractor does not handle that ?
        leftPanel.expectColumnsListElementsCountToBe('CUSTOMER',8);
        leftPanel.expectColumnsListElementsCountToBe('DATE',17);
        leftPanel.expectColumnsListElementsCountToBe('Chasmtrap',8);
        // but these columns must be hidden
        leftPanel.waitForDisabledSource('Chasmtrap');
    });


    //  SCAL-10860
    it('panel should not scroll to top after selecting a column',function() {
        leftPanel.openAndChooseSources(sources);
        leftPanel.expandSource('LINEORDER');
        leftPanel.expandSource('CUSTOMER');
        leftPanel.expandSource('DATE');
        leftPanel.expandSource('Chasmtrap');
        util.scrollElementToBottom($(leftPanel.selectors.DATA_SOURCE_CONTAINER));
        var colName1 = 'Tax';
        leftPanel.addColumn(colName1);
        headline.waitForHeadline(colName1);
        // the panel should have not scrollen
        util.checkElementHasNotScrollToTop(leftPanel.selectors.DATA_SOURCE_CONTAINER);
    });
    // (Ashish): The feature is disabled as of 11/18/2015.
    /*xit('should show columns grouped by source table/formula for worksheets with more than one source table', function () {
        var defaultGroupingThreshold = -1;
        getAngularInjectableComponent('blinkConstants', function(blinkConstants){
            defaultGroupingThreshold = blinkConstants.LEFT_PANEL_GROUPING_THRESHOLD;
            blinkConstants.LEFT_PANEL_GROUPING_THRESHOLD = 10;
        });

        selectAllWorksheetSources();
        sageDataPanelFunctions.openSource('Formula Worksheet');

        // restore the value
        getAngularInjectableComponent('blinkConstants', function(blinkConstants){
            blinkConstants.LEFT_PANEL_GROUPING_THRESHOLD = defaultGroupingThreshold;
        });

        expect(element(sageDataColumnSourceTableItemSelector()).count()).toBe(4);
        expect(element(sageDataColumnSourceTableItemSelector('Formulas')).count()).toBe(1);
    });*/


    describe('Checkmark scenarios', function () {
        beforeEach(function () {
            leftPanel.selectAllTables();
        });

        it('should show check mark for measure with default aggregation', function () {
            answer.queryAndWaitForAnswer('sum revenue');
            leftPanel.expandSource('LINEORDER');
            leftPanel.ensureCheckMark('Revenue');
        });


        it('[SMOKE] should show checkmark for measure and attribute', function () {
            answer.queryAndWaitForAnswer('sum revenue');
            leftPanel.expandSource('LINEORDER');
            leftPanel.expandSource('PART');
            leftPanel.ensureCheckMark('Revenue');
            leftPanel.ensureCheckMark('Color');
        });
        it('should show correct tokens on back button', function () {
            answer.queryAndWaitForAnswer('revenue color');
            leftPanel.expandSource('LINEORDER');
            leftPanel.expandSource('PART');
            leftPanel.ensureCheckMark('Revenue');
            leftPanel.ensureCheckMark('Color');

            leftPanel.removeColumn('Color');
            answer.waitForAnswerToLoad('revenue');
            leftPanel.ensureCheckMark('Revenue');
            leftPanel.ensureNoCheckMark('Color');

            nav.goBackInHistory();
            answer.waitForAnswerToLoad('revenue color');
            leftPanel.ensureCheckMark('Revenue');
            leftPanel.ensureCheckMark('Color');
        });
        it('should clear check marks on clearing answer', function () {
            answer.queryAndWaitForAnswer('revenue');
            leftPanel.expandSource('LINEORDER');
            leftPanel.ensureCheckMark('Revenue');
            sage.sageInputElement.enter('');
            leftPanel.ensureNoCheckMark('Revenue');
        });
    });
});
