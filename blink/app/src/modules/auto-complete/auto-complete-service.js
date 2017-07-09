/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service to interact with AutoComplete server (Sage Server)
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('sageSnapshotRequest', 'This flag enables writing of snapshot file for a request', false);

blink.app.factory('autoCompleteService', ['$route',
    '$q',
    'alertService',
    'debugInfoCollector',
    'env',
    'Logger',
    'messageService',
    'navService',
    'perfMeter',
    'SageResponse',
    'serviceNames',
    'sessionService',
    'UserAction',
    'util',
    function($route,
         $q,
         alertService,
         debugInfoCollector,
         env,
         Logger,
         messageService,
         navService,
         perfMeter,
         SageResponse,
         serviceNames,
         sessionService,
         UserAction,
         util) {

        var _logger = Logger.create('auto-complete-service'),
            _transport = new Thrift.Transport(env.sageBasePathV2),
            _protocol  = new Thrift.Protocol(_transport),
            _timeout = env.sageTimeout,
            _autoCompleteClient = new thrift.Sage.AutoComplete.AutoCompleteV2Client(_protocol);

        // A monotically increasing id sent with every request to sage.
        var REQUEST_ID = 0;

    /**
     * @param str
     * @returns {number} length of @str if available, 0 otherwise.
     */
        function lengthOrZero(str) {
            return str && str.length ? str.length : 0;
        }
     /**
      * @param str
      * @returns {LocaleType.E} LocaleType defined by sage.
      * Currently we are using 'Afrikaans' as our test locale. Therefore it is converted
      * into CUSTOM language.
      */
        function TranslateToSageLocales(localeType) {
            var sageLocales = {
                'en-US': 'en_US.utf8',
                'ja': 'ja_JP.utf8',
                'de-DE': 'de_DE.utf8',
                'af': 'af_ZA.utf8'
            };
            if(!!sageLocales[localeType]) {
                return sageLocales[localeType];
            }
            return 'en_US.utf8';
        }

    /**
     * Gets a new ACRequestInfo object.
     * @returns {sage.ACRequestInfo}
     */
        function getRequestInfoObject() {
            var requestInfo = new sage.ACRequestInfo();

            requestInfo.setRequestCallId(REQUEST_ID++);
            var totalSageCallTimeBudget = env.sageTimeout;
            var sageNetworkBudget = env.sageNetworkBudget;
            var sageProcessingBudget = totalSageCallTimeBudget - sageNetworkBudget;
            if (isNaN(sageProcessingBudget) || sageProcessingBudget <= 0) {
            // something wrong with the params, let the time budget be the default
                _logger.warn(
                'sageProcessingBudget is not a positive number',
                sageProcessingBudget,
                env.sageTimeout,
                env.sageNetworkBudget
            );
            } else {
                requestInfo.setTimeBudget(sageProcessingBudget);
            }
            requestInfo.setLocale(TranslateToSageLocales(blink.getAppLocale()));
        // set user guid and group mask obtained from /session/info
            var authToken = new sage.AuthToken();
            authToken.setUser(sessionService.getUserGuid(), sessionService.getUserName());
            authToken.setGroupMask(sessionService.getUserGroupMask());
            requestInfo.setAuthToken(authToken);
        // NOTE: Currently if the app is not building worksheet using sage, it is building answer.
            if (!navService.isCurrentWorksheetPath()){
                requestInfo.setIsAnswerPage();
            } else {
                var worksheetId = $route.current.params.worksheetId || null;
                requestInfo.setWorksheetId(worksheetId);
            }
            var clientTimestamp = (new Date()).getTime();
            requestInfo.setClientTimestamp(clientTimestamp);
        /* global flags */
            if (!!flags.getValue('sageSnapshotRequest')) {
                requestInfo.enableWriteRequestSnapshot();
            }
            if (!!flags.getValue('enableSearchHistory')) {
                requestInfo.enableSearchHistory();
            }
            return requestInfo;
        }

        function beforeAutoCompleteCall () {
            perfMeter.startSageRequest();
        }

        function afterAutoCompleteCall () {
            perfMeter.endSageRequest();
        }

    /**
     * Creates a default callback handler for sage calls.
     * @param deferred
     * @param responseClass
     * @param debugInfo
     * @param debugCallback
     * @returns {{success: Function, error: Function, timeout: (_defaultEnv.sageTimeout|*|me.sageTimeout|t.sageTimeout)}}
     */
        function getDefaultCallback(deferred, responseClass, debugInfo, debugCallback) {
            return {
                success: function(thriftResponse) {
                    afterAutoCompleteCall();
                    var status = sage.deserialize(thriftResponse.status, sage.common.StatusProto);
                    if (status.getCode() && (status.getCode() != sage.common.ErrorCode.OK)) {
                        _logger.error('sage response failure. status', status);
                        deferred.reject(status);
                    } else {
                        var decodedResponse = sage.deserialize(thriftResponse.response, responseClass);
                        if (decodedResponse && _.isFunction(decodedResponse.getInfo)) {
                            debugInfo.incidentId = decodedResponse.getInfo()
                            && _.isFunction(decodedResponse.getInfo().getIncidentId)
                            && decodedResponse.getInfo().getIncidentId();
                        }
                        // This particular logging involves a deserialization, which should only
                        // be done if logging will happen as this deserialization can be expensive
                        // for large payloads.
                        // This re-deserialization is done because, currently client makes changes
                        // to sage responses, which are reflected in the logged object as well,
                        // while we want to log objects as they came from the server.
                        if (_logger.canLog(Logger.logLevel.DEBUG)) {
                            _logger.debug('###RESPONSE', debugInfo.requestId, debugInfo.url, 'SUCCESS',
                                'response', sage.deserialize(thriftResponse.response, responseClass),
                                'status', status);
                        }
                        deferred.resolve(new SageResponse(decodedResponse, debugCallback));
                    }
                /* eslint camelcase: 1 */
                    debugInfo.responseSize = lengthOrZero(thriftResponse.status) +
                    lengthOrZero(thriftResponse.response)+ lengthOrZero(thriftResponse.rpc_info);
                /* eslint camelcase: 2 */
                    var rpcInfo = sage.deserialize(thriftResponse.rpc_info,
                                               tsProto.net.rpc.RpcResponseInfo);
                    if (rpcInfo && rpcInfo.getTrace() && rpcInfo.getTrace().getTraceId()) {
                        debugInfo.traceId = rpcInfo.getTrace().getTraceId();
                    }
                    debugInfo.status = status.getCode();
                    debugInfoCollector.collect(serviceNames.SAGE, debugInfo);
                },
                error: function(jqueryXhr, textStatus, errorThrown) {
                    var errorCode;
                    if (errorThrown === 'timeout') {
                        errorCode = messageService.blinkGeneratedErrors.SAGE_API_TIMEOUT;
                    } else if (jqueryXhr.status === 404) {
                        errorCode = messageService.blinkGeneratedErrors.SAGE_UNAVAILABLE;
                    } else {
                        errorCode = messageService.blinkGeneratedErrors.SAGE_UNKNOWN_ERROR;
                    }
                    alertService.showFailureAlert(errorCode);
                    debugInfo.status = errorCode;
                    debugInfoCollector.collect(serviceNames.SAGE, debugInfo);
                    afterAutoCompleteCall();
                    _logger.debug('###RESPONSE', debugInfo.requestId, debugInfo.url, 'FAILURE',
                        jqueryXhr, textStatus, errorThrown);
                    deferred.reject(errorThrown);
                },
                timeout: _timeout
            };
        }

    /**
     * Returns debug info for thriftRequest.
     * @param thriftRequest
     * @param url
     */
        function createDebugInfo(thriftRequest, url, requestId) {
        /* eslint camelcase: 1 */
            var size = lengthOrZero(thriftRequest.request) + lengthOrZero(thriftRequest.rpc_info);
            return {
                method: 'POST',
                requestSize: size,
                timestamp: new Date().getTime(),
                url: url,
                requestId: requestId
            };
        }

    /**
     * Returns a new instance of thrift request that should be used to make
     * Sage queries.
     */
        function newThriftRequest() {
            var request = new thrift.common.ThriftRequest();
            var rpcInfo = new tsProto.net.rpc.RpcRequestInfo();
        // Instruct the server to not send entire trace payload back to client.
            rpcInfo.setNoFullTrace(true);
        /* eslint camelcase: 1 */
            request.rpc_info = sage.serialize(rpcInfo);
            return request;
        }

    /**
     * Validates the queryContext for errors returning errors found.
     *
     * @param {sage.ACContext} queryContext
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.ACContextError
     */
        function validateContext (queryContext) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var validateContextRequest = sage.ValidateContextRequest
            .create(requestInfo, queryContext);
            thriftRequest.request = sage.serialize(validateContextRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'validateContext', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, validateContextRequest);

            _autoCompleteClient.ValidateContext(
            thriftRequest,
            getDefaultCallback(defer, sage.ValidateContextResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Cleans up ACContext by removing any tokens/joins/tables that are invalid.
     *
     * @param {sage.ACContext} queryContext
     *
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.ACContext
     */
        function cleanupContext (queryContext) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var cleanupContextRequest = sage.CleanupContextRequest
            .create(requestInfo, queryContext);
            thriftRequest.request = sage.serialize(cleanupContextRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'cleanupContext', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, cleanupContextRequest);

            _autoCompleteClient.CleanupContext(
            thriftRequest,
            getDefaultCallback(defer, sage.CleanupContextResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Adds a table to the given context.
     *
     * @param {sage.ACContext} queryContext
     * @param {sage.ACTableRequest} tableRequest
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.AnswerResponse
     */
        function addTable(queryContext, tableRequest) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var addTableRequest = sage.AddTableRequest
            .create(requestInfo, queryContext, tableRequest);
            thriftRequest.request = sage.serialize(addTableRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'addTable', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, addTableRequest);

            _autoCompleteClient.AddTable(
            thriftRequest,
            getDefaultCallback(defer, sage.AnswerResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Updates the TableRequest at the given index in the given context.
     *
     * @param {sage.ACContext} queryContext
     * @param {int} index
     * @param {sage.ACTableRequest} tableRequest
     * @param {boolean} createDebugCallback [optional]
     * @param {object} userFeedback [optional]
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.AnswerResponse
     */
        function editTable(queryContext, index, tableRequest, createDebugCallback, userFeedback) {
            var defer = $q.defer();
            beforeAutoCompleteCall();
            var requestInfo = getRequestInfoObject();
            requestInfo.enableOutOfScopeMatches();
            if (!!userFeedback) {
            // this is a replay request
                requestInfo.setUserFeedback(userFeedback);
            }

            var thriftRequest = newThriftRequest();
            var editTableRequest = sage.EditTableRequest
            .create(requestInfo, queryContext, index, tableRequest);
            thriftRequest.request = sage.serialize(editTableRequest);

            var debugCallback = void(0);
            if (createDebugCallback) {
                debugCallback = editTable.bind(
                void(0),
                queryContext,
                index,
                tableRequest,
                false);
            }

            var debugInfo = createDebugInfo(thriftRequest, 'editTable', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, editTableRequest);

            _autoCompleteClient.EditTable(
            thriftRequest,
            getDefaultCallback(defer, sage.AnswerResponse, debugInfo, debugCallback)
        );

            return defer.promise;
        }

    /**
     * Applies given transforms to the table at given index.
     *
     * @param {sage.ACContext} queryContext
     * @param {int} index
     * @param {Array<sage.QueryTransform>} transformations
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.AnswerResponse
     */
        function transformTable(queryContext, index, transformations) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var transformTableRequest = sage.TransformTableRequest
            .create(requestInfo, queryContext, index, transformations);
            thriftRequest.request = sage.serialize(transformTableRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'transformTable', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, transformTableRequest);

            _autoCompleteClient.TransformTable(
            thriftRequest,
            getDefaultCallback(defer, sage.AnswerResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Applies given transforms to the table at given index.
     *
     * @param {Object[]}                    requests
     * @param {sage.ACContext}              requests[].queryContext
     * @param {int}                         requests[].index
     * @param {Array<sage.QueryTransform>}  requests[].transformations
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.BatchResponse
     */
        function batchTransform(requests) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();

            var transformRequests = requests.map(function(request) {
                var queryContext = request.queryContext;
                var index = request.index;
                var transformations = request.transformations;

                var transformRequest = sage.TransformTableRequest
                .create(requestInfo, queryContext, index, transformations);

                return sage.Request.createTransformRequest(transformRequest);
            });

            var batchRequest = sage.BatchRequest.create(transformRequests);

            thriftRequest.request = sage.serialize(batchRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'batch', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, batchRequest);

            _autoCompleteClient.Batch(
            thriftRequest,
            getDefaultCallback(defer, sage.BatchResponse, debugInfo)
        );

            return defer.promise;
        }

        function createGetAccessibleTableRequest(requestInfo, context, index) {
            var getAccessibleTablesRequest = sage.GetAccessibleTablesRequest
            .create(requestInfo, context, index);
            return getAccessibleTablesRequest;
        }

    /**
     * Gets list of accessible tables.
     *
     * @param {sage.ACContext} queryContext
     * @param {int} index
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.AnswerResponse
     */
        function getAccessibleTables(queryContext, index) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            var getAccessibleTablesRequest = createGetAccessibleTableRequest(requestInfo, queryContext,
            index);
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();

            thriftRequest.request = sage.serialize(getAccessibleTablesRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'getAccessibleTables', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, getAccessibleTablesRequest);

            _autoCompleteClient.GetAccessibleTables(
            thriftRequest,
            getDefaultCallback(defer, sage.GetAccessibleTablesResponse, debugInfo)
        );

            return defer.promise;
        }

        function batchGetAccessibleTables(requests) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();

            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();

            var getAccessibleTablesRequests = requests.map(function(request) {
                var queryContext = request.queryContext;
                var index = request.index;

                var sageRequest = createGetAccessibleTableRequest(requestInfo, queryContext, index);
                return sage.Request.createGetAccessibleTablesRequest(sageRequest);
            });

            var batchRequest = sage.BatchRequest.create(getAccessibleTablesRequests);

            thriftRequest.request = sage.serialize(batchRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'batch', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, batchRequest);

            _autoCompleteClient.Batch(
            thriftRequest,
            getDefaultCallback(defer, sage.BatchResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Deletes the table at index from the given context.
     *
     * @param {sage.ACContext} queryContext
     * @param {int} index
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.AnswerResponse
     */
        function deleteTable (queryContext, index) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var deleteTableRequest = sage.DeleteTableRequest
            .create(requestInfo, queryContext, index);
            thriftRequest.request = sage.serialize(deleteTableRequest);

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, deleteTableRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'deleteTable', requestInfo.getRequestCallId());
            _autoCompleteClient.DeleteTable(
            thriftRequest,
            getDefaultCallback(defer, sage.AnswerResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Adds a join to the given context.
     *
     * @param {sage.ACContext} queryContext
     * @param {sage.ACJoinRequest} joinRequest
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.JoinResponse
     */
        function addJoin (queryContext, joinRequest) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var addJoinRequest = sage.AddJoinRequest
            .create(requestInfo, queryContext, joinRequest);
            thriftRequest.request = sage.serialize(addJoinRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'addJoin', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, addJoinRequest);

            _autoCompleteClient.AddJoin(
            thriftRequest,
            getDefaultCallback(defer, sage.JoinResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Updates the JoinRequest at the given index in the given context.
     *
     * @param {sage.ACContext} queryContext
     * @param {int} index
     * @param {sage.ACJoinRequest} joinRequest
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.JoinResponse
     */
        function editJoin (queryContext, index, joinRequest) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var editJoinRequest = sage.EditJoinRequest
            .create(requestInfo, queryContext, index, joinRequest);
            thriftRequest.request = sage.serialize(editJoinRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'editJoin', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, editJoinRequest);

            _autoCompleteClient.EditJoin(
            thriftRequest,
            getDefaultCallback(defer, sage.JoinResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Deletes the join at index from the given context.
     *
     * @param {sage.ACContext} queryContext
     * @param {int} index
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.JoinResponse
     */
        function deleteJoin (queryContext, index) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var deleteJoinRequest = sage.DeleteJoinRequest
            .create(requestInfo, queryContext, index);
            thriftRequest.request = sage.serialize(deleteJoinRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'deleteJoin', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, deleteJoinRequest);

            _autoCompleteClient.DeleteJoin(
            thriftRequest,
            getDefaultCallback(defer, sage.JoinResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Deletes the join at index from the given context.
     *
     * @param {sage.ACContext} context
     * @param {sage.ACTableRequest} worksheetRequest
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.WorksheetResponse
     */
        function updateWorksheet (context, worksheetRequest) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var updateWorksheetRequest = sage.UpdateWorksheetRequest
            .create(requestInfo, context, worksheetRequest);
            thriftRequest.request = sage.serialize(updateWorksheetRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'updateWorksheet', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, updateWorksheetRequest);

            _autoCompleteClient.UpdateWorksheet(
            thriftRequest,
            getDefaultCallback(defer, sage.WorksheetResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Transforms the worksheet
     * @param {sage.ACContext} context
     * @param {Array<sage.QueryTransform>} transformations
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.WorksheetResponse
     */
        function transformWorksheet (context, transformations) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var transformWorksheetRequest = sage.TransformWorksheetRequest
            .create(requestInfo, context, transformations);
            thriftRequest.request = sage.serialize(transformWorksheetRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'transformWorksheet', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, transformWorksheetRequest);

            _autoCompleteClient.TransformWorksheet(
            thriftRequest,
            getDefaultCallback(defer, sage.WorksheetResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Removes all `unknown` tokens from the sage query of the worksheet. This handles cases
     * where the underlying column is broken/hidden or otherwise unavailable.
     * @param {sage.ACContext} context
     * @returns {*}
     */
        function removeAllBrokenColumnsFromWorksheet(context) {
            var defer = $q.defer();

            var requestInfo = getRequestInfoObject();
            requestInfo.setDeleteInvalidPhrases(true);
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var transformWorksheetRequest = sage.TransformWorksheetRequest
            .create(requestInfo, context, []);
            thriftRequest.request = sage.serialize(transformWorksheetRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'transformWorksheet', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, transformWorksheetRequest);

            _autoCompleteClient.TransformWorksheet(
            thriftRequest,
            getDefaultCallback(defer, sage.WorksheetResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Updates the formula.
     * @param expressionRequest {sage.ACTableRequest}
     * @param formulaContext {sage.ACContext}
     * @param formulaId {string} - GUID of the formula being edited, will be empty if GUID is not yet assigned.
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.FormulaResponse
     */
        function updateExpression (expressionRequest, formulaContext, formulaId) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var updateFormulaRequest = sage.UpdateFormulaRequest
            .create(requestInfo, formulaContext, expressionRequest, formulaId);
            thriftRequest.request = sage.serialize(updateFormulaRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'updateFormula', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, updateFormulaRequest);

            _autoCompleteClient.UpdateFormula(
            thriftRequest,
            getDefaultCallback(defer, sage.FormulaResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Batch Updates the formula.
     *
     * @param {Object[]}                    requests
     * @param {sage.ACTableRequest}         requests[].expressionRequest
     * @param {sage.ACContext}              requests[].context
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.BatchResponse
     */
        function batchUpdateExpression (requests) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();

            var updateExpressionRequests = requests.map(function(request) {
                var context = request.context;
                var tableRequest = request.expressionRequest;
                var formulaId = request.formulaId;

                var transformRequest = sage.UpdateFormulaRequest.create(requestInfo, context, tableRequest, formulaId);

                return sage.Request.createUpdateFormulaRequest(transformRequest);
            });

            var batchRequest = sage.BatchRequest.create(updateExpressionRequests);

            var debugInfo = createDebugInfo(thriftRequest, 'batchUpdateFormula', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, batchRequest);

            _autoCompleteClient.Batch(
            thriftRequest,
            getDefaultCallback(defer, sage.BatchResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Makes a Ping request to Sage to check connectivity.
     *
     * @returns {Promise<void>}
     */
        function ping () {
            var defer = $q.defer();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var pingRequest = new sage.PingRequest();
            thriftRequest.request = sage.serialize(pingRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'ping', REQUEST_ID++);

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, pingRequest);

            _autoCompleteClient.Ping(
            thriftRequest,
            getDefaultCallback(defer, sage.PingResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Refreshes all the column ids in the context
     *
     * @param {sage.ACContext} queryContext
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.RefreshGuidsResponse
     */
        function refreshGuids (queryContext) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var refreshGuidsRequest = sage.RefreshGuidsRequest
            .create(requestInfo, queryContext);
            thriftRequest.request = sage.serialize(refreshGuidsRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'refreshGuids', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, refreshGuidsRequest);

            _autoCompleteClient.RefreshGuids(
            thriftRequest,
            getDefaultCallback(defer, sage.RefreshGuidsResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Saves the formula in the context
     *
     * @param {sage.ACContext} queryContext
     * @param {sage.ACFormula} formula
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.AnswerResponse
     */
        function saveFormula(queryContext, formula) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var saveFormulaRequest = sage.SaveFormulaRequest
            .create(requestInfo, queryContext, formula);
            thriftRequest.request = sage.serialize(saveFormulaRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'saveFormula', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, saveFormulaRequest);

            _autoCompleteClient.SaveFormula(
            thriftRequest,
            getDefaultCallback(defer, sage.AnswerResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Removes the formula in the context
     *
     * @param {sage.ACContext} queryContext
     * @param {sage.ACFormula} formula
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.AnswerResponse
     */
        function removeFormula(queryContext, formula) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var removeFormulaRequest = sage.RemoveFormulaRequest
            .create(requestInfo, queryContext, formula);
            thriftRequest.request = sage.serialize(removeFormulaRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'removeFormula', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, removeFormulaRequest);

            _autoCompleteClient.RemoveFormula(
            thriftRequest,
            getDefaultCallback(defer, sage.AnswerResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Adds a filter formula to a table guid
     *
     * @param {sage.ACFormula} filter
     * @param {string} tableGuid
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.TableFilterResponse
     */
        function addTableFilter(filter, tableGuid) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var addTableFilterRequest = sage.AddTableFilterRequest
            .create(requestInfo, filter, tableGuid);
            thriftRequest.request = sage.serialize(addTableFilterRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'addTableFilter', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, addTableFilterRequest);

            _autoCompleteClient.AddTableFilter(
            thriftRequest,
            getDefaultCallback(defer, sage.TableFilterResponse, debugInfo)
        );

            return defer.promise;
        }

    /**
     * Updates a filter formula on a table
     *
     * @param {sage.ACFormula} filter
     * @param {sage.RecognizedToken} token
     * @param {string} tableGuid
     *
     * @returns {Promise<SageResponse>}
     * SageResponse.answerResponse: sage.TableFilterResponse
     */
        function updateTableFilter(filter, token, tableGuid) {
            var defer = $q.defer();
            var requestInfo = getRequestInfoObject();
            beforeAutoCompleteCall();

            var thriftRequest = newThriftRequest();
            var updateTableFilterRequest = sage.UpdateTableFilterRequest
            .create(requestInfo, filter, token, tableGuid);
            thriftRequest.request = sage.serialize(updateTableFilterRequest);

            var debugInfo = createDebugInfo(thriftRequest, 'updateTableFilter', requestInfo.getRequestCallId());

            _logger.debug('###REQUEST', debugInfo.requestId, debugInfo.url, updateTableFilterRequest);

            _autoCompleteClient.UpdateTableFilter(
            thriftRequest,
            getDefaultCallback(defer, sage.TableFilterResponse, updateTableFilterRequest, debugInfo)
        );

            return defer.promise;
        }

        return {
            validateContext: validateContext,
            cleanupContext: cleanupContext,
            addTable: addTable,
            editTable: editTable,
            transformTable: transformTable,
            batchTransform: batchTransform,
            deleteTable: deleteTable,
            addJoin: addJoin,
            editJoin: editJoin,
            deleteJoin: deleteJoin,
            updateWorksheet: updateWorksheet,
            transformWorksheet: transformWorksheet,
            removeAllBrokenColumnsFromWorksheet: removeAllBrokenColumnsFromWorksheet,
            updateExpression: updateExpression,
            batchUpdateExpression: batchUpdateExpression,
            refreshGuids: refreshGuids,
            saveFormula: saveFormula,
            removeFormula: removeFormula,
            addTableFilter: addTableFilter,
            updateTableFilter: updateTableFilter,
            ping: ping,
            batchGetAccessibleTables: batchGetAccessibleTables,
            getAccessibleTables: getAccessibleTables
        };
    }]);
