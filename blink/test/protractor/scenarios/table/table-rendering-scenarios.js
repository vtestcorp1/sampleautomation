/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish@thoughtspot.com)
 *
 */

'use strict';

var common = require('../common.js');
var sage = require('../sage/sage.js');
var table = require('./table.js');
var dataPanel = require('../sage/data-panel/data-panel.js');
var answer = require('../viz-layout/answer/answer.js');
var charts = require('../charts/charts');
var pinboards = require('../pinboards/pinboards');
var contextMenu = require('../context-menu/context-menu-po');
var importWizard = require('../data-ui/import-wizard/import-wizard');
var formula = require('../formula/formula');
var chosen = require('../libs/chosen');
var util = require('../common').util;

describe('Table rendering checks', function () {
    it('[SMOKE][IE] should display the right title, column name, and values', function () {
        var SAGE_QUESTION = 'brand1',
            EXPECTED_TITLE = 'Brand1',
            COLUMN_NAME = 'Brand1',
            PARTIAL_VALUE = 'mfgr';

        answer.doAdhocQuery(SAGE_QUESTION, ['PART'], charts.vizTypes.TABLE);
        answer.waitForAnswerTitle(EXPECTED_TITLE);
        // Expect the right column name in the table
        expect($$(table.selectors.SLICK_COLUMN_NAME).get(0).getText()).toBe(COLUMN_NAME);
        // Expect the right values for the first 4 rows
        expect(table.getNthCell(0, 0).getText()).toMatch(PARTIAL_VALUE);
        expect(table.getNthCell(1, 0).getText()).toMatch(PARTIAL_VALUE);
        expect(table.getNthCell(2, 0).getText()).toMatch(PARTIAL_VALUE);
        expect(table.getNthCell(3, 0).getText()).toMatch(PARTIAL_VALUE);
        expect(table.getNthCell(3, 0).getText()).not.toBe(table.getNthCell(0, 0).getText());
    });

    it('[SMOKE][IE] should display percentage for growth values', function () {
        var GROWTH_QUESTION = 'growth of revenue by order date monthly',
            GROWTH_COLUMN = 'Growth of Total Revenue',
            ENDS_WITH_PERCENT = /%$/;

        answer.doAdhocQuery(GROWTH_QUESTION, ['LINEORDER', 'DATE'], charts.vizTypes.TABLE);

        expect(table.getNthCell(1, 1).getText()).toMatch(ENDS_WITH_PERCENT);
        expect(table.getNthCell(2, 1).getText()).toMatch(ENDS_WITH_PERCENT);
        expect(table.getNthCell(3, 1).getText()).toMatch(ENDS_WITH_PERCENT);
    });

    it('should always show a table even with only measures', function () {
        answer.doAdhocQuery('revenue', ['LINEORDER', 'DATE'], charts.vizTypes.TABLE);

        table.waitForTableColumnCountToBe(null, 1);

        sage.sageInputElement.enter('revenue quantity');
        table.waitForTableColumnCountToBe(null, 2);
    });

    it('should show context menu on download more click', function () {
        answer.doAdhocQuery('customer custkey', ['CUSTOMER'], charts.vizTypes.TABLE);
        table.clickDownloadMore();
        contextMenu.waitForContextMenu();
    });

    it('should render detailed time field: SCAL-12631', function(){
        answer.doAdhocQuery('revenue', ['LINEORDER'], charts.vizTypes.TABLE);
        formula.createAndSaveFormulaInAnswer('time(commit date)', 'commit_time');
        answer.waitForAnswerToLoad();
        answer.selectTableType();
        table.waitForTable();
    });

    it('should show only two options in bucketing type selector for time column', function() {
        answer.doAdhocQuery('revenue', ['LINEORDER'], charts.vizTypes.TABLE);
        formula.createAndSaveFormulaInAnswer('time(commit date)', 'commit_time');
        answer.waitForAnswerToLoad();
        answer.selectTableType();
        table.waitForTable();
        var header = table.getNthHeader(0);
        expect(chosen.getOptions(header).count()).toBe(2);
    });

    it('should not show native tooltip on hovering on column headers', function() {
        answer.doAdhocQuery('revenue', ['LINEORDER'], charts.vizTypes.TABLE);
        expect($(table.selectors.COLUMN_HEADER).getAttribute('title')).toBe('');
    });
});

describe('Links in table', function() {
    function verifyClickableLinks() {
        expect(table.getNthCell(0, 0).getAttribute('innerHTML')).
        toMatch(/a href="http:\/\/code\.google\.com"/);
        expect(table.getNthCell(1, 0).getAttribute('innerHTML')).
        toMatch(/a href="mailto:ashish@thoughtspot.com"/);
        expect(table.getNthCell(2, 0).getAttribute('innerHTML')).
        toMatch(/a href="http:\/\/google\.com"/);
    }

    var CSV_PATH = 'table/',
        CSV_FILE_NAME = 'mock.csv',
        IMPORTED_DATA_NAME = 'mock';

    afterAll(function() {
        importWizard.deleteMockCSV(IMPORTED_DATA_NAME);
    });

    it('should make links in table data clickable', function() {
        common.navigation.goToUserDataSection();
        importWizard.importCSVData(CSV_PATH + CSV_FILE_NAME, IMPORTED_DATA_NAME, true, false);

        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources([IMPORTED_DATA_NAME]);
        answer.queryAndWaitForSageIndexing('number');

        answer.doAdhocQuery('clickable-link number', [IMPORTED_DATA_NAME], charts.vizTypes.TABLE);
        verifyClickableLinks();
    });
});
