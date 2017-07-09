/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides a service to handle backward compatibility for charts.
 * Provides old default chart type and axis config and best axis configs per chart type.
 */


'use strict';

blink.app.factory('chartBackwardCompatibilityService', ['axisColumnValidationService',
    'ChartAxisConfig',
    'chartTypeSpecificationService',
    'chartUtilService',
    'Logger',
    'jsUtil',
    'util',
    function (axisColumnValidationService,
          ChartAxisConfig,
          chartTypeSpecificationService,
          chartUtilService,
          Logger,
          jsUtil,
          util) {
    /**
     * A utility class to compare axis-column configurations.
     * The comparison is done in the context of a given chart model and chart type. Sorting order depends on:
     * 1. whether the config has the chart type as its most preferred chart type (from among all chart types it supports)
     * 2. how different is the config from the config of the given chart model.
     *
     * This class aggressively caches preferred chart type and edit distance information for configs for performance
     * @param chartModel
     * @constructor
     */
        var ColumnConfigComparator = function (chartModel) {
            this._chartModel = chartModel;

            this._columnConfigPreferredChartTypeCache = {};
            this._columnConfigEditDistanceCache = {};
            this._currentColumnConfig = [this._chartModel.getXAxisColumns(),
                this._chartModel.getYAxisColumns(),
                this._chartModel.getLegendColumns()];
        };

        ColumnConfigComparator.prototype = {
            compare: function (chartType, config1, config2) {
                var preferredChartType1 = this._getPreferredChartType(config1),
                    preferredChartType2 = this._getPreferredChartType(config2);

            // a configuration which has this chart type as a preferred chart type is better than the one
            // which supports this but prefers another chart type
                if (preferredChartType1 == chartType && preferredChartType2 !== chartType) {
                    return -1;
                }
                if (preferredChartType2 == chartType && preferredChartType1 !== chartType) {
                    return 1;
                }

                var editDistance1 = this._getEditDistance(this._currentColumnConfig, config1),
                    editDistance2 = this._getEditDistance(this._currentColumnConfig, config2);
                return editDistance1 - editDistance2;
            },
            cleanup: function (configs) {
                configs.each(function(config){
                    delete config.__columnConfigId;
                });
            },
            _getConfigId: function(config) {
                var configId = config.__columnConfigId;
                if (!configId) {
                    configId = config.__columnConfigId = jsUtil.generateUUID();
                }
                return configId;
            },
            _getCacheKey: function (config1, config2) {
                var configId1 = this._getConfigId(config1),
                    configId2 = this._getConfigId(config2);
                return configId1 + ';' + configId2;
            },
            _getPreferredChartType: function (config) {
                var configId = this._getConfigId(config);
                if (!this._columnConfigPreferredChartTypeCache.hasOwnProperty(configId)) {
                    var preferredChartType = this._getPreferredSupportedChartType(config[0], config[1], config[2]);
                    this._columnConfigPreferredChartTypeCache[configId] = preferredChartType;
                }
                return this._columnConfigPreferredChartTypeCache[configId];

            },
            _getEditDistance: function (config1, config2) {
                var cacheKey = this._getCacheKey(config1, config2);
                if (this._columnConfigEditDistanceCache.hasOwnProperty(cacheKey)) {
                    return this._columnConfigEditDistanceCache[cacheKey];
                }

                var columnIdToPositions = {};
                [config1, config2].each(function(config, configIndex){
                    config.each(function(axisColumns, axisIndex){
                        axisColumns.each(function(column, columnIndexInAxis){
                            var columnId = getUniqueIdForVizColumn(column);
                            if (!columnIdToPositions.hasOwnProperty(columnId)) {
                                columnIdToPositions[columnId] = [];
                            }
                            columnIdToPositions[columnId].push({
                                configIndex: configIndex,
                                axisIndex: axisIndex,
                                columnIndexInAxis: columnIndexInAxis
                            });
                        });
                    });
                });

            /**
             * costs:
             * - moving around on the same axis: 1
             * - moving from one axis to the other: 2
             * - deleting: 3
             * - adding: 4
             *
             * Note (sunny): these costs might need fine-tuning
             */
                var editDistance = 0;
                Object.keys(columnIdToPositions).each(function(columnId){
                    var positions = columnIdToPositions[columnId];
                    if (positions.length === 1) {
                        if (positions[0].configIndex === 0) {
                        // deleted
                            editDistance += 3;
                        } else {
                        // added
                            editDistance += 4;
                        }
                        return;
                    }

                // column is in both the configs

                // column moved from one axis to the other
                    if (positions[0].axisIndex !== positions[1].axisIndex) {
                        editDistance += 2;
                    } else {
                    // column stayed in the same axis
                        if (positions[0].columnIndexInAxis !== positions[1].columnIndexInAxis) {
                            editDistance += 1;
                        }
                    }
                });

                this._columnConfigEditDistanceCache[cacheKey] = editDistance;
                return editDistance;
            },
            _getPreferredSupportedChartType: function(xAxisColumns, yAxisColumns, legendColumns, categoryColumn, radialColumn) {
                var allColumns = [xAxisColumns, yAxisColumns, legendColumns].flatten();
                if (categoryColumn) {
                    allColumns.push(categoryColumn);
                }
                if (radialColumn) {
                    allColumns.push(radialColumn);
                }

                var measureColumns = allColumns.filter(function(column){
                        return column.isEffectivelyNumeric();
                    }),
                    attributeColumns = allColumns.filter(function(column){
                        return column.isEffectivelyNonNumeric();
                    }),
                    numMeasures = measureColumns.length,
                    numAttributes = attributeColumns.length;

                if (numMeasures <= 1) {
                    if (numAttributes === 1) {
                        return this._chartModel.isTimeSeries()
                        ? chartTypeSpecificationService.chartTypes.LINE
                            : chartTypeSpecificationService.chartTypes.COLUMN;
                    }
                // should become sunny chart once supported
                    return chartTypeSpecificationService.chartTypes.COLUMN;
                } else {
                    if (radialColumn) {
                        return chartTypeSpecificationService.chartTypes.BUBBLE;
                    }
                    return chartTypeSpecificationService.chartTypes.SCATTER;
                }

                return chartTypeSpecificationService.chartTypes.COLUMN;
            }
        };

    // TODO(Rahul): Pre-3.1 answers lack sageOutputColumnId, here we use vizColumnId as a backup Id.
    // This should be gotten rid once we fix missing sageOutputColumnId in an upgrade script in callosum
        function getUniqueIdForVizColumn(column) {
            return column.getSageOutputColumnId() || column.getId();
        }

        var bestConfigForChartType = {};

        var computeSupportedChartTypes = function () {
        // the number of possible combination grows as exp(4, num_columns) which can quickly become very slow to
        // calculate. hence we consider permutations and combinations of first few columns only
            var MAX_COLUMNS_PERMUTED = 6;

        // first preference for columns to be premuted is the current columns
            var selectedColumns = this.allColumns.first(MAX_COLUMNS_PERMUTED),
                selectedColumnGuids = util.mapArrayToHash(selectedColumns, function(col){
                    return getUniqueIdForVizColumn(col);
                });

        // TODO (sunny): instead of first generating all permutations upfront and then ranking them by
        // edit distance we should generate permutations in order of their distance from the seed (current) config
            var allColumnConfigs = util.getAllSplits(selectedColumns, 4),
                supportedChartTypeToAxisConfigs = {},
                self = this;

            Object.keys(chartTypeSpecificationService.chartTypes).each(function(chartType){
                supportedChartTypeToAxisConfigs[chartType] = [];
            });

            allColumnConfigs.each(function(columnConfig){
                var xAxisColumns = columnConfig[0],
                    yAxisColumns = columnConfig[1],
                    legendColumns = columnConfig[2],
                    radialColumns = columnConfig[3],
                    radialColumn = radialColumns.length > 0 ? radialColumns[0] : null;

                var axisConfig = new ChartAxisConfig(
                xAxisColumns,
                yAxisColumns,
                legendColumns,
                radialColumn
            );

                var validationErrors = axisColumnValidationService.validateAxisColumns(axisConfig),
                    isValidCombination = Object.values(validationErrors).none(angular.identity);
                if(!isValidCombination) {
                    return;
                }

                Object.keys(chartTypeSpecificationService.chartTypes).each(function(chartType){
                    var isSupported = chartTypeSpecificationService.validateAxisConfig(chartType, axisConfig);
                    if (isSupported) {
                        supportedChartTypeToAxisConfigs[chartType].push(columnConfig);
                    }
                });
            });

            var configComparator = new ColumnConfigComparator(this.chartModel);

            Object.keys(supportedChartTypeToAxisConfigs).each(function(chartType){
                var supportingColumnConfigs = supportedChartTypeToAxisConfigs[chartType];
                if (supportingColumnConfigs.length === 0) {
                    return;
                }

            // find the best supporting configuration among all the supporting configurations
                var bestColumnConfig = supportingColumnConfigs[0];
                supportingColumnConfigs.each(function(config, index){
                    if (index === 0) {
                        return;
                    }
                    if (configComparator.compare(chartType, bestColumnConfig, config) > 0) {
                        bestColumnConfig = config;
                    }
                });
                bestConfigForChartType[chartType] = bestColumnConfig;
            });
            configComparator.cleanup(allColumnConfigs);
        };

    // This function handles the case when the client state about axis config wasn't persisted on server
        var backwardCompatibleConfig = function () {
            while(this.columnsInChartDataNotOnAnyAxis.length) {
                this.columnsInChartDataNotOnAnyAxis.pop();
            }
            var LOW_CARDINALITY_MAX_VALUE = 5;

            var attributeColumns = [],
                measureColumns = [],
                columnCardinality = {},
                xAxisColumns = [],
                yAxisColumns = [],
                legendColumns = [],
                chartType = chartTypeSpecificationService.chartTypes.COLUMN;

            this.allColumns.forEach(function(column) {
                if (column.isEffectivelyNumeric()) {
                    measureColumns.push(column);
                } else {
                    attributeColumns.push(column);
                    columnCardinality[getUniqueIdForVizColumn(column)] = column.getUniqueCount() || -1;
                }
            });
            var numMeasures = measureColumns.length,
                numAttributes = attributeColumns.length;

            var attrCol,
                comparableColumns;

        // we don't support more than two attribute columns in default configurations so we select the "best" two
        // attribute columns we would want to include
            var attrCol1, attrCol2, attrColId1, attrColId2, attrColCardinality1,
                attrColCardinality2, attrColIsTimeSeries1, attrColIsTimeSeries2;

        // the sorting criteria (in descreasing order of preference):
        // 1. timeseries is better than non-timeseries
        // 2. lower cardinality is better than higher cardinality
        // note that we sort even if there are <= 2 attributes because in some cases we might have to choose between
        // them, we would want to choose the best one(s)
            var bestAttributeColumns = attributeColumns.clone().sort(function(col1, col2){
                var col1IsTimeSeries = col1.isDateColumn() && col1.isAscendingSort(),
                    col2IsTimeSeries =  col2.isDateColumn() && col2.isAscendingSort();
                if (col1IsTimeSeries && !col2IsTimeSeries) {
                    return -1;
                }
                if (!col1IsTimeSeries && col2IsTimeSeries) {
                    return 1;
                }

                var colId1 = getUniqueIdForVizColumn(col1),
                    colId2 = getUniqueIdForVizColumn(col2),
                    colCardinality1 =  columnCardinality[colId1],
                    colCardinality2 =  columnCardinality[colId2];
                return colCardinality1 - colCardinality2;
            });

            attrCol1 = bestAttributeColumns[0];
            attrCol2 = bestAttributeColumns[1];
            attrColId1 = getUniqueIdForVizColumn(attrCol1);
            attrColId2 = attrCol2 && getUniqueIdForVizColumn(attrCol2);
            attrColCardinality1 =  columnCardinality[attrColId1];
            attrColCardinality2 =  attrCol2 && columnCardinality[attrColId2];
            attrColIsTimeSeries1 = attrCol1.isDateColumn() && attrCol1.isAscendingSort();
            attrColIsTimeSeries2 = !!attrCol2 && attrCol2.isDateColumn() && attrCol2.isAscendingSort();

        // we don't support more than 3 measure columns in default configurations so we select the first 3 measure
        // columns we would want to include
            var measureCol1, measureCol2, measureCol3;
            measureCol1 = measureColumns[0];
            measureCol2 = measureColumns[1];
            measureCol3 = measureColumns[2];
        // TODO(Jasmeet): Evaluate if bringing back the measure column is needed, to choose the 3 columns smartly.
        //if(numMeasures > 3) {
        //    var measureColumnDataVariance = this.chartModel._measureColCoefficientsOfDataVariation;
        //    // sorting criteria:
        //    // 1. measure column with more variance in the data is better than the one with less variance in data
        //
        //    var bestMeasureColumns = measureColumns.clone().sort(function(col1, col2){
        //        var col1Variance = measureColumnDataVariance[col1.getSageOutputColumnId()],
        //            col2Variance = measureColumnDataVariance[col2.getSageOutputColumnId()];
        //        return col2Variance - col1Variance;
        //    });
        //    measureCol1 = bestMeasureColumns[0];
        //    measureCol2 = bestMeasureColumns[1];
        //    measureCol3 = bestMeasureColumns[2];
        //}

            if (numMeasures >= 2) {
                comparableColumns = this.chartModel.getComparableMeasureColumns();
            }

        // Note(sunny): the logic below is intentionally too verbose (a lot of repetitions that could ideally be
        // normalized/condensed) to allow easy modifications to rules sets
            if (numMeasures === 1 && numAttributes === 1) {
                if (attrColIsTimeSeries1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                    xAxisColumns.push(attrCol1);
                    yAxisColumns.push(measureCol1);
                } else {
                    chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                    xAxisColumns.push(attrCol1);
                    yAxisColumns.push(measureCol1);
                }
            } else if (numMeasures === 1 && numAttributes >= 2) {
                if (attrColIsTimeSeries1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                    xAxisColumns.push(attrCol1);
                    yAxisColumns.push(measureCol1);
                    legendColumns.push(attrCol2);
                } else if (attrColIsTimeSeries2) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                    xAxisColumns.push(attrCol2);
                    yAxisColumns.push(measureCol1);
                    legendColumns.push(attrCol1);
                } else {
                    chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                    xAxisColumns.push(attrColCardinality1 > attrColCardinality2 ? attrCol1 : attrCol2);
                    yAxisColumns.push(measureCol1);
                    legendColumns.push(attrColCardinality1 > attrColCardinality2 ? attrCol2 : attrCol1);
                }
            } else if (numMeasures === 2 && numAttributes === 1) {
                if (comparableColumns && attrColIsTimeSeries1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                    xAxisColumns.push(attrCol1);
                    yAxisColumns.push(measureCol1, measureCol2);
                } else if (comparableColumns && attrColCardinality1 <= LOW_CARDINALITY_MAX_VALUE) {
                    chartType = chartTypeSpecificationService.chartTypes.COLUMN;
                    xAxisColumns.push(attrCol1);
                    yAxisColumns.push(measureCol1, measureCol2);
                } else {
                    chartType = chartTypeSpecificationService.chartTypes.SCATTER;
                    xAxisColumns.push(measureCol1);
                    yAxisColumns.push(measureCol2);
                }
            } else if (numMeasures === 2 && numAttributes >= 2) {
                if (comparableColumns && attrColIsTimeSeries1) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                    xAxisColumns.push(attrCol1);
                    yAxisColumns.push(measureCol1, measureCol2);
                } else if (comparableColumns && attrColIsTimeSeries2) {
                    chartType = chartTypeSpecificationService.chartTypes.LINE;
                    xAxisColumns.push(attrCol2);
                    yAxisColumns.push(measureCol1, measureCol2);
                } else {
                // keep the attr col with lowest cardinality
                    attrCol = attributeColumns.min(function(col){
                        return columnCardinality[getUniqueIdForVizColumn(col)];
                    });

                    if (columnCardinality[getUniqueIdForVizColumn(attrCol)] <= LOW_CARDINALITY_MAX_VALUE) {
                        chartType = chartTypeSpecificationService.chartTypes.SCATTER;
                        xAxisColumns.push(measureCol1);
                        yAxisColumns.push(measureCol2);
                        legendColumns.push(attrCol);
                    } else {
                        chartType = chartTypeSpecificationService.chartTypes.SCATTER;
                        xAxisColumns.push(measureCol1);
                        yAxisColumns.push(measureCol2);
                    }
                }

            } else if (numMeasures >= 3 && numAttributes >= 1) {
            // Note(sunny): we look for comparable columns in all the measure columns (not just the best ones).
            // comparability takes precedence over variance in data
            // TODO(sunny): if there are multiple pairs of comparable columns possible we should pick the one that
            // has most data variance
                if (comparableColumns) {
                // first column that is not a part of the comparable columns pair that we chose
                    var nonComparableColumn = measureColumns.find(function(measureColumn){
                        return measureColumn !== comparableColumns[0] && measureColumn !== comparableColumns[1];
                    });
                    if (attrColCardinality1 <= LOW_CARDINALITY_MAX_VALUE || attrColIsTimeSeries1) {
                        chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
                        xAxisColumns.push(attrCol1);
                        yAxisColumns.push(comparableColumns[0], comparableColumns[1]);
                        this._radialColumn = nonComparableColumn;
                    } else {
                        chartType = chartTypeSpecificationService.chartTypes.SCATTER;
                        xAxisColumns.push(nonComparableColumn);
                        yAxisColumns.push(comparableColumns[0], comparableColumns[1]);
                    }
                } else {
                // TODO(sunny): which, radial or y column, should get the measure column with higher variance?
                    if (attrColIsTimeSeries1) {
                        chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
                        xAxisColumns.push(attrCol1);
                        yAxisColumns.push(measureCol1);
                        this._radialColumn = measureCol2;
                    } else if (attrColCardinality1 <= LOW_CARDINALITY_MAX_VALUE) {
                        chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
                        xAxisColumns.push(measureCol1);
                        yAxisColumns.push(measureCol2);
                        this._radialColumn = measureCol3;
                        legendColumns.push(attrCol1);
                    } else {
                        chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
                        xAxisColumns.push(measureCol1);
                        yAxisColumns.push(measureCol2);
                        this._radialColumn = measureCol3;
                    }
                }
            } else {
                chartType = chartTypeSpecificationService.chartTypes.SCATTER;
                xAxisColumns.push(measureColumns[0]);
                yAxisColumns.push(measureColumns[1], measureColumns[2]);
            }

        // if all of the y-axis columns are growth columns the default chart type is column (SCAL-4689)
            var allYAxisColumnIsGrowth = yAxisColumns.all(function(column){
                return column.isGrowth();
            });
            if (allYAxisColumnIsGrowth) {
                chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            }

            if (chartType !== this.chartModel.getChartType()) {
                var context = {
                    chartModel: this.chartModel,
                    allColumns: this.allColumns
                };
                angular.bind(context, computeSupportedChartTypes)();
                var bestConfig = bestConfigForChartType[this.chartModel.getChartType()];
                while(xAxisColumns.length) {
                    xAxisColumns.pop();
                }
                while(yAxisColumns.length) {
                    yAxisColumns.pop();
                }
                while(legendColumns.length) {
                    legendColumns.pop();
                }
                bestConfig[0].forEach(function(column) {
                    xAxisColumns.push(column);
                });
                bestConfig[1].forEach(function(column) {
                    yAxisColumns.push(column);
                });
                bestConfig[2].forEach(function(column) {
                    legendColumns.push(column);
                });
                this.radialColumn = bestConfig[3][0];
            }

            xAxisColumns.each(function (column) {
                chartUtilService.setChartAxisInClientState(column, chartUtilService.ChartAxis.X);
            });
            yAxisColumns.each(function (column) {
                chartUtilService.setChartAxisInClientState(column, chartUtilService.ChartAxis.Y);
            });
            legendColumns.each(function (column) {
                chartUtilService.setChartAxisInClientState(column, chartUtilService.ChartAxis.Z);
            });
            if (!!this.radialColumn) {
                chartUtilService.setChartAxisInClientState(
                this.radialColumn,
                chartUtilService.ChartAxis.R
            );
            }

            return {
                xAxisColumns: xAxisColumns,
                yAxisColumns: yAxisColumns,
                legendColumns: legendColumns,
                radialColumn: this.radialColumn,
                columnsInChartDataNotOnAnyAxis: this.columnsInChartDataNotOnAnyAxis,
                allColumns: this.allColumns,
                queryDefinitions: this.queryDefinitions
            };
        };

        return {
            backwardCompatibleConfig: backwardCompatibleConfig
        };
    }]);
