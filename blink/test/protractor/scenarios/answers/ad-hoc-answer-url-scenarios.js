/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E tests for adhoc answer url tests.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var charts = require('../charts/charts');
var common = require('../common');
var leftPanel = require('../sage/data-panel/data-panel');
var sage = require('../sage/sage');
var pinboards = require('../pinboards/pinboards');

describe('Ad-hoc answer url use cases', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    it('should be able to answer with hidden column is locked for user', function () {
        var query = 'commit date daily discount';
        var sources = ['LINEORDER'];
        var saveAns = 'vtest_C6195';

        answerPage.doAdhocQueryline(query, sources, charts.chartTypes.LINE);
        pinboards.saveAction(saveAns);
        common.navigation.goToAnswerSection();

    });

    it('should behave right with back and forward history navigation', function () {
        var query1 = 'revenue color';
        var query2 = 'revenue brand1';
        answerPage.queryAndWaitForAnswer(query1);
        answerPage.queryAndWaitForAnswer(query2);
        common.navigation.goBackInHistory();
        sage.sageInputElement.waitForValueToBe(query1);
        answerPage.waitForAnswerWithQuery(query1);
        common.navigation.goBackInHistory();
        common.util.checkForPath('/answer/');
        sage.sageInputElement.waitForValueToBe('');
        common.navigation.goForward();
        sage.sageInputElement.waitForValueToBe(query1);
        answerPage.waitForAnswerWithQuery(query1);
    });

    it('should behave right when navigating to a non-answer page and ' +
        'coming back via back button', function () {
        var query1 = 'revenue color';
        answerPage.queryAndWaitForAnswer(query1);
        common.navigation.goToHome();
        common.navigation.goBackInHistory();
        sage.sageInputElement.waitForValueToBe(query1);
        answerPage.waitForAnswerWithQuery(query1);
    });

    it('should update phrase boxes when going back and forward', function () {
        var query1 = 'revenue color';
        answerPage.queryAndWaitForAnswer(query1);
        sage.sageInputElement.blur();
        sage.waitForPhraseContainingText('revenue');
        sage.waitForPhraseContainingText('color');

        var query2 = 'tax color';
        sage.sageInputElement.enter(query2);
        sage.sageInputElement.blur();
        sage.waitForPhraseContainingText('tax');
        sage.waitForPhraseContainingText('color');

        common.navigation.goBackInHistory();
        answerPage.waitForAnswerWithQuery(query1);
        sage.waitForPhraseContainingText('revenue');
        sage.waitForPhraseContainingText('color');

        common.navigation.goForward();
        answerPage.waitForAnswerWithQuery(query2);
        sage.waitForPhraseContainingText('tax');
        sage.waitForPhraseContainingText('color');
    });

    it('should clear the answer page on back to answer', function () {
        var query = 'revenue color';
        answerPage.queryAndWaitForAnswer(query);
        common.navigation.goBackInHistory();
        common.util.checkForPath('/answer/');
        sage.sageInputElement.waitForValueToBe('');
    });

    it('should clear the answer page on answer tab click', function () {
        var query = 'revenue color';
        answerPage.queryAndWaitForAnswer(query);
        common.navigation.goToQuestionSection();
        sage.sageInputElement.waitForValueToBe('');
        common.util.checkForPath('/answer/');
    });

    it('should navigate to empty answer page on junk sage context id', function () {
        common.navigation.goToHome();
        common.navigation.goToInAppPath('/answer/23214324234');
        sage.sageInputElement.waitForValueToBe('');
        common.util.checkForPath('/answer/');
    });
});
