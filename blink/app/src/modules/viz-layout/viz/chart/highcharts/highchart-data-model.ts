/**
 * Copyright Thoughtspot Inc. 2016
 * Author:  Jasmeet Singh Jaggi (jasmeet@thoughtspot.com),
 *          Ashish shubham (ashish.shubham@thoughtspot.com)
 */

import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';
import {ChartModel} from '../chart-model';

let chartUtilService = ngRequire('chartUtilService');
let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let Logger = ngRequire('Logger');
let _logger;
let util = ngRequire('util');

let axisColumnValuesComparatorAscending = axisColumnValuesComparator.bind(null, false);
let axisColumnValuesComparatorDescending = axisColumnValuesComparator.bind(null, true);

@Provide('HighchartDataModel')
export class HighchartDataModel {
    private _columnHasInfinityValues;
    private _columnHasMinusInfinityValues;
    private _maxColumnValues;
    private _minColumnValues;
    private _minRadialValue;
    private _maxRadialValue;
    private _xAxisHasNonNullValue;
    private _hasError;
    private _series;
    private _compositeLegendValueToRawValues;
    private _uniqueLegendValues;
    private _xValueToRawValues;
    private _yValueToRawValues;
    private _hasNoData;
    private _shouldPlotEachYAsSeries;
    private _shouldNormalizeSeriesNames;

    constructor(private chartModel) {
        _logger = Logger.create('highchart-data-model');
        this.init(chartModel);
        this.processData(chartModel);
    }

    public getChartPointFromDataPoint   (xVal, yVal, dataRow,  isXAxisOrdinalBased,
                                         isYAxisOrdinalBased, categoryColumn, radialColumn,
                                         xValueRange, yValuesRange, infinityValuePointsX,
                                         infinityValuePointsY) {
        if (xVal === undefined || yVal === undefined) {
            return null;
        }

        if (util.isSpecialNaNValue(xVal)) {
            xVal = null;
        }

        if (util.isSpecialNaNValue(yVal)) {
            yVal = null;
        }

        // NaN values are not allowed on x-axis
        if (xVal === null) {
            if (yVal === null) {
                this._hasError = true;
            }
            return null;
        } else {
            this._xAxisHasNonNullValue = true;
        }

        var point: any = {
            x: xVal,
            y: yVal
        };

        var validPoint;
        if (!isXAxisOrdinalBased) {
            if (!xValueRange) {
                _logger.error('xValueRange must be provided when x axis is a measure');
                return null;
            }
            if (!infinityValuePointsX) {
                _logger.error('infinityValuePointsX must be provided when x axis is a measure');
                return null;
            }
            validPoint = updateValueRange(xVal, point, xValueRange, infinityValuePointsX);
            if (!validPoint) {
                return null;
            }
        }
        if(!isYAxisOrdinalBased) {
            validPoint = updateValueRange(yVal, point, yValuesRange, infinityValuePointsY);
            if (!validPoint) {
                return null;
            }
        }

        if (categoryColumn) {
            point.categoryName = dataRow[categoryColumn.getDataRowIndex()];
        }
        if (radialColumn) {
            point.z = dataRow[radialColumn.getDataRowIndex()];
            if (isNaN(this._minRadialValue)) {
                this._minRadialValue = point.z;
            } else {
                this._minRadialValue = Math.min(point.z, this._minRadialValue);
            }

            if (isNaN(this._maxRadialValue)) {
                this._maxRadialValue = point.z;
            } else {
                this._maxRadialValue = Math.max(point.z, this._maxRadialValue);
            }
        }

        return point;
    }

    private init(chartModel) {
        this._shouldPlotEachYAsSeries = this.shouldPlotEachYAsSeries(chartModel);
        this._shouldNormalizeSeriesNames = this.shouldNormalizeSeriesNames(chartModel);
    }

    private shouldPlotEachYAsSeries(chartModel) {
        let lineStackedChart = chartTypeSpecificationService.chartTypes.LINE_STACKED_COLUMN;
        let isLineStackedChart = chartModel.getChartType() === lineStackedChart;
        return chartModel.getYAxisColumns().length > 1 && !isLineStackedChart;
    }

    private shouldNormalizeSeriesNames(chartModel) {
        // Hack (sunny): Hack around SCAL-7149. We remember the selected series in a chart by
        // saving the *names* of the selected series. Due to formatting changes the names
        // of the series can change for a saved answer thus causing a mismatch between
        // the remembered series names and the new series name. To get around that
        // we "normalize" series names before we compare them.
        // Note tat this hack will cause incorrect series selection if there is a
        // date column paired with a legend column that has two values with only
        // difference between them being a comma. We are going with this hack for
        // now as our estiamte of the probability of that happening is quite low.
        var seriesNamesNeedNormalization = !this._shouldPlotEachYAsSeries
            && chartModel.getLegendColumns().length > 0;
        if (seriesNamesNeedNormalization) {
            var noLegendColumnIsDate = chartModel.getLegendColumns().all(function(col){
                return col.getEffectiveDataType() !== 'DATE';
            });
            seriesNamesNeedNormalization = !noLegendColumnIsDate;
        }
        return seriesNamesNeedNormalization;
    }

    private getNormalizedSeriesName(seriesName) {
        if (!this._shouldNormalizeSeriesNames) {
            return seriesName;
        }

        if (!seriesName) {
            return seriesName;
        }

        var normalizedName = '',
            commaCount = 0;
        seriesName.each(function(ch){
            if (ch === ',') {
                commaCount++;
                if (commaCount%2 === 1) {
                    // skip 1, 3, 5... comma
                    // we can't skip every comma as comma is
                    // also the join key in case of multiple legend
                    // columns
                    return;
                }
            }
            normalizedName += ch;
        });
        return normalizedName;
    }

