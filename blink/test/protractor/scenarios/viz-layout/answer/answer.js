/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var actions = require('../../actions-button.js');
var blinkList = require('../../list/blink-list.js');
var leftPanel = require('../../sage/data-panel/data-panel.js');
var charts = require('../../charts/charts.js');
var contentEditable = require('../../widgets/content-editable.js');
var dialog = require('../../dialog.js');
var sage = require('../../sage/sage.js');
var table = require('../../table/table.js');
var common = require('../../common.js');
var util = common.util;
var sprintf = require('sprintf-js').sprintf;
var dataSourcePreview = require('../../data-source-preview/data-source-preview.js');

// Various selectors to be used on answer page.
var selectors = {
    APP_CONTAINER: '.bk-app-container',
    VIZ: '.bk-data-viz',
    EMPTY_PAGE_PLACEHOLDER: '.bk-empty-answer-placeholder-container',
    VIZ_NO_CONTENT_PLACEHOLDER: '.bk-data-viz .bk-no-content-placeholder',
    CHART_DATA_NOT_SUPPORTED_PLACEHOLDER: '.bk-viz-chart .chartDataNotSupported',
    CHART_TYPE: '.bk-chart-selector-button .bk-viz-icon-button',
    CHART_SELECTOR_PANEL: '.bk-chart-selector-panel',
    CHART_SELECTOR_PANEL_OPTION: '.bk-viz-type-selector[chart-type="%s"]',
    CHART_SELECTOR_PANEL_OPTION_DISABLED: '.bk-answer-viz-type-selector ' +
        '.bk-viz-type-selector.bk-disabled-chart-type-option[chart-type="%s"]',
    CHART_SELECTOR_PANEL_OPTIONS_DISABLED: '.bk-answer-viz-type-selector ' +
        '.bk-viz-type-selector.bk-disabled-chart-type-option',
    CHART_SELECTOR_PANEL_OPTIONS_SELECTED: '.bk-answer-viz-type-selector ' +
        '.bk-viz-type-selector.bk-viz-type-selected',
    HEADLINE: '.bk-headline-content',
    HEADLINE_VALUE: '.bk-headline-value',
    HEADLINE_COLUMN_NAME: '.column-name',
    LOADER: '.bk-viz-context .bk-loader',
    TABLE_TYPE: '.bk-table-type-selector-container',
    ADD_TO_PB:  '.bk-answer-page .bk-title-panel .bk-add-to-pinboard',
    PINBOARD_DROP_DOWN: '.bk-viz-pinner-modal',
    NEW_PB_INPUT: '.bk-new-pinboard-input .bk-input',
    PB_SEARCH_INPUT: '.bk-viz-pinner-modal .bk-search-input',
    PB_LIST_ITEM: '.bk-pinboard-list .bk-pinboard-row',
    ANSWER_SAVE_NAME: '.bk-answer-save-dialog input',
    ANSWER_TITLE: '.bk-answer-title',
    ANSWER_TITLE_INPUT: '.bk-answer-title .bk-editable-input[name="%s"]',
    TOGGLE_VIZ_SELECTOR: '.bk-toggle-chart-selector-display',
    VIZ_TYPE_SELECTOR: '.bk-answer-viz-type-selector',
    VIZ_EDITOR_SELECTOR: '.bk-chart-editor-container'
};
selectors.ANSWER_PAGE = '.bk-answer-page';
selectors.PAGE_CONTENT = util.joinSelectors(selectors.ANSWER_PAGE, '.page-content');
selectors.ANSWER_CONTENT = util.joinSelectors(selectors.PAGE_CONTENT, '.bk-answer-content');
selectors.TITLE_PANEL = util.joinSelectors(selectors.ANSWER_CONTENT, '.bk-title-panel');
selectors.TOGGLE_VIZ_EDITOR_SELECTOR = util.joinSelectors(
    selectors.TITLE_PANEL,
    '.bk-toggle-chart-editor-display'
);
selectors.PINBOARD_DROP_DOWN_SHOW_NEW_BTN = selectors.PINBOARD_DROP_DOWN + ' .bk-show-create-pinboard-btn';
selectors.PINBOARD_DROP_DOWN_ADD_BTN = selectors.PINBOARD_DROP_DOWN + ' .bk-create-pinboard-btn';

