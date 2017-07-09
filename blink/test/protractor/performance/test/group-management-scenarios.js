/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var adminUI = require('../../scenarios/admin-ui/admin-ui.js');
var benchmark = require('./../benchmark.js');
var blinkList = require('../../scenarios/list/blink-list.js');
var common = require('../../scenarios/common.js');
var dataset = browser.params.dataset.userManagementScenarios;
var nav = common.navigation;
var util = common.util;

var suite = benchmark.suite('add-non-admin-group');

dataset.addNonAdminGroups.forEach(function (input) {
    var group = input.group;
    var timestamp = new Date().getTime();
    var groupName = group.groupName + timestamp;
    suite.register(group.groupName)
        // TODO(Rahul): Adding a reload app step to avert impact on test
        // measurements due to memory bloats from previous tests.
        .beforeAll(common.navigation.reloadApp)
        .afterAll(common.navigation.reloadApp)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            return adminUI.goToGroupManagement();
        })
        .then(function() {
            adminUI.addNewGroup(
                groupName, group.displayName);
            return util.expectSuccessNotif('Successfully created group.');
        })
        .after(function() {
            adminUI.deleteGroups([groupName]);
            return util.expectSuccessNotif('Successfully deleted groups.');
        })
});

suite.report();


var suite = benchmark.suite('delete-non-admin-group');

dataset.deleteNonAdminGroups.forEach(function (input) {
    var group = input.group;
    var timestamp = new Date().getTime();
    var groupName = group.groupName + timestamp;
    suite.register(group.groupName)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToGroupManagement();
            adminUI.addNewGroup(
                groupName, group.displayName);
            return util.expectSuccessNotif('Successfully created group.');
        })
        .then(function() {
            adminUI.deleteGroups([groupName]);
            return util.expectSuccessNotif('Successfully deleted groups.');
        });
});

suite.report();



var suite = benchmark.suite('add-admin-group');

dataset.addAdminGroups.forEach(function (input) {
    var group = input.group;
    var timestamp = new Date().getTime();
    var groupName = group.groupName + timestamp;
    suite.register(group.groupName)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            return adminUI.goToGroupManagement();
        })
        .then(function() {
            adminUI.addNewGroup(
                groupName, group.displayName,
                [adminUI.privileges[0]] /*Administration privileges*/);
            return util.expectSuccessNotif('Successfully created group.');
        })
        .after(function() {
            adminUI.deleteGroups([groupName]);
            return util.expectSuccessNotif('Successfully deleted groups.');
        })
});

suite.report();


var suite = benchmark.suite('delete-admin-group');

dataset.deleteAdminGroups.forEach(function (input) {
    var group = input.group;
    var timestamp = new Date().getTime();
    var groupName = group.groupName + timestamp;
    suite.register(group.groupName)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToGroupManagement();
            adminUI.addNewGroup(
                groupName, group.displayName,
                [adminUI.privileges[0]] /*Administration privileges*/);
            return util.expectSuccessNotif('Successfully created group.');
        })
        .then(function() {
            adminUI.deleteGroups([groupName]);
            return util.expectSuccessNotif('Successfully deleted groups.');
        });
});

suite.report();


var suite = benchmark.suite('add-user-to-groups');

dataset.addUserToGroups.forEach(function (testdata) {
    var timestamp = new Date().getTime();
    var userName = testdata.user.userName + timestamp;
    suite.register(testdata.testName)
        .withBounds(testdata.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToGroupManagement();
            testdata.groupsToBeAddedTo.forEach(function (group) {
                adminUI.addNewGroup(group.groupName, group.displayName);
            });
            adminUI.goToUserManagement();
            adminUI.addNewUser(testdata.user.displayName, userName,
                testdata.user.password, true);
            return util.expectSuccessNotif('Successfully created user.');
        })
        .then(function() {
            blinkList.selectItemByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName);
            testdata.groupsToBeAddedTo.forEach(function (group) {
                adminUI.selectGroupInUserPanel(group.groupName);
            });
            adminUI.save();
            return util.expectSuccessNotif('Successfully updated user.');
        })
        .after(function() {
            adminUI.deleteUsers([userName]);
            util.expectSuccessNotif('Successfully deleted users.');
            var groupsToDelete = [];
            testdata.groupsToBeAddedTo.forEach(function (group) {
                groupsToDelete.push(group.groupName);
            });
            adminUI.deleteGroups(groupsToDelete);
            return util.expectSuccessNotif('Successfully deleted groups.');
        })
});

