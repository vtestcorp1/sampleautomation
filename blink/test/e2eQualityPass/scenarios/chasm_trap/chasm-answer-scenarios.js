/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for chasm trap.
 * this file contains tests around chasm trap using table as answer source
 * for the most part the tests uses M2M_CHASM_TABLES_TRADES as the underlying data. The schema consists
 * of four fact tables linking to the same dimensional table
 * the tests cover basic queries, keywords, sorting and filtering, multiple join paths, and attribution columns
 * attribution column is turned on and off to verify correct behavior in both scenarios
 *
 * chasm queries based on worksheets are listed in a separate file chasm-worksheet-scenarios.js
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Chasm Answer Test:', function() {


    describe('Answer Correctness', function () {

        it('should be able to open saved chasm answer', function() {
            var sageQuery = 'average ask_price average bid_price transaction_price security_issuer sort by average ask_price descending';
            var expected = 'thoughtspot inc,8.75,8.00,25';
            var answerName = '[qa chasm saved answer test]';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 4, expected);
            saveCurrentAnswer(answerName);
            answersTab().click();
            openSavedAnswer(answerName, 'table');
            verifyAnswerTableData(expected, 4);
            deleteSavedAnswer(answerName);
        });

        it('should verify average ask_price by security_identifier', function () {
            var sageQuery = 'average ask_price by security_identifier';
            var expectedPartialResult = '1,5.67,2,3.00,3,4.00';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 6, expectedPartialResult);
        });

        it('should verify average ask_price average bid_price by security_identifier', function () {
            var sageQuery = 'average ask_price average bid_price by security_identifier';
            var expectedPartialResult = '1,5.67,4.00,2,3.00,3.67,3,4.00,3.00';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 9, expectedPartialResult);
        });

        it('should verify security_identifier ask_price bid_price transaction_price sort by security_identifier', function () {
            var sageQuery = 'security_identifier ask_price bid_price transaction_price sort by security_identifier';
            var expectedPartialResult = '1,17,8,10,2,3,11,3';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 8, expectedPartialResult);
        });

        it('should show separate results for different attribute type if attribute column is present', function () {
            var sageQuery = 'security_identifier bid_price transaction_price bid_type sort by security_identifier';
            var expectedPartialResult = '1,public,8,10,2,private,4,3,2,public,7,3';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 12, expectedPartialResult);
        });

        it('should show correct entries for two dimension tables spanning a fact table', function () {
            var sageQuery = 'menu_item_identifier ingredient_name';
            var expected = '100,bacon,100,cheese,100,lettuce,100,onion';
            checkTableResult(M2M_CHASM_TABLES_RETAILER, sageQuery, 8, expected);
        });

        it('should ask user to disambiguate multiple join paths', function() {
            var sageQuery = 'purchase_price sale_price date_datekey date_datekey = september';
            var expected = 'Sep 2013,210,290,Sep 2012,50,120';

            selectSageSources(M2M_CHASM_TABLES_COMPLEX);
            sageInputElement().enter(sageQuery);
            waitForSageBarDropdown();
            selectFromSageDropdown('END');
            selectFromSageDropdown('END');

            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected, 6);
        });

        it('should show column chart if x axis has unique values', function() {
            var sageQuery = 'average ask_price average bid_price transaction_price security_issuer bid_type sort by average ask_price descending bid_type = private';
            var expected = 'thoughtspot inc,private,8.75,7.00,25';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 5, expected);

            selectViz('column');
            // verify column chart shows up
            expect(element('.bk-chart[chart-type=COLUMN]').count()).toBe(1);
        });

    });


    // Note (Shitong): the attribution column tests make changes to the data model
    describe('Attribution Column', function () {

        var table = 'chasm_securities_trades';

        it('should verify bid_price ask_price security_issuer apple inc bid_type when attribution column is disabled', function () {
            var query = 'bid_type bid_price ask_price for security_issuer = apple inc sort by bid_type';
            var expected1 = 'private,4,20,public,15,20';

            // flip attribution type on linking column
            dataTab().click();
            searchByName(table);
            metadataListContaining(table).click();
            businessModelFunctions.flipAttribution('SECURITY_IDENTIFIER');
            answerTab().click();
            selectSageSources(M2M_CHASM_TABLES_TRADES);
            sageInputElement().enter(query);
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected1);
        });

        it('should verify bid_price ask_price security_issuer apple inc bid_type when attribution column is applied', function () {
            var query = 'bid_type bid_price ask_price for security_issuer = apple inc sort by bid_type';
            var expected2 = 'private,4,3,public,15,20';

            // flip back attribution column
            dataTab().click();
            searchByName(table);
            metadataListContaining(table).click();
            businessModelFunctions.flipAttribution('SECURITY_IDENTIFIER');

            answerTab().click();
            selectSageSources(M2M_CHASM_TABLES_TRADES);
            sageInputElement().enter(query);
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected2);
        });

    });


    describe('Sorting and Filtering -', function () {

        it('should verify security_identifier bid_price ask_price for security_identifier = 2', function () {
            var sageQuery = 'security_identifier bid_price ask_price for security_identifier = 2';
            var expected = '2,11,3';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 3, expected);
        });

        it('should verify average ask_price average bid_price security_issuer for average ask_price > 6', function () {
            var sageQuery = 'average ask_price average bid_price security_issuer for average ask_price > 6';
            var expected = 'thoughtspot inc,8.75,8.00';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 3, expected);
        });

        it('should verify average ask_price average bid_price average transaction_price security_issuer for average bid_price > 6', function () {
            // SCAL-12016
            var sageQuery = 'average ask_price average bid_price average transaction_price security_issuer for average bid_price > 6';
            var expected = 'thoughtspot inc,8.75,8.00,8.33';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 4, expected);
        });

        it('should verify average ask_price average bid_price security_issuer for bid_type = private sort by average ask_price descending', function () {
            var sageQuery = 'average ask_price average bid_price security_issuer for bid_type = private sort by average ask_price descending';
            var expected = 'thoughtspot inc,8.75,7.00,oracle inc,5.00,4.00';
            checkTableResult(M2M_CHASM_TABLES_TRADES, sageQuery, 6, expected);
        });

        it('should open filter dialog and perform filtering on attribute column', function () {
            var query = 'average ask_price average bid_price transaction_price security_issuer bid_type ';
            query += 'sort by average ask_price descending sort by security_issuer descending bid_type = private bid_type = public';
            var expected1 = 'thoughtspot inc,private,8.75,7.00,25,thoughtspot inc,public,8.75,8.33,25';
            var expected2 = 'thoughtspot inc,private,8.75,7.00,25,oracle inc,private,5.00,4.00,7';

            checkTableResult(M2M_CHASM_TABLES_TRADES, query, 10, expected1);

            filterPanelFunctions.clickFilterItem('BID_TYPE');
            // Unselect public, so private is the only filter.
            filterFunctions.checkboxFilters.toggleCheckboxState('public');
            clickFilterDoneButton();

            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected2, 10);
        });

        it('should open filter dialog and perform filtering on measure column', function () {
            var query = 'average ask_price average bid_price transaction_price security_issuer bid_type sort by average ask_price descending';
            var expected1 = 'thoughtspot inc,private,8.75,7.00,25,thoughtspot inc,public,8.75,8.33,25';
            var expected2 = 'apple inc,public,5.00,3.75,13,google inc,public,4.00,3.00,3';

            checkTableResult(M2M_CHASM_TABLES_TRADES, query, 10, expected1);

            addFilterNum('BID_PRICE', ['4'], ['<'], true);
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected2, 10);
        });

        it('should open filter dialog and perform filtering on multiple columns', function () {
            var query = 'average ask_price average bid_price transaction_price security_issuer bid_type sort by average ask_price descending';
            var expected1 = 'thoughtspot inc,private,8.75,7.00,25,thoughtspot inc,public,8.75,8.33,25';
            var expected2 = 'apple inc,public,5.00,3.75,13';

            checkTableResult(M2M_CHASM_TABLES_TRADES, query, 10, expected1);

            addFilterNum('BID_PRICE', ['4'], ['<'], true);
            addFilterNum('TRANSACTION_PRICE', ['10'], ['>'], true);

            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected2);
        });
    });
});
