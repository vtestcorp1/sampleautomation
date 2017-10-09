/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 */

'use strict';

var blinkList = require('../list/blink-list.js');
var actionButton = require('../actions-button.js');
var common = require('../common.js');
var sage = require('../sage/sage.js');
var charts = require('../charts/charts.js');
var table = require('../table/table');
var share = require('../share/share-ui.js');
var slideShow = require('../slide-show/slide-show');
var dialog = require('../dialog');
var URI = require('urijs');
var uiSelect = require('../libs/ui-select');

var util = common.util;

var selectors = {
    PINBOARD_LOADED: '.bk-pinboard-loaded',
    CLOSE_VIZ: '.bk-viz-context a.bk-close',
    CLOSE_FILTER_PANEL: '.bk-header-container .bk-style-icon-close',
    COPY_NAME_INPUT: '.bk-answer-save-dialog input',
    EDIT_VIZ: '.bk-viz-context-btn',
    AUTO_ANALYZE_VIZ: '.bk-trigger-a3',
    DOWNLOAD_VIZ: '.bk-download-viz',
    DOWNLOAD_AS_CSV: '.bk-download-as-csv',
    COPY_LINK: '.bk-action-copy-link',
    DELETE_VIZ: '.bk-dropdown-item.bk-viz-delete-btn',
    START_SLIDE_SHOW_ON_VIZ: '.bk-viz-maximize-btn',
    VIZ_CONTEXT: '.bk-viz-context',
    MAKE_COPY: '.bk-dropdown-item.bk-action-make-copy',
    SAVE_BTN: '.bk-action-save',
    SAVE_ACTION_BTN: '.bk-dropdown-item.bk-action-save-untitled',
    SAVE_NAME_TXT: '.bk-name-text.ng-pristine.ng-untouched.ng-valid.ng-not-empty',
    SAVE_BTN_POP_UP: '.bk-dialog [button-class="bk-primary-button"]',
    SAVE_MSG: '.bk-alert.alert.ng-isolate-scope.bk-alert-success.bk-alert-open-animation',
    ADD_FILTER: '.bk-add-filter',
    OPEN_FILTER_PANEL: '.bk-action-dropdown .bk-add-filter',
    VIZ: '.bk-pinboard-card',
    VIZ_HEADER: '.bk-pinboard-viz-name',
    VIZ_TITLE_CONTAINER: '.bk-viz-title-container',
    VIZ_TITLE: '.bk-editable-input',
    SIZE_SELECTORS: '.bk-dropdown-item .size-selector .size',
    TILE_SIZE_SMALL: '.tile-size-s',
    TILE_SIZE_MEDIUM: '.tile-size-m',
    TILE_SIZE_LARGE: '.tile-size-l',
    TILE_SIZE_LARGE_SMALL: '.tile-size-ls',
    TILE_SIZE_MEDIUM_SMALL: '.tile-size-ms',
    RESET_TRANSFORMS: '.bk-transformed-marker',
    PINBOARD_PLUGIN: '.bk-sharable-item-pinboard-plugin',
    EDIT_DETAILS_BUTTON: '.bk-sharable-item-pinboard-plugin .bk-style-icon-edit',
    HOME_PAGE_PINBOARD_PLUGIN: '.bk-homepage-pinboard-title-bar',
    EMBED_LINK_TEXT: '.bk-embedding-snippet',
    CREATE_PINBORD_DIALOG_TEXT_FIELD: dialog.selectors.MODAL_DIALOG + ' input',
    JOIN_EDIT_DIALOG: '.bk-dialog .bk-join-disambiguation',
    JOIN_EDIT_DIALOG_OPTION: '.bk-dialog .bk-join-disambiguation .bk-mjp-options .bk-form-radio',
    JOIN_PATH_EDIT: '.bk-style-icon-link',
    LOADING_VIZ: '.bk-pinboard-card .bk-loading-indicator',
    PINBOARD_SELECTOR_DROPDOWN: '.bk-pinboard-drop-down',
    PINBOARD_SHARABLE_ITEM: '.bk-sharable-item-pinboard',

    PINBOARD_SELECT_AGGREGATION: '.bk-headline-aggregation-selector a',
    PINBOARD_AGGREGATE_SELECTBOX: '.bk-headline-aggregation-selector a',
    PINBOARD_SELECTBOX_LISTITEM: 'ul[role=\'listbox\'] li:nth-child(1)',
    PINBOARD_SELECTBOX_LISTAVG: 'ul[role=\'listbox\'] li:nth-child(2)',
    PINBOARD_BOX_TEXT: '.bk-headline-content',
    PINBOARD_ACTION_BUTTON: '.bk-action-button-dropdown',
    PINBOARD_MENU_ITEMS: '.bk-action-menu div[ng-repeat=\'action in $ctrl.menuItems\']',
    PINBOARD_UPDATE_BUTTON: '.bk-dropdown-item.bk-action-update',
    ADD_PIN_BUTTON: '.bk-add-to-pinboard.ng-scope',
    SEARCH_PIN_NAME: '.bk-search-input',
    SELECT_PIN_NAME: '.bk-pinboard-name.ng-binding',
    CLICK_LAST_PIN_NAME: '.bk-text.ng-binding.ng-scope',
    PINBOARD_PRIMARY_BUTTON: '.bk-primary-button.bk-button-body',
    PINBOARD_NAV: '.bk-primary-nav-pinboards.bk-selected-nav-item',
    PINBOARD_ALERT_BOX: '.bk-alert.alert.ng-isolate-scope.bk-alert-success.ng-hide',
    PINBOARD_VIZ_VALUE: '.bk-headline-value',
    BACK_COLOR: '[style="background-color:rgba(255, 0, 0, 0.5);"]',
    BLANK_COLOR: '[style="top:38px"] div:nth-child(2)',
    INBOARD_ACTION_BUTTON: '.bk-style-icon-triangle-solid',
    PRESENT:'.bk-dropdown-item.bk-viz-maximize-btn',
    REVENUE_LINE_NUMBER:'.tile-container>div:nth-of-type(1)',
    REVENUE_SHIP_MODE:'.tile-container>div:nth-of-type(2)',
    CLOSE_BUTTON_BARCHAT:'.popup-header a',
    CLOSE_BUTTON_PRESENTMODE:'.bk-close-btn',
    DATA_LABEL: '.bk-pinboard-card.bk-slide-active .highcharts-data-labels.highcharts-tracker > g',
    REVERT_BTN: '.bk-transformed-marker'


};

