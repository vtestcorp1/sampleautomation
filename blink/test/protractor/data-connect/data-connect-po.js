/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var common = require('../scenarios/common');
var dialog = require('../scenarios/dialog');
var uiSelect = require('../scenarios/libs/ui-select');
var util = common.util;
var select = require('../scenarios/select/select');
var props = require('./properties').properties;

var selectors = {
    DATA_UI_TABS: '.bk-data-list .bk-tab-header li',
    SOURCE_TYPE_IMG: '.bk-image-container img',
    SOURCE_TYPE_LABEL: '.bk-image-label',
    NEXT_BTN: '.bk-next-button',
    SELECT_CONN_CONTAINER: '.bk-select-connection-dropdown',
    SHUTTLE_STEP : {
        SHUTTLE_CONTAINER: '.shuttle-viewer-container',
        CREATE_BUTTON: '.bk-btn-create-conn',
        DELETE_CONN_BUTTON: '.bk-conn-delete-icon',
        EDIT_CONN_BUTTON: '.bk-conn-edit-icon',
        CONNECTION_SELECT_ITEM: '.bk-conn-select',
        CONNECTION_PROPERTY: '.bk-connection-property'
    },
    TABLE_VIEWER_CONTAINER: '.table-viewer-container',
    SOURCE_TABLE_ITEMS: '.left-shuttle .bk-general-item-viewer .bk-general-item',
    DESTINATION_TABLE_ITEMS: '.right-shuttle .bk-general-item-viewer .bk-general-item',
    SHUTTLE_BUTTONS: '.buttons-mid .bk-btn',
    DATA_SOURCE_SEARCH_TEXT: '.bk-type-search input'

};

selectors.SEARCH_AVAILABLE_TABLE = common.util.joinSelectors(selectors.TABLE_VIEWER_CONTAINER, '.bk-search-input');


var locators = {
    DATA_SOURCES_TAB: by.cssContainingText(selectors.DATA_UI_TABS, 'Data Sources'),
    NEW_DATA_SOURCE_BTN: by.cssContainingText('.bk-button-wrapper', 'Data source'),
    CANCEL_BTN: by.cssContainingText('.bk-button-wrapper', 'Cancel'),
    TEST_EDIT_BTN: by.cssContainingText('.bk-button-wrapper','Test & Edit'),
    DS_SEARCH_TEXT_INPUT: by.css('.bk-search-input')
    // TODO(Priyanka)
    // MOVE_RIGHT: by.cssContainingText(selectors.SHUTTLE_BUTTONS, '>') - This wont work as there is also '>>' available
};

function getSourceLabelLocator(sourceName) {
    return by.cssContainingText(selectors.SOURCE_TYPE_LABEL, sourceName);
}

function getSourceImgLocator(sourceName) {
    return getSourceLabelLocator(sourceName).element(by.xpath('preceding-sibling::div'));
}

function goToDataSources() {
    common.navigation.goToUserDataSection();
    util.waitForAndClick(locators.DATA_SOURCES_TAB);
}

function goToShuttleStep(provider, connectionName) {
    goToDataSources();
    util.waitForAndClick(locators.NEW_DATA_SOURCE_BTN);
    var dsImage = element(by.cssContainingText(selectors.SOURCE_TYPE_LABEL, provider))
        .element(by.xpath('preceding-sibling::div'));
    util.waitForElementToBeClickable(dsImage);

    dsImage.click();

    util.waitForElement(selectors.SELECT_CONN_CONTAINER);
    if(!!connectionName) {
        uiSelect.changeSelection($(selectors.SELECT_CONN_CONTAINER), connectionName, true);
    }
}

function goToTransformationStep(provider, connectionName, tableValue) {
    // Go to shuttle step.
    goToShuttleStep(provider, connectionName);
    // Pick connection.
    selectExistingConnection(provider, connectionName);
    searchSourceTableByName(tableValue);
    // Select the table resulting from search
    clickSourceTable(tableValue);
    // This adds the table from Available -> Selected section.Specify 0 for moveRight,
    // 1 for moveAllRight, 2 for moveLeft and 4 for moveAllLeft
    clickNthButton(0);
    validateDestinationTable(tableValue);
    // This clicks the 'Next' button to go to Transformations page
    $(dialog.selectors.PRIMARY_BUTTON).click();
}

function fillConnEditDialog(connectionProperties, params) {
    Object.keys(params).forEach(function(connPropertyKey) {
        var property = element(
            by.cssContainingText(
                selectors.SHUTTLE_STEP.CONNECTION_PROPERTY,
                connPropertyKey
            )
        );
        if(connectionProperties[connPropertyKey] === 'text') {
            var inputElement = property.element(by.tagName('input'));
            inputElement.click();
            inputElement.clear().sendKeys(params[connPropertyKey]);

        } else if(connectionProperties[connPropertyKey] === 'select') {
            select.setSingleValue(
                property.element(by.css(select.selectors.CONTAINER)),
                params[connPropertyKey]
            );
        }
    })
}

