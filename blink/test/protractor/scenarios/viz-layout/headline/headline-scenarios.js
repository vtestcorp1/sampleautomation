/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E tests for headlines.
 */

'use strict';

var answer = require('../answer/answer.js');
var common = require('../../common.js');
var headline = require('./headline.js');
var leftPanel = require('../../sage/data-panel/data-panel.js');
var list = require('../../list/blink-list');
var pinboard = require('../../pinboards/pinboards');
var sage = require('../../sage/sage.js');

describe('Headline rendering', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    var TOTAL_REVENUE = '18.1B',
        TOTAL_BRANDS = '994',
        TOTAL_QUANTITY = '127K',
        TOTAL_DISCOUNT = '25.3K',
        UNIQUE_COLOR = '92',
        MIN_GROWTH = '-67.58%',
        AVG_REVENUE = '196M',
        MAX_GROWTH = '138.46%',
        MAX_GROWTH_QUARTERLY = "294.38%";

    it('should display the right column name and total for (revenue)', function () {
        answer.queryAndWaitForAnswer('revenue');
        headline.waitForHeadlineCount(1);
        headline.waitForHeadlineWithValue('Total Revenue', TOTAL_REVENUE);
    });

    it('should display the right column name with aggregation dropdown', function () {
        answer.queryAndWaitForAnswer('revenue color');
        answer.selectTableType();
        headline.waitForHeadlineCount(2);
        headline.waitForHeadline('Color');
        headline.waitForHeadline('Revenue');
    });

    it('should display the with a count of 994 (brand1)', function () {
        answer.queryAndWaitForAnswer('brand1');
        headline.waitForHeadlineCount(1);
        headline.waitForHeadlineWithValue('Brand1', TOTAL_BRANDS);
    });

    it('should display the with a count of 1 (mfgr#3215)', function () {
        answer.queryAndWaitForAnswer('mfgr#3215');
        headline.waitForHeadlineCount(1);
        var totalMfgrs = '1';
        headline.waitForHeadlineWithValue('Brand1', totalMfgrs);
    });

    it('should display a two viz with the right aggregate values (revenue quantity)', function () {
        answer.queryAndWaitForAnswer('revenue quantity');
        headline.waitForHeadlineCount(2);
        headline.waitForHeadlineWithValue('Total Revenue', TOTAL_REVENUE);
        headline.waitForHeadlineWithValue('Total Quantity', TOTAL_QUANTITY);
    });

    it('[SMOKE][IE] should display three viz with the right aggregate values ' +
        '(revenue quantity discount)', function () {
        answer.queryAndWaitForAnswer('revenue quantity discount');
        headline.waitForHeadlineCount(3);
        headline.waitForHeadlineWithValue('Total Revenue', TOTAL_REVENUE);
        headline.waitForHeadlineWithValue('Total Quantity', TOTAL_QUANTITY);
        headline.waitForHeadlineWithValue('Total Discount', TOTAL_DISCOUNT);
    });

    it('[SMOKE][IE] growth headline aggregations should appear as a percentage instead of ratio,' +
        'with a min aggregation', function () {
        var query = 'growth of order total price by order date quarterly year-over-year';
        answer.queryAndWaitForAnswer(query);
        answer.selectTableType();
        var columnName = 'Growth of Total Order Total Price';
        headline.waitForHeadlineWithValue(columnName, MIN_GROWTH);
        headline.changeAggregation(columnName, 'MAX');
        headline.waitForHeadlineWithValue(columnName, MAX_GROWTH);
    });

    it('headline aggregations should try rounding off doubles before choosing ' +
        'scientific notation', function () {
        answer.queryAndWaitForAnswer('growth of quantity by commit date quarterly');
        answer.selectTableType();
        var columnName = 'Growth of Total Quantity';
        headline.changeAggregation(columnName, 'MAX');
        headline.waitForHeadlineWithValue(columnName, MAX_GROWTH_QUARTERLY);
    });

    it('date range headlines should have no aggregation selector', function () {
        answer.queryAndWaitForAnswer('quantity commit date detailed');
        answer.selectTableType();
        headline.verifyAggregationSelector('Commit Date', false);
    });

    it('[SMOKE][IE] should change existing summary type, check that it preserves ' +
        'on following query', function () {
        answer.queryAndWaitForAnswer('revenue color');
        answer.selectTableType();
        headline.changeAggregation('Revenue', 'AVG');
        headline.waitForHeadlineWithValue('Revenue', AVG_REVENUE);
        sage.sageInputElement.append(' quantity');
        answer.selectTableType();
        headline.verifyAggregation('Revenue', 'AVG');
    });

    it('should reset summary type when navigate to question', function () {
        answer.queryAndWaitForAnswer('revenue color');
        answer.selectTableType();
        headline.changeAggregation('Revenue', 'AVG');
        headline.waitForHeadlineWithValue('Revenue', AVG_REVENUE);
        common.navigation.goToQuestionSection();
        headline.waitForHeadlineCount(0);
        sage.sageInputElement.enter('revenue color');
        headline.verifyAggregation('Revenue', 'TOTAL');
    });

    it('should not show headline with unavailable data', function() {
        answer.queryAndWaitForAnswer('product name product cost sale cost');
        answer.selectTableType();
        headline.waitForHeadlineCount(0);
    });

    it('[SMOKE] should be allowed to pin a headline from an answer', function(){
        var pinboardName = 'headlinePinner';
        common.navigation.goToPinboardsSection();
        pinboard.createPinboard('headlinePinner');
        common.navigation.goToQuestionSection();
        answer.queryAndWaitForAnswer('revenue color');
        answer.selectTableType();
        headline.pinHeadline('Color', pinboardName);
        common.navigation.goToPinboardsSection();
        list.checkIfItemExist('', pinboardName, 1);
        pinboard.openPinboard(pinboardName);
        pinboard.waitForLoaded();
        headline.waitForHeadlineWithValue('Color', UNIQUE_COLOR);

        //this is comment
        pinboard.deletePinboard(pinboardName);
    });

    /*it('Check datepicker module ', function(){

        //from datepicker
        select(element.by.xpath('html/body/div[4]/div[2]/div/div/column-control/div/blink-filter-v2/div/div/div/div/div[1]/blink-date-range-select/div/div[1]/input'));
        //select from date from datepicker
        select(element.by.xpath('html/body/div[5]/div[1]/table/tbody/tr[3]/td[2]'));

        //To datepicker
         select(element.by.xpath('html/body/div[4]/div[2]/div/div/column-control/div/blink-filter-v2/div/div/div/div/div[1]/blink-date-range-select/div/div[2]/input'));
        //select to date from datepicker
        select(element.by.xpath('html/body/div[5]/div[1]/table/tbody/tr[3]/td[4]'));

        //click on done button
        select(element.by.xpath('html/body/div[4]/div[2]/div/div/column-control/div/blink-filter-v2/div/div/div/div/div[2]/div/div[1]/div/div/div/div'));




    });
    */



});