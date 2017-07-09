/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Archit Bansal (archit.bansal@thoughtspot.com)
 */

'use strict';

let common = require('../common');
let sage = require('./sage');
let dataPanel = require('./data-panel/data-panel');
let answer = require('../viz-layout/answer/answer');
let searchDoctor = require('../search-doctor/search-doctor');
let util = require('../common').util;

describe('Sage Autocomplete ', function () {
    beforeAll(function () {
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER', 'DATE', 'PART', 'CUSTOMER', 'SUPPLIER']);
        dataPanel.clickDone();
    });

    it('[SMOKE][IE] should complete "revenue" types "r" in sage input', function () {
        sage.sageInputElement.enter('r');
        sage.waitForSageDropdownItem('revenue');
    });

    it('should show single completion when "for" keyword is used (revenue for customer region eu)', function () {
        sage.sageInputElement.enter('revenue for customer region eu');
        sage.waitForSageSuggestionItem('europe', 'Customer Region');
        sage.waitForSageSuggestionCountToBe(1);
    });

    it('should show multiple completions when "for" keyword is not used (revenue customer region eu)', function () {
        sage.sageInputElement.enter('revenue customer region eu');
        // Expect the autocomplete dropdown to contain more than 2 completions which will have 'eu' in it, but
        // not necessarily as a prefix.
        sage.waitForSageSuggestionItem('europe', '2 matches');
    });

    it('should not show ghost on error', function () {
        sage.sageInputElement.enter('order total price');
        // There should be a ghost in this case.
        sage.waitForGhostTextToBePresent();
        sage.sageInputElement.enter('order total price growth of');
        sage.waitForErrorIcon();
        sage.waitForGhostTextToBeAbsent();
    });

    it('should not box incomplete phrase', function() {
        sage.sageInputElement.enter('revenue col');
        sage.sageInputElement.blur();
        sage.waitForPhraseContainingText('revenue');
        sage.waitForCompletePhraseCountToBe(1);
        sage.waitForIncompletePhraseContainingText('col');
        sage.waitForIncompletePhraseCountToBe(1);
    });

    it('should show completions on opening answer page', function() {
        common.navigation.goToHome();
        common.navigation.goToQuestionSection();
        sage.waitForSageDropdown();
    });

    // TODO(rahul): Fix the test.
    xit('[SMOKE] should move on to next index suggestions ' +
        'upon resolving suggestions on a particular index', function () {
        sage.sageInputElement.enter('revenue last year');
        sage.selectSageDropdownItem('last year', 'Commit Date');

        sage.sageInputElement.waitForValueToBe('revenue last year');
        answer.waitForAnswerWithQuery('revenue last year');

        sage.waitForSageDropdownItem('discount', 'Lineorder');

        sage.selectSageDropdownItem('discount', 'Lineorder');
        sage.sageInputElement.waitForValueToBe('revenue last year discount');
        answer.waitForAnswerWithQuery('revenue last year discount');
    });

    it('should update the sage bar correctly on clicking multi-word folded completions', function () {
        // Within a sage session history auto-disambiguates `last day` from the previous test.
        // To maintain the test independent of the previous one, we go once away from the answer
        // page and come once again to start a new answer session.
        common.navigation.goToPinboardsSection();
        common.navigation.goToQuestionSection();
        sage.sageInputElement.enter('revenue last day color');
        sage.selectSageDropdownItem('last day', 'Commit Date');

        sage.sageInputElement.waitForValueToBe('revenue last day color');
        answer.waitForAnswerWithQuery('revenue last day color');

        sage.sageInputElement.hideDropdown();
        sage.clickPhraseContainingText('last day');
        sage.selectSageDropdownItem('last day', '3 matches');
        sage.selectSageDropdownItem('last day', 'Order Date');

        sage.sageInputElement.waitForValueToBe('revenue last day color');
        answer.waitForAnswerWithQuery('revenue last day color');
    });

    it('should show only exact matches on expanding a list already showing exact matches', function() {
        dataPanel.openChooseSourcesDialog();
        dataPanel.deselectAllSources();
        dataPanel.selectAllCheckbox();
        dataPanel.clickDone();

        sage.sageInputElement.enter('line number');
        // Expect folded completions
        sage.waitForSageSuggestionItem('line number', '5 matches');
        // Click on folded completions
        sage.selectSageSuggestionItem('line number', '5 matches');
        // Expect 9 exact matches
        sage.waitForDropdownItemCountContainingTextToBe('line number', 5);
    });

    it('should select the first suggestion when pressing return', function() {
        dataPanel.openChooseSourcesDialog();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['CUSTOMER']);
        dataPanel.clickDone();
        sage.sageInputElement.enter('Custome');
        sage.sageInputElement.append(protractor.Key.ENTER);
        answer.waitForAnswerToLoad();
        sage.waitForCompletePhraseContainingText('customer region');
    });

    it('should box token if all tokens are recognized, when pressing return', function() {
        dataPanel.openChooseSourcesDialog();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['CUSTOMER']);
        dataPanel.clickDone();
        sage.sageInputElement.enter('customer'); // Sage can be stuck if we go too fast
        sage.sageInputElement.append(' region');
        sage.waitForSageDropdown();
        answer.waitForAnswerToLoad();
        // if the answer press ENTER and the answer is not there, tokens will not be boxed
        sage.sageInputElement.append(protractor.Key.ENTER);

        sage.waitForCompletePhraseContainingText('customer');
    });

    it('should go to search doctor, when pressing return and first suggestion is folded', function() {
        dataPanel.openAndChooseSources(['CUSTOMER',
            'Generic-NonGeneric-2',
            'Generic-NonGeneric-3'
        ]);
        dataPanel.clickDone();
        sage.sageInputElement.enter('custome');
        sage.waitForSageDropdown();
        sage.sageInputElement.append(protractor.Key.ENTER);
        searchDoctor.waitForSearchDoctor();
    });

    it('should go to search doctor when pressing return with more than 2 unrecognized tokens', function() {
        dataPanel.openChooseSourcesDialog();
        dataPanel.selectAllSources();
        dataPanel.clickDone();
        sage.sageInputElement.enter('produc prout');
        sage.waitForSageDropdownItem('Product');
        sage.sageInputElement.append(protractor.Key.ENTER);
        searchDoctor.waitForSearchDoctor();
    });
});
