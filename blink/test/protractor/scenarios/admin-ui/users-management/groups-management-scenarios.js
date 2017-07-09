/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * Group management scenarios
 *
 */

/*jslint node: true */
'use strict';

var adminUI = require('../admin-ui.js');
var blinkList = require('../../list/blink-list.js');
var common = require('../../common.js');
var dialog = require('../../dialog.js');
var defaultGroups = adminUI.defaultGroups;
var relationships = require('../../data-ui/relationships/relationship.js');
var share = require('../../share/share-ui.js');
var util = common.util;
var checkbox = common.blinkCheckbox;

var selectors = {
    ADMIN_PAGE: '.bk-admin',
    NAME: '.bk-name',
    DISPLAY_NAME: '.bk-display-name'
};

var usersToDelete = [];
var groupsToDelete = [];

var PRIVILEGES = adminUI.privileges;

describe ('Groups management', function(){

    var groupCheckboxSelector = adminUI.selectors.CHECKBOXES_PANEL;

    afterEach(function(){
        dialog.cleanupDialog();
        adminUI.deleteGroups(groupsToDelete);
        adminUI.deleteUsers(usersToDelete);
        usersToDelete = [];
        groupsToDelete = [];
    });

    beforeEach(function () {
        adminUI.goToGroupManagement();
        blinkList.clearSearchBox();
    });

    it('should render a group list', function () {
        expect(element.all(by.css(blinkList.selectors.ACTIONABLE_LIST_CONTENT)).count()).toBe(1);
    });

    it('[SMOKE] should be able to add, edit and delete a group', function () {
        var groupName = '[0groupname]';
        var alteredGroupName = '[0groupname2]';

        adminUI.addNewGroup(groupName);
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.enterGroupName(alteredGroupName);
        adminUI.save();
        blinkList.checkIfItemExist(selectors.NAME, alteredGroupName);
        groupsToDelete = [groupName + alteredGroupName];
    });

    it('[SMOKE][IE] should be able to see display names and names in list', function () {
        var groupName = '[0group name]';
        var groupDisplayName = '[0group display name]';

        adminUI.addNewGroup(groupName, groupDisplayName);
        groupsToDelete = [groupName];
        blinkList.checkIfItemExist(selectors.NAME, groupName);
        blinkList.checkIfItemExist(selectors.DISPLAY_NAME, groupDisplayName);
    });

    // TODO(chab) find a way to scroll down the list of checkbox automatically
    /*
     xit('should not allow administrator user to remove itself from admin group', function() {
     blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, defaultGroups.ADMIN.name);
     // checkbox is read-only

     adminUI.checkIfGroupHasUser(adminUI.credential.ADMIN.USERNAME);
     adminUI.selectUserInGroupPanel(adminUI.credential.ADMIN.USERNAME);
     adminUI.checkIfGroupHasUser(adminUI.credential.ADMIN.USERNAME);
     });*/

    // SCAL-12916
    it('user list should show checked user first', function() {
        var groupName = 'Analyst';
        // Analyst has Guest 1 checked first
        checkIfGroupHasUsersCheckedFirst(groupName);
        // Analyst has 2 users checked, so 3 user must be unchecked
        expect($$(groupCheckboxSelector).get(2).all(by.css(common.blinkCheckbox.selectors.CHECKED))
            .count()).toBe(0);
        dialog.clickSecondaryButton();
    });

    it('textbox should filter content', function() {
        var groupName = defaultGroups.ADMIN.name;
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        blinkList.searchFor(common.blinkCheckbox.selectors.SEARCH_BOX, 'dummy', true);
        // first item in list must be checked and consumer group
        var groupCheckbox = $$(groupCheckboxSelector);
        expect(groupCheckbox.count()).toBe(0);
        blinkList.searchFor(common.blinkCheckbox.selectors.SEARCH_BOX, 'rls-group', true);
        expect(groupCheckbox.count()).toBe(5);
        dialog.clickSecondaryButton();
    });


    it('[SMOKE][IE] should be able to bulk assign users', function() {
        var groupName = '[0groupname]';
        var userName1 = '[0username1]';
        var userName2 = '[0username2]';
        var userName3 = '[0username3]';

        adminUI.addNewGroup(groupName);

        adminUI.goToUserManagement();
        adminUI.addNewUser(userName1, userName1, 'pwd', true);
        adminUI.addNewUser(userName2, userName2, 'pwd', true);
        adminUI.addNewUser(userName3, userName3, 'pwd', true);

        // add 2 users to the group
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);

        adminUI.selectUserInGroupPanel(userName1);
        adminUI.selectUserInGroupPanel(userName2);
        adminUI.save();

        adminUI.goToUserManagement();
        adminUI.checkIfUserHasGroup(userName1, groupName, true);
        adminUI.checkIfUserHasGroup(userName2, groupName, true);
        adminUI.checkIfUserHasGroup(userName3, groupName, false);

        adminUI.goToGroupManagement();
        // remove 2 users to the group, add last user
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectUserInGroupPanel(userName1);
        adminUI.selectUserInGroupPanel(userName2);
        adminUI.selectUserInGroupPanel(userName3);
        adminUI.save();

        adminUI.goToUserManagement();
        adminUI.checkIfUserHasGroup(userName1, groupName, false);
        adminUI.checkIfUserHasGroup(userName2, groupName, false);
        adminUI.checkIfUserHasGroup(userName3, groupName, true);
        // cleanup
        usersToDelete = [userName1, userName2, userName3];
        groupsToDelete = [groupName];
    });

    it('should be able to able to bulk assign users, more elaborate scenario', function(){
        var groupName = '[0groupname]';
        var userName1 = '[0username1]';
        var userName2 = '[0username2]';
        var userName3 = '[0username3]';

        adminUI.addNewGroup(groupName);

        adminUI.goToUserManagement();
        adminUI.addNewUser(userName1,userName1,'pwd', true);
        adminUI.addNewUser(userName2,userName2,'pwd', true);
        adminUI.addNewUser(userName3,userName3,'pwd', true);

        // add users via bulk panel
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);

        adminUI.selectUserInGroupPanel(userName1);
        adminUI.selectUserInGroupPanel(userName2);
        adminUI.save();

        // remove group from users via user panel, and add an user to the group
        adminUI.goToUserManagement();

        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName1);
        adminUI.selectGroupInUserPanel(groupName);
        adminUI.save();

        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName2);
        adminUI.selectGroupInUserPanel(groupName);
        adminUI.save();

        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName3);
        adminUI.selectGroupInUserPanel(groupName);
        adminUI.save();

        adminUI.goToGroupManagement();
        //check if group has right user
        adminUI.checkIfGroupHasUser(userName1, groupName, false);
        adminUI.checkIfGroupHasUser(userName2, groupName, false);
        adminUI.checkIfGroupHasUser(userName3, groupName, true);

        adminUI.deleteListItem(groupName);
        adminUI.goToUserManagement();
        adminUI.deleteListItem(userName1);
        adminUI.deleteListItem(userName2);
        adminUI.deleteListItem(userName3);
    });


    it('should save correct belonging users/groups when using filter box', function() {
        var groupName = '[0groupName 1]';
        var filterText = 'gue';
        var users = [
            'guest1',
            'guest3',
            'guest4'
        ];
        adminUI.addNewGroup(groupName, groupName, [], users, filterText);
        adminUI.goToUserManagement();
        //check if group has right user
        users.forEach(function(user){
            adminUI.checkIfUserHasGroup(user, groupName, true);
        });
        adminUI.goToGroupManagement();

        users.forEach(function(user){
            adminUI.checkIfGroupHasUser(user, groupName, true);
        });

        groupsToDelete = [groupName];
    });

    it('should be able to add/remove privileges', function() {

        var groupName = '[0groupname]';
        groupsToDelete = [groupName];
        adminUI.addNewGroup(groupName);
        adminUI.goToGroupManagement();
        // check standard privileges
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);

        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[0], false);
        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[1], true);
        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[2], true);
        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[3], false);

        // remove all privileges
        adminUI.selectPrivilege(PRIVILEGES[1]);
        adminUI.selectPrivilege(PRIVILEGES[2]);

        adminUI.save();

        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);

        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[0], false);
        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[1], false);
        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[2], false);
        adminUI.checkIfGroupHasPrivilege(PRIVILEGES[3], false);

        // add all privileges
        PRIVILEGES.forEach(function(p){
            adminUI.selectPrivilege(p);
        });

        adminUI.save();

        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        PRIVILEGES.forEach(function(p){
            adminUI.checkIfGroupHasPrivilege(p, true);
        });
        dialog.clickSecondaryButton();
    });
});

function checkIfGroupHasUsersCheckedFirst(groupName) {
    blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
    util.waitForAndClick(adminUI.locators.USERS_TAB);
    var checkboxElements = adminUI.selectors.CHECKBOXES_PANEL;
    expect($$(checkboxElements).first().all(by.css(checkbox.selectors.CHECKED)).count()).toBe(1);
}
