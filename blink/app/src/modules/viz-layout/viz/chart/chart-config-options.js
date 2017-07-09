/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Provides a ConfigOptions class for configuring chart options.
 */
'use strict';

blink.app.factory('ConfigOptions', ['env',
    'util',
    function (env,
          util) {
    /**
     * @typedef {Object} ConfigOptions
     * @property {boolean} allowLegendWithMultipleY - Allow legend column when there are multiple Y-Axis columns
     * @property {boolean} radialEnabled - Is the radial Axis selector enabled
     * @property {boolean} legendDisabled - Disable the custom legend and legend column for this chart
     * @property {boolean} doNotShowLegend - Do not show the legend
     * @property {boolean} attributesOnYAxis - Whether to allow charting attributes on Y Axis
     * @property {boolean} noMeasuresOnYAxis - Whether to disallow measures on Y axis
     * @property {boolean} containsNativeLegend - Whether this chart uses the highchart native legend
     * @property {boolean} isMultiColorSeries - the cardinality is defined by number of
     *                                         datapoints instead of series
     * @property {boolean} useRainbowColors - Whether to use rainbow or shuffle colors for same color variation
     * @property {boolean} dataLabelsEnabledByDefault - Whether to enable the datalabels by default
     * @property {Function} dataLabelFormatter - custom formatter for datalabels.
     * @property {Object} axesAlias
     * @property {string} axesAlias.xAxis - alias for X Axis
     * @property {string} axesAlias.yAxis - alias for Y Axis
     * @property {string} axesAlias.radial - alias for radial Axis
     * @property {Object} incompleteZone
     * @property {boolean} incompleteZone.disabled - disable the incompleteZone
     * @property {Function} incompleteZone.getIncompleteColor - getter for color of the
     *                                                          incomplete zone of the chart
     * @property {Function} incompleteZone.getIncompleteThreshold - getter for the
     *                                                              threshold where the incomplete zone starts
     * @property {boolean} highThresholdGrouping - enable point grouping at a higher threshold
     * @property {batchSize} size of data array to be fetched from server.
     * @property {displayYValuesWithLegendSeries} this is to allow composite charts like line
     *                                            stacked column.
     * @property {shouldBringSelectedSeriesToFront} allow opting out of this behaviour
     * @property {boolean} cardinalityIndexStartsFromZero - count cardinal index from 0
     */
        var configOptions = {
            allowLegendWithMultipleY: false,
            radialEnabled: false,
            legendDisabled: false,
            doNotShowLegend: false,
            attributesOnYAxis: false,
            noMeasuresOnYAxis: false,
            containsNativeLegend: false,
            isMultiColorSeries: false,
            useRainbowColors: false,
            dataLabelsEnabledByDefault: false,
            dataLabelFormatter: undefined,
            arbitraryOption: {},
            axesAlias: {
                xAxis: 'X-Axis',
                yAxis: 'Y-Axis',
                radial: 'Size',
                legend: 'Legend'
            },
            incompleteZone: {
                disabled: false,
                getIncompleteColor: undefined,
                getIncompleteThreshold: undefined
            },
            highThresholdGrouping: false,
            batchSize: env.batchSize,
            displayYValuesWithLegendSeries: false,
            shouldBringSelectedSeriesToFront: true,
            cardinalityIndexStartsFromZero: false,
            allowedConfigurations: {
                geoProjectionType: false,
                showYAxisAsPercent: false,
                overlayHeatMap: false,
                zoomPanStateToggle: false,
                showDataLabels: true,
                yAxisRange: false
            }
        };

    /**
     *
     * @param {Object} options
     * @returns {ConfigOptions}
     * @constructor
     */
        function ConfigOptions(options) {
            options = options || {};
            Object.merge(this, configOptions, true);
            util.update(this, options, true, false);
            this.highcharts = options.highcharts;
            return this;
        }

        return ConfigOptions;
    }]);
