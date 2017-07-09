/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');

var util = common.util;

var BULK_ACTION_CONTAINER = '.bk-smart-cb-bulk-action-container';
var SELECT_ALL = BULK_ACTION_CONTAINER + ' .bk-select-all-options';

function selectAll () {
    util.waitForAndClick(SELECT_ALL);
}

module.exports = {
    selectAll: selectAll
};
