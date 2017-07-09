/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for viz context menu operations
 */

'use strict';

/* eslint camelcase: 1 */

/* global addCustomMatchers*/
describe('Viz context menu util', function () {
    var basePath = getBasePath(document.currentScript.src);
    var getInputForChartContextMenu,
        vizContextMenuUtil,
        mockChartModel,
        VisualizationModel,
        VisualizationColumnModel, ChartContextMenuInputPoint;

    var mockDataFormatter = function () {
        return function (v) {
            return v;
        };
    };

    function noColumnsGetter() {
        return [];
    }

    // To be used in toBeListOf matcher.
    function areTransformationsEqual(t1, t2) {
        return t1.transformation === t2.transformation &&
            t1.column_guid === t2.column_guid &&
            t1.op === t2.op &&
            t1.value === t2.value;
    }

    beforeEach(addCustomMatchers());

    beforeEach(function(done) {
        module('blink.app');
        mock(basePath, './viz-context-menu-util', {
            getVizContextMenuItems: jasmine.createSpy().and.returnValue({})
        });
        freshImport(basePath, './chart-context-menu-util').then(function(module) {
            getInputForChartContextMenu = module.getInputForChartContextMenu;
            ChartContextMenuInputPoint = module.ChartContextMenuInputPoint;
            inject(function($injector) {
                vizContextMenuUtil = $injector.get('vizContextMenuUtil');
                VisualizationModel = $injector.get('VisualizationModel');
                VisualizationColumnModel = $injector.get('VisualizationColumnModel');
                var session = $injector.get('session');
                /* global spyOnSessionTimezone */
                spyOnSessionTimezone(session);

                var dateUtil = $injector.get('dateUtil');
                dateUtil.initialize();
                done();
            });
        });
    });

    it('should define order for all the defined items', function() {
        let all = Object.keys(vizContextMenuUtil.VizContextMenuOptionType).sort();
        let orderArray = vizContextMenuUtil.VizContextMenuItemsOrder.sort();
        expect(all).toEqual(orderArray);
    });

    it('should not be allowed due to invalid data', function () {

        function verifyNotAllowed() {
            expect(vizContextMenuUtil.isVizContextMenuAllowedOnData(contextMenuParams.unfilteredColumns && contextMenuParams.unfilteredColumns.map('column')))
                .toBeFalsy();
        }

        var contextMenuParams = {
            unfilteredColumns: []
        };

        verifyNotAllowed();

        contextMenuParams = {
            columnValuePairs: ['foo']
        };

        verifyNotAllowed();

        contextMenuParams = {
            columnValuePairs: [],
            unfilteredColumns: []
        };

        verifyNotAllowed();

        // Now test growth
        contextMenuParams = {
            columnValuePairs: ['foo'],
            unfilteredColumns: [{
                column: {
                    isGrowth: function () {
                        return true;
                    }
                }
            }]
        };

        verifyNotAllowed();
    });

    it('should be allowed to drill and give correct transformations', function () {
        mockChartModel = {};
        var yColumn = {
            getGuid: function () { return 'YID='; },
            isAttribute: function () { return false; },
            hasAggregateOverride: angular.noop,
            isGrowth: angular.noop,
            isFormula: angular.noop,
            getDataFormatter: mockDataFormatter,
            getId: function() { return 'YID'; },
            getSageOutputColumnId: function() { return 'YID'; }
        };
        angular.extend(mockChartModel, {
            getYAxisColumns: function () {
                return [yColumn];
            },
            getXAxisColumns: function () {
                return [{
                    getGuid: function () { return 'XID='; },
                    isAttribute: function () { return true; },
                    getSageOutputColumnId: angular.noop,
                    isDateColumn: angular.noop,
                    isDateTimeColumn: angular.noop,
                    convertValueToSageValue: function (v) { return v; },
                    getDataFormatter: mockDataFormatter
                }];
            },

            getRadialColumn: angular.noop,
            getLegendColumns: noColumnsGetter,
            getCategoryColumnNotOnAxis: angular.noop,
            getRawXAxisValues: function(x) {
                return ['foo'];
            },
            getRawYAxisValueForColumn: function(y,column) {
                return y;
            },
            getRawLegendValues: function() {
                return [];
            },
            isYColumnGroupedByLegendColumns: function(col) {
                return true;
            },
            getYAxisColumnById: function() {
                return yColumn;
            }
        });

        var clickedPoint = {
            x: 0,
            y: 0,
            series: {
                userOptions: {
                    valueColumnIdentifier: 'YID'
                }
            }
        };
        var selectedPoints = [];
        var chartContextMenuInput = getInputForChartContextMenu(
            mockChartModel,
            clickedPoint,
            selectedPoints,
            false // isChasmTrap
        );

        expect(vizContextMenuUtil.isVizContextMenuAllowedOnData(
            chartContextMenuInput.clickedPoint.unfilteredValues.map('column'))
        ).toBeTruthy();

        var transformations = vizContextMenuUtil.createQueryTransformations(
            chartContextMenuInput.clickedPoint.filteredValues,
            chartContextMenuInput.clickedPoint.unfilteredValues,
            {
                includeColumnAggregations: true
            }
        );

        expect(transformations).toBeListOf([
            sage.QueryTransform.createRemoveNonFilterPhrasesTransformation(),
            sage.QueryTransform.createRemoveAllHavingFiltersTransformation(),
            sage.QueryTransform.createAddColumnTransformation({
                serializedColumn: 'YID=',
                prepend: true
            }),
            sage.QueryTransform.createRemoveAllFilterTransformation({
                serializedColumn: 'XID='
            }),
            sage.QueryTransform.createAddInFilterTransformation({
                serializedColumn: 'XID=',
                value: 'foo'
            })
        ], areTransformationsEqual);
    });

    it('should be allowed to drill on unique count and give correct transformations', function () {
        mockChartModel = {};
        var yColumn = {
            getGuid: function () { return 'YID='; },
            isAttribute: function () { return false; },
            hasAggregateOverride: function(){ return true;},
            isGrowth: angular.noop,
            isFormula: angular.noop,
            getDataFormatter: mockDataFormatter,
            getId: function() { return 'YID'; },
            getSageOutputColumnId: function() { return 'YID'; },
            getEffectiveAggregateType: function () {return 'COUNT_DISTINCT'}
        };
        angular.extend(mockChartModel, {
            getYAxisColumns: function () {
                return [yColumn];
            },
            getXAxisColumns: function () {
                return [{
                    getGuid: function () { return 'XID='; },
                    isAttribute: function () { return true; },
                    getSageOutputColumnId: angular.noop,
                    isDateColumn: angular.noop,
                    isDateTimeColumn: angular.noop,
                    convertValueToSageValue: function (v) { return v; },
                    getDataFormatter: mockDataFormatter
                }];
            },

            getRadialColumn: angular.noop,
            getLegendColumns: noColumnsGetter,
            getCategoryColumnNotOnAxis: angular.noop,
            getRawXAxisValues: function(x) {
                return ['foo'];
            },
            getRawYAxisValueForColumn: function(y,column) {
                return y;
            },
            getRawLegendValues: function() {
                return [];
            },
            isYColumnGroupedByLegendColumns: function(col) {
                return true;
            },
            getYAxisColumnById: function() {
                return yColumn;
            }
        });

        var clickedPoint = {
            x: 0,
            y: 0,
            series: {
                userOptions: {
                    valueColumnIdentifier: 'YID'
                }
            }
        };
        var selectedPoints = [];
        var chartContextMenuInput = getInputForChartContextMenu(
            mockChartModel,
            clickedPoint,
            selectedPoints
        );

        expect(vizContextMenuUtil.isVizContextMenuAllowedOnData(
            chartContextMenuInput.clickedPoint.unfilteredValues.map('column'))
        ).toBeTruthy();

        var transformations = vizContextMenuUtil.createQueryTransformations(
            chartContextMenuInput.clickedPoint.filteredValues,
            chartContextMenuInput.clickedPoint.unfilteredValues,
            {
                includeColumnAggregations: true
            }
        );
        expect(transformations[2].aggregation).toBe(2);
    });

    it('should add additional transformations when legend is present', function () {
        var fakeColumn1 = {
                getGuid: function () { return 'XID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                hasAggregateOverride: angular.noop,
                isAttribute: function () { return false; },
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter,
                getId: function () { return 'xid'; }
            },
            fakeColumn2 = {
                getGuid: function () { return 'YID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                isAttribute: function () { return true; },
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter,
                getId: function() { return 'YID'; }
            },
            fakeColumn3 = {
                getGuid: function () { return 'ZID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isAttribute: function () { return true; },
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter
            };

        mockChartModel = {};
        angular.extend(mockChartModel, {
            getYAxisColumns: function () {
                return [fakeColumn1];
            },
            getXAxisColumns: function () {
                return [fakeColumn2];
            },
            getLegendColumns: function () {
                return [fakeColumn3];
            },
            getRadialColumn: angular.noop,
            getCategoryColumnNotOnAxis: angular.noop,
            getContainingAnswerModel: angular.noop,
            getRawXAxisValues: function() {
                return [null];
            },
            getRawYAxisValueForColumn: function(y) {
                return y;
            },
            getRawLegendValues: function() {
                return ['legend'];
            },
            isYColumnGroupedByLegendColumns: function(col) {
                return true;
            },
            getYAxisColumnById: function() {
                return fakeColumn1;
            }
        });

        var clickedPoint = {
            x: 0,
            y: 0,
            series: {
                userOptions: {
                    valueColumnIdentifier: 'XID',
                    blinkSeriesId: 'legend'
                }
            }
        };
        var selectedPoints = [];
        var chartContextMenuInput = getInputForChartContextMenu(
            mockChartModel,
            clickedPoint,
            selectedPoints
        );

        expect(vizContextMenuUtil.isVizContextMenuAllowedOnData(
            chartContextMenuInput.clickedPoint.unfilteredValues.map('column')
        )).toBeTruthy();

        var transformations = vizContextMenuUtil.createQueryTransformations(
            chartContextMenuInput.clickedPoint.filteredValues,
            chartContextMenuInput.clickedPoint.unfilteredValues,
            {
                includeColumnAggregations: true
            }
        );

        expect(transformations).toBeListOf([
            sage.QueryTransform.createRemoveNonFilterPhrasesTransformation(),
            sage.QueryTransform.createRemoveAllHavingFiltersTransformation(),
            sage.QueryTransform.createAddColumnTransformation({
                serializedColumn: 'XID=',
                prepend: true
            }),
            sage.QueryTransform.createRemoveAllFilterTransformation({
                serializedColumn: 'YID='
            }),
            sage.QueryTransform.createAddInFilterTransformation({
                serializedColumn: 'YID=',
                value: '{Null}'
            }),
            sage.QueryTransform.createRemoveAllFilterTransformation({
                serializedColumn: 'ZID='
            }),
            sage.QueryTransform.createAddInFilterTransformation({
                serializedColumn: 'ZID=',
                value: 'legend'
            })
        ], areTransformationsEqual);
    });

    it('should not add additional transformations when legend is present and column is not' +
        ' grouped by legend', function () {
        var fakeColumn1 = {
                getGuid: function () { return 'XID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                hasAggregateOverride: angular.noop,
                isAttribute: function () { return false; },
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter,
                getId: function () { return 'xid'; }
            },
            fakeColumn2 = {
                getGuid: function () { return 'YID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                isAttribute: function () { return true; },
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter,
                getId: function() { return 'YID'; }
            },
            fakeColumn3 = {
                getGuid: function () { return 'ZID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isAttribute: function () { return true; },
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter
            };

        mockChartModel = {};
        angular.extend(mockChartModel, {
            getYAxisColumns: function () {
                return [fakeColumn1];
            },
            getXAxisColumns: function () {
                return [fakeColumn2];
            },
            getLegendColumns: function () {
                return [fakeColumn3];
            },
            getRadialColumn: angular.noop,
            getCategoryColumnNotOnAxis: angular.noop,
            getContainingAnswerModel: angular.noop,
            getRawXAxisValues: function() {
                return [null];
            },
            getRawYAxisValueForColumn: function(y) {
                return y;
            },
            getRawLegendValues: function() {
                return ['legend'];
            },
            isYColumnGroupedByLegendColumns: function(col) {
                return false;
            },
            getYAxisColumnById: function () {
                return fakeColumn1;
            }
        });

        var clickedPoint = {
            x: 0,
            y: 0,
            series: {
                userOptions: {
                    valueColumnIdentifier: 'XID',
                    blinkSeriesId: 'legend'
                }
            }
        };
        var selectedPoints = [];
        var chartContextMenuInput = getInputForChartContextMenu(
            mockChartModel,
            clickedPoint,
            selectedPoints
        );

        expect(vizContextMenuUtil.isVizContextMenuAllowedOnData(
            chartContextMenuInput.clickedPoint.unfilteredValues.map('column')
        )).toBeTruthy();

        var transformations = vizContextMenuUtil.createQueryTransformations(
            chartContextMenuInput.clickedPoint.filteredValues,
            chartContextMenuInput.clickedPoint.unfilteredValues,
            {
                includeColumnAggregations: true
            }
        );

        expect(transformations).toBeListOf([
            sage.QueryTransform.createRemoveNonFilterPhrasesTransformation(),
            sage.QueryTransform.createRemoveAllHavingFiltersTransformation(),
            sage.QueryTransform.createAddColumnTransformation({
                serializedColumn: 'XID=',
                prepend: true
            }),
            sage.QueryTransform.createRemoveAllFilterTransformation({
                serializedColumn: 'YID='
            }),
            sage.QueryTransform.createAddInFilterTransformation({
                serializedColumn: 'YID=',
                value: '{Null}'
            }),
        ], areTransformationsEqual);
    });

    it('should show values for all columns if multiple columns are selected on any axis', function () {
        var fakeColumn1 = {
                getGuid: function () { return 'XID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                hasAggregateOverride: angular.noop,
                isAttribute: function () { return false; },
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter,
                getId: function () { return 'xid'; }
            },
            fakeColumn2 = {
                getGuid: function () { return 'YID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                isAttribute: function () { return true; },
                hasAggregateOverride: angular.noop,
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter,
                getId: function() { return 'YID'; }
            },
            fakeColumn3 = {
                getGuid: function () { return 'ZID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                isAttribute: function () { return true; },
                hasAggregateOverride: angular.noop,
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter
            },
            fakeColumn4 = {
                getGuid: function () { return 'WID='; },
                getSageOutputColumnId: function () { return this.getGuid(); },
                isGrowth: angular.noop,
                isFormula: angular.noop,
                isDateColumn: angular.noop,
                isDateTimeColumn: angular.noop,
                isAttribute: function () { return true; },
                hasAggregateOverride: angular.noop,
                convertValueToSageValue: function (v) { return v; },
                getDataFormatter: mockDataFormatter
            };

        mockChartModel = {};
        angular.extend(mockChartModel, {
            getYAxisColumns: function () {
                return [fakeColumn1];
            },
            getXAxisColumns: function () {
                return [fakeColumn2, fakeColumn3];
            },
            getLegendColumns: function () {
                return [fakeColumn4];
            },
            getRadialColumn: angular.noop,
            getCategoryColumnNotOnAxis: angular.noop,
            getRawXAxisValues: function() {
                return ['foo', 'bar'];
            },
            getRawYAxisValueForColumn: function(y,column) {
                return y;
            },
            getRawLegendValues: function() {
                return ['legend'];
            },
            isYColumnGroupedByLegendColumns: function(col) {
                return true;
            },
            getYAxisColumnById: function () {
                return fakeColumn1;
            }
        });

        var clickedPoint = {
            x: 0,
            y: 0,
            series: {
                userOptions: {
                    valueColumnIdentifier: 'XID',
                    blinkSeriesId: 'legend'
                }
            }
        };
        var selectedPoints = [];
        var chartContextMenuInput = getInputForChartContextMenu(
            mockChartModel,
            clickedPoint,
            selectedPoints
        );

        expect(vizContextMenuUtil.isVizContextMenuAllowedOnData(
            chartContextMenuInput.clickedPoint.unfilteredValues.map('column')
        )).toBeTruthy();

        var transformations = vizContextMenuUtil.createQueryTransformations(
            chartContextMenuInput.clickedPoint.filteredValues,
            chartContextMenuInput.clickedPoint.unfilteredValues,
            {
                includeColumnAggregations: true
            }
        );

        expect(transformations).toBeListOf([
            sage.QueryTransform.createRemoveNonFilterPhrasesTransformation(),
            sage.QueryTransform.createRemoveAllHavingFiltersTransformation(),
            sage.QueryTransform.createAddColumnTransformation({
                serializedColumn: 'XID=',
                prepend: true
            }),
            sage.QueryTransform.createRemoveAllFilterTransformation({
                serializedColumn: 'YID='
            }),
            sage.QueryTransform.createAddInFilterTransformation({
                serializedColumn: 'YID=',
                value: 'foo'
            }),
            sage.QueryTransform.createRemoveAllFilterTransformation({
                serializedColumn: 'ZID='
            }),
            sage.QueryTransform.createAddInFilterTransformation({
                serializedColumn: 'ZID=',
                value: 'bar'
            }),
            sage.QueryTransform.createRemoveAllFilterTransformation({
                serializedColumn: 'WID='
            }),
            sage.QueryTransform.createAddInFilterTransformation({
                serializedColumn: 'WID=',
                value: 'legend'
            })
        ], areTransformationsEqual);
    });

    it('should disable leaf level data option if all columns involved in the drill are formulae', function(){
        var vizModel = {
            isMissingUnderlyingDataAccess: function () {
                return false;
            }
        };
        function getColumnValuePair(isFormula) {
            return {
                column: {
                    isFormula: function () {
                        return isFormula;
                    },
                    isGrowth: function() {
                        return false;
                    }
                }
            };
        }

        var shouldShow;
        var contextMenuInputPoint = new ChartContextMenuInputPoint();
        contextMenuInputPoint.unfilteredValues.push(getColumnValuePair(false));
        shouldShow = vizContextMenuUtil.getContextMenuItemEnablity(
            vizModel,
            vizContextMenuUtil.VizContextMenuOptionType.LEAF_LEVEL,
            contextMenuInputPoint,
            [],
            false // is chasmTrap
        ).enabled;
        expect(shouldShow).toBe(true);

        contextMenuInputPoint = new ChartContextMenuInputPoint();
        contextMenuInputPoint.unfilteredValues.push(getColumnValuePair(false));
        contextMenuInputPoint.filteredValues.push(getColumnValuePair(true));
        shouldShow = vizContextMenuUtil.getContextMenuItemEnablity(
            vizModel,
            vizContextMenuUtil.VizContextMenuOptionType.LEAF_LEVEL,
            contextMenuInputPoint,
            [],
            false // is chasmTrap
        ).enabled;
        expect(shouldShow).toBe(true);

        contextMenuInputPoint = new ChartContextMenuInputPoint();
        contextMenuInputPoint.unfilteredValues.push(getColumnValuePair(true));
        contextMenuInputPoint.filteredValues.push(getColumnValuePair(true));
        shouldShow = vizContextMenuUtil.getContextMenuItemEnablity(
            vizModel,
            vizContextMenuUtil.VizContextMenuOptionType.LEAF_LEVEL,
            contextMenuInputPoint,
            [],
            false // is chasmTrap
        ).enabled;
        expect(shouldShow).toBe(false);

    });

    function generateDateFilterValues(dateStrings) {
        return dateStrings.map(function (dateString) {
            return {
                getKey: function() {
                    return (new Date(dateString)).getTime() / 1000;
                }
            };
        });
    }

    describe('should clamp date bucket boundaries based on existing date filters', function () {
        mockChartModel = {};
        var mockDateColumn, weekStartDateString, dateFilterValues, filterOperator;
        var mockFilterModel = {
                getColumn: function () {
                    return mockDateColumn;
                },
                getFilterRows: function () {
                    var mockRow = {
                        getOperator: function () {
                            return filterOperator;
                        },
                        getValues: function () {
                            return generateDateFilterValues(dateFilterValues);
                        }
                    };
                    return [mockRow];
                }
            },
            mockAnswersheetModel = {
                getFilterModelByColumn: function () {
                    return mockFilterModel;
                }
            },
            mockAnswerModel = {
                getCurrentAnswerSheet: function () {
                    return mockAnswersheetModel;
                }
            };

        beforeEach(function () {
            mockDateColumn = new VisualizationColumnModel({
                "sortAscending":true,
                "sortIndex":0,
                "isUserSorted":false,
                "aggrTypeOverride":"NONE",
                "typeOverride":"UNKNOWN",
                "dataTypeOverride":"UNKNOWN",
                "formatTypeOverride":"NONE",
                "sageColumnId":"CiRmYjAyOTc4MS05MzAwLTRmYTAtOWVjOC1hZTJhNDA3NmQzODcSCk9yZGVyIERhdGUgATgAQABIAlomCiQyNDQ1ZmU4MS0zMGQ2LTQ2ZmEtOWY0Mi1mNmIxYjRlMDE2MjM",
                "bucketization":"ABS_WEEK_AS_EPOCH",
                "baseDataType":"DATE",
                "baseType":"ATTRIBUTE",
                "baseAggrType":"NONE",
                "defaultAggrType":"NONE",
                "effectiveAggrType":"NONE",
                "effectiveDataType":"DATE",
                "effectiveType":"ATTRIBUTE",
                "formatPattern":"ww yyyy"
            }, -1);

            var yAxisColumn = {
                getGuid: function () { return 'yGuid'; },
                getSageOutputColumnId: angular.noop,
                hasAggregateOverride: angular.noop,
                isGrowth: angular.noop,
                isFormula: angular.noop,
                getDataFormatter: mockDataFormatter,
                isAttribute: function() { return false; },
                getId: function() { return 'YID'; }
            };

            mockChartModel = {
                getYAxisColumns: function () {
                    return [yAxisColumn];
                },
                getXAxisColumns: function () {
                    return [mockDateColumn];
                },

                getRadialColumn: angular.noop,
                getLegendColumns: noColumnsGetter,
                getCategoryColumnNotOnAxis: angular.noop,
                getRawXAxisValues: function(x) {
                    return [(new Date(weekStartDateString)).getTime()];
                },
                getRawYAxisValueForColumn:function(y) { return y;},
                getRawLegendValues: function() {
                    return [];
                },
                isYColumnGroupedByLegendColumns: function() {
                    return true;
                },
                getYAxisColumnById: function() {
                    return yAxisColumn;
                }
            };
        });

        var testCases = [
            {
                input: {
                    weekStartingAt: '01/06/1992',
                    dateFilterValues: ['01/07/1992', '01/31/1992'],
                    filterOperator: 8
                },
                expectedOutput: {
                    totalTransforms: 5,
                    dateFilterTransformIndex: 4,
                    dateTransformBoundaryValues: ['01/07/1992', '01/12/1992']
                }
            },
            {
                input: {
                    weekStartingAt: '01/06/1992',
                    dateFilterValues: ['01/07/1992', '01/09/1992'],
                    filterOperator: 8
                },
                expectedOutput: {
                    totalTransforms: 5,
                    dateFilterTransformIndex: 4,
                    dateTransformBoundaryValues: ['01/07/1992', '01/09/1992']
                }
            },
            {
                input: {
                    weekStartingAt: '01/06/1992',
                    dateFilterValues: ['01/01/1992', '01/31/1992'],
                    filterOperator: 8
                },
                expectedOutput: {
                    totalTransforms: 5,
                    dateFilterTransformIndex: 4,
                    dateTransformBoundaryValues: ['01/06/1992', '01/12/1992']
                }
            }
        ];

        function addTestCase(testCase, i) {
            it('for case {1}'.assign(i), function () {
                weekStartDateString = testCase.input.weekStartingAt;
                dateFilterValues = testCase.input.dateFilterValues;
                filterOperator = testCase.input.filterOperator;

                var clickedPoint = {
                    x: 0,
                    y: 0,
                    series: {
                        userOptions: {
                            valueColumnIdentifier: 'XID',
                            blinkSeriesId: 0
                        }
                    }
                };
                var selectedPoints = [];
                var chartContextMenuInput = getInputForChartContextMenu(
                    mockChartModel,
                    clickedPoint,
                    selectedPoints
                );

                var transformations = vizContextMenuUtil.createQueryTransformations(
                    chartContextMenuInput.clickedPoint.filteredValues,
                    chartContextMenuInput.clickedPoint.unfilteredValues,
                    {
                        includeColumnAggregations: true,
                        answerModel: mockAnswerModel
                    }
                );

                expect(transformations.length).toBe(testCase.expectedOutput.totalTransforms);
                expect(areTransformationsEqual(transformations[testCase.expectedOutput.dateFilterTransformIndex - 1],
                    sage.QueryTransform.createRemoveAllDateRangeFilterTransformation({
                        serializedColumn: 'guid'
                    }))).toBeTruthy();
                expect(areTransformationsEqual(transformations[testCase.expectedOutput.dateFilterTransformIndex],
                    sage.QueryTransform.createAddPredicateFilterTransformation({
                        serializedColumn: 'guid',
                        op: sage.CompareType.BW_INC,
                        value1: testCase.expectedOutput.dateTransformBoundaryValues[0],
                        value2: testCase.expectedOutput.dateTransformBoundaryValues[1]
                    }))).toBeTruthy();
            });
        }

        testCases.forEach(function (testCase, i) {
            addTestCase(testCase, i);
        });
    });
});
