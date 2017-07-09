/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var util = common.util;
var contentEditable = require('../widgets/content-editable');
var worksheet = require('../worksheets/worksheets');
var chosenSelect = require('../libs/chosen');
var dataPanel = require('../sage/data-panel/data-panel');
var actionButton = require('../actions-button');
var answer = require('../viz-layout/answer/answer');
var table = require('../table/table');

var FORMULA_EDITOR = '.content-editor',
    SUGGESTIONS_MENU = '.bk-expression-suggestions-menu';

var selectors = {
    FORMULA_EDITOR: FORMULA_EDITOR,
    PLACEHOLDER: FORMULA_EDITOR + ' .placeholder',
    SUGGESTION_NAMES: SUGGESTIONS_MENU + ' .suggestion .suggestion-name',
    ACTIVE_SUGGESTION_NAME: SUGGESTIONS_MENU + ' .active .suggestion .suggestion-name',
    CONFIRMATION_BUTTON: '.bk-editor-footer .bk-confirm-btn',
    CANCEL_BUTTON: '.bk-editor-footer .bk-formula-edit-cancel',
    FORMULA_LIST_ITEM: '.bk-formula-list-item div',
    FORMULA_NAME_EDITOR: '.bk-formula-editor .bk-formula-name',
    FORMULA_TYPE_SELECTOR: '.bk-measure-attribute-selector .bk-select-box',
    FORMULA_TYPE_SELECTED_OPTION: '.bk-measure-attribute-selector .chosen-single',
    VALIDATION_SUCCESS_ICON: '.bk-validation-icons .bk-icon.bk-success-icon',
    VALIDATION_ERROR_ICON: '.bk-validation-icons .bk-icon.bk-error-icon',
    ADD_FORMULA_BUTTON: '.bk-formulae-container .header-add-button',
    ADD_FORMULA_DISABLED: '.bk-disabled-button',
    FORMULA_DROPDOWN: '.expression-editor-context-menu',
    FORMULA_DROPDOWN_ITEM: '.expression-editor-context-menu .items li',
    FORMULA_DROPDOWN_ERROR: '.expression-editor-context-menu .header-text .header-text-error',
    GHOST_TOKEN : '.ghost.token',
    EDITOR_CONTENT_WITH_WHITESPACES : '.token:not(.ghost):not(.ghost-separator):not(.empty)',
    ADD_FORMULA_IN_ANSWER : '.bk-add-formula',
    SUCCESS_ICON: '.bk-style-icon-circled-checkmark.bk-icon.bk-success-icon',
    ERROR_ICON: '.bk-icon.bk-error-icon.bk-style-icon-circled-x',
    STATUS_MSG: '.bk-message.ng-binding',
    ADVANCED_SETTINGS_HEADER: '.bk-advanced-settings-header',
    ANSWER_FORMULA_EDIT_ICON: '.bk-style-icon-edit',
    ANSWER_FORMULA_DELETE_ICON: '.bk-style-icon-x',
    FORMULA_EDITOR_POPUP: '.bk-formula-editor-popup',
    FORMULA_EDITOR_SAVE_ERROR: '.bk-formula-editor .bk-editor-footer .error-message'
};

