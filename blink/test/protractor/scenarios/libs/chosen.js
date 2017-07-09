/**
 * Created by Francois Chabbey (francois.chabbey@thoughtspot.om)
 *
 * @fileoverview Test API For chosen plugin
 *
 * Note: we do not want to use the chosen plugin anymore.
 *
 */
'use strict';

var common = require('../common.js');
var util = common.util;

var selectors = {
    CHOSEN_ITEMS: '.chosen-single',
    DROPDOWN: '.chosen-drop',
    OPTIONS: '.active-result'
};

function openDropdown(rootElement) {
    util.mouseMoveToElement(rootElement);
    rootElement.element(by.css(selectors.CHOSEN_ITEMS)).click();
    util.waitForElement(selectors.DROPDOWN);
}
function choseSingle(rootElement, text) {
    rootElement.element(by.cssContainingText(selectors.OPTIONS, text)).click();
}
function changeSelection(rootElement, selectionText) {
    openDropdown(rootElement);
    choseSingle(rootElement, selectionText);
}
function getText(rootElement) {
    return rootElement.element(by.css('.chosen-single')).getText();
}
function getOptions(rootElement) {
    openDropdown(rootElement);
    return $$(util.joinSelectors(selectors.DROPDOWN, selectors.OPTIONS)).filter(function(elem) {
        return elem.isDisplayed();
    });
}

module.exports = {
    changeSelection: changeSelection,
    getText: getText,
    openDropdown: openDropdown,
    getOptions: getOptions
};
