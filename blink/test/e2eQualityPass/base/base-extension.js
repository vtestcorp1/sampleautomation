/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)

 * @fileoverview
 * this file extends the base.js file in e2e tests. It contains basic functions not covered in the base.js file.
 */

/*eslint no-undef: 0 */
'use strict';


/* test data */
var TPCH_TABLES = ['CUSTOMER', 'LINEORDER', 'DATE', 'PART', 'SUPPLIER'];
var M2M_CHASM_TABLES_COMPLEX = [
    'chasm_channel_general', 'chasm_products_general', 'chasm_products_detail_general',
    'chasm_sales_general', 'chasm_sales_detail_general', 'chasm_purchases_general',
    'chasm_purchases_detail_general', 'chasm_marketing_general', 'chasm_date_general'
];
var M2M_CHASM_TABLES_TRADES = [
    'chasm_securities_trades', 'chasm_bid_event_trades', 'chasm_ask_event_trades',
    'chasm_private_transaction_event_trades', 'chasm_news_event_trades'
];
var M2M_CHASM_TABLES_RETAILER = [
    'chasm_menu_items_retailer', 'chasm_ingredients_retailer', 'chasm_purchases_retailer',
    'chasm_sales_retailer', 'chasm_recipes_retailer'
];
var TPCH_WORKSHEET_NAME = ['TPCH worksheet keyword test'];
var FORMULA_TEST_DATA = 'Formula_Test_Data_Datetime';
var METAPHONE_TEST_DATA = 'Metaphone';
var SHOW_DATA_LABEL_CHECKED = '.bk-checkbox-container .bk-checkbox.bk-checked';
var TOP_MENU_LABEL_PANEL = '.top-list-filters .bk-label-panel';


/* general */
var COL_ITEM = '.bk-source-item .bk-columns-list .bk-column-item',
    FIRST_ELEMENT = '.bk-list-content ul li:eq(0)',
    DELETE_ICON = '.bk-style-icon-delete',
    CONFIRM_BTN = '.modal-footer .bk-confirm-btn',
    HOME_ACTIVITY = '.bk-home-activity',
    FIRST_ITEM = ' ul li:eq(0)',
    FILTER_ITEMS = '.bk-filter-list-items',
    FILTER_ITEM = '.bk-filter-list-item',
    FILTER_TEXT = '.filter-title-text',
    FILTER_RANGE = '.bk-range-select',
    DONE_BTN = '.bk-dialog-ok-btn',
    FILTER_CHECKBOX = 'span.bk-checkbox',
    DROPDOWN_SELECTION = '.bk-select-box .bk-op-selector',
    LEFT_PANE = '.bk-sage-data-container .bk-sage-data',
    FILTER_PANE = '.bk-sage-data .bk-filters-container .bk-open-btn',
    TABLE_ITEM = '.bk-columns-body-section .bk-source-list .bk-source-item',
    EXPAND_BTN = '.bk-sage-data-container .bk-sage-data-expand-btn-inner span',
    TABLE_CHECKBOX = '.right-pane .header-rt .bk-checkbox',
    CHOOSE_SOURCES_DONE_EL = '.bk-secondary-button:contains(Done)',
    DATASET_LABEL = '.bk-data-scope .bk-label-container .bk-label',
    CHART_LEGEND = '.bk-viz-chart .bk-legend',
    SELECTED_VIZ = '.selected .bk-viz-icon',
    VIZ_SELECTION = 'bk-style-icon-',
    MAXIMIZATION = ' .bk-viz-maximize-btn',
    CLOSE_MAXIMIZATION = '.bk-slide-show-navigator .bk-btn-blue',
    TABLE_COLUMN_HEADER = '.slick-header-columns',
    SAGE_DROPDOWN = '.bk-dropdown-list',
    EXPLORE_ALL_DATA = '.bk-explore-data',
    METAITEM_HEADER_TITLE = '.bk-editable.bk-full-width',
    EXPANDED_COLUMNS_SEL = '.bk-source-list .bk-list-item',
    SAGE_LOCK_SEL = '.bk-style-icon-lock',
    TABLE_FILTER_BTN = ' .bk-column-menu-button',
    TBL_DRILL_DOWN = ' .bk-viz-level-drill-btn',
    TBL_DOWNLOAD = ' .bk-style-icon-download',
    TBL_ADD_TO_PINBOARD = ' .bk-pinboard-drop-down',
    TBL_MAXIMIZE = ' .bk-viz-maximize-btn',
    EXPLORE_DATA_ICON = '.bk-context-dialog',
    GROUP_CHECKBOX_ICON = '.group-checkbox',
    HEADER_NAME_ROW = '.bk-userdata-header-row td:visible input',
    HEADER_TYPE_ROW_VALUES = '.bk-userdata-header-row:eq(1) .bk-cell-content',
    DATA_ROW = '.bk-userdata-data-row',
    DATA_ROW_CELLS = DATA_ROW + ' .bk-cell-content:visible',
    ERROR_DATA_CELL = '.bk-error-cell',
    NEW_ACTION_ITEMS = '.bk-new-action-item',
    TOP_LEVEL_FILTERS = '.bk-top-menu-filters li',
    IMPORT_DATA_EL = contains(NEW_ACTION_ITEMS, 'Import data'),
    CREATE_PINBOARD_EL = '.pinboard-new-button bk-primary-button',
    FORMULA_DIALOG = '.bk-formula-editor-popup',
    WORKSHEET_COLUMNS = '.bk-table-container .ui-widget-content',
    SINGLE_CELL_SAGE_OUTPUT = '.bk-viz-content .grid-canvas .ui-widget-content .l0',
    WORKSHEET_EDIT_BTN = '.bk-explorer-header .bk-metadata-edit',
    ADMIN_ROUTE = '/admin',
    PAGE_URLS = ['/answers', '/pinboards', '/worksheets', '/importeddata', '/tables', '/admin'],
    META_ITEMS = '.bk-list-content li',
    TOP_MENU_LABEL_PANEL = '.top-list-filters .bk-label-panel',
    ACTION_ITEM_LABEL_PANEL = '.bk-action-container .bk-label-panel',
    VIEW_PERMISSION_TYPE = 'Can View',
    EDIT_PERMISSION_TYPE = 'Can Edit',
    SHARE_DIALOG = '.bk-share-dialog',
    SHARE_DIALOG_ADD_USER_SELECT = SHARE_DIALOG + ' .bk-add-users .bk-multiselect-input select',
    SHARE_WS_BTN = '.bk-secondary-button[button-text=Share]',
    ANSWER_PERMISSION_LIST = '.bk-permission-list ul li',
    SPECIFIC_COLUMN_SIDEBAR = '.bk-sidebar ul li',
    DIALOG_CHECKBOX_LIST = '.bk-checkbox-list li',
    USER_GROUP_ACTION_CONTAINER = '.bk-action-container',
    USER_GROUP_ACTION_LIST  = '.bk-actionable-list ul li',
    LIST_ITEM = '.bk-list-container .bk-list-content li',
    CREATE_USER_GROUP_CONTAINER = '.bk-new-action-item',
    ACTIVITY_TAB = '.bk-slider-btn',
    NUM_PERMISSION_TYPES = 4,
    INNER_JOIN = 'Inner join',
    LEFT_JOIN = 'Left outer join',
    PROGRESSIVE_JOIN = 'progressive',
    FULL_JOIN = 'all joins';


function waitForNotContain(selector, message) {
    return waitFor(function (appWindow) {
        return appWindow.$(selector).length === 0;
    }, (message || 'waiting for not containing ') + selector);
}

function checkClass(selector, className) {
    // return true if selector has className, else, return false
    return callFunctionWithElement(null, function($body, appWindow, $) {
        return $(selector).hasClass(className);
    });
}

function checkboxContaining(text) {
    return element(contains(DIALOG_CHECKBOX_LIST, text) + ' input');
}

function compressSpaces($e) {
    var text = $e.text();
    text = text.replace(/\r?\n|\r|\s/g, "");
    return text.toLowerCase();
}

function reLoginSimple(username, password) {
    logout();
    input('user.username').enter(username);
    input('password').enter(password);
    element('.bk-login-section .bk-login-btn').click();
}

// search for items (such as an answer or worksheet) by name
function searchByName(name) {
    blinkInput('.bk-search-input').enter(name);
    sleep(1);
}


