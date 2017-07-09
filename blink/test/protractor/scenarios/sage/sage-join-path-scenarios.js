/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Archit Bansal (archit.bansal@thoughtspot.com)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

let common = require('../common');
let sage = require('./sage');
let dataPanel = require('./data-panel/data-panel');
let answer = require('../viz-layout/answer/answer');
let headline = require('../viz-layout/headline/headline');

describe('Sage Join Path', function () {
    beforeAll(function () {
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER', 'DATE']);
        dataPanel.clickDone();
    });

    it('[SMOKE][IE] should show disambiguation worfklow when "define choice" ' +
        'button is clicked', function () {
        sage.sageInputElement.enter('revenue datekey');
        sage.waitForSageDropdownAmbiguitySection();
        sage.waitForSageSuggestionCountToBe(2);
        sage.waitForSageSuggestionItem('datekey', 'Order Date');
        sage.waitForSageSuggestionItem('datekey', 'Commit Date');

        sage.selectSageSuggestionItem('Order Date');
        answer.waitForAnswerWithQuery('revenue datekey');
        answer.selectTableType();
        headline.waitForHeadline('Datekey');
    });

    it('should show join choices after selecting an autocomplete if applicable', function () {
        sage.sageInputElement.enter('average revenue by part name year');
        sage.waitForSageDropdown();

        sage.selectSageDropdownItem('year');

        sage.waitForSageSuggestionCountToBe(2);
        sage.waitForSageSuggestionItem('year', 'Order Date');
        sage.waitForSageSuggestionItem('year', 'Commit Date');
    });
});
