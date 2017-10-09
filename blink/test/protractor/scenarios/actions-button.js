/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Chabbey Francois (francois.chabbeym@thoughtspot.com)
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var common = require('./common.js');
var util = common.util;

var selectors= {
        HEADLINE_VALUE: '.bk-headline-value',
        ACTION_BUTTON: '.bk-secondary-button',
        ACTION_BUTTON_DROPDOWN: '.bk-action-button-dropdown',
        ACTION_BUTTON_ON_EDIT:'.page-content .bk-button-icon-text .bk-icons.bk-style-icon-triangle-solid',
        ACTION_BUTTON_DROPDOWN_ITEM: '.bk-action-dropdown .bk-dropdown-item',
        UPDATE_BTN: 'bk-dropdown-item.bk-action-update',
        IN_PROGRESS: '.bk-button-wrapper .bk-action-progress .bk-in-progress'
    },
    locators = {
        ACTION_BUTTON: by.css(selectors.ACTION_BUTTON),
        ACTION_BUTTON_DROPDOWN: by.css(selectors.ACTION_BUTTON_DROPDOWN),
        ACTION_BUTTON_ON_EDIT: by.css(selectors.ACTION_BUTTON_ON_EDIT),
        UPDATE_BTN: by.css(selectors.UPDATE_BTN),
        ACTION_BUTTON_DROPDOWN_ITEM: by.css(selectors.ACTION_BUTTON_DROPDOWN_ITEM)

    },
    actionLabels = {
        ADD_FILTERS: 'Add Filters',
        COPY_LINK: 'Copy link',
        CREATE_WORKSHEET: 'Create worksheet',
        IMPORT_DATA: 'Upload data',
        IMPORT_SCHEMA: 'Upload schema',
        MAKE_A_COPY: 'Make a copy',
        REPLAY_SEARCH: 'Replay search',
        RESET_LAYOUT: 'Reset layout',
        SAVE: 'Save',
        SHARE: 'Share',
        SAVE_AS_WORKSHEET: 'Save as worksheet',
        VIEW_SCHEDULES: 'Manage schedules',
        VIEW_SCHEMA: 'View schema',
        DOWNLOAD_AS_CSV: 'Download as CSV',
        DOWNLOAD_AS_PDF: 'Download as PDF',
        DOWNLOAD_AS_XLSX: 'Download as XLSX',
        UPDATE: 'Update',
        AUTO_ANALYSE: 'Auto Analyze',
        CUSTOM_ANALYSE: 'Custom Analyze'
    };

function openAndGetMenuItemLocator(actionLabel, containerSelector) {
    var dropdownSelector = !!containerSelector
        ? common.util.joinSelectors(containerSelector, selectors.ACTION_BUTTON_DROPDOWN)
        : selectors.ACTION_BUTTON_DROPDOWN;
    util.waitForAndClick(dropdownSelector);
    return by.cssContainingText(selectors.ACTION_BUTTON_DROPDOWN_ITEM, actionLabel);
}

function openAndGetMenuItemLocatorOnEditpop(actionLabel, containerSelector) {
    var dropdownSelector = !!containerSelector
        ? common.util.joinSelectors(containerSelector, selectors.ACTION_BUTTON_ON_EDIT)
        : selectors.ACTION_BUTTON_ON_EDIT;
    util.waitForAndClick(dropdownSelector);
    return by.cssContainingText(selectors.ACTION_BUTTON_DROPDOWN_ITEM, actionLabel);
}
module.exports = {
    selectors: selectors,
    locators: locators,
    actionLabels: actionLabels,
    openAndGetMenuItemLocatorOnEditpop: openAndGetMenuItemLocatorOnEditpop,
    selectActionButtonAction: function (actionLabel, containerSelector) {
        var menuItemLocator = openAndGetMenuItemLocator(actionLabel, containerSelector);
        return util.waitForAndClick(menuItemLocator);
    },
    checkIfButtonIsEnabled: function(actionLabel) {
        var menuItemLocator = openAndGetMenuItemLocator(actionLabel);
        expect(element(menuItemLocator).getAttribute('class')).not.toMatch('bk-dropdown-item-disabled');
    },
    checkIfButtonIsDisabled: function(actionLabel, containerSelector) {
        var menuItemLocator = openAndGetMenuItemLocator(actionLabel, containerSelector);
        expect(element(menuItemLocator).getAttribute('class')).toMatch('bk-dropdown-item-disabled');
    },
    waitForBusyActionToComplete: function() {
        common.util.waitForElementToNotBePresent(selectors.IN_PROGRESS);
    }
};