/* answer */
// expand columns of table in left panel
function expandListArrow (tblName) {
    element(contains('.bk-source-header', tblName) + ' .bk-arrow-collapsed').click();
}

function removeSagePhraseBox(text) {
    element(contains('.bk-boxed-token-layer .bk-boxed-token', text) + ' .bk-cross-btn').click();
}

function openSavedAnswer(answerBook, vizType) {
    answersTab().click();
    answerContaining(answerBook).click();
    vizType = vizType || CHART_VIZ;
    if (vizType == CHART_VIZ){
        waitForHighcharts();
    } else {
        waitForTableAnswerVisualizationMode();
    }
}

function setMetaItemHeaderTextTo(title) {
    element(METAITEM_HEADER_TITLE +  ' .bk-description-edit-dropdown').click();
    // Enter a new title
    blinkInput(METAITEM_HEADER_TITLE + ' input').enter(title);
    blinkInput(METAITEM_HEADER_TITLE + ' input').pressEnter();
}

function waitForSageBarDropdown() {
    waitForElement('.bk-dropdown-wrapper.bk-show');
}

function selectFromSageDropdown(selectVal) {
    element(contains('.bk-dropdown-list li .item-text span span', selectVal)).click();
}

function getRowValues(selectorEl, valueGetter, numFields) {
    return callFunctionWithElement(selectorEl, function($inputs, window, $){
        var displayedNames = [], $targets;
        if (!numFields) {
            $targets = $inputs;
        } else {
            $targets = $inputs.slice(0, numFields);
        }
        $targets.each(function(){
            var value = valueGetter($(this));
            displayedNames.push(value);
        });
        return displayedNames;
    });
}

function verifyAnswerTableData(data, numFields) {
    // example: data = '01/13/2012,IKEA,113.91,debit,Furnishings,BUSINESS CHECKING'
    var ANSWER_CELLS = '.ui-widget-content .slick-cell';
    var answerCellElement = element(ANSWER_CELLS);
    if (typeof data === 'string') {
        expect(getRowValues(answerCellElement, function($e){
            return $e.text().trim();
        }, numFields)).toMatch(data.split(','));
    } else {
        expect(getRowValues(answerCellElement, function($e){
            return $e.text().trim();
        }, numFields)).toMatch(data);
    }
}

function selectSageSources(names, listType) {
    goToAnswer();
    deselectAllSources();
    names.each(function(name) {
        callFunctionWithElement(null, function($body, window, $) {
            $(sageDataSourceItemSelector(name, listType)).click(); // default is table;
        });
    });
}

function checkTableResult(tables, query, numFields, expectedResult) {
    selectSageSources(tables);
    sageInputElement().enter(query);
    waitForTableAnswerVisualizationMode();
    verifyAnswerTableData(expectedResult, numFields);
}

function chooseSourcesBtn() {
    return element('.bk-sources-container .bk-btn:contains(Choose sources)');
}

function vizTitleInput(vizSelector) {
    return vizTitle(vizSelector) + ' .bk-editable-input';
}

function chooseSourcesDoneBtn() {
    return element('.header .bk-btn-blue');
}

function selectSourceFromSticker(sticker) {
    goToAnswer();
    deselectAllSources();
    chooseSourcesBtn().click();
    callFunctionWithElement(null, function($body, appWindow, $) {
        var $el = $('.bk-data-scope .bk-label-container .bk-label');
        if (!$el.filter(function() {return $(this).find('.bk-editable-text').text() === sticker;}).hasClass('bk-active')) {
            $el.filter(function() {return $(this).find('.bk-editable-text').text() === sticker;}).click();
        }
    });
    element('.header-rt .bk-checkbox').click();
    chooseSourcesDoneBtn().click();
}

function saveAnswerAsWorksheetBtn() {
    return element('.bk-submenu-item-label:contains(worksheet)');
}

function saveCurrentAnswerAsWorksheet(worksheetName) {
    saveAnswerAsWorksheetBtn().click();
    callFunctionWithElement(null, function($body, window, $){
        expect(saveDialog().count()).toBe(1);
        input('data.customData.questionHeader').enter(worksheetName);
        primaryDialogBtn().click();
        expect(saveDialog().count()).toBe(0);
    });
}

// click sort the i-th column on table viz
function clickSortCol(colIdx) {
    var col = '.bk-viz-content .slick-header .slick-header-column:eq(' + colIdx + ')';
    element(col).click();
    sleep(1);
}

// verify if check mark appears in the left panel for the given column
function checkCheckmark(colName) {
    return callFunctionWithElement(null, function($body, appWindow, $) {
        return $(COL_ITEM).filter(function() {return $(this).find('.bk-column-name').text() === colName;}).find('.bk-style-icon-checkmark').css('display') === 'inline-block';
    });
}

// add column to the search, default to be double click from the left panel. If type is given, select and click add column
function addCol(name, type) {
    var ADD_COL = '.bk-sage-data .bk-sage-data-columns .bk-add-columns-btn';

    if (!type) {
        element(COL_ITEM + ':contains(' + name + ') span').dblclick();
    }
    else {
        element(COL_ITEM + ':contains(' + name +') div').click();
        element(ADD_COL).click();
    }
    // confirm that column is successfully added as a phrase box in sage bar
    waitForElement('.bk-boxed-token:contains(' + name.toLowerCase() + ')');
}

function deleteColFromLeftPanel(name) {
    callFunctionWithElement(null, function($body, appWindow, $) {
        $(COL_ITEM).filter(function() {return $(this).find('.bk-column-name').text() === name;}).find('.bk-style-icon-x').click();
    });
    waitForNotContain('.bk-boxed-token:contains(' + name.toLowerCase() + ')');
}

// select viz by chart type (e.g. column, bar, ...) or table if type is table
function selectViz(type) {
    var CHART_VIZ_SELECTION = '.bk-chart-selector-button';
    if (type == 'table') {
        element('.bk-style-icon-table').click();
        expect(checkClass(SELECTED_VIZ, VIZ_SELECTION + type.toLowerCase())).toBe(true);
    } else {
        element(CHART_VIZ_SELECTION).click();
        callFunctionWithElement(null, function($body, appWindow, $) {
            if (!$('.ng-scope').hasClass('bk-chart-type-selector-panel')) {
                $(CHART_VIZ_SELECTION).click();
            }
        });
        element(chartTypeButton(type)).click();
        element(CHART_VIZ_SELECTION).click();
        waitForElement('.bk-chart[chart-type=' + type.toUpperCase() + ']');
        callFunctionWithElement(null, function($body, appWindow, $) {
            if ($('.ng-scope').hasClass('bk-chart-type-selector-panel')) {
                $(CHART_VIZ_SELECTION).click();
            }
        });
    }
}

// verify the number of selected data sources
function verifySources(num) {
    if (checkClass('.bk-sharable-item', 'bk-with-sage-data')) {
        element('.bk-style-icon-arrow-left').click();
    }
    var vs = callFunctionWithElement(null, function($body, appWindow, $) {
        return parseInt($(EXPAND_BTN).text(), 10);
    });
    expect(vs).toBe(num);
    element(EXPAND_BTN).click();
}

// verify number and names of table columns in the left panel
function checkColSearch(count, names) {
    function getTblCol(i) {
        return callFunctionWithElement(element(COL_ITEM + ' .bk-column-name.bk-label:eq(' + i + ')'), function($e, window, $) {
            return compressSpaces($e);
        });
    }
    expect(element(COL_ITEM).count()).toBe(count);
    for (var i = 0; i < count; i++) {
        expect(getTblCol(i)).toBe(names[i]);
    }
}

function checkTableName(index, name) {
    var result = callFunctionWithElement(null, function($body, appWindow, $) {
        return $(TABLE_ITEM).filter(function() {return $(this).css('display') === 'list-item' && !$(this).hasClass('bk-disabled');}).find('.bk-source-name')[index].innerHTML.trim();
    });
    expect(result).toBe(name);
}

function checkTableNames(count, names) {
    // check enabled tables
    var result, c = callFunctionWithElement(null, function($body, appWindow, $) {
            return $(TABLE_ITEM).filter(function() {return $(this).css('display') === 'list-item' && !$(this).hasClass('bk-disabled');}).length;
        });
    expect(c).toBe(count);
    for (var i = 0; i < count; i++) {
        checkTableName(i, names[i]);
    }
}

