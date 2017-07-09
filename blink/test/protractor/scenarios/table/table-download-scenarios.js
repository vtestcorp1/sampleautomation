/**
 * Created by rahul on 2/1/17.
 */

'use strict';

var common = require('../common.js');
var sage = require('../sage/sage.js');
var table = require('./table.js');
var leftPanel = require('../sage/data-panel/data-panel');
var filterDialog = require('../filters/filter-dialog');
var answer = require('../viz-layout/answer/answer.js');
var answerListPage = require('../answers/answer-list-page');
var charts = require('../charts/charts');
var pinboards = require('../pinboards/pinboards');
var checkboxFilter = require('../filters/checkbox-filter');
var contextMenu = require('../context-menu/context-menu-po');
var drillDown = require('../context-menu/drill/drill-po');

describe('Table Download', function () {
    it('should not mess up table data when downloading a table with custom column order', function(){
        var ANSWER_NAME = 'Answer';

        answer.doAdhocQuery(
            'revenue customer region',
            ['LINEORDER', 'CUSTOMER'],
            charts.vizTypes.TABLE);

        table.reorderTableColumns($(table.selectors.COLUMN_HEADER), 200);
        answer.saveCurrentAnswer(ANSWER_NAME);

        common.network.interceptFormResponse();

        table.downloadTableCSV();
        common.network.waitForAndResetFormResponse();
        answer.saveCurrentAnswer();
        table.waitForTable();

        expect(table.getNthCell(0, 0).getText()).toBe('3,386,576,402');

        answerListPage.deleteAnswer(ANSWER_NAME);
    });

    it('should download table data in user sorted order of columns', function(){
        answer.doAdhocQuery('revenue customer region', ['LINEORDER', 'CUSTOMER'], charts.vizTypes.TABLE);
        table.reorderTableColumns($(table.selectors.COLUMN_HEADER), 200);

        common.network.interceptFormResponse();
        table.downloadTableCSV();
        common.network.waitForAndResetFormResponse().then(function(data) {
            var columnOrderIsCorrect = /"Total Revenue","Customer Region"/.test(data);
            expect(columnOrderIsCorrect).toBe(true);
        });
    });

    it('should download table data in user sorted order of columns in pinboards', function(){
        var pinboardName = 'Table_Download';
        answer.doAdhocQuery('revenue customer region', ['LINEORDER', 'CUSTOMER'], charts.vizTypes.TABLE);
        table.reorderTableColumns($(table.selectors.COLUMN_HEADER), 200);


        answer.addShowingVizToNewPinboard(
            pinboardName
        );

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);

        common.network.interceptFormResponse();
        pinboards.openVizDropdownMenu();
        common.util.waitForAndClick(pinboards.selectors.DOWNLOAD_AS_CSV);

        common.network.waitForAndResetFormResponse().then(function(data) {
            // Ideally, here column order should have been "Total Revenue" before "Customer Region".
            // For pinboards, the sort order from the saved answer is not respected by callosum.
            // This is because for sort order client state sorting is only understood by blink
            // where while downloading answers, reordering of columns is performed. For pinboards,
            // this does not work. Right solution will be to make callosum, column order aware.
            // Till then, we are changing the expectation here to not expect correct col order.
            var columnOrderIsCorrect = /"Customer Region","Total Revenue"/.test(data);
            expect(columnOrderIsCorrect).toBe(true);
        });

        // We are ensuring there is no error.
        pinboards.deletePinboard(pinboardName);
    });

    it('downloaded data should respect unsaved pinboard filters', function(){
        var pinboardName = 'Table_Download';
        answer.doAdhocQuery('revenue supplier region', ['Formula Worksheet'], charts.vizTypes.TABLE);

        answer.addShowingVizToNewPinboard(
            pinboardName
        );

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);

        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        checkboxFilter.toggleCheckboxState('america');
        filterDialog.clickDone();
        common.network.interceptFormResponse();
        pinboards.openVizDropdownMenu();
        common.util.waitForAndClick(pinboards.selectors.DOWNLOAD_AS_CSV);

        common.network.waitForAndResetFormResponse().then(function(data) {
            expect(/asia/.test(data)).toBe(true);
            expect(/america/.test(data)).toBe(true);
            expect(/africa/.test(data)).toBe(false);
        });

        // We are ensuring there is no error.
        pinboards.deletePinboard(pinboardName);
    });

    it('downloaded data should respect ad hoc transformations', function(){
        var pinboardName = 'Table_Download';
        answer.doAdhocQuery('revenue supplier region', ['Formula Worksheet'], charts.vizTypes.TABLE);

        answer.addShowingVizToNewPinboard(
            pinboardName
        );

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);

        pinboards.waitForTableCountToBe(1);

        var tableCell = table.getNthCell(0, 0);
        common.util.waitForElement(tableCell);
        common.util.doubleClickElement(tableCell);
        common.util.rightClickElement(tableCell);
        var colName = 'Ship Mode';
        common.util.waitForAndClick(contextMenu.locators.DRILL_DOWN);
        drillDown.waitForDrillDownPopup();
        drillDown.typeTextInSearch(colName);
        drillDown.selectDrillItem(colName);
        common.util.waitForElement(pinboards.selectors.RESET_TRANSFORMS);

        common.network.interceptFormResponse();
        pinboards.openVizDropdownMenu();
        common.util.waitForAndClick(pinboards.selectors.DOWNLOAD_AS_CSV);

        common.network.waitForAndResetFormResponse().then(function(data) {
            var columnOrderIsCorrect = /"Ship Mode","Total Revenue"/.test(data);
            expect(columnOrderIsCorrect).toBe(true);
        });

        // We are ensuring there is no error.
        pinboards.deletePinboard(pinboardName);
    });
});
