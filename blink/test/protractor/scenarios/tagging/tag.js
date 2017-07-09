/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E test API for tags.
 */

'use strict';

var common = require('../common.js');
var blinkList = require('../list/blink-list');
var dataUI = require('../data-ui/data-ui');
var dialog = require('../dialog');
var util = common.util;
var checkbox = common.blinkCheckbox;

var selectors = {
    ACTION_ITEM_LABEL_CONTAINER: '.bk-action-container',
    ACTION_ITEM_LABEL_PANEL: '.bk-action-container .bk-label-panel',
    ADD_NEW_ITEM_LINK: '.bk-add-new-item a',
    ADD_NEW_ITEM_INPUT: '.bk-add-new-item input',
    DELETE_LABEL: '.bk-delete',
    LABEL: '.bk-label',
    LABEL_EDIT_ICON: '.bk-style-icon-edit-small',
    LIST_LABEL: '.bk-list-label',
    SELECTED_LABEL: '.top-list-filters .selected-label',
    TAGGED_LABEL: '.bk-tagged-label',
    TOP_MENU_LABEL_PANEL:'.top-list-filters .bk-label-panel'
};

selectors.TOP_MENU_LABEL_PANEL_LINK = util.joinSelectors(selectors.TOP_MENU_LABEL_PANEL, 'a');

function topMenuLabelSelector(labelName) {
    return util.hasName(util.joinSelectors(selectors.TOP_MENU_LABEL_PANEL, selectors.LABEL), labelName);
}

function actionItemLabelSelector(labelName) {
    return util.hasName(util.joinSelectors(selectors.ACTION_ITEM_LABEL_PANEL, selectors.LABEL), labelName);
}

function listItemSelector(itemName) {
    return by.cssContainingText(blinkList.selectors.METADATA_LIST_ITEMS, itemName);
}

function taggedLabelSelector(labelName) {
    return by.cssContainingText(selectors.TAGGED_LABEL, labelName);
}

function clickLabelFilter(labelName) {
    util.waitForAndClick(topMenuLabelSelector(labelName));
}

function verifyLabelExists(labelName) {
    util.waitForElementCountToBe(topMenuLabelSelector(labelName), 1);
}

function verifyLabelDoesNotExist(labelName) {
    util.waitForElementCountToBe(topMenuLabelSelector(labelName), 0);
}

function addLabel(labelName) {
    showLabelPanel();
    util.waitForAndClick(util.joinSelectors(selectors.TOP_MENU_LABEL_PANEL,
        selectors.ADD_NEW_ITEM_LINK));

    element(by.css(selectors.ADD_NEW_ITEM_INPUT)).sendKeys(labelName);
    element(by.css(selectors.ADD_NEW_ITEM_INPUT)).sendKeys(protractor.Key.ENTER);
    util.expectAndDismissSuccessNotif();
}

function showLabelPanel() {
    element(by.css(selectors.TOP_MENU_LABEL_PANEL)).isDisplayed().then(function(isVisible) {
        if (isVisible) {
            return;
        }
        return util.waitForAndClick(selectors.SELECTED_LABEL);
    });
    util.waitForVisibilityOf(selectors.TOP_MENU_LABEL_PANEL);
}

function deleteLabel(labelName) {
    showLabelPanel();
    var el = $(topMenuLabelSelector(labelName));
    var label = el.element(by.xpath('./../../../..'));
    util.mouseMoveToElement(label);
    util.waitForAndClick(label.element(by.css(selectors.LABEL_EDIT_ICON)));
    util.waitForAndClick(label.element(by.cssContainingText(selectors.TOP_MENU_LABEL_PANEL_LINK, 'Remove sticker')));
    dialog.confirmAsync();
    dialog.waitForDialogAbsent();
}

function editLabelColor(labelName) {
    var el = $(topMenuLabelSelector(labelName));
    var label = el.element(by.xpath('./../../../..'));
    util.mouseMoveToElement(label);
    util.waitForAndClick(label.element(by.css(selectors.LABEL_EDIT_ICON)));
    util.waitForAndClick(by.cssContainingText(selectors.TOP_MENU_LABEL_PANEL_LINK, 'Change Color'));
}

function verifyTagged(itemName, labelName) {
    var listItem =  element(listItemSelector(itemName));
    var el = listItem.element(by.cssContainingText(selectors.LIST_LABEL, labelName));
    util.waitForVisibilityOf(el);
}

function verifyUntagged(itemName, labelName) {
    var listItem =  element(listItemSelector(itemName));
    var el = listItem.element(by.cssContainingText(selectors.LIST_LABEL, labelName));
    util.waitForInvisibilityOf(el);
}

function tagItemWithLabel(itemName, labelName) {
    element(listItemSelector(itemName)).element(by.css(checkbox.selectors.CONTAINER)).click();
    $(util.joinSelectors(
        selectors.ACTION_ITEM_LABEL_CONTAINER,
        dataUI.selectors.APPLY_STICKER_BUTTON)
    ).click();
    $(actionItemLabelSelector(labelName)).click();
}

function untagItemFromLabel(itemName, labelName) {
    var listItemElement = element(listItemSelector(itemName));
    listItemElement.element(taggedLabelSelector(labelName))
        .element(by.css(selectors.DELETE_LABEL)).click();
}

function checkColorOfTag(itemName, labelName, colorString) {
    var listItemElement = element(listItemSelector(itemName));
    listItemElement.element(taggedLabelSelector(labelName)).getCssValue('background-color')
        .then(function(value) {
            expect(colorString).toEqual(value);
        });
}

module.exports = {
    addLabel: addLabel,
    checkColorOfTag: checkColorOfTag,
    deleteLabel: deleteLabel,
    editLabelColor: editLabelColor,
    listItemSelector: listItemSelector,
    selectors: selectors,
    clickLabelFilter: clickLabelFilter,
    showLabelPanel: showLabelPanel,
    tagItemWithLabel: tagItemWithLabel,
    topMenuLabelSelector: topMenuLabelSelector,
    untagItemFromLabel: untagItemFromLabel,
    verifyLabelExists: verifyLabelExists,
    verifyLabelDoesNotExist: verifyLabelDoesNotExist,
    verifyTagged: verifyTagged,
    verifyUntagged: verifyUntagged
};
