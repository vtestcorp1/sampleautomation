/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var common = require('../common.js');
var util = common.util;

var selectors = {
    ACTIONABLE_LIST_CONTENT: '.bk-actionable-list-content',
    LIST_ACTION_BUTTON: '.bk-action-item',
    AUTHOR_LABEL: '.bk-profile-content',
    DELETE_BTN: '.bk-list-bulk-actions .bk-action-item .bk-style-icon-delete',
    METADATA_ITEM_CHECKBOX: '.bk-checkbox-container',
    METADATA_LIST_ITEM_CONTAINER: '.bk-list-content',
    METADATA_LIST_ITEMS: '.bk-list-content li.vs-repeat-repeated-element',
    METADATA_LIST_ITEMS_CONTENT: '.bk-list-content li .bk-row-flex',
    NAME: '.bk-name',
    LIST_CONTAINER: '.bk-list',
    SEARCH_BOX: '.bk-search-input',
    LIST_TITLE: '.bk-actionable-list-content .bk-title',
    COLUMN_TITLE: '.bk-column-title-text',
    PAGINATION_BTN: '.bk-pagination-btn'
};

selectors.METADATA_LIST_NAMES = util.joinSelectors(
    selectors.METADATA_LIST_ITEMS,
    selectors.NAME
);

selectors.NEXT_BUTTON = `${selectors.PAGINATION_BTN}.bk-next`;
selectors.PREVIOUS_BUTTON = `${selectors.PAGINATION_BTN}.bk-prev`;

function clearSearchBox(listSelector, dontPressReturn) {
    var searchBox = util.joinSelectors(listSelector, selectors.SEARCH_BOX);
    util.waitForVisibilityOf(searchBox);
    $(searchBox).clear();
    if (!dontPressReturn) {
        return $(searchBox).sendKeys(protractor.Key.ENTER);
    }
}

function searchFor(listSelector, text, dontPressReturn) {
    var searchBox = util.joinSelectors(listSelector, selectors.SEARCH_BOX);
    util.waitForElement(searchBox);
    clearSearchBox(listSelector, dontPressReturn);
    $(searchBox).sendKeys(text);
    if (!dontPressReturn) {
        return $(searchBox).sendKeys(protractor.Key.ENTER);
    }
}

function getItemLocatorByName(listSelector, name) {
    var itemSelector = util.joinSelectors(listSelector, selectors.METADATA_LIST_NAMES);
    return by.cssContainingText(itemSelector, name);
}

function getAllElementsByName(name) {
    var elems = element.all(by.css(selectors.METADATA_LIST_ITEMS))
        .filter(function(listItemElement) {
            return listItemElement
                .element(by.css(selectors.NAME))
                .getText()
                .then(function(text) {
                    return text === name;
                });
        });
    return elems;
}

function getElementByName(name) {
    var elem = getAllElementsByName(name).first();
    return elem;
}

function getListItemNameElement(name) {
    return getElementByName(name)
        .element(by.css(selectors.NAME));
}

function getListItemCheckboxElement(name) {
    return getElementByName(name)
        .element(by.css(selectors.METADATA_ITEM_CHECKBOX));
}

function selectItemByName(listSelector, name) {
    searchFor(listSelector, name);
    return clickItemByName(listSelector, name);
}

function clickItemByName(listSelector, name) {
    var elem = getListItemNameElement(name);
    return elem.click();
}

function waitForItemCountToBe(listSelector, name, count) {
    searchFor(listSelector, name);
    return util.waitForElementCountToBe(getItemLocatorByName(listSelector, name), count);
}

function checkItems(listSelector, names, ignoreSearching) {
    clearSearchBox(listSelector);
    names.forEach(function(name) {
        if (!ignoreSearching) {
            clearSearchBox(listSelector);
            searchFor(listSelector, name);
        }
        util.waitForAndClick(getListItemCheckboxElement(name));
    });
}

function deleteItemsByName(listSelector, names) {
    checkItems(listSelector, names);
    clickDelete(listSelector);
    util.waitForElementCountToBe(common.dialog.locators.DIALOG, 1);
    element(common.dialog.locators.PRIMARY_DLG_BTN).click();
    return util.waitForElementCountToBe(common.dialog.locators.DIALOG, 0);
}

function clickDelete(listSelector) {
    var deleteBtn = $(util.joinSelectors(listSelector, selectors.DELETE_BTN));
    return deleteBtn.click();
}

