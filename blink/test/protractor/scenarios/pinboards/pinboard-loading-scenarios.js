/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var common = require('../common.js');

describe('Pinboard loading', function () {

    beforeEach(function () {
        common.navigation.goToAnswerSection();
    });

    it('[SMOKE][IE] should not load vizs that are not in viewport', function() {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Genericjoin Pinboard 1');
        // There should be exactly 5 unloaded vizs
        common.util.waitForElementCountToBeMoreThan(pinboards.selectors.LOADING_VIZ, 1);

        pinboards.getAllVizs().each(function(elem, index) {
            common.util.scrollElementIntoViewPort(elem);
            // wait for a second to ensure that the viewport change event is actually triggered
            // for the new scroll position.
            browser.driver.sleep(1000);
        });
        // Now all the vizs should eventually load.
        common.util.waitForElementCountToBe(pinboards.selectors.LOADING_VIZ, 0);
    });
});
