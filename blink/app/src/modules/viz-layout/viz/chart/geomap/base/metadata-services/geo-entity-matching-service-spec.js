/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Unit tests for geo entity matching service.
 */
'use strict';

describe('geo entity matching service', function() {
    var basePath = getBasePath(document.currentScript.src);
    var GeoEntityMatchingService, GeoTopologyDataStore;
    var featuresForUSStates = [
            new ol.Feature({GEOID: 'CA', NAME: 'California'}),
            new ol.Feature({GEOID: 'NV', NAME: 'Nevada'})
        ], featuresForWorld = [
            new ol.Feature({
                GEOID: 'FR',
                ISO_A3: 'FRA',
                NAME: 'France',
                FORMAL_EN: 'French Republic'
            }),
            new ol.Feature({
                GEOID: 'IN',
                ISO_A3: 'IND',
                NAME: 'India',
                FORMAL_EN: 'Republic of India'
            })
        ], featuresForUSCounty = [
            new ol.Feature({
                'GEOID': '39131',
                'NAME': 'Pike',
                'ADMIN_DIV_1': 'Ohio'
            }),
            new ol.Feature({
                'GEOID': '13231',
                'NAME': 'Pike',
                'ADMIN_DIV_1': 'Georgia'
            }),
            new ol.Feature({
                'ADMIN_DIV_1': 'California',
                'GEOID': '06075',
                'NAME': 'San Francisco'
            })
        ], featuresForFranceRegion = [
            new ol.Feature({
                'GEOID': '94',
                'NAME': 'Corsica',
                'NAME_FR': 'Corse'
            }),
        ], featuresForUSZipCode = [
            new ol.Feature({
                GEOID: '00342',
            })
        ];

    // Assign IDs to all features.
    var allFeatures = [featuresForUSStates, featuresForWorld, featuresForUSCounty,
        featuresForFranceRegion, featuresForUSZipCode];
    allFeatures.forEach(function(features) {
        features.forEach(function(feature) {
            feature.setId(feature.getProperties().GEOID);
        })
    });

    beforeEach(function(done) {
        module('blink.app');
        Promise.all([
            freshImport(basePath, './geo-entity-matching-service'),
            freshImport(basePath, './geo-topology-data-store')
        ]).then(function(modules) {
            inject();
            GeoEntityMatchingService = modules[0].default;
            GeoTopologyDataStore = modules[1].default;
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('should match both lower and upper case and ignore spaces', function(done) {
        spyOn(GeoTopologyDataStore, 'getFeatures')
            .and.returnValue(Promise.resolve(featuresForUSStates));
        // Each of these strings should match to California.
        GeoEntityMatchingService.findMatchingFeatures(
            [' CA ', 'California  ', ' california', 'CALIFORNIA '],
            'POLYGON',
            'ADMIN_DIV_1',
            'US'
        ).then(function(matchedFeatures) {
            expect(matchedFeatures.length).toBe(4);
            matchedFeatures.forEach(function(features) {
                expect(features.length).toBe(1);
                expect(features[0].getId()).toBe('CA');
            });
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('should resolve duplicate county names correctly', function(done) {
        spyOn(GeoTopologyDataStore, 'getFeatures')
            .and.returnValue(Promise.resolve(featuresForUSCounty));
        GeoEntityMatchingService.findMatchingFeatures(
            ['Pike', 'Pike, Georgia', 'pike, ohio', 'Pike, OH', 'San Francisco'],
            'POINT',
            'ADMIN_DIV_2',
            'US'
        ).then(function(matchedFeatures) {
            expect(matchedFeatures.length).toBe(5);
            // first token should have 2 matches, rest should have unique matches.
            matchedFeatures.forEach(function(features, index) {
                var expectedMatches = index === 0 ? 2 : 1;
                expect(features.length).toBe(expectedMatches);
            });

            var pikeGeorgiaCounty = matchedFeatures[1][0];
            var pikeOhioCounty = matchedFeatures[2][0];
            expect(pikeGeorgiaCounty.getId()).toBe('13231');
            expect(pikeOhioCounty.getId()).toBe('39131');

            // verify that state abbr code should also work as state name.
            expect(matchedFeatures[3][0]).toBe(pikeOhioCounty);

            var matchedPikeCountyIds = matchedFeatures[0].map(function(feature) {
                return feature.getId();
            });
            matchedPikeCountyIds.sort();
            // verify that "pike" should match exactly two right counties.
            expect(matchedPikeCountyIds).toEqual(['13231', '39131']);

            // verify that if county name is unique then it should resolve to the right county
            // automatically
            expect(matchedFeatures[4][0].getId()).toBe('06075'); // San Francisco
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('should match various formats of country names', function(done) {
        spyOn(GeoTopologyDataStore, 'getFeatures')
            .and.returnValue(Promise.resolve(featuresForWorld));
        // First 4 tokens should match to India and last 4 should match to France.
        GeoEntityMatchingService.findMatchingFeatures(
            ['IN', 'IND', 'Republic of India', 'India',
                'FR', 'FRA', 'French Republic', 'France'],
            'POLYGON',
            'ADMIN_DIV_0'
        ).then(function(matchedFeatures) {
            expect(matchedFeatures.length).toBe(8);
            matchedFeatures.forEach(function(features, index) {
                expect(features.length).toBe(1);
                let expectedCountry = index < 4 ? 'IN' : 'FR';
                expect(features[0].getProperties().GEOID).toBe(expectedCountry);
            });
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('should match fields specified in EXTRA_FIELDS config too', function(done) {
        spyOn(GeoTopologyDataStore, 'getFeatures')
            .and.returnValue(Promise.resolve(featuresForFranceRegion));
        // both token should match corsica.
        GeoEntityMatchingService.findMatchingFeatures(
            ['corse', 'corsica'],
            'POLYGON',
            'ADMIN_DIV_1',
            'FR'
        ).then(function(matchedFeatures) {
            expect(matchedFeatures.length).toBe(2);
            matchedFeatures.forEach(function(features) {
                expect(features.length).toBe(1);
                expect(features[0].getId()).toBe('94');
            });
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('should return empty array for unrecognized tokens', function(done) {
        spyOn(GeoTopologyDataStore, 'getFeatures')
            .and.returnValue(Promise.resolve(featuresForUSStates));
        // first one should match Nevada, rest should not match any.
        GeoEntityMatchingService.findMatchingFeatures(
            ['nevada', 'nevadaa', 'nnevada'],
            'POLYGON',
            'ADMIN_DIV_1',
            'FR'
        ).then(function(matchedFeatures) {
            expect(matchedFeatures.length).toBe(3);
            expect(matchedFeatures[0].length).toBe(1);
            expect(matchedFeatures[1].length).toBe(0);
            expect(matchedFeatures[2].length).toBe(0);
            expect(matchedFeatures[0][0].getId()).toBe('NV');
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('should work for zip codes with or without leading zeros', function(done) {
        spyOn(GeoTopologyDataStore, 'getFeatures')
            .and.returnValue(Promise.resolve(featuresForUSZipCode));
        // all 3 should match to '00342'.
        GeoEntityMatchingService.findMatchingFeatures(
            ['342', '0342', '00342'],
            'POINT',
            'ZIP_CODE',
            'US'
        ).then(function(matchedFeatures) {
            expect(matchedFeatures.length).toBe(3);
            matchedFeatures.forEach(function(features) {
                expect(features.length).toBe(1);
                expect(features[0].getId()).toBe('00342');
            });
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });
});
