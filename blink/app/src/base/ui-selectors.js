/**
 * Copyright: ThoughtSpot Inc. 2013 - 2016
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Base e2e angular scenario utilities and definitions.
 */

'use strict';

window.uiSelectors = {};

uiSelectors.visible = function (cssSelector) {
    return cssSelector + ':visible';
};

uiSelectors.selected = function (cssSelector) {
    return cssSelector + '.selected';
};

uiSelectors.selectedButton = function (cssSelector) {
    return cssSelector + ' .bk-selected-button';
};

uiSelectors.disabled = function (cssSelector) {
    return cssSelector + '.disabled';
};

uiSelectors.bkdisabled = function (cssSelector) {
    return cssSelector + '.bk-disabled';
};

uiSelectors.visible = function (cssSelector) {
    return cssSelector + ':visible';
};

uiSelectors.hidden = function (cssSelector) {
    return cssSelector + ':hidden';
};

uiSelectors.contains = function (cssSelector, containsText) {
    return cssSelector + ':contains(\'' + containsText + '\')';
};

uiSelectors.hasName = function (cssSelector, value) {
    return cssSelector + ':has(input[name=\'' + value + '\'])';
};

uiSelectors.first = function (cssSelector) {
    return cssSelector + ':eq(0)';
};

uiSelectors.second = function (cssSelector) {
    return cssSelector + ':eq(1)';
};

uiSelectors.nth = function (cssSelector, n) {
    return cssSelector + ':eq(' + (n - 1) + ')';
};

uiSelectors.last = function (cssSelector) {
    return cssSelector + ':last';
};

uiSelectors.nthChild = function (cssSelector, n) {
    return cssSelector + ':nth-child(' + (n - 1) + ')';
};

// App specific functions

uiSelectors.vizMenu = function (parentViz) {
    return parentViz + ' .bk-viz-menu';
};

uiSelectors.chartSettingsMenuBtn = function (parentViz) {
    return parentViz + ' .bk-chart-toolbar .bk-chart-editor .bk-toolbar-btn-inner';
};

uiSelectors.chartSettingsMenuBody = function (parentViz) {
    return parentViz + ' .bk-chart-toolbar .bk-chart-editor .bk-tool-menu';
};

uiSelectors.chartZoomMenuBtn = function (parentViz) {
    return parentViz + ' .bk-chart-toolbar .bk-zoom';
};

uiSelectors.chartZoomMenuBody = function (parentViz) {
    return parentViz + ' .bk-chart-toolbar .bk-zoom .bk-tool-menu';
};

uiSelectors.chartConfigMenuBtn = function (parentViz) {
    return parentViz + ' .bk-chart-toolbar .bk-config';
};

uiSelectors.summaryRow = function (parentHeadline) {
    return parentHeadline + ' .bk-summary-container';
};

uiSelectors.dateRangeSummaryRow = function (parentHeadline) {
    return parentHeadline + ' .bk-summary-date-row';
};

uiSelectors.chartTypeButton = function (chartType) {
    return '.bk-viz-type-selector[chart-type="' + chartType + '"]';
};

uiSelectors.LOGIN_FORM = '.bk-login-form';
uiSelectors.ERROR_NOTIF = '.bk-alert.bk-alert-error';
uiSelectors.SUCCESS_NOTIF = '.bk-alert.bk-alert-success';
uiSelectors.SUCCESS_NOTIF_CLICKABLE_LINK = uiSelectors.SUCCESS_NOTIF + ' .bk-link';
uiSelectors.ANSWER_ROUTE = '/answer/';
uiSelectors.SAVED_ANSWER_ROUTE = '/saved-answer/';
uiSelectors.ANSWER = '.bk-answer';

uiSelectors.HOME_PATH = '/';
uiSelectors.IMPORT_DATA_PATH = '#/importdata';
uiSelectors.IMPORT_DATA_SOURCE_PATH = '#data/impds';

uiSelectors.ACTION_BUTTON_DROPDOWN = '.bk-action-button-dropdown';
uiSelectors.CREATE_NEW_PINBOARD = '.bk-create-new-pinboard';
uiSelectors.SCHEDULER_ICON = '.bk-ds-schedule-content';
uiSelectors.PRIMARY_DIALOG_BUTTON_SELECTOR = '.bk-dialog .bk-confirm-async-btn';
uiSelectors.MENU_BTN = '.bk-menu-btn';


