/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var util = common.util;
var bootstrap = require('../../libs/bootstrap-lib');
var tooltip = bootstrap.tooltip;
var filterPanel = require('../../filters/filter-panel');


var selectors = {
    SOURCE_PANEL: '.bk-sources-popover',
    SOURCES_PANEL_HEADER: '.bk-sage-data .bk-header-container',
    SOURCE_ITEM_CHECKBOX: '.bk-checkbox',
    IMPORTED_SOURCE_ITEM: '.bk-sage-data .bk-manage-sources .bk-list:contains(Imported Data) .bk-list-item',
    WORKSHEET_SOURCE_ITEM: '.bk-sage-data .bk-manage-sources .bk-list:contains(Worksheets) .bk-list-item',
    TABLES_SOURCE_ITEM: '.bk-sage-data .bk-manage-sources .bk-list:contains(Tables) .bk-list-item',
    REMOVE_SOURCES_CONFIRMATION_POPUP: '.bk-auto-popup',
    ADD_SOURCES_POPOVER: '.bk-add-sources-popover',
    DATA_SOURCE_CONTAINER: '.bk-columns-body-section',
    DATA_LIST: '.bk-list',
    DATA_SCOPE_SEARCH_INPUT: '.bk-data-scope .bk-search-input',
    DATA_SOURCE_ITEM: '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item',
    DATA_SOURCE_DISABLED_ITEM: '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item.bk-disabled',
    DATA_SOURCE_ITEM_NAME: '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-source-name',
    DATA_SOURCE_COLUMN_ITEM: '.bk-source-item .bk-columns-list .bk-column-item',
    DATA_SOURCE_COLUMN_ITEM_NAME: '.bk-source-item .bk-columns-list .bk-column-item .bk-label.bk-column-name',
    DATA_SOURCE_ITEM_CLICKABLE: '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-columns-list .bk-list-item .bk-clickable',
    DATA_SOURCE_TYPES: '.bk-list-header',
    DATA_COLUMN_SRC_ITEM: '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-columns-list .bk-list-item .bk-column-name',
    DATA_COLUMN_SRC_TABLE_ITEM:'.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-columns-list .bk-column-item .bk-source-name',
    DATA_COLUMN_ITEM_MENU: '.bk-sage-data-column-menu',
    DATA_ADD_COLUMN_BTN:'.bk-sage-data-columns .bk-add-columns-btn',
    CHECKMARK_ICON: '.bk-style-icon-checkmark',
    REMOVE_COLUMN_ICON: '.bk-style-icon-x',
    SAGE_BUTTON: '.bk-sage-data .bk-sources-container .bk-manage-sources .bk-secondary-button .bk-text',
    DISABLED_SAGE_BUTTON: '.bk-sage-data .bk-sources-container .bk-manage-sources' +
        ' .bk-secondary-button.bk-disabled-button',
    NO_DATA_SOURCE_WARNING: '.right-pane .bk-no-data-sources',
    DATA_SOURCE_ITEM_BY_ID: '.bk-list-item[test-hook-table-id="{1}"]',
    SELECTED_DATA_SCOPE_SOURCE_ITEM: '.bk-data-scope .bk-list-item.bk-selected'
};

selectors.SOURCE_ITEM = util.joinSelectors(selectors.SOURCE_PANEL, '.bk-list-item');

selectors.CHECKED_TABLE_DATA_SOURCES = util.joinSelectors(
    selectors.SOURCE_ITEM,
    selectors.SOURCE_ITEM_CHECKBOX + '.bk-checked'
);

var locators = {
    CHOOSE_SOURCES_LOCATOR: by.css('.bk-choose-sources-btn'),
    ALL_FILTER_LOCATOR: by.cssContainingText(
        '.bk-manage-sources .bk-sources-popover .left-pane .bk-filter', 'All'),
    SELECT_FILTER_LOCATOR: by.cssContainingText(
        '.bk-manage-sources .bk-sources-popover .left-pane .bk-filter', 'Selected'),
    SELECT_ALL_CHECKBOX_LOCATOR: by.css(
        '.bk-manage-sources .bk-sources-popover .bk-select-all .bk-checkbox'),
    DONE_BTN: by.cssContainingText('.bk-secondary-button', 'Done'),
    TABLES_LOCATOR: by.cssContainingText('.bk-list-header', 'Tables'),
    WORKSHEETS_LOCATOR: by.cssContainingText('.bk-list-header', 'Worksheets'),
    OK_BTN: by.cssContainingText('.bk-save-btn', 'OK'),
    EXPLORE_ALL_BTN: by.cssContainingText(selectors.SAGE_BUTTON, 'Explore all data'),
    DISABLED_EXPLORE_ALL_BTN: by.cssContainingText(selectors.DISABLED_SAGE_BUTTON, 'Explore all data')
};

