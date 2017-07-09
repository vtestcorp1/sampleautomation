/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Utility package for chart rendering.
 */

'use strict';

blink.app.factory('chartUtilService', [ 'blinkConstants',
    'strings',
    'util',
    'Logger',
    function (blinkConstants,
          strings,
          util,
          Logger) {
        var _logger = Logger.create('chart-util-service');

        var chartAxis = {
            X: 'x',
            Y: 'y',
            Z: 'z', // legend
            R: 'r', // bubble radius
            HIDDEN: 'hidden',
            NONE: 'none'
        };

        var formattingConstants = {
            EXPECTED_WIDTH_PER_Y_AXIS: 45,
            MIN_WIDTH_TO_SHOW_Y_AXIS_LABELS: 440,
            MIN_HEIGHT_TO_SHOW_X_AXIS_LABELS: 386,
            MIN_WIDTH_TO_SHOW_LEGEND: 600,
            MIN_HEIGHT_TO_SHOW_LEGEND: 480,
            COMPOSITE_COLUMN_VALUES_JOIN_KEY: ', ',
            HORIZONTAL_LEGEND_MAX_CARDINALITY: 5
        };

        var legendOrientations = {
            HORIZONTAL: 'HORIZONTAL',
            VERTICAL: 'VERTICAL'
        };

    /**
     * @param chartAxis {ChartAxis}
     */
        var setChartAxisInClientState = function (column, chartAxis) {
            var json = column.getJson();
            if (!json.clientState) {
                json.clientState = {};
            }
            json.clientState.chartAxis = chartAxis;
        };

    /**
     * @param column {VisualizationColumnModel}
     * @returns {ChartAxis}
     */
        var getChartAxisFromClientState = function (column) {
            var json = (column && column.getJson()) || {};
            if (!json.clientState || !json.clientState.chartAxis) {
                return this.ChartAxis.NONE;
            }
            return json.clientState.chartAxis;
        };

        var formatCompositeColumnValue = function (model, values) {
            var effectiveIdToColumnMap = model.getEffectiveIdToColumnMap();
            return values.map(function(valueObject) {
                var columnEffectiveId = valueObject.columnEffectiveId,
                    column = effectiveIdToColumnMap[columnEffectiveId];

                if (!column) {
                    _logger.error('no column for column effective id', columnEffectiveId);
                    return valueObject.value;
                }
                return column.getDataFormatter()(valueObject.value, {
                    noShorten: false
                });
            }).join(this.COMPOSITE_COLUMN_VALUES_JOIN_KEY);
        };

        var columnEffectiveIdGetter = function(column) {
            return column.getSageOutputColumnId();
        };

        var isChartBigEnoughToShowLabels = function(containerDimensions, vizModel) {
            if (containerDimensions.height < formattingConstants.MIN_HEIGHT_TO_SHOW_X_AXIS_LABELS) {
                return false;
            }
            var width = containerDimensions.width,
                minRequiredWidth = formattingConstants.MIN_WIDTH_TO_SHOW_Y_AXIS_LABELS,
                yAxisColumns = vizModel.getYAxisColumns();
            if (yAxisColumns.length > 1 && !vizModel.isYAxisShared()) {
                minRequiredWidth += (yAxisColumns.length - 1) * formattingConstants.EXPECTED_WIDTH_PER_Y_AXIS;
            }
            return width >= minRequiredWidth;
        };

        var isChartBigEnoughToShowLegend = function (isInsidePinboard, containerDimensions, isLegendVertical) {
            // hide legend in pinboards conditionally based off of element size and legend layout
            if (!isInsidePinboard) {
                return true;
            }

            if (isLegendVertical) {
                return containerDimensions.width >= formattingConstants.MIN_WIDTH_TO_SHOW_LEGEND;
            }

            return containerDimensions.height >= formattingConstants.MIN_HEIGHT_TO_SHOW_LEGEND;
        };

        var getEstimatedXAxisWidth = function (isXAxisVertical, chartModel, containerDimensions) {
            var chartWidth = isXAxisVertical ? containerDimensions.height : containerDimensions.width,
                numYAxes = chartModel.isYAxisShared() ? 1 : chartModel.getYAxisColumns().length;

            return Math.max(0, chartWidth - formattingConstants.EXPECTED_WIDTH_PER_Y_AXIS * numYAxes);
        };

        var isLegendVertical = function (isGeoMapChartType, chartDimensions, legendCardinality) {
            return chartDimensions.height <= formattingConstants.MIN_HEIGHT_TO_SHOW_LEGEND
            || legendCardinality > formattingConstants.HORIZONTAL_LEGEND_MAX_CARDINALITY
            || isGeoMapChartType;
        };

    /**
     * Check for duplicate on x axis among all series
     *
     * @param {Array<{data:{x: number, y: number}}>} series
     * @return {boolean}
     */
        function checkForXDuplicateAcrossAllSeries(series) {
            var xValuesSet = {};
            return series.any(function(serie){
                return serie.data.any(function(dataPoint){
                    if (Object.has(xValuesSet, dataPoint.x)) {
                        return true;
                    }
                    xValuesSet[dataPoint.x] = true;
                    return false;
                });
            });
        }

        function updateRenderedHighChartColorsInModel(
            chartModel,
            chartConfigOptions,
            chart
        ) {
            chart.series.forEach(function (serie, serieIndex) {
                var seriesId = (serie.userOptions || serie).blinkSeriesId;
                // NOTE: Product doesnt support combination of series with multiple colors to
                // have more than one series.
                if (chartConfigOptions.isMultiColorSeries) {
                    // Note: In case of multiple color series, colors are picked from the palette
                    // so we store that to support color stability.
                    // In cases where the data is changed this logic can fail but highcharts doesnt
                    // allow data value level color binding.
                    var colors = chart.userOptions.colors;
                    chartModel.setMultiColorSeriesColors(
                        seriesId,
                        chartModel.getXAxisColumnsHash(),
                        colors
                    );
                } else {
                    chartModel.setSeriesColor(seriesId, serie.color);
                }
            });
        }

        return {
            ChartAxis: chartAxis,
            checkForXDuplicateAcrossAllSeries: checkForXDuplicateAcrossAllSeries,
            columnEffectiveIdGetter: columnEffectiveIdGetter,
            COMPOSITE_COLUMN_VALUES_JOIN_KEY: formattingConstants.COMPOSITE_COLUMN_VALUES_JOIN_KEY,
            formatCompositeColumnValue: formatCompositeColumnValue,
            getChartAxisFromClientState: getChartAxisFromClientState,
            getEstimatedXAxisWidth: getEstimatedXAxisWidth,
            isLegendVertical: isLegendVertical,
            isChartBigEnoughToShowLabels: isChartBigEnoughToShowLabels,
            isChartBigEnoughToShowLegend: isChartBigEnoughToShowLegend,
            LegendOrientations: legendOrientations,
            setChartAxisInClientState: setChartAxisInClientState,
            updateRenderedHighChartColorsInModel: updateRenderedHighChartColorsInModel
        };
    }]);
