/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for generic and nonequi joins.
 * generic join does a cartesian product between two table following some user defined condition
 * the user defined condition can be nonequi, such as in the case of dates
 * both equi and nonequi joins are tested in this file.
 * worksheet based answers are tested with inner and left outer joins
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Generic and Non-equi Join', function () {
    var M2M_GENERIC_TABLES = ['generic_contacts_general', 'generic_sales_general'],
        M2M_GENERIC_TABLES_CRAZY = ['generic_contacts_crazy', 'generic_sales_crazy'],
        M2M_GENERIC_TABLES_EQUIONLY = ['generic_contacts_without_nonequi', 'generic_sales_without_nonequi'];


    describe('--general', function () {
        it('should preserve correct number of contacts and revenue amount when no join applies', function () {
            selectSageSources(M2M_GENERIC_TABLES);
            var sageQuery1 = 'unique count phone_c',
                sageQuery2 = 'sum amount';
            sageInputElement().enter(sageQuery1);
            waitForHeadline();
            expect(headlineValue(HEADLINE_VIZ)).toMatch(4);

            clearAnswer();
            sageInputElement().enter(sageQuery2);
            waitForHeadline();
            expect(headlineValue(HEADLINE_VIZ)).toMatch(610);
        });

        it('should display correct revenue amount when joining relationship applies', function () {
            selectSageSources(M2M_GENERIC_TABLES);
            var sageQuery = 'unique count phone_c sum amount';
            sageInputElement().enter(sageQuery);
            waitForHeadline();
            expect(headlineValueForHeadlineName('Unique count Phone_C')).toMatch(3);
            expect(headlineValueForHeadlineName('Total Amount')).toMatch(570);
        });

        it('should display correct revenue amount for edge cases of double counting', function() {
            selectSageSources(M2M_GENERIC_TABLES_CRAZY);
            var sageQuery1 = 'sum amount',
                sageQuery2 = 'unique count phone_c sum amount';
            sageInputElement().enter(sageQuery1);
            waitForHeadline();
            expect(headlineValue(HEADLINE_VIZ)).toMatch(610);
            clearAnswer();
            sageInputElement().enter(sageQuery2);
            waitForHeadline();
            expect(headlineValueForHeadlineName('Total Amount')).toMatch('1.71K');
        });

        it('should display correct revenue amount for joining relationship with only equi condition', function() {
            selectSageSources(M2M_GENERIC_TABLES_EQUIONLY);
            var sageQuery1 = 'sum amount',
                sageQuery2 = 'unique count phone_c sum amount';
            sageInputElement().enter(sageQuery1);
            waitForHeadline();
            expect(headlineValue(HEADLINE_VIZ)).toMatch(610);
            clearAnswer();
            sageInputElement().enter(sageQuery2);
            waitForHeadline();
            expect(headlineValueForHeadlineName('Total Amount')).toMatch('1.99K');
        });

    });


    describe('--worksheet', function () {
        var worksheetName1 = 'M2m Progressive Inner Join Ws',
            worksheetName2 = 'M2m Left Outer Join Ws',
            worksheetName3 = 'M2m Full Inner Join Ws';

        it('should show correct number of contacts for full inner join', function () {
            var testQuery = 'unique count c_ phone_c';

            createComplexWorksheet({
                switchJoinType: INNER_JOIN,
                switchJoinRule: FULL_JOIN,
                title: worksheetName3,
                sources: M2M_GENERIC_TABLES,
                prefix: ['C_', 'S_']
            });
            answerTab().click();
            deselectAllSources();
            selectWorksheetsAsSources([worksheetName3]);
            sleep(15);
            sageInputElement().enter(testQuery);
            waitForHeadline();
            expect(headlineValue(HEADLINE_VIZ)).toMatch(3);
            deleteWorksheet(worksheetName3);
        });

        it('should show correct number of contacts for progressive inner join', function () {
            var testQuery1 = 'unique count c_ phone_c',
                testQuery2 = 'unique count c_ phone_c sum s_ amount';

            createComplexWorksheet({
                switchJoinType: INNER_JOIN,
                title: worksheetName1,
                sources: M2M_GENERIC_TABLES,
                prefix: ['C_', 'S_']
            });
            answerTab().click();
            deselectAllSources();
            selectWorksheetsAsSources([worksheetName1]);
            sleep(15);
            sageInputElement().enter(testQuery1);
            waitForHeadline();
            expect(headlineValue(HEADLINE_VIZ)).toMatch(4);
            clearAnswer();
            sageInputElement().enter(testQuery2);
            waitForHeadline();
            expect(headlineValueForHeadlineName('Unique count C_ Phone_C')).toMatch(3);
            expect(headlineValueForHeadlineName('Total S_ Amount')).toMatch(570);
            deleteWorksheet(worksheetName1);
        });

        it('should show correct number of contacts for progressive left outer join', function () {
            var testQuery1 = 'unique count c_ phone_c',
                testQuery2 = 'unique count c_ phone_c sum s_ amount';

            createComplexWorksheet({
                switchJoinType: LEFT_JOIN,
                title: worksheetName2,
                sources: M2M_GENERIC_TABLES,
                prefix: ['C_', 'S_']
            });

            answerTab().click();
            deselectAllSources();
            selectWorksheetsAsSources([worksheetName2]);
            sleep(15);
            sageInputElement().enter(testQuery1);
            waitForHeadline();
            expect(headlineValue(HEADLINE_VIZ)).toMatch(4);
            clearAnswer();
            sageInputElement().enter(testQuery2);
            waitForHeadline();
            expect(headlineValueForHeadlineName('Unique count C_ Phone_C')).toMatch(4); // left outer join should include contacts not included in the sales table
            expect(headlineValueForHeadlineName('Total S_ Amount')).toMatch(570);
            deleteWorksheet(worksheetName2);
        });

    });

    describe('--formula', function () {
        it('should work on worksheet with two m2m joined tables', function() {
            var worksheetName = 'M2m Formula Test Ws',
                formulaName = 'test formula',
                formulaContent = "if (amount > 20) then 'profit' else 'loss'",
                expectedResult = ['loss', 'profit', 'profit'];

            createComplexWorksheet({
                title: worksheetName,
                sources: M2M_GENERIC_TABLES,
                prefix: ['C_', 'S_']
            });
            createFormulaAndSave(formulaName, formulaContent);
            verifyFormulaResult(formulaName, expectedResult);
            deleteWorksheet(worksheetName);
        });

        it('should show correct aggregation formula results searching worksheet with inner join', function() {
            var worksheetName = 'M2m Inner Join Aggregation Test Ws',
                formulaName = 'avg amount',
                formulaContent = 'average (amount)',
                expectedResult = 61;
            var tableDataQuery = formulaName + ' c_ phone_c sort by c_ phone_c descending',
                expectedTableData = '9094509023,85.00,4088021663,70.00,2242419125,40.00';

            createComplexWorksheet({
                switchJoinType: INNER_JOIN,
                title: worksheetName,
                sources: M2M_GENERIC_TABLES,
                prefix: ['C_', 'S_']
            });
            createFormulaAndSave(formulaName, formulaContent);
            verifyAggregateFormulaResult(worksheetName, formulaName, expectedResult);

            goToAnswer();
            selectSageSources([worksheetName], 'Worksheets');
            sageInputElement().enter(tableDataQuery);
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expectedTableData);
            deleteWorksheet(worksheetName);
        });

        it('should show correct aggregation formula results searching worksheet with left outer join', function() {
            var worksheetName = 'M2m Left Outer Join Aggregation Test Ws',
                formulaName = 'avg amount',
                formulaContent = 'average (amount)';
            var tableDataQuery = formulaName + ' c_ phone_c sort by c_ phone_c descending',
                expectedTableData = '9094509023,85.00,5103048963,NaN,4088021663,70.00,2242419125,40.00';

            createComplexWorksheet({
                switchJoinType: LEFT_JOIN,
                title: worksheetName,
                sources: M2M_GENERIC_TABLES,
                prefix: ['C_', 'S_']
            });
            createFormulaAndSave(formulaName, formulaContent);
            saveCurrentAnswer();

            goToAnswer();
            sleep(30);
            selectSageSources([worksheetName], 'Worksheets');
            sageInputElement().enter(tableDataQuery);
            waitForHighcharts();
            waitForTableAnswerVisualizationMode();
            verifyAnswerTableData(expectedTableData);
            deleteWorksheet(worksheetName);
        });
    });
});
