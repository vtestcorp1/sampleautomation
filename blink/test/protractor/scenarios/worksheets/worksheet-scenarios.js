/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving worksheets
 */

'use strict';

let common = require('../common');
let worksheet = require('./worksheets');
let actions = require('../actions-button');
let dialog = require('../dialog');
let dataPanel = require('../sage/data-panel/data-panel');
let formula = require('../formula/formula');
let answer = require('../viz-layout/answer/answer');
let charts = require('../charts/charts');

let navigation = common.navigation;
let util = common.util;

describe('Worksheet scenarios', function () {
    it('[SMOKE][IE] should create, save and delete a worksheet', function () {
        let worksheetName = 'worksheetName';
        navigation.goToUserDataSection();
        worksheet.waitForWorksheetAbsentInList(worksheetName);

        worksheet.createSimpleWorksheet(['CUSTOMER', 'LINEORDER'], worksheetName);

        navigation.goToUserDataSection();
        // check that worksheet now appears in the list
        worksheet.waitForWorksheetPresentInList(worksheetName);
        worksheet.deleteWorksheet(worksheetName);
    });

    it('[SMOKE][IE] should preserve the join type on saving a worksheet', function () {
        let worksheetName = 'worksheetName';
        let joinType = 'Left outer join';
        navigation.goToUserDataSection();
        worksheet.waitForWorksheetAbsentInList(worksheetName);

        worksheet.createEmptyWorksheet();
        worksheet.chooseAllColumnsFromSources(['CUSTOMER', 'LINEORDER']);
        worksheet.selectJoinType(joinType);
        worksheet.saveWorksheet(worksheetName);
        worksheet.waitForSelectedJoinType(joinType);

        navigation.goToUserDataSection();
        // check that worksheet now appears in the list
        worksheet.waitForWorksheetPresentInList(worksheetName);
        worksheet.deleteWorksheet(worksheetName);
    });

    it('should not show hidden columns in left panel', function () {
        let source = 'TEST1';
        navigation.goToUserDataSection();
        worksheet.createEmptyWorksheet();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources([source]);
        dataPanel.clickDone();

        dataPanel.waitForEnabledSource(source);
        dataPanel.expandSource(source);
        util.waitForElementCountToBe(dataPanel.selectors.DATA_SOURCE_COLUMN_ITEM, 1);
    });

    xit('[SMOKE] should preserve formula name on join type change', function() {
        var worksheetName = '[test worksheet]',
            lineOrderSource = 'LINEORDER',
            dateSource = 'DATE',
            commitDateColumn = 'Commit Date',
            datekeyColumn = 'Datekey',
            formulaName = 'rev/tax',
            formulaExpression = 'revenue';

        navigation.goToUserDataSection();
        worksheet.createEmptyWorksheet();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources([lineOrderSource, dateSource]);
        worksheet.selectColumnFromTable(lineOrderSource, commitDateColumn);
        worksheet.selectColumnFromTable(dateSource, datekeyColumn, ['Commit date']);
        formula.createAndSaveFormulaInWorksheet(formulaExpression, formulaName);
        worksheet.saveWorksheet(worksheetName);

        navigation.goToUserDataSection();
        worksheet.openWorksheet(worksheetName);
        worksheet.editMappingForColumn(dateSource, datekeyColumn);
        worksheet.chooseMapping('Order date');
        worksheet.waitForFormula(formulaName);

        worksheet.deleteWorksheet(worksheetName);
    });

    it('should create answer on worksheet', function () {
        var worksheetName = 'WorksheetName';
        var query = 'discount supplier region';

        navigation.goToUserDataSection();
        worksheet.createSimpleWorksheet(['SUPPLIER', 'LINEORDER'], worksheetName);

        answer.doAdhocQuery(query, [worksheetName], charts.vizTypes.CHART);
        answer.waitForAnswerWithQuery(query);

        worksheet.deleteWorksheet(worksheetName);
    });

    it('should not be stuck when clicking outside of join path dialog panel', function(){
        var worksheetName = '[test worksheet]',
            lineOrderSource = 'LINEORDER',
            dateSource = 'DATE',
            commitDateColumn = 'Commit Date',
            datekeyColumn = 'Datekey';


        navigation.goToUserDataSection();
        worksheet.createEmptyWorksheet();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources([lineOrderSource, dateSource]);

        worksheet.selectColumnFromTable(lineOrderSource, commitDateColumn);

        dataPanel.expandSource(dateSource);
        dataPanel.addColumn(datekeyColumn);
        util.waitForAndClick(dataPanel.selectors.DATA_ADD_COLUMN_BTN);

        util.waitForElementCountToBe(dialog.selectors.OVERLAY, 1);
        browser.actions().mouseMove({x: 1, y: 1}).click().perform();
        util.waitForElementCountToBe(dialog.selectors.OVERLAY, 0);
    });

    it('should handle ambiguities in response of ambiguity resolution - SCAL-12784', function() {
        var worksheetName = '[test worksheet]',
            lineOrderSource = 'LINEORDER',
            dateSource = 'DATE',
            commitDateColumn = 'Commit Date',
            datekeyColumn = 'Datekey',
            dayOfWeekColumn = 'Day Of Week',
            monthColumn = 'Month',
            yearColumn = 'Year';

        worksheet.createEmptyWorksheet();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources([lineOrderSource, dateSource]);
        worksheet.selectColumnFromTable(lineOrderSource, commitDateColumn);
        worksheet.selectColumnFromTable(dateSource, datekeyColumn, ['Commit date']);
        worksheet.selectColumnFromTable(dateSource, dayOfWeekColumn);

        // Edit join path of one of the columns from date
        worksheet.editMappingForColumn(dateSource, datekeyColumn);
        worksheet.chooseMapping('Order date');

        worksheet.selectColumnFromTable(dateSource, monthColumn, ['Order date']);
        worksheet.selectColumnFromTable(dateSource, yearColumn, ['Commit date']);

        worksheet.waitForColumnCountToBe(5);
    });

    it('formula button should not be visible with no tables', function(){
        worksheet.createEmptyWorksheet();
        formula.waitForFormulaButtonVisibility(false);

    });
    it('formula button should be disabled if no columns are present', function(){
        var lineOrderSource = 'LINEORDER',
            dateSource = 'DATE',
            dayOfWeekColumn = 'Day Of Week';
        worksheet.createEmptyWorksheet();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources([lineOrderSource, dateSource]);
        formula.waitForFormulaButtonVisibility(true);
        formula.waitForFormulaButtonToBeEnabled(false);
        worksheet.selectColumnFromTable(dateSource, dayOfWeekColumn);
        formula.waitForFormulaButtonToBeEnabled(true);
    })
});
