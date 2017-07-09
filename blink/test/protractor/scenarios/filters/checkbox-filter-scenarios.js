/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */
'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answer = require('../viz-layout/answer/answer');
var charts = require('../charts/charts');
var checkboxFilters = require('./checkbox-filter');
var dialog = require('../dialog');
var filterPanel = require('./filter-panel');
var filterDialog = require('./filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel.js');
var sage = require('../sage/sage.js');
var smartCheckboxCollection = require('../widgets/smart-checkbox-collection');
var table = require('../table/table');
var common = require('../common');
var bootstrapLib = require('../libs/bootstrap-lib');
var tooltip = bootstrapLib.tooltip;

describe('Checkbox filter scenarios', function () {
    // Client state of the panel is persisted by Callosum, so we make sure
    // that no sources are left selected before and after the test
    beforeEach(function(){
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    afterEach(function() {
        leftPanel.deselectAllSources();
    });

    it('[SMOKE] should be able to select all filter values', function () {
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        sage.sageInputElement.enter('revenue color color = red');
        answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        charts.waitForColumnCountToBe(null, 1);
        filterPanel.clickFilterItem('Color');
        smartCheckboxCollection.selectAll();
        filterDialog.clickDone();
        charts.waitForColumnCountToBe(null, 92);
    });

    it('should verify that query filter is shown in the ui', function () {
        answer.doAdhocQuery('revenue for color red', ['LINEORDER'], charts.vizTypes.TABLE);

        // expand the panel
        filterPanel.clickFilterItem('Color');

        checkboxFilters.waitForFilterCheckedItem(1);
        checkboxFilters.verifyCheckedState('red', true);
        filterDialog.clickCancel();
    });

    it('should change answer when another value is added', function () {
        answer.doAdhocQuery('revenue color for color red', ['LINEORDER'], charts.vizTypes.CHART);

        filterPanel.clickFilterItem('Color');

        checkboxFilters.verifyCheckedState('almond', false);
        checkboxFilters.toggleCheckboxState('almond');
        checkboxFilters.verifyCheckedState('almond', true);

        filterDialog.clickDone();

        sage.sageInputElement.waitForValueToBe('revenue color for color red almond');
        answer.waitForAnswerToLoad();

        expect(charts.getColumnRectangles().count()).toBe(2);
        answer.selectTableType();
        // Verify that there are 2 rows in the table (one for 'red' and another for 'almond').
        table.waitForTableRowCountToBe(null, 2);
    });

    it('should change answer when a value is unchecked', function () {
        answer.doAdhocQuery('revenue color for color red', ['LINEORDER'], charts.vizTypes.CHART);

        filterPanel.clickFilterItem('Color');

        checkboxFilters.toggleCheckboxState('red');
        checkboxFilters.verifyCheckedState('red', false);

        filterDialog.clickDone();

        sage.sageInputElement.waitForValueToBe('revenue color');
        expect(charts.getColumnRectangles().count()).toBeGreaterThan(1);
        answer.selectTableType();
        // Unchecking all filter values is the same as 'revenue by color'.
        expect($$(table.selectors.TABLE_ROW).count()).toBeGreaterThan(1);
    });

    it('should show for multiple columns', function () {
        answer.doAdhocQuery('revenue color for color red for customer region europe',
            ['LINEORDER', 'CUSTOMER'],
            charts.vizTypes.TABLE);

        filterPanel.clickFilterItem('Color');
        checkboxFilters.verifyCheckedState('red', true);
        filterDialog.clickCancel();

        filterPanel.clickFilterItem('Customer Region');
        checkboxFilters.verifyCheckedState('europe', true);
        filterDialog.clickCancel();
    });

    it('[SMOKE][IE] should search filter with more than 100 entries', function () {
        // We filter the data on a column that has a large number of options.
        answer.doAdhocQuery('revenue for customer custkey 22978',
            ['LINEORDER', 'CUSTOMER'],
            charts.vizTypes.TABLE);

        filterPanel.clickFilterItem('Customer CustKey');

        checkboxFilters.verifyCheckedState('22978', true);

        checkboxFilters.setSearchText('2297');

        checkboxFilters.verifyCheckedState('22978', true);
        filterDialog.clickCancel();
    });

    it('[SMOKE] should apply result of cascading filters on the filter panel itself', function () {
        answer.doAdhocQuery('revenue for customer city united st0',
            ['LINEORDER', 'CUSTOMER'],
            charts.vizTypes.TABLE);

        filterPanel.clickFilterItem('Customer City');

        checkboxFilters.verifyRefineUnselectedItemsMessage(true);

        sage.sageInputElement.enter('revenue for customer city united st0 for customer nation india');
        answer.waitForVizs();
        answer.selectTableType();

        filterPanel.clickFilterItem('Customer City');
        checkboxFilters.verifyFilterItemsCount(11);
        checkboxFilters.verifySelectedFilterItemsCount(1);
        checkboxFilters.verifyUnselectedFilterItemsCount(10);
        filterDialog.clickCancel();

        filterPanel.clickFilterItem('Customer Nation');
        checkboxFilters.verifyFilterItemsCount(2);
        checkboxFilters.verifySelectedFilterItemsCount(1);
        checkboxFilters.verifyUnselectedFilterItemsCount(1);
        filterDialog.clickCancel();
    });

    it('Should change filter when changed from filter panel', function () {
        // We filter the data on a column that has a large number of options.
        answer.doAdhocQuery('revenue for color red',
            ['LINEORDER', 'CUSTOMER'],
            charts.vizTypes.TABLE);

        filterPanel.clickFilterItem('Color');

        checkboxFilters.setSearchText('blue');
        checkboxFilters.toggleCheckboxState('blue');

        checkboxFilters.setSearchText('red');
        checkboxFilters.toggleCheckboxState('red');

        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue for color blue');
    });

    it('should query for a filter first and then add measure (SCAL-1805)', function () {
        answer.doAdhocQuery('air ',
            ['LINEORDER'],
            charts.vizTypes.TABLE);

        filterPanel.clickFilterItem('Ship Mode');
        checkboxFilters.toggleCheckboxState('fob');

        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('air fob');

        sage.sageInputElement.enter('air fob ship mode revenue');
        answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
    });

    it('should not show a filter ui for contains query', function () {
        answer.doAdhocQuery('revenue color contains \'r\'',
            ['LINEORDER'],
            charts.vizTypes.TABLE);
        filterPanel.clickFilterItem('Color');
        filterPanel.waitForUnsupportedFilterPlaceHolder();
        filterDialog.clickCancel();
    });

    it('should not show a filter ui for compound filter', function () {
        answer.doAdhocQuery('revenue color = red color contains \'r\'',
            ['LINEORDER'],
            charts.vizTypes.TABLE);
        filterPanel.clickFilterItem('Color');
        filterPanel.waitForUnsupportedFilterPlaceHolder();
        filterDialog.clickCancel();
    });

    it('should restore the valid sage query on applying filter from previous answer - SCAL-2683', function () {
        answer.doAdhocQuery('customer region for customer region asia revenue',
            ['CUSTOMER'],
            charts.vizTypes.TABLE);

        filterPanel.clickFilterItem('Customer Region');
        checkboxFilters.toggleCheckboxState('africa');
        filterDialog.clickDone();

        sage.sageInputElement.waitForValueToBe('customer region for customer region asia africa revenue');
    });

    it('[SMOKE] should preserve the filter phrase token on a saved answer (SCAL-3135)', function () {
        var testBookName = '[SCAL-3135 Answer]';
        leftPanel.openAndChooseSources(['LINEORDER']);
        answer.createAndSaveAnswer('revenue color for color red',
            testBookName,
            false,
            charts.vizTypes.TABLE);

        common.navigation.goToAnswerSection();
        answerListPage.goToSavedAnswer(testBookName);

        filterPanel.clickFilterItem('Color');
        checkboxFilters.toggleCheckboxState('almond');
        filterDialog.clickDone();

        sage.sageInputElement.waitForValueToBe('revenue color for color red almond');
        table.waitForTableRowCountToBe(null, 2);

        answer.saveCurrentAnswer();
        common.navigation.goToAnswerSection();
        answerListPage.goToSavedAnswer(testBookName);
        sage.sageInputElement.waitForValueToBe('revenue color for color red almond');

        common.navigation.goToAnswerSection();
        answerListPage.deleteAnswer(testBookName);
        answerListPage.goToAnswer();
    });

    it('SCAL-17880 should lower case values', function () {
        answer.doAdhocQuery(
            'revenue color color = red',
            ['LINEORDER'],
            charts.vizTypes.TABLE
        );
        filterPanel.clickFilterItem('Color');
        checkboxFilters.setSearchText('REd');
        checkboxFilters.verifyFilterItemsCount(1);
        filterDialog.clickCancel();
    });

    it('SCAL-20297 should show checkbox title tooltip value without html tags', function () {
        answer.doAdhocQuery(
            'revenue color color = red',
            ['LINEORDER'],
            charts.vizTypes.TABLE
        );
        filterPanel.clickFilterItem('Color');
        checkboxFilters.setSearchText('red');
        checkboxFilters.hoverOnDataCheckboxTitle('red');
        tooltip.waitForToolTipContainingText('red');
        filterDialog.clickCancel();
    });
});