var locators = {
    PINBOARD_LOADED: by.css(selectors.PINBOARD_LOADED),
    CLOSE_VIZ: by.css(selectors.CLOSE_VIZ),
    COPY_NAME_INPUT: by.css(selectors.COPY_NAME_INPUT),
    EDIT_VIZ: by.css(selectors.EDIT_VIZ),
    MAKE_COPY: by.css(selectors.MAKE_COPY),
    OPEN_FILTER_PANEL: by.css(selectors.OPEN_FILTER_PANEL),
    VIZ: by.css(selectors.VIZ),
    VIZ_HEADER: by.css(selectors.VIZ_HEADER),
    VIZ_TITLE: by.css(selectors.VIZ_TITLE),
    REVENUE_LINE_NUMBER: by.css(selectors.REVENUE_LINE_NUMBER),
    REVENUE_SHIP_MODE: by.css(selectors.REVENUE_SHIP_MODE),
    PRESENT: by.css(selectors.PRESENT),
    CLOSE_BUTTON_PRESENTMODE: by.css(selectors.CLOSE_BUTTON_PRESENTMODE),

    CREATE_PINBORD_DIALOG_TEXT_FIELD: by.css(selectors.CREATE_PINBORD_DIALOG_TEXT_FIELD),
    VIZ_CONTEXT: '.bk-viz-context',

    PINBOARD_SELECT_AGGREGATION: element.all(by.css(selectors.PINBOARD_SELECT_AGGREGATION)).last(),
    PINBOARD_AGGREGATE_SELECTBOX: element.all(by.css(selectors.PINBOARD_AGGREGATE_SELECTBOX)).last(),
    PINBOARD_SELECTBOX_LISTITEM: element(by.css(selectors.PINBOARD_SELECTBOX_LISTITEM)),
    PINBOARD_BOX_TEXT: element.all(by.css(selectors.PINBOARD_BOX_TEXT)).last(),
    PINBOARD_SELECTBOX_LISTAVG: element(by.css(selectors.PINBOARD_SELECTBOX_LISTAVG)),
    PINBOARD_ACTION_BUTTON: element.all(by.css(selectors.PINBOARD_ACTION_BUTTON)).last(),
    PINBOARD_MENU_ITEMS: element.all(by.css(selectors.PINBOARD_MENU_ITEMS)).get(0).element(by.css(selectors.PINBOARD_UPDATE_BUTTON)),
    ADD_PIN_BUTTON: element(by.css(selectors.ADD_PIN_BUTTON)),
    SEARCH_PIN_NAME: element.all(by.css(selectors.SEARCH_PIN_NAME)).last(),
    SELECT_PIN_NAME: element.all(by.css(selectors.SELECT_PIN_NAME)).first(),
    CLICK_LAST_PIN_NAME: element.all(by.css(selectors.CLICK_LAST_PIN_NAME)).last(),
    PINBOARD_PRIMARY_BUTTON: element(by.css(selectors.PINBOARD_PRIMARY_BUTTON)),
    PINBOARD_NAV: element(by.css(selectors.PINBOARD_NAV)),
    PINBOARD_ALERT_BOX: element(by.css(selectors.PINBOARD_ALERT_BOX)),
    PINBOARD_VIZ_VALUE: element(by.css(selectors.PINBOARD_VIZ_VALUE)),
    BACK_COLOR: element(by.css(selectors.BACK_COLOR)),
    BLANK_COLOR: element(by.css(selectors.BLANK_COLOR)),
    INBOARD_ACTION_BUTTON: element(by.css(selectors.INBOARD_ACTION_BUTTON)),
    DATA_LABEL: element(by.css(selectors.DATA_LABEL)),
    REVERT_BTN: element(by.css(selectors.REVERT_BTN))
};