/* Admin */
uiSelectors.LIST_ITEM = '.bk-list-container .bk-list-content li';
uiSelectors.LIST_ITEM_NAME = uiSelectors.LIST_ITEM + ' .bk-name';
uiSelectors.LIST_ITEM_DISPLAY_NAME = uiSelectors.LIST_ITEM + ' .bk-display-name';

/* Action Dropdown */
uiSelectors.SHARABLE_PANEL_ACTION_BUTTON_DROPDOWN =
    '.sharable-item-panel ' + uiSelectors.ACTION_BUTTON_DROPDOWN;

/* Tabs */

uiSelectors.HOME_TAB = '.bk-primary-nav-home-logo';
uiSelectors.ADMIN_NAV_TAB = '.bk-primary-nav-admin';
uiSelectors.ANSWER_TAB = '.bk-primary-nav-search';
uiSelectors.DATA_TAB = '.bk-primary-nav-manage-data';

/* Home page */
uiSelectors.HOME_ACTIVITY_ITEM = '.bk-home-activity .bk-activity-feed-item';

/* Chart / Table */

uiSelectors.ANSWER_PAGE = '.bk-answer-page';
uiSelectors.CHART_VIZ = '.bk-chart-viz';
uiSelectors.CHART = '.bk-chart';
uiSelectors.CHART_VIZ_TITLE = uiSelectors.CHART_VIZ + ' .bk-viz-title-section .bk-editable-input';
uiSelectors.CHART_SETTINGS_MENU = uiSelectors.vizMenu(uiSelectors.CHART_VIZ) + '.bk-chart-settings';
uiSelectors.CHART_SETTINGS_MENU_BTN = uiSelectors.chartSettingsMenuBtn(uiSelectors.CHART_VIZ);
uiSelectors.CHART_SETTINGS_MENU_BODY = uiSelectors.chartSettingsMenuBody(uiSelectors.CHART_VIZ);
uiSelectors.CHART_ZOOM_MENU_BTN = uiSelectors.chartZoomMenuBtn(uiSelectors.CHART_VIZ);
uiSelectors.CHART_ZOOM_MENU_BODY = uiSelectors.chartZoomMenuBody(uiSelectors.CHART_VIZ);
uiSelectors.CHART_ZOOM_SELECT_BTN = uiSelectors.CHART_ZOOM_MENU_BODY + ' .bk-area-select';
uiSelectors.CHART_ZOOM_RESET_BTN = uiSelectors.CHART_ZOOM_MENU_BODY + ' .bk-zoom-reset';
uiSelectors.CHART_TYPE_ICON = '[class*="bk-style-icon-chart"]';
uiSelectors.CHART_TYPE_SELECTOR_ICON = '.bk-viz-type-selector .bk-viz-icon-wrapper .bk-viz-icon-button';
uiSelectors.CHART_TYPE_BTN = 'chart-type-selector .bk-viz-icon-wrapper .bk-viz-icon-button';
uiSelectors.VIZ_TYPE_BTN = '.bk-viz-icon-wrapper .bk-viz-icon-button';
uiSelectors.CHART_SELECTOR  = '.bk-viz-chart';
uiSelectors.HIGHCHARTS_CONTAINER_CLASS = '.highcharts-container';
uiSelectors.HIGHCHART_SELECTOR  = '.bk-viz-chart ' + uiSelectors.HIGHCHARTS_CONTAINER_CLASS;
uiSelectors.HIGHCHARTS_RECT = uiSelectors.CHART_VIZ + ' g.highcharts-tracker rect';
uiSelectors.HIGHCHARTS_AXIS = uiSelectors.CHART_VIZ + ' div.highcharts-axis';
uiSelectors.HIGHCHARTS_AXIS_TITLE = '.bk-axis-label-title';
uiSelectors.HIGHCHARTS_AXIS_LABELS = uiSelectors.CHART_VIZ + ' .highcharts-axis-labels';
uiSelectors.HIGHCHARTS_YAXIS_LABELS = uiSelectors.CHART_VIZ + ' .highcharts-yaxis-labels';
uiSelectors.HIGHCHARTS_XAXIS_LABELS = uiSelectors.CHART_VIZ + ' .highcharts-xaxis-labels';
uiSelectors.HIGHCHARTS_SERIES = uiSelectors.CHART_VIZ + ' .highcharts-series';

