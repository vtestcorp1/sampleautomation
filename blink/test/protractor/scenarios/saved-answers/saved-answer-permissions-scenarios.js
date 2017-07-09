/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Francois Chabbey (francois.chabbeyt@thoughtspot.com)
 *
 * @fileoverview E2E tests for different permission handling in saved answers.
 */

'use strict';

var answerListPage = require('../answers/answer-list-page');
var answerPage = require('../viz-layout/answer/answer');
var chart = require('../charts/charts');
var checkboxFilter = require('../filters/checkbox-filter');
var common = require('../common');
var filterPanel = require('../filters/filter-panel');
var filterDialog = require('../filters/filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel');
var rangeFilter = require('../filters/range-filter');
var table = require('../table/table');

describe('Saved answer permissions scenarios', function () {
    var NAME = '[TEST]',
        QUERY = 'revenue by brand1 category mfgr#12 for supplier region america sum revenue > 0'
            +' sum revenue < 999999999999 sort by category',
        USER = 'guest4';

    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART']);
        leftPanel.clickDone();
        answerPage.clearVizDisplayPreference();
    });

    beforeEach(function() {
        common.navigation.goToQuestionSection();
        answerPage.createAndSaveAnswer(QUERY, NAME, false, chart.vizTypes.CHART);
        answerListPage.shareAnswer(NAME, [USER], true);
        common.util.logout();
        common.util.login(USER, USER);
        answerListPage.goToSavedAnswer(NAME);
        chart.waitForChartVizToLoad();
    });

    afterEach(function() {
        common.util.reLogin();
        answerListPage.deleteAnswer(NAME);
    });

    it('should handle view only answer', function() {
        // no menu on x-axis
        common.util.waitForElementCountToBe(chart.selectors.X_AXIS_MENU_ARROW, 0);
        // menu on y-axis
        common.util.waitForElementCountToBe(chart.selectors.Y_AXIS_MENU_ARROW, 1);
        // there must be ONLY filter options
        chart.columnLabelMenu.openForYAxis();
        chart.columnLabelMenu.clickFilter();
        rangeFilter.waitForFirstPredicateDisabled();
        rangeFilter.waitForSecondPredicateDisabled();
        filterDialog.clickCancel();

        // Table header tests
        answerPage.selectTableType();
        //Brand1 Column has no filter
        //Category has filter
        //Revenue has filter
        expect(table.getTableHeaderMenuBtn('Brand1').isPresent()).toBe(false);
        expect(table.getTableHeaderMenuBtn('Category').isPresent()).toBe(true);
        expect(table.getTableHeaderMenuBtn('Revenue').isPresent()).toBe(true);

        // Range filter must be read-only
        table.openTableHeaderMenu('Revenue');
        table.chooseColumnMenuItem('Filters');
        filterDialog.waitForItToAppear();
        rangeFilter.waitForFirstPredicateDisabled();
        rangeFilter.waitForSecondPredicateDisabled();
        filterDialog.clickCancel();

        // Filter Panel
        filterPanel.waitForFilterItems(3);
        filterPanel.clickFilterItem('Category');
        common.util.waitForElement(filterPanel.selectors.READ_ONLY_FILTER);
        filterDialog.clickCancel();
        filterPanel.clickFilterItem('Supplier Region');
        common.util.waitForElement(filterPanel.selectors.READ_ONLY_FILTER);
        filterDialog.clickCancel();
        filterPanel.clickFilterItem('Total Revenue');
        common.util.waitForElement(filterPanel.selectors.READ_ONLY_FILTER);
        filterDialog.clickCancel();

        // Checkbox filter
        filterPanel.clickFilterItem('Supplier Region');
        filterDialog.waitForItToAppear();
        checkboxFilter.verifyCheckedState('america', true);
        checkboxFilter.toggleCheckboxState('america');
        checkboxFilter.verifyCheckedState('america', true);
        filterDialog.clickCancel();
    });

    it('SCAL-17750 Should show red bar alert', function () {
        common.util.reLogin('guest', 'guest');
        var appPath = 'saved-answer/d0e16150-6a70-4c6c-8b4b-0afc4915d752';
        common.navigation.goToHome();
        common.navigation.addUrlParameter('successAlertHidingDelay', 5000);
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
        common.navigation.goToInAppPath(appPath);
        common.util.waitForVisibilityOf(common.util.selectors.ERROR_NOTIF);
        common.navigation.goToHome();
        common.navigation.removeUrlParameter('successAlertHidingDelay');
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });
});
