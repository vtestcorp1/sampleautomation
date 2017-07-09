/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var actions = require('../../scenarios/actions-button');
var answerListPage = require('../../scenarios/answers/answer-list-page');
var answerPage = require('../../scenarios/viz-layout/answer/answer');
var benchmark = require('./../benchmark');
var common = require('../../scenarios/common');
var charts = require('../../scenarios/charts/charts');
var checkboxFilter = require('../../scenarios/filters/checkbox-filter');
var dataset = browser.params.dataset.savedAnswerScenarios;
var dialog = require('../../scenarios/dialog');
var drillDown = require('../../scenarios/context-menu/drill/drill-po');
var filterDialog = require('../../scenarios/filters/filter-dialog');
var formula = require('../../scenarios/formula/formula');
var leftPanel = require('../../scenarios/sage/data-panel/data-panel.js');
var navigation = common.navigation;
var sage = require('../../scenarios/sage/sage');
var table = require('../../scenarios/table/table');
var util = common.util;
var worksheets = require('../../scenarios/worksheets/worksheets');

var suite = benchmark.suite('load-saved-answer');

dataset.loadAnswers.forEach(function(input) {
    var answer = input.answer;
    suite.register(answer.name)
        // TODO(Rahul): Adding a reload app step to avert impact on test
        // measurements due to memory bloats from previous tests.
        .beforeAll(common.navigation.reloadApp)
        .afterAll(common.navigation.reloadApp)
        .withBounds(input.bounds)
        .before(function () {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            return answerListPage.searchForAnswer(answer.name);
        })
        .then(function() {
            answerListPage.clickOnAnswer(answer.name);
            return answerPage.waitForAnswerToLoad();
        });
});

suite.report();


var suite = benchmark.suite('edit-saved-answer');

dataset.editAnswers.forEach(function (input) {
    var answer = input.answer;
    suite.register(answer.name)
        .withBounds(input.bounds)
        .before(function () {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            return answerListPage.goToSavedAnswer(answer.name);
        })
        .then(function() {
            return answerPage.removeFirstTokenAndWaitForLoad();
        })
        .after(function () {
            return answerPage.navigateToHomeWithoutSave();
        });
});

suite.report();


var suite = benchmark.suite('add-formula-saved-answer');

dataset.addFormula.forEach(function (addFormula) {
    var answer = addFormula.answer;
    suite.register(addFormula.answer.name + '-' + addFormula.formula.name)
        .withBounds(addFormula.bounds)
        .before(function () {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            return answerListPage.goToSavedAnswer(addFormula.answer.name);
        })
        .sthen('input-formula', function() {
            formula.openFormulaEditorInAnswer();
            formula.typeInFormulaEditor(addFormula.formula.expr);
            return formula.waitForValidFormula();
        })
        .sthen('add-to-answer', function () {
            return formula.saveCurrentFormulaInAnswer(addFormula.formula.name);
        })
        .after(function () {
            return answerPage.navigateToHomeWithoutSave();
        });
});

suite.report();


var suite = benchmark.suite('download ');

dataset.downloadTable.forEach(function (input) {
    var answer = input.answer;
    var formats = input.formats;
    // Measure performance to download answer in each of the three formats.
    formats.csv.fn = table.downloadTableCSV;
    formats.pdf.fn = table.downloadTablePDF;
    formats.xlsx.fn = table.downloadTableXLSX;
    Object.keys(formats).forEach(function (key) {
        var format = formats[key];
        suite.register(answer.name + ' as ' + format.name)
            .withBounds(format.bounds)
            .before(function () {
                util.waitForInvisibilityOf(
                    util.selectors.LOADING_INDICATOR_OVERLAY);
                navigation.goToAnswerSection();
                return answerListPage.goToSavedAnswer(answer.name);
            })
            .then(function() {
                format.fn();
                return util.waitForInvisibilityOf(table.selectors.TABLE_DOWNLOADING_INDICATOR);
            });
    });
});

suite.report();


var suite = benchmark.suite('drill down');

dataset.drillDown.forEach(function(test) {
    suite.register(test.answer.name)
        .withBounds(test.bounds)
        .before(function() {
            // This makes sure that the assumption of the initial
            // selected viz type remains independent of the client
            // state of the app.
            answerPage.clearVizDisplayPreference();
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            answerListPage.goToSavedAnswer(test.answer.name);
            var chartColumn = $$(charts.selectors.CHART_COLUMN).get(0);
            util.rightClickElement(chartColumn);
            return util.waitForAndClick(charts.locators.DRILL_DOWN);
        })
        .then(function() {
            drillDown.waitForDrillDownPopup();
            drillDown.typeTextInSearch(test.column);
            drillDown.selectDrillItem(test.column);
            answerPage.waitForAnswerToContainColumn(test.column);
            return answerPage.waitForAnswerToLoad();
        })
        .after(function () {
            return answerPage.navigateToHomeWithoutSave();
        });
});

suite.report();


var suite = benchmark.suite('rename answer');

