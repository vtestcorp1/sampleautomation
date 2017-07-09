/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around left panel
 * tests adding columns and filters from the left panel
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test left panel: ', function() {

    beforeEach(function() {
        deselectAllTableSources();
        goToAnswer();
    });

    it('should test double click 2 columns (1)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.addColumn('Commit Date');
        sageDataPanelFunctions.addColumn('Revenue');

        sageDataPanelFunctions.waitForCheckMark('Commit Date', true);
        sageDataPanelFunctions.waitForCheckMark('Revenue', true);
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: 'Feb1992-Oct1998',
                hc: 'Monthly (Commit Date)'
            },
            {
                hv: '18.1B',
                hc: 'Revenue'
            }
        ]);
    });

    it('should test double click 3 columns (2)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('SUPPLIER').click();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.addColumn('Commit Date');
        sageDataPanelFunctions.addColumn('Revenue');
        sageDataPanelFunctions.openSource('SUPPLIER');
        sageDataPanelFunctions.addColumn('Supplier Nation');
        sageDataPanelFunctions.waitForCheckMark('Commit Date', true);
        sageDataPanelFunctions.waitForCheckMark('Revenue', true);
        sageDataPanelFunctions.waitForCheckMark('Supplier Nation', true);
        waitForTableAnswerVisualizationMode();
        expect(sageInputElement().val()).toBe('commit date revenue supplier nation');
        checkSimpleHeadlines([
            {
                hv: 'Feb1992-Oct1998',
                hc: 'Monthly (Commit Date)'
            },
            {
                hv: '18.1B',
                hc: 'Revenue'
            },
            {
                hv: '25',
                hc: 'Supplier Nation'
            }
        ]);
    });

    it('should test single click with query (3)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('CUSTOMER').click();
        sageInputElement().enter('extended price by customer city');
        waitForTableAnswerVisualizationMode();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.waitForCheckMark('Extended Price', true);
        sageDataPanelFunctions.waitForCheckMark('Customer City', true);
        checkSimpleHeadlines([
            {
                hv: '248',
                hc: 'Customer City'
            },
            {
                hv: '19B',
                hc: 'Extended Price'
            }
        ]);

        sageDataPanelFunctions.addColumn('Customer Nation', true);

        sageDataPanelFunctions.waitForCheckMark('Customer Nation', true);
        checkSimpleHeadlines([
            {
                hv: '248',
                hc: 'Customer City'
            },
            {
                hv: '19B',
                hc: 'Extended Price'
            },
            {
                hv: '25',
                hc: 'Customer Nation'
            }
        ]);

        // TODO(Shitong): number of filter selected is temporarily disabled
        //verifyFilterSelected(0);
    });

    it('should test 3 filters with query (4)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('CUSTOMER').click();
        sageInputElement().enter('extended price by customer city');
        waitForTableAnswerVisualizationMode();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.waitForCheckMark('Extended Price', true);
        sageDataPanelFunctions.waitForCheckMark('Customer City', true);

        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.openFilter('Customer Nation');
        filterPanelFunctions.waitForFilterPopover(true);
        filterFunctions.checkboxFilters.toggleCheckboxState('jordan');
        filterFunctions.checkboxFilters.toggleCheckboxState('indonesia');
        clickFilterDoneButton();
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.openFilter('Customer Name');
        filterPanelFunctions.waitForFilterPopover(true);
        filterFunctions.checkboxFilters.toggleCheckboxState('customer#000025090');
        filterFunctions.checkboxFilters.toggleCheckboxState('customer#000004741');
        clickFilterDoneButton();
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.openFilter('Market Segment');
        filterPanelFunctions.waitForFilterPopover(true);
        filterFunctions.checkboxFilters.toggleCheckboxState('household');
        clickFilterDoneButton();

        checkSimpleHeadlines([
            {
                hv: '1',
                hc: 'Customer City'
            },
            {
                hv: '12.2M',
                hc: 'Extended Price'
            }
        ]);
    });

    it('should test single click 4 columns (5)', function() {
        sageDataSourceItem('CUSTOMER').click();
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.addColumn('Customer Address', true);
        expect(checkCheckmark('Customer Address')).toBe(true);
        sageDataPanelFunctions.addColumn('Customer City', true);
        expect(checkCheckmark('Customer City')).toBe(true);
        sageDataPanelFunctions.addColumn('Customer CustKey', true);
        expect(checkCheckmark('Customer CustKey')).toBe(true);
        sageDataPanelFunctions.addColumn('Market Segment', true);
        expect(checkCheckmark('Market Segment')).toBe(true);
        waitForTableAnswerVisualizationMode();
        expect(sageInputElement().val()).toBe('customer address customer city customer custkey market segment');

        checkSimpleHeadlines([
            {
                hv: '5K',
                hc: 'Customer Address'
            },
            {
                hv: '250',
                hc: 'Customer City'
            },
            {
                hv: '5K',
                hc: 'Customer CustKey'
            },
            {
                hv: '5',
                hc: 'Market Segment'
            }
        ]);
    });

    it('should test delete column with query (6): (verified: SCAL-9222)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('SUPPLIER').click();
        sageInputElement().enter('revenue by supplier region supply cost sort by supplier region');
        waitForTableAnswerVisualizationMode();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.openSource('SUPPLIER');
        expect(checkCheckmark('Revenue')).toBe(true);
        expect(checkCheckmark('Supplier Region')).toBe(true);
        expect(checkCheckmark('Supply Cost')).toBe(true);

        deleteColFromLeftPanel('Supply Cost');
        expect(checkCheckmark('Supply Cost')).toBe(false);
        checkSimpleHeadlines([
            {
                hv: '5',
                hc: 'Supplier Region'
            },
            {
                hv: '18.1B',
                hc: 'Revenue'
            }
        ]);
    });

    it('should delete filters (7)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('PART').click();
        sageDataSourceItem('SUPPLIER').click();
        sageInputElement().enter('supplier nation for supplier nation peru ethiopia argentina morocco part name quantity for part name lemon misty black goldenrod sort by supplier nation sort by part name');
        waitForTableAnswerVisualizationMode();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.openSource('PART');
        sageDataPanelFunctions.openSource('SUPPLIER');
        expect(checkCheckmark('Quantity')).toBe(true);
        expect(checkCheckmark('Part Name')).toBe(true);
        expect(checkCheckmark('Supplier Nation')).toBe(true);
        checkSimpleHeadlines([
            {
                hv: '2',
                hc: 'Supplier Nation'
            },
            {
                hv: '2',
                hc: 'Part Name'
            },
            {
                hv: '108',
                hc: 'Quantity'
            }
        ]);

        waitForElement(contains(FILTER_TEXT, 'Part Name'));
        waitForElement('.bk-boxed-token:contains(for part name lemon misty, black goldenrod)');
        deleteFilter('Part Name');
        waitForNotContain('.bk-boxed-token:contains(for part name lemon misty, black goldenrod)');
        //verifyFilterSelected(1);
    });

    it('should test table filter (8)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageInputElement().enter('ship mode quantity');
        waitForHighcharts();
        waitForTableAnswerVisualizationMode();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.waitForCheckMark('Quantity', true);
        sageDataPanelFunctions.waitForCheckMark('Ship Mode', true);
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.openFilter('Ship Mode');
        filterPanelFunctions.waitForFilterPopover(true);
        filterFunctions.checkboxFilters.toggleCheckboxState('truck');
        filterFunctions.checkboxFilters.toggleCheckboxState('mail');
        clickFilterDoneButton();
        filterPanelFunctions.waitForFilterItems(1);

        waitForElement(contains(FILTER_TEXT, 'Ship Mode'));
        //verifyFilterSelected(1);
        //checkFilterContent('Ship Mode', ['truck', 'mail'], true);
    });

    it('should test double click with left filters (9)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('SUPPLIER').click();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.openSource('SUPPLIER');
        sageDataPanelFunctions.addColumn('Revenue');
        sageDataPanelFunctions.waitForCheckMark('Revenue', true);
        sageDataPanelFunctions.addColumn('Quantity');
        sageDataPanelFunctions.waitForCheckMark('Quantity', true);
        sageDataPanelFunctions.addColumn('Supplier Nation');
        sageDataPanelFunctions.waitForCheckMark('Supplier Nation', true);
        waitForHighcharts();
        waitForTableAnswerVisualizationMode();
        addFilterNum('Quantity', [4000], ['>'], true);
        //verifyFilterSelected(1);
    });

    it('should test double click with table filters (10)', function() {
        sageDataSourceItem('LINEORDER').click();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.addColumn('Commit Date');
        sageDataPanelFunctions.waitForCheckMark('Commit Date', true);
        sageDataPanelFunctions.addColumn('Tax');
        sageDataPanelFunctions.waitForCheckMark('Tax', true);
        waitForHighcharts();
        waitForTableAnswerVisualizationMode();
        addFilterNum('Commit Date', ['04/11/1994', '11/05/1996'], ['>', '<='], true, true);
        //verifyFilterSelected(1);
    });
});

describe('test collapse of left pane: ', function() {
    beforeEach(function() {
        deselectAllTableSources();
        goToAnswer();
    });

    it('should verify number of sources', function() {
        sageDataSourceItem('LINEORDER').click();
        expect(sageDataColumnSourceItem().count()).toBe(1);
        sageDataSourceItem('CUSTOMER').click();
        expect(sageDataColumnSourceItem().count()).toBe(2);
        sageDataSourceItem('DATE').click();
        expect(sageDataColumnSourceItem().count()).toBe(3);
        sageDataSourceItem('PART').click();
        expect(sageDataColumnSourceItem().count()).toBe(4);
        sageDataSourceItem('SUPPLIER').click();
        expect(sageDataColumnSourceItem().count()).toBe(5);
    });
});
