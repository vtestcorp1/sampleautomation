/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * Data management privileges scenarios
 *
 */

/*jslint node: true */
'use strict';

var adminUI = require('../admin-ui/admin-ui.js');
var blinkList = require('../list/blink-list.js');
var bootstrap = require('../libs/bootstrap-lib');
var dataUI = require('./data-ui');
var dialog = require('../dialog.js');
var common = require('../common.js');
var worksheet = require('../worksheets/worksheets');
var nav = common.navigation;
var util = common.util;

var PRIVILEGES = adminUI.privileges;
var worksheetName = '[test wks]';
var worksheetTable = 'CUSTOMER';
var groupName = '[0test group]';
var tablesToShare = [worksheetName, worksheetTable];

var userName = '[0testuser]',
    password = 'test';

describe('Permission checking for data management privileges', function (){

    beforeAll(function(){
        adminUI.loginAsAdmin();
    });

    beforeEach(function() {
        adminUI.goToUserManagement();
        adminUI.addNewUser(userName, userName, password, true);
        worksheet.createSimpleWorksheet([worksheetTable], worksheetName);
    });

    afterEach(function(){
        util.reLogin();
        adminUI.deleteUsers([userName]);
        adminUI.deleteGroups([groupName]);
        nav.goToUserDataSection();
        dataUI.deleteMetadataItems([worksheetName]);
        dialog.cleanupDialog();
    });

    it('User without dataManagement management cannot edit table', function() {

        var tooltipText = 'To edit data, ask your administrator for data management privilege';

        adminUI.addNewGroup(groupName, groupName, []);
        adminUI.goToGroupManagement();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectUserInGroupPanel(userName);
        adminUI.save();

        dataUI.shareTable(tablesToShare, [userName]);

        util.reLogin(userName, password);
        nav.goToUserDataSection();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, worksheetName);
        dataUI.hoverOnEditButton();
        bootstrap.tooltip.waitForToolTipContainingText(tooltipText);
    });
    it('User with dataManagement privileges can edit table', function(){

        adminUI.goToGroupManagement();
        adminUI.addNewGroup(groupName, groupName, [PRIVILEGES[4]]);
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
        adminUI.selectUserInGroupPanel(userName);
        adminUI.save();

        dataUI.shareTable(tablesToShare, [userName]);

        util.reLogin(userName, password);
        nav.goToUserDataSection();
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, worksheetName);
        util.waitForElementCountToBe(dataUI.locators.DISABLED_METADATA_EDIT_BTN, 0);
    });
});
