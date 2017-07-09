
/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jeff Tran, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for formula testcases
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Formula Test 3', function () {

    // list all formulas you want to run
    var FORMULAS = [NUMBER_, OPERATOR_, MIXED_, DATE_, TEXT_];
    var formulaTestSources = [FORMULA_TEST_DATA];
    var bucket = 3;

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
