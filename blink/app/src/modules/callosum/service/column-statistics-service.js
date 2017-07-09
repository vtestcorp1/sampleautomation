/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Lucky Odisetti (niladhar.odisetti@thoughtspot.com),
 *
 * @fileoverview Service used to get statistics of column data
 */

'use strict';

blink.app.factory('columnStatisticsService', ['$q', 'Command',
    function ($q, Command) {
        function getColumnStatistics(columnIds) {
            var command = new Command()
            .setPath('/data/columnstatistics')
            .setPostMethod()
            .setPostParams({
                ids : JSON.stringify(columnIds)
            });

            return command.execute().then(function (response) {
                var data = response.data;

            // Convert from {
            //   colId1: {
            //     metric1: a,
            //     metric2: b
            //   },
            //   colId2: {
            //     metric1: c,
            //     metric2: d
            //   }
            // }
            //
            // to {
            //    metric1: { colId1: a, colId2: c},
            //    metric2: { colId1: b, coldId2: d}
            // }
                var results = {};
                Object.keys(data).forEach(function (colId) {
                    Object.keys(data[colId]).forEach(function (metric) {
                        if (!results.hasOwnProperty(metric)) {
                            results[metric] = {};
                        }
                        results[metric][colId] = data[colId][metric];
                    });
                });
                response.data = results;
                return response;
            });
        }

        return {
            getColumnStatistics: getColumnStatistics
        };
    }]);
