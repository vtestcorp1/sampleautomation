/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var pinboards = require('../pinboards/pinboards.js');
var charts = require('../charts/charts.js');
var drill = require('../context-menu/drill/drill-po');
var slideShow = require('./slide-show');
var common = require('../common');
var util = common.util;
var answer = require('../viz-layout/answer/answer.js');
var pivot = require('../pivot/pivot-po.js');
var leftPanel = require('../sage/data-panel/data-panel');

describe('Slide show', function () {

    afterAll(function(){
        slideShow.closeSlideShow();
    });

    it('should be able to select and de-select legend values', function (){
        var expetedGeoMapText = 'Île-de-france';
        var expectedAllDeselect = 'new aquitaine';
        var pinboardName = 'vtest_geo_pin';

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.startSlideShow();
        expect(slideShow.clickOnOnlyLink()).toContain(expetedGeoMapText);
        expect(slideShow.clickOnOnlyLink()).toContain(expectedAllDeselect);
    });

});
