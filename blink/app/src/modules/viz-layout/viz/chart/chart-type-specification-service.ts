/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com),
 *         Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Provides a service that chart type instances
 * which implements overrides specific to the chart type.
 */

'use strict';

import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';
import {strings} from 'src/base/strings';
import {jsonConstants} from 'src/modules/viz-layout/answer/json-constants';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {isA3Enabled} from '../../../callosum/service/session-service';
import {validateAxisColumns} from './axis-column-validation-service';
import {ChartAxisConfig} from './chart-axis-config';
import {ChartModel} from './chart-model';
import {ChartQueryDefinition} from './chart-query-definition';
import {ChartThemeService} from './chart-theme-service';

let dateUtil = ngRequire('dateUtil');
let util = ngRequire('util');
let Logger = ngRequire('Logger');
let ConfigOptions = ngRequire('ConfigOptions');
let chartUtilService = ngRequire('chartUtilService');

let _logger: any;
declare let addBooleanFlag, flags, angular, moment;

/* global addBooleanFlag */
addBooleanFlag('enableWebGLMaps', 'Enables option of WebGL geo maps.', false);

/* global addBooleanFlag */
addBooleanFlag('enableTestCharts', 'Enables charts that are under development.', false);


interface QueryConfigItem {
    columns: any[];
}

interface QueryConfig {
    categories : QueryConfigItem;
    values: QueryConfigItem;
    series?: any[];
    hiddenColumns: any[];
}



let chartSpecificConstants = {
    MAX_LABEL_LENGTH_PIE: 30,
    LEGEND_CARDINALITY_THRESHOLD: 40,
    PIECHART_CARDINALITY_THRESHOLD: 50,
    TREEMAP_CARDINALITY_THRESHOLD: 100,
    PIE_INNERSIZE_SINGLECHART: '60%',
    PIE_INNERSIZE_DOUBLECHART: '40%',
    PIE_OUTERSIZE: '70%',
    SANKEY_CHART_CARDINALITY_THRESHOLD: 100,
    SPIDER_WEB_CHART_CARDINALITY_THRESHOLD: 30
};

function init() {
    _logger = Logger.create('chartTypeSpecificationService');
}


function tryAddingLegendColumn(legendColumns, columnCardinality, columnToAdd) {
    let cardinalityForColumnToAdd =
        columnCardinality[columnToAdd.getSageOutputColumnId()];
    if (!cardinalityForColumnToAdd) {
        return;
    }
    let currentCardinality = legendColumns.reduce(function (cardinality, column) {
        return cardinality * columnCardinality[column.getSageOutputColumnId()];
    }, 1);
    if (currentCardinality * cardinalityForColumnToAdd
        < chartSpecificConstants.LEGEND_CARDINALITY_THRESHOLD) {
        legendColumns.push(columnToAdd);
    }
}

function tryAddingLegendColumnsFromSet(legendColumns, columnCardinality, columnsToAdd) {
    columnsToAdd.forEach(function (column) {
        tryAddingLegendColumn(
            legendColumns,
            columnCardinality,
            column
        );
    });
}

let chartTypes = {
    BAR: 'BAR',
    COLUMN: 'COLUMN',
    STACKED_COLUMN: 'STACKED_COLUMN',
    PARETO: 'PARETO',
    LINE: 'LINE',
    AREA: 'AREA',
    SCATTER: 'SCATTER',
    BUBBLE: 'BUBBLE',
    PIE: 'PIE',
    GEO_AREA: 'GEO_AREA',
    GEO_BUBBLE: 'GEO_BUBBLE',
    GEO_HEATMAP: 'GEO_HEATMAP',
    GEO_EARTH_AREA: 'GEO_EARTH_AREA',
    GEO_EARTH_BUBBLE: 'GEO_EARTH_BUBBLE',
    GEO_EARTH_BAR: 'GEO_EARTH_BAR',
    GEO_EARTH_HEATMAP: 'GEO_EARTH_HEATMAP',
    GEO_EARTH_GRAPH: 'GEO_EARTH_GRAPH',
    WATERFALL: 'WATERFALL',
    TREEMAP: 'TREEMAP',
    HEATMAP: 'HEATMAP',
    STACKED_AREA: 'STACKED_AREA',
    LINE_COLUMN: 'LINE_COLUMN',
    FUNNEL: 'FUNNEL',
    PIVOT_TABLE: 'PIVOT_TABLE',
    LINE_STACKED_COLUMN: 'LINE_STACKED_COLUMN',
    SPIDER_WEB: 'SPIDER_WEB',
    SANKEY_CHART: 'SANKEY_CHART'
};

let chartProviders = {
    HIGHCHART: 'highchart',
    GEO_MAP: 'geomap',
    GEO_EARTH: 'geoearth',
    PIVOT_TABLE: 'pivot_table',
    NETWORK: 'network'
};

let chartTypeByProvider = {
    BAR: chartProviders.HIGHCHART,
    COLUMN: chartProviders.HIGHCHART,
    STACKED_COLUMN: chartProviders.HIGHCHART,
    PARETO: chartProviders.HIGHCHART,
    LINE: chartProviders.HIGHCHART,
    AREA: chartProviders.HIGHCHART,
    SCATTER: chartProviders.HIGHCHART,
    BUBBLE: chartProviders.HIGHCHART,
    PIE: chartProviders.HIGHCHART,
    GEO_AREA: chartProviders.GEO_MAP,
    GEO_BUBBLE: chartProviders.GEO_MAP,
    GEO_HEATMAP: chartProviders.GEO_MAP,
    GEO_EARTH_AREA: chartProviders.GEO_EARTH,
    GEO_EARTH_BUBBLE: chartProviders.GEO_EARTH,
    GEO_EARTH_BAR: chartProviders.GEO_EARTH,
    GEO_EARTH_HEATMAP: chartProviders.GEO_EARTH,
    GEO_EARTH_GRAPH: chartProviders.GEO_EARTH,
    WATERFALL: chartProviders.HIGHCHART,
    TREEMAP: chartProviders.HIGHCHART,
    HEATMAP: chartProviders.HIGHCHART,
    STACKED_AREA: chartProviders.HIGHCHART,
    LINE_COLUMN: chartProviders.HIGHCHART,
    FUNNEL: chartProviders.HIGHCHART,
    PIVOT_TABLE: chartProviders.PIVOT_TABLE,
    LINE_STACKED_COLUMN: chartProviders.HIGHCHART,
    SPIDER_WEB: chartProviders.HIGHCHART,
    SANKEY_CHART: chartProviders.NETWORK
};

let chartTypesInDisplayOrder = [
    chartTypes.COLUMN,
    chartTypes.STACKED_COLUMN,
    chartTypes.BAR,
    chartTypes.LINE,
    chartTypes.PIE,
    chartTypes.AREA,
    chartTypes.STACKED_AREA,
    chartTypes.SCATTER,
    chartTypes.BUBBLE,
    chartTypes.PARETO,
    chartTypes.WATERFALL,
    chartTypes.TREEMAP,
    chartTypes.HEATMAP,
    chartTypes.LINE_COLUMN,
    chartTypes.LINE_STACKED_COLUMN,
    chartTypes.FUNNEL,
    chartTypes.GEO_AREA,
    chartTypes.GEO_BUBBLE,
    chartTypes.GEO_HEATMAP,
    chartTypes.PIVOT_TABLE
];

let chartTypesNotSupportingGrowthQuery = [
    chartTypes.PIE,
    chartTypes.GEO_AREA,
    chartTypes.GEO_BUBBLE,
    chartTypes.GEO_HEATMAP
];

let stackedChartTypes = [
    chartTypes.STACKED_AREA,
    chartTypes.STACKED_COLUMN
];

let specImplementation: any = {};

if (flags.getValue('enableTestCharts')) {
    chartTypesInDisplayOrder.push(chartTypes.SANKEY_CHART);
}

/*global flags*/
if (flags.getValue('enableWebGLMaps')) {
    chartTypesInDisplayOrder.add([
        chartTypes.GEO_EARTH_AREA,
        chartTypes.GEO_EARTH_BUBBLE,
        chartTypes.GEO_EARTH_BAR,
        chartTypes.GEO_EARTH_HEATMAP,
        chartTypes.GEO_EARTH_GRAPH
    ]);
    chartTypesNotSupportingGrowthQuery.add([
        chartTypes.GEO_EARTH_AREA,
        chartTypes.GEO_EARTH_BUBBLE,
        chartTypes.GEO_EARTH_BAR,
        chartTypes.GEO_EARTH_HEATMAP,
        chartTypes.GEO_EARTH_GRAPH
    ]);
}

function isGeoEarthChartType(chartType) {
    return chartTypeByProvider[chartType] === chartProviders.GEO_EARTH;
}

function isGeoMapChartType(chartType) {
    return chartTypeByProvider[chartType] === chartProviders.GEO_MAP;
}

function isGeoChartType(chartType) {
    return isGeoMapChartType(chartType)
        || isGeoEarthChartType(chartType);
}

function isPivotChartType(chartType) {
    return chartTypeByProvider[chartType] === chartProviders.PIVOT_TABLE;
}

function isHighchartType(chartType) {
    return chartTypeByProvider[chartType] === chartProviders.HIGHCHART;
}

function isNetworkChartType(chartType) {
    return chartTypeByProvider[chartType] === chartProviders.NETWORK;
}

function getChartProvider(chartType) {
    return chartTypeByProvider[chartType];
}

function isXAxisVertical(chartType) {
    return chartType === chartTypes.BAR;
}

let chartTypesNotUsingMeasureAsOrdinal = [
    chartTypes.SCATTER,
    chartTypes.BUBBLE
];

function useMeasureOnXAxisAsOrdinal(chartType) {
    let chartTypesNotUsingMeasureAsOrdinalMap = util.mapArrayToBooleanHash(
        chartTypesNotUsingMeasureAsOrdinal
    );

    return !chartTypesNotUsingMeasureAsOrdinalMap[chartType];
}

let chartTypesNeedOrdinalXAxis = [
    chartTypes.PIE,
    chartTypes.HEATMAP,
    chartTypes.TREEMAP,
    chartTypes.FUNNEL
];

function useOrdinalXAxis(chartType) {
    let chartTypesNeedOrdinalXAxisMap = util.mapArrayToBooleanHash(
        chartTypesNeedOrdinalXAxis
    );

    return !!chartTypesNeedOrdinalXAxisMap[chartType];
}

function requiresUniqueXValuesPerSeries(chartType) {
    let exclusionList = [
        chartTypes.HEATMAP,
        chartTypes.SCATTER,
        chartTypes.BUBBLE,
        chartTypes.GEO_EARTH_GRAPH,
        chartTypes.FUNNEL,
        chartTypes.PIVOT_TABLE
    ];

    return exclusionList.none(chartType);
}

function requiresUniqueXValuesAcrossAllData(chartType) {
    return isGeoChartType(chartType);
}

//enableTestCharts global flag
if (flags.getValue('enableTestCharts')) {
    chartTypesInDisplayOrder.add([chartTypes.SPIDER_WEB]);
    chartTypesNeedOrdinalXAxis.add([chartTypes.SPIDER_WEB]);
}

// This contains all the boiler plate code for computing best Axis config.
// Once this is done call is made to
// per chart type logic.
let computeBestChartAxisConfig = function (chartType, chartModel) {
    if (!chartTypes.hasOwnProperty(chartType)) {
        _logger.error('Unsupported Chart Type:', chartType);
        return;
    }

    let chartTypeSpecImplementation = specImplementation[chartType];
    if (!chartTypeSpecImplementation) {
        _logger.error('Chart specification implementation missing for chart type:', chartType);
        return;
    }

    if (!chartTypeSpecImplementation.computeBestChartAxisConfig) {
        _logger.error(
            'Chart specification implementation missing computeBestChartAxisConfig for chart type:',
            chartType);
        return;
    }

    let chartDetails: any = {};
    chartDetails.chartModel = chartModel;
    chartDetails.measureColumns = chartModel.getMeasureColumns();
    chartDetails.timeSeriesColumns = chartModel.getTimeSeriesColumns();
    chartDetails.attributeColumns = chartModel
        .getAttributeColumns()
        .subtract(chartDetails.timeSeriesColumns);
    chartDetails.cardinalityData = chartModel.getCardinalityData();
    chartDetails.sortedAttributeColumns = chartModel.getSortedAttributeColumns();
    chartDetails.isGrowthQuery = containsGrowthColumn(chartDetails.measureColumns);
    if (chartDetails.isGrowthQuery) {
        chartDetails.growthColumn = getGrowthColumn(chartDetails.measureColumns);
        chartDetails.growthByColumn = getGrowthByColumn(chartDetails.timeSeriesColumns)
            || getGrowthByColumn(chartDetails.attributeColumns);

        // TODO(Jasmeet): We should update disabled chart tooltip in
        // the case growth query is not supported.
        if (chartTypesNotSupportingGrowthQuery.any(chartType)) {
            return null;
        }
    }

    return chartTypeSpecImplementation.computeBestChartAxisConfig(chartDetails);
};

