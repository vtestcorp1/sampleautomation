/**
 * Copyright: ThoughtSpot Inc. 2016
 *
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

'use strict';

var adminUI = require('../admin-ui/admin-ui.js');
var blinklist = require('../list/blink-list');
var dataUI = require('../data-ui/data-ui');
var common = require('../common.js');
var share = require('./share-ui.js');

var nav = common.navigation;
var util = common.util;

describe('Share, Table scenarios', function() {
    beforeAll(function(){
        util.reLogin('guest', 'guest');
        nav.goToUserDataSection();
    });

    afterAll(function(){
        util.reLogin();
    });

    it('SCAL-18149 an user should be able to share accessible table', function () {
        nav.goToUserDataSection();
        //This will fail if user has no access
        share.openSharePanel('LINEORDER');
        share.closeSharePanel();
    });
});


describe('Share dialog', function() {

    afterAll(function(){
        util.reLogin();
    });

    it('should be able to share a specific column of user-defined table with user', function () {
        var tableName = 'User_Data_Transactions';
        var username = '[test]';
        var column = 'Amount';
        adminUI.addNewUser(username, username, username, true);
        nav.goToUserDataSection();
        share.openSharePanel(tableName);
        share.selectColumnOption();
        share.clickOnColumn(column);
        share.selectPrincipalsInSharePanel([username], true);
        util.reLogin(username, username);
        nav.goToUserDataSection();
        // should see one table
        expect(blinklist.getAllItemsNames().count()).toBe(1);
        dataUI.goToTableByName(tableName);
        // should see only one column
        // there are 2 rows because we have 2 grids due to frozen columns
        util.waitForElementCountToBe(dataUI.selectors.EXPLORER_SLICK_ROW, 2);
        util.reLogin();
        nav.goToAdminSection();
        adminUI.deleteUsers([username]);
    });
});
