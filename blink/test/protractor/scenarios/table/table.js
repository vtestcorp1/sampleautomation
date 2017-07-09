/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 * Author: Lucky Odisetti (lucky@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var util = common.util;
var actions = require('../actions-button');

var selectors = {
    VIZ: '.bk-viz',
    TABLE_HIDDEN: '.bk-table.ng-hide',
    TABLE_VIZ: '.bk-viz-table',
    TABLE_GRID: '.bk-table .slick-viewport',
    COLUMN_HEADER: '.bk-table .slick-header-column',
    SLICK_COLUMN: '.bk-table .slick-header-column',
    SLICK_COLUMN_NAME: '.bk-table .slick-header-column .slick-column-name',
    TABLE_SELECTOR_BUTTON: '.bk-table-type-selector-container',
    TABLE_ROW: '.slick-row',
    DOWNLOAD_MORE_SELECTOR: '.bk-table .bk-link',
    TABLE_DOWNLOADING_INDICATOR: '.bk-loading-indicator',
    TABLE_CELL:'.slick-cell',
    CELL_LINK: '.slick-cell a',
    TABLE_CELL_CONTENT: '.slick-cell-content',
    TABLE_HEADER_MENU_BTN: '.bk-table-header-menu-btn',
    TABLE_HEADER_CHOSEN_MENU: '.bk-table-header-chosen-menu',
    TABLE_COLUMN_MENU: '.bk-table-column-menu',
    ACTION_MENU_DROPDOWN_ITEM: '.bk-dropdown-item',
    TABLE_HEADER_ITEM: '.bk-tab-header .tab-header-item',
    LEAF_LEVEL_DATA_CONTAINER: '.bk-leaf-data-table-container',
    TABLE_HEADER_SORT_INDICATOR_ASC: '.slick-sort-indicator-asc',
    TABLE_HEADER_SORT_INDICATOR_DESC: '.slick-sort-indicator-desc'
};

selectors.LEAF_LEVEL_DATA_ROW_SELECTOR = common.util.joinSelectors(
    selectors.LEAF_LEVEL_DATA_CONTAINER,
    '.slick-viewport .slick-row'
);

var locators = {
    VIZ: by.css(selectors.VIZ),
    TABLE_VIZ: by.css(selectors.TABLE_VIZ),
    TABLE_GRID: by.css(selectors.TABLE_GRID),
    COLUMN_HEADER: by.css(selectors.COLUMN_HEADER),
    SLICK_COLUMN: by.css(selectors.SLICK_COLUMN),
    SLICK_COLUMN_NAME: by.css(selectors.SLICK_COLUMN_NAME),
    TABLE_SELECTOR_BUTTON: by.css(selectors.TABLE_SELECTOR_BUTTON),
    TABLE_HEADER_CHOSEN_MENU: by.css(selectors.TABLE_HEADER_CHOSEN_MENU)
};

var tabs = {
    METRICS: 'Conditional Formatting',
    FILTERS: 'Filters'
};

function resizeColumn(incrementWidthBy){
    var $elem = $($('.slick-resizable-handle').get(0));
    var pageX = $elem.offset().left;

    var dragStartEvent = new $.Event('dragstart');
    dragStartEvent.pageX = pageX;

    var dragEvent = new $.Event('drag');
    dragEvent.pageX = pageX + incrementWidthBy;

    $elem.trigger(dragStartEvent);
    $elem.trigger(dragEvent);
    $elem.trigger('dragend');
}

function verifyTableHidden() {
    var tableElement = element(by.css(selectors.TABLE_HIDDEN));
    expect(tableElement.isPresent()).toBeTruthy();
}

function waitForTable() {
    return util.waitForElementCountToBe(locators.TABLE_VIZ, 1);
}

function waitForTableColumn(rootElement, colName) {
    rootElement = rootElement || element(locators.TABLE_VIZ);
    var locator = rootElement.element(common.util.contains(selectors.SLICK_COLUMN_NAME, colName));
    return util.waitForElement(locator);
}

function waitForTableColumnAtIndex(index, colName, rootElement) {
    rootElement = rootElement || element(locators.TABLE_VIZ);
    util.waitForElement(rootElement.element(locators.SLICK_COLUMN_NAME));
    var elementAtIndex = rootElement.all(locators.SLICK_COLUMN_NAME).get(index);
    return util.waitForTextToBePresentInElement(elementAtIndex, colName);
}

function waitForTableColumnCountToBe(rootElement, count) {
    rootElement = rootElement || element(locators.TABLE_VIZ);
    var locator = locators.SLICK_COLUMN_NAME;
    common.util.waitForChildElementCountToBe(rootElement, locator, count);
}

function waitForTableRowCountToBe(rootElement, count) {
    rootElement = rootElement || element(locators.TABLE_VIZ);
    return common.util.waitForChildElementCountToBe(rootElement, selectors.TABLE_ROW, count);
}

function getNthCell(rowNumber, colNumber, rootElement) {
    rootElement = rootElement || $(selectors.TABLE_VIZ);
    var row = rootElement.all(by.css(selectors.TABLE_ROW)).get(rowNumber);
    return row.all(by.css(selectors.TABLE_CELL)).get(colNumber);
}
function reorderTableColumns(column, finalY) {
    column = column || $(selectors.COLUMN_HEADER);
    if(!!finalY.constructor &&
        finalY.constructor.name === 'ElementFinder') {
        var targetColumn = finalY;
        return browser.actions().dragAndDrop(column, targetColumn)
            .mouseUp().perform();
    }
    return util.dragAndDrop(column, finalY, 0);
}

function downloadTableCSV() {
    return actions.selectActionButtonAction(actions.actionLabels.DOWNLOAD_AS_CSV);
}

function downloadTablePDF() {
    return actions.selectActionButtonAction(actions.actionLabels.DOWNLOAD_AS_PDF);
}

function downloadTableXLSX() {
    return actions.selectActionButtonAction(actions.actionLabels.DOWNLOAD_AS_XLSX);
}

function clickDownloadMore() {
    util.scrollElementToBottom($(selectors.TABLE_GRID));
    util.waitForAndClick(selectors.DOWNLOAD_MORE_SELECTOR);
}

function getColumnHeader(title) {
    return element(by.cssContainingText(selectors.COLUMN_HEADER, title));
}

function getTableHeaderMenuBtn(title) {
    return getColumnHeader(title).element(by.css(selectors.TABLE_HEADER_MENU_BTN));
}

function getNthHeader(index) {
    return $$(selectors.COLUMN_HEADER).get(index);
}

function isColumnSorted(index, ascending) {
    var parentElement = getNthHeader(index);
    var descendingIndicators = parentElement.all(by.css(selectors.TABLE_HEADER_SORT_INDICATOR_DESC));
    var ascendingIndicators = parentElement.all(by.css(selectors.TABLE_HEADER_SORT_INDICATOR_ASC));

    if (ascending) {
        expect(ascendingIndicators.count()).toBe(1);
        expect(descendingIndicators.count()).toBe(0);
    } else {
        expect(ascendingIndicators.count()).toBe(0);
        expect(descendingIndicators.count()).toBe(1);
    }
}

function getNthHeaderContaining(text, index) {
    if (index === void 0) {
        index = 0;
    }
    return element.all(by.cssContainingText(selectors.COLUMN_HEADER, text)).get(index);
}

function openTableHeaderMenu(title) {
    common.util.waitForElement(getTableHeaderMenuBtn(title));
    getTableHeaderMenuBtn(title).click();
}

function verifyTableHeader(index, text) {
    var slickColumnNames = element.all(locators.SLICK_COLUMN_NAME);
    var item = slickColumnNames.get(index);
    common.util.scrollElementIntoViewPort(item);
    expect(item.getText()).toBe(text);
}

function verifyTableHeaders(tableHeaders) {
    tableHeaders.forEach(function(text, index) {
        verifyTableHeader(index, text);
    });
}

function verifyTableSubHeader(index, text) {
    var slickColumnMenuDropDowns = element.all(locators.TABLE_HEADER_CHOSEN_MENU);
    var item = slickColumnMenuDropDowns.get(index);
    common.util.scrollElementIntoViewPort(item);
    expect(item.getText()).toBe(text);
}

function verifyTableSubHeaders(tableSubHeaders) {
    if (tableSubHeaders) {
        tableSubHeaders.forEach(function(text, index) {
            verifyTableSubHeader(index, text);
        });
    }
}

function getColumnMenuButton(columnName) {
    var parentElement = element(by.cssContainingText(selectors.COLUMN_HEADER, columnName));
    return parentElement.$(selectors.TABLE_HEADER_MENU_BTN)
}

function openColumnMenu(columnName) {
    getColumnMenuButton(columnName).click();
}

function chooseColumnMenuItem(itemName) {
    util.waitForAndClick(by.cssContainingText(
        common.util.joinSelectors(
            selectors.TABLE_COLUMN_MENU,
            selectors.ACTION_MENU_DROPDOWN_ITEM
        ),
        itemName
    ));
}

function waitForTextToBePresentInCell(row, column, text) {
    util.waitForTextToBePresentInElement($$(selectors.TABLE_ROW).get(row)
        .all(by.css(selectors.TABLE_CELL)).get(column), text);
}

module.exports = {
    selectors: selectors,
    locators: locators,
    getColumnMenuButton: getColumnMenuButton,
    isColumnSorted: isColumnSorted,
    verifyTableHidden: verifyTableHidden,
    openColumnMenu: openColumnMenu,
    chooseColumnMenuItem: chooseColumnMenuItem,
    resizeColumn: resizeColumn,
    waitForTable: waitForTable,
    waitForTableColumn: waitForTableColumn,
    waitForTableColumnAtIndex: waitForTableColumnAtIndex,
    waitForTableColumnCountToBe: waitForTableColumnCountToBe,
    waitForTableRowCountToBe: waitForTableRowCountToBe,
    reorderTableColumns: reorderTableColumns,
    downloadTableCSV: downloadTableCSV,
    downloadTablePDF: downloadTablePDF,
    downloadTableXLSX: downloadTableXLSX,
    clickDownloadMore: clickDownloadMore,
    getNthHeaderContaining: getNthHeaderContaining,
    getNthCell: getNthCell,
    getNthHeader: getNthHeader,
    getTableHeaderMenuBtn: getTableHeaderMenuBtn,
    openTableHeaderMenu: openTableHeaderMenu,
    verifyTableHeaders: verifyTableHeaders,
    verifyTableSubHeaders: verifyTableSubHeaders,
    waitForTextToBePresentInCell: waitForTextToBePresentInCell
};
