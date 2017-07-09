/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Archit Bansal(archit.bansal@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving sage.
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var sage = require('./sage.js');
var common = require('../common.js');
var util = common.util;
var dataPanel = require('./data-panel/data-panel.js');
var answer = require('../viz-layout/answer/answer.js');
var leftPanel = require('./data-panel/data-panel.js');
var answerPage = require('../viz-layout/answer/answer.js');
var table = require('../table/table.js');

describe('Sage autocomplete dropdown cases', function() {

    beforeEach(function () {
        common.navigation.goToHome();
        common.navigation.goToQuestionSection();
    });

    it('should show feedback option in dropdown and submit it properly', function () {
        // Enable Feedback.
        browser.getCurrentUrl().then(function (url) {
            var enableFeebackUrl = url.replace('#/answer/','&enableSageUserFeedback=true#/answer/');
            browser.get(enableFeebackUrl);
        });

        util.waitForElement(sage.locators.ANSWER_LINK);
        sage.sageInputElement.click();

        // Type "r" into sage input
        sage.sageInputElement.enter('r');
        util.waitForElement(sage.locators.SAGE_FEEDBACK_ITEM_LABEL);

        // Expect 1 feedback item in dropdown with correct text.
        expect(element.all(sage.locators.SAGE_FEEDBACK_ITEM_LABEL).count()).toBe(1);
        expect(element(sage.locators.SAGE_FEEDBACK_ITEM_LABEL).getText()).toBe('Don\'t see any useful suggestion? Share your wrath!');

        // Click on Feedback item.
        element(sage.locators.SAGE_FEEDBACK_ITEM_LABEL).click();
        util.waitForElement(sage.locators.SAGE_FEEDBACK_DIALOG);

        // Expect submit button to be present and disabled.
        expect(element.all(common.dialog.locators.PRIMARY_DLG_BTN).count()).toBe(1);
        expect(element.all(common.dialog.locators.PRIMARY_DLG_BTN_DISABLED).count()).toBe(1);

        // Select a rating and submit
        element(sage.locators.SAGE_FEEDBACK_SELECT_A_RATING).click();
        element(by.cssContainingText(sage.selectors.SAGE_FEEDBACK_RATING_CHOICE, 'BAD')).click();

        // Expect submit button to be enabled.
        expect(element.all(common.dialog.locators.PRIMARY_DLG_BTN).count()).toBe(1);
        expect(element.all(common.dialog.locators.PRIMARY_DLG_BTN_DISABLED).count()).toBe(0);

        // Submit the feedback
        element(common.dialog.locators.PRIMARY_DLG_BTN).click();
        util.waitForElement(common.util.selectors.SUCCESS_NOTIF);

        // Expect a success notification with correct text.
        util.expectAndDismissSuccessNotif('Thanks for your feedback!');
    });

    xit('should get full lineage for completions that are synonyms of columns', function() {
        util.waitForElement(sage.locators.ANSWER_LINK);
        sage.sageInputElement.click();
        // Type "price red" into sage input
        // "price reduction" is a synonym of "discount".
        sage.sageInputElement.enter('price redu');
        // Wait for the drop down to show up.
        util.waitForElement(sage.locators.SAGE_SUGGESTION_ITEM);
        // Verifying that there are non-zero completions.
        expect(element.all(sage.locators.SAGE_SUGGESTION_ITEM).count()).toBeGreaterThan(0);
        // Verifying that the complete lineage is present for the suggestion.
        common.util.expectCaseInsensitiveEquals(element.all(sage.locators.SAGE_SUGGESTION_ITEM).get(0).getText(), 'price reduction - Discount in Lineorder');
    });

    it('should group by date column if column is present in the filter phrase', function(){
        util.waitForElement(sage.locators.ANSWER_LINK);
        var query = "revenue commit date 24 years ago";
        var sourcesList = ['LINEORDER'];
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(sourcesList);
        leftPanel.clickDone();
        sage.sageInputElement.enter(query).then(function(){
            answerPage.waitForAnswerToLoad();
            answerPage.selectTableType();
            util.waitForElement(sage.locators.VIZ_COLUMNS_HEADERS_NAMES);
            // What I wanted to assert here was that we group by the date column as well.
            // That is asserted when there are two columns (one for measure and the other
            // for date column) in the response. This way it is more resilient to:
            // 1. Formatting changes.
            // 2. Data changes.
            expect(element.all(sage.locators.VIZ_COLUMNS_HEADERS_NAMES).count()).toBe(2);
        });
    });

    it('should group by date column if column is present in the filter phrase', function(){
        util.waitForElement(sage.locators.ANSWER_LINK);
        var query = "revenue customer region = asia";
        var sourcesList = ['LINEORDER', 'CUSTOMER'];
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(sourcesList);
        leftPanel.clickDone();
        sage.sageInputElement.enter(query).then(function(){
            answerPage.waitForAnswerToLoad();
            answerPage.selectTableType();
            util.waitForElement(sage.locators.VIZ_COLUMNS_HEADERS_NAMES);
            expect(element.all(sage.locators.VIZ_COLUMNS_HEADERS_NAMES).count()).toBe(2);
            common.util.expectCaseInsensitiveEquals(element.all(sage.locators.VIZ_COLUMNS_HEADERS_NAMES)
                .get(1).getText(), 'Revenue');
        });
    });

    it('[SMOKE][IE] should show the source removal confirmation popup only once', function() {
        common.navigation.goToAnswerSection();
        answer.openAnswerByName('Brand Revenue II');
        dataPanel.openAndChooseSources(['LINEORDER'], ['PART']);
        expect(element(common.util.locators.AUTO_POPUP).isPresent()).toBe(true);
        // expect panel is there
        dataPanel.confirmSourceRemoval();
        dataPanel.selectSource('PART');
        expect(element(common.util.locators.AUTO_POPUP).isPresent()).toBe(false);
    });

    it('should be able to disambiguate edit in the middle of duplicate completions', function () {
        common.navigation.goToQuestionSection();
        var sourcesList = ['LINEORDER', 'DATE'];
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(sourcesList);
        leftPanel.clickDone();
        sage.sageInputElement.enter('revenue quarterly tax');
        sage.selectSageSuggestionItem('quarterly', 'Commit Date');
        answer.waitForAnswerWithQuery('revenue quarterly tax');
        answer.selectTableType();
        table.waitForTableColumnCountToBe(null, 3);
        table.waitForTableColumnAtIndex(0, 'Commit Date');
        sage.clickPhraseContainingText('quarterly');
        sage.selectSageSuggestionItem('quarterly', '3 matches');
        sage.selectSageSuggestionItem('quarterly', 'Order Date');
        table.waitForTableColumnAtIndex(0, 'Order Date');
    });

    it('should show small dropdown for token selection in duplication scenario', function () {
        common.navigation.goToQuestionSection();
        var sourcesList = ['PRODUCTS', 'PURCHASES'];
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(sourcesList);
        leftPanel.clickDone();
        sage.sageInputElement.enter('product id product id');
        sage.selectSageSuggestionItem('product id', 'in Purchases');
        answer.waitForAnswerWithQuery('product id product id');
        answer.selectTableType();
        table.waitForTableColumnCountToBe(null, 1);
        sage.clickPhraseContainingText('product id');
        sage.selectSageSuggestionItem('product id', 'in Products');
        table.waitForTableColumnCountToBe(null, 2);
    });

    it('[SMOKE][IE] should show correct out-of-scope message', function() {
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
        sage.sageInputElement.enter('ord');
        sage.waitForOutOfScopeMessage(sage.outOfScopeMessage.NO_SOURCES);
        sage.selectSageDropdownItem('orderkey', 'in Lineorder');
        answer.waitForAnswerToLoad();
        sage.sageInputElement.enter('brand');
        sage.waitForOutOfScopeMessage(sage.outOfScopeMessage.OUT_OF_SCOPE);
    })

});