    private isSeriesVisible(chartModel, seriesName) {
        let visibleSeriesIds = chartModel.getVisibleSeriesIds();
        if (visibleSeriesIds === void 0) {
            return true;
        }
        let normalizedSeriesName = this.getNormalizedSeriesName(seriesName);
        return visibleSeriesIds.indexOf(normalizedSeriesName) >= 0;
    }
    /**
     * Parses the data json corresponding to this chart into per series data points.
     * Also calculates the array of unique values on x-axis and legend (if applicable).
     * The series data is of the form
     * [{
    *     name: <series name> (empty string in case of only 1 series)
    *     data: [{
    *         x: <x value> (epoch value for time series, index in unique x values array otherwise),
    *         y: <y value>
    *         categoryName: <category name> (if applicable)
    *         z: <radial value> (if applicable)
    *     }, ...]
    * }, ...]
     *
     * Examples:
     * 1. Input data for 'revenue color'
     *    data: [[almond, 100], [blue, 200], [red, 300], ...]
     *
     *    uniques: { '0': [almond, blue, red, ...] }
     *
     *   Output (1 unnamed series):
     *   { data: [{x: 0, y:100}, {x: 1, y: 200}, {x: 2, y: 300} ....] }
     *   where the first coordinate of each point corresponds to the index of the color in the
     *   uniques array.
     *
     * 2. Input data for 'revenue customer region color'
     *    data:
     *    [[AFRICA, almond, 100], [AFRICA, blue, 200],... [ASIA, almond, 150], [ASIA, blue, 250]...]
     *
     *
     *    uniques: { '0': [AFRICA, ASIA ...], '1': [almond, blue ...] }
     *
     *    Output:
     *    [
     *        { name: 'AFRICA', data: [{x: 0, y: 100}, {x: 1, y: 200} ...] },
     *        { name: 'ASIA', data: [{x: 0, y: 150], {x: 1, y: 250} ...] }
     *        ...
     *    ]
     *
     * 2. Input data for 'revenue region order date'
     *    data: [[AFRICA, <epoch1>, 100], [AFRICA, <epoch2>, 200] ...]
     *    uniques: { ... }
     *
     *    Output:
     *    [
     *        { name: 'AFRICA', data: {x: <epoch1>, 100}, {x: <epoch2>, y: 200} ...] },
     *        ...
     *    ]
     *    Note that there is no translation of x value in the time series case.
     *
     * 3. Input data for 'revenue tax region color'
     *    data: [[AFRICA, almond, 100, 1.5], [AFRICA, blue, 200, 2.5] ...]
     *
     *    Output:
     *   [
     *       {
     *           name: 'AFRICA',
     *           data: [
     *               {x: 100, y: 1.5, categoryName: 'almond' },
     *               {x: 200, y: 2.5, categoryName: 'blue'} ]
     *       }
     *   ]
     *
     * 4. Input data for 'revenue tax discount region color'
     *    data: [[AFRICA, almond, 100, 1.5, 0.5]....]
     *
     *    Output:
     *    [
     *       { name: 'AFRICA', data: [{x: 100, y: 1.5, categoryName: 'almond', z: 0.5 } ] }
     *    ]
     *
     * @return {boolean}
     * @private
     *
     * TODO (sunny): This function is too big. Split it into multiple subunits.
     */
    private processData (chartModel : ChartModel) {

        //TODO(Jasmeet): In the chart data refactoring remove the setting of data
        // properties in model.
        this._columnHasInfinityValues = [];
        this._columnHasMinusInfinityValues = [];

        this._maxColumnValues = [];
        this._minColumnValues = [];

        var self = this;
        var baseQueryDefinition = chartModel.getQueryDefinitions()[0];
        var legendColumnDataRowIndexToColumns =
            getDataRowIndexToColumnMap(baseQueryDefinition.legendColumns);
        var xAxisColumnDataRowIndexToColumns =
            getDataRowIndexToColumnMap(baseQueryDefinition.xAxisColumns);
        var yAxisColumnDataRowIndexToColumns =
            getDataRowIndexToColumnMap(baseQueryDefinition.yAxisColumns);

        this.removeNulls(chartModel);

        let dataArray = chartModel.getDataArray();
        let baseQueryData = dataArray[0];
        let data = baseQueryData.getData();

        this.normalizeBackendData(chartModel);
        let isLineStackedChart = chartModel.getChartType() ===
            chartTypeSpecificationService.chartTypes.LINE_STACKED_COLUMN;
        let isParetoChart = chartModel.getChartType() ===
                chartTypeSpecificationService.chartTypes.PARETO;

        let series = {},
            categoryColumn = chartModel.getCategoryColumnNotOnAxis(),
            radialColumn = !isLineStackedChart && chartModel.getRadialColumn(),
            uniqueXAxisValues = [],
            uniqueXAxisValuesHash = {},
            uniqueYAxisValues = [],
            uniqueYAxisValuesHash = {},
            uniqueLegendValues = [],
            uniqueLegendValuesHash = {},
            columnValueRanges = {},
            infinityValuePointForColumn = {},
            // this is used to check if every x-axis value belongs to
            // exactly one series (SCAL-4758)
            // the hash looks like
            // {xalueHash1: {seriesNameWithXValue1: true, seriesNameWithXValue2: true ...}}
            seriesNameToId = {};

        // in case of multiple y-axes, each axis corresponds to a series
        let xAxisColumns = chartModel.getXAxisColumns(),
            yAxisColumns = chartModel.getYAxisColumns(),
            plotEachYAsSeries = yAxisColumns.length > 1 && !isLineStackedChart;

        chartModel.distinctYAxisColumnNames = getDistinctNamesForColumns(yAxisColumns) || [];
        if (plotEachYAsSeries) {
            if (chartModel.getLegendColumns().length > 0) {
                _logger.error('multiple y-axes and legends can\'t be supported at the same time');
                return false;
            }
            yAxisColumns.each(function(column, index){
                var seriesName = chartModel.distinctYAxisColumnNames[index];
                series[seriesName] = [];
            });
        }

        [xAxisColumns, yAxisColumns].each(function(columns){
            columns.each(function(column){
                var dataRowIndex = column.getDataRowIndex();
                infinityValuePointForColumn[dataRowIndex] = [];
                columnValueRanges[dataRowIndex] = {
                    min: Number.POSITIVE_INFINITY,
                    max: Number.NEGATIVE_INFINITY
                };
            });
        });

        let orderedXHashesForLegendHash = {};
        let stackedValueColumn = chartTypeSpecificationService.getStackedValuesColumn(chartModel);
        let hasStackedDataInChart  = stackedValueColumn !== void 0;
        let xValueToStackValue = {};
        let xValueToYValue = {};

        // first pass to calculate composite uniques
        data.each(function(dataRow) {
            let legendValues = [],
                xAxisValues = [],
                yAxisValues = [];

            dataRow.each(function(dataValue, dataRowIndex){
                let bucket = null;
                let columnEffectiveId = null;
                if (legendColumnDataRowIndexToColumns.hasOwnProperty(dataRowIndex)) {
                    bucket = legendValues;
                    columnEffectiveId =
                        legendColumnDataRowIndexToColumns[dataRowIndex].getSageOutputColumnId();
                } else if (xAxisColumnDataRowIndexToColumns.hasOwnProperty(dataRowIndex)) {
                    bucket = xAxisValues;
                    columnEffectiveId =
                        xAxisColumnDataRowIndexToColumns[dataRowIndex].getSageOutputColumnId();
                } else if (yAxisColumnDataRowIndexToColumns.hasOwnProperty(dataRowIndex)) {
                    bucket = yAxisValues;
                    columnEffectiveId =
                        yAxisColumnDataRowIndexToColumns[dataRowIndex].getSageOutputColumnId();
                }

                if (bucket) {
                    bucket.push({
                        dataRowIndex: dataRowIndex,
                        columnEffectiveId: columnEffectiveId,
                        value: dataValue
                    });
                }
            });

            // 1. the unique coming from callosum are not helpful as they are per column uniques
            // we have to calculate composite uniques (note that we simply we can't take a cross
            // product of the uniques of each column to get the composite uniques as not all
            // combinations will be present in the data)
            // 2. for multi-column x-axis & legend we want to preserve all the x-axis values
            // (rather than concatenating them at this point). The final formatting stage will
            // decide how to format (possibly) composite column label
            // 3. There is a 1-1 mapping between the hash keys and the hash values, we need the
            // hash key to be able to uniquify the values (because values are objects, they can't
            // be used as hash keys)
            var xAxisValueHashKey = xAxisValues.map(function(valueObject){
                return valueObject.value;
            }).join(chartUtilService.COMPOSITE_COLUMN_VALUES_JOIN_KEY);
            if (!uniqueXAxisValuesHash.hasOwnProperty(xAxisValueHashKey)) {
                uniqueXAxisValuesHash[xAxisValueHashKey] = uniqueXAxisValues.length;
                uniqueXAxisValues.push(xAxisValues);
            }

            var legendValueHashKey = legendValues.map(function(valueObject){
                return valueObject.value;
            }).join(chartUtilService.COMPOSITE_COLUMN_VALUES_JOIN_KEY);
            if (!uniqueLegendValuesHash.hasOwnProperty(legendValueHashKey)) {
                uniqueLegendValuesHash[legendValueHashKey] = uniqueLegendValues.length;
                uniqueLegendValues.push(legendValues);
            }
            if (!orderedXHashesForLegendHash.hasOwnProperty(legendValueHashKey)) {
                orderedXHashesForLegendHash[legendValueHashKey] = [];
            }
            orderedXHashesForLegendHash[legendValueHashKey].push(xAxisValueHashKey);

            yAxisValues.forEach(function(valueObject) {
                let idx = valueObject.dataRowIndex;
                if(!uniqueYAxisValuesHash[idx]) {
                    uniqueYAxisValuesHash[idx] = {};
                    uniqueYAxisValues[idx] = [];
                }
                if (!uniqueYAxisValuesHash[idx].hasOwnProperty(valueObject.value)) {
                    uniqueYAxisValuesHash[idx][valueObject.value] = uniqueYAxisValues[idx].length;
                    uniqueYAxisValues[idx].push(valueObject);
                }
                if (hasStackedDataInChart
                    && valueObject.columnEffectiveId === stackedValueColumn.getGuid()
                    && self.isSeriesVisible(chartModel, legendValueHashKey)) {
                    xValueToStackValue[xAxisValueHashKey] =
                        xValueToStackValue[xAxisValueHashKey] || 0;
                    xValueToStackValue[xAxisValueHashKey] += valueObject.value;
                }

                // in case of pareto chart, we have at most one shared x-axis
                // that we want to sort with the corresponding y-axis values
                // at that time, we only have only ONE y axis
                // the second axis is an ad-hoc axis created in pareto.js
                if (isParetoChart)  {
                    xValueToYValue[xAxisValueHashKey] = valueObject.value;
                }
            });
        });

        // legend values are always sorted
        sortUniqueValues(
            uniqueLegendValues,
            uniqueLegendValuesHash,
            axisColumnValuesComparatorAscending
        );

        // If there is no sorting on Y then  we ensure the data on x axis is naturally sorted.
        if (!chartModel.yAxisColumnHasSorting()) {
            // Note (sunny): only one column can be sorted explicitly at this point
            // so descending sort can be applied to only one column (ascending sort
            // is the default)
            let xValueComparator;

            if (isParetoChart) {
                // for pareto chart, we sort x axis by the y values, in descending order
                xValueComparator = ((uniqueValuesMap, x1, x2, key1, key2) => {
                    return uniqueValuesMap[key2] - uniqueValuesMap[key1];
                }).bind(void 0, xValueToYValue);

            } else {
                let xAxisDescendingSorted = chartModel.getXAxisColumns().some(function(col){
                        return col.isSorted() && !col.isAscendingSort();
                    });
                xValueComparator = xAxisDescendingSorted ? axisColumnValuesComparatorDescending
                        : axisColumnValuesComparatorAscending;
            }

            sortUniqueValues(uniqueXAxisValues, uniqueXAxisValuesHash, xValueComparator);
        }


        if (hasStackedDataInChart && stackedValueColumn.isUserSorted()) {
            let comparator = (kvMap, isAscending, x1, x2, key1, key2) => {
                return isAscending ? kvMap[key1] - kvMap[key2] : kvMap[key2] - kvMap[key1];
            };

            var sortUniqueComparator = comparator.bind(
                void 0,
                xValueToStackValue,
                stackedValueColumn.isAscendingSort()
            );
            sortUniqueValues(uniqueXAxisValues, uniqueXAxisValuesHash, sortUniqueComparator);
        }

        // second pass to create series data
        var isXAxisOrdinalBased = chartModel.isXAxisOrdinalBased(),
            isYAxisOrdinalBased = chartModel.isYAxisOrdinalBased();

        data.forEach(function(dataRow, dataIndex){
            var legendValues = [],
                xAxisValues = [],
                yAxisValues = [];

            // TODO(sunny): can we avoid re-bucketing data values into x,y and legend
            // we might already be doing the same thing in the first pass
            dataRow.each(function(dataValue, dataRowIndex){
                if (legendColumnDataRowIndexToColumns.hasOwnProperty(dataRowIndex)) {
                    legendValues.push(dataValue);
                } else if (xAxisColumnDataRowIndexToColumns.hasOwnProperty(dataRowIndex)) {
                    xAxisValues.push(dataValue);
                } else if (yAxisColumnDataRowIndexToColumns.hasOwnProperty(dataRowIndex)) {
                    yAxisValues.push(dataValue);
                }
            });

            // xValue is the actual data value if x-axis is effectively a measure or a timeseries,
            // otherwise it's the index in uniques. we don't do ordinal for time series and measures
            // to allow highcharts to generate labels at intermediate points for labels
            // (even if there are no real data points in those places).
            var xValue = null,
                xValueHash = null,
                xValueRange = null,
                infinityValuePointsX = null;
            if (!isXAxisOrdinalBased) {
                xValue = xValueHash = xAxisValues[0];

                var xAxisColumnDataRowIndex = xAxisColumns[0].getDataRowIndex();
                xValueRange = columnValueRanges[xAxisColumnDataRowIndex];
                infinityValuePointsX = infinityValuePointForColumn[xAxisColumnDataRowIndex];
            } else {
                xValueHash = xAxisValues.join(chartUtilService.COMPOSITE_COLUMN_VALUES_JOIN_KEY);
                if (!uniqueXAxisValuesHash.hasOwnProperty(xValueHash)) {
                    _logger.error('no x value for xAxisValueHashKey', xValueHash);
                }
                xValue = uniqueXAxisValuesHash[xValueHash];
            }

            // yValue is the actual data value if y-axis is effectively a measure or a timeseries,
            // otherwise it's the index in uniques. we don't do ordinal for time series and measures
            // to allow highcharts to generate labels at intermediate points for labels
            // (even if there are no real data points in those places).
            var yValue = null,
                yValueHash = null,
                yValueRange = null,
                infinityValuePointsY = null;
            var yAxisColumnDataRowIndex = yAxisColumns[0].getDataRowIndex();
            if (!isYAxisOrdinalBased) {
                yValue = yValueHash = yAxisValues[0];

                yValueRange = columnValueRanges[yAxisColumnDataRowIndex];
                infinityValuePointsY = infinityValuePointForColumn[yAxisColumnDataRowIndex];
            } else {
                yValueHash = yAxisValues[0];

                if (!uniqueYAxisValuesHash[yAxisColumnDataRowIndex].hasOwnProperty(yValueHash)) {
                    _logger.error('no y value for yAxisValueHashKey', yValueHash);
                }
                yValue = uniqueYAxisValuesHash[yAxisColumnDataRowIndex][yValueHash];
            }

            var seriesName = null;
            // TODO(sunny): Object notation for points will not work once turbo
            // threshold has been breached
            // TODO(sunny): if there is no valid data point for a series we currently
            // end up skipping that series completely. We can, in the future,
            // show an info banner informing the user about this.
            if (plotEachYAsSeries) {
                yAxisColumns.each(function(column, yAxisColumnIndex){
                    var yVal = yAxisValues[yAxisColumnIndex],
                        dataRowIndex = column.getDataRowIndex();

                    if(column.isEffectivelyNonNumeric()) {
                        let uniques = uniqueYAxisValuesHash[yAxisColumnDataRowIndex];
                        if (!uniques.hasOwnProperty(yVal)) {
                            _logger.error('no y value for yAxisValueHashKey', yVal);
                        }
                        yVal = uniques[yVal];
                    }

                    var
                        infinityValuePointsY = infinityValuePointForColumn[dataRowIndex],
                        yValuesRange = columnValueRanges[dataRowIndex];

                    var point = self.getChartPointFromDataPoint(xValue, yVal, dataRow,
                        isXAxisOrdinalBased, column.isEffectivelyNonNumeric(),
                        categoryColumn, radialColumn, xValueRange, yValuesRange,
                        infinityValuePointsX, infinityValuePointsY);
                    if (point === null) {
                        return;
                    }

                    seriesName = chartModel.distinctYAxisColumnNames[yAxisColumnIndex];
                    series[seriesName].push(point);
                });
            } else {
                var legendValue = legendValues.join(
                    chartUtilService.COMPOSITE_COLUMN_VALUES_JOIN_KEY
                );

                seriesName = legendValue;

                if (!series.hasOwnProperty(legendValue)) {
                    series[legendValue] = [];
                }

                var point = self.getChartPointFromDataPoint(xValue, yValue, dataRow,
                    isXAxisOrdinalBased, isYAxisOrdinalBased, categoryColumn, radialColumn,
                    xValueRange, yValueRange, infinityValuePointsX, infinityValuePointsY);
                if (point === null) {
                    return;
                }

                series[legendValue].push(point);
            }
        });

        // now that we have the full range of data on axis columns
        // we can decided what the infinity placeholder values should
        // be
        Object.keys(columnValueRanges).each(function(dataRowIndex){
            var colValRange = columnValueRanges[dataRowIndex],
                infinityValuePoints = infinityValuePointForColumn[dataRowIndex],
                infinityPlaceholderValue =
                    util.computeAxisInfinityPlaceholderValue(colValRange.min, colValRange.max),
                columnHasPositiveInfiniteValues = false,
                columnHasNegativeInfiniteValues = false;

            infinityValuePoints.each(function(point){
                ['x', 'y'].each(function(prop){
                    var val = point[prop];
                    if (util.isSpecialInfinityValue(val)) {
                        columnHasPositiveInfiniteValues = true;
                        point[prop] = infinityPlaceholderValue;
                    } else if (util.isSpecialMinusInfinityValue(val)) {
                        columnHasNegativeInfiniteValues = true;
                        point[prop] = -infinityPlaceholderValue;
                    }
                });
            });

            self._columnHasInfinityValues[dataRowIndex] = columnHasPositiveInfiniteValues;
            self._columnHasMinusInfinityValues[dataRowIndex] = columnHasNegativeInfiniteValues;

            self._maxColumnValues[dataRowIndex] = colValRange.max;
            self._minColumnValues[dataRowIndex] = colValRange.min;
        });

        // sort all points by x value. note that x value is always a number, in case of ascending
        // measure/timeseries it is the real x value, in all other cases it is the index in
        // uniques array which has already been sorted note that in case of sorting on
        // legend column x-axis value are non guaranteed to be sorted and hence this sorting
        // here is necessary.
        _.values(series).each(function(points:Array<any>){
            points.sort(function(point1, point2){
                return point1.x - point2.x;
            });
        });

        // legend UI needs to be able to look up series by formatted legend name.
        // Since calculating formatted legend name can be costly (because of a formatter
        // call for each data point) we first use the faster hash key calculation
        // (not requiring formatter calls) to de-duplicate legend value and
        // then replace unformatted legend names with formatted ones.
        var orderedSeriesNames = [],
            // the series are sorted in the alphabetical order
            // of their names which can make them out of sync
            // with the y-axis columns in case of a multi-measure
            // y-axis. we use this map to send this information
            // over to the chart (SCAL-6957)
            seriesNameToYAxisIndex = {};
        if (!plotEachYAsSeries) {
            var prevUniqueLegendValues = uniqueLegendValues,
                prevSeries = series;

            uniqueLegendValues = [];
            series = {};

            prevUniqueLegendValues.each(function(valueObjects) {
                var unformattedSeriesName = valueObjects.map(function(valueObject){
                        return valueObject.value;
                    }).join(chartUtilService.COMPOSITE_COLUMN_VALUES_JOIN_KEY),
                    formattedSeriesName =
                        chartUtilService.formatCompositeColumnValue(chartModel, valueObjects);
                uniqueLegendValues.push(valueObjects);
                // TODO(sunny): this will break if multiple un-formatted series names map to the
                // same formatted series name
                // we will end up losing points from all but one of such series
                series[formattedSeriesName] = prevSeries[unformattedSeriesName];
                seriesNameToId[formattedSeriesName] = formattedSeriesName;
                orderedSeriesNames.push(formattedSeriesName);
                seriesNameToYAxisIndex[formattedSeriesName] = 0;
            });
        } else {
            orderedSeriesNames = Object.keys(series);
            orderedSeriesNames.each(function(seriesName, yAxisColumnIndex){
                seriesNameToYAxisIndex[seriesName] = yAxisColumnIndex;
                seriesNameToId[seriesName] = yAxisColumns[yAxisColumnIndex].getSageOutputColumnId();
            });
            orderedSeriesNames.sort();
        }

        let normalizedSeriesNameGetter = this.getNormalizedSeriesName.bind(this);
        var DEFAULT_SERIES_NAME = 'Series 1',
            visibleSeriesIds = chartModel.getVisibleSeriesIds(),
            visibleSeriesNameHash =  visibleSeriesIds
                ? util.mapArrayToBooleanHash(visibleSeriesIds, normalizedSeriesNameGetter) :
                null,
            seriesColors = chartModel.getSeriesColors();

        if (isLineStackedChart) {
            var lineStackAugmentQuery = chartModel.getQueryDefinitions()[1];
            var augmentQueryData = chartModel.getDataArray()[1];
            var augmentSeries = {};
            var yAxisColumnsPlottedAsSeries = lineStackAugmentQuery.yAxisColumns;
            // NOTE: X-Axis should be same as the base query. perhaps add assertions somewher.
            var xAxisColumnsInAugmentQuery = lineStackAugmentQuery.xAxisColumns;

            yAxisColumnsPlottedAsSeries.forEach((col, index) => {
                var seriesName = col.getName(false);
                augmentSeries[seriesName] = [];
                seriesNameToId[seriesName] = seriesName;
                orderedSeriesNames.push(seriesName);
                seriesNameToYAxisIndex[seriesName] = index + 1;
            });

            var xAxisColumnsDataRowIndices = new Set(xAxisColumnsInAugmentQuery.map((column) => {
                return column.getDataRowIndex();
            }));

            augmentQueryData.getData().forEach((dataRow) => {
                var xValues = dataRow.filter((value, index) => {
                    return xAxisColumnsDataRowIndices.has(index);
                });
                var xValueHash = xValues.join(chartUtilService.COMPOSITE_COLUMN_VALUES_JOIN_KEY);
                yAxisColumnsPlottedAsSeries.forEach((yAsLineColumn) => {
                    var yValue = dataRow[yAsLineColumn.getDataRowIndex()];
                    var seriesName = yAsLineColumn.getName(false);
                    var point = {
                        x: isXAxisOrdinalBased ? uniqueXAxisValuesHash[xValueHash] : xValueHash,
                        y: yValue
                    };
                    if (uniqueXAxisValuesHash[xValueHash] !== void 0) {
                        augmentSeries[seriesName].push(point);
                    }
                });
            });

            yAxisColumnsPlottedAsSeries.forEach(function(yAsLineColumn) {
                var seriesName = yAsLineColumn.getName(false);
                // Order the series such that its in the order of x-axis.
                augmentSeries[seriesName].sort((p1, p2) => {
                    if (isXAxisOrdinalBased) {
                        return p1.x - p2.x;
                    } else {
                        return uniqueXAxisValuesHash[p1.x] - uniqueXAxisValuesHash[p2.x];
                    }
                });
            });

            // TODO(Jasmeet): Handle the case where the series name from legend and y-axis column
            // overlap.
            _.assign(series, augmentSeries);
        }

        this._series = orderedSeriesNames.map(function(seriesName, seriesIndex) {
            var dataPoints = series[seriesName],
                seriesConfig: any = {
                    data: dataPoints
                };
            if (seriesName) {
                seriesConfig.name = seriesName;
                seriesConfig.blinkSeriesId = seriesNameToId[seriesName];
                var yAxisIndex = seriesNameToYAxisIndex[seriesName];
                seriesConfig.valueColumnIdentifier =
                    yAxisColumns[yAxisIndex].getSageOutputColumnId();
            } else {
                seriesConfig.name = seriesName;
                seriesConfig.blinkSeriesId = yAxisColumns[seriesIndex].getSageOutputColumnId();
                seriesConfig.valueColumnIdentifier =
                    yAxisColumns[seriesIndex].getSageOutputColumnId();
            }
            if (plotEachYAsSeries) {
                seriesConfig.yAxis =
                    chartModel.isYAxisShared() ? 0 : seriesNameToYAxisIndex[seriesName];
            }

            if (isLineStackedChart) {
                seriesConfig.yAxis = chartModel.isYAxisShared()
                    ? 0
                    : seriesNameToYAxisIndex[seriesName];
            }

            if (visibleSeriesNameHash) {
                var normalizedSeriesName = normalizedSeriesNameGetter(seriesName),
                    isSeriesVisible = false;

                if (!normalizedSeriesName
                    && visibleSeriesNameHash.hasOwnProperty(DEFAULT_SERIES_NAME)) {
                    isSeriesVisible = true;
                } else if (visibleSeriesNameHash.hasOwnProperty(normalizedSeriesName)) {
                    isSeriesVisible = true;
                } else if (visibleSeriesNameHash.hasOwnProperty(seriesNameToId[seriesName])) {
                    isSeriesVisible = true;
                }

                seriesConfig.visible = isSeriesVisible;
            }
            if (seriesColors && seriesColors.hasOwnProperty(seriesConfig.blinkSeriesId)) {
                seriesConfig.color = seriesColors[seriesConfig.blinkSeriesId];
            }

            return seriesConfig;
        });

        // TODO(sunny): we should not calculate all formatted legend values upfront,
        // the user might never scroll to them
        this._compositeLegendValueToRawValues = {};
        this._uniqueLegendValues = [];
        // legendValues are accessed quite frequently and we also do not need to re-evaluate their
        // formatting unlike x-axis label, so we pre-format the label in the legend
        uniqueLegendValues.each(function(valueObjects){
            var formattedValue =
                chartUtilService.formatCompositeColumnValue(chartModel, valueObjects);
            self._compositeLegendValueToRawValues[formattedValue] =
                valueObjects.map(function(valueObject){
                    return valueObject.value;
                });
            self._uniqueLegendValues.push(formattedValue);
        });


        this._xValueToRawValues = uniqueXAxisValues;
        this._yValueToRawValues = uniqueYAxisValues;

        this._series.remove(function(serie) {
            return serie.data.length === 0;
        });

        this._hasNoData = this._series.none(function(serie){
            return serie.data && serie.data.length > 0;
        });
        return true;
    }

