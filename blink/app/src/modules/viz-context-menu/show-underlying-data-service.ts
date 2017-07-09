/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com),
 *         Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for drill down context menu.
 */

'use strict';

import {ngRequire, Provide} from '../../base/decorators';
import {RequestTypes} from '../../base/proto/callosum-types';

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let answerService = ngRequire('answerService');
let autoCompleteService = ngRequire('autoCompleteService');
let vizContextMenuUtil = ngRequire('vizContextMenuUtil');
let leafLevelDataLauncher = ngRequire('leafLevelDataLauncher');
let loadingIndicator = ngRequire('loadingIndicator');
let Logger = ngRequire('Logger');
let jsonConstants = ngRequire('jsonConstants');
let UserAction = ngRequire('UserAction');

let logger;

Provide('showUnderlyingDataService')({
    launchVizLevelUnderlyingData,
    launchPointUnderlyingData
});

/**
 * Launches leaf data for vizLevel type.
 * Here we don't need to do any transformations. We only need un-aggregated leaf
 * data for the given document model.
 * Also there is no summary information for this type.
 */
export function launchVizLevelUnderlyingData(vizModel, sageClient) {
    if (!logger) {
        logger = Logger.create('show-underlying-data-service');
    }
    var answerModel = vizModel.getContainingAnswerModel();
    // TODO(Jasmeet): Get rid of this convoluted data format.
    var columns = vizModel.getVizColumns().map(function(col){
        return {
            column: col
        };
    });

    // SCAL-7778: for falcon performance reason we want to remove any sort by clauses
    // when asking for underlying data. This is achieved by removing all but non-filter
    // clauses and adding back all the columns of the table to the query.
    var queryTransformations =  vizContextMenuUtil.createQueryTransformations(
        [],
        columns,
        {
            includeColumnAggregations: false,
            includeFilteredColumns: false,
            answerModel: answerModel
        }
    );

    processTransformations(sageClient, queryTransformations, null);
}

/**
 * @param drillPointData
 */
export function launchPointUnderlyingData(drillPointData) {
    if (!logger) {
        logger = Logger.create('show-underlying-data-service');
    }

    if (!drillPointData.columnValuePairs
        || !drillPointData.unfilteredColumns) {
        logger.error('Launching row detail view with invalid parameters');
        return;
    }

    var queryTransformations =  vizContextMenuUtil.createQueryTransformations(
        drillPointData.columnValuePairs,
        drillPointData.unfilteredColumns,
        {
            includeColumnAggregations: false,
            includeFilteredColumns: true,
            answerModel: drillPointData.documentModel
        }
    );

    var summaryInfo = drillPointData.columnValuePairs.concat(drillPointData.unfilteredColumns);

    processTransformations(drillPointData.sageClient, queryTransformations, summaryInfo);
}

/**
 * 1. Processes Query Transformations
 * 2. Fetches transformed Answer Model from transformed answer state
 * 3. Launches Drill Leaf Data from fetched Answer Model
 *
 * @param sageClient
 * @param {Array.<sage.QueryTransform>} queryTransformations
 * @param summaryInfo
 */
function processTransformations(sageClient, queryTransformations, summaryInfo) {
    var sageContext =  sageClient.getContext();
    var index = sageClient.getCurrentIndex();

    loadingIndicator.show();

    autoCompleteService.transformTable(
        sageContext,
        index,
        queryTransformations
    )
        .then(function(sageResponse) {
                var answerResponse = sageResponse.answerResponse;
                var questionParams = {};

                questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = answerResponse.getContext();
                questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = sageClient.getCurrentIndex();

                var params = {
                    includeData: true,
                    leafData: true,
                    requestType: RequestTypes.DATA_SHOW_UNDERLYING_ROW
                };

                var userAction = new UserAction(UserAction.FETCH_ANSWER);
                answerService.getAnswer(questionParams, params)
                    .then(function(response) {
                        var answerModel = response.data;
                        leafLevelDataLauncher.launch(answerModel, summaryInfo);
                        return answerModel;
                    }, function(response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        return $q.reject(response.data);
                    })
                    .finally(function() {
                        loadingIndicator.hide();
                    });
            }, function(e) {
                logger.error('error getting leaf level data', e);
                loadingIndicator.hide();
            }
        );
}
