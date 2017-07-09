/**
 * Copyright: ThoughtSpot Inc. 2016
 *
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var adminUI = require('../admin-ui/admin-ui.js');
var common = require('../common.js');
var dialog = require('../dialog.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var pinboards = require('../pinboards/pinboards');
var sage = require('../sage/sage.js');
var share = require('./share-ui.js');
var nav = common.navigation;
var util = common.util;

var SHARE_USER = '[testshare user]',
    GROUP_NAME = '[testshare group]',
    USERS_TO_SHARE_WITH = [SHARE_USER, 'guest1', 'guest2', 'rlsgroup1user'],
    USERS_IN_GROUP = [SHARE_USER, 'guest1', 'guest3', 'rlsgroup1user', 'guest4'],
    VISIBLE_USERS = ['guest1', 'rlsgroup1user'],
    NOT_VISIBLE_USERS = ['guest2'],
    ANSWER_TO_SHARE = '[testshare Answer]',
    PRIVILEGES = adminUI.privileges;

describe('Share Access', function(){

    beforeEach(function () {
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
        leftPanel.selectSource('PART');
        leftPanel.clickDone();
    });

    afterEach(function () {
        adminUI.loginAsAdmin();
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        nav.goToAnswerSection();
        adminUI.deleteListItem(ANSWER_TO_SHARE);
        nav.goToAdminSection();
        adminUI.goToUserManagement();
        adminUI.deleteListItem(SHARE_USER);
        adminUI.goToGroupManagement();
        adminUI.deleteListItem(GROUP_NAME);
    });

    xit('[SMOKE] Users can only see the sharing of the users he has access to', function () {
        adminUI.goToUserManagement();
        adminUI.addNewUser(SHARE_USER, SHARE_USER, SHARE_USER, true);
        adminUI.goToGroupManagement();
        adminUI.addNewGroup(GROUP_NAME);
        adminUI.selectPrincipal(GROUP_NAME);
        USERS_IN_GROUP.forEach(function(userName){
            adminUI.selectUserInGroupPanel(userName);
        });
        adminUI.save();

        answerListPage.createAReadOnlyAnswer(USERS_TO_SHARE_WITH, ANSWER_TO_SHARE, 'revenue color');
        util.reLogin(SHARE_USER, SHARE_USER);
        nav.goToAnswerSection();
        share.openSharePanel(ANSWER_TO_SHARE);
        VISIBLE_USERS.forEach(function(userName){
            expect(share.permissionWithPrincipal(userName).count()).toBe(1);
        });
        share.closeSharePanel();
    });

    it('Users with share with everybody privileges should see everybody', function() {
        adminUI.goToUserManagement();
        adminUI.addNewUser(SHARE_USER, SHARE_USER, SHARE_USER, true);
        adminUI.goToGroupManagement();
        adminUI.addNewGroup(GROUP_NAME);
        adminUI.selectPrincipal(GROUP_NAME);
        USERS_IN_GROUP.forEach(function(userName){
            adminUI.selectUserInGroupPanel(userName);
        });
        adminUI.selectPrivilege(PRIVILEGES[3]);
        adminUI.save();
        answerListPage.createAReadOnlyAnswer(USERS_TO_SHARE_WITH, ANSWER_TO_SHARE, 'revenue color');
        util.reLogin(SHARE_USER, SHARE_USER);
        nav.goToAnswerSection();
        share.openSharePanel(ANSWER_TO_SHARE);
        VISIBLE_USERS.forEach(function(userName){
            expect(share.permissionWithPrincipal(userName).count()).toBe(1);
        });
        NOT_VISIBLE_USERS.forEach(function(userName){
            expect(share.permissionWithPrincipal(userName).count()).toBe(1);
        });
        share.closeSharePanel();
    });

    it('Admin user can see everybody when sharing', function(){
        adminUI.goToUserManagement();
        adminUI.addNewUser(SHARE_USER, SHARE_USER, SHARE_USER, true);
        adminUI.goToGroupManagement();
        adminUI.addNewGroup(GROUP_NAME);
        adminUI.selectPrincipal(GROUP_NAME);
        USERS_IN_GROUP.forEach(function(userName){
            adminUI.selectUserInGroupPanel(userName);
        });
        adminUI.selectPrivilege(PRIVILEGES[0]);
        adminUI.save();
        answerListPage.createAReadOnlyAnswer(USERS_TO_SHARE_WITH, ANSWER_TO_SHARE, 'revenue color');
        util.reLogin(SHARE_USER, SHARE_USER);
        nav.goToAnswerSection();
        share.openSharePanel(ANSWER_TO_SHARE);
        VISIBLE_USERS.forEach(function(userName){
            expect(share.permissionWithPrincipal(userName).count()).toBe(1);
        });
        NOT_VISIBLE_USERS.forEach(function(userName){
            expect(share.permissionWithPrincipal(userName).count()).toBe(1);
        });
        share.closeSharePanel();
    });
});


describe('Share Access', function() {

    beforeEach(function () {
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
        leftPanel.selectSource('PART');
        leftPanel.clickDone();
    });

    it('Panel and dropdown should display "names" and "displayNames"', function () {
        adminUI.goToUserManagement();
        var displayName = '[displayName]',
            userName = '[username]';
        adminUI.addNewUser(displayName, userName, SHARE_USER, true);
        answerListPage.createAReadOnlyAnswer([], ANSWER_TO_SHARE, 'revenue color');
        nav.goToAnswerSection();
        share.openSharePanel(ANSWER_TO_SHARE);
        share.selectPrincipalsInSharePanel([displayName]);
        share.openSharePanel(ANSWER_TO_SHARE);
        expect(share.permissionWithPrincipal(displayName)
            .first().$(share.selectors.PRINCIPAL_NAME).getText()).toBe(userName);
        expect(share.permissionWithPrincipal(displayName)
            .first().$(share.selectors.PRINCIPAL_DISPLAY_NAME).getText()).toBe(displayName);
        share.closeSharePanel();
        answerListPage.deleteAnswer(ANSWER_TO_SHARE);
        nav.goToAdminSection();
        adminUI.deleteUsers([userName]);
    });
});
