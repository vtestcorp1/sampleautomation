/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var sage = require('../sage/sage.js');
var charts = require('../charts/charts.js');
var common = require('../common.js');
var answer = require('../viz-layout/answer/answer.js');
var dialog = require('../dialog.js');

describe('Pinboard filter scenarios', function () {

    it('should be able to close filter panel', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Genericjoin Pinboard 1');
        pinboards.openFilterPanel();
        pinboards.closeFilterPanel();
        common.util.waitForElementToNotBePresent(
            pinboards.selectors.CLOSE_FILTER_PANEL
        );
    });

    it('should be able to close filter panel even if no sources are available', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Revenue Trends');
        pinboards.openFilterPanel();
        pinboards.closeFilterPanel();
        common.util.waitForElementToNotBePresent(
            pinboards.selectors.CLOSE_FILTER_PANEL
        );
    });
});
