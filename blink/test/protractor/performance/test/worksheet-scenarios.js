/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

let actions = require('../../scenarios/actions-button');
var blinkList = require('../../scenarios/list/blink-list');
let dataPanel = require('../../scenarios/sage/data-panel/data-panel');
var dataUI = require('../../scenarios/data-ui/data-ui');
var benchmark = require('./../benchmark.js');
var common = require('../../scenarios/common.js');
var dataset = browser.params.dataset.worksheetScenarios;
var formula = require('../../scenarios/formula/formula.js');
var worksheets = require('../../scenarios/worksheets/worksheets.js');
var util = common.util;

var suite = benchmark.suite('create-worksheet');

var inputs = dataset.createWorksheet;
inputs.forEach(function (input) {
    var worksheetName = util.appendRandomNumber(input.name + ' - worksheet');
    suite.register(input.name)
        // TODO(Rahul): Adding a reload app step to avert impact on test
        // measurements due to memory bloats from previous tests.
        .beforeAll(common.navigation.reloadApp)
        .afterAll(common.navigation.reloadApp)
        .withBounds(input.bounds)
        .before(function () {
            common.navigation.goToUserDataSection();
            actions.selectActionButtonAction(actions.actionLabels.CREATE_WORKSHEET);
            dataPanel.deselectAllSources();
            dataPanel.openAndChooseSources(input.sources);
            return dataPanel.clickDone();
        })
        .sthen('add-columns', function () {
            var promises = [];
            input.sources.forEach(function (source) {
                util.waitForAndClick(by.cssContainingText(dataPanel.selectors.DATA_SOURCE_ITEM, source));
                util.waitForAndClick(dataPanel.selectors.DATA_ADD_COLUMN_BTN);
                var promise = worksheets.waitForTable(source);
                promises.push(promise);
            });
            return protractor.promise.all(promises);
        })
        .sthen('save-worksheet', function () {
            return worksheets.saveWorksheet(worksheetName);
        })
        .after(function () {
            return worksheets.deleteWorksheet(worksheetName);
        });
});

suite.report();


var suite = benchmark.suite('open-worksheet-for-edit');

var inputs = dataset.openWorksheet;
inputs.forEach(function (input) {
    var worksheet = input.worksheet;
    suite.register(worksheet.name)
        .withBounds(input.bounds)
        .before(function() {
            common.navigation.goToUserDataSection();
            blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, worksheet.name);
            return util.waitForElement(dataUI.selectors.EXPLORER);
        })
        .then(function() {
            return dataUI.editSelectedItem(worksheet.name);
        });
});

suite.report();


var suite = benchmark.suite('edit-existing-worksheet');

var inputs = dataset.editWorksheet;
inputs.forEach(function (input) {
    var copyWorksheetName = "(Test Copy)-" + input.worksheet.name;
    copyWorksheetName = util.appendRandomNumber(copyWorksheetName);
    suite.register(input.worksheet.name)
        .withBounds(input.bounds)
        .before(function() {
            worksheets.openWorksheet(input.worksheet.name);
            return worksheets.makeACopyOfWorksheet(copyWorksheetName);
        })
        .sthen('delete-column', function() {
            var column = input.column;
            worksheets.deleteColumn(column.source, column.name);
            return worksheets.waitForColumnDeletion(column.source, column.name);
        })
        .sthen('add-column', function() {
            var column = input.column;
            return worksheets.selectColumnFromTable(column.source, column.name);
        })
        .after(function () {
            return worksheets.deleteWorksheet(copyWorksheetName);
        });
});

suite.report();


var suite = benchmark.suite('copy-worksheet');

var inputs = dataset.copyWorksheet;
inputs.forEach(function (input) {
    var worksheet = input.worksheet;
    var copyWorksheetName = "(Test Copy)-" + worksheet.name;
    copyWorksheetName = util.appendRandomNumber(copyWorksheetName);
    suite.register(worksheet.name)
        .withBounds(input.bounds)
        .before(function() {
            return worksheets.openWorksheet(worksheet.name);
        })
        .then(function() {
            return worksheets.makeACopyOfWorksheet(copyWorksheetName);
        })
        .after(function () {
            return worksheets.deleteWorksheet(copyWorksheetName);
        });
});

