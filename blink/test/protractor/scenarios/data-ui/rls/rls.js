/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var dataUI = require('../data-ui.js');
var blinkListFunctions = require('../../list/blink-list.js');
var util = common.util;


module.exports = (function() {
    return {
        selectors: {
            ADD_BTN: '.row-level-security-container .bk-rls-add-btn',
            HELP_ASSISTANT: '.help-assistant',
            RULE_NAME_INPUT: '.bk-rule-editor .bk-rule-name input',
            RULE_CONTENT_EDITOR: '.bk-rule-editor .content-editor',
            SAVE_BTN: '.bk-rule-editor .bk-confirm-btn',
            CANCEL_BTN: '.bk-rule-editor .bk-cancel-btn',
            RULE_LIST: '.bk-rls-rules-list',
            RULE_CHECKBOX: 'bk-checkbox',
            MJP_OPTIONS: '.bk-mjp-options .bk-clickable',
            NAME_DONE_BTN: '.bk-rule-editor .bk-content-editable-done-button',
            SUCCESS_ICON: '.bk-style-icon-circled-checkmark.bk-icon.bk-success-icon'
        },
        goToRLSTabForTablename: function (tablename) {
            dataUI.goToTableByName(tablename);
            element(dataUI.locators.RLS_TAB).click();
        },
        openAddNewRuleDialog: function () {
            var addBtn = util.waitForElement(by.css(this.selectors.ADD_BTN));
            $(this.selectors.ADD_BTN).click();
        },
        typeInRule: function (text) {
            var ruleInput = $(this.selectors.RULE_CONTENT_EDITOR);
            ruleInput.click();
            ruleInput.clear().then(function() {
                ruleInput.sendKeys(text);
            });
        },
        addRLSRule: function (name, text) {
            this.openAddNewRuleDialog();
            $(this.selectors.RULE_NAME_INPUT).click();
            $(this.selectors.RULE_NAME_INPUT).sendKeys(name);
            $(this.selectors.NAME_DONE_BTN).click();
            this.typeInRule(text);
            util.waitForElement(by.css(this.selectors.SUCCESS_ICON));
            $(this.selectors.SAVE_BTN).click();
        },
        updateRLSRule: function (name, text) {
            blinkListFunctions.selectItemByName(this.selectors.RULE_LIST, name);
            $(this.selectors.RULE_CONTENT_EDITOR).click();
            $(this.selectors.RULE_CONTENT_EDITOR).clear();
            $(this.selectors.RULE_CONTENT_EDITOR).sendKeys(text);
            util.waitForElement((by.css(this.selectors.SUCCESS_ICON)));
            $(this.selectors.SAVE_BTN).click();
        },
        dismissRuleDialog: function () {
            $(this.selectors.CANCEL_BTN).click();
        },
        deleteRule: function (name) {
            blinkListFunctions.deleteItemsByName(this.selectors.RULE_LIST, [name]);
        },
        waitForRule: function (name) {
            var itemLocator = blinkListFunctions.getItemLocatorByName(
                this.selectors.RULE_LIST,
                name
            );
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.presenceOf(element(itemLocator)), 10000);
        },
        selectMJPOption: function (text) {
            element(by.cssContainingText(this.selectors.MJP_OPTIONS, text)).click();
            element(common.dialog.locators.PRIMARY_DLG_BTN).click();
        },
        addRlsRuleToTable: function (tableName, ruleName, rule) {
            this.goToRLSTabForTablename(tableName);
            this.addRLSRule(ruleName, rule);
            expect(this.waitForRule(ruleName)).toBeTruthy();
        },
        updateRlsRuleOnTable: function (tableName, ruleName, rule) {
            this.goToRLSTabForTablename(tableName);
            this.updateRLSRule(ruleName, rule);
            expect(this.waitForRule(ruleName)).toBeTruthy();
        },
        deleteRlsRuleOnTable: function (tableName, ruleName) {
            this.goToRLSTabForTablename(tableName);
            this.deleteRule(ruleName);
        },
        checkForHelpAssistant: function(present) {
            var helpAssistant = element.all(by.css((this.selectors.HELP_ASSISTANT)));
            if (present) {
                expect(helpAssistant.count()).toBe(1);
            } else {
                expect(helpAssistant.count()).toBe(0);
            }
        }
    };
})();
