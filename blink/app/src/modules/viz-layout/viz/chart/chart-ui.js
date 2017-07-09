/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Chart Viz
 */

'use strict';
/* global addBooleanFlag */
addBooleanFlag('chartAnimations', 'Whether to have chart animations', true);

/* eslint max-params: 1 */
blink.app.directive('blinkVizChart', ['strings',
    'blinkConstants',
    'chartUtilService',
    'chartTypeSpecificationService',
    'debugInfoCollector',
    'events',
    'loadingIndicator',
    'Logger',
    'serviceNames',
    'util',
    'ChartUIUtils',
    function (strings,
              blinkConstants,
              chartUtilService,
              chartTypeSpecificationService,
              debugInfoCollector,
              events,
              loadingIndicator,
              Logger,
              serviceNames,
              util,
              ChartUIUtils) {

        var _logger = Logger.create('chart-ui');

        var MAX_LEGEND_HEIGHT_CHART_HEIGHT_FRACTION = 0.9,
            HORIZONTAL_LEGEND_MAX_CARDINALITY = 5;

        /**
         * Resizes the chart without causing a full render.
         * @param $chartContainer
         */
        function reflow(scope, $chartContainer) {
            if (!scope.viz.getModel() || !scope.chart) {
                return;
            }

            var newWidth = $chartContainer.width(),
                newHeight = $chartContainer.height();

            var dontResize = false;
            // Check if the size of the container has crossed some thresholds. If there was no previous dimension state
            // available, then simply do the lightweight reflow.
            // Even if the previous state is available, we only want to do a full render when some thresholds are crossed.
            if (angular.isDefined(scope.prevWidth) && angular.isDefined(scope.prevHeight)) {

                if (newWidth === scope.prevWidth && newHeight === scope.prevHeight) {
                    dontResize = true;
                }
            }

            // Do not Reflow if the container dimensions are invalid.
            if (newWidth <= 0 || newHeight <= 0) {
                dontResize = true;
            }

            // Record the dimension for a successive call to reflow.
            scope.prevWidth = newWidth;
            scope.prevHeight = newHeight;
            if (dontResize) {
                return;
            }

            try {
                scope.chart.setSize(newWidth, newHeight, false);
            } catch (e) {
                // The most likely reason for an exception to be thrown is use case like SCAL-1157 (hard to reproduce).
                // In such a case, the setSize() is called as part of a reflow that got triggered after the chart container
                // node was removed from the DOM (layout reflow happens with an animation and DOM node could be removed
                // before animation is completed).
                _logger.warn('An attempt was made to resize the chart but failed with exception', e);
            }
        }

        function configureScopeHandlers(scope, $chartContainer) {
            scope.$on(events.CHART_NEEDS_REDRAW_U, function () {
                // Needed to give chart time to recalculate size if previous
                // render was not successful due to dataNotSupported.
                util.executeInNextEventLoop(function() {
                    ChartUIUtils.render(scope, $chartContainer);
                });
            });

            scope.showChartLoading = function () {
                // NOTE(vibhor): The current loadingIndicator service is a singleton that simply reanchors the same DOM
                // element whereever needed. Given that now multiple vizs can show loading indicator simultaneously and
                // they can show/hide async, this doesn't work well.
                // TODO(vibhor): Introduce a new loading indicator directive that can be instantiated multiple times.
                loadingIndicator.reAnchorAndShow($chartContainer, {
                    additionalStyleClasses: ['bk-light-weight']
                });
            };
            scope.hideChartLoading = function () {
                loadingIndicator.hide();
            };

            var reflowCallback = function () {
                util.executeInNextEventLoop(function(){
                    reflow(scope, $chartContainer);
                });
            };

            scope.viz.onMaximizeStateChanged = function (maximize) {
                ChartUIUtils.render(scope, $chartContainer, maximize, !!maximize);
            };

            scope.viz.onLayoutReflowDone = reflowCallback;

            scope.$on(events.SAGE_DATA_EXPANSION_STATE_CHANGED_D, function() {
                reflowCallback();
            });

            scope.$on(events.LAYOUT_REFLOW_REQUIRED_U, function() {
                reflowCallback();
            });

            $(window).on('resizeend', function (evt) {
                // Only rerender the resized viz. (applicable for eg. in case of pinboards where there could be many viz)
                var vizModel = scope.viz.getModel();
                var vizId = !!vizModel.getReferencingViz() ? vizModel.getReferencingViz().getId(): vizModel.getId();
                var vizs = Array.prototype.slice.call(arguments, 1);
                if(vizs.find(vizId)) {
                    ChartUIUtils.render(scope, $chartContainer);
                }
            });

            $(window).on('resize', function () {
                scope.updateChartDimensions();
                scope.legendDisabled = !chartUtilService.isChartBigEnoughToShowLegend(scope.viz.getModel(),
                                                                                      scope.chartDimensions,
                                                                                      scope.isLegendVertical());
                reflowCallback();
            });

            scope.viz.reflow = function () {
                reflow(scope, $chartContainer);
            };

            scope.$on(events.REFLOW_VIZ, function () {
                reflow(scope, $chartContainer);
            });

            scope.viz.render = function () {
                util.executeInNextEventLoop(function () {
                    ChartUIUtils.render(scope, $chartContainer);
                });
            };

            scope.$watch(function () {
                return scope.viz && scope.viz.getModel().isSecondaryRenderReady();
            }, function (newValue) {
                if (!!newValue) {
                    ChartUIUtils.secondaryRender(scope);
                }
            });

            scope.$watch('viz.noData', function (noData) {
                if (noData) {
                    $chartContainer.empty();
                }
            });

            scope.$watch('viz.dataError', function (dataError) {
                if (dataError) {
                    $chartContainer.empty();
                }
            });

            scope.onChartModelChange = function () {
                ChartUIUtils.removeCurrentChart(scope);
                scope.initChart();
            };

            scope.onChartDataUpdate = function () {
                //the update could have been from no-data => data (in case of lazy loading answers)
                //so we can't simply re-render (as some UI decision outside just the chart might have
                //been taken based on the fact that there was no data)
                ChartUIUtils.removeCurrentChart(scope);
                scope.initChart();
            };

            scope.$watch('viz.getModel()', function (newModel, oldModel) {
                if (!!newModel && !!oldModel && newModel.equals(oldModel)) {
                    return;
                }

                scope.$broadcast(events.CHART_MODEL_CHANGED_D, newModel, oldModel);
            });

            // In the case where chart is loaded with no supported data and then a supported chart is loaded, we need to
            // reflow to ensure the chart uses the correct sizing.
            scope.$watch(scope.isChartHidden, function (newValue, oldValue) {
                if (newValue === false && oldValue === true) {
                    reflow(scope, $chartContainer);
                }
            });

            scope.emitNewChart = function (chart) {
                scope.$emit(events.CHART_CREATED, chart);
            }
        }

        function linker(scope, $el) {
            $el.addClass('bk-viz-chart');

            scope.strings = strings.charts;

            scope.legendDisabled = true;

            /* Per SCAL-7613, disable pagination from UI
             scope.viz.addControl({
             url: 'src/modules/viz-layout/viz/chart/chart-pagination.html'
             });
             */

            var $chartContainer = $el.find('.bk-chart');

            scope.render = function () {
                var startTime = (new Date()).getTime();
                var debugInfo = {
                    type: 'vizRender',
                    timestamp: startTime,
                    url: scope.viz.getModel().getTitle()
                };
                // Added to force computation of the dimensions of the chart before it is beind rendered.
                //scope.$emit(events.LAYOUT_REFLOW_REQUIRED_U);
                ChartUIUtils.render(scope, $chartContainer);
                debugInfoCollector.collect(serviceNames.RENDER, debugInfo);
            };

            // TODO(Jasmeet): Move utility functions to chart util service.
            scope.getLegendOrientation = function () {
                var model = scope.viz.getModel(),
                    legendCardinality = model.getLegendCardinality(),
                    isGeoMapChartType = chartTypeSpecificationService.isGeoMapChartType(
                        scope.viz.getModel().getChartType()
                    );

                if (!scope.chartDimensions) { scope.updateChartDimensions() };

                var shouldShowLegendVertical = chartUtilService.isLegendVertical(
                    isGeoMapChartType,
                    scope.chartDimensions,
                    legendCardinality
                );

                return shouldShowLegendVertical
                    ? chartUtilService.LegendOrientations.VERTICAL
                    : chartUtilService.LegendOrientations.HORIZONTAL;
            };

            scope.updateChartDimensions = function() {
                var chartDimensions = $el[0].getBoundingClientRect();
                scope.chartDimensions = {
                    width: chartDimensions.width,
                    height: chartDimensions.height
                }
            }

            scope.isLegendVertical = function () {
                return this.getLegendOrientation() === chartUtilService.LegendOrientations.VERTICAL;
            };

            scope.isLegendHorizontal = function () {
                return this.getLegendOrientation() === chartUtilService.LegendOrientations.HORIZONTAL;
            };

            scope.getAvailableLegendHeight = function () {
                return $chartContainer.height() * MAX_LEGEND_HEIGHT_CHART_HEIGHT_FRACTION;
            };

            scope.canShowLegendControl = function () {
                var chartModel = this.viz.getModel();
                scope.updateChartDimensions();
                // We can only show a legend control for chart which has either one or more legend columns or multiple y-axes.
                if(!chartModel) {
                    return false;
                }

                if(chartModel.shouldNotShowLegend()) {
                    return false;
                }

                if (chartModel.getLegendColumns().length === 0 && chartModel.getYAxisColumns().length < 2) {
                    return false;
                }

                // If the legend column has no values, then there is no point of a legend box.
                if (chartModel.getLegendCardinality() <= 0) {
                    return false;
                }

                if (!chartUtilService.isChartBigEnoughToShowLegend(scope.viz.getModel(),
                                                                   scope.chartDimensions,
                                                                   scope.isLegendVertical())) {
                    return false;
                }

                return true;
            };

            // Unbind listeners when directive is destroyed
            scope.$on('$destroy', function () {
                $('body').off('mousedown.appWindowClick');
                $(window).off('resize');
                $(window).off('resizeend');
                ChartUIUtils.removeCurrentChart(scope);
            });

            configureScopeHandlers(scope, $chartContainer, $el);
            // Init chart is also called from within the chart model watcher.
            scope.initChart();
        }

        return {
            restrict: 'E',
            scope: {
                viz: '=',
                sageClient: '=',
                onRenderComplete: '='
            },
            link: linker,
            controller: 'ChartController',
            templateUrl: 'src/modules/viz-layout/viz/chart/chart.html'
        };
    }]);
