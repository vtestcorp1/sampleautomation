/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving sage disambiguation cases.
 */

'use strict';

let common = require('../common');
let sage = require('./sage');
let dataPanel = require('./data-panel/data-panel');
let answer = require('../viz-layout/answer/answer');
let dataUI = require('../data-ui/data-ui.js');
let importUtils = require('../data-ui/import-wizard/import-wizard.js');

describe('Sage disambiguation cases', function () {
    beforeAll(function () {
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER', 'DATE', 'PART', 'CUSTOMER', 'SUPPLIER']);
        dataPanel.clickDone();
    });

    it('[SMOKE][IE] should display 2 options for (revenue europe) ' +
        'and show answer when first option is selected', function () {
        sage.sageInputElement.enter('revenue europe');
        sage.waitForSageDropdown();
        // Expect the autocomplete dropdown to contain 2 options
        sage.waitForSageSuggestionItem('europe', 'Customer Region');
        sage.waitForSageSuggestionItem('europe', 'Supplier Region');
        // // Pick a suggestion
        sage.selectSageSuggestionItem('europe', 'Supplier Region');
        answer.waitForAnswerWithQuery('revenue europe');
    });

    it('should show unambiguous option when an ambiguous attribute ' +
        'value is followed by unique string (revenue aquamarine cr)', function () {
        sage.sageInputElement.enter('revenue aquamarine cr');
        sage.waitForSageSuggestionItem('cream', null, 'cr');
        // Expect the autocomplete dropdown to contain 1 emphasized completion
        sage.waitForSageDropdownWithMatchedCountToBe(1);
    });


    // SCAL-18489
    // for attributes column that are not indexed, sage return quotes for token entered after a token
    // corresponding to this column. We should remove these quotes when we do the folding
    it('should not suggest different folding completions for token with and without quotes', function(){
        var CSV_FILE_NAME = './sage/date.csv';
        var tableName = 'date';
        common.navigation.goToUserDataSection();
        importUtils.importSimpleCSVTable(CSV_FILE_NAME, 1);
        common.navigation.goToUserDataSection();
        dataUI.goToTableByName(tableName);
        dataUI.setColumnIndex('attr1', 'DONT_INDEX');
        dataUI.saveChanges();
        common.navigation.goToQuestionSection();

        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources([tableName]);
        dataPanel.clickDone();

        var navigateAndEnterQuery = function() {
            common.navigation.goToQuestionSection();
            sage.sageInputElement.enter('attr1');
            sage.sageInputElement.append(' quarterly');
        };
        // we need to wait for sage
        var EC = protractor.ExpectedConditions;
        common.util.waitForConditionAndPerformAction(
            EC.expectElementCountToBe(sage.selectors.SAGE_DROPDOWN_ITEM_MATCHED, 11),
            navigateAndEnterQuery,
            1000);

        common.navigation.goToUserDataSection();
        dataUI.deleteMetadataItems([tableName]);
    });
});
