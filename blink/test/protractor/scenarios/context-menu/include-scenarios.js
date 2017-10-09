'use strict';

var charts = require('../charts/charts');
var common = require('../common');
var answer = require('../viz-layout/answer/answer.js');
var contextMenu = require('../context-menu/context-menu-po');
var util = common.util;

describe('Include on context menu', function () {

    it('should be able to allow include on non-bucketed date column.', function () {
        var query = 'revenue commit date detailed';
        var sources = ['LINEORDER'];

        answer.doAdhocQueryline(query, sources, charts.chartTypes.COLUMN);
        expect($(contextMenu.selectors.COMMIT_DATE).isPresent()).toBe(false);
        var el = $$(charts.selectors.CHART_COLUMN).get(0);
        util.rightClickElement(el);
        common.util.waitForAndClick(contextMenu.locators.INCLUDE_SUBMENU_OPTION);
        expect($(contextMenu.selectors.COMMIT_DATE).isPresent()).toBe(true);
    });
});