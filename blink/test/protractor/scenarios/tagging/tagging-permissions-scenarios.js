/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal(rahul.paliwal@thoughtspot.com)
 * Francois Chabbey(francois.chabey@thoughtspot.com)
 *
 *
 * @fileoverview E2E scenarios for tagging
 */

'use strict';

var admin = require('../admin-ui/admin-ui');
var common = require('../common.js');
var nav = common.navigation;
var util = common.util;
var leftPanel = require('../sage/data-panel/data-panel.js');
var base = require('../../base-do-not-use.js');
var answer = require('../viz-layout/answer/answer.js');
var answerListPage = require('../answers/answer-list-page');
var tag = require('./tag');

describe('Label tagging', function () {

    it('should not be allowed to create new labels by a non-admin user', function () {
        var labelName = '[Apple]';
        // Login as guest/guest and assert that label creation is not allowed.
        util.reLogin('guest', 'guest');
        nav.goToAnswerSection();
        tag.showLabelPanel();
        //expect(element(hidden(TOP_MENU_LABEL_PANEL + ' .bk-add-new-item')).count()).toBe(1);
        util.waitForInvisibilityOf(tag.selectors.TOP_MENU_LABEL_PANEL + ' .bk-add-new-item');
        // Login as admin/admin and create a new label.
        util.reLogin();
        nav.goToAnswerSection();
        tag.showLabelPanel();
        util.waitForVisibilityOf(tag.selectors.TOP_MENU_LABEL_PANEL + ' .bk-add-new-item');
        tag.addLabel(labelName);
        tag.verifyLabelExists(labelName);
        tag.deleteLabel(labelName);
        tag.verifyLabelDoesNotExist(labelName);
    });

    it('should not be allowed to delete existing labels by a non-admin user', function () {
        var labelName = '[Apple]';

        nav.goToAnswerSection();
        tag.showLabelPanel();
        tag.addLabel(labelName);

        // Login as guest/guest and assert that existing label can't be modified or deleted.
        util.reLogin('guest', 'guest');
        nav.goToAnswerSection();
        tag.showLabelPanel();
        util.waitForInvisibilityOf($(tag.selectors.TOP_MENU_LABEL_PANEL + ' .bk-add-new-item'));
        // Login as admin/admin and modify an existing label name/color. Delete an existing label.
        util.reLogin();
        nav.goToAnswerSection();
        tag.showLabelPanel();
        util.waitForVisibilityOf($(tag.selectors.TOP_MENU_LABEL_PANEL + ' .bk-add-new-item'));
        tag.deleteLabel(labelName);
    });


    it('[SMOKE][IE] should only allow to tag/untag an editable object', function () {
        var guestUser = 'Guest4';
        var sageQuery = 'revenue color';
        var answerName = '[Test Answer]';
        var labelName = '[Apple]';

        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
        leftPanel.selectSource('PART');

        // Create a new answer and share in edit mode with guest.
        answerListPage.createAnEditableAnswer([guestUser], answerName,sageQuery);
        nav.goToAnswerSection();
        tag.showLabelPanel();
        tag.addLabel(labelName);

        // Login as guest and tag the shared object.
        // Also verify that guest can untag the shared object.
        util.reLogin('guest4', 'guest4');
        nav.goToAnswerSection();
        tag.tagItemWithLabel(answerName, labelName);
        tag.untagItemFromLabel(answerName, labelName);

        util.reLogin();
        nav.goToAnswerSection();
        tag.showLabelPanel();
        tag.deleteLabel(labelName);
        answerListPage.deleteAnswer(answerName);
    });
});