    /**
     * Utility method to process yValues for a given data point in chart data
     * @param xVal
     * @param yVal
     * @param dataRow
     * @param isXAxisPrimarySortMeasure
     * @param categoryColumn
     * @param radialColumn
     * @param yValuesRange
     * @param infinityValuePoints
     * @param infinityValuePointsX
     * @param infinityValuePointsY
     * @returns {{x: *, y: *}}
     * @private
     */
    // TODO(vibhor): Once we can piggyback backend data normalization on extraction pass,
    // we can get rid of this.
    private shouldNormalizeBackendData (chartModel) {
        // SCAL-5114: we re-use already normalized data in certain cases
        // (e.g. when a viz is delete from a pinboard)
        if (!!chartModel._vizData.isNormalized) {
            return false;
        }
        return true;
    }

    /**
     * Normalizes the data coming from backend for consumption by the chart rendering library.
     * TODO(vibhor): Figure out a "clean" way to combine this with data pass done during extraction
     * and so not have to do this extra pass for normalization. As it is, this is a performance hit.
     * @private
     */
    private normalizeBackendData (chartModel) {
        if (!this.shouldNormalizeBackendData(chartModel)) {
            return;
        }

        var dataArray = chartModel.getDataArray();
        var queryDefinitions = chartModel.getQueryDefinitions();

        queryDefinitions.forEach((queryDefinition, index) => {
            var queryData = dataArray[index];
            var data = queryData.getData();
            var totalRows = data.length;
            var column,i,j;

            var columns = queryDefinition.getColumnsInDataOrder();
            var numericColumns = [], nonNumericColumns = [];
            columns.forEach((column) => {
                column.isEffectivelyNumeric()
                    ? numericColumns.push(column)
                    : nonNumericColumns.push(column);
            });

            // for each row, normalize each cell value using the corresponding normalizer for
            // that column.
            for (i = 0; i < totalRows; ++i) {
                var currentRow = data[i];
                if (currentRow && currentRow.length > 0) {
                    // First normalize measure columns.
                    for (j = 0; j < numericColumns.length; ++j) {
                        column = numericColumns[j];
                        currentRow[column.getDataRowIndex()] = column.convertValueFromBackend(
                            currentRow[column.getDataRowIndex()]
                        );
                    }
                    // Next normalize attribute columns.
                    for (j = 0; j < nonNumericColumns.length; ++j) {
                        column = nonNumericColumns[j];
                        currentRow[column.getDataRowIndex()] = column.convertValueFromBackend(
                            currentRow[column.getDataRowIndex()]
                        );
                    }
                }
            }
        });

        chartModel._vizData.isNormalized = true;
    }

