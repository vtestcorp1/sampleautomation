/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois Chabbey(francois.chabbey@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../common');
var blinkList = require('../list/blink-list.js');
var dataPanel = require('../sage/data-panel/data-panel');
var actions = require('../actions-button');
var dialog = require('../dialog');
var dataUI = require('../data-ui/data-ui');
var sprintf = require('sprintf-js').sprintf;

var navigation = common.navigation;
var util = common.util;

var selectors = {
    SAVE_BTN: '.bk-action-save',
    JOIN_TYPE: '.bk-with-join-type-selector',
    JOIN_TYPE_CHOICE: '.bk-join-type-selector',
    JOIN_TYPE_CHOICE_SELECTED: '.bk-join-type-selector.bk-selected',
    WORKSHEET_TABLE: '.bk-worksheet-table',
    WORKSHEET_SAVE_NAME_INPUT: '.bk-answer-save-dialog input',
    SLICK_GRID_TABLE: '.slick-viewport .slick-row.slick-group',
    SLICK_GRID_TABLE_NAME: '.slick-viewport .slick-row.slick-group .slick-group-title',
    SLICK_GRID_COLUMN: '.slick-viewport .slick-row:not(.slick-group)',
    SLICK_GRID_COLUMN_NAME: '.slick-viewport .slick-row:not(.slick-group) .column-name-cell',
    WORKSHEET_DELETE_BUTTON: '.bk-worksheet-table .bk-style-icon-delete',
    JOIN_EDIT_DIALOG: '.bk-dialog .bk-join-disambiguation',
    JOIN_EDIT_DIALOG_OPTION: '.bk-dialog .bk-join-disambiguation .bk-mjp-options .bk-clickable',
    JOIN_PATH_EDIT: '.bk-style-icon-link',
    BROKEN_WS_ACTION_LINK: '.bk-warning-message-action-link',
    SHARABLE_ITEM: '.bk-sharable-item-worksheet .bk-sharable-item'
};

var locators = {
    SAVE_BTN: by.css(selectors.SAVE_BTN),
    JOIN_TYPE: by.css(selectors.JOIN_TYPE),
    JOIN_TYPE_CHOICE: by.css(selectors.JOIN_TYPE_CHOICE),
    WORKSHEET_TABLE: by.css(selectors.WORKSHEET_TABLE),
    WORKSHEET_SAVE_NAME_INPUT: by.css(selectors.WORKSHEET_SAVE_NAME_INPUT)
};

function createEmptyWorksheet() {
    navigation.goToUserDataSection();
    actions.selectActionButtonAction(actions.actionLabels.CREATE_WORKSHEET);
}

function waitForWorksheetAbsentInList(worksheetName) {
    let locator = blinkList.getItemLocatorByName(
        blinkList.selectors.ACTIONABLE_LIST_CONTENT, worksheetName);
    return util.waitForElementToNotBePresent(locator);
}

function waitForWorksheetPresentInList(worksheetName) {
    let locator = blinkList.getItemLocatorByName(
        blinkList.selectors.ACTIONABLE_LIST_CONTENT, worksheetName);
    return util.waitForElementCountToBe(locator, 1);
}

function openWorksheet(worksheetName) {
    common.navigation.goToUserDataSection();
    blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, worksheetName);
    util.waitForElement(dataUI.selectors.EXPLORER);
    return dataUI.editSelectedItem();
}

