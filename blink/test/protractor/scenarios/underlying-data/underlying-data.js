/**
 * Copyright Thoughtspot Inc. 2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

'use strict';

var common = require('../common');

var selectors = {
    LEAF_LEVEL_DATA: '.bk-leaf-level-data'
};

selectors.COLUMN_NAME = common.util.joinSelectors(selectors.LEAF_LEVEL_DATA, '.column-name');
selectors.UNDERLYING_COLUMN_NAME = common.util.joinSelectors(selectors.LEAF_LEVEL_DATA, '.slick-column-name');

function waitForSummaryColumns(count) {
    common.util.waitForElementCountToBe(selectors.COLUMN_NAME, count);
}

function verifySummaryColumnName(idx, name) {
    var el = $$(selectors.COLUMN_NAME).get(idx);
    expect(el.getText()).toBe(name);
}

function waitForUnderlyingDataColumns(count) {
    common.util.waitForElementCountToBe(selectors.UNDERLYING_COLUMN_NAME, count);
}

function verifyUnderlyingDataColumnName(idx, name) {
    var el = $$(selectors.UNDERLYING_COLUMN_NAME).get(idx);
    expect(el.getText()).toBe(name);
}

module.exports = {
    waitForSummaryColumns: waitForSummaryColumns,
    verifyUnderlyingDataColumnName: verifyUnderlyingDataColumnName,
    waitForUnderlyingDataColumns: waitForUnderlyingDataColumns,
    verifySummaryColumnName: verifySummaryColumnName
};