    private removeNulls (chartModel) {
        var allIncludedColumns = chartModel.getVisualizedColumns();
        var allIncludedDataRowIndices = allIncludedColumns.map(dataRowIndexGetter),
            sortedOnX = chartModel.isPrimarySortOnXAxisColumns(true),
            dataRowColumnsAllowingNulls = allIncludedColumns.filter(function(column){
                if (column.isEffectivelyNumeric()) {
                    if (chartModel.getYAxisColumns().indexOf(column) >= 0) {
                        return true;
                    }
                    if (chartModel.getXAxisColumns().indexOf(column) >= 0) {
                        // measure on x-axis but not sorted on it means non-scaled x-axis
                        return !sortedOnX;
                    }
                    return false;
                }
                if (column.isDateColumn()) {
                    return !sortedOnX;
                }
                return true;
            }),
            dataRowIndicesAllowingNulls =
                util.mapArrayToHash(dataRowColumnsAllowingNulls, dataRowIndexGetter, true);

        var dataArray = chartModel.getDataArray();
        var baseQueryData = dataArray[0];
        var data = baseQueryData.getData();

        data.remove((dataRow) => {
            return allIncludedDataRowIndices.any(function(dataRowIndex) {
                var badValue = false;
                if (dataRowIndex < dataRow.length) {
                    var value = dataRow[dataRowIndex];
                    // attributes may not have nulls
                    if (value === null &&
                        !dataRowIndicesAllowingNulls.hasOwnProperty(dataRowIndex)) {
                        badValue = true;
                    }
                }
                return badValue;
            });
        });
    }

