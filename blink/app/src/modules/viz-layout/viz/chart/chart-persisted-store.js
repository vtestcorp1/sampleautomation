/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides api abstraction for persistence of chart related information in session store.
 * this can be extended in future to allow persistence in local store on clients.
 */

'use strict';

// TODO(Jasmeet): This doesnt really need persistence and can be in memory.
blink.app.factory('chartPersistedStore', ['Logger', 'util', function (Logger, util) {
    var _logger = Logger.create('chart-persisted-store');

    var columnEffectiveIdGetter = function(column) {
        return column.getSageOutputColumnId();
    };

    var persistChartTypeAndAxisConfig = function (chartModel) {
        if (chartModel.isPinboardViz()) {
            return;
        }

        var key = chartModel.getId(),
            chartType = chartModel.getChartType(),
            xAxisColumns = chartModel.getXAxisColumns(),
            yAxisColumns = chartModel.getYAxisColumns(),
            legendColumns = chartModel.getLegendColumns(),
            radialColum = chartModel.getRadialColumn(),
            allColumns = chartModel.getColumns();

        var storeEntry = {
            xAxisColumnIds: xAxisColumns.map(columnEffectiveIdGetter),
            yAxisColumnIds: yAxisColumns.map(columnEffectiveIdGetter),
            legendColumnIds: legendColumns.map(columnEffectiveIdGetter),
            chartType: chartType,
            allColumnIds: allColumns.map(function (column){
                return column.getSageOutputColumnId();
            })
        };
        if (!!radialColum) {
            storeEntry.radialColumnId = radialColum.getSageOutputColumnId();
        }

        util.setSessionStoreValue(key, storeEntry);
    };

    var getConfig = function (key) {
        var config = util.getSessionStoreValue(key);
        if (!config) {
            return null;
        }
        return config;
    };

    return {
        persistChartTypeAndAxisConfig: persistChartTypeAndAxisConfig,
        getConfig: getConfig
    };
}]);
