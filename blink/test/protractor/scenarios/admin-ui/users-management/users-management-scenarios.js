/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * User management scenarios
 *
 */

/*jslint node: true */
'use strict';

var adminUI = require('../admin-ui.js');
var answerListPage = require('../../answers/answer-list-page.js');
var blinkList = require('../../list/blink-list.js');
var common = require('../../common.js');
var checkbox = common.blinkCheckbox;
var dialog = require('../../dialog.js');
var defaultGroups = adminUI.defaultGroups;
var leftPanel = require('../../sage/data-panel/data-panel.js');
var nav = common.navigation;
var relationships = require('../../data-ui/relationships/relationship.js');
var share = require('../../share/share-ui.js');
var util = common.util;

var selectors = {
    ADMIN_PAGE: '.bk-admin',
    NAME: '.bk-name',
    DISPLAY_NAME: '.bk-display-name'
};

var usersToDelete = [];
var groupsToDelete = [];

describe ("Users and groups admin section", function() {

    afterEach(function(){
        dialog.cleanupDialog();
    });

    afterEach(function(){
        adminUI.deleteGroups(groupsToDelete);
        adminUI.deleteUsers(usersToDelete);
        usersToDelete = [];
        groupsToDelete = [];
    });


    describe('Users management', function () {
        var timestamp;

        beforeEach(function () {
            nav.goToAdminSection();
            adminUI.goToUserManagement();
            timestamp = new Date().getTime();
            
            blinkList.clearSearchBox();
        });


        it('function sample',function(){});

        it('should select all users', function() {
            var selector = blinkList.selectors.METADATA_LIST_ITEM_CONTAINER;

            adminUI.selectAllUsers();
            common.blinkCheckbox.checkIfAllCheckboxInsideContainerAreChecked(selector);
            util.scrollElementToBottom(selector);
            common.blinkCheckbox.checkIfAllCheckboxInsideContainerAreChecked(selector);
        });

        it('should render an user list', function () {
            expect(element.all(by.css(blinkList.selectors.ACTIONABLE_LIST_CONTENT)).count()).toBe(1);
        });

        it('[SMOKE] should be able to add, edit and delete an user', function () {
            // Make display name start with z to ensure that it is added to the end because
            // the user list is sorted in ascending order
            var displayName = '[0zoo bar]',
                alteredName = '[0zoo bar2]';
            var userName = 'foo' + timestamp;

            adminUI.addNewUser(displayName, userName, 'foo', true);

            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName);
            adminUI.enterName(alteredName);
            adminUI.save();
            usersToDelete = [ userName + alteredName ];
        });

        it("[SCAL-12343] should render user with similar name", function () {
            var displayName = 'Guest 1',
                alteredName = '[0zoo bar2]';

            var newUserName = 'a' + timestamp;
            adminUI.addNewUser(displayName, newUserName, 'foo', true);

            blinkList.clearSearchBox();
            blinkList.checkIfItemExist(selectors.DISPLAY_NAME, displayName, 2);
            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, newUserName);
            adminUI.enterName(alteredName);
            adminUI.save();

            blinkList.checkIfItemExist(selectors.NAME, newUserName);
            blinkList.checkIfItemExist(selectors.NAME, alteredName);
            usersToDelete = [ newUserName + alteredName ];
        });

        it('should be able to add user in multiple attempts - initial attempts do not complete the required fields', function () {

            var displayName = '[0zoo bar]';

            adminUI.openNewUserDialog();
            // expect dialog box to be on UI
            dialog.checkIfDialogExist();
            blinkList.checkIfItemExist(selectors.DISPLAY_NAME, displayName, 0);
            // All fields blank
            adminUI.addNewUser('', '', '', null, null, null, null, true);
            checkIfUserHasNotBeenAdded();
            // Display name blank
            adminUI.openNewUserDialog();
            adminUI.addNewUser('', 'foo' + timestamp, 'foo', null, null, null, null, true);
            checkIfUserHasNotBeenAdded();
            // Username blank
            adminUI.openNewUserDialog();
            adminUI.addNewUser(displayName, '', 'foo', null, null, null, null, true);
            checkIfUserHasNotBeenAdded();
            // password blank
            adminUI.openNewUserDialog();
            adminUI.addNewUser(displayName, 'foo' + timestamp, '', null, null, null, null, true);
            checkIfUserHasNotBeenAdded();
            // password not matching
            adminUI.openNewUserDialog();
            adminUI.addNewUser(displayName, 'foo' + timestamp, 'foo', null, true, null, null, true);
            checkIfUserHasNotBeenAdded();
            // Should now successfully create a user
            adminUI.openNewUserDialog();
            adminUI.addNewUser(displayName, 'foo' + timestamp, 'foo');
            blinkList.checkIfItemExist(selectors.DISPLAY_NAME, displayName, 1);
            // Delete the user
            usersToDelete = ['foo' + timestamp];
            function checkIfUserHasNotBeenAdded() {
                dialog.checkIfDialogExist();
                blinkList.checkIfItemExist(selectors.DISPLAY_NAME, displayName, 0);
                dialog.clickSecondaryButton();
            }
        });

        it('[SMOKE][IE] should be able to add multiple users to a group', function () {
            var userName1 = '[0user name1]';
            var displayName1 = '[0user name1]';
            var userName2 = '[0user name2]';
            var displayName2 = '[0user name2]';
            var groupName = '[0group Name]';

            adminUI.goToUserManagement();
            adminUI.openNewUserDialog();
            adminUI.addNewUser(userName1, displayName1, 'password');
            adminUI.openNewUserDialog();
            adminUI.addNewUser(userName2, displayName2, 'password');

            adminUI.goToGroupManagement();
            adminUI.addNewGroup(groupName);
            usersToDelete = [userName1, userName2];
            groupsToDelete = [groupName];

            adminUI.goToUserManagement();
            blinkList.checkItems(selectors.ADMIN_PAGE, [userName1, userName2], true);

            adminUI.clickOnBulkAddUserButton();
            element(by.cssContainingText('.bk-dialog .bk-checkbox-container', groupName)).click();
            adminUI.save();

            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName1);
            checkbox.checkForCheckedBox(groupName);
            dialog.clickSecondaryButton();

            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName2);
            checkbox.checkForCheckedBox(groupName);
            dialog.clickSecondaryButton();

            blinkList.clearSearchBox();
        });


        it('SCAL-12916 groups list should show checked list first', function () {
            var userName = 'guest4';
            adminUI.goToUserManagement();
            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName);
            // first item in list must be checked and consumer group
            checkbox.checkForCheckedBox('Consumer'); // TODO(chab) this should be the FIRST
            dialog.clickSecondaryButton();
        });

        // SCAL-16211
        it("should not disappear from user list", function () {
            var TEST_READONLY_ANSWERNAME = '[Test readonly answer]';
            var SHARE_USER = 'guest1';
            adminUI.goToUserManagement();
            nav.goToQuestionSection();
            leftPanel.deselectAllSources();
            leftPanel.selectSource('LINEORDER');
            leftPanel.selectSource('PART');
            leftPanel.clickDone();
            answerListPage.createAReadOnlyAnswer([SHARE_USER], TEST_READONLY_ANSWERNAME, 'revenue color');
            adminUI.goToUserManagement();
            blinkList.checkIfItemExist(selectors.NAME, SHARE_USER);
            answerListPage.deleteAnswer(TEST_READONLY_ANSWERNAME);
        });

        it('should not allow to save user with incorrect email', function () {
            var DISABLED_SAVE_BUTTON_SELECTOR = dialog.selectors.DISABLED_PRIMARY_BUTTON;
            var userName = 'foo';
            usersToDelete = [userName];

            adminUI.goToUserManagement();
            adminUI.addNewUser(userName, userName, userName, true, false, 'test', null, true);
            expect(element.all(by.css(DISABLED_SAVE_BUTTON_SELECTOR)).count()).toBe(1);

            dialog.clickSecondaryButton();
            adminUI.addNewUser(userName, userName, userName, true, false, 'test@test.com');
            blinkList.checkIfItemExist(selectors.NAME, userName);
        });

        // test group assignment via edit dialog
        it('should be able to add/remove group via the dialog box', function () {
            var groupName = '[0groupname]';
            var userName = '[0username]';
            groupsToDelete = [groupName];
            usersToDelete = [userName];

            // setup
            adminUI.addNewUser(userName, userName, userName, true);
            adminUI.goToGroupManagement();
            adminUI.addNewGroup(groupName);
            adminUI.goToUserManagement();
            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName);

            // add a group
            adminUI.selectGroupInUserPanel(groupName);
            adminUI.save();
            // go to group, check if user is added
            adminUI.goToGroupManagement();
            adminUI.checkIfGroupHasUser(userName, groupName, true);
            adminUI.checkIfGroupHasUser('guest1', groupName, false);
            // remove a group
            adminUI.goToUserManagement();
            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName);
            adminUI.selectGroupInUserPanel(groupName);
            adminUI.save();
            // go to group, check if user is removed
            adminUI.goToGroupManagement();
            adminUI.checkIfGroupHasUser(userName, groupName, false);
            adminUI.checkIfGroupHasUser('guest1', groupName, false);
            //clean
        });
    });
});