    get columnHasInfinityValues () {
        return this._columnHasInfinityValues;
    }

    get columnHasMinusInfinityValues () {
        return this._columnHasMinusInfinityValues;
    }

    get maxColumnValues () {
        return this._maxColumnValues;
    }

    get minColumnValues () {
        return this._minColumnValues;
    }

    get minRadialValue () {
        return this._minRadialValue;
    }

    get maxRadialValue () {
        return this._maxRadialValue;
    }

    get xAxisHasNonNullValue () {
        return this._xAxisHasNonNullValue;
    }

    get hasError () {
        return this._hasError;
    }

    get series () {
        return this._series;
    }

    get compositeLegendValueToRawValues () {
        return this._compositeLegendValueToRawValues;
    }

    get uniqueLegendValues () {
        return this._uniqueLegendValues;
    }

    get xValueToRawValues () {
        return this._xValueToRawValues;
    }

    get yValueToRawValues () {
        return this._yValueToRawValues;
    }

    get hasNoData () {
        return this._hasNoData;
    }
}

function updateValueRange(val, point, valueRange, infinityValuePoints) {
    if (util.isSpecialValue(val)) {
        if (util.isSpecialInfinityValue(val) || util.isSpecialMinusInfinityValue(val)) {
            infinityValuePoints.push(point);
        } else {
            // NaN or any other special value have no representation
            // in a measure, we silently drop such points
            return false;
        }
    } else {
        valueRange.min = Math.min(valueRange.min, val);
        valueRange.max = Math.max(valueRange.max, val);
    }

    return true;
}

