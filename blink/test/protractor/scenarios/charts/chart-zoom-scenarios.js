/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview E2E tests for chart zoom feature.
 */

'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answerPage = require('../viz-layout/answer/answer.js');
var charts = require('./charts.js');
var common = require('../common.js');
var leftPanel = require('../sage/data-panel/data-panel.js');

describe('Chart zoom', function () {

    beforeAll(function() {
        answerListPage.goToAnswer();
        answerPage.clearVizDisplayPreference();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
        answerPage.queryAndWaitForChart('revenue order date', 'LINE');
    });

    afterAll(function() {
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    it('should show menu body when menu btn is clicked', function () {
        answerPage.openVizEditorPanel();
    });

    it('[SMOKE][IE] should have select enabled and reset disabled', function () {
        answerPage.openVizEditorPanel();
        charts.zoom.waitForZoomButtonToBeDeselected();
        charts.zoom.waitForResetButtonToBeDisabled();
    });

    it('should have reset enabled after zoom, disabled after reset', function () {
        answerPage.openVizEditorPanel();
        charts.zoom.clickZoomButton();
        // clicking on zoom button auto-closes panel so we need to open it again.
        answerPage.openVizEditorPanel();
        // zoom in button should look selected now.
        charts.zoom.waitForZoomButtonToBeSelected();
        // Reset should still remain disabled because we haven't zoomed in yet.
        charts.zoom.waitForResetButtonToBeDisabled();

        var chart = $(charts.selectors.HIGHCHART_CONTAINER);
        browser.actions()
            .mouseMove(chart, {x: 500, y: 50}) // 50px from left, 50 px from top of chart
            .mouseDown()
            .mouseMove(chart, {x: 100, y: 100})
            .mouseUp()
            .perform();
        // Reset button should become active
        charts.zoom.waitForResetButtonToBeEnabled();
    });
});
