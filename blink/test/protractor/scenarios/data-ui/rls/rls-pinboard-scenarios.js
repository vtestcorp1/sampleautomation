/**
 * Copyright Thoughtspot Inc. 2017
 * Author: Priyanka Shri Ram (priyanka.shriram@thoughtspot.com)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var dataUI = require('../data-ui');
var blinkListFunctions = require('../../list/blink-list.js');
var answerPage = require('../../viz-layout/answer/answer.js');
var headline = require('../../viz-layout/headline/headline');
var dialog = require('../../dialog');
var rls = require('./rls.js');
var util = common.util;
var table = require('../../table/table.js');
var chart = require('../../charts/charts');
var answerListPage = require('../../answers/answer-list-page');
var leftPanel = require('../../sage/data-panel/data-panel');
var worksheet = require('../../worksheets/worksheets');
var pinboards = require('../../pinboards/pinboards.js');
var filterDialog = require('../../filters/filter-dialog');
var checkboxFilter = require('../../filters/checkbox-filter');

var navigation = common.navigation;

describe('RLS Pinboard Tests', function () {

    var answerName = 'rls answer';
    var pinboardName = 'pinboardRLSTesting';
    var query = 'revenue color';
    var sources = ['LINEORDER', 'PART'];
    var ruleName = util.appendRandomNumber('lineorder rule');

    beforeEach(function () {
        common.util.waitForElement(common.navigation.locators.NAVIGATION_BAR);
        dataUI.goToDataUI();
        rls.addRlsRuleToTable('LINEORDER', ruleName, "color = 'red'");
    });

    afterEach(function() {
        // Cleanup RLS dialog in case of failures.
        dialog.cleanupDialog();
        common.performance.captureMemory();
        browser.refresh();
        rls.deleteRlsRuleOnTable('LINEORDER', ruleName);
    });

    afterAll(function() {
        util.reLogin();
    });

    it(' Should honor RLS rule for a viz in pinboard', function() {
        navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART']);
        leftPanel.clickDone();
        answerPage.createAndSaveAnswer(query, answerName, false, chart.vizTypes.TABLE);
        table.waitForTable();
        headline.verifyHeadlineValue('18.1B');
        answerPage.addShowingVizToNewPinboard(pinboardName);
        headline.pinHeadline('Revenue', pinboardName);
        common.navigation.goToPinboardsSection();

        //TODO(Priyanka):Remove this after SCAL-19777 gets fixed
        dialog.waitForDialogPresent();
        dialog.confirm();

        pinboards.sharePinboard(pinboardName, ['guest1'], /*read only */ true);
        common.util.reLogin('guest1', 'guest1');
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForLoaded();
        headline.verifyHeadlineValue('131M');

        common.util.reLogin();
        answerListPage.deleteAnswer(answerName);
        pinboards.deletePinboard(pinboardName);
    });

    it('should honor RLS rule in pinboard filter', function () {
        var worksheetName = 'rls worksheet';
        navigation.goToUserDataSection();
        worksheet.createSimpleWorksheet(['PART','LINEORDER'], worksheetName);
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources([worksheetName]);
        leftPanel.clickDone();
        answerPage.queryAndWaitForSageIndexing(query);
        answerPage.selectTableType();
        answerPage.saveCurrentUnsavedAnswer(answerName);
        answerPage.addShowingVizToNewPinboard(pinboardName);
        headline.pinHeadline('Revenue', pinboardName);
        common.navigation.goToPinboardsSection();

        //TODO(Priyanka):Remove this after SCAL-19777 gets fixed
        dialog.waitForDialogPresent();
        dialog.confirm();

        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource(worksheetName);
        leftPanel.expandSource(worksheetName);
        leftPanel.openFilter('Color');
        checkboxFilter.toggleCheckboxState('almond');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
        pinboards.save();

        common.navigation.goToPinboardsSection();
        pinboards.sharePinboard(pinboardName, ['guest1'], /*read only */ true);
        common.util.reLogin('guest1', 'guest1');
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForLoaded();
        headline.verifyHeadlineValue('N/A');

        common.util.reLogin();
        // Delete dependent objects before worksheet deletion
        answerListPage.deleteAnswer(answerName);
        pinboards.deletePinboard(pinboardName);
        worksheet.deleteWorksheet(worksheetName);
    });
});
