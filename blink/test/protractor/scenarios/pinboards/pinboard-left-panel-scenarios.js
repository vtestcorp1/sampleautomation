/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var sage = require('../sage/sage.js');
var charts = require('../charts/charts.js');
var common = require('../common.js');
var util = common.util;
var answer = require('../viz-layout/answer/answer.js');
var dialog = require('../dialog.js');
var leftPanel = require('../sage/data-panel/data-panel');

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
        common.util.waitForElementToNotBePresent(pinboards.selectors.CLOSE_FILTER_PANEL);
    });

    it('Verify Filter-pannel is closed',function(){
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        var pinboardName='vtest_sample'
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        pinboards.closeFilterPanel();
        expect(util.waitForElementToNotBePresent(pinboards.selectors.CLOSE_FILTER_PANEL)).toBe(true);
        common.navigation.goToPinboardsSection();
        pinboards.deletePinboard(pinboardName);
    });
});