uiSelectors.CHECKBOX_COLLECTION_SELECTOR = '.bk-checkbox-collection';
uiSelectors.CHECKBOX_ITEM_SELECTOR = '.bk-checkbox-container';

uiSelectors.TABLE_VIZ = '.bk-table-viz';
uiSelectors.TABLE_ROW = uiSelectors.TABLE_VIZ + ' .slick-row';

uiSelectors.VIZ_DOWNLOAD_BUTTON = '.bk-viz-excel-download-btn';

uiSelectors.NO_VIZ_PLACEHOLDER = '.bk-empty-page-placeholder';

uiSelectors.TABLE_SELECTOR_BUTTON_SELECTOR = '.bk-table-type-selector-button';

uiSelectors.CHART_SELECTOR_BUTTON_SELECTOR = '.bk-toggle-chart-selector-display';
uiSelectors.CHART_SELECTOR_PANEL_SELECTOR = '.bk-answer-viz-type-selector';
uiSelectors.CHART_SELECTOR_ICON_IMG = '.bk-toggle-chart-selector-display img';
uiSelectors.CHART_TYPE_LINE = 'LINE';
uiSelectors.CHART_TYPE_SCATTER = 'SCATTER';
uiSelectors.CHART_TYPE_PIE = 'PIE';
uiSelectors.CHART_TYPE_COLUMN = 'COLUMN';
uiSelectors.CHART_TYPE_PARETO = 'PARETO';
uiSelectors.CHART_TYPE_STACKED_COLUMN = 'STACKED_COLUMN';
uiSelectors.CHART_TYPE_WATERFALL = 'WATERFALL';
uiSelectors.CHART_TYPE_LINE_COLUMN = 'LINE_COLUMN';
uiSelectors.CHART_TYPE_BUTTON_PREFIX = '.bk-style-icon-chart-';
uiSelectors.TABLE_TYPE_SELECTOR = '.bk-table-type-selector-button';

uiSelectors.CHART_TYPE_COLUMN_BUTTON_SELECTOR = '.bk-style-icon-chart-column';
uiSelectors.CHART_TYPE_PIE_BUTTON_SELECTOR = '.bk-style-icon-chart-pie';
uiSelectors.CHART_TYPE_STACKED_COLUMN_BUTTON_SELECTOR = '.bk-style-icon-chart-stacked_column';
uiSelectors.CHART_TYPE_SCATTER_BUTTON_SELECTOR = '.bk-style-icon-chart-scatter';

uiSelectors.CHART_EDITOR = '.bk-chart-editor';
uiSelectors.CHART_EDITOR_DONE_BUTTON_SELECTOR = '.bk-chart-editor-done';

uiSelectors.X_AXIS_REGEX = /highcharts-xaxis-labels/;
uiSelectors.X_AXIS_SELECT_SELECTOR = 'axisConfig.xAxisColumns';
uiSelectors.Y_AXIS_SELECT_SELECTOR = 'axisConfig.yAxisColumns';
uiSelectors.LEGEND_SELECT_SELECTOR = 'axisConfig.legendColumns';
uiSelectors.RADIAL_SELECT_SELECTOR = '$ctrl.selectedAxisConfig.radialColumn';
uiSelectors.X_AXIS_INPUT_SELECTOR = '.bk-x-axis-selector-input';
uiSelectors.Y_AXIS_INPUT_SELECTOR = '.bk-y-axis-selector-input';
uiSelectors.LEGEND_AXIS_INPUT_SELECTOR = '.bk-legend-axis-selector-input';
uiSelectors.AXIS_VALIDATION_ERROR = '.validation-error-message';
uiSelectors.X_AXIS_ELEMENT_SELECTOR = '[ng-model="' + uiSelectors.X_AXIS_SELECT_SELECTOR + '"]';
uiSelectors.Y_AXIS_ELEMENT_SELECTOR = '[ng-model="' + uiSelectors.Y_AXIS_SELECT_SELECTOR + '"]';
uiSelectors.LEGEND_ELEMENT_SELECTOR = '[ng-model="' + uiSelectors.LEGEND_SELECT_SELECTOR + '"]';
uiSelectors.RADIAL_ELEMENT_SELECTOR = '[ng-model="' + uiSelectors.RADIAL_SELECT_SELECTOR + '"]';
uiSelectors.CHART_AXIS_SELECTOR_SELECTOR = uiSelectors.CHART_VIZ + ' .bk-chart-axis-selector';
uiSelectors.Y_AXIS_SHARING_BUTTON_SELECTOR = uiSelectors.CHART_VIZ + ' .bk-chart-shared-y-axis-button';
uiSelectors.Y_AXIS_SHARING_ENABLED_CLASS = '.bk-chart-shared-y-axis-button bk-btn';
uiSelectors.DATA_LABEL_TOGGLE_CHECKBOX = '.bk-toolbar-btn .bk-checkbox-container';
uiSelectors.CHART_Y_AXIS_LABEL_CONTROL = '.highcharts-yaxis-title .bk-axis-label-control';
uiSelectors.CHART_CONFIG_MENU_BUTTON = '.bk-toggle-chart-editor-display';
uiSelectors.UI_SELECT_SELECTED_ITEMS = '.ui-select-match-item';
uiSelectors.UI_SELECT_REMOVE_SELECTOR = '.ui-select-match-close';
uiSelectors.UI_SELECT_CHOICE_SELECTOR = '.ui-select-choices-row';

