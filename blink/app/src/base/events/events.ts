/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service used to list all the event names, ensuring there
 * are no collisions or typos.
 */
import {Provide} from '../decorators';

export const events = {
    // events for central alerting mechanism
    SHOW_ALERT_D: 'show-alert-d',
    HIDE_ALERT_D: 'hide-alert-d',

    USER_AUTHENTICATED_D: 'user-authenticated-d',

    SHOW_HIDE_LOADING_OVERLAY_D: 'show-hide-loading-overlay-d',
    // Sage
    SAGE_LOADED_U: 'sage-loaded-u',
    HOME_SAGE_ANIMATION_DONE_D: 'home-sage-animation-done-d',
    SAGE_BAR_STATE_VALID_U: 'sage-bar-state-valid-u',
    SAGE_BAR_STATE_VALID_D: 'sage-bar-state-valid-d',
    SAGE_BAR_STATE_INVALID_U: 'sage-bar-state-invalid-u',
    SAGE_BAR_STATE_INVALID_D: 'sage-bar-state-invalid-d',
    CLOSE_SAGE_BAR_DROPDOWN_D: 'close-sage-bar-dropdown-d',
    CLEAR_SAGE_QUERY_D: 'clear-sage-query-d',
    CLEAR_AND_HIDE_POPUP_MENU: 'clear-and-hide-popup-menu',
    REFRESH_SAGE_DATA_SOURCES_D: 'refresh-sage-data-sources-d',

    SHOW_SAGE_BUBBLE_D: 'show-sage-bubble-d',
    HIDE_SAGE_BUBBLE_U: 'hide-sage-bubble-u',
    HIDE_SAGE_BUBBLE_D: 'hide-sage-bubble-d',

    SHOW_EXPRESSION_EDITOR_TOOLTIP : 'show-formula-editor-tooltip',
    HIDE_EXPRESSION_EDITOR_TOOLTIP : 'hide-formula-editor-tooltip',

    PINBOARD_RENDERED: 'pinboard-rendered',
    ANSWERSHEET_CONTENT_UPDATED_D: 'answersheet-content-updated-d',
    RELOAD_PINBOARD_D: 'reload-pinboard-d',
    RELOAD_PINBOARD_DATA: 'reload-pinboard-data',
    RERENDER_PINBOARD_U: 'rerender_pinboard_u',
    PINBOARD_VISUALIZATION_QUERY_CHANGED_D: 'pinboard-visualization-query-changed-d',
    REFLOW_PINBOARD: 'reflow_pinboard',
    SAVE_ANSWER_U: 'save-answer-u',
    UPGRADE_ANSWER_U: 'upgrade-answer-u',
    DOWNLOAD_TABLE: 'download-table',
    DOWNLOAD_EXCEL_FILE_U: 'download-excel-file-u',
    DOWNLOAD_CHART: 'download-chart',
    DOCUMENT_SAVED: 'document-saved',

    FILTER_DISPLAY_STATE_CHANGED_U: 'filter-display-state-changed-u',
    CHART_RENDER_REQUIRED_U: 'chart-render-required-u',
    TABLE_RENDER_REQURIED_U: 'table-render-required-u',
    FORCE_ANSWER_REPAINT_U: 'force-repaint-answer-u',

    TABLE_COLUMN_SELECTED_U: 'table-column-selected-u',

    DRILL_OPTION_CLICK_U: 'drill-option-click-u',
    UNLOCK_VIZ_CONFIG_D: 'unlock-viz-config-d',

    ADD_FORMULA_COLUMN_U: 'add-formula-u',
    ADD_FORMULA_COLUMN_D: 'add-formula-d',

    CHART_TYPE_CHANGED_U: 'chart-type-changed-u',
    CHART_NEEDS_REDRAW_U: 'chart-needs-redraw-u',
    CHART_NEEDS_RELOAD: 'chart-needs-reload',
    HIDE_CHART_TOOLBAR_U: 'hide-chart-toolbar-u',
    CHART_MODEL_CHANGED_D: 'chart-model-changed-d',
    CHART_CREATED: 'chart-created',

    ANSWER_VIEWPORT_CHANGED_U: 'answer-viewport-changed-u',

    LOAD_VIZ_DATA: 'load-viz-data-d',
    LIST_RENDERED_U: 'list-rendered-u',
    LEFT_PANEL_RENDERED_U: 'left-panel-rendered-u',
    LEFT_PANEL_COMPONENT_RENDERED_U: 'left-panel-component-rendered-u',
    HOME_PAGE_LOADED_U: 'home-page-loaded-u',

    TILE_REMOVE_BTN_CLICKED_U: 'tile-remove-btn-clicked-u',
    TILE_REMOVE_USER_CONFIRMED_U: 'tile-remove-user-confirmed-u',
    SHOW_VIZ_CONTEXT_U: 'show-viz-context-u',
    SHOW_VIZ_CONTEXT_D: 'show-viz-context-d',
    HIDE_VIZ_CONTEXT_D: 'hide-viz-context-d',
    SHOW_VIZ_CONTEXT_USER_CONFIRMED_U: 'show-viz-context-user-confirmed-u',
    VIZ_MENU_TOGGLE: 'viz-menu-toggle',

    ANSWER_UI_RENDERED_U: 'answer-ui-rendered-u',

    UNSAVED_CHANGES_RESOLVED_U: 'unsaved-changes-resolved-u',

    ANSWER_DISPLAY_MODE_CHANGE: 'answer-display-mode-change',
    SAVE_BUTTON_CLICKED_D: 'save-button-clicked-d',
    SAVEAS_BUTTON_CLICKED_D: 'saveas-button-clicked-d',
    MAKECOPY_BUTTON_CLICKED_D: 'makecopy-button-clicked-d',
    SHARE_BUTTON_CLICKED_D: 'share-button-clicked-d',
    FOOLSCAP_DOWNLOAD_AS_PDF_BUTTON_CLICKED_D: 'foolscap-download-as-pdf-button-clicked-d',
    SCHEDULE_BUTTON_CLICKED_D: 'schedule-button-clicked-d',
    VIEW_SCHEDULE_BUTTON_CLICKED_D: 'view-schedules-button-clicked-d',
    COPY_LINK_BUTTON_CLICKED_D: 'copy-link-button-clicked-d',
    ADD_FILTER: 'add-filter',

    POST_COMMENT_BUTTON_CLICKED_D: 'post_comment_button_clicked_d',

    LAYOUT_REFLOW_REQUIRED_U: 'layout-reflow-required-u',
    LAYOUT_REDRAW_DONE_D: 'layout-redraw-done-d',
    LAYOUT_REFLOW_DONE_D: 'layout-reflow-done-d',
    LAYOUT_ADDED_TILE_D: 'layout-added-tile-d',
    LAYOUT_REMOVED_TILE_D: 'layout-removed-tile-d',
    LAYOUT_CLEARED_ANSWER_D: 'layout-cleared-answer-d',
    LAYOUT_RESET_D: 'layout-reset-d',
    LAYOUT_RESET_U: 'layout-reset-u',
    LAYOUT_CUSTOM_MODE_CHANGED_U: 'layout-custom-mode-changed-u',
    LAYOUT_CHANGE_DONE: 'custom-layout-change-done',

    REFLOW_VIZ: 'reflow-viz',

    WIDGET_SLIDER_HANDLE_MOVED_U: 'widget-slider-handle-moved-u',

    TOUR_INTRO_D: 'tour-intro-d',

    USERDATA_IMPORT_BTN_CLICKED_D: 'userdata-import-btn-clicked-d',
    DATA_IMPORT_CANCELED_U: 'data-import-canceled-u',

    CLEAR_USER_AUTOCOMPLETE: 'clear-user-autocomplete',

    OPEN_FILTER_PANEL: 'open-filter-panel',

    SAGE_DATA_EXPANSION_STATE_CHANGED_D: 'sage-data-expansion-state-changed-d',

    SHOW_OVERLAY_ON_DOCUMENT: 'show-overlay-on-document',
    HIDE_DOCUMENT_OVERLAY: 'hide-document-overlay',

    REMOVE_ALL_WORKSHEET_COLUMNS_D: 'remove-all-worksheet-columns',

    EXPAND_AND_SET_ACTIVE_SUBMENU: 'expand-and-set-active-submenu',
    CONTEXT_MENU_RESET: 'context-menu-reset',

    SHOW_FORMULA_EDITOR_D: 'show-formula-editor',

    LABEL_UPDATED_D: 'label-updated-d',
    FILTER_METADATA_BY_LABEL_D: 'filter-metadata-by-label-d',
    RESET_LABEL_SELECTION_D: 'label-selection-reset-d',

    LABELS_REFRESH_D: 'labels-refresh-d',

    USER_PROFILE_PIC_AVAILABLE_D: 'user-profile-pic-available-d',

    dataManagement: {
        SELECTION_CHANGED: 'data-management-selection-changed',
        LINK_COLUMN: 'data-management-link-column',
        NEW_SOURCE_ADDED: 'data-management-new-source-added',
        SOURCE_DELETED: 'data-management-source-deleted'
    },

    TIPS_HELP_WIDGET: 'tips-help-widget',

    RELATIONSHIP_ADD_SUCCESSFUL: 'relationship-add-successful',
    RELATIONSHIP_DELETE_SUCCESSFUL: 'relationship-delete-successful',
    RELATIONSHIP_UPDATE_SUCCESSFUL: 'relationship-update-successful',
    SWITCH_RELATIONSHIP_EDIT_MODE: 'switch-relationship-edit-mode',

    API_ALERT_D: 'api-alert-d',

    VIZ_ADDED_TO_PINBOARD_U: 'viz-added-to-pinboard-u'
};

Provide('events')(events);
