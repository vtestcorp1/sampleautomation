/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com), francois.chabbey (francois.chabbey@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var blinkCheckbox = common.blinkCheckbox;
var util = common.util;
var dialog = require('../dialog.js');
var blinkList = require('../list/blink-list.js');

var credentials = {
    ADMIN: {
        DISPLAY_NAME: 'Administrator',
        USERNAME: 'tsadmin',
        PASSWORD: 'admin'
    },
    GUEST: {
        DISPLAY_NAME: 'Guest',
        USERNAME: 'guest',
        PASSWORD: 'guest'
    }
};

var defaultGroups = {
    ADMIN : {
        name: 'Administrator',
        displayName: 'Administrator Group'
    }
};

var PRIVILEGES = [
    'Has administration privileges',
    'Can upload user data',
    'Can download data',
    'Can share with all users',
    'Can manage data',
    'Can schedule pinboards',
    'Can auto analyze'
];

var selectors = {
    ADD_USERS_BUTTON: '.bk-list-container .bk-action-container .bk-style-icon-users',
    DIALOG: '.bk-dialog',
    CANCEL_BTN_SELECTOR: '.bk-dialog .bk-secondary-button',
    CONFIRM_PASSWORD_SELECTOR: '[name="confirmPassword"]',
    DELETE_BTN_SELECTOR: '.bk-list-container .bk-action-container .bk-style-icon-delete',
    DISPLAYNAME_SELECTOR: '[name="displayName"]',
    EMAIL_SELECTOR: '[name="email"]',
    GROUP_PANEL_LIST_ITEM: '.bk-dialog .bk-tab-control .bk-checkbox-container',
    LEFT_PANEL: '.bk-admin-left-panel',
    LIST_ADMIN_ITEM: '.bk-list-content .bk-row-flex',
    LIST_ITEM: '.bk-list-content li',
    NAME_ROW_SELECTOR: '.bk-name',
    NEW_USER_BTN_SELECTOR: '.bk-add-user-button',
    NEW_ROLE_BTN_SELECTOR: '.bk-add-role-button',
    NEW_GROUP_BTN_SELECTOR: '.bk-add-group-button',
    PASSWORD_SELECTOR: '[name="password"]',
    PRIVILEGES_LIST_ITEM: '.bk-privileges-list .bk-checkbox-container',
    RIGHT_PANEL: '.bk-admin-right-panel',
    ROLEDESCRIPTION_SELECTOR: '[name="description"]',
    SAVE_BTN_SELECTOR: '.bk-dialog .bk-primary-button',
    TAB_HEADER: '.tab-navigation .bk-tab-header .tab-header-item',
    SELECT_ALL: '.bk-list-header .bk-checkbox-container',
    USERNAME_SELECTOR: '[name="name"]',
    CHECKBOX_FILTER: '.bk-checkbox-search input.bk-search-input',
    CHECKBOXES_PANEL: util.joinSelectors(dialog.selectors.DIALOG,
        '.bk-tab-control',
        blinkCheckbox.selectors.CONTAINER)
};

selectors.GROUPNAME_SELECTOR = selectors.USERNAME_SELECTOR;
selectors.GROUPDISPLAYNAME_SELECTOR = selectors.DISPLAYNAME_SELECTOR;
selectors.ROLENAME_SELECTOR = selectors.USERNAME_SELECTOR;
selectors.ROLEDISPLAYNAME_SELECTOR = selectors.DISPLAYNAME_SELECTOR;
selectors.CHECKBOX = '.bk-checkbox';
selectors.CHECKED_CHECKBOX= selectors.CHECKBOX + '.bk-checked';
selectors.CHECKBOX_CONTAINER = '.bk-checkbox-container';

var adminTabs = {
    USER_MANAGEMENT: 'User Management',
    DATA_MANAGEMENT: 'Data Management',
    SYSTEM_HEALTH: 'System Health',
    JOBS_MANAGEMENT: 'Jobs Management'
};


var locators = {
    CONFIRM_PASSWORD: by.css(selectors.CONFIRM_PASSWORD_SELECTOR),
    DELETE_BTN: by.css(selectors.DELETE_BTN_SELECTOR),
    DISPLAYNAME: by.css(selectors.DISPLAYNAME_SELECTOR),
    EMAIL: by.css(selectors.EMAIL_SELECTOR),
    GROUP_DISPLAYNAME: by.css(selectors.GROUPDISPLAYNAME_SELECTOR),
    GROUP_NAME: by.css(selectors.GROUPNAME_SELECTOR),
    GROUPS_TAB: by.cssContainingText('li', 'Manage Groups'),
    ROLES_TAB: by.cssContainingText('li', 'Manage Roles'),
    NEW_GROUP_BTN: by.css(selectors.NEW_GROUP_BTN_SELECTOR),
    NEW_USER_BTN: by.css(selectors.NEW_USER_BTN_SELECTOR),
    PASSWORD: by.css(selectors.PASSWORD_SELECTOR),
    ROLE_DISPLAYNAME: by.css(selectors.ROLEDISPLAYNAME_SELECTOR),
    ROLE_DESCRIPTION: by.css(selectors.ROLEDESCRIPTION_SELECTOR),
    ROLE_NAME: by.css(selectors.ROLENAME_SELECTOR),
    USERS_TAB: by.cssContainingText('li', 'Manage Users'),
    USERNAME: by.css(selectors.USERNAME_SELECTOR)
};

function goToStyleCustomizer() {
    var tabHeaderSelector = common.util.contains(
        common.tabs.selectors.TAB_HEADER_ITEM,
        'Style Customization'
    );
    return util.waitForAndClick(tabHeaderSelector);
}


function waitForListToDisplay(){
    return util.waitForElement(selectors.LIST_ITEM);
}

function openNewUserDialog() {
    element(locators.NEW_USER_BTN).click();
}

function openNewGroupDialog() {
    $(selectors.NEW_GROUP_BTN_SELECTOR).click();
}

function goTo(locator) {
    common.navigation.goToAdminSection();
    common.util.waitForElement(selectors.TAB_HEADER);
    element(locator).click();
    return waitForListToDisplay();
}

function goToGroupManagement() {
    var locator = (by.cssContainingText(selectors.TAB_HEADER, 'Groups'));
    return goTo(locator);
}

function goToUserManagement() {
    var locator = (by.cssContainingText(selectors.TAB_HEADER, 'Users'));
    return goTo(locator);
}

function goToRoleManagement() {
    var locator = (by.cssContainingText(selectors.TAB_HEADER, 'Roles'));
    return goTo(locator);
}

function goToJobManagement() {
    var locator = (by.cssContainingText(selectors.TAB_HEADER, 'Jobs Management'));
    return goTo(locator);
}

function save(dontWaitForDismissal) {
    dialog.clickPrimaryButton(!dontWaitForDismissal);
}
function enterName(name) {
    common.util.ensureCursorAtEnd(locators.USERNAME);
    element(locators.USERNAME).sendKeys(name);
}
function enterDisplayName(displayName) {
    common.util.ensureCursorAtEnd(locators.DISPLAYNAME);
    element(locators.DISPLAYNAME).sendKeys(displayName);
}

function enterGroupDisplayName(name) {
    common.util.ensureCursorAtEnd(locators.GROUP_DISPLAYNAME);
    element(locators.GROUP_DISPLAYNAME).sendKeys(name);
}
function enterGroupName(name) {
    common.util.ensureCursorAtEnd(locators.GROUP_NAME);
    element(locators.GROUP_NAME).sendKeys(name);
}

function enterRoleName(name) {
    element(locators.ROLE_NAME).sendKeys(name);
}
function enterRoleDisplayName(name) {
    element(locators.DISPLAYNAME).sendKeys(name);
}
function enterRoleDesscription(description) {
    element(locators.ROLE_DESCRIPTION).sendKeys(name);
}

function panelItemElement(panelSelector, elementName) {
    return element(by.cssContainingText(panelSelector, elementName));
}

function selectItemInPanel(panelSelector, elementName) {
    util.waitForAndClick(panelItemElement(panelSelector, elementName));
}

function selectGroupInUserPanel(groupName) {
    element(locators.GROUPS_TAB).click();
    selectItemInPanel(selectors.GROUP_PANEL_LIST_ITEM, groupName);
}

function selectGroupInGroupPanel(groupName) {
    element(locators.GROUPS_TAB).click();
    selectItemInPanel(selectors.GROUP_PANEL_LIST_ITEM, groupName);
}

function selectPrivilege(privilegeName) {
    element(by.cssContainingText(selectors.PRIVILEGES_LIST_ITEM, privilegeName))
            .$(selectors.CHECKBOX)
            .click();
}

function selectUserInGroupPanel(userName) {
    element(locators.USERS_TAB).click();
    selectItemInPanel(selectors.GROUP_PANEL_LIST_ITEM, userName);
}

function typeInSearchBox(filterText)
{
    $(selectors.CHECKBOX_FILTER).sendKeys(filterText);
}

function addNewGroup(groupName,
                     groupDisplayName,
                     privileges,
                     users,
                     filterUserText,
                     dontWaitForDismissal) {

    goToGroupManagement();
    openNewGroupDialog();

    common.util.waitForElement(selectors.DIALOG);

    enterGroupName(groupName);
    if (groupDisplayName) {
        enterGroupDisplayName(groupDisplayName);
    } else {
        enterGroupDisplayName(groupName);
    }
    if (privileges) {
        privileges.forEach(function(privilege) {
            selectPrivilege(privilege);
        });
    }
    if (users) {
        if (filterUserText) {
            typeInSearchBox(filterUserText);
        }
        users.forEach(function(user) {
            selectUserInGroupPanel(user);
        });
    }
    save(dontWaitForDismissal);
}

function addNewUser(displayName,
                    username,
                    password,
                    clickAddBtn,
                    dontConfirmPass,
                    email,
                    groups,
                    dontWaitForDismissal) {

    if (clickAddBtn) {
        goToUserManagement();
    }
    var confirmPass = password;
    if (!!dontConfirmPass) {
        confirmPass = '';
    }

    if (clickAddBtn) {
        openNewUserDialog();
    }

    common.util.waitForElement('.bk-dialog');

    element(locators.DISPLAYNAME).sendKeys(displayName);
    element(locators.USERNAME).sendKeys(username);
    element(locators.PASSWORD).sendKeys(password);
    element(locators.CONFIRM_PASSWORD).sendKeys(confirmPass);

    if (email) {
        element(locators.EMAIL).sendKeys(email);
    }

    if (groups) {
        groups.forEach(function(groupName) {
            selectGroupInUserPanel(groupName);
        });
    }
    save(dontWaitForDismissal);
}

function loginAsAdmin() {
    common.util.reLogin(credentials.ADMIN.USERNAME, credentials.ADMIN.PASSWORD);
}

function selectListItem(displayName) {
    return element(by.cssContainingText(selectors.LIST_ITEM, displayName))
        .$(selectors.CHECKBOX_CONTAINER).click();
}

function selectPrincipal(principalName) {
    element(by.cssContainingText(blinkList.selectors.METADATA_LIST_ITEMS, principalName))
        .$(selectors.NAME_ROW_SELECTOR).click();
}

function deleteListItem(displayName) {
    return blinkList.deleteItemsByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, [displayName]);
}