function getSeriesXUniquenessValidationError(chartModel, chartType) {
    chartType = chartType || chartModel.getChartType();
    if (!requiresUniqueXValuesPerSeries(chartType)) {
        return null;
    }

    let series = chartModel.getSeries();

    let chartPointXGetter = function (chartPoint) {
        return chartPoint.x;
    };

    let anySeriesHasMultipleRowsForSameXValue = series.any(function (serie) {
        return util.arrayHasDuplicates(serie.data, chartPointXGetter);
    });

    if (anySeriesHasMultipleRowsForSameXValue) {
        return strings.dataDisabledChartExplanation.UNIQUE_X_VALUES_PER_SERIES;
    }

    return null;
}

function getXUniquenessAcrossAllDataValidationError(chartModel, chartType) {
    chartType = chartType || chartModel.getChartType();
    if (!requiresUniqueXValuesAcrossAllData(chartType)) {
        return null;
    }

    let series = chartModel.getSeries();
    if (series.length <= 1) {
        return null;
    }

    if (!chartUtilService.checkForXDuplicateAcrossAllSeries(series)) {
        return null;
    }
    return strings.dataDisabledChartExplanation.UNIQUE_X_VALUES_ALL_DATA;
}

// This contains all the boiler plate code for validating Axis config.
// Once this is done call is made to per chart type logic.
// This method performs all metadata level checks.
// This is used in 2 cases
// Case 1: User selects a chart type where the current config is validated.
// Case 2: When a user changes the axis config from the axis selector.
let validateAxisConfig = function (chartType, axisConfig) {
    if (!chartTypes.hasOwnProperty(chartType)) {
        _logger.error('Unsupported Chart Type:', chartType);
        return;
    }

    let generalValidity = validateAxisColumns(axisConfig,
        chartType, null, null);

    let invalid = Object.values(generalValidity).some(function (val) {
        return !!val;
    });

    if (invalid) {
        return false;
    }

    let chartTypeSpecImplementation = specImplementation[chartType];

    return chartTypeSpecImplementation.validateAxisConfig(axisConfig);
};

let seriesOverride = function (chartType, chartModel) {
    if (!chartTypes.hasOwnProperty(chartType)) {
        _logger.error('Unsupported Chart Type:', chartType);
        return;
    }

    let chartTypeSpecImplementation = specImplementation[chartType];
    if (angular.isFunction(chartTypeSpecImplementation.seriesOverride)) {
        chartTypeSpecImplementation.seriesOverride(chartModel);
    }
};

/**
 *
 * @param {string} chartType
 * @param {Object} chartModel
 * @param {Object} containerDimensions
 * @returns {configOptions}
 */
let configOptions = function (chartType, chartModel, containerDimensions) {
    if (!chartTypes.hasOwnProperty(chartType)) {
        _logger.error('Unsupported Chart Type:', chartType);
        return new ConfigOptions();
    }

    let chartTypeSpecImplementation = specImplementation[chartType];
    let options = {};
    if (angular.isFunction(chartTypeSpecImplementation.configOptions)) {
        options = chartTypeSpecImplementation.configOptions(chartModel, containerDimensions);
    }

    return new ConfigOptions(options);
};

let getDisabledChartTooltip = function (chartType) {
    let disableDetails = strings.disabledChartTypeSelectorTooltips[chartType];

    if (!disableDetails) {
        _logger.error('No disabled tooltip defined for chart type:', chartType);
    }

    if (chartType === chartTypes.PIE) {
        disableDetails = disableDetails.assign(
            chartSpecificConstants.PIECHART_CARDINALITY_THRESHOLD
        );
    }

    return '<div>{1}</div>'.assign(disableDetails);
};

let getChartDataValidationError = function (chartModel, chartType) {
    if (!chartModel || chartModel.hasNoData()) {
        return null;
    }

    chartType = chartType || chartModel.getChartType();

    let chartTypeSpecImplementation = specImplementation[chartType];
    if (!chartTypeSpecImplementation) {
        _logger.error('Chart specification implementation missing for chart type:', chartType);
        return 'Chart type not supported';
    }

    let seriesXUniquenessError = getSeriesXUniquenessValidationError(chartModel, chartType);
    if (!!seriesXUniquenessError) {
        return seriesXUniquenessError;
    }

    let allDataXUniquenessError = getXUniquenessAcrossAllDataValidationError(chartModel, chartType);
    if (!!allDataXUniquenessError) {
        return allDataXUniquenessError;
    }

    if (!angular.isFunction(chartTypeSpecImplementation.getChartDataValidationError)) {
        return null;
    }
    return chartTypeSpecImplementation.getChartDataValidationError(chartModel);
};

/**
 *
 * @param columns {VisualizationColumnModel[]}
 * @returns {boolean}
 */
function containsGrowthColumn(columns) {
    return columns.any(function (column) {
        return column.isGrowth();
    });
}

/**
 *
 * @param columns {VisualizationColumnModel[]}
 * @returns {VisualizationColumnModel}
 */
function getGrowthColumn(columns) {
    return columns.find(function (column) {
        return column.isGrowth();
    });
}

/**
 *
 * @param columns {VisualizationColumnModel[]}
 * @returns {VisualizationColumnModel}
 */
function getGrowthByColumn(columns) {
    return columns.find(function (column) {
        return column.isGrowthBy();
    });
}

// This is a shared template for Area, Bar, Column and Line charts.
let computeBestChartAxisConfigForTemplate1 = function (chartDetails) {
    // at least two columns are needed
    if (chartDetails.attributeColumns.length
        + chartDetails.timeSeriesColumns.length
        + chartDetails.measureColumns.length < 2) {
        return null;
    }

    if (chartDetails.attributeColumns.length + chartDetails.timeSeriesColumns.length === 0) {
        return null;
    }

    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.measureColumns.length === 0) {
        return null;
    }

    if (chartDetails.isGrowthQuery) {
        bestConfig.yAxisColumns.push(chartDetails.growthColumn);
        bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
        return bestConfig;
    }

    for (let i = 0; i < 4; i++) {
        if (!chartDetails.measureColumns[i]) {
            break;
        }
        bestConfig.yAxisColumns.push(chartDetails.measureColumns[i]);
    }

    let multipleYAxisColumns = bestConfig.yAxisColumns.length > 1;
    if (chartDetails.sortedAttributeColumns.length === 0) {
        if (!chartDetails.timeSeriesColumns.length) {
            return null;
        }
        bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
    } else if (chartDetails.sortedAttributeColumns.length === 1) {
        if (chartDetails.timeSeriesColumns.length) {
            bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
            // Multiple y and legend columns cannot co-exist
            if (!multipleYAxisColumns) {
                bestConfig.legendColumns.push(chartDetails.sortedAttributeColumns[0]);
            }
        } else {
            bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
        }
    } else {
        let attributeColumnCount = chartDetails.sortedAttributeColumns.length;
        let usedAttributeColumnCount = 0;
        if (chartDetails.timeSeriesColumns.length) {
            bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
        } else {
            usedAttributeColumnCount++;
            bestConfig.xAxisColumns.push(
                _.last(chartDetails.sortedAttributeColumns)
            );
        }

        if (!multipleYAxisColumns) {
            tryAddingLegendColumnsFromSet(
                bestConfig.legendColumns,
                chartDetails.cardinalityData,
                chartDetails.sortedAttributeColumns.slice(
                    0,
                    attributeColumnCount - usedAttributeColumnCount
                )
            );
        }
    }

    return bestConfig;
};

// This is a shared template for LINE, AREA
let incompleteZoneConfigTemplate1 = {
    getIncompleteColor: function (series) {
        return chroma(series.color).alpha(0.6).css();
    },
    getIncompleteThreshold: function (timeBucket) {
        let start = dateUtil.getTimeBucketStart(moment().valueOf(), timeBucket);
        return moment(start).subtract(1, timeBucket).valueOf();
    }
};

function areAllEffectivelyNumeric(columns) {
    return columns.every(function (column) {
        return column.isEffectivelyNumeric();
    });
}

function areAllEffectivelyNonNumeric(columns) {
    return columns.every(function (column) {
        return !column.isEffectivelyNumeric();
    });
}

function getHighchartsType(chartType) {
    if (!chartTypes.hasOwnProperty(chartType)) {
        _logger.error('Unsupported Chart Type:', chartType);
        return;
    }

    let chartTypeSpecImplementation = specImplementation[chartType];
    return chartTypeSpecImplementation.highchartsType || chartType;
}

function containsNegativeValuesOnY(yAxisColumns, dataRows) {
    let yAxisColumnsDataIndexes = yAxisColumns.map(function (yAxisColumn) {
        return yAxisColumn.getDataRowIndex();
    });

    return dataRows.any(function (dataRow) {
        return yAxisColumnsDataIndexes.any(function (dataRowIndex) {
            return dataRow[dataRowIndex] < 0;
        });
    });
}



//region BAR
specImplementation[chartTypes.BAR] = {};
specImplementation[chartTypes.BAR].computeBestChartAxisConfig =
    computeBestChartAxisConfigForTemplate1;
specImplementation[chartTypes.BAR].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length
        && !axisConfig.radialColumn) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.BAR].configOptions = function (chartModel) {
    let config = {
        highcharts: {
            plotOptions: {
                series: {
                    pointPadding: 0,
                    groupPadding: 0.1
                }
            }
        },
        allowedConfigurations: {
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };
    return config;
};
//endregion

//region COLUMN
specImplementation[chartTypes.COLUMN] = {};
specImplementation[chartTypes.COLUMN].computeBestChartAxisConfig
    = computeBestChartAxisConfigForTemplate1;
specImplementation[chartTypes.COLUMN].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length
        && !axisConfig.radialColumn) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.COLUMN].configOptions = function (chartModel) {
    let config = {
        highcharts: {
            plotOptions: {
                column: {
                    /* global flags */
                    allowPointSelect: isA3Enabled()
                },
                series: {
                    borderWidth: 0.5,
                    groupPadding: 0.01,
                    pointPadding: 0
                }
            }
        },
        allowedConfigurations: {
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };
    return config;
};
specImplementation[chartTypes.COLUMN].getYSEOPConfig = function (chartModel) {
    let config: any = {};
    let dataModel = chartModel.getDataModel();

    // Input chart
    config.inputChart = {};
    config.inputChart.type = 'BAR_CHART';
    config.inputChart.multiSeriesType = 'UNRELATED';

    // Output text
    config.outputText = {};
    config.outputText.levelOfDetail = 7;
    config.outputText.lang = 'en';

    // Dimensions
    config.dimensions = [];
    let dimension1: any = {};
    dimension1.label = chartModel.getXAxisColumns()
        .map(function (column) {
            return column.getName();
        })
        .join(', ');
    dimension1.cardinal = dataModel.series[0].data.length;
    dimension1.ordered = true;
    config.dimensions.push(dimension1);

    // Measures
    config.measures = [];
    dataModel.series.forEach(function (serie, idx) {
        // NOTE: YSEOP only supports 2 measures.
        if (idx < 2) {
            let measureConfig: any = {};
            measureConfig.label = serie.name;
            measureConfig.defaultValue = '0';
            measureConfig.meaningOfUp = 'GOOD';
            config.measures.push(measureConfig);
        }
    });

    // Facts
    config.facts = [];
    let isXAxisOrdinal = chartModel.isXAxisOrdinalBased();
    dataModel.series[0].data.forEach(function (dataRow, index) {
        let factRow: any = {};
        let dConf: any = {};
        dConf.index = 0;
        let xValue = isXAxisOrdinal ? index : chartModel._getXAxisValuesAt(index)[0].value;
        dConf.label = chartModel.getXAxisLabelAt(xValue);
        dConf.position = index;
        factRow.dimensions = [];
        factRow.dimensions.push(dConf);
        factRow.measures = [];
        dataModel.series.forEach(function (serie, idx) {
            if (idx < 2) {
                let mConf:any = {};
                mConf.index = idx;
                let data = serie.data[index];
                if (!!data) {
                    mConf.value = data.y.toString();
                    factRow.measures.push(mConf);
                }
            }
        });
        config.facts.push(factRow);
    });
    return config;
};
//endregion

//region STACKED_COLUMN
specImplementation[chartTypes.STACKED_COLUMN] = {};
specImplementation[chartTypes.STACKED_COLUMN]
    .computeBestChartAxisConfig = function (chartDetails) {
    if ((!chartDetails.attributeColumns.length && !chartDetails.timeSeriesColumns.length)
        || !(chartDetails.measureColumns.length)) {
        return null;
    }

    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        if (chartDetails.attributeColumns.length > 0) {
            bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
            bestConfig.yAxisColumns.push(chartDetails.growthColumn);
            angular.forEach(chartDetails.sortedAttributeColumns, function (column) {
                tryAddingLegendColumn(
                    bestConfig.legendColumns,
                    chartDetails.cardinalityData,
                    column
                );
            });
            if (bestConfig.legendColumns.length === 0) {
                return null;
            }
            return bestConfig;
        }
        return null;
    }

    bestConfig.yAxisColumns.push(chartDetails.measureColumns[0]);

    if (chartDetails.sortedAttributeColumns.length === 0) {
        if (chartDetails.timeSeriesColumns.length < 2) {
            return null;
        } else {
            bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
            bestConfig.legendColumns.push(chartDetails.timeSeriesColumns[1]);
        }
    } else if (chartDetails.sortedAttributeColumns.length === 1) {
        if (chartDetails.timeSeriesColumns.length) {
            bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
            bestConfig.legendColumns.push(chartDetails.sortedAttributeColumns[0]);
        } else {
            return null;
        }
    } else {
        let attributeColumnCount = chartDetails.sortedAttributeColumns.length;
        bestConfig
            .xAxisColumns
            .push(chartDetails.sortedAttributeColumns[attributeColumnCount - 1]);
        let index = 0;
        while (index < attributeColumnCount - 1) {
            tryAddingLegendColumn(
                bestConfig.legendColumns,
                chartDetails.cardinalityData,
                chartDetails.sortedAttributeColumns[index]);
            index++;
        }
        // NOTE: In the case where we have 2 or more legend columns and tryAddingLegend fails
        // We choose to add the column with lowest cardinality on Legend to support this chart
        // anyways.
        if (bestConfig.legendColumns.length === 0) {
            bestConfig.legendColumns.push(chartDetails.sortedAttributeColumns[0]);
        }
    }

    return bestConfig;
};
specImplementation[chartTypes.STACKED_COLUMN].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns
        || !axisConfig.yAxisColumns
        || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length
        && axisConfig.legendColumns.length
        && !axisConfig.radialColumn) {
        return true;
    }

    return false;
};

