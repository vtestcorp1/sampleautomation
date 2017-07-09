/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 */

'use strict';

blink.app.factory('BlinkHighchart', ['BaseChart',
    'util',
    function (BaseChart,
          util) {

        function BlinkHighchart(config, onRenderedCallback) {
            BlinkHighchart.__super.call(this, config);
            this.configCustomizationWidget = null;
            this._shouldShowDataLabels = config.shouldShowDataLabels;
            this._onRenderCallback = onRenderedCallback;
            init(this);
        }

        util.inherits(BlinkHighchart, Highcharts.Chart);
        _.assign(BlinkHighchart.prototype, BaseChart.prototype);

        function init(self) {
            self.pointer.init(self, self.options);
        }

        function toggleDataLabelVisibility(blinkHighchart) {
        // TODO (sunny): generalize chart config persistence in the chart model
        // It should be defined by the chart type (highchart, map etc.) and
        // persisted in the chart-model via chart-ui.
        }

        BlinkHighchart.prototype.isDataLabelsEnabled = function () {
            return !!util.prop(this, 'options.plotOptions.series.dataLabels.enabled');
        };

        BlinkHighchart.prototype.getSeries = function () {
            return this.series;
        };

        BlinkHighchart.prototype.getXAxisExtremes = function () {
            return this.xAxis.map('getExtremes');
        };

        BlinkHighchart.prototype.getYAxisExtremes = function () {
            return this.yAxis.map('getExtremes');
        };

        BlinkHighchart.prototype.getPlotSizeX = function () {
            return this.plotSizeX;
        };

        BlinkHighchart.prototype.getPlotSizeY = function () {
            return this.plotSizeY;
        };

        BlinkHighchart.prototype.getGroupPixelWidth = function () {
            return this.xAxis.map(function(axis){
                return axis.getGroupPixelWidth ? axis.getGroupPixelWidth() : 0;
            }).min();
        };

        function updateExtremes(axis, extremes) {
            if (!extremes || (_.isNil(extremes.min) && _.isNil(extremes.max))) {
                return;
            }
            delete axis.min;
            delete axis.userOptions.min;
            delete axis.max;
            delete axis.userOptions.max;
            axis.setExtremes(extremes.min, extremes.max, false);
        }

        BlinkHighchart.prototype.setExtremes = function (xAxisExtremes, yAxisExtremes) {
            var xAxes = this.xAxis,
                yAxes = this.yAxis;

            if (xAxisExtremes && xAxisExtremes.length === xAxes.length) {
            // If any x-axis extreme doesn't overlap with what is saved, then abort.
                xAxes.each(function(xAxis, index){
                    updateExtremes(xAxis, xAxisExtremes[index]);
                });
            }

            if (yAxisExtremes) {
                if (yAxes.length === 1 && yAxisExtremes.length > 1) {
                //switched from multiple y-axes to single y-axis, the common axis get the end points of the combined
                //extremes of all old axes
                    var maxMax = yAxisExtremes.max('max').max,
                        minMin = yAxisExtremes.min('min').min;

                    var currentYExtreme = yAxes[0].getExtremes();
                    if (currentYExtreme.max < minMin || currentYExtreme.min > maxMax) {
                        return;
                    }
                    delete yAxes[0].min;
                    delete yAxes[0].max;
                    yAxes[0].options.startOnTick = false;
                    yAxes[0].options.endOnTick = false;
                    yAxes[0].setExtremes(minMin, maxMax, false);

                } else if (yAxes.length > 1 && yAxisExtremes.length === 1) {
                    //switched from singe y-axis to multiple y-axes, all axes get the extremes of the common axis
                    yAxes.each(function(yAxis){
                        yAxis.options.startOnTick = false;
                        yAxis.options.endOnTick = false;
                        updateExtremes(yAxis, yAxisExtremes[0]);
                    });
                } else {
                    yAxes.each(function(yAxis, index){
                        yAxis.options.startOnTick = false;
                        yAxis.options.endOnTick = false;
                        updateExtremes(yAxis, yAxisExtremes[index]);
                    });
                }
            }
        };

        BlinkHighchart.prototype.setYAxisRange = function (range, chartModel) {
            this.setExtremes(null, [range]);
            // In the case where the scale is set we avoid align ticks, otherwise
            // highcharts tries to scale y axis with that in mind.
            var alignTicks = !chartModel.hasUserDefinedYAxisRange();
            this.options.chart.alignTicks = alignTicks;
            this.redraw();
        };

        BlinkHighchart.prototype.resetPointer = function () {
            this.pointer.reset();
            this.pointer.init(this, this.options);
        };

        BlinkHighchart.prototype.switchToZoomMode = function () {
            this.options.chart.panning = false;
            this.options.chart.zoomType = 'xy';
        };

        BlinkHighchart.prototype.switchToPanMode = function (resetPointer) {
            this.options.chart.panning = true;
            this.options.chart.zoomType = '';

            if (!resetPointer) {
                return;
            }
            this.resetPointer();
        };

        BlinkHighchart.prototype.isInPanMode = function () {
            if (!this.options) {
                return false;
            }
            return this.options.chart.panning;
        };

        BlinkHighchart.prototype.setDataLabelVisibility = function (visible) {
            if (!this.options) {
                return;
            }
            this.options.plotOptions.series.dataLabels.enabled = !!visible;

            this.series.each(function(serie){
                serie.update(void 0, false);
            });

            var self = this;
            this.yAxis.forEach(function(yAxis, index) {
                if (self.options.yAxis[index].stackLabels) {
                    self.options.yAxis[index].stackLabels.enabled = !!visible;
                }
                yAxis.update(void 0, false);
            });

            this.redraw(false);
        };

        BlinkHighchart.prototype.secondaryRender = function (scope) {
            if (!!this.options) {
                var self = this;
                self.yAxis.forEach(function(axis, index) {
                    if (self.options.yAxis[index].stackLabels) {
                        self.options.yAxis[index].stackLabels.enabled = !!self._shouldShowDataLabels;
                    }
                    axis.update(void 0, false);
                });
                this.options.plotOptions.series.dataLabels.enabled = !!self._shouldShowDataLabels;
                self.series.forEach(function (serie) {
                    serie.update(void 0, false);
                });

                this.redraw(false);
            }
            this._onRenderCallback(this, scope);
        };

        BlinkHighchart.prototype.updateSeries = function (series, changes) {
            series.update(changes);
        };

        BlinkHighchart.prototype.setSeriesVisibility = function (serie, visible, redraw) {
            serie.setVisible(!!visible, !!redraw);
        };

        BlinkHighchart.prototype.supportsDownload = function () {
            return !!this.getSVG;
        };

        BlinkHighchart.prototype.toBlob = function (overriddenOptions, callback, scalingFactor) {
            overriddenOptions.exporting = {};
            overriddenOptions.exporting.sourceWidth = 1920;
            overriddenOptions.exporting.sourceHeight = 1080;

            var svg = this.getSVG(overriddenOptions),
                width = parseInt(svg.match(/width="([0-9]+)"/)[1], 10),
                height = parseInt(svg.match(/height="([0-9]+)"/)[1], 10),
                canvas = document.createElement('canvas');

            scalingFactor = scalingFactor || 5;
            var dWidth = scalingFactor, dHeight = scalingFactor;
            svg = svg.replace(
            '<svg ',
            '<svg transform="scale(' + dWidth + ' ' + dHeight + ')" '
        );
            svg = svg.replace('width="' + width + '"', 'width="' + scalingFactor * width + '"');
            svg = svg.replace('height="' + height + '"', 'height="' + scalingFactor * height + '"');

            canvas.setAttribute('width',  width);
            canvas.setAttribute('height', height);

        //IE DOMParser has issues with svg xml
        //https://code.google.com/p/canvg/issues/detail?id=189
            if (blink.app.isIE) {
                svg = svg.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/gi, '');
            }

            window.canvg(canvas, svg);
            canvas.toBlob(function(blob) {
                $(canvas).remove();
                callback(blob);
            });
        };

        BlinkHighchart.prototype.supportsFullScreenMode = function () {
            return false;
        };

        return BlinkHighchart;

    }]);
