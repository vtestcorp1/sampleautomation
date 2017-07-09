/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service used to access /data on callosum server
 */

'use strict';

blink.app.factory('dataService', ['$http',
    '$q',
    '$location',
    'alertService',
    'currencyUtil',
    'Logger',
    'util',
    'jsonConstants',
    'metadataUtil',
    'perfMeter',
    'strings',
    'FormDownloader',
    'env',
    'Command',
    'CancelablePromise',
    function ($http,
          $q,
          $location,
          alertService,
          currencyUtil,
          Logger,
          util,
          jsonConstants,
          metadataUtil,
          perfMeter,
          strings,
          FormDownloader,
          env,
          Command,
          CancelablePromise) {

        var errorCodes = {
            VIZ_DATA_EMPTY: "vizDataEmpty"
        };

    // TODO(Jasmeet): Add unit tests for all the service calls.
        var _logger = Logger.create('data-service');

    /**
     * Gets data for a given viz
     *
     * @param answerModel
     * @param vizId
     * @returns {*}
     */
        var downloadTableData = function(answerModel, vizId) {
            var answerBookMetadata = answerModel.getJson()[jsonConstants.REPORT_BOOK_METADATA_KEY];

            var params = {
                vizid: JSON.stringify([vizId]),
                content: JSON.stringify(answerBookMetadata)
            };

            var command = new Command()
            .setPath('/data/answerbook/export')
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams(params);

            return command.execute();
        };

    /*
     * Trigger the download of pinboard as pdf using foolscap service.
     *
     * @param {string} pinboardId       The pinboard ID
     */
        var downloadPinboardAsPdf = function (pinboardId) {
            var deferred = $q.defer();

            var COOKIE_NAME = 'Callosum-Download-Initiated';
            $.removeCookie(COOKIE_NAME);

            var inputKeyValueMap = {
                id: pinboardId
            };

            new FormDownloader().downloadForm(
                'callosum/v1/data/answerbook/export/pdf',
                inputKeyValueMap,
                undefined, /* textAreaKeyValueMap */
                true /* submit request as multi-part */
            );

            var promise = util.waitFor(function() {
                var hasDownloadInitiated = $.cookie(COOKIE_NAME);
                return !!hasDownloadInitiated;
            }, 200, 120000);
            promise.then(function() {
                $.removeCookie(COOKIE_NAME);
                deferred.resolve();
            }, function() {
                $.removeCookie(COOKIE_NAME);
                deferred.reject();
            });

            return deferred.promise;
        }

    /*
     * Trigger the download of a file containing the viz data CSV format.
     * The export API supports two sets of params:
     *      1. content (the answer model JSON) and vizid (the viz id)
     *      2. id (the answer book id) and vizid (the viz id)
     * Currently, we always use the first option and always send the answer model to callosum.
     *
     * @param {Object} answerModel      The answer model of the viz
     * @param {string} vizId            The viz id
     * @param {Object}                  A promise that resolves after the download
     */
        var downloadExcelFile = function (answerModel, vizId, formatType, leafLevel) {
            var deferred = $q.defer(),
                answerBookMetadata = answerModel.getJson()[jsonConstants.REPORT_BOOK_METADATA_KEY];

            var COOKIE_NAME = 'Callosum-Download-Initiated';
            $.removeCookie(COOKIE_NAME);

            var visualizationIds = [vizId];

            var inputKeyValueMap = {
                vizid: JSON.stringify(visualizationIds)
            };
            if (!!formatType) {
                inputKeyValueMap.format = formatType;
            }
            if (leafLevel) {
                inputKeyValueMap.leafdata = true + '';
            }

            var textAreaKeyValueMap = {
                content: JSON.stringify(answerBookMetadata)
            };

            var queryParameters = env.getQueryParameters();
            var queryParamPrefix = metadataUtil.stitchQueryParametersIntoAString(queryParameters);
            new FormDownloader().downloadForm(
            'callosum/v1/data/answerbook/export?{1}'.assign(queryParamPrefix),
            inputKeyValueMap,
            textAreaKeyValueMap,
            true /* submit request as multi-part */
        );

            var promise = util.waitFor(function() {
                var hasDownloadInitiated = $.cookie(COOKIE_NAME);
                return !!hasDownloadInitiated;
            }, 200, 120000);
            promise.then(function() {
                $.removeCookie(COOKIE_NAME);
                deferred.resolve();
            }, function() {
                $.removeCookie(COOKIE_NAME);
                deferred.reject();
            });

            return deferred.promise;
        };

    /**
     * Gets the natural query representation for a given answer based on either id or model.
     * @param answerId
     * @param answerModel
     * @returns {CancelablePromise}
     */
        var getNaturalQueryRepresentation = function (answerId, answerModel) {
            if (!answerId && !answerModel) {
                _logger.error("Natural query requested without any answer detail");
                return;
            }
            var postParams;
            if (!!answerId) {
                postParams = {
                    id:answerId
                };
            } else {
                var answerBookMetadataJson = answerModel.getJson()[jsonConstants.REPORT_BOOK_METADATA_KEY],
                    content = JSON.stringify(answerBookMetadataJson);
                postParams = {
                    content: content
                };
            }
            var deferred = $q.defer();

            var command = new Command()
            .setPath('/data/naturalrepresentation')
            .setPostMethod()
            .setPostParams(postParams);

            command.execute()
            .then(function (response) {
                var data = response.data;
                var naturalQueryNode = data[jsonConstants.NATURAL_QUERY_KEY];
                var naturalQueryKeys = Object.keys(naturalQueryNode);
                deferred.resolve(naturalQueryNode[naturalQueryKeys[0]]);
            }, function (error) {
                deferred.reject(error);
            });
            return new CancelablePromise(deferred.promise);
        };

    /**
     * Used to get a "page" of data for a given viz.
     *
     * @param {AnswerModel} answerModel
     * @param {Object} vizModel
     * @param {Object} params extra post params having offset. If no offset is provided, the first page is fetched.
     * @param (boolean=} whether send the content of the answer instead of id as a request parameter.
     * @param {Object} filterExpression Expression to filter data values.
     * @return {Object} Cancelable Promise
     */
        var getDataForVizWithCancelablePromise = function (answerModel, vizModel, params, sendReportbookJson,
                                                       filterExpression) {
            var promise = getDataForViz(answerModel, vizModel, params, sendReportbookJson, filterExpression);
            return new CancelablePromise(promise);
        };

        var showCompletionRatioAlert = function (data) {
            if (data[jsonConstants.COMPLETION_RATIO] < 1) {
                alertService.showAlert({
                    message: strings.It_took_too_long,
                    type: alertService.alertConstants.type.PROBLEM
                });
            }
        };

        var postProcessDataCall = function (promise, answerModel, vizModel, vizId) {
            return promise
            .then(function (response) {
                var data = response.data;
                showCompletionRatioAlert(data);
                // HACK(vibhor): Since callosum doesn't expose a viz specific data fetch api, we use the reportbook
                // data fetch api and specify a vizid restrict and extract viz data from response.
                var answerSheet = answerModel.getCurrentAnswerSheet(),
                    answerSheetId = answerSheet.getId();
                if (!data.reportBookData || !data.reportBookData.hasOwnProperty(answerSheetId) ||
                    !data.reportBookData[answerSheetId].vizData ||
                    !data.reportBookData[answerSheetId].vizData.hasOwnProperty(vizId)) {
                    response.message = 'Invalid data format for viz id ' + vizId + JSON.stringify(data);
                    return $q.reject(response);
                } else {
                    var vizData = data.reportBookData[answerSheetId].vizData[vizId];

                    // if viz data is empty, return empty
                    if (!vizData.hasOwnProperty("dataSets") &&
                        !vizData.hasOwnProperty(jsonConstants.CHART_DATA_KEY)) {
                        return $q.reject(errorCodes.VIZ_DATA_EMPTY);
                    }

                    // The client of this promise will get the parsed data model inside .then(function(response){})
                    var dataSets = vizData.dataSets,
                        vizType = vizModel.getVizType();

                    if (vizType.toLowerCase() === jsonConstants.VIZ_TYPE_PINBOARD
                        && vizModel.getReferencedVisualization().getVizType().toLowerCase() === jsonConstants.VIZ_TYPE_CHART) {
                        vizType = jsonConstants.VIZ_TYPE_CHART.toUpperCase();
                    }

                    if (vizType.toLowerCase() === jsonConstants.VIZ_TYPE_CHART) {
                        var chartData = vizData[jsonConstants.CHART_DATA_KEY];
                        if (!chartData) {
                            response.message = 'Invalid viz type' + JSON.stringify(dataSets);
                            return $q.reject(response);
                        } else {
                            response.data = chartData;
                            return response;
                        }
                    } else {
                        if (dataSets.hasOwnProperty(vizType)) {
                            var queryData = dataSets[vizType];
                            if (!queryData.data && queryData.errorCode) {
                                response.message = 'Failure fetching data: ' + queryData.errorCode;
                                return $q.reject(response);
                            } else {
                                response.data = queryData;
                                return response;
                            }
                        } else {
                            response.message = 'Invalid viz type' + JSON.stringify(dataSets);
                            return $q.reject(response);
                        }
                    }
                }
            })
            .then(function (response) {
                var vizDataMap = {};
                vizDataMap[vizId] = response.data;
                currencyUtil.addCurrencyInfo([vizModel], vizDataMap);
                return response;
            });
        };

        function getUrlParams() {
            var urlParams = env.getQueryParameters();
            return angular.extend({}, urlParams, $location.search());
        }

        /**
         * Used to get a "page" of data for a given viz.
         *
         * @param {AnswerModel} answerModel
         * @param {Object} vizModel
         * @param {Object} params extra post params having offset. If no offset is provided, the first page is fetched.
         * @param (boolean=} whether send the content of the answer instead of id as a request parameter.
         * @param {Object} filterExpression Expression to filter data values.
         * @return {promise}
         */
        var getDataForViz = function (
            answerModel,
            vizModel,
            params,
            sendReportbookJson,
            filterExpression,
            cancellationNamespace
        ) {
            var urlParams = getUrlParams();
            var answerBookMetadataJson = answerModel.getJson()[jsonConstants.REPORT_BOOK_METADATA_KEY],
                vizId = vizModel.getId();

            params = params || {};

            var overrideQuestionMap;
            if (!!params.overrideQuestion) {
            // NOTE: We make a copy of the object which has the serialized context so that
            // the original object is still in deserialized format and usable in the app.
                var questionWithSerializedContext = {};
                $.extend(questionWithSerializedContext, params.overrideQuestion);
                var context = params.overrideQuestion[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
                var serializedContext = sage.serialize(context);
                questionWithSerializedContext[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = serializedContext;
                overrideQuestionMap = {};
                overrideQuestionMap[vizId] = questionWithSerializedContext;
            }

            var postParams = {
                batchsize: vizModel.getBatchSize(),
                vizid: JSON.stringify([vizId]),
                offset: params.offset || 0,
                type: answerModel.getMetadataType(),
                currentepochoverride: env.currentEpochOverrideMs,
                inboundrequesttype: params.requestType
            };
            if (sendReportbookJson && !answerModel.isFromDetailsCall()) {
                postParams.content = JSON.stringify(answerBookMetadataJson);
            } else {
                postParams.id = answerModel.getId();
            }
            if (filterExpression) {
                postParams.clientfilter = filterExpression.getJsonString();
            }
            if (overrideQuestionMap) {
                postParams.vizidtooverridequestionmap = JSON.stringify(overrideQuestionMap);
            }
            if (!!params.showAllValues) {
                postParams.cascadefilter = false;
            }

        //there can be multiple parallel calls for data for different vizs, since the ignorable check is based on
        //path excluding the query params all but the last of the parallel calls will get ignored hence w don't
        //mark these calls as ignorable
            var command = new Command()
            .setPath('/data/reportbook')
            .setPostMethod()
            .setGetParams(urlParams)
            .setPostParams(postParams)
            .setIsMultipart(true);

            return postProcessDataCall(command.execute({
                cancellationNamespace: cancellationNamespace
            }), answerModel, vizModel, vizId);
        };

    /**
     * Used to get data for multiple viz models.
     *
     * @param {AnswerModel} answerModel
     * @param {Object} vizModels array of viz Models
     * @param {Object} params extra post params having offset. If no offset is provided, the first page is fetched.
     * @param (boolean=} whether send the content of the answer instead of id as a request parameter.
     * @return {promise}
     */
        var getDataForVizs = function (answerModel, vizModels, params, sendReportbookJson) {
            var urlParams = getUrlParams();
            var answerBookMetadataJson = answerModel.getJson()[jsonConstants.REPORT_BOOK_METADATA_KEY],
                vizIdToModelsMaps = {};

            var vizTypes = {};
            var maxBatchSize = 0;
            angular.forEach(vizModels, function (vizModel) {
                var vizId = vizModel.getId();

                vizIdToModelsMaps[vizId] = vizModel;
                vizTypes[vizModel.getVizType()] = true;
                var batchSize = vizModel.getBatchSize();
                maxBatchSize = (batchSize > maxBatchSize) ? batchSize : maxBatchSize;
            });

            params = params || {};

            var postParams = {
                batchsize: maxBatchSize,
                vizid: JSON.stringify(Object.keys(vizIdToModelsMaps)),
                offset: params.offset || 0,
                type: answerModel.getMetadataType(),
                currentepochoverride: env.currentEpochOverrideMs,
            };
            if (sendReportbookJson && !answerModel.isFromDetailsCall()) {
                postParams.content = JSON.stringify(answerBookMetadataJson);
            } else {
                postParams.id = answerModel.getId();
            }

            var command = new Command()
            .setPath('/data/reportbook')
            .setPostMethod()
            .setGetParams(urlParams)
            .setPostParams(postParams)
            .setIsMultipart(true);

            var startTime = (new Date()).getTime();
            var dataPromise = command.execute()
            .then(function (response) {
                var data = response.data;
                showCompletionRatioAlert(data);
                var answerSheet = answerModel.getCurrentAnswerSheet(),
                    answerSheetId = answerSheet.getId(),
                    vizDataMap = {};

                var endTime = (new Date()).getTime();
                if (!data.reportBookData || !data.reportBookData.hasOwnProperty(answerSheetId) ||
                    !data.reportBookData[answerSheetId].vizData) {
                    response.message = 'No Viz Data in response ' + JSON.stringify(data);
                    return $q.reject(response);
                }

                // Take all the viz types in this data call and concatenate them to use as perf reporting key.
                var dataRpcKey = Object.keys(vizTypes).sort().join('+');
                // TODO(pavan/vibhor): We should also be tracking the data calls that are made outside of initial
                // answer rendering (ie for filters, chart type1 -> chart type2).
                //
                // Currently, all those calls are routed through getDataForViz() and Jasmeet is going to
                // refactor so that we can just have one method to make all the data calls.
                perfMeter.addReportbookDataRequest(dataRpcKey, startTime, endTime, data.debugInfo);
                var isFailed = false;
                angular.forEach(vizIdToModelsMaps, function(vizModel, vizId) {
                    if (isFailed) {
                        return;
                    }
                    // This function doesnt fail if there is no data for a Viz, the caller needs to handle the case of
                    // missing data.
                    var vizData = data.reportBookData[answerSheetId].vizData[vizId];
                    if (!vizData) {
                        vizDataMap[vizId] = null;
                        return;
                    }
                    // The client of this promise will get the parsed data model inside
                    // .then(function(response){})
                    // TODO(Jasmeet): SCAL-8110 callosum agreed to the contract that there will
                    // always be a data node for viz in metadata add assert condition here once
                    // the bug is fixed.
                    var dataSets = vizData.dataSets,
                        vizType = vizModel.getVizType();

                    if (vizType.toLowerCase() === jsonConstants.VIZ_TYPE_PINBOARD
                        && vizModel.getReferencedVisualization().getVizType().toLowerCase() === jsonConstants.VIZ_TYPE_CHART) {
                        vizType = jsonConstants.VIZ_TYPE_CHART.toUpperCase();
                    }

                    if (vizType.toLowerCase() === jsonConstants.VIZ_TYPE_CHART) {
                        vizDataMap[vizId] = vizData[jsonConstants.CHART_DATA_KEY];
                    } else {
                        if (dataSets.hasOwnProperty(vizType)) {
                            var queryData = dataSets[vizType];
                            if (!queryData.data && queryData.errorCode) {
                                var debugMesg = 'Failure fetching data for viz {1} with error {2}';

                                _logger.debug(debugMesg.assign(vizId, queryData.errorCode));
                            } else {
                                vizDataMap[vizId] = queryData;
                            }
                        } else {
                            response.message = 'Invalid viz type' + Object.keys(dataSets);
                            isFailed = true;
                        }
                    }
                });

                if (isFailed) {
                    return $q.reject(response);
                } else {
                    response.data = vizDataMap;
                    return $q.resolve(response);
                }
            })
            .then(function(response) {
                currencyUtil.addCurrencyInfo(vizModels, response.data);
                return response;
            });

            return {
                dataPromise: dataPromise,
                cancelId: command.cancelId
            };
        };

    /**
     * Updates data for a viz in an answer model based on input.
     * @param vizModel
     * @param answerModel
     * @returns {*}
     */
        var updateDataForVizModel = function (vizModel, answerModel) {
            answerModel = answerModel || (vizModel && vizModel.getContainingAnswerModel());
            if (!answerModel || !vizModel) {
                _logger.error('Can not update viz model without required inputs for vizModel, answerModel: ', vizModel, answerModel);
                return null;
            }

        // TODO(vibhor/sunny): Create a promise factory that can group multiple in-flight promises for same key but only
        // resolve the last one.
            var deferred = $q.defer();
            getDataForViz(answerModel, vizModel, {}, true).then(function (response) {
                var data = response.data;
                answerModel.getCurrentAnswerSheet().setDataForViz(vizModel.getId(), vizModel.getVizType(), data);
                vizModel.updateData(data);
                response.data = vizModel;
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

    /**
     * Gets table data for the given table id or content.
     * @param {Object} requiredParams
     * @param {string} [requiredParams.content]
     * @param {string} [requiredParams.id]
     * @param {Object} [params]
     * @param {boolean} [params.includeMetadata=false]
     * @param {boolean} [params.showHidden=false]
     * @param {number} [params.batchSize=50]
     * @returns {*}
     */
        var getTableData = function(requiredParams, params) {
            var postParams = {};

            if(requiredParams.id){
                postParams.id = requiredParams.id;
            }
            if(!postParams.id){
                postParams.content = requiredParams.content;
                if(!postParams.content) {
                    _logger.warn('getTableData called with id or content');
                    $q.reject();
                }
            }

            params = params || {};
            postParams.includemetadata = !!params.includeMetadata;
            postParams.batchsize = params.batchSize || 50;
            postParams.showhidden = !!params.showHidden;

            var command = new Command()
            .setPath('/data/table')
            .setPostMethod()
            .setPostParams(postParams)
            .setIsMultipart(true);

            return command.execute();
        };

        return {
            errorCodes: errorCodes,
            downloadTableData: downloadTableData,
            downloadPinboardAsPdf: downloadPinboardAsPdf,
            downloadExcelFile: downloadExcelFile,
            getNaturalQueryRepresentation: getNaturalQueryRepresentation,
            getDataForVizWithCancelablePromise: getDataForVizWithCancelablePromise,
            getDataForViz: getDataForViz,
            postProcessDataCall: postProcessDataCall,
            getDataForVizs: getDataForVizs,
            updateDataForVizModel: updateDataForVizModel,
            getTableData: getTableData
        };
    }]);