specImplementation[chartTypes.STACKED_COLUMN].configOptions = function (chartModel) {
    // NOTE: The data columns are not evenly spaced so a lower group padding has potential
    // to cause overlaps. Refer SCAL-18360
    let groutPadding = !!chartModel && chartModel.isTimeSeries()
        ? 0.075
        : 0.02;
    let config: any = {
        highcharts: {
            chart: {
                spacingTop: 20
            },
            plotOptions: {
                series: {
                    stacking: chartModel
                        && chartModel.isYAxisStackedAsPercent() ? 'percent' : 'normal',
                    borderWidth: 0.5,
                    groupPadding: groutPadding,
                    pointPadding: 0,
                    dataLabels: {
                        verticalAlign: 'top',
                        fontFamily:
                            'RetinaMP-Book, Light,' +
                            ' helvetica neue, helvetica, Arial, sans-serif',
                        fontSize: '12px',
                        color: '#131313',
                        textShadow: '0px 0px 3px #fff, 0px 0px 8px #fff',
                        formatter: function () {
                            if (chartModel.isYAxisStackedAsPercent()) {
                                return util.formatDataLabel(this.percentage / 100, {
                                    isDouble: true,
                                    isPercent: true
                                });
                            } else {
                                let yAxisColumns = chartModel.getYAxisColumns();
                                if (yAxisColumns.length !== 1) {
                                    _logger.error(
                                        'Only one y axis column expected in stacked charts'
                                    );
                                    return this.y;
                                }
                                let yAxisColumn = yAxisColumns[0];
                                return yAxisColumn.getDataFormatter()(this.y);
                            }
                        }
                    },
                    fillOpacity: 1
                }
            }
        },
        allowedConfigurations: {
            showYAxisAsPercent: true,
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };

    if (chartModel && chartModel.isYAxisStackedAsPercent()) {
        let valueColumn = chartModel.getYAxisColumns()[0];
        config.highcharts.yAxis = [{
            labels: {
                formatter: function () {
                    if (this.isTooltip) {
                        return chartModel.getLabelForNumericColumn(
                            this.value,
                            valueColumn,
                            [],
                            {
                                noShorten: false
                            }
                        );
                    } else {
                        return util.formatDataLabel(this.value / 100, {
                            isDouble: true,
                            isPercent: true
                        });
                    }
                }
            }
        }];
    }

    return config;
};
specImplementation[chartTypes.STACKED_COLUMN].highchartsType = chartTypes.COLUMN;
specImplementation[chartTypes.STACKED_COLUMN].getYSEOPConfig =
    specImplementation[chartTypes.COLUMN].getYSEOPConfig;

function getDefaultStackingValueColumn(chartModel) {
    return chartModel.getYAxisColumns()[0];
}

specImplementation[chartTypes.STACKED_COLUMN].getStackedValuesColumn =
    getDefaultStackingValueColumn;
//endregion

//region STACKED_AREA
specImplementation[chartTypes.STACKED_AREA] = {};
specImplementation[chartTypes.STACKED_AREA].computeBestChartAxisConfig
    = specImplementation[chartTypes.STACKED_COLUMN].computeBestChartAxisConfig;
specImplementation[chartTypes.STACKED_AREA].validateAxisConfig
    = specImplementation[chartTypes.STACKED_COLUMN].validateAxisConfig;
specImplementation[chartTypes.STACKED_AREA].configOptions
    = specImplementation[chartTypes.STACKED_COLUMN].configOptions;

specImplementation[chartTypes.STACKED_AREA].highchartsType = chartTypes.AREA;
specImplementation[chartTypes.STACKED_AREA].getStackedValuesColumn =
    getDefaultStackingValueColumn;
//endregion

//region PARETO
specImplementation[chartTypes.PARETO] = {};
specImplementation[chartTypes.PARETO].computeBestChartAxisConfig = function (chartDetails) {
    if ((!chartDetails.attributeColumns.length && !chartDetails.timeSeriesColumns.length)
        || !chartDetails.measureColumns.length) {
        return null;
    }
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
        bestConfig.yAxisColumns.push(chartDetails.growthColumn);
        return bestConfig;
    }

    // TODO(Jasmeet): If sage can mark columns as positive value then
    // that can be used to make the experience better here.
    bestConfig.yAxisColumns.push(chartDetails.measureColumns[0]);

    let attributeColumnCount = chartDetails.sortedAttributeColumns.length;
    if (attributeColumnCount) {
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[attributeColumnCount - 1]);
    } else {
        bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
    }

    return bestConfig;
};
specImplementation[chartTypes.PARETO].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns
        || !axisConfig.yAxisColumns
        || !axisConfig.legendColumns) {
        return false;
    }

    if (!axisConfig.xAxisColumns.length
        || !axisConfig.yAxisColumns.length
        || axisConfig.radialColumn) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if ((axisConfig.yAxisColumns.length !== 1)
        || (axisConfig.legendColumns && axisConfig.legendColumns.length > 0)) {
        return false;
    }
    return true;
};
specImplementation[chartTypes.PARETO].getChartDataValidationError = function (chartModel) {
    let yAxisColumns = chartModel.getYAxisColumns();
    if (yAxisColumns.length !== 1) {
        _logger.error('Trying to draw Pareto chart with more than one column on Y-Axis.');
        return strings.dataDisabledChartExplanation.ONLY_ONE_Y_AXIS_COLUMN_SUPPORTED;
    }

    let minYValue = chartModel.getMinYValue(yAxisColumns[0]);
    if (isNaN(minYValue) || minYValue < 0) {
        return strings.dataDisabledChartExplanation.NON_NEGATIVE_VALUES_NEEDED;
    }
    return null;
};
specImplementation[chartTypes.PARETO].configOptions = function (chartModel) {
    return {
        highcharts: {
            plotOptions: {
                series: {
                    lineWidth: 4,
                    borderWidth: 0.5,
                    groupPadding: 0.01,
                    pointPadding: 0
                }
            }
        },
        allowedConfigurations: {
            zoomPanStateToggle: true
        }
    };
};
//endregion

//region LINE
specImplementation[chartTypes.LINE] = {};
specImplementation[chartTypes.LINE].computeBestChartAxisConfig =
    computeBestChartAxisConfigForTemplate1;
specImplementation[chartTypes.LINE].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length
        && !axisConfig.radialColumn) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.LINE].configOptions = function (chartDetails) {
    return {
        useRainbowColors: true,
        incompleteZone: incompleteZoneConfigTemplate1,
        allowedConfigurations: {
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };
};
specImplementation[chartTypes.LINE].getYSEOPConfig = function (chartModel) {
    let config: any = {};
    let dataModel = chartModel.getDataModel();

    // Input chart
    config.inputChart = {};
    config.inputChart.type = 'LINE_CHART';
    config.inputChart.mainDimensionIndex = 0;
    config.inputChart.mainDimensionOrdered = true;
    config.inputChart.multiSeriesType = 'UNRELATED';

    // Output text
    config.outputText = {};
    config.outputText.levelOfDetail = 7;
    config.outputText.lang = 'en';

    // Dimensions
    config.dimensions = [];
    let dimension1: any = {};
    dimension1.label = chartModel.getXAxisColumns()
        .map(function (column) {
            return column.getName();
        })
        .join(', ');
    dimension1.cardinal = dataModel.series[0].data.length;
    dimension1.ordered = true;
    config.dimensions.push(dimension1);

    // Measures
    config.measures = [];
    dataModel.series.forEach(function (serie, idx) {
        // NOTE: YSEOP only supports 2 measures.
        if (idx < 2) {
            let measureConfig: any = {};
            measureConfig.label = serie.name;
            measureConfig.defaultValue = '0';
            measureConfig.meaningOfUp = 'GOOD';
            config.measures.push(measureConfig);
        }
    });

    // Facts
    config.facts = [];
    let isXAxisOrdinal = chartModel.isXAxisOrdinalBased();
    dataModel.series[0].data.forEach(function (dataRow, index) {
        let factRow: any = {};
        let dConf: any = {};
        dConf.index = 0;
        let xValue = isXAxisOrdinal ? index : chartModel._getXAxisValuesAt(index)[0].value;
        dConf.label = chartModel.getXAxisLabelAt(xValue);
        dConf.position = index;
        factRow.dimensions = [];
        factRow.dimensions.push(dConf);
        factRow.measures = [];
        dataModel.series.forEach(function (serie, idx) {
            if (idx < 2) {
                let mConf: any = {};
                mConf.index = idx;
                let data = serie.data[index];
                if (!!data) {
                    mConf.value = data.y.toString();
                    factRow.measures.push(mConf);
                }
            }
        });
        config.facts.push(factRow);
    });
    return config;
};
//endregion

// region AREA
specImplementation[chartTypes.AREA] = {};
specImplementation[chartTypes.AREA].computeBestChartAxisConfig =
    computeBestChartAxisConfigForTemplate1;
specImplementation[chartTypes.AREA].validateAxisConfig
    = function (axisConfig) {

    if (!axisConfig.xAxisColumns
        || !axisConfig.yAxisColumns
        || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length
        && !axisConfig.radialColumn) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.AREA].configOptions = function (chartDetails) {
    return {
        incompleteZone: incompleteZoneConfigTemplate1,
        allowedConfigurations: {
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };
};
//endregion

//region SCATTER
specImplementation[chartTypes.SCATTER] = {};
specImplementation[chartTypes.SCATTER].computeBestChartAxisConfig = function (chartDetails) {
    if (!chartDetails.attributeColumns.length && !chartDetails.timeSeriesColumns.length) {
        return null;
    }
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
        bestConfig.yAxisColumns.push(chartDetails.growthColumn);
        return bestConfig;
    }

    if (chartDetails.measureColumns.length === 0) {
        if (chartDetails.attributeColumns.length
            + chartDetails.timeSeriesColumns.length < 2) {
            bestConfig = null;
        } else {
            let xColumn = chartDetails.timeSeriesColumns[0];
            let attributesCount = chartDetails.sortedAttributeColumns.length;
            let neededColumnCount, legendColumnsCount;
            let yColumn;
            if (!xColumn) {
                neededColumnCount = 2;
                chartDetails.sortedAttributeColumns.forEach(function (column, index) {
                    if (attributesCount - index > neededColumnCount) {
                        tryAddingLegendColumn(
                            bestConfig.legendColumns,
                            chartDetails.cardinalityData,
                            column
                        );
                    }
                });
                legendColumnsCount = bestConfig.legendColumns.length;
                xColumn = chartDetails.sortedAttributeColumns[legendColumnsCount];
                yColumn = chartDetails.sortedAttributeColumns[legendColumnsCount + 1];
            } else {
                neededColumnCount = 1;
                chartDetails.sortedAttributeColumns.forEach(function (column, index) {
                    if (attributesCount - index > neededColumnCount) {
                        tryAddingLegendColumn(
                            bestConfig.legendColumns,
                            chartDetails.cardinalityData,
                            column
                        );
                    }
                });
                legendColumnsCount = bestConfig.legendColumns.length;
                yColumn = chartDetails.sortedAttributeColumns[legendColumnsCount];
            }
            bestConfig.xAxisColumns.push(xColumn);
            bestConfig.yAxisColumns.push(yColumn);
        }
    } else if (chartDetails.measureColumns.length === 1) {
        // If there is one measure only then scatter plot uses the
        // same config as template 1(similar to line chart)
        // TODO (jasmeet/sunny): This needs update as we can have 1 measure and 1 numeric attribute
        // and that would be a better axis config.
        return computeBestChartAxisConfigForTemplate1(chartDetails);
    } else {
        bestConfig.xAxisColumns.push(chartDetails.measureColumns[0]);
        bestConfig.yAxisColumns.push(chartDetails.measureColumns[1]);
        if (chartDetails.sortedAttributeColumns.length) {
            tryAddingLegendColumnsFromSet(
                bestConfig.legendColumns,
                chartDetails.cardinalityData,
                chartDetails.sortedAttributeColumns
            );
        }
    }

    return bestConfig;
};
specImplementation[chartTypes.SCATTER].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns
        || !axisConfig.yAxisColumns
        || !axisConfig.legendColumns) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length
        && !axisConfig.radialColumn) {
        return true;
    }

    return false;
};

