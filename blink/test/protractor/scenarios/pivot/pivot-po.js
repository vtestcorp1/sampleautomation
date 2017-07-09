/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Pivot Table page object
 */
'use strict';
var common = require('../common');
var util = common.util;

let selectors = {
    FIELD: '.dx-area-field.dx-area-box',
    PIVOT_TABLE: '.pivot-table',
    PIVOT_VERTICAL_HEADER_ROW: '.dx-pivotgrid-vertical-headers tr'
};

function dragRowFieldToColumnArea(rowFieldName) {
    let rowField = element(by.cssContainingText(selectors.FIELD, rowFieldName));
    util.dragAndDrop(rowField, 300, -50);
}

function waitForVerticalHeaderRowsCountToBe(count) {
    util.waitForElementCountToBe(selectors.PIVOT_VERTICAL_HEADER_ROW, count);
}

module.exports = {
    selectors,
    dragRowFieldToColumnArea,
    waitForVerticalHeaderRowsCountToBe
};
