/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Constants used in the Callosum JSON API that various blink classes refer to.
 */

'use strict';
import {Provide} from 'src/base/decorators';

export var jsonConstants = {

    // Common
    DATA_KEY: 'data',
    CHART_DATA_KEY: 'chartData',
    ALL_COLUMNS_KEY: 'columns',
    ALL_RELATIONSHIPS_KEY: 'relationships',
    MULTIPLE_HEADER_KEY: 'headers',

    ERROR_CODE_KEY: 'errorCode',

    // Header
    HEADER_KEY: 'header',
    ID_KEY: 'id',
    OWNER_KEY: 'owner',
    NAME_KEY: 'name',
    CREATED_KEY: 'created',
    NAMED_PROPERTIES_KEY: 'namedProperties',
    UNDERLYING_COLUMN_NAME_KEY: 'underlyingColumnName',
    DESCRIPTION_KEY: 'description',
    AUTHOR_KEY: 'author',
    AUTHOR_NAME: 'authorName',
    AUTHOR_DISPLAY_NAME: 'authorDisplayName',
    GENERATION_NUM_KEY: 'generationNum',
    IS_HIDDEN_KEY: 'isHidden',
    METRIC_DEFINITION_KEY: 'metricDefinition',
    METRICS: 'metrics',
    BASE_METRIC_DEFINITION_KEY: 'baseMetricDefinition',
    COMPLETION_RATIO: 'completionRatio',
    IS_AUTO_DELETE_KEY: 'isAutoDelete',

    CURRENCY_TYPE_INFO_KEY: 'currencyTypeInfo',
    BASE_CURRENCY_TYPE_INFO_KEY: 'baseCurrencyTypeInfo',

    GEO_CONFIG_KEY: 'geoConfig',
    BASE_GEO_CONFIG_KEY: 'baseGeoConfig',

    REPORT_BOOK_METADATA_KEY: 'reportBookMetadata',
    REPORT_BOOK_CONTENT_KEY: 'reportContent',
    REPORT_BOOK_DATA_KEY: 'reportBookData',
    REPORT_BOOK_RESOLVED_OBJECTS_KEY: 'resolvedObjects',
    SHEETS_KEY: 'sheets',
    FLOW_KEY: 'flow',
    DATA_SETS_KEY: 'dataSets',
    SHEETCONTENT_KEY: 'sheetContent',
    SHEET_CONTENT_TYPE_KEY: 'sheetContentType',
    QUESTION_KEY: 'question',
    EFFECTIVE_QUESTION_KEY: 'effectiveQuestion',
    QUESTION_RESOLVED_TOKEN_TEXT_KEY: 'resolvedText',
    SAGE_CONTEXT_PROTO_KEY: 'sageContextProto',
    SAGE_CONTEXT_INDEX_KEY: 'sageContextIndex',
    IS_CHASM_TRAP_QUERY_KEY: 'isChasmTrapQuery',
    VISUALIZATIONS_KEY: 'visualizations',
    REF_ANSWER_SHEET_KEY: 'refAnswerSheet',
    REF_ANSWER_SHEET_QUESTION_KEY: 'refAnswerSheetQuestion',
    REF_VIZ_ID_KEY: 'refVizId',
    REF_VIZ_IDS_KEY: 'refVizIds',
    WORKSHEET_KEY: 'worksheet',
    NATURAL_QUERY_KEY: 'naturalQuery',
    PINBOARD_A3_DETAILS_KEY: 'pinboardA3Details',
    A3_REQUEST_PROTO_KEY: 'a3RequestProto',
    A3_ANALYSIS_FACTS_PROTO_KEY: 'analysisFacts',

    VIZ_HEADER_KEY: 'header',
    VIZ_CONTENT_KEY: 'vizContent',
    VIZ_CONTAINER_KEY: 'vizContainer',
    VIZ_DATA_KEY: 'vizData',
    VIZ_LIST_KEY: 'vizList',
    VIZ_TYPE_KEY: 'vizType',
    VIZ_SUBTYPE_KEY: 'vizSubtype',
    VIZ_COMPLETE_KEY: 'complete',
    SCHEMA_VERSION: 'schemaVersion',

    TABLE_FILTER_RESOLVED_TEXT_KEY: 'resolvedTextProto',
    TABLE_FILTER_RESOLVED_TOKEN_KEY: 'resolvedTokenProto',

    HEADLINE_CHART_VIEWS_AREA: 'HEADLINE_CHART_VIEWS_AREA',
    TYPE_KEY: 'type',
    CLIENT_STATE_KEY: 'clientState',
    IS_STACKED_AS_PERCENT: 'yAxis.isStackedAsPercent',
    IS_HEATMAP_OVERLAYED: 'isHeatmapOverlayed',
    PIVOT_STATE: 'pivotState',
    CONFIG_INFO_KEY: 'configInfo',
    DISABLE_WORKSHEET_SAMPLE_VALUES: 'disableWorksheetSampleValues',
    ENABLE_SAGE_USER_FEEBBACK: 'enableSageUserFeedback',
    ENABLE_LOCALIZATION: 'enableLocalization',
    ENABLE_ROLE_SYSTEM_VARIABLE: 'enableRoleSystemVariable',
    ENABLE_WKS_VIEWER: 'enableSchemaViewer',
    DISABLE_ANSWER: 'disableAnswer',
    FULL_EMBED_CONFIG: 'fullEmbedConfiguration',
    ENABLE_NPS_METRICS: 'enableNPSMetrics',
    ENABLE_WORKSHEET_OVER_AGGR_WKS: 'enableWorksheetOverAggrWorksheet',
    ENABLE_AGGR_WKS_TABLE_JOIN: 'enableAggrWsTableJoin',
    PRIMARY_NAV_HIDDEN: 'primaryNavHidden',
    ALERT_BAR_HIDDEN: 'alertBarHidden',
    POWERED_FOOTER_HIDDEN: 'poweredFooterHidden',
    SCHEDULE_REPORTING_CONFIG: 'scheduledReportingConfig',
    SLACK_BOT_CONFIG: 'slackBotConfiguration',
    SCHEDULE_REPORTING_ENABLED: 'enabled',
    A3_CONFIG: 'a3Config',
    A3_ENABLED: 'a3LiveDataAnalysisEnabled',
    A3_PINBOARD_EXPIRY_IN_SECONDS: 'a3PinboardExpiryInSeconds',
    TABLE_PRINT_DATA_BATCH_SIZE: 'tablePrintDataBatchSize',
    INSTALLED_SCHEMA_VERSION: 'installedSchemaVersion',
    CUSTOMER_ADMIN_EMAIL: 'customerAdminEmail',
    CUSTOMER_ADMIN_PHONE_NUMBER: 'customerAdminPhoneNumber',
    DISABLE_ANSWER_DISPLAY_MODE_PREFERENCE: 'disableAnswerDisplayModePreference',
    ENABLE_STYLE_CUSTOMIZATION: 'customBrandingEnabled',
    ENABLE_FONT_STYLE_CUSTOMIZATION: 'customBrandingFontCustomizationEnabled',
    ENABLE_FOOLSCAP_PDF_DOWNLOAD: 'foolscapPdfDownloadEnabled',
    ENABLE_METADATA_MIGRATION: 'metadataMigrationEnabled',
    LIST_SEARCH_DEBOUNCING_IN_MS: 'listSearchDebouncingInMS',
    EXPOSED_USER_PREFERENCES_KEY: 'userPreferences',
    USER_PREFERENCES_PROTO_KEY: 'preferenceProto',
    PREFERRED_LOCALE_KEY: 'preferredLocale',
    USER_SLACK_ID: 'slackId',
    CALENDARS_KEY: 'calendars',
    DEFAULT_CALENDAR_KEY: 'default',
    CALENDAR_QUARTER_START_MONTH_KEY: 'quarterStartMonth',
    CLIENT_STATE_ANSWER_MODE_KEY: 'answerMode',
    CLIENT_STATE_VIZ_SELECTION_ANSWER_MODE_KEY: 'vizSelectionAnswerMode',
    INFORMATICA_CONFIG: 'informaticaCloudConfig',
    INFORMATICA_EXPRESSION_ASSISTANT: 'expressionAssistantUrl',
    USE_TIMELY_SCHEDULING: 'useTimelyForScheduling',
    ACCEPT_LANGUAGE_CONFIG_KEY: 'Accept-Language',
    CAN_CHANGE_PASSWORD: 'canChangePassword',
    ENABLE_MAP_TILES_CONFIG_KEY: 'enableMapTiles',
    GEO_MAP_CONFIG_KEY: 'geoMapConfig',
    DATA_BATCH_SIZE_KEY: 'dataBatchSize',
    samlConfig: {
        SAML_CONFIG: 'samlConfiguration',
        SAML_ENABLED: 'samlEnabled',
        SAML_LOGIN_PAGE_REDIRECT: 'samlLoginPageRedirect',
    },
    RESTRICT_SEARCH_HELP: 'restrictSearchHelp',

    TRIAL_VERSION_CONFIG_KEY: 'trialVersionConfig',
    TRIAL_ENABLED_KEY: 'enableTrialVersion',

    SAGE_OUTPUT_COLUMN_ID_KEY: 'sageOutputColumnId',

    VIZ_TYPE_PINBOARD: 'pinboard_viz',
    VIZ_TYPE_CHART: 'chart',
    VIZ_TYPE_HEADLINE: 'headline',
    VIZ_TYPE_TABLE: 'table',
    VIZ_TYPE_FILTER: 'filter',
    VIZ_TYPE_GENERIC: 'generic_viz',
    VIZ_TYPE_CLUSTER: 'CLUSTER_VIZ',
    VIZ_TITLE_KEY: 'title',
    VIZ_CUSTOM_TITLE: 'customTitle',
    VIZ_NAME_KEY: 'name',

    VALUE_KEY: 'value',
    VALUES_KEY: 'values',
    TEXT_KEY: 'text',

    LAYOUT_TILE_STATE_STANDARD: 'standard',
    LAYOUT_TILE_STATE_EXPANDED: 'expanded',

    // Logical Table
    LOGICAL_TABLE_METADATA_KEY: 'tableMetadata',
    LOGICAL_TABLE_CONTENT_KEY: 'logicalTableContent',
    LOGICAL_TABLE_DATA_KEY: 'tableData',
    LOGICAL_TABLE_JOIN_TYPE: 'joinType',
    WORKSHEET_TYPE: 'worksheetType',
    DEFAULT_DATA_SOURCE : 'Default',
    COMPLETE: 'complete',
    INCOMPLETE_DETAIL: 'incompleteDetail',

    GROWTH_KEY: 'growth',
    GROUP_BY_KEY: 'groupBy',

    queryJoinType: {
        INNER: 'INNER',
        LEFT_OUTER: 'LEFT_OUTER',
        RIGHT_OUTER: 'RIGHT_OUTER',
        FULL_OUTER: 'OUTER'
    },

    worksheetType: {
        CONTAINER: 'CONTAINER',  // maps to progressive join
        VIEW: 'VIEW'  // maps to all join
    },

    COMPOUND_INDICES_KEY: 'compoundRowIndices',
    CAN_GENERATE_QUERY: 'canGenerateQuery',

    // Logical Column
    IS_DERIVED_KEY: 'isDerived',
    DERIVATION_EXPRESSION: 'derivationExpr',
    DERIVATION_EXPR_TYPE: 'exprType',
    SOURCES_NODE_KEY: 'sources',

    metadataTypeSort: {
        AUTHOR: 'AUTHOR',
        CREATED: 'CREATED',
        DEFAULT: 'DEFAULT',
        MODIFIED: 'MODIFIED',
        NAME: 'NAME',
        DISPLAY_NAME: 'DISPLAY_NAME'
    },

    timelyJob: {
        NAME: 'name',
        CREATION_TIME: 'creation_time',
        LAST_MODIFICATION_TIME: 'last_modification_time'
    },

    principalSubType: {
        GROUP: 'LOCAL_GROUP',
        ROLE: 'LOCAL_ROLE',
        USER: 'LOCAL_USER'
    },

    metadataType: {
        LOGICAL_TABLE: 'LOGICAL_TABLE',
        LOGICAL_COLUMN: 'LOGICAL_COLUMN',
        LOGICAL_RELATIONSHIP: 'LOGICAL_RELATIONSHIP',
        IMPORTED_DATA: 'USER_DATA',
        QUESTION_ANSWER_BOOK: 'QUESTION_ANSWER_BOOK',
        DATA_SOURCE: 'DATA_SOURCE',
        PINBOARD_ANSWER_BOOK: 'PINBOARD_ANSWER_BOOK',
        REPORT_BOOK: 'REPORT_BOOK',
        TAG: 'TAG',
        VISUALIZATION: 'VISUALIZATION',
        TABLE_FILTER: 'TABLE_FILTER',
        USER: 'USER',
        GROUP: 'USER_GROUP',
        ROLE: 'USER_ROLE',
        RELATED_LINK: 'RELATED_LINK',
        subType: {
            WORKSHEET: 'WORKSHEET',
            PRIVATE_WORKSHEET: 'PRIVATE_WORKSHEET',
            IMPORTED_DATA: 'USER_DEFINED',
            SYSTEM_TABLE: 'ONE_TO_ONE_LOGICAL',
            DB_VIEW: 'DB_VIEW',
            AGGR_WORKSHEET: 'AGGR_WORKSHEET'
        }
    },

    privilegeType: {
        ADMINISTRATION: 'ADMINISTRATION',
        AUTHORING: 'AUTHORING',  // perhaps not used anymore?
        USERDATAUPLOADING: 'USERDATAUPLOADING',
        DATADOWNLOADING: 'DATADOWNLOADING',
        SHAREWITHALL: 'SHAREWITHALL',
        DATAMANAGEMENT: 'DATAMANAGEMENT',
        JOBSCHEDULING: 'JOBSCHEDULING',
        A3ANALYSIS: 'A3ANALYSIS'
    },

    dataSourceConfiguration: {
        PRE_SCRIPT_STATUS: 'PreScriptStatus',
        POST_SCRIPT_STATUS: 'PostScriptStatus'
    },

    relationshipMetadataType: {
        SYSTEM_RELATIONSHIP: 'PK_FK',
        GENERIC: 'GENERIC',
        USER_DEFINED: 'USER_DEFINED'
    },

    userSchemaErrorTypes: {
        validRows: 'VALID_ROWS',
        invalidRows: 'INVALID_ROWS',
        rowError: 'ROW_ERROR',
        invalidFile: 'INVALID_FILE',
        key: 'KEY',
        relationship: 'RELATIONSHIP',
        column: 'COLUMN'
    },

    category: {
        ALL: 'ALL',
        MY: 'MY'
    },

    tableTypes: {
        Imported: 'FalconUserDataSchema',
        Tables: 'falcon_default_schema'
    },

    permission: {
        NO_ACCESS: 'NO_ACCESS',
        READ_ONLY: 'READ_ONLY',
        MODIFY: 'MODIFY',
        VARIES: 'VARIES'
    },

    clientExpressionColumnType: {
        NONE: 'NONE',
        LOGICAL_COLUMN: 'LOGICAL_COLUMN',
        VIZ_COLUMN: 'VIZ_COLUMN'
    },

    metrics: {
        actionType: {
            NONE: 'NONE'
        }
    },

    vizType: {
        CHART: 'CHART',
        FILTER: 'FILTER',
        GENERIC_VIZ: 'GENERIC_VIZ',
        PINBOARD_VIZ: 'PINBOARD_VIZ',
        TABLE: 'TABLE',
        HEADLINE: 'HEADLINE'
    },

    genericVizSubtype: {
        SEARCH_SUMMARY_VIZ: 'SEARCH_SUMMARY_VIZ',
        SEARCH_DETAIL_TABLE_VIZ: 'SEARCH_DETAIL_TABLE_VIZ',
        DATABASE_SUMMARY_VIZ: 'DATABASE_SUMMARY_VIZ',
        DATABASE_DETAIL_VIZ: 'DATABASE_DETAIL_VIZ',
        CLUSTER_SUMMARY_VIZ: 'CLUSTER_SUMMARY_VIZ',
        CLUSTER_DETAIL_INFO_VIZ: 'CLUSTER_DETAIL_INFO_VIZ',
        CLUSTER_DETAIL_LOG_VIZ: 'CLUSTER_DETAIL_LOG_VIZ',
        CLUSTER_DETAIL_SNAPSHOT_VIZ: 'CLUSTER_DETAIL_SNAPSHOT_VIZ',
        ALERT_SUMMARY_VIZ: 'ALERT_SUMMARY_VIZ',
        EVENT_SUMMARY_VIZ: 'EVENT_SUMMARY_VIZ',
        ALERT_DETAIL_ALERTS_VIZ: 'ALERT_DETAIL_ALERTS_VIZ',
        ALERT_DETAIL_EVENTS_VIZ: 'ALERT_DETAIL_EVENTS_VIZ',
        ALERT_DETAIL_NOTIFICATIONS_VIZ: 'ALERT_DETAIL_NOTIFICATIONS_VIZ'
    },

    // Admin UI
    adminUI: {
        CLUSTER_NAME: 'cluster_name',
        RELEASE: 'release_name',
        NODE_INFO: 'node_info',
        LAST_SNAPSHOT_TIME: 'finish_timestamp_seconds',
        INFO_ALERT: 'INFO',
        WARNING_ALERT: 'WARNING',
        CRITICAL_ALERT: 'CRITICAL'
    },
    // Lightweight Data Cache
    lightWeightDataCache: {
        LOAD_STATUS_SUCCESS: 'success',
        LOAD_STATUS_FAILED: 'failed'
    },

    // type of column's currency type settings
    // Keep them in sync with server values at LogicalColumnContent.CurrencyTypeInfo.SettingEnum
    currencyTypes: {
        FROM_USER_LOCALE: 'FROM_USER_LOCALE',
        FROM_COLUMN: 'FROM_COLUMN',
        FROM_ISO_CODE: 'FROM_ISO_CODE'
    },

    geoConfigType: {
        LATITUDE: 'LATITUDE',
        LONGITUDE: 'LONGITUDE',
        ZIP_CODE: 'ZIP_CODE',
        ADMIN_DIV_0: 'ADMIN_DIV_0',
        ADMIN_DIV_1: 'ADMIN_DIV_1',
        ADMIN_DIV_2: 'ADMIN_DIV_2',
        CUSTOM_REGION: 'CUSTOM_REGION',
        // client side use only, used when we combine (lat, long) to make a 'point' type on client
        // side.
        POINT: 'POINT'
    },

    queryInfo: {
        DATA: 'data'
    },
    scheduledJob: {
        PINBOARD_ID: 'pinboard_id'
    },
    SCHEDULER_CONFIG: 'scheduledReportingConfig',
    EMAIL_DOMAINS_WHITELIST: 'whitelistedDomains',
    vizColumn: {
        DATA_RECENCY: 'baseDataRecency'
    },
    filter: {
        FILTER_CONTENT: 'filterContent',
        ROWS: 'rows',
        filterValue: {
            KEY: 'key',
            SELECTED: 'selected',
            KEYNULL: 'keyNull'
        },
        COLUMN: 'column',
        SINGLE_OPERATOR_KEY: 'oper',
        MULTIPLE_OPERATORS_KEY: 'multiOperatorValues',
        MULTIPLE_OPERATOR: {
            OPERATOR: 'operator',
            VALUES: 'filterValues'
        },
        ROW_INDEX: 'rowIndex',
        NEGATION: 'negation'
    },
    visualizationModel: {
        VIZ_JSON: 'vizJson'
    },
    relatedLink: {
        DESTINATION_VIZ_ID: 'dstVizId',
        RELATED_LINKS:'relatedLinks',
    },
    header: {
        ID: 'id',
        NAME:'name',
        DESCRIPTION:'description',
        OWNER:'owner',
        AUTHOR:'author',
        IS_HIDDEN:'isHidden',
        IS_DELETED:'isDeleted'
    },
    storable: {
        CONTENT: 'content'
    },
    a3: {
        SELECTION_INCLUDE: 'include',
        SELECTION_EXCLUDE: 'exclude'
    }
};

Provide('jsonConstants')(jsonConstants);