var locators = {
    FORMULA_EDITOR: by.css(selectors.FORMULA_EDITOR),
    PLACEHOLDER: by.css(selectors.PLACEHOLDER),
    SUGGESTION_NAMES: by.css(selectors.SUGGESTION_NAMES),
    CONFIRMATION_BUTTON: by.css(selectors.CONFIRMATION_BUTTON),
    CANCEL_BUTTON: by.css(selectors.CANCEL_BUTTON),
    FORMULA_LIST_ITEM: by.css(selectors.FORMULA_LIST_ITEM),
    FORMULA_NAME_EDITOR: by.css(selectors.FORMULA_NAME_EDITOR),
    FORMULA_TYPE_SELECTOR: by.css(selectors.FORMULA_TYPE_SELECTOR),
    FORMULA_TYPE_SELECTED_OPTION: by.css(selectors.FORMULA_TYPE_SELECTED_OPTION),
    VALIDATION_SUCCESS_ICON: by.css(selectors.VALIDATION_SUCCESS_ICON),
    VALIDATION_ERROR_ICON: by.css(selectors.VALIDATION_ERROR_ICON),
    ADD_FORMULA_BUTTON: by.css(selectors.ADD_FORMULA_BUTTON),
    FORMULA_DROPDOWN: by.css(selectors.FORMULA_DROPDOWN),
    FORMULA_DROPDOWN_ITEM: by.css(selectors.FORMULA_DROPDOWN_ITEM),
    FORMULA_DROPDOWN_ERROR: by.css(selectors.FORMULA_DROPDOWN_ERROR),
    GHOST_TOKEN: by.css(selectors.GHOST_TOKEN),
    EDITOR_CONTENT_WITH_WHITESPACES: by.css(selectors.EDITOR_CONTENT_WITH_WHITESPACES),
    ADD_FORMULA_IN_ANSWER: by.css(selectors.ADD_FORMULA_IN_ANSWER),
    SUCCESS_ICON: by.css(selectors.SUCCESS_ICON),
    ERROR_ICON: by.css(selectors.ERROR_ICON),
    STATUS_MSG: by.css(selectors.STATUS_MSG)
};

function focusFormulaEditor () {
    return util.waitForAndClick(selectors.FORMULA_EDITOR);
}

function typeInFormulaEditor (text) {
    var formulaEditorElement = element(locators.FORMULA_EDITOR);
    return formulaEditorElement.sendKeys(text);
}

function clearFormulaEditor () {
    var formulaEditorElement = element(locators.FORMULA_EDITOR);
    return formulaEditorElement.clear();
}

function waitForGhostToken(){
    return util.waitForElement(selectors.GHOST_TOKEN);
}

function waitForSuggestion(suggestionText) {
    return util.waitForElement(by.cssContainingText(selectors.SUGGESTION_NAMES, suggestionText));
}

function waitForActiveSuggestion(suggestionText) {
    util.waitForElementCountToBe(selectors.ACTIVE_SUGGESTION_NAME, 1);
    return util.waitForElement(by.cssContainingText(selectors.ACTIVE_SUGGESTION_NAME, suggestionText));
}

function waitForFormulaEditorText(expectedText) {
    var formulaElement = element(by.css(selectors.FORMULA_EDITOR));
    return browser.wait(function () {
        return browser.executeScript(function ($elem) {
            return $elem.textContent;
        }, formulaElement).then(function(text) {
            return text.replace(new RegExp(String.fromCharCode(160), 'g'), ' ').trim() === expectedText.trim();
        });
    }, common.constants.waitTimeout);
}

function waitForValidFormula() {
    return util.waitForElement(selectors.SUCCESS_ICON);
}

function waitForNotValidFormula(){
    return util.waitForElement(selectors.ERROR_ICON);
}

function waitForErrorMessage(ErrorMeg){
    var errorMsgElem = element(locators.STATUS_MSG);
    return util.waitForTextToBePresentInElement(errorMsgElem,ErrorMeg);
}

function waitForOutOfScopeSuggestionError() {
    return util.waitForElement(by.cssContainingText(selectors.FORMULA_DROPDOWN_ERROR, 'I didn\'t get that'));
}

function previousSuggestion() {
    return element(by.css(selectors.FORMULA_EDITOR)).sendKeys(protractor.Key.UP);
}

function nextSuggestion() {
    return element(by.css(selectors.FORMULA_EDITOR)).sendKeys(protractor.Key.DOWN);
}

function clickSuggestion(suggestionText) {
    return util.waitForAndClick(by.cssContainingText(selectors.SUGGESTION_NAMES, suggestionText));
}

