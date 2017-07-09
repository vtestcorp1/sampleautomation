/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var common = require('../../common');
var util = common.util;
var table = require('../../table/table');

var selectors = {
    DEPENDENT_LINK: table.selectors.CELL_LINK,
    DEPENDENT_COLUMNS: '.slick-header-column .slick-column-name'
};

var locators = {
    COLUMN_NAME_COLUMN: by.cssContainingText(selectors.DEPENDENT_COLUMNS, 'Column Name')
};

function waitForDependentsCountToBe(count) {
    return util.waitForElementCountToBe(selectors.DEPENDENT_LINK, count);
}

function clickOnNameColumn(){
    return util.waitForAndClick(locators.COLUMN_NAME_COLUMN);
}

function clickOnDependentLink(dependantNameOrIndex) {
    if (dependantNameOrIndex.length === void 0) {
        return util.waitForAndClick(
            $$(selectors.DEPENDENT_LINK).get(dependantNameOrIndex))
    }
    return util.waitForAndClick(
        by.cssContainingText(selectors.DEPENDENT_LINK, dependantNameOrIndex));
}


module.exports = {
    selectors,
    clickOnDependentLink,
    clickOnNameColumn,
    waitForDependentsCountToBe
};
