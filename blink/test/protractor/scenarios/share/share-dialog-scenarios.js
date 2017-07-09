/**
 * Copyright: ThoughtSpot Inc. 2016
 *
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

'use strict';

var action = require('../actions-button');
var answerListPage = require('../answers/answer-list-page.js');
var answerUtil = require('../viz-layout/answer/answer.js');
var adminUI = require('../admin-ui/admin-ui.js');
var blinklist = require('../list/blink-list');
var common = require('../common.js');
var dialog = require('../dialog.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var pinboards = require('../pinboards/pinboards');
var sage = require('../sage/sage.js');
var saveDialog = require('../widgets/save-dialog');
var share = require('./share-ui.js');
var wks = require('../worksheets/worksheets');

var nav = common.navigation;
var util = common.util;

var ANSWER_TO_SHARE = '[testshare Answer]',
    TEST_PINBOARD = '[ Test Pinboard ]',
    SAGE_QUERY = 'revenue color',
    GUEST_USER = 'guest4';

describe('Share dialog', function() {

    beforeEach(function () {
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
        leftPanel.selectSource('PART');
        leftPanel.clickDone();
    });

    it('should show save an unsaved answer and show share dialog', function () {
        sage.sageInputElement.enter('revenue color');
        answerUtil.waitForAnswerToLoad();
        action.selectActionButtonAction(action.actionLabels.SHARE);
        dialog.checkIfDialogExist();
        var answerName = '[SHARING UNSAVED ANSWER]';
        saveDialog.enterName(answerName);
        saveDialog.save();
        action.selectActionButtonAction(action.actionLabels.SHARE);
        util.waitForVisibilityOf(share.selectors.SHARE_DIALOG);
        share.closeSharePanel();
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(answerName);
    });

    it('should be able to share an unaggregated worksheet', function() {
        var wsName = '[Worksheet Name]';
        wks.createSimpleWorksheet(['CUSTOMER', 'LINEORDER'], wsName);
        nav.goToUserDataSection();
        share.openSharePanel(wsName);
        util.waitForVisibilityOf(share.selectors.SHARE_DIALOG);
        // Click the add user header to expand the section
        share.clickAddUserHeader();
        share.selectPrincipalsInSharePanel([GUEST_USER], false);
        share.openSharePanel(wsName);
        // Expect a new row in the permission list with correct user name and permission type
        expect(share.permissionWithPrincipal(GUEST_USER).count()).toBe(1);
        expect(share.getPermissionType(GUEST_USER)).toBe(share.sharePermissions.CAN_EDIT);
        share.closeSharePanel();
        util.reLogin(GUEST_USER, GUEST_USER);
        nav.goToUserDataSection();
        util.waitForElementCountToBe(blinklist.selectors.METADATA_LIST_ITEMS_CONTENT, 1);
        util.reLogin();
        nav.goToUserDataSection();
        wks.deleteWorksheet(wsName);
    });


    it('should support sharing the document with a new user', function () {

        var guest = GUEST_USER;

        nav.goToPinboardsSection();
        pinboards.createPinboard(TEST_PINBOARD);
        nav.goToPinboardsSection();
        share.openSharePanel(TEST_PINBOARD);
        // Click the add user header to expand the section
        share.clickAddUserHeader();
        // Pick a user through the add user autocomplete input
        share.selectPrincipalsInSharePanel([guest]);
        // Expect a new row in the permission list with correct user name and permission type
        // Open the dialog again to check that the permissions were correctly persisted
        share.openSharePanel(TEST_PINBOARD);
        // Expect the correct permissions
        //expect(shareFunctions.nthPermissionItemName(1)).toBe(NEW_USER_LOGIN); DONE
        expect(share.permissionWithPrincipal(guest).count()).toBe(1);
        expect(share.getPermissionType(guest)).toBe('Can Edit');
        //expect(shareFunctions.nthPermissionType(1)).toBe(EDIT_PERMISSION_TYPE)
        share.closeSharePanel();
        pinboards.deletePinboard(TEST_PINBOARD);
    });


    it('should open the share dialog and list the permissions for an answer', function () {
        answerUtil.createAndSaveAnswer(SAGE_QUERY, ANSWER_TO_SHARE);
        nav.goToAnswerSection();
        share.openSharePanel(ANSWER_TO_SHARE);
        expect($$(share.selectors.SHARE_DIALOG).count()).toBe(1);
        expect($$(share.selectors.PRINCIPAL_ROW_IN_SHARE_PANEL).count()).toBe(1);
        expect(share.permissionWithPrincipal(adminUI.credential.ADMIN.USERNAME).count()).toBe(1);
        share.closeSharePanel();
        nav.goToAnswerSection();
        adminUI.deleteListItem(ANSWER_TO_SHARE);
    });

    it("username of the current user should not appears", function() {
        answerListPage.createAReadOnlyAnswer(['guest1'], ANSWER_TO_SHARE, 'revenue color');
        util.reLogin('guest1', 'guest1');
        nav.goToAnswerSection();
        share.openSharePanel(ANSWER_TO_SHARE);
        share.clickAddUserHeader();
        common.metadataItemSelector.selectOption(share.selectors.SHARE_DIALOG, 'guest1');
        var rowToSelect = $(share.selectors.SHARE_DIALOG).all(by.cssContainingText(
            common.metadataItemSelector.selectors.UISELECT_ROW, 'No matches found'));
        expect(rowToSelect.count()).toEqual(1);
        share.closeSharePanel();
        adminUI.loginAsAdmin();
        nav.goToAnswerSection();
        adminUI.deleteListItem(ANSWER_TO_SHARE);
    });

    it('should be able to share an aggregated worksheet', function() {
        sage.sageInputElement.enter('revenue color');
        answerUtil.waitForAnswerToLoad();
        action.selectActionButtonAction(action.actionLabels.SAVE_AS_WORKSHEET);
        var aggrWSName = '[AGGR WS]';
        saveDialog.enterName(aggrWSName);
        saveDialog.enterDescription(aggrWSName);
        saveDialog.save();
        nav.goToUserDataSection();
        share.openSharePanel(aggrWSName);
        util.waitForVisibilityOf(share.selectors.SHARE_DIALOG);
        // Click the add user header to expand the section
        share.clickAddUserHeader();
        share.selectPrincipalsInSharePanel([GUEST_USER], false);
        util.reLogin(GUEST_USER, GUEST_USER);
        nav.goToUserDataSection();
        blinklist.checkIfItemExist('.bk-name', aggrWSName);
        util.reLogin();
        nav.goToUserDataSection();
        wks.deleteWorksheet(aggrWSName);
    });
});