function expectCurrentFormulaType(expected) {
    util.waitForAndClick(selectors.ADVANCED_SETTINGS_HEADER);
    util.waitForTextToBePresentInElement(selectors.FORMULA_TYPE_SELECTED_OPTION, expected);
    return util.waitForAndClick(selectors.ADVANCED_SETTINGS_HEADER);
}

function changeCurrentFormulaType(newType) {
    util.waitForAndClick(selectors.ADVANCED_SETTINGS_HEADER);
    util.waitForElement(selectors.FORMULA_TYPE_SELECTED_OPTION);
    chosenSelect.changeSelection(element(locators.FORMULA_TYPE_SELECTOR), newType);
    return util.waitForAndClick(selectors.ADVANCED_SETTINGS_HEADER);
}

function saveCurrentFormula(formulaName, doNotWaitForPopupToClose) {
    contentEditable.enterText(selectors.FORMULA_NAME_EDITOR, formulaName);
    let waitPromise = util.waitForAndClick(selectors.CONFIRMATION_BUTTON);
    if(!doNotWaitForPopupToClose) {
        return util.waitForElementToNotBePresent(selectors.FORMULA_EDITOR_POPUP)
    }
    return waitPromise;
}

function discardCurrentFormula () {
    util.waitForAndClick(selectors.CANCEL_BUTTON);
    return util.waitForElementToNotBePresent(selectors.FORMULA_EDITOR_POPUP);
}

function closeFormulaEditorIfOpen() {
    return $(selectors.CANCEL_BUTTON).isPresent().then(function(isPresent) {
        if (isPresent) {
            discardCurrentFormula();
        }
    });
}

// ########## Worksheet specific formula functions ############
function openFormulaEditorInWorksheet() {
    return util.waitForAndClick(selectors.ADD_FORMULA_BUTTON);
}

function openExistingFormulaInWorksheet (formulaName) {
    var formulaColumnElement = element(
        by.cssContainingText(
            selectors.FORMULA_LIST_ITEM,
            formulaName
        )
    );
    browser.actions().mouseMove(formulaColumnElement).perform();
    return util.waitForAndClick(formulaColumnElement.element(by.css(selectors.ANSWER_FORMULA_EDIT_ICON)));
}

function waitForFormulasInLeftPanel(num) {
    return util.waitForElementCountToBe(selectors.FORMULA_LIST_ITEM, num);
}

function saveCurrentFormulaInWorksheet(formulaName) {
    saveCurrentFormula(formulaName);
    return worksheet.waitForFormula(formulaName);
}

function tryToSaveCurrentFormulaInWorksheet(formulaName) {
    saveCurrentFormula(formulaName, true);
    return worksheet.waitForFormula(formulaName);
}

function createAndSaveFormulaInWorksheet(formulaExpression, formulaName) {
    openFormulaEditorInWorksheet();
    focusFormulaEditor();
    typeInFormulaEditor(formulaExpression);
    waitForValidFormula();
    return saveCurrentFormulaInWorksheet(formulaName);
}

function deleteFormulaInWorksheet(formulaName) {
    var formulaColumnElement = element(
        by.cssContainingText(
            selectors.FORMULA_LIST_ITEM,
            formulaName
        )
    );
    browser.actions().mouseMove(formulaColumnElement).perform();
    return util.waitForAndClick(formulaColumnElement.element(by.css(selectors.ANSWER_FORMULA_DELETE_ICON)));
}

function addFormulaToWorksheetFromLeftPanel(formulaName) {
    var formulaColumnElement = element(
        by.cssContainingText(
            selectors.FORMULA_LIST_ITEM,
            formulaName
        )
    );
    return browser.actions()
        .mouseMove(formulaColumnElement)
        .doubleClick()
        .perform();
}

// ########## Answer specific formula functions ############
function openFormulaEditorInAnswer() {
    return actionButton.selectActionButtonAction('Add formula');
}