specImplementation[chartTypes.SCATTER].configOptions = function () {
    return {
        highcharts: {
            plotOptions: {
                scatter: {
                    marker: {
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    }
                }
            }
        },
        highThresholdGrouping: true,
        attributesOnYAxis: true,
        allowedConfigurations: {
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };
};
//endregion

//region BUBBLE
specImplementation[chartTypes.BUBBLE] = {};
specImplementation[chartTypes.BUBBLE].computeBestChartAxisConfig = function (chartDetails) {
    if ((!chartDetails.attributeColumns.length && !chartDetails.timeSeriesColumns.length)
        || chartDetails.measureColumns.length <= 1) {
        return null;
    }
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        if (chartDetails.measureColumns.length > 1) {
            bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
            bestConfig.yAxisColumns.push(chartDetails.growthColumn);
            bestConfig.radialColumn = chartDetails.measureColumns.find(function (column) {
                return column.getGuid() !== chartDetails.growthColumn.getGuid();
            });
            return bestConfig;
        } else {
            return null;
        }
    }

    let measureColumnsCount = chartDetails.measureColumns.length;
    if (measureColumnsCount >= 3) {
        bestConfig.radialColumn = chartDetails.measureColumns[measureColumnsCount - 1];
        bestConfig.yAxisColumns.push(chartDetails.measureColumns[measureColumnsCount - 2]);
        bestConfig.xAxisColumns.push(chartDetails.measureColumns[measureColumnsCount - 3]);
        tryAddingLegendColumnsFromSet(
            bestConfig.legendColumns,
            chartDetails.cardinalityData,
            chartDetails.sortedAttributeColumns
        );
        return bestConfig;
    } else if (measureColumnsCount === 2) {
        bestConfig.radialColumn = chartDetails.measureColumns[measureColumnsCount - 1];
        bestConfig.yAxisColumns.push(chartDetails.measureColumns[measureColumnsCount - 2]);
        if (chartDetails.timeSeriesColumns > 0) {
            bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
            tryAddingLegendColumnsFromSet(
                bestConfig.legendColumns,
                chartDetails.cardinalityData,
                chartDetails.sortedAttributeColumns
            );
        } else {
            let attrColCount = chartDetails.sortedAttributeColumns.length;
            bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[attrColCount - 1]);
            tryAddingLegendColumnsFromSet(
                bestConfig.legendColumns,
                chartDetails.cardinalityData,
                chartDetails.sortedAttributeColumns.slice(0, attrColCount - 1)
            );
        }
        return bestConfig;
    } else if (measureColumnsCount === 1) {
        return null;
    }

    return bestConfig;
};
specImplementation[chartTypes.BUBBLE].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns
        || !axisConfig.yAxisColumns
        || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length
        && axisConfig.radialColumn) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.BUBBLE].configOptions = function (chartModel) {
    return {
        highcharts: {
            colors: ChartThemeService.getDefaultTheme().alphaColors
        },
        radialEnabled: true,
        attributesOnYAxis: true,
        highThresholdGrouping: true,
        allowedConfigurations: {
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };
};
specImplementation[chartTypes.BUBBLE].seriesOverride = function (vizModel) {
    if (!!vizModel.getRadialColumn()) {
        let maxRadialValue = vizModel.getMaxRadialValue();
        if (maxRadialValue > 0) {
            let MIN_BUBBLE_SIZE = 2,
                MAX_BUBBLE_SIZE = 100;

            let minRadialValue = vizModel.getMinRadialValue(),
                radialRange = maxRadialValue - minRadialValue;

            vizModel.getSeries().forEach(function (s) {
                if (!s.data) {
                    return;
                }
                s.data.forEach(function (d) {
                    if (!d.z || isNaN(d.z)) {
                        return;
                    }
                    let value = radialRange > 0
                        ? (d.z - minRadialValue) / radialRange
                        : 1;
                    value = Math.sqrt(value);

                    let radius = Math.ceil(
                        MIN_BUBBLE_SIZE + value *
                        (MAX_BUBBLE_SIZE - MIN_BUBBLE_SIZE) * 0.5);
                    d.marker = {
                        radius: radius
                    };
                    d.marker.states = {
                        hover: {
                            radius: radius * 1.1
                        }
                    };

                });
            });
        }
    }
};
specImplementation[chartTypes.BUBBLE].highchartsType = chartTypes.SCATTER;
//endregion

//region TREEMAP
specImplementation[chartTypes.TREEMAP] = {};
specImplementation[chartTypes.TREEMAP].computeBestChartAxisConfig = function (chartDetails) {
    if ((!chartDetails.attributeColumns.length && !chartDetails.timeSeriesColumns.length)
        || (chartDetails.measureColumns.length <= 1)) {
        return null;
    }
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        if (chartDetails.measureColumns.length > 1) {
            bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
            bestConfig.yAxisColumns.push(chartDetails.growthColumn);
            bestConfig.radialColumn = chartDetails.measureColumns.find(function (column) {
                return column.getGuid() !== chartDetails.growthColumn.getGuid();
            });
            return bestConfig;
        } else {
            return null;
        }
    }

    if (chartDetails.timeSeriesColumns.length) {
        bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
    } else if (chartDetails.sortedAttributeColumns.length) {
        let attributeColumnCount = chartDetails.sortedAttributeColumns.length;
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[attributeColumnCount - 1]);
    } else {
        return null;
    }

    bestConfig.radialColumn = chartDetails.measureColumns[0];
    bestConfig.yAxisColumns.push(chartDetails.measureColumns[1]);

    return bestConfig;
};
specImplementation[chartTypes.TREEMAP].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length === 1
        && axisConfig.radialColumn) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.TREEMAP].getChartDataValidationError = function (chartModel) {
    let data = chartModel.getDefaultQueryData();

    if (data.length > chartSpecificConstants.TREEMAP_CARDINALITY_THRESHOLD) {
        return strings.dataDisabledChartExplanation.CARDINALITY
            .assign(chartSpecificConstants.TREEMAP_CARDINALITY_THRESHOLD);
    }

    return null;
};
specImplementation[chartTypes.TREEMAP].seriesOverride = function (vizModel) {
    if (!!vizModel.getRadialColumn()) {
        let attrOnYAxis = vizModel.isYAxisOrdinalBased();
        angular.forEach(vizModel.getSeries(), function (s) {
            if (!s.data) {
                return;
            }
            angular.forEach(s.data, function (d) {
                if (isNaN(d.y) || isNaN(d.z)) {
                    return;
                }

                d.value = d.z;
                if (attrOnYAxis) {
                    d.color = ChartThemeService.getDefaultTheme().alphaColors[d.y];
                } else {
                    d.colorValue = d.y;
                }
                d.name = d.x;
            });
        });
    }
};

specImplementation[chartTypes.TREEMAP].configOptions =
    function (chartModel, containerDimensions) {

    let maxColorTree = chroma(ChartThemeService.getDefaultTheme().lessColors[0]).hex();
    let minColorTree = chroma(ChartThemeService.getDefaultTheme().lessColors[2]).hex();
    let isLegendEnabled = !!containerDimensions
        && chartUtilService.isChartBigEnoughToShowLegend(
            chartModel.isPinboardViz(),
            containerDimensions
        );

    return {
        highcharts: {
            chart: {
                plotBorderWidth: 0
            },
            legend: {
                enabled: isLegendEnabled,
                symbolWidth: 300,
                autoRotation: [-45],
                title: {
                    text: chartModel && chartModel.getYAxisColumns()[0].getName(),
                    style: {
                        fontFamily: 'regular, Lucida Grande, sans-serif',
                        fontSize: '11px',
                        textShadow: '',
                        color: '#4e515e'
                    }
                }
            },
            colorAxis: {
                minColor: minColorTree,
                maxColor: maxColorTree,
                labels: {
                    formatter: function () {
                        let valueColumn = chartModel.getYAxisColumns()[0];
                        return chartModel.getLabelForNumericColumn(
                            this.value,
                            valueColumn,
                            [],
                            {
                                noShorten: false
                            }
                        );
                    }
                }
            },
            plotOptions: {
                treemap: {
                    layoutAlgorithm: 'squarified'
                },
                series: {
                    borderWidth: 1,
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontFamily:
                                'RetinaMP-Book, Light,' +
                                ' helvetica neue, helvetica, Arial, sans-serif',
                            fontSize: '12px',
                            color: '#131313',
                            textShadow: '0px 0px 3px #fff, 0px 0px 8px #fff'
                        }
                    },
                    dataGrouping: {
                        enabled: false
                    }
                }
            },
            xAxis: {
                minRange: null
            }
        },
        radialEnabled: true,
        legendDisabled: true,
        attributesOnYAxis: false, //TODO (Ashish): Enable after adding legend in Treemap
        axesAlias: {
            xAxis: 'Category',
            yAxis: 'Color',
            radial: 'Size'
        },
        containsNativeLegend: true,
        dataLabelsEnabledByDefault: true,
        dataLabelFormatter: function () {
            return chartModel.getXAxisLabelAt(this.point.x);
        },
        incompleteZone: {
            disabled: true
        } // incomplete zones are not enabled for TREEMAP/HEATMAP,
    };
};
//endregion

//region HEATMAP
specImplementation[chartTypes.HEATMAP] = {};
specImplementation[chartTypes.HEATMAP].computeBestChartAxisConfig = function (chartDetails) {
    if ((chartDetails.attributeColumns.length + chartDetails.timeSeriesColumns.length) < 2
        || chartDetails.measureColumns.length < 1) {
        return null;
    }

    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        if (chartDetails.attributeColumns.length > 0) {
            bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
            bestConfig.radialColumn = chartDetails.growthColumn;
            bestConfig.yAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
            return bestConfig;
        } else {
            return null;
        }
    }

    if (chartDetails.timeSeriesColumns.length) {
        bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
        if (chartDetails.sortedAttributeColumns.length) {
            bestConfig.yAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
        } else {
            if (chartDetails.timeSeriesColumns.length < 2) {
                return null;
            }
            bestConfig.yAxisColumns.push(chartDetails.timeSeriesColumns[1]);
        }

    } else if (chartDetails.sortedAttributeColumns.length >= 2) {
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
        bestConfig.yAxisColumns.push(chartDetails.sortedAttributeColumns[1]);
    } else {
        return null;
    }

    bestConfig.radialColumn = chartDetails.measureColumns[0];

    return bestConfig;
};
specImplementation[chartTypes.HEATMAP].validateAxisConfig = function (axisConfig) {

    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.radialColumn) {
        return false;
    }

    if (axisConfig.xAxisColumns.length !== 1) {
        return false;
    }

    if (axisConfig.yAxisColumns.length !== 1) {
        return false;
    }

    if (axisConfig.yAxisColumns[0].isEffectivelyNumeric()) {
        return false;
    }

    return true;
};
specImplementation[chartTypes.HEATMAP].seriesOverride = function (vizModel) {
    if (!!vizModel.getRadialColumn()) {

        angular.forEach(vizModel.getSeries(), function (s) {
            if (!s.data) {
                return;
            }
            angular.forEach(s.data, function (d) {
                if (isNaN(d.z)) {
                    return;
                }
                d.value = d.z;
            });
        });
    }
};

specImplementation[chartTypes.HEATMAP].configOptions = function (chartModel, containerDimensions) {
    let maxColor = chroma(ChartThemeService.getDefaultTheme().lessColors[0]).css();
    let minColor = chroma(maxColor).brighten(4).css();

    function getDataLabel(value) {
        let valueColumn = chartModel.getRadialColumn();
        return chartModel.getLabelForNumericColumn(
            value,
            valueColumn,
            [],
            {
                noShorten: false
            }
        );
    }

    let isLegendEnabled = !!containerDimensions
        && chartUtilService.isChartBigEnoughToShowLegend(
            chartModel.isPinboardViz(),
            containerDimensions
        );

    return {
        highcharts: {
            chart: {
                plotBorderWidth: 0
            },
            xAxis: {
                labels: {
                    style: {
                        color: '#6e6e70'
                    }
                }
            },
            legend: {
                enabled: isLegendEnabled,
                symbolWidth: 300,
                autoRotation: [-45],
                title: {
                    text: chartModel && chartModel.getRadialColumn().getName(),
                    style: {
                        fontFamily: 'regular, Lucida Grande, sans-serif',
                        fontSize: '11px',
                        color: '#4e515e'
                    }
                }
            },
            // The between min and max value is poly-linear
            colorAxis: {
                stops: [
                    [0, minColor],
                    [1, maxColor]
                ],
                labels: {
                    formatter: function () {
                        return getDataLabel(this.value);
                    }
                }
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        style: {
                            fontFamily:
                                'RetinaMP-Book, Light,' +
                                ' helvetica neue, helvetica, Arial, sans-serif',
                            fontSize: '12px',
                            color: '#131313',
                            textShadow: '0px 0px 3px #fff, 0px 0px 8px #fff'
                        }
                    },
                    borderWidth: 0,
                    dataGrouping: {
                        enabled: false
                    }
                },
                candlestick: {
                    lineColor: '#e36028'
                },
                map: {
                    shadow: false
                }
            }
        },
        radialEnabled: true,
        legendDisabled: true,
        attributesOnYAxis: true,
        noMeasuresOnYAxis: true,
        axesAlias: {
            radial: 'Value'
        },
        containsNativeLegend: true,
        dataLabelsEnabledByDefault: true,
        dataLabelFormatter: function () {
            return getDataLabel(this.point.value);
        },
        incompleteZone: {
            disabled: true
        } // incomplete zones are not enabled for TREEMAP/HEATMAP
    };
};
//endregion

