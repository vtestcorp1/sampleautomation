/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois Chabbey(francois.chabbey@thoughtspot.com)
 */

'use strict';

var common = require('../common');
var admin = require('../admin-ui/admin-ui');
var answer = require('../answers/answer-list-page');
var answerViz = require('../viz-layout/answer/answer');
var actionButtons = require ('../actions-button.js');
var dialog = require('../dialog');
var nav = common.navigation;
var util = common.util;

var answerToReplay = {
    name: 'Brand Revenue II',
    answerDescription: 'Annual Brand Revenue Table and Revenue Distribution by Brand Column Chart',
    answerAuthor: 'Guest'
};
var replayTitle = 'Replay Search';
var missingUnderlyingAccessTitle = 'Cannot replay search';

describe('Replay scenarios ', function () {
    beforeEach(function () {
        nav.goToAnswerSection();
    });

    it('should show the replay button for a given answer', function () {
        answer.goToSavedAnswer(answerToReplay.name);
        actionButtons.checkIfButtonIsEnabled(actionButtons.actionLabels.REPLAY_SEARCH);
    });

    it('[SMOKE][IE] should show the replay dialog after clicking on replay', function () {
        answer.goToSavedAnswer(answerToReplay.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.REPLAY_SEARCH);
        dialog.waitForDialogTitle(replayTitle);
        dialog.waitForFieldContaining(answerToReplay.name);
        dialog.waitForFieldContaining(answerToReplay.answerDescription);
        dialog.waitForFieldContaining(answerToReplay.answerAuthor);
        dialog.closeDialog();
        answerViz.waitForAnswerTitle(answerToReplay.name);
    });

    it('should show the corrrect dialog, if user has no underlying access', function() {
        var newUser = '[testuser]';
        admin.addNewUser(newUser, newUser, newUser, true);
        answer.shareAnswer(answerToReplay.name, [newUser], true);
        util.reLogin(newUser, newUser);
        answer.goToSavedAnswer(answerToReplay.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.REPLAY_SEARCH);
        dialog.waitForDialogTitle(missingUnderlyingAccessTitle);
        dialog.clickPrimaryButton(true);
        answerViz.waitForAnswerTitle(answerToReplay.name);
        // TODO(chab) uncomment when fixed, currently user lands on a blank page
        /*
        answer.goToSavedAnswer(answerToReplay.answerName);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.REPLAY_SEARCH);
        dialog.waitForDialogTitle(missingUnderlyingAccessTitle);
        dialog.clickOkButton();*/
        util.reLogin();
        nav.goToAdminSection();
        admin.deleteUsers([newUser]);
    });
    /*
    it('should do correct replay', function() {
        // TBD
    });*/
});
