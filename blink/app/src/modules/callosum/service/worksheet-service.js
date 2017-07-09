/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service used to make all /worksheet callosum calls.
 * This service contains base network call and commonly use wrappers for these calls.
 */

'use strict';

blink.app.factory('worksheetService', ['$q',
    '$rootScope',
    'Command',
    'env',
    'jsonConstants',
    'Logger',
    'metadataUtil',
    'perfMeter',
    'WorksheetModel',
    function ($q,
          $rootScope,
          Command,
          env,
          jsonConstants,
          Logger,
          metadataUtil,
          perfMeter,
          WorksheetModel) {
        var _logger = new Logger.create('worksheet-service');

        var getWorksheet = function (questionParams, params) {
            var deferred = $q.defer();

            var queryJoinType = $rootScope.currentQueryJoinType || '';
            var worksheetType = $rootScope.currentWorksheetType || jsonConstants.worksheetType.CONTAINER;

            var metadataJson = metadataUtil.getTrimmedSerializedWorksheetStateForEdit(params.model);
            var context = questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
            questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = sage.serialize(context);
            questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = 0;

            var command = new Command()
            .setPath('/worksheet')
            .setIgnorable()
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams({
                question: JSON.stringify(questionParams),
                jointype: queryJoinType,
                worksheettype: worksheetType,
                currentworksheet: metadataJson,
                batchsize: 3,
                ondemanddatafilter: env.onDemandFilter,
                // predictive elements are not used now; set this to true if needed again
                predictive: false,
                deadlinems: env.deadlineMs,
                partial: env.allowPartialResults,
                debug: Logger.isDebugLogEnabled()
            });

        // TODO (Shikhar) - update with worksheet perfMeter
            perfMeter.startAnswerMetadataRequest();

            command.execute()
            .then(function (response) {
                var data = response.data;

                perfMeter.endAnswerMetadataRequest();
                if (data && data.debugInfo) {
                    perfMeter.setCallosumServerMetadataLatencyInfo(data.debugInfo);
                }

                // The client of this promise will get the parsed data model inside .then(function(response){})
                if (!data.isErrorOrWarning) {
                    var worksheetModel = new WorksheetModel(data);
                    // SCAL-12686 Saved worksheets do not have attached sources.
                    // Add the resolved tokens back to metadata. This was dropped to reduce the
                    // payload of the call.
                    worksheetModel.setRecognizedTokens(questionParams.resolvedTokens);
                    response.data = worksheetModel;
                    deferred.resolve(response);
                } else {
                    deferred.reject(response);
                }
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

    /**
     * Creates an aggregated worksheet.
     * @param content {AnswerModel}
     * @param name {string}
     * @param [params] {Object} Optional params for this request.
     * @param [params.description]
     * @param [params.hide] Creates a hidden worksheet.
     */
        var createAggregatedWorksheet = function(model, name, params) {
            if (!model) {
                _logger.error('Create aggregated worksheet called with no model');
            }
            if (!name) {
                _logger.error('Create aggregated worksheet called with no model');
            }

            var content = model.getMetadataJson();
            var postParams = {
                content: JSON.stringify(content),
                name: name
            };

            if(!!params.description) {
                postParams.description = params.description;
            }

            postParams.hide = !!params.hide;

            var command = new Command()
            .setPath('/worksheet/createaggrws')
            .setIgnorable()
            .setPostMethod()
            .setPostParams(postParams);

            return command.execute();
        };

    /**
     * Updates aggregated worksheet
     * @param model
     * @param name
     * @param description
     * @returns {*}
     */
        var updateAggregateWorksheet = function(model, name, description) {
            if (!model) {
                _logger.error('Create aggregated worksheet called with no model');
            }
            if (!name) {
                _logger.error('Create aggregated worksheet called with no model');
            }

            var content = model.getMetadataJson();
            var id = model.getId();
            var postParams = {
                id: id,
                content: JSON.stringify(content),
                name: name
            };

            if(!!description) {
                postParams.description = description;
            }

            var command = new Command()
            .setPath('/worksheet/updateaggrws')
            .setIgnorable()
            .setPostMethod()
            .setPostParams(postParams);

            return command.execute();
        };

        return {
            getWorksheet: getWorksheet,
            createAggregatedWorksheet: createAggregatedWorksheet,
            updateAggregateWorksheet: updateAggregateWorksheet
        };
    }]);
