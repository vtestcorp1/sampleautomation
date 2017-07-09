/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Unit test for blink hightchart config util.
 */

'use strict';

describe('blinkHighchartConfigUtil', function () {
    var blinkHighchartConfigUtil,
        chartTypeSpecificationService;
    var dateUtil;

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            blinkHighchartConfigUtil = $injector.get('blinkHighchartConfigUtil');
            chartTypeSpecificationService = $injector.get('chartTypeSpecificationService');
            dateUtil = $injector.get('dateUtil');
        });
    });

    function getVizColumn(id) {
        return {
            getGuid: function() {
                return id;
            }
        };
    }

    function getChartModel(chartType, yAxisColumns, allColumns) {
        return {
            getChartType: function() {
                return chartType;
            },

            getYAxisColumns: function() {
                return yAxisColumns;
            },

            getColumns: function() {
                return allColumns;
            },

            getColumn: function(guid) {
                return allColumns.find(function(col) {
                    return col.getGuid() === guid;
                });
            }
        };
    }

    it("Should pick the right y-axis column from context", function () {
        var chartType = chartTypeSpecificationService.chartTypes.COLUMN,
            col1 = getVizColumn('c1'),
            col2 = getVizColumn('c2'),
            yAxisColumns = [col1, col2],
            allColumns = [col1, col2],
            context = {
                series: {
                    userOptions: {
                        blinkSeriesId: 'c2'
                    }
                }
            };
        var chartModel = getChartModel(chartType, yAxisColumns, allColumns);
        var seriesColumn =
            blinkHighchartConfigUtil.findSeriesColumnFromContext(chartModel, context);
        expect(seriesColumn.getGuid()).toEqual('c2');

        // Now test the case when there is only one yAxisColumn and there is no blinkSeriesId.
        yAxisColumns = [col1];
        chartModel = getChartModel(chartType, yAxisColumns, allColumns);
        context.series.userOptions.blinkSeriesId = null;
        seriesColumn =
            blinkHighchartConfigUtil.findSeriesColumnFromContext(chartModel, context);
        expect(seriesColumn.getGuid()).toEqual('c1');
    });

    it("should shuffle colors for legend size is more than 49", function () {
        var legendSize = 50,
            randomizationIdx = 3,
            usedColors,
            mockAllColors = [];

        for(var i = 0; i < 56; i++){
            mockAllColors.push(i);
        }

        var colors = blinkHighchartConfigUtil.getColors(mockAllColors, legendSize, usedColors, randomizationIdx);
        expect(colors.length).toEqual(56);
        expect(colors[0]).toEqual(mockAllColors[3]);
        expect(colors[1]).toEqual(mockAllColors[11]);
        expect(colors[5]).toEqual(mockAllColors[43]);
    });

    it("should shuffle and remove used color", function () {
        var legendSize = 50,
            randomizationIdx = 3,
            usedColors = [0],
            mockAllColors = [];

        for(var i = 0; i < 56; i++){
            mockAllColors.push(i);
        }

        var colors = blinkHighchartConfigUtil.getColors(
            mockAllColors,
            legendSize,
            usedColors,
            randomizationIdx,
            true // use random colors
        );
        expect(colors.length).toEqual(55);
        expect(colors[0]).not.toEqual(0);
    });

    it('SCAL-17333 should update series with marker setting based on data', function() {
        var allSeries = [
            {
                data: [1, 2, 3]
            },
            {
                data: [1]
            }
        ];
        blinkHighchartConfigUtil.updateSeriesWithMarkerSettings(allSeries);
        expect(allSeries[0].marker).toBe(void 0);
        expect(allSeries[1].marker.enabled).toBe(true);
    });

    // In case of xAxis positioning we use this function to estimate the width which should
    // consider space used for right margin for legend and other axis etc.
    it('SCAL-18266 X axis labels overlap', function() {
        var mockConstants = {
            formatting: {
                INVERT_AXIS_MARGIN: 100
            }
        };
        var mockConfig = {
            marginRight: 300
        };
        var containerDimensions = {
            width: 1000
        };
        var estimatedWidth = blinkHighchartConfigUtil.getEstimatedXAxisWidth(
            mockConstants,
            mockConfig,
            containerDimensions
        );
        expect(estimatedWidth).toBe(600);
    });

    it('SCAL-18808 datetime labels for non uniform value distribution', function() {
        var mockCM = {
            getDataModel: function() {
                return {
                    xValueToRawValues: [
                        [
                            {
                                value: 0
                            }
                        ],
                        [
                            {
                                value: 1
                            }
                        ],
                        [
                            {
                                value: 10000
                            }
                        ],
                        [
                            {
                                value: 20000
                            }
                        ]
                    ]
                }
            },
            getXAxisLabelAt: function () {
                return 'Sample';
            },
            getXAxisColumns: function () {
                return [{
                    getTimeBucket: function () {
                        return dateUtil.timeBuckets.NO_BUCKET;
                    }
                }];
            }
        };
        var containerDimensions = {width: 100};
        var chartConfig = {};
        var constants = {
            formatting: {
                INVERT_AXIS_MARGIN: 0
            }
        };

        var ticks = blinkHighchartConfigUtil.getDateTickPositions(
            mockCM,
            containerDimensions,
            chartConfig,
            constants
        );
        expect(ticks.length).toBe(2);
        expect(ticks[0]).toBe(0);
        expect(ticks[1]).toBe(20000);
    });

    it('Date labels when only a single datelabel is present', () => {
        var mockCM = {
            getDataModel: function() {
                return {
                    xValueToRawValues: [
                        [
                            {
                                value: 0
                            }
                        ]
                    ]
                }
            },
            getXAxisLabelAt: function () {
                return 'Sample';
            },
            getXAxisColumns: function () {
                return [{
                    getTimeBucket: function () {
                        return dateUtil.timeBuckets.NO_BUCKET;
                    }
                }];
            }
        };
        var containerDimensions = {width: 100};
        var chartConfig = {};
        var constants = {
            formatting: {
                INVERT_AXIS_MARGIN: 0
            }
        };
        var ticks = blinkHighchartConfigUtil.getDateTickPositions(
            mockCM,
            containerDimensions,
            chartConfig,
            constants
        );
        expect(ticks.length).toBe(1);
        expect(ticks[0]).toBe(0);
    });
});
