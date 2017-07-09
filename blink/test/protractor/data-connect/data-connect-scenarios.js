/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var dataConnect = require('./data-connect-po');
var dialog = require('../scenarios/dialog');
var common = require('../scenarios/common');
var uiSelect = require('../scenarios/libs/ui-select.js');
var props = require('./properties').properties;
var tableValue = require('./properties').tableValue;
var util = common.util;

describe('Data Connect', function() {

    var newConnectionName = 'dummy';

    beforeEach(function() {
        dataConnect.goToDataSources();
    });

    it('should show all available data sources', function() {
        util.waitForAndClick(dataConnect.locators.NEW_DATA_SOURCE_BTN);
        // Ensure we have enough data source types listed.
        util.waitForElementCountToBeMoreThan(dataConnect.selectors.SOURCE_TYPE_IMG,
            Object.keys(props.dataConnectProvidersMap).length);

        // Ensure our test data source is listed.
        Object.keys(props.dataConnectProvidersMap).forEach(function(providerKey) {
            var providerValue = props.dataConnectProvidersMap[providerKey];
            expect(element(dataConnect.getSourceLabelLocator(providerValue)).isPresent()).toBe(true);
        });
    });

    it('should show a data source search text box', function() {
        util.waitForAndClick(dataConnect.locators.NEW_DATA_SOURCE_BTN);
        // Wait for the text box to appear.
        util.waitForElement(dataConnect.selectors.DATA_SOURCE_SEARCH_TEXT);
    });

    it('should filter data source types based on search text input', function() {
        util.waitForAndClick(dataConnect.locators.NEW_DATA_SOURCE_BTN);
        // Wait for the text box to appear.
        util.waitForElement(dataConnect.selectors.DATA_SOURCE_SEARCH_TEXT);
        // Set the text input.
        Object.keys(props.dataConnectProvidersMap).forEach(function(providerKey) {
            var providerValue = props.dataConnectProvidersMap[providerKey];
            element(dataConnect.locators.DS_SEARCH_TEXT_INPUT).clear().sendKeys(providerValue)

            // Ensure we have enough data source types listed.
            util.waitForElementCountToBeMoreThan(dataConnect.selectors.SOURCE_TYPE_IMG, 0);

            expect(element(dataConnect.getSourceLabelLocator(providerValue)).isPresent()).toBe(true);
        });

        // Invalid data source name should not show anything.
        element(dataConnect.locators.DS_SEARCH_TEXT_INPUT).clear().sendKeys('invalid')

        // Ensure we have enough data source types listed.
        util.waitForElementCountToBe(dataConnect.selectors.SOURCE_TYPE_IMG, 0);
    });

    it('should show table shuttle on selecting an existing connection', function() {
        var providerToTest = Object.keys(props.existingConnections)[0];
        dataConnect.goToShuttleStep(providerToTest, props.existingConnections[providerToTest][0]);
        util.waitForElement(dataConnect.selectors.SHUTTLE_STEP.SHUTTLE_CONTAINER);
    });

    it('Should be able to search by table name', function() {
        // Select an existing connection
        dataConnect.selectExistingConnection(props.dataConnectProvidersMap.sqlServer,
            props.existingConnections[props.dataConnectProvidersMap.sqlServer]);

        // Search for table from existing connection
        dataConnect.searchSourceTableByName(tableValue);
        dataConnect.validateAvailableTable(tableValue);
    });

    it('Should be able to add source table for load', function() {
        dataConnect.selectExistingConnection(props.dataConnectProvidersMap.sqlServer,
            props.existingConnections[props.dataConnectProvidersMap.sqlServer]);
        dataConnect.searchSourceTableByName(tableValue);

        // Select the table resulting from search
        dataConnect.clickSourceTable(tableValue);

        // This adds the table from Available -> Selected section.Specify 0 for moveRight,
        // 1 for moveAllRight, 2 for moveLeft and 4 for moveAllLeft
        dataConnect.clickNthButton(0);
        dataConnect.validateDestinationTable(tableValue);

        // This clicks the 'Next' button to go to Transformations page
        $(dialog.selectors.PRIMARY_BUTTON).click();
    });
});