uiSelectors.TABLE_HEADER_COLUMN = '.bk-viz-table .slick-header-column';
uiSelectors.TABLE_COLUMN_NAME = uiSelectors.TABLE_HEADER_COLUMN + ' .slick-column-name';
uiSelectors.TABLE_HEADER_SORT_INDICATOR_ASC = '.slick-sort-indicator-asc';
uiSelectors.TABLE_HEADER_SORT_INDICATOR_DESC = '.slick-sort-indicator-desc';
uiSelectors.TABLE_HEADER_MENU_BUTTON = '.bk-table-header-menu-btn';
uiSelectors.TABLE_COLUMN_MENU = '.bk-table-column-menu';

uiSelectors.VIZ_CONTROLS = '.bk-viz-controls';
uiSelectors.NEW_FORMULA_VIZ_CONTROL = uiSelectors.VIZ_CONTROLS +  ' .bk-viz-btn-icon.bk-style-icon-formula';

uiSelectors.TAB_HEADER_ITEM = '.bk-tab-header .tab-header-item';

uiSelectors.DIALOG = '.bk-dialog';
uiSelectors.DIALOG_OK_BUTTON = '.bk-dialog-ok-btn';
uiSelectors.DIALOG_CANCEL_BUTTON = '.bk-dialog-cancel-btn';

uiSelectors.DRILL_DOWN_DROP_DOWN = '.bk-context-menu';
uiSelectors.CONTEXT_MENU_SELECTOR = '.bk-context-menu';

