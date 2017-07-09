/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * E2E tests for worksheet-viewer, list part
 *
 *
 **/

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../common.js');
var filter = require('../metadata-filter.js');
var schema = require('./schema-ui.js');
var util = common.util;

var CW_WORKSHEET_NAME = 'Container Worksheet';

var DEFAULT_OFFSET = {
    x: 15,
    y: 15
};

var DEFAULT_COLUMN_WIDTH = 300;
var DEFAULT_HEADER_HEIGHT = 40;
var DEFAULT_COLUMN_HEIGHT = 21;
describe('worksheet-viewer', function(){

    beforeEach(function(){
        schema.goToSchemaViewer();
        util.waitForVisibilityOf(schema.selectors.SEARCH_INPUT);
        $(schema.selectors.SEARCH_INPUT).sendKeys("Container Worksheet");
        util.waitForElementCountToBe(schema.selectors.LIST_ITEMS, 1);
        util.doubleClickElement($(schema.selectors.LIST_ITEMS));
    });

    afterEach(function(){
        element(by.css(schema.selectors.CLOSE_MODAL)).click();
    });

    afterAll(function(){
        common.navigation.goToAnswerSection();
    });

    it("should have all the columns", function() {
        // we have 3 canvases ( schema behind + schema overview + worksheet schema )
        expect(element.all(by.css(schema.selectors.DEFAULT_CANVAS)).count()).toBe(3);
        expect(element.all(by.css(schema.selectors.MODAL_LIST_ITEMS)).count()).toBe(11);
    });

    it("should filter on columns", function(){
        var keys = "Reve";
        element(by.css(schema.selectors.MODAL_SEARCH_INPUT)).sendKeys(keys);
        util.waitForElementCountToBe(schema.selectors.MODAL_LIST_ITEMS, 1);
        element(by.css(schema.selectors.MODAL_SEARCH_INPUT)).sendKeys(protractor.Key.BACK_SPACE);
        element(by.css(schema.selectors.MODAL_SEARCH_INPUT)).sendKeys(protractor.Key.BACK_SPACE);
        element(by.css(schema.selectors.MODAL_SEARCH_INPUT)).sendKeys(protractor.Key.BACK_SPACE);
        element(by.css(schema.selectors.MODAL_SEARCH_INPUT)).sendKeys(protractor.Key.BACK_SPACE);
        util.waitForElementCountToBe(schema.selectors.MODAL_LIST_ITEMS, 11);
    });

    it('[SMOKE][IE] should have a legend', function(){
        util.waitForElementCountToBe(schema.selectors.LEGEND, 2);
    });

    xit("should highlight the targeted column, when selecting a column", function(){
        schema.bringTableIntoViewPort(CW_WORKSHEET_NAME, true).then(function(){
            schema.doubleClickOnCoordinate(DEFAULT_OFFSET.x, DEFAULT_OFFSET.y);
        });

        var inputText = 'Line';
        var tableName = 'LINEORDER';

        var row = util.contains(schema.selectors.MODAL_LIST_ITEMS, inputText);
        element.all(row).first().click();

        var wkSheetCanvasSelector = schema.selectors.MODAL_SCHEMA_CANVAS;

        schema.forceScale().then(function() {
            return schema.moveViewPortToTableOrigin(tableName);
        })
            .then(function(){
                schema.checkForColorAtCoordinate(DEFAULT_OFFSET.x,
                DEFAULT_OFFSET.y,
                wkSheetCanvasSelector,
                schema.objectColors.TABLE);
                var y = DEFAULT_COLUMN_HEIGHT * 1.5 + DEFAULT_HEADER_HEIGHT + DEFAULT_OFFSET.y,
                    x = DEFAULT_COLUMN_WIDTH / 2;
                schema.checkForColorAtCoordinate(x, y, wkSheetCanvasSelector, schema.objectColors.TARGET_COLUMN);
            });
    });
});
