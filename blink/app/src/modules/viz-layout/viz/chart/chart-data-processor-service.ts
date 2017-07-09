/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service to process Data for the chart.
 */

import {ngRequire} from 'src/base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {PivotDataModel} from '../pivot/pivot-data-model';
import {HighchartDataModel} from './highcharts/highchart-data-model';
import {NetworkChartDataModel} from './networks/network-chart-data-model';

export {
    computeMetaDataInformation,
    getDataModel
};

let blinkStatisticsLibrary = ngRequire('blinkStatisticsLibrary');
let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let Logger = ngRequire('Logger');
let _logger;

function computeMetaDataInformation(chartModel) : any {
    _logger = Logger.create('chart-data-processor');
    var colCardinality = {};
    var timeSeriesColumns = chartModel.getTimeSeriesColumns(),
        chartedAsAttributeColumns = chartModel.getAttributeColumns().subtract(timeSeriesColumns);

    chartedAsAttributeColumns.each(function(col) {
        var colId = col.getSageOutputColumnId();
        colCardinality[colId] = col.getUniqueCount() || -1;
    });

    if (chartModel.hasNoData()) {
        return {
            colCardinality: colCardinality
        };
    }

    var definition = chartModel.getJson(),
        measureColumns = [],
        attributeColumns = [],
        dataRowIndex = 0;

    [definition.series, definition.categories, definition.values].each(function(bucket){
        if (!bucket || !bucket.columns || !bucket.columns.length) {
            return;
        }

        bucket.columns.each(function(columnJson){
            if (!columnJson || !Object.keys(columnJson).length) {
                return false;
            }
            var idx = dataRowIndex++;
            var column =
                new VisualizationColumnModel(columnJson, idx, chartModel.getColumnData(idx));

            if (column.isEffectivelyNumeric()) {
                measureColumns.push(column);
            } else {
                attributeColumns.push(column);
            }
        });
    });

    var columnIdToMin = {},
        columnIdToMax = {},
        columnIdToUniques = {},
        dataRowIndexToAttributeColId = {},
        dataRowIndexToMeasureColId = {},
        measureColIdToVarianceCalculator = {};

    attributeColumns.each(function(col){
        var colId = col.getSageOutputColumnId(),
            dataRowIndex = col.getDataRowIndex();

        dataRowIndexToAttributeColId[dataRowIndex] = colId;
        columnIdToUniques[colId] = {};
    });
    measureColumns.each(function(col){
        var colId = col.getSageOutputColumnId(),
            dataRowIndex = col.getDataRowIndex();

        columnIdToUniques[colId] = {};

        columnIdToMin[colId] = Number.POSITIVE_INFINITY;
        columnIdToMax[colId] = Number.NEGATIVE_INFINITY;

        dataRowIndexToMeasureColId[dataRowIndex] = colId;

        measureColIdToVarianceCalculator[colId] = new blinkStatisticsLibrary.VarianceCalculator();
    });

    var attributeDataRowIndices = Object.keys(dataRowIndexToAttributeColId),
        measureDataRowIndices = Object.keys(dataRowIndexToMeasureColId);

    var chartData = chartModel.getDataArray()[0].getData();

    var i = chartData.length;
    while (i--) {
        var dataRow = chartData[i],
            dataRowLength = dataRow.length;

        var value, colId, colUniques;

        var j = attributeDataRowIndices.length;
        while (j--) {
            dataRowIndex = Number(attributeDataRowIndices[j]);
            if (dataRowIndex < dataRowLength) {
                value = dataRow[dataRowIndex];
                colId = dataRowIndexToAttributeColId[dataRowIndex];

                colUniques = columnIdToUniques[colId];
                if (!colUniques.hasOwnProperty(value)) {
                    colUniques[value] = 1;
                }
            }
        }

        j = measureDataRowIndices.length;
        while (j--) {
            dataRowIndex = Number(measureDataRowIndices[j]);
            if (dataRowIndex < dataRowLength) {
                value = dataRow[dataRowIndex];
                if (!isNaN(value)) {
                    colId = dataRowIndexToMeasureColId[dataRowIndex];
                    // update min/max for the column
                    columnIdToMin[colId] = Math.min(value, columnIdToMin[colId]);
                    columnIdToMax[colId] = Math.max(value, columnIdToMax[colId]);

                    measureColIdToVarianceCalculator[colId].add(value);
                }

                // for measures we include NaN values in uniques as well since at this point we
                // don't have the information about whether a given measure column can allow nulls.
                // this is because whether a column allows nulls can depend on the axis it is on
                // (which is not decided yet). We err on the side of over counting cardinality.
                colUniques = columnIdToUniques[colId];
                if (!colUniques.hasOwnProperty(value)) {
                    colUniques[value] = 1;
                }
            }
        }
    }

    return {
        columnIdToMin: columnIdToMin,
        columnIdToMax: columnIdToMax,
        columnIdToUniques: columnIdToUniques,
        colCardinality: colCardinality,
        dataRowIndexToAttributeColId: dataRowIndexToAttributeColId,
        dataRowIndexToMeasureColId: dataRowIndexToMeasureColId
    };
}

function getChartProviderToDataModel() : {[key:string]: {new(...args: any[])}} {
    return {
        [chartTypeSpecificationService.chartProviders.HIGHCHART] : HighchartDataModel,
        [chartTypeSpecificationService.chartProviders.GEO_MAP] : HighchartDataModel,
        [chartTypeSpecificationService.chartProviders.GEO_EARTH]: HighchartDataModel,
        [chartTypeSpecificationService.chartProviders.PIVOT_TABLE] : PivotDataModel,
        [chartTypeSpecificationService.chartProviders.NETWORK] : NetworkChartDataModel
    };
}

function getDataModel(chartModel) {
    var chartType = chartModel.getChartType();
    var chartProvider = chartTypeSpecificationService.getChartProvider(chartType);
    let chartProviderToDataModel = getChartProviderToDataModel();
    return new chartProviderToDataModel[chartProvider](chartModel);
}
