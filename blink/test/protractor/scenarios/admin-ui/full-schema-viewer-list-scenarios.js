/**
 * Copyright: ThoughtSpot Inc. 2016
 *
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * E2E test for full-schema-viewer. Filtering part
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */


var common = require('../common.js');
var filter = require('../metadata-filter.js');
var schema = require('./schema-ui.js');
var dataUI = require('../data-ui/data-ui.js');
var tooltip = require('../libs/bootstrap-lib').tooltip;

var util = common.util;

//FIXME(chab) failing because of SCAL-19167
xdescribe('Full-Schema Viewer filtering', function(){

    var ROWS_TO_CHECK = 10;

    var selectors = {
        LIST_ITEMS: '.schema-navigation-row',
        DATA_TYPE: '.data-type',
        SEARCH_INPUT: '.sidebar .bk-search-input',
        SIDEBAR_HEADER: '.sidebar .header',
        CONTENT: '.content'
    };

    var constants = filter.constants;

    beforeEach(function(){
        schema.goToSchemaViewer();
        filter.filterOnType(constants.everyone);
        filter.filterOnType(constants.all);
        scrollListToTop();
    });

    afterEach(function(){
        common.navigation.goToUserDataSection();
    });

    it('[SMOKE] should filter on table type', function() {
        checkFilterType(constants.tableFilter, constants.table);
        checkFilterType(constants.worksheetFilter, constants.worksheet);
    });

    xit('should filter on input', function(){
        common.util.waitForVisibilityOf(selectors.SEARCH_INPUT);
        $(selectors.SEARCH_INPUT).sendKeys("CUSTOMER");
        util.waitForElement(selectors.LIST_ITEMS);
        expect($$(selectors.LIST_ITEMS).count()).toBe(1);
    });

    it('[SMOKE] should filter on author', function() {
        filter.filterOnType(constants.table);
        filter.filterOnType(constants.you);
        util.waitForElementCountToBe(selectors.LIST_ITEMS, 2);
        filter.filterOnType(constants.everyone);
    });

    it('should filter on stickers', function(){
        dataUI.clickOnStickers('try me', true);
        expect($$(selectors.LIST_ITEMS).count()).toBe(0);
        common.navigation.goToUserDataSection();
        dataUI.clickOnStickers('try me', true);
        dataUI.applyStickerToTable('try me', ['LINEORDER']);
        schema.goToSchemaViewer();
        dataUI.clickOnStickers('try me', true);
        expect($$(selectors.LIST_ITEMS).count()).toBe(1);
        common.navigation.goToUserDataSection();
        dataUI.removeStickersFromTable('try me', 'LINEORDER');
        schema.goToSchemaViewer();
        // filter panel has state, so we remove it
        dataUI.clickOnStickers('try me', true);
    });

    it('should show correct tooltip', function(){
        $(selectors.SEARCH_INPUT).sendKeys("CUSTOMER");
        util.waitForElementCountToBe(selectors.LIST_ITEMS, 1);
        util.mouseMoveToElement(selectors.LIST_ITEMS);
        tooltip.waitForToolTipContainingText('TPCH5K');
    });

    function scrollListToTop() {
        var el = $(selectors.CONTENT);
        util.scrollListToTop(el);
    }

    function checkFilterType(type, expectedText) {
        scrollListToTop();
        var dataTypeSelector = util.joinSelectors(selectors.LIST_ITEMS, selectors.DATA_TYPE);
        // getText only return text if the element is visible, so we limit ourselves
        // to the tenth first element
        filter.filterOnType(type);
        $$(dataTypeSelector).each(function(element) {
            // Note(chab) i tried to wait for the list to be rendered, but it does not work
            // it seems that there are still some stale elements, so we discard them in the
            // loop
            element.isPresent().then(function(present) {
                if (present) {
                    util.scrollElementIntoViewPort(element);
                    var text = element.getWebElement().getInnerHtml();
                    expect(text).toBe(expectedText);
                }
            });
        });
    }
});
