/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var adminUI = require('../../scenarios/admin-ui/admin-ui.js');
var benchmark = require('./../benchmark.js');
var common = require('../../scenarios/common.js');
var dataset = browser.params.dataset.userManagementScenarios;
var nav = common.navigation;
var util = common.util;

var suite = benchmark.suite('add-non-admin-user');

dataset.addNonAdminUsers.forEach(function (input) {
    var user = input.user;
    var timestamp = new Date().getTime();
    var userName = user.userName + timestamp;
    suite.register(user.userName)
        // TODO(Rahul): Adding a reload app step to avert impact on test
        // measurements due to memory bloats from previous tests.
        .beforeAll(common.navigation.reloadApp)
        .afterAll(common.navigation.reloadApp)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            return adminUI.goToUserManagement();
        })
        .then(function() {
            adminUI.addNewUser(
                user.displayName, userName, user.password, true);
            return util.expectSuccessNotif('Successfully created user.');
        })
        .after(function() {
            adminUI.deleteUsers([userName]);
            return util.expectSuccessNotif('Successfully deleted users.');
        })
});

suite.report();


var suite = benchmark.suite('add-admin-user');

dataset.addAdminUsers.forEach(function (input) {
    var user = input.user;
    var timestamp = new Date().getTime();
    var userName = user.userName + timestamp;
    suite.register(user.userName)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            return adminUI.goToUserManagement();
        })
        .then(function() {
            adminUI.addNewUser(
                user.displayName, userName, user.password,
                true,  /* Add user */
                false, /* dontConfirmpassword */
                'adminuser@test.com', /* email */
                [adminUI.defaultGroups.ADMIN.name]);
            return util.expectSuccessNotif('Successfully created user.');
        })
        .after(function() {
            adminUI.deleteUsers([userName]);
            return util.expectSuccessNotif('Successfully deleted users.');
        })
});

suite.report();


var suite = benchmark.suite('delete-non-admin-user');

dataset.deleteNonAdminUsers.forEach(function (input) {
    var user = input.user;
    var timestamp = new Date().getTime();
    var userName = user.userName + timestamp;
    suite.register(user.userName)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToUserManagement();
            adminUI.addNewUser(
                user.displayName, userName, user.password, true);
            return util.expectSuccessNotif('Successfully created user.');
        })
        .then(function() {
            adminUI.deleteUsers([userName]);
            return util.expectSuccessNotif('Successfully deleted users.');
        });
});

suite.report();


var suite = benchmark.suite('delete-admin-user');

dataset.deleteAdminUsers.forEach(function (input) {
    var user = input.user;
    var timestamp = new Date().getTime();
    var userName = user.userName + timestamp;
    suite.register(user.userName)
        .withBounds(input.bounds)
        .before(function() {
            nav.goToAdminSection();
            adminUI.goToUserManagement();
            adminUI.addNewUser(
                user.displayName, userName, user.password,
                true,  /* Add user */
                false, /* dontConfirmpassword */
                'adminuser@test.com', /* email */
                [adminUI.defaultGroups.ADMIN.name]);
            return util.expectSuccessNotif('Successfully created user.');
        })
        .then(function() {
            adminUI.deleteUsers([userName]);
            return util.expectSuccessNotif('Successfully deleted users.');
        });
});

suite.report();
