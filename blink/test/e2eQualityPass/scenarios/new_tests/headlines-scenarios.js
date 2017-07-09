/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around answer headlines
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test headlines: ', function() {
    beforeEach(function() {
        answerTab().click();
        selectSageSources(TPCH_TABLES);
    });

    it('should test date headlines', function() {
        sageDataPanelFunctions.openSource('DATE');
        sageDataPanelFunctions.addColumn('Datekey');
        sleep(1);
        checkHeadlines('Monthly (Datekey)', 'date');
    });

    it('should test attribute headlines', function() {
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.addColumn('Customer Name');
        checkHeadlines('Customer Name', 'attribute');
    });

    it('should test measure headlines', function() {
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataPanelFunctions.addColumn('Quantity');
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataPanelFunctions.addColumn('Customer Name');
        waitForTableAnswerVisualizationMode();
        checkSimpleHeadlines([
            {
                hv: '127K',
                hc: 'Quantity'
            },
            {
                hv: '1.18K',
                hc: 'Customer Name'
            }
        ]);
    });
});