var sizeMenuIndex = {
    SMALL: 0,
    MEDIUM: 1,
    LARGE: 2,
    LARGE_SMALL: 3,
    MEDIUM_SMALL: 4
}

function changeAggregationToAverage() {
    util.waitForAndClick(locators.PINBOARD_SELECT_AGGREGATION).then(function(){
        locators.PINBOARD_SELECTBOX_LISTAVG.click().then(function(){
            locators.PINBOARD_ACTION_BUTTON.click().then(function(){
                (locators.PINBOARD_MENU_ITEMS).click();
            });
        });
    });
}

function pinToIt(val) {
    return util.waitForAndClick(locators.ADD_PIN_BUTTON).then(function(){
        locators.SEARCH_PIN_NAME.sendKeys(val);
        return locators.SELECT_PIN_NAME.click().then(function(){
            return locators.CLICK_LAST_PIN_NAME.click();
        });
    });
}

function openPinboard(pinboardName) {
    blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, pinboardName);
    return util.waitForElement(locators.PINBOARD_LOADED);
}

function createPinboard(pinboardName) {
    element(actionButton.locators.ACTION_BUTTON).click();
    element(locators.CREATE_PINBORD_DIALOG_TEXT_FIELD).sendKeys(pinboardName);
    dialog.clickPrimaryButton();
    openPinboard(pinboardName);
}

function deletePinboard(pinboardName) {
    common.navigation.goToPinboardsSection();
    blinkList.deleteItemsByName(
        blinkList.selectors.ACTIONABLE_LIST_CONTENT, [pinboardName]
    );
    var locator = blinkList.getItemLocatorByName(
        blinkList.selectors.ACTIONABLE_LIST_CONTENT, pinboardName);
    return util.waitForElementToNotBePresent(locator);
}

function save() {
    util.waitForElementToBeClickable(actionButton.locators.ACTION_BUTTON_DROPDOWN);
    element(actionButton.locators.ACTION_BUTTON_DROPDOWN).click();
    util.waitForAndClick(selectors.SAVE_BTN);
    util.expectAndDismissSuccessNotif();
}

function saveAction(name) {
    util.waitForElementToBeClickable(actionButton.locators.ACTION_BUTTON_DROPDOWN);
    element(actionButton.locators.ACTION_BUTTON_DROPDOWN).click();
    browser.sleep(5000);
    util.waitForAndClick(selectors.SAVE_ACTION_BTN);
    util.waitForElement(selectors.SAVE_NAME_TXT);
    $(selectors.SAVE_NAME_TXT).sendKeys(name);
    util.waitForAndClick(selectors.SAVE_BTN_POP_UP);
    util.waitForElement(selectors.SAVE_MSG);
}

