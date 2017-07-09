/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This provides utils to share across different search pages.
 */

import IPromise = angular.IPromise;
import {ngRequire, Provide} from 'src/base/decorators';
import {blinkConstants} from '../../base/blink-constants';
import IQService = angular.IQService;

let $q : IQService = ngRequire('$q');
let alertService = ngRequire('alertService');
let answerRestorationDataStore = ngRequire('answerRestorationDataStore');
let answerService = ngRequire('answerService');
let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let documentService = ngRequire('documentService');
let env = ngRequire('env');
let jsonConstants = ngRequire('jsonConstants');
let sessionService = ngRequire('sessionService');
let UserAction = ngRequire('UserAction');
let util = ngRequire('util');

Provide('searchPageUtils')({
    decideAnswerDisplayMode,
    saveAnswer
});

export function getAnswer(context, index, requestType) : IPromise<any> {
    var questionParams = {};
    questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;
    questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = index;

    var userAction = new UserAction(UserAction.FETCH_ANSWER);
    let params = {
        requestType: requestType
    };
    return answerService.getAnswer(questionParams, params)
        .then(function(response) {
            return response.data;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
}

export function getSageContextHash(answerModel: any) : string {
    if (!answerModel) {
        return '';
    }
    let questionInfo = answerModel.getQuestionInfo();
    let context = questionInfo[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
    let contextIndex = questionInfo[jsonConstants.SAGE_CONTEXT_INDEX_KEY];
    let table = context.getTables()[contextIndex];
    let tableHash = table.getHashKey();
    return tableHash;
}


function answerModelContainsChartWithDefaultConfig (answerModel: any): boolean {
    if (!answerModel) {
        return false;
    }

    let answerSheet = answerModel.getCurrentAnswerSheet();
    let chartVisualizations: Array<any> = answerSheet.getChartVisualizations();

    return chartVisualizations.length === 1
        && chartVisualizations[0].defaultConfigExistsForAnswer();
}

export function decideAnswerDisplayMode (answerModel: any) : string {
    if (env.answerDisplayMode && Object.keys(util.answerDisplayModes).any(env.answerDisplayMode)) {
        return util.answerDisplayModes[env.answerDisplayMode];
    }

    if (!answerModel) {
        return util.answerDisplayModes.CHART;
    }

    // NOTE:
    // - User preference maps to the last user selection in the viz selection panel.
    // - User preference can be overridden in the case of saved answer where even
    // if user preference is table and
    // an answer is saved as chart, we want to show chart.
    // - Last qualifier here is for chart display mode to ensure that the answer contains a chart.
    // - We default to chart and keep updating from lower to higher preference signal.
    let candidateDisplayMode = util.answerDisplayModes.CHART;
    let isAnswerDisplayModePreferenceDisabled =
        sessionService.isAnswerDisplayModePreferenceDisabled();
    // Get user preference from the user state.

    if (!isAnswerDisplayModePreferenceDisabled) {
        let userPreference = sessionService.getPreference(
            blinkConstants.ANSWER_DISPLAY_MODE_PREFERENCE_KEY
        );
        if (!!userPreference) {
            candidateDisplayMode = userPreference;
        }
    }

    // Preference returned by the answer sheet takes higher priority to handle saved answers.
    var answerSheet = answerModel.getCurrentAnswerSheet();
    var vizSelectionState = answerSheet.getVizSelectionAnswerMode();

    if (!!vizSelectionState) {
        candidateDisplayMode = vizSelectionState;
    }

    var tableHash = answerModel.getCurrentQueryHashKey();
    if (!!tableHash) {
        var restoredDisplayMode = answerRestorationDataStore.getVizTypeForTableHash(tableHash);

        if (!!restoredDisplayMode) {
            candidateDisplayMode = restoredDisplayMode;
        }
    }

    // There is a mandatory condition for chart type that there should be a
    // possible chart which is checked here.
    var containsChart = answerModelContainsChartWithDefaultConfig(answerModel);
    if (candidateDisplayMode === util.answerDisplayModes.CHART && containsChart) {
        return util.answerDisplayModes.CHART;
    } else {
        return util.answerDisplayModes.TABLE;
    }
}

export function saveAnswer(
    answerModel: any
) : IPromise<any> {
    let userAction = new UserAction(UserAction.SAVE_ANSWER_MODEL);

    return documentService.saveModel(answerModel)
        .then((response) => {
            let substitutions = [answerModel.getName()];
            alertService.showUserActionSuccessAlert(
                userAction,
                response,
                {substitutions: substitutions}
            );
            return response.data;
        }, (response) => {
            var substitutions = [answerModel.getName()];
            alertService.showUserActionFailureAlert(
                userAction,
                response,
                {substitutions: substitutions}
            );
            return $q.reject(response.data);
        });
}

export function saveAnswerAs(
    answerModel: any,
    name: string,
    description: string
) : IPromise<any> {
    var userAction = new UserAction(UserAction.SAVE_AS_ANSWER_MODEL);
    return documentService.saveAsModel(answerModel, name, description)
        .then((response) => {
            var substitutions = [answerModel.getName()];
            alertService.showUserActionSuccessAlert(
                userAction,
                response,
                {substitutions: substitutions}
            );
            return response.data;
        }, (response) => {
            var substitutions = [answerModel.getName()];
            alertService.showUserActionFailureAlert(
                userAction,
                response,
                {substitutions: substitutions}
            );
            return $q.reject(response.data);
        });
}

export function getShareDialogConfig(answerModel: any) {
    let shareDialogConfig = {
        objects: [{
            id: answerModel.getId(),
            name: answerModel.getName(),
            authorId: answerModel.getAuthorId()
        }],
        type: jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
        subtype: answerModel.getMetadataSubType()
    };
    return shareDialogConfig;
}

export function getCurrentChartType(answerModel) : string {
    let chartType;
    if (!answerModel) {
        return '';
    }
    let answerSheet = answerModel.getCurrentAnswerSheet();
    let charts = answerSheet.getChartVisualizations();
    let chart = charts[0];
    if(!chart) {
        return;
    } else {
        chartType = chart.getChartType();
        let validChartTypes = chart.getValidChartTypes();
        if (!chartType) {
            if (validChartTypes) {
                return validChartTypes[0];
            }
        } else {
            return chartType;
        }
    }
}

export function getCurrentChartImagePath(answerModel) : string {
    let path = '/resources/img/viz-selector-icons/chart-icons/{1}_icon_24.svg';
    let chartType = getCurrentChartType(answerModel);
    if (!chartType) {
        let defaultChartType = chartTypeSpecificationService.chartTypes.COLUMN.toLowerCase();
        return path.assign(defaultChartType);
    } else {
        chartType = chartType.toLowerCase();
        return path.assign(chartType);
    }
}
