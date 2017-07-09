/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Supriya Kharade (supriya.kharade@thoughtspot.com)
 *
 * @fileoverview Constants used in Blink.
 *
 */
import _ from 'lodash';
import {Provide} from 'src/base/decorators';
import {translations} from 'translations';
// Remove this merger once all references to strings
// are directly referencing strings.
export const blinkConstants = _.merge({
    DEFAULT_DATA_BATCH_SIZE: 1000,

    DEFAULT_DEBOUNCING_TIME: 500,

    URL_CAPTION_REGEX: /{caption}(.*){\/caption}/,

    // Metadata
    METADATA_ANSWER_TYPE: 'answers',
    METADATA_PINBOARDS_TYPE: 'pinboards',
    METADATA_PAGE_SIZE: 20,

    ANSWER_TYPE: 'answer',
    SAVED_ANSWER_TYPE: 'saved-answer',
    AGGREGATED_WORKSHEET_TYPE: 'aggregated-worksheet',
    PINBOARD_TYPE: 'pinboard',
    WORKSHEET_TYPE: 'worksheet',
    RELATED_LINK_TYPE: 'relatedLinkType',
    IMPORTED_DATA_TYPE: 'imported-data',

    ANSWER_DISPLAY_MODE_PREFERENCE_KEY: 'answer-display-mode-preference-key',

    FILE_TYPE: {
        CSV: 'csv',
        XLS: 'xls',
        PDF: 'pdf',
        XLSX: 'xlsx'
    },
    defaultAdminEmail: 'admin@thoughtspot.com',

    PieChartCardinalityThreshold: 50,

    LEFT_PANEL_GROUPING_THRESHOLD: 75,

    headline : {
        MAX_PIXEL_WIDTH_SUMMARY_VALUE: 100
    },

    schemaType: {
        TABLE: 'table',
        WORKSHEET: 'worksheet',
        ANSWER: 'answer'
    },

    metadataListPage: {
        jobRunColId: {
            START_TIME: 'startTimeCol',
            END_TIME: 'endTimeCol',
            STATE: 'stateCol'
        },
        jobRunColClass: {
            START_TIME: 'bk-job-start-time',
            END_TIME: 'bk-job-end-time',
            STATE: 'bk-job-run-state'
        },
        jobColId: {
            STATE: 'stateCol',
            CRON_SCHEDULE: 'cronScheduleCol',
            RECIPIENT: 'recipientCol'
        },
        jobColClass: {
            STATE: 'bk-job-state',
            CRON_SCHEDULE: 'bk-job-cron-schedule',
            RECIPIENT: 'bk-job-recipient'
        },
        listColId: {
            NAME: 'nameCol',
            DISPLAYED_NAME: 'displayedNameCol',
            DESCRIPTION: 'descriptionCol',
            CREATED_AT: 'dateCreatedCol',
            MODIFIED: 'dateModifiedCol',
            AUTHOR: 'authorCol',
            STICKERS: 'stickersCol',
            SOURCE: 'sourceCol',
            DATA_SOURCE_TYPE: 'dataSourceTypeCol',
            DATA_SOURCE_SCHEDULED: 'dataSourceScheduledCol',
            DATA_SOURCE_LOAD_STATUS: 'dataSourceLoadStatusCol',
            STATUS_VIEWER_LOAD_STATUS: 'statusViewerLoadStatusCol',
            DATA_FILTER_TABLE: 'dataFilterTableCol',
            DATA_FILTER_COLUMN: 'dataFilterColumnCol',
            DATA_FILTER_CONDITION: 'dataFilterConditionCol',
            DATA_FILTER_TEXT: 'dataFilterTextCol',
            JOB_OPERATION: 'jobOperation',
            TRANSFORMATION_EDITOR_COLUMN: 'transformationEditorColumnCol',
            TRANSFORMATION_EDITOR_TABLE: 'transformationEditorTableCol',
            TRANSFORMATION_EDITOR_EXPRESSION: 'transformationEditorExpressionCol',
            A3_JOB_RESULT: 'a3JobResult',
            A3_JOB_RUN_RESULT: 'a3JobRunResult'
        },
        listColClass: {
            NAME: 'bk-name',
            DISPLAYED_NAME: 'bk-display-name',
            DESCRIPTION: 'bk-description',
            CREATED_AT: 'bk-time-and-author',
            MODIFIED: 'bk-time-and-author',
            AUTHOR: 'bk-profile-pic-container',
            STICKERS: 'bk-list-label',
            SOURCE: 'bk-list-source',
            DATA_SOURCE_TYPE: 'bk-ds-type',
            DATA_SOURCE_SCHEDULED: 'bk-ds-scheduled',
            DATA_SOURCE_LOAD_STATUS: 'bk-ds-load-status',
            STATUS_VIEWER_LOAD_STATUS: 'bk-status-viewer-load-status',
            DATA_FILTER_TABLE: 'bk-data-filter-table',
            DATA_FILTER_COLUMN: 'bk-data-filter-column',
            DATA_FILTER_CONDITION: 'bk-data-filter-condition',
            DATA_FILTER_TEXT: 'bk-data-filter-text',
            JOB_OPERATION: 'bk-job-operations',
            TRANSFORMATION_EDITOR_COLUMN: 'bk-transformation-editor-column',
            TRANSFORMATION_EDITOR_TABLE: 'bk-transformation-editor-table',
            TRANSFORMATION_EDITOR_EXPRESSION: 'bk-transformation-editor-expression',
            A3_JOB_RESULT: 'bk-a3-job-result',
            A3_JOB_RUN_RESULT: 'bk-a3-job-run-result'
        },

        autoRefresh: {
            A3_JOB_REFRESH_MS: 10000
        },

        pinboards: {
            button: {
                icon: 'bk-style-icon-small-plus',
                class: 'bk-create-new-pinboard'
            }
        },
        dataManagement: {
            tables: {
                tabId: 'tablesTab'

            },
            dataSources: {
                tabId: 'dataSourcesTab',
            },
            privileges: {
                DATAMANAGEMENT: 'DATAMANAGEMENT',
                ADMINISTRATION: 'ADMINISTRATION',
                SYSTEMMANAGEMENT: 'SYSTEMMANAGEMENT'
            }
        },
        jobs: {
            button: {
                icon: 'bk-style-icon-small-plus',
                class: 'bk-create-new-job'
            }
        },
        actions: {
            share: {
                icon: 'bk-style-icon-share'
            },
            delete: {
                icon: 'bk-style-icon-delete'
            },
            tag: {
                icon: 'bk-style-icon-label bk-apply-label-btn',
                class: 'bk-apply-label-btn'
            },
            reset: {
                icon: 'bk-style-icon-reset'
            },
            abort: {
                icon: 'bk-style-icon-cross'
            },
            schedule: {
                icon: 'bk-style-icon-calendar'
            },
            pause: {
                icon: 'bk-style-icon-pause',
                class: 'bk-pause-job-btn'
            },
            resume: {
                icon: 'bk-style-icon-play',
                class: 'bk-resume-job-btn'
            },
            export: {
                icon: 'bk-style-icon-download'
            },
            import: {
                icon: 'bk-style-icon-upload'
            },
            download: {
                icon: 'bk-style-icon-download'
            },
            sendEmail: {
                icon: 'bk-style-icon-share'
            },
            relate: {
                icon: 'bk-style-icon-relate'
            }
        }
    },



    HTTP_STATUS_NOT_LOGGED_IN: 401,
    HTTP_STATUS_NOT_AUTHORIZED: 403,

    ALL_GROUP_GUID: 'b25ee394-9d13-49e3-9385-cd97f5b253b4',
    SUPER_USER_GUID: '0f0dd0f7-7411-4195-a4aa-0dc6b58413c9',
    SYSTEM_USER_GUID: '67e15c06-d153-4924-a4cd-ff615393b60f',
    ADMIN_GROUP_GUID: 'd0326b56-ef23-4c8a-8327-a30e99bcc72b',
    SYSTEM_GROUP_GUID: '179d8867-cf36-4a8d-a019-63a226fd3196',

    GUIDS_TO_SKIP: [
        'b25ee394-9d13-49e3-9385-cd97f5b253b4',
        '0f0dd0f7-7411-4195-a4aa-0dc6b58413c9',
        '67e15c06-d153-4924-a4cd-ff615393b60f',
        '179d8867-cf36-4a8d-a019-63a226fd3196'
    ],

    CHART_TOOLTIP_DELAY: 200,

    columnAdditionNotAllowedReasonTypes: {
        tooManyColumns: 'TOO_MANY_COLUMNS',
        complexQuery: 'COMPLEX_QUERY',
        missingUnderlyingAccess: 'MISSING_UNDERLYING_ACCESS'
    },

    derivedColumnExprTypes: {
        DERIVATION_TYPE_LCR: 'LOGICAL_COLUMN_REFERENCE',
        DERIVATION_TYPE_EXPRESSION: 'EXPRESSION'
    },

    keyCodes: {
        UP_ARROW: 38,
        DOWN_ARROW: 40,
        ENTER_KEY: 13,
        TAB_KEY: 9,
        ESC_KEY: 27
    },

    documentType: {
        ANSWER: 'ANSWER',
        SAVED_ANSWER: 'SAVED-ANSWER',
        REPLAY_ANSWER: 'REPLAY-ANSWER',
        PINBOARD: 'PINBOARD',
        WORKSHEET: 'WORKSHEET',
        AGGREGATED_WORKSHEET: 'AGGREGATED-WORKSHEET'
    },

    dataColumnHeaders: {
        indexType: {
            MIN_WIDTH: 236
        },
        geoConfig: {
            MIN_WIDTH: 152
        },
        currencyType: {
            MIN_WIDTH: 180
        }
    },

    DataExplorerViewModes: {
        PROP_VIEW: 'PROP_VIEW',
        DATA_VIEW: 'DATA_VIEW',
        RELATIONSHIP_VIEW: 'RELATIONSHIP_VIEW',
        DEPENDENTS_VIEW: 'DEPENDENTS_VIEW',
        SECURITY_VIEW: 'SECURITY_VIEW',
        PROFILE_VIEW: 'PROFILE_VIEW',
        ANALYZE_VIEW: 'ANALYZE_VIEW',
        A3_VIEW: 'A3_VIEW',
    },

    LOADING_SAMPLE_VALUE: '-',
    SPECIAL_VALUE_UNAVAILABLE: '601d5a70-d354-4aab-aa7c-b0f712f51ae3',

    joinWorkflow: {
        types: {
            INVALID_TYPE: 'INVALID_TYPE',
            DEFINE_MAPPING: 'DEFINE_MAPPING',
            EDIT_MAPPING: 'EDIT_MAPPING'
        }
    },

    preferenceKeys: {
        PANEL_STATE: 'PANEL_STATE',
        SUPPRESS_MANAGE_SOURCES_TOOLTIP: 'SUPPRESS_MANAGE_SOURCES_TOOLTIP',
        SUPPRESS_IN_USE_SOURCE_REMOVAL_WARNING: 'SUPPRESS_IN_USE_SOURCE_REMOVAL_WARNING',
        ANSWER_PAGE_ALERT: 'ANSWER_PAGE_ALERT_STATE'
    },


    decimalPrecision: {
        MIN: 2,
        MAX: 8
    },

    // TODO(mahesh): Move geo related constants to GeoConstants
    geo3dProjectionTypes: {
        GLOBE: 'GLOBE',
        PERSPECTIVE_PLANE: 'PERSPECTIVE_PLANE',
        MAP: 'MAP'
    },

    geoTypeSourceIds: {
        THOUGHTSPOT_LOCAL: 'THOUGHTSPOT_LOCAL',
        MAPBOX: 'MAPBOX'
    },

    geoTileTypes: {
        MAPBOX: {
            LIGHT: 'light-v9',
            DARK: 'dark-v9',
            OUTDOORS: 'outdoors-v9',
            STREETS: 'streets-v9',
            SATELLITE: 'satellite-v9',
            SATELLITE_STREETS: 'satellite-streets-v9'
        }
    },

    geoTileUrls: {
        THOUGHTSPOT_LOCAL: '/maptiles/{z}/{x}/{y}.jpg',
        MAPBOX: 'https://api.mapbox.com/styles/v1/mapbox/{tileType}/tiles/{z}/{x}/{y}?' +
        'access_token=pk.eyJ1Ijoic2hhc2hhbmt0cyIsImEiOiJjaW9kamoyMnkwMDg2djFtMzkxZnpsOGx0In0' +
        '.aX7lSTbzhDzyi5bhlOKSlA'
    },

    geoTileMaxZoom: {
        THOUGHTSPOT_LOCAL: 11,
        MAPBOX: 18
    },

    geoTileAttribution: {
        THOUGHTSPOT_LOCAL: ol.source.OSM.ATTRIBUTION
    },

    pivotTable: {
        CARDINALITY_LIMIT: 100,
        COLUMN_WIDTH: 100
    },

    help: {
        mindTouchUrl: {
            home: {
                URL: '//help.thoughtspot.com/@api/deki/users/authenticate?authtoken={authToken}' +
                '&redirect=https://f1.help.thoughtspot.com/help_center/{versionNameForLink}/Home',
            },
            keywords: {
                URL: '//help.thoughtspot.com/@api/deki/users/authenticate?authtoken={authToken}&' +
                'redirect=https://f1.help.thoughtspot.com/help_center/' +
                '{versionNameForLink}/Keywords',
            },
            releaseNotes: {
                URL: '//help.thoughtspot.com/@api/deki/users/authenticate?authtoken={authToken}' +
                '&redirect=https://f1.help.thoughtspot.com/03_Knowledge_Base/Release_Notes/' +
                'Release_Notes_Version_{versionNameForLink}',
            },
            adminGuide: {
                URL: '//help.thoughtspot.com/@api/deki/users/authenticate?authtoken={authToken}' +
                '&redirect=https://f1.help.thoughtspot.com/help_center/{versionNameForLink}/' +
                'Documentation_Release_{versionNameForLink}',
            },
            downloads: {
                URL: '//help.thoughtspot.com/@api/deki/users/authenticate?authtoken={authToken}' +
                '&redirect=https://f1.help.thoughtspot.com/help_center/' +
                '{versionNameForLink}/Downloads'
            }
        },
        support: {
            PHONE: '+1 800-508-7008 Ext. 1',
            EMAIL: 'support@thoughtspot.com'
        }
    },

    importData: {
        STATUS_SEPARATOR: '/'
    },

    profilePic: {
        SIZE_PRE_SCALE: 4096000,
        SIZE_POST_SCALE: 512000,
        DIMENSION: 400
    },

    layout: {
        MIN_WIDTH: 8,
        MIN_WIDTH_STEP: 5,
        minHeight: {
            // Note (sunny): the default option is only to support
            // to avoid automatically changing the size of already
            // created pinboard vizs while auto fitting grid. When
            // the user manually resizes a viz we apply the viz
            // specific limits.
            DEFAULT: 5,
            CHART: 10,
            TABLE: 14,
            HEADLINE: 8
        }
    },

    tileSizes: {
        EXTRA_SMALL: 'xs',
        SMALL: 's',
        MEDIUM: 'm',
        LARGE: 'l',
        MEDIUM_SMALL: 'ms',
        LARGE_SMALL: 'ls'
    },

    communityLink: 'https://community.thoughtspot.com/',

    helpMenuItems: {
        help: {
            id: 'help',
            class: 'bk-action-help',
            icon: 'bk-style-icon-help-black'
        },
        community: {
            id: 'community',
            class: 'bk-action-community',
            icon: 'bk-style-icon-community-black'
        }
    },

    metadataObjectMenuItems: {
        save: {
            id: 'save',

            class: 'bk-action-save',
            icon: 'bk-style-icon-save'
        },
        update: {
            id: 'update',
            class: 'bk-action-update',
            icon: 'bk-style-icon-save'
        },
        saveUntitled: {
            id: 'saveUntitled',

            class: 'bk-action-save-untitled',
            icon: 'bk-style-icon-save'
        },
        saveAsWorksheet: {
            id: 'saveAsView',

            class: 'bk-action-save-as-worksheet',
            icon: 'bk-style-icon-table'
        },
        makeACopy: {
            id: 'makeACopy',

            class: 'bk-action-make-copy',
            icon: 'bk-style-icon-copy-doc'
        },
        copyLink: {
            id: 'embedDocument',
            class: 'bk-action-copy-link',
            icon: 'bk-style-icon-link'
        },
        pinboardSnapshot: {
            id: 'pinboardSnapshot',

            class: 'bk-action-pinboard-snapshot',
            icon: 'bk-style-icon-download'
        },
        resetLayout: {
            id: 'resetLayout',

            class: 'bk-action-reset-layout',
            icon: 'bk-style-icon-reset'
        },
        schedule: {
            id: 'schedule',
            class: 'bk-action-schedule',
            icon: 'bk-style-icon-calendar'
        },
        schedulesList: {
            id: 'schedule-list',
            class: 'bk-action-schedules',
            icon: 'bk-style-icon-calendar'
        },
        share: {
            id: 'share',

            class: 'bk-action-share',
            icon: 'bk-style-icon-share'
        },
        addFilter: {
            id: 'addFilter',

            class: 'bk-add-filter',
            icon: 'bk-style-icon-filter'
        },
        addFormula: {
            id: 'addFormula',

            class: 'bk-add-formula',
            icon: 'bk-style-icon-formula'
        },
        searchOnTop: {
            id: 'searchOnTop',

            class: 'bk-search-on-top',
            icon: 'bk-style-icon-search'
        },
        triggerA3: {
            id: 'triggerA3',

            class: 'bk-trigger-a3',
            icon: 'bk-style-icon-magic-wand'
        },
        triggerA2: {
            id: 'triggerA2',

            class: 'bk-trigger-a2',
            icon: 'bk-style-icon-configure'
        },
        replaySearch: {
            id: 'replaySearch',

            class: 'bk-replay-search',
            icon: 'bk-style-icon-replay'
        },
        showUnderlyingData: {
            id: 'showUnderlyingData',

            class: 'bk-show-underlying-data-trigger',
            icon: 'bk-style-icon-layers'
        },
        download: {
            id: 'download',

            class: 'bk-download-viz',
            icon: 'bk-style-icon-download'
        },
        downloadAsPdf: {
            id: 'downloadAsPdf',

            class: 'bk-download-as-pdf',
            icon: 'bk-style-icon-download'
        },
        downloadAsCsv: {
            id: 'downloadAsCSV',

            class: 'bk-download-as-csv',
            icon: 'bk-style-icon-download'
        },
        downloadAsXlsx: {
            id: 'downloadAsXLSX',

            class: 'bk-download-as-xlsx',
            icon: 'bk-style-icon-download'
        },
        presentation: {
            id: 'present',

            class: 'bk-viz-maximize-btn',
            icon: 'bk-style-icon-tour'
        },
        toggleSize: {
            id: 'toggleSize',
            class: 'bk-viz-toggle-btn',
        },
        edit: {
            id: 'edit',

            class: 'bk-viz-context-btn',
            icon: 'bk-style-icon-edit'
        },
        remove: {
            id: 'delete',
            class: 'bk-viz-delete-btn',
            icon: 'bk-style-icon-delete'
        },
        describe: {
            id: 'describe',
            class: 'bk-viz-describe-btn',
            icon: 'bk-style-icon-pinboard'
        },
        relate: {
            id: 'relate',
            class: 'bk-relate-answer',
            icon: 'bk-style-icon-relate'
        }
    },

    adminSection: {
        userManagement: {

            tabId: 'user-management',
            tabUsers: {

                id: 'users'
            },
            tabGroups: {

                id: 'groups'
            },
            tabRoles: {

                id: 'roles'
            }

        },
        dataManagement: {
            tabId: 'data-management',

            tabBusinessDataModel: {

                id: 'business-data-model',
                DATA_MODEL_FILE_NAME: 'model.xls'
            },
            tabDataSecurity: {

                id: 'data-security',
                SECURITY_FILE_NAME: 'security.xls'
            }
        },

        healthManagement: {
            tabId: 'health-management',

            tabOverview: {

                guid: '7d610c97-11dd-4137-940c-3eda0b1cb434',
                id: 'overview'
            },
            tabData: {

                guid: '7ba1d5d8-9cc0-4ec5-ac77-dd545c66dc75',
                id: 'data'
            },
            tabDatabase: {

                guid: '7632ad88-665a-4eaa-ba72-064666612087',
                id: 'database'
            },
            tabAlert: {

                guid: '09ec5619-057b-4b9e-b2fc-98f6905e47e6',
                id: 'alert'
            },
            tabCluster: {

                guid: 'f43e3f57-859f-4665-ac78-82ea72ec0980',
                id: 'cluster'
            }
        },
        styleCustomization: {
            tabId: 'style-customization',


            tabRules: {

                id: 'style-customization-rules'
            },

            tabResources: {

                id: 'style-customization-resources'
            }
        },
        jobManagement: {
            tabId: 'job-management'
        }
    },

    IGNORED_API_CALL_ERROR: new Error('Ignored older API call'),

    adminUI: {
        listColId: {
            DISPLAYED_NAME: 'displayNameCol',
            NAME: 'nameCol',
            CREATED_AT: 'dateModifiedCol',
            AUTHOR: 'authorCol'
        },
        listColClass: {
            DISPLAYED_NAME: 'bk-display-name',
            NAME: 'bk-name',
            CREATED_AT: 'bk-time-and-author',
            AUTHOR: 'bk-profile-pic-container'
        },
        tabId: {
            GROUPS_TAB: 'groupsTab',
            ROLES_TAB: 'rolesTab',
            USERS_TAB: 'usersTab'
        },

        formFields: {
            type : {
                PLAIN: 'plain'
            },
            inputType: {
                TEXT: 'text',
                EMAIL: 'email',
                PASSWORD: 'password'
            },
            fields: {
                NAME: 'name',
                DISPLAYNAME: 'displayName',
                DESCRIPTION: 'description',
                PASSWORD: 'password',
                CONFIRM_PASSWORD: 'confirmPassword',
                EMAIL: 'email'
            }
        }
    },
    dataFilter: {

        FILTER_TYPES: {
            IS_NULL:{

                noText: true
            },
            IS_NOT_NULL:{

                noText: true
            }
        }
    },

    debugging: {
        DEBUG_INFO_DOWNLOAD_TRIGGER_ALPHA_KEY_CODE: 75,
        DEBUG_FILE_NAME_PATTERN: 'thoughtspot-ui-debug-info-{1}.json',

    },

    printing: {
        //Keep it in sync with its corresponding value @print-page-height in blink-print.less.
        PRINT_PAGE_HEIGHT: 792,
        //Keep it in sync with its corresponding value @print-page-width in blink-print.less.
        PRINT_PAGE_WIDTH: 1122,
        //Keep it in sync with its corresponding value @viz-content-margin in blink-print.less.
        VIZ_CONTENT_MARGIN: 12,
        //Keep it in sync with its corresponding value @viz-title-margin in blink-print.less.
        VIZ_TITLE_HEIGHT: 32,
        //Calculated height of the slick-grid table header
        TABLE_HEADER_HEIGHT: 47,
    },

    jobProtoKeys: {
        AUTHOR: 'author_id',
        PINBOARDS: 'pinboard_ids',
        GROUPS: 'group_ids',
        USERS: 'user_ids',
        EMAILS: 'email_to',
        FORMAT: 'file_format',
        NAME: 'name',
        DESCRIPTION: 'description',
        A3_REQUEST: 'AnalysisRequest'
    },
    vizTypes: {
        CHART: 'CHART',
        TABLE: 'TABLE',
        HEADLINE: 'HEADLINE',
        FILTER: 'FILTER'
    },
    dataSourcePreview: {
        FOOTER_TEXT: ' and {1} more.'
    },
    infoCard: {
        TITLE: 'What am I looking at ?'
    },
    DAY_OF_WEEK_FORMAT: 'e',
    TRACE_COLLECTOR_NAME: 'BlinkWorkflowManager'
}, translations);
Provide('blinkConstants')(blinkConstants);