// Locators corresponding to selectors defined above.
var locators = {
    VIZ: by.css(selectors.VIZ),
    CHART_TYPE: by.css(selectors.CHART_TYPE),
    HEADLINE: by.css(selectors.HEADLINE),
    HEADLINE_VALUE: by.css(selectors.HEADLINE_VALUE),
    HEADLINE_COLUMN_NAME: by.css(selectors.HEADLINE_COLUMN_NAME),
    LOADER: by.css(selectors.LOADER),
    TABLE_TYPE: by.css(selectors.TABLE_TYPE),
    ADD_TO_PB:  by.css(selectors.ADD_TO_PB)
};

// Selects table viz to be displayed on answer-page.
function selectTableType() {
    util.waitForAndClick(locators.TABLE_TYPE);
    table.waitForTable();
}

function selectDefaultChartType() {
    util.waitForAndClick(selectors.TOGGLE_VIZ_SELECTOR);
    waitForChartToLoad();
}

function openVizTypeSelectorPanel() {
    $(selectors.VIZ_TYPE_SELECTOR).isPresent().then(function(isPresent) {
        if (!isPresent) {
            util.waitForAndClick(selectors.TOGGLE_VIZ_SELECTOR);
            common.util.waitForElement(selectors.VIZ_TYPE_SELECTOR);
        }
    });
}

function closeVizTypeSelectorPanel() {
    $(selectors.VIZ_TYPE_SELECTOR).isPresent().then(function(isPresent) {
        if (isPresent) {
            util.waitForAndClick(selectors.TOGGLE_VIZ_SELECTOR);
            common.util.waitForElementToNotBePresent(selectors.VIZ_TYPE_SELECTOR);
        }
    });
}

function openVizEditorPanel() {
    $(selectors.VIZ_EDITOR_SELECTOR).isPresent().then(function(isPresent) {
        if (!isPresent) {
            util.waitForAndClick(selectors.TOGGLE_VIZ_EDITOR_SELECTOR);
            common.util.waitForElement(selectors.VIZ_EDITOR_SELECTOR);
        }
    });
}

function closeVizEditorPanel() {
    $(selectors.VIZ_EDITOR_SELECTOR).isPresent().then(function(isPresent) {
        if (isPresent) {
            util.waitForAndClick(selectors.TOGGLE_VIZ_EDITOR_SELECTOR);
            common.util.waitForElementToNotBePresent(selectors.VIZ_EDITOR_SELECTOR);
        }
    });
}

function isChartTypeOptionEnabled(chartType) {
    return $(sprintf(selectors.CHART_SELECTOR_PANEL_OPTION_DISABLED, chartType)).isPresent()
        .then(function(isPresent) {
            return !isPresent;
        });
}

function isChartTypeOptionDisabled(chartType) {
    return $(sprintf(selectors.CHART_SELECTOR_PANEL_OPTION_DISABLED, chartType)).isPresent();
}

function navigateToChartType(chartType) {
    selectDefaultChartType();
    openVizTypeSelectorPanel();
    if (chartType === 'TABLE') {
        $(table.selectors.TABLE_SELECTOR_BUTTON).click();
    } else {
        $(sprintf(selectors.CHART_SELECTOR_PANEL_OPTION, chartType)).click();
    }
    closeVizTypeSelectorPanel();
}

function navigateAndWaitForChartType(chartType, chartTypeToWaitFor) {
    navigateToChartType(chartType);
    if (chartType === 'TABLE') {
        table.waitForTable();
    } else {
        waitForChartToLoad(chartTypeToWaitFor ? chartTypeToWaitFor : chartType);
    }
}

// Synchronously waits for answer to load.
function waitForAnswerToLoad(optionalTimeout) {
    util.waitForElementToNotBePresent(selectors.LOADER);
    return util.waitForElement(selectors.TOGGLE_VIZ_SELECTOR, optionalTimeout);
}

