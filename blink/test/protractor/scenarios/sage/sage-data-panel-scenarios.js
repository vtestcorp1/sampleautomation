/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Archit Bansal(archit.bansal@thoughtspot.com)
 * Francois Chabbey(francois.chabey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving sage.
 */

'use strict';

var admin = require('../admin-ui/admin-ui');
var answerListPage = require('../answers/answer-list-page');
var answer = require('../viz-layout/answer/answer.js');
var common = require('../common.js');
var leftPanel = require('./data-panel/data-panel.js');
var sage = require('./sage.js');
var worksheet = require('../worksheets/worksheets');

var nav = common.navigation;
var util = common.util;

describe('Sage autocomplete dropdown cases', function () {

    beforeEach(function () {
        common.navigation.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    it('should show no selected sage sources on init', function () {
        util.waitForAndClick(leftPanel.locators.CHOOSE_SOURCES_LOCATOR);
        expect(leftPanel.sageDataSourceSelectedItemElement().count()).toBe(0);
    });

    it('should not make any sage call if there is no source selected', function () {
        util.waitForAndClick(leftPanel.locators.CHOOSE_SOURCES_LOCATOR);
        expect(leftPanel.sageDataSourceSelectedItemElement().count()).toBe(0);
        // enter a token
        sage.sageInputElement.enter('customer region');
        leftPanel.clickDone();
    });

    // https://thoughtspot.atlassian.net/browse/SCAL-15007
    it('[SMOKE][IE] should persist data scope across sessions', function () {
        var table = 'CUSTOMER';

        leftPanel.openAndChooseSources([table]);
        leftPanel.clickDone();
        // refresh app
        util.reLogin();
        common.navigation.goToQuestionSection();
        leftPanel.openAndChooseSources();
        expect(leftPanel.sageDataSourceSelectedItemElement(table).count()).toBe(1);
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    it('should open a saved answer with minimum scope', function () {
        var tables = ['CUSTOMER', 'LINEORDER'];
        var testBookName = 'scope customer';
        leftPanel.openAndChooseSources(tables);
        sage.sageInputElement.enter('customer region');
        answer.waitForAnswerToLoad();
        answer.selectTableType();
        answer.saveCurrentAnswer(testBookName);
        //openSavedAnswerContaining(testBookName, TABLE_VIZ);
        util.waitForInvisibilityOf(common.util.selectors.LOADING_INDICATOR_OVERLAY);
        common.navigation.goToAnswerSection();
        answer.openAnswerByName(testBookName);
        util.waitForAndClick(leftPanel.locators.CHOOSE_SOURCES_LOCATOR);
        // Scope should just have CUSTOMER
        expect(leftPanel.sageDataSourceSelectedItemElement(tables[0]).count()).toBe(1);
        expect(leftPanel.sageDataSourceSelectedItemElement(tables[1]).count()).toBe(0);
        answerListPage.deleteAnswer(testBookName);
    });

    //SCAL-17809 behaviour of select sources popup
    it('should not show popup when no sources are selected', function () {
        nav.goToPinboardsSection();
        nav.goToQuestionSection();
        leftPanel.expectSelectSourcesPopoverToBeDisplayed();
        leftPanel.openAndChooseSources();
        leftPanel.expectSelectSourcesPopoverToNotBeDisplayed();
        var tables = ['CUSTOMER', 'LINEORDER'];
        leftPanel.openAndChooseSources(tables);
        leftPanel.expectSelectSourcesPopoverToNotBeDisplayed();
        leftPanel.deselectAllSources();
        leftPanel.expectSelectSourcesPopoverToNotBeDisplayed();
    });

    it('should add the source, when an out-of-scope suggestion is picked', function () {
        leftPanel.deselectAllSources();
        util.waitForAndClick(leftPanel.locators.SELECT_FILTER_LOCATOR);
        leftPanel.clickDone();
        sage.sageInputElement.enter('county full nam');
        sage.waitForSageDropdownItem('county full name');
        //NOTE(Chab) we use a column that is only present in one table, to avoid
        //multiple suggestions, as order of out-of-scope seems not deterministic
        sage.selectSageDropdownItem('county full name', 'Geo_Usa_Data');
        leftPanel.openChooseSourcesDialog();
        util.waitForElementCountToBe(leftPanel.selectors.SELECTED_DATA_SCOPE_SOURCE_ITEM, 1);
    });

    afterAll(function () {
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });
});

describe("Sage data sources de-selection alert", function () {

    beforeAll(function () {
        nav.goToQuestionSection();
        leftPanel.openChooseSourcesDialog();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    beforeEach(function () {
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources(['LINEORDER', 'DATE', 'CUSTOMER']);
        leftPanel.clickDone();
        answer.queryAndWaitForAnswer('revenue customer region');
    });

    it('should alert on de-selection of an in-use source', function () {
        triggerAlertPopup();
        leftPanel.waitForVisibilityOfWarningPopup(true);
        leftPanel.clickDone();
    });

    it('should NOT alert on de-selection of an not-in-use source', function () {
        leftPanel.openChooseSourcesDialog();
        leftPanel.deselectSource('DATE');
        leftPanel.waitForVisibilityOfWarningPopup(false);
        leftPanel.clickDone();
    });

    it('should clear sage query if the user confirms de-selection', function () {
        triggerAlertPopup();
        sage.sageInputElement.waitForValueToBe('revenue customer region');
        leftPanel.confirmSourceRemoval();
        leftPanel.waitForVisibilityOfWarningPopup(false);
        leftPanel.clickDone();
        answer.waitForEmptyAnswer();
        expect($(sage.selectors.SAGE_INPUT).getAttribute('value')).toBe('');
    });

    it('should hide alert popup on confirmation', function () {
        triggerAlertPopup();
        leftPanel.confirmSourceRemoval();
        leftPanel.waitForVisibilityOfWarningPopup(false);
        leftPanel.waitForVisibilityOfSourcePanel();
        leftPanel.clickDone();
        leftPanel.waitForInvisibilityOfSourcePanel();
    });

    it('should hide alert popup on cancellation', function () {
        triggerAlertPopup();
        leftPanel.cancelSourceRemoval();
        leftPanel.waitForVisibilityOfWarningPopup(false);
        leftPanel.waitForVisibilityOfSourcePanel();
        leftPanel.clickDone();
        leftPanel.waitForInvisibilityOfSourcePanel();
    });

    it('should hide alert on click outside scope selector and the alert popup', function () {
        triggerAlertPopup();
        leftPanel.waitForVisibilityOfWarningPopup(true);
        // NOTE(chab) it seems that clicking on body does not ensure the popup to be removed, so we click
        // on another element
        $(common.util.selectors.USER_MENU).click();
        leftPanel.waitForVisibilityOfWarningPopup(false);
    });

    it('should not show alert on de-selection of a source that has already been removed from the query', function () {
        triggerAlertPopup();
        leftPanel.confirmSourceRemoval();
        leftPanel.waitForVisibilityOfWarningPopup(false);
        leftPanel.selectSource('LINEORDER');
        leftPanel.deselectSource('LINEORDER');
        leftPanel.waitForVisibilityOfWarningPopup(false);
        leftPanel.clickDone();
    });


    it('should hide alert when scope selector hides', function () {
        triggerAlertPopup();
        leftPanel.waitForVisibilityOfWarningPopup(true);
        leftPanel.clickDone();
        leftPanel.waitForVisibilityOfWarningPopup(false);
    });

    it('should result in a noop if the user cancels de-selection', function () {
        triggerAlertPopup();
        expect($(sage.selectors.SAGE_INPUT).getAttribute('value')).toBe('revenue customer region');
        leftPanel.cancelSourceRemoval();
        leftPanel.waitForVisibilityOfWarningPopup(false);
        expect($(sage.selectors.SAGE_INPUT).getAttribute('value')).toBe('revenue customer region');
    });

    it('should NOT hide alert on click inside an empty area inside the alert', function () {
        triggerAlertPopup();
        leftPanel.waitForVisibilityOfWarningPopup(true);
        leftPanel.clickOnSourceAlertPopup();
        leftPanel.waitForVisibilityOfWarningPopup(true);
        leftPanel.clickDone();
    });

    it('should show up for worksheets', function () {
        var worksheetName = '[test worksheet]';
        worksheet.createSimpleWorksheet(['CUSTOMER', 'LINEORDER'], worksheetName);

        leftPanel.openChooseSourcesDialog();
        leftPanel.deselectSource('LINEORDER');
        leftPanel.waitForVisibilityOfWarningPopup(true);
        nav.goToUserDataSection();
        worksheet.deleteWorksheet(worksheetName);
    });

    it('should show alert when select all is used to de-select multiple sources in use', function () {
        leftPanel.openChooseSourcesDialog();
        leftPanel.selectAllCheckbox();
        leftPanel.getSelectAllCheckbox().click();
        leftPanel.waitForVisibilityOfWarningPopup(true);
        leftPanel.confirmSourceRemoval();
        leftPanel.expectSelectedSourcesCount(0);
        leftPanel.clickDone();
    });

    it('should show the list of worksheets first', function () {
        leftPanel.openChooseSourcesDialog();
        expect($$(leftPanel.selectors.DATA_SOURCE_TYPES).count()).toBeGreaterThan(0);
        expect($$(leftPanel.selectors.DATA_SOURCE_TYPES).get(0).getText()).toBe('WORKSHEETS');
    });
});

function triggerAlertPopup() {
    leftPanel.openChooseSourcesDialog();
    leftPanel.deselectSource('LINEORDER');
}