var sourceTypeToSelector = {
    IMPORTED: selectors.IMPORTED_SOURCE_ITEM,
    WKS: selectors.WORKSHEET_SOURCE_ITEM,
    TABLES: selectors.TABLES_SOURCE_ITEM
};

function ensureCheckMark(columnName) {
    util.waitForElement(
        element(by.cssContainingText(selectors.DATA_SOURCE_COLUMN_ITEM, columnName))
            .$(selectors.CHECKMARK_ICON)
    );
}

function ensureNoCheckMark(columnName) {
    util.waitForInvisibilityOf(
        element(by.cssContainingText(selectors.DATA_SOURCE_COLUMN_ITEM, columnName))
            .$(selectors.CHECKMARK_ICON)
    );
}

function addColumn(columnName) {
    var el = element(by.cssContainingText(selectors.DATA_SOURCE_COLUMN_ITEM_NAME, columnName));
    util.waitForVisibilityOf(el);
    return browser.actions()
        .doubleClick(el)
        .perform();
}

function removeColumn(columnName) {
    var closeButton = element(by.cssContainingText(selectors.DATA_SOURCE_COLUMN_ITEM, columnName))
        .$(selectors.REMOVE_COLUMN_ICON);
    util.mouseMoveToElement(closeButton);
    return closeButton.click();
}


function expectColumnSampleValuesTooltipToContainValue(columnName, value) {
    var el = element(by.cssContainingText(selectors.DATA_SOURCE_ITEM_CLICKABLE, columnName));
    util.mouseMoveToElement(el);
    tooltip.waitForToolTipContainingText(value);
}

function expectColumnsListElementsCountToBe(sourceName, count) {
    var elements = element.all(by.cssContainingText(selectors.DATA_SOURCE_ITEM, sourceName));
    var a = elements.first().all(by.tagName(selectors.DATA_SOURCE_COLUMN_ITEM));
    expect(a.count()).toBe(count);
}

function toggleSourceItemElementSelection(sourceItemElement, endResultChecked) {
    util.waitForVisibilityOf(sourceItemElement);
    util.hasAnyClass(sourceItemElement.element(by.css(selectors.SOURCE_ITEM_CHECKBOX)),
        ['bk-checked']).then((isChecked) => {
            if(!!isChecked != endResultChecked) {
                sourceItemElement.click();
            }
        });
}

function waitForLeftPanelSourcesCount(count) {
    return util.waitForElementCountToBe(selectors.DATA_SOURCE_ITEM, count);
}

function waitForNonZeroLeftPanelSources() {
    return util.waitForElement(selectors.DATA_SOURCE_ITEM);
}

