/**
 * Copyright Thoughtspot Inc. 2017
 * Author: Rahul Balakavi (rahul.balakavi@thoughtspot.com)
 */
'use strict';

var dataConnect = require('./data-connect-po');
var dataConnectTransformation = require('./data-connect-transformations-po');
var dialog = require('../scenarios/dialog');
var common = require('../scenarios/common');
var uiSelect = require('../scenarios/libs/ui-select.js');
var props = require('./properties').properties;
var tableValue = require('./properties').tableValue;
var util = common.util;

describe('Data Connect', function() {

    beforeEach(function() {
        dataConnect.goToTransformationStep(props.dataConnectProvidersMap.sqlServer,
            props.existingConnections[props.dataConnectProvidersMap.sqlServer], tableValue);
    });

    
    it('Should show add-filter dialog', function() {
        // Click on add-filter
        util.waitForAndClick(dataConnectTransformation.locators.ADD_FILTER_BUTTON);
        // Wait for the dialog.
        dialog.waitForDialogTitle("Data Filter");
        // Verify the set of filter functions defined.
        props.FILTER_FUNCTIONS.map(function(filterFunction) {
            browser.sleep(5000);
            uiSelect.openSelector(element(dataConnectTransformation.locators.EXPAND_FILTER_FUNCTIONS));
            browser.pause();
            uiSelect.selectSingle(element(dataConnectTransformation.locators.EXPAND_FILTER_FUNCTIONS),
                filterFunction , false);
        });
        // close the dialog.
        dialog.cleanupDialog();
    });
});