// Synchronously waits for vizs to appear
function waitForVizs(optionalTimeout) {
    util.waitForElementToNotBePresent(selectors.LOADER);
    return util.waitForElement(locators.VIZ, optionalTimeout);
}

function waitForChartToLoad(chartType) {
    if (chartType) {
        return common.util.waitForElement(sprintf(charts.selectors.CHART_VIZ_OF_TYPE, chartType));
    }
    return common.util.waitForElement(charts.selectors.CHART_VIZ);
}

function waitForEmptyAnswer() {
    common.util.waitForVisibilityOf(selectors.EMPTY_PAGE_PLACEHOLDER);
}

function waitForEmptyVizToLoad() {
    common.util.waitForVisibilityOf(selectors.VIZ_NO_CONTENT_PLACEHOLDER);
}

function waitForChartDataNotSupported() {
    common.util.waitForVisibilityOf(selectors.CHART_DATA_NOT_SUPPORTED_PLACEHOLDER);
}

// Opens answer named @answerName.  Assumes that the app is currently at
// saved answer list page.
function openAnswerByName (answerName) {
    blinkList.selectItemByName(
        blinkList.selectors.ACTIONABLE_LIST_CONTENT, answerName);
    return waitForAnswerToLoad();
}

function doAdhocQuery(query, sources, vizType) {
    common.navigation.goToQuestionSection();
    common.util.waitForElement(by.css('.bk-sage'));
    leftPanel.deselectAllSources();
    leftPanel.openAndChooseSources(sources);
    leftPanel.clickDone();
    sage.sageInputElement.enter(query);
    waitForAnswerToLoad();
    sage.sageInputElement.hideDropdown();
    if(vizType === charts.vizTypes.CHART) {
        navigateAndWaitForChartType(charts.chartTypes.COLUMN);
    } else {
        selectTableType();
    }
}

function doAdhocQueryFromPreSelectedSources(query, vizType) {
    common.navigation.goToQuestionSection();
    queryAndWaitForAnswer(query);
    if(vizType === charts.vizTypes.CHART) {
        navigateAndWaitForChartType(charts.chartTypes.COLUMN);
    } else {
        selectTableType();
    }
}

/**
 * Waits for answer to appear, regardless of whether it is table or chart.
 * @param query
 */
function queryAndWaitForAnswer(query) {
    common.util.waitForElement(by.css('.bk-sage'));
    sage.sageInputElement.enter(query);
    waitForAnswerWithQuery(query);
}

/**
 * Query and waits for a table viz to appear, will throw error if chart appears instead.
 * @param query
 */
function queryAndWaitForTable(query) {
    queryAndWaitForAnswer(query);
    table.waitForTable();
}

/**
 * Query and waits for a chart to appear, will throw error if table appers instead. If chart type is
 * given it will wait for that particular chart type, will throw error if a different chart type
 * appears
 * @param query
 * @param chartType
 */
function queryAndWaitForChart(query, chartType) {
    queryAndWaitForAnswer(query);
    charts.waitForChartVizToLoad(chartType);
}

function addShowingVizToNewPinboard(name) {
    $(selectors.ADD_TO_PB).click();
    util.waitForAndClick(selectors.PINBOARD_DROP_DOWN_SHOW_NEW_BTN);
    util.waitForElement(selectors.NEW_PB_INPUT);
    $(selectors.NEW_PB_INPUT).sendKeys(name);
    browser.ignoreSynchronization = true;
    $(selectors.PINBOARD_DROP_DOWN_ADD_BTN).click();
    util.waitForElement(by.cssContainingText(selectors.PB_LIST_ITEM, name));
    dialog.closeDialog();
    browser.ignoreSynchronization = false;
}

function addShowingVizToPinboard(name) {
    $(selectors.ADD_TO_PB).click();
    return makeSelectionInPinboard(name);
}

function makeSelectionInPinboard(name) {
    util.waitForElement(selectors.PINBOARD_DROP_DOWN);
    $(selectors.PB_SEARCH_INPUT).isDisplayed().then(function(isSearchAvlbl) {
        if(isSearchAvlbl) {
            $(selectors.PB_SEARCH_INPUT).sendKeys(name);
        }
        util.waitForAndClick(by.cssContainingText(selectors.PB_LIST_ITEM, name));
        return element(common.dialog.locators.PRIMARY_DLG_BTN).click();
    });
    return dialog.waitForDialogAbsent();
}

