/**
 * Copyright: ThoughtSpot Inc. 2015
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service to generate a3 visualization analysis request.
 */

'use strict';
import {ngRequire, Provide} from '../../base/decorators';
import {getUserGuid} from '../callosum/service/session-service';

declare let tsProto;
declare let thrift;
declare let sage;
let sageUtil = ngRequire('sageUtil');

Provide('a3RequestGenerator')({
    getA3VisualizationAnalysisRequest,
    getA3DataAnalysisRequest,
    getA3TableAnalysisRequest
});


function getVisualization(vizModel) {
    var visualization = new tsProto.callosum.VisualizationProto();
    visualization.setType(
        tsProto.callosum.VisualizationProto.VisualizationTypeEnumProto.TABLE);
    let insightPinboardTitle = getVisualizationTitle(vizModel);
    visualization.setTitle(insightPinboardTitle);
    return visualization;
}

/**
 * Get the Visualization title. This title is used in a3 pinboard name.
 * So it must not be empty.
 *
 * @param vizModel
 * @return {any}
 */
function getVisualizationTitle(vizModel) {
    // Use the visualization title as it represents the user set value.
    let title = vizModel.getTitle();

    // get original query tokens. this is second best option as this
    // helps in understanding which query is being analysed.
    if (title === '') {
        title = getOriginalQuery(vizModel);
    }

    // fall back logic: if that is empty, use the underlying sage question text.
    if (title === '') {
        title = vizModel.getQuestionText();
    }

    // if it is still empty fill with unknown title.
    if (!title || title === '') {
        title = 'Unknown title';
    }
    return title;
}

function getOriginalQuery(vizModel) {
    var questionModel = vizModel.getQuestion();
    var sageContext = questionModel.getContext();
    var sageContextIndex = questionModel.getContextIndex();
    var tables = sageContext.getTables();
    var table = tables[sageContextIndex];
    var tokens = table.getTokens();
    return sageUtil.tokensToQuery(tokens);
}

function getVisualizationQuery(vizModel) {
    var visualizationQuery = new tsProto.callosum.VisualizationQueryProto();
    var questionModel = vizModel.getQuestion();
    var sageContext = questionModel.getContext();
    var sageContextIndex = questionModel.getContextIndex();
    var tables = sageContext.getTables();
    var table = tables[sageContextIndex];
    var query = table.getQuery();
    visualizationQuery.setSageProgram(query);
    var visualization = getVisualization(vizModel);
    visualizationQuery.setVisualization(visualization);
    visualizationQuery.setContext(sageContext);
    visualizationQuery.setTableIndex(sageContextIndex);
    return visualizationQuery;
}

export function getA3DataAnalysisRequest (
    vizModel,
    visualizationColumns,
    data,
    selectedTokens) {
    var a3Request = new tsProto.sage.A3Request();
    var dataAnalysisRequest = new tsProto.sage.DataAnalysisRequest();
    var visualizationQuery = getVisualizationQuery(vizModel);

    dataAnalysisRequest.setVisualizationQuery(visualizationQuery);
    dataAnalysisRequest.setUserGuid(getUserGuid());

    var sageColumnIdsForVisualizationColumns = visualizationColumns.map(function (vizCol) {
        return vizCol.getSageOutputColumnId();
    });

    Array.prototype.push.apply(
        dataAnalysisRequest.getSageOutputColumnId(),
        sageColumnIdsForVisualizationColumns
    );

    let dataRows = [];
    if (data.length > 2) {
        dataRows.push(data[0]);
        dataRows.push(data[data.length - 1]);
    } else {
        dataRows = data;
    }

    Array.prototype.push.apply(
        dataAnalysisRequest.getDataRow(),
        dataRows
    );
    if (!!selectedTokens && selectedTokens.length > 0) {
        Array.prototype.push.apply(
            dataAnalysisRequest.getSelectedToken(),
            selectedTokens
        );
    }
    a3Request.setDataAnalysis(dataAnalysisRequest);
    a3Request.setType(tsProto.sage.A3AnalysisType.E.DATA);

    return a3Request;
}

export function getA3VisualizationAnalysisRequest (vizModel, selectedTokens) {
    var a3Request = new tsProto.sage.A3Request();
    var visualizationAnalysisRequest = new tsProto.sage.VisualizationAnalysisRequest();
    var visualizationQuery = getVisualizationQuery(vizModel);

    visualizationAnalysisRequest.setVisualizationQuery(visualizationQuery);
    visualizationAnalysisRequest.setUserGuid(getUserGuid());

    if (!!selectedTokens && selectedTokens.length > 0) {
        Array.prototype.push.apply(
            visualizationAnalysisRequest.getSelectedToken(),
            selectedTokens
        );
    }

    a3Request.setVisualizationAnalysis(visualizationAnalysisRequest);
    a3Request.setType(tsProto.sage.A3AnalysisType.E.VISUALIZATION);

    return a3Request;
}

export function getA3TableAnalysisRequest (tableGuid: string,
                                           tableName: string,
                                           isWorksheet: boolean,
                                           selectedColumns: string[]) {
    let a3Request = new tsProto.sage.A3Request();
    let tableAnalysisRequest = new tsProto.sage.TableAnalysisRequest();

    tableAnalysisRequest.setTableGuid(tableGuid);
    tableAnalysisRequest.setTableName(tableName);
    tableAnalysisRequest.setIsWorksheet(isWorksheet);
    tableAnalysisRequest.setUserGuid(getUserGuid());

    if (!!selectedColumns && selectedColumns.length > 0) {
        Array.prototype.push.apply(
            tableAnalysisRequest.getSelectedColumn(),
            selectedColumns
        );
    }

    a3Request.setTableAnalysis(tableAnalysisRequest);
    a3Request.setType(tsProto.sage.A3AnalysisType.E.TABLE);

    return a3Request;
}

export function customizeA3Request(a3Request, selectedTokens, excludedTokens) {
    switch (a3Request.getType()) {
        case tsProto.sage.A3AnalysisType.E.VISUALIZATION:
        {
            let visualizationAnalysis = a3Request.getVisualizationAnalysis();
            Array.prototype.push.apply(
                visualizationAnalysis.getSelectedToken(),
                selectedTokens
            );
            Array.prototype.push.apply(
                visualizationAnalysis.getExcludedToken(),
                excludedTokens
            );
            break;
        }
        case tsProto.sage.A3AnalysisType.E.DATA:
        {
            let dataAnalysis = a3Request.getDataAnalysis();
            Array.prototype.push.apply(
                dataAnalysis.getSelectedToken(),
                selectedTokens
            );
            Array.prototype.push.apply(
                dataAnalysis.getExcludedToken(),
                excludedTokens
            );
            break;
        }
        case tsProto.sage.A3AnalysisType.E.TABLE:
        {
            let tableAnalysis = a3Request.getTableAnalysis();
            Array.prototype.push.apply(
                tableAnalysis.getSelectedColumn(),
                selectedTokens
            );
            Array.prototype.push.apply(
                tableAnalysis.getExcludedColumn(),
                excludedTokens
            );
            break;
        }
    }
}