function dataRowIndexGetter(column) {
    return column.getDataRowIndex();
}

function getDataRowIndexToColumnMap(columns) {
    return columns.reduce((dataRowIndexToColumnMap, column) => {
        dataRowIndexToColumnMap[column.getDataRowIndex()] = column;
        return dataRowIndexToColumnMap;
    }, {});
}

function axisColumnValuesComparator(descending, valuesA, valuesB, hashKeyA, hashKeyB) {
    if (!valuesA && !valuesB) {
        return 0;
    }
    if (!valuesA) {
        return 1;
    }
    if (!valuesB) {
        return -1;
    }

    if (valuesA.length !== valuesB.length) {
        _logger.warn('mismatch in values array length',
            valuesA.length, valuesB.length, valuesA, valuesB);
        return 0;
    }
    for (var i=0; i<valuesA.length; i++) {
        var valueA = valuesA[i].value,
            valueB = valuesB[i].value;

        var aIsInfinity = util.isSpecialInfinityValue(valueA);
        var bIsInfinity = util.isSpecialInfinityValue(valueB);
        if (aIsInfinity && bIsInfinity) {
            continue;
        }
        if (aIsInfinity && !bIsInfinity) {
            return !!descending ? -1 : 1;
        }
        if (!aIsInfinity && bIsInfinity) {
            return !!descending ? 1 : -1;
        }

        if (valueA === null || valueB === null) {
            if (valueA === null && valueB === null) {
                continue;
            }
            if (valueA === null) {
                return !!descending ? 1 : -1;
            }
            return !!descending ? -1 : 1;
        }

        if (valueA > valueB) {
            return !!descending ? -1 : 1;
        }
        if (valueA < valueB) {
            return !!descending ? 1 : -1;
        }
    }
    return 0;
}

