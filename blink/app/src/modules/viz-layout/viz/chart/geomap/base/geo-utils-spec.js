/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 */

'use strict';

describe('Geo utils', function() {

    var GeoUtils, util;

    var basePath = getBasePath(document.currentScript.src);

    beforeEach(function(done) {
        module('blink.app');
        freshImport(basePath, './geo-utils').then(function(module) {
            GeoUtils = module.GeoUtils;
            inject(function(_util_) {
                util = _util_;
                done();
            });
        });
    });

    it('should assign colors properly for geo area chart', function() {
        var chartModel =
            {
                getChartType: jasmine.createSpy().and.returnValue('GEO_AREA'),
                getMultiColorSeriesColors: jasmine.createSpy().and.returnValue({}),
                getXAxisColumnsHash: jasmine.createSpy().and.returnValue('HASH')
            },
            series = [
                {

                    blinkSeriesId: 'abc'
                }, {
                    blinkSeriesId: 'bcd'
                }
            ];
        spyOn(util, 'getRandomInteger').and.returnValue(3);

        GeoUtils.assignSeriesColors(chartModel, series);

        var assignedScale = series[0].scale,
            assignedColor = series[0].color;
        expect(assignedScale[0]).toBe('#f7f4f9');
        expect(assignedScale[assignedScale.length - 1]).toBe('#67001f');
        expect(assignedColor).toBe('#e356c5');
        assignedScale = series[1].scale;
        assignedColor = series[1].color;
        expect(assignedScale[0]).toBe('#ffffd9');
        expect(assignedScale[assignedScale.length - 1]).toBe('#081d58');
        expect(assignedColor).toBe('#1ac5db');

        chartModel.getMultiColorSeriesColors.and.returnValue({
            abc: {
                HASH: ['#f1f2f2', '#abcdef']
            }
        });
        GeoUtils.assignSeriesColors(chartModel, series);
        expect(series[0].scale).toEqual(['#f1f2f2', '#abcdef']);
    });

    it('should assign colors properly for geo area chart', function() {
        var chartModel = {
                getChartType: jasmine.createSpy().and.returnValue('GEO_BUBBLE'),
                getSeriesColors: jasmine.createSpy().and.returnValue({})
            },
            series = [
                {
                    blinkSeriesId: 'abc'
                }, {
                    blinkSeriesId: 'bcd'
                }
            ];
        spyOn(util, 'getRandomInteger').and.returnValue(2);

        GeoUtils.assignSeriesColors(chartModel, series);

        expect(series[0].color).toBe('#E356C5');
        expect(series[1].color).toBe('#9450E6');

        chartModel.getSeriesColors.and.returnValue({
            abc: '#BCD123'
        });
        GeoUtils.assignSeriesColors(chartModel, series);
        expect(series[0].color).toBe('#BCD123');
    });

    it('should save the colors in area chart model properly', function() {
        var chartModel = {
                getChartType: jasmine.createSpy().and.returnValue('GEO_AREA'),
                getXAxisColumnsHash: jasmine.createSpy().and.returnValue('HASH'),
                setMultiColorSeriesColors: jasmine.createSpy()
            },
            blinkGeoMap = {
                getSeries: function() {
                    return [
                        {
                            blinkSeriesId: 'abc',
                            scale: ['#f1f1f1', '#f2f2f2']
                        }, {
                            blinkSeriesId: 'bcd',
                            scale: ['#f3f3f3', '#f4f4f4']
                        }
                    ];
                }
            };

        GeoUtils.updateRenderedGeoMapColorsInModel(chartModel, blinkGeoMap);
        expect(chartModel.setMultiColorSeriesColors).toHaveBeenCalledTimes(2);
    });

    it('should save the colors in bubble model properly', function() {
        var chartModel = {
                getChartType: jasmine.createSpy().and.returnValue('GEO_BUBBLE'),
                setSeriesColor: jasmine.createSpy()
            },
            blinkGeoMap = {
                getSeries: function() {
                    return [
                        {
                            blinkSeriesId: 'abc',
                            color: '#f2f2f2'
                        }, {
                            blinkSeriesId: 'bcd',
                            color: '#f3f3f3'
                        }
                    ];
                }
            };

        GeoUtils.updateRenderedGeoMapColorsInModel(chartModel, blinkGeoMap);
        expect(chartModel.setSeriesColor).toHaveBeenCalledTimes(2);
    });
});
