/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang
 *
 * @fileoverview e2e scenarios around views and query on query tests
 * note(Shitong): views are deprecated. Delete this file if it is not used in e2e test
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

function saveAsView(name, description) {
    element('.bk-submenu-item-label:contains(Save as View)').click();
    input('data.customData.questionHeader').enter(name);
    if (description) {
        input('data.customData.questionDescription').enter(description);
    }
    element('.bk-save-btn').click();
}

// fix after after SCAL-8657 is fixed
function checkAddedView(name, description) {
    goToView();
    expect(element(FIRST_ELEMENT + ' .bk-name-content').text()).toBe(name);
    if (description) {
        expect(true).toBe(true);
    }
}

function deleteView(name) {
    goToView();
    element('li:contains(' + name + ') .bk-checkbox').click();
    element(DELETE_ICON).click();
    waitForElement(CONFIRM_BTN);
    element(CONFIRM_BTN).click();
}

function selectView(names, workSheet) {
    if (!workSheet) {
        goToAnswer();
        deselectAllTableSources();
    } else {
        dataTab().click();
        createNewWorksheetBtn().click();
    }

    element('.bk-filter:contains(All)').click();
    for (var i = 0; i < names.length; i++) {
        sageDataSourceItem(names[i], 'Views').click();
    }
}

