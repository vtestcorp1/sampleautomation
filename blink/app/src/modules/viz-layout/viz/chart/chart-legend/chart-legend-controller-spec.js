/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit test for chart legend controller
 */

'use strict';
/* global addCustomMatchers*/
/* global xit*/
describe('Chart controller Legend ', function () {
    var scope,
        _$q,
        _$timeout,
        _chartUtilService,
        _events,
        mockVizModel,
        mockViz,
        mockHC,
        series;

    function range(start, num) {
        var r = [];
        for (var i = start; i < start + num; ++i) {
            r.push(i);
        }
        return r;
    }

    beforeEach(function() {
        module('blink.app');

        inject(function($rootScope, $controller, $q, $timeout, chartUtilService, events) {
            scope = $rootScope.$new();

            scope.viz = {};
            scope.tile = {
                setTitle: function () {
                }
            };
            scope.render = function () { };

            var LEGEND_CARDINALITY = 100;
            series = [];
            mockVizModel = {
                getLegendColumn: function () {
                    return {
                        getName: function () {
                            return 'legend';
                        },
                        getCardinality: function () {
                            return LEGEND_CARDINALITY;
                        }
                    };
                },
                getLegendColumns: jasmine.createSpy().and.returnValue([]),
                getLegendCardinality: function() {
                    return LEGEND_CARDINALITY;
                },
                getLegendColumnValues: function () {
                    return range(0, LEGEND_CARDINALITY);
                },
                getTitle: angular.noop,
                setVisibleSeriesIds: angular.noop,
                isYAxisShared: angular.noop,
                _xAxisExtremes: null,
                _yAxisExtremes: null,
                getXAxisExtremes: function () {
                    return this._xAxisExtremes;
                },
                getYAxisExtremes: function () {
                    return this._yAxisExtremes;
                },
                setAxisExtremes: function (xAxisExtremes, yAxisExtremes) {
                    this._xAxisExtremes = xAxisExtremes;
                    this._yAxisExtremes = yAxisExtremes;
                },
                getYAxisColumns: jasmine.createSpy().and.returnValue([]),
                getSeries: function () {
                    return series;
                }
            };

            mockViz = {
                getModel: function() {
                    return mockVizModel;
                }
            };
            scope.viz = mockViz;

            scope.getVizModel = function () {return mockVizModel;};

            mockHC = {
                addSeries: jasmine.createSpy(),
                series: [],
                getSeries: function () {
                    return this.series;
                },
                redraw: angular.noop,
                setSeriesVisibility: jasmine.createSpy(),
                updateSeriesColor: jasmine.createSpy(),
                updateSeries: jasmine.createSpy()
            };
            scope.getChart = function () {
                return mockHC;
            };

            var ctrl = $controller('ChartLegendController', { $scope: scope });
            _$q = $q;
            _$timeout = $timeout;
            _chartUtilService = chartUtilService;
            _events = events;
        });
    });

    xit('should initialize legend', function () {
        expect(scope.scrollConfig).not.toBeNull();
    });

    xit('should initialize legend with chart info', function () {
        expect(scope.infoBanners).toBeFalsy();
        scope.chart = {
            series: []
        };
        mockVizModel.getSeries = function () {
            return [1];
        };
        scope.initLegend(true);
        expect(scope.infoBanners).toBeTruthy();
        expect(scope.infoBanners[0]).toBeTruthy();

        // The following lines have been commented because we are now not giving the user the option to see
        // all results due to performance issue. In future, uncomment these if you show this again.
        /*expect(scope.infoBanners[0].actionLabel).toMatch('1');
         expect(scope.infoBanners[0].actionLabel).toMatch(mockVizModel.getLegendColumn().getName());

         // onActionClick, it should perform the action and then kill chart info object.
         var actionCalled = false;
         scope.infoBanners[0].action = function () {
         actionCalled = true;
         };
         scope.infoBanners[0].onActionClick();
         expect(actionCalled).toBeTruthy();
         expect(scope.infoBanners[0]).toBeFalsy();*/
    });

    // Note (sunny): this is a UI function and needs to be in test for the
    // corresponding directive
    xit('should get legend column values only in the scrollable window', function () {
        mockVizModel.getLegendColumns = function () {
            return [{}];
        };
        expect(scope.getValuesInScrollableWindow().length).toBe(30);
    });

    // Note (sunny): this is a UI function and needs to be in test for the
    // corresponding directive
    xit('should get no series color', function () {
        // no highchart object.
        expect(scope.getSeriesColor('foo')).toBe('');

        // create a mock empty highchart object
        scope.chart = {
            series: []
        };

        expect(scope.getSeriesColor('foo')).toBe('');

        // now highchart object has a series that matches but is not visible.
        scope.chart = {
            series: [{ name: 'foo' }]
        };

        expect(scope.getSeriesColor('foo')).toBe('');
    });

    // Note (sunny): this is a UI function and needs to be in test for the
    // corresponding directive
    xit('should get a series color', function () {
        // now highchart object has a series that matches but is not visible.
        scope.chart = {
            series: [{ name: 'foo', visible: true, color: 'fooColor' }]
        };

        expect(scope.getSeriesColor('foo')).toBe('fooColor');
    });

    // Note (sunny): this is a UI function and needs to be in test for the
    // corresponding directive
    xit('should add a not-added series on item click', function () {
        scope.chart = {
            series: [],
            addSeriesCalled: false,
            addSeriesCalledWithParam: null,
            addSeries: function (param) {
                this.addSeriesCalled = true;
                this.addSeriesCalledWithParam = param;
            }
        };

        angular.extend(mockVizModel, {
            getSeries: function () {
                return [{ name: 'foo' }];
            }
        });

        scope.onItemClick('foo');
        expect(scope.chart.addSeriesCalled).toBe(true);
        expect(scope.chart.addSeriesCalledWithParam).not.toBeNull();
        expect(scope.chart.addSeriesCalledWithParam.name).toBe('foo');
    });

    function getAxisExtremes(min, max) {
        return {
            min: min,
            max: max
        };
    }

    var MockAxis = function () {
        var _extremes = {};
        this.setExtremes = function (min, max) {
            _extremes.min = min;
            _extremes.max = max;
        };
        this.getExtremes = function () {
            return _extremes;
        };
    };

    var MockHighCharts = function (scope, numYAxes) {
        this.xAxis = [new MockAxis()];
        this.yAxis = [];

        for (var i=0; i<numYAxes; i++) {
            this.yAxis.push(new MockAxis());
        }

        this.redraw = function () {
            scope.viz.getModel().setAxisExtremes(this.xAxis.map('getExtremes'), this.yAxis.map('getExtremes'));
        };
    };

    // TODO(sunny): Fix this test once we have really resolved SCAL-7494. (for now we are doing overlapping bounds check)
    xit('should update chart zoom to saved value in model', function () {

        //a new chart is created
        scope.chart = new MockHighCharts(scope, 1);

        //initial zoom is setup, no user zoom present
        scope.setUpZoom();

        //user zooms and the zoom info propagates to and is save in the model
        mockVizModel.setAxisExtremes([getAxisExtremes(1, 6)], [getAxisExtremes(30, 72)]);

        //chart is redrawn, updating to the zoom from the model
        scope.setUpZoom();
        expect(scope.chart.xAxis[0].getExtremes().min).toBe(1);
        expect(scope.chart.xAxis[0].getExtremes().max).toBe(6);
        expect(scope.chart.yAxis[0].getExtremes().min).toBe(30);
        expect(scope.chart.yAxis[0].getExtremes().max).toBe(72);
    });

    // TODO(sunny): Fix this test once we have really resolved SCAL-7494. (for now we are doing overlapping bounds check)
    xit('should update chart zoom to saved value in model - multiple y-axes', function () {
        //a new chart with 2 y-axes is created
        scope.chart = new MockHighCharts(scope, 2);

        scope.setUpZoom();
        //user zooms, zoom state is propagated to and saved in the model
        mockVizModel.setAxisExtremes([getAxisExtremes(1, 6)], [getAxisExtremes(30, 72), getAxisExtremes(50, 120)]);

        //chart is redrawn, updating to the zoom from the model
        scope.setUpZoom();
        expect(scope.chart.xAxis[0].getExtremes().min).toBe(1);
        expect(scope.chart.xAxis[0].getExtremes().max).toBe(6);
        expect(scope.chart.yAxis[0].getExtremes().min).toBe(30);
        expect(scope.chart.yAxis[0].getExtremes().max).toBe(72);
        expect(scope.chart.yAxis[1].getExtremes().min).toBe(50);
        expect(scope.chart.yAxis[1].getExtremes().max).toBe(120);


        //two y-axes merged into y, model is not updated by this
        scope.chart.yAxis = scope.chart.yAxis.slice(0, 1);

        //chart is redrawn, updating to the zoom from the model
        scope.setUpZoom();
        expect(scope.chart.xAxis[0].getExtremes().min).toBe(1);
        expect(scope.chart.xAxis[0].getExtremes().max).toBe(6);
        expect(scope.chart.yAxis[0].getExtremes().min).toBe(30);
        expect(scope.chart.yAxis[0].getExtremes().max).toBe(120);

        //combined y-axis split back into two y-axes, model is not updated by this
        var newYAxis = new MockAxis();
        scope.chart.yAxis.push(newYAxis);

        //chart is redrawn, updating to the zoom from the model
        scope.setUpZoom();
        expect(scope.chart.xAxis[0].getExtremes().min).toBe(1);
        expect(scope.chart.xAxis[0].getExtremes().max).toBe(6);
        expect(scope.chart.yAxis[0].getExtremes().min).toBe(30);
        expect(scope.chart.yAxis[0].getExtremes().max).toBe(120);
        expect(scope.chart.yAxis[1].getExtremes().min).toBe(30);
        expect(scope.chart.yAxis[1].getExtremes().max).toBe(120);

    });

    it("method toggleSeriesVisibility should hide a series if visible", function () {
        var serie = {
            name: 'foo',
            hide: jasmine.createSpy(),
            show: jasmine.createSpy(),
            visible: true,
            userOptions: {
                blinkSeriesId: '123'
            }
        };
        scope.getChart().series.push(serie);
        scope.toggleSeriesVisibility('foo');
        expect(scope.getChart().setSeriesVisibility).toHaveBeenCalledWith(serie, false);
    });

    it("method toggleSeriesVisibility should add a hidden series if not added with visibility true", function () {
        var serie = {
            name: 'foo',
            userOptions: {
                blinkSeriesId: '123'
            }
        };

        series.push(serie);
        scope.toggleSeriesVisibility('foo');
        expect(serie.visible).toBeTruthy();
        expect(scope.getChart().addSeries).toHaveBeenCalledWith(serie, true);
    });

    it("method updateSeriesColor updates the color on the serie and sets in model", function () {
        var serie = {
            name: 'foo',
            userOptions: {
                blinkSeriesId: '123'
            },
            update: jasmine.createSpy(),
            color: 'blue'
        };
        mockVizModel.setSeriesColor = jasmine.createSpy();
        scope.getChart().series.push(serie);
        scope.label = 'foo';
        scope.updateSeriesColor();
        expect(scope.getChart().updateSeries).toHaveBeenCalledWith(serie, { color : 'blue' });
        expect(mockVizModel.setSeriesColor).toHaveBeenCalledWith('123','blue');
    });

});

