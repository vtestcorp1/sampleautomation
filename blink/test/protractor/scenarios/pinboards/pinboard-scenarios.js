/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var answer = require('../viz-layout/answer/answer.js');
var answerListPage = require('../answers/answer-list-page');
var charts = require('../charts/charts.js');
var common = require('../common.js');
var contentEditable = require('../widgets/content-editable.js');
var headline = require('../viz-layout/headline/headline.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var pinboards = require('./pinboards.js');
var pivot = require('../pivot/pivot-po.js');
var table = require('../table/table.js');

describe('Pinboard testing', function () {
    //var pinboardName = 'pinboardScenariosTesting';
    var pinboardName = 'vtestSample';


    beforeAll(function () {
        answer.clearVizDisplayPreference();
    });

    beforeEach(function () {
        common.navigation.goToAnswerSection();
    });

    afterEach(function () {
    });


    it('should be able to edit or update pinboard headline', function () {
        var query = 'product id sale cost';
        var sources = ['SALES'];
        var pinboardNameCreate = 'vtestSample_New_Pin';
        var headlineColumn = 'Sale Cost';
        var expectedValue = '2.17k';

        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(pinboardNameCreate);
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        headline.pinHeadline(headlineColumn, pinboardNameCreate);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardNameCreate);
        pinboards.openVizEditor();
        pinboards.changeAggregationToAverage();
        pinboards.closeVizEditor();
        expect(pinboards.getPinboardBoxText()).toBe(expectedValue);
        pinboards.deletePinboard(pinboardNameCreate);
    });

    it('[SMOKE] should be able to load pinboard with chart,table and headline', function() {
        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(pinboardName);
        common.navigation.goToQuestionSection();
        var sources = ['LINEORDER', 'DATE'];
        answer.doAdhocQuery('revenue commit date', sources, charts.vizTypes.CHART);
        answer.addShowingVizToPinboard(pinboardName);
        answer.selectTableType();
        answer.addShowingVizToPinboard(pinboardName);
        headline.pinHeadline('Revenue', pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
    });

    it('[SMOKE] should allow addition of chart and table viz to a pinboard', function () {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        answer.selectTableType();
        answer.addShowingVizToPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForVizCountToBe(2);
    });

    // TODO(Priyanshi) Enable title editing when the new edit feature is implemented.
    xit('[SMOKE] should be able to add and remove viz tile description', function() {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        var description = 'Description text';
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForVizCountToBe(1);
        var viz = pinboards.getVizElementByName('Total Revenue by Customer Region');
        pinboards.openVizContentEditable(viz);
        contentEditable.enterDescription(pinboards.selectors.VIZ_TITLE_CONTAINER, description);
        pinboards.save();
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizContentEditable(viz);
        contentEditable.waitForDescriptionText(pinboards.selectors.VIZ_TITLE_CONTAINER, description);
        contentEditable.clearDescription(pinboards.selectors.VIZ_TITLE_CONTAINER);
        contentEditable.waitForDescriptionText(pinboards.selectors.VIZ_TITLE_CONTAINER, '');
    });

    it('should allow addition of chart and table viz from a saved answer', function () {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        var savedAnswerName = 'savedAnswer';
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.saveCurrentAnswer(savedAnswerName);
        answer.addShowingVizToNewPinboard(pinboardName);
        answer.selectTableType();
        answer.addShowingVizToPinboard(pinboardName);
        answer.saveCurrentAnswer(savedAnswerName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForVizCountToBe(2);
        answerListPage.deleteAnswer(savedAnswerName);
    });

    it('should keep showing viz-context edit button on pinboard save: SCAL-10952', function () {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.resizeViz(pinboards.sizeMenuIndex.SMALL);
        pinboards.save();
        pinboards.openVizEditor();

        pinboards.closeVizEditor();
    });

    it('Should auto align pinboard tiles on delete', function() {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        answer.selectTableType();
        answer.addShowingVizToPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForVizCountToBe(2);

        pinboards.deleteViz();
        pinboards.waitForVizCountToBe(1);
        var remainingViz = $(pinboards.selectors.VIZ);
        browser.wait(function() {
            return remainingViz.getLocation().then((location) => {
                return location.x === 40;
        });
        });
    });

    it('should be able to resize pinboard through sizes', function () {
        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];
        var description = 'Description text';
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.waitForVizCountToBe(1);
        pinboards.resizeViz(pinboards.sizeMenuIndex.SMALL);
        pinboards.getVizElementAtIndex(0);
        expect($(pinboards.selectors.TILE_SIZE_SMALL).isPresent()).toBe(true);
        pinboards.resizeViz(pinboards.sizeMenuIndex.MEDIUM);
        expect($(pinboards.selectors.TILE_SIZE_MEDIUM).isPresent()).toBe(true);
        pinboards.resizeViz(pinboards.sizeMenuIndex.LARGE);
        expect($(pinboards.selectors.TILE_SIZE_LARGE).isPresent()).toBe(true);
        pinboards.resizeViz(pinboards.sizeMenuIndex.LARGE_SMALL);
        expect($(pinboards.selectors.TILE_SIZE_LARGE_SMALL).isPresent()).toBe(true);
        pinboards.resizeViz(pinboards.sizeMenuIndex.MEDIUM_SMALL);
        expect($(pinboards.selectors.TILE_SIZE_MEDIUM_SMALL).isPresent()).toBe(true);
    });

    it('Should be able to pin pivot to pinboard', () => {
        let answerName = 'Pivot Answer';
    answer.doAdhocQuery('revenue color customer region', ['LINEORDER'], charts.vizTypes.CHART);
    answer.navigateAndWaitForChartType(charts.chartTypes.PIVOT_TABLE);
    pivot.dragRowFieldToColumnArea('Color');
    answer.openVizEditorPanel();
    charts.waitForLegendAxisColumnsToMatch(['Customer Region', 'Color']);
    answer.addShowingVizToNewPinboard(pinboardName);
    common.navigation.goToPinboardsSection();
    pinboards.openPinboard(pinboardName);
    var vizElement = pinboards.getVizElementAtIndex(0);
    pinboards.waitForChartCountToBe(1);
});

    it('Should be able to pin geo-area map to pinboard', () => {
        var query = 'county median household income state = ca ' +
            'sum median household income > 50000';
    var sources = ['geo_usa_data'];
    answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
    answer.navigateAndWaitForChartType(charts.chartTypes.GEO_AREA);
    charts.waitForChartVizToLoad();
    answer.addShowingVizToNewPinboard(pinboardName);
    common.navigation.goToPinboardsSection();
    pinboards.openPinboard(pinboardName);
    var vizElement = pinboards.getVizElementAtIndex(0);
    pinboards.waitForChartCountToBe(1);
});
});

describe('Pinboard Label Testing', function () {
    var visualizations = [
        {
            title: 'column : revenue color',
            query: 'revenue color',
            enableDataLabels: true,
            expectDataLabels: true,
            type: charts.chartTypes.COLUMN,
            sources: ['LINEORDER', 'PART']
        },
        {
            title: 'bar : revenue color',
            query: 'revenue color',
            enableDataLabels: false,
            expectDataLabels: false,
            type: charts.chartTypes.BAR,
            sources: ['LINEORDER', 'PART']
        },
        {
            title: 'pareto : revenue color tax',
            query: 'revenue color tax',
            enableDataLabels: true,
            expectDataLabels: true,
            type: charts.chartTypes.PARETO,
            sources: ['LINEORDER', 'PART']
        },
        {
            title: 'treemap: revenue color tax',
            query: 'revenue color tax',
            enableDataLabels: false,
            // TODO (Rahul/Jasmeet): TreeMap shows data labels but our protractor API does not
            // currently returns data labels, so the expectation of this test returns false,
            // this needs to be fixed. Additionally, toggle data labels for treemaps
            // is broken in the product, that also needs investigation.
            expectDataLabels: false,
            type: charts.chartTypes.TREEMAP,
            sources: ['LINEORDER', 'PART']
        },
        {
            title: 'pie: revenue customer region',
            query: 'revenue customer region',
            enableDataLabels: false,
            expectDataLabels: true,
            type: charts.chartTypes.PIE,
            sources: ['LINEORDER', 'CUSTOMER']
        },
        {
            title: 'scatter: revenue order date',
            query: 'revenue order date',
            enableDataLabels: false,
            expectDataLabels: false,
            type: charts.chartTypes.SCATTER,
            sources: ['LINEORDER']
        }
    ];

    visualizations.forEach(function (viz) {
        it('[SMOKE] should render data labels for appropriate charts', function () {
            var pinboardName = 'Golden_Pinboard';
            /**
             * The test works of a config specifying how
             * the visualizations are supposed to be constructed and what are the final
             * expectations are from it. The motivation is that in the future for label
             * based testing which depend on chart type, a new entry can be added and
             * it will get added into an expectation.
             */

            common.navigation.goToPinboardsSection();
            pinboards.createPinboard(pinboardName);
            common.navigation.goToQuestionSection();
            answer.doAdhocQuery(viz.query, viz.sources, charts.vizTypes.CHART);
            answer.navigateToChartType(viz.type);
            if (viz.enableDataLabels) {
                answer.openVizEditorPanel();
                charts.chartEditor.waitForChartAxisPanel();
                charts.toggleShowDataLabelsCheckbox();
            }
            answer.setVizTitle(viz.title);
            answer.addShowingVizToPinboard(pinboardName);
            common.navigation.goToPinboardsSection();
            pinboards.openPinboard(pinboardName);

            var vizElement = pinboards.getVizElementByName(viz.title);
            common.util.scrollElementIntoViewPort(vizElement);
            if (viz.expectDataLabels) {
                common.util.waitForElementCountToBeMoreThan(charts.getDataLabels(vizElement), 0);
            } else {
                common.util.waitForElementCountToBe(charts.getDataLabels(vizElement), 0);
            }

            common.navigation.goToPinboardsSection();
            pinboards.deletePinboard(pinboardName);
        });
    });

});