/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around drill down functionality
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test drill down: ', function() {

    beforeEach(function() {
        deselectAllTableSources();
        goToAnswer();
        sageDataSourceItem('LINEORDER').click();
        sageDataSourceItem('PART').click();
        sageDataSourceItem('CUSTOMER').click();
        sageDataSourceItem('DATE').click();
        sageDataSourceItem('SUPPLIER').click();
    });

    it('should test drill down from table', function() {
        sageInputElement().enter('extended price by order date by market segment');
        waitForTableAnswerVisualizationMode();

        drillDown('table', 'drill down', 'Customer Nation');
        waitForElement('.bk-boxed-token:contains(customer nation)');
        expect(sageInputElement().val()).toBe('extended price by order date by market segment by customer nation');
        expect(element(TABLE_COLUMN_HEADER + ' .slick-column-name').text()).toBe('Order DateMarket SegmentCustomer NationExtended Price');
        expect(element(TABLE_COLUMN_HEADER + ' .chosen-single').text()).toBe('MONTHLYTOTAL');
    });

    // SCAL-10346
    xit('should test underlying data from table', function() {
        sageInputElement().enter('average revenue by part name');
        waitForTableAnswerVisualizationMode();
        drillDown('table', 'underlying data', 'Discount');
    });

    xit('should test drill down column from column', function() {
        sageInputElement().enter('ship mode order total price customer nation sort by ship mode');
        waitForTableAnswerVisualizationMode();
        drillDown('column', 'drill down', 'Commit Date', 'vietnam');
        waitForElement('.bk-boxed-token:contains(by commit date)');
        expect(sageInputElement().val()).toBe('sum order total price air vietnam by commit date');
        expect(element(TABLE_COLUMN_HEADER + ' .slick-column-name').text()).toBe('Commit DateOrder Total Price');
        expect(element(TABLE_COLUMN_HEADER + ' .chosen-single').text()).toBe('MONTHLYTOTAL');
    });

    it('should test exclude from chart', function() {
        sageInputElement().enter('count supplier city by supplier nation sort by supplier nation');
        waitForTableAnswerVisualizationMode();
        selectViz('column');
        drillDown('chart', 'exclude', null, 'brazil', 3);
    });

    // TODO(Shitong): enable drill down tests
    xit('should test exclude from column', function() {
        sageInputElement().enter('count supplier city by supplier nation sort by supplier nation');
        waitForTableAnswerVisualizationMode();
        drillDown('column', 'exclude', null, 'brazil');
    });

    xit('should test only show from column', function() {
        sageInputElement().enter('customer phone discount sort by customer phone');
        waitForTableAnswerVisualizationMode();
        drillDown('column', 'only show', null, '10-103-996-8780');
        expect(sageInputElement().val()).toBe('customer phone discount sort by customer phone 10-103-996-8780');
    });

    xit('should test underlying data from column', function() {
        sageInputElement().enter('top 5 customer city ranked by supply cost');
        waitForSageBarDropdown();
        selectFromSageDropdown('top5');
        waitForTableAnswerVisualizationMode();
        drillDown('column', 'underlying data', null, 'indonesia9');
        expect(element('.slick-header-column:eq(2)').text()).toBe('Customer City');
        expect(element('.slick-header-column:eq(3)').text()).toBe('Supply Cost');
    });
});
