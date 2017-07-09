/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service used to make all /answer callosum calls.
 * This service contains base network call and commonly use wrappers for these calls.
 */

'use strict';

blink.app.factory('answerService', ['$q',
    'env',
    'Logger',
    'CancelablePromise',
    'Command',
    'AnswerModel',
    'jsonConstants',
    'perfMeter',
    'sageUtil',
    function ($q,
          env,
          Logger,
          CancelablePromise,
          Command,
          AnswerModel,
          jsonConstants,
          perfMeter,
          sageUtil) {
        var _logger = Logger.create('answer-service');

        function addDataNodeToAnswer (answerJson) {
        //the structure of the json reported is needs to have some extra fields added to make it similar
        //to the one returned when we fetch full model so that the parsing logic can stay the same
            var dataNode = {};
            answerJson.reportBookMetadata.reportContent.sheets.each(function(sheet){
                dataNode[sheet.header.id] = {
                    vizData: {}
                };
            });
            answerJson.reportBookData = dataNode;
        }

    /**
     * Posts Query to get answer from sage AC Context.
     * This returns a promise resolved with the answerModel for the passed answerContext.
     * @param {Object} questionParams.
     * @param {Object} [params] optional params for this call.
     * @returns {Promise.promise}
     */
        var getAnswer = function(question, params) {
            var questionParams = {};
            _.assign(questionParams, question);

            var documentPermissionsFromBaseAnswer = null;
            if (!questionParams) {
                _logger.error('No answer context provided for Answer call');
            }

        // NOTE: This is a debug property set to allow correlation in logs.
            var context = questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
            var index = questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY];
            if (!!context) {
                var table = context.getTables()[index];
                var tokens = table.getTokens();
                questionParams[jsonConstants.TEXT_KEY] = sageUtil.tokensToQuery(tokens);
                questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = sage.serialize(context);
            }

            params = params || {};

        // Setup post params with defaults or using overrides in params.
            var answerSheetIndex = params.answerSheetIndex || 0;
            var onDemandDataFilter = params.onDemandDataFilter || env.onDemandFilter;
            var tableVizOnly = env.tablevizonly || params.tableVizOnly || false;
            var batchSize = env.batchSize || params.batchSize || '';
            var leafData = params.leafData || false;
            var includeData = params.includeData || false;

            var currentAnswerBook = '';
            if (params.answerModel) {
            // NOTE:
            // - Copy of answer is used here to ensure that the answer model used is sage cache is not corrupted and
            // remains consistent.
            // - Clear inconsistent state method takes care of removing the content from answer which doesnt not belong in
            // in the answer returned from callosum. Blink needs to do this as there is some client state which belongs to
            // this category eg: VizSelectionAnswerMode
                var answerModelCopy = new AnswerModel(_.cloneDeep(params.answerModel.getJson()));
                if (!params.doNotCleanAnswerState){
                    answerModelCopy.cleanStateForAnswerQuery();
                }
                currentAnswerBook = JSON.stringify(answerModelCopy.getReportBookJson());
                documentPermissionsFromBaseAnswer = params.answerModel.getPermission();
            }

            if (_.isNil(params.requestType)) {
                _logger.warn('Answer call made without any request type');
            }

            var command = new Command()
            .setPath('/answer')
            .setPostMethod()
            .setPostParams({
                question: JSON.stringify(questionParams),
                currentanswerbook: currentAnswerBook,
                answersheetindex: answerSheetIndex,
                batchsize: batchSize,
                ondemanddatafilter: onDemandDataFilter,
                predictive: false,
                tablevizonly: tableVizOnly,
                leafdata: leafData,
                deadlinems: env.deadlineMs,
                partial: env.allowPartialResults,
                debug: Logger.isDebugLogEnabled(),
                currentepochoverride: env.currentEpochOverrideMs,
                includeData: includeData,
                inboundrequesttype: params.requestType
            })
            .setIsMultipart(true);

            if (!params.isNotIgnorable) {
                command.setIgnorable();
            }

            perfMeter.startAnswerMetadataRequest();

            var answerPromise = command.execute()
            .then(function (response) {
                var data = response.data;
                if (!includeData) {
                    addDataNodeToAnswer(data);
                }
                perfMeter.endAnswerMetadataRequest();
                if (data && data.debugInfo) {
                    perfMeter.setCallosumServerMetadataLatencyInfo(data.debugInfo);
                }

                if (!data.isErrorOrWarning) {
                    var newAnswerModel = new AnswerModel(data);
                    if (!!documentPermissionsFromBaseAnswer) {
                        newAnswerModel.setPermission(documentPermissionsFromBaseAnswer);
                    }
                    response.data = newAnswerModel;
                    return response;
                } else {
                    return $q.reject(response);
                }
            });

            return new CancelablePromise(answerPromise);
        };

        return {
            getAnswer: getAnswer
        };
    }]);
