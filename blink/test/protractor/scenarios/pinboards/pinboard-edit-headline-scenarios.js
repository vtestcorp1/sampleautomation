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
var tableMetrics = require('../table/table-metrics');
var rangefilters = require('../filters/range-filter.js');
var filterDialog = require('../filters/filter-dialog.js');
var util = common.util;
var dataUI = require('../data-ui/data-ui.js');
var importUtils = require('../data-ui/import-wizard/import-wizard.js');
var dataPanel = require('../sage/data-panel/data-panel');
var metricPanel = require('../metrics/metric-panel.js');
var colorPick = require('../libs/colorPicker');
var actionButton = require('../actions-button.js');
var slideshow = require('../slide-show/slide-show.js');
var checkboxFilter= require('../filters/checkbox-filter');
var nav = common.navigation;


describe('Edit pinboard testing', function () {
    //var pinboardName = 'pinboardScenariosTesting';
    var pinboardName = 'vtestSample_New_Pin';
    var headlineColumn = 'Sale Cost';
    var expectedValue = '2.17k';
    var pinboardName1 = 'vtest_geo_pin';
    var vizElement = 'Present';

    beforeAll(function () {
        answer.clearVizDisplayPreference();
    });

    beforeEach(function () {
        common.navigation.goToAnswerSection();
    });

    afterEach(function () {
        //pinboards.deletePinboard(pinboardName);
    });

    it('should be able to edit or update pinboard headline', function () {
        var query = 'product id sale cost';
        var sources = ['SALES'];

        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(pinboardName);
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        headline.pinHeadline(headlineColumn, pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openVizEditor();
        pinboards.changeAggregationToAverage();
        pinboards.closeVizEditor();
        var valEx = pinboards.getPinboardBoxText();
        console.log(valEx);
        expect(expectedValue).toEqual(valEx);
    });

    it('should be able to apply conditional formatting for table', function () {
        var query = 'product id sale cost';
        var sources = ['SALES'];
        var columnName = 'Sale Cost';
        var expectedColor = 'rgba(255, 0, 0, 0.5)';
        var blankColorExpected = 'rgba(0, 0, 0, 0)';

        var selectors = {
            BackColor: '[style="background-color:rgba(255, 0, 0, 0.5);"]',
            Blankcolor: '[style="top:38px"] div:nth-child(2)',
            INBOARD_ACTION_BUTTON: '.bk-style-icon-triangle-solid'
        };

        var locators = {
            BackColor: element(by.css(selectors.BackColor)),
            Blankcolor: element(by.css(selectors.Blankcolor)),
            INBOARD_ACTION_BUTTON: element(by.css(selectors.INBOARD_ACTION_BUTTON))

        };

        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        table.openColumnMenu(columnName);
        var columnMenuItem = 'Conditional Formatting';
        table.chooseColumnMenuItem(columnMenuItem);
        metricPanel.addNewMetric(600, 8000, '#FF0000');
        metricPanel.applyMetrics(true);
        browser.sleep(4000);
        locators.BackColor.getCssValue('background-color').then(function(bgcolor) {
            console.log(bgcolor);
            expect(bgcolor).toEqual(expectedColor);
        });
        browser.sleep(3000);
        pinboards.save();
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        locators.Blankcolor.getCssValue('background-color').then(function(bgcolornew) {
            console.log(bgcolornew);
            expect(bgcolornew).toEqual(blankColorExpected);
        });
    });

    it('Apply Date filters via column label menu on x-axis', function () {
        var selectors = {
            revertBTN: '.bk-transformed-marker'
        };

        var locators = {
            revertBTN: element(by.css(selectors.revertBTN))
        };
        var query = 'commit date daily discount';
        var sources = ['LINEORDER'];
        var description = 'Description text';
        answer.doAdhocQueryline(query, sources, charts.chartTypes.LINE);
        browser.sleep(4000);
        //expect(charts.getXAxisTitle()).toContain('Date');
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        charts.clickonXAxix();
        charts.columnMenuChooseFilter();
        browser.sleep(4000);
        rangefilters.setFirstOperandValue('01/01/1995');
        browser.sleep(2000);
        rangefilters.setSecondOperandValue('12/1/1995');
        filterDialog.clickDone();
        browser.sleep(3000);
        charts.getXAxisTitleDetail().then(function (Datetxt) {
            console.log(Datetxt);
        });
        var date = charts.getXAxisTitleDetail();
        expect(date).toContain('for 1995');

        locators.revertBTN.click();
        browser.sleep(2000);
        charts.getXAxisTitle().then(function (XAxixtitle) {
            console.log(XAxixtitle);
        });
        var daterange = charts.getXAxisTitle();
        expect(daterange).not.toContain('for 1995');
    });


    it('verify_toolTip_Geomaps', function(){
        var query = 'region population';
        var sources = ['geo_france_population_data'];
        var toolTip = 'centre-val de loire';

        var selectors = {
            MAP_ELEMENT: '.bk-answer-content',
            GET_POPUP_CONTENT: '.popover-content'
        };

        var locators = {
            MAP_ELEMENT: element(by.css(selectors.MAP_ELEMENT)),
            GET_POPUP_CONTENT: element.all(by.css(selectors.GET_POPUP_CONTENT)).get(0)
        };
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.navigateAndWaitForChartType(charts.chartTypes.GEO_AREA);
        var Actooltip = slideshow.getToolTip();
        browser.sleep(2000);
        expect(Actooltip).toContain(toolTip);
    });


    it('Selecting and de-selecting legend values in geo-map in present mode on pinboard', function (){
        var ExpetedGeoMapText = 'Île-de-france';
        var ExpectedAllDeselect = 'new aquitaine';
        var selectors = {
            Lengend11: '.bk-legend-item.bk-selected',
            LengendOnly: '.bk-legend-singular-select.ng-binding',
            MAP_ELEMENT: '.bk-answer-content',
            List_Legends: '.bk-legend-label.bk-overflow-ellipsis.ng-binding'
        };
        var locators = {

            Lengend11: element(by.css(selectors.Lengend11)),
            LengendOnly: element(by.css(selectors.LengendOnly)),
            MAP_ELEMENT: element(by.css(selectors.MAP_ELEMENT)),
            List_Legends: element(by.css(selectors.List_Legends))
        };
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName1);
        pinboards.startSlideShow();
        browser.sleep(3000);
        //element(by.css(selectors.Lengend11)).click();
        var actualGeoMapText = slideshow.clickOnOnlyLink();
        expect(actualGeoMapText).toContain(ExpetedGeoMapText);
        var ActaulAllDeselect = slideshow.clickOnOnlyLink();
        expect(ActaulAllDeselect).toContain(ExpectedAllDeselect);
    });

    it('Verify that exapanded pivot state is retained when user filters on an expanded pivot', function () {
        var query = 'max revenue color category customer address customer nation customer region brand1';
        var sources = ['PART', 'LINEORDER', 'CUSTOMER'];

        var selectors = {
            PIVOT_VERTICAL_HEADER_ROW: '.dx-pivotgrid-vertical-headers tr',
            MAP_ELEMENT: '.bk-answer-content',
            FIRST_ELEMENT:'.dx-pivotgrid-vertical-headers tr:nth-child(1)',
            FILTER:'.bk-filter.ng-binding.ng-scope',
            KEBABICON:'.dx-word-wrap>tbody tr:nth-child(3) .dx-area-description-cell tr td:nth-child(1) .bk-options',
            FILTER_SEARCH:'.bk-cb-filter-content .bk-search-input',
            Exapand : '.dx-white-space-column',
            DONEBUTTON:'.bk-dialog-action-buttons.clearfix.ng-scope.ng-isolate-scope>div.dialog-ok-button.ng-scope'
        };
        var locators = {
            MAP_ELEMENT: element(by.css(selectors.MAP_ELEMENT)),
            FIRST_ELEMENT:element(by.css(selectors.FIRST_ELEMENT)),
            FILTER:element(by.css(selectors.FILTER)),
            KEBABICON:element(by.css(selectors.KEBABICON)),
            FILTER_SEARCH:element(by.css(selectors.FILTER_SEARCH)),
            Exapand : element(by.css(selectors.Exapand)),
            DONEBUTTON:element(by.css(selectors.DONEBUTTON))

        };
        answer.doAdhocQueryPivotTable(query, sources, charts.chartTypes.PIVOT_TABLE);
        //answer.openVizTypeSelectorPanel();
        answer.navigateAndWaitForChartType(charts.chartTypes.PIVOT_TABLE);
        util.waitForVisibilityOf(locators.MAP_ELEMENT);
        locators.FIRST_ELEMENT.click();
        util.waitForVisibilityOf(locators.KEBABICON);
        locators.KEBABICON.click();
        util.waitForVisibilityOf(locators.FILTER);
        locators.FILTER.click();
        util.waitForVisibilityOf(locators.FILTER_SEARCH);
        checkboxFilter.setSearchText("mfgr#11");
        checkboxFilter.toggleCheckboxState('mfgr#11');
        browser.sleep(2000);
        filterDialog.clickDone();
        browser.sleep(2000);
        locators.Exapand.isPresented;
        //expect($(pinboards.selectors.TILE_SIZE_LARGE).isPresent()).toBe(true);
    });


});