function changeAggregationToTotal() {
    return util.waitForAndClick(locators.PINBOARD_SELECT_AGGREGATION).then(function(){
        return locators.PINBOARD_SELECTBOX_LISTITEM.click().then(function(){
            console.log("waiting for text tobe change");
            browser.sleep(5000);
            console.log("wait done");
            return locators.PINBOARD_BOX_TEXT.getText().then(function(text) {
                return text;
            });
        });
    });
}

function getPinboardBoxText() {
    return locators.PINBOARD_BOX_TEXT.getText().then(function(text) {
        return text;
    });
}



function makeCopy(copyName) {
    element(actionButton.locators.ACTION_BUTTON_DROPDOWN).click();
    util.waitForAndClick(locators.MAKE_COPY);
    util.waitForElement(locators.COPY_NAME_INPUT);
    var input = element(locators.COPY_NAME_INPUT);
    input.clear();
    input.sendKeys(copyName);
    element(common.dialog.locators.PRIMARY_DLG_BTN).click();
    return util.waitForElementToNotBePresent(common.dialog.locators.DIALOG);
}

function sharePinboard(pinboardName, principalNames, readOnly) {
    share.openSharePanel(pinboardName);
    return share.selectPrincipalsInSharePanel(principalNames,  readOnly/* readOnly*/);
}

function openFilterPanel() {
    element(actionButton.locators.ACTION_BUTTON_DROPDOWN).click();
    util.waitForAndClick(selectors.ADD_FILTER);
}

function closeFilterPanel() {
    element(by.css(selectors.CLOSE_FILTER_PANEL)).click();
}

// Closes the viz editor.
// - If shouldExpectSaveDialog is true, expects it.
// - If withSave is true, also saves the answer.
function closeVizEditor(shouldExpectSaveDialog, shouldSave) {
    util.waitForAndClick(locators.CLOSE_VIZ);
    if(!!shouldExpectSaveDialog) {
        util.waitForElement(common.dialog.locators.DIALOG);
        if (shouldSave) {
            element(common.dialog.locators.PRIMARY_DLG_BTN).click();
        } else {
            element(common.dialog.locators.SECONDARY_DLG_BTN).click();
        }
        util.waitForElementToNotBePresent(common.dialog.locators.DIALOG);
    }
    return util.waitForElementToNotBePresent(selectors.VIZ_CONTEXT);
}

function closeVizEditorWithSave() {
    return closeVizEditor(true, true);
}

function closeVizEditorWithoutSave() {
    return closeVizEditor(true, false);
}

function closeVizContextIfOpen() {
    /*element(by.css(selectors.VIZ_CONTEXT)).isPresent()
        .then(function (isPresent) {
            if (isPresent) {
                util.waitForAndClick(locators.CLOSE_VIZ);
                dialog.confirmDialogIfOpen();
            }
        });*/
}

function getVizElementByName(vizName) {
    util.waitForElement(locators.VIZ_HEADER);
    return element.all(locators.VIZ).filter(function(el) {  
        return el.element(by.css('.bk-name')).getText()
.then(function(text) { return text === vizName; });
}).first();
}

function waitForVizCountToBe(count) {
    common.util.waitForElementCountToBe(locators.VIZ, count);
}

function waitForChartCountToBe(count) {
    common.util.waitForElementCountToBe(charts.locators.CHART_VIZ, count);
}

function waitForTableCountToBe(count) {
    common.util.waitForElementCountToBe(table.locators.TABLE_VIZ, count);
}

function getAllVizs() {
    return element.all(locators.VIZ);
}

function getVizElementAtIndex(index) {
    return element.all(locators.VIZ).get(index);
}

function openVizDropdownMenu(vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    util.scrollElementIntoViewPort(vizElement);
    browser.actions().mouseMove(vizElement).perform();
    return util.waitForAndClick(vizElement.element(actionButton.locators.ACTION_BUTTON_DROPDOWN));
}

function openSecondVizDropdownMenu(vizElement) {
    vizElement = vizElement || element(locators.REVENUE_SHIP_MODE);
    util.scrollElementIntoViewPort(vizElement);
    browser.actions().mouseMove(vizElement).perform();
    return util.waitForAndClick(vizElement.element(actionButton.locators.ACTION_BUTTON_DROPDOWN));
}

function openEmbeddedViz(vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    openVizDropdownMenu(vizElement);
    $(selectors.COPY_LINK).click();
    util.waitForElement(selectors.EMBED_LINK_TEXT);
    return $(selectors.EMBED_LINK_TEXT).getText().then(function(text) {
        var uri = new URI(text);
        var path = uri.hash().substr(1);
        return common.navigation.goToInAppPath(path);
    });
}