function expandFormulaSourceInAnswer() {
    return dataPanel.expandSource('Formulas');
}

function openExistingFormulaInAnswer(formulaName) {
    var datasourcecolumnSelector = dataPanel.selectors.DATA_SOURCE_COLUMN_ITEM;
    var formulaColumnElement = element(
        by.cssContainingText(datasourcecolumnSelector, formulaName.toLowerCase()));
    browser.actions().mouseMove(formulaColumnElement).perform();
    return util.waitForAndClick(formulaColumnElement.element(by.css(selectors.ANSWER_FORMULA_EDIT_ICON)));
}

function saveCurrentFormulaInAnswer(formulaName) {
    saveCurrentFormula(formulaName);
    answer.waitForAnswerToContainColumn(formulaName);
    return answer.waitForAnswerToLoad();
}

function createAndSaveFormulaInAnswer(formulaExpression, formulaName) {
    openFormulaEditorInAnswer();
    focusFormulaEditor();
    typeInFormulaEditor(formulaExpression);
    return saveCurrentFormula(formulaName);
}

function deleteFormulaInAnswer(formulaName) {
    var datasourcecolumnSelector = dataPanel.selectors.DATA_SOURCE_COLUMN_ITEM;
    var formulaColumnElement = element(
        by.cssContainingText(datasourcecolumnSelector, formulaName.toLowerCase()));
    browser.actions().mouseMove(formulaColumnElement).perform();
    return util.waitForAndClick(formulaColumnElement.element(by.css(selectors.ANSWER_FORMULA_DELETE_ICON)));
}

function waitForFormulaButtonVisibility(isVisible) {
    return isVisible ? util.waitForVisibilityOf(selectors.ADD_FORMULA_BUTTON)
        : util.waitForInvisibilityOf(selectors.ADD_FORMULA_BUTTON);
}
function waitForFormulaButtonToBeEnabled(isEnabled) {
    var disabledButtonSelector = util.joinSelectors(selectors.ADD_FORMULA_BUTTON,
        selectors.ADD_FORMULA_DISABLED);
    return isEnabled ? util.waitForElementCountToBe(disabledButtonSelector, 0)
       : util.waitForElementCountToBe(disabledButtonSelector, 1);
}

function getSaveErrorMessage() {
    return $(selectors.FORMULA_EDITOR_SAVE_ERROR).getText();
}

module.exports = {
    selectors,
    locators,
    focusFormulaEditor,
    typeInFormulaEditor,
    clearFormulaEditor,
    waitForGhostToken,
    waitForSuggestion,
    waitForActiveSuggestion,
    waitForFormulaEditorText,
    waitForValidFormula,
    waitForOutOfScopeSuggestionError,
    previousSuggestion,
    nextSuggestion,
    clickSuggestion,
    expectCurrentFormulaType,
    changeCurrentFormulaType,
    saveCurrentFormula,
    discardCurrentFormula,
    closeFormulaEditorIfOpen,
    waitForNotValidFormula,
    waitForErrorMessage,
    // Worksheet specific
    openFormulaEditorInWorksheet,
    openExistingFormulaInWorksheet,
    saveCurrentFormulaInWorksheet,
    tryToSaveCurrentFormulaInWorksheet,
    createAndSaveFormulaInWorksheet,
    waitForFormulaButtonVisibility,
    waitForFormulaButtonToBeEnabled,
    waitForFormulasInLeftPanel,
    deleteFormulaInWorksheet,
    addFormulaToWorksheetFromLeftPanel,
    // Answer specific
    openFormulaEditorInAnswer,
    expandFormulaSourceInAnswer,
    openExistingFormulaInAnswer,
    saveCurrentFormulaInAnswer,
    createAndSaveFormulaInAnswer,
    deleteFormulaInAnswer,
    getSaveErrorMessage
};
