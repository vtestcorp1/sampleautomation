/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (vibhor@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving worksheets
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Worksheet operations', function () {
    it('should show no sources tooltip when no sources are available', function () {
        var source = 'TEST1';
        dataTab().click();
        element(ACTION_BUTTON_DROPDOWN).click();
        createNewWorksheetBtn().click();

        testForNoSourcesTootlip(true);

        selectSourcesByName([source]);
        testForNoSourcesTootlip(false);
    });

    it('should disable/enable save button with name collision [SCAL-12912]', function(){
        var lineOrderSource = 'LINEORDER',
            revenueColumn = 'Revenue',
            discountColumn = 'Discount';

        worksheetFunctions.openCreateWorksheet();
        worksheetFunctions.selectSources([lineOrderSource]);

        worksheetFunctions.openSource(lineOrderSource);
        worksheetFunctions.addColumn(lineOrderSource, revenueColumn);
        worksheetFunctions.addColumn(lineOrderSource, discountColumn);
        worksheetFunctions.waitForColumn(revenueColumn);
        worksheetFunctions.closeSource(lineOrderSource);
        sharableItemPanelFunction.expectSaveUntitledButtonToBeActive(false);
        worksheetFunctions.renameColumn(discountColumn, revenueColumn);
        sharableItemPanelFunction.expectSaveUntitledButtonToBeActive(false);
        worksheetFunctions.renameColumn(revenueColumn, discountColumn);
        sharableItemPanelFunction.expectSaveUntitledButtonToBeActive(false);
    });

    it('should be able to update the description of a worksheet [SCAL-13360]', function(){
        var WS_NAME = '[SCAL-13360]',
            WS_DESCRIPTION = 'Should be set: SCAL-13360';

        createSimpleWorksheet({
            title: WS_NAME,
            sources: ['CUSTOMER', 'LINEORDER']
        });

        sharableItemPanelFunction.setDescription(WS_DESCRIPTION);
        expect(sharableItemPanelFunction.getDescription()).toBe(WS_DESCRIPTION);
        saveBtn().click();
        expect(sharableItemPanelFunction.getDescription()).toBe(WS_DESCRIPTION);

        deleteWorksheet(WS_NAME);
    });
});