function waitForPinboardAbsentInPinningDropdown(name) {
    $(selectors.ADD_TO_PB).click();
    util.waitForAndClick(selectors.PINBOARD_DROP_DOWN_SHOW_NEW_BTN);
    $(selectors.PB_SEARCH_INPUT).isDisplayed().then(function(isSearchAvlbl) {
        if (isSearchAvlbl) {
            $(selectors.PB_SEARCH_INPUT).sendKeys(name);
        }
    });
    util.waitForElementToNotBePresent(by.cssContainingText(selectors.PB_LIST_ITEM, name));
    return element(common.dialog.locators.PRIMARY_DLG_BTN).click();
}

function queryFromAllWorksheets(username, password, query) {
    util.reLogin(username, password);
    common.navigation.goToQuestionSection();
    leftPanel.selectAllWorksheets();
    sage.sageInputElement.enter(query);
    waitForAnswerToLoad();
    selectTableType();
}

function queryFromAllTables(username, password, query) {
    util.reLogin(username, password);
    common.navigation.goToQuestionSection();
    leftPanel.selectAllTables();
    sage.sageInputElement.enter(query);
    waitForAnswerToLoad();
    selectTableType();
}

function queryFromSelectedSources(username, password, query, sourcesList) {
    util.reLogin(username, password);
    common.navigation.goToQuestionSection();
    leftPanel.deselectAllSources();
    leftPanel.openAndChooseSources(sourcesList);
    leftPanel.clickDone();
    sage.sageInputElement.enter(query);
    waitForAnswerToLoad();
    selectTableType();
}

function queryAndWaitForSageIndexing(query) {
    var hasAnswer = false;
    sage.sageInputElement.enter(query);
    return util.waitForConditionAndPerformAction(
        waitForAnswerToLoad(),
        function () {
            sage.sageInputElement.enter('');
            sage.sageInputElement.enter(query);
        },
        5000,
        60 * 1000
    );
}

var createAndSaveAnswer = function(sageQuery, answerName, dontWaitForVizLoad, vizType) {
    common.navigation.goToQuestionSection();
    sage.sageInputElement.enter(sageQuery);
    if(!!vizType) {
        waitForVizs();
        (vizType === charts.vizTypes.TABLE)
            ? selectTableType()
            : navigateAndWaitForChartType(charts.chartTypes.COLUMN);
    }
    if (!dontWaitForVizLoad) {
        waitForVizs();
    }
    saveCurrentUnsavedAnswer(answerName);
};

var saveCurrentUnsavedAnswer = function(answerName) {
    actions.selectActionButtonAction(actions.actionLabels.SAVE);
    util.waitForVisibilityOf(selectors.ANSWER_SAVE_NAME);
    $(selectors.ANSWER_SAVE_NAME).sendKeys(answerName);
    dialog.clickPrimaryButton();
    util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
};

function waitForAnswerTitle(title) {
    util.waitForElement(sprintf(selectors.ANSWER_TITLE_INPUT, title));
}

function saveCurrentAnswer(answerName) {
    actions.selectActionButtonAction(actions.actionLabels.SAVE);
    $(selectors.ANSWER_SAVE_NAME).isPresent().then(function(isPresent) {
        if(isPresent) {
            $(selectors.ANSWER_SAVE_NAME).sendKeys(answerName);
            dialog.clickPrimaryButton();
        }
        actions.waitForBusyActionToComplete();
        util.waitForInvisibilityOf(util.selectors.LOADING_INDICATOR_OVERLAY);
    });
}

var makeACopy = function(answerName) {
    actions.selectActionButtonAction(actions.actionLabels.MAKE_A_COPY);
    util.waitForVisibilityOf(selectors.ANSWER_SAVE_NAME);
    $(selectors.ANSWER_SAVE_NAME).sendKeys(answerName);
    dialog.clickPrimaryButton();
};