function deleteGroups(groupsName) {
    goToGroupManagement();
    deleteItems(groupsName);
}

function deleteUsers(usersName) {
    goToUserManagement();
    deleteItems(usersName);
}

function deleteItems(items) {
    items.forEach(function(name){
        deleteListItem(name);
    });
}

function checkForTab(tabName) {
    var el = element.all(by.cssContainingText(selectors.TAB_HEADER, tabName));
    expect(el.count()).toEqual(1);
}

function cancel() {
    dialog.clickSecondaryButton();
}

function checkIfCheckboxIsChecked(checkboxName, isChecked) {
    util.waitForElement(selectors.GROUP_PANEL_LIST_ITEM);
    if (isChecked) {
        blinkCheckbox.checkForCheckedBox(checkboxName);
    } else {
        blinkCheckbox.checkForUncheckedBox(checkboxName);
    }
}

function checkIfUserHasGroup(userName, groupName, mustHaveGroup) {
    blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, userName);
    util.waitForAndClick(locators.GROUPS_TAB);
    checkIfCheckboxIsChecked(groupName, mustHaveGroup);
    cancel();
}

function checkIfGroupHasUser(userName, groupName, mustHaveUser) {
    blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
    util.waitForAndClick(locators.USERS_TAB);
    checkIfCheckboxIsChecked(userName, mustHaveUser);
    cancel();
}
function checkIfGroupHasGroup(groupName, belongingGroup, mustHaveGroup) {
    blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, groupName);
    element(locators.GROUPS_TAB).click();
    checkIfCheckboxIsChecked(belongingGroup, mustHaveGroup);
    cancel();
}

