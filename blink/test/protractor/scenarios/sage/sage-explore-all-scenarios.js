/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Archit Bansal(archit.bansal@thoughtspot.com)
 * Francois Chabbey(francois.chabey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving sage.
 */

'use strict';

var admin = require('../admin-ui/admin-ui');
var answer = require('../viz-layout/answer/answer.js');
var common = require('../common.js');
var leftPanel = require('./data-panel/data-panel.js');

var nav = common.navigation;
var util = common.util;

describe("Explore all data button", function() {

    it("[SMOKE][IE] should be enabled and show no warning if user has access to some data source",function() {
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.expectExploreDatasButtonToBeEnabled();
        leftPanel.expectPanelToHaveNoWarning();
    });

    it("should be disabled if user has access to no data sources", function() {
        var userName = '[usertest]';
        nav.goToAdminSection();
        admin.goToUserManagement();
        admin.addNewUser(userName , userName, userName, true);
        util.reLogin(userName, userName); // user with no groups and no shares
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.expectExploreDatasButtonToBeDisabled();
        leftPanel.expectPanelToHaveWarning();
        util.reLogin();
        admin.goToUserManagement();
        admin.deleteListItem(userName);
    });
});
