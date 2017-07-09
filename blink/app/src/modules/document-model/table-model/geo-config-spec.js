/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Spec for GeoConfig model class.
 */

'use strict';

describe('geo config', function () {
    var jsonConstants,
        GeoConfig;

    beforeEach(function() {
        module('blink.app');
        /* eslint camelcase: 1 */
        inject(function(_jsonConstants_, _GeoConfig_) {
            jsonConstants = _jsonConstants_;
            GeoConfig = _GeoConfig_;
        });
    });

    it('should be able to set all the fields recursively', function() {
        var geoConfigJson = {
            type: jsonConstants.geoConfigType.ADMIN_DIV_2,
            parent: {
                type: jsonConstants.geoConfigType.ADMIN_DIV_1,
                columnGuid: 'abc',
                parent: {
                    type: jsonConstants.geoConfigType.ADMIN_DIV_0,
                    fixedValue: 'US'
                }
            }
        };
        // parsing to TS object.
        var geoConfig = new GeoConfig(geoConfigJson);
        expect(geoConfig.getType()).toBe(jsonConstants.geoConfigType.ADMIN_DIV_2);
        expect(geoConfig.getParent().getType()).toBe(jsonConstants.geoConfigType.ADMIN_DIV_1);
        expect(geoConfig.getParent().getColumnGuid()).toBe('abc');
        expect(geoConfig.getParent().getFixedValue()).toBe(void 0);
        expect(geoConfig.getParent().getParent().getType())
            .toBe(jsonConstants.geoConfigType.ADMIN_DIV_0);
        expect(geoConfig.getParent().getParent().getFixedValue()).toBe('US');
        expect(geoConfig.getParent().getParent().getColumnGuid()).toBe(void 0);

        // converting back to json
        expect(geoConfig.getJson()).toEqual(geoConfigJson);
    });

    it('should be able to set fields for custom region', function() {
        var geoConfigJson = {
            type: jsonConstants.geoConfigType.CUSTOM_REGION,
            customFileGuid: 'abcd'
        };
        // parsing to TS object.
        var geoConfig = new GeoConfig(geoConfigJson);
        expect(geoConfig.getType()).toBe(jsonConstants.geoConfigType.CUSTOM_REGION);
        expect(geoConfig.getCustomFileGuid()).toBe('abcd');

        // converting back to json
        expect(geoConfig.getJson()).toEqual(geoConfigJson);
    });
});