function checkIfGroupHasPrivilege(privilegeName, mustHavePrivilege) {
    checkIfCheckboxIsChecked(privilegeName, mustHavePrivilege);
}

function clickOnBulkAddUserButton() {
    $(selectors.ADD_USERS_BUTTON).click();
}

function checkForLeftPanel(count) {
    var el = $$(selectors.LEFT_PANEL);
    expect(el.count()).toEqual(count);
}
function checkForRightPanel(count) {
    var el = element.all(by.css(selectors.RIGHT_PANEL));
    expect(el.count()).toEqual(count);
}

function selectAllUsers() {
    var selectAllCheckbox = selectors.SELECT_ALL;
    util.waitForAndClick(selectAllCheckbox);
}

module.exports = {
    addNewGroup: addNewGroup,
    addNewUser: addNewUser,
    adminTabs: adminTabs,
    checkForTab: checkForTab,
    checkIfUserHasGroup: checkIfUserHasGroup,
    checkIfGroupHasUser: checkIfGroupHasUser,
    checkIfGroupHasGroup: checkIfGroupHasGroup,
    checkIfGroupHasPrivilege: checkIfGroupHasPrivilege,
    checkForLeftPanel: checkForLeftPanel,
    checkForRightPanel: checkForRightPanel,
    clickOnBulkAddUserButton: clickOnBulkAddUserButton,
    credential: credentials,
    deleteGroups: deleteGroups,
    deleteUsers: deleteUsers,
    defaultGroups: defaultGroups,
    enterDisplayName: enterDisplayName,
    enterGroupDisplayName: enterGroupDisplayName,
    enterGroupName: enterGroupName,
    enterName: enterName,
    deleteListItem: deleteListItem,
    goToGroupManagement: goToGroupManagement,
    goToRolerManagement: goToRoleManagement,
    goToStyleCustomizer: goToStyleCustomizer,
    goToUserManagement: goToUserManagement,
    goToJobManagement: goToJobManagement,
    locators: locators,
    loginAsAdmin: loginAsAdmin,
    privileges: PRIVILEGES,
    openNewGroupDialog: openNewGroupDialog,
    openNewUserDialog: openNewUserDialog,
    save: save,
    selectAllUsers: selectAllUsers,
    selectGroupInGroupPanel: selectGroupInGroupPanel,
    selectGroupInUserPanel: selectGroupInUserPanel,
    selectors: selectors,
    selectPrincipal: selectPrincipal,
    selectPrivilege: selectPrivilege,
    selectUserInGroupPanel: selectUserInGroupPanel
};