function verifyTableDataFromAdhocQuery(tableValues) {
    var slickCellContents = element.all(by.css('.slick-cell-content'));
    for (var i = 0; i < tableValues.length; i++) {
        expect(slickCellContents.get(i).getText()).toBe(tableValues[i]);
    }
}

function verifyTableHeaderColumnNames(columnNames) {
    var slickColumnNames = element.all(by.css('.slick-column-name'));
    for (var i = 0; i < columnNames.length; i++) {
        expect(slickColumnNames.get(i).getText()).toBe(columnNames[i]);
    }
}

function verifyTableHeaderColumnSelectors(columnSelectors) {
    var slickColumnSelectors = element.all(by.css('.slick-header-column'));
    for (var i = 0; i < columnSelectors.length; i++) {
        if (columnSelectors[i] != '') {
            expect(slickColumnSelectors.get(i).element(by.css('.chosen-single')).getText()).toBe(columnSelectors[i]);
        } else {
            expect(slickColumnSelectors.get(i).element(by.css('.chosen-single')).isPresent()).toBe(false);
        }
    }
}

function updateSavedAnswer() {
    return actions.selectActionButtonAction(actions.actionLabels.SAVE);
}

function showDataPanel() {
    dataSourcePreview.clickDataSourcePreview();
}

var getAnswerQueryScript = 'var answerDocElem = $(\'.answer-document\');' +
    'var answerDocScope = answerDocElem && answerDocElem.scope();' +
    'var answerDocCtrl = answerDocScope && answerDocScope.$ctrl;' +
    'var answerDocumentModel = answerDocCtrl && answerDocCtrl.answerDocumentModel;' +
    'var answerModel = answerDocumentModel && answerDocumentModel.getCurrentAnswerModel();' +
    'var currentQuery = answerModel && answerModel.getQueryTextFromTokens();' +
    'return currentQuery || \'\';';

function waitForAnswerWithQuery(query) {
    return common.util.waitForCondition(function () {
        return browser.executeScript(getAnswerQueryScript)
            .then(function(domQuery) {
                return domQuery.trim().toLowerCase() === query.trim().toLowerCase();
            });
    });
}

function waitForAnswerToContainColumn(columnName) {
    return common.util.waitForCondition(function () {
        return browser.executeScript(getAnswerQueryScript)
            .then(function(domQuery) {
                return domQuery.trim().toLowerCase().includes(columnName.toLowerCase());
            });
    });
}

var getPhrasesScript = 'var sageInputElem = $(\'input.bk-sage-real-input\');' +
    'var sageScope = sageInputElem.scope();' +
    'return sageScope.sageClient.getSageModel().queryFragments;';

function deleteFirstTokenAndWaitForLoad() {
    return browser.executeScript(getPhrasesScript)
        .then(function (initialPhrases) {
            sage.sageInputElement.deleteFirstToken();
            var queryWithoutInitialPhrase = initialPhrases.slice(1)
                .map(function(phrase) {return phrase._fullText}).join(' ');
            waitForAnswerWithQuery(queryWithoutInitialPhrase);
        });
}

function waitForAnswerName(name) {
    common.util.waitForElement(by.css(selectors.ANSWER_TITLE));
    contentEditable.waitForInputText(selectors.ANSWER_TITLE, name);
}

function clearVizDisplayPreference() {
    util.waitForElement(selectors.APP_CONTAINER);
    browser.executeScript(function() {
        window.angular.element(window.document).injector().invoke(
            function(sessionService, util, blinkConstants) {
                sessionService.removeUserPreferences(
                    blinkConstants.ANSWER_DISPLAY_MODE_PREFERENCE_KEY
                );
            }
        );
    });
}

function setVizDisplayPreferenceToTable() {
    browser.executeScript(function() {
        window.angular.element(window.document).injector().invoke(
            function(sessionService, util, blinkConstants) {
                sessionService.setPreference(
                    blinkConstants.ANSWER_DISPLAY_MODE_PREFERENCE_KEY,
                    util.answerDisplayModes.TABLE
                );
            }
        );
    });
}

