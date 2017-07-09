/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around searching for column by name
 * // TODO(Shitong): merge with left panel tests
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test column search: ', function() {
    beforeEach(function() {
        deselectAllTableSources();
        goToAnswer();
        sageDataSourceItem('LINEORDER').click();
        sageDataPanelFunctions.openSource('LINEORDER');
        sageDataSourceItem('CUSTOMER').click();
        sageDataPanelFunctions.openSource('CUSTOMER');
        sageDataSourceItem('DATE').click();
        sageDataPanelFunctions.openSource('DATE');
        sageDataSourceItem('PART').click();
        sageDataPanelFunctions.openSource('PART');
        sageDataSourceItem('SUPPLIER').click();
        sageDataPanelFunctions.openSource('SUPPLIER');
    });

    it('should test column name selection: key', function() {
        input('colPanel.searchText').enter('key');
        checkColSearch(8, ['customercustkey', 'datekey', 'lineordercustkey', 'lineorderpartkey', 'lineordersuppkey', 'orderkey', 'partpartkey', 'suppliersuppkey']);
    });
});
