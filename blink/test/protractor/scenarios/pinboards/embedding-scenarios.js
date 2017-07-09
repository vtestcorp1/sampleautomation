/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var common = require('../common.js');
var actionBtn = require('../actions-button');
var util = common.util;

describe('Embedded pinboard', function() {
    afterEach(function() {
        common.navigation.goToInAppPath('/');
    });

    it('Should show correct menu options on embedded viz', function() {
        common.navigation.goToPinboardsSection();
        var pinboardToOpen = 'Basic Pinboard 1';
        pinboards.openPinboard(pinboardToOpen);
        pinboards.openEmbeddedViz();
        util.waitForElement(pinboards.selectors.VIZ);
        pinboards.openVizDropdownMenu();
        expect($$(actionBtn.selectors.ACTION_BUTTON_DROPDOWN_ITEM).count()).toBe(3);
        expect($(pinboards.selectors.DOWNLOAD_VIZ).isPresent()).toBe(true);
    });

    it('should show only the requested viz', function() {
        common.navigation.goToPinboardsSection();
        var pinboardToOpen = 'Revenue Trends';
        pinboards.openPinboard(pinboardToOpen);
        pinboards.openEmbeddedViz();
        util.waitForElementCountToBe(pinboards.selectors.VIZ_TITLE, 1);
        expect($(pinboards.selectors.VIZ_TITLE).getAttribute('value')).toBe('Total Revenue Trend');
    })
});
