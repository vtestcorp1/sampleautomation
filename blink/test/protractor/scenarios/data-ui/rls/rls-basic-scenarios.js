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
var dialog = require('../../dialog');
var functions = require('./rls.js');
var util = common.util;

var RLS_LIST_HEADERS = {
    MODIFIED: 'MODIFIED',
    DESCRIPTION: 'DESCRIPTION',
    NAME: 'NAME'
};

describe('RLS Basic Tests', function () {

    beforeEach(function () {
        common.util.waitForElement(common.navigation.locators.NAVIGATION_BAR);
        dataUI.goToDataUI();
    });

    afterEach(function() {
        // Cleanup RLS dialog in case of failures.
        dialog.cleanupDialog();
        common.performance.captureMemory();
        browser.refresh();
    });

    afterAll(function() {
        util.reLogin();
    });

    it('Should ask for join disambiguation when needed', function () {
        var ruleName = util.appendRandomNumber('test rule');
        functions.goToRLSTabForTablename('LINEORDER');
        functions.addRLSRule(ruleName, "20:30:00 < datekey");
        expect(element.all(common.dialog.locators.DIALOG).count()).toBe(1);
        functions.selectMJPOption('Order date');
        expect(functions.waitForRule(ruleName)).toBeTruthy();
        functions.deleteRule(ruleName);
    });

    it('Should not show suggestions which are up in the relational hierarchy', function () {
        functions.goToRLSTabForTablename('PART');
        functions.openAddNewRuleDialog();
        functions.typeInRule('revenue');
        var suggestion = element(common.expressionEditor.locators.EXPRESSION_SUGGESTION_ITEMS).
        element(by.cssContainingText('*','revenue'));
        expect(suggestion.isPresent()).toBeFalsy();
        functions.dismissRuleDialog();
    });

    it('Rule editor should not accept non-boolean expressions', function () {
        functions.goToRLSTabForTablename('LINEORDER');
        functions.openAddNewRuleDialog();
        functions.typeInRule('revenue');
        common.util.waitForElement(common.expressionEditor.locators.EXPRESSION_VALIDATION_MESG);
        var incompleteMesg = element(common.expressionEditor.locators.EXPRESSION_VALIDATION_MESG).
        element(by.cssContainingText('*', 'Expression is incomplete'));
        expect(incompleteMesg.isPresent()).toBeTruthy();
        functions.dismissRuleDialog();
    });

    it('[SMOKE]Rules should be applied when doing queries, and not when rule deleted', function () {
        var ruleName = util.appendRandomNumber('lineorder rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName, "color = 'red'");
        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color');
        headline.verifyHeadlineValue('131M');

        util.reLogin('tsadmin', 'admin');
        common.navigation.goToUserDataSection();
        functions.deleteRlsRuleOnTable('LINEORDER', ruleName);

        answerPage.queryFromAllTables('guest1', 'guest1', 'revenue color');
        headline.verifyHeadlineValue('18.1B');

        util.reLogin();
    });

    it('should be able to search RLS rules', function() {
        var ruleName1 = 'LO Rule 1';
        var ruleName2 = 'LO Rule 2';
        functions.addRlsRuleToTable('LINEORDER', ruleName1, "color = 'red'");
        functions.addRlsRuleToTable('LINEORDER', ruleName2, "color = 'red'");
        blinkListFunctions.waitForItemCountToBe(functions.selectors.RULE_LIST, ruleName1, 1);
        functions.deleteRule(ruleName1);
        functions.deleteRule(ruleName2);
    })
});