function setVizDisplayPreferenceToChart() {
    // Since the function we pass here is serialized and and executed in a different process,
    // it can't access any variable of outer function. That's why we could not have displayMode
    // as parameter and avoid duplicate code.
    browser.executeScript(function() {
        window.angular.element(window.document).injector().invoke(
            function(sessionService, util, blinkConstants) {
                sessionService.setPreference(
                    blinkConstants.ANSWER_DISPLAY_MODE_PREFERENCE_KEY,
                    util.answerDisplayModes.CHART
                );
            }
        );
    });
}

function setVizTitle(title) {
    return contentEditable.enterName(selectors.ANSWER_TITLE, title);
}

function navigateToHomeWithoutSave() {
    element(common.navigation.locators.HOME).click();
    dialog.waitForDialogPresent();
    dialog.confirm();
    return common.util.waitForElement(common.navigation.locators.HOME_SAGE_BAR);
}

module.exports = {
    selectors: selectors,
    locators: locators,
    createAndSaveAnswer: createAndSaveAnswer,
    saveCurrentAnswer: saveCurrentAnswer,
    saveCurrentUnsavedAnswer: saveCurrentUnsavedAnswer,
    waitForAnswerTitle: waitForAnswerTitle,
    selectTableType: selectTableType,
    selectDefaultChartType: selectDefaultChartType,
    navigateAndWaitForChartType: navigateAndWaitForChartType,
    openVizTypeSelectorPanel: openVizTypeSelectorPanel,
    closeVizTypeSelectorPanel: closeVizTypeSelectorPanel,
    openVizEditorPanel: openVizEditorPanel,
    closeVizEditorPanel: closeVizEditorPanel,
    makeSelectionInPinboard: makeSelectionInPinboard,
    isChartTypeOptionEnabled: isChartTypeOptionEnabled,
    isChartTypeOptionDisabled: isChartTypeOptionDisabled,
    navigateToChartType: navigateToChartType,
    waitForAnswerToLoad: waitForAnswerToLoad,
    waitForVizs: waitForVizs,
    waitForChartToLoad: waitForChartToLoad,
    waitForEmptyVizToLoad: waitForEmptyVizToLoad,
    waitForChartDataNotSupported: waitForChartDataNotSupported,
    openAnswerByName: openAnswerByName,
    addShowingVizToNewPinboard: addShowingVizToNewPinboard,
    addShowingVizToPinboard: addShowingVizToPinboard,
    waitForPinboardAbsentInPinningDropdown: waitForPinboardAbsentInPinningDropdown,
    doAdhocQuery: doAdhocQuery,
    doAdhocQueryFromPreSelectedSources: doAdhocQueryFromPreSelectedSources,
    queryFromAllTables: queryFromAllTables,
    queryFromAllWorksheets: queryFromAllWorksheets,
    queryFromSelectedSources: queryFromSelectedSources,
    queryAndWaitForSageIndexing: queryAndWaitForSageIndexing,
    verifyTableDataFromAdhocQuery: verifyTableDataFromAdhocQuery,
    verifyTableHeaderColumnNames: verifyTableHeaderColumnNames,
    verifyTableHeaderColumnSelectors: verifyTableHeaderColumnSelectors,
    showDataPanel: showDataPanel,
    updateSavedAnswer: updateSavedAnswer,
    queryAndWaitForAnswer: queryAndWaitForAnswer,
    queryAndWaitForTable: queryAndWaitForTable,
    queryAndWaitForChart: queryAndWaitForChart,
    makeACopy: makeACopy,
    waitForAnswerWithQuery: waitForAnswerWithQuery,
    waitForAnswerToContainColumn: waitForAnswerToContainColumn,
    removeFirstTokenAndWaitForLoad: deleteFirstTokenAndWaitForLoad,
    waitForAnswerName: waitForAnswerName,
    waitForEmptyAnswer: waitForEmptyAnswer,
    clearVizDisplayPreference: clearVizDisplayPreference,
    setVizDisplayPreferenceToTable: setVizDisplayPreferenceToTable,
    setVizDisplayPreferenceToChart: setVizDisplayPreferenceToChart,
    setVizTitle: setVizTitle,
    navigateToHomeWithoutSave: navigateToHomeWithoutSave
};
