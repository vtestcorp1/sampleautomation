/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Unit tests for geo data store.
 */
'use strict';

describe('geo data store', function() {
    var basePath = getBasePath(document.currentScript.src);
    var GeoTopologyDataStore, mockedHttp;
    var responseDataForPath = {
        '/resources/geo/topojson/ZIP_CODE-US.json': [["94025","1.300","2.500"]]
    };

    function getMockedHttp() {
        return {
            get: function(path) {
                return {
                    then: function(successCallback, errorCallback) {
                        successCallback({
                            data: responseDataForPath[path]
                        });
                    }
                };
            }
        }
    }

    function getMockedPolygonFeature() {
        return new ol.Feature({
            GEOID: 'CA',
            geometry: new ol.geom.Polygon([])
        });
    }

    beforeEach(function(done) {
        module('blink.app');
        mockedHttp = getMockedHttp();
        ngRequireMock({
            '$http': mockedHttp
        }).then(function() {
            return freshImport(basePath, './geo-topology-data-store');
        }).then(function(module) {
            inject();
            GeoTopologyDataStore = module.default;
            done();
        });
    });

    it('should throw error for invalid input params', function() {
        expect(function() {
            GeoTopologyDataStore.getFeatures('POINT', 'INVALID_LEVEL')
        }).toThrow();
        expect(function() {
            // For zip codes we only support point geometry.
            GeoTopologyDataStore.getFeatures('POLYGON', 'ZIP_CODE', 'US')
        }).toThrow();
        expect(function() {
            GeoTopologyDataStore.getFeatures('POINT', 'ADMIN_DIV_1')
        }).toThrow();
    });

    it('should be abe to fetch polygon and features for admin divisions', function(done) {
        var features = [getMockedPolygonFeature()];
        spyOn(GeoTopologyDataStore.DATA_FORMAT, 'readFeatures').and.returnValue(features);
        spyOn(mockedHttp, 'get').and.callThrough();

        GeoTopologyDataStore.getFeatures('POLYGON', 'ADMIN_DIV_1', 'US')
            .then(function(returnedFeatures) {
                expect(returnedFeatures.length).toBe(1);
                var feature = returnedFeatures[0];
                expect(feature.getId()).toBe('CA');
                expect(feature.getProperties().GEOID).toBe('CA');
                expect(feature.getGeometry().getType()).toBe('Polygon');
                expect(mockedHttp.get).toHaveBeenCalledWith(
                    '/resources/geo/topojson/ADMIN_DIV_1-US-POLYGON.topo.json'
                );
                mockedHttp.get.calls.reset();
                // Make the call again for the same params, this time it should not call http.
                return GeoTopologyDataStore.getFeatures('POLYGON', 'ADMIN_DIV_1', 'US');
            }).then(function(returnedFeatures) {
                expect(mockedHttp.get).not.toHaveBeenCalled();
                expect(returnedFeatures).toBe(features);
                // Make the call again for the POINT features of same country and level,
                // this time too it should not make http call. It should just convert polygons
                // to points.
                return GeoTopologyDataStore.getFeatures('POINT', 'ADMIN_DIV_1', 'US');
            }).then(function (returnedFeatures) {
                expect(mockedHttp.get).not.toHaveBeenCalled();
                expect(returnedFeatures.length).toBe(1);
                var feature = returnedFeatures[0];
                expect(feature.getId()).toBe('CA');
                expect(feature.getProperties().GEOID).toBe('CA');
                expect(feature.getGeometry().getType()).toBe('Point');
                done();
            }).catch(function (error) {
                done.fail(error);
            });
    });

    it('getting features from cache should return error if cache is not present', function() {
        expect(function() {
            GeoTopologyDataStore.getFeaturesFromCache('POINT', 'ADMIN_DIV_2', 'FR')
        }).toThrow();
    });

    it('getting features from cache should work after data has been fetched', function(done) {
        var features = [getMockedPolygonFeature()];
        spyOn(GeoTopologyDataStore.DATA_FORMAT, 'readFeatures').and.returnValue(features);
        GeoTopologyDataStore.getFeatures('POINT', 'ADMIN_DIV_2', 'FR').then(function(features) {
            expect(function() {
                GeoTopologyDataStore.getFeaturesFromCache('POINT', 'ADMIN_DIV_2', 'FR')
            }).not.toThrow();
            var returnedFeatures =
                GeoTopologyDataStore.getFeaturesFromCache('POINT', 'ADMIN_DIV_2', 'FR');
            expect(returnedFeatures.length).toBe(1);
            expect(returnedFeatures[0].getId()).toBe('CA');
            done();
        });
    });

    it('should work for zip codes', function(done) {
        var features = [getMockedPolygonFeature()];
        spyOn(GeoTopologyDataStore.DATA_FORMAT, 'readFeatures');
        GeoTopologyDataStore.getFeatures('POINT', 'ZIP_CODE', 'US')
            .then(function(returnedFeatures) {
                expect(GeoTopologyDataStore.DATA_FORMAT.readFeatures).not.toHaveBeenCalled();
                expect(returnedFeatures.length).toBe(1);
                var feature = returnedFeatures[0];
                expect(feature.getId()).toBe('94025');
                expect(feature.getGeometry().getType()).toBe('Point');
                done();
            });
    });
});