function openVizEditor(vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    openVizDropdownMenu(vizElement);
    return util.waitForAndClick(locators.EDIT_VIZ);
}

function autoAnalyzeViz(vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    openVizDropdownMenu(vizElement);
    return util.waitForAndClick(selectors.AUTO_ANALYZE_VIZ);
}

function resizeViz(size, vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    openVizDropdownMenu(vizElement);
    element.all(by.css(selectors.SIZE_SELECTORS)).get(size).click();
    vizElement.click();
}

function deleteViz(vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    openVizDropdownMenu(vizElement);
    util.waitForAndClick(selectors.DELETE_VIZ);
    dialog.clickPrimaryButton(true);
    util.expectAndDismissSuccessNotif();
}

function startSlideShow(vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    openVizDropdownMenu(vizElement);
    $(selectors.START_SLIDE_SHOW_ON_VIZ).click();
    return util.waitForElement(slideShow.selectors.SLIDE_SHOW_CONTAINER);
}

function waitForLoaded() {
    return util.waitForElement(locators.PINBOARD_LOADED);
}

function chooseJoinPathMapping(mappingName) {
    util.waitForElement(selectors.JOIN_EDIT_DIALOG);
    var locator = by.cssContainingText(selectors.JOIN_EDIT_DIALOG_OPTION, mappingName);
    element(locator).click();
    dialog.clickPrimaryButton(true);
}

/**
 * Switches to a pinboard by choosing it in the pinboard selector.
 */
function switchToPinboard(pinboardName) {
    return uiSelect.changeSelection(
        $(selectors.PINBOARD_SELECTOR_DROPDOWN),
        pinboardName,
        /*should type*/ true
    );
}

function rename(newName) {
    util.mouseMoveToElement(selectors.EDIT_DETAILS_BUTTON);
    util.waitForAndClick(selectors.EDIT_DETAILS_BUTTON);
    util.waitForElement(locators.COPY_NAME_INPUT);
    $(selectors.COPY_NAME_INPUT).sendKeys(newName);
    dialog.clickPrimaryButton();
    util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
}

function getPinboard() {
    return $(selectors.PINBOARD_SHARABLE_ITEM);
}

function openVizContentEditable(vizElement) {
    vizElement = vizElement || element(locators.VIZ);
    util.waitForAndClick(vizElement.$(selectors.VIZ_TITLE_CONTAINER));
}

function waitForRenderedVizCount(renderedVizCount) {
    util.waitForElementCountToBe(selectors.VIZ_HEADER, renderedVizCount);
}

function verifyChartGraphDatalabel(columnCnt) {
    for (var i = 0; i<= columnCnt; i++)
    {
        util.waitForElement(locators.DATA_LABEL);
        var el = $$(selectors.DATA_LABEL).get(i);
        expect(el.isPresent()).toBe(true);
    }
}

module.exports = {
    locators : locators,
    selectors : selectors,
    openPinboard : openPinboard,
    createPinboard : createPinboard,
    deletePinboard : deletePinboard,
    verifyChartGraphDatalabel : verifyChartGraphDatalabel,
    save : save,
    saveAction : saveAction,
    makeCopy : makeCopy,
    openFilterPanel,
    sharePinboard,
    getAllVizs,
    getVizElementByName,
    getVizElementAtIndex,
    waitForVizCountToBe,
    waitForChartCountToBe,
    waitForTableCountToBe,
    closeFilterPanel,
    closeVizEditor : closeVizEditor,
    closeVizEditorWithSave,
    closeVizEditorWithoutSave,
    closeVizContextIfOpen,
    openVizDropdownMenu : openVizDropdownMenu,
    openVizEditor : openVizEditor,
    openSecondVizDropdownMenu : openSecondVizDropdownMenu,
    autoAnalyzeViz,
    openEmbeddedViz,
    resizeViz,
    sizeMenuIndex,
    deleteViz,
    startSlideShow : startSlideShow,
    waitForLoaded : waitForLoaded,
    chooseJoinPathMapping,
    switchToPinboard,
    rename,
    getPinboard,
    openVizContentEditable : openVizContentEditable,
    waitForRenderedVizCount,
    pinToIt,
    changeAggregationToTotal,
    changeAggregationToAverage : changeAggregationToAverage,
    getPinboardBoxText : getPinboardBoxText
};
