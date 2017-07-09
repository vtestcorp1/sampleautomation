/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for chart axis config mapping service
 */

'use strict';

describe('Chart axis config mapping service', function (){
    var chartModelTestUtilService, chartAxisConfigMappingService;

    function initSuite() {
        beforeEach(function() {
            module('blink.app');
            // This load will override the real definitions with the mocks specified above.
            inject(function($injector) {
                // TODO(Jasmeet): Remove dependency from chartModelTestUtilService.
                chartModelTestUtilService = $injector.get('chartModelTestUtilService');
                chartAxisConfigMappingService = $injector.get('chartAxisConfigMappingService');
            });
        });
    }

    describe('(basic)', function() {

        initSuite();

        it('should allow axes to be permuted', function () {
            var allAxisCombinations = chartModelTestUtilService.getAllAxisColumnCombinations(false, true);
            allAxisCombinations.each(function(config, index){

                var allColumns = config.allColumns,
                    chartData = config.chartData,
                    chartModel = config.chartModel,
                    axisCombination = config.axisCombination,
                    xAxisColumns = axisCombination[0],
                    yAxisColumns = axisCombination[1],
                    legendColumns = axisCombination[2],
                    radialColumn = axisCombination[3].length > 0 ? axisCombination[3][0] : undefined;

                expect(chartModel.hasError()).toBeFalsy();

                chartAxisConfigMappingService.setBackendConfiguration(
                    chartModel,
                    {
                        xAxisColumns: xAxisColumns,
                        yAxisColumns: yAxisColumns,
                        legendColumns: legendColumns,
                        radialColumn: radialColumn
                    }
                );
                var updatedChartModel = chartModelTestUtilService.getChartModelForExistingData(chartData.vizJson, allColumns);

                expect(updatedChartModel.getXAxisColumns().length).toBe(xAxisColumns.length);
                expect(updatedChartModel.getYAxisColumns().length).toBe(yAxisColumns.length);
                expect(updatedChartModel.getXAxisColumns().map('getName')).toEqual(xAxisColumns.map('getName'));
                expect(updatedChartModel.getYAxisColumns().map('getName')).toEqual(yAxisColumns.map('getName'));
                if (!legendColumns.length) {
                    expect(updatedChartModel.getLegendColumns().length).toBe(0);
                } else {
                    expect(updatedChartModel.getLegendColumns().map('getName')).toEqual(legendColumns.map('getName'));
                }
            });
        });

        it('should clear the chartConfigurations from chart model json', function () {
            var chartModel = chartModelTestUtilService.getChartModel(2, 2);
            var chartJson = chartModel.getJson();
            chartJson.chartConfigurations = [
                'foo'
            ];

            chartAxisConfigMappingService.setBackendConfiguration(
                chartModel,
                {
                    xAxisColumns: chartModel.getXAxisColumns(),
                    yAxisColumns: chartModel.getYAxisColumns(),
                    legendColumns: chartModel.getLegendColumns(),
                    radialColumn: chartModel.getRadialColumn()
                }
            );
            expect(chartJson.chartConfigurations.length).toBe(0);
        });

    });
});
