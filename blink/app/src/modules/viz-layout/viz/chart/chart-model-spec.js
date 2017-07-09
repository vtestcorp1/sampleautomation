/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for chart model
 */

'use strict';

describe('Chart Model', function (){
    var ChartModel, VisualizationModel, chartModelTestUtilService,
        VisualizationColumnModel, chartTypeSpecificationService,
        sessionService, blinkConstants, originalFlagGetValue;

    var basePath = getBasePath(document.currentScript.src);

    beforeEach(function(done) {
        module('blink.app');
        freshImport(basePath, './chart-model')
            .then(function (module) {
                ChartModel = module.ChartModel;
                // This load will override the real definitions with the mocks specified above.
                inject(function($injector) {
                    var dateUtil = $injector.get('dateUtil');
                    VisualizationModel = $injector.get('VisualizationModel');
                    VisualizationColumnModel = $injector.get('VisualizationColumnModel');
                    chartModelTestUtilService = $injector.get('chartModelTestUtilService');
                    chartTypeSpecificationService = $injector.get('chartTypeSpecificationService');
                    sessionService = $injector.get('sessionService');
                    blinkConstants = $injector.get('blinkConstants');

                    var session = $injector.get('session');
                    /* global spyOnSessionTimezone */
                    spyOnSessionTimezone(session);
                    dateUtil.initialize();
                });
                done();
            }, function(e) {
                console.log(e.stack);
            });
        originalFlagGetValue = flags.getValue;
    });

    afterEach(function() {
        flags.getValue = originalFlagGetValue;
    });

    it('should initialize with no data', function() {
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART'
                }
            },
            data = [{}];
        var chartModel;
        expect(function() {
            chartModel = new ChartModel({
                vizJson: metadata,
                vizData: data
            });
        }).not.toThrow();

        expect(chartModel.hasNoData()).toBeTruthy();
    });

    /*
    it('should initialize with errors for empty definition', function () {
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART'
                }
            },
            data = [{
                data: [[0, 0]],
                uniques: {
                    '0': []
                }
            }];

        expect(function() {
            new ChartModel({
                vizJson: metadata
            });
        }).not.toThrow();

        var chartModel = new ChartModel({
            vizJson: metadata
        });

        var vizContent = metadata.vizContent;
        angular.extend(vizContent, {
            values: {
                columns: []
            }
        });
        expect(function() {
            chartModel = new ChartModel({
                vizJson: metadata
            });
        }).not.toThrow();

        expect(chartModel.getXAxisColumns().length).toBe(0);

        angular.extend(vizContent, {
            values: {
                columns: [{}]
            },
            categories: {
                columns: []
            }
        });
        chartModel = new ChartModel({
            vizJson: metadata,
            vizData: data
        });

        expect(chartModel.hasError()).toBeTruthy();
        expect(chartModel.getXAxisColumns().length).toBe(0);

        angular.extend(vizContent, {
            categories: {},
            series: {
                columns: []
            }
        });
        chartModel = new ChartModel({
            vizJson: metadata,
            vizData: data
        });
        expect(chartModel.hasError()).toBeTruthy();
        expect(chartModel.getXAxisColumns().length).toBe(0);

        angular.extend(vizContent, {
            categories: {
                columns: [{}, {}]
            },
            series: null
        });
        chartModel = new ChartModel({
            vizJson: metadata,
            vizData: data
        });
        expect(chartModel.hasError()).toBeTruthy();
        expect(chartModel.getXAxisColumns().length).toBe(0);

        angular.extend(vizContent, {
            categories: {
                columns: [{}]
            }
        });

        chartModel = new ChartModel({
            vizJson: metadata,
            vizData: data
        });

        angular.extend(vizContent, {
            values: {
                columns: [{
                    column: getLogicalColumn('valueCol1')
                }]
            },
            categories: {
                columns: [{
                    column: getLogicalColumn('catCol')
                }]
            }
        });
        expect(function() {
            chartModel = new ChartModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();

        var col1 = {
            column: getLogicalColumn('valueCol1'),
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            isAttribute: function () {
                return false;
            }
        };
        var col2 = {
            column: getLogicalColumn('catCol'),
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            isAttribute: function () {
                return true;
            }
        };

        angular.extend(vizContent, {
            values: {
                columns: [col1]
            },
            categories: {
                columns: [col2]
            }
        });

        var allColumns = [col1,col2].map(function(metadataJson) {
            return new VisualizationColumnModel(metadataJson);
        });

        chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });
        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.getXAxisColumns().length).toBe(1);
        expect(chartModel.getYAxisColumns().length).toBe(1);
    });
    */

    it('should initialize with no error with full definition and no data', function () {
        var column1 = {
            sageOutputColumnId : 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            isAttribute: function () {
                return true;
            }
        };

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
        };

        var allColumns = [column1,column2].map(function(metadataJson) {
            return new VisualizationColumnModel(metadataJson);
        });

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        // should still have valid columns
        expect(chartModel.getXAxisColumns().length).toBe(1);
        expect(chartModel.getYAxisColumns().length).toBe(1);
    });

    it('should set error to false and no data to true for update with empty data', function () {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            isAttribute: function () {
                return true;
            }
        };

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
        };
        // TODO(Jasmeet): Add test case for updateData to handle the case when data row is empty.
        var data = [{data: []}];

        var allColumns = [column1,column2].map(function(metadataJson) {
            return new VisualizationColumnModel(metadataJson);
        });

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        chartModel.updateData(data);

        // should still have valid columns
        expect(chartModel.getXAxisColumns().length).toBe(1);
        expect(chartModel.getYAxisColumns().length).toBe(1);
        // But the chart still has errors.
        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.hasNoData()).toBeTruthy();
    });

    it('should have a valid series for non-empty data + complete definition', function () {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            isAttribute: function () {
                return true;
            }
        };
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
            data = [{
                data: [['red', 10]],
                uniques: {
                    '0': ['red']
                }
            }];

        var allColumns = [column1,column2].map(function(metadataJson) {
            return new VisualizationColumnModel(metadataJson);
        });

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        chartModel.updateData(data);
        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.hasNoData()).toBeFalsy();
        var series = chartModel.getSeries();
        // Expect exactly one unnamed series.
        expect(series.length).toEqual(1);
        expect(series[0].name).toBeFalsy();
        // Expect only one data point in the series.
        expect(series[0].data.length).toEqual(1);
        // Expect to have 2 coordinates of the point.
        expect(Object.keys(series[0].data[0]).length).toEqual(2);
        // First point x is 0. Not 'color'. That is the x label.
        expect(series[0].data[0].x).toEqual(0);
        expect(chartModel.getXAxisLabelAt(0)).toEqual('red');
    });

    it('should have named series', function () {
        var column1 = {
            sageOutputColumnId:'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            clientState: {
                chartAxis: 'y'
            }
        };
        var column2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            clientState: {
                chartAxis: 'x'
            }
        };
        var column3 = {
            sageOutputColumnId: 'serCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            clientState: {
                chartAxis: 'z'
            }
        };
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    chartType: 'COLUMN',
                    values: {
                        columns: [column1]
                    },
                    categories: {
                        columns: [column2]
                    },
                    series: {
                        columns: [column3]
                    }
                }
            },
            data = [{
                data: [['asia', 'red', 10], ['africa', 'blue', 20]],
                uniques: {
                    '0': ['asia', 'africa'],
                    '1': ['red', 'blue']
                }
            }];

        var allColumns = [column1,column2, column3].map(function(metadataJson) {
            return new VisualizationColumnModel(metadataJson);
        });

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        chartModel.updateData(data);

        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.hasNoData()).toBeFalsy();
        var series = chartModel.getSeries();
        // Expect 2 named series.
        expect(series.length).toEqual(2);
        expect(series[0].name).toEqual('africa');
        expect(series[1].name).toEqual('asia');
        // Expect 1 data point per series. (one for 'red' and another for 'blue').
        expect(series[0].data.length).toEqual(1);
        expect(series[1].data.length).toEqual(1);
        // The 'asia' series has a valid point for 'red'.
        expect(series[0].data[0].y).toEqual(20);
        // The 'africa' series has a valid point for 'blue'.
        expect(series[1].data[0].y).toEqual(10);
        expect(chartModel.getXAxisLabelAt(0)).toEqual('blue');
        expect(chartModel.getXAxisLabelAt(1)).toEqual('red');
        // Out of bound check.
        expect(chartModel.getXAxisLabelAt(2)).toEqual('');
    });

    it('should support multi-measure series', function () {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            clientState: {
                chartAxis: 'x'
            },
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            sageColumnId: 'valueCol1',
            sortAscending: true
        };
        var column2 = {
            sageOutputColumnId: 'valueCol2',
            clientState: {
                chartAxis: 'y'
            },
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            sageColumnId: 'valueCol2'
        };
        var column4 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            sageColumnId: 'catCol',
            sortAscending: true
        };
        var column5 = {
            sageOutputColumnId: 'serCol',
            clientState: {
                chartAxis: 'z'
            },
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            sageColumnId: 'serCol',
            uniqueCount: 15
        };
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    chartType: 'SCATTER',
                    values: {
                        columns: [column1, column2]
                    },
                    categories: {
                        columns: [column4]
                    },
                    series: {
                        columns: [column5]
                    }
                }
            },
            data = [{
                data: [['asia', 'red', 10, 5], ['africa', 'blue', 20, 10]],
                uniques: {
                    '0': ['asia', 'africa'],
                    '1': ['red', 'blue']
                }
            }];

        var allColumns = [column1,column2, column4, column5].map(function(metadataJson) {
            return new VisualizationColumnModel(metadataJson);
        });

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        chartModel.updateData(data);

        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.hasNoData()).toBeFalsy();
        var series = chartModel.getSeries();
        // Expect 2 named series.
        expect(series.length).toEqual(2);
        expect(series[0].name).toEqual('africa');
        expect(series[1].name).toEqual('asia');
        // Expect 1 data point per series.
        expect(series[0].data.length).toEqual(1);
        expect(series[1].data.length).toEqual(1);
        // Check the first data point.
        expect(series[0].data[0].x).toEqual(20);
        expect(series[0].data[0].y).toEqual(10);
        expect(series[0].data[0].categoryName).toEqual('blue');
        // Check the second data point.
        expect(series[1].data[0].x).toEqual(10);
        expect(series[1].data[0].y).toEqual(5);
        expect(series[1].data[0].categoryName).toEqual('red');

        angular.extend(data[0], {
            data: [['asia', 'red', 10, 5], ['africa', 'blue', 20, null]],
            uniques: {
                '0': ['asia', 'africa'],
                '1': ['red', 'blue']
            }
        });
        chartModel.updateData(data);
        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.hasNoData()).toBeFalsy();

        series = chartModel.getSeries();
        // Expect 2 named series.
        expect(series.length).toEqual(1);
        expect(series[0].name).toEqual('asia');
        // Expect y = null to be dropped.
        expect(series[0].data.length).toEqual(1);
    });

    it('should return correct x and y raw values', function () {

        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            clientState: {
                chartAxis: 'x'
            },
            sageColumnId: 'valueCol1',
            sortAscending: true
        };
        column1.isEffectivelyNumeric = function() { return true; };
        var column2 = {
            sageOutputColumnId: 'valueCol2',
            clientState: {
                chartAxis: 'y'
            },
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            sageColumnId: 'valueCol2'
        };
        column2.isEffectivelyNumeric = function() { return true; };
        var column3 = {
            sageOutputColumnId: 'valueCol3',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            sageColumnId: 'valueCol3'
        };
        column3.isEffectivelyNumeric = function() { return true; };
        var column4 = {
            sageOutputColumnId: 'catCol',
            clientState: {
                chartAxis: 'y'
            },
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            sageColumnId: 'catCol',
            sortAscending: true
        };
        column4.isEffectivelyNumeric = function() { return false; };
        var column5 = {
            sageOutputColumnId: 'serCol',
            clientState: {
                chartAxis: 'x'
            },
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'STRING',
            sageColumnId: 'serCol',
            uniqueCount: 15
        };
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    chartType: 'SCATTER',
                    values: {
                        columns: [column1, column2]
                    },
                    categories: {
                        columns: [column4]
                    },
                    series: {
                        columns: [column5]
                    }
                }
            },
            data = [{
                data: [['asia', 'red', 10, 5], ['africa', 'blue', 20, 10]],
                uniques: {
                    '0': ['asia', 'africa'],
                    '1': ['red', 'blue']
                }
            }];

        var allColumns = [column1,column2, column4, column5].map(function(metadataJson) {
            return  new VisualizationColumnModel(metadataJson);
        });


        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        chartModel.updateData(data);
        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.hasNoData()).toBeFalsy();
        expect(chartModel.getRawXAxisValues(0)).toEqual(['africa',20]);
        expect(chartModel.getRawXAxisValues(1)).toEqual(['asia',10]);
        expect(chartModel.getRawYAxisValueForColumn(1,chartModel.getColumns()[2])).toEqual('blue');
        expect(chartModel.getRawYAxisValueForColumn(10,chartModel.getColumns()[1])).toEqual(10);
    });

    it('should support non-sorted measures on x-axis', function () {
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    chartType: 'COLUMN',
                    values: {
                        columns: [{
                            sageOutputColumnId: 'valueCol1',
                            clientState: {
                                chartAxis: 'x'
                            },
                            effectiveType: 'MEASURE',
                            effectiveDataType: 'INT64',
                            sageColumnId: 'valueCol1'
                        },{
                            sageOutputColumnId: 'valueCol2',
                            clientState: {
                                chartAxis: 'y'
                            },
                            effectiveType: 'MEASURE',
                            effectiveDataType: 'INT64',
                            sageColumnId: 'valueCol2',
                            isUserSorted: true,
                            sortAscending: true
                        }]
                    },
                    categories: {
                        columns: [{
                            sageOutputColumnId: 'catCol',
                            effectiveType: 'ATTRIBUTE',
                            effectiveDataType: 'STRING',
                            sageColumnId: 'catCol',
                            sortAscending: true
                        }]
                    }
                }
            },
            data = [{
                data: [['asia', 10, 20], ['africa', 5, 10]],
                uniques: {
                    '0': ['asia', 'africa']
                }
            }];

        var chartModel = new ChartModel({
            vizJson: metadata,
            vizData: data
        });

        expect(chartModel.hasError()).toBeFalsy();
        expect(chartModel.hasNoData()).toBeFalsy();

        var series = chartModel.getSeries();
        // Check the first data point.
        expect(series[0].data[0].x).toEqual(0);
        expect(series[0].data[0].y).toEqual(20);
        // Check the second data point.
        expect(series[0].data[1].x).toEqual(1);
        expect(series[0].data[1].y).toEqual(10);
    });

    it('should test isTimeSeries', function () {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'DATE',
            isAttribute: function () {
                return true;
            }
        };
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
        };

        var allColumns = [column1,column2].map(function(metadataJson) {
            return new VisualizationColumnModel(metadataJson);
        });

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        //x-axis needs to be sorted
        expect(chartModel.isTimeSeries()).toBeFalsy();
        angular.extend(metadata.vizContent.categories.columns[0], {
            sortAscending: true,
            sortIndex: 0
        });
        expect(chartModel.isTimeSeries()).toBeTruthy();

        //x-axis needs to be a date
        angular.extend(metadata.vizContent.categories.columns[0], {
            effectiveDataType: 'INT64'
        });
        expect(chartModel.isTimeSeries()).toBeFalsy();

        angular.extend(metadata.vizContent.categories.columns[0], {
            effectiveDataType: 'DATE'
        });
        //y-axis should not be sorted
        angular.extend(metadata.vizContent.values.columns[0], {
            sortAscending: true
        });
        expect(chartModel.isTimeSeries()).toBeFalsy();
    });

    it('should test isPrimarySortedOnXAxis', function () {
        var col1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'INT64',
            getGuid: function() {
                return 'c1';
            },
            getSageOutputColumnId: function () {
                return 'id1';
            },
            getTrueEffectiveAggregateType: function () {
                return 'AVG';
            },
            isDateColumn: function () {
                return false;
            },
            isAscendingSort: function () {
                return false;
            },
            isEffectivelyNonNumeric : function () {
                return false;
            },
            isGroupingColumn: function () {
                return false;
            },
            isEffectivelyNumeric: function () {
                return true;
            },
            isGrowth: function () {
                return false;
            },
            isGeoColumn: function () {
                return false;
            },
            getGeoConfig: function () {
                return null;
            },
            getJson: function () {
                return {
                    sageOutputColumnId: 'valueCol1',
                    effectiveType: 'MEASURE',
                    effectiveDataType: 'INT64',
                };
            },
            isNumeric: function () {
                return true;
            },
            isMeasure: function() {
                return true;
            },
            setDataRowIndex : _.noop,
            isSorted: function () {
                return false;
            }
        };
        var col2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'DATE',
            sortAscending: true,
            sortIndex: 0,
            getGuid: function() {
                return 'c2';
            },
            getSageOutputColumnId: function () {
                return 'id2';
            },
            isDateColumn: function () {
                return true;
            },
            isAscendingSort: function () {
                return true;
            },
            isEffectivelyNonNumeric : function () {
                return true;
            },
            isGroupingColumn: function () {
                return true;
            },
            isEffectivelyNumeric: function () {
                return false;
            },
            isGrowth: function () {
                return false;
            },
            isGeoColumn: function () {
                return false;
            },
            getJson: function () {
                return {
                    sageOutputColumnId: 'catCol',
                    effectiveType: 'ATTRIBUTE',
                    effectiveDataType: 'DATE',
                };
            },
            isNumeric: function () {
                return false;
            },
            isMeasure: function() {
                return true;
            },
            setDataRowIndex : _.noop,
            isSorted: function () {
                return true;
            },
            getSortIndex: function () {
                return 0;
            }
        };

        var allColumns = [col1, col2];

        var metadata = {
            header: {},
            vizContent: {
                vizType: 'CHART',
                values: {
                    columns: [col1]
                },
                categories: {
                    columns: [col2]
                }
            }
        };

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        expect(chartModel.isPrimarySortOnXAxisColumns()).toBeTruthy();
    });

    it('should format timeseries x-axis labels', function() {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'DOUBLE',
            effectiveFormatType: 'PERCENTAGE',
            growth: true,
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'DATE',
            sortAscending: true,
            isAttribute: function () {
                return true;
            }
        };

        var metadata = {
            header: {},
            vizContent: {
                vizType: 'CHART',
                chartType: 'COLUMN',
                values: {
                    columns: [column1]
                },
                categories: {
                    columns: [column2]
                }
            }
        };

        var testCases = [
                {days: 365, unitName: 'year', count: 1,  labels: ['1970', '1971']},
                {days: 89, unitName: 'month', count: 3, labels: ['Q1 70', 'Q2 70']},
                {days: 28, unitName: 'month', count: 1, labels: ['Feb 70', 'Mar 70']},
                {days: 7, unitName: 'week', count: 1, labels: ['02/01/1970', '02/08/1970']},
                {days: 6, unitName: 'day', count: 1, labels: ['02/01/70', '02/07/70']}
            ],
            startDate = 2707200, //Feb 01 1970
            chartModel,
            data;

        testCases.each(function(testCase) {
            var delta = testCase.days * 86400;

            data = [{
                data: [[startDate, -0.5], [startDate + delta, 0.0], [startDate + 2 * delta, 0.556]],
                uniques: {
                    '0': [startDate, startDate + delta, startDate + 2 * delta]
                }
            }];

            var allColumns = [column1, column2].map(function (columnJson) {
                return new VisualizationColumnModel(columnJson);
            });

            chartModel = new ChartModel({
                vizJson: metadata,
                allColumns: allColumns
            });

            chartModel.updateData(data);
            //dateUtil.timeBuckets.DAILY = 0
            chartModel.getXAxisColumns()[0].getTimeBucket = jasmine.createSpy().and.returnValue(0);

            testCase.labels.each(function(label, index){
                var tickPositions = [data[0].data[0][0], data[0].data[1][0]];
                tickPositions.info = {
                    unitName: testCase.unitName,
                    count: testCase.count
                };
                expect(chartModel.getXAxisLabelAt(data[0].data[index][0], tickPositions)).toBe(label);
            });
        });

        //only one tick
        expect(chartModel.getXAxisLabelAt(data[0].data[0][0], [data[0].data[0][0]])).toBe('02/01/1970');

        //the data is not primarily sorted on x-axis.
        chartModel.isPrimarySortOnXAxisColumns = jasmine.createSpy().and.returnValue(false);
        expect(chartModel.getXAxisLabelAt(data[0].data[0][0], [data[0].data[0][0]])).toBe('02/01/1970');
        expect(chartModel.getXAxisLabelAt(data[0].data[1][0], [data[0].data[1][0]])).toBe('02/07/1970');
    });

    it('should format x-axis labels for percentage columns', function() {
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    values: {
                        columns: [{
                            sageOutputColumnId: 'valueCol1',
                            clientState: {
                                chartAxis: 'x'
                            },
                            effectiveType: 'MEASURE',
                            effectiveDataType: 'DOUBLE',
                            effectiveFormatType: 'PERCENTAGE',
                            formatPattern: '#.00',
                            growth: true,
                            sortAscending: true,
                            isAttribute: function () {
                                return false;
                            }
                        }, {
                            sageOutputColumnId: 'valueCol2',
                            clientState: {
                                chartAxis: 'y'
                            },
                            effectiveType: 'MEASURE',
                            effectiveDataType: 'DOUBLE',
                            formatPattern: '#.00',
                            isAttribute: function () {
                                return false;
                            }
                        }]
                    },
                    categories: {
                        columns: [{
                            sageOutputColumnId: 'catCol',
                            effectiveType: 'ATTRIBUTE',
                            effectiveDataType: 'DATE',
                            isAttribute: function () {
                                return true;
                            }
                        }]
                    },
                    chartType: 'SCATTER'
                }
            },
            data = [{
                data: [[8000001, -0.5, 10], [8000002, 0.0, 5], [8000003, 0.556, 20], [8000004, 1.23456, 30]],
                uniques: {
                    '0': [8000001, 8000002, 8000003, 8000004]
                }
            }];
        var chartModel = new ChartModel({
            vizJson: metadata,
            vizData: data
        });
        var allXAxisLabels = [-0.5, 0.0, 1.0];


        expect(chartModel.getXAxisLabelAt(-0.5, allXAxisLabels)).toBe('-50%');
        expect(chartModel.getXAxisLabelAt(0.0, allXAxisLabels)).toBe('0%');
        expect(chartModel.getXAxisLabelAt(1.0, allXAxisLabels)).toBe('100%');
    });

    it('should format y-axis labels for percentage columns', function() {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'DOUBLE',
            effectiveFormatType: 'PERCENTAGE',
            formatPattern: '#.00',
            growth: true,
            clientState: {
                chartAxis: 'y'
            },
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'DATE',
            clientState: {
                chartAxis: 'x'
            },
            isAttribute: function () {
                return true;
            }
        };
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    chartType: 'COLUMN',
                    values: {
                        columns: [column1]
                    },
                    categories: {
                        columns: [column2]
                    }
                }
            },
            allColumns = [column1,column2].map(function(metadataJson) {
                return new VisualizationColumnModel(metadataJson);
            }),
            data = [{
                data: [[8000001, -0.5], [8000002, 0.0], [8000003, 0.556], [8000004, 1.23456]],
                uniques: {
                    '0': [8000001, 8000002, 8000003, 8000004]
                }
            }];

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        chartModel.updateData(data);

        var allYAxisLabels = [-0.5, 0.0, 1.0],
            yAxisColumn = chartModel.getYAxisColumns()[0];

        expect(chartModel.getYAxisLabel({
            yAxisColumn: yAxisColumn,
            y: -0.5,
            allYValuesOnLabels: allYAxisLabels
        })).toBe('-50%');

        expect(chartModel.getYAxisLabel({
            yAxisColumn: yAxisColumn,
            y: 0,
            allYValuesOnLabels: allYAxisLabels
        })).toBe('0%');

        expect(chartModel.getYAxisLabel({
            yAxisColumn: yAxisColumn,
            y: 1,
            allYValuesOnLabels: allYAxisLabels
        })).toBe('100%');
    });

    it('should handle +ve and -ve infinities in data', function () {
        var chartData = chartModelTestUtilService.getChartModelData(1, 1),
            data = [{
                data: [[8000001, -0.5], [8000002, ['Infinity']], [8000003, 0.556], [8000004, '-Infinity']],
                uniques: {
                    '0': [8000001, 8000002, 8000003, 8000004]
                }
            }];

        var chartModel = chartModelTestUtilService.getChartModelForExistingData(
            chartData.vizJson,
            chartData.allColumns);

        chartModel.updateData(data);

        expect(chartModel.columnHasInfinityValues(chartModel.getYAxisColumns()[0])).toBeTruthy();
        //TODO(sunny): enable test when callosum starts handling -ve infinity (SCAL-3280)
        //expect(chartModel.columnHasMinusInfinityValues(chartModel.getYAxisColumns()[0])).toBeTruthy();
    });

    it('should format date label correctly', function () {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'DOUBLE',
            effectiveFormatType: 'PERCENTAGE',
            formatPattern: '#.00',
            growth: true,
            clientState: {
                chartAxis: 'y'
            },
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sortAscending: true,
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'DATE',
            clientState: {
                chartAxis: 'x'
            },
            formatPattern: 'yyyy',
            isAttribute: function () {
                return true;
            }
        };
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'CHART',
                    chartType: 'PIE',
                    values: {
                        columns: [column1]
                    },
                    categories: {
                        columns: [column2]
                    }
                }
            },
            allColumns = [column1,column2].map(function(metadataJson) {
                return new VisualizationColumnModel(metadataJson);
            }),
            data = [{
                data: [[694252800, 2266822805], [725875200, 2967989958], [757411200, 2898416281]],
                uniques: {
                    '0': [694252800, 725875200, 757411200]
                }
            }];

        var chartModel = new ChartModel({
            vizJson: metadata,
            allColumns: allColumns
        });

        chartModel.updateData(data);

        var xLabel = chartModel.getXAxisLabelAt(0);
        expect(xLabel).toBe('1992');

        xLabel = chartModel.getXAxisLabelAt(1);
        expect(xLabel).toBe('1993');
        xLabel = chartModel.getXAxisLabelAt(2);
        expect(xLabel).toBe('1994');
    });

    // In case of pinboards there are no all columns from the answer sheet, which is used by some
    // APIs from chart model. In such cases all columns should return at least columns retrieved
    // as part of viz content
    it('SCAL-18214 Should extend all columns from columns from axis config', function () {
        var column1 = {
            sageOutputColumnId: 'valueCol1',
            effectiveType: 'MEASURE',
            effectiveDataType: 'DOUBLE',
            effectiveFormatType: 'PERCENTAGE',
            formatPattern: '#.00',
            growth: true,
            clientState: {
                chartAxis: 'y'
            },
            isAttribute: function () {
                return false;
            }
        };
        var column2 = {
            sortAscending: true,
            sageOutputColumnId: 'catCol',
            effectiveType: 'ATTRIBUTE',
            effectiveDataType: 'DATE',
            clientState: {
                chartAxis: 'x'
            },
            formatPattern: 'yyyy',
            isAttribute: function () {
                return true;
            }
        };
        var metadata = {
            header: {},
            vizContent: {
                vizType: 'CHART',
                chartType: 'PIE',
                values: {
                    columns: [column1]
                },
                categories: {
                    columns: [column2]
                }
            }
        };

        var chartModel = new ChartModel({
            vizJson: metadata
        });

        expect(!!chartModel.getColumn('catCol')).toBe(true);
    });

    it ('should return the correct batch size', function() {
        var chartModel = new ChartModel({
            vizJson: {
                header: {},
                vizContent: {}
            }
        });
        chartTypeSpecificationService.isGeoChartType = jasmine.createSpy().and.returnValue(true);
        sessionService.getGeoDataBatchSize = jasmine.createSpy().and.returnValue(123);
        flags.getValue = jasmine.createSpy().and.returnValue(234);
        // flag should get most priority
        expect(chartModel.getBatchSize()).toBe(234);

        flags.getValue = jasmine.createSpy().and.returnValue(null);
        // if flag is not present, then for geo server side value should be resepected.
        expect(chartModel.getBatchSize()).toBe(123);

        chartTypeSpecificationService.isGeoChartType = jasmine.createSpy().and.returnValue(false);
        chartTypeSpecificationService.configOptions = jasmine.createSpy().and.returnValue({
            batchSize: 345
        });
        // For non geo the value in configOptions should be respected.
        expect(chartModel.getBatchSize()).toBe(345);

        chartTypeSpecificationService.configOptions = jasmine.createSpy().and.returnValue({});
        // Finally, if nothing is specified, default value should be returned.
        expect(chartModel.getBatchSize()).toBe(blinkConstants.DEFAULT_DATA_BATCH_SIZE);
    });
});
