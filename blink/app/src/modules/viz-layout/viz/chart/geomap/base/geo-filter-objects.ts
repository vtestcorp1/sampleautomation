/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 */

/**
 * Base interface for objects (like enclosing circle) shown on the map to indicate some filter.
 */
export interface GeoFilterObject {
    /**
     * Type of the object, as of now this is only cirlce. Add more values in the types when support
     * is added.
     */
    type: 'CIRCLE';
}

export interface GeoFilterCircle extends GeoFilterObject {
    latitude: number;
    longitude: number;
    radius: number;
}
