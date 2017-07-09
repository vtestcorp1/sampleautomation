/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview View for the debug page.
 */

'use strict';

blink.app.directive('pieChart', ['BlinkHighchart', function (BlinkHighchart) {

    function linker (scope, $el) {

        var chartOptions = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                renderTo: $el[0]
            },
            title: {
                text: scope.title
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            yAxis: {},
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [scope.data]
        };

        var chart = new BlinkHighchart(chartOptions);

        scope.$watch(scope.data, function (data) {
            chart.series[0].setData(data.data);
        }, true);
    }

    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '&data',
            title: '@title'
        },
        link: linker,
        templateUrl: 'src/modules/debug/pie-chart.html',
        controller: 'MemcacheManagementController'
    };

}]);
