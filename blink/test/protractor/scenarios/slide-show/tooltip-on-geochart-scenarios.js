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

    it('should be able to display toolTip on geochart', function(){
        var query = 'region population';
        var sources = ['geo_france_population_data'];
        var toolTip = 'centre-val de loire';

        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.navigateAndWaitForChartType(charts.chartTypes.GEO_AREA);
        expect(slideShow.getToolTip()).toContain(toolTip);
    });

 });
