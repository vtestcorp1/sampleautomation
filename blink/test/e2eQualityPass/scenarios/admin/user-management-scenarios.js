/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E tests for admin's user management page
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Admin - User Management', function () {

    var timestamp;

    beforeEach(function () {
        goToUserManagementPage();
        timestamp = new Date().getTime();
    });


    it('should be able to search for a user', function() {
        var userName = 'qauser',
            displayName = 'qa user',
            userPassword = 'password';
        adminUIFunctions.addNewUser(displayName, userName, userPassword, true);
        goToUserManagementPage();
        searchByName(displayName);
        expect(element(LIST_ITEM).count()).toBe(1);
        deleteListItem(displayName);
    });

    it('should be able to change permission on a user', function() {
        var displayName = 'foo',
            userName = 'foo',
            userPassword = 'password';
        var groupName1 = 'foo group',
            groupName2 = 'boo group';
        adminUIFunctions.addNewUser(displayName, userName, userPassword, true);

        //create 2 new groups
        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName1);
        adminUIFunctions.addNewGroup(groupName2);

        //Add user to groupName1
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName1) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();

        //Check user is in group
        goToUserManagementPage();
        adminUIFunctions.checkIfUserHasGroup(userName, groupName1, true);
        adminUIFunctions.checkIfUserHasGroup(userName, groupName2, false);

        adminUIFunctions.deleteListItem(displayName);

        goToGroupManagement();
        adminUIFunctions.deleteListItem(groupName1);
        adminUIFunctions.deleteListItem(groupName2);
    });
});

describe('Admin - Group Management', function () {

    var timestamp;

    beforeEach(function () {
        goToGroupManagement();
        timestamp = new Date().getTime();
    });

    // TODO(Shitong): SCAL-11504
    xit('should be able to change permission on a group', function() {
        var groupName = '[test group]';
        addNewGroupByName(groupName, ['admin', 'upload']);
        expectGroupToHavePriviledge(groupName, 'admin');
        expectGroupToHavePriviledge(groupName, 'upload');
        expectGroupNotToHavePriviledge(groupName, 'download');
        expectGroupNotToHavePriviledge(groupName, 'share');
        element(contains(LIST_ITEM, groupName)).click();
        uncheckPermissionCheckboxes();
        expectGroupNotToHavePriviledge(groupName, 'admin');
        expectGroupNotToHavePriviledge(groupName, 'upload');
        deleteListItem(groupName);
    });
});
