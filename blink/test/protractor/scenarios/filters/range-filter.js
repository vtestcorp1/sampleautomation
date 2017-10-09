/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');

var util = common.util;

var selectors = {};
selectors.FIRST_RANGE = '.bk-range-select-first-operator';
selectors.SECOND_RANGE = '.bk-range-select-second-operator';
selectors.PREDICATE_SELECTOR = '.chosen-container';
selectors.PREDICATE_SELECTOR_OPTION = '.chosen-container .active-result';
selectors.OPERAND_INPUT_BOX = 'input.bk-value-selector';
selectors.CHOSEN_DISABLED = '.chosen-disabled';

function getFirstPredicate(predicateType) {
    var predicateSelector = util.joinSelectors(
        selectors.FIRST_RANGE,
        selectors.PREDICATE_SELECTOR_OPTION
    );
    return element.all(by.css(predicateSelector)).filter(function(pd) {
        return pd.getText().then(function(text) {
            return text === predicateType;
        });
    }).first();
}

function changeFirstPredicate(predicateType) {
    util.waitForAndClick(
        util.joinSelectors(selectors.FIRST_RANGE, selectors.PREDICATE_SELECTOR)
    );
    getFirstPredicate(predicateType).click();
}

function verifyFirstPredicate(predicateType) {
    var selector = util.joinSelectors(selectors.FIRST_RANGE, selectors.PREDICATE_SELECTOR);
    element(by.css(selector)).getText().then(function(text) {
        expect(text.trim()).toBe(predicateType);
    });
}

function clearFirstOperandValue() {
    $(util.joinSelectors(selectors.FIRST_RANGE, selectors.OPERAND_INPUT_BOX)).clear();
}

function setFirstOperandValue(value) {
    util.waitForElement(selectors.FIRST_RANGE);
    $(util.joinSelectors(selectors.FIRST_RANGE, selectors.OPERAND_INPUT_BOX))
        .sendKeys(value);
}

function waitForFirstOperandValue(value) {
    util.waitForValueToBe(
        util.joinSelectors(selectors.FIRST_RANGE, selectors.OPERAND_INPUT_BOX),
        value
    );
}

// second predicate
function changeSecondPredicate(predicateType) {
    util.waitForAndClick(
        util.joinSelectors(selectors.SECOND_RANGE, selectors.PREDICATE_SELECTOR)
    );
    util.waitForAndClick(
        util.contains(
            util.joinSelectors(selectors.SECOND_RANGE, selectors.PREDICATE_SELECTOR_OPTION),
            predicateType
        )
    );
}

function setSecondOperandValue(value) {
    util.waitForElement(selectors.SECOND_RANGE);
    $(util.joinSelectors(selectors.SECOND_RANGE, selectors.OPERAND_INPUT_BOX))
        .sendKeys(value);
}

function waitForSecondOperandValue(value) {
    util.waitForValueToBe(
        util.joinSelectors(selectors.SECOND_RANGE, selectors.OPERAND_INPUT_BOX),
        value
    );
}

function waitForSecondPredicateOptions(options) {
    util.waitForAndClick(
        util.joinSelectors(selectors.SECOND_RANGE, selectors.PREDICATE_SELECTOR)
    );
    util.waitForElementCountToBe(
        util.joinSelectors(selectors.SECOND_RANGE, selectors.PREDICATE_SELECTOR_OPTION),
        options.length
    );
    var selector = util.joinSelectors(selectors.SECOND_RANGE, selectors.PREDICATE_SELECTOR_OPTION);
    element.all(by.css(selector)).each(function(elem, index) {
        expect(elem.getText()).toBe(options[index]);
    });
}

function waitForFirstPredicateDisabled() {
    util.waitForElement(util.joinSelectors(selectors.FIRST_RANGE, selectors.CHOSEN_DISABLED));
}

function waitForSecondPredicateDisabled() {
    util.waitForElement(util.joinSelectors(selectors.SECOND_RANGE, selectors.CHOSEN_DISABLED));
}

function openDatePickerFirstOperand() {
    util.waitForAndClick(util.joinSelectors(selectors.FIRST_RANGE, selectors.OPERAND_INPUT_BOX));
}

module.exports = {
    // first predicate
    changeFirstPredicate: changeFirstPredicate,
    clearFirstOperandValue: clearFirstOperandValue,
    setFirstOperandValue: setFirstOperandValue,
    verifyFirstPredicate: verifyFirstPredicate,
    waitForFirstOperandValue: waitForFirstOperandValue,
    waitForFirstPredicateDisabled: waitForFirstPredicateDisabled,
    // second predicate
    changeSecondPredicate: changeSecondPredicate,
    setSecondOperandValue: setSecondOperandValue,
    waitForSecondOperandValue: waitForSecondOperandValue,
    waitForSecondPredicateOptions: waitForSecondPredicateOptions,
    waitForSecondPredicateDisabled: waitForSecondPredicateDisabled,
    dateFilter: {
        openDatePickerFirstOperand: openDatePickerFirstOperand
    }
};
