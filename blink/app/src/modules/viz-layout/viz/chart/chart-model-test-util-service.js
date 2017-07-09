/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Utility package for chart model testing.
 */

'use strict';

blink.app.factory('chartModelTestUtilService', ['axisColumnValidationService',
    'ChartModel',
    'chartUtilService',
    'util',
    'VisualizationColumnModel',
    function (axisColumnValidationService,
          ChartModel,
          chartUtilService,
          util,
          VisualizationColumnModel) {
        var MAX_ATTRIBUTES_UNTIL_DROP = 2,
            MAX_MEASURES_UNTIL_DROP = 3;

        var me = {},
            columnSuffix = 0;

    /**
     * Adds randomly generated data as the '__data' property on the column object
     * @param column {VisualizationColumnModel} an attribute column
     * @param numDataPoints {Number} the number of data points to generate
     */
        function addDataToAttributeColumn(column, numDataPoints, uniqueValues) {
            var data = [],
                uniques = [],
                colName = column.getName();
            for (var i=0; i<numDataPoints; i++) {
            //adding the index as prefix to en
                data.push(colName + '-' + i%uniqueValues);
            }
            uniques = data.unique();
            column.__data = {
                data: data,
                uniques: uniques
            };
        }

    /**
     * Adds randomly generated data as the '__data' property on the column object
     * @param column {VisualizationColumnModel} a measure column
     * @param numDataPoints {Number} the number of data points to generate
     */
        function addDataToMeasureColumn(column, numDataPoints, minValue) {
            var data = [];
            for (var i=minValue; i<minValue + numDataPoints; i++) {
                data.push(i);
            }
            column.__data = {
                data: data
            };
        }

    /**
     * Returns the subset of __allColumns__ that are dropped/not included in the model
     * @param model {ChartModel}
     * @param allColumns {Array} all the columns in the fake underlying database
     * @returns {Array}
     */
        function getMissingColumns(model, allColumns) {
            var includedColumnGuids = {};
            [model._attributeColumns, model._measureColumns].each(function(columns){
                columns.each(function(column){
                    includedColumnGuids[column.getSageOutputColumnId()] = true;
                });
            });
            return allColumns.filter(function(column){
                return !includedColumnGuids.hasOwnProperty(column.getSageOutputColumnId());
            });
        }

    /**
     * Acts as a callosum proxy that returns vizData for a give vizJson
     * @param vizJson {Object} vizJson that specifies the columns to include data for in the response
     * @param allColumns {Array}  all the columns in the fake underlying database
     * @returns [{{data: Array, uniques: {}}}] a proxy vizData as callosum would return
     */
        function getVizDataForVizJson(vizJson, allColumns) {
            var vizContent = vizJson.vizContent,
                data = [],
                uniques = {},
                columnIdToColumn = {};

            allColumns.each(function(column){
                columnIdToColumn[column.getJson().sageOutputColumnId] = column;
            });

            var columnJsons = [];
            ['series', 'categories', 'values'].each(function(key){
                if (vizContent[key] && vizContent[key].columns) {
                    columnJsons = columnJsons.concat(vizContent[key].columns);
                }
            });
            var columnDataValues = [];
            columnJsons.each(function(columnJson, dataRowIndex){
                var column = columnIdToColumn[columnJson.sageOutputColumnId],
                    columnData = column.__data;
                columnDataValues.push(columnData.data);
            });
            data = columnDataValues[0].zip.apply(columnDataValues[0], columnDataValues.slice(1));

            return [{
                data: data,
                uniques: uniques
            }];
        }

    /**
     * Returns a json representing measure column metadata
     * @returns {Object}
     */
        me.getMeasureColumnMetadata = function(name) {
            name = name !== undefined ? name : 'measureCol' + (columnSuffix++);
            return {
                baseColumnName: name,
                effectiveType: 'MEASURE',
                effectiveDataType: 'INT64',
                sageOutputColumnId: name,
                isMeasure: function() {
                    return true;
                },
                isAttribute: function() {
                    return false;
                },
                referencedColumnHeaders : [
                    {
                        name: name
                    }
                ]
            };
        };

    /**
     * Returns a json representing attribute column metadata
     * @param dataType the dataType to be assigned to the column
     * @param name
     * @param geoConfig
     * @returns {Object}
     */
        me.getAttributeColumnMetadata = function(dataType, name, geoConfig) {
            if (!dataType) {
                dataType = 'STRING';
            }

            name = name !== undefined ? name : 'attrCol' + (columnSuffix++);
            return {
                baseColumnName: name,
                baseGeoConfig: geoConfig,
                effectiveType: 'ATTRIBUTE',
                effectiveDataType: dataType,
                sageOutputColumnId: name,
                isMeasure: function() {
                    return false;
                },
                isAttribute: function() {
                    return true;
                },
                referencedColumnHeaders : [
                    {
                        name: name
                    }
                ]
            };
        };

    /**
     * Generates random data for a given number of measures and attributes. The actual data values
     * are added as __data property to each column object
     * @param numMeasures
     * @param numAttributes
     * @param chartType
     * @param attributeDataTypes an array of length <= numAttribute with dataType to be set on each attribute column.
     * If length <= numAttribute, default dataType is used for attribute columns >= length
     * @returns {{vizJson: Object, allColumns: Array}}
     */
        me.getChartModelData = function(numMeasures, numAttributes, chartType, attributeDataTypes, atttributeGeoConfigs, attributeNames, measureNames, attributeCardinalities, measureMinValues) {
            if (!attributeDataTypes) {
                attributeDataTypes = [];
            }
            if (!atttributeGeoConfigs) {
                atttributeGeoConfigs = [];
            }
            if (!attributeNames) {
                attributeNames = [];
            }
            if (!measureNames) {
                measureNames = [];
            }
            if (!attributeCardinalities) {
                attributeCardinalities = [];
            }
            if (!measureMinValues) {
                measureMinValues = [];
            }

            var DEFAULT_NUM_DATA_POINTS = 2,
                valueColumns = [],
                categoryColumns = [],
                seriesColumns = [],
                allColumns = [],
                i,
                colMetadata,
                column,
                numDataPoints = attributeCardinalities.length > 0 ? attributeCardinalities.max() : DEFAULT_NUM_DATA_POINTS;

            for (i=0; i<numAttributes; i++) {
                colMetadata = me.getAttributeColumnMetadata(attributeDataTypes[i], attributeNames[i], atttributeGeoConfigs[i]);
                colMetadata.sortAscending = true;
                colMetadata.uniqueValues = attributeCardinalities[i];
                if (i === 0) {
                    categoryColumns.push(colMetadata);
                } else if (i < attributeNames.length || i < MAX_ATTRIBUTES_UNTIL_DROP) {
                    seriesColumns.push(colMetadata);
                }

                column = new VisualizationColumnModel(colMetadata, i);
                allColumns.push(column);

                var cardinality = attributeCardinalities[i];
                if (isNaN(cardinality)) {
                    cardinality = numDataPoints;
                }
                addDataToAttributeColumn(column, numDataPoints, cardinality);
            }

            for (i=0; i<numMeasures; i++) {
                colMetadata = me.getMeasureColumnMetadata(measureNames[i]);
                if (i < MAX_MEASURES_UNTIL_DROP) {
                    valueColumns.push(colMetadata);
                }

                column = new VisualizationColumnModel(colMetadata, numAttributes + i);
                allColumns.push(column);

                var measureMinValue = measureMinValues[i];
                if (measureMinValue === undefined) {
                    measureMinValue = 0;
                }
                addDataToMeasureColumn(column, numDataPoints, measureMinValue);
            }

            var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    chartType: chartType,
                    values: {
                        columns: valueColumns
                    },
                    categories: categoryColumns.length ? { columns: categoryColumns } : undefined,
                    series: seriesColumns.length ? { columns: seriesColumns } : undefined
                }
            };
            return {
                vizJson: metadata,
                allColumns: allColumns
            };
        };

    /**
     * Simulates a re-fetch from callosum and returns a new chart model instance with the 're-fetched' data
     * @param vizJson possibly modified vizJson from an existing answer
     * @param allColumns all the columns in the fake underlying database
     * @returns {ChartModel}
     */
        me.getChartModelForExistingData = function(vizJson, allColumns) {
            var chartModel = new ChartModel({
                vizJson: vizJson,
                vizData: getVizDataForVizJson(vizJson, allColumns),
                allColumns: allColumns
            });
            chartModel.getMissingColumns = angular.bind(null, getMissingColumns, chartModel, allColumns);
            chartModel._getTableModel = jasmine.createSpy().and.returnValue({
                getVizColumns: function () {
                    return allColumns;
                }
            });
            chartModel.getChartDataValidationError = jasmine.createSpy().and.returnValue(null);
            return chartModel;
        };

        me.getChartModel = function(numMeasures, numAttributes) {
            var chartData = me.getChartModelData(numMeasures, numAttributes),
                allColumns = chartData.allColumns;
            return me.getChartModelForExistingData(chartData.vizJson, allColumns);
        };

        me.getAllAxisColumnCombinations = function(includeInvalidCombinations, removeSimilarConfigurations) {
            var allCombinations = [],
                columnCounts = [];

        //TODO(sunny): we should check for i <= MAX_MEASURES_UNTIL_DROP + 1 and j <= MAX_ATTRIBUTES_UNTIL_DROP + 1
        //That however causes this method to hog too much CPU resulting in errors ('No more request expected')
            for (var i=1; i<=MAX_MEASURES_UNTIL_DROP; i++) {
                for (var j=1; j<=MAX_ATTRIBUTES_UNTIL_DROP; j++) {
                    columnCounts.push([i, j]);
                }
            }

            columnCounts.each(function(columnCount){
                var numMeasures = columnCount[0],
                    numAttributes = columnCount[1],
                    chartData = me.getChartModelData(numMeasures, numAttributes),
                    allColumns = chartData.allColumns,
                    chartModel = me.getChartModelForExistingData(chartData.vizJson, allColumns);

                var axisCombinations = util.getAllSplits(allColumns, 4).remove(function(combination){
                    //x and y axes must have at least one column
                    return combination[0].length === 0 || combination[1].length === 0;
                });

                axisCombinations.each(function(combination){
                    var xAxisColumns = combination[0],
                        yAxisColumns = combination[1],
                        legendColumns = combination[2],
                        radialColumns = combination[3];

                    if (radialColumns.length > 1) {
                        return;
                    }

                    var validationErrors = axisColumnValidationService.validateAxisColumns({
                            xAxisColumns: xAxisColumns,
                            yAxisColumns: yAxisColumns,
                            legendColumns: legendColumns,
                            radialColumn: radialColumns[0]
                        }),
                        isValidCombination = Object.values(validationErrors).none(angular.identity);
                    if (!includeInvalidCombinations && !isValidCombination) {
                        return;
                    }

                    allCombinations.push({
                        allColumns: allColumns,
                        chartData: chartData,
                        chartModel: chartModel,
                        axisCombination: combination,
                        isValid: isValidCombination
                    });
                });
            });

            if(removeSimilarConfigurations) {
                var combinationSimilarityHash = {};
                allCombinations.remove(function(combinationConfig){
                    var axisCombination = combinationConfig.axisCombination,
                        combinationHash = axisCombination.map(function(axisColumns){
                            return axisColumns.map(function(axisColumn){
                                return axisColumn.isEffectivelyNonNumeric() ? 'A' : 'M';
                            }).join('');
                        }).join(',');
                    if(!Object.has(combinationSimilarityHash, combinationHash)) {
                        combinationSimilarityHash[combinationHash] = combinationConfig;
                        return false;
                    }
                    return true;
                });
            }
            return allCombinations;
        };

        return me;
    }]);
