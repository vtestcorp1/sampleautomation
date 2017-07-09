/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Tests for geo data processor
 */

'use strict';

describe('Geo Data Processor', function () {
    var GeoDataProcessor,
        chartTypeSpecificationService,
        jsonConstants,
        mockGeoData,
        GeoConfig,
        commonChartModel;

    function labelFormatter(value, seriesIndex) {
        return value + '';
    }

    beforeEach(function () {
        module('blink.app');

        /* eslint camelcase: 1 */
        inject(function (_GeoDataProcessor_, _chartTypeSpecificationService_, _jsonConstants_, _GeoConfig_) {
            GeoDataProcessor = _GeoDataProcessor_;
            chartTypeSpecificationService = _chartTypeSpecificationService_;
            jsonConstants = _jsonConstants_;
            GeoConfig = _GeoConfig_;

            mockGeoData = {
                geoConfig: new GeoConfig({type: jsonConstants.geoConfigType.ADMIN_DIV_1}),
                labelFormatters: {
                    x: function (xValue, seriesIndex) {
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
        });

        commonChartModel = {
            getChartType: jasmine.createSpy().and.returnValue(
                chartTypeSpecificationService.chartTypes.GEO_AREA
            ),
            getSeriesColors: jasmine.createSpy(),
            getMultiColorSeriesColors: jasmine.createSpy(),
            getXAxisColumnsHash: jasmine.createSpy(),
        };

    });

    it('should process data correctly', function(){
        var processor = new GeoDataProcessor(commonChartModel);
        processor.setData(mockGeoData);

        expect(processor.hasData()).toBe(true);

        expect(processor.isGeoConfigOfType(jsonConstants.geoConfigType.ADMIN_DIV_1)).toBe(true);
        expect(processor.isGeoConfigOfType(jsonConstants.geoConfigType.ZIP_CODE)).toBe(false);

        expect(processor.getFormattedXValue({x: 0})).toBe('CA');
        expect(processor.getFormattedXValue({x: 1})).toBe('HI');

        expect(processor.getFormattedYValue({y: 10})).toBe('10');

        expect(processor.getSeriesForDataPoint({seriesIndex: 0})).toEqual(mockGeoData.series[0]);
    });

    it('should update series visibility', function(){
        var processor = new GeoDataProcessor(commonChartModel);
        processor.setData(mockGeoData);

        expect(mockGeoData.series[0].visible).toBe(true);
        processor.setSeriesVisibility(mockGeoData.series[0], false);
        expect(mockGeoData.series[0].visible).toBe(false);
    });
});
