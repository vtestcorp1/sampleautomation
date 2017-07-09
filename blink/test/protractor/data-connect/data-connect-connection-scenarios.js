/**
 * Copyright Thoughtspot Inc. 2017
 * Author: Tushar Mahale (tushar@thoughtspot.com)
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

    it('Should show existing connections for a provider', function() {
        var providerToTest = Object.keys(props.existingConnections)[0];
        dataConnect.goToShuttleStep(providerToTest);
        props.existingConnections[providerToTest].forEach(function(connectionName) {
            uiSelect.checkForOptionMoreThan(
                $(dataConnect.selectors.SELECT_CONN_CONTAINER),
                connectionName,
                0 /* Should have > 0 number of connections */);
        });
    });

    it('Should show edit/delete options for existing connections', function() {
        var providerToTest = Object.keys(props.existingConnections)[0];
        dataConnect.goToShuttleStep(providerToTest);
        var connectionName = props.existingConnections[providerToTest][0];
        util.waitForElement(dataConnect.selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM);
        uiSelect.hoverSingleValue(
            $(dataConnect.selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM),
            ''
        );
        util.waitForVisibilityOf(dataConnect.selectors.SHUTTLE_STEP.EDIT_CONN_BUTTON);
        util.waitForVisibilityOf(dataConnect.selectors.SHUTTLE_STEP.DELETE_CONN_BUTTON);
    });

    it('Should show create connection button', function() {
        var providerToTest = Object.keys(props.existingConnections)[0];
        dataConnect.goToShuttleStep(providerToTest);
        $(dataConnect.selectors.SHUTTLE_STEP.CREATE_BUTTON).click();
        util.waitForElement(common.dialog.locators.DIALOG);
        element(common.dialog.locators.PRIMARY_CANCEL_BTN).click();
    });

    it('Should be able to create new connection', function () {
        var providerToTest = Object.keys(props.connectionProperties)[0];
        dataConnect.createConnection(providerToTest);

        util.waitForElement(uiSelect.getSelectedOptionElement(
            $(dataConnect.selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM)));
        expect(uiSelect.getSelectionText(
            $(dataConnect.selectors.SHUTTLE_STEP.CONNECTION_SELECT_ITEM)))
            .toMatch(newConnectionName);
        dataConnect.goToDataSources();
        dataConnect.deleteConnection(props.dataConnectProvidersMap.sqlServer, newConnectionName);
    });

    it('Should be able to edit existing connection', function () {
        var providerToTest = Object.keys(props.connectionProperties)[0];
        var northWindDb = 'Northwind';
        var pwd = props.connectionParams[providerToTest][props.connectionProperties.password];

        dataConnect.createConnection(providerToTest);
        dataConnect.openConnectionEditDialog(providerToTest, newConnectionName);
        dataConnect.setConnEditDialogProperty(providerToTest,
            props.connectionProperties.databaseName, northWindDb);
        dataConnect.setConnEditDialogProperty(providerToTest,
            props.connectionProperties.password, pwd);

        dialog.clickPrimaryButton();
        util.expectAndDismissSuccessNotif();

        // Open the connection edit dialog again.
        dataConnect.openConnectionEditDialog(providerToTest, newConnectionName);
        dataConnect.verifyConnEditDialogProperty(providerToTest,
            props.connectionProperties.databaseName, northWindDb)

        dialog.clickCancelButton();

        dataConnect.deleteConnection(props.dataConnectProvidersMap.sqlServer, newConnectionName);
    });

    it('Should be able to select an existing connection', function() {
        dataConnect.selectExistingConnection(props.dataConnectProvidersMap.sqlServer,
            props.existingConnections[props.dataConnectProvidersMap.sqlServer]);
    });
});