function selectSource(name) {
    // select sources with given name in Choose Sources
    answerTab().click();
    element(DATA_SOURCE_OPEN_BTN).click();
    input('searchText').enter(name);
    element(TABLE_CHECKBOX).click();
    element(CHOOSE_SOURCES_DONE_EL).click();
}

function selectWorksheetsAsSources(worksheetNames) {
    selectSageSources(worksheetNames, 'Worksheet');
}

function checkWorksheetResult(worksheets, query, numFields, expectedResult) {
    deselectAllTableSources();
    selectWorksheetsAsSources(worksheets);
    sageInputElement().enter(query);
    waitForTableAnswerVisualizationMode();
    verifyAnswerTableData(expectedResult, numFields);
}

// select sources by label/sticker
function selectDataset (sticker) {
    deselectAllTableSources();
    callFunctionWithElement(null, function($body, appWindow, $) {
        $(DATA_SOURCE_OPEN_BTN).click();
        // if (!$(DATASET_LABEL).filter(function() {return $(this).find('.bk-editable-text').text() === sticker;}).hasClass('bk-active')) {
        //     $(DATASET_LABEL).filter(function() {return $(this).find('.bk-editable-text').text() === sticker;}).click();
        // }
        $('.bk-selected-filter').click();
        $(DATASET_LABEL + ' .bk-editable-input[name=' + sticker + ']').click();
        $(TABLE_CHECKBOX).click();
        $(CHOOSE_SOURCES_DONE_EL).click();
    });
}

function findColCell(name, i) {
    // find a cell in table with given name
    if (!i) {
        i = 0;
    }
    return callFunctionWithElement(null, function($body, appWindow, $) {
        $('.slick-viewport').scrollTop(300 * i);
        if ($('.slick-cell:contains(' + name + ')').length > 0) {
            return true;
        }
        if (parseInt($('.bk-pagination-info').text().trim().split(' ')[5], 10) === parseInt($('.bk-pagination-info').text().trim().split(' ')[7], 10)) {
            return false;
        }
        findColCell(name, i + 1);
    });
}

function drillDown(selection, option, col, cell, cellNum) {
    // drill down drom table or table col or chart with different options
    if (selection === 'table') {
        element(TABLE_VIZ + ' .bk-viz-controls .bk-style-icon-layers').click();
    }
    else if (selection === 'column') {
        findColCell(cell);
        callFunctionWithElement(null, function($body, appWindow, $) {
            if (option == 'exclude' || option == 'only show') {
                $('.slick-cell:contains(' + cell + ')').click();
            }
        });
        rightClick('.slick-cell:contains(' + cell + ')');
    }
    else if (selection === 'chart') {
        drillClickOnColumn(CHART_VIZ, cellNum - 1);
    }

    if (option === 'underlying data') {
        element('.bk-context-menu .context-sub-menu .context-sub-menu-title-container').click();
        waitForElement('.modal-body');
        if (!!col) {
            element('.modal-body .add-columns-btn').click();
            waitForElement('.bk-menu-content-container');
            element('.bk-src-arrow').click();
            input('colFilter.value').enter(col);
            waitForElement('.column-name:contains(' + col + ')');
            element('.column-name:contains(' + col + ')').click();
            element('.bk-menu-content-container .bk-btn-blue').click();
            waitForElement('.slick-header-column:contains(' + col + ')');
            element('.modal-header .bk-close').click();
        }
    }
    else if (option === 'drill down') {
        element('.bk-context-menu .bk-drill-sub-menu .context-sub-menu-title-container').click();
        waitForElement('.bk-drill-content-container .ng-pristine');
        input('itemFilter').enter(col);
        waitForElement('.bk-drill-content-container .bk-items li:contains(' + col + ')');
        element('.bk-drill-content-container .bk-items li:contains(' + col + ')').click();
    }
    else if (option === 'exclude') {
        element('.bk-context-menu .context-sub-menu .context-sub-menu-title-container:contains(Exclude)').click();
        waitForElement('.bk-boxed-token:contains(!= ' + cell + ')');
    }
    else if(option === 'only show') {
        element('.bk-context-menu .context-sub-menu .context-sub-menu-title-container:contains(Only show)').click();
        waitForElement('.bk-boxed-token:contains(' + cell + ')');
    }
}

function addAnswerSimple(title, source, query) {
    // save answer for given query
    goToAnswer();
    for (var i = 0; i < source.length; i++) {
        sageDataSourceItem(source[i]).click();
    }
    sageInputElement().enter(query);
    waitForTableAnswerVisualizationMode();

    waitForElement(SHARABLE_PANEL_ACTION_BUTTON_DROPDOWN);
    saveAsBtn().click();
    input('data.customData.questionHeader').enter(title);
    primaryDialogBtn().click();
}

function expectTableName(name) {
    expect(callFunctionWithElement(element(vizTitle(TABLE_VIZ)), function ($e) {
        return $e.text().trim();
    })).toBe(name);
}

function setTableTitleTo(title) {
    element(vizTitle(TABLE_VIZ) + ' .bk-editable .bk-editable-text').click();
    blinkInput(vizTitle(TABLE_VIZ) + ' input').enter(title);
    blinkInput(vizTitle(TABLE_VIZ) + ' input').pressEnter();
}

function waitForCellToHaveValue(cellSelector, value) {
    waitFor(function(appWindow){
        return !!appWindow.$(cellSelector).text().match(value);
    });
}

function reorderColumns(colName1, newPosition) {
    callFunctionWithElement(null, function ($body, window, $) {
        var existingColAtPosition = $(TABLE_HEADER_COLUMN).eq(newPosition),
            dropSourceCol = $(contains(TABLE_HEADER_COLUMN, colName1)),
            dropTargetX = existingColAtPosition.position().left,
            dropSourceX = dropSourceCol.position().left,
        //need move to a little left to the target's left most point
            deltaX = (dropTargetX - existingColAtPosition.width() / 2) - dropSourceX;

        dropSourceCol.simulate('drag', {dx: deltaX});
    });
}


/* chart */
function getColumnXRange($, columns, columnIndex) {
    var $column = $(columns[columnIndex]),
        minX = parseFloat($column.attr("x")),
        width = parseFloat($column.attr("width"));
    return {min: minX, max: minX + width};
}

function verifyNonOverlappingBars() {
    var HIGHCHARTS_COLUMNS = CHART_VIZ + ' .highcharts-series rect';

    expect(callFunctionWithElement(null, function($body, window, $){
        var columns = $body.find(HIGHCHARTS_COLUMNS).sort(function(e1, e2) {
                return parseFloat($(e1).attr("x")) - parseFloat($(e2).attr("x"));
            }),
            firstColumnXRange = getColumnXRange($, columns, 0),
            secondColumnXRange = getColumnXRange($, columns, 1);
        return firstColumnXRange.max < secondColumnXRange.min;
    })).toBe(true);
}

function verifyXLabelsSorted() {
    expect(callFunctionWithElement(element(first(HIGHCHARTS_AXIS_LABELS)), function($labels, window, jQ) {
        var labelValues = $labels.find('text').map(function(index, tspan) {
            // remove the ellipses as the sorting of labels happens before
            // truncation
            return jQ(tspan).text().replace(/...$/, '');
        });

        for (var i=0; i<labelValues.length - 1; i++) {
            if (labelValues[i] >= labelValues[i + 1]) {
                return false;
            }
        }
        return true;

    })).toBe(true);
}

// verify chart by type, axis labels, and legends
function checkChart(type, xAxis, yAxis, legend, count) {
    waitForElement('.bk-chart[chart-type=' + type.toUpperCase() + ']');
    expect(element(first(HIGHCHARTS_AXIS) + ' .bk-axis-label-title').text()).toBe(xAxis);
    expect(element(second(HIGHCHARTS_AXIS) + ' .bk-axis-label-title').text()).toBe(yAxis);
    if (legend) {
        expect(element(CHART_LEGEND + ' .bk-legend-title').text()).toBe(legend);
    }
    if (count) {
        expect(element(CHART_LEGEND + ' .bk-legend-item').count()).toBe(count);
    }
}

function checkColumnChartBars(count) {
    var flag = callFunctionWithElement(null, function($body, appWindow, $) {
        return $('.highcharts-series').filter(function () {return $(this).css('visibility') === 'visible';}).length;
    });
    expect(flag).toBe(count);
}

