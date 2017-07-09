/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Unit test for chart controller
 */

'use strict';
/* global addCustomMatchers*/
/* global xit*/

describe('ChartController', function() {
    var scope,
        _$q,
        _dataService,
        _chartUtilService,
        mockVizModel,
        mockViz;

    beforeEach(function() {
        module('blink.app');

        mockVizModel = {
            mockVizData: {
                isLastBatch: false,
                currentOffset: 0,
                data: ['some', 'data']
            },
            getId: function() { return ''; },
            getVizData: function() {
                return this.mockVizData;
            },
            hasNoData: function () {
                return !this.mockVizData.data.length;
            },
            getContainingAnswerModel: function() {
                return null;
            },
            isChartTypeSupported: function() {
                return true;
            },
            clearVisibleSeriesIds: function () {
                return true;
            },
            xAxisHasAllNullValues: function () {
                return false;
            },
            isPendingDataLoad: function () {
                return false;
            },
            getDesiredChartType: function () {
                return null;
            },
            isYAxisStackedAsPercent: function () {
                return false;
            }
        };

        mockViz = {
            init: function() {
                return true;
            },
            getModel: function() {
                return mockVizModel;
            }
        };

        inject(function($rootScope, $controller, $q, dataService, chartUtilService) {
            scope = $rootScope.$new();
            scope.viz = mockViz;
            var ctrl = $controller('ChartController', { $scope: scope });
            _$q = $q;
            _dataService = dataService;
            _chartUtilService = chartUtilService;
        });
    });

    it('should show the next link when it is not the last batch', function() {
        scope.viz = mockViz;
        expect(scope.chartPagination.canShowNext()).toBe(true);
        expect(scope.chartPagination.canShowPrev()).toBe(false);
    });

    it('should not show prev or next link when it is first and last batch', function() {
        mockVizModel.mockVizData.isLastBatch = true;
        expect(scope.chartPagination.canPaginate()).toBe(false);
    });

    it('should show prev link when it is not the first batch', function() {
        mockVizModel.mockVizData.currentOffset = 10;
        expect(scope.chartPagination.canShowPrev()).toBe(true);
    });

    it('should not get new data if isLastBatch is true in vizData', function() {
        var deferred = _$q.defer(),
            invokedServiceToFetchMoreData = false;

        mockVizModel.mockVizData.isLastBatch = true;

        _dataService.getDataForViz = function() {
            invokedServiceToFetchMoreData = true;
            return deferred.promise;
        };
        scope.fetchDataForChart(true);
        expect(invokedServiceToFetchMoreData).toBe(false);
    });

    it('should get new data if isLastBatch is false in vizData', function() {
        var invokedServiceToFetchMoreData = false,
            fetchDataCalledWithOffset = -1;

        mockVizModel.mockVizData.currentBatchSize = 20;

        _dataService.getDataForViz = function(answerModel, vizModel, params) {
            invokedServiceToFetchMoreData = true;
            fetchDataCalledWithOffset = params.offset;
            return {
                then: function (callback1, callback2) {
                    callback1({
                        isLastBatch: false,
                        currentOffset: params.offset,
                        data: []
                    });
                }
            };
        };
        scope.fetchDataForChart(true);
        expect(invokedServiceToFetchMoreData).toBe(true);
        expect(fetchDataCalledWithOffset).toBe(mockVizModel.mockVizData.currentBatchSize);

        // can't yet test the prev link until we setup a way to alter _actualBatchSize, or until
        // callosum fixes the batchsize issue. Either way, it is same test as this one.
    });

    /**
     * Updates the mockVizModel to be used for the function scope.initChart
     * @param missedCols
     * @param removedVal
     */
    function updateMockVizModelForInitChart(missedCols, removedVal, xAxisColumn) {
        mockVizModel.hasError = function () {
            return false;
        };

        mockVizModel.getTitle = angular.noop;
        mockVizModel.getChartType = angular.noop;
        mockVizModel.isTimeSeries = angular.noop;
        mockVizModel.getMissingColumns = function () {
            return missedCols;
        };
        mockVizModel.didRemoveNullValuesFromData = function () {
            return removedVal;
        };
        mockVizModel.getXAxisColumns = function () {
            return [xAxisColumn];
        };

    }

    xit('should create info banner for all null x-axis values', function () {
        scope.tile = {
            setTitle: angular.noop
        };
        scope.render = angular.noop;

        expect(scope.infoBanners).toBeFalsy();

        updateMockVizModelForInitChart(null, null, {
            getName: function () {
                return 'mockCol';
            }
        });

        mockVizModel.xAxisHasAllNullValues = function () {
            return true;
        };

        scope.initChart();
        expect(scope.infoBanners).toBeTruthy();
        expect(scope.infoBanners[4]).toBeTruthy();
        expect(scope.infoBanners[4].messageText).toMatch(
            'A chart could not be drawn because column \'mockCol\' values are empty.');
    });

    xit('should create info banner for missing columns', function () {
        scope.tile = {
            setTitle: angular.noop
        };
        scope.render = angular.noop;

        expect(scope.infoBanners).toBeFalsy();

        updateMockVizModelForInitChart([{
            getName: function () {
                return 'mockCol';
            }
        }], false);

        scope.initChart();
        expect(scope.infoBanners).toBeTruthy();
        expect(scope.infoBanners[1]).toBeTruthy();
        expect(scope.infoBanners[1].messageText).toMatch(
            'Column \'mockCol\' is excluded to make the chart easier to understand.');
    });

    xit('should create info banner for removing x-axis values', function () {
        scope.tile = {
            setTitle: angular.noop
        };
        scope.render = angular.noop;

        expect(scope.infoBanners).toBeFalsy();

        updateMockVizModelForInitChart([], true);

        scope.initChart();
        expect(scope.infoBanners).toBeTruthy();
        expect(scope.infoBanners[2]).toBeTruthy();
        expect(scope.infoBanners[2].messageText).toMatch('Empty data values are excluded from the chart.');
    });

    xit('should create info banner for non-desired chart type', function () {
        scope.tile = {
            setTitle: angular.noop
        };
        scope.render = angular.noop;

        expect(scope.infoBanners).toBeFalsy();

        updateMockVizModelForInitChart([{
            getName: function () {
                return 'mockCol';
            }
        }], false);

        mockVizModel.getChartType = function () {
            return 'final chart type';
        };

        mockVizModel.getDesiredChartType = function () {
            return 'desired chart type';
        };

        scope.initChart();
        expect(scope.infoBanners).toBeTruthy();
        expect(scope.infoBanners[7]).toBeTruthy();
        expect(scope.infoBanners[7].messageText).toMatch('Desired chart type chart could not be shown because the current data does not support it.');
    });
});

