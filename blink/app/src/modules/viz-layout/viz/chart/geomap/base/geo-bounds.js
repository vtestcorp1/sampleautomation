/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Models to represent geographical boundaries.
 *
 */

'use strict';

blink.app.factory('GeoCoordinates', [function(){
    function GeoCoordinates(latitude, longitude, altitude) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = isNaN(altitude) ? 0 : altitude;
    }

    return GeoCoordinates;
}]);

blink.app.factory('GeoBounds', ['geoUtil', 'GeoCoordinates', function (geoUtil, GeoCoordinates) {

    /**
     *
     * @param {=GeoCoordinates} bottomLeft
     * @param {=GeoCoordinates} topRight
     * @constructor
     */
    function GeoBounds(bottomLeft, topRight) {
        this.topRight = topRight === void 0 ? null : topRight;
        this.bottomLeft = bottomLeft === void 0 ? null : bottomLeft;

        this.topLeft = null;
        this.bottomRight = null;

        updateDerivedCorners(this);
    }

    function updateDerivedCorners(bounds) {
        if (bounds.isEmpty()) {
            bounds.topLeft = bounds.bottomRight = null;
            return;
        }
        bounds.topLeft = new GeoCoordinates(bounds.topRight.latitude, bounds.bottomLeft.longitude);
        bounds.bottomRight = new GeoCoordinates(bounds.bottomLeft.latitude, bounds.topRight.longitude);
    }

    /**
     * Creates a new GeoBounds instance from the min/max lat/long pairs provided.
     * Note that this method does not support bounds that cross the date line.
     * It assumes that the bottomLeft of the viewport is the min lat/long and
     * the topRight is the max lat/long which is not always correct if the
     * bound includes the date line.
     *
     * @param {Number} minLat
     * @param {Number} minLon
     * @param {Number} maxLat
     * @param {Number} maxLon
     * @returns {GeoBounds}
     */
    GeoBounds.prototype.fromBounds = function (minLat, minLon, maxLat, maxLon) {
        return new GeoBounds(
            new GeoCoordinates(minLat, minLon, 0),
            new GeoCoordinates(maxLat, maxLon, 0)
        );
    };

    /**
     * @returns {boolean}
     */
    GeoBounds.prototype.isEmpty = function () {
        return this.bottomLeft === null || this.topRight === null;
    };

    /**
     * @returns {boolean}
     */
    GeoBounds.prototype.crossesDateLine = function () {
        return this.bottomLeft.longitude > this.topRight.longitude;
    };

    /**
     * Extends the bounds to include the provided coordinate. If _allowCrossingDateLine_ is set to
     * true and the bounds are not already crossing the date line the bounds will be cross the date
     * if needed to minimize the area added to include the new point. If the bounds is already crossing
     * the date line _allowCrossingDateLine_ is ignored.
     *
     * @param lat
     * @param lon
     * @param allowCrossingDateLine
     */
    GeoBounds.prototype.extendToIncludePoint = function (lat, lon, allowCrossingDateLine) {
        if (this.isEmpty()) {
            this.bottomLeft = new GeoCoordinates(lat, lon);
            this.topRight = new GeoCoordinates(lat, lon);
            updateDerivedCorners(this);
            return;
        }

        var distanceFromLeft, distanceFromRight;

        if (this.crossesDateLine() || !allowCrossingDateLine) {
            distanceFromLeft = lon - this.bottomLeft.longitude;
            distanceFromRight = lon - this.topRight.longitude;
        } else {
            var longRange = (geoUtil.Constants.MAP_MAX_LONGITUDE - geoUtil.Constants.MAP_MIN_LONGITUDE);
            distanceFromLeft = (lon + longRange)%longRange - (this.bottomLeft.longitude + longRange)%longRange;
            distanceFromRight = (lon + longRange)%longRange - (this.topRight.longitude + longRange)%longRange;
        }

        if (distanceFromLeft < 0 || distanceFromRight > 0) {
            // we have a choice to extend either left or right, we choose
            // the one that will cause minimum increase in area
            if (Math.abs(distanceFromLeft) < Math.abs(distanceFromRight)) {
                this.bottomLeft.longitude = lon;
            } else {
                this.topRight.longitude = lon;
            }
        }

        if (lat < this.bottomLeft.latitude) {
            this.bottomLeft.latitude = lat;
        } else if (lat > this.topRight.latitude) {
            this.topRight.latitude = lat;
        }

        updateDerivedCorners(this);
    };

    GeoBounds.prototype.expand = function (latitudeIncrement, longitudeIncrement, allowCrossingDateLine) {
        this.topRight.latitude = Math.min(
            geoUtil.Constants.MAP_MAX_LATITUDE,
            this.topRight.latitude + latitudeIncrement/2
        );
        this.bottomLeft.latitude = Math.max(
            geoUtil.Constants.MAP_MIN_LATITUDE,
            this.bottomLeft.latitude - latitudeIncrement/2
        );

        if (this.crossesDateLine()) {
            allowCrossingDateLine = true;
        }

        this.bottomLeft.longitude -= longitudeIncrement/2;
        this.topRight.longitude += longitudeIncrement/2;


        if (allowCrossingDateLine) {
            var longRange = (geoUtil.Constants.MAP_MAX_LONGITUDE - geoUtil.Constants.MAP_MIN_LONGITUDE);
            if (this.bottomLeft.longitude <= geoUtil.Constants.MAP_MIN_LONGITUDE) {
                this.bottomLeft.longitude = (this.bottomLeft.longitude + longRange)%longRange;
            }
            if (this.topRight.longitude > geoUtil.Constants.MAP_MAX_LONGITUDE) {
                this.topRight.longitude = (this.topRight.longitude - longRange)%longRange;
            }

        } else {
            this.bottomLeft.longitude = Math.max(geoUtil.Constants.MAP_MIN_LONGITUDE, this.bottomLeft.longitude);
            this.topRight.longitude = Math.min(geoUtil.Constants.MAP_MAX_LONGITUDE, this.topRight.longitude);
        }

        updateDerivedCorners(this);
    };

    /**
     * Returns the area of the bounds in earth radius units.
     * @returns {number}
     */
    GeoBounds.prototype.getArea = function () {
        var latitudeRange = this.topRight.latitude - this.bottomLeft.latitude;

        // the range could cross the date line, we compute the range length thus:
        // Possible cases:
        // MIN --- L --- R --- MAX
        // L --- MAX --- R --- MIN
        // L --- MIN --- R --- MAX
        // with the last two cases being equivalent.
        // We compute the range as ((MAX - L) + (R - MIN))%(MIN - MAX) which covers all the cases
        var leftRectangleLonRange = geoUtil.Constants.MAP_MAX_LONGITUDE - this.bottomLeft.longitude;
        var rightRectangleLonRange = this.topRight.longitude - geoUtil.Constants.MAP_MIN_LONGITUDE;
        var earthLonRange = geoUtil.Constants.MAP_MAX_LONGITUDE - geoUtil.Constants.MAP_MIN_LONGITUDE;
        var longitudeRange = (leftRectangleLonRange + rightRectangleLonRange);
        if (longitudeRange > earthLonRange) {
            longitudeRange -= earthLonRange;
        }

        return (latitudeRange * longitudeRange);
    };

    return GeoBounds;

}]);

