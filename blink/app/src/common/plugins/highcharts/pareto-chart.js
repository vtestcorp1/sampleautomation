/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview This file adds pareto chart support as a highcharts plugin. See
 * http://www.highcharts.com/docs/extending-highcharts/extending-highcharts for more information on
 * highcharts plugins.
 */

(function (H) {

    function formatPercentage(value, roundToInt) {
        return numeral(value).format(roundToInt ? '0%' : '0.00%');
    }

    function getCumulatedData(originalData) {
        var ySum = 0,
            hasNegativeValue = false,
            cumulativeSum = 0;

        for (var i=0; i<originalData.length; i++) {
            var yVal = originalData[i].y;
            if (yVal < 0) {
                console.log('invalid y value, pareto chart does not support negative values', yVal);
                hasNegativeValue = true;
                break;
            }
            ySum += yVal;
        }

        if (!hasNegativeValue && ySum > 0) {
            var data = originalData.map(function(dataPoint){
                var newPoint = Object.clone(dataPoint);
                cumulativeSum += dataPoint.y;
                newPoint.y = cumulativeSum/ySum;
                return newPoint;
            });
            return data;
        }

        return null;
    }

    function getParetoAxisName(originalSeries) {
        var axisName = 'Cumulative Percent';
        if (!!originalSeries.name) {
            axisName = '{1} {2}'.assign(axisName, originalSeries.name);
        }
        return axisName;
    }

    H.wrap(H.Chart.prototype, 'init', function (proceed, userOptions) {
        if (!Array.isArray(userOptions.yAxis)) {
            userOptions.yAxis = [userOptions.yAxis];
        }

        // remove all the series/axes added by any previous pareto
        // rendered
        userOptions.yAxis.remove(function(axis){
            return axis.blinkType === 'pareto';
        });
        userOptions.series.remove(function(axis){
            return axis.blinkType === 'pareto';
        });

        if (userOptions.chart.type !== 'pareto') {
            return proceed.apply(this, Array.prototype.slice.call(arguments, 1));
        }

        // unless we set this to false the pareto y-axis
        // range can extend beyond 100% as highcharts tries
        // to align the other y-axis labels with pareto
        // y-axis labels
        userOptions.chart.alignTicks = false;

        var newSeries = [],
            newYAxes = [];
        // the series in the original chart are all drawn as columns
        userOptions.series.each(function(serie, seriesIndex){
            serie.type = 'column';
            if (serie.zIndex === void 0) {
                serie.zIndex = seriesIndex;
            }
            if (serie.id === void 0) {
                // ids need to be string, highcharts doesn't like it otherwise
                serie.id = seriesIndex + '';
            }

            var total = serie.data.reduce(function(previousValue, currentValue) {
                return previousValue + currentValue.y;
            }, 0);

            var tickPositions = [];
            var delta = total / 5;
            for (var i = 0; i <= 5; i++) {
                tickPositions[i] = i * delta;
            }
            userOptions.yAxis[seriesIndex].tickPositions = tickPositions;

            var cumulatedData = getCumulatedData(serie.data);
            if (!cumulatedData) {
                return;
            }

            var yAxis = {
                blinkType: 'pareto',
                gridLineColor: 'transparent',
                opposite: true,
                min: 0,
                max: 1,
                title: {
                    text: getParetoAxisName(serie)
                },
                labels:{
                    formatter:function(){
                        return formatPercentage(this.value, true);
                    }
                }
            };
            newYAxes.push(yAxis);

            newSeries.push({
                type: 'line',
                blinkType: 'pareto',
                dataLabels: {
                    formatter: function() {
                        return formatPercentage(this.y, false)

                    },
                    y: -3,
                    x: -6
                },
                linkedTo: serie.id,
                zIndex: serie.zIndex + 1,
                yAxis: userOptions.yAxis.length + newYAxes.length - 1,
                data: cumulatedData,
                marker: {
                    enabled: true,
                    radius: 1
                },
                tooltipFormatter: function (pointConfig) {
                    var formattedPercentage = formatPercentage(pointConfig.y, false);
                    return '<span class="yAxisTitle">Cumulative Percent</span>: {1}'.assign(formattedPercentage);
                }
            });

        });

        userOptions.yAxis.add(newYAxes);
        userOptions.series.add(newSeries);
        // Run the original proceed method
        return proceed.apply(this, Array.prototype.slice.call(arguments, 1));

    });

}(Highcharts));