function makeACopyOfWorksheet(copiedWorksheetName) {
    actions.selectActionButtonAction(actions.actionLabels.MAKE_A_COPY);
    util.waitForVisibilityOf(selectors.WORKSHEET_SAVE_NAME_INPUT);
    $(selectors.WORKSHEET_SAVE_NAME_INPUT).sendKeys(copiedWorksheetName);
    dialog.clickPrimaryButton();
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function deleteWorksheet(worksheetName) {
    common.navigation.goToUserDataSection();
    blinkList.deleteItemsByName(
        blinkList.selectors.ACTIONABLE_LIST_CONTENT, [worksheetName]
    );
    var locator = blinkList.getItemLocatorByName(
        blinkList.selectors.ACTIONABLE_LIST_CONTENT, worksheetName);
    return util.waitForElementToNotBePresent(locator);
}

function chooseAllColumnsFromSources(sources) {
    dataPanel.deselectAllSources();
    dataPanel.openAndChooseSources(sources);
    dataPanel.clickDone();
    var promises = [];
    sources.forEach(function (source) {
        util.waitForAndClick(by.cssContainingText(dataPanel.selectors.DATA_SOURCE_ITEM, source));
        util.waitForAndClick(dataPanel.selectors.DATA_ADD_COLUMN_BTN);
        var promise = util.waitForElement(by.cssContainingText(selectors.SLICK_GRID_TABLE_NAME, source));
        promises.push(promise);
    });
    return protractor.promise.all(promises);
}

function saveWorksheet(worksheetName) {
    actions.selectActionButtonAction(actions.actionLabels.SAVE);
    util.waitForVisibilityOf(selectors.WORKSHEET_SAVE_NAME_INPUT);
    $(selectors.WORKSHEET_SAVE_NAME_INPUT).sendKeys(worksheetName);
    dialog.clickPrimaryButton();
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function saveExistingWorksheet() {
    actions.selectActionButtonAction(actions.actionLabels.SAVE);
    return util.expectSuccessNotif();
}

function createSimpleWorksheet(sources, worksheetName) {
    createEmptyWorksheet();
    chooseAllColumnsFromSources(sources);
    saveWorksheet(worksheetName);
}

function waitForColumnCountToBe(count) {
    util.waitForElementCountToBe(by.css(selectors.SLICK_GRID_COLUMN_NAME), count);
}

function chooseMapping(mappingName) {
    util.waitForElement(selectors.JOIN_EDIT_DIALOG);
    var locator = by.cssContainingText(selectors.JOIN_EDIT_DIALOG_OPTION, mappingName);
    element(locator).click();
    dialog.clickPrimaryButton(true);
}

function selectColumnFromTable(tableName, columnName, joinPathMappings) {
    joinPathMappings = joinPathMappings || [];
    dataPanel.expandSource(tableName);
    dataPanel.addColumn(columnName);
    util.waitForAndClick(dataPanel.selectors.DATA_ADD_COLUMN_BTN);
    joinPathMappings.forEach(function (joinMapping) {
        chooseMapping(joinMapping);
    });
    waitForColumn(tableName, columnName);
    return dataPanel.expandSource(tableName);
}

function deleteColumn(tableName, columnName) {
    var checkboxElement = element(by.cssContainingText(selectors.SLICK_GRID_COLUMN, columnName))
        .element(by.css('input'));
    util.waitForAndClick(checkboxElement);
    return util.waitForAndClick(selectors.WORKSHEET_DELETE_BUTTON);
}

var deleteFormula = deleteColumn.bind(void 0, 'Formulas');

function editMappingForColumn(tableName, columnName) {
    waitForColumn(tableName, columnName);
    let editMappingElement =
        element(by.cssContainingText(selectors.SLICK_GRID_COLUMN, columnName))
            .element(by.css(selectors.JOIN_PATH_EDIT));
    editMappingElement.click();
}

function waitForSelectedJoinType(joinType) {
    dataPanel.openChooseSourcesDialog();
    var joinTypeElement = element(
        by.cssContainingText(selectors.JOIN_TYPE_CHOICE_SELECTED, joinType));
    util.scrollElementIntoViewPort(joinTypeElement);
    util.waitForElement(joinTypeElement);
    dataPanel.clickDone();
}

function selectJoinType(joinType) {
    dataPanel.openChooseSourcesDialog();
    var joinTypeElement = element(
        by.cssContainingText(selectors.JOIN_TYPE_CHOICE, joinType)).$('.bk-form-radio');
    util.scrollElementIntoViewPort(joinTypeElement);
    util.waitForAndClick(joinTypeElement);
    dataPanel.clickDone();
}

/**
 * This function is to be used inside browser scope from browser.executeScript.
 * It will not work in protractor scope and should not use any variables from that scope.
 */
function _worksheetFunctions_(sharableItemSelector) {
    function worksheetColumnsGetter() {
        var worksheetSharableItem = $(sharableItemSelector);
        var worksheetScope = worksheetSharableItem && worksheetSharableItem.scope();
        var worksheetModel = worksheetScope && worksheetScope.config.model;
        return worksheetModel && worksheetModel.getColumns();
    }

    function containsTableName(tableName) {
        var columns = worksheetColumnsGetter(sharableItemSelector);
        var sources = columns && columns.map(function(column) {
            return column.getSources()[0];
        });
        return sources && sources.filter(function(source) {
            return source && source.tableName.indexOf(tableName) > -1;
        }).length >= 1;
    }

    function containsColumnName(columnName) {
        var columns = worksheetColumnsGetter(sharableItemSelector);
        var colNames = columns && columns.map(function(column) {
            return column.getName();
        });
        return colNames && colNames.filter(function(name) {
            return name.indexOf(columnName) > -1;
        }).length >= 1;
    }

    return {
        containsTableName: containsTableName,
        containsColumnName: containsColumnName
    }
}

function waitForColumn(tableName, columnName) {
    util.waitForCondition(function () {
        return browser.executeScript(
            function(worksheetFunctionsStr, sharableItemSelector, tableName, columnName) {
                var worksheetFunctions = eval(worksheetFunctionsStr)(sharableItemSelector);
                return worksheetFunctions.containsTableName(tableName)
                    && worksheetFunctions.containsColumnName(columnName);
            }, `(${_worksheetFunctions_.toString()})`, selectors.SHARABLE_ITEM, tableName, columnName);
    });
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function waitForTable(tableName) {
    util.waitForCondition(function () {
        return browser.executeScript(
            function(worksheetFunctionsStr, sharableItemSelector, tableName) {
                var worksheetFunctions = eval(worksheetFunctionsStr)(sharableItemSelector);
                return worksheetFunctions.containsTableName(tableName);
            }, `(${_worksheetFunctions_.toString()})`, selectors.SHARABLE_ITEM, tableName);
    });
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function waitForFormula(formulaName) {
    util.waitForCondition(function () {
        return browser.executeScript(
            function(worksheetFunctionsStr, sharableItemSelector, columnName) {
                var worksheetFunctions = eval(worksheetFunctionsStr)(sharableItemSelector);
                return worksheetFunctions.containsColumnName(columnName);
            }, `(${_worksheetFunctions_.toString()})`, selectors.SHARABLE_ITEM, formulaName);
    });
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function waitForColumnDeletion(tableName, columnName) {
    util.waitForCondition(function () {
        return browser.executeScript(
            function(worksheetFunctionsStr, sharableItemSelector, columnName) {
                var worksheetFunctions = eval(worksheetFunctionsStr)(sharableItemSelector);
                return !worksheetFunctions.containsColumnName(columnName);
            }, `(${_worksheetFunctions_.toString()})`, selectors.SHARABLE_ITEM, columnName);
    });
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function waitForTableDeletion(tableName) {
    util.waitForCondition(function () {
        return browser.executeScript(
            function(worksheetFunctionsStr, sharableItemSelector, tableName) {
                var worksheetFunctions = eval(worksheetFunctionsStr)(sharableItemSelector);
                return !worksheetFunctions.containsTableName(tableName);
            }, `(${_worksheetFunctions_.toString()})`, selectors.SHARABLE_ITEM, tableName);
    });
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function waitForFormulaDeletion(formulaName) {
    util.waitForCondition(function () {
        return browser.executeScript(
            function(worksheetFunctionsStr, sharableItemSelector, columnName) {
                var worksheetFunctions = eval(worksheetFunctionsStr)(sharableItemSelector);
                return !worksheetFunctions.containsColumnName(columnName);
            }, `(${_worksheetFunctions_.toString()})`, selectors.SHARABLE_ITEM, formulaName);
    });
    return util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

module.exports = {
    selectors: selectors,
    locators: locators,
    createEmptyWorksheet,
    waitForWorksheetAbsentInList,
    waitForWorksheetPresentInList,
    openWorksheet,
    saveWorksheet,
    saveExistingWorksheet,
    makeACopyOfWorksheet,
    deleteWorksheet,
    createSimpleWorksheet,
    waitForColumnCountToBe,
    chooseMapping,
    selectColumnFromTable,
    chooseAllColumnsFromSources,
    editMappingForColumn,
    selectJoinType,
    deleteColumn,
    deleteFormula,
    waitForSelectedJoinType,
    waitForColumn,
    waitForTable,
    waitForFormula,
    waitForColumnDeletion,
    waitForTableDeletion,
    waitForFormulaDeletion
};