describe('Negative testing for user management', function () {

    var displayName = '[0display name]',
        userName = '[0username]',
        password = '[password]';

    beforeEach(function () {
        adminUI.goToUserManagement();
        blinkList.clearSearchBox();
    });

    it('User should not be allowed to create a user with existing username', function () {
        // Add a dummy user
        adminUI.addNewUser(displayName, userName, password, true);
        adminUI.addNewUser(displayName, userName, password, true);

        // Expect error notification
        util.expectErrorNotif();

        // assert that the 2nd user with duplicate name was not created
        blinkList.checkIfItemExist(selectors.DISPLAY_NAME, displayName, 1);
        // delete the first user created
        adminUI.deleteListItem(userName);
    });
});

describe('System Administrator Group', function(){

    var group = 'Consumer';
    var user = 'guest4';
    var adminGroup = defaultGroups.ADMIN;

    beforeEach(function(){
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, adminGroup.name);
    });

    it('should not show left panel when editing', function(){
        adminUI.checkForLeftPanel(0); // no left panel
        adminUI.checkForRightPanel(1);
        dialog.clickSecondaryButton();
    });

    it('should be able to add/remove user and group to administrator group', function(){
        adminUI.selectGroupInGroupPanel(group);
        adminUI.selectUserInGroupPanel(user);
        adminUI.save();
        adminUI.checkIfGroupHasGroup(adminGroup.name, group, true);
        adminUI.checkIfGroupHasUser(user, adminGroup.name, true);
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, adminGroup.name);
        adminUI.selectGroupInGroupPanel(group);
        adminUI.selectUserInGroupPanel(user);
        adminUI.save();
        adminUI.checkIfGroupHasGroup(adminGroup.name, group, false);
        adminUI.checkIfGroupHasUser(user, adminGroup.name, false);
    });
});

