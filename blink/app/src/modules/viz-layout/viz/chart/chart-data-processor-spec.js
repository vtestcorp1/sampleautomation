/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for chart data processor
 */

'use strict';

describe('Chart data processor spec', function () {
    var ChartModel, chartModelTestUtilService, chartAxisConfigMappingService, VisualizationModel, mocks,
        VisualizationColumnModel;

    function initSuite() {
        beforeEach(function () {
            module('blink.app');
            // This load will override the real definitions with the mocks specified above.
            inject(function ($injector) {
                ChartModel = $injector.get('ChartModel');
                chartModelTestUtilService = $injector.get('chartModelTestUtilService');
                chartAxisConfigMappingService = $injector.get('chartAxisConfigMappingService');
                VisualizationModel = $injector.get('VisualizationModel');
                VisualizationColumnModel = $injector.get('VisualizationColumnModel');
                mocks = $injector.get('mocks');
            });
        });
    }

    describe('(basic)', function () {

        initSuite();
        it('should normalize timeseries chart data', function () {
            var column1 = mocks.getVisualizationColumn('valueCol1', 'valueCol', {
                effectiveType: 'MEASURE',
                effectiveDataType: 'INT64',
                isAttribute: function () {
                    return false;
                }
            });
            var column2 = mocks.getVisualizationColumn('catCol', 'catCol', {
                sortAscending: true,
                effectiveType: 'ATTRIBUTE',
                effectiveDataType: 'DATE',
                isAttribute: function () {
                    return true;
                }
            });
            var metadata = {
                    header: {},
                    vizContent: {
                        vizType: 'CHART',
                        values: {
                            columns: [column1]
                        },
                        categories: {
                            columns: [column2]
                        }
                    }
                },
                data = {
                    data: [[8000001, 10], [8000002, 20]],
                    uniques: {
                        '0': [8000001, 8000002]
                    }
                };

            var allColumns = [column1, column2].map(function (metadataJson) {
                return new VisualizationColumnModel(metadataJson);
            });

            var chartModel = new ChartModel({
                vizJson: metadata,
                allColumns: allColumns
            });

            chartModel.updateData([data]);

            expect(chartModel.hasError()).toBeFalsy();
            expect(chartModel.hasNoData()).toBeFalsy();

            var series = chartModel.getSeries();
            expect(data.data[0][0]).toEqual(8000001000);
            expect(data.data[1][0]).toEqual(8000002000);
        });

        it('should ignore data points with invalid values', function () {
            // null is ignored when using uniform number axis.
            var chartData = chartModelTestUtilService.getChartModelData(2, 1, undefined),
                data = [{
                    data: [['A', null, 10], ['B', 2, null], ['C', 3, 11], ['D', 4, [NaN]]],
                    uniques: {
                        0: ['A', 'B', 'C', 'D']
                    }
                }];

            chartData.vizJson.vizContent.values.columns[0].clientState = {chartAxis: 'x'};
            chartData.vizJson.vizContent.values.columns[1].clientState = {chartAxis: 'y'};
            chartData.vizJson.vizContent.values.columns[0].sortAscending = true;
            chartData.vizJson.vizContent.chartType = 'SCATTER';

            var chartModel = new ChartModel({
                vizJson: chartData.vizJson,
                vizData: data
            });

            expect(chartModel.getXAxisColumns().length).toBe(1);
            expect(chartModel.getYAxisColumns().length).toBe(1);
            expect(chartModel.hasError()).toBeFalsy();
            expect(chartModel.getSeries().length).toBe(1);
            expect(chartModel.getSeries()[0].data.length).toBe(1);
            expect(chartModel.getSeries()[0].data[0].x).toBe(3);
            expect(chartModel.getSeries()[0].data[0].y).toBe(11);
            expect(chartModel.getSeries()[0].data[0].categoryName).toBe('C');
        });

        it('should allow nulls on non-sorted x-axis', function () {
            //null in measures on sorted x-axis is ignored
            var chartData = chartModelTestUtilService.getChartModelData(2, 1, 'COLUMN'),
                data = [{
                    data: [['A', null, 10], ['B', 2, null], ['C', 3, 11], ['D', 4, [NaN]]],
                    uniques: {
                        0: ['A', 'B', 'C', 'D']
                    }
                }];

            chartData.vizJson.vizContent.values.columns[0].clientState = {chartAxis: 'x'};
            chartData.vizJson.vizContent.values.columns[1].clientState = {chartAxis: 'y'};
            chartData.vizJson.vizContent.values.columns[1].sortAscending = true;
            chartData.vizJson.vizContent.values.columns[1].isUserSorted = true;

            var chartModel = new ChartModel({
                vizJson: chartData.vizJson,
                vizData: data
            });

            expect(chartModel.getXAxisColumns().length).toBe(1);
            expect(chartModel.getYAxisColumns().length).toBe(1);
            expect(chartModel.hasError()).toBeFalsy();
            expect(chartModel.getSeries().length).toBe(1);
            expect(chartModel.getSeries()[0].data.length).toBe(2);
        });

        it('should remove NaNs from measures on a uniform x-axis', function () {
            var chartData = chartModelTestUtilService.getChartModelData(2, 1);
            chartData.vizJson.vizContent.values.columns[0].clientState = {chartAxis: 'x'};
            chartData.vizJson.vizContent.values.columns[1].clientState = {chartAxis: 'y'};
            chartData.vizJson.vizContent.values.columns[0].sortAscending = true;
            chartData.vizJson.vizContent.chartType = 'SCATTER';

            var data = [{
                data: [['A', [NaN], 10], ['B', 1, 11]],
                uniques: {
                    0: ['A', 'B'],
                    2: [10, 11]
                }
            }];

            var chartModel = new ChartModel({
                vizJson: chartData.vizJson,
                vizData: data
            });

            expect(chartModel.getXAxisColumns().length).toBe(1);
            expect(chartModel.getYAxisColumns().length).toBe(1);
            expect(chartModel.hasError()).toBeFalsy();
            expect(chartModel.getSeries().length).toBe(1);
            expect(chartModel.getSeries()[0].data.length).toBe(1);
        });
    });
});