//region WATERFALL
specImplementation[chartTypes.WATERFALL] = {};
specImplementation[chartTypes.WATERFALL].computeBestChartAxisConfig
    = computeBestChartAxisConfigForTemplate1;
specImplementation[chartTypes.WATERFALL].validateAxisConfig
    = specImplementation[chartTypes.COLUMN].validateAxisConfig;
specImplementation[chartTypes.WATERFALL].configOptions = function (chartModel) {
    return {
        highcharts: {
            plotOptions: {
                series: {
                    dataLabels: {
                        inside: false,
                        style: {
                            fontFamily:
                                'RetinaMP-Book, Light,' +
                                ' helvetica neue, helvetica, Arial, sans-serif',
                            fontSize: '12px',
                            color: '#131313',
                            textShadow: '0px 0px 3px #fff, 0px 0px 8px #fff'
                        }
                    },
                    dashStyle: 'ShortDash',
                    borderWidth: 0
                }
            },
            colors: ChartThemeService.getDefaultTheme().lessColors
        },
        useRainbowColors: true,
        dataLabelsEnabledByDefault: true,
        allowedConfigurations: {
            zoomPanStateToggle: true
        }
    };
};
//endregion

//region PIE
specImplementation[chartTypes.PIE] = {};
specImplementation[chartTypes.PIE].computeBestChartAxisConfig = function (chartDetails) {
    if (chartDetails.measureColumns.length === 0) {
        return null;
    }
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.sortedAttributeColumns.length) {
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
        bestConfig.yAxisColumns.push(chartDetails.measureColumns[0]);
        return bestConfig;
    }

    if (chartDetails.attributeColumns.length + chartDetails.timeSeriesColumns.length === 0) {
        // if all columns are effectively numeric, the best candidate for the x-axis columns
        // is a numeric attribute column (callosum guarantees at the moment that there will
        // be at least one such column).
        let firstNumericAttributeColumn = chartDetails.measureColumns.find(function (column) {
            return column.isAttribute();
        });
        if (!firstNumericAttributeColumn) {
            _logger.warn('at least one non-numeric attribute or numeric attribute column expected');
            return null;
        }
        bestConfig.xAxisColumns.push(firstNumericAttributeColumn);

        let leftOverColumns = chartDetails.measureColumns.slice(0)
            .remove(firstNumericAttributeColumn);
        bestConfig.yAxisColumns.push(leftOverColumns[0]);

        return bestConfig;
    }

    return null;
};
specImplementation[chartTypes.PIE].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (axisConfig.xAxisColumns.length < 1) {
        return false;
    }
    if (axisConfig.legendColumns.length > 0) {
        return false;
    }

    if (axisConfig.yAxisColumns.length > 2 || axisConfig.yAxisColumns.length < 1) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (containsGrowthColumn(axisConfig.yAxisColumns)) {
        return false;
    }

    return !axisConfig.radialColumn;
};
specImplementation[chartTypes.PIE].getChartDataValidationError = function (chartModel) {
    let data = chartModel.getDefaultQueryData();
    if (data.length > chartSpecificConstants.PIECHART_CARDINALITY_THRESHOLD) {
        return strings.dataDisabledChartExplanation.CARDINALITY
            .assign(chartSpecificConstants.PIECHART_CARDINALITY_THRESHOLD);
    }

    if (containsNegativeValuesOnY(chartModel.getYAxisColumns(), data)) {
        return strings.dataDisabledChartExplanation.NON_NEGATIVE_VALUES_NEEDED;
    }

    return null;
};
specImplementation[chartTypes.PIE].seriesOverride = function (chartModel) {

    let series = chartModel.getSeries();
    series[0].innerSize = chartSpecificConstants.PIE_INNERSIZE_SINGLECHART;
    if (series.length === 2) {
        series[1].size = chartSpecificConstants.PIE_INNERSIZE_DOUBLECHART;
        series[1].dataLabels = {
            enabled: false
        };
        series[0].innerSize = chartSpecificConstants.PIE_OUTERSIZE;
    }
};

function getInfoText(vizModel) {
    // NOTE: This is added as we sometimes query config when chart model is not present.
    if (!vizModel) {
        return '';
    }
    let xAxisColumns = vizModel.getXAxisColumns();
    let yAxisColumns = vizModel.getYAxisColumns();
    return '{yNames} by {xNames}'.assign({
        yNames: yAxisColumns.map('getName').join(', '),
        xNames: xAxisColumns.map('getName').join(', ')
    });
}

function percentPointFormatter(column, point, model) {
    let name = model.getXAxisLabelAt(point.x).truncate(
        chartSpecificConstants.MAX_LABEL_LENGTH_PIE
    );
    let value = model.getLabelForNumericColumn(point.y, column, [], {noShorten: false});
    let percentage = util.formatBusinessNumber(point.percentage);
    return '{name} - {value} ({percentage}%)'.assign({
        name: name,
        value: value,
        percentage: percentage
    });
}

// we add more spacing specifically for PIE chart to prevent chart legend to touch
// subtitle, and to prevent subtitle to go out of svg canvas
specImplementation[chartTypes.PIE].configOptions = function (vizModel) {
    return {
        // TODO(Ashish) : Document all configOptions.
        legendDisabled: true,
        isMultiColorSeries: true,
        dataLabelsEnabledByDefault: true,
        highcharts: {
            chart: {
                spacingBottom: 20
            },
            title: {
                text: ''
            },
            subtitle: {
                text: getInfoText(vizModel),
                verticalAlign: 'bottom',
                y: 13
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    animation: true,
                    center: ['50%', '50%'],
                    borderWidth: 0.5,
                    groupPadding: 0.01,
                    pointPadding: 0
                },
                series: {
                    dataLabels: {
                        distance: 5
                    },
                    dataGrouping: {
                        enabled: false
                    }
                }
            }
        },
        dataLabelFormatter: function () {
            // NOTE: Data labels are displayed only for first Y column.
            let valueColumn = vizModel.getYAxisColumns()[0];

            return percentPointFormatter(valueColumn, this.point, vizModel);
        }
    };
};
specImplementation[chartTypes.PIE].getYSEOPConfig = function (chartModel) {
    let config: any = {};
    let dataModel = chartModel.getDataModel();

    // Input chart
    config.inputChart = {};
    config.inputChart.type = 'PIE_CHART';
    config.inputChart.multiSeriesType = 'UNRELATED';

    // Output text
    config.outputText = {};
    config.outputText.levelOfDetail = 7;
    config.outputText.lang = 'en';

    // Dimensions
    config.dimensions = [];
    let dimension1: any = {};
    dimension1.label = chartModel.getXAxisColumns()
        .map(function (column) {
            return column.getName();
        })
        .join(', ');
    dimension1.cardinal = dataModel.series[0].data.length;
    config.dimensions.push(dimension1);

    // Measures
    config.measures = [];
    chartModel.getYAxisColumns().forEach(function (column) {
        let measureConfig: any = {};
        measureConfig.label = column.getName();
        measureConfig.defaultValue = '0';
        measureConfig.meaningOfUp = 'GOOD';
        config.measures.push(measureConfig);
    });

    // Facts
    config.facts = [];
    dataModel.series[0].data.forEach(function (serie, index) {
        let factRow: any = {};
        let dConf: any = {};
        dConf.index = 0;
        dConf.label = chartModel.getXAxisLabelAt(index);
        dConf.position = index;
        factRow.dimensions = [];
        factRow.dimensions.push(dConf);
        factRow.measures = [];
        chartModel.getYAxisColumns().forEach(function (column, idx) {
            let mConf: any = {};
            mConf.index = idx;
            mConf.value = dataModel.series[idx].data[index].y.toString();
            factRow.measures.push(mConf);
        });
        config.facts.push(factRow);
    });
    return config;
};
//endregion

//region LINE_COLUMN
specImplementation[chartTypes.LINE_COLUMN] = {};
specImplementation[chartTypes.LINE_COLUMN].computeBestChartAxisConfig = function (chartDetails) {
    if ((!chartDetails.attributeColumns.length && !chartDetails.timeSeriesColumns.length)
        || (chartDetails.measureColumns.length <= 1)) {
        return null;
    }
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        if (chartDetails.measureColumns.length > 1) {
            bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
            let nonGrowthMeasuresOnY = [];
            chartDetails.measureColumns.some(function (column) {
                if (column.getSageOutputColumnId()
                    !== chartDetails.growthColumn.getSageOutputColumnId()) {
                    nonGrowthMeasuresOnY.push(column);
                }
                return nonGrowthMeasuresOnY.length === 3;
            });

            Array.prototype.push.apply(bestConfig.yAxisColumns, nonGrowthMeasuresOnY);
            bestConfig.yAxisColumns.push(chartDetails.growthColumn);

            return bestConfig;
        } else {
            return null;
        }
    }

    if (chartDetails.timeSeriesColumns.length) {
        bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
    } else if (chartDetails.sortedAttributeColumns.length) {
        let attributeColumnCount = chartDetails.sortedAttributeColumns.length;
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[attributeColumnCount - 1]);
    } else {
        return null;
    }

    chartDetails.measureColumns.some(function (column) {
        bestConfig.yAxisColumns.push(column);
        return bestConfig.yAxisColumns.length === 4;
    });

    return bestConfig;
};
specImplementation[chartTypes.LINE_COLUMN].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length && axisConfig.yAxisColumns.length > 1) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.LINE_COLUMN].seriesOverride = function (vizModel) {
    let series = vizModel.getSeries();
    let yAxisColumns = vizModel.getYAxisColumns();
    let column1 = yAxisColumns[0];
    let column1Series = series.find(function (serie) {
        return serie.blinkSeriesId === column1.getSageOutputColumnId();
    });
    column1Series.type = chartTypes.COLUMN.toLowerCase();
    column1Series.zIndex = 1;

    let lineColumns = yAxisColumns.slice(1);
    lineColumns.forEach(function (lineColumn) {
        let lineColumnSeries = series.find(function (serie) {
            return serie.blinkSeriesId === lineColumn.getSageOutputColumnId();
        });
        lineColumnSeries.type = chartTypes.LINE.toLowerCase();
        lineColumnSeries.zIndex = 2;
    });
};
specImplementation[chartTypes.LINE_COLUMN].configOptions = function (chartModel) {
    return {
        highcharts: {
            plotOptions: {
                series: {
                    lineWidth: 4,
                    borderWidth: 0.5
                }
            }
        },
        shouldBringSelectedSeriesToFront: false,
        allowedConfigurations: {
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };
};
specImplementation[chartTypes.LINE_COLUMN].highchartsType = chartTypes.COLUMN;
//endregion

//region FUNNEL
specImplementation[chartTypes.FUNNEL] = {};
specImplementation[chartTypes.FUNNEL].computeBestChartAxisConfig = function (chartDetails) {
    if (chartDetails.measureColumns.length === 0) {
        return null;
    }
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.sortedAttributeColumns.length) {
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
        bestConfig.yAxisColumns.push(chartDetails.measureColumns[0]);
        return bestConfig;
    }

    if (chartDetails.attributeColumns.length + chartDetails.timeSeriesColumns.length === 0) {
        // if all columns are effectively numeric, the best candidate for the x-axis columns
        // is a numeric attribute column (callosum guarantees at the moment that there will
        // be at least one such column).
        let firstNumericAttributeColumn = chartDetails.measureColumns.find(function (column) {
            return column.isAttribute();
        });
        if (!firstNumericAttributeColumn) {
            _logger.warn('at least one non-numeric attribute or numeric attribute column expected');
            return null;
        }
        bestConfig.xAxisColumns.push(firstNumericAttributeColumn);

        let leftOverColumns = chartDetails.measureColumns.slice(0)
            .remove(firstNumericAttributeColumn);
        bestConfig.yAxisColumns.push(leftOverColumns[0]);

        return bestConfig;
    }

    return null;
};
specImplementation[chartTypes.FUNNEL].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (axisConfig.xAxisColumns.length < 1) {
        return false;
    }
    if (axisConfig.legendColumns.length > 0) {
        return false;
    }

    if (axisConfig.yAxisColumns.length !== 1) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (containsGrowthColumn(axisConfig.yAxisColumns)) {
        return false;
    }

    return !axisConfig.radialColumn;
};
specImplementation[chartTypes.FUNNEL].getChartDataValidationError = function (chartModel) {
    let data = chartModel.getDefaultQueryData();

    if (data.length > chartSpecificConstants.PIECHART_CARDINALITY_THRESHOLD) {
        return strings.dataDisabledChartExplanation.CARDINALITY
            .assign(chartSpecificConstants.PIECHART_CARDINALITY_THRESHOLD);
    }

    if (containsNegativeValuesOnY(chartModel.getYAxisColumns(), data)) {
        return strings.dataDisabledChartExplanation.NON_NEGATIVE_VALUES_NEEDED;
    }

    return null;
};

