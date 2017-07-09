/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Amit Prakash (amit@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving editing in the middle of sage bar input.
 */

'use strict';

let common = require('../common');
let sage = require('./sage');
let headline = require('../viz-layout/headline/headline');
let answer = require('../viz-layout/answer/answer');
var leftPanel = require('./data-panel/data-panel');

describe('Sage edit in the middle ', function () {

    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    afterAll(function () {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    it('For query "revenue europe color" if we disambiguate europe ' +
        'it should not eat color away', function () {
        sage.sageInputElement.enter('revenue europe color');
        sage.waitForSageDropdown();
        headline.waitForHeadline('Revenue');
        // Expect the autocomplete dropdown to contain 2 options
        sage.waitForSageSuggestionItem('europe', 'Customer Region');
        sage.waitForSageSuggestionItem('europe', 'Supplier Region');
        // // Pick a suggestion
        sage.selectSageSuggestionItem('europe', 'Supplier Region');
        answer.waitForAnswerWithQuery('revenue europe color');
    });

    it('"revenue>1000 tax<=1" should work same as "revenue > 1000 tax <= 1"', function () {
        sage.sageInputElement.enter('revenue>1000 tax<=1');
        headline.waitForHeadline('Revenue');
        headline.waitForHeadline('Tax');
    });


    it('clicking on a recognized token should result in completions for that ' +
        'token positioned below it', function () {
        sage.sageInputElement.enter('revenue for ship mode = truck by color');
        answer.waitForAnswerWithQuery('revenue for ship mode = truck by color');
        sage.sageInputElement.setCaretAtPosition(27);
        //TODO(Rahul): Find a better way to drigger dropdown
        element(sage.locators.SAGE_INPUT).sendKeys(protractor.Key.RIGHT);
        sage.waitForSageSuggestionItem('truck', 'Ship Mode');
        sage.waitForSageSuggestionItem('air', 'Ship Mode');
        sage.waitForSageSuggestionItem('fob', 'Ship Mode');
    });

    it('add part of token that is combined with another token and then select from drop down', function () {
        sage.sageInputElement.enter('revenue tax color');
        answer.selectTableType();
        headline.waitForHeadline('Color');
        sage.sageInputElement.setCaretAtPosition(8);
        element(sage.locators.SAGE_INPUT).sendKeys('qua');
        sage.selectSageSuggestionItem('quantity');
        answer.waitForAnswerWithQuery('revenue quantity tax color');
    });

    it('should select first suggesiton, when pressing return', function(){
        sage.sageInputElement.enter('revenue tax color');
        answer.selectTableType();
        headline.waitForHeadline('Color');
        sage.sageInputElement.setCaretAtPosition(8);
        element(sage.locators.SAGE_INPUT).sendKeys('quanti');
        sage.waitForSageDropdown();
        sage.sageInputElement.append(protractor.Key.ENTER);
        answer.waitForAnswerWithQuery('revenue quantity tax color');
    });
});
