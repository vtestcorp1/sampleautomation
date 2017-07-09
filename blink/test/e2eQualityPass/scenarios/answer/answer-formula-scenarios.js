/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving adding formulas in answers
 * the file is further divided into testing group aggregation formulas (such as group_sum), aggregation (such as
 * sum), and row level formulas on numbers, text, and date
 *
 * this file also enumerates test for different answer sources. In particular, we run basic formula tests on answers
 * based on tables, worksheets, aggr worksheets, and imported data
 *
 * we also check whether formulas work with other functionalities, such as filtering, sorting and keywords
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Group Aggregation Formulas using TPCH tables', function() {

    beforeEach(function() {
        selectSageSources(TPCH_TABLES);
        sageInputElement().enter('customer region');
        waitForTableAnswerVisualizationMode();
    });

    it('should add group_sum(revenue, customer region)', function() {
        var formula = 'group_sum(revenue, customer region)',
            expected = 'africa,3,386,576,402';

        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'group sum test');
        sleep(1);
        waitForTableAnswerVisualizationMode();

        sleep(1);
        verifyAnswerTableData(expected, 2);
    });

    it('should add group_average(revenue, customer region)', function() {
        var formula = 'group_average(revenue, customer region)',
            expected = 'africa,3,568,573.66';
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'group average test');
        sleep(1);
        waitForTableAnswerVisualizationMode();

        sleep(1);
        verifyAnswerTableData(expected, 2);
    });

    it('should add group_min(revenue, customer region)', function() {
        var formula = 'group_min(revenue, customer region)',
            expected = 'africa,107,609';
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'group min test');
        sleep(1);
        waitForTableAnswerVisualizationMode();

        sleep(1);
        verifyAnswerTableData(expected, 2);
    });

    it('should add group_max(revenue, customer region)', function() {
        var formula = 'group_max(revenue, customer region)',
            expected = 'africa,10,024,850';
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'group max test');
        sleep(1);
        waitForTableAnswerVisualizationMode();

        sleep(1);
        verifyAnswerTableData(expected, 2);
    });

    it('should add group_count(revenue, customer region)', function() {
        var formula = 'group_count(revenue, customer region)',
            expected = 'africa,949';
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'group count test');
        sleep(1);
        waitForTableAnswerVisualizationMode();

        sleep(1);
        verifyAnswerTableData(expected, 2);
    });

});

describe('Aggregation Formulas', function() {
    beforeEach(function() {
        selectSageSources(TPCH_TABLES);
    });

    it('should add average(revenue)', function() {
        var formula = 'average(revenue)',
            expected = '18,051,222,435,3,608,079.64';

        sageInputElement().enter('revenue');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);

        // verify headlines
        checkSimpleHeadlines([
            {
                hv: '18.1B',
                hc: 'Total Revenue'
            },
            {
                hv: '3.61M',
                hc: 'Avg Formula Test'
            }
        ]);
    });

    it('should add sum(revenue)', function() {
        var formula = 'sum(revenue)',
            expected = '18,051,222,435,18,051,222,435';

        sageInputElement().enter('revenue');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);

        // verify headlines
        checkSimpleHeadlines([
            {
                hv: '18.1B',
                hc: 'Total Revenue'
            },
            {
                hv: '18.1B',
                hc: 'Total Formula Test'
            }
        ]);
    });

    it('should add stddev(revenue)', function() {
        var formula = 'stddev(revenue)',
            expected = '18,051,222,435,2,217,937.47';

        sageInputElement().enter('revenue');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);

        // verify headlines
        checkSimpleHeadlines([
            {
                hv: '18.1B',
                hc: 'Total Revenue'
            },
            {
                hv: '2.22M',
                hc: 'Std deviation Formula Test'
            }
        ]);
    });

    it('should add count(revenue)', function() {
        var formula = 'count(revenue)',
            expected = '18,051,222,435,5,003';

        sageInputElement().enter('revenue');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);

        // verify headlines
        checkSimpleHeadlines([
            {
                hv: '18.1B',
                hc: 'Total Revenue'
            },
            {
                hv: '5K',
                hc: 'Total count Formula Test'
            }
        ]);
    });

});

describe('Regular/column-level Formulas', function() {

    beforeEach(function() {
        selectSageSources(TPCH_TABLES);
    });

    it('should add revenue/1000', function() {
        var formula = 'revenue/1000',
            expected = '18,051,222,435,18,051,222.44';

        sageInputElement().enter('revenue');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);

        // verify headlines
        checkSimpleHeadlines([
            {
                hv: '18.1B',
                hc: 'Total Revenue'
            },
            {
                hv: '18.1M',
                hc: 'Total Formula Test'
            }
        ]);
    });

    it('should add month_number( commit date)', function() {
        var formula = 'month_number( commit date)',
            expected = 'Feb 1992,2';

        sageInputElement().enter('commit date');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);

        // verify headlines
        checkSimpleHeadlines([
            {
                hv: 'Feb1992-Oct1998',
                hc: 'Monthly (Commit Date)'
            },
            {
                hv: '12',
                hc: 'Formula Test'
            }
        ]);
    });

    it('should add customer region = "asia"', function() {
        var formula = 'customer region = "asia"',
            expected = ["asia","3,737,842,392"];

        sageInputElement().enter('revenue customer region');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);

        // verify headlines
        checkSimpleHeadlines([
            {
                hv: '1',
                hc: 'Customer Region'
            },
            {
                hv: '3.74B',
                hc: 'Revenue'
            }
        ]);
    });
});