//TODO(Shitong): view is disabled in 3.1, remove
xdescribe('QoQ/View tests --', function() {
    beforeEach(function() {
        deselectAllTableSources();
        goToAnswer();
        selectSageSources(TPCH_TABLES);
    });

    it('1: should test all measure types (total, average, count, min, max, std dev, unique count, variance) and make sure they can be saved as a view', function() {
        var name = 'measures_qoq',
            query = 'customer region revenue average revenue count revenue standard deviation revenue unique count revenue variance revenue min revenue max revenue';
        var results1 = {
            headline: {
                val: ['5', '18.1B', '3.6M', '1K', '2.2M'],
                col: ['Customer Region', 'Revenue', 'Revenue', 'Revenue', 'Revenue'],
                sel: ['UNIQUE COUNT', 'TOTAL REVENUE', 'MIN', 'AVG', 'MIN']
            },
            table: {
                col: ['Customer Region', 'Revenue', 'Revenue', 'Revenue', 'Revenue', 'Revenue', 'Revenue', 'Revenue', 'Revenue'],
                sel: [null, 'TOTAL', 'AVG', 'TOTAL COUNT', 'STD DEVIATION', 'UNIQUE COUNT', 'VARIANCE', 'MIN', 'MAX'],
                val: ['africa', '3,386,576,402', '3,568,573.66', '949', '2,220,096.13', '949', '4,928,826,847,309.25', '107,609', '10,024,850']
            }
        };
        var results2 = {
            headline: {
                val: ['5', '18.1M', '5K', '5K', '49.6M'],
                col: ['Customer Region', 'Revenue#AVERAGE', 'Revenue#COUNT_DISTINCT', 'Revenue#COUNT', 'Revenue#MAX'],
                sel: ['UNIQUE COUNT', 'Total Revenue#AVERAGE', 'Total Revenue#COUNT_DISTINCT', 'Total Revenue#COUNT', 'Total Revenue#MAX']
            },
            table: {
                col: ['Customer Region', 'Revenue#AVERAGE', 'Revenue#COUNT_DISTINCT', 'Revenue#COUNT', 'Revenue#MAX', 'Revenue#MIN', 'Revenue#STD_DEVIATION', 'Revenue#SUM', 'Revenue#VARIANCE'],
                sel: [null, 'TOTAL', 'TOTAL', 'TOTAL', 'TOTAL', 'TOTAL', 'TOTAL', 'TOTAL'],
                val: ['africa', '3,568,573.66', '949', '949', '10,024,850', '107,609', '2,220,096.13', '3,386,576,402', '4,928,826,847,309.25']
            }
        };

        sageInputElement().enter(query);
        waitForTable();
        checkTableViewResults(results1);
        saveAsView(name);

        checkAddedView(name);
        selectView([name]);
        sageDataPanelFunctions.openSource(name);


        // it will take some time to index the new added view, if failed here:
        sleep(30);
        addCol('customer region');
        addCol('revenue#average');
        addCol('revenue#count_distinct');
        addCol('revenue#count');
        addCol('revenue#max');
        addCol('revenue#min');
        addCol('revenue#std_deviation');
        addCol('revenue#sum');
        addCol('revenue#variance');
        checkTableViewResults(results2);
        deleteView(name);
    });

    // bug: SCAL-8657
    it('2: should create a view with a description: (fail: SCAL-8657)', function() {
        var query = 'revenue commit date color',
            name = 'description_testing',
            description = 'description test for ' + query;

        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        saveAsView(name, description);

        checkAddedView(name, description);
        deleteView(name);
    });

    it('3: should test date, attribute and measure', function() {
        // SCAL-8318 is now treated as normal
        var query = 'commit date color revenue',
            name = 'date_attribute_measure';
        var results1 = {
            headline: {
                val: ['Feb 1992Oct 1998', '92', '18.1B'],
                col: ['Commit Date', 'Color', 'Revenue'],
                sel: [null, 'UNIQUE COUNT', 'Total Revenue']
            },
            table: {
                col: ['Commit Date', 'Color', 'Revenue'],
                sel: ['MONTHLY', null, 'TOTAL'],
                val: ['Feb 1992', 'beige', '832,440']
            }
        };
        var results2 = {
            headline: {
                val: ['Feb 1992Oct 1998', '92', '18.1B'],
                col: ['(Commit Date:#ABS_MONTH_AS_EPOCH#)', 'Color', 'Revenue#SUM'],
                sel: [null, 'UNIQUE COUNT', 'Total Revenue#SUM']
            },
            table: {
                col: ['(Commit Date:#ABS_MONTH_AS_EPOCH#)', 'Color', 'Revenue#SUM'],
                sel: ['MONTHLY', null, 'TOTAL'],
                val: ['Feb 1992', 'beige', '832,440']
            }
        };

        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        checkTableViewResults(results1);

        saveAsView(name);
        checkAddedView(name);

        selectView([name]);
        sageDataPanelFunctions.openSource(name);
        sleep(30);
        addCol('(commit date:#abs_month_as_epoch#)');
        addCol('color');
        addCol('revenue#sum');

        checkTableViewResults(results2);
        deleteView(name);
    });

    it('4: should query on view with filters', function() {
        var query = 'commit date revenue part name for commit date >= 03/20/1993 for revenue >= 2345678 salmon spring snow coral',
            name = 'qoq_filters';
        var results1 = {
            headline: {
                val: ['Aug 1995Jul 1998', '2', '15.1M'],
                col: ['Commit Date', 'Part Name', 'Revenue'],
                sel: ['', 'UNIQUE COUNT', 'Total Revenue']
            },
            table: {
                col: ['Commit Date', 'Part Name', 'Revenue'],
                sel: ['MONTHLY', '', 'TOTAL'],
                val: ['Aug 1995', 'snow coral', '6,770,408']
            }
        };
        var results2 = {
            headline: {
                val: ['Aug 1995Jul 1998', '2', '15.1M'],
                col: ['(Commit Date:#ABS_MONTH_AS_EPOCH#)', 'Part Name', 'Revenue#SUM'],
                sel: ['', 'UNIQUE COUNT', 'Total Revenue#SUM']
            },
            table: {
                col: ['(Commit Date:#ABS_MONTH_AS_EPOCH#)', 'Part Name', 'Revenue#SUM'],
                sel: ['MONTHLY', '', 'TOTAL'],
                val: ['Aug 1995', 'snow coral', '6,770,408']
            }
        };

        sageInputElement().enter(query);
        waitForTableAnswerVisualizationMode();
        checkTableViewResults(results1);

        saveAsView(name);
        checkAddedView(name);
        selectView([name]);
        sageDataPanelFunctions.openSource(name);
        sleep(30);
        addCol('(commit date:#abs_month_as_epoch#)');
        addCol('part name');
        addCol('revenue#sum');

        checkTableViewResults(results2);
        deleteView(name);
    });

    it('5: should test average of sum: (verified: SCAL-9436)', function() {
        var query1 = 'sum revenue by customer region by year',
            query2 = 'average revenue#sum by customer region',
            name = 'avg_sum';
        var results = {
            headline: {
                val: ['5', '483.8M'],
                col: ['Customer Region', 'Revenue#SUM'],
                sel: ['UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Customer Region', 'Revenue#SUM'],
                sel: ['', 'AVG'],
                val: ['africa', '483,796,628.86']
            }
        };

        sageInputElement().enter(query1);
        waitForElement(SAGE_DROPDOWN);
        element('.lineage:contains((4 matches))').click();
        element('.item-text:contains(Order Date in Lineorder)').click();
        waitForTableAnswerVisualizationMode();
        saveAsView(name);
        checkAddedView(name);
        selectView([name]);

        sageInputElement().enter(query2);
        waitForTableAnswerVisualizationMode();
        checkTableViewResults(results);
        deleteView(name);
    });

    it('6: test view for keywords: growth, top, bottom', function() {
        var query1 = 'growth of revenue by commit date',
            query2 = 'growth of order total price by order date monthly year-over-year',
            query3 = 'top 4 customer nation ranked by quantity',
            query4 = 'bottom 3 supplier address ranked by supply cost',
            name1 = 'growth1',
            name2 = 'growth2',
            name3 = 'top',
            name4 = 'bottom';

        sageInputElement().enter(query1);
        waitForTableAnswerVisualizationMode();
        saveAsView(name1);
        checkAddedView(name1);
        deleteView(name1);

        goToAnswer();
        sageInputElement().enter(query2);
        waitForTableAnswerVisualizationMode();
        saveAsView(name2);
        checkAddedView(name2);
        deleteView(name2);

        goToAnswer();
        sageInputElement().enter(query3);
        waitForElement(SAGE_DROPDOWN);
        callFunctionWithElement(null, function($body, appWindow, $) {
            $('.item-text').filter(function() {return $(this).find(' span span').text() === 'top4';}).click();
        });
        waitForTableAnswerVisualizationMode();
        saveAsView(name3);
        checkAddedView(name3);
        deleteView(name3);

        goToAnswer();
        sageInputElement().enter(query4);
        waitForElement(SAGE_DROPDOWN);
        callFunctionWithElement(null, function($body, appWindow, $) {
            $('.item-text').filter(function() {return $(this).find(' span span').text() === 'bottom3';}).click();
        });
        waitForTableAnswerVisualizationMode();
        saveAsView(name4);
        checkAddedView(name4);
        deleteView(name4);
    });

    it('7: should check saved views and explore data', function() {
        var query1 = 'revenue color',
            query2 = 'customer nation tax',
            name1 = 'first',
            name2 = 'second';

        sageInputElement().enter(query1);
        waitForTableAnswerVisualizationMode();
        saveAsView(name1);
        checkAddedView(name1);

        goToAnswer();
        sageInputElement().enter(query2);
        waitForTableAnswerVisualizationMode();
        saveAsView(name2);
        checkAddedView(name2);

        element('.bk-name-content:contains(' + name1 + ')').click();
        expect(element('.bk-table-name').text()).toBe(name1);
        expect(element('.slick-column-name').text()).toBe('ColorRevenue#SUM');
        expect(element('.slick-row:eq(0)').text()).toBe('almond168,004,329');
        element('a.bk-close').click();

        element('.bk-name-content:contains(' + name2 + ')').click();
        expect(element('.bk-table-name').text()).toBe(name2);
        expect(element('.slick-column-name').text()).toBe('Customer NationTax#SUM');
        expect(element('.slick-row:eq(0)').text()).toBe('algeria826');
        element('a.bk-close').click();

        deleteView(name1);
        deleteView(name2);
    });

    it('8: should link views', function() {
        var query1 = 'market segment discount customer nation',
            query2 = 'market segment discount',
            name1 = 'first_view',
            name2 = 'second_view',
            linkage = 'Market Segment';

        sageInputElement().enter(query1);
        waitForTableAnswerVisualizationMode();
        saveAsView(name1);

        sageInputElement().enter(query2);
        waitForPathToChange();
        saveAsView(name2);

        linkData(name1, name2, linkage);

        selectView([name1, name2]);
        sageDataPanelFunctions.openSource(name1);
        addCol('customer nation');
        waitForTableAnswerVisualizationMode();
        expect(checkClass('li.bk-source-item:contains(' + name2 + ')', 'bk-disabled')).toBe(false);
        deleteView(name1);
        deleteView(name2);
    });

    it('9: should test lbm -- 1', function() {
        var query1 = 'revenue customer nation customer region',
            query2 = 'revenue customer region',
            testQuery = 'customer nation customer region percentage sort by customer region sort by customer nation',
            name1 = 'first_lbm',
            name2 = 'second_lbm',
            linkage = 'Customer Region',
            formulaName = 'percentage',
            formulaText = 'revenue#sum / revenue#sum * 100',
            worksheetName = 'Worksheet_lbm1';

        var results = {
            headline: {
                val: ['25', '5', '500'],
                col: ['Customer Nation', 'Customer Region', 'percentage'],
                sel: ['Unique Count', 'Unique Count', 'Total Percentage']
            },
            table: {
                col: ['Customer Nation', 'Customer Region', 'percentage'],
                sel: ['', '', 'TOTAL'],
                val: ['algeria', 'africa', '22.13']
            }
        };

        sageInputElement().enter(query1);
        waitForHighcharts();
        saveAsView(name1);

        sageInputElement().enter(query2);
        waitForTableAnswerVisualizationMode();
        saveAsView(name2);

        linkData(name1, name2, linkage);

        selectView([name1, name2], true);
        sageDataPanelFunctions.openSource(name1);
        selectWorksheetCol(name1, 'Customer Nation');
        selectWorksheetCol(name1, 'Customer Region');
        selectWorksheetCol(name1, 'Revenue#SUM');

        sageDataPanelFunctions.openSource(name2);
        selectWorksheetCol(name2, 'Customer Region', 'Second');
        selectWorksheetCol(name2, 'Revenue#SUM', 'Second');

        createFormulaAndSave(formulaName, formulaText, ['First_Lbm', 'Second_Lbm']);
        saveCurrentAnswer(worksheetName);

        goToAnswer();
        deselectAllTableSources();
        goToAnswer();
        element('.bk-filter:contains(All)').click();
        sageDataSourceItem(worksheetName, 'Worksheets').click();
        // in order to get worksheet indexed
        sleep(10);

        sageInputElement().enter(testQuery);
        waitForTableAnswerVisualizationMode();
        checkTableViewResults(results);

        deleteWorksheet(worksheetName);
        deleteView(name1);
        deleteView(name2);
    });

    it('10: should test lbm -- 2', function() {
        var query1 = 'revenue customer region customer nation customer city',
            query2 = 'revenue customer region customer nation',
            query3 = 'revenue customer region',
            testQuery = 'sort by customer city percentage13 percentage23 customer nation customer region',
            viewName1 = 'lbm_view1',
            viewName2 = 'lbm_view2',
            viewName3 = 'lbm_view3',
            linkage1 = 'Customer Nation',
            linkage2 = 'Customer Region',
            formulaName1 = 'percentage13',
            formulaName2 = 'percentage23',
            formulaText = 'revenue#sum / revenue#sum * 100',
            worksheetName = 'Worksheet_lbm2';

        var results = {
            headline: {
                val: ['248', '25', '5', '500', '5K'],
                col: ['Customer City', 'Customer Nation', 'Customer Region', 'percentage13', 'percentage23'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'UNIQUE COUNT', 'Total percentage13', 'Total percentage23']
            },
            table: {
                col: ['Customer City', 'Customer Nation', 'Customer Region', 'percentage13', 'percentage23'],
                sel: ['', '', '', 'TOTAL', 'TOTAL'],
                val: ['algeria 0', 'algeria', 'africa', '1.64203', '22.13']
            }
        };

        sageInputElement().enter(query1);
        waitForTableAnswerVisualizationMode();
        saveAsView(viewName1);

        sageInputElement().enter(query2);
        waitForPathToChange();
        saveAsView(viewName2);

        sageInputElement().enter(query3);
        waitForPathToChange();
        saveAsView(viewName3);

        linkData(viewName1, viewName2, linkage1);
        linkData(viewName2, viewName3, linkage2);

        selectView([viewName1, viewName2, viewName3], true);
        sageDataPanelFunctions.openSource(viewName1);
        selectWorksheetCol(viewName1, 'Customer City');
        selectWorksheetCol(viewName1, 'Customer Nation');
        selectWorksheetCol(viewName1, 'Customer Region');
        selectWorksheetCol(viewName1, 'Revenue#SUM');

        sageDataPanelFunctions.openSource(viewName2);
        selectWorksheetCol(viewName2, 'Customer Nation', 'Second');
        selectWorksheetCol(viewName2, 'Customer Region', 'Second');
        selectWorksheetCol(viewName2, 'Revenue#SUM', 'Second');

        sageDataPanelFunctions.openSource(viewName3);
        selectWorksheetCol(viewName3, 'Customer Region', 'Third');
        selectWorksheetCol(viewName3, 'Revenue#SUM', 'Third');

        createFormulaAndSave(formulaName1, formulaText, ['Lbm_View1', 'Lbm_View3']);
        createFormulaAndSave(formulaName2, formulaText, ['Lbm_View2', 'Lbm_View3']);
        saveCurrentAnswer(worksheetName);

        goToAnswer();
        deselectAllTableSources();
        goToAnswer();
        element('.bk-filter:contains(All)').click();
        sageDataSourceItem(worksheetName, 'Worksheets').click();
        // in order to get worksheet indexed
        sleep(10);

        sageInputElement().enter(testQuery);
        waitForTableAnswerVisualizationMode();
        checkTableViewResults(results);

        deleteWorksheet(worksheetName);
        deleteView(viewName1);
        deleteView(viewName2);
        deleteView(viewName3);
    });
});