module.exports = {
    selectors: selectors,
    locators: locators,
    openChooseSourcesDialog: function () {
        util.waitForAndClick(this.locators.CHOOSE_SOURCES_LOCATOR);
        util.waitForVisibilityOf(selectors.SOURCE_PANEL);
    },
    waitForVisibilityOfSourcePanel: function() {
        util.waitForVisibilityOf(selectors.SOURCE_ITEM);
    },
    waitForInvisibilityOfSourcePanel: function() {
        util.waitForInvisibilityOf(selectors.SOURCE_ITEM);
    },
    selectAllCheckbox: function() {
        util.waitForAndClick(this.locators.ALL_FILTER_LOCATOR);
        util.waitForElement(this.locators.SELECT_ALL_CHECKBOX_LOCATOR);
    },
    getSelectAllCheckbox: function () {
        return element(this.locators.SELECT_ALL_CHECKBOX_LOCATOR);
    },

    clickDone: function () {
        return element(this.locators.DONE_BTN).click();
    },
    sageDataSourceSelectedItemElement: function(text, listType) {
        if (!text) {
            text = '';
        }
        var el = this.sageDataSourceItemElement(text, listType);
        return el.all(by.css('.bk-checkbox-container.bk-checked'));
    },
    sageDataSourceItemElement: function(text, listType) {
        var listElement = element.all(by.cssContainingText(this.selectors.DATA_LIST, listType || 'Tables'));
        var baseElement = listElement.all(by.cssContainingText('.bk-list-item', text));
        return baseElement;
    },
    deselectAllSources: function () {
        var self = this;
        self.openChooseSourcesDialog();
        self.selectAllCheckbox();
        var selectAllCheckbox = self.getSelectAllCheckbox();
        return util.hasAnyClass(selectAllCheckbox, ['bk-checked', 'bk-indeterminate']).then(function (has) {
            if (has) {
                var clickPromise = selectAllCheckbox.click();
                if ($(self.selectors.REMOVE_SOURCES_CONFIRMATION_POPUP).isPresent()) {
                    // if "OK" is present but not clickable for some reason, we still want
                    // to proceed and don't want .click() to fail. To achieve this we just
                    // give it empty onError handler.
                    return element(self.locators.OK_BTN).click().then(
                        function () {}, function () {}
                    );
                } else {
                    return clickPromise;
                }
            }
        });
    },

    expectSelectedSourcesCount: function(count) {
        util.waitForElementCountToBe(selectors.CHECKED_TABLE_DATA_SOURCES, count);
    },
    selectAllSources: function () {
        var self = this;
        return self.deselectAllSources().then(function () {
            self.selectAllCheckbox();
            return self.getSelectAllCheckbox().click();
        });
    },
    deselectSource: function(sourceName) {
        $(this.selectors.DATA_SCOPE_SEARCH_INPUT).sendKeys(sourceName);
        var sourceItemElement = element(
            by.cssContainingText(this.selectors.SOURCE_ITEM,
                sourceName));
        toggleSourceItemElementSelection(sourceItemElement, false);
        return $(this.selectors.DATA_SCOPE_SEARCH_INPUT).clear();
    },
    deselectSourceById: function(sourceId) {
        var sourceItemElement = element(
            by.css(this.selectors.DATA_SOURCE_ITEM_BY_ID.replace('{1}', sourceId)));
        toggleSourceItemElementSelection(sourceItemElement, false);
        var d = protractor.promise.defer();
        d.fulfill(true);
        return d;
    },
    selectSource: function(sourceName) {
        $(this.selectors.DATA_SCOPE_SEARCH_INPUT).sendKeys(sourceName);
        var sourceItemElement = element(
            by.cssContainingText(this.selectors.SOURCE_ITEM,
                sourceName));
        toggleSourceItemElementSelection(sourceItemElement, true);
        return $(this.selectors.DATA_SCOPE_SEARCH_INPUT).clear();
    },
    selectSourceById: function(sourceId) {
        var sourceItemElement = element(
            by.css(this.selectors.DATA_SOURCE_ITEM_BY_ID.replace('{1}', sourceId)));
        toggleSourceItemElementSelection(sourceItemElement, true);
        var d = protractor.promise.defer();
        d.fulfill(true);
        return d;
    },
    selectSourcesByIds: function(sourceIds) {
        var d = null;
        var self = this;
        sourceIds.forEach(function(sourceId) {
            if (d === null) {
                d = self.selectSourceById(sourceId);
            } else {
                d = d.then(function() {
                    return self.selectSourceById(sourceId);
                })
            }
            return d;
        })
    },
    openAndChooseSources: function(sourceNamesToSelect, sourceNamesToDeselect) {
        sourceNamesToSelect = sourceNamesToSelect || [];
        sourceNamesToDeselect = sourceNamesToDeselect || [];
        this.openChooseSourcesDialog();
        var d = null;
        if (sourceNamesToSelect.length + sourceNamesToDeselect.length === 0) {
            d = protractor.promise.defer();
            d.fulfill(true);
            return d;
        }
        var self = this;
        element(this.locators.ALL_FILTER_LOCATOR).click();

        sourceNamesToSelect.forEach(function(sourceName) {
            if (d === null) {
                d = self.selectSource(sourceName);
            } else {
                d = d.then(function () {
                    return self.selectSource(sourceName);
                });
            }
        });

        sourceNamesToDeselect.forEach(function(sourceName) {
            if (d === null) {
                d = self.deselectSource(sourceName);
            } else {
                d = d.then(function () {
                    return self.deselectSource(sourceName);
                });
            }
        });
        return d;
    },

    selectAllWorksheets: function () {
        var self = this;
        return self.deselectAllSources().then(function () {
            return element(
                self.locators.WORKSHEETS_LOCATOR
            ).element(by.xpath('..')).all(by.css('ul li .bk-checkbox')).click();
        }).then(self.clickDone.bind(self));
    },
    selectAllTables: function () {
        var self = this;
        return self.deselectAllSources().then(function () {
            return element(
                self.locators.TABLES_LOCATOR
            ).element(by.xpath('..')).all(by.css('ul li .bk-checkbox')).click();
        }).then(self.clickDone.bind(self));
    },
    cancelSourceRemoval: function() {
        element(common.util.locators.AUTO_POPUP_CANCEL_BUTTON).click();
    },
    clickOnSourceAlertPopup: function(){
        element(common.util.locators.AUTO_POPUP_HEADER).click();
    },
    waitForVisibilityOfWarningPopup: function(panelShouldBeVisible) {
        if (panelShouldBeVisible) {
            util.waitForVisibilityOf(util.locators.AUTO_POPUP);
        } else {
            util.waitForElementToNotBePresent(util.locators.AUTO_POPUP);
        }
    },
    closePanel: function() {
        util.waitForAndClick(selectors.SOURCES_PANEL_HEADER);
    },
    confirmSourceRemoval: function() {
        element(common.util.locators.AUTO_POPUP_OK_BUTTON).click();
    },
    expandSource: function(sourceName) {
        return element(by.cssContainingText(selectors.DATA_SOURCE_ITEM, sourceName)).click();
    },
    enabledSource: function(sourceName) {
        return element(by.cssContainingText(selectors.DATA_SOURCE_ITEM, sourceName));
    },
    disabledSource: function(sourceName) {
        return element(by.cssContainingText(selectors.DATA_SOURCE_DISABLED_ITEM, sourceName));
    },
    waitForEnabledSource: function(sourceName) {
        util.waitForVisibilityOf(this.enabledSource(sourceName));
    },
    waitForDisabledSource: function(sourceName) {
        util.waitForVisibilityOf(this.disabledSource(sourceName));
    },
    openFilter: function(columnName) {
        var column = element(by.cssContainingText(selectors.DATA_SOURCE_COLUMN_ITEM_NAME, columnName)).
            element(by.xpath('..'));
        util.waitForVisibilityOf(column);
        util.mouseMoveToElement(by.cssContainingText(selectors.DATA_SOURCE_COLUMN_ITEM_NAME, columnName));
        util.waitForAndClick(column.element(by.css(filterPanel.selectors.FILTER_ICON)));
    },
    expectExploreDatasButtonToBeDisabled: function() {
        util.waitForElementCountToBe(locators.DISABLED_EXPLORE_ALL_BTN, 1);
    },
    expectExploreDatasButtonToBeEnabled: function() {
        util.waitForElementCountToBe(locators.EXPLORE_ALL_BTN, 1);
        util.waitForElementCountToBe(locators.DISABLED_EXPLORE_ALL_BTN, 0);
    },
    expectPanelToHaveWarning: function() {
        util.waitForElementCountToBe(selectors.NO_DATA_SOURCE_WARNING, 1);
    },
    expectPanelToHaveNoWarning: function(){
        util.waitForElementCountToBe(selectors.NO_DATA_SOURCE_WARNING, 0);
    },
    expectSelectSourcesPopoverToBeDisplayed: function() {
        util.waitForElementCountToBe(selectors.ADD_SOURCES_POPOVER, 1);
    },
    expectSelectSourcesPopoverToNotBeDisplayed: function() {
        util.waitForElementCountToBe(selectors.ADD_SOURCES_POPOVER, 0);
    },
    ensureCheckMark: ensureCheckMark,
    ensureNoCheckMark: ensureNoCheckMark,
    expectColumnSampleValuesTooltipToContainValue: expectColumnSampleValuesTooltipToContainValue,
    expectColumnsListElementsCountToBe: expectColumnsListElementsCountToBe,
    addColumn: addColumn,
    removeColumn: removeColumn,
    waitForLeftPanelSourcesCount: waitForLeftPanelSourcesCount,
    waitForNonZeroLeftPanelSources: waitForNonZeroLeftPanelSources
};
