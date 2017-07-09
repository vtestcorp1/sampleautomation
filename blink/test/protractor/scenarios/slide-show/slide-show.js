/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var common = require('../common');
var util = common.util;

var selectors = {
    SLIDE_SHOW_CONTAINER: '.bk-presentation-mode-container',
    ACTIVE_SLIDE: '.bk-slide-active',
    PINBOARD_VIZ_CONTENT: '.bk-pinboard-viz-content'
};
selectors.SLIDE_SHOW_NAVIGATOR =
    util.joinSelectors(selectors.SLIDE_SHOW_CONTAINER, '.bk-slide-show-navigator');
selectors.SLIDE_SHOW_NAVIGATOR_ITEM = util.joinSelectors(selectors.SLIDE_SHOW_NAVIGATOR, 'li');
selectors.CLOSE_SHOW = util.joinSelectors(selectors.SLIDE_SHOW_CONTAINER, '.bk-close-btn');

var locators = {
    SLIDE_SHOW_CONTAINER: by.css(selectors.SLIDE_SHOW_CONTAINER),
    SLIDE_SHOW_NAVIGATOR: by.css(selectors.SLIDE_SHOW_NAVIGATOR),
    SLIDE_SHOW_NAVIGATOR_ITEM: by.css(selectors.SLIDE_SHOW_NAVIGATOR_ITEM),
    CLOSE_SHOW: by.css(selectors.CLOSE_SHOW)
};

function goToSlideByIndex(index) {
    common.util.waitForAndClick(element.all(locators.SLIDE_SHOW_NAVIGATOR_ITEM).get(index));
}

function goToSlideByName(name) {
    common.util.waitForAndClick(by.cssContainingText(selectors.SLIDE_SHOW_NAVIGATOR_ITEM, name));
}

function closeSlideShow() {
    return $(selectors.SLIDE_SHOW_CONTAINER).isPresent().then(function(isPresent) {
        if (isPresent) {
            $(selectors.CLOSE_SHOW).click();
            return util.waitForElementToNotBePresent(selectors.SLIDE_SHOW_CONTAINER);
        }
    });
}

function waitForVizInSlideShow() {
    return common.util.waitForElement(
        util.joinSelectors(selectors.ACTIVE_SLIDE, selectors.PINBOARD_VIZ_CONTENT));
}

module.exports = {
    selectors: selectors,
    goToSlideByIndex,
    goToSlideByName,
    closeSlideShow,
    waitForVizInSlideShow
};