function checkIfColumnHeaderExists(containgSelector, headerName) {

    var columnSelector = containgSelector + ' ' + selectors.COLUMN_TITLE;
    var columnHeader = element.all(by.cssContainingText(columnSelector, headerName));
    expect(columnHeader.count()).toBe(1);
}

function checkIfItemExist(columnSelector, itemName, numberOfItems) {
    if (numberOfItems === void 0) {
        numberOfItems = 1;
    }
    var columnSelector =  selectors.ACTIONABLE_LIST_CONTENT + ' ' + columnSelector;
    var itemElement = element.all(by.cssContainingText(columnSelector, itemName));
    expect(itemElement.count()).toBe(numberOfItems);
}

function checkAuthorLabel(listSelector, n, label) {
    var selector = util.joinSelectors(listSelector, selectors.AUTHOR_LABEL);
    var labels = element.all(by.css(selector));
    expect(labels.get(n).getText()).toBe(label);
}

function getActionButton(buttonClass, buttonText) {
    var buttonElement;

    if (!!buttonClass) {
        buttonElement = $(util.joinSelectors(
            selectors.ACTIONABLE_LIST_CONTENT,
            selectors.LIST_ACTION_BUTTON + buttonClass)
        );
    } else {
        var baseSelector = $(util.joinSelectors(
            selectors.ACTIONABLE_LIST_CONTENT,
            selectors.LIST_ACTION_BUTTON)
        );
        buttonElement = element(by.cssContainingText(baseSelector, buttonText));
    }

    return buttonElement;
}

function checkIfActionButtonIsEnabled(buttonClass, buttonText) {
    var button = getActionButton(buttonClass, buttonText);
    expect(button.all(by.css('.bk-disabled-button')).count()).toBe(0);
}

function checkIfActionButtonIsDisabled(buttonClass, buttonText) {
    var button = getActionButton(buttonClass, buttonText);
    expect(button.all(by.css('.bk-disabled-button')).count()).toBe(1);
}

function checkPagination(paginationText) {
    util.waitForTextToBePresentInElement($(selectors.LIST_TITLE), paginationText);
}

function goToNextPage() {
    $(selectors.NEXT_BUTTON).click();
}

function getAllItems(containerSelector) {
    var baseSelector = selectors.METADATA_LIST_ITEMS;
    var selector = containerSelector ?
        util.joinSelectors(containerSelector, baseSelector)
        : baseSelector;
    return $$(selector);
}

function getAllItemNames(containerSelector) {
    var baseSelector = selectors.METADATA_LIST_NAMES;
    var selector = containerSelector ?
        util.joinSelectors(containerSelector, baseSelector)
        : baseSelector;
    return $$(selector);
}

function goToPreviousPage() {
    util.waitForAndClick(selectors.PREVIOUS_BUTTON);
}

function waitForItem(listSelector, name, isPresent) {
    searchFor(listSelector, name);
    return common.util.waitForCondition(function() {
        return getAllElementsByName(name)
            .count()
            .then(function(count) {
                var expectedCount = isPresent ? 1 : 0;
                return count === expectedCount;
            })
    });
}

function waitForItemToBePresent(listSelector, name) {
    return waitForItem(listSelector, name, true);
}

function waitForItemToNotBePresent(listSelector, name) {
    return waitForItem(listSelector, name, false);
}

module.exports = {
    selectors: selectors,
    searchFor: searchFor,
    waitForItemCountToBe: waitForItemCountToBe,
    checkAuthorLabel: checkAuthorLabel,
    checkIfColumnHeaderExists: checkIfColumnHeaderExists,
    checkIfItemExist: checkIfItemExist,
    checkIfActionButtonIsDisabled: checkIfActionButtonIsDisabled,
    checkIfActionButtonIsEnabled: checkIfActionButtonIsEnabled,
    checkPagination: checkPagination,
    clearSearchBox: clearSearchBox,
    getAllItems: getAllItems,
    getAllItemsNames: getAllItemNames,
    getItemLocatorByName: getItemLocatorByName,
    goToNextPage: goToNextPage,
    goToPreviousPage: goToPreviousPage,
    checkItems: checkItems,
    deleteItemsByName: deleteItemsByName,
    clickDelete: clickDelete,
    selectItemByName: selectItemByName,
    clickItemByName: clickItemByName,
    waitForItemToBePresent: waitForItemToBePresent,
    waitForItemToNotBePresent: waitForItemToNotBePresent
};
