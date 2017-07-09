/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Tests for Geo Maps
 */

'use strict';

describe('Geo Maps', function() {
    var GeoMapComponent,
        mockMapConfig,
        mockMapData,
        chartTypeSpecificationService,
        jsonConstants,
        MockGeoDataProcessor,
        GeoConfig;
    var basePath = getBasePath(document.currentScript.src);

    function labelFormatter(value, seriesIndex) {
        return value + '';
    }

    beforeEach(function(done) {
        module('blink.app');
        MockGeoDataProcessor = function(geoConfig) {
            this.geoConfig = geoConfig;
        };
        MockGeoDataProcessor.prototype = {
            setSeriesVisibility: angular.noop,
            getGeoConfig: function() {
                return this.geoConfig;
            },
            setData: function(data) {
                this.data = data;
            },
            getAllSeries: function() {
                return this.data ? this.data.series : null;
            },
            getFormattedYValue: function() {
                return {
                    value: 'Formatted Y value'
                };
            }
        };
        mock(basePath, '../base/geo-data-processor', {
            GeoDataProcessor: MockGeoDataProcessor
        });

        freshImport(basePath, './blink-geo-map')
            .then(function(module) {
                GeoMapComponent = module.default;
            }).then(function() {
                /* eslint camelcase: 1 */
                inject(function(_chartTypeSpecificationService_, _jsonConstants_, _GeoConfig_) {

                    chartTypeSpecificationService = _chartTypeSpecificationService_;
                    jsonConstants = _jsonConstants_;
                    GeoConfig = _GeoConfig_;

                    mockMapConfig = {
                        container: $('body'),
                        chartModel: {
                            getChartType: jasmine.createSpy().and.returnValue(
                                chartTypeSpecificationService.chartTypes.GEO_AREA
                            ),
                            isDataLabelsEnabled: jasmine.createSpy().and.returnValue(false)
                        },
                        onLoad: angular.noop,
                        onRightClick: angular.noop
                    };

                    mockMapData = {
                        geoConfig: new GeoConfig({type: jsonConstants.geoConfigType.ADMIN_DIV_1}),
                        labelFormatters: {
                            x: function(xValue, seriesIndex) {
                                return ['CA', 'HI'][xValue];
                            },
                            y: labelFormatter,
                            z: labelFormatter
                        },
                        series: [{
                            visible: true,
                            data: [{
                                x: 0,
                                y: 10
                            }, {
                                x: 1,
                                y: 20
                            }]
                        }],
                        geoObjects: []
                    };
                    done();
                });
            });

        spyOn(MockGeoDataProcessor.prototype, 'setSeriesVisibility');
    });

    it('should initialize correctly', function() {
        var geoMap = new GeoMapComponent(mockMapConfig);

        geoMap.redraw = angular.noop;

        expect(geoMap.getSeries()).toBe(null);
        geoMap.setData(mockMapData);
        expect(geoMap.getSeries()).toBeTruthy();
    });

    it('should set series visibility', function() {
        var geoMap = new GeoMapComponent(mockMapConfig);

        expect(mockMapData.series[0].visible).toBe(true);
        geoMap.setSeriesVisibility(mockMapData.series[0], false);
        expect(MockGeoDataProcessor.prototype.setSeriesVisibility).toHaveBeenCalledWith(
            mockMapData.series[0],
            false
        );
    });

    it('should only show color scale for valid range', function(done) {
        var geoMap = new GeoMapComponent(mockMapConfig);
        geoMap.getTopologyData = jasmine.createSpy().and.returnValue(Promise.resolve());
        geoMap.redrawFeatures = jasmine.createSpy();
        geoMap.forceRender = jasmine.createSpy();

        geoMap.setData({
            series: [
                {isRangeValid: true}
            ]
        }).then(() => {
            expect(geoMap.colorScaleCtrl).toBeTruthy();
        }).then(() => {
            return geoMap.setData({
                series: [
                    {isRangeValid: false}
                ]
            });
        }).then(() => {
            expect(geoMap.colorScaleCtrl).toBeFalsy();
            done();
        });
    });
});
