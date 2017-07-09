/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var dataUI = require('../data-ui');
var blinkListFunctions = require('../../list/blink-list.js');
var answerPage = require('../../viz-layout/answer/answer.js');
var headline = require('../../viz-layout/headline/headline');
var functions = require('./rls.js');
var dialog = require('../../dialog');
var util = common.util;

describe('RLS Automation tests', function() {
    beforeEach(function () {
        browser.driver.navigate().refresh();
        common.performance.collectGarbage();
        common.util.waitForElement(common.navigation.locators.NAVIGATION_BAR);
        dataUI.goToDataUI();
    });

    afterEach(function() {
        // Cleanup RLS dialog in case of failures.
        dialog.cleanupDialog();
        common.performance.captureMemory();
    });

    afterAll(function() {
        util.reLogin();
        browser.refresh();
    });

    it('[Automation] Verify parent groups should have access to all child groups\' rows', function() {
        /* Group 5 is the supergroup of all RLS*groups. Should have access to all
         the 10 rows. Group1 and Group2 are leaf nodes with access to just 2 rows each. */
        answerPage.queryFromSelectedSources('rlsgroup1user', 'rlsgroup1user',
            'purchase_price purchase_detail_id', ['rls_purchases_fact']);
        headline.verifyHeadlineValues(['60', '2']);
        answerPage.queryFromSelectedSources('rlsgroup2user', 'rlsgroup2user',
            'purchase_price purchase_detail_id', ['rls_purchases_fact']);
        headline.verifyHeadlineValues(['70', '2']);
        answerPage.queryFromSelectedSources('rlsgroup5user', 'rlsgroup5user',
            'purchase_price purchase_detail_id', ['rls_purchases_fact']);
        headline.verifyHeadlineValues(['470', '10']);
        util.reLogin();
    });

    it('[Automation] Verify saved answer should honor new RLS rules', function() {
        util.reLogin('guest1', 'guest1');
        common.navigation.goToAnswerSection();
        answerPage.openAnswerByName('Brand Revenue');
        answerPage.selectTableType();

        headline.verifyHeadlineValues([/*Revenue*/ '122M', /*Brand1*/'20']);

        util.reLogin();
        var ruleName = util.appendRandomNumber('test rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName, "color = 'rose'");

        util.reLogin('guest1', 'guest1');
        common.navigation.goToAnswerSection();
        answerPage.openAnswerByName('Brand Revenue');
        answerPage.selectTableType();

        headline.verifyHeadlineValues([/*Revenue*/ '9.95M', /*Brand1*/'2']);

        util.reLogin();
        functions.deleteRlsRuleOnTable('LINEORDER', ruleName);
    });

    it('[Automation] Verify complex RLS rules work as intended.', function() {
        var ruleName = util.appendRandomNumber('complex rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName,
            "if (substr(color, 0, 1) = 'b') then line number > 4 else line number <= 4");

        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color line number');
        headline.verifyHeadlineValue('12.8B', '92', '7');
        util.reLogin();
        functions.deleteRlsRuleOnTable('LINEORDER', ruleName);
        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color line number');
        headline.verifyHeadlineValue('18.1B', '92', '7');
        util.reLogin();
    });

    it('[Automation] Ability to modify an existing RLS rule', function() {
        var ruleName = util.appendRandomNumber('test rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName, "color = 'red'");

        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color');
        headline.verifyHeadlineValue('131M');

        util.reLogin();
        functions.updateRlsRuleOnTable('LINEORDER', ruleName, "color = 'green'");
        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color');
        headline.verifyHeadlineValue('209M');
        util.reLogin();
        common.navigation.goToUserDataSection();
        functions.deleteRlsRuleOnTable('LINEORDER', ruleName);
    });

    it('[Automation] Verify multiple rules ORed during querying', function () {
        var colorRule = util.appendRandomNumber('color rule');
        functions.addRlsRuleToTable('LINEORDER', colorRule,
            "color = 'red'");
        var nationRule = util.appendRandomNumber('nation rule');
        functions.addRlsRuleToTable('LINEORDER', nationRule,
            "customer nation = 'india'");

        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color customer nation');
        headline.verifyHeadlineValues([/*Colors*/ '77',/*Customer Nation*/ '20', /*Revenue*/ '687M']);

        util.reLogin('tsadmin', 'admin');
        common.navigation.goToUserDataSection();
        functions.deleteRlsRuleOnTable('LINEORDER', nationRule);
        functions.deleteRlsRuleOnTable('LINEORDER', colorRule);
        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color customer nation');
        headline.verifyHeadlineValues(['18.1B', '92','25']);
        util.reLogin();
    });

    it('[Automation] Verify multiple boolean filters ORed in single rule', function () {
        var ruleName = util.appendRandomNumber('multiple boolean filters rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName,
            "color = 'red' or customer nation = 'india'");

        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color customer nation');
        headline.verifyHeadlineValues([/*Revenue*/ '687M',/*Colors*/ '77',/*Customer Nation*/ '20']);

        util.reLogin('tsadmin', 'admin');
        common.navigation.goToUserDataSection();
        functions.deleteRlsRuleOnTable('LINEORDER', ruleName);
        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color customer nation');
        headline.verifyHeadlineValues(['18.1B','92','25']);
        util.reLogin();
    });

    it('[Automation] Chaining of RLS rules should work with multiple tables in context', function () {
        var ruleName = util.appendRandomNumber('lineorder rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName, "color = 'red'");

        var regionRuleName = util.appendRandomNumber('customer region rule');
        functions.addRlsRuleToTable('CUSTOMER', regionRuleName, "customer region = 'asia'");

        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color customer region');
        headline.verifyHeadlineValue('33.8M');

        util.reLogin('tsadmin', 'admin');
        common.navigation.goToUserDataSection();
        functions.deleteRlsRuleOnTable('LINEORDER', ruleName);
        functions.deleteRlsRuleOnTable('CUSTOMER', regionRuleName);
    });

    it('[Automation] Verify group based common RLS rule', function () {
        var ruleName = 'purchases-detail-mapping';
        functions.goToRLSTabForTablename('rls_purchases_fact');
        expect(functions.waitForRule(ruleName)).toBeTruthy();

        answerPage.queryFromAllTables('rlsgroup1user', 'rlsgroup1user',
            'purchase_price purchase_liscence_start monthly');
        headline.verifyHeadlineValues(['60', 'Sep 2011', 'Sep 2012']);

        // Verify with second user.
        answerPage.queryFromAllTables('rlsgroup2user', 'rlsgroup2user',
            'purchase_price purchase_liscence_start monthly');
        headline.verifyHeadlineValues(['70', 'Sep 2011', 'Dec 2013']);
        util.reLogin();
    });

    it('[Automation] RLS rules on base tables should apply on Worksheets as well', function () {
        var ruleName = 'purchases-detail-mapping';
        functions.goToRLSTabForTablename('rls_purchases_fact');
        expect(functions.waitForRule(ruleName)).toBeTruthy();
        answerPage.queryFromAllWorksheets('rlsgroup1user', 'rlsgroup1user',
            'purchase_price purchase_detail_id');
        headline.verifyHeadlineValues(['60','2']);
        // Verify with second user.
        answerPage.queryFromAllWorksheets('rlsgroup2user', 'rlsgroup2user',
            'purchase_price purchase_detail_id');
        headline.verifyHeadlineValues(['30','1']);
        util.reLogin();
    });
});
