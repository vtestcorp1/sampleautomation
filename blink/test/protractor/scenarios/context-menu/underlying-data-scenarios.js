/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: ashish shubham (ashish@thoughtspot.com)
 *
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var answerPage = require('../viz-layout/answer/answer');
var table = require('../table/table');
var charts = require('../charts/charts');
var contextMenu = require('./context-menu-po');
var sage = require('../sage/sage');
var leftPanel = require('../sage/data-panel/data-panel');
var formula = require('../formula/formula');
var dialog = require('../dialog');
var common = require('../common');
var button = require('../widgets/button');
var underlyingData = require('../underlying-data/underlying-data');
var util = common.util;

describe('Show underlying data cases', function() {
    var FORMULA_WORKSHEET = 'Formula Worksheet',
        SAGE_QUESTION = 'revenue color',
        ALL_COLUMNS_FORMULA_QUESTION = 'rev+tax log10(rev) by rev/tax-nan',
        DISABLED_MENU_ITEM_SELECTOR = '.bk-sub-menu-item-disabled';

    afterEach(function() {
        dialog.cleanupDialog();
    });

    it('[SMOKE][IE] should be able to view leaf level data', function(){
        answerPage.doAdhocQuery(
            'revenue by color',
            ['LINEORDER'],
            charts.vizTypes.TABLE
        );
        util.rightClickElement(table.getNthCell(0,0));

        util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
        util.waitForElement(util.joinSelectors(dialog.selectors.DIALOG, table.selectors.TABLE_ROW));
    });

    it('[SMOKE] should be able to download leaf level data', function () {
        answerPage.doAdhocQuery(
            'revenue color',
            ['LINEORDER', 'PART'],
            charts.vizTypes.TABLE
        );
        util.rightClickElement(table.getNthCell(0,0));
        util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
        common.network.interceptFormResponse();
        util.waitForAndClick(
            util.joinSelectors(dialog.selectors.DIALOG, button.selectors.SECONDARY_BUTTON)
        );
        common.network.waitForAndResetFormResponse().then(function(data) {
            expect(/almond/.test(data)).toBe(true);
        });
    });

    it('should now allow Show Underlying Data on charts if all columns are formulas', function() {
        answerPage.doAdhocQuery('tax', ['LINEORDER', 'CUSTOMER'], charts.vizTypes.TABLE);
        formula.createAndSaveFormulaInAnswer('revenue', 'rev-id-formula');
        answerPage.waitForAnswerWithQuery('tax rev-id-formula');

        formula.createAndSaveFormulaInAnswer('customer region', 'cr-id-formula');
        answerPage.waitForAnswerWithQuery('tax rev-id-formula cr-id-formula');


        answerPage.queryAndWaitForAnswer('rev-id-formula cr-id-formula');
        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        var el = $$(charts.selectors.CHART_COLUMN).get(0);
        util.rightClickElement(el);
        contextMenu.expectItemToBeDisabled('Show underlying data');
    });

    it('should not allow Show Underlying Data on tables if all columns are formulas', function() {
        answerPage.doAdhocQuery(ALL_COLUMNS_FORMULA_QUESTION, [FORMULA_WORKSHEET], charts.vizTypes.TABLE);
        util.rightClickElement(table.getNthCell(0,0));

        contextMenu.expectItemToBeDisabled('Show underlying data');
    });

    it('Should be able to copy items from show underlying data popup', function() {
        answerPage.doAdhocQuery(SAGE_QUESTION, ['LINEORDER', 'PART'], charts.vizTypes.TABLE);
        util.rightClickElement(table.getNthCell(0,0));
        util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
        util.waitForElement(util.joinSelectors(dialog.selectors.DIALOG, table.selectors.TABLE_ROW));
        var cell = table.getNthCell(0, 0, $(dialog.selectors.DIALOG));
        cell.click();
        util.rightClickElement(
            cell
        );
        util.waitForElement(contextMenu.locators.COPY);
    });

    it('should filter on all columns when showing underlying data - SCAL-7617', function(){
        answerPage.doAdhocQuery(
            'max revenue by commit date hourly',
            ['LINEORDER'],
            charts.vizTypes.TABLE
        );
        util.rightClickElement(table.getNthCell(0,0));

        util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
        util.waitForElement(util.joinSelectors(dialog.selectors.DIALOG, table.selectors.TABLE_ROW));
        util.waitForElementCountToBe(table.selectors.LEAF_LEVEL_DATA_ROW_SELECTOR, 1);
    });

    it('should show column name and value correctly', function() {
        answerPage.doAdhocQuery(
            'revenue by color',
            ['LINEORDER'],
            charts.vizTypes.TABLE
        );
        util.rightClickElement(table.getNthCell(0,0));
        util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
        underlyingData.waitForSummaryColumns(2);
        underlyingData.verifySummaryColumnName(0, 'Color:');
        underlyingData.verifySummaryColumnName(1, 'Total Revenue:');
    });
});
