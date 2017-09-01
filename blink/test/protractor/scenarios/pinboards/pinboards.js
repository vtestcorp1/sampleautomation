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
    PINBOARD_SHARABLE_ITEM: '.bk-sharable-item-pinboard'
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
    CREATE_PINBORD_DIALOG_TEXT_FIELD: by.css(selectors.CREATE_PINBORD_DIALOG_TEXT_FIELD),
    VIZ_CONTEXT: '.bk-viz-context'
};

var sizeMenuIndex = {
    SMALL: 0,
    MEDIUM: 1,
    LARGE: 2,
    LARGE_SMALL: 3,
    MEDIUM_SMALL: 4
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
    element(actionButton.locators.ACTION_BUTTON_DROPDOWN).click();
    util.waitForAndClick(selectors.SAVE_BTN);
    util.expectAndDismissSuccessNotif();
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
    element(by.css(selectors.VIZ_CONTEXT)).isPresent()
        .then(function (isPresent) {
            if (isPresent) {
                util.waitForAndClick(locators.CLOSE_VIZ);
                dialog.confirmDialogIfOpen();
            }
        });
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
    browser.sleep(5000);
    openVizDropdownMenu(vizElement);
    browser.sleep(5000);
    $(selectors.START_SLIDE_SHOW_ON_VIZ).click();
    browser.sleep(5000);
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

module.exports = {
    locators,
    selectors,
    openPinboard,
    createPinboard,
    deletePinboard,
    save,
    makeCopy,
    openFilterPanel,
    sharePinboard,
    getAllVizs,
    getVizElementByName,
    getVizElementAtIndex,
    waitForVizCountToBe,
    waitForChartCountToBe,
    waitForTableCountToBe,
    closeFilterPanel,
    closeVizEditor,
    closeVizEditorWithSave,
    closeVizEditorWithoutSave,
    closeVizContextIfOpen,
    openVizDropdownMenu,
    openVizEditor,
    autoAnalyzeViz,
    openEmbeddedViz,
    resizeViz,
    sizeMenuIndex,
    deleteViz,
    startSlideShow,
    waitForLoaded,
    chooseJoinPathMapping,
    switchToPinboard,
    rename,
    getPinboard,
    openVizContentEditable,
    waitForRenderedVizCount
};
