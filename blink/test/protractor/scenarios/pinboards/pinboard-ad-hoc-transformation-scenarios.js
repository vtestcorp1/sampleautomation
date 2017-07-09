/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */
'use strict';

var common = require('../common');
var charts = require('../charts/charts');
var table = require('../table/table');
var contextMenu = require('../context-menu/context-menu-po');
var pinboards = require('../pinboards/pinboards');
var drillDown = require('../context-menu/drill/drill-po');
var dialog = require('../dialog');

describe('Pinboard ad-hoc transformation', function () {
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
