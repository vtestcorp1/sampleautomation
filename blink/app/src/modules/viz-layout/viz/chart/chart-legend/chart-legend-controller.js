/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Controller for Chart legend
 */

'use strict';

blink.app.controller('ChartLegendController', ['$scope',
    '$rootScope',
    'chartTypeSpecificationService',
    'events',
    'Logger',
    'strings',
    function ($scope, $rootScope, chartTypeSpecificationService, events, Logger, strings) {
        var _logger = Logger.create('chart-legend-controller');

        function getAllSeries() {
            var chart = $scope.getChart();
            if (!chart) {
                return null;
            }
            var series = chart.getSeries();
            return series || null;
        }

        function updateLegendVisibilityState() {
            var series = getAllSeries(),
                chartModel = $scope.getVizModel();
            if (!series) {
                chartModel.clearVisibleSeriesIds();
                return;
            }
            var visibleSeriesIds = series.filter(function(series){
                return series.visible;
            }).map(function(series){
                return series.userOptions ? series.userOptions.blinkSeriesId : series.blinkSeriesId;
            });
            chartModel.setVisibleSeriesIds(visibleSeriesIds);
        }

        $scope.getSeries = function (serieName) {
            var series = getAllSeries();
            if (!series) {
                return null;
            }

            var serieInChart = series.find(function (s) {
                return s.name === serieName;
            });
            return serieInChart || null;
        };

        $scope.updateSeriesColor = function () {
            var series = getAllSeries(),
                chartModel = $scope.getVizModel();

            if(!series) {
                chartModel.clearSeriesColors();
            }

            var serie = this.getSeries(this.label),
                chart = $scope.getChart();

            chartModel.setSeriesColor((serie.userOptions || serie).blinkSeriesId, serie.color);
            chart.updateSeries(serie, {color: serie.color});
        };

        function updateOnSeriesSelectionChange() {
            updateLegendVisibilityState();

        //in case of shared y-axis, the series being hidden could correspond to the y-axis every other
        //y-axis is linked to. y-axis linked to a hidden y-axis will result in an empty chart. hence
        //we redraw to update the linking
            if ($scope.getVizModel().isYAxisShared()) {
                $scope.$emit(events.CHART_NEEDS_REDRAW_U);
            } else {
                var chart = $scope.getChart();
                chart.redraw();
            }
        }

        $scope.toggleSeriesVisibility = function (serieName) {
            var chart = this.getChart(),
                vizModel = this.getVizModel();
            var serie = this.getSeries(serieName);
            if (!serie) {
            // add the new series.
                var seriesObj = vizModel.getSeries().find(function (s) {
                    return s.name === serieName;
                });
                if (!seriesObj) {
                    _logger.warn('ThoughtSpot is not able to display the series ', serieName);
                    return;
                }
                seriesObj.visible = true;
                chart.addSeries(seriesObj, true);
            } else {
                chart.setSeriesVisibility(serie, !serie.visible);
            }

            updateOnSeriesSelectionChange();
        };

        $scope.isOnlySelectedSeries = function (serieName) {
            var series = getAllSeries();
            return series.all(function (s) {
                return s.name === serieName ? !!s.visible : !s.visible;
            });
        };

        $scope.toggleSingularSeriesSelection = function (serieName) {
            var series = getAllSeries();
            if (!series) {
                return;
            }

            var chart = this.getChart();
            var shouldDoSingularSelection = !$scope.isOnlySelectedSeries(serieName);
            var chartSeriesWithName = null;
            series.forEach(function (s) {
            // singular selection selects just the one clicked and de-selects others, de-selection selects all
                var visible = shouldDoSingularSelection ? s.name === serieName : true;
                chart.setSeriesVisibility(s, visible, false);
                if (s.name === serieName) {
                    chartSeriesWithName = s;
                }
            });
        // the series is not added to chart yet, add it and make it selected
            if (shouldDoSingularSelection && !chartSeriesWithName) {
                var vizModel = this.getVizModel();
                var vizModelSeriesWithName = vizModel.getSeries().find(function (s) {
                    return s.name === serieName;
                });
                if (!vizModelSeriesWithName) {
                    _logger.warn('no series found in chart model with name', serieName);
                    return;
                }
                vizModelSeriesWithName.visible = true;
            // don't redraw yet, we'll fire a bulk redraw below
                chart.addSeries(vizModelSeriesWithName, false);
            }

            updateOnSeriesSelectionChange();
        };

        function updateLegendValues() {
            var chartModel = $scope.getVizModel(),
                legendColumns = chartModel.getLegendColumns(),
                legendValuesList;
            if(legendColumns.length > 0) {
                if (chartModel.getChartType()
                === chartTypeSpecificationService.chartTypes.LINE_STACKED_COLUMN) {
                    legendValuesList = chartModel.getYAxisColumns().slice(1).map(function(column){
                        return column.getName();
                    });
                    Array.prototype.push.apply(legendValuesList, chartModel.getLegendColumnValues());
                } else {
                    legendValuesList = chartModel.getLegendColumnValues();
                }
            } else {
                legendValuesList = chartModel.getYAxisColumns().map(function(column){
                    return column.getName();
                });
            }
            $scope.legendLabels = legendValuesList;
        }

        updateLegendValues();
        $rootScope.$on(events.CHART_NEEDS_REDRAW_U, function(){
            updateLegendValues();
        });

        $scope.virtualRepeatModel = {};

    }]);
