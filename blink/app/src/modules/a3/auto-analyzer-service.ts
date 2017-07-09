/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides a service that allows blink app to trigger auto analysis of
 * visualizations.
 */


'use strict';

import {IPromise} from 'angular';
import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire, Provide} from 'src/base/decorators';
import {VisualizationColumnModel} from '../callosum/model/visualization-column';
import {VisualizationModel} from '../viz-layout/viz/visualization-model';
import {getA3DataAnalysisRequest, getA3VisualizationAnalysisRequest} from './a3-request-generator';

declare var tsProto: any;
declare var sage: any;

let a3Service = ngRequire('a3Service');
let alertService = ngRequire('alertService');
let Logger = ngRequire('Logger');
let navService = ngRequire('navService');

let logger;

Provide('autoAnalyzerService')({
    triggerVisualizationAnalysis,
    triggerDataAnalysis
});

export function triggerA3Analyis(a3AnalysisRequest) {
    a3Service.triggerA3Analysis(a3AnalysisRequest).then(
        handleVisualizationAnalysisSuccess,
        handleVisualizationAnalysisFailure
    );
}

export function triggerVisualizationAnalysis (
    visualizationModel: VisualizationModel,
    selectedTokens?: Array<any>
) : IPromise<any> {
    if (!logger) {
        logger = Logger.create('auto-analyzer-service');
    }

    var request = getA3VisualizationAnalysisRequest(
        visualizationModel,
        selectedTokens
    );

    alertService.showAlert({
        message: blinkConstants.a3.TRIGGER_MESSAGE,
        type: alertService.alertConstants.type.SUCCESS
    });

    return a3Service.triggerA3Analysis(request)
        .then(
            handleVisualizationAnalysisSuccess,
            handleVisualizationAnalysisFailure
        );
}

export function triggerDataAnalysis (
    vizModel: VisualizationModel,
    vizColumns: Array<VisualizationColumnModel>,
    selectedData: Array<any>,
    selectedTokens?: Array<any>
) : IPromise<any> {

    if (!logger) {
        logger = Logger.create('auto-analyzer-service');
    }

    var request = getA3DataAnalysisRequest(
        vizModel,
        vizColumns,
        selectedData,
        selectedTokens
    );

    alertService.showAlert({
        message: blinkConstants.a3.TRIGGER_MESSAGE,
        type: alertService.alertConstants.type.SUCCESS
    });

    return a3Service.triggerA3Analysis(request)
        .then(
            handleVisualizationAnalysisSuccess,
            handleVisualizationAnalysisFailure
        );
}

function handleVisualizationAnalysisSuccess(response: any) {
    var status = sage.deserialize(response.status, sage.common.StatusProto);
    if (!!status.code && status.code !== 0 ) {
        alertService.showAlert({
            message: blinkConstants.a3.ANALYSIS_ACCEPTED + ' ' + status.message,
            type: alertService.alertConstants.type.SUCCESS,
        });
        return;
    }

    alertService.showAlert({
        message: blinkConstants.a3.ANALYSIS_ACCEPTED,
        type: alertService.alertConstants.type.SUCCESS,
        action: {
            message: blinkConstants.a3.OPEN_ANALYSES,
            link: navService.getInsightsPath('analyses'),
        }
    });
}

function handleVisualizationAnalysisFailure(error: any) {
    if (!logger) {
        logger = Logger.create('auto-analyzer-service');
    }
    logger.error('A3 visualization analysis request failed.', error);
    alertService.showAlert({
        message: blinkConstants.a3.ANALYSIS_FAILED,
        type: alertService.alertConstants.type.ERROR
    });
}
