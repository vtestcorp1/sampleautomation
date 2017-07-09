/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Unit tests for chart ui utils
 */

'use strict';

/* eslint camelcase: 1 */

describe('chart ui utils', function() {
    var basePath = getBasePath(document.currentScript.src);
    var chartUIUtils, blinkGeoMap, geoMapSetData, geoMapSetSize;

    geoMapSetData = jasmine.createSpy();
    geoMapSetSize = jasmine.createSpy();

    beforeEach(function(done) {
        module('blink.app');

        mock(basePath, './geomap/2d/blink-geo-map', {
            default: function FakeGeoMap() {
                this.setSize = geoMapSetSize;
                this.setData = geoMapSetData;
            }
        });
        mock(basePath, './geomap/base/geo-utils', {
            GeoUtils: jasmine.createSpyObj('GeoUtils', ['updateRenderedGeoMapColorsInModel'])
        });
        ngRequireMock({
            angularUtil: {
                getCompiledElementAsync: jasmine.createSpy().and.returnValue(Promise.resolve())
            }
        }).then(function() {
            freshImport(basePath, './chart-ui-utils').then(function(module) {
                chartUIUtils = module;
                inject(function($injector) {
                    done();
                });
            });
        });
    });

    it('renderGeoMap should set data and size successfully', function(done) {
        var scope = {
                emitNewChart: jasmine.createSpy()
            }, chartModel = jasmine.createSpyObj('chartModel', [
                'isPinboardViz',
                'getSeries',
                'isYAxisShared',
                'getGeoObjects'
            ]),
            $chartContent = $('<div>');
        chartModel.getXAxisColumns = jasmine.createSpy().and.returnValue([{
            getGeoConfig: jasmine.createSpy()
        }]);
        chartModel.getYAxisColumns = jasmine.createSpy().and.returnValue([]);

        chartUIUtils.chartUIRenderGeoMap(scope, chartModel, $chartContent, false)
            .then(() => {
                expect(geoMapSetData).toHaveBeenCalled();
                expect(geoMapSetSize).toHaveBeenCalled();
                done();
            });
    });
});
