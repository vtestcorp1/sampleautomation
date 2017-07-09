/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides a service that determines the chart default chart axis configuration
 * and the chart type.
 */


'use strict';

blink.app.factory('defaultChartConfigService', ['bestChartAxisConfigService',
    'ChartAxisConfig',
    'chartPersistedStore',
    'chartTypeSpecificationService',
    'chartUtilService',
    'jsonConstants',
    'util',
    function (bestChartAxisConfigService,
          ChartAxisConfig,
          chartPersistedStore,
          chartTypeSpecificationService,
          chartUtilService,
          jsonConstants,
          util) {

        var me = {};

        var columnEffectiveIdGetter = function(column) {
            return column.getSageOutputColumnId();
        };

    // This function checks if this is a modification to the chart visualization user was viewing
    // and all columns in the chart are the exact same.
    // In this case we would like to retain the config user was viewing before the transformation.
        function checkIfAllColumnsChangedAndReturnConfig(chartModel) {
        // if the new answer has exactly same columns we retreive last viewed config.
            var previousConfig = chartPersistedStore.getConfig(chartModel.getId());

            if (!previousConfig) {
                return null;
            }

            var allColumns = chartModel.getColumns();
            if (!allColumns || !allColumns.length) {
                return null;
            }

            if (previousConfig.allColumnIds.length != allColumns.length){
                return null;
            }

            var allColumnIds = allColumns.map(columnEffectiveIdGetter),
                allColumnsMap = util.mapArrayToHash(allColumns, columnEffectiveIdGetter);

            var allColumnsMatch = previousConfig.allColumnIds.every(function(columnId) {
                return allColumnsMap.hasOwnProperty(columnId);
            });

            if (allColumnsMatch) {
                var matchingXColumns = [];
                previousConfig.xAxisColumnIds.forEach(function (id) {
                    matchingXColumns.push(allColumnsMap[id]);
                });
                var matchingYColumns = [];
                previousConfig.yAxisColumnIds.forEach(function (id) {
                    matchingYColumns.push(allColumnsMap[id]);
                });
                var matchingLegendColumns = [];
                previousConfig.legendColumnIds.forEach(function (id) {
                    matchingLegendColumns.push(allColumnsMap[id]);
                });
                var matchingRadialColumn = allColumns.find(function(column) {
                    return column.getSageOutputColumnId() == previousConfig.radialColumnId;
                });


                var axisConfig = new ChartAxisConfig(
                matchingXColumns,
                matchingYColumns,
                matchingLegendColumns,
                matchingRadialColumn
            );
                var chartType = previousConfig.chartType;
                var isConfigValid = chartTypeSpecificationService.validateAxisConfig(chartType, axisConfig);

                if(isConfigValid) {
                    return {
                        axisConfig: axisConfig,
                        chartType: chartType
                    };
                }
            }

            return null;
        }

        me.getDefaultAxisConfigAndChartType = function (chartModel) {
            var chartTransformationConfig = checkIfAllColumnsChangedAndReturnConfig(chartModel);
            if (!!chartTransformationConfig) {
                return chartTransformationConfig;
            }

            var bestChartAxisConfigMap =
            bestChartAxisConfigService.computeChartTypesToBestAxisConfigMap(chartModel);

            var chartType = null;

        // Constants
            var BUBBLE_CHART_SINGLE_YAXIS_MIN_CARDINALITY_THRESHOLD = 10,
                VERY_HIGH_CARDINALITY_THRESHOLD = 30;

        // Input data read from chart model
            var measureColumns = chartModel.getMeasureColumns(),
                numMeasureColumns = measureColumns.length,
                timeSeriesColumns = chartModel.getTimeSeriesColumns(),
                numTimeSeriesColumns = timeSeriesColumns.length,
                chartedAsAttributeColumns = chartModel.getAttributeColumns().subtract(timeSeriesColumns),
                numChartedAsAttributeColumns = chartedAsAttributeColumns.length,
                columnCardinality = chartModel.getCardinalityData();

        // we don't support more than two attribute columns in default configurations so we select the "best" two
        // attribute columns we would want to include
            var attrCol1, attrCol2, attrColId1, attrColId2, attrColCardinality1, attrColCardinality2;

        // lower cardinality is better than higher cardinality
            var bestAttributeColumns = chartedAsAttributeColumns.sort(function(col1, col2){
                var colId1 = col1.getSageOutputColumnId(),
                    colId2 = col2.getSageOutputColumnId(),
                    colCardinality1 =  columnCardinality[colId1],
                    colCardinality2 =  columnCardinality[colId2];
                return colCardinality1 - colCardinality2;
            });

            attrCol1 = bestAttributeColumns[0];
            attrCol2 = bestAttributeColumns[1];
            attrColId1 = attrCol1 && attrCol1.getSageOutputColumnId();
            attrColId2 = attrCol2 && attrCol2.getSageOutputColumnId();
            attrColCardinality1 =  attrCol1 && columnCardinality[attrColId1];
            attrColCardinality2 =  attrCol2 && columnCardinality[attrColId2];

        /*global flags*/
            if (flags.getValue('enableWebGLMaps')) {
                if (!!bestChartAxisConfigMap[chartTypeSpecificationService.chartTypes.GEO_EARTH_AREA]) {
                    chartType = chartTypeSpecificationService.chartTypes.GEO_EARTH_AREA;
                } else if (!!bestChartAxisConfigMap[chartTypeSpecificationService.chartTypes.GEO_EARTH_BUBBLE]) {
                    chartType = chartTypeSpecificationService.chartTypes.GEO_EARTH_BUBBLE;
                }
            } else {
                if (!!bestChartAxisConfigMap[chartTypeSpecificationService.chartTypes.GEO_AREA]) {
                    chartType = chartTypeSpecificationService.chartTypes.GEO_AREA;
                } else if (!!bestChartAxisConfigMap[chartTypeSpecificationService.chartTypes.GEO_BUBBLE]) {
                    chartType = chartTypeSpecificationService.chartTypes.GEO_BUBBLE;
                }
            }

            if (!chartType && numMeasureColumns === 1 && numChartedAsAttributeColumns === 0) {
                if (numTimeSeriesColumns >= 1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                }
            }

            if (!chartType && numMeasureColumns === 1 && numChartedAsAttributeColumns === 1) {
                if (numTimeSeriesColumns >= 1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                } else {
                    chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                }
            }

            if (!chartType && numMeasureColumns === 1 && numChartedAsAttributeColumns === 2) {
                if (numTimeSeriesColumns === 1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                } else {
                    if (attrColCardinality1 <= 5 && attrColCardinality2 <= 10) {
                        chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                    } else if (attrColCardinality1 > 30 && attrColCardinality2 > 30) {
                        chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                    } else if (attrColCardinality1 < 30 && attrColCardinality2 > 30) {
                        chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
                    } else {
                        chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
                    }
                }
            }

            if (!chartType && numMeasureColumns === 2 && numChartedAsAttributeColumns === 0) {
                if (numTimeSeriesColumns >= 1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                }
            }

            if (!chartType && numMeasureColumns === 2 && numChartedAsAttributeColumns === 1) {
                if (numTimeSeriesColumns === 1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                }
                if (numTimeSeriesColumns === 0) {
                    if (attrColCardinality1 > VERY_HIGH_CARDINALITY_THRESHOLD) {
                        chartType = chartTypeSpecificationService.chartTypes.SCATTER;
                    } else {
                        chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                    }
                }
            }

            if (!chartType && numMeasureColumns === 2 && numChartedAsAttributeColumns === 2 && numTimeSeriesColumns === 0) {
                if (attrColCardinality1 * attrColCardinality2 <= VERY_HIGH_CARDINALITY_THRESHOLD) {
                    chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                } else {
                    chartType = chartTypeSpecificationService.chartTypes.SCATTER;
                }
            }

            if (!chartType && numMeasureColumns === 3 && numChartedAsAttributeColumns === 0) {
                if (numTimeSeriesColumns === 1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                }
            }

            if (!chartType && numMeasureColumns === 3 && numChartedAsAttributeColumns === 1) {
                if (numTimeSeriesColumns === 0) {
                    if (attrColCardinality1 > BUBBLE_CHART_SINGLE_YAXIS_MIN_CARDINALITY_THRESHOLD) {
                        chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
                    } else {
                        chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                    }
                }
                if (numTimeSeriesColumns === 1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                }
            }

            if (!chartType && numMeasureColumns === 3 && numChartedAsAttributeColumns === 2) {
                chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            }

            if (!chartType && numMeasureColumns === 4 && numChartedAsAttributeColumns === 0 && numTimeSeriesColumns === 1) {
                chartType = chartTypeSpecificationService.chartTypes.LINE;
            }

            if (!chartType && numMeasureColumns === 4 && numChartedAsAttributeColumns === 1) {
                if (attrColCardinality1 > BUBBLE_CHART_SINGLE_YAXIS_MIN_CARDINALITY_THRESHOLD) {
                    chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
                } else {
                    chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                }
            }

            return {
                axisConfig: bestChartAxisConfigMap[chartType] || {
                    xAxisColumns: [],
                    yAxisColumns: [],
                    legendColumns: [],
                    radialColumn: null
                },
                chartType: chartType
            };
        };

        return me;
    }]);