suite.report();


var suite = benchmark.suite('remove-user-from-groups');

dataset.removeUserFromGroups.forEach(function (testdata) {
    var timestamp = new Date().getTime();
    var userName = testdata.user.userName + timestamp;
    var groupName = testdata.group.groupName + timestamp;
    suite.register(testdata.testName)
        .withBounds(testdata.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToUserManagement();
            adminUI.addNewUser(testdata.user.displayName, userName,
                testdata.user.password, true);
            util.expectSuccessNotif('Successfully created user.');
            adminUI.goToGroupManagement();
            adminUI.addNewGroup(groupName,
                testdata.group.displayName);
            util.expectSuccessNotif('Successfully created group.');
            blinkList.selectItemByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
            adminUI.selectUserInGroupPanel(userName);
            adminUI.save();
            return util.expectSuccessNotif('Successfully updated group.');
        })
        .then(function() {
            blinkList.selectItemByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
            adminUI.selectUserInGroupPanel(userName);
            adminUI.save();
            return util.expectSuccessNotif('Successfully updated group.');
        })
        .after(function() {
            adminUI.deleteUsers([ userName ]);
            util.expectSuccessNotif('Successfully deleted users.');
            adminUI.deleteGroups([ groupName] );
            return util.expectSuccessNotif('Successfully deleted groups.');
        })
});

suite.report();


var suite = benchmark.suite('add-group-to-groups');

dataset.addGroupToGroups.forEach(function (testdata) {
    var timestamp = new Date().getTime();
    var groupName = testdata.groupToAdd.groupName + timestamp;
    suite.register(testdata.testName)
        .withBounds(testdata.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToGroupManagement();
            testdata.groupsToBeAddedTo.forEach(function (group) {
                adminUI.addNewGroup(group.groupName, group.displayName);
            });
            adminUI.addNewGroup(groupName,
                testdata.groupToAdd.displayName);
            return util.expectSuccessNotif('Successfully created group.');
        })
        .then(function() {
            blinkList.selectItemByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
            testdata.groupsToBeAddedTo.forEach(function (group) {
                adminUI.selectGroupInGroupPanel(group.groupName);
            });
            adminUI.save();
            return util.expectSuccessNotif('Successfully updated group.');
        })
        .after(function() {
            var groupsToDelete = [ groupName ];
            testdata.groupsToBeAddedTo.forEach(function (group) {
                groupsToDelete.push(group.groupName);
            });
            adminUI.deleteGroups(groupsToDelete);
            return util.expectSuccessNotif('Successfully deleted groups.');
        })
});

suite.report();


var suite = benchmark.suite('remove-group-from-groups');

dataset.removeGroupFromGroups.forEach(function (testdata) {
    var timestamp = new Date().getTime();
    var groupName1 = testdata.groupToRemove.groupName + timestamp;
    var groupName2 = testdata.groupToBeRemovedFrom.groupName + timestamp;
    suite.register(testdata.testName)
        .withBounds(testdata.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToGroupManagement();
            adminUI.addNewGroup(groupName1,
                testdata.groupToRemove.displayName);
            util.expectSuccessNotif('Successfully created group.');
            adminUI.addNewGroup(groupName2,
                testdata.groupToBeRemovedFrom.displayName);
            util.expectSuccessNotif('Successfully created group.');
            blinkList.selectItemByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName2);
            adminUI.selectGroupInGroupPanel(groupName1);
            adminUI.save();
            return util.expectSuccessNotif('Successfully updated group.');
        })
        .then(function() {
            blinkList.selectItemByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName2);
            adminUI.selectGroupInGroupPanel(groupName1);
            adminUI.save();
            return util.expectSuccessNotif('Successfully updated group.');
        })
        .after(function() {
            adminUI.deleteGroups([ groupName1, groupName2 ]);
            return util.expectSuccessNotif('Successfully deleted groups.');
        })
});

suite.report();