specImplementation[chartTypes.FUNNEL].configOptions = function (vizModel) {
    return {
        legendDisabled: true,
        isMultiColorSeries: true,
        dataLabelsEnabledByDefault: true,
        highcharts: {
            chart: {
                spacingTop: 20,
                spacingLeft: 50,
                spacingRight: 160,
                spacingBottom: 30
            },
            title: {
                text: ''
            },
            subtitle: {
                text: getInfoText(vizModel),
                verticalAlign: 'bottom',
                y: 13
            },
            plotOptions: {
                funnel: {
                    neckHeight: '0%'
                },
                series: {
                    dataLabels: {
                        distance: 5,
                        style: {
                            fontFamily:
                                'RetinaMP-Book, Light,' +
                                ' helvetica neue, helvetica, Arial, sans-serif',
                            fontSize: '12px',
                            color: '#131313',
                            textShadow: '0px 0px 3px #fff, 0px 0px 8px #fff'
                        }
                    },
                    dataGrouping: {
                        enabled: false
                    }
                }
            }
        },
        dataLabelFormatter: function () {
            let valueColumn = vizModel.getYAxisColumns()[0];
            return percentPointFormatter(valueColumn, this.point, vizModel);
        }
    };
};
specImplementation[chartTypes.FUNNEL].getYSEOPConfig =
    specImplementation[chartTypes.PIE].getYSEOPConfig;
//endregion

// region SANKEY_CHART
specImplementation[chartTypes.SANKEY_CHART] = {};
specImplementation[chartTypes.SANKEY_CHART].configOptions = function() {
    return {
        allowedConfigurations: {
            showDataLabels: false
        }
    };
};

specImplementation[chartTypes.SANKEY_CHART].getBaseQuery =
    function(chartModel, axisConfig) {
    let valueColumns = [axisConfig.yAxisColumns[0].getJson()],
        categoryColumns = [
            axisConfig.xAxisColumns[0],
            axisConfig.xAxisColumns[1]
            ].map(c => c.getJson()),
        seriesColumns = [];
    return {
        valueColumns,
        categoryColumns,
        seriesColumns
    };
};
specImplementation[chartTypes.SANKEY_CHART].getExtraQueries =
    function(axisConfig: ChartAxisConfig,
    chartModel: ChartModel): QueryConfig[] {
    let measureColumn = axisConfig.yAxisColumns[0].getJson();

    // do not take first column as it's already used in base query
    return axisConfig.xAxisColumns.slice(1, axisConfig.xAxisColumns.length - 1).map(
        (column, index) => getExtraQueryForNetworkModel(
            column.getJson(), // source column
            axisConfig.xAxisColumns[index + 2].getJson(), // target column
            measureColumn, // value column
            getHiddenColumns(chartModel)
        ));
};
specImplementation[chartTypes.SANKEY_CHART].computeBestChartAxisConfig = function (chartDetails) {
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };
    if (!chartDetails.attributeColumns.length || !chartDetails.measureColumns.length) {
        return null;
    }
    if (chartDetails.attributeColumns.length < 2) {
        return null;
    }

    bestConfig.yAxisColumns.push(chartDetails.measureColumns[0]);
    bestConfig.xAxisColumns = bestConfig.xAxisColumns.concat(
        chartDetails.sortedAttributeColumns.filter(function (column) {
            let cardinalty = chartDetails.cardinalityData[column.getSageOutputColumnId()];
            return cardinalty !== 0;
        })
    );
    return bestConfig.xAxisColumns.length > 1 ? bestConfig : null;
};

specImplementation[chartTypes.SANKEY_CHART].validateAxisConfig = function (axisConfig) {

    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (!!axisConfig.radialColumn || axisConfig.legendColumns.length > 0) {
        return false;
    }

    if (axisConfig.xAxisColumns.length > 1 && axisConfig.yAxisColumns.length === 1) {
        return true;
    }

    return false;
};

specImplementation[chartTypes.SANKEY_CHART].getChartDataValidationError = function (chartModel) {

    // if we have more than 100 links, then chart will be unreadable
    // we could express the error in a more meaningful way

    let isValid = !chartModel.getDataArray().slice(1).some(function (queryData) {
        return queryData
                .info
                .totalRowCount > chartSpecificConstants.SANKEY_CHART_CARDINALITY_THRESHOLD;
    });

    return isValid ? null : strings.dataDisabledChartExplanation.CARDINALITY
        .assign(chartSpecificConstants.SANKEY_CHART_CARDINALITY_THRESHOLD);
};

// end region


//region SPIDER_WEB
//TODO: 1. Update chart icon in
//   blink/app/resources/img/viz-selector-icons/chart-icons/spider_web_icon_24.svg
//   and blink/app/resources/css/icons.less
//2. Enable tooltips on Y-Axis
//3. Chart should be able to take more than one measures and attributes
specImplementation[chartTypes.SPIDER_WEB] = {highchartsType: 'polar'};
specImplementation[chartTypes.SPIDER_WEB].computeBestChartAxisConfig = function (chartDetails) {
    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.measureColumns.length === 0) {
        return null;
    }
    if (chartDetails.sortedAttributeColumns.length) {
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
        bestConfig.yAxisColumns.push(chartDetails.measureColumns[0]);
        return bestConfig;
    }

    return null;
};
specImplementation[chartTypes.SPIDER_WEB].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) { //allow multiple attributes
        return false;
    }

    if (containsGrowthColumn(axisConfig.yAxisColumns)) {
        return false;
    }

    return !axisConfig.radialColumn;
};
specImplementation[chartTypes.SPIDER_WEB].getChartDataValidationError = function (chartModel) {
    let data = chartModel.getDefaultQueryData();

    if (data.length > chartSpecificConstants.SPIDER_WEB_CHART_CARDINALITY_THRESHOLD) {
        return strings.dataDisabledChartExplanation.CARDINALITY
            .assign(chartSpecificConstants.SPIDER_WEB_CHART_CARDINALITY_THRESHOLD);
    }

    return null;
};

specImplementation[chartTypes.SPIDER_WEB].configOptions = function (vizModel) {
    return {
        cardinalityIndexStartsFromZero: true,
        highcharts: {
            chart: {
                polar: true,
                type: 'line'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: getInfoText(vizModel),
                verticalAlign: 'bottom',
                y: 13
            },
            pane: {
                startAngle: 180
            },
            xAxis: {
                tickmarkPlacement: 'on',
                lineWidth: 0,
            },
            yAxis: {
                gridLineInterpolation: 'polygon',
                tickmarkPlacement: 'on',
                lineWidth: 0
            }
        }
    };
};
//endregion

//region LINE_STACKED_COLUMN
specImplementation[chartTypes.LINE_STACKED_COLUMN] = {};
specImplementation[chartTypes.LINE_STACKED_COLUMN].computeBestChartAxisConfig =
    function (chartDetails) {
    if ((!chartDetails.attributeColumns.length
        && !chartDetails.timeSeriesColumns.length)
        || !(chartDetails.measureColumns.length)) {
        return null;
    }

    if (chartDetails.measureColumns.length < 2) {
        return null;
    }

    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    if (chartDetails.isGrowthQuery) {
        if (chartDetails.attributeColumns.length > 0) {
            bestConfig.xAxisColumns.push(chartDetails.growthByColumn);
            let yAxisColumn = chartDetails.measureColumns.find(function (column) {
                return !column.isGrowth();
            });
            bestConfig.yAxisColumns.push(yAxisColumn);
            bestConfig.yAxisColumns.push(chartDetails.growthColumn);
            angular.forEach(chartDetails.sortedAttributeColumns, function (column) {
                tryAddingLegendColumn(
                    bestConfig.legendColumns,
                    chartDetails.cardinalityData,
                    column
                );
            });
            if (bestConfig.legendColumns.length === 0) {
                return null;
            }
            return bestConfig;
        }
        return null;
    }

    bestConfig.yAxisColumns.push(chartDetails.measureColumns[0]);
    bestConfig.yAxisColumns.push(chartDetails.measureColumns[1]);

    if (chartDetails.sortedAttributeColumns.length === 0) {
        if (chartDetails.timeSeriesColumns.length < 2) {
            return null;
        } else {
            bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
            bestConfig.legendColumns.push(chartDetails.timeSeriesColumns[1]);
        }
    } else if (chartDetails.sortedAttributeColumns.length === 1) {
        if (chartDetails.timeSeriesColumns.length) {
            bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
            bestConfig.legendColumns.push(chartDetails.sortedAttributeColumns[0]);
        } else {
            return null;
        }
    } else {
        let attributeColumnCount = chartDetails.sortedAttributeColumns.length;
        bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[attributeColumnCount - 1]);
        let index = 0;
        while (index < attributeColumnCount - 1) {
            tryAddingLegendColumn(
                bestConfig.legendColumns,
                chartDetails.cardinalityData,
                chartDetails.sortedAttributeColumns[index]);
            index++;
        }
        // NOTE: In the case where we have 2 or more legend columns and tryAddingLegend fails
        // We choose to add the column with lowest cardinality on Legend to support this chart
        // anyways.
        if (bestConfig.legendColumns.length === 0) {
            bestConfig.legendColumns.push(chartDetails.sortedAttributeColumns[0]);
        }
    }

    return bestConfig;
};
specImplementation[chartTypes.LINE_STACKED_COLUMN].getBaseQuery =
function(chartModel, axisConfig) {
    return _getBaseQuery(chartModel,
        axisConfig.xAxisColumn,
        axisConfig.yAxisColumns.slice(0, 1),
        axisConfig.legendColumns,
        axisConfig.radialColumn);
};

specImplementation[chartTypes.STACKED_COLUMN].getExtraQueries =
    function(axisConfig: ChartAxisConfig,
             chartModel: ChartModel): QueryConfig[] {

    let extraQueryConfig: QueryConfig = {
        categories: { columns: []},
        values: { columns: []},
        hiddenColumns:  getHiddenColumns(chartModel)
    };
    extraQueryConfig = axisConfig.xAxisColumns
        .reduce((acc, axisColumn: VisualizationColumnModel) => {
            let colJson = axisColumn.getJson();
            if (!axisColumn.isNumeric()) {
                acc.categories.columns.push(colJson);
            } else {
                acc.values.columns.push(colJson);
            }
            return acc;
        }, extraQueryConfig);
    // NOTE: In the current model there are some columns needed to be sent to falcon for query
    // generation in some cases. Callosum just adds them to model right away so that they get
    // picked up for query gen. In this case when we create new query definitions so we need
    // to inherit these columns.
    // Ideally  this should be removed and query generation layer in callosum should absorb this
    // logic.
    let yAxisColumnsInAugmentDataQuery = axisConfig.yAxisColumns.slice(1);
    extraQueryConfig.values.columns =
        yAxisColumnsInAugmentDataQuery
            .map((column) => column.getJson())
            .concat(extraQueryConfig.values.columns);

    return [extraQueryConfig];
};


specImplementation[chartTypes.LINE_STACKED_COLUMN].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (axisConfig.xAxisColumns.length
        && axisConfig.yAxisColumns.length >= 2
        && axisConfig.legendColumns.length
    ) {
        return true;
    }

    return false;
};

specImplementation[chartTypes.LINE_STACKED_COLUMN].configOptions = function (chartModel) {
    let config: any = {
        highcharts: {
            plotOptions: {
                column: {
                    stacking: chartModel && chartModel.isYAxisStackedAsPercent()
                        ? 'percent' : 'normal',
                    groupPadding: 0.01
                },
                series: {
                    lineWidth: 4,
                    borderWidth: 0.5
                }
            }
        },
        allowLegendWithMultipleY: true,
        displayYValuesWithLegendSeries: true,
        shouldBringSelectedSeriesToFront: false,
        allowedConfigurations: {
            showYAxisAsPercent: true,
            zoomPanStateToggle: true,
            yAxisRange: true
        }
    };

    if (chartModel && chartModel.isYAxisStackedAsPercent()) {
        let valueColumn = chartModel.getYAxisColumns()[0];
        config.highcharts.yAxis = [{
            labels: {
                formatter: function () {
                    if (this.isTooltip) {
                        return chartModel.getLabelForNumericColumn(
                            this.value,
                            valueColumn,
                            [],
                            {
                                noShorten: false
                            }
                        );
                    } else {
                        return util.formatDataLabel(this.value / 100, {
                            isDouble: true,
                            isPercent: true
                        });
                    }
                }
            }
        }];
    }

    return config;
};

