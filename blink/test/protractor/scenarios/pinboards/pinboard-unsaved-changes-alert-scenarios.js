/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var common = require('../common.js');
var answer = require('../viz-layout/answer/answer.js');
var charts = require('../charts/charts.js');

describe('Pinboard unsaved changes alert', function () {

    it('should not show up if nothing is changed', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('GenericJoin Pinboard 2');
        pinboards.switchToPinboard('Genericjoin Pinboard 1');
        var firstViz = pinboards.getVizElementByName('Table 1');
        common.util.waitForElement(firstViz);
    });

    it('[SMOKE] should show unsaved changes alert before going to context', function () {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        var pinboardName = 'unsavedAlertTestPinboard1';
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.resizeViz(pinboards.sizeMenuIndex.SMALL);
        pinboards.openVizEditor();
        expect(element.all(common.dialog.locators.DIALOG).count()).toBe(1);
        element(common.dialog.locators.PRIMARY_DLG_BTN).click();
        pinboards.closeVizEditor();
        expect(element.all(common.dialog.locators.DIALOG).count()).toBe(0);
    });

    it('should not show up after name is saved successfully', function () {
        var name = 'unsavedAlertTestPinboard',
            nameAfterRename = 'unsavedAlertTestPinboard2';
        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(name);
        pinboards.rename(nameAfterRename);
        common.metadataItemSelector.waitForSelectedItemToBe(
            pinboards.selectors.PINBOARD_SELECTOR_DROPDOWN,
            nameAfterRename
        );
        // If alert didn't show up, it will successfully be able to go the question section.
        common.navigation.goToQuestionSection();
        pinboards.deletePinboard(nameAfterRename)
    });
});
