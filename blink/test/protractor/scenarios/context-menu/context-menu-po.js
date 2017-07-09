/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: ashish shubham (ashish@thoughtspot.com)
 *
 * @fileoverview context-menu page object
 */
'use strict'

var common = require('../common');
var table = require('../table/table');
var util = common.util;

var selectors = {};
selectors.DROPDOWN = '.bk-context-menu';
selectors.SUBMENU_TITLE = '.context-sub-menu-title-container';
selectors.DISABLED_ITEM = '.bk-sub-menu-item-disabled';


var locators = {
    EXCLUDE_SUBMENU_OPTION: by.cssContainingText(
        util.joinSelectors(selectors.DROPDOWN, selectors.SUBMENU_TITLE),
        'Exclude'
    ),
    UNDERLYING_DATA_OPTION: by.cssContainingText(
        util.joinSelectors(selectors.DROPDOWN, selectors.SUBMENU_TITLE),
        'Show underlying data'
    ),
    COPY: by.cssContainingText(
        util.joinSelectors(selectors.DROPDOWN, selectors.SUBMENU_TITLE),
        'Copy to clipboard'
    ),
    DRILL_DOWN: by.cssContainingText(
        util.joinSelectors(selectors.DROPDOWN, selectors.SUBMENU_TITLE),
        'Drill down'
    ),
    AUTO_ANALYZE: by.cssContainingText(
        util.joinSelectors(selectors.DROPDOWN, selectors.SUBMENU_TITLE),
        'Auto Analyze'
    ),
    CUSTOM_ANALYZE: by.cssContainingText(
        util.joinSelectors(selectors.DROPDOWN, selectors.SUBMENU_TITLE),
        'Custom Analyze'
    )
};

function expectItemToBeDisabled(itemName) {
    return util.waitForElement(
        by.cssContainingText(
            util.joinSelectors(
                selectors.DROPDOWN,
                selectors.DISABLED_ITEM,
                selectors.SUBMENU_TITLE
            ),
            itemName
        )
    );
}

function showContextMenuForTableCell(cellText) {
    var cellLocator = by.cssContainingText(table.selectors.TABLE_CELL, cellText);
    var cellElement = element(cellLocator);
    cellElement.click();
    util.rightClickElement(cellElement);
    util.waitForElement(selectors.DROPDOWN);
}

function waitForContextMenu() {
    return util.waitForElement($(selectors.DROPDOWN));
}

module.exports = {
    selectors,
    locators,
    showContextMenuForTableCell,
    expectItemToBeDisabled,
    waitForContextMenu: waitForContextMenu
};
