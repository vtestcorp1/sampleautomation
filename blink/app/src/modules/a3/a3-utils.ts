/**
 * Copyright: ThoughtSpot Inc. 2017
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview A3 utils.
 */

import {ngRequire} from '../../base/decorators';

let strings = ngRequire('strings');
let util = ngRequire('util');

export enum A3AnalysisType {
    UNKNOWN = 1,
    VISUALIZATION,
    DATA,
    TABLE
}

export function getACContext(a3Request) {
    let visualizationQuery;
    switch (a3Request.getType()) {
        case tsProto.sage.A3AnalysisType.E.VISUALIZATION: {
            let visualizationAnalysis = a3Request.getVisualizationAnalysis();
            visualizationQuery = visualizationAnalysis.getVisualizationQuery();
            break;
        }
        case tsProto.sage.A3AnalysisType.E.DATA: {
            let dataAnalysis = a3Request.getDataAnalysis();
            visualizationQuery = dataAnalysis.getVisualizationQuery();
            break;
        }
        case tsProto.sage.A3AnalysisType.E.TABLE: {
            return null;
        }
    }
    return visualizationQuery.getContext();
}

export function getSelectedTokens(a3Request) : any[] {
    let selectedTokens = [];
    switch (a3Request.getType()) {
        case tsProto.sage.A3AnalysisType.E.VISUALIZATION:
        {
            let visualizationAnalysis = a3Request.getVisualizationAnalysis();
            selectedTokens = visualizationAnalysis.getSelectedToken();
            break;
        }
        case tsProto.sage.A3AnalysisType.E.DATA:
        {
            let dataAnalysis = a3Request.getDataAnalysis();
            selectedTokens = dataAnalysis.getSelectedToken();
            break;
        }
        case tsProto.sage.A3AnalysisType.E.TABLE:
        {
            let tableAnalysis = a3Request.getTableAnalysis();
            selectedTokens = tableAnalysis.getSelectedColumn();
            break;
        }
    }

    return selectedTokens;
}

export function getExcludedTokens(a3Request) : any[] {
    let excludedTokens = [];
    switch (a3Request.getType()) {
        case tsProto.sage.A3AnalysisType.E.VISUALIZATION:
        {
            let visualizationAnalysis = a3Request.getVisualizationAnalysis();
            excludedTokens = visualizationAnalysis.getExcludedToken();
            break;
        }
        case tsProto.sage.A3AnalysisType.E.DATA:
        {
            let dataAnalysis = a3Request.getDataAnalysis();
            excludedTokens = dataAnalysis.getExcludedToken();
            break;
        }
        case tsProto.sage.A3AnalysisType.E.TABLE:
        {
            let tableAnalysis = a3Request.getTableAnalysis();
            excludedTokens = tableAnalysis.getExcludedColumn();
            break;
        }
    }

    return excludedTokens;
}

export function isSingleRowDataAnalysis(a3Request) : boolean {
    if (a3Request.getType() === tsProto.sage.A3AnalysisType.E.DATA) {
        let dataAnalysis = a3Request.getDataAnalysis();
        let dataRows = dataAnalysis.getDataRow();
        if (dataRows.length === 1) {
            return true;
        }
    }
    return false;
}

export function getAnalysisType(a3Request) : A3AnalysisType {
    if (a3Request.getType() === tsProto.sage.A3AnalysisType.E.VISUALIZATION ||
        isSingleRowDataAnalysis(a3Request)) {
        return A3AnalysisType.VISUALIZATION;
    } else if (a3Request.getType() === tsProto.sage.A3AnalysisType.E.DATA) {
        return A3AnalysisType.DATA;
    } else if (a3Request.getType() === tsProto.sage.A3AnalysisType.E.TABLE) {
        return A3AnalysisType.TABLE;
    }

    return A3AnalysisType.UNKNOWN;
}

export function isDiffAnalysis(a3Request) : boolean {
    return A3AnalysisType.DATA === getAnalysisType(a3Request);
}

export function isVizAnalysis(a3Request) : boolean {
    return A3AnalysisType.VISUALIZATION === getAnalysisType(a3Request);
}

export function isTableAnalysis(a3Request) : boolean {
    return A3AnalysisType.TABLE === getAnalysisType(a3Request);
}

export function getA3RequestTitle(a3Request) : string {
    let title = '';
    switch (a3Request.getType()) {
        case tsProto.sage.A3AnalysisType.E.VISUALIZATION: {
            let visualizationAnalysis = a3Request.getVisualizationAnalysis();
            let visualizationQuery = visualizationAnalysis.getVisualizationQuery();
            let visualization = visualizationQuery.getVisualization();
            let vizTitle = visualization.getTitle();
            if (!vizTitle || vizTitle.length === 0) {
                vizTitle = strings.a3.visualizationAnalysisType;
            }
            title = strings.a3.visualizationAnalysisTitle.assign(vizTitle);
            break;
        }
        case tsProto.sage.A3AnalysisType.E.DATA: {
            let dataAnalysis = a3Request.getDataAnalysis();
            let visualizationQuery = dataAnalysis.getVisualizationQuery();
            let visualization = visualizationQuery.getVisualization();
            let dataRows = dataAnalysis.getDataRow();
            let dataRowStrings = dataRows.map((dataRow) => {
                let dataValues = dataRow.getDataValue();
                return dataValues
                    .map((dataValue) => {
                        return util.queryConstantValue(dataValue);
                    })
                    .join(', ');
            });
            let dataString = dataRowStrings.join(' and ');
            let vizTitle = visualization.getTitle();
            if (!vizTitle || vizTitle.length === 0) {
                vizTitle = strings.a3.dataAnalysisType;
            }
            title = strings.a3.dataAnalysisTitle.assign(
                vizTitle,
                dataString
            );
            break;
        }
        case tsProto.sage.A3AnalysisType.E.TABLE: {
            let tableAnalysis = a3Request.getTableAnalysis();
            let tableName = tableAnalysis.getTableName();
            let tableType = tableAnalysis.getIsWorksheet() ? 'worksheet' : 'table';
            if (!tableName) {
                tableName = strings.a3.tableAnalysisType;
            }
            title = strings.a3.tableAnalysisTitle.assign(
                tableType,
                tableName
            );
            break;
        }
    }
    return title;
}

export function getTokenName(token) {
    let tokenText = token.getTokenText(),
        immediateLineage = token.getImmediateLineage();
    let displayString = `${ tokenText } ${ immediateLineage }`;
    return displayString;
}