function clickLegend(name) {
    element(CHART_LEGEND + ' .bk-legend-item:contains(' + name + ') .bk-legend-label').click();
}


/* headline */
var headlineAggregationMenu = angular.scenario.dsl('headlineAggregationMenu', function () {
    return function (parentHeadline, position) {
        var chain = {};
        chain.select = function (val) {
            if (position === undefined) {
                position = 0;
            }

            return this.addFutureAction('Selecting ' + val + ' in headline aggregation menu in headline "' + parentHeadline + '"', function (appWindow, $document, done) {
                var $ = appWindow.$;
                var $select = $($document.find(parentHeadline + ' .bk-headline-aggregate')).eq(position);

                $select.find("option").filter(function () {
                    return $(this).text().trim() == val;
                }).prop('selected', "selected");
                $select.trigger('change');

                done(null, {});
            });
        };
        return chain;
    };
});

function headlineColHelper(headlineIndex) {
    return callFunctionWithElement(null, function($body, appWindow, $) {
        var flag = $('.bk-headline-content:eq(' + headlineIndex + ') .bk-headline-column-name').hasClass('ng-hide');
        var selector;
        if (flag) {
            selector = '.bk-headline-content:eq(' + headlineIndex + ') .column-name';
        } else {
            selector = '.bk-headline-content:eq(' + headlineIndex + ') .bk-headline-column-name';
        }

        return $(selector).text().trim();
    });
}

function headlineSelHelper(headlineIndex) {
    return callFunctionWithElement(null, function($body, appWindow, $) {
        return $('.bk-headline-content:eq(' + headlineIndex + ') .chosen-single').text().toLowerCase();
    });
}

function headlineCompressor(idx) {
    return callFunctionWithElement(element('.bk-headline-content:eq(' + idx + ') .bk-headline-value'), function($e, appWindow, $) {
        return compressSpaces($e);
    });
}

function checkSimpleHeadlines(headlineList) {
    // checks the value and column names on headline viz
    for (var idx = 0; idx < headlineList.length; idx++) {
        expect(headlineCompressor(idx)).toBe(headlineList[idx].hv.toLowerCase());

        var headlineCol = headlineColHelper(idx);
        expect(headlineCol).toBe(headlineList[idx].hc);
    }
}

function checkHeadlines(col, type, index) {
    // check three headline types
    var options = {
        attribute: ['UNIQUE COUNT', 2, ['TOTAL COUNT', 'UNIQUE COUNT']],
        measure: ['Total', 6, ['Total', 'AVG', 'STD DEVIATION', 'VARIANCE', 'MIN', 'MAX']]
    };

    if (!index) {
        index = 0;
    }

    if (type == 'date') {
        var dateCol = callFunctionWithElement(null, function($body, appWindow, $) {
            return $('.bk-headline-column-name').text().trim();
        });
        expect(dateCol).toBe(col);
    }
    else {
        waitForElement(HEADLINE_VIZ + ' .chosen-single:eq(' + index + '):contains(' + options[type][0] + ')');
        expect(element(HEADLINE_VIZ + ' .bk-headline-aggregate:eq(' + index + ') option').count()).toBe(options[type][1]);
        for (var i = 0; i < options[type.toLowerCase()][2].length; i++) {
            waitForElement(HEADLINE_VIZ + ' .bk-headline-aggregate:eq(' + index + ') option:eq(' + i + '):contains(' + options[type][2][i] + ')');
        }
    }
}

// verify headline and table row values given results instance. see below on usage
function checkTableViewResults(results) {
    /*
     sample input format
     var results = {
     headline: {
     val: [],
     col: [],
     sel: []
     },
     table: {
     col: [],
     sel: [],
     val: []
     }
     }
     */
    for (var hv = 0; hv < results.headline.val.length; hv++) {
        expect(headlineCompressor(hv)).toBe(results.headline.val[hv].toLowerCase());
    }

    for (var hc = 0; hc < results.headline.col.length; hc++) {
        var headlineCol = headlineColHelper(hc);
        expect(headlineCol).toBe(results.headline.col[hc]);
    }

    for (var hs = 0; hs < results.headline.sel.length; hs++) {
        if (results.headline.sel[hs]) {
            var headlineSel = headlineSelHelper(hs);
            expect(headlineSel).toBe(results.headline.sel[hs].toLowerCase());
        }
    }

    for (var tc = 0; tc < results.table.col.length; tc++) {
        expect(element('.slick-header-column:eq(' + tc + ') .slick-column-name').text()).toBe(results.table.col[tc]);
    }

    for (var ts = 0; ts < results.table.sel.length; ts++) {
        if (results.table.sel[ts]) {
            expect(element('.slick-header-column:eq(' + ts + ') .chosen-single').text()).toBe(results.table.sel[ts]);
        }
    }

    for (var tv = 0; tv < results.table.val.length; tv++) {
        expect(element('.slick-row:eq(0) .slick-cell:eq(' + tv + ')').text()).toBe(results.table.val[tv]);
    }
}


/* filter and sorting */
function sortKthColumn(k) {
    element(nth(TABLE_HEADER_COLUMN, k)).click();
    expect(element(nth(TABLE_HEADER_COLUMN, k) + ' ' + TABLE_HEADER_SORT_INDICATOR_DESC).count()).toBe(1);
}

// add one checkbox filter value to column
function checkBoxFilterSimple(colName, filter) {
    element(contains(TABLE_HEADER_COLUMN, colName) + TABLE_FILTER_BTN).click();
    sleep(1);
    blinkInput('.bk-cb-filter-search-container input').enter(filter);
    sleep(1);
    element('.bk-cb-filter-lists-section .bk-checkbox-title').click();
    clickFilterDoneButton();
    sleep(1);
}

// add a list of checkbox filters to column, default to be left panel unless onColumn is true
function addFilterContent(colName, valueList, onColumn) {
    if (!onColumn) {
        callFunctionWithElement(null, function($body, appWindow, $) {
            $(COL_ITEM).filter(function() {return $(this).text().trim() === colName;}).find('.bk-style-icon-filter-big').click();
        });
        waitForElement(contains(FILTER_TEXT, colName));
        sleep(1);
    }
    else {
        callFunctionWithElement(null, function($body, appWindow, $) {
            $('.bk-viz .bk-viz-content .slick-header-column').filter(function() {return $(this).find('.slick-column-name').text().trim() === colName;}).find('.bk-table-header-menu-btn').click();
        });
        waitForElement('.bk-table-header-menu-body  .bk-search-input');
    }

    if (valueList) {
        for (var i = 0; i < valueList.length; i++) {
            input('searchText').enter(valueList[i]);
            element(FILTER_CHECKBOX).click();
        }
        element(DONE_BTN).click();
        for (var j = 0; j < valueList.length; j++) {
            waitForElement('.bk-boxed-token:contains(' + valueList[j] + ')');
        }
        waitForElement(contains(FILTER_TEXT, colName));
    }
    else {
        element(DONE_BTN).click();
    }
}

// add number or data filter to column, default to be left panel unless onColumn is true
function addFilterNum(colName, valueList, operatorList, onColumn, date) {
    if (!onColumn) {
        callFunctionWithElement(null, function($body, appWindow, $) {
            $(COL_ITEM).filter(function() {return $(this).text().trim() === colName.toLowerCase();}).find('.bk-style-icon-filter-big').click();
        });
        waitForElement(contains(FILTER_TEXT, colName));
        waitForElement(FILTER_RANGE);
    }

    else {
        callFunctionWithElement(null, function($body, appWindow, $) {
            $('.bk-viz .bk-viz-content .slick-header-column').filter(function() {return $(this).find('.slick-column-name').text().trim().indexOf(colName) > -1;}).find('.bk-table-header-menu-btn').click();
        });
        waitForElement(FILTER_RANGE);
    }
    if (!!valueList) {
        selectChosenOption(DROPDOWN_SELECTION + ':eq(0)', operatorList[0]);
        input('rangeDefinition.firstOperand').enter(valueList[0]);
        if (valueList.length === 2) {
            selectChosenOption(DROPDOWN_SELECTION + ':eq(1)', operatorList[1]);
            input('rangeDefinition.secondOperand').enter(valueList[1]);
        }
        element(DONE_BTN).click();
        if (date) {
            if (operatorList[0] === '>') {
                operatorList[0] = 'after';
            }
            else if (operatorList[0] === '<') {
                operatorList[0] = 'before';
            }
        }
        waitForElement('.bk-boxed-token:contains( ' + colName.toLowerCase() + ' ' + operatorList[0] + ' ' + valueList[0] + ')');
        if (valueList.length === 2) {
            if (date) {
                if (operatorList[1] === '>') {
                    operatorList[1] = 'after';
                }
                else if (operatorList[1] === '<') {
                    operatorList[1] = 'before';
                }
            }
            waitForElement('.bk-boxed-token:contains( ' + colName.toLowerCase() + ' ' + operatorList[1] + ' ' + valueList[1] + ')');
        }
    }
    else {
        element(DONE_BTN).click();
    }
}

