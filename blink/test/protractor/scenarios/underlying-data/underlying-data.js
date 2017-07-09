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

function waitForSummaryColumns(count) {
    common.util.waitForElementCountToBe(selectors.COLUMN_NAME, count);
}

function verifySummaryColumnName(idx, name) {
    var el = $$(selectors.COLUMN_NAME).get(idx);
    expect(el.getText()).toBe(name);
}

module.exports = {
    waitForSummaryColumns: waitForSummaryColumns,
    verifySummaryColumnName: verifySummaryColumnName
};
