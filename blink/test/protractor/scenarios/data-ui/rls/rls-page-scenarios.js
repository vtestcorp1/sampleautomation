/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var dataUI = require('../data-ui');
var blinkListFunctions = require('../../list/blink-list.js');
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

    it('Ability to add, delete RLS rules', function () {
        var ruleName = util.appendRandomNumber('test rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName, "color = 'red'");
        functions.deleteRule(ruleName);
    });

    it('[SMOKE] Verify misc. UI properties of RLS landing page', function() {
        functions.goToRLSTabForTablename('LINEORDER');
        functions.checkForHelpAssistant(/*present*/ true);
        var ruleName = util.appendRandomNumber('test rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName, "color = 'red'");
        functions.checkForHelpAssistant(/*absent*/ false);
        functions.deleteRlsRuleOnTable('LINEORDER', ruleName);
        util.reLogin('guest1', 'guest1');
        functions.goToRLSTabForTablename('LINEORDER');
        // No help assistant and no Add btn either.
        functions.checkForHelpAssistant(/*absent*/ false);
        expect(element.all(by.css(functions.selectors.ADD_BTN)).count()).toBe(0);
        util.reLogin();
    });

    it('Author info should display Avatar and tooltip', function () {
        var ruleName = util.appendRandomNumber('test rule');
        functions.goToRLSTabForTablename('LINEORDER');
        functions.addRLSRule(ruleName, "color = 'red'");
        expect(functions.waitForRule(ruleName)).toBeTruthy();
        blinkListFunctions.checkAuthorLabel(
            functions.selectors.RULE_LIST,
            0,
            'A'
        );
        functions.deleteRule(ruleName);
    });

    it('RLS List should have correct headers', function(){
        var ruleName = util.appendRandomNumber('test rule');
        functions.addRlsRuleToTable('LINEORDER', ruleName, "color = 'red'");
        var dataExplorerSelector = '.data-explorer';
        blinkListFunctions.checkIfColumnHeaderExists(dataExplorerSelector, RLS_LIST_HEADERS.MODIFIED);
        blinkListFunctions.checkIfColumnHeaderExists(dataExplorerSelector, RLS_LIST_HEADERS.NAME);
        blinkListFunctions.checkIfColumnHeaderExists(dataExplorerSelector, RLS_LIST_HEADERS.DESCRIPTION);

        functions.deleteRule(ruleName);
    });
});
