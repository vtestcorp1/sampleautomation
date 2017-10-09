/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Pivot table E2E scenarios
 */
'use strict';

var pivot = require('./pivot-po');
var charts = require('../charts/charts');
var answer = require('../viz-layout/answer/answer');
var answerListPage = require('../answers/answer-list-page');
var common = require('../common');
var leftPanel = require('../sage/data-panel/data-panel');
var util = common.util;
var checkboxFilter= require('../filters/checkbox-filter');
var filterDialog = require('../filters/filter-dialog.js');

describe('Pivot grid scenarios', function() {
    it('should be able to pivot retained on sort or filter', function () {
        var query = 'max revenue color category customer address customer nation customer region brand1';
        var sources = ['PART', 'LINEORDER', 'CUSTOMER'];

        answer.doAdhocQueryPivotTable(query, sources, charts.chartTypes.PIVOT_TABLE);
        answer.openVizTypeSelectorPanel();
        answer.navigateAndWaitForChartType(charts.chartTypes.PIVOT_TABLE);
        util.waitForVisibilityOf(pivot.locators.MAP_ELEMENT);
        util.waitForAndClick(pivot.locators.FIRST_ELEMENT);
        util.waitForAndClick(pivot.locators.KEBABICON);
        util.waitForAndClick(pivot.locators.FILTER);
        util.waitForVisibilityOf(pivot.locators.FILTER_SEARCH);
        checkboxFilter.setSearchText("mfgr#11");
        checkboxFilter.toggleCheckboxState('mfgr#11');
        filterDialog.clickDone();
        expect($(pivot.selectors.Exapand).isPresent()).toBe(true);
    });

    it('Drag n drop of field from row to column should reflect in chart axis configurator', () => {
        let answerName = 'Pivot Answer';
        answer.doAdhocQuery('revenue color customer region', ['LINEORDER'], charts.vizTypes.CHART);
        answer.navigateAndWaitForChartType(charts.chartTypes.PIVOT_TABLE);
        pivot.dragRowFieldToColumnArea('Color');
        answer.openVizEditorPanel();
        charts.waitForLegendAxisColumnsToMatch(['Customer Region', 'Color']);

        answer.saveCurrentUnsavedAnswer(answerName);
        answerListPage.goToSavedAnswer(answerName);
        answer.openVizEditorPanel();
        charts.waitForLegendAxisColumnsToMatch(['Customer Region', 'Color']);
        answerListPage.deleteAnswer(answerName);
    });
});
