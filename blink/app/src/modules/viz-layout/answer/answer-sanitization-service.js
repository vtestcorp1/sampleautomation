/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Utility to sanitize saved answers before usage in blink.
 */

'use strict';

blink.app.factory('answerSanitizationService', ['$q',
    'alertService',
    'answerService',
    'autoCompleteObjectUtil',
    'blinkAutoCompleteService',
    'callosumTypes',
    'Logger',
    'jsonConstants',
    'strings',
    'UserAction',
    'util',
    function ($q,
              alertService,
              answerService,
              autoCompleteObjectUtil,
              blinkAutoCompleteService,
              callosumTypes,
              Logger,
              jsonConstants,
              strings,
              UserAction,
              util) {
        var _logger = Logger.create('answer-sanitization-service');

        function hasValidSageContext(answerModel){
            return !!answerModel.getSageContext() && answerModel.getSageContextIndex() > -1;
        }

    // In cases when we cannot sanitize the corrupted answer models using sage,
    // we mock the sanitization locally.
        function sanitizeContextLocally(answerModel) {
            if (hasValidSageContext(answerModel)) {
                return;
            }

            var sageContext = answerModel.getSageContext();
            var tokens = answerModel.getRecognizedTokens();
            sageContext.getTables()[0].setTokens(tokens);
            answerModel.setSageContext(sageContext, 0);
        }

        function handleSavedAnswerContextSynchronizationUpdate(answerModel) {
            answerModel.setIsAutoUpgraded(true);
            return answerModel;
        }

        function syncSavedAnswerAndSageContext(context, index, answerModel, savedAnswerLockedVizs) {
            var questionParams = {};
            questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;
            questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = index;

            var optionalParams = {
                answerModel: answerModel,
                doNotCleanAnswerState: true,
                isNotIgnorable: true,
                requestType: callosumTypes.RequestTypes.ANSWER_UPGRADE
            };

            var userAction = new UserAction(UserAction.FETCH_ANSWER);
            return answerService.getAnswer(questionParams, optionalParams)
            .then(function(response) {
                var newAnswerModel = response.data;
                var visualizations = newAnswerModel.getCurrentAnswerSheet().getVisualizations();
                util.iterateObject(visualizations, function(vizId, viz) {
                    var isLocked = savedAnswerLockedVizs[vizId];
                    viz.setIsConfigurationLocked(isLocked);
                });
                return newAnswerModel;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }).then(handleSavedAnswerContextSynchronizationUpdate);
        }

        function onSageRequestFailure(error) {
            if (error) {
                alertService.showFailureAlert(error);
            } else {
                var alertMessage = strings.alert.FAILED_TO_BUILD_SEARCH_RESULT;
                alertService.showAlert({
                    message: alertMessage,
                    type: alertService.alertConstants.type.ERROR
                });
            }

            _logger.error('error loading answer', error);
        }

    /**
     * This method takes a saved answer model as an input.
     * 1. Identifies if this model is saved with the latest sage context if not initiates
     * sanitization.
     * 2. In sanitization step there is a new sage context is created using the tokens and the new
     * context is used to query new answer model that inherits properties from this saved answer.
     * @param answerModel
     * @returns {*}
     */
        function sanitizeSavedAnswerModel(answerModel) {
            if (!answerModel) {
                return $q.when(answerModel);
            }

            var permission = answerModel.getPermission();
        // NOTE: We use access to underlying data here to decide whether we sanitize the answer.
        // In case of missing access the answer is un-editable so there is no sanitization needed.
        // In case of read only access we do call sanitize here as we allow user to further make
        // changes from that answer itself, hence we need a valid context. There is code that
        // disallows the user to save so there is no concern.
            var isMissingUnderlyingAccess = !!permission ?
            permission.isMissingUnderlyingAccess() : true;
        // In case of corrupted answer also (with base tables deleted), we do not make
        // the addTable call, as sanitization will fail due to the corruption.
            var isCorrupted = answerModel.isCorrupted();

            if (isMissingUnderlyingAccess || isCorrupted) {
                sanitizeContextLocally(answerModel);
                return $q.when(answerModel);
            }
            var newContext = autoCompleteObjectUtil.getNewACContext();
        // NOTE: We add the formulae so to support in answer formulae.
        // TODO: Simplify this logic and make edit table call instead using answer sage context.
        // currently its not avaliable till the full answer is loaded.
            if (hasValidSageContext(answerModel)) {
                var oldSageContext = answerModel.getSageContext();
                var formulae = oldSageContext.getFormulaeMap();
                newContext.setFormulaeMap(formulae);
            }

            var recognizedTokens = answerModel.getRecognizedTokens();
            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();

            tableRequest.setInputTokens(recognizedTokens);

            return blinkAutoCompleteService.addTable(newContext, tableRequest).
            then(function(answerResponse){
                var accessibleTables = answerResponse.getTableResponse().getAccessibleTables();
                answerModel.setAccessibleTables(accessibleTables);
                var context = answerResponse.getContext();
                var tables = context.getTables();
                var index = tables.length - 1;
                if(!!tables[index].getQuery()) {
                    // NOTE: In case where we are sanitizing the context we should lock the
                    // visualizations and then revert to original state once done with sanitization.
                    // This is done to retain client state for vizs.
                    var answerSheet = answerModel.getCurrentAnswerSheet();
                    var visualizations = answerSheet.getVisualizations();
                    var savedAnswerLockedVizs = {};
                    util.iterateObject(visualizations, function(vizId, viz){
                        savedAnswerLockedVizs[vizId] = viz.isConfigurationLocked();
                        if (viz.getVizType().toLowerCase() === jsonConstants.VIZ_TYPE_CHART) {
                            viz.setIsConfigurationLocked(true);
                        }
                    });
                    return syncSavedAnswerAndSageContext(
                        context,
                        index,
                        answerModel,
                        savedAnswerLockedVizs
                    );
                } else {
                    sanitizeContextLocally(answerModel);
                    onSageRequestFailure();
                    return answerModel;
                }
            }, function(error) {
                sanitizeContextLocally(answerModel);
                onSageRequestFailure(error);
                return answerModel;
            }
        );
        }

        return {
            sanitizeSavedAnswerModel: sanitizeSavedAnswerModel
        };
    }]);