specImplementation[chartTypes.LINE_STACKED_COLUMN].seriesOverride = function (vizModel) {
    let series = vizModel.getSeries();
    let totalSeries = series.length;
    let yAxisColumns = vizModel.getYAxisColumns();
    let yAxisColumnsAsLines = yAxisColumns.slice(1);
    yAxisColumnsAsLines.forEach(function (column, index) {
        let lineSeries = series[totalSeries - index - 1];
        lineSeries.type = chartTypes.LINE.toLowerCase();
        lineSeries.zIndex = 2;
    });
};

specImplementation[chartTypes.LINE_STACKED_COLUMN].highchartsType = chartTypes.COLUMN;

specImplementation[chartTypes.LINE_STACKED_COLUMN].getStackedValuesColumn =
    getDefaultStackingValueColumn;
//endregion

//region GEO-CHARTS
// TODO (sunny): remove access to private letiables once the
// corresponding CL is in.
function basicShapeGeoTypeValidation(axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (axisConfig.xAxisColumns.length > 2) {
        return false;
    }

    let allXAxisColumnsValid = axisConfig.xAxisColumns.all(function (column) {
        return column.isGeoColumn();
    });
    if (!allXAxisColumnsValid) {
        return false;
    }
    return true;
}

function getFirstUnusedMeasureColumn(xAxisColumns, measureColumns) {
    let xAxisColumnIds = util.mapArrayToHash(xAxisColumns, function (xAxisColumn) {
        return xAxisColumn.getSageOutputColumnId();
    });
    return measureColumns.find(function (measureColumn) {
        return !Object.has(xAxisColumnIds, measureColumn.getSageOutputColumnId());
    });
}

//region GEO_AREA
function isAreaSupportedGeoColumn(geoColumn, chartType) {
    let geoConfig = geoColumn.getGeoConfig();
    // only levels big enough to draw shapes for are allowed
    return geoConfig.getType() === jsonConstants.geoConfigType.ADMIN_DIV_0
        || geoConfig.getType() === jsonConstants.geoConfigType.ADMIN_DIV_1
        || geoConfig.getType() === jsonConstants.geoConfigType.ADMIN_DIV_2
        || geoConfig.getType() === jsonConstants.geoConfigType.CUSTOM_REGION;
}

function getAreaChartBestAxisConfigComputer(chartType) {
    return function (chartDetails) {
        let measureAttribCols = [
            chartDetails.attributeColumns,
            chartDetails.measureColumns
        ].flatten();
        let validGeoColumns = measureAttribCols.filter(function (column) {
            if (!column.isGeoColumn()) {
                return false;
            }
            return isAreaSupportedGeoColumn(column, chartType);
        });

        if (validGeoColumns.length === 0) {
            return null;
        }

        let xAxisColumns = [validGeoColumns[0]];
        let yAxisColumn = getFirstUnusedMeasureColumn(xAxisColumns, chartDetails.measureColumns);

        let bestConfig = {
            xAxisColumns: xAxisColumns,
            yAxisColumns: [yAxisColumn],
            legendColumns: [],
            radialColumn: null
        };

        return bestConfig;
    };
}

function getAreaChartAxisConfigValidator(chartType) {
    return function (axisConfig) {
        if (!basicShapeGeoTypeValidation(axisConfig)) {
            return false;
        }

        if (axisConfig.xAxisColumns.length !== 1) {
            return false;
        }

        let allXAxisColumnsValid = axisConfig.xAxisColumns.all(function (column) {
            return isAreaSupportedGeoColumn(column, chartType);
        });
        return !!allXAxisColumnsValid;
    };
}

specImplementation[chartTypes.GEO_AREA] = {};
specImplementation[chartTypes.GEO_AREA].computeBestChartAxisConfig
    = getAreaChartBestAxisConfigComputer(chartTypes.GEO_AREA);
specImplementation[chartTypes.GEO_AREA].validateAxisConfig
    = getAreaChartAxisConfigValidator(chartTypes.GEO_AREA);
//endregion

function validateLatLongPairColumns(columns) {
    let latColumns = [],
        longColumns = [];
    columns.forEach(function (column) {
        let geoConfig = column.getGeoConfig();
        if (!geoConfig) {
            return;
        }
        if (geoConfig.getType() === jsonConstants.geoConfigType.LATITUDE) {
            latColumns.push(column);
        } else if (geoConfig.getType() === jsonConstants.geoConfigType.LONGITUDE) {
            longColumns.push(column);
        }
    });

    // if any of the x-axis columns is lat or long column
    // the only allowed config on x is [lat, long]
    if (latColumns.length > 0 || longColumns.length > 0) {
        if (latColumns.length !== 1 || longColumns.length !== 1) {
            return false;
        }
    }
    return true;
}

function basicPointGeoTypeValidation(axisConfig) {
    if (!basicShapeGeoTypeValidation(axisConfig)) {
        return false;
    }

    let xAxisColumns = axisConfig.xAxisColumns,
        yAxisColumns = axisConfig.yAxisColumns;

    if (!validateLatLongPairColumns(xAxisColumns)) {
        return false;
    }

    if (yAxisColumns.length === 0) {
        return false;
    }

    return true;
}

//region GEO_BUBBLE
function pointMapXAxisColumnsGenerator(chartDetails) {
    let geoColumnCount = 0,
        latitudeColumns = [],
        longitudeColumns = [],
        nonPointGeoColumns = [];

    let measureAttribCols = [chartDetails.attributeColumns, chartDetails.measureColumns].flatten();
    measureAttribCols.forEach(function (column) {
        if (!column.getGeoConfig()) {
            return;
        }
        geoColumnCount++;

        switch (column.getGeoConfig().getType()) {
            case jsonConstants.geoConfigType.LATITUDE:
                latitudeColumns.push(column);
                break;
            case jsonConstants.geoConfigType.LONGITUDE:
                longitudeColumns.push(column);
                break;
            default:
                nonPointGeoColumns.push(column);
                break;
        }
    });

    if (geoColumnCount === 0) {
        return null;
    }

    let xAxisColumns;
    if (latitudeColumns.length > 0 && longitudeColumns.length > 0) {
        xAxisColumns = [latitudeColumns[0], longitudeColumns[0]];
    } else if (nonPointGeoColumns.length > 0) {
        xAxisColumns = [nonPointGeoColumns[0]];
    } else {
        return null;
    }

    return xAxisColumns;
}

specImplementation[chartTypes.GEO_BUBBLE] = {};
specImplementation[chartTypes.GEO_BUBBLE].computeBestChartAxisConfig = function (chartDetails) {
    let xAxisColumns = pointMapXAxisColumnsGenerator(chartDetails);
    if (!xAxisColumns) {
        return null;
    }

    // geo columns like lat/long can be measures, for y-axis we pick the measure that is not
    // already picked to be on x-axis
    let yAxisColumn = getFirstUnusedMeasureColumn(xAxisColumns, chartDetails.measureColumns);
    if (!yAxisColumn) {
        return null;
    }

    let bestConfig = {
        xAxisColumns: xAxisColumns,
        yAxisColumns: [yAxisColumn],
        legendColumns: [],
        radialColumn: null
    };

    return bestConfig;
};
specImplementation[chartTypes.GEO_BUBBLE].validateAxisConfig = function (axisConfig) {
    return basicPointGeoTypeValidation(axisConfig);
};
//endregion

//region GEO_HEATMAP
specImplementation[chartTypes.GEO_HEATMAP] = {};
specImplementation[chartTypes.GEO_HEATMAP].computeBestChartAxisConfig
    = specImplementation[chartTypes.GEO_BUBBLE].computeBestChartAxisConfig;

specImplementation[chartTypes.GEO_HEATMAP].validateAxisConfig = function (axisConfig) {
    if (!basicPointGeoTypeValidation(axisConfig)) {
        return false;
    }

    // SCAL-8909: multiple series not supported in geo maps
    // TODO (sunny): update unit tests
    if (axisConfig.yAxisColumns.length !== 1) {
        return false;
    }

    if (axisConfig.legendColumns.length > 0) {
        return false;
    }

    return true;
};
//endregion
specImplementation[chartTypes.GEO_EARTH_AREA] = {};
specImplementation[chartTypes.GEO_EARTH_AREA].computeBestChartAxisConfig
    = getAreaChartBestAxisConfigComputer(chartTypes.GEO_EARTH_AREA);
specImplementation[chartTypes.GEO_EARTH_AREA].validateAxisConfig
    = getAreaChartAxisConfigValidator(chartTypes.GEO_EARTH_AREA);


specImplementation[chartTypes.GEO_EARTH_BUBBLE]
    = specImplementation[chartTypes.GEO_EARTH_BAR]
    = specImplementation[chartTypes.GEO_BUBBLE];
specImplementation[chartTypes.GEO_EARTH_HEATMAP] = specImplementation[chartTypes.GEO_HEATMAP];

specImplementation[chartTypes.GEO_EARTH_GRAPH] = {};
specImplementation[chartTypes.GEO_EARTH_GRAPH].
    computeBestChartAxisConfig = function (chartDetails) {
    if ((chartDetails.attributeColumns.length) < 2 || chartDetails.measureColumns.length < 1) {
        return null;
    }

    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    let geoColumns = chartDetails.sortedAttributeColumns.filter(function (column) {
        if (!column.isGeoColumn()) {
            return false;
        }

        // Note (sunny): without support for a composite lat/long column blink can't
        // automatically group two lat/long pairs correctly with a guarantee against
        // matching lat of one entity to the long of another. Hence we ignore all
        // lat/long columns when auto generating config for geo-graph.
        let geoConfigType = column.getGeoConfig().getType();
        return geoConfigType !== jsonConstants.geoConfigType.LATITUDE &&
            geoConfigType !== jsonConstants.geoConfigType.LONGITUDE;
    });

    if (geoColumns.length < 2) {
        return null;
    }
    bestConfig.xAxisColumns.push(geoColumns[0]);
    bestConfig.yAxisColumns.push(geoColumns[1]);
    bestConfig.radialColumn = chartDetails.measureColumns[0];

    return bestConfig;
};
specImplementation[chartTypes.GEO_EARTH_GRAPH].validateAxisConfig = function (axisConfig) {
    if (!basicPointGeoTypeValidation(axisConfig)) {
        return false;
    }

    if (!validateLatLongPairColumns(axisConfig.xAxisColumns)) {
        return false;
    }
    if (!validateLatLongPairColumns(axisConfig.yAxisColumns)) {
        return false;
    }

    let allYAxisColumnsGeo = axisConfig.yAxisColumns.all(function (column) {
        return column.isGeoColumn();
    });
    if (!allYAxisColumnsGeo) {
        return false;
    }

    if (!axisConfig.radialColumn || !axisConfig.radialColumn.isEffectivelyNumeric()) {
        return false;
    }

    return true;
};
specImplementation[chartTypes.GEO_EARTH_GRAPH].configOptions = function (chartModel) {
    function getDataLabel(value) {
        let valueColumn = chartModel.getRadialColumn();
        return chartModel.getLabelForNumericColumn(
            value,
            valueColumn,
            [],
            {
                noShorten: false,
                nDecimal: valueColumn.isEffectivelyPercent() ? 4 : 2
            }
        );
    }

    return {
        radialEnabled: true,
        doNotDisplayLegend: true,
        attributesOnYAxis: true,
        noMeasuresOnYAxis: true,
        axesAlias: {
            xAxis: 'Origin',
            yAxis: 'Destination',
            radial: 'Value'
        },
        containsNativeLegend: true,
        dataLabelFormatter: function () {
            return getDataLabel(this.point.value);
        },
        allowedConfigurations: {
            geoProjectionType: true,
            showYAxisAsPercent: false,
            overlayHeatMap: false,
            zoomPanStateToggle: false
        }
    };
};

function isColumnStdDevOrletiance(column) {
    let aggType = column.getTrueEffectiveAggregateType();
    return aggType === util.aggregateTypes.letIANCE
        || aggType === util.aggregateTypes.STD_DEVIATION;
}

