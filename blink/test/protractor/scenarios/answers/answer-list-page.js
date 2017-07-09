/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer.js');
var blinkList = require('../list/blink-list.js');
var common = require('../common.js');
var dialog = require('../dialog.js');
var sage = require('../sage/sage.js').sageInputElement;
var share = require('../share/share-ui.js');

module.exports = (function () {
    return {
        searchForAnswer: function (answerName) {
            var listSelector = blinkList.selectors.ACTIONABLE_LIST_CONTENT;
            blinkList.searchFor(listSelector, answerName);
            return common.util.waitForElement(
                blinkList.getItemLocatorByName(listSelector, answerName));
        },
        clickOnAnswer: function (answerName) {
            return blinkList.clickItemByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, answerName);
        },
        goToSavedAnswer: function (answerName) {
            common.navigation.goToAnswerSection();
            common.util.waitForElement(by.css(blinkList.selectors.LIST_CONTAINER));
            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, answerName);
            return answerPage.waitForAnswerToLoad();
        },
        deleteAnswer: function(answerName) {
            common.navigation.goToAnswerSection();
            common.util.waitForElement(by.css(blinkList.selectors.LIST_CONTAINER));
            blinkList.deleteItemsByName(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT, [answerName]
            );
            return blinkList.waitForItemToNotBePresent(
                blinkList.selectors.ACTIONABLE_LIST_CONTENT,
                answerName
            );
        },
        goToAnswer: function() {
            common.navigation.goToQuestionSection();
        },
        shareAnswer: function(answerName, userNames, readOnly){
            common.navigation.goToAnswerSection();
            share.openSharePanel(answerName);
            share.selectPrincipalsInSharePanel(userNames, readOnly);
        },
        createAReadOnlyAnswer: function(userNames, answerName, query) {
            answerPage.createAndSaveAnswer(query, answerName);
            if (userNames && userNames.length > 0) {
                this.shareAnswer(answerName, userNames, true);
            }
        },
        createAnEditableAnswer: function(userNames, answerName, query) {
            answerPage.createAndSaveAnswer(query, answerName);
            if (userNames && userNames.length > 0) {
                this.shareAnswer(answerName, userNames, false);
            }
        },
        verifyAnswersExist: function (names) {
            common.navigation.goToAnswerSection();
            common.util.waitForElement(by.css(blinkList.selectors.LIST_CONTAINER));
            blinkList.checkItems(blinkList.selectors.ACTIONABLE_LIST_CONTENT, names);
        }
    };
})();
