
/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jeff Tran, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for formula testcases
 * the formula test is broken into 3 sets and together cover all types of formulas NUMBER, OPERATOR, MIXED, DATE, TEXT
 * to view (or add) a test case, go to formula_cases.js under the testdata folder.
 * the formula_cases.js file contains all the input formulas and the expect result, broken into formulas (except group aggregations)
 * group aggregations are tested in a separate suite, covered in formula-testcase-tpch-scenarios.js
 *
 * this suite only tests formulas in worksheets. Answer formulas are tested separately in answer-formula-scenarios.js
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Formula Test', function () {

    it('should be able to create a worksheet, enter formulas and save', function () {
        var worksheetName = '[QA_Formula_Test]';
        var f_name_0 = "static formula",
            f_text_0 = "2 + 6 * 12";
        var f_name_1 = "column_formula_1",
            f_text_1 = "integer1 - integer2"; // integer
        var f_name_2 = "column_formula_2",
            f_text_2 = "contains (cities, 'san')"; // text
        var f_name_3 = "column_formula_3",
            f_text_3 = "diff_days (datetime2, datetime1)"; // date

        expect(worksheetContaining(worksheetName).count()).toBe(0);
        worksheetFunctions.openCreateWorksheet();
        worksheetFunctions.selectSources([FORMULA_TEST_DATA]);
        worksheetFunctions.openSource(FORMULA_TEST_DATA);
        worksheetFunctions.addColumn(FORMULA_TEST_DATA, "Cities");

        createFormulaAndSave(f_name_0, f_text_0);
        createFormulaAndSave(f_name_1, f_text_1);
        createFormulaAndSave(f_name_2, f_text_2);
        createFormulaAndSave(f_name_3, f_text_3);
        worksheetFunctions.saveWorksheet(worksheetName);
        // check that values are as expected
        verifyFormulaResult(f_name_0, ['74','74','74']);
        verifyFormulaResult(f_name_1, ['3','-4','-10']);
        verifyFormulaResult(f_name_2, ['true','false','true']);
        verifyFormulaResult(f_name_3, ['440','443','446']);
        //verifyFormulaResult(f_name_3, ['440','443','444']); // this should not pass

        // check that worksheet now appears in the list
        saveCurrentAnswer();
        dataTab().click();
        expect(worksheetContaining(worksheetName).count()).toBe(1);
        deleteWorksheet(worksheetName);
    });

    it('should be able to create and verify result for aggregation formulas', function() {
        var worksheetName = '[Aggregation_Test]';
        var formula = "average(integer4)";
        var sourceTable = FORMULA_TEST_DATA;
        var expectedResult = '5.47';
        worksheetFunctions.openCreateWorksheet();
        worksheetFunctions.selectSources([FORMULA_TEST_DATA]);
        worksheetFunctions.openSource(FORMULA_TEST_DATA);
        worksheetFunctions.addColumn(FORMULA_TEST_DATA, "Cities");
        //worksheetFunctions.addAllColumnsForSource(FORMULA_TEST_DATA);
        createFormulaAndSave(formula, formula);
        worksheetFunctions.saveWorksheet(worksheetName);
        verifyAggregateFormulaResult(worksheetName, formula, expectedResult);
        dataTab().click();
        deleteWorksheet(worksheetName);
    });

    // list all formulas you want to run
    var FORMULAS = [NUMBER_, OPERATOR_, MIXED_, DATE_, TEXT_];
    var formulaTestSources = [FORMULA_TEST_DATA];

    function formulaTest(fml) {
        describe('Formula Testing - ' + fml.repr + '', function () {
            function test_operator(opr, idx) {
                it('should work on ' + opr.repr + ' operator', function () {
                    var worksheetTitle = opr.repr + '_Test';
                    worksheetFunctions.openCreateWorksheet();
                    worksheetFunctions.selectSources(formulaTestSources);
                    worksheetFunctions.openSource(FORMULA_TEST_DATA);
                    worksheetFunctions.addColumn(FORMULA_TEST_DATA, "Cities");
                    worksheetFunctions.saveWorksheet(worksheetTitle);
                    for (var id = 0; id < opr.tests.length; id++) {
                        var test = opr.tests[id];
                        createFormulaAndSave(test.inputValue, test.inputValue);
                        // verify formula result
                        if (opr.type === 'aggregation') {
                            verifyAggregateFormulaResult(worksheetTitle, test.inputValue, test.expectedResult);
                        } else {
                            verifyFormulaResult(test.inputValue, test.expectedResult);
                        }
                    }
                    saveCurrentAnswer();
                    dataTab().click();
                    deleteWorksheet(worksheetTitle);
                });
            }

            for (var j = 0; j < fml.testcases.length; j++) { // looping through test cases
                var opr = fml.testcases[j];
                test_operator(opr, j);
            }
        });
    }


    describe('formula testing', function() {
        // divide tests into buckets 1, 2 and 3; run one each time to resolve memory issue
        var bucket = 1;
        var start, end;
        switch(bucket) {
            case 1:
                start = 0;
                end = 1;
                break;
            case 2:
                start = 1;
                end = 3;
                break;
            case 3:
                start = 3;
                end = 5;
                break;
        }

        for (var i = start; i < end; i++) {
            var fml = FORMULAS[i];
            formulaTest(fml);
        }
    });

});
