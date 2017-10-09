/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Pivot Table page object
 */
'use strict';
var common = require('../common');
var util = common.util;

var selectors = {
    FIELD: '.dx-area-field.dx-area-box',
    PIVOT_TABLE: '.pivot-table',
    PIVOT_VERTICAL_HEADER_ROW: '.dx-pivotgrid-vertical-headers tr',
    CHART_TOGGLE_BUTTON: '.bk-toggle-chart-selector-display',
    PIVOT_CHART_ICON: 'div[chart-type=\'PIVOT_TABLE\']',
    PIVOT_HEADER: '.dx-pivotgrid-vertical-headers td div.dx-expand-icon-container',
    PIVOT_SELECT_FILTER: '.dx-word-wrap tr .dx-area-field-content .pivot-header-item.ng-scope .bk-options',
    PIVOT_FILTER_OPTION: '.bk-filter.ng-binding.ng-scope',
    PIVOT_CATEGORY_CHECKBOX: '.popover-content .bk-checkbox-container',
    PIVOT_PRIMARY_BUTTON: '.dialog-ok-button.ng-scope .bk-primary-button.bk-button-body',
    //PIVOT_VERTICAL_HEADER_ROW: '.dx-pivotgrid-vertical-headers tr',

    MAP_ELEMENT: '.bk-answer-content',
    FIRST_ELEMENT:'.dx-pivotgrid-vertical-headers tr:nth-child(1)',
    FILTER:'.bk-filter.ng-binding.ng-scope',
    KEBABICON:'.dx-word-wrap>tbody tr:nth-child(3) .dx-area-description-cell tr td:nth-child(1) .bk-options',
    FILTER_SEARCH:'.bk-cb-filter-content .bk-search-input',
    Exapand : '.dx-white-space-column',
    DONEBUTTON:'.bk-dialog-action-buttons.clearfix.ng-scope.ng-isolate-scope>div.dialog-ok-button.ng-scope'
};

var locators = {
    CHART_TOGGLE_BUTTON: element(by.css(selectors.CHART_TOGGLE_BUTTON)),
    PIVOT_CHART_ICON: element(by.css(selectors.PIVOT_CHART_ICON)),
    PIVOT_HEADER: element.all(by.css(selectors.PIVOT_HEADER)).get(0),
    PIVOT_SELECT_FILTER: element.all(by.css(selectors.PIVOT_SELECT_FILTER)).get(2),
    PIVOT_FILTER_OPTION: element(by.css(selectors.PIVOT_FILTER_OPTION)),
    PIVOT_CATEGORY_CHECKBOX: element.all(by.css(selectors.PIVOT_CATEGORY_CHECKBOX)).get(0),
    PIVOT_PRIMARY_BUTTON: element(by.css(selectors.PIVOT_PRIMARY_BUTTON)),

    MAP_ELEMENT: element(by.css(selectors.MAP_ELEMENT)),
    FIRST_ELEMENT:element(by.css(selectors.FIRST_ELEMENT)),
    FILTER:element(by.css(selectors.FILTER)),
    KEBABICON:element(by.css(selectors.KEBABICON)),
    FILTER_SEARCH:element(by.css(selectors.FILTER_SEARCH)),
    Exapand : element(by.css(selectors.Exapand)),
    DONEBUTTON:element(by.css(selectors.DONEBUTTON))
};

function actionOnPivot() {
    util.waitForAndClick(locators.PIVOT_HEADER).then(function(){
        util.waitForVisibilityOf(locators.PIVOT_SELECT_FILTER);
        util.waitForAndClick(locators.PIVOT_SELECT_FILTER).then(function(){
            util.waitForVisibilityOf(locators.PIVOT_FILTER_OPTION);
            util.waitForAndClick(locators.PIVOT_FILTER_OPTION).then(function() {
                util.waitForVisibilityOf(locators.PIVOT_CATEGORY_CHECKBOX);
                util.waitForAndClick(locators.PIVOT_CATEGORY_CHECKBOX).then(function() {
                    util.waitForVisibilityOf(locators.PIVOT_PRIMARY_BUTTON);
                    util.waitForAndClick(locators.PIVOT_PRIMARY_BUTTON).then(function() {
                        //browser.executeScript("")
                        console.log("DONE PRESSED");
                    });
                });
            });
        });
    });
}

function selectPivotChart() {
    locators.CHART_TOGGLE_BUTTON.click().then(function(){
        locators.CHART_TOGGLE_BUTTON.click().then(function() {
            browser.driver.sleep(3000);
            util.waitForAndClick(locators.PIVOT_CHART_ICON);
        });
    });
}

function dragRowFieldToColumnArea(rowFieldName) {
    let rowField = element(by.cssContainingText(selectors.FIELD, rowFieldName));
    util.dragAndDrop(rowField, 300, -50);
}

function waitForVerticalHeaderRowsCountToBe(count) {
    util.waitForElementCountToBe(selectors.PIVOT_VERTICAL_HEADER_ROW, count);
}

module.exports = {
    selectors : selectors,
    locators : locators,
    dragRowFieldToColumnArea,
    waitForVerticalHeaderRowsCountToBe,
    selectPivotChart,
    actionOnPivot
};
