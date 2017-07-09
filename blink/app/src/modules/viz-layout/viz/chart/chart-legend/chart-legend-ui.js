/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Directive for Chart legend
 */

'use strict';

blink.app.directive('chartLegend', ['$timeout', 'util', 'Logger', 'loadingIndicator',
    function ($timeout, util, Logger, loadingIndicator) {
        var _logger = Logger.create('chart-legend-ui');

        function isHeightShorter(height) {
            return height < 300 && height >= 250;
        }

        function isShorter($container) {
            return isHeightShorter($container.height());
        }

        function isHeightTooShort(height) {
            return height < 250;
        }
        function isTooShort($container) {
            return isHeightTooShort($container.height());
        }

        function isHeightShort(height) {
            return height < 400 && height >= 300;
        }
        function isShort($container) {
            return isHeightShort($container.height());
        }

        function linker(scope, $el, attrs) {
            scope.getSeriesColor = function (serieName) {
                var serie = this.getSeries(serieName);
                if (!serie) {
                    return '';
                }
            // TODO(SCAL-15911): Clean up visible flag so that it is always present.
                if (!Object.has(serie, 'visible') || serie.visible) {
                    return serie.color;
                }
                return '';
            };

            scope.getSerie = function (serieName) {
                return this.getSeries(serieName) || {} ;
            };

            scope.onContainerClick = function ($evt) {
                if (!$evt.target) {
                    return;
                }

                var chartModel = this.getVizModel();
                if (!chartModel) {
                    return;
                }

                var itemScope = $($evt.target).scope();
                if (!itemScope || !itemScope.label) {
                    return;
                }
                this.onItemClick(itemScope.label);
            };

            scope.onItemClick = function (serieName) {
                scope.toggleSeriesVisibility(serieName);
            };

            scope.showAllItems = function () {
                var highchart = scope.getChart(),
                    vizModel = scope.getVizModel();
                if (!highchart || !vizModel || !vizModel.getSeries()) {
                    return;
                }
                loadingIndicator.reAnchorAndShow('.bk-chart', {
                    additionalStyleClasses: ['bk-document-loading-overlay', 'bk-transparent']
                });
                $timeout(function () {
                    var seriesAlreadyInChart = highchart.series;
                    var seriesNameMap = {};
                    seriesAlreadyInChart.each(function (s) {
                        s.visible = true;
                        seriesNameMap[s.name] = true;
                    });
                    vizModel.getSeries().each(function (s) {
                        if (seriesNameMap.hasOwnProperty(s.name)) {
                            return;
                        }
                        highchart.addSeries(s, false);
                    });

                    highchart.redraw();
                    loadingIndicator.hide();
                }, 500);
            };

            scope.canShowLegendFooter = function () {
                var highchart = scope.getChart();
                if (!highchart) {
                    return false;
                }

                var $chartContent = $(highchart.container);
                if (isShorter($chartContent) || isTooShort($chartContent) || isShort($chartContent)) {
                    return false;
                }

                var chartModel = scope.getVizModel();
                return chartModel.getLegendCardinality() > 10;
            };

            scope.onSingularSeriesSelectionClick = function ($event, serieName) {
                scope.toggleSingularSeriesSelection(serieName);
            };
        }

        return {
            restrict: 'AE',
            link: linker,
            scope: {
                getVizModel: '&vizModel',
                getChart: '&chart',
                getAvailableHeight: '&availableHeight'
            },
            controller: 'ChartLegendController',
            templateUrl: 'src/modules/viz-layout/viz/chart/chart-legend/chart-legend.html'
        };
    }]);
