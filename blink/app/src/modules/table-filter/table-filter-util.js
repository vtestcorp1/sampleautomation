/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 */

'use strict';

blink.app.factory('tableFilterUtil', ['$q',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'joinWorkflowLauncher',
    function($q,
         autoCompleteObjectUtil,
         autoCompleteService,
         joinWorkflowLauncher) {
        function addFilterToTable(filterModel) {
            var filterDefn =
            autoCompleteObjectUtil.getNewACFormulaFromFilter(filterModel);
            var filterToken = filterModel.getFilterToken();
            var tableGuid = filterModel.getOwner();

            var addFilterPromise = (!!filterToken)
            ? autoCompleteService.updateTableFilter(filterDefn, filterToken, tableGuid)
            : autoCompleteService.addTableFilter(filterDefn, tableGuid);
            var existingTokens = (!!filterToken) ? [filterToken] : [];

            return addFilterPromise.then(function(sageResponse) {
                var answerResponse = sageResponse.answerResponse;
            // Handle join path disambiguation here.
                if(answerResponse.hasMultipleJoinPathChoices()) {
                    return joinWorkflowLauncher.launch(
                    answerResponse.getJoinPathAmbiguities(),
                    [answerResponse.getFilterToken()],
                    existingTokens
                ).then(function(resolvedTokens) {
                    return autoCompleteService.updateTableFilter(
                        filterDefn,
                        resolvedTokens[0],
                        tableGuid
                    );
                });
                }
                return sageResponse;
            });
        }

        return {
            addFilterToTable: addFilterToTable,
            addRuleToTable: addFilterToTable
        };
    }]);
