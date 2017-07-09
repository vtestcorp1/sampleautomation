/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou (shitong@thoughtspot.com)
 *
 * @fileoverview tpch worksheet keywords
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Formula Test on TPCH datasets', function () {

    // list all formulas you want to run, for now we'll run only group aggregation queries
    var FORMULAS = [GROUP_QUERIES];

    function formulaTest(fml) {
        describe('Formula Testing - ' + fml.repr + '', function () {
            function test_operator(opr, idx) {
                it('should work on ' + opr.repr + ' operator', function () {
                    var worksheetTitle = opr.repr + '_Test';
                    createTPCHWorksheet(worksheetTitle, 'Commit');

                    for (var id = 0; id < opr.tests.length; id++) {
                        var test = opr.tests[id];
                        createFormulaAndSave(test.inputValue, test.inputValue);
                        // verify formula result
                        if (opr.type === 'aggregation') {
                            verifyAggregateFormulaResult(worksheetTitle, test.inputValue, test.expectedResult);
                        } else if (opr.type == 'group') {
                            verifyAggregateFormulaResult(worksheetTitle, test.inputValue, test.expectedResult, true);
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


    describe('formulas', function() {
        for (var i = 0; i < FORMULAS.length; i++) {
            var fml = FORMULAS[i];
            formulaTest(fml);
        }
    });
});
