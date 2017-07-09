/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for chasm trap.
 * this file covers chasm test for worksheet based answers
 * the e2eQuality job current does not have tests for chasm formulas inside a worksheet
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Chasm Worksheet Test:', function () {

    var worksheet1 = '[qa chasm worksheet test 1]',
        worksheet2 = '[qa chasm worksheet test 2]',
        worksheet3 = '[qa chasm worksheet test 3]';


    function createChasmTestWorksheet(title, datePath1, datePath2) {
        // create chasm test worksheet with the following schema:
        //                 |---------|
        //                 |products |
        //                 |  detail |
        //                 |_________|
        //                     |
        //                     |
        //                |---------|                |--------|
        //                |products |                |channel |
        // |----------| / |_________| \   |------| / |________| \ |------------|
        // |purchases*|                   |sales*|                | marketing* |
        // |__________|     |---------|   |______|                |____________|
        //       |      \\  |  date   |//          \
        //                  |_________|
        // |----------|                               |----------|
        // |purchases |                               |sales     |
        // |   detail |                               |   detail |
        // |__________|                               |__________|
        //
        // tables with '*' are fact tables. The rest are dimension tables

        createComplexWorksheet({
            sources: [
                'chasm_marketing_general', 'chasm_products_general', 'chasm_products_detail_general',
                'chasm_sales_general', 'chasm_sales_detail_general', 'chasm_purchases_general',
                'chasm_purchases_detail_general', 'chasm_channel_general'
            ],
            prefix: [
                '*', '', '', '*', '', '*', '', ''
            ]
        }, true);

        // add date table and resolve multiple join paths
        element(DATA_COLUMN_SOURCE_ITEM + ' .bk-source-name:contains({1})'.assign('chasm_date_general')).click();
        element('.bk-sage-data-columns .bk-add-columns-btn').click();
        waitForElement('.bk-dialog', 'waiting for date mapping dialog');
        element(contains('.bk-radio-label', datePath1)).click();
        sleep(1);
        element(contains('.bk-radio-label', datePath2)).click();
        sleep(1);
        element('.bk-confirm-btn').click();
        sleep(1);
        saveCurrentAnswer(title);
    }

    describe('Worksheet Correctness', function() {

        it('should be able to create and save worksheet 1', function () {
            createComplexWorksheet({
                sources: M2M_CHASM_TABLES_TRADES,
                title: worksheet1
            }, false);
            sleep(15);
            dataTab().click();
            expect(worksheetContaining(worksheet1).count()).toBe(1);
        });

        it('should be able to create and save worksheet 2', function () {
            createComplexWorksheet({
                sources: M2M_CHASM_TABLES_RETAILER,
                title: worksheet2
            }, false);
            sleep(15);
            dataTab().click();
            expect(worksheetContaining(worksheet2).count()).toBe(1);
        });

        it('should be able to create and save worksheet 3', function () {
            createChasmTestWorksheet(worksheet3, 'Sale_liscence_end', 'Purchase_liscence_end');
            sleep(15);
            dataTab().click();
            expect(worksheetContaining(worksheet3).count()).toBe(1);
        });

        it('should be able to open saved chasm answer', function() {
            var testQuery = 'average ask_price average bid_price transaction_price security_issuer sort by average ask_price descending';
            var expected = 'thoughtspot inc,8.75,8.00,25';
            var answerName = '[qa chasm saved answer test (worksheet)]';
            checkWorksheetResult([worksheet1], testQuery, 4, expected);
            saveCurrentAnswer(answerName);
            answersTab().click();
            openSavedAnswer(answerName, 'table');
            verifyAnswerTableData(expected, 4);
            deleteSavedAnswer(answerName);
        });

        it('should query average ask_price average bid_price', function () {
            var testQuery = 'average ask_price average bid_price';
            var expected = '5.47,4.93';
            checkWorksheetResult([worksheet1], testQuery, 2, expected);
        });

        it('should query security_issuer average ask_price sum ask_price > 18', function () {
            var testQuery = 'security_issuer average ask_price sum ask_price > 18';
            var expected = 'apple inc,5.00,20,thoughtspot inc,8.75,35';
            checkWorksheetResult([worksheet1], testQuery, 6, expected);
        });

        it('should query security_issuer average ask_price sort by average ask_price', function () {
            var testQuery = 'security_issuer average ask_price sort by average ask_price';
            var expected = 'arista inc,3.00';
            checkWorksheetResult([worksheet1], testQuery, 2, expected);
        });

        it('should query average ask_price average bid_price average transaction_price bid_type security_issuer apple inc sort by average ask_price', function () {
            var testQuery = 'average ask_price average bid_price average transaction_price bid_type security_issuer apple inc sort by average ask_price';
            var expected = 'private,apple inc,3.00,4.00,3.00,public,apple inc,5.00,3.75,3.25';
            checkWorksheetResult([worksheet1], testQuery, 10, expected);
        });

        it('should query bid_price average bid_price ask_price average ask_price transaction_price average transaction_price security_issuer sort by average bid_price descending', function () {
            var testQuery = 'bid_price average bid_price ask_price average ask_price transaction_price average transaction_price security_issuer sort by average bid_price descending';
            var expected = 'thoughtspot inc,32,8.00,35,8.75,25,8.33';
            checkWorksheetResult([worksheet1], testQuery, 7, expected);
        });

        it('should show column chart if x axis has unique values', function() {
            var testQuery = 'average ask_price average bid_price security_issuer bid_type sort by average ask_price descending bid_type = private';
            var expected = 'thoughtspot inc,private,8.75,7.00';
            checkWorksheetResult([worksheet1], testQuery, 4, expected);

            selectViz('column');
            // verify column chart shows up
            expect(element('.bk-chart[chart-type=COLUMN]').count()).toBe(1);
        });
    });

    describe('Keywords', function() {

        it('should query top 3 security_issuer ranked by average ask_share_amount', function () {
            var testQuery = 'top 3 security_issuer ranked by average ask_share_amount';
            var expected = 'thoughtspot inc,22.50,arista inc,20.00,google inc,20.00';
            checkWorksheetResult([worksheet1], testQuery, 6, expected);

            // should show column viz
            selectViz('column');
            // verify column chart shows up
            expect(element('.bk-chart[chart-type=COLUMN]').count()).toBe(1);
        });

        it('should query bottom 3 security_issuer ranked by average bid_price bid_price ask_price transaction_price', function () {
            var testQuery = 'bottom 3 security_issuer ranked by average bid_price bid_price ask_price transaction_price';
            var expected = 'google inc,3.00,3,11,9,nutanix inc,3.67,11,8,8';
            checkWorksheetResult([worksheet1], testQuery, 10, expected);

            // should show column viz
            selectViz('column');
            // verify column chart shows up
            expect(element('.bk-chart[chart-type=COLUMN]').count()).toBe(1);
        });

    });


    describe('Sorting and Filtering', function() {

        it('should open filter dialog on worksheet and perform filtering on attribute column', function() {
            // SCAL-12053
            var query = 'average ask_price average bid_price transaction_price security_issuer bid_type sort by average ask_price descending';
            var expected1 = 'thoughtspot inc,private,8.75,7.00,25,thoughtspot inc,public,8.75,8.33,25';
            var expected2 = 'thoughtspot inc,private,8.75,7.00,25,oracle inc,private,5.00,4.00,7';

            checkWorksheetResult([worksheet1], query, 10, expected1);
            // filter on bid_type column
            addFilterContent('BID_TYPE', ['private'], true);
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected2, 10);
        });

        it('should open filter dialog and perform filtering on measure column', function () {
            var query = 'average ask_price average bid_price transaction_price security_issuer bid_type sort by average ask_price descending';
            var expected1 = 'thoughtspot inc,private,8.75,7.00,25,thoughtspot inc,public,8.75,8.33,25';
            var expected2 = 'apple inc,public,5.00,3.75,13,google inc,public,4.00,3.00,3';

            checkWorksheetResult([worksheet1], query, 10, expected1);

            // filter on bid_type column
            addFilterNum('BID_PRICE', ['4'], ['<'], true);
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected2, 10);
        });

        it('should open filter dialog and perform filtering on multiple columns', function () {
            var query = 'average ask_price average bid_price transaction_price security_issuer bid_type sort by average ask_price descending';
            var expected1 = 'thoughtspot inc,private,8.75,7.00,25,thoughtspot inc,public,8.75,8.33,25';
            var expected2 = 'apple inc,public,5.00,3.75,13';

            checkWorksheetResult([worksheet1], query, 10, expected1);

            addFilterNum('BID_PRICE', ['4'], ['<'], true);
            addFilterNum('TRANSACTION_PRICE', ['10'], ['>'], true);

            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected2);
        });

        it('should click and sort on average bid_price column', function() {
            var query = 'average ask_price average bid_price transaction_price security_issuer bid_type sort by average ask_price descending';
            var expected1 = 'thoughtspot inc,private,8.75,7.00,25,thoughtspot inc,public,8.75,8.33,25';
            var expected2 = 'google inc,public,4.00,3.00,3,nutanix inc,public,4.00,3.50,8';
            var expected3 = 'google inc,public,4.00,3.00,3';
            var expected4 = 'apple inc,public,5.00,3.75,13';

            checkWorksheetResult([worksheet1], query, 10, expected1);

            // double click on bid_price column to sort bid price ascending
            clickSortCol(3);
            clickSortCol(3);
            expect(sageInputElement().val()).toBe('average ask_price average bid_price transaction_price security_issuer bid_type sort by average bid_price');
            verifyAnswerTableData(expected2, 10);

            addFilterNum('BID_PRICE', ['4'], ['<'], true);
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expected3, 5);

            // single click on transaction_price column to sort descending
            clickSortCol(4);
            verifyAnswerTableData(expected4, 5);

            // should be able to see column viz
            selectViz('column');
            expect(element('.bk-chart[chart-type=COLUMN]').count()).toBe(1);
        });

    });

    it('should delete previously created worksheets', function() {
        deleteWorksheet(worksheet1);
        deleteWorksheet(worksheet2);
        deleteWorksheet(worksheet3);
    });

});
