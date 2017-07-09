/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Spec for GeoCountryConfig class.
 */

'use strict';

describe('geo country config', function () {
    var Countries,
        GeoCountryConfig,
        GeoCountryConfigMap;

    beforeEach(function() {
        module('blink.app');
        /* eslint camelcase: 1 */
        inject(function(_Countries_, _GeoCountryConfigMap_, _GeoCountryConfig_) {
            Countries = _Countries_;
            GeoCountryConfig = _GeoCountryConfig_;
            GeoCountryConfigMap = _GeoCountryConfigMap_;
        });
    });

    it('data should be in correct format', function() {
        for (var isoCode in GeoCountryConfigMap) {
            if (GeoCountryConfigMap.hasOwnProperty(isoCode)) {
                // must be a valid iso2 country code.
                expect(!!Countries[isoCode]).toBe(true);
                // Support field must be present
                expect(GeoCountryConfigMap[isoCode].SUPPORT).toBeTruthy();
                expect(Object.keys(GeoCountryConfigMap[isoCode].SUPPORT).count()).toBeLessThan(4);
            }
        }
    });

    it ('should be able to parse data correctly', function() {
        let USConfig = GeoCountryConfig.get('US');
        expect(USConfig.isDiv1Supported()).toBeTruthy();
        expect(USConfig.isDiv2Supported()).toBeTruthy();
        expect(USConfig.isZipSupported()).toBeTruthy();
        expect(USConfig.getDiv1Label()).toBe('State');
        expect(USConfig.getDiv2Label()).toBe('County');
        expect(USConfig.getZipLabel()).toBe('Zip Code');
        expect(USConfig.getDiv2Normalizer()('Pike County')).toBe('pike');
    });
});
