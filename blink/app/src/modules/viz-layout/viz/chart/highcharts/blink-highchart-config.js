/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com), Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * Class wrapping highcharts config.
 */

'use strict';

/* global moment */

blink.app.factory('BlinkHighchartConfig', ['blinkConstants',
    'strings',
    'blinkHighchartConfigUtil',
    'chartThemeService',
    'chartTypeSpecificationService',
    'chartUtilService',
    'fontMetricService',
    'Logger',
    'util',
    'dateUtil',
    function (blinkConstants,
              strings,
              blinkHighchartConfigUtil,
              chartThemeService,
              chartTypeSpecificationService,
              chartUtilService,
              fontMetricService,
              Logger,
              util,
              dateUtil

    ) {
        var _logger = Logger.create('blink-highchart-config');

        var AXIS_LABEL_TEMPLATE = '<div id="{1}" class="bk-axis-label-container">{2}</div>';

        var TOOLTIP_TEMPLATE = '<div class="chart-tooltip-block" style="z-index:9999;"><span class="{1} chart-tooltip-key" style="{2}">{3}:</span> ' +
            '<span class="{4} chart-tooltip-value" style="{5}">{6}</span></div>';
        var incompleteZoneDashStyle = 'ShortDot';

        var constants = {
            GROUPING_POINT_COUNT_THRESHOLD_HIGH: 1500,
            formatting: {
                MIN_AXIS_LABEL_GAP: 40,
                MAX_AXIS_LABEL_HEIGHT: 60,
                X_AXIS_TITLE_MIN_OFFSET: 40,
                MIN_X_AXIS_TITLE_OFFSET: 15,
                MIN_Y_AXIS_TITLE_OFFSET: 5,
                // Note(sunny): legend size related constants need to be in sync with the CSS
                RIGHT_MARGIN_FOR_LEGEND: 0,
                BOTTOM_MARGIN_FOR_LEGEND: 0,
                TICK_SIZE: 10,
                PLOT_LINE_WIDTH: 1,
                PLOT_LINE_Z_INDEX: 4,
                INVERT_AXIS_MARGIN: 70
            }
        };

        function getLabelFontSize() {
            return Highcharts.theme.xAxis.labels.style.fontSize.trim().replace(/px$|em$/, '');
        }

        function getLabelFont() {
            return '{fontSize} {fontFamily}'.assign({
                fontSize: Highcharts.theme.xAxis.labels.style.fontSize,
                fontFamily: Highcharts.theme.xAxis.labels.style.fontFamily
            });
        }

        function getHighchartChartType(chartType) {
            var highchartsType = chartTypeSpecificationService.getHighchartsType(chartType);
            return highchartsType.toLowerCase();
        }

        function tooltipComponent(labelParams, valueParams) {
            var columns = labelParams.columns,
                labelStyle = labelParams.style || '',
                labelClass = labelParams.class,
                value = valueParams.value,
                useFormatter = valueParams.useFormatter || false,
                valueStyle = valueParams.style || '',
                valueClass = valueParams.class;

            if (!columns || !columns.length || !columns[0]) {
                return '';
            }
            if (useFormatter && columns.length == 1) {
                value = columns[0].getDataFormatter()(value);
            }

            return TOOLTIP_TEMPLATE.assign(labelClass, labelStyle, getAxisName(columns), valueClass, valueStyle, value);
        }

        function getAxisName(axisColumns) {
            return axisColumns.map('getName').join(', ');
        }

        function getDataLabel(chartModel, configOpts, context) {
            var labelColumn, value;
            labelColumn = chartModel.getCategoryColumnNotOnAxis();
            if (!!labelColumn) {
                return context.point.categoryName;
            }

            var dataLabelFormatter = configOpts.dataLabelFormatter;
            if (angular.isFunction(dataLabelFormatter)) {
                return dataLabelFormatter.call(context);
            }

            labelColumn = blinkHighchartConfigUtil.findSeriesColumnFromContext(chartModel, context);
            value = context.y;

            if (labelColumn.isEffectivelyNumeric()) {
                return chartModel.getYAxisLabel({
                    yAxisColumn: labelColumn,
                    y: value,
                    formattingOverrides: {
                        noShorten: false
                    }
                });
            } else {
                return chartModel.getYAxisLabelForAttribute(labelColumn, value);
            }
        }

        function formatInfinityValue(value, tickInterval, showInfinity, showMinusInfinity, minValue, maxValue,
                                     infinityPlaceholderValue, isOnYAxis) {
            if (showInfinity) {
                if (value >= infinityPlaceholderValue) {
                    return '<span style="font-weight:bold">∞ {1}</span>'.assign(!!isOnYAxis ? '↑' : '→');
                }
                if (value > maxValue + tickInterval) {
                    return '';
                }
            }
            if (showMinusInfinity) {
                if (value <= infinityPlaceholderValue) {
                    return '<span style="font-weight:bold">-∞ {1}</span>'.assign(!!isOnYAxis ? '↓' : '←');
                }
                if (value < minValue - tickInterval) {
                    return '';
                }
            }
            return null;
        }

        function formatYAxisLabel(value, tickPositions, tickInterval, yAxisColumn, chartModel, minValue, maxValue,
                                  showInfinity, showMinusInfinity, infinityPlaceholderValue) {
            var infinityLabel = formatInfinityValue(value, tickInterval, showInfinity, showMinusInfinity,
                minValue, maxValue, infinityPlaceholderValue, true);
            if (infinityLabel !== null) {
                return infinityLabel;
            }
            return chartModel.getYAxisLabel({
                yAxisColumn: yAxisColumn,
                y: value,
                allYValuesOnLabels: tickPositions
            });
        }

        BlinkHighchartConfig.prototype.configureSharedYAxis = function() {
            var chartModel = this._chartModel;
            var series = chartModel.getSeries();
            var queryDefinitions = chartModel.getQueryDefinitions();
            var columnsInBaseQuery = queryDefinitions[0].getColumnsInDataOrder();
            var columnsInBaseQueryIdMap = columnsInBaseQuery.reduce(function(idMap, column){
                idMap[column.getSageOutputColumnId()] = column;
                return idMap;
            }, {});

            var visibleYAxisColumns = [];

            var visibleYAxisColumnsMap = series.filter(function(serie) {
                return (serie.visible === void 0) || serie.visible;
            }).reduce(function(m, serie) {
                // NOTE: blink series id maps to the effective id of the y axis column for single series
                // But in case of stacked column etc. There are multiple series from same column so it
                // doesnt allow us to retreive the column by Id.
                // For now we are asserting that is only happens when you are looking at series from
                // first y axis column.
                // TODO(Jasmeet): Add state in highchart data model to contain series id to Value column
                // map. And also series to queryDefinition index.
                var col = columnsInBaseQueryIdMap[serie.blinkSeriesId];
                if (!col) {
                    col = queryDefinitions[0].yAxisColumns[0];
                }
                m[col.getSageOutputColumnId()] = col;
                return m;
            }, {});

            visibleYAxisColumns = Object.values(visibleYAxisColumnsMap);

            if (visibleYAxisColumns.length === 0) {
                return [{}];
            }

            var maxY = visibleYAxisColumns.map(function(col){
                    return chartModel.getMaxYValue(col);
                }).max(),
                minY = visibleYAxisColumns.map(function(col){
                    return chartModel.getMinYValue(col);
                }).min();


            var showInfinity = visibleYAxisColumns.any(function(col) {
                    return chartModel.columnHasInfinityValues(col);
                }),
                showMinusInfinity = visibleYAxisColumns.any(function(col) {
                    return chartModel.columnHasMinusInfinityValues(col);
                }),
                infinityPlaceholderValue = util.computeAxisInfinityPlaceholderValue(minY, maxY);

            var self = this;
            var yAxisConfig = {
                title: {
                    text: visibleYAxisColumns.map(function(column) {
                        return (AXIS_LABEL_TEMPLATE).assign(column.getSageOutputColumnId(), column.getName());
                    }).join(''),
                    useHTML: true
                },
                labels: {
                    enabled: self._shouldShowLabels,
                    formatter: function () {
                        return formatYAxisLabel(this.value, this.axis.tickPositions, this.axis.tickInterval,
                            visibleYAxisColumns[0], chartModel, minY, maxY, showInfinity, showMinusInfinity,
                            infinityPlaceholderValue);
                    }
                },
                stackLabels: {
                    enabled: false,
                    style: {
                        xIndex: 0
                    },
                    formatter: function () {
                        var xAxis = this.axis.chart.xAxis[0];
                        var currentX = this.x;
                        if (xAxis.min > currentX || xAxis.max < currentX) {
                            return '';
                        }
                        return "<div style='padding:2px;'>" + formatYAxisLabel(this.total, this.axis.tickPositions, this.axis.tickInterval,
                            visibleYAxisColumns[0], chartModel, minY, maxY, showInfinity, showMinusInfinity,
                            infinityPlaceholderValue) + "</div>";
                    }
                },
                allowDecimals: visibleYAxisColumns.any(function(col){
                    return col.isDoubleColumn();
                }),
                tickWidth: (self._shouldShowLabels) ? 1 : 0
            };

            this._highchartConfig.yAxis = [yAxisConfig];
        };

        BlinkHighchartConfig.prototype.configureUnsharedYAxis = function() {
            var chartModel = this._chartModel;
            var self = this;

            this._highchartConfig.yAxis = chartModel.getYAxisColumns().map(function(yAxisColumn, index, yAxisColumns){
                var showInfinity = chartModel.columnHasInfinityValues(yAxisColumn),
                    showMinusInfinity = chartModel.columnHasMinusInfinityValues(yAxisColumn),
                    minYValue = chartModel.getMinYValue(yAxisColumn),
                    maxYValue = chartModel.getMaxYValue(yAxisColumn),
                    infinityPlaceholderValue = util.computeAxisInfinityPlaceholderValue(minYValue, maxYValue);

                var config = {
                    title: {
                        text: (AXIS_LABEL_TEMPLATE).assign(yAxisColumn.getSageOutputColumnId(), yAxisColumn.getName()),
                        useHTML: true
                    },
                    labels: {
                        enabled: self._shouldShowLabels,
                        formatter: function() {
                            if (yAxisColumn.isEffectivelyNumeric()) {
                                return formatYAxisLabel(this.value, this.axis.tickPositions, this.axis.tickInterval,
                                    yAxisColumn, chartModel, minYValue, maxYValue, showInfinity, showMinusInfinity,
                                    infinityPlaceholderValue);
                            }

                            return chartModel.getYAxisLabelForAttribute(yAxisColumn, this.value);
                        }
                    },
                    stackLabels: {
                        enabled: false,
                        useHTML: true,
                        borderRadius: 2,
                        style: {
                            fontFamily: 'RetinaMP-Medium',
                            fontSize: '12px',
                            fontWeight: 'normal',
                            textShadow: '0px 0px 3px #fff, 0px 0px 8px #fff'
                        },
                        formatter: function() {
                            // SCAL-16815: stack totals returned as 0 for some stacks in zoomed in
                            // charts. For some reason highcharts doesnt ignore putting data labels for
                            // stacks that are not in zoomed in range. Hence the stack total is null
                            // and blink sets its to {Blank}.
                            // Opened a support ticket so that we can remove this hack.
                            var xAxis = this.axis.chart.xAxis[0];
                            var currentX = this.x;
                            if (xAxis.min > currentX || xAxis.max < currentX) {
                                return '';
                            }
                            if (yAxisColumn.isEffectivelyNumeric()) {
                                return formatYAxisLabel(this.total, this.axis.tickPositions, this.axis.tickInterval,
                                    yAxisColumn, chartModel, minYValue, maxYValue, showInfinity, showMinusInfinity,
                                    infinityPlaceholderValue);
                            }

                            return chartModel.getYAxisLabelForAttribute(yAxisColumn, this.value);
                        }
                    },
                    opposite: index > 0,
                    allowDecimals: yAxisColumn.isDoubleColumn(),
                    tickWidth: (self._shouldShowLabels) ? 1 : 0
                };

                if(yAxisColumn.isDateColumn() || yAxisColumn.isTimeColumn()) {
                    var timeBucket = yAxisColumn.getTimeBucket();
                    config.tickInterval = dateUtil.getIntervalMillisForTimeBucket(timeBucket);
                } else if(yAxisColumn.isEffectivelyNonNumeric()) {
                    config.tickInterval = 1;
                }

                if (showInfinity) {
                    config.max = infinityPlaceholderValue;
                }
                if (showMinusInfinity) {
                    config.min = -1 * infinityPlaceholderValue;
                }

                return config;
            });
        };

        /**
         * A builder class abstracting the Highcharts specific detail for configuring various charting options.
         * All setter methods must return 'this' (builder pattern).
         */
        function BlinkHighchartConfig(chartModel, containerDimensions, shouldShowLabels) {
            this._chartModel = chartModel;
            this._containerDimensions = containerDimensions;
            this._shouldShowLabels = shouldShowLabels;
            this._configOptions = chartTypeSpecificationService.configOptions(
                chartModel.getChartType(),
                chartModel,
                containerDimensions);
            this._highchartConfig = {
                chart: {
                    type: getHighchartChartType(chartModel.getChartType())
                },
                legend: {},
                navigator: {},
                plotOptions: {},
                rangeSelector: {},
                scrollbar: {},
                series: {},
                title: false,
                tooltip: {},
                xAxis: {},
                yAxis: {},
                shouldShowLabels: shouldShowLabels,
                shouldShowDataLabels: this.shouldShowDataLabels()
            };
        }

        BlinkHighchartConfig.prototype.shouldShowDataLabels = function() {
            return this._chartModel.isDataLabelsEnabledSetByUser()
                ? this._chartModel.isDataLabelsEnabled()
                : !!this._configOptions.dataLabelsEnabledByDefault;
        };

        BlinkHighchartConfig.prototype.setContainer = function ($chartContainer) {
            // TODO(Jasmeet): Verify how this will work with highchart server and can this be avoided in client
            this._highchartConfig.chart.renderTo = $chartContainer[0];
            return this;
        };

        BlinkHighchartConfig.prototype.setColors = function (useContextOptionRandomizationIdx) {
            var defaultQueryData = this._chartModel.getDefaultQueryData();
            var series = this._chartModel.getSeries();
            var defaultTheme = chartThemeService.getDefaultTheme();
            var allColors = defaultTheme.moreColors;

            var legendSize = (!!this._configOptions.isMultiColorSeries)
                ? !!defaultQueryData && defaultQueryData.length
                : series.length;

            if (!!this._configOptions.isMultiColorSeries) {
                var legendColumns = this._chartModel.getLegendColumns();
                if (legendColumns.length !== 0) {
                    _logger.error('Multi color series not supported in ' +
                        'chart with legend');
                    this._highchartConfig.colors = allColors;

                    return this;
                }
                var paletteMap = this._chartModel.getMultiColorSeriesColors();
                var knownPalettesForSeries = paletteMap[series[0].blinkSeriesId];
                var reusablePalette = !!knownPalettesForSeries
                    ? knownPalettesForSeries[this._chartModel.getXAxisColumnsHash()]
                    : null;

                if (!!reusablePalette) {
                    this._highchartConfig.colors = reusablePalette;
                    return this;
                }
            }

            var seriesColorMap = this._chartModel.getSeriesColors() || {};
            var usedColors = [];
            this._chartModel.getSeries().forEach(function(serie) {
                usedColors.push(seriesColorMap[serie.blinkSeriesId])
            });
            var randomizationIdx = useContextOptionRandomizationIdx
                ? this._chartModel.getContextOptions().colorIndex
                : null;

            var colors = blinkHighchartConfigUtil.getColors(
                allColors,
                legendSize,
                usedColors,
                randomizationIdx,
                this._configOptions.useRainbowColors
            );

            this._highchartConfig.colors = colors;

            return this;
        };

        BlinkHighchartConfig.prototype.disableZoom = function () {
            this._highchartConfig.chart.zoomType = '';
            this._highchartConfig.chart.panning = true;
            return this;
        };

        /**
         * Depending on the chart type, this will automatically configure the correct zoom type.
         * @return {ChartConfig}
         */
        BlinkHighchartConfig.prototype.setZoomType = function () {
            this._highchartConfig.chart.zoomType = 'xy';
            return this;
        };

        function getDateTickPositioner(chartModel, containerDimensions, chartConfig) {
            return function () {
                return blinkHighchartConfigUtil.getDateTickPositions(
                    chartModel,
                    containerDimensions,
                    chartConfig,
                    constants
                );
            }
        }

        BlinkHighchartConfig.prototype.configureXAxis = function () {
            var chartModel = this._chartModel;
            var self = this;

            var xAxis = this._highchartConfig.xAxis;
            xAxis.allowDecimals = true;
            var timeBucket;
            var omitYear;

            if (chartModel.isXAxisOrdinalBased()) {
                xAxis.min = 0;
                if (this._configOptions.cardinalityIndexStartsFromZero) {
                  //e.g spider web type chart has cardinal index starts from 0
                    xAxis.max = chartModel.getXAxisCardinality();
                } else {
                  //highcharts can end up creating ticks at N, where N is the cardinality of xAxis (SCAL-4695)
                    xAxis.max = chartModel.getXAxisCardinality() - 1;
                }
                xAxis.minTickInterval = 1;
                xAxis.minRange = 1;
                // NOTE: This is set here because the handling of highcharts is different to determine tickOffsets
                // when looking at values/category.
                xAxis.type = 'category';
                //in non-measure cases the x-axis values are indices in the data-array. on zooming enough the highcharts
                //tries to generate intermediate values between the given data points which doesn't make sense in this
                //case
                xAxis.allowDecimals = false;
            }
            else if (chartModel.isTimeSeries()) {
                xAxis.type = 'datetime';

                if (dateUtil.isCustomCalendar()) {
                    xAxis.tickPositioner = getDateTickPositioner(
                        chartModel,
                        self._containerDimensions,
                        self._highchartConfig.chart
                    );
                }
            }

            var xAxisColumn = chartModel.getXAxisColumns()[0];
            if (chartModel.isXAxisMeasure()) {
                if (!xAxisColumn.isDoubleColumn()) {
                    xAxis.allowDecimals = false;
                }
            }

            if (!xAxis.title) {
                xAxis.title = {};
            }
            xAxis.title.useHTML = true;
            xAxis.title.text = chartModel.getXAxisColumns().map(function (column) {
                return (AXIS_LABEL_TEMPLATE).assign(column.getSageOutputColumnId(), column.getName());
            }).join('');

            if (!xAxis.labels) {
                xAxis.labels = {};
            }

            if (chartModel.isTimeSeries() && !chartModel.isXAxisOrdinalBased()) {
                var max = chartModel.getMaxXValue(xAxisColumn);
                var min = chartModel.getMinXValue(xAxisColumn);
                var format = 'yyyy';
                var minYear = dateUtil.formatDate(min, format);
                var maxYear = dateUtil.formatDate(max, format);
                omitYear = minYear === maxYear;
                if(omitYear) {
                    xAxis.title.text += '<i>for ' + minYear + '</i>';
                }
            }

            if (!this._shouldShowLabels) {
                xAxis.lineColor = 'transparent';
                xAxis.tickWidth = 0;
            }

            var showInfinity = false,
                showMinusInfinity = false,
                minXValue = Number.NEGATIVE_INFINITY,
                maxXValue = Number.POSITIVE_INFINITY,
                infinityPlaceholderValue = Number.POSITIVE_INFINITY;

            if (chartModel.isXAxisMeasure()) {
                if (xAxisColumn.isDescendingSort()) {
                    xAxis.reversed = true;
                }
                showInfinity = chartModel.columnHasInfinityValues(xAxisColumn);
                showMinusInfinity = chartModel.columnHasMinusInfinityValues(xAxisColumn);

                if (showInfinity || showMinusInfinity) {
                    minXValue = chartModel.getMinXValue(xAxisColumn);
                    maxXValue = chartModel.getMaxXValue(xAxisColumn);
                    infinityPlaceholderValue = util.computeAxisInfinityPlaceholderValue(minXValue, maxXValue);

                    xAxis.endOnTick = true;

                    if (showInfinity) {
                        xAxis.max = infinityPlaceholderValue;
                    }
                    if (showMinusInfinity) {
                        xAxis.min = -1 * infinityPlaceholderValue;
                    }
                }
            }

            xAxis.labels.enabled = this._shouldShowLabels;

            xAxis.labels.formatter = function () {
                var infinityLabel = formatInfinityValue(this.value, this.axis.tickInterval, showInfinity, showMinusInfinity,
                    minXValue, maxXValue, infinityPlaceholderValue, false);
                if (infinityLabel !== null) {
                    return infinityLabel;
                }

                var fullLabel = chartModel.getXAxisLabelAt(
                    this.value,
                    this.axis.tickPositions,
                    {
                        omitYear: omitYear
                    }
                );
                return fullLabel;
            };

            return this;
        };

        BlinkHighchartConfig.prototype.setAfterSetExtremesCallback = function (callback) {
            this._highchartConfig.xAxis.events = {
                afterSetExtremes: callback
            };
            this._highchartConfig.yAxis.events = {
                afterSetExtremes: callback
            };
            return this;
        };

        /**
         * @return {ChartConfig}
         */
        BlinkHighchartConfig.prototype.configureYAxis = function () {
            var chartModel = this._chartModel;

            if (chartModel.isYAxisShared()) {
                this.configureSharedYAxis();
            } else {
                this.configureUnsharedYAxis();
            }

            return this;
        };

        BlinkHighchartConfig.prototype.configurePlotLines = function () {
            var chartModel = this._chartModel;
            var chartConfig = this._highchartConfig;

            // assign color based on metric for each data point
            // TODO (sunny): avoid similar colors in default series colors
            var yAxisColumns = chartModel.getYAxisColumns();
            var multipleYAxes = yAxisColumns.length > 1 && !chartModel.isYAxisShared();

            // configure plot lines for each metric
            var yAxisConfigs = chartConfig.yAxis;
            yAxisColumns.forEach(function(yAxisColumn, columnIndex){
                var yAxisConfig = multipleYAxes ? yAxisConfigs[columnIndex] : yAxisConfigs[0];
                if (!yAxisConfig.plotLines) {
                    yAxisConfig.plotLines = [];
                }

                var metricDefinition = yAxisColumn.getMetricsDefinition();
                if (!metricDefinition) {
                    return;
                }

                var metrics = metricDefinition.getMetrics();
                // make a copy before sorting
                metrics = metrics.slice(0);
                // sort metrics by in decreasing order of max values. in case of metrics that
                // meet at the ends (e.g. [0.1-0.2),[0.2, 0.3) we the plot line of the lower
                // range to hide the plot line of the higher range
                metrics.sort(function(metricA, metricB){
                    return metricB.getRange().max - metricA.getRange().max;
                });

                yAxisConfig.plotLines = metrics.reduce(function(plotLines, metric){
                    var color = metric.getColor();
                    var range = metric.getRange();

                    return [range.getMax(), range.getMin()].reduce(function(plotLines, threshold){
                        plotLines.push({
                            color: color,
                            width: constants.formatting.PLOT_LINE_WIDTH,
                            value: threshold,
                            zIndex: constants.formatting.PLOT_LINE_Z_INDEX
                        });
                        return plotLines;
                    }, plotLines);
                }, yAxisConfig.plotLines);
            });

            return this;
        };

        BlinkHighchartConfig.prototype.configureSeries = function (onSeriesClick, numEnabledSeriesOnLoad) {
            var chartModel = this._chartModel;
            var series = chartModel.getSeries();
            if (!series) {
                return this;
            }

            var seriesPlotOptions = this._highchartConfig.plotOptions.series = {};
            var getDefaultIncompleteColor = function (series) {
                return Highcharts.Color(series.color).setOpacity(0.4).get();
            };
            var getDefaultIncompleteThreshold = dateUtil.getTimeBucketStart.bind(this, moment().valueOf());


            //(SCAL-4504): By default highcharts calculates the pointRange as the max of pointRange of each series in
            //the data where the pointRange of one series is the distance between the two closest data points in that
            //series (in units of the value on the axis). This means that if one of the series has missing data points
            //in the middle, it will cause the combined pointRange to be too high. In case of timeseries this will mean
            //that tick interval will have lower granularity than is necessary
            if (chartModel.isTimeSeries() && !chartModel.isXAxisOrdinalBased()) {
                var dateTimeColumn = chartModel.getXAxisColumns()[0],
                    timeBucket = dateTimeColumn.getTimeBucket(),
                    minTickInterval = dateUtil.getIntervalMillisForTimeBucket(timeBucket);
                if (minTickInterval) {
                    series.each(function(s){
                        s.pointRange = minTickInterval;
                        s.colsize = minTickInterval;
                    });
                }

                // Configuring incomplete zones here
                // http://api.highcharts.com/highcharts#plotOptions.series.zones
                // We added a custom getColor in the zones as a plugin.
                this._configOptions.incompleteZone = this._configOptions.incompleteZone || {};
                if(!this._configOptions.incompleteZone.disabled) {
                    var incompleteThreshold = (!!this._configOptions.incompleteZone.getIncompleteThreshold) ?
                        this._configOptions.incompleteZone.getIncompleteThreshold(timeBucket) :
                        getDefaultIncompleteThreshold(timeBucket);

                    seriesPlotOptions.zones = [{
                        value: incompleteThreshold
                    }, {
                        dashStyle: incompleteZoneDashStyle,
                        getColor: this._configOptions.getIncompleteColor || getDefaultIncompleteColor
                    }];
                }
            } else if (chartModel.isXAxisOrdinalBased()) {
                // (SCAL-7059) highcharts has a bug (http://jsfiddle.net/shashank_singh/jzwd0v0r/) that causes
                // it to space x-axis labels according to the max delta of point value in any series. this causes
                // unnecessarily missing ticks (and labels) when the series data is sparse (that some series have
                // points for few x-axis values).
                // in the case of x-axis with ordinal values we know that the range of x-axis values is continuous
                // integer with no gaps hence we can force pointRange to be 1
                series.each(function(s){
                    s.pointRange = 1;
                });
            }

            chartTypeSpecificationService.seriesOverride(chartModel.getChartType(), chartModel);

            var visibleSeriesIds = chartModel.getVisibleSeriesIds();
            if (visibleSeriesIds && visibleSeriesIds.length) {
                var visibleSeriesIdMap = util.mapArrayToBooleanHash(visibleSeriesIds);
                var chartSeries = this._highchartConfig.series = chartModel.getSeries().slice();
                chartSeries.forEach(function(chartSerie){
                    chartSerie.visible = Object.has(visibleSeriesIdMap, chartSerie.blinkSeriesId);
                });
            }

            if (!this._highchartConfig.series || !this._highchartConfig.series.length) {
                this._highchartConfig.series = chartModel.getSeries().slice(0, numEnabledSeriesOnLoad);
                var displayYValuesWithLegendSeries = chartTypeSpecificationService.configOptions(
                    chartModel.getChartType()
                ).displayYValuesWithLegendSeries;
                if (displayYValuesWithLegendSeries) {
                    var chartModelSeries = chartModel.getSeries();
                    var totalSeries = chartModelSeries.length;
                    if (totalSeries >= numEnabledSeriesOnLoad) {
                        var yAxisColumnsAsSeries = chartModel.getYAxisColumns().slice(1);
                        var totalYAxisAsSeries = yAxisColumnsAsSeries.length;
                        var legendSeries = chartModelSeries.slice(0, totalSeries - totalYAxisAsSeries);
                        var yAxisSeries = chartModelSeries.slice(totalSeries - totalYAxisAsSeries);
                        this._highchartConfig.series = legendSeries.slice(0, numEnabledSeriesOnLoad);
                        Array.prototype.push.apply(this._highchartConfig.series, yAxisSeries);
                    }
                }
            }

            var seriesColors = chartModel.getSeriesColors();
            this._highchartConfig.series.forEach(function(serie) {
                if(Object.has(seriesColors, serie.blinkSeriesId)) {
                    serie.color = seriesColors[serie.blinkSeriesId];
                }
            });

            var self = this;
            seriesPlotOptions.dataLabels = {
                enabled: false,
                padding: 2,
                borderRadius: 2,
                style: {
                    fontSize: '12px',
                    textShadow: '0px 0px 3px #fff, 0px 0px 8px #fff'
                },
                formatter: function () {
                    return getDataLabel(chartModel, self._configOptions, this);
                }
            };

            var groupingEnabled = true;
            var chartConfig = this._highchartConfig;

            // assign color based on metric for each data point
            // TODO (sunny): avoid similar colors in default series colors
            var yAxisColumns = chartModel.getYAxisColumns();
            var yAxisGuidToColumn = yAxisColumns.reduce(function(yAxisGuidToColumn, column){
                yAxisGuidToColumn[column.getGuid()] = column;
                return yAxisGuidToColumn;
            }, {});
            chartConfig.series.forEach(function(serie, seriesIndex){
                var yAxisColumn = null;
                // if there is only one y-axis column, series is because of the legend
                // each series' corresponding y-axis column is the first (and only)
                // y-axis column. if there are more than one y-axis columns, each
                // series corresponds to one y-axis column, in the order in which
                // the y-axis columns appear in the list of y-axis columns.
                if (yAxisColumns.length === 1) {
                    yAxisColumn = yAxisColumns[0];
                } else {
                    // TODO(Jasmeet): In highchart config we should add a notion of value column/s
                    // to identify yAxis, instead from series.
                    yAxisColumn = yAxisGuidToColumn[serie.blinkSeriesId] || yAxisColumns[0];
                }

                var metricDefinition = yAxisColumn.getMetricsDefinition();
                if (!metricDefinition) {
                    return;
                }

                serie.data.forEach(function(dataRow){
                    var color = metricDefinition.getColorForValue(dataRow.y);
                    if (color !== null) {
                        dataRow.color = color;

                        // Note (sunny): highcharts does not respect point colors on grouped
                        // data and does not seem to provide a way to specify colors on grouped
                        // data. We have to force no data grouping when metrics are present,
                        groupingEnabled = false;
                    } else {
                        delete dataRow.color;
                    }
                });
            });

            //SCAL-4216: When there is data grouping, hovering over a data point can be missing columns not included in
            //the chart (category, radial). We can't disable data grouping because:
            //1. For line/column charts it looks very ugly (with columns overlapping each other e.g.)
            //2. If we ever end up with a very high chart data page size performance can degrade significantly
            //However for scatter and bubble there is a greater need to be able to see all info about a point
            //even if there is data grouping (think outliers). Luckily scatter and bubble UI degrade relatively slower
            //without data grouping so we set higher thresholds for them

            if (!!this._configOptions.highThresholdGrouping) {
                var maxPointsInAnySeries = chartModel.getSeries().map(function(series){
                    return (series.data && series.data.length) || 0;
                }).max();
                if (maxPointsInAnySeries <= constants.GROUPING_POINT_COUNT_THRESHOLD_HIGH) {
                    groupingEnabled = false;
                }
            }

            seriesPlotOptions.connectNulls = true;
            // TODO(vibhor): Figure out what this option really does. It seems to limit the number of data points that
            // can be plotted using Chart API (not StockChart).
            seriesPlotOptions.turboThreshold = 1000000;

            // TODO(Jasmeet): Verify this still works, can safeApply work with null scope?
            seriesPlotOptions.events = {
                contextmenu: function (evt) {
                    var clickSelf = this;
                    onSeriesClick(evt, clickSelf.color, clickSelf.name);
                }
            };

            return this;
        };

        BlinkHighchartConfig.prototype.configureChartTitle = function () {
            var sampledMetrics = this._chartModel.getMetricsForSampledData();
            if(!!sampledMetrics.totalRowsDisplayed && !!sampledMetrics.totalRowCount) {
                var titleText = strings.data_point_exceeded_message.assign(
                    sampledMetrics.totalRowsDisplayed,
                    sampledMetrics.totalRowCount);
                this._highchartConfig.title = {
                    text: titleText,
                    align: "left",
                    x: 10,
                    y: -2,
                    style: {
                        color: '#131313',
                        fontFamily: 'RetinaMP-Medium',
                        fontSize: '12px'
                    }
                };
            }

            return this;
        };

        /**
         * Chart specific Override
         * @returns {ChartConfig}
         */
        BlinkHighchartConfig.prototype.configureOverrides = function () {
            $.extend(true, this._highchartConfig, this._configOptions.highcharts);
        };

        BlinkHighchartConfig.prototype.configureDefaults = function () {
            this._highchartConfig.legend = {
                enabled: false
            };
            return this;
        };

        BlinkHighchartConfig.prototype.configureWindowing = function () {
            var navigator = this._highchartConfig.navigator;
            navigator.enabled = false;

            var scrollbar = this._highchartConfig.scrollbar;
            scrollbar.enabled = false;

            var rangeSelector = this._highchartConfig.rangeSelector = {
                enabled: false
            };
            rangeSelector.inputEnabled = false;
            return this;
        };

        // NOTE: This component configures a tooltip html template.
        BlinkHighchartConfig.prototype.configureGenericTooltip = function () {
            var tooltip = this._highchartConfig.tooltip,
                self = this;

            tooltip.valueDecimals = 2;
            tooltip.shared = false;
            tooltip.useHTML = true;
            tooltip.crosshairs = false;
            tooltip.hideDelay = blinkConstants.CHART_TOOLTIP_DELAY;
            tooltip.backgroundColor = null;
            tooltip.borderWidth = 0;

            var chartModel = self._chartModel;
            // TODO(Jasmeet): Replace this with config option.
            var isLineStackedChart = chartModel.getChartType()
                === chartTypeSpecificationService.chartTypes.LINE_STACKED_COLUMN;
            tooltip.formatter = function () {
                var yAxisColumns = chartModel.getYAxisColumns(),

                    // the index of the y-axis the current point belong to in the list of
                    // y-axes of the highchart instance
                    yAxisIndex = (this.series && this.series.userOptions.yAxis) || 0,

                    yAxisConfig = self._highchartConfig.yAxis[yAxisIndex],
                    yAxis = this.series.chart.yAxis[yAxisIndex],
                    yAxisColumn;

                // the index of the y-axis column this point belongs to in the list of
                // y-axis columns in the current chart model
                // SCAL-7470, SCAL-7823: We need to take care of 4 cases
                // 1. Single y-axis column, no series
                // 2. Single y-axis column, series present
                // 3. Multiple y-axis columns, not shared
                // 4. Multiple y-axis columns, shared
                if (yAxisColumns.length > 1
                    && !!this.series
                    && !!this.series.name) {
                    yAxisColumn = chartModel.getYAxisColumn(this.series.name);
                } else {
                    yAxisColumn = yAxisColumns[0];
                }

                if (isLineStackedChart) {
                    if (this.series.options.type === strings.charts.seriesType.LINE) {
                        yAxisColumn = chartModel.getYAxisColumn(this.series.name);
                    } else {
                        yAxisColumn = yAxisColumns[0];
                    }
                }

                var yAxisColumnEffectiveId = yAxisColumn && yAxisColumn.getSageOutputColumnId();
                var indexOfYAxisColumn = yAxisColumns.findIndex(function(column){
                    return column.getSageOutputColumnId() === yAxisColumnEffectiveId;
                });

                var xLabel = tooltipComponent({
                    columns: chartModel.getXAxisColumns(),
                    class: 'xAxisTitle'
                }, {
                    value: chartModel.getXAxisLabelAt(this.x || this.point.x),
                    class: 'pointX'
                });


                var yLabel = '';
                // in case of late-added series like in pareto chart there
                // is no corresponding yAxis column
                if (!yAxisColumn) {
                    if (!this.series || !this.series.userOptions.tooltipFormatter) {
                        _logger.warn('missing tooltip formatter for custom series', this.series);
                        yLabel = this.y;
                    } else {
                        yLabel = this.series.userOptions.tooltipFormatter(this);
                    }
                } else {
                    yLabel = tooltipComponent({
                        columns: [yAxisColumn],
                        class: 'yAxisTitle'
                    }, {
                        value: yAxisConfig.labels.formatter.call({
                            value: this.y,
                            axis: yAxis,
                            isTooltip: true
                        }),
                        class: 'pointY'
                    });
                }

                var seriesLabel = '';
                if (indexOfYAxisColumn === 0) {
                    seriesLabel = tooltipComponent({
                        columns: chartModel.getLegendColumns(),
                        class: 'seriesTitle'
                    }, {
                        value: this.series.name,
                        useFormatter: false,
                        style: 'color:' + this.series.color,
                        class: 'seriesName'
                    });
                }

                var categoryLabel = '',
                    radialLabel = '';

                if (this.point && angular.isDefined(this.point.categoryName)) {
                    categoryLabel = tooltipComponent({
                        columns: [chartModel.getCategoryColumnNotOnAxis()],
                        class: 'categoryTitle'
                    }, {
                        value: this.point.categoryName,
                        useFormatter: true,
                        class: 'categoryName'
                    });
                }

                if (this.point && angular.isDefined(this.point.z)) {
                    radialLabel = tooltipComponent({
                        columns: [chartModel.getRadialColumn()],
                        class: 'radialColumnTitle'
                    }, {
                        value: this.point.z,
                        useFormatter: true,
                        class: 'radialValue'
                    });
                }

                return '<div class="custom-tooltip" style="border:1px solid ' + this.series.color + ';">' + categoryLabel + yLabel + xLabel + radialLabel + seriesLabel + '</div>';
            };

            return this;
        };

        BlinkHighchartConfig.prototype.configureLineOptions = function () {
            this._highchartConfig.plotOptions.line = {};

            // a line chart with only one point will be invisible unless we show point markers (SCAL-3806)
            var series = this._chartModel.getSeries();
            if (!series) {
                return this;
            }
            blinkHighchartConfigUtil.updateSeriesWithMarkerSettings(series);

            // SCAl-6397
            if (this._highchartConfig.series.length < 10) {
                this._highchartConfig.plotOptions.line.lineWidth = 3;
            }

            return this;
        };

        // TODO(Jasmeet): Unused function remove in next iteration.
        BlinkHighchartConfig.prototype.configurePieOptions = function () {
            var piePlotOptions = this._highchartConfig.plotOptions.pie = {};

            piePlotOptions.allowPointSelect = true;
            piePlotOptions.animation = true;
            return this;
        };

        BlinkHighchartConfig.prototype.configureExporting = function () {
            //disable the default button, keep the exporting API working
            this._highchartConfig.exporting = {
                enabled: false
            };
            return this;
        };

        BlinkHighchartConfig.prototype.configureAnimation = function () {
            if (!this._highchartConfig.plotOptions) {
                this._highchartConfig.plotOptions = {};
            }

            if (!this._highchartConfig.plotOptions.series) {
                this._highchartConfig.plotOptions.series = {};
            }

            this._highchartConfig.plotOptions.series.animation = {
                duration: 1500
            };
        };

        /**
         * Returns the chart configuration options object built so far.
         * @return {Object}
         */
        BlinkHighchartConfig.prototype.build = function () {
            return this._highchartConfig;
        };

        return BlinkHighchartConfig;
    }]);
