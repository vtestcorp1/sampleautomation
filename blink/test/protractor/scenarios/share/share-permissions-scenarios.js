/**
 * Copyright: ThoughtSpot Inc. 2016
 *
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

'use strict';

var action = require('../actions-button');
var answerListPage = require('../answers/answer-list-page.js');
var answerUtil = require('../viz-layout/answer/answer.js');
var adminUI = require('../admin-ui/admin-ui.js');
var common = require('../common.js');
var contentEditable = require('../widgets/content-editable');
var dialog = require('../dialog.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var pinboards = require('../pinboards/pinboards');
var sage = require('../sage/sage.js');
var share = require('./share-ui.js');

var nav = common.navigation;
var util = common.util;

var TEST_ANSWER = '[ Test Answer ]';

describe('Share, Permission enforcement', function(){


    //Note(chab) we navigate away from the question page to clear the state
    beforeAll(function(){
        nav.goToAnswerSection();
    });

    beforeEach(function () {
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
        leftPanel.selectSource('PART');
        leftPanel.clickDone();
    });

    var NEW_USER_LOGIN = 'guest1';
    it('[SMOKE][IE] should allow readonly user access to answer and basic interactions but no mutable operations', function () {
        sage.sageInputElement.fastEnter('');
        answerListPage.createAReadOnlyAnswer([NEW_USER_LOGIN], TEST_ANSWER, 'revenue color');
        util.reLogin(NEW_USER_LOGIN, NEW_USER_LOGIN);
        nav.goToAnswerSection();
        answerUtil.openAnswerByName(TEST_ANSWER);
        // Sage is enabled
        expect(element.all(sage.locators.SAGE).count()).toBe(1);
        // Should be able to add sources.
        leftPanel.openAndChooseSources(['CUSTOMER']);

        adminUI.loginAsAdmin();
        nav.goToAnswerSection();
        adminUI.deleteListItem(TEST_ANSWER);
    });

    it('[SMOKE][IE] should allow edit user access to answer with sage and access to mutable operations', function () {
        answerListPage.createAnEditableAnswer(
            [NEW_USER_LOGIN],
            TEST_ANSWER,
            'revenue color');

        util.reLogin(NEW_USER_LOGIN, NEW_USER_LOGIN);
        nav.goToAnswerSection();
        answerUtil.openAnswerByName(TEST_ANSWER);
        answerUtil.waitForAnswerToLoad();
        // Sage is enabled
        util.waitForVisibilityOf(sage.selectors.EDITABLE_SAGE);
        sage.sageInputElement.enter('revenue color tax');
        answerUtil.waitForAnswerToLoad();

        //util.mouseMoveToElement(answerUtil.selectors.ANSWER_TITLE);
        $(answerUtil.selectors.ANSWER_TITLE).click();

        // Enter a new title
        var updatedName = 'Editable user chart';
        var updatedDescription = 'Editable user chart description';
        contentEditable.enterDescription('.bk-answer-content', updatedDescription);
        contentEditable.enterText('.bk-answer-content', updatedName);

        // Change to existing permissions
        action.selectActionButtonAction(action.actionLabels.SHARE);
        // nothing should be disabled
        expect($$('.bk-permission-list ul li .bk-permission-type-drop-down[disabled=disabled]').count()).toBe(0);
        share.closeSharePanel();
        action.waitForBusyActionToComplete();
        action.selectActionButtonAction(action.actionLabels.SAVE);
        action.waitForBusyActionToComplete();
        util.expectAndDismissSuccessNotif();
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(updatedName);
        util.reLogin();
    });

    it('answers shared without permissions on base tables should be read only in sage', function() {
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
        answerListPage.createAnEditableAnswer(
            [NEW_USER_LOGIN],
            TEST_ANSWER,
            'sale cost product cost product name'
        );
        util.reLogin(NEW_USER_LOGIN, NEW_USER_LOGIN);
        nav.goToAnswerSection();
        answerUtil.openAnswerByName(TEST_ANSWER);
        answerUtil.waitForAnswerToLoad();
        // No editable sage
        util.waitForElementToNotBePresent(sage.selectors.EDITABLE_SAGE);
        util.waitForVisibilityOf(sage.selectors.READ_ONLY_SAGE);
        util.reLogin();
        answerListPage.deleteAnswer(TEST_ANSWER);
    });
});
