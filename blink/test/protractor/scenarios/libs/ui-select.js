/**
 * Created by jasmeet on 10/28/16.
 */
'use strict';

var common = require('../common.js');
var util = common.util;

var selectors = {
    CHOICE: '.ui-select-choices-row',
    INPUT: '.ui-select-search',
    MATCH: '.ui-select-match',
    VALUE: '.select2-choice'
};

function openSelector(rootElement) {
    rootElement.element(by.css(selectors.MATCH)).click();
}

function typeText(rootElement, text) {
    var input = rootElement.element(by.css(selectors.INPUT));
    util.waitForVisibilityOf(input);
    input.sendKeys(text);
}

function selectSingle(rootElement, text, shouldTypeText) {
    if (shouldTypeText) {
        typeText(rootElement, text);
        var row = rootElement.all(by.css(selectors.CHOICE)).first();
        util.waitForVisibilityOf(row);
        var rowToSelect = rootElement.element(by.cssContainingText(selectors.CHOICE, text));
        return rowToSelect.click();
    } else {
        return util.waitForAndClick(rowContainingText(rootElement, text));
    }
}

function selectMultiple(rootElement, texts, shouldTypeText) {
    texts.forEach(function(text) {
        selectSingle(rootElement, text, shouldTypeText);
    });
}

function rowContainingText(rootElement, text) {
    return rootElement.element(by.cssContainingText(selectors.CHOICE, text));
}

function changeSelection(rootElement, selection, shouldTypeText) {
    openSelector(rootElement);

    if (Array.isArray(selection)) {
        return selectMultiple(rootElement, selection, shouldTypeText);
    } else {
        return selectSingle(rootElement, selection, shouldTypeText);
    }
}

function checkForOptionMoreThan(rootElement, text, count) {
    checkForOption(rootElement, text, count, true /* moreThan */)
}

function checkForOption(rootElement, text, count, moreThan) {
    openSelector(rootElement);
    typeText(rootElement, '');
    var rowToSelect = rootElement.all(by.cssContainingText(selectors.CHOICE, text));
    if (moreThan) {
        expect(rowToSelect.count()).toBeGreaterThan(count);
    } else {
        if (count === void 0) {
            count = 1;
        }
        expect(rowToSelect.count()).toEqual(count);
    }
    openSelector(rootElement); // close the box
}

function getSelectedOptionElement(rootElement) {
    return rootElement.element(by.css(selectors.VALUE));
}

function hoverSingleValue(rootElement, value, shouldTypeText) {
    openSelector(rootElement);
    if (shouldTypeText) {
        typeText(rootElement, value);
    }
    var dropdownValueItem = by.cssContainingText(
        selectors.CHOICE,
        value
    );
    util.mouseMoveToElement(dropdownValueItem);
}

function waitForList(rootElement) {
    util.waitForVisibilityOf(rootElement.element(by.css(selectors.CHOICE)));
}

function getSelectionText(rootElement) {
    return rootElement.element(by.css('.ui-select-match')).getText();
}


module.exports = {
    checkForOption: checkForOption,
    checkForOptionMoreThan: checkForOptionMoreThan,
    getSelectedOptionElement: getSelectedOptionElement,
    getSelectionText: getSelectionText,
    hoverSingleValue: hoverSingleValue,
    openSelector: openSelector,
    selectSingle: selectSingle,
    selectMultiple: selectMultiple,
    changeSelection: changeSelection,
    waitForList: waitForList,
    typeText: typeText
};
