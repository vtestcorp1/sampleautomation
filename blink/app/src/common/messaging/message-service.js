/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Service to deal with message code handling.
 *
 * It is responsible for -
 * - On init, it reads protobuf message codes to a local mapping from message codes to messages
 * - Maintains a map from User Actions to "outcome" to Blink Message Codes, where an outcome could
 * be one of SUCCESS, FAILURE or a Callosum Message Code.
 **/

'use strict';

blink.app.factory('messageService', ['$http',
    'protobufParsingService',
    'UserAction',
    function($http,
         protobufParsingService,
         UserAction) {

        var userActionsToMessageCodeMap = {};

        var MESSAGES_URL = 'resources/messaging/message_codes.bin',
            MESSAGE_CODES_ARRAY_KEY = 'messageCode',
            messageCodeMap = {};

        function init() {
            $http.get(MESSAGES_URL, {responseType: "arraybuffer"})
            .success(function(messagesBuffer) {
                protobufParsingService.parse(messagesBuffer, protobufParsingService.ProtoType.MESSAGING)
                    .then(function(messageCodeSet) {
                        messageCodeSet[MESSAGE_CODES_ARRAY_KEY].forEach(function(messageCode) {
                            messageCodeMap[messageCode.getCode()] = messageCode;
                        });
                    });
            });
        }

        function getSuccessMessage(userActionType) {
            var blinkMessageCode = userActionsToMessageCodeMap[userActionType].SUCCESS;
            return messageCodeMap[blinkMessageCode];
        }

        function getFailureMessage(userActionType, errorCode) {
            var blinkMessageCode;
            if (!!userActionsToMessageCodeMap[userActionType]
            && !!userActionsToMessageCodeMap[userActionType][errorCode]) {
                blinkMessageCode = userActionsToMessageCodeMap[userActionType][errorCode];
            } else if (callosumApiErrors[errorCode]) {
                blinkMessageCode = callosumApiErrors[errorCode];
            } else if (Object.values(blinkGeneratedErrors).indexOf(errorCode) >= 0) {
                blinkMessageCode = errorCode;
            } else {
                blinkMessageCode = userActionsToMessageCodeMap[userActionType].FAILURE;
            }
            return messageCodeMap[blinkMessageCode];
        }

    // Metadata Service
        userActionsToMessageCodeMap[UserAction.ADD_VIZ_TO_PINBOARD] = {
            SUCCESS: 100,
            FAILURE: 101,
            13004: 102
        };
        userActionsToMessageCodeMap[UserAction.DELETE_VIZ_FROM_PINBOARD] = {
            SUCCESS: 103,
            FAILURE: 104,
            13004: 105
        };
        userActionsToMessageCodeMap[UserAction.CREATE_PINBOARD] = {
            SUCCESS: 106,
            FAILURE: 107
        };
        userActionsToMessageCodeMap[UserAction.CREATE_LABEL] = {
            SUCCESS: 108,
            FAILURE: 109
        };
        userActionsToMessageCodeMap[UserAction.DELETE_LABELS] = {
            SUCCESS: 110,
            FAILURE: 111
        };
        userActionsToMessageCodeMap[UserAction.DELETE_PINBOARDS] = {
            SUCCESS: 112,
            FAILURE: 113
        };
        userActionsToMessageCodeMap[UserAction.DELETE_ANSWERS] = {
            SUCCESS: 114,
            FAILURE: 115
        };
        userActionsToMessageCodeMap[UserAction.DELETE_TABLES] = {
            SUCCESS: 116,
            FAILURE: 117
        };
        userActionsToMessageCodeMap[UserAction.CREATE_RELATIONSHIP] = {
            SUCCESS: 118,
            FAILURE: 119,
            13018: 13018
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_RELATIONSHIP] = {
            SUCCESS: 120,
            FAILURE: 121
        };
        userActionsToMessageCodeMap[UserAction.DELETE_RELATIONSHIP] = {
            SUCCESS: 122,
            FAILURE: 123
        };
        userActionsToMessageCodeMap[UserAction.FETCH_TABLE_DETAILS] = {
            FAILURE: 124
        };
        userActionsToMessageCodeMap[UserAction.FETCH_TABLES_DETAILS] = {
            FAILURE: 125
        };
        userActionsToMessageCodeMap[UserAction.FETCH_DATA_SOURCES_DETAILS] = {
            FAILURE: 126
        };
        userActionsToMessageCodeMap[UserAction.FETCH_DATA_SOURCE_DETAILS] = {
            FAILURE: 127
        };
        userActionsToMessageCodeMap[UserAction.FETCH_METADATA_DETAILS] = {
            FAILURE: 128
        };
        userActionsToMessageCodeMap[UserAction.FETCH_ANSWER_DETAILS] = {
            FAILURE: 129
        };
        userActionsToMessageCodeMap[UserAction.FETCH_PINBOARD_DETAILS] = {
            FAILURE: 130
        };
        userActionsToMessageCodeMap[UserAction.FETCH_WORKSHEET_DETAILS] = {
            FAILURE: 131
        };
        userActionsToMessageCodeMap[UserAction.SAVE_TABLE_MODEL] = {
            SUCCESS: 132,
            FAILURE: 133
        };
        userActionsToMessageCodeMap[UserAction.SAVE_VIZ_CONTEXT] = {
            SUCCESS: 134,
            FAILURE: 135
        };
        userActionsToMessageCodeMap[UserAction.SAVE_ANSWER_MODEL] = {
            SUCCESS: 136,
            FAILURE: 137
        };
        userActionsToMessageCodeMap[UserAction.SAVE_PINBOARD_MODEL] = {
            SUCCESS: 138,
            FAILURE: 139
        };
        userActionsToMessageCodeMap[UserAction.SAVE_WORKSHEET_MODEL] = {
            SUCCESS: 140,
            FAILURE: 141
        };
        userActionsToMessageCodeMap[UserAction.SAVE_AS_ANSWER_MODEL] = {
            SUCCESS: 142,
            FAILURE: 143
        };
        userActionsToMessageCodeMap[UserAction.SAVE_AS_PINBOARD_MODEL] = {
            SUCCESS: 144,
            FAILURE: 145
        };
        userActionsToMessageCodeMap[UserAction.SAVE_AS_WORKSHEET_MODEL] = {
            SUCCESS: 146,
            FAILURE: 147
        };
        userActionsToMessageCodeMap[UserAction.SAVE_TAG] = {
            SUCCESS: 148,
            FAILURE: 149
        };
        userActionsToMessageCodeMap[UserAction.ASSIGN_TAG] = {
            SUCCESS: 150,
            FAILURE: 151
        };
        userActionsToMessageCodeMap[UserAction.UNASSIGN_TAG] = {
            SUCCESS: 152,
            FAILURE: 153
        };
        userActionsToMessageCodeMap[UserAction.FETCH_METADATA_LIST] = {
            FAILURE: 154
        };
        userActionsToMessageCodeMap[UserAction.FETCH_TABLE_LIST] = {
            FAILURE: 155
        };
        userActionsToMessageCodeMap[UserAction.FETCH_RELATIONSHIP_LIST] = {
            FAILURE: 156
        };
        userActionsToMessageCodeMap[UserAction.FETCH_ANSWER_LIST] = {
            FAILURE: 157
        };
        userActionsToMessageCodeMap[UserAction.FETCH_PINBOARD_LIST] = {
            FAILURE: 158
        };
        userActionsToMessageCodeMap[UserAction.FETCH_WORKSHEET_LIST] = {
            FAILURE: 159
        };
        userActionsToMessageCodeMap[UserAction.FETCH_AGGR_WORKSHEET_LIST] = {
            FAILURE: 160
        };
        userActionsToMessageCodeMap[UserAction.FETCH_IMPORTED_DATA_LIST] = {
            FAILURE: 161
        };
        userActionsToMessageCodeMap[UserAction.FETCH_SYSTEM_TABLE_LIST] = {
            FAILURE: 162
        };
        userActionsToMessageCodeMap[UserAction.FETCH_DB_VIEW_LIST] = {
            FAILURE: 163
        };
        userActionsToMessageCodeMap[UserAction.FETCH_DATA_SOURCE_LIST] = {
            FAILURE: 164
        };
        userActionsToMessageCodeMap[UserAction.FETCH_COLUMN_LIST] = {
            FAILURE: 165
        };
        userActionsToMessageCodeMap[UserAction.FETCH_TAG_LIST] = {
            FAILURE: 166
        };
        userActionsToMessageCodeMap[UserAction.FETCH_ANSWER] = {
            FAILURE: 167
        };
        userActionsToMessageCodeMap[UserAction.FETCH_WORKSHEET] = {
            FAILURE: 168
        };
        userActionsToMessageCodeMap[UserAction.CREATE_AGGR_WORKSHEET] = {
            SUCCESS: 169,
            FAILURE: 170
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_AGGR_WORKSHEET] = {
            SUCCESS: 171,
            FAILURE: 172
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_FORMULA] = {
            FAILURE: 173
        };
        userActionsToMessageCodeMap[UserAction.FETCH_COMMENTS] = {
            FAILURE: 174
        };
        userActionsToMessageCodeMap[UserAction.CREATE_COMMENT] = {
            FAILURE: 175
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_COMMENT] = {
            FAILURE: 176
        };
        userActionsToMessageCodeMap[UserAction.DELETE_COMMENT] = {
            FAILURE: 177
        };
        userActionsToMessageCodeMap[UserAction.SAVE_RLS_RULE] = {
            SUCCESS: 178,
            FAILURE: 179
        };
        userActionsToMessageCodeMap[UserAction.DELETE_RLS_RULE] = {
            SUCCESS: 180,
            FAILURE: 181
        };
        userActionsToMessageCodeMap[UserAction.DELETE_METADATA_ITEMS] = {
            SUCCESS: 182,
            FAILURE: 183
        };
        userActionsToMessageCodeMap[UserAction.CREATE_RELATED_LINK] = {
            SUCCESS: 184,
            FAILURE: 185,
            10452: 185
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_RELATED_LINK] = {
            SUCCESS: 186,
            FAILURE: 187
        };
        userActionsToMessageCodeMap[UserAction.DELETE_RELATED_LINK] = {
            SUCCESS: 188,
            FAILURE: 189
        };
        userActionsToMessageCodeMap[UserAction.FETCH_RELATED_LINK_DETAILS] = {
            SUCCESS: 190,
            FAILURE: 191
        };

    //DataService
        userActionsToMessageCodeMap[UserAction.FETCH_LEAF_LEVEL_DATA] = {
            FAILURE: 500
        };
        userActionsToMessageCodeMap[UserAction.FETCH_EXCEL_DATA] = {
            FAILURE: 501
        };
        userActionsToMessageCodeMap[UserAction.FETCH_VIZ_DATA] = {
            FAILURE: 502
        };
        userActionsToMessageCodeMap[UserAction.FETCH_VIZS_DATA] = {
            FAILURE: 503
        };
        userActionsToMessageCodeMap[UserAction.FETCH_CHART_DATA] = {
            FAILURE: 504
        };
        userActionsToMessageCodeMap[UserAction.FETCH_TABLE_DATA] = {
            FAILURE: 505
        };
        userActionsToMessageCodeMap[UserAction.FETCH_WORKSHEET_DATA] = {
            FAILURE: 506
        };
        userActionsToMessageCodeMap[UserAction.FETCH_FILTER_DATA] = {
            FAILURE: 507,
            13022: 13022
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_HEADLINE_DATA] = {
            FAILURE: 508
        };
        userActionsToMessageCodeMap[UserAction.FETCH_NATURAL_QUERY] = {
            FAILURE: 509
        };
        userActionsToMessageCodeMap[UserAction.UPLOAD_FILE] = {
            SUCCESS: 510,
            FAILURE: 511
        };
        userActionsToMessageCodeMap[UserAction.FETCH_PINBOARD_AS_PDF] = {
            FAILURE: 512
        };

    //Dependency Service
        userActionsToMessageCodeMap[UserAction.FETCH_TABLE_DEPENDENTS] = {
            FAILURE: 700
        };
        userActionsToMessageCodeMap[UserAction.FETCH_COLUMN_DEPENDENTS] = {
            FAILURE: 701
        };
        userActionsToMessageCodeMap[UserAction.FETCH_INCOMPLETE_LIST] = {
            FAILURE: 702
        };

    // Admin Service
        userActionsToMessageCodeMap[UserAction.FETCH_MEM_CACHE_STATS] = {
            FAILURE: 800
        };
        userActionsToMessageCodeMap[UserAction.CLEAR_MEM_CACHE] = {
            FAILURE: 801,
            SUCCESS: 806
        };
        userActionsToMessageCodeMap[UserAction.SEARCH_MEM_CACHE] = {
            FAILURE: 802
        };
        userActionsToMessageCodeMap[UserAction.FETCH_LOGGERS] = {
            FAILURE: 803
        };
        userActionsToMessageCodeMap[UserAction.SET_LOG_LEVEL] = {
            FAILURE: 804,
            SUCCESS: 807,
        };
        userActionsToMessageCodeMap[UserAction.GET_DEBUG_INFO] = {
            FAILURE: 805
        };
        userActionsToMessageCodeMap[UserAction.REPORT_PROBLEM] = {
            FAILURE: 808,
            SUCCESS: 809
        };

    // Permission Service
        userActionsToMessageCodeMap[UserAction.FETCH_TABLE_PERMISSIONS] = {
            FAILURE: 900
        };
        userActionsToMessageCodeMap[UserAction.FETCH_ANSWER_PERMISSIONS] = {
            FAILURE: 901
        };
        userActionsToMessageCodeMap[UserAction.FETCH_PINBOARD_PERMISSIONS] = {
            FAILURE: 902
        };
        userActionsToMessageCodeMap[UserAction.FETCH_METADATA_PERMISSIONS] = {
            FAILURE: 903
        };

    // Import Data Service
        userActionsToMessageCodeMap[UserAction.CACHE_DATA] = {
            FAILURE: 1000
        };
        userActionsToMessageCodeMap[UserAction.READ_COLUMNS] = {
            FAILURE: 1001
        };
        userActionsToMessageCodeMap[UserAction.READ_KEYS] = {
            FAILURE: 1002
        };
        userActionsToMessageCodeMap[UserAction.READ_RELATIONSHIPS] = {
            FAILURE: 1003
        };
        userActionsToMessageCodeMap[UserAction.LOAD_DATA] = {
            FAILURE: 1004
        };
        userActionsToMessageCodeMap[UserAction.CREATE_TABLE] = {
            FAILURE: 1005
        };
        userActionsToMessageCodeMap[UserAction.FETCH_DATA_ROWS] = {
            FAILURE: 1006
        };
        userActionsToMessageCodeMap[UserAction.DELETE_FILES] = {
            FAILURE: 1007
        };
        userActionsToMessageCodeMap[UserAction.ABORT_CREATE_TABLE] = {
            FAILURE: 1008
        };
        userActionsToMessageCodeMap[UserAction.FETCH_SCHEMA] = {
            FAILURE: 1009
        };
        userActionsToMessageCodeMap[UserAction.FETCH_TABLE_MODELS] = {
            FAILURE: 1010
        };
        userActionsToMessageCodeMap[UserAction.FETCH_SAMPLE_VALUES] = {
            FAILURE: 1011
        };

    // Scheduled Jobs
        userActionsToMessageCodeMap[UserAction.FETCH_JOB_LIST] = {
            FAILURE: 1100
        };
        userActionsToMessageCodeMap[UserAction.CREATE_JOB] = {
            SUCCESS: 1110,
            FAILURE: 1111
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_JOB] = {
            SUCCESS: 1112,
            FAILURE: 1113
        };
        userActionsToMessageCodeMap[UserAction.DELETE_JOB] = {
            SUCCESS: 1114,
            FAILURE: 1115
        };
        userActionsToMessageCodeMap[UserAction.PAUSE_JOB] = {
            SUCCESS: 1116,
            FAILURE: 1117
        };
        userActionsToMessageCodeMap[UserAction.RESUME_JOB] = {
            SUCCESS: 1118,
            FAILURE: 1119
        };

    // User Admin Service
        userActionsToMessageCodeMap[UserAction.FETCH_USERS_LIST] = {
            FAILURE: 1200
        };
        userActionsToMessageCodeMap[UserAction.FETCH_GROUPS_LIST] = {
            FAILURE: 1201
        };
        userActionsToMessageCodeMap[UserAction.FETCH_USERS_AND_GROUPS_LIST] = {
            FAILURE: 1202
        };
        userActionsToMessageCodeMap[UserAction.CREATE_USER] = {
            SUCCESS: 1203,
            FAILURE: 1204
        };
        userActionsToMessageCodeMap[UserAction.CREATE_GROUP] = {
            SUCCESS: 1205,
            FAILURE: 1206
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_USER] = {
            SUCCESS: 1207,
            FAILURE: 1208
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_USERS] = {
            SUCCESS: 1209,
            FAILURE: 1210
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_GROUP] = {
            SUCCESS: 1211,
            FAILURE: 1212
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_PASSWORD] = {
            SUCCESS: 1213,
            FAILURE: 1214
        };
        userActionsToMessageCodeMap[UserAction.DELETE_USERS] = {
            SUCCESS: 1215,
            FAILURE: 1216
        };
        userActionsToMessageCodeMap[UserAction.DELETE_GROUPS] = {
            SUCCESS: 1217,
            FAILURE: 1218
        };
        userActionsToMessageCodeMap[UserAction.ASSIGN_USERS_TO_GROUPS] = {
            SUCCESS: 1219,
            FAILURE: 1220
        };
        userActionsToMessageCodeMap[UserAction.FETCH_PROFILE_PIC] = {
            FAILURE: 1221
        };
        userActionsToMessageCodeMap[UserAction.UPLOAD_PROFILE_PIC] = {
            SUCCESS: 1222,
            FAILURE: 1223
        };
        userActionsToMessageCodeMap[UserAction.ASSIGN_GROUPS_TO_GROUP] = {
            SUCCESS: 1224,
            FAILURE: 1225,
            10455: 10009
        };
        userActionsToMessageCodeMap[UserAction.FETCH_ROLES_LIST] = {
            SUCCESS: 1226,
            FAILURE: 1227
        };

        userActionsToMessageCodeMap[UserAction.CREATE_ROLE] = {
            SUCCESS: 1228,
            FAILURE: 1229
        };
        userActionsToMessageCodeMap[UserAction.DELETE_ROLE] = {
            SUCCESS: 1230,
            FAILURE: 1231
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_ROLE] = {
            SUCCESS: 1232,
            FAILURE: 1233
        };
        userActionsToMessageCodeMap[UserAction.UPDATE_EXPOSED_PREFERENCES] = {
            SUCCESS: 1234,
            FAILURE: 1235
        };

        userActionsToMessageCodeMap[UserAction.SHARE_OBJECT] = {
            SUCCESS: 1236,
            FAILURE: 1237
        };

        userActionsToMessageCodeMap[UserAction.UPDATE_CUSTOM_STYLE_CONFIG] = {
            SUCCESS: 1238,
            FAILURE: 1239
        };

        // Session Service
        userActionsToMessageCodeMap[UserAction.GET_SESSION_INFO] = {
            FAILURE: 1400
        };
        userActionsToMessageCodeMap[UserAction.LOGIN] = {
            FAILURE: 1401
        };
        userActionsToMessageCodeMap[UserAction.LOGOUT] = {
            FAILURE: 1402
        };
        userActionsToMessageCodeMap[UserAction.SAVE_CLIENT_STATE] = {
            FAILURE: 1403
        };
        userActionsToMessageCodeMap[UserAction.FETCH_LOGIN_CONFIG] = {
            FAILURE: 1404
        };
        userActionsToMessageCodeMap[UserAction.FETCH_SLACK_CONFIG] = {
            FAILURE: 1405
        };
        userActionsToMessageCodeMap[UserAction.HEALTH_CHECK] = {
            FAILURE: 1406
        };
        userActionsToMessageCodeMap[UserAction.HELP_PORTAL_TOKEN] = {
            FAILURE: 1407
        };
        userActionsToMessageCodeMap[UserAction.HELP_PORTAL_RELEASE_NAME] = {
            FAILURE: 1408
        };

    // Data Management Service
        userActionsToMessageCodeMap[UserAction.FETCH_DATA_SOURCE_TYPES] = {
            FAILURE: 1600,
            12009: 1622
        };
        userActionsToMessageCodeMap[UserAction.FETCH_DATA_SOURCE_SAMPLE_VALUES] = {
            FAILURE: 1601
        };
        userActionsToMessageCodeMap[UserAction.DELETE_DATA_SOURCE] = {
            SUCCESS: 1818,
            FAILURE: 1602
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_EXECUTE_DDL] = {
            FAILURE: 1603,
            SUCCESS: 1631
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_UPDATE_SCHEDULE] = {
            SUCCESS: 1620,
            FAILURE: 1604
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_RELOAD_TASKS] = {
            FAILURE: 1605,
            SUCCESS: 1625
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_STOP_TASKS] = {
            FAILURE: 1606,
            SUCCESS: 1628
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_GET_CREATE_DDL] = {
            FAILURE: 1607,
            12011: 1624
        };
        userActionsToMessageCodeMap[UserAction.LOAD_FROM_DATA_SOURCE] = {
            FAILURE: 1608,
            SUCCESS: 1623
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_CREATE_CONNECTION] = {
            SUCCESS: 1619,
            FAILURE: 1609
        };
        userActionsToMessageCodeMap[UserAction.CREATE_DATA_SOURCE] = {
            FAILURE: 1610,
            SUCCESS: 1627
        };
        userActionsToMessageCodeMap[UserAction.CONNECT_TO_DATA_SOURCE] = {
            FAILURE: 1611,
            SUCCESS: 1626
        };
        userActionsToMessageCodeMap[UserAction.GET_DATA_SOURCE_CONN_FIELD_LIST] = {
            FAILURE: 1612
        };
        userActionsToMessageCodeMap[UserAction.GET_DATA_SOURCE_CONNECTION_LIST] = {
            FAILURE: 1613
        };
        userActionsToMessageCodeMap[UserAction.GET_DATA_SOURCE_CONNECTION_ATTRIBUTES] = {
            FAILURE: 1614
        };
        userActionsToMessageCodeMap[UserAction.GET_DATA_SOURCE_CONNECTIONS] = {
            FAILURE: 1615
        };
        userActionsToMessageCodeMap[UserAction.GET_DATA_SOURCE_CONFIG] = {
            FAILURE: 1616
        };
        userActionsToMessageCodeMap[UserAction.PARSE_SQL] = {
            FAILURE: 1617
        };
        userActionsToMessageCodeMap[UserAction.EXECUTE_SQL] = {
            FAILURE: 1618,
            QUERY_FAILURE: 1621
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_DELETE_CONNECTION] = {
            SUCCESS: 1629,
            FAILURE: 1630
        };
        userActionsToMessageCodeMap[UserAction.EXPRESSION_VALIDATION] = {
            FAILURE: 13025
        };
        userActionsToMessageCodeMap[UserAction.DATASOURCE_CONN_OBJS_MISMATCH] = {
            FAILURE: 13028
        };

    // Cluster status service
        userActionsToMessageCodeMap[UserAction.SEARCH_SUMMARY] = {
            FAILURE: 1800
        };
        userActionsToMessageCodeMap[UserAction.SEARCH_DETAIL_TABLE] = {
            FAILURE: 1801
        };
        userActionsToMessageCodeMap[UserAction.DATABASE_SUMMARY] = {
            FAILURE: 1802
        };
        userActionsToMessageCodeMap[UserAction.DATABASE_DETAIL] = {
            FAILURE: 1803
        };
        userActionsToMessageCodeMap[UserAction.CLUSTER_SUMMARY] = {
            FAILURE: 1804
        };
        userActionsToMessageCodeMap[UserAction.CLUSTER_DETAIL_INFO] = {
            FAILURE: 1805
        };
        userActionsToMessageCodeMap[UserAction.CLUSTER_DETAIL_LOG] = {
            FAILURE: 1806
        };
        userActionsToMessageCodeMap[UserAction.CLUSTER_DETAIL_SNAPSHOT] = {
            FAILURE: 1807
        };
        userActionsToMessageCodeMap[UserAction.ALERT_SUMMARY] = {
            FAILURE: 1808
        };
        userActionsToMessageCodeMap[UserAction.EVENT_SUMMARY] = {
            FAILURE: 1809
        };
        userActionsToMessageCodeMap[UserAction.ALERTS_DETAILS_ALERTS] = {
            FAILURE: 1810
        };
        userActionsToMessageCodeMap[UserAction.ALERTS_DETAILS_EVENTS] = {
            FAILURE: 1811
        };
        userActionsToMessageCodeMap[UserAction.SUBMIT_SAGE_FEEDBACK] = {
            SUCCESS: 1812,
            FAILURE: 1813
        };
        userActionsToMessageCodeMap[UserAction.EXPORT_OBJECTS] = {
            SUCCESS: 1814,
            FAILURE: 1815
        };
        userActionsToMessageCodeMap[UserAction.IMPORT_OBJECTS] = {
            SUCCESS: 1816,
            FAILURE: 1817
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_DELETE_SCHEDULE] = {
            SUCCESS: 13026,
            FAILURE: 13027
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_EDIT_CONNECTION] = {
            SUCCESS: 13029,
            FAILURE: 13030
        };
        userActionsToMessageCodeMap[UserAction.LOAD_SAVED_ANSWER] = {
            FAILURE: 13003
        };
        userActionsToMessageCodeMap[UserAction.DATA_SOURCE_SCHEDULE_VALIDATION] = {
            FAILURE: 13031
        };

        var callosumApiErrors = {
            10453: 9000, /*Missing_Foreign_Key*/
            10001: 9001, /*Connection_Fail*/
            10003: 9002, /*Auth_Fail*/
            10006: 9003, /*ZK_Connection_Fail*/
            30000: 9004, /*Table_Not_Ready*/
            10602: 9005, /*API_Execution_Error*/
            10603: 9006, /*Cancelled*/
            10605: 9007, /*Aborted*/
            11006: 9008, /*Query_Execution_Error*/
            10614: 9009, /*Timeout*/
            10005: 9010  /*Base_Object_Missing*/
        };

        var blinkGeneratedErrors = {
            CALLOSUM_UNKNOWN_ERROR: 9500,
            CALLOSUM_API_TIMEOUT: 9501,
            SAGE_UNKNOWN_ERROR: 9502,
            SAGE_API_TIMEOUT: 9503,
            INCOMPLETE_DOCUMENT: 9504,
            SAGE_INDEXING: 9505,
            OBJECT_MISSING: 9506,
            SAGE_UNAVAILABLE: 9507
        };

        return {
            init: init,
            blinkGeneratedErrors: blinkGeneratedErrors,
            getSuccessMessage: getSuccessMessage,
            getFailureMessage: getFailureMessage
        };
    }]);
