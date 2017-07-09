/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Add aggregated worksheet related utilities here. Saving, Updating,
 * Sanitization etc.
 */

import {ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import IPromise = angular.IPromise;
import IQService = angular.IQService;
import {RequestTypes} from '../../../base/proto/callosum-types';

let $q : IQService = ngRequire('$q');
//let alertConstants = ngRequire('alertConstants');
let alertService = ngRequire('alertService');
let answerService = ngRequire('answerService');
let autoCompleteService = ngRequire('autoCompleteService');
let dependencyDialogService = ngRequire('dependencyDialogService');
let dependencyService = ngRequire('dependencyService');
let jsonConstants = ngRequire('jsonConstants');
let navService = ngRequire('navService');
let UserAction = ngRequire('UserAction');
let util = ngRequire('util');
let worksheetService = ngRequire('worksheetService');

export function saveAnswerAsWorksheet(
    answerModel,
    worksheetName: string,
    worksheetDescription: string
) : IPromise<any> {
    let createTempAnswer = getTempAnswerCreator(answerModel);
    let createWorksheet = getWorksheetCreator(worksheetName, worksheetDescription);
    return autoCompleteService.refreshGuids(answerModel.getSageContext())
        .then(createTempAnswer, onRefreshGuidsFailure)
        .then(createWorksheet)
        .then(navigateToAggregatedWorksheet);
}

export function updateWorksheetFromAnswer(
    originalAnswerModel,
    newAnswerModel
) : IPromise<any> {
    let dependencyValidator = getDependencyValidator(originalAnswerModel, newAnswerModel);
    let aggrWorksheetUpdator = getAggrWorksheetUpdator(newAnswerModel);

    return dependencyValidator()
        .then(aggrWorksheetUpdator);
}

function onRefreshGuidsFailure(
    response
) : IPromise<any> {
    let userAction = new UserAction(UserAction.REFRESH_CONTEXT_GUIDS);
    alertService.showUserActionSuccessAlert(
        userAction,
        response
    );
    return $q.reject();
}

function getTempAnswerCreator(
    aggregatedWSModel
) : (sageResponse: any) => IPromise<any> {
    return (sageResponse) => {
        let refreshGuidResponse = sageResponse.answerResponse;
        let questionParams = {};
        questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = refreshGuidResponse.getContext();
        questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] =
            aggregatedWSModel.getSageContextIndex();

        let userAction = new UserAction(UserAction.FETCH_ANSWER);
        return answerService.getAnswer(
            questionParams,
            {
                requestType: RequestTypes.ANSWER_AGGREGATED_WORKSHEET_SAVE
            }
        )
            .then(function(response) {
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
    };
}

function getWorksheetCreator(
    worksheetName: string,
    worksheetDescription: string
) : (answerModel) => IPromise<any> {
    return (answerModel) => {
        let userAction = new UserAction(UserAction.CREATE_AGGR_WORKSHEET);
        return worksheetService.createAggregatedWorksheet(
            answerModel,
            worksheetName,
            { description: worksheetDescription }
        )
            .then(function(response) {
                let substitutions = [worksheetName];

                alertService.showUserActionSuccessAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                return response.data;
            }, function(response) {
                let substitutions = [worksheetName];

                alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                return $q.reject(response.data);
            });
    };
}

function navigateToAggregatedWorksheet(
    worksheetTableJson
) {
    let documentId = worksheetTableJson.tableMetadata.header.id;
    navService.goToAggregatedWS(documentId);
}

function getDependencyValidator(
    originalAnswerModel,
    newAnswerModel
) : () => IPromise<any> {
    return function () {
        let newWSColumns = newAnswerModel.getTableColumns();
        let newColumnsMap = util.mapArrayToHash(newWSColumns, function(column) {
            return column.getSageOutputColumnId();
        });
        let oldWSColumns = originalAnswerModel.getTableColumns();

        let deletedColumns = oldWSColumns.filter(function(oldColumn) {
            return !newColumnsMap[oldColumn.getSageOutputColumnId()];
        });
        let deletedOutputGuids = deletedColumns.map(function(column) {
            return column.getSageOutputColumnId();
        });

        let userAction = new UserAction(UserAction.FETCH_COLUMN_DEPENDENTS);

        return dependencyService.getUniqueNonDeletedColumnDependents(deletedOutputGuids)
            .then((response) => {
                let dependents = response.data;
                if (dependents.length > 0) {
                    let title = strings.alert.dataDeletionAlertMessages.cannotDelete;
                    let singular = deletedColumns.length === 1;
                    let messages = strings.alert.dataDeletionAlertMessages.withDependents;
                    let message = singular
                        ? messages.singular.assign({itemName: deletedColumns[0].getName()})
                        : messages.plural.assign({itemType: strings.COLUMN});

                    dependencyDialogService.showDependencyDialog(title, message, dependents);
                }
                return;
            }, (response) => {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
    };
}

function getAggrWorksheetUpdator(
    answerModel
) : () => IPromise<any> {
    return function () {
        let userAction = new UserAction(UserAction.UPDATE_AGGR_WORKSHEET);
        return worksheetService.updateAggregateWorksheet(
            answerModel,
            answerModel.getName(),
            { description: answerModel.getDescription() }
        )
            .then((response) => {
                let worksheetTableJson = response.data;

                let substitutions = [answerModel.getName()];
                alertService.showUserActionSuccessAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );

                return worksheetTableJson;
            }, (response) => {
                let substitutions = [answerModel.getName()];
                alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                return $q.reject(response.data);
            });
    };
}
