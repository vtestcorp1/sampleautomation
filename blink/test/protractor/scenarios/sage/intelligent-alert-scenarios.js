/**
 * Copyright: ThoughtSpot Inc. 2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving sage autocomplete cases.
 */

'use strict';

var answers = require('../viz-layout/answer/answer.js');
var common = require('../common.js');
var sage = require('./sage');
var leftPanel = require('./data-panel/data-panel');

var nav = common.navigation;
var util = common.util;

describe('Sage intelligent error bubble cases', function () {

    beforeAll(function() {
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
    });

    beforeEach(function() {
        nav.goToQuestionSection();
    });

    afterAll(function() {
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
    });


    it('[SMOKE][IE] should indicate there is an error, and show error bubble for "revex"', function () {
        sage.sageInputElement.enter('revex ');
        sage.waitForErrorIcon();
        sage.clickOnSageIcon();
        sage.waitForErrorBubble();
        sage.clickOnSageIcon();
        sage.waitForInvisibilityOfErrorBubble();
    });

    it('should show a bubble when hovering over a token', function () {
        sage.sageInputElement.enter('revenue color');
        answers.waitForAnswerToLoad();
        // click somewhere to loose focus
        $('.bk-sage-data-columns .bk-search-input').click();
        util.waitForElementCountToBe(sage.selectors.BOXED_TOKEN, 2);
        sage.hoverOverPhrase(0);
        util.waitForElementCountToBe(sage.selectors.DELETE_TOKEN_BTN, 2);
        util.waitForVisibilityOf($$(sage.selectors.DELETE_TOKEN_BTN).first());
        util.waitForInvisibilityOf($$(sage.selectors.DELETE_TOKEN_BTN).get(1));
        sage.hoverOverPhrase(1);
        util.waitForElementCountToBe(sage.selectors.DELETE_TOKEN_BTN, 2);
        util.waitForInvisibilityOf($$(sage.selectors.DELETE_TOKEN_BTN).first());
        util.waitForVisibilityOf($$(sage.selectors.DELETE_TOKEN_BTN).get(1));
    });
});
