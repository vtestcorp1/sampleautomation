/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */
'use strict';

var common = require('../common');
var charts = require('../charts/charts');
var table = require('../table/table.js');
var contextMenu = require('../context-menu/context-menu-po');
var pinboards = require('../pinboards/pinboards');
var drillDown = require('../context-menu/drill/drill-po');
var nav = common.navigation;
var dataPanel = require('../sage/data-panel/data-panel');
var answerPage = require('../viz-layout/answer/answer');
var datePicker = require('../libs/date-picker');
var headLine=require('../viz-layout/headline/headline.js');
var rangeFilter = require('../filters/range-filter');
var filterDialog = require('../filters/filter-dialog');
var answer = require('../viz-layout/answer/answer.js');
var rangefilters = require('../filters/range-filter.js');
var dialog = require('../dialog');
var underlyingData = require('../underlying-data/underlying-data');
var util = common.util;


describe('Pinboard ad-hoc transformation', function () {

    it('should be able to Drill down multi-level from the context menu', function () {
        var drillPinboradName = 'vtest_C2062';

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(drillPinboradName);
        expect(charts.getXAxisTitle()).toContain('Quarterly (Commit Date)');
        expect(charts.getYAxisTitle).toContain('Total Revenue');
        drilltoType();
        expect(charts.getXAxisTitle()).toContain('Type');
        expect(charts.getYAxisTitle).toContain('Total Revenue');
        common.util.waitForAndClick(pinboards.selectors.RESET_TRANSFORMS);
        expect(charts.getXAxisTitle()).toContain('Quarterly (Commit Date)');
        expect(charts.getYAxisTitle).toContain('Total Revenue');
    });

    it('should be able to add column in show underlying data', function () {
        var drillPinboradName = 'vtest_C2062';
        var colName = 'Tax';

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(drillPinboradName);
        var el = $$(charts.selectors.CHART_COLUMN).get(0);
        util.rightClickElement(el);
        common.util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
        common.util.waitForElement(table.selectors.LEAF_LEVEL_DATA_CONTAINER);
        table.addColumn(colName);
        underlyingData.waitForUnderlyingDataColumns(3);
        underlyingData.verifyUnderlyingDataColumnName(2, 'Tax');
    });

    it('should be able to apply date filters via column label menu on x-axis', function () {
        var pinboardName = 'vtest_Sample_Date_Pin';
        var query = 'commit date daily discount';
        var sources = ['LINEORDER'];
        var description = 'Description text';

        answer.doAdhocQueryline(query, sources, charts.chartTypes.LINE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        charts.clickonXAxix();
        charts.columnMenuChooseFilter();
        rangefilters.setFirstOperandValue('01/01/1995');
        rangefilters.setSecondOperandValue('12/1/1995');
        filterDialog.clickDone();
        expect(charts.getXAxisTitleDetail()).toContain('for 1995');
        util.waitForAndClick(pinboards.locators.REVERT_BTN);
        expect(charts.getXAxisTitle()).not.toContain('for 1995');
        pinboards.deletePinboard(pinboardName);
    });

    it('should be able to show underlying data for ad hoc transformed visualizations', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Basic Pinboard 1');

        var vizElem = pinboards.getVizElementByName('Visualization 1');
        common.util.scrollElementIntoViewPort(vizElem);
        charts.waitForChartVizToLoad();
        var firstColumnElem = charts.getColumnRectangles(vizElem).get(0);
        common.util.rightClickElement(firstColumnElem);
        common.util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
        common.util.waitForElement(table.selectors.LEAF_LEVEL_DATA_CONTAINER);
        dialog.closeDialog();
    });

    it('[SMOKE][IE] should be able to do a reset transformation', function() {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Basic Pinboard 1');

        var vizElem = pinboards.getVizElementByName('Visualization 1');
        common.util.scrollElementIntoViewPort(vizElem);
        charts.waitForChartVizToLoad();

        charts.columnLabelMenu.openForYAxis();
        charts.columnLabelMenu.clickSort();
        common.util.waitForElement(pinboards.selectors.RESET_TRANSFORMS);

        common.util.waitForAndClick(pinboards.selectors.RESET_TRANSFORMS);
        charts.waitForColumnCountToBe(null, 92);
    });

    it('should be able to resolve join paths during drilldown' , function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Basic Pinboard 1');

        var vizElem = pinboards.getVizElementByName('Visualization 1');
        common.util.scrollElementIntoViewPort(vizElem);
        charts.waitForChartVizToLoad();
        var firstColumnElem = charts.getColumnRectangles(vizElem).get(0);
        common.util.rightClickElement(firstColumnElem);
        common.util.waitForAndClick(contextMenu.locators.DRILL_DOWN);
        drillDown.typeTextInSearch('Datekey');
        common.util.waitForInvisibilityOf(drillDown.selectors.NO_MATCHES_ITEM);
        common.util.waitForAndClick(by.cssContainingText(drillDown.selectors.DROPDOWN_ITEM, 'Datekey'));
        pinboards.chooseJoinPathMapping('Commit date');
        common.util.waitForElement(pinboards.selectors.RESET_TRANSFORMS);
    });
});

function drilltoType() {
    var el = $$(charts.selectors.CHART_COLUMN).get(0);
    util.rightClickElement(el);
    util.waitForAndClick(charts.locators.DRILL_DOWN);
    util.waitForElement(drillDown.selectors.DRILL_SEARCH);
    var colName = 'Type';
    drillDown.typeTextInSearch(colName);
    drillDown.selectDrillItem(colName);
}