suite.report();


var suite = benchmark.suite('delete-worksheet');

var inputs = dataset.deleteWorksheet;
inputs.forEach(function (input) {
    var worksheet = input.worksheet;
    var copyWorksheetName = "(Test Copy)-" + worksheet.name;
    copyWorksheetName = util.appendRandomNumber(copyWorksheetName);
    suite.register(worksheet.name)
        .withBounds(input.bounds)
        .before(function() {
            worksheets.openWorksheet(worksheet.name);
            return worksheets.makeACopyOfWorksheet(copyWorksheetName);
        })
        .then(function() {
            return worksheets.deleteWorksheet(copyWorksheetName);
        });
});

suite.report();


var suite = benchmark.suite('add-formula-in-worksheet');

var inputs = dataset.addFormula;
inputs.forEach(function (input) {
    var copyWorksheetName = "(Test Copy)-" + input.worksheet.name;
    copyWorksheetName = util.appendRandomNumber(copyWorksheetName);
    suite.register(input.worksheet.name)
        .withBounds(input.bounds)
        .before(function() {
            worksheets.openWorksheet(input.worksheet.name);
            return worksheets.makeACopyOfWorksheet(copyWorksheetName);
        })
        .then(function() {
            formula.openFormulaEditorInWorksheet();
            formula.focusFormulaEditor();
            formula.typeInFormulaEditor(input.formulas[0].expression);
            return formula.waitForValidFormula();
        })
        .sthen('save-formula', function() {
            formula.saveCurrentFormula(input.formulas[0].name);
            return worksheets.waitForFormula(input.formulas[0].name);
        })
        .sthen('save-worksheet', function() {
            return worksheets.saveExistingWorksheet();
        })
        .after(function () {
            return worksheets.deleteWorksheet(copyWorksheetName);
        });
});

suite.report();


var suite = benchmark.suite('delete-formula-in-worksheet');

var inputs = dataset.deleteFormula;
inputs.forEach(function (input) {
    var copyWorksheetName = "(Test Copy)-" + input.worksheet.name;
    copyWorksheetName = util.appendRandomNumber(copyWorksheetName);
    suite.register(input.worksheet.name)
        .withBounds(input.bounds)
        .before(function() {
            worksheets.openWorksheet(input.worksheet.name);
            worksheets.makeACopyOfWorksheet(copyWorksheetName);
            formula.createAndSaveFormulaInWorksheet(
                input.formulas[0].expression,
                input.formulas[0].name);
            return worksheets.saveExistingWorksheet();
        })
        .then(function() {
            formula.deleteFormulaInWorksheet(
                input.formulas[0].name);
            return worksheets.saveExistingWorksheet();
        })
        .after(function () {
            return worksheets.deleteWorksheet(copyWorksheetName);
        });
});

suite.report();


var suite = benchmark.suite('edit-formula-in-worksheet');

var inputs = dataset.editFormula;
inputs.forEach(function (input) {
    var copyWorksheetName = "(Test Copy)-" + input.worksheet.name;
    copyWorksheetName = util.appendRandomNumber(copyWorksheetName);
    suite.register(input.worksheet.name)
        .withBounds(input.bounds)
        .before(function() {
            worksheets.openWorksheet(input.worksheet.name);
            worksheets.makeACopyOfWorksheet(copyWorksheetName);
            formula.createAndSaveFormulaInWorksheet(
                input.formulas[0].expression,
                input.formulas[0].name);
            return worksheets.saveExistingWorksheet();
        })
        .then(function() {
            formula.openExistingFormulaInWorksheet(input.formulas[0].name);
            formula.clearFormulaEditor();
            return formula.typeInFormulaEditor('today()');
        })
        .sthen('save-formula', function() {
            formula.saveCurrentFormula(input.formulas[0].name + "_1");
            return worksheets.waitForFormula(input.formulas[0].name + "_1");
        })
        .sthen('save-worksheet', function() {
            return worksheets.saveExistingWorksheet();
        })
        .after(function () {
            return worksheets.deleteWorksheet(copyWorksheetName);
        });
});

suite.report();
