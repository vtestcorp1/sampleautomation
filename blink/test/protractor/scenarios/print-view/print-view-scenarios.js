/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */
'use strict';

var pinboards = require('../pinboards/pinboards.js');
var common = require('../common.js');
var charts = require('../charts/charts.js');
var tables = require('../table/table.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var answer = require('../viz-layout/answer/answer');
var headline = require('../viz-layout/headline/headline');
var printView = require('./print-view');

describe('Print view', function () {

    beforeAll(function() {
        common.navigation.goToQuestionSection();
    });

    afterAll(function() {
        common.navigation.goToInAppPath('/');
        answer.clearVizDisplayPreference();
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
    });

    beforeEach(function() {
        answer.clearVizDisplayPreference();
        common.navigation.goToInAppPath('/');
    });

    it('[SMOKE][SCAL-18616] should load all vizs successfully', function () {
        var pinboardName = 'printViewPinboard';
        common.navigation.goToQuestionSection();
        answer.doAdhocQuery('revenue color', ['LINEORDER'], charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        answer.queryAndWaitForChart('revenue commit date');
        answer.selectTableType();
        headline.pinHeadline('Quarterly (Commit Date)', pinboardName);
        answer.addShowingVizToPinboard(pinboardName);
        headline.pinHeadline('Revenue', pinboardName);

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        var chart = pinboards.getVizElementByName('Total Revenue by Color');
        pinboards.resizeViz(pinboards.sizeMenuIndex.SMALL);
        pinboards.save();

        printView.openPinboardInPrintView(pinboardName);
        // In print view everything should aggressively load even if it is not in viewport.
        pinboards.waitForVizCountToBe(4);
        pinboards.waitForChartCountToBe(1);
        pinboards.waitForTableCountToBe(1);
        expect(charts.getXAxisTitle()).toBe('Color');
        expect(charts.getYAxisTitle()).toBe('Total Revenue');

        common.navigation.goToInAppPath('/');
        pinboards.deletePinboard(pinboardName);
    });

    it('[SCAL-18485] Should not show a very wide table in screen shot mode', function () {
        common.navigation.addUrlParameter('screenshotMode', true);
        var pinboardName = 'printViewPinboardTest';
        common.navigation.goToQuestionSection();
        answer.doAdhocQuery('revenue color discount quantity tax orderkey supply cost ship priority' +
            ' manufacturer commit date part name category container size type extended price',
            ['LINEORDER', 'PART', 'DATE', 'CUSTOMER'], charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);

        printView.openPinboardInPrintView(pinboardName);
        pinboards.waitForTableCountToBe(1);

        tables.waitForTable();
        tables.verifyTableHidden();

        common.navigation.goToInAppPath('/');
        pinboards.deletePinboard(pinboardName);
        common.navigation.removeUrlParameter('screenshotMode');
    });

    it('[SMOKE] Total height of the pinboard in print-view should be correct', function() {
        // Create a pinboard with 1 table, 1 chart, 1 number headline, 1 date headline and 1 map.
        var pinboardName = 'printViewTotalHeight';
        common.navigation.goToQuestionSection();
        answer.doAdhocQuery('revenue color',
            ['LINEORDER', 'geo_france_population_data'], charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        answer.queryAndWaitForChart('revenue commit date');
        answer.selectTableType();
        headline.pinHeadline('Quarterly (Commit Date)', pinboardName);
        answer.addShowingVizToPinboard(pinboardName);
        headline.pinHeadline('Revenue', pinboardName);
        answer.queryAndWaitForTable('population by region insee code');
        answer.navigateAndWaitForChartType('GEO_AREA');
        answer.addShowingVizToPinboard(pinboardName);

        printView.openPinboardInPrintView(pinboardName);
        pinboards.getPinboard().getSize().then(function(size) {
            // 5 vizs and one cover page.
            expect(size.height).toEqual(6 * 792);
        });

        common.navigation.goToInAppPath('/');
        pinboards.deletePinboard(pinboardName);
    });
});
