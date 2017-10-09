'use strict';

var common = require('../common.js');

var charts = require('../charts/charts.js');
var dataUI = require('../data-ui/data-ui.js');
var importUtils = require('../data-ui/import-wizard/import-wizard.js');
var answer = require('../viz-layout/answer/answer.js');
var dataPanel = require('../sage/data-panel/data-panel');
var pinboard = require('../pinboards/pinboards.js');
var checkboxFilter= require('../filters/checkbox-filter');
var dialog= require('../dialog.js');
var share=require('../share/share-ui.js');
var filter_dialog= require('../filters/filter-dialog');
var chosen=require('../libs/chosen.js');
var actions = require('../actions-button.js');
var util = common.util;
//var actionButton = require('../actions-button.js');

describe('Verify data label', function () {

    it('Should be able to verify data labe after editing and presenting', function () {
        var drillPinboradName = 'vtest_C6253';
        var columnSize = '7';

        common.navigation.goToPinboardsSection();
        pinboard.openPinboard(drillPinboradName);

        pinboard.openVizEditor();
        answer.openVizTypeSelectorPanel();
        answer.navigateAndWaitForChartType(charts.chartTypes.BAR);
        util.waitForAndClick(actions.locators.ACTION_BUTTON_ON_EDIT);
        util.waitForAndClick(actions.locators.UPDATE_BTN);
        pinboard.closeVizEditor();
        expect(charts.getFirstYAxisLabels).toContain('Line Number');

        pinboard.openSecondVizDropdownMenu();
        util.waitForAndClick(pinboard.locators.PRESENT);
        pinboard.verifyChartGraphDatalabel(columnSize);
        util.waitForAndClick(pinboard.locators.CLOSE_BUTTON_PRESENTMODE);

        pinboard.openVizEditor();
        answer.openVizTypeSelectorPanel();
        answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        util.waitForAndClick(actions.locators.ACTION_BUTTON_ON_EDIT);
        util.waitForAndClick(actions.locators.UPDATE_BTN);
        pinboard.closeVizEditor();

    });
});