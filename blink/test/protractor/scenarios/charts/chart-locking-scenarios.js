/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answerPage = require('../viz-layout/answer/answer');
var charts = require('./charts.js');
var common = require('../common.js');
var dialog = require('../dialog.js');
var sage = require('../sage/sage.js');
var leftPanel = require('../sage/data-panel/data-panel.js');

describe('chart locking', function() {

    // Client state of the panel is persisted by Callosum, so we make sure
    // that no sources are left selected before and after the test
    // Same goes for chart-panel, as tests can be shuffled, we need to be
    // sure that there is no persisted state
    beforeAll(function() {
        answerListPage.goToAnswer();
        answerPage.clearVizDisplayPreference();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
    });

    afterAll(function(){
        leftPanel.deselectAllSources();
    });

    beforeEach(function() {
        answerListPage.goToAnswer();
    });

    it('should show unlocked chart config icon by default', function() {
        var query = 'revenue order date yearly';
        answerPage.queryAndWaitForChart(query);
        answerPage.openVizEditorPanel();
        charts.chartEditor.chartConfigLocking.verifyChartUnlocked();
    });

    it('should be able to lock/unlock configuration', function() {
        var query = 'revenue order date yearly';
        answerPage.queryAndWaitForChart(query);
        answerPage.openVizEditorPanel();
        charts.chartEditor.chartConfigLocking.verifyChartUnlocked();
        charts.chartEditor.chartConfigLocking.toggleChartConfigLockState();
        charts.chartEditor.chartConfigLocking.verifyChartLocked();
        sage.sageInputElement.append(' tax');
        answerPage.waitForAnswerTitle('Total Revenue by Yearly (Order Date)');
        expect(charts.getAxesCount()).toBe(2);
        answerPage.openVizEditorPanel();
        charts.chartEditor.chartConfigLocking.verifyChartLocked();
        charts.chartEditor.chartConfigLocking.toggleChartConfigLockState();
        charts.chartEditor.chartConfigLocking.verifyChartUnlocked();
        sage.sageInputElement.append(' discount');
        answerPage.waitForAnswerTitle('Total Revenue, Total Tax, Total Discount ' +
            'by Yearly (Order Date)');
        expect(charts.getAxesCount()).toBe(4);
    });

    it('should break lock when config column is removed', function() {
        var query = 'revenue order date yearly tax';
        answerPage.queryAndWaitForChart(query);
        answerPage.openVizEditorPanel();
        charts.chartEditor.chartConfigLocking.verifyChartUnlocked();
        charts.chartEditor.chartConfigLocking.toggleChartConfigLockState();
        charts.chartEditor.chartConfigLocking.verifyChartLocked();
        sage.sageInputElement.deleteLastToken();
        answerPage.waitForAnswerTitle('Total Revenue by Yearly (Order Date)');
        expect(charts.getAxesCount()).toBe(2);
        answerPage.openVizEditorPanel();
        charts.chartEditor.chartConfigLocking.verifyChartUnlocked();
    });
});