/* DATA PANEL */
uiSelectors.DATA_SOURCE_OPEN_BTN = '.bk-manage-sources .bk-choose-sources-btn';
uiSelectors.DATA_SOURCE_SELECTOR_DIALOG = '.bk-manage-sources .bk-sources-popover:visible';
uiSelectors.DATA_SOURCE_LIST = '.bk-manage-sources .bk-list';
uiSelectors.DATA_SOURCE_CONTAINER = '.bk-columns-body-section';
uiSelectors.ALL_SOURCES_BUTTON = '.bk-manage-sources .bk-sources-popover .left-pane .bk-filter:contains(All)';
uiSelectors.SELECT_ALL_SOURCES = '.bk-select-all:contains(All)';
uiSelectors.SELECTED_SOURCES = '.bk-list-item.bk-selected .bk-source-name';
uiSelectors.DATA_SOURCE_INPUT = '.bk-sage-data-sources-open .bk-search-input';
uiSelectors.SELECT_ITEM_CONTAINER = '.bk-sage-data .bk-manage-sources .bk-list .bk-list-item';
uiSelectors.SELECT_ITEM_CONTAINER_SELECTED = '.bk-sage-data .bk-manage-sources .bk-list .bk-list-item.bk-selected';
uiSelectors.CLEAR_SEARCH_BUTTON = '.bk-action-confirmation-popup:contains(clear your search) .bk-save-btn';
uiSelectors.DATA_SOURCE_SHOW_BTN = '.bk-data-source-preview:visible';
uiSelectors.DATA_SOURCE_HIDE_BTN = '.header-arrow.bk-style-icon-arrow-left:visible';
uiSelectors.CLEAR_SELECTIONS = 'a:contains(Clear Selections)';
uiSelectors.CLOSE_DATA_SOURCE_DIALOG = '.close-popover .bk-text:contains(Done):visible';
uiSelectors.SCHEMA_IMPORT_SUCCESS_DIALOG = '.bk-import-success .bk-import-success-text';
uiSelectors.DATA_SOURCE_COLUMNS_PANEL = '.bk-sage-data-component.bk-columns-container';
uiSelectors.DATA_COLUMN_SOURCE_ITEM = '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item';
uiSelectors.DATA_COLUMN_SOURCE_ITEM_NAME = '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-source-name';
uiSelectors.DATA_COLUMN_ITEM_CLICKABLE = '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-columns-list .bk-list-item .bk-clickable';
uiSelectors.DATA_COLUMN_ITEM = '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-columns-list .bk-list-item .bk-column-name';
uiSelectors.DATA_COLUMN_SRC_TABLE_ITEM = '.bk-columns-container .bk-sage-data-columns .bk-source-list .bk-source-item .bk-columns-list .bk-column-item .bk-source-name';
uiSelectors.DATA_COLUMN_ITEM_MENU = '.bk-sage-data-column-menu';
uiSelectors.LEFT_PANEL = '.bk-sage-data';
uiSelectors.DATA_COLUMN_ITEM_MENU_SEARCH_ITEM = '.bk-sage-data-column-menu .menu-aggregation .menu-item';
uiSelectors.DATA_COLUMN_ITEM_MENU_FILTER_ITEM = '.bk-sage-data-column-menu .add-to-filter';
uiSelectors.DATA_COLUMN_ITEM_MENU_CONTAINER = '.bk-movable-column-menu';

uiSelectors.DATA_FILTER_ITEM = '.bk-filters-container .bk-sage-data-filters .bk-list-item';
uiSelectors.DATA_FILTER_POPUP = '.bk-sage-data-filter-container .bk-viz-filter';

uiSelectors.DROPDOWN = '.bk-context-menu';
uiSelectors.DROPDOWN_SUBMENU_OPTION = '.bk-context-menu .bk-drill-sub-menu .context-sub-menu-title-container';
uiSelectors.EXCLUDE_SUBMENU_OPTION = '.bk-context-menu .context-sub-menu:contains(Exclude)';
uiSelectors.EXCLUDE_SUBMENU_CLICK_TARGET = '.bk-context-menu .context-sub-menu:contains(Exclude) .context-sub-menu-title-container';
uiSelectors.DROPDOWN_ITEM = '.bk-context-menu .bk-drill-sub-menu .bk-items .bk-item';
uiSelectors.DROPDOWN_SEARCH_ITEM = '.bk-context-menu .bk-drill-sub-menu .bk-items .bk-item:contains(Market Segment)';
uiSelectors.NO_MATCHES_ITEM = '.bk-context-menu .bk-drill-sub-menu .bk-items .bk-no-select';
uiSelectors.DROP_DOWN_ITEM = 'Customer Region';
uiSelectors.CHART_TITLE = 'Chart 1';

/* Filter / Headline */

uiSelectors.HEADLINE_VIZ = '.bk-viz-headline';
uiSelectors.FILTER = uiSelectors.DATA_FILTER_POPUP;
uiSelectors.CHECKBOX_FILTER_SEARCH = '.bk-checkbox-filter .bk-search-input';
uiSelectors.CB_FILTER_CONTENT = '.bk-cb-filter-content';
uiSelectors.FILTER_SAMPLE_VALUES = '.bk-filter-sample-values';
uiSelectors.CB_FILTER_TITLE = uiSelectors.CB_FILTER_CONTENT + ' .bk-checkbox-title';
uiSelectors.CB_FILTER = uiSelectors.FILTER + ' ' + uiSelectors.CB_FILTER_CONTENT;
uiSelectors.CB_FILTER_OPTION = uiSelectors.CB_FILTER + ' .bk-filter-option';
uiSelectors.TOP_SECTION = uiSelectors.CB_FILTER + ' .bk-cb-filter-top-section .bk-section-control';
uiSelectors.SUMMARY_ROW = uiSelectors.summaryRow(uiSelectors.HEADLINE_VIZ);
uiSelectors.DATE_SUMMARY_ROW = uiSelectors.dateRangeSummaryRow(uiSelectors.HEADLINE_VIZ);
uiSelectors.DATE_PICKER_POPUP = '.datepicker.datepicker-dropdown.dropdown-menu';
uiSelectors.FILTER_DONE_BUTTON = '.bk-dialog-ok-btn';
uiSelectors.READ_ONLY_FILTER = '.bk-filter-read-only';

