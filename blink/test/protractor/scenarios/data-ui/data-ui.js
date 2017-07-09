/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var util = common.util;
var blinkListFunctions = require('../list/blink-list.js');
var share = require('../share/share-ui');
var uiSelect = require('../libs/ui-select');
var dialog = require('../dialog');


var functions = module.exports = (function () {
    var NEW_ITEM_ACTION = '.bk-action-dropdown .bk-dropdown-item';
    var FROM_A_COLUMN = 'From a column',
        SPECIFY_ISO_CODE = 'Specify ISO Code';

    var FROZEN_COLUMNS = 1;

    return {
        selectors: {
            EXPLORER: '.bk-explorer',
            ADD_RELATIONSHIP: '.bk-add-mode-btn',
            ADD_NEW_ITEM_BUTTON_SELECTOR: '.bk-action-button-dropdown',
            APPLY_STICKER_BUTTON: '.bk-action-item .bk-apply-label-btn',
            BULK_ACTIONS_PANEL: '.bk-list-bulk-actions',
            BK_VALUE: '.bk-value',
            CLOSE_EXPLORER_SELECTOR: '.view-all',
            DATA_UI_LIST: '.bk-actionable-list',
            DIALOG: '.bk-dialog',
            DESTINATION_TABLE_LIST: '.bk-select-destination-table .ui-select-choices-row-inner div',
            DESTINATION_TABLE_SELECT: '.bk-select-destination-table',
            EXPLORER_HEADER: '.bk-explorer-header',
            EXPLORER_TAB: '.mode-item',
            EXPLORER_SLICK_ROW: '.bk-explorer-table .slick-row',
            EXPLORER_TABLE: '.bk-explorer-table',
            COLUMN_SELECTOR: '.bk-select.bk-select-currency-column',
            ISO_CODE_SELECTOR: '.bk-select.bk-select-currency-iso-code',
            COLUMN_SELECTOR_OPTION: '.bk-select-body.bk-select-currency-column .bk-select-option',
            ISO_CODE_SELECTOR_OPTION: '.bk-select-body.bk-select-currency-iso-code .bk-select-option',
            PRIMARY_BUTTON: '.bk-primary-button',
            RADIO_LABEL: '.bk-radio-label',
            RELATIONSHIP_LIST: '.bk-relationship-list',
            SUCCESS_NOTIF: '.bk-alert.bk-alert-success',
            SAVE_BUTTON: '.explorer-header-btns .bk-primary-button:not(.bk-disabled)',
            SLICK_CELL: '.slick-cell',
            STICKER_CONTAINER: '.sticker-selector-container',
            STICKERS_LIST: '.bk-label-panel',
            STICKER_IN_LIST: '.bk-label-panel .bk-label.bk-clickable input',
            STICKER_LABEL: '.bk-list-container .bk-label-text',
            USERDATA_LINK_LOCATOR: '.bk-primary-nav-manage-data',
            VIEW_ALL_BTN: '.view-all .bk-button-wrapper',
            WIZARD: '.bk-wizard-workflow',
            SLICK_CELL_INPUT: '.editor-text',
            SUGGESTIONS: {
                TOTAL_COUNT: '.bk-analyze-total-count',
            },
            METADATA_EDIT_BTN: '.explorer-header-btns .bk-secondary-button',
            SLICK_CELL_EDITOR: '.slick-cell-editor',
            SLICK_CELL_DROPDOWN_EDITOR: '.bk-select-box .slick-cell-editor'
        },
        locators: {
            RLS_TAB: by.cssContainingText('.bk-explorer-header .mode-item', "Row security"),
            IMPORT_DATA_BTN: by.cssContainingText(NEW_ITEM_ACTION, 'Upload data'),
            UPLOAD_SCHEMA_BTN: by.cssContainingText(NEW_ITEM_ACTION, 'Upload schema'),
            METADATA_EDIT_BTN: by.cssContainingText('.explorer-header-btns .bk-secondary-button', 'Edit'),
            DISABLED_METADATA_EDIT_BTN: by.cssContainingText('.explorer-header-btns .bk-secondary-button .bk-disabled', 'Edit'),
            METADATA_LOAD_BTN: by.cssContainingText('.explorer-header-btns .bk-secondary-button', 'Load data')
        },
        closeExplorer: function () {
            $(this.selectors.CLOSE_EXPLORER_SELECTOR).click();
        },
        scrollToCell: function (column, row, numberOfFrozenColumns) {
            if (numberOfFrozenColumns === void 0) {
                numberOfFrozenColumns = 0;
            }
            var cell = this.getCellInTable(column, row);
            browser.executeScript(function () {
                arguments[0].scrollIntoView();
            }, cell.getWebElement());
        },
        goToImportData: function () {
            util.waitForAndClick(this.selectors.ADD_NEW_ITEM_BUTTON_SELECTOR);
            util.waitForAndClick(this.locators.IMPORT_DATA_BTN);
        },
        goToUploadSchema: function () {
            $(this.selectors.ADD_NEW_ITEM_BUTTON_SELECTOR).click();
            element(this.locators.UPLOAD_SCHEMA_BTN).click();
        },
        goToTableView: function () {
            $(this.selectors.VIEW_ALL_BTN).click();
        },
        goToDataUI: function () {
            return util.waitForAndClick(this.selectors.USERDATA_LINK_LOCATOR);
        },
        goToRelationshipView: function () {
            element(by.cssContainingText(
                this.selectors.EXPLORER_TAB, 'Relationships')).click();
        },
        goToDependentsView: function () {
            element(by.cssContainingText(
                this.selectors.EXPLORER_TAB, 'Dependents')).click();
        },
        goToProfileView: function () {
            element(by.cssContainingText(
                this.selectors.EXPLORER_TAB, 'Profile')).click();
        },
        goToDataView: function () {
            element(by.cssContainingText(
                this.selectors.EXPLORER_TAB, 'Data')).click();
        },
        goToTableByName: function (tablename) {
            this.goToDataUI();
            util.waitForElement(by.css('.bk-list'));
            blinkListFunctions.selectItemByName(this.selectors.DATA_UI_LIST, tablename);
            blinkListFunctions.clearSearchBox();
        },
        editSelectedItem: function () {
            return element(this.locators.METADATA_EDIT_BTN).click();
        },
        hoverOnEditButton: function () {
            util.mouseMoveToElement(element(this.locators.METADATA_EDIT_BTN));
        },
        loadDataOnSelectedItem: function () {
            element(this.locators.METADATA_LOAD_BTN).click();
            util.waitForElement(this.selectors.WIZARD);
        },
        deleteMetadataItems: function (names) {
            blinkListFunctions.deleteItemsByName(this.selectors.DATA_UI_LIST, names);
        },
        expectTableAsRelationshipTarget: function (tablename) {
            common.util.waitForAndClick(by.css(this.selectors.DESTINATION_TABLE_SELECT));
            common.util.waitForElement(by.css('.ui-select-choices'));
            expect(
                element(
                    by.cssContainingText(
                        this.selectors.DESTINATION_TABLE_LIST,
                        tablename
                    )).isPresent()).toBeTruthy();
        },

        getCellInColumnsView: function (columnName, fieldIndex) {

            function getRowIndex(selector, columnName) {
                var sel = selector + ':contains(' + columnName + ')';
                return $(sel).index();
            }

            var self = this;
            var rowIndex = browser.executeScript(getRowIndex, this.selectors.EXPLORER_SLICK_ROW, columnName);
            var rowSelector = '.bk-explorer-table .slick-pane-right .slick-viewport-top .slick-row';
            fieldIndex = fieldIndex - (FROZEN_COLUMNS);
            var cell = element.all(by.css(rowSelector)).get(rowIndex)
                .all(by.css(self.selectors.SLICK_CELL)).get(fieldIndex);
            return cell;

        },

        getCellInTable: function (columnIndex, rowIndex, numOfFrozenColumns) {

            if (numOfFrozenColumns === void 0) {
                numOfFrozenColumns = FROZEN_COLUMNS;
            }

            if (columnIndex < numOfFrozenColumns) {
                return element.all(by.css(this.selectors.EXPLORER_SLICK_ROW)).get(rowIndex)
                    .all(by.css(this.selectors.SLICK_CELL)).get(columnIndex);
            } else {
                var rowSelector = '.bk-explorer-table .slick-pane-right .slick-viewport-top .slick-row';
                columnIndex = columnIndex - (numOfFrozenColumns);
                return element.all(by.css(rowSelector)).get(rowIndex)
                    .all(by.css(this.selectors.SLICK_CELL)).get(columnIndex);
            }

        },

        // Change column type to either MEASURE or ATTRIBUTE
        setColumnType: function (columnName, type) {
            var cell = this.getCellInColumnsView(columnName, 3);
            cell.click();
            cell.element(by.tagName('a')).click();
            element(by.cssContainingText(this.selectors.UI_SELECT_OPTION, type)).click();
        },

        toggleAdditive: function (columnName) {
            var cell = this.getCellInColumnsView(columnName, 4);
            cell.click();
        },

        setAggregation: function (columnName, aggr) {
            var cell = this.getCellInColumnsView(columnName, 5);
            cell.click();
            cell.element(by.tagName('a')).click();
            element(by.cssContainingText(this.selectors.UI_SELECT_OPTION, aggr)).click();
        },
        setColumnFormatPattern: function (columnName, pattern) {
            var cell = this.getCellInColumnsView(columnName, 11);
            cell.click();
            cell.element(by.css(this.selectors.SLICK_CELL_INPUT))
                .clear()
                .sendKeys(pattern);
            // To enable the save button
            $(this.selectors.SAVE_BUTTON).click();
            this.saveChanges();
        },
        setColumnIndex: function (columnName, indexType) {
            var cell = this.getCellInColumnsView(columnName, 8);
            cell.click();
            $(this.selectors.SLICK_CELL_DROPDOWN_EDITOR).click();
            uiSelect.selectSingle($(this.selectors.SLICK_CELL_EDITOR), indexType, false);
        },

        setCurrencyTypeInfo: function (columnName, settingLabel, value) {
            var cell = this.getCellInColumnsView(columnName, 12);
            cell.click();
            dialog.waitForDialogPresent();
            var modalBody = $(dialog.selectors.DIALOG);
            element(by.cssContainingText(this.selectors.RADIO_LABEL, settingLabel)).click();
            if (settingLabel === FROM_A_COLUMN) {
                modalBody.element(by.css(this.selectors.COLUMN_SELECTOR)).click();
                // Note that dropdown items are not inside modal, they are inside body
                element(by.cssContainingText(this.selectors.COLUMN_SELECTOR_OPTION, value))
                    .click();
            } else if (settingLabel === SPECIFY_ISO_CODE) {
                modalBody.element(by.css(this.selectors.ISO_CODE_SELECTOR)).click();
                // Note that dropdown items are not inside modal, they are inside body
                element(by.cssContainingText(this.selectors.ISO_CODE_SELECTOR_OPTION, value))
                    .click();
            }
            dialog.clickPrimaryButton(true);
        },

        selectTable: function (tableName) {
            blinkListFunctions.checkItems(this.selectors.DATA_UI_LIST, tableName);
        },
        applyStickerToTable: function (stickerName, tableName) {
            this.selectTable(tableName);
            element(by.css(this.selectors.APPLY_STICKER_BUTTON)).click();
            this.clickOnStickers(stickerName);
        },
        saveChanges: function () {
            $(this.selectors.SAVE_BUTTON).click();
            util.waitForElement(this.selectors.SUCCESS_NOTIF);
        },

        /**
         *
         * @param stickerName
         * @param filtering {boolean} - if true, click occurs in filtering panel, if false, click occurs in the
         * select filiter panel
         */
        clickOnStickers: function (stickerName, filtering) {
            var selector = this.selectors.STICKER_IN_LIST;

            if (filtering) {
                element(by.css(this.selectors.STICKER_CONTAINER)).click();
            } else {
                selector = this.selectors.BULK_ACTIONS_PANEL + ' ' + selector;
            }

            common.util.waitForElement(this.selectors.STICKERS_LIST);
            selector = selector + '[name="' + stickerName + '"]';
            element(by.css(selector)).click();
        },
        removeStickersFromTable: function (stickerName, tableName) {
            blinkListFunctions.searchFor(this.selectors.DATA_UI_LIST, tableName);
            common.util.waitForElement(this.selectors.STICKER_LABEL);
            element(by.cssContainingText(this.selectors.STICKER_LABEL, stickerName))
                .element(by.xpath('following-sibling::span'))
                .click();
        },
        goToSuggestionsView: function () {
            element(by.cssContainingText(
                this.selectors.EXPLORER_TAB, 'Suggestions')).click();
        },
        getSuggestionsTotalCount: function () {
            common.util.waitForElement(this.selectors.SUGGESTIONS.TOTAL_COUNT);
            return element.all(by.css(this.selectors.SUGGESTIONS.TOTAL_COUNT));
        },
        shareTable: function (tablesToShare, userNames) {
            common.navigation.goToUserDataSection();
            tablesToShare.forEach(function (tableName) {
                blinkListFunctions.searchFor(' ', tableName);
                share.openSharePanel(tableName);
                share.selectPrincipalsInSharePanel(userNames, false);
            });
        }
    };
})();


