/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * This service wraps the base autoCompleteService with common wrapping utils
 * like generic error handling.
 */

'use strict';

blink.app.factory('blinkAutoCompleteService', ['$q',
    'alertService',
    'autoCompleteService',
    'strings',
    function($q,
         alertService,
         autoCompleteService,
         strings) {
    /**
     *
     * @param sageResponse {SageResponse}
     * sageResponse.answerResponse {sage.AnswerResponse}
     * @returns {sage.AnswerResponse}
     */
        function validateResponse(message, propagateFullResponse, sageResponse){
            var answerResponse = sageResponse.answerResponse;
            var errorCode = answerResponse.getErrorCode();
            if (!errorCode || errorCode === sage.ErrorCode.SUCCESS) {
                var response = propagateFullResponse ? sageResponse : answerResponse;
                return $q.when(response);
            } else {
                var errorMessage = answerResponse.getErrorMessage();
                alertService.showAlert({
                    type: alertService.alertConstants.type.ERROR,
                    message: message,
                    details: errorMessage
                });
                return $q.reject({
                    errorCode: errorCode,
                    errorMessage: errorMessage
                });
            }
        }

    /**
     * Adds a table to the given context.
     *
     * @param {sage.ACContext} queryContext
     * @param {sage.ACTableRequest} tableRequest
     *
     * @returns {Promise<sage.AnswerResponse>}
     */
        function addTable (queryContext, tableRequest) {
            var message = strings.alert.FAILED_TO_BUILD_SEARCH_RESULT;
            var validator = validateResponse.bind(void 0, message, false);
            return autoCompleteService.addTable(queryContext, tableRequest)
            .then(validator);
        }

        function saveFormula (queryContext, sageFormula) {
            var message = strings.alert.FAILED_TO_SAVE_FORMULA;
            var validator = validateResponse.bind(void 0, message, true);
            return autoCompleteService.saveFormula(queryContext, sageFormula)
                .then(validator);
        }

        function removeFormula (queryContext, sageFormula) {
            var message = strings.alert.FAILED_TO_REMOVE_FORMULA;
            var validator = validateResponse.bind(void 0, message, true);
            return autoCompleteService.removeFormula(queryContext, sageFormula)
                .then(validator);
        }

    /**
     * Echos the current context and index to sage using transform table call.
     * We expect this to help with
     * 1. Making sure the context is updated.
     * 2. Getting the response needed to populate UI with tables in scope.
     * @param {sage.ACContext} queryContext
     * @param {number} queryContextIndex
     * @returns {promise}
     */
        function echoContextDetails(queryContext, queryContextIndex) {
            return autoCompleteService.transformTable(queryContext, queryContextIndex, [])
            .then(validateResponse);
        }

        return {
            addTable: addTable,
            echoContextDetails: echoContextDetails,
            removeFormula: removeFormula,
            saveFormula: saveFormula
        };
    }]);
