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


describe('Pivot grid scenarios', function() {
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