/* Pinboard */

uiSelectors.PINBOARD = '.bk-sharable-item .bk-answer';
uiSelectors.PINBOARD_TABLE_ROW = uiSelectors.PINBOARD + ' ' + uiSelectors.TABLE_ROW;
uiSelectors.VIZ_CONTEXT = '.bk-viz-context';
uiSelectors.VIZ_CONTEXT_TABLE_ROW = uiSelectors.VIZ_CONTEXT + ' ' + uiSelectors.TABLE_ROW;
uiSelectors.VIZ_CONTEXT_TITLE = uiSelectors.VIZ_CONTEXT + ' ' + '.popup-header .bk-header-title';

uiSelectors.PINBOARD_DROP_DOWN = '.bk-viz-pinner-modal';
uiSelectors.PINBOARD_DROP_DOWN_SHOW_NEW_BTN = uiSelectors.PINBOARD_DROP_DOWN + ' .bk-show-create-pinboard-btn';
uiSelectors.PINBOARD_DROP_DOWN_ADD_BTN = uiSelectors.PINBOARD_DROP_DOWN + ' .bk-create-pinboard-btn';
uiSelectors.PINBOARD_DRAG_PLACEHOLDER = '.packery-drop-placeholder';

uiSelectors.START_SLIDE_SHOW = '.bk-viz-maximize-btn';
/* Sage */

uiSelectors.HOME_SAGE_BAR = '.bk-home-sage-bar';
uiSelectors.SAGE_INPUT = '.bk-sage-real-input';
uiSelectors.EDITABLE_SAGE = '.bk-sage .bk-sage-bar input.bk-sage-real-input';
uiSelectors.READ_ONLY_SAGE = '.bk-sage.bk-read-only-sage .bk-sage-bar div.bk-sage-real-input';
uiSelectors.AUTOCOMPLETE_DDOWN = '.bk-dropdown-wrapper';
uiSelectors.AUTOCOMPLETE_FIRST_SECTION = uiSelectors.AUTOCOMPLETE_DDOWN + ' .bk-dropdown-list-wrapper:first-child';
uiSelectors.AUTOCOMPLETE_FIRST_LIST = uiSelectors.AUTOCOMPLETE_FIRST_SECTION + ' ul';
uiSelectors.AUTOCOMPLETE_ITEM = uiSelectors.AUTOCOMPLETE_FIRST_LIST + ' li';
uiSelectors.AUTOCOMPLETE_ITEM_LABEL = uiSelectors.AUTOCOMPLETE_ITEM + ' .item-text';
uiSelectors.EMPHASIZED_TEXT = uiSelectors.AUTOCOMPLETE_ITEM_LABEL + ' .matched-substring';
uiSelectors.AUTOCOMPLETE_ITEM_LINEAGE = uiSelectors.AUTOCOMPLETE_ITEM_LABEL + ' .lineage';
uiSelectors.AUTOCOMPLETE_ERROR_SECTION = uiSelectors.AUTOCOMPLETE_FIRST_SECTION + ' .header-text span';
uiSelectors.AUTOCOMPLETE_OUT_OF_SCOPE_SECTION = uiSelectors.AUTOCOMPLETE_FIRST_SECTION + ' .header-text.out-of-scope';
uiSelectors.AUTO_COMPLETE_VIEW_ALL = uiSelectors.contains(uiSelectors.AUTOCOMPLETE_DDOWN + ' .bk-repeat-view-all', 'View More');
uiSelectors.AUTO_COMPLETE_VIEW_ALL_VISIBLE = uiSelectors.contains(uiSelectors.AUTOCOMPLETE_DDOWN + ' .bk-repeat-view-all', 'View More') + ':visible:not(".ng-hide")';

uiSelectors.SEARCH_DOCTOR = '.search-doctor';
uiSelectors.AMBIGUOUS_JOIN_PATH = '.bk-sage .bk-dropdown-list-header:contains(Multiple matches)';
uiSelectors.SAGE_ERROR = '.bk-sage-search-icon.bk-error-exists';