function deleteFilter(name) {
    element(contains(FILTER_ITEM, name.toProperCase()) + ' .close-icon').click();
    waitForNotContain(contains(FILTER_TEXT, name));
}

function verifyFilterSelected(value) {
    expect(element(FILTER_PANE + ' .panel-component-items-count').text()).toBe(value + ' selected');
}

function checkFilterContent(name, content, flag) {
    // check if filter for the given name is triggered with given content
    callFunctionWithElement(null, function($body, appWindow, $) {
        if (!$(LEFT_PANE).hasClass('bk-sage-data-filters-open')) {
            $(FILTER_PANE + ' .header-arrow').click();
        }
    });
    element(contains(FILTER_TEXT, name)).click();
    for (var i = 0; i < content.length; i++) {
        input('searchText').enter(content[i]);
        expect(checkClass('.bk-checkbox-container .bk-checkbox', 'bk-checked')).toBe(flag);
    }
}


/* data tab */
function exploreDataBtn() {
    return element('.bk-sources-container .bk-btn:contains(Explore)');
}

function importDataBtn() {
    return element(IMPORT_DATA_EL);
}

function tableTabTitle() {
    return element(contains(TOP_LEVEL_FILTERS, 'Tables'));
}

function worksheetTabTitle() {
    return element(contains(TOP_LEVEL_FILTERS, 'Worksheets'));
}

function allTablesTabTitle() {
    return element(contains(TOP_LEVEL_FILTERS, 'All'));
}

// TODO(Shitong): remove deprecated view functions
// view functions start
function viewTabTitle() {
    return element('.bk-generic-list .bk-header-menu-items a[ng-href$="views"]');
}

function viewContaining(viewName) {
    return element(contains(METADATA_LIST_ITEM, viewName) + ' a .bk-name-content');
}

function createView(sources, viewName, query) {
    selectSageSources(sources);
    sageInputElement().enter(query);
    waitForTableAnswerVisualizationMode();
    saveCurrentAnswerAsView(viewName);
    dataTab().click();
    viewTabTitle().click();
    expect(viewContaining(viewName).count()).toBe(1);
}

function deleteView(name, ignoreNonExistent) {
    dataTab().click();
    viewTabTitle().click();
    if (!ignoreNonExistent) {
        expect(viewContaining(name).count()).toBe(1);
    }
    deleteMetadataListItems([name], ignoreNonExistent);
    expect(viewContaining(name).count()).toBe(0);
}

function openViewContaining(viewName) {
    dataTab().click();
    viewTabTitle().click();
    viewContaining(viewName).click();
    waitForElement(EXPLORE_DATA_ICON, 'waiting for explore data dialog');
}

function goToView() {
    dataTab().click();
    element('.bk-header-label:contains(Views)').click();
}
// view functions end


function addPrefixBtn() { // worksheet add column prefix button
    return element('.bk-add-prefix-action');
}

// create worksheet based on TPCH data and given datePath (commitdate or orderdate)
function createTPCHWorksheet(title, datePathJoined) {
    dataTab().click();
    worksheetFunctions.openCreateWorksheet();
    worksheetFunctions.selectSources(TPCH_TABLES);
    TPCH_TABLES.each(function (source) {
        if (source === 'DATE') {
            worksheetFunctions.openSource(source);
            worksheetFunctions.addAllColumnsForSource(source, true);
            worksheetFunctions.chooseMapping('Commit date');
            worksheetFunctions.closeSource(source);
        } else {
            worksheetFunctions.openSource(source);
            worksheetFunctions.addAllColumnsForSource(source, true);
        }
        sleep(5);
    });
    saveCurrentAnswer(title);
}

// extends the createSimpleWorksheet function by offering the option to add prefix and change join type
function createComplexWorksheet(params, doNotSave) {
    dataTab().click();
    worksheetFunctions.openCreateWorksheet();

    if (!!params.dataScope) {
        if (!!params.dataScope.importedData) {
            selectImportedDataAsSources(params.dataScope.importedData);
        }
    } else {
        selectAllTableSources();
    }

    if (params.sources) {
        worksheetFunctions.selectSources(params.sources);
        var index = 0;
        params.sources.each(function (source) {
            worksheetFunctions.openSource(source);
            worksheetFunctions.addAllColumnsForSource(source, true);
            if (!!params.prefix && index < params.prefix.length) {
                if (params.prefix[index] && params.prefix[index] !== '') {
                    element(nth(GROUP_CHECKBOX_ICON, 0)).click();
                    addPrefixBtn().click();
                    input('data.customData.prefixLabel').enter(params.prefix[index]);
                    element('.bk-confirm-async-btn').click();
                }
                index += 1;
            }
        });
    }

    if (params.switchJoinType) {
        element(contains(JOIN_TYPE_CHOICE, params.switchJoinType)).click();
        waitFor(function (appWindow) {
            return appWindow.$('.bk-loading-indicator-overlay:contains(Thinking):visible').length === 0;
        });
    }
    if (params.switchJoinRule) {
        element(contains(JOIN_TYPE_CHOICE, params.switchJoinRule)).click();
        waitFor(function (appWindow) {
            return appWindow.$('.bk-loading-indicator-overlay:contains(Thinking):visible').length === 0;
        });
    }

    if (!doNotSave) {
        saveCurrentAnswer(params.title);
    }
}

// link (add relationship from) data1 to data2 through linkage names; linkages needs to be capitalized
function linkData(data1, data2, linkage1, linkage2) {
    linkage2 = linkage2 || linkage1;
    goToView();
    element('.bk-name-content:contains(' + data1 + ')').click();
    element('.bk-tablename:contains(' + data1 + ') .bk-style-icon-link').click();

    // for using the same view multiple times
    element('.bk-add-mode-btn').click();

    selectChosenOption('.bk-relationship-header select', data2);
    selectChosenOption('.bk-column-relationships select:eq(0)', linkage1);
    selectChosenOption('.bk-column-relationships select:eq(1)', linkage2);

    element('.bk-btn:contains(Add Key)').click();
    element('.bk-btn:contains(Add Relationship)').click();
    element('a.bk-close:contains(×)').click();
    sleep(15);
}

function selectWorksheetCol(table, col, prefix) {
    var PREFIX_DIALOG = '.bk-dialog';

    callFunctionWithElement(null, function($body, appWindow, $) {
        var elm = $('.bk-source-item').filter(function() {return $(this).find('.bk-source-header').text().trim() === table;}).find('li span').filter(function() {return $(this).text() === col;}),
            evt = $.Event('click', { target: elm });

        $('.ui-selectable').data('ui-selectable')._mouseStart(evt);
        $('.ui-selectable').data('ui-selectable')._mouseStart(evt);
        $('.ui-selectable').data('ui-selectable')._mouseStop(null);
    });

    if (prefix) {
        waitForElement(PREFIX_DIALOG);
        input('data.customData.prefixLabel').enter(prefix);
        element('.bk-save-btn').click();
    }
}

function openSavedWorksheetContaining(worksheetName) {
    dataTab().click();
    worksheetContaining(worksheetName).click();
    element(WORKSHEET_EDIT_BTN).click();
    waitFor(function (appWindow) {
        return appWindow.$('.bk-table-container .ui-widget-content').length > 0;
    });
}

// used to verify the column names during importing data
function verifyColumnHeaderNames(header) {
    // example: head = 'Date,Vendor,Amount,Transaction Type,Category,Account Name';
    expect(getRowValues(element(HEADER_NAME_ROW), function($e){
        return $e.val().trim();
    })).toEqual(header.split(','));
}

