/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var charts = require('../charts/charts.js');
var common = require('../common.js');
var answer = require('../viz-layout/answer/answer.js');
var headline = require('../viz-layout/headline/headline.js');
var contentEditable = require('../widgets/content-editable.js');

describe('Pinboard Rendering testing', function () {
    var pinboardName = 'pinboardScenariosTesting';

    beforeEach(function () {
        common.navigation.goToAnswerSection();
    });

    it('should show not auto show legends in charts if the charts are too short: SCAL-2224', function () {
        var query = 'revenue customer region color';
        var sources = ['LINEORDER', 'CUSTOMER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        charts.waitForLegendPickerToAppear();
        pinboards.resizeViz(pinboards.sizeMenuIndex.SMALL);
        charts.waitForLegendPickerToDisappear();
        common.navigation.goToPinboardsSection();
        pinboards.deletePinboard(pinboardName);
    });

    //SCAL-19026
    xit('should render headline with proper formatting', function () {
        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(pinboardName);
        common.navigation.goToQuestionSection();
        answer.queryAndWaitForChart('revenue commit date');
        answer.selectTableType();
        headline.pinHeadline('Quarterly (Commit Date)', pinboardName);
        headline.pinHeadline('Revenue', pinboardName);

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        // Verify fonts
        headline.verifyHeadlineFontSize('Revenue', '28px');
        headline.verifyHeadlineFontSize('Quarterly (commit date)', '16px');
        // Verify title
        contentEditable.waitForInputText(pinboards.selectors.VIZ_HEADER, 'Quarterly (commit date)');
        common.navigation.goToPinboardsSection();
        pinboards.deletePinboard(pinboardName);
    });

    it('should keep color on chart consistent', function() {
        var expectedColor = 'rgb(255,148,25)';
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Basic Pinboard 1');
        charts.waitForChartVizToLoad();
        var columnColorPromise = charts.getChartColumnFillColor(
            element(charts.locators.CHART_VIZ),
            0
        );
        common.util.expectCaseInsensitiveEquals(
            columnColorPromise,
            expectedColor
        );
        browser.refresh();
        charts.waitForChartVizToLoad();
        var columnColorPromise = charts.getChartColumnFillColor(
            element(charts.locators.CHART_VIZ),
            0
        );
        common.util.expectCaseInsensitiveEquals(
            columnColorPromise,
            expectedColor
        );
    });

    it('SCAL-18932 should correct legend items', function() {
        var query = 'revenue color customer nation';
        var sources = ['LINEORDER', 'CUSTOMER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        charts.singularSelectLegendItem('algeria');
        charts.singularDeselectLegendItem('algeria');
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);

       
        charts.waitForLegendPickerToAppear();
        
        charts.singularSelectLegendItem('algeria');
        charts.singularDeselectLegendItem('algeria');
        common.navigation.goToPinboardsSection();
        pinboards.deletePinboard(pinboardName);
    });
});
