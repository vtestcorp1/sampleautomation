'use strict';

var common = require('../common.js');

var selectors = {
    CHECKBOX: '.bk-checkbox-container',
    DIALOG: '.bk-scheduler-dialog',
    FREQUENCY: '.bk-frequency',
    OPEN_SCHEDULE: '.bk-open-scheduler',
    REPEATS: '.bk-repeats',
    SCHEDULER_ICON: '.bk-ds-schedule-content'
};

var repeats = {
    MINUTES: 'Every N Minutes',
    HOURLY: 'Hourly',
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly'
};

var checkedDays = {
    SUNDAY: 'Sunday',
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday'
};

function checkFrequency(frequency) {
    schedulerSelect.checkOption('.bk-frequency', frequency);
}

function checkRepeats(repeats) {
    schedulerSelect.checkOption('.bk-repeats', repeats);
}

function checkAtOption(hours, minutes) {
 //TODO(chab) implement
}

function checkDays(days) {
    var keys = Object.keys(checkedDays);
    keys.forEach(function(dayKey) {
        var day = checkedDays[dayKey];
        var container = element(by.cssContainingText(selectors.CHECKBOX, day));
        if (days.indexOf(day) > -1) {
            var checkbox = container.all(by.css('.bk-checkbox.bk-checked'));
            expect(checkbox.count()).toBe(1);
        } else {
            var checkbox = container.all(by.css('.bk-checkbox'));
            expect(checkbox.count()).toBe(1);
        }
    });
}

function selectRepeatOption(repeatOption) {
    schedulerSelect.selectOption(selectors.REPEATS, repeatOption);
    common.util.waitForElement(by.css('#everynminid, #hourlyid, #dailyid, #monthlyid'));
}
function selectFrequencyOption(frequencyOption) {
    schedulerSelect.selectOption(selectors.FREQUENCY, frequencyOption);
}

function selectAtOption(hour, minute) {
    schedulerSelect.selectOption('', hour);
    schedulerSelect.selectOption('', minute);
}

function selectCheckedDays(daysToCheck) {
    daysToCheck.forEach(function(dayToCheck){
        element(by.cssContainingText(selectors.CHECKBOX, dayToCheck)).click();
    });
}
function fillSchedule(repeats, frequency, atTime, checkedDays) {
    selectRepeatOption(repeats);
    if (frequency) {
        selectFrequencyOption(frequency);
    }
    if (atTime) {
        selectAtOption(atTime.hour, atTime.minute);
    }
    if (checkedDays) {
        selectCheckedDays(checkedDays);
    }
}
var schedulerSelect = {
    selectors:
    {
        SELECT_OPEN_CLOSE: '.chosen-container',
        UISELECT_ROW: '.active-result',
        SELECTED_ITEM: '.chosen-single'

    },
    selectOption: function (containingSelector, text) {
        var EC = protractor.ExpectedConditions;
        var containingElement = $(containingSelector);
        containingElement.element(by.css(this.selectors.SELECT_OPEN_CLOSE)).click();
        var rowToSelect = containingElement.element(by.cssContainingText(
            this.selectors.UISELECT_ROW, text));
        rowToSelect.click();
    },
    checkOption: function(containingSelector, text) {
        var containingElement = $(containingSelector);
        common.util.waitForElement(containingElement);
        var selectElementText = containingElement.$(this.selectors.SELECTED_ITEM).$('span').getText();
        expect(selectElementText).toContain(text);
    }
};

module.exports = {
    repeats: repeats,
    checkedDays: checkedDays,
    checkDays: checkDays,
    checkFrequency: checkFrequency,
    checkRepeat: checkRepeats,
    checkAtOption: checkAtOption,
    fillSchedule: fillSchedule,
    selectors: selectors
};