// used to verify the column type during importing data
function verifyColumnHeaderTypes(typesList) {
    // example: typesList = ['DATE', 'TEXT', 'DECIMAL', 'TEXT', 'TEXT', 'TEXT']
    expect(getRowValues(element(HEADER_TYPE_ROW_VALUES), function($e){
        return $e.text().trim();
    })).toEqual(typesList);
}

// Used to verify the data in first row during importing data
function verifyColumnData(data) {
    // example: data = '01/13/2012,IKEA,113.91,debit,Furnishings,BUSINESS CHECKING'
    expect(getRowValues(element(DATA_ROW_CELLS), function($e){
        return $e.text().trim();
    })).toEqual(data.split(','));
}

// used to verify if importing data is successful
function verifySuccessStepVisible() {
    expect(element('.bk-import-success:visible').count()).toBe(1);
    expect(element('.bk-imported-rows-number:visible').text()).toMatch(/1/);
}

function verifyNumberOfRowsInTable(tableName, expectedNumberOfRows) {
    openDataExplorer(tableName);
    waitForElement('.bk-table-container .grid-canvas');
    expect(element(DATA_EXPLORER_TABLE_ROW).count(expectedNumberOfRows));
}


/* home page */
function selectLastActivity() {
    homeTab().click();
    element(HOME_ACTIVITY + FIRST_ITEM + ' .bk-profile-content').click();
    sleep(1);
}

function activityTab() {
    return element(ACTIVITY_TAB);
}

function checkActivity(profile, user, message, item) {
    // check activity pane, ('A', 'Administrator', 'asked a question', 'answer_testing')
    homeTab().click();
    waitForElement(HOME_ACTIVITY);
    activityTab().click();
    expect(element(HOME_ACTIVITY + FIRST_ITEM + ' .bk-profile-content').text()).toBe(profile);
    expect(element(HOME_ACTIVITY + FIRST_ITEM + ' .bk-user-name').text()).toBe(user);
    expect(element(HOME_ACTIVITY + FIRST_ITEM + ' .bk-message').text()).toBe(message);
    expect(element(HOME_ACTIVITY + FIRST_ITEM + ' .bk-item-name').text()).toBe(item);
}


/* admin page */
function goToBusinessDataImport() {
    adminMenuItem().click();
    element('.bk-left-menu ul.bk-filters:eq(1) li:eq(0)').click();
}

function goToSecurityDataImport() {
    adminMenuItem().click();
    element('.bk-left-menu ul.bk-filters:eq(1) li:eq(1)').click();
}

/* user management */
function addUserBtn() {
    return element(contains(CREATE_USER_GROUP_CONTAINER, 'User'));
}

function addGroupBtn() {
    return element(contains(CREATE_USER_GROUP_CONTAINER, 'Group'));
}

function assignUserBtn() {
    return element(USER_GROUP_ACTION_CONTAINER + ' .bk-style-icon-users');
}

function deleteUserOrGroupBtn() {
    return element(USER_GROUP_ACTION_CONTAINER + ' .bk-style-icon-delete');
}

function confirmBtn() {
    return element('.bk-primary-button');
}

function uncheckDataLabels() {
    element(SHOW_DATA_LABEL_CHECKED).click();
    confirmBtn().click();
}

function uncheckPermissionCheckboxes() {
    callFunctionWithElement(null, function($body, window, $) {
        for (var i = 0; i < NUM_PERMISSION_TYPES; i++) {
            // Fixed: use triggerHandler instead of trigger
            // reason is that jQuery click is handled differently from actual user click, see thread below
            // http://stackoverflow.com/questions/10268222/jquery-checking-a-checkbox-and-triggering-javascript-onclick-event

            var $item = $(DIALOG_CHECKBOX_LIST + ':eq(' + i + ') input');
            $item.prop('checked', false).triggerHandler('click');
        }
    });
}

function checkCheckboxNames(names) {
    names.each(function(name) {
        callFunctionWithElement(null, function($body, window, $) {
            var $item = $(DIALOG_CHECKBOX_LIST + ':contains(' + name + ') input');
            $item.prop('checked', true).triggerHandler('click');
        });
    });
}

function selectListItem(displayName) {
    element(contains(LIST_ITEM, displayName) + ' .bk-checkbox-container').click();
}

function deleteListItem(displayName) {
    selectListItem(displayName);
    deleteUserOrGroupBtn().click();
    primaryDialogBtn().click();
}

function toggleUserAssignmentToGroup(username, groupname) {
    // if user does not belong to group, then assign user to group; if user belongs to group, remove user from group
    goToUserManagementPage();
    element(contains(USER_GROUP_ACTION_LIST, username) + ' .bk-checkbox').click();
    assignUserBtn().click();
    waitForElement('.bk-dialog');
    checkboxContaining(groupname).click();
    confirmBtn().click();
    waitFor(function (appWindow) {
        return appWindow.$('.bk-dialog').length === 0;
    });
}

function selectUserOrGroup(name) {
    element('.bk-name:contains(' + name + ')').click();
}

function addNewGroupByName(groupName, privileges) { // permissions: [admin, upload, download, share]
    goToGroupManagement();
    addGroupBtn().click();
    waitForElement('.bk-dialog');
    input('data.customData.editedGroup.name').enter(groupName);

    uncheckPermissionCheckboxes();
    checkCheckboxNames(privileges);
    confirmBtn().click();
}

function changeGroupPermissions(group, privileges) {
    goToGroupManagement();
    selectUserOrGroup(group);
    uncheckPermissionCheckboxes();
    uncheckPermissionCheckboxes(privileges);
    confirmBtn().click();
}

function expectUserToBeOfGroup(username, groupname) {
    selectUserOrGroup(username);
    expect(callFunctionWithElement(null, function($body, window, $) {
        return window.$(contains(DIALOG_CHECKBOX_LIST, groupname) + ' input').prop('checked');
    })).toBe(true);
}

function expectUserNotToBeOfGroup(username, groupname) {
    selectUserOrGroup(username);
    expect(callFunctionWithElement(null, function($body, window, $) {
        return window.$(contains(DIALOG_CHECKBOX_LIST, groupname) + ' input').prop('checked');
    })).toBe(false);
}

function expectGroupToHavePriviledge(groupname, priviledge) {
    selectUserOrGroup(groupname);
    expect(callFunctionWithElement(null, function($body, window, $) {
        return window.$(contains(DIALOG_CHECKBOX_LIST, priviledge) + ' input').prop('checked');
    })).toBe(true);
}

function expectGroupNotToHavePriviledge(groupname, priviledge) {
    selectUserOrGroup(groupname);
    expect(callFunctionWithElement(null, function($body, window, $) {
        return window.$(contains(DIALOG_CHECKBOX_LIST, priviledge) + ' input').prop('checked');
    })).toBe(false);
}


/* business model */
var businessModelFunctions = (function() {

    var contentRow = '.ui-widget-content';

    function saveWorksheetBtn() {
        return element('.bk-primary-button[button-text=Save]');
    }

    return {
        setModelColumnName: function(colName, newColName) {
            element(contains('.slick-cell', colName)).click();
            blinkInput('.editor-text').enter(newColName);
            blinkInput('.editor-text').pressEnter();

            //element('.bk-page-title').click();
            sleep(1);
            saveWorksheetBtn().click();
        },
        addDescription: function(colName, text) {
            var cell = contains(contentRow, colName) + ' .r1';
            element(cell).click();
            blinkInput('.editor-text').enter(text);
            blinkInput('.editor-text').pressEnter();
            sleep(1);
            saveWorksheetBtn().click();
        },
        setColumnType: function(colName, colType) {
            var cell = contains(contentRow, colName) + ' .r3';
            element(cell).click();
            selectChosenOption('.bk-select-box select', colType);
            this.addDescription(colName, 'changed column type to ' + colType);
            saveWorksheetBtn().click();
        },
        flipAdditive: function(colName) {
            var cell = contains(contentRow, colName) + ' .r4';
            element(cell + ' .onoffswitch').click();
            this.addDescription(colName, 'flipped additive type');
            saveWorksheetBtn().click();
        },
        setAggregation: function(colName, aggrType) {
            var cell = contains(contentRow, colName) + ' .r5';
            element(cell).click();
            selectChosenOption('.bk-select-box select', aggrType);
            this.addDescription(colName, 'changed aggr type to ' + aggrType);
            saveWorksheetBtn().click();
        },
        flipHidden: function(colName) {
            var cell = contains(contentRow, colName) + ' .r6';
            element(cell + ' .onoffswitch').click();
            this.addDescription(colName, 'flipped hidden type');
            saveWorksheetBtn().click();
        },
        addSynonyms: function(colName, text) {
            // we can add more than one synonym at a time by simply setting text to comma separated synonyms
            // e.g. 'synonym1, synonym2, synonym3, ...'
            var cell = contains(contentRow, colName) + ' .r7';
            element(cell).click();
            blinkInput('.editor-text').enter(text);
            blinkInput('.editor-text').pressEnter();
            sleep(1);
            saveWorksheetBtn().click();
        },
        changeFormat: function(colName, format) {
            var cell = contains(contentRow, colName) + ' .r11';
            element(cell).click();
            blinkInput('.editor-text').enter(format);
            blinkInput('.editor-text').pressEnter();
            sleep(1);
            saveWorksheetBtn().click();
        },
        flipAttribution: function(colName) {
            var cell = contains(contentRow, colName) + ' .r13';
            element(cell + ' .onoffswitch').click();
            this.addDescription(colName, 'flipped attribution type');
            saveWorksheetBtn().click();
        }
    };
})();


