/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var bootstrap = require('../libs/bootstrap-lib');
var sage = require('../sage/sage.js');
var charts = require('../charts/charts.js');
var table = require('../table/table.js');
var common = require('../common.js');
var answer = require('../viz-layout/answer/answer.js');
var filterPanel = require('../filters/filter-panel');
var filterDialog = require('../filters/filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel');
var checkboxFilter = require('../filters/checkbox-filter');
var headline = require('../viz-layout/headline/headline.js');
var dataSourcesPreview = require('../data-source-preview/data-source-preview');
var pinboard = require('../pinboards/pinboards.js');
var dialog = require('../dialog.js');
var actionButtons = require('../actions-button.js');

describe('Pinboard viz context pinning', function () {
    var pinboardName = 'pinboardScenariosTesting';

    beforeEach(function () {
        common.navigation.goToPinboardsSection();
    });

    afterEach(function () {
        pinboards.deletePinboard(pinboardName);
    });

    it('should be edit the viz from viz context', function () {
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        var element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 2);
        pinboards.openVizEditor();
        sage.sageInputElement.append(' customer region');
        pinboards.closeVizEditorWithSave();
        // 1 count of Table Viz
        common.util.waitForElementCountToBe(table.locators.TABLE_VIZ, 1);
        // 3 columns in the viz
        element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 3);
    });

    it('should be able to pin a viz from viz context on the active viz', function () {
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        // Initially, 2 count of Table Viz
        var element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 2);
        pinboards.openVizEditor();
        sage.sageInputElement.append(' customer region');
        element = pinboards.locators.VIZ_CONTEXT;
        table.waitForTableColumnCountToBe(element, 3);
        answer.addShowingVizToPinboard(pinboardName);
        pinboards.closeVizEditorWithSave();
        // 2 count of Table Viz
        common.util.waitForElementCountToBe(table.locators.TABLE_VIZ, 2);
        // 3 columns in the first viz
        element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 3);
        // 3 columns in the second viz
        element = pinboards.getVizElementAtIndex(1);
        table.waitForTableColumnCountToBe(element, 3);
    });

    it('should be able to pin a viz from viz context on the active viz without updating active viz', function () {
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();
        // Initially, 2 count of Table Viz
        var element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 2);
        sage.sageInputElement.append(' customer region');
        element = pinboards.locators.VIZ_CONTEXT;
        table.waitForTableColumnCountToBe(element, 3);
        answer.addShowingVizToPinboard(pinboardName);
        pinboards.closeVizEditorWithoutSave();
        // 2 count of Table Viz
        common.util.waitForElementCountToBe(table.locators.TABLE_VIZ, 2);
        // 2 columns in the first viz
        element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 2);
        // 3 columns in the second viz
        element = pinboards.getVizElementAtIndex(1);
        table.waitForTableColumnCountToBe(element, 3);
    });

    it('[SMOKE] viz context should open the original answer and provide filter and guard ' +
        'against unsaved changes functionality', function () {
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();

        leftPanel.waitForEnabledSource('PART');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterPanel.waitForFilterItem('Color');
        checkboxFilter.toggleCheckboxState('almond');
        checkboxFilter.toggleCheckboxState('azure');
        filterDialog.clickDone();
        answer.waitForAnswerWithQuery('revenue color color = almond azure');
        pinboards.closeVizEditorWithSave();
    });

    it('should show unsaved-changes alert on viz type change [SCAL-12607]', function () {
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();

        answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        pinboards.closeVizEditorWithoutSave();
    });

    it('should allow discarding changes in viz context', function(){
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForTableCountToBe(1);
        var element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 2);

        pinboards.openVizEditor();
        sage.sageInputElement.append(' color');
        element = pinboards.locators.VIZ_CONTEXT;
        table.waitForTableColumnCountToBe(element, 3);
        pinboards.closeVizEditorWithoutSave();
        element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 2);

        pinboards.openVizEditor();
        sage.sageInputElement.append(' color');
        element = pinboards.locators.VIZ_CONTEXT;
        table.waitForTableColumnCountToBe(element, 3);
        pinboards.closeVizEditorWithSave();
        element = pinboards.getVizElementAtIndex(0);
        table.waitForTableColumnCountToBe(element, 3);
    });

    it('should allow changing viz type from inside viz-context', function(){
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForChartCountToBe(1);
        pinboards.waitForTableCountToBe(0);

        pinboards.openVizEditor();
        answer.selectTableType();
        pinboards.closeVizEditorWithSave();
        pinboards.waitForChartCountToBe(0);
        pinboards.waitForTableCountToBe(1);
    });

    it('should not display unsaved changes warning of no changes in vizContext SCAL-14214', function(){
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();

        pinboards.closeVizEditor();
    });

    it('should show unsaved-changes alert on viz type change [SCAL-12607]', function () {
        pinboard.createPinboard(pinboardName);
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        headline.pinHeadline('Color', pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();
        answer.queryAndWaitForTable('revenue');
        actionButtons.checkIfButtonIsDisabled(
            actionButtons.actionLabels.UPDATE,
            pinboard.selectors.VIZ_CONTEXT
        );
        common.util.waitForAndClick(pinboard.locators.CLOSE_VIZ);
        dialog.waitForDisabledPrimaryButton();
        dialog.confirm();
    });

    it('preview component should show correct sources', function () {
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();
        leftPanel.closePanel();
        dataSourcesPreview.hoverOnDataSourcePreview();
        bootstrap.tooltip.waitForToolTipContainingText('Lineorder, Part');
        pinboards.closeVizEditor();
    });

    it('should show unsaved-changes alert on empty query [SCAL-19140]', function () {
        pinboard.createPinboard(pinboardName);
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        headline.pinHeadline('Color', pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();
        answer.queryAndWaitForAnswer('');
        common.util.waitForAndClick(pinboard.locators.CLOSE_VIZ);
        dialog.waitForDisabledPrimaryButton();
        dialog.confirm();
    });
});
