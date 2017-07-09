/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * User management scenarios
 *
 */

/*jslint node: true */
'use strict';

var action = require('../../actions-button.js');
var adminUI = require('../admin-ui.js');
var blinkList = require('../../list/blink-list.js');
var common = require('../../common.js');
var dialog = require('../../dialog.js');
var nav = common.navigation;
var relationships = require('../../data-ui/relationships/relationship.js');
var share = require('../../share/share-ui.js');
var util = common.util;

var PRIVILEGES = adminUI.privileges;

describe('Permission checking for user management', function () {
    var userName = '[0testuser]',
        password = 'test';

    afterEach(function(){
        dialog.cleanupDialog();
    });

    it('[SMOKE][IE] Admin menu should not be available for guest', function () {

        expect(element(nav.locators.ADMIN_SECTION).isDisplayed()).toBeTruthy();
        util.reLogin('guest', 'guest');
        expect(element(nav.locators.ADMIN_SECTION).isPresent()).toBeFalsy();
        // For guest, admin tab must be hidden
        adminUI.loginAsAdmin();
    });
    it('[SMOKE][IE] Import data route should not be available for user without user data upload privilege', function () {
        adminUI.goToUserManagement();
        adminUI.addNewUser(userName, userName, password, true);
        util.reLogin(userName, password);
        nav.goToInAppPath('#/importdata');
        // Import data route should redirect to home since user doesn't have the privileges to load it
        util.checkForPath('/');
        adminUI.loginAsAdmin();
        adminUI.goToUserManagement();
        adminUI.deleteListItem(userName);
    });

    it('user with DATAMANAGEMENT privileges should be able to edit/create relationships', function(){

        var groupName = '[0test group]';
        var tableName = 'PART';
        var tableName2 = 'Part Details';

        adminUI.addNewGroup(groupName, groupName, [PRIVILEGES[4]]);

        adminUI.goToUserManagement();
        adminUI.addNewUser(userName, userName, password, true);

        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectUserInGroupPanel(userName);
        adminUI.save();
        nav.goToUserDataSection();
        blinkList.searchFor(' ', tableName);
        share.openSharePanel(tableName);
        share.selectPrincipalsInSharePanel([userName], false);

        nav.goToUserDataSection();
        blinkList.searchFor(' ', tableName2);
        share.openSharePanel(tableName2);
        share.selectPrincipalsInSharePanel([userName], false);

        util.reLogin(userName, password);
        nav.goToUserDataSection();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, tableName);
        element(relationships.locators.RELATIONSHIP_TAB).click();
        $(relationships.selectors.ADD_RELATIONSHIP_BTN).click();
        expect($$(relationships.selectors.RELATIONSHIP_EDITOR).count()).toBe(1);

        adminUI.loginAsAdmin();
        adminUI.goToUserManagement();
        adminUI.deleteListItem(userName);
        adminUI.goToGroupManagement();
        adminUI.deleteListItem(groupName);
    });

    it('User with admin and/or userupload management should be able to access import data page', function(){
        adminUI.goToGroupManagement();
        var groupName = '[0test admingroup]';
        var groupName2 = '[0test uploadgroup]';
        var userName = '[0test useradmin]';
        var userName2 = '[0test userupload]';
        var userName3 = '[0test user]';

        adminUI.addNewGroup(groupName, groupName, [PRIVILEGES[0], PRIVILEGES[1], PRIVILEGES[2]]);
        adminUI.addNewGroup(groupName2, groupName2, []);

        adminUI.goToUserManagement();
        adminUI.addNewUser(userName, userName, password, true);
        adminUI.addNewUser(userName2, userName2, password, true);
        adminUI.addNewUser(userName3, userName3, password, true);

        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);

        adminUI.selectUserInGroupPanel(userName);
        adminUI.save();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName2);
        adminUI.selectUserInGroupPanel(userName2);
        adminUI.save();

        util.reLogin(userName, password);
        nav.goToUserDataSection();
        action.checkIfButtonIsEnabled(action.actionLabels.IMPORT_DATA);

        util.reLogin(userName2, password);
        nav.goToUserDataSection();
        action.checkIfButtonIsEnabled(action.actionLabels.IMPORT_DATA);

        util.reLogin(userName3, password);
        nav.goToUserDataSection();
        action.checkIfButtonIsDisabled(action.actionLabels.IMPORT_DATA);

        adminUI.loginAsAdmin();
        adminUI.goToGroupManagement();
        adminUI.deleteListItem(groupName);
        adminUI.deleteListItem(groupName2);
        adminUI.goToUserManagement();
        adminUI.deleteListItem(userName);
        adminUI.deleteListItem(userName2);
        adminUI.deleteListItem(userName3);
    });
});
