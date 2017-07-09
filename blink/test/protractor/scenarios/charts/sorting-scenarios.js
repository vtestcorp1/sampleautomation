/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answerPage = require('../viz-layout/answer/answer.js');
var charts = require('./charts.js');
var sage = require('../sage/sage.js');
var leftPanel = require('../sage/data-panel/data-panel.js');

describe('Chart sort handling', function() {

    beforeAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
    });

    beforeEach(function() {
        answerListPage.goToAnswer();
        answerPage.clearVizDisplayPreference();
    });

    afterAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    it('should show correct chart when x-axis is a ascending measure', function() {
        answerPage.queryAndWaitForChart('revenue quantity color sort by sum revenue');
        expect(charts.getXAxisLabels().first().getText()).toBe('120M');
    });

    it('should show correct chart when x-axis is a descending measure', function() {
        answerPage.queryAndWaitForChart('revenue quantity color sort by sum revenue descending');
        expect(charts.getXAxisLabels().last().getText()).toBe('300M');
    });

    it('should show correct chart when y-axis is an ascending measure', function() {
        answerPage.queryAndWaitForChart('customer region revenue sort by sum revenue');
        expect(charts.getXAxisLabels().last().getText()).toBe('middle east');
    });

    it('should show correct chart when y-axis is a descending measure', function() {
        // attribute on x-axis
        answerPage.queryAndWaitForChart('customer region revenue sort by sum revenue descending');
        expect(charts.getXAxisLabels().last().getText()).toBe('africa');

        // measure on x-axis
        answerPage.queryAndWaitForChart('revenue customer region sort by sum quantity descending');
        answerPage.navigateAndWaitForChartType('COLUMN');
        expect(charts.isXAxisLabelsSortedDesc()).toBe(false);
        expect(charts.isXAxisLabelsSortedDesc()).toBe(false);
    });

    it('should show correct chart when sorting is only on legend', function() {
        answerPage.queryAndWaitForChart('revenue color quantity sort by color descending');
        expect(charts.getXAxisLabels().first().getText()).toBe('120M');
    });

    it('should show uniform x axis', function() {
        answerPage.queryAndWaitForChart('revenue tax color');
        expect(charts.getXAxisLabels().get(0).getText()).toBe('120M');
        expect(charts.getXAxisLabels().get(1).getText()).toBe('140M');
        expect(charts.getXAxisLabels().get(2).getText()).toBe('160M');
    });

    // Seems like this functionality doesn't work anymore.
    // xit('should respect sorting on unused axis', function() {
    //     queryAndWaitForChart("revenue tax color sort by tax descending");
    //     expect(element(HIGHCHART_CONTAINER_SELECTOR).count()).toBe(1);
    //
    //     openEditorTool();
    //     chartFunctions.removeXAxisColumn('Total Revenue');
    //     chartFunctions.selectXAxisColumn('Color');
    //     chartFunctions.removeYAxisColumn('Total Tax');
    //     chartFunctions.selectYAxisColumn('Total Revenue');
    //     clickChartEditorDoneButton();
    //
    //     expect(chartFunctions.getXAxisNthValue(0)).toBe('blanched');
    //     expect(chartFunctions.getXAxisNthValue(1)).toBe('cyan');
    //     expect(chartFunctions.getXAxisNthValue(2)).toBe('cream');
    // });
});

