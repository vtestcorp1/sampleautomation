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

    it('[SMOKE] Should be able to drill down on a slide viz', function() {
        var pinboardName = 'SlideShowTestPinboard';
        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        var query2 = 'revenue customer region';
        var sources2 = ['LINEORDER', 'CUSTOMER'];

        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        answer.doAdhocQuery(query2, sources2, charts.vizTypes.CHART);
        answer.addShowingVizToPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.startSlideShow();
        var el = $$(charts.selectors.CHART_COLUMN).get(0);
        util.rightClickElement(el);

        var columnName = 'Customer Region';
        element(charts.locators.DRILL_DOWN).click();
        drill.waitForDrillDownPopup();
        drill.typeTextInSearch(columnName);
        drill.selectDrillItem(columnName);


        util.waitForElement(pinboards.selectors.RESET_TRANSFORMS);
        expect(charts.getColumnRectangles().count()).toBe(5);

        slideShow.closeSlideShow();
        pinboards.deletePinboard(pinboardName);
    });

    it('SCAL-18512 should be able to load visualizations in slideshow mode if not already ' +
        'loaded due to being out of viewport', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Genericjoin Pinboard 1');
        pinboards.startSlideShow(pinboards.getVizElementAtIndex(0));
        slideShow.goToSlideByName('Chart 1');
        var chartRootElement = pinboards.getVizElementByName('Chart 1');
        charts.waitForChartVizToLoad();
        slideShow.closeSlideShow();
    });

    it('Should be able to open pivot viz in slideshow and drag Row Field To Column Area', () => {
        var pinboardName = 'SlideShowTestPinboard';
        let answerName = 'Pivot Answer';
        answer.doAdhocQuery('revenue color customer region', ['LINEORDER'], charts.vizTypes.CHART);
        answer.navigateAndWaitForChartType(charts.chartTypes.PIVOT_TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        var vizElement = pinboards.getVizElementAtIndex(0);
        pinboards.waitForChartCountToBe(1);
        pinboards.startSlideShow(pinboards.getVizElementAtIndex(0));
        pivot.dragRowFieldToColumnArea('Color');
        pivot.waitForVerticalHeaderRowsCountToBe(1);
        slideShow.closeSlideShow();
        pinboards.deletePinboard(pinboardName);
    });

});
