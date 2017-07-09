/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * E2E tests for full-schema-viewer, schema part
 *
 * Look at schema-ui.js for more informations on how we test the diagram
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../common.js');
var filter = require('../metadata-filter.js');
var action = require('../actions-button.js');
var schema = require('./schema-ui.js');
var dataUI = require('../data-ui/data-ui.js');


var CUSTOMER_TABLE_NAME = 'CUSTOMER';
var DATE_TABLE_NAME = 'DATE';
var CW_WORKSHEET_NAME = 'Container Worksheet';

var DEFAULT_OFFSET = {
    x: 5,
    y: 5
};

var SOMEWHERE_IN_THE_PAGE = {
    x: 600,
    y :600
};

xdescribe('full-schema viewer', function(){

    beforeEach(function(){
        schema.goToSchemaViewer();
    });

    afterEach(function(){
        element(by.css(schema.selectors.SIDEBAR_HEADER)).click();
    });

    it('should use the right color for worksheet', function() {
        checkTableForColor(CW_WORKSHEET_NAME, schema.objectColors.WORKSHEET);
    });

    it('should use the right color for table', function() {
        checkTableForColor(CUSTOMER_TABLE_NAME, schema.objectColors.TABLE);
    });

    it('double-clicking on a table should do nothing', function(){
        schema.bringTableIntoViewPort(CUSTOMER_TABLE_NAME, false).then(function(){
            return schema.getTableCoordinate(CUSTOMER_TABLE_NAME, true);
        }).then(function(position){
            var x = position.x, y = position.y;
            return schema.doubleClickOnCoordinate(x + DEFAULT_OFFSET.x, y + DEFAULT_OFFSET.y);
        }).then(function(){
            expect(element.all(by.css(schema.selectors.SCHEMA_CANVAS)).count()).toBe(1);
        });
    });

    it('clicking on a table should select it on the navigation list', function() {
        schema.bringTableIntoViewPort(DATE_TABLE_NAME, true).then(function(){
            schema.clickOnCoordinate(SOMEWHERE_IN_THE_PAGE.x, SOMEWHERE_IN_THE_PAGE.y);
            schema.clickOnTable(DATE_TABLE_NAME);
            expect(element.all(by.css(schema.selectors.LIST_ITEMS_SELECTED)).count()).toBe(1);
            var row = common.util.contains(schema.selectors.LIST_ITEMS_SELECTED, DATE_TABLE_NAME);
            expect(element.all(row).count()).toBe(1);

        });
    });

    it('clicking on a worksheet should select it on the navigation list', function() {
        schema.bringTableIntoViewPort(CW_WORKSHEET_NAME, true).then(function(){
            schema.clickOnCoordinate(SOMEWHERE_IN_THE_PAGE.x, SOMEWHERE_IN_THE_PAGE.y);
            schema.clickOnTable(CW_WORKSHEET_NAME);
            expect(element.all(by.css(schema.selectors.LIST_ITEMS_SELECTED)).count()).toBe(1);
            var row = common.util.contains(schema.selectors.LIST_ITEMS_SELECTED, CW_WORKSHEET_NAME);
            expect(element.all(row).count()).toBe(1);
        });
    });

    it('double-clicking on a worksheet should open the worksheet-viewer', function(){
        schema.bringTableIntoViewPort(CW_WORKSHEET_NAME, true).then(function(){
            schema.doubleClickOnCoordinate(DEFAULT_OFFSET.x, DEFAULT_OFFSET.y);
            expect(element.all(by.css(schema.selectors.SCHEMA_CANVAS)).count()).toBe(2);
            expect(element.all(by.css(schema.selectors.MODAL_SCHEMA_CANVAS)).count()).toBe(1);
            //close the modal viewer
            element(by.css(schema.selectors.CLOSE_MODAL)).click();
            expect(element.all(by.css(schema.selectors.SCHEMA_CANVAS)).count()).toBe(1);
            expect(element.all(by.css(schema.selectors.MODAL_SCHEMA_CANVAS)).count()).toBe(0);
        });
    });

    /**
     *
     * @param table_name {string}
     * @param expectedColor {Array<string>}
     */
    function checkTableForColor(tableName, expectedColor) {

        //TODO(chab) try to not move the table to top origin
        return schema.bringTableIntoViewPort(tableName, true).then(function() {
            return schema.getTableCoordinate(tableName, true);
        }).then(function(position) {
            return schema.fetchColorAtCoordinate(
                position.x + DEFAULT_OFFSET.x,
                position.y + DEFAULT_OFFSET.y,
                schema.selectors.SCHEMA_CANVAS
            );
        }).then(function(color) {
            var red =   color[0],
                green = color[1],
                blue =  color[2];
            expect(red).toBe(parseInt(expectedColor[0],16));
            expect(green).toBe(parseInt(expectedColor[1],16));
            expect(blue).toBe(parseInt(expectedColor[2],16));

        });
    }
});
