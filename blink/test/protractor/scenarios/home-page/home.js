/**
 * Created by francois.chabbey on 11/16/16.
 */

'use strict';

var common = require('../common');
var uiSelect = require('../libs/ui-select');
var util = common.util;

var selectors = {
    HOME_ACTIVITY_TOGGLE: '.bk-home-activity-container .bk-slider-btn',
    HOME_ACTIVITY_ITEM: '.bk-home-activity .bk-activity-feed-item',
    HOME_PAGE_PINBOARD_SELECT: '.bk-pinboard-picker-drop-down'
};

function openActivityFeed() {
    $(selectors.HOME_ACTIVITY_TOGGLE).click();
    util.waitForElement($(selectors.HOME_ACTIVITY_ITEM));
}

function switchToPinboard(pinboardName) {
    return uiSelect.changeSelection(
        $(selectors.HOME_PAGE_PINBOARD_SELECT),
        pinboardName,
        /*should type*/ true
    );
}

module.exports = {
    openActivityFeed: openActivityFeed,
    switchToPinboard: switchToPinboard,
    selectors: selectors
};
