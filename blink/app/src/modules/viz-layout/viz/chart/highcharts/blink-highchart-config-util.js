/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma
 *
 * @fileoverview Util file to keep the chunks of the logic of blink hightchart config for easy
 *               testability.
 */

'use strict';

blink.app.factory('blinkHighchartConfigUtil', ['Logger',
    'blinkConstants',
    'strings',
    'chartThemeService',
    'chartTypeSpecificationService',
    'dateUtil',
    'fontMetricService',
    'util',
    function (Logger,
              blinkConstants,
              strings,
              chartThemeService,
              chartTypeSpecificationService,
              dateUtil,
              fontMetricService,
              util) {

        var _logger = Logger.create('blink-highchart-config-util');

        /**
         * Given a chart model and highchart context, find the correct y-axis series column this
         * context represents.
         * @param chartModel
         * @param context
         */
        function findSeriesColumnFromContext(chartModel, context) {
            var seriesColumn,
                yAxisColumns = chartModel.getYAxisColumns();
            var isLineStackedChart = chartModel.getChartType()
                === chartTypeSpecificationService.chartTypes.LINE_STACKED_COLUMN;

            if (isLineStackedChart) {
                if (context.series.options.type === strings.charts.seriesType.LINE) {
                    seriesColumn = chartModel.getYAxisColumn(context.series.name);
                } else {
                    seriesColumn = yAxisColumns[0];
                }
            } else {
                if (yAxisColumns.length === 1) {
                    seriesColumn = yAxisColumns[0];
                } else {
                    seriesColumn = chartModel.getColumn(context.series.userOptions.blinkSeriesId);
                    if (!seriesColumn) {
                        _logger.warn('Could not find the relevant viz column for series point');
                        seriesColumn = yAxisColumns[0];
                    }
                }
            }
            return seriesColumn;
        };

        // This function represent the number of primary colors to be used in a chart based
        // on the legend size
        function getPrimaryColorCountForLegend(legendSize) {
            var variationColorCount;
            if (legendSize < 11) {
                variationColorCount = 3;
            } else if (legendSize < 20) {
                variationColorCount = 4;
            } else if (legendSize < 30) {
                variationColorCount = 5;
            } else if (legendSize < 40) {
                variationColorCount = 6;
            } else if (legendSize < 49) {
                variationColorCount = 7;
            } else {
                variationColorCount = 8;
            }

            return variationColorCount;
        }

        function getColors(allColors, legendSize, usedColors, randomizationIdx, useRainbowColors) {
            if (useRainbowColors) {
                var colors = _.difference(allColors, usedColors);
                util.rotateArray(colors, _.isNil(randomizationIdx) ? 0 : randomizationIdx);
                return colors;
            }

            var primaryColorCount = 8;
            var colorVariationCount = 7;

            var expectedPaletteSize = primaryColorCount * colorVariationCount;
            if (allColors.length !== expectedPaletteSize) {
                _logger.error('Incorrect color template length.');
                return allColors;
            }

            var rotateIdx = _.isNumber(randomizationIdx)
                ? randomizationIdx
                : Math.floor(Math.random() * primaryColorCount);
            var primaryColorsToUse = getPrimaryColorCountForLegend(legendSize, primaryColorCount);

            var colors = [];
            var sameColorVariations = Math.ceil(legendSize / primaryColorsToUse);
            for (var primaryColorIdx = 0; primaryColorIdx < primaryColorCount; ++primaryColorIdx) {
                for (var variationIdx = 0; variationIdx < sameColorVariations; ++variationIdx) {
                    var primaryColorIdxToUse = (primaryColorIdx + rotateIdx) % primaryColorCount;
                    var colorIdx = primaryColorIdxToUse + primaryColorCount * variationIdx;
                    colors.push(allColors[colorIdx]);
                }
            }
            var uniqueUsedColors = _.uniq(usedColors);
            if (legendSize < colors.length) {
                colors = _.difference(colors, uniqueUsedColors);
            }

            return colors;
        };

        var updateSeriesWithMarkerSettings = function (series) {
            series.forEach(function(singleSeries) {
                if (singleSeries.data.length <= 1) {
                    singleSeries.marker = {};
                    singleSeries.marker.enabled = true;
                }
            });
        };

        function ignoreFillDateHoles(min, max, bucketization) {
            var MAX_POINTS = 10000;
            var points = (max - min) / dateUtil.getIntervalMillisForTimeBucket(bucketization);
            return points > MAX_POINTS;
        }

        function getEstimatedXAxisWidth(constants, chartConfig, containerDimensions) {
            // We add an extra invert axis margin for left axis.
            var margin = constants.formatting.INVERT_AXIS_MARGIN;
            if (!!chartConfig.marginRight) {
                margin += chartConfig.marginRight;
            }
            var width = containerDimensions.width - margin;
            return width;
        }

        function getDateTickPositions(chartModel, containerDimensions, chartConfig, constants) {
            var FONT = chartThemeService.getDefaultTheme().xAxis.labels.style;
            var LABEL_PADDING = 5;
            var dataModel = chartModel.getDataModel();
            var newTickPositions = [];
            var minDate = dataModel.xValueToRawValues[0][0].value;
            var maxDate =
                dataModel.xValueToRawValues[dataModel.xValueToRawValues.length - 1][0].value;
            var estimatedLabelWidth = fontMetricService.getTextWidth(
                    chartModel.getXAxisLabelAt(minDate),
                    FONT
                ) + LABEL_PADDING;
            var width = getEstimatedXAxisWidth(constants, chartConfig, containerDimensions);
            var labelCount = Math.floor(width / estimatedLabelWidth);
            var bucketization = chartModel.getXAxisColumns()[0].getTimeBucket();
            var skipCoeff;
            if (bucketization === dateUtil.timeBuckets.NO_BUCKET
                || ignoreFillDateHoles(minDate, maxDate, bucketization)
            ) {
                var minDiff = Number.MAX_VALUE;
                dataModel.xValueToRawValues.forEach(function(val, index){
                    if (index > 0) {
                        var currVal = val[0].value;
                        var prevVal = dataModel.xValueToRawValues[index - 1][0].value;
                        var diff = currVal - prevVal;
                        if (diff < minDiff) {
                            minDiff = diff;
                        }
                    }
                });
                var potentialLabelCount = Math.ceil((maxDate - minDate) / minDiff);
                skipCoeff = Math.ceil(potentialLabelCount / labelCount);
                skipCoeff = skipCoeff === 0 ? 1 : skipCoeff;
                dataModel.xValueToRawValues.forEach(function(val, index){
                    if (index % skipCoeff === 0) {
                        newTickPositions.push(val[0].value);
                    }
                });

                // NOTE: Current logic is designed to optimize of axis labels to coincide with
                // the data values on x.
                // In case of uniform data this works well, which is generally the case with
                // time-series.
                // In case when we have no buckets this handled by checking if we have a very
                // sparse labels, we uniformly break the axis to make it more readable.
                // In the other bucketed case this is not a problem as we fill holes in data.
                var isSparse = newTickPositions.length <= labelCount / 2;
                if (isSparse) {
                    var offset = Math.floor((maxDate - minDate) / (labelCount - 1));
                    newTickPositions = [];
                    var date = minDate;
                    do {
                        newTickPositions.push(date);
                        date += offset;
                    } while(date <= maxDate && offset > 0);
                }
            } else {
                var allXValues = [];
                var date = minDate;
                while(date <= maxDate) {
                    allXValues.push(date);
                    date = dateUtil.getNextBucketEpoch(date, bucketization);
                }
                skipCoeff = Math.ceil(allXValues.length / labelCount);
                skipCoeff = skipCoeff === 0 ? 1 : skipCoeff;

                allXValues.forEach(function(value, index) {
                    if (index % skipCoeff === 0) {
                        newTickPositions.push(value);
                    }
                });
            }

            return newTickPositions;
        };

        return {
            findSeriesColumnFromContext: findSeriesColumnFromContext,
            getColors: getColors,
            updateSeriesWithMarkerSettings: updateSeriesWithMarkerSettings,
            getDateTickPositions: getDateTickPositions,
            getEstimatedXAxisWidth: getEstimatedXAxisWidth
        };
    }]);
