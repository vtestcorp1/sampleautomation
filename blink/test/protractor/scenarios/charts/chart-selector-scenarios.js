/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

/*jslint node: true */
'use strict';


var charts = require('./charts.js');
var answer = require('../viz-layout/answer/answer.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var common = require('../common.js');
var sage = require('../sage/sage.js');
var util = common.util;


var NUMBER_OF_CHART_TYPES = 20;

describe("Chart selector cases - basic", function(){

    beforeEach(function () {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        answer.clearVizDisplayPreference();
        answer.queryAndWaitForChart('revenue order date detailed');
    });

    it('[SMOKE][IE] config menu should appears', function () {
        answer.openVizEditorPanel();
        charts.chartEditor.waitForChartConfigPanel();
    });

    it('should contain more than one chart type options', function () {
        answer.openVizTypeSelectorPanel();
        expect($$(charts.selectors.CHART_SELECTOR_OPTION).count()).toBeGreaterThan(1);
        // And should have exactly one icon selected.
        expect($$(answer.selectors.CHART_SELECTOR_PANEL_OPTIONS_SELECTED).count()).toBe(1);
    });

    it('[SMOKE][IE] should change chart type when a different option is selected', function () {
        answer.openVizTypeSelectorPanel();
        charts.waitForChartVizToLoad(charts.chartTypes.LINE);
        answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        // Now check that the old chart type is gone and a new one has appeared.
        charts.waitForChartVizToBeAbsent(charts.chartTypes.LINE);
    });

    it('should show unsupported chart types as disabled', function () {
        // Check that the current chart type is of one kind.
        answer.openVizTypeSelectorPanel();

        expect($$(charts.selectors.CHART_SELECTOR_OPTION).count()).toBe(NUMBER_OF_CHART_TYPES);
        expect($$(answer.selectors.CHART_SELECTOR_PANEL_OPTIONS_DISABLED).count()).toBe(10);

        answer.navigateToChartType(charts.chartTypes.BUBBLE, charts.chartTypes.LINE);
        charts.waitForChartVizToLoad(charts.chartTypes.LINE); // as bubble is not supported
        // pie chart will display an error message
        answer.navigateAndWaitForChartType(charts.chartTypes.PIE);
        answer.waitForChartDataNotSupported();
    });

    describe('Chart selector cases - advanced', function () {
        // Covers SCAL-989
        it('should be able to change chart type back and forth', function () {
            common.navigation.goToQuestionSection();
            answer.queryAndWaitForChart('revenue color customer region', charts.chartTypes.STACKED_COLUMN);
            answer.navigateAndWaitForChartType(charts.chartTypes.SCATTER);
            // Go back to the 'column' type
            answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        });
    });

    afterAll(function(){
        common.navigation.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });
});