dataset.renameAnswer.forEach(function(input) {
    var answer = input.answer;
    let copyName = '300-copy - ' + answer.name;
    copyName = util.appendRandomNumber(copyName);
    let renamedAnswerName = 'Renamed title - ' + copyName;
    suite.register(answer.name)
        .withBounds(input.bounds)
        .before(function() {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            answerListPage.goToSavedAnswer(answer.name);
            answerPage.makeACopy(copyName);
            return answerPage.waitForAnswerToLoad();
        })
        .then(function () {
            answerPage.setVizTitle(renamedAnswerName);
            answerPage.updateSavedAnswer();
            return common.util.expectSuccessNotif();
        })
        .after(function () {
            return answerListPage.deleteAnswer(renamedAnswerName)
        })
});

suite.report();


var suite = benchmark.suite('copy answer');

dataset.copyAnswer.forEach(function(input) {
    var answer = input.answer;
    let copyName = '300-copy - ' + answer.name;
    copyName = util.appendRandomNumber(copyName);
    suite.register(answer.name)
        .withBounds(input.bounds)
        .before(function() {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            answerListPage.goToSavedAnswer(answer.name);
        })
        .then(function () {
            answerPage.makeACopy(copyName);
            return answerPage.waitForAnswerToLoad();
        })
        .after(function () {
            return answerListPage.deleteAnswer(copyName)
        });
});

suite.report();


var suite = benchmark.suite('add-remove column from left panel');

dataset.addColumnFromLeftPanel.forEach(function(test) {
    let columnName =  test.column.name;
    let regex = new RegExp(columnName.toLowerCase());
    suite.register(test.answer.name)
        .withBounds(test.bounds)
        .before(function() {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            answerListPage.goToSavedAnswer(test.answer.name);
            return leftPanel.expandSource(test.column.source);
        })
        .sthen('add-column', function () {
            leftPanel.addColumn(columnName);
            return util.waitForValueToMatch(sage.selectors.SAGE_INPUT, regex);
        })
        .sthen('add-column-answer-load', function () {
            return answerPage.waitForAnswerToLoad();
        })
        .sthen('remove-column', function () {
            leftPanel.removeColumn(columnName);
            return util.waitForValueToNotMatch(sage.selectors.SAGE_INPUT, regex);
        })
        .sthen('remove-column-answer-load', function () {
            return answerPage.waitForAnswerToLoad();
        })
        .after(function () {
            return answerPage.navigateToHomeWithoutSave();
        });
});

suite.report();


var suite = benchmark.suite('add-remove filter from left panel');

dataset.addFilterFromLeftPanel.forEach(function(test) {
    let columnName =  test.column.name;
    suite.register(test.answer.name)
        .withBounds(test.bounds)
        .before(function() {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            answerListPage.goToSavedAnswer(test.answer.name);
            return leftPanel.expandSource(test.column.source);
        })
        .sthen('open-filter', function () {
            leftPanel.openFilter(columnName);
            filterDialog.waitForItToAppear();
            return checkboxFilter.waitForFilterLoad();
        })
        .then(function () {
            test.values.forEach(function (value) {
                checkboxFilter.toggleCheckboxState(value);
            });
            return filterDialog.clickDone();
        })
        .sthen('apply-filter', function () {
            return answerPage.waitForAnswerToLoad();
        })
        .after(function () {
            return answerPage.navigateToHomeWithoutSave();
        });
});

suite.report();


var suite = benchmark.suite('change-viz-type');

dataset.changeVizType.forEach(function(test) {
    suite.register(test.answer.name)
        .withBounds(test.bounds)
        .before(function() {
            // This makes sure that the assumption of the initial
            // selected viz type remains independent of the client
            // state of the app.
            answerPage.clearVizDisplayPreference();
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            return answerListPage.goToSavedAnswer(test.answer.name);
        })
        .then(function () {
            answerPage.navigateToChartType(test.vizType);
            return answerPage.waitForAnswerToLoad();
        })
        .after(function () {
            return answerPage.navigateToHomeWithoutSave();
        });
});

suite.report();


var suite = benchmark.suite('save-as-aggr-worksheet');

dataset.saveAsAggregatedWkSheet.forEach(function(input) {
    var answer = input.answer;
    let worksheet = '[300 AWS] ' + answer.name;
    worksheet = util.appendRandomNumber(worksheet);
    suite.register(answer.name)
        .withBounds(input.bounds)
        .before(function() {
            util.waitForInvisibilityOf(
                util.selectors.LOADING_INDICATOR_OVERLAY);
            navigation.goToAnswerSection();
            return answerListPage.goToSavedAnswer(answer.name);
        })
        .then(function () {
            actions.selectActionButtonAction(actions.actionLabels.SAVE_AS_WORKSHEET);
            $(answerPage.selectors.ANSWER_SAVE_NAME).sendKeys(worksheet);
            dialog.clickPrimaryButton();
            return answerPage.waitForAnswerToLoad();
        })
        .after(function () {
            return worksheets.deleteWorksheet(worksheet);
        });
});

suite.report();
