/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This service exposes functionality to get most preferred chart type given a fixed axis column
 * configuration.
 */

'use strict';

blink.app.factory('bestChartTypeService', ['chartTypeSpecificationService',
    'Logger',
    function (chartTypeSpecificationService,
    Logger) {

        var logger = Logger.create('best-chart-type-service');

        var chartTypes = chartTypeSpecificationService.chartTypes;
    // Note (sunny): this list will need to be kept in sync with master list of supported
    // chart types in chartTypes

    // decreasing order of preference
        var PREFERRED_CHART_TYPES_IN_ORDER = [
            chartTypes.GEO_HEATMAP,
            chartTypes.GEO_BUBBLE,
            chartTypes.GEO_AREA,
            chartTypes.HEATMAP,
            chartTypes.TREEMAP,
            chartTypes.WATERFALL,
            chartTypes.PARETO,
            chartTypes.BUBBLE,
            chartTypes.SCATTER,
            chartTypes.STACKED_AREA,
            chartTypes.AREA,
            chartTypes.PIE,
            chartTypes.LINE,
            chartTypes.BAR,
            chartTypes.STACKED_COLUMN,
            chartTypes.COLUMN
        ];

    /*global flags*/
        if (flags.getValue('enableWebGLMaps')) {
            Array.prototype.unshift.apply(
            PREFERRED_CHART_TYPES_IN_ORDER,
                [
                    chartTypes.GEO_EARTH_GRAPH,
                    chartTypes.GEO_EARTH_HEATMAP,
                    chartTypes.GEO_EARTH_BAR,
                    chartTypes.GEO_EARTH_BUBBLE,
                    chartTypes.GEO_EARTH_AREA
                ]
        );
        }

        var allChartTypes = Object.values(chartTypes);
        if (PREFERRED_CHART_TYPES_IN_ORDER.length !== allChartTypes.length) {
            var missing = allChartTypes.subtract(PREFERRED_CHART_TYPES_IN_ORDER);
            logger.warn(
            'not all charts types are present in the ordered list of chart type preference, missing types:',
            missing
        );
        }

    /**
     *
     * @param {ChartAxisConfig} axisConfig
     */
        function getBestChartType(axisConfig) {
            var preferredChartType = PREFERRED_CHART_TYPES_IN_ORDER.find(function(chartType){
                return chartTypeSpecificationService.validateAxisConfig(chartType, axisConfig);
            });
            return preferredChartType || null;
        }

        return {
            getBestChartType: getBestChartType
        };
    }]);
