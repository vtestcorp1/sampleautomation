/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is a singleton service which contains information of chart type override forced by the chart
 * controller after it has information of about data points and real estate etc.
 */

'use strict';

blink.app.factory('chartTypeOverrideService', [function () {
    var me = {};

    //this is a map that stores an alternative chart type for a chart type that the current UI is not
    //able to support.
    me.chartTypeOverrides = {};

    me.getChartTypeOverrides = function () {
        return me.chartTypeOverrides;
    };

    me.getChartType = function (chartType) {
        if (!Object.has(me.chartTypeOverrides, chartType)) {
            return chartType;
        }
        return me.chartTypeOverrides[chartType];
    };

    return me;
}]);
