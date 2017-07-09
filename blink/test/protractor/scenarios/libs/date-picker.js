/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Test Apis for date picker.
 */

'use strict';

var common = require('../common');

var selectors = {};

selectors.DATE_PICKER = '.datepicker';

selectors.DAYS = common.util.joinSelectors(selectors.DATE_PICKER, '.datepicker-days');
selectors.MONTHS = common.util.joinSelectors(selectors.DATE_PICKER, '.datepicker-months');
selectors.YEARS = common.util.joinSelectors(selectors.DATE_PICKER, '.datepicker-years');

selectors.PREV = '.prev';
selectors.SWITCH = '.datepicker-switch';
selectors.NEXT = '.next';

selectors.DAY = common.util.joinSelectors(selectors.DAYS, '.day');

function waitForDatePicker() {
    common.util.waitForElement(selectors.DATE_PICKER);
}

function goToPreviousDecade() {
    common.util.waitForAndClick(common.util.joinSelectors(selectors.YEARS, selectors.PREV));
}

function selectDay(day) {
    return element.all(by.css(selectors.DAY)).filter(function(dayElem) {
        return dayElem.getText().then(function(text) {
            return text === day;
        });
    }).first().click();
}

module.exports = {
    waitForDatePicker: waitForDatePicker,
    goToPreviousDecade: goToPreviousDecade,
    selectDay: selectDay
};
