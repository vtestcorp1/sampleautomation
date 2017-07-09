/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: ashish shubham (ashish@thoughtspot.com)
 *
 * @fileoverview exclude scenarios
 */
'use strict';

var answerPage = require('../viz-layout/answer/answer');
var table = require('../table/table');
var charts = require('../charts/charts');
var contextMenu = require('./context-menu-po');
var sage = require('../sage/sage');
var common = require('../common');

describe('Exclude on context menu', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
    });

    it('[SMOKE][IE] should be able to exclude a customer region', function () {
        answerPage.doAdhocQuery(
            'revenue by customer region',
            ['LINEORDER', 'CUSTOMER'],
            charts.vizTypes.TABLE
        );

        table.waitForTableRowCountToBe(null, 5);
        contextMenu.showContextMenuForTableCell( 'asia');

        element(contextMenu.locators.EXCLUDE_SUBMENU_OPTION).click();
        sage.sageInputElement.waitForValueToBe('revenue by customer region customer region != asia');
        table.waitForTableRowCountToBe(null, 4);
    });

    it('SCAL-5669 should be able to exclude one value, go back/fwd and exclude another', function () {
        answerPage.doAdhocQuery('revenue by customer region', ['LINEORDER', 'CUSTOMER'], charts.vizTypes.TABLE);

        contextMenu.showContextMenuForTableCell( 'asia');

        element(contextMenu.locators.EXCLUDE_SUBMENU_OPTION).click();
        sage.sageInputElement.waitForValueToBe('revenue by customer region customer region != asia');
        table.waitForTableRowCountToBe(null, 4);

        browser.navigate().back();

        sage.sageInputElement.waitForValueToBe('revenue by customer region');
        table.waitForTableRowCountToBe(null, 5);
        contextMenu.showContextMenuForTableCell( 'europe');

        element(contextMenu.locators.EXCLUDE_SUBMENU_OPTION).click();
        sage.sageInputElement.waitForValueToBe('revenue by customer region customer region != europe');
        table.waitForTableRowCountToBe(null, 4);

        browser.navigate().back();
        sage.sageInputElement.waitForValueToBe('revenue by customer region');
        table.waitForTableRowCountToBe(null, 5);

        browser.navigate().forward();
        sage.sageInputElement.waitForValueToBe('revenue by customer region customer region != europe');
        table.waitForTableRowCountToBe(null, 4);

        contextMenu.showContextMenuForTableCell( 'asia');
        element(contextMenu.locators.EXCLUDE_SUBMENU_OPTION).click();
        sage.sageInputElement.waitForValueToBe('revenue by customer region customer region != europe customer region != asia');

        table.waitForTableRowCountToBe(null, 3);
    });

    it('should allow exclusion on queries with multiple grouping columns: SCAL-11780', function(){
        answerPage.doAdhocQuery('revenue customer region market segment', ['LINEORDER', 'CUSTOMER'], charts.vizTypes.TABLE);

        contextMenu.showContextMenuForTableCell('automobile');
        element(contextMenu.locators.EXCLUDE_SUBMENU_OPTION).click();
        sage.sageInputElement.waitForValueToBe('revenue customer region market segment market segment != automobile');
    });
});