//region PIVOT_TABLE
specImplementation[chartTypes.PIVOT_TABLE] = {};
specImplementation[chartTypes.PIVOT_TABLE].computeBestChartAxisConfig = function (chartDetails) {
    if ((!chartDetails.attributeColumns.length && !chartDetails.timeSeriesColumns.length)
        || !(chartDetails.measureColumns.length)) {
        return null;
    }

    let candidateMeasures = chartDetails.measureColumns.filter(function (column) {
        return !isColumnStdDevOrletiance(column);
    });

    if (candidateMeasures.length === 0) {
        return null;
    }


    let bestConfig = {
        xAxisColumns: [],
        yAxisColumns: [],
        legendColumns: [],
        radialColumn: null
    };

    bestConfig.yAxisColumns.push(candidateMeasures[0]);

    if (chartDetails.timeSeriesColumns.length) {
        bestConfig.xAxisColumns.push(chartDetails.timeSeriesColumns[0]);
    }

    if (chartDetails.sortedAttributeColumns.length === 1) {
        if (bestConfig.xAxisColumns.length === 0) {
            bestConfig.xAxisColumns.push(chartDetails.sortedAttributeColumns[0]);
        } else {
            bestConfig.legendColumns.push(chartDetails.sortedAttributeColumns[0]);
        }
    } else if (chartDetails.sortedAttributeColumns.length > 1) {
        bestConfig.legendColumns.push(chartDetails.sortedAttributeColumns[0]);
        Array.prototype.push.apply(bestConfig.xAxisColumns,
            chartDetails.sortedAttributeColumns.slice(1));
    }

    return bestConfig;
};
specImplementation[chartTypes.PIVOT_TABLE].validateAxisConfig = function (axisConfig) {
    if (!axisConfig.xAxisColumns || !axisConfig.yAxisColumns || !axisConfig.legendColumns) {
        return false;
    }

    if (!areAllEffectivelyNumeric(axisConfig.yAxisColumns)) {
        return false;
    }

    if (!areAllEffectivelyNonNumeric(axisConfig.xAxisColumns)) {
        return false;
    }

    if (!areAllEffectivelyNonNumeric(axisConfig.legendColumns)) {
        return false;
    }

    let isStdDevOrletiance = axisConfig.yAxisColumns.some(function (column) {
        return isColumnStdDevOrletiance(column);
    });
    if (!!isStdDevOrletiance) {
        return false;
    }

    if (axisConfig.yAxisColumns.length
        && (axisConfig.xAxisColumns.length + axisConfig.legendColumns.length)
        && !axisConfig.radialColumn) {
        return true;
    }

    return false;
};
specImplementation[chartTypes.PIVOT_TABLE].getChartDataValidationError = function (chartModel) {
    if (!chartModel.isDataSetComplete()) {
        return strings.dataDisabledChartExplanation.DATA_INCOMPLETE_PIVOT;
    }
};
specImplementation[chartTypes.PIVOT_TABLE].configOptions = function (chartModel) {
    return {
        radialEnabled: false,
        legendDisabled: false,
        axesAlias: {
            xAxis: 'Rows',
            yAxis: 'Measures',
            legend: 'Columns'
        },
        containsNativeLegend: false,
        doNotShowLegend: true,
        batchSize: 100000,
        allowLegendWithMultipleY: true,
        allowedConfigurations: {
            overlayHeatMap: true,
            showDataLabels: false
        }
    };
};
//endregion

function isStackedChart(chartType) {
    return stackedChartTypes.any(chartType);
}
function isLineStackedColumnChart(chartType) {
    return chartType
        === chartTypes.LINE_STACKED_COLUMN;
}

function getStackedValuesColumn(chartModel) {
    let chartType = chartModel.getChartType();
    if (specImplementation[chartType].getStackedValuesColumn) {
        return specImplementation[chartType].getStackedValuesColumn(chartModel);
    }
    return;
}

function getYSEOPConfig(chartModel) {
    let chartType = chartModel.getChartType();
    if (!chartTypes.hasOwnProperty(chartType)) {
        _logger.error('Unsupported Chart Type:', chartType);
        return;
    }

    let chartTypeSpecImplementation = specImplementation[chartType];
    if (!chartTypeSpecImplementation) {
        _logger.error('Chart specification implementation missing for chart type:', chartType);
        return;
    }

    if (!chartTypeSpecImplementation.getYSEOPConfig) {
        _logger.warn('Chart doesnt Support yseop:', chartType);
        return {};
    }

    return chartTypeSpecImplementation.getYSEOPConfig(chartModel);
}

function areProvidersEqual(chartAType, chartBtype) {
    return chartTypeByProvider[chartAType] === chartTypeByProvider[chartBtype];
}


// start region
// query definition
//TODO(chab) move to an dedicated class for each chart
// 1. base query that can be overriden
// 2. extra query are provided by subclasses
// 3. move utility methods to a service
function setQueriesDefinition(axisConfig: ChartAxisConfig,
                              chartModel: ChartModel) {

    setBaseQueryForChart(chartModel, axisConfig);
    let chartSpec = specImplementation[chartModel.getChartType()];

    let chartJson = chartModel.getJson(),
        extraQueriesConfig =

    chartJson.chartConfigurations = chartSpec.getExtraQueries ?
        chartSpec.getExtraQueries(axisConfig, chartModel)
        : [];

    let queriesDefinition = getQueriesDefinitions(chartModel, extraQueriesConfig);
    chartModel.setQueryDefinitions(queriesDefinition);
    chartJson._backendConfigChanged = true;
}

function _getBaseQuery(chartModel,
                       xAxisColumns: Array<VisualizationColumnModel>,
                       yAxisColumns: Array<VisualizationColumnModel>,
                       legendColumns: Array<VisualizationColumnModel>,
                       radialColumn: VisualizationColumnModel) : any {

    let usedColumns: Array<VisualizationColumnModel> = [
        ...xAxisColumns,
        ...yAxisColumns,
        ...legendColumns
    ];

    if (radialColumn) {
        usedColumns.push(radialColumn);
    }

    let usedColumnIDs = util.mapArrayToHash(
        usedColumns,
        (column) => getUniqueIdForVizCol(column)
        ,  1);

    let categoryColumns = [],
        seriesColumns = [],
        valueColumns = [];

    xAxisColumns
        .concat(yAxisColumns)
        .forEach((axisColumn) => {
            let colJson = axisColumn.getJson();
            if (!axisColumn.isMeasure()) {
                categoryColumns.push(colJson);
            } else {
                valueColumns.push(colJson);
            }
        });

    seriesColumns = legendColumns.map((legendColumn) => legendColumn.getJson());
    // callosum expects at least one category column
    if (categoryColumns.length === 0) {
        let candidate = getCategoryColumnNotOnAnyAxis(chartModel, usedColumnIDs);
        if (!!candidate) {
            chartUtilService.setChartAxisInClientState(
                candidate,
                chartUtilService.ChartAxis.HIDDEN
            );
            categoryColumns.push(candidate.getJson());
        } else {
            let borrowedColumn = borrowSeriesColumn(seriesColumns);
            if (!!borrowedColumn) {
                categoryColumns.push(borrowedColumn);
            } else {
                // in case of numeric attributes we want to use the numeric attribute as value
                // and another attribute as category if one such attribute exists. If no
                // other attribute col is available we use the numeric attribute col as category
                // instead of value
                borrowedColumn = borrowNumericAttributeValueColumn(valueColumns);
                if (!!borrowedColumn) {
                    categoryColumns.push(borrowedColumn);
                } else {
                    _logger.error('there must be at least one category column');
                }
            }
        }
    }

    return {
        categoryColumns,
        seriesColumns,
        valueColumns
    };
}

function setBaseQueryForChart(chartModel:  ChartModel, axisConfig: ChartAxisConfig) {

    let chartSpec = specImplementation[chartModel.getChartType()],
        chartJson = chartModel.getJson();

    let {categoryColumns, seriesColumns, valueColumns} = chartSpec.getBaseQuery
        ? chartSpec.getBaseQuery(chartModel, axisConfig)
        : _getBaseQuery(chartModel,
            axisConfig.xAxisColumns,
            axisConfig.yAxisColumns,
            axisConfig.legendColumns,
            axisConfig.radialColumn);
    //

    if (axisConfig.radialColumn) {
        valueColumns.push(axisConfig.radialColumn.getJson());
    }

    chartJson.categories = chartJson.categories || {};
    chartJson.series = chartJson.series || {};
    chartJson.values = chartJson.values || {};
    chartJson.categories.columns = categoryColumns;

    if (seriesColumns.length > 0) {
        if (!chartJson.series) {
            chartJson.series = {};
        }
        chartJson.series.columns = seriesColumns;
    } else {
        if (chartJson.series) {
            delete chartJson.series;
        }
    }
    if (valueColumns.length === 0) {
        delete chartJson.values;
    } else {
        chartJson.values.columns = valueColumns;
    }
}


function borrowSeriesColumn (seriesColumns) {
    if (seriesColumns.length > 0) {
        return seriesColumns.pop();
    }
    return null;
}

function borrowNumericAttributeValueColumn(valueColumns) {
    let numericAttributeValueCol = valueColumns.find((col) =>
        col.effectiveType.toLowerCase() === 'attribute'
    );
    if (!numericAttributeValueCol) {
        return null;
    }
    valueColumns.remove(numericAttributeValueCol);
    return numericAttributeValueCol;
}

function getHiddenColumns(chartModel: ChartModel) {
    return chartModel.getJson().hiddenColumns;
}

/**
 *
 * This adds an extra query that models a flow between two series of nodes,
 * each serie corresponding to the value of an attribute column.
 * The value of the flow is given by a measure column.
 *
 * @param sourceNodeColumnJson
 * @param targetNodeColumnJson
 * @param valueColumnJson
 * @param hiddenColumns
 * @param chartJson
 */
function getExtraQueryForNetworkModel(sourceNodeColumnJson,
                                      targetNodeColumnJson,
                                      valueColumnJson,
                                      hiddenColumns: any[]): QueryConfig {
    return {
        categories : {
            columns : [
                sourceNodeColumnJson,
                targetNodeColumnJson,
            ]
        },
        values: {
            columns : [
                valueColumnJson
            ]
        },
        hiddenColumns
    };
}

function getQueriesDefinitions(chartModel: ChartModel,
                               extraQueriesConfig: QueryConfig[]): ChartQueryDefinition[] {

    if (!chartModel) {
        return [];
    }

    let defaultQueryDefinitions = [getDefaultQueryDefinition(chartModel)];
    return defaultQueryDefinitions.concat(
        extraQueriesConfig.map((queryDefinitionJson) => ChartQueryDefinition.generateQueryFromJson(
            queryDefinitionJson.categories,
            queryDefinitionJson.series,
            queryDefinitionJson.values))
    );
}

function searchForNotUsedColumn(columns, columnIds) {
    return columns.find((column) => !columnIds.hasOwnProperty(getUniqueIdForVizCol(column)));
}

function getDefaultQueryDefinition(chartModel: ChartModel): ChartQueryDefinition {
    let chartJson = chartModel.getJson();

    let defaultQueryDefinition: ChartQueryDefinition = ChartQueryDefinition.generateQueryFromJson(
        chartJson.categories,
        chartJson.series,
        chartJson.values);
    if (!defaultQueryDefinition) {
        _logger.error('Error in generating default query definition');
    }
    return defaultQueryDefinition;
}

function getCategoryColumnNotOnAnyAxis (chartModel, usedColumnIDs) {
    let columnNotOnAnyAxis = chartModel.getCategoryColumnNotOnAxis();
    if (!!columnNotOnAnyAxis &&
        !usedColumnIDs.hasOwnProperty(getUniqueIdForVizCol(columnNotOnAnyAxis))) {
        return columnNotOnAnyAxis;
    }
    columnNotOnAnyAxis = searchForNotUsedColumn(
        chartModel.getSortedAttributeColumns().concat(chartModel.getTimeSeriesColumns()),
        usedColumnIDs);

    return columnNotOnAnyAxis;
}
// TODO(Rahul): Pre-3.1 answers lack sageOutputColumnId, here we use vizColumnId as a backup Id.
// This should be gotten rid once we fix missing sageOutputColumnId in an upgrade script in callosum
function getUniqueIdForVizCol(column) {
    return column.getSageOutputColumnId() || column.getId();
}

Provide('chartTypeSpecificationService')({
    chartTypes,
    chartProviders,
    chartTypesInDisplayOrder,
    // Functions:
    areProvidersEqual,
    getQueriesDefinitions,
    getUniqueIdForVizCol,
    isGeoChartType,
    isStackedChart,
    isLineStackedColumnChart,
    isGeoMapChartType,
    isGeoEarthChartType,
    isPivotChartType,
    isHighchartType,
    isNetworkChartType,
    getChartProvider,
    computeBestChartAxisConfig,
    validateAxisConfig,
    seriesOverride,
    configOptions,
    getDisabledChartTooltip,
    getChartDataValidationError,
    isXAxisVertical,
    getHighchartsType,
    setQueriesDefinition,
    useMeasureOnXAxisAsOrdinal,
    useOrdinalXAxis,
    getStackedValuesColumn,
    getYSEOPConfig
});
export {
    // Objects:
    chartTypes,
    chartProviders,
    chartTypesInDisplayOrder,
    // Functions:
    init,
    areProvidersEqual,
    getQueriesDefinitions,
    getUniqueIdForVizCol,
    isGeoChartType,
    isStackedChart,
    isLineStackedColumnChart,
    isGeoMapChartType,
    isGeoEarthChartType,
    isPivotChartType,
    isHighchartType,
    isNetworkChartType,
    getChartProvider,
    computeBestChartAxisConfig,
    validateAxisConfig,
    seriesOverride,
    configOptions,
    getDisabledChartTooltip,
    getChartDataValidationError,
    isXAxisVertical,
    getHighchartsType,
    setQueriesDefinition,
    useMeasureOnXAxisAsOrdinal,
    useOrdinalXAxis,
    getStackedValuesColumn,
    getYSEOPConfig
};


