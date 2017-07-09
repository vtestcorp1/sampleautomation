/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This service exposes functionality to get best axis config map per chart type for a given chart Model
 */

'use strict';

blink.app.factory('bestChartAxisConfigService', ['Logger', 'chartTypeSpecificationService',
    function (Logger, chartTypeSpecificationService) {
        var _logger = Logger.create('best-chart-axis-config-service');

        var computeChartTypesToBestAxisConfigMap = function (chartModel) {
            var bestAxisColumnConfigForChartType = {},
                chartTypes = Object.keys(chartTypeSpecificationService.chartTypes);

            angular.forEach(chartTypes, function (chartType) {
                var bestConfig = chartTypeSpecificationService.computeBestChartAxisConfig(chartType, chartModel);
                if (!!bestConfig) {
                    bestAxisColumnConfigForChartType[chartType] = bestConfig;
                }
            });
            return bestAxisColumnConfigForChartType;
        };

        return {
        // functions:
            computeChartTypesToBestAxisConfigMap: computeChartTypesToBestAxisConfigMap
        };
    }]);