uiSelectors.DATA_EXPLORER_LINK = '.bk-sage-explore';
uiSelectors.DATA_EXPLORER = '.bk-explorer';
uiSelectors.DATA_EXPLORER_TABLE_LIST = uiSelectors.DATA_EXPLORER + ' .bk-table-list:visible';
uiSelectors.DATA_EXPLORER_TABLE = uiSelectors.DATA_EXPLORER + ' .grid-canvas';
uiSelectors.DATA_EXPLORER_TABLE_ROW = uiSelectors.DATA_EXPLORER_TABLE + ' .slick-row';
uiSelectors.DATA_EXPLORER_TAB = uiSelectors.DATA_EXPLORER + ' .mode-select .mode-item';
uiSelectors.DATA_EXPLORER_RELATIONSHIPS_TAB = uiSelectors.contains(uiSelectors.DATA_EXPLORER_TAB, 'Relationships');

uiSelectors.RELATIONSHIP_EDITOR = '.bk-relationship-editor';

uiSelectors.INFO_CARD_BUTTON = '.bk-infocard-button';
uiSelectors.INFO_CARD = '.bk-info-card';
uiSelectors.NATURAL_QUERY_OUTPUT_COLUMN = '.bk-info-card-body .bk-output-column';
uiSelectors.NATURAL_QUERY_GROUPING_COLUMN = '.bk-info-card-body .bk-grouping-column';

uiSelectors.SAGE_DATA_PANEL = '.bk-sage-data';
uiSelectors.SAGE_NO_SOURCES_TOOLTIP = '.bk-add-sources-popover';
uiSelectors.SAGE_OVERLAY = '.bk-generic-overlay';

/* Metadata */
uiSelectors.ANSWER_ITEM = '.bk-answer-list .bk-list-content .vs-repeat-repeated-element';
uiSelectors.PINBOARD_LIST = '.bk-pinboard-list';
uiSelectors.PINBOARD_ITEM = uiSelectors.PINBOARD_LIST + ' .bk-list-content .vs-repeat-repeated-element';
uiSelectors.WORKSHEET_ITEM = '.bk-data-list .bk-list-content .vs-repeat-repeated-element';
uiSelectors.SAVE_METADATA_BTN = '.bk-action-dropdown .bk-action-save';
uiSelectors.UPDATE_METADATA_BTN = '.bk-action-dropdown .bk-action-update';
uiSelectors.SAVE_UNTITLED_METADATA_BTN = '.bk-action-dropdown .bk-action-save-untitled';
uiSelectors.RESET_LAYOUT_BTN = '.bk-action-dropdown .bk-action-reset-layout';
uiSelectors.METADATA_LIST_ITEM = '.bk-actionable-list .bk-list-content .vs-repeat-repeated-element';
uiSelectors.NEW_ITEM_ACTION = '.bk-action-dropdown .bk-dropdown-item';
uiSelectors.SHOW_COLUMNS_BUTTON = '.mode-item:contains(Columns)';
uiSelectors.SHOW_DATA_BUTTON = '.mode-item:contains(Data)';
uiSelectors.SHOW_DEPENDENTS_BUTTON = '.mode-item:contains(Dependents)';
uiSelectors.SHOW_RELATIONSHIP_BUTTON = '.mode-item:contains(Relationships)';
uiSelectors.LIST_ADMIN_ITEM = '.bk-list-content .bk-row-flex';

/* Formula */

uiSelectors.CREATE_FORMULA_BUTTON = '.bk-formulae-container .header-add-button';
uiSelectors.FORMULA_NAME_EDITOR = '.bk-formula-editor .bk-formula-name';
uiSelectors.FORMULA_EDITOR = '.bk-formula-editor .content-editor';
uiSelectors.LEFT_PANEL_FORMULA_LIST = uiSelectors.LEFT_PANEL + ' .bk-source-list li:contains(Formulas)';

/* Content editable*/
uiSelectors.DESCRIPTION_CONTAINER = '.bk-description-container';

/* Other */

uiSelectors.REPLAY_CONTROLS = '.bk-replay-controls';
uiSelectors.SIM_HOVER_CLASS = 'simhover';
uiSelectors.ANSWER_DOCUMENT = '.answer-document';

/* Sharable Item */
uiSelectors.SHARABLE_ITEM_CONTENT = '.sharable-item-content';