describe('Formula Test Suite using different source types', function() {

    // group aggregation queries are covered in formula-testcase-tpch-scenarios
    // this will just run a basic test to verify that formulas will work in worksheet based answers
    it('should be able to add a formula in a worksheet based answer', function() {
        var worksheet = 'formula in answer test worksheet';
        var formula = 'revenue/1000',
            expected = '18,051,222,435,18,051,222.44';

        createTPCHWorksheet(worksheet, 'Commit'); // create tpch based worksheet
        selectWorksheetsAsSources([worksheet]);

        sleep(15); // wait for sage indexing
        sageInputElement().enter('revenue');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);
        checkSimpleHeadlines([
            {
                hv: '18.1B',
                hc: 'Total Revenue'
            },
            {
                hv: '18.1M',
                hc: 'Total Formula Test'
            }
        ]);

        deleteWorksheet(worksheet);
    });

    function createTPCHAggrWorksheet(worksheetName, query) {
        answerTab().click();
        selectSageSources(TPCH_TABLES);

        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        saveCurrentAnswerAsWorksheet(worksheetName);
    }

    it('should be able to add a formula in aggr worksheet based answer', function() {
        var worksheet = 'answer formulas in aggr worksheet test';
        var formula = 'total revenue/1000',
            expected = '18,051,222,435,18,051,222.44';

        createTPCHAggrWorksheet(worksheet, 'revenue customer region commit date color');
        selectWorksheetsAsSources([worksheet]);
        sleep(15); // wait for sage indexing

        sageInputElement().enter('total revenue');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 2);
        checkSimpleHeadlines([
            {
                hv: '18.1B',
                hc: 'Total Total Revenue'
            },
            {
                hv: '18.1M',
                hc: 'Total Formula Test'
            }
        ]);

        deleteWorksheet(worksheet);
    });

    it('should be able to add a formula in user imported data based answer', function() {
        var CSV_HEADER = 'Amount,Type',
            CSV_VALID_ROWS = ['25,debit', '15,credit'],
            CSV_HEADER_TYPES = ['LARGE INTEGER', 'TEXT'],
            CSV_FILE_NAME = 'import.csv',
            CSV_TABLE_NAME = 'import';
        var formula = 'amount/10';
        var expected = 'debit,25,2.50,credit,15,1.50';

        // mock importing user data
        dataTab().click();
        clickImportDataButton();
        userDataUploadFunctions.mockUploadFile(CSV_FILE_NAME, [CSV_HEADER, CSV_VALID_ROWS[0], CSV_VALID_ROWS[1]].join('\n'));
        userDataUploadFunctions.setHeaderDefined(true);
        userDataUploadFunctions.clickNext();
        verifyColumnHeaderNames(CSV_HEADER);
        verifyColumnData([CSV_VALID_ROWS[0], CSV_VALID_ROWS[1]].join(','));
        userDataUploadFunctions.clickNext();
        verifyColumnHeaderTypes(CSV_HEADER_TYPES);
        //skip linking step
        userDataUploadFunctions.clickNext();
        userDataUploadFunctions.clickImportButton();
        expect(element('.bk-import-success:visible').count()).toBe(1);
        sleep(15);

        // query based on user imported data
        selectSageSources([CSV_TABLE_NAME], 'Imported');
        sageInputElement().enter('amount type sort by type descending');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        sleep(1);
        verifyAnswerTableData(expected);
        checkSimpleHeadlines([
            {
                hv: '2',
                hc: 'Type'
            },
            {
                hv: '40',
                hc: 'Amount'
            },
            {
                hv: '4',
                hc: 'Formula Test'
            }
        ]);

        // delete mock data
        userDataUploadFunctions.deleteMockCSV(CSV_TABLE_NAME);
    });

});

describe('Formula Test General:', function() {

    beforeEach(function() {
        selectSageSources(TPCH_TABLES);
    });


    it('should be able to perform filtering and sorting on formulas -- 1', function() {
        var formula = 'revenue/1000',
            expected = 'africa,3,386,576,402,3,386,576.40,europe,3,445,082,451,3,445,082.45';

        sageInputElement().enter('revenue customer region');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        sageInputElement().enter('revenue customer region Formula Test sort by Formula Test');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 6);
    });

    it('should be able to perform filtering and sorting on formulas -- 2', function() {
        var formula = 'group_average(revenue, customer region)',
            expected = 'america,3,593,901,337,3,686,052.65,europe,3,445,082,451,3,626,402.58';

        sageInputElement().enter('revenue customer region');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        sageInputElement().enter('revenue customer region Formula Test for Formula Test > 3600000 sort by Formula Test descending');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 6);
    });

    it('should be able to perform filtering and sorting on formulas -- 3', function() {
        var formula = 'group_average(revenue, color)',
            expected = 'red,130,735,368,3,735,296.23';

        sageInputElement().enter('revenue color');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, 'Formula Test');
        waitForTableAnswerVisualizationMode();

        sageInputElement().enter('revenue color Formula Test for Formula Test > 3600000 for color=red');
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected, 3);
    });

    it('should be able to combine keywords and formulas', function() {
        var formula = 'revenue/1000',
            formulaName = 'adjusted revenue',
            expected = '3,608.08';

        sageInputElement().enter('revenue color');
        waitForTableAnswerVisualizationMode();
        formulaFunctions.createAndSaveNewFormulaInAnswer(formula, formulaName);
        waitForTableAnswerVisualizationMode();

        sageInputElement().enter('average ' + formulaName);
        waitForTableAnswerVisualizationMode();

        // verify table data
        sleep(1);
        verifyAnswerTableData(expected);
        checkSimpleHeadlines([
            {
                hv: '3.61K',
                hc: 'Avg adjusted revenue'
            }
        ]);
    });
});
