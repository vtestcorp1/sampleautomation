/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit tests for GeoBounds
 */

'use strict';

describe('GeoBounds', function() {
    var GeoBounds;

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            GeoBounds = $injector.get('GeoBounds');
        });
    });

    it('should create empty bounds', function () {
        var bounds = new GeoBounds();
        expect(bounds.isEmpty()).toBe(true);
    });

    it('should detect crossing of date line', function () {
        var bounds = new GeoBounds({
            latitude: -80,
            longitude: -140
        }, {
            latitude: 80,
            longitude: -120
        });

        expect(bounds.isEmpty()).toBe(false);
        expect(bounds.crossesDateLine()).toBe(false);

        bounds = new GeoBounds({
            latitude: -80,
            longitude: 140
        }, {
            latitude: 80,
            longitude: -160
        });

        expect(bounds.crossesDateLine()).toBe(true);
    });

    function verifyBounds(bounds, bottomLeftLat, bottomLeftLon, topRightLat, topRightLon) {
        expect(bounds.bottomLeft.latitude).toBe(bottomLeftLat);
        expect(bounds.bottomLeft.longitude).toBe(bottomLeftLon);

        expect(bounds.topRight.latitude).toBe(topRightLat);
        expect(bounds.topRight.longitude).toBe(topRightLon);
    }

    it('should extend bounds to include point', function(){
        var bounds;

        function initBounds(leftLon, rightLon) {
            bounds = new GeoBounds({
                latitude: -80,
                longitude: leftLon
            }, {
                latitude: 80,
                longitude: rightLon
            });
        }


        // point in the middle should have no effect
        initBounds(-140, -120);
        bounds.extendToIncludePoint(0, -130, false);
        verifyBounds(bounds, -80, -140, 80, -120);

        // extend to the left
        initBounds(-140, -120);
        bounds.extendToIncludePoint(0, -150, false);
        verifyBounds(bounds, -80, -150, 80, -120);

        // extend to the right without crossing the date line
        initBounds(-140, -120);
        bounds.extendToIncludePoint(0, 170, false);
        verifyBounds(bounds, -80, -140, 80, 170);

        // extend to the left crossing the date line
        initBounds(-140, -120);
        bounds.extendToIncludePoint(0, 170, true);
        verifyBounds(bounds, -80, 170, 80, -120);

        // extend to the right
        initBounds(-140, -120);
        bounds.extendToIncludePoint(0, -110, false);
        verifyBounds(bounds, -80, -140, 80, -110);

        // extend to the left without crossing the date line
        initBounds(160, 170);
        bounds.extendToIncludePoint(0, -170, false);
        verifyBounds(bounds, -80, -170, 80, 170);

        // extend to the right crossing the date line
        initBounds(160, 170);
        bounds.extendToIncludePoint(0, -170, true);
        verifyBounds(bounds, -80, 160, 80, -170);

        /* bounds already crossing the date line */

        // extend to the left
        initBounds(170, -170);
        bounds.extendToIncludePoint(0, 160, false);
        verifyBounds(bounds, -80, 160, 80, -170);

        // extend to the right
        initBounds(170, -170);
        bounds.extendToIncludePoint(0, -160, false);
        verifyBounds(bounds, -80, 170, 80, -160);

    });

    it('should expand bounds', function(){
        var bounds;

        function initBounds(leftLon, rightLon) {
            bounds = new GeoBounds({
                latitude: -80,
                longitude: leftLon
            }, {
                latitude: 80,
                longitude: rightLon
            });
        }

        initBounds(-140, -120);
        bounds.expand(10, 10, false);
        verifyBounds(bounds, -85, -145, 85, -115);


        initBounds(-170, -120);
        bounds.expand(10, 30, false);
        verifyBounds(bounds, -85, -180, 85, -105);

        initBounds(-170, -120);
        bounds.expand(10, 30, true);
        verifyBounds(bounds, -85, 175, 85, -105);

        initBounds(150, 170);
        bounds.expand(10, 30, false);
        verifyBounds(bounds, -85, 135, 85, 180);

        initBounds(150, 170);
        bounds.expand(10, 30, true);
        verifyBounds(bounds, -85, 135, 85, -175);

        // ignore allowCrossingDateLine is already crossing the date line
        initBounds(175, -120);
        bounds.expand(10, 30, false);
        verifyBounds(bounds, -85, 160, 85, -105);

        initBounds(150, -175);
        bounds.expand(10, 30, false);
        verifyBounds(bounds, -85, 135, 85, -160);

    });
});