describe('Non system administrator', function() {

    var SECONDARY_ADMIN_NAME = '[admin2]';

    beforeEach(function () {
        adminUI.goToUserManagement();
        adminUI.addNewUser(SECONDARY_ADMIN_NAME,
            SECONDARY_ADMIN_NAME,
            SECONDARY_ADMIN_NAME,
            true,
            false,
            'test@test.ch',
            [defaultGroups.ADMIN.name] );
        util.reLogin(SECONDARY_ADMIN_NAME, SECONDARY_ADMIN_NAME);
        adminUI.goToUserManagement();
    });

    afterEach(function() {
        util.reLogin('tsadmin', 'admin');
        nav.goToAdminSection();
        adminUI.goToUserManagement();
        adminUI.deleteListItem(SECONDARY_ADMIN_NAME);
    });

    it("should not be able to remove themselves from administrator group", function() {
        adminUI.checkIfUserHasGroup(SECONDARY_ADMIN_NAME, defaultGroups.ADMIN.name, true);
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, SECONDARY_ADMIN_NAME);
        adminUI.selectGroupInUserPanel(defaultGroups.ADMIN.name);
        dialog.clickSecondaryButton();
        adminUI.checkIfUserHasGroup(SECONDARY_ADMIN_NAME, defaultGroups.ADMIN.name, true);
        adminUI.goToGroupManagement();
        adminUI.checkIfGroupHasUser(SECONDARY_ADMIN_NAME, defaultGroups.ADMIN.name, true);
    });
});
