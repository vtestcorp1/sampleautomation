/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answerPage = require('../viz-layout/answer/answer.js');
var charts = require('./charts.js');
var common = require('../common.js');
var dialog = require('../dialog.js');
var leftPanel = require('../sage/data-panel/data-panel.js');

describe('Chart Editing', function() {

    beforeAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        answerListPage.goToAnswer();
        answerPage.clearVizDisplayPreference();
    });

    afterAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    it('SCAL-12259 should allow non additive numeric vs attribute', function() {
        answerPage.queryAndWaitForTable('customer custkey customer region');
        answerPage.selectDefaultChartType();
        expect(charts.getXAxisTitle()).toBe('Customer Region');
        expect(charts.getYAxisTitle()).toBe('Customer CustKey');
    });

    it('should show error on invalid axes permutation or combination', function() {
        answerPage.queryAndWaitForTable('revenue color customer region customer nation');
        answerPage.navigateAndWaitForChartType('COLUMN');
        answerPage.openVizEditorPanel();
        charts.addXAxisColumn('Total Revenue');
        charts.waitForAxisConfigValidationError('Total Revenue is already in use.');
    });

    it('should allow recovery from an error state', function(){
        answerPage.queryAndWaitForChart('revenue color');
        answerPage.openVizEditorPanel();
        //select "total revenue" on x
        charts.addXAxisColumn('Total Revenue');
        //remove "total revenue" from x
        charts.removeXAxisColumn('Total Revenue');

        charts.waitForXAxisValidationToPass();
        charts.waitForYAxisValidationToPass();

        charts.waitForXAxisColumnsToMatch(['Color']);
        charts.waitForYAxisColumnsToMatch(['Total Revenue']);
    });

    it('[SMOKE][IE] should allow selecting multiple columns', function() {
        answerPage.queryAndWaitForTable(
            'revenue color customer region customer nation order total price'
        );
        answerPage.navigateAndWaitForChartType('SCATTER');
        //select "customer region, customer nation" on x
        answerPage.openVizEditorPanel();
        charts.chartEditor.waitForChartAxisPanel();
        charts.removeXAxisColumn('Total Revenue');
        charts.addXAxisColumn('Customer Region');
        charts.addXAxisColumn('Customer Nation');
        charts.removeLegendColumn('Customer Region');
        common.util.waitForElementCountToBe(charts.selectors.X_AXIS_TITLE, 2);


        answerPage.openVizEditorPanel();
        charts.chartEditor.waitForChartAxisPanel();
        charts.addYAxisColumn('Total Revenue');
        common.util.waitForElementCountToBe(charts.selectors.Y_AXIS_TITLE, 2);

        //free up 2 attributes for legend
        answerPage.openVizEditorPanel();
        charts.chartEditor.waitForChartAxisPanel();
        charts.removeXAxisColumn('Customer Nation');
        charts.addLegendColumn('Color');
        charts.addLegendColumn('Customer Nation');
        //need to remove multiple y-axis columns to enable legend
        charts.removeYAxisColumn('Total Revenue');
        common.util.waitForElementCountToBe(charts.selectors.X_AXIS_TITLE, 1);
        common.util.waitForElementCountToBe(charts.selectors.Y_AXIS_TITLE, 1);
        expect(charts.getXAxisTitle()).toBe('Customer Region');
        expect(charts.getYAxisTitle()).toBe('Total Order Total Price');
    });

    it('should allow ordered selection of columns', function() {
        answerPage.queryAndWaitForChart('revenue color customer region');
        answerPage.navigateAndWaitForChartType('COLUMN');
        answerPage.openVizEditorPanel();
        //select "customer region, customer nation" on x
        charts.removeLegendColumn('Customer Region');
        charts.addXAxisColumn('Customer Region');
        expect(charts.getXAxisLabels().first().getText()).toBe('almond, africa');

        answerPage.openVizEditorPanel();
        charts.removeXAxisColumn('Color');
        charts.addXAxisColumn('Color');
        expect(charts.getXAxisLabels().first().getText()).toBe('africa, almond');
    });

    it('should always show legend selector', function() {
        answerPage.queryAndWaitForChart('quantity color');
        answerPage.openVizEditorPanel();
        charts.waitForLegendSelectorToShow();

        answerPage.queryAndWaitForChart('quantity color customer region');
        answerPage.openVizEditorPanel();
        charts.waitForLegendSelectorToShow();

        answerPage.queryAndWaitForChart('quantity customer nation');
        answerPage.openVizEditorPanel();
        charts.waitForLegendSelectorToShow();
    });

    it('should update axis configuration on chart type change', function() {
        answerPage.queryAndWaitForChart('quantity customer region market segment');
        answerPage.openVizEditorPanel();
        charts.waitForXAxisColumnsToMatch(['Market Segment']);
        charts.waitForYAxisColumnsToMatch(['Total Quantity']);
        charts.waitForLegendAxisColumnsToMatch(['Customer Region']);

        answerPage.openVizTypeSelectorPanel();
        expect(answerPage.isChartTypeOptionEnabled('PIE')).toBe(true);
        answerPage.navigateAndWaitForChartType('PIE');

        answerPage.openVizEditorPanel();
        charts.waitForXAxisColumnsToMatch(['Customer Region']);
        charts.waitForYAxisColumnsToMatch(['Total Quantity']);
        charts.waitForLegendAxisColumnsToMatch([]);
    });

    it('[SMOKE][IE] should persist chart changes in saved answers', function(){
        var savedAnswerBookName = "Chart State Persistence Test Answer";

        answerPage.queryAndWaitForChart('revenue customer region customer nation');

        answerPage.saveCurrentUnsavedAnswer(savedAnswerBookName);
        answerListPage.goToSavedAnswer(savedAnswerBookName);
        answerPage.openVizEditorPanel();
        charts.waitForLegendAxisColumnsToMatch(['Customer Region']);

        //persist change in the legend series-visibility state
        var legendItemName = 'africa';
        charts.waitForLegendItemSelected(legendItemName);
        charts.toggleChartLegendItem(legendItemName);
        charts.waitForLegendItemDeselected(legendItemName);
        answerPage.saveCurrentAnswer();
        answerListPage.goToSavedAnswer(savedAnswerBookName);
        charts.waitForLegendItemDeselected(legendItemName);
        answerListPage.deleteAnswer(savedAnswerBookName);
    });

    // TODO(Jasmeet): Add test to validate axis values are decided based on values of all the linked columns.
    it('should allow linking/unlinking multiple y-axes', function () {

        answerPage.queryAndWaitForChart('discount revenue color');
        answerPage.navigateAndWaitForChartType('COLUMN');
        //2 y axes
        expect(charts.getAxesCount()).toBe(3);

        answerPage.openVizEditorPanel();
        charts.toggleShareYAxis();

        //max of both y-axes is 350M
        expect(charts.getFirstYAxisLabels().last().getText()).toBe('350M');
        //both y-axes merged
        expect(charts.getAxesCount()).toBe(2);
    });

    it('[SMOKE][IE] should toggle chart labels using chart config tool', function() {
        answerPage.queryAndWaitForChart('revenue customer region');
        common.util.waitForElementCountToBe(charts.getDataLabels(), 0);
        answerPage.openVizEditorPanel();
        charts.toggleShowDataLabelsCheckbox();
        common.util.waitForElementCountToBe(charts.getDataLabels(), 5);
    });

    it('should not disable stacked bar chart even when it would look same as regular bar chart', function() {
        answerPage.queryAndWaitForChart('revenue customer region market segment');
        answerPage.openVizTypeSelectorPanel();
        expect(answerPage.isChartTypeOptionEnabled('STACKED_COLUMN')).toBe(true);

        common.navigation.goToQuestionSection();
        answerPage.queryAndWaitForChart('revenue customer region customer nation');
        answerPage.openVizTypeSelectorPanel();
        expect(answerPage.isChartTypeOptionEnabled('STACKED_COLUMN')).toBe(true);
    });
});
