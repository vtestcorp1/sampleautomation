/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var actions = require('../actions-button.js');
var blinkList = require ('../list/blink-list.js');
var uiSelect = require('../libs/ui-select');

var util = common.util;

var EC = protractor.ExpectedConditions;

var selectors = {
    ADD_USER_BODY: '.bk-add-users-body',
    PERMISSION_LIST_DROPDOWN: '.bk-permission-type-drop-down',
    SHARE_ICON: '.bk-style-icon-share',
    SHARE_DIALOG: '.bk-share-dialog',
    PANEL_DIALOG_HEADER: '.modal-header',
    CLOSE_DIALOG: '.bk-close',
    DELETE_PERMISSION: '.bk-delete-row-btn',
    PERMISSION_LIST: '.bk-permission-list',
    PERMISSION_ITEM: '.bk-permission-viewer',
    SHARE_DIALOG_ADD_USER_SELECT: '.bk-share-dialog .bk-add-users .ui-select-search',
    PRINCIPAL_ROW_IN_SHARE_PANEL: '.bk-permission-principal',
    DONE_BTN: '.bk-done-btn',
    ADD_BTN: '.bk-add-permissions-btn',
    SHARE_COLUMN_OPTIONS: '.bk-column-option',
    SHARE_COLUMNS: '.bk-share-columns li',
    SHARE_TYPE: '.ui-select-choices-row',
    PRINCIPAL_NAME: '.bk-name',
    PRINCIPAL_DISPLAY_NAME: '.bk-display-name'

};

selectors.PERMISSION_LIST_ITEM = util.joinSelectors(selectors.PERMISSION_LIST, 'ul li');
selectors.NEW_PERMISSION_DROPDOWN = util.joinSelectors(
    selectors.ADD_USER_BODY,
    selectors.PERMISSION_LIST_DROPDOWN
);

var sharePermissions = {
    CAN_VIEW: 'Can View',
    CAN_EDIT: 'Can Edit'
};

var locators = {
    CLOSE_DIALOG: by.css(selectors.SHARE_DIALOG + ' ' + selectors.CLOSE_DIALOG),
    DONE_BUTTON: by.css(selectors.SHARE_DIALOG + ' ' + selectors.DONE_BTN),
    PERMISSION_ITEMS: by.css(
        util.joinSelectors(selectors.SHARE_DIALOG, selectors.PERMISSION_LIST_ITEM)),
    ADD_PERMISSION_BUTTON: by.css(selectors.SHARE_DIALOG + ' ' + selectors.ADD_BTN),
    ADD_USER_HEADER: by.css(selectors.SHARE_DIALOG + ' .bk-add-users-header'),
    ENTIRE_TABLE_BUTTON: by.cssContainingText(selectors.SHARE_COLUMN_OPTIONS, 'Entire Table'),
    SPECIFIC_COLUMNS_BUTTON: by.cssContainingText(selectors.SHARE_COLUMN_OPTIONS, 'Specific Columns')
};

function clickShareButton() {
    $(selectors.SHARE_ICON).click();
}

function clickAddUserHeader() {
    util.scrollElementIntoViewPort(element(locators.ADD_USER_HEADER));
    element(locators.ADD_USER_HEADER).click();
}

function permissionWithPrincipal(principalName) {
    return element.all(
        by.cssContainingText(
            selectors.PRINCIPAL_ROW_IN_SHARE_PANEL,
            principalName
        )
    );
}

function getColumnElement(columnName) {
    return element(by.cssContainingText(selectors.SHARE_COLUMNS, columnName));
}

function clickAddPermissionButton() {
    util.waitForAndClick(locators.ADD_PERMISSION_BUTTON);
}

function clickDoneButton() {
    util.waitForAndClick(locators.DONE_BUTTON);
}

function openSharePanel(itemName) {
    util.waitForVisibilityOf('.bk-actionable-list');
    blinkList.checkItems('.bk-actionable-list', [itemName]);
    clickShareButton();
    util.waitForElement(selectors.SHARE_DIALOG);
    clickAddUserHeader();
}

function selectPrincipalsInSharePanel(userNames, readOnly) {
    var VIEW_PERMISSION_TYPE = (readOnly ? sharePermissions.CAN_VIEW  : sharePermissions.CAN_EDIT);

    userNames.forEach(function(userName){
        common.metadataItemSelector.selectOption(selectors.SHARE_DIALOG, userName);
    });
    common.metadataItemSelector.clickOnSingleOption(selectors.NEW_PERMISSION_DROPDOWN);

    var el = $(selectors.ADD_USER_BODY);
    browser.wait(EC.visibilityOf(el));
    el = element(by.cssContainingText(selectors.SHARE_TYPE, VIEW_PERMISSION_TYPE));
    el.click();
    // for hiding the dropdownx`
    $(selectors.PANEL_DIALOG_HEADER).click();
    clickAddPermissionButton();
    clickDoneButton();
    return util.expectAndDismissSuccessNotif();
}

function removePrincipalInPanel(principalName) {
    var permission = element(by.cssContainingText(selectors.PERMISSION_ITEM, principalName));
    util.waitForVisibilityOf(permission);
    var permission = permission.element(by.css(selectors.DELETE_PERMISSION));
    permission.click();
}

function closeSharePanel() {
    element(locators.CLOSE_DIALOG).click();
}

function getPermissionType(principalName) {
    var containerSelector = util.joinSelectors(selectors.SHARE_DIALOG, selectors.PERMISSION_LIST);
    var container = element(by.cssContainingText(containerSelector, principalName));
    return uiSelect.getSelectionText(container);
}

function selectColumnOption() {
    util.waitForAndClick(locators.SPECIFIC_COLUMNS_BUTTON);
}
function clickOnColumn(columnName) {
    return util.waitForAndClick(getColumnElement(columnName));
}

module.exports = {
    closeSharePanel: closeSharePanel,
    clickAddUserHeader: clickAddUserHeader,
    clickOnColumn: clickOnColumn,
    selectColumnOption: selectColumnOption,
    getPermissionType: getPermissionType,
    openSharePanel: openSharePanel,
    permissionWithPrincipal: permissionWithPrincipal,
    removePrincipal: removePrincipalInPanel,
    selectPrincipalsInSharePanel: selectPrincipalsInSharePanel,
    selectors: selectors,
    sharePermissions: sharePermissions
};
