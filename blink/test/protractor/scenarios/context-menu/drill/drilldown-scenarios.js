/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: ashish shubham (ashish@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for chart drill down use cases.
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var drillDown = require('./drill-po');
var contextMenu = require('../context-menu-po');
var answerPage = require('../../viz-layout/answer/answer');
var answerListPage = require('../../answers/answer-list-page');
var leftPanel = require('../../sage/data-panel/data-panel');
var charts = require('../../charts/charts');
var table = require('../../table/table');
var pinboards = require('../../pinboards/pinboards');
var sage = require('../../sage/sage');
var common = require('../../common');
var util = common.util;
var formula = require('../../formula/formula.js');

describe('Chart drill cases', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
    });

    it('[SMOKE] should render drop down with at least two items in the list', function () {
        setupDrillDropdown();
        // Expect the drop down to be there
        util.waitForElement(drillDown.selectors.DROPDOWN_ITEM);
        // Expect at last two items in the drop down
        expect($$(drillDown.selectors.DROPDOWN_ITEM).count()).toBeGreaterThan(1);
    });

    it('should show filtered items when text is entered in the search', function () {
        setupDrillDropdown();
        var colName = 'Customer Region';
        drillDown.typeTextInSearch(colName);
        expect($$(drillDown.selectors.DROPDOWN_ITEM).get(0).getText()).toMatch(colName);
    });

    it('[SMOKE] should take the user to the right chart when an item is selected', function () {
        setupDrillDropdown();
        var colName = 'Customer Region';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);
        // Drill down by clicking on the first item in the drop down
        charts.waitForChartVizToLoad();
        // Expect the right question in the sage bar
        sage.sageInputElement.waitForValueToBe('revenue almond by customer region');
        // Expect the right number of charts after the drill
        answerPage.waitForAnswerName('Total Revenue by Customer Region');
    });

    it('should drill and preserve existing filters', function () {
        setupDrillDropdown('revenue color for color aquamarine azure for order date between 01/01/1992 and 01/01/1993');
        var colName = 'Customer Region';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);

        // Expect the right question in the sage bar
        var expectedQuery = 'revenue for order date between 01/01/1992 and 01/01/1993 aquamarine by customer region';
        sage.sageInputElement.waitForValueToBe(expectedQuery);
    });

    it('should be able to drill on a top query (SCAL-1775)', function () {
        setupDrillDropdown('top 10 revenue by color');
        var colName = 'Customer Region';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);
        // Expect the right question in the sage bar
        sage.sageInputElement.waitForValueToBe('revenue beige by customer region');
    });

    it('should not be able to drill on a growth query', function () {
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        sage.sageInputElement.enter('growth of revenue by order date');
        charts.waitForChartVizToLoad();
        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        var el = $$(charts.selectors.CHART_COLUMN).get(0);
        util.rightClickElement(el);

        expect(contextMenu.expectItemToBeDisabled('Drill down'));
        expect(contextMenu.expectItemToBeDisabled('Show underlying data'));
    });

    it('show underlying data should be unavailable for chasmTrap query', function () {
        answerPage.clearVizDisplayPreference();
        // Tests for both table and chart and on both question page and pinboard page.
        var query = 'bill cost sale cost bills phone id sales phone id';
        var sources = ['Phone Chasmtrap'];
        var pinboardName = 'showUnderlyingDataChasmTrap';
        answerPage.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        // check on question page for chart.
        var firstRectangle = charts.getColumnRectangles().first();
        util.rightClickElement(firstRectangle);
        expect(contextMenu.expectItemToBeDisabled('Show underlying data'));
        answerPage.addShowingVizToNewPinboard(pinboardName);

        answerPage.navigateToChartType('TABLE');
        var firstCell = table.getNthCell(0, 0);
        util.doubleClickElement(firstCell);
        util.rightClickElement(firstCell);
        // check on question page for table
        expect(contextMenu.expectItemToBeDisabled('Show underlying data'));
        answerPage.addShowingVizToPinboard(pinboardName);

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);

        // check on pinboard page for chart
        firstRectangle = charts.getColumnRectangles().first();
        util.rightClickElement(firstRectangle);
        expect(contextMenu.expectItemToBeDisabled('Show underlying data'));

        firstCell = table.getNthCell(0, 0);
        util.doubleClickElement(firstCell);
        util.rightClickElement(firstCell);
        // check on pinboard page for table
        expect(contextMenu.expectItemToBeDisabled('Show underlying data'));

        pinboards.deletePinboard(pinboardName);
    });

    it('should be able to drill on a time series', function () {
        setupDrillDropdown('revenue by order date quarterly');
        var colName = 'Customer Region';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);
        // Expect the right question in the sage bar
        sage.sageInputElement.waitForValueToBe('revenue order date between 01/01/1992 and 03/31/1992 by customer region');
    });

    it('should be able to drill on a weekly timeseries with additional date ranges', function () {
        setupDrillDropdown('revenue by order date weekly order date between 01/07/1992 and 01/31/1992');
        var colName = 'Market Segment';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);

        // Expect the right question in the sage bar
        sage.sageInputElement.waitForValueToBe('revenue order date between 01/07/1992 and 01/12/1992 by market segment');
    });

    it('[SMOKE] should be able to drill on a weekly timeseries with month year', function () {
        //Note(chab) in some rare case, market segment simply does not appear in autocompletion
        setupDrillDropdown('revenue by order date weekly for order date q1 1992');

        var colName = 'Market Segment';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);

        // we need to wait for the new chart to be present, or we will have a stale reference
        // by waiting for the old chart to disappear, and the new chart to be there
        // we are sure to have 'fresh' elements
        answerPage.waitForAnswerTitle('Total Revenue by Market Segment');
        // Expect the right question in the sage bar
        // Week 1 of 1992 started on 12/30/1991 but because of q1 1992 filter, we clip it.
        sage.sageInputElement.waitForValueToBe('revenue order date between 01/01/1992 and 01/05/1992 by market segment');
        util.waitForTextToBePresentInElement(charts.selectors.X_AXIS_TITLE, 'Market Segment');
    });

    it('should be able to drill on a weekly timeseries with date num filters', function () {
        setupDrillDropdown('revenue by order date monthly for order date sunday');

        var colName = 'Market Segment';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);

        var expectedAnswer = 'revenue for order date sunday order date between 01/01/1992 and 01/31/1992 by market segment';
        sage.sageInputElement.waitForValueToBe(expectedAnswer);
    });

    it('should be able to drill on an effective measure (base attribute)', function () {
        setupDrillDropdown('count color by customer region');

        var colName = 'Market Segment';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);

        // Expect the right question in the sage bar
        sage.sageInputElement.waitForValueToBe('count color africa by market segment');
    });

    it('should be able to drill on a saved answer: SCAL-3309', function () {
        var testBookName = '[SCAL-3309 Answer]';
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART']);
        leftPanel.clickDone();
        answerPage.createAndSaveAnswer(
            'revenue color for color almond for color antique',
            testBookName,
            false,
            charts.vizTypes.CHART
        );

        common.navigation.goToAnswerSection();
        answerListPage.goToSavedAnswer(testBookName);

        drillDown.switchToColumnAndDrillOnFirstColumn('Ship Priority');
        sage.sageInputElement.waitForValueToBe('revenue almond by ship priority');
        answerPage.saveCurrentAnswer();

        answerListPage.deleteAnswer(testBookName);
        common.navigation.goToQuestionSection();
    });

    it('should drill on a data point with {Empty} attribute value', function () {
        // First color will be made empty
        setupDrillDropdown('average revenue ship mode sort by ship mode');

        drillDown.switchToColumnAndDrillOnFirstColumn('Market Segment');

        // Expect the right question in the sage bar
        sage.sageInputElement.waitForValueToBe('average revenue {null} by market segment');
    });

    it('should drill, go back and drill again (SCAL-3134)', function () {
        var initialQuery = 'revenue for customer region asia color';
        setupDrillDropdown(initialQuery);

        var colName = 'Market Segment';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);

        var targetQuery = 'revenue for customer region asia almond by market segment';
        sage.sageInputElement.waitForValueToBe(targetQuery);

        browser.navigate().back();

        sage.sageInputElement.waitForValueToBe(initialQuery);
        answerPage.waitForVizs();

        drillDown.switchToColumnAndDrillOnFirstColumn('Category');
        var targetQuery2 = 'revenue for customer region asia almond by category';
        sage.sageInputElement.waitForValueToBe(targetQuery2);
    });

    it('should work with date num types (sunday, monday etc.)', function(){
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        sage.sageInputElement.enter("revenue sunday order date");

        sage.selectSageSuggestionItem('Order Date');
        answerPage.waitForChartToLoad();

        drillDown.switchToColumnAndDrillOnFirstColumn('Market');
        sage.sageInputElement.waitForValueToBe('revenue sunday order date between 01/01/1992 and 03/31/1992 by market segment');
    });

    it('should be able to drill down an hourly query', function() {
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'DATE']);
        leftPanel.clickDone();
        sage.sageInputElement.enter('revenue hourly');
        sage.selectSageDropdownItem('Order Date');
        answerPage.waitForAnswerToLoad();
        answerPage.selectTableType();

        expect(table.getNthCell(0, 0).getText()).toBe('01/04/1992 12 AM');

        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        drillDown.switchToColumnAndDrillOnFirstColumn('Market Segment');
        answerPage.waitForAnswerToLoad();

        var expectedQuery = 'revenue order date between 01/04/1992 and ' +
            '01/04/1992 by market segment';
        sage.sageInputElement.waitForValueToBe(expectedQuery);
    });

    it('should drill on the correct series in multi y-axis charts', function(){
        // order is important, the measures are in reverse alphabetical order
        setupDrillDropdown('tax revenue customer region');
        var colName = 'Customer Nation';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);

        sage.sageInputElement.waitForValueToBe('revenue africa by customer nation');
    });

    it('should be able to drill down on null value', function () {
        var question = 'ship mode {null} color revenue';
        var sources = ['LINEORDER', 'PART'];
        answerPage.doAdhocQuery(question, sources, charts.vizTypes.CHART);
        answerPage.waitForChartToLoad();
        var el = $$(charts.selectors.CHART_COLUMN).get(0);
        util.rightClickElement(el);
        util.waitForAndClick(charts.locators.DRILL_DOWN);
        util.waitForAndClick(drillDown.selectors.DRILL_SEARCH);
        var colName = 'Customer Region';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);
        sage.sageInputElement.waitForValueToBe('revenue lace {null} by customer region');
    });

    it('SCAL-19078 drill down should remove boolean column', function () {
        var question = 'quantity ship mode';
        var sources = ['LINEORDER'];
        var formulaText = "if ( order priority != '1-urgent' ) then true else false";
        answerPage.doAdhocQuery(question, sources, charts.vizTypes.CHART);
        answerPage.waitForChartToLoad();
        formula.createAndSaveFormulaInAnswer(formulaText, 'order_priority_not_urgent');
        answerPage.waitForAnswerWithQuery('quantity ship mode order_priority_not_urgent');
        var el = $$(charts.selectors.CHART_COLUMN).get(1);
        util.rightClickElement(el);
        util.waitForAndClick(charts.locators.DRILL_DOWN);
        util.waitForElement(drillDown.selectors.DRILL_SEARCH);
        var colName = 'Order Priority';
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);
        sage.sageInputElement.waitForValueToBe('quantity false air by order priority');
    });
});

function setupDrillDropdown(question, sources) {
    question = question || 'revenue by color';
    sources = sources || ['LINEORDER', 'PART'];
    answerPage.doAdhocQuery(question, sources, charts.vizTypes.CHART);
    answerPage.waitForChartToLoad();
    // Click the selector button.
    answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
    var el = $$(charts.selectors.CHART_COLUMN).get(0);
    util.rightClickElement(el);
    util.waitForAndClick(charts.locators.DRILL_DOWN);
    util.waitForElement(drillDown.selectors.DRILL_SEARCH);
}