function setConnEditDialogProperty(providerName, key, value) {
    var property = element(
        by.cssContainingText(
            selectors.SHUTTLE_STEP.CONNECTION_PROPERTY,
            key
        )
    );
    if(props.connectionProperties[providerName][key] === 'text') {
        var inputElement = property.element(by.tagName('input'));
        inputElement.click();
        inputElement.clear().sendKeys(value);
    } else if(props.connectionProperties[providerName][key] === 'select') {
        select.setSingleValue(
            property.element(by.css(select.selectors.CONTAINER)), value
        );
    }
}

function verifyConnEditDialogProperty(providerName, key, value) {
    var property = element(
        by.cssContainingText(
            selectors.SHUTTLE_STEP.CONNECTION_PROPERTY,
            key
        )
    );
    if(props.connectionProperties[providerName][key] === 'text') {
        var inputElement = property.element(by.tagName('input'));
        inputElement.click();
        expect(inputElement.getAttribute('value')).toMatch(value);
    } else if(props.connectionProperties[providerName][key] === 'select') {
        expect(select.getSelectedOptionElement(
            property.element(by.css(select.selectors.CONTAINER))
        )).toMatch(value);
    }
}

function cancelWizard() {
    element(locators.CANCEL_BTN).click();
    util.waitForElement(common.dialog.locators.DIALOG);
    element(common.dialog.locators.PRIMARY_DLG_BTN).click();
}

// Search for source table by name
function searchSourceTableByName(tableName) {
    var input = $(selectors.SEARCH_AVAILABLE_TABLE);
    input.sendKeys(tableName);
    input.sendKeys(protractor.Key.ENTER);
}

// Select the table to be added to Selected Table list
function clickSourceTable(tableName){
    var tableRow = element(by.cssContainingText(selectors.SOURCE_TABLE_ITEMS, tableName));
    util.waitForAndClick(tableRow.element(by.css(common.blinkCheckbox.selectors.CONTAINER)));
}

// Move the table from Available -> Selected list
function clickNthButton(nthButton){
    $$(selectors.SHUTTLE_BUTTONS).get(nthButton).click();
}

function createConnection(providerToTest) {
    var providerToTest = Object.keys(props.connectionProperties)[0];
    goToShuttleStep(providerToTest);
    util.mouseMoveToElement(selectors.SHUTTLE_STEP.CREATE_BUTTON);
    $(selectors.SHUTTLE_STEP.CREATE_BUTTON).click();
    util.waitForElement(common.dialog.locators.DIALOG);
    var connProps = props.connectionProperties[providerToTest];
    // Enter the values for the connection attributes
    fillConnEditDialog(connProps,
        props.connectionParams[providerToTest]
    );
    dialog.clickPrimaryButton(true);

    util.expectAndDismissSuccessNotif();
}

function deleteConnection(providerName, connectionName) {
    goToShuttleStep(providerName);
    util.waitForElement(selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM);
    uiSelect.hoverSingleValue(
        $(selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM),
        connectionName,
        true /* shouldTypeText */
    );
    util.waitForAndClick($ (selectors.SHUTTLE_STEP.DELETE_CONN_BUTTON));
    util.expectAndDismissSuccessNotif();
}

function openConnectionEditDialog(providerName, connectionName) {
    goToShuttleStep(providerName);
    util.waitForElement(selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM);
    uiSelect.hoverSingleValue(
        $(selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM),
        connectionName,
        true /* shouldTypeText */
    );
    util.waitForAndClick($ (selectors.SHUTTLE_STEP.EDIT_CONN_BUTTON));
    util.waitForElement(common.dialog.locators.DIALOG);
}

function selectExistingConnection(providerName, connectionName){
    goToShuttleStep(providerName);
    util.waitForElement(selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM);
    uiSelect.changeSelection(
        $(selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM),
        connectionName
    );
    util.waitForElement($(selectors.TABLE_VIEWER_CONTAINER));
}
function validateAvailableTable(tableValue) {
    util.waitForElementCountToBe(selectors.SOURCE_TABLE_ITEMS, 1);
    util.waitForVisibilityOf(element(by.cssContainingText(
        selectors.SOURCE_TABLE_ITEMS, tableValue))
    );
}

function validateDestinationTable(tableValue) {
    util.waitForElementCountToBe(selectors.DESTINATION_TABLE_ITEMS, 1);
    util.waitForVisibilityOf(element(by.cssContainingText(
        selectors.DESTINATION_TABLE_ITEMS, tableValue))
    );
}

module.exports = {
    selectors: selectors,
    locators: locators,
    goToDataSources: goToDataSources,
    goToTransformationStep: goToTransformationStep,
    getSourceLabelLocator: getSourceLabelLocator,
    getSourceImgLocator: getSourceImgLocator,
    cancelWizard: cancelWizard,
    goToShuttleStep: goToShuttleStep,
    fillConnEditDialog: fillConnEditDialog,
    searchSourceTableByName: searchSourceTableByName,
    clickSourceTable: clickSourceTable,
    clickNthButton: clickNthButton,
    selectExistingConnection: selectExistingConnection,
    createConnection: createConnection,
    deleteConnection: deleteConnection,
    validateAvailableTable: validateAvailableTable,
    validateDestinationTable: validateDestinationTable,
    setConnEditDialogProperty: setConnEditDialogProperty,
    openConnectionEditDialog: openConnectionEditDialog,
    verifyConnEditDialogProperty: verifyConnEditDialogProperty
};
