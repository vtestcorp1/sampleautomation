/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for infinite number handling.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer.js');
var charts = require('./charts.js');
var leftPanel = require('../sage/data-panel/data-panel.js');
var common = require('../common');
var wks = require('../worksheets/worksheets.js');
var dataUI = require('../data-ui/data-ui.js');
var importUtils = require('../data-ui/import-wizard/import-wizard.js');
var formula = require('../formula/formula');

// xdescribe('Chart infinity and NaN handling', function() {
//
//     var WS_NAME = 'Chart Infinity_NaN Handling WS',
//         CSV_TABLE_NAME = 'chart_infinite_handling',
//         CSV_FILE_NAME = './data-ui/import-wizard/' + CSV_TABLE_NAME + '.csv';
//
//     beforeAll(function() {
//         dataUI.goToDataUI();
//         dataUI.goToImportData();
//         importUtils.mockUploadFile(CSV_FILE_NAME);
//         importUtils.setHeaderDefined(true);
//         importUtils.clickNext();
//         importUtils.clickNext();
//         importUtils.clickImportButton();
//         importUtils.verifySuccessStepVisible(4 /* Number of rows imported */);
//
//         wks.createEmptyWorksheet();
//         wks.chooseAllColumnsFromSources([CSV_TABLE_NAME]);
//         formula.createAndSaveFormulaInWorksheet('revenue/tax', 'positive_infinity');
//         formula.createAndSaveFormulaInWorksheet('-revenue/tax', 'negative_infinity');
//         wks.saveWorksheet(WS_NAME);
//
//         common.navigation.goToQuestionSection();
//         leftPanel.deselectAllSources();
//         leftPanel.openAndChooseSources([WS_NAME]);
//         leftPanel.clickDone();
//     });
//
//     afterAll(function() {
//         common.navigation.goToQuestionSection();
//         leftPanel.deselectAllSources();
//         common.navigation.goToUserDataSection();
//         wks.deleteWorksheet(WS_NAME);
//         importUtils.deleteMockCSV(CSV_TABLE_NAME);
//     });
//
//     beforeEach(function() {
//         common.navigation.goToQuestionSection();
//
//     });
//
//     it('should show Infinity placeholder on y-axis', function() {
//         answerPage.queryAndWaitForChart('positive_infinity country');
//         expect(charts.getFirstYAxisLabels().last().getText()).toBe('∞ ↑');
//     });
//
//     // disabled until SCAL-6804 is resolved
//     // xit('should show -Infinity placeholder on y-axis', function() {
//     //     sageInputElement().enter('negative_infinity country');
//     //     waitForHeadline('Total negative_infinity');
//     //     expect(chartFunctions.getFirstYAxisMaxValue()).toBe('∞ ↓');
//     // });
//
//     it('should show Infinity placeholder on x-axis', function() {
//         answerPage.queryAndWaitForChart('revenue by positive_infinity');
//         answerPage.navigateAndWaitForChartType('LINE');
//         expect(charts.getXAxisLabels().last().getText()).toBe('Infinity');
//     });
//
//     // disabled until SCAL-6804 is resolved
//     // xit('should show -Infinity placeholder on x-axis', function() {
//     //     sageInputElement().enter('revenue by negative_infinity');
//     //     waitForHeadline('Total negative_infinity');
//     //
//     //     openEditorTool();
//     //     selectAxisColumns(X_AXIS_SELECT_SELECTOR, ['0']);
//     //     selectAxisColumns(Y_AXIS_SELECT_SELECTOR, ['1']);
//     //
//     //     expect(chartFunctions.getXAxisMaxValue()).toBe('∞ ←');
//     // });
//
//     it('should show a valid chart when there is just one Infinity point', function() {
//         answerPage.queryAndWaitForChart('revenue by positive_infinity india');
//         answerPage.navigateAndWaitForChartType('LINE');
//
//         expect(charts.getFirstYAxisLabels().first().getText()).toBe('900');
//         expect(charts.getXAxisLabels().last().getText()).toBe('Infinity');
//     });
// });

