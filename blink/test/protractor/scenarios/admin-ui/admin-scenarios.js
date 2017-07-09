/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var common = require('../common.js');
var dialog = require('../dialog');
var nav = common.navigation;
var util = common.util;
var checkbox = common.blinkCheckbox;
var adminUI = require('./admin-ui.js');
var actionButtons = require ('../actions-button.js');


describe('Access testing for users', function() {


    var displayName = '[0display name]',
        userName = '[0username]',
        password = '[password]';

    beforeEach(function () {
        nav.goToAdminSection();
    });

    afterEach(function ()    {

    });

    it('[SMOKE][IE] Worksheet route should not be available for user without data management privilege', function () {
        adminUI.goToUserManagement();
        adminUI.addNewUser(userName, userName, password, true);
        nav.goToInAppPath('/worksheet/create');
        util.checkForPath('/worksheet/create/');
        util.reLogin(userName, password);
        nav.goToInAppPath('/worksheet/create');
        util.waitForPath('/');
        adminUI.loginAsAdmin();
        adminUI.goToUserManagement();
        adminUI.deleteListItem(userName);
    });

    it("[SMOKE][IE] worksheet creation dropdown should be disabled", function(){
        adminUI.goToUserManagement();
        adminUI.addNewUser(userName, userName, password, true);
        nav.goToUserDataSection();
        actionButtons.checkIfButtonIsEnabled(actionButtons.actionLabels.CREATE_WORKSHEET);
        util.reLogin(userName, password);
        nav.goToUserDataSection();
        actionButtons.checkIfButtonIsDisabled(actionButtons.actionLabels.CREATE_WORKSHEET);
        adminUI.loginAsAdmin();
        adminUI.goToUserManagement();
        adminUI.deleteListItem(userName);
    });
});