/* sticker (tag) functions */
function leftMenuLabelSelector(labelName) {
    return hasName(TOP_MENU_LABEL_PANEL + ' .bk-label', labelName);
}

function actionItemLabelSelector(labelName) {
    return hasName(ACTION_ITEM_LABEL_PANEL + ' .bk-label', labelName);
}

function listItemSelector(itemName) {
    return contains('.bk-list .bk-list-content li', itemName);
}

function taggedLabelSelector(listItemSelector, labelName) {
    return contains(listItemSelector + ' .bk-tagged-label', labelName);
}

function tagTables(label, tables) {
    // tag tables with given label/sticker
    dataTab().click();
    tableTabTitle().click();
    for (var i = 0; i < tables.length; i++) {
        searchByName(tables[i]);
        element('.bk-list-content li:contains(' + tables[i] + ') .bk-checkbox').click();
    }
    element('.bk-list-bulk-actions .bk-apply-label-btn').click();
    element('.bk-action-item .bk-editable-input[name=' + label + ']').click();
}

function addLabel(labelName) {
    element(TOP_MENU_LABEL_PANEL + ' .bk-add-new-item a').click();
    input('newItem.name').enter(labelName);
    keypress(TOP_MENU_LABEL_PANEL + ' .bk-add-new-item input', 13, true, true, true);
}

function topMenuLabelSelector(labelName) {
    return hasName(TOP_MENU_LABEL_PANEL + ' .bk-label', labelName);
}

function deleteLabel(labelName) {
    element(topMenuLabelSelector(labelName) + ' .bk-style-icon-edit-small').click();
    element(contains(topMenuLabelSelector(labelName) + ' a', 'Remove sticker')).click();
    element('.bk-confirm-async-btn').click();
}

function setLabelNameTo(labelName, newLabelName) {
    element(leftMenuLabelSelector(labelName) + ' .bk-style-icon-edit-small').click();
    element(contains(leftMenuLabelSelector(labelName) + ' a', 'Edit name')).click();
    // Enter a new name
    blinkInput(leftMenuLabelSelector(labelName) + ' input').enter(newLabelName);
    blinkInput(TOP_MENU_LABEL_PANEL + ' input').pressEnter();
}

angular.scenario.dsl('simulateColorPick', function () {
    return function (labelName, color) {
        return this.addFutureAction('simulate picking a color', function (appWindow, $document, done) {
            // var allUsersAndGroups = appWindow.element(SHARE_DIALOG).scope().allUsersAndGroups;
            appWindow.angular.element(leftMenuLabelSelector(labelName) + ' .bk-color-picker').isolateScope().color = color;
            appWindow.angular.element(leftMenuLabelSelector(labelName) + ' .bk-color-picker').isolateScope().onChange();
            done();
        });
    };
});

function tagItemWithLabel(item, label) {
    element(listItemSelector(item) + ' .bk-checkbox-container').click();
    element('.bk-action-container .bk-action-item.bk-apply-label-btn').click();
    element(actionItemLabelSelector(label)).click();
}

function tagItemsWithLabel(items, label) { // tags a list of meta items with sticker provided
    items.each(function(item) {
        tagItemWithLabel(item, label);
    });
}

function untagItemFromLabel(itemName, labelName) {
    element(taggedLabelSelector(listItemSelector(itemName), labelName) + ' .bk-delete').click();
}

function verifyLabelExists(labelName) {
    expect(element(leftMenuLabelSelector(labelName)).count()).toBe(1);
}

function verifyLabelDoesNotExist(labelName) {
    expect(element(leftMenuLabelSelector(labelName)).count()).toBe(0);
}

function verifyTagged(itemName, labelName) {
    expect(element(contains(listItemSelector(itemName) + ' .dropdown-menu', labelName)).count()).toBe(1);
}

function verifyUntagged(itemName, labelName) {
    expect(element(contains(listItemSelector(itemName) + ' .dropdown-menu', labelName)).count()).toBe(0);
}


/* pinboard */
function createPinboards(title) {
    // create pinboard with given title
    var DESCRIPTION = 'homepage_pinboards_testing';
    pinboardsTab().click();
    clickNewPinboardButton();
    pinboardFunctions.waitForNewPinboardModalNameInput();
    input('data.customData.pinboardName').enter(title);
    input('data.customData.pinboardDescription').enter(DESCRIPTION);
    primaryDialogBtn().click();
}

function addToPinboards(title, chartType, table, createNew) {
    // add default table and chart to given pinboard
    var DROPDOWN = ' .bk-viz-controls .bk-pinboard-drop-down .bk-pin-viz-btn',
        PINBOARD = ' .bk-pinboard-list .bk-pinboard-row',
        NEW_PINBOARD_INPUT = '.bk-viz-pinner-modal .bk-new-pinboard-input input';

    if (createNew) {
        element(DROPDOWN).click();
        element('.bk-viz-pinner-modal .bk-show-create-pinboard-btn').click();
        blinkInput(NEW_PINBOARD_INPUT).enter(title);
        blinkInput(NEW_PINBOARD_INPUT).pressEnter();
    }

    if (chartType) {
        selectChartType(chartType);
        element(CHART_VIZ + DROPDOWN).click();
        element(CHART_VIZ + PINBOARD + ':contains(' + title + ')').click();
    }

    if (table) {
        waitForTableAnswerVisualizationMode();
        element(TABLE_VIZ + DROPDOWN).click();
        element(TABLE_VIZ + PINBOARD + ':contains(' + title + ')').click();
    }
}

function deleteLastPinboard() {
    // delete first pinboard
    pinboardsTab().click();
    element(FIRST_ELEMENT + ' .bk-checkbox').click();
    element(DELETE_ICON).click();
    waitForElement(CONFIRM_BTN);
    element(CONFIRM_BTN).click();
}


/* formula */
function createFormulaAndSave(name, text, suggestions) {
    formulaFunctions.openFormulaEditorInWorksheet();
    formulaFunctions.focusFormulaEditor();
    formulaFunctions.clearFormulaEditor();
    formulaFunctions.typeInFormulaEditor(text);

    if (suggestions) {
        for (var i = 0; i < suggestions.length; i++) {
            waitForElement('.bk-formula-suggestions-menu .header:contains(Multiple matches. Select one:)');
            element('.suggestion:contains(' + suggestions[i] + ')').click();
        }
    }

    formulaFunctions.waitForFormulaToResolve();
    formulaFunctions.saveCurrentFormula(name);

    // console.log('.bk-table-container .ui-widget-content:contains(\'' + name + '\')');
    // wait for two things here: formula to save and values to come up.
    waitFor(function (appWindow) {
        return appWindow.$(FORMULA_DIALOG).length === 0;
    });

    // automating scrolling down, so that trigger slick will update
    callFunctionWithElement(null, function($body, window, $) {
        $('.slick-viewport').scrollTop($('.grid-canvas').height());
    });

    waitFor(function (appWindow) {
        return appWindow.$(WORKSHEET_COLUMNS + ":contains(" + name + ")").length > 0;
    });
}

