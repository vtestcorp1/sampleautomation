/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../common.js');
var util = common.util;
var charts = require('../charts/charts.js');
var dataUI = require('../data-ui/data-ui.js');
var importUtils = require('../data-ui/import-wizard/import-wizard.js');
var answerPage = require('../viz-layout/answer/answer.js');

describe('Geo Maps', function() {

    var CSV_FILE_PATH = 'data-ui/import-wizard/geo_us_data.csv';
    var CSV_TABLE_NAME = 'geo_us_data';
    var columns = {
        STATE: 'state',
        REVENUE: 'revenue',
        CURRENCY: 'currency'
    };

    var selectors =  {
        LEGEND_PICKER_SELECTED_ITEM: '.bk-legend .bk-legend-item.bk-selected'
    };

    function importGeoDataTable() {
        common.navigation.goToUserDataSection();
        importUtils.importSimpleCSVTable(CSV_FILE_PATH, 4);
        // We choose this option so that the table we just imported gets added in the left panel
        // automatically.
        importUtils.goToAskQuestion();
    }

    function deleteGeoTable() {
        importUtils.deleteMockCSV(CSV_TABLE_NAME);
    }

    // function updateGeoType(forColumn, geoType) {
    //     dataUI.goToDataUI();
    //     util.waitForElement(by.css('.bk-list'));
    //     dataUI.goToTableByName(CSV_TABLE_NAME);
    //     dataUI.setGeoType(forColumn, geoType);
    //     dataUI.saveChanges();
    // }

    beforeAll(function () {
        importGeoDataTable();
    });

    afterAll(function () {
        deleteGeoTable();
    });

    // TODO(mahesh): The way we update geo role is being revamed, once done with feature work
    // implement some e2e tests for geo, and enable this one too.
    // it('should have legend items enabled when chart type is switched', function() {
    //     updateGeoType(columns.STATE, 'STATE_PROVINCE');
    //     common.navigation.goToQuestionSection();
    //     answerPage.queryAndWaitForChart('revenue state currency');
    //     answerPage.openVizEditorPanel();
    //     charts.addLegendColumn(columns.CURRENCY);
    //     charts.waitForLegendPickerToAppear();
    //     answerPage.navigateAndWaitForChartType('GEO_BUBBLE');
    //     charts.waitForLegendPickerToAppear();
    //     expect(element.all(by.css(selectors.LEGEND_PICKER_SELECTED_ITEM)).count()).toBe(4);
    // });
});
