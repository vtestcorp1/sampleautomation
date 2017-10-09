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
    PINBOARD_VIZ_CONTENT: '.bk-pinboard-viz-content',
    FIRST_ELEMENT:"div.bk-legend-label.bk-overflow-ellipsis.ng-binding",
    FIRST_ONLY:'div[ng-click="onSingularSeriesSelectionClick($event, label)"]',
    REGION_PRESENT:'canvas.ol-unselectable',
    ONLY_LINK: 'ul.bk-legend-content-inner li:nth-child(1) div.bk-legend-singular-select',
    ONLY_LINK_SECOND: 'ul.bk-legend-content-inner li:nth-child(2) div.bk-legend-singular-select',
    GET_CENTER_MAP: '.bk-pinboard-data-viz',
    GET_POPUP_CONTENT: '.popover-content',
    MAP_ELEMENT: '.bk-answer-content'
};
selectors.SLIDE_SHOW_NAVIGATOR =
    util.joinSelectors(selectors.SLIDE_SHOW_CONTAINER, '.bk-slide-show-navigator');
selectors.SLIDE_SHOW_NAVIGATOR_ITEM = util.joinSelectors(selectors.SLIDE_SHOW_NAVIGATOR, 'li');
selectors.CLOSE_SHOW = util.joinSelectors(selectors.SLIDE_SHOW_CONTAINER, '.bk-close-btn');

var locators = {
    SLIDE_SHOW_CONTAINER: by.css(selectors.SLIDE_SHOW_CONTAINER),
    SLIDE_SHOW_NAVIGATOR: by.css(selectors.SLIDE_SHOW_NAVIGATOR),
    SLIDE_SHOW_NAVIGATOR_ITEM: by.css(selectors.SLIDE_SHOW_NAVIGATOR_ITEM),
    CLOSE_SHOW: by.css(selectors.CLOSE_SHOW),
    FIRST_ELEMENT:by.css(selectors.FIRST_ELEMENT),
    FIRST_ONLY:by.css(selectors.FIRST_ONLY),
    REGION_PRESENT:by.css(selectors.REGION_PRESENT),
    ONLY_LINK: element(by.css(selectors.ONLY_LINK)),
    ONLY_LINK_SECOND: element(by.css(selectors.ONLY_LINK_SECOND)),
    GET_CENTER_MAP: element(by.css(selectors.GET_CENTER_MAP)),
    GET_POPUP_CONTENT: element.all(by.css(selectors.GET_POPUP_CONTENT)).get(0),
    MAP_ELEMENT: element(by.css(selectors.MAP_ELEMENT))
};

function getToolTip() {
    util.waitForVisibilityOf(locators.MAP_ELEMENT);
    browser.actions().mouseMove(locators.MAP_ELEMENT, {x:750, y:350}).perform();
    util.waitForVisibilityOf(locators.GET_POPUP_CONTENT);
    return locators.GET_POPUP_CONTENT.getText().then(function(text){
        return text
    });
}

function clickOnOnlyLink() {
    util.waitForElement(locators.ONLY_LINK);
    browser.actions().mouseMove(locators.ONLY_LINK, {x:5, y:5}).perform();
    return locators.ONLY_LINK.click().then(function(){
        browser.actions().mouseMove(locators.GET_CENTER_MAP, {x:780, y:440}).perform();

        browser.sleep(3000);
        return locators.GET_POPUP_CONTENT.getText().then(function(text){
            return text
        });
    });
}

function checkPresenceOfSecondOnly() {
    browser.actions().mouseMove(locators.ONLY_LINK, {x:5, y:5}).perform();
    return locators.ONLY_LINK.click().then(function(){
        return locators.ONLY_LINK_SECOND.isPresent();
    });
}

function regionGraphIspresent(){
    return $(locators.REGION_PRESENT).click();
}

function regionGraphPresence(){
    return $(locators.REGION_PRESENT).isPresent();
}

/*function clickOnOnly(){
    return $(locators.FIRST_ELEMENT).get(0).$(locators.FIRST_ONLY).click();
}*/

function clickOnOnly(){
    return util.waitForAndClick(locators.ONLY_LINK);
}

function goToSlideByIndex(index) {
    return util.waitForAndClick(element.all(locators.SLIDE_SHOW_NAVIGATOR_ITEM).get(index));
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
    waitForVizInSlideShow,
    clickOnOnly,
    regionGraphIspresent,
    regionGraphPresence,
    getToolTip : getToolTip,
    clickOnOnlyLink : clickOnOnlyLink,
    checkPresenceOfSecondOnly
};