function verifyFormulaResult(formulaName, expectedAnswers) {
    function verifySingleCell(formulaName, index, expectedAnswer) {
        var blinkIndex = '.l' + (index+3);

        expect(callFunctionWithElement(null, function($body, window, $) {
            var columns = $body.find(WORKSHEET_COLUMNS).filter(function() {
                return $(this).find('.bk-value').text() === formulaName;
            });

            return columns.find(blinkIndex).text();
        })).toBe(expectedAnswer);
    }
    for (var i = 0; i < 3; i++) {
        verifySingleCell(formulaName, i, expectedAnswers[i]);
    }
}

function verifyAggregateFormulaResult(worksheetName, formulaName, expectedAnswer, groupby) {
    saveCurrentAnswer();
    goToAnswer();
    deselectAllSources();
    selectWorksheetsAsSources([worksheetName]);
    // hack(Shitong): need to wait for sage indexing
    sleep(15);
    sageInputElement().enter(formulaName);
    waitForTable();
    if (!groupby) {
        expect(element(SINGLE_CELL_SAGE_OUTPUT).text()).toMatch(expectedAnswer);
    } else {
        verifyAnswerTableData(expectedAnswer);
    }
    // maintain prior status of worksheet
    openSavedWorksheetContaining(worksheetName);
}

function verifyFormulaSave(formulaText) {
    formulaFunctions.openFormulaEditorInWorksheet();
    formulaFunctions.focusFormulaEditor();
    formulaFunctions.typeInFormulaEditor(formulaText);
    formulaFunctions.saveCurrentFormula(FORMULA_NAME);
    saveCurrentAnswer(WORKSHEET_NAME);
    formulaFunctions.openExistingFormulaInWorksheet(FORMULA_NAME);

    var formulaTextTrimmed = callFunctionWithElement(element(formulaFunctions.selectors.FORMULA_EDITOR), function($e){
        return $e.text().replace(/\u00a0/g, ' ').trim();
    });
    expect(formulaTextTrimmed).toEqual(formulaText);
    formulaFunctions.closePopup();
    deleteWorksheet(WORKSHEET_NAME);
}


/* metadata functions */
function applyMyItemFilter() {
    element('.bk-top-menu-filters li.bk-category-my').click();
    waitFor(function(appWindow) {
        return appWindow.$('.bk-category-my').hasClass('bk-selected');
    });
}

function applyAllItemFilter() {
    element('.bk-top-menu-filters li.bk-category-all').click();
    waitFor(function(appWindow) {
        return appWindow.$('.bk-category-all').hasClass('bk-selected');
    });
}

function applyStickerFilter(sticker) {
    element(leftMenuLabelSelector(sticker)).click();
    waitFor(function(appWindow) {
        return appWindow.$('.bk-label.bk-active').length > 0;
    });
}

function expectCurrentPageToBeMetaPage () {
    return expect(browser().location().url()).toBeContainedIn(PAGE_URLS);
}

// check if meta item by given name exists
function containsItem(itemName) {
    searchByName(itemName);
    expect(element(META_ITEMS).count()).toBeGreaterThan(0);
}

function doesNotContainItem(itemName) {
    searchByName(itemName);
    expect(element(META_ITEMS).count()).toBe(0);
}

function expectMetaItemsCountToBe(expectedCount) { // note(Shitong) cannot count li elements due to html constraint
    callFunctionWithElement(element('.bk-list-header .bk-title'), function ($el, window, $) {
        expect(value(parseInt($el.text(), 10))).toBe(expectedCount);
    });
}



/* permission functions */
function permissionItems() {
    return element(SHARE_DIALOG + ' .bk-permission-list ul li');
}

function nthPermissionItemName(nth) {
    return element(SHARE_DIALOG + ' .bk-permission-list ul li:nth(' + nth + ') .bk-name').text();
}

function addUserHeader() {
    return element(SHARE_DIALOG + ' .bk-add-users-header');
}

function addPermissionsBtn() {
    return element(SHARE_DIALOG + ' .bk-add-permissions-btn');
}

function nthPermissionType(nth) {
    return element(SHARE_DIALOG + ' .bk-permission-list ul li:nth(' + nth + ') select option:selected').text();
}

function shareDialogDoneBtn() {
    return element(SHARE_DIALOG + ' .bk-done-btn');
}

// verify current active user has permission to download data
function verifyPermissionDownload(hasPermission) {
    var expected = true;
    if (!!hasPermission) {
        expected = false;
    }
    expect(checkClass(TBL_DOWNLOAD, 'bk-viz-btn-disabled')).toBe(expected);
}

// verify current active user has permission to upload data
function verifyPermissionUpload(hasPermission) {
    dataTab().click();
    if (!!hasPermission) {
        expect(checkClass(IMPORT_DATA_EL, 'bk-disabled')).toBe(false);
    } else {
        expect(checkClass(IMPORT_DATA_EL, 'bk-disabled')).toBe(true);
    }
}

// share answer with a list of users with view or edit access
function shareAnswerWithUser(usersList, answerbook, canEdit) {
    openSavedAnswer(answerbook, 'table');
    shareBtn().click();
    expect(shareDialog().count()).toBe(1);
    // Click the add user header to expand the section
    addUserHeader().click();

    callFunctionWithElement(null, function($el, window, $) {
        usersList.forEach(function(userName) {
            window.console.log(userName);
            selectChosenOption(SHARE_DIALOG_ADD_USER_SELECT, userName);
            if (canEdit) {
                select('newPermissionType').option(EDIT_PERMISSION_TYPE);
            } else {
                select('newPermissionType').option(VIEW_PERMISSION_TYPE);
            }
            addPermissionsBtn().click();
        });
    });

    shareDialogDoneBtn().click();
}

function createAReadOnlyAnswer(userName, answerbook) {
    createAndSaveAnswer('revenue color', answerbook);
    shareBtn().click();
    expect(shareDialog().count()).toBe(1);
    // Click the add user header to expand the section
    addUserHeader().click();

    // Pick a user through the add user autocomplete input
    selectChosenOption(SHARE_DIALOG_ADD_USER_SELECT, userName);
    // Give edit permissions
    select('newPermissionType').option(VIEW_PERMISSION_TYPE);
    addPermissionsBtn().click();

    expect(nthPermissionItemName(1)).toBe(userName);
    shareDialogDoneBtn().click();
}

function createAnEditableAnswer(userName, answerbook) {
    createAndSaveAnswer('revenue color', answerbook);
    shareBtn().click();
    expect(shareDialog().count()).toBe(1);
    // Click the add user header to expand the section
    addUserHeader().click();

    // Pick a user through the add user autocomplete input
    selectChosenOption(SHARE_DIALOG_ADD_USER_SELECT, userName);
    // Give edit permissions
    select('newPermissionType').option(EDIT_PERMISSION_TYPE);
    addPermissionsBtn().click();

    expect(nthPermissionItemName(1)).toBe(userName);
    shareDialogDoneBtn().click();
}

// share a system table (or part of the table) with user
function shareTableWithUser(tblName, user, colName) {
    searchByName(tblName);
    element(contains(META_ITEMS, tblName) + ' .bk-checkbox').click();
    element(SHARE_WS_BTN).click();
    if (!!colName) {
        callFunctionWithElement(null, function($body, window, $) {
            $('.bk-column-option:contains(Specific) input').prop('checked', true).triggerHandler('click');
        });
        element(contains(SPECIFIC_COLUMN_SIDEBAR, colName)).click();
    }

    addUserHeader().click();
    // Pick a user through the add user autocomplete input
    selectChosenOption(SHARE_DIALOG_ADD_USER_SELECT, user);
    // Give edit permissions
    //select('newPermissionType').option(EDIT_PERMISSION_TYPE);
    addPermissionsBtn().click();
    shareDialogDoneBtn().click();
}


/* js extension */
// add toProperCase function to JS String, this will convert a String like 'foo bar' to 'Foo Bar'
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
};


/* angular scenario runner extension */
angular.scenario.dsl('value', function() {
    return function(value) {
        return this.addFuture('translating value to future', function(done) {
            done(null, value);
        });
    };
});
function includes(array, obj) {
    return array.indexOf(obj) != -1;
}
// custom matches
angular.scenario.matcher('toBeContainedIn', function(expected) {
    return includes(expected, this.actual);
});

angular.scenario.matcher('notToBe', function(expected) {
    return expected != this.actual;
});