/**
 * Sorts the uniques related data for an axis.
 * Sorting is done in by comparing corresponding column values for
 * the axis in the "natural" order. The data is sorted in place.
 * Example:
 *
 * input:
 * uniqueValues: [[{"dataRowIndex":1,"value":"red"}],[{"dataRowIndex":1,"value":"blue"}]]
 * uniqueValuesHash: {"red":0,"blue":1}
 *
 * updated:
 * uniqueValues: [[{"dataRowIndex":1,"value":"blue"}],[{"dataRowIndex":1,"value":"red"}]]
 * uniqueValuesHash: {"blue":0,"red":1}
 *
 * @param uniqueValues
 * @param uniqueValuesHash
 */
function sortUniqueValues(uniqueValues, uniqueValuesHash, comparator) {
    var hashKeys = Object.keys(uniqueValuesHash);
    hashKeys.sort(function(hashKeyA, hashKeyB){
        var valuesIndexA = uniqueValuesHash[hashKeyA],
            valuesIndexB = uniqueValuesHash[hashKeyB],
            valuesA = uniqueValues[valuesIndexA],
            valuesB = uniqueValues[valuesIndexB];
        return comparator(valuesA, valuesB, hashKeyA, hashKeyB);
    });

    var oldUniqueValues = _.cloneDeep(uniqueValues),
        oldUniqueValuesHash = _.cloneDeep(uniqueValuesHash);

    // clear the original array and hash
    uniqueValues.length = 0;
    util.clearObject(uniqueValuesHash);

    hashKeys.each(function(hashKey, hashKeyIndex){
        uniqueValuesHash[hashKey] = hashKeyIndex;

        var oldHashKeyIndex = oldUniqueValuesHash[hashKey];
        uniqueValues[hashKeyIndex] = oldUniqueValues[oldHashKeyIndex];
    });
}

/**
 * Maps a set of columns to a distinct name for each one of them.
 * If a column is the only one with its name in the set,
 * it is mapped to its original name (=column.getName()).
 * If there are multiple columns with the same name they are all mapped to
 * <columnName> (<tableName>), where tableName is the name of the table
 * to which the column belongs.
 * @param columns {Array}
 * @returns {Array}
 */
function getDistinctNamesForColumns(columns) {
    var columnNameToColumnCount = {};
    columns.each(function(column){
        var columnName = column.getName();
        if (!columnNameToColumnCount.hasOwnProperty(columnName)) {
            columnNameToColumnCount[columnName] = 0;
        }
        columnNameToColumnCount[columnName]++;
    });

    return columns.map(function(column){
        var columnName = column.getName(),
            columnCountWithSameName = columnNameToColumnCount[columnName];
        if (columnCountWithSameName === 1) {
            return columnName;
        }


        var sourceName = column.getSourceName(/* includeColumnName */ true);
        if(!sourceName) {
            return columnName;
        }

        return sourceName;
    });
}
