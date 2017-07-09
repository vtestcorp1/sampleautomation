/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 * TODO (mahesh) Merge its code in GeoUtils.ts in the next commit.
 *
 * @fileoverview Utility functions for geo maps
 */

'use strict';

blink.app.factory('geoUtil', ['Logger', 'util', 'blinkConstants',
    'strings',
    function (Logger, util, blinkConstants, strings) {
        var logger = Logger.create('geo-util');

        var Constants = {
            PROJECTION_TRANSITION_DURATION: 512,
            DATA_POINT_HIGHLIGHT_TRANSITION_DURATION: 400,
            MAP_MIN_LONGITUDE: -180,
            MAP_MAX_LONGITUDE: 180,
            MAP_MIN_LATITUDE: -85,
            MAP_MAX_LATITUDE: 85,
            MAP_MAX_LATITUDE_MERCATOR: 85.051129,
            MAP_MIN_LATITUDE_MERCATOR: -85.051129,
            MAP_WIDTH: 4,
            MAP_HEIGHT: 4,
            EARTH_RADIUS: 1,
            GeoBounds: {
                WORLD: [-64, -180, 86, 180],
                CONTINENTAL_US: [24.396308, -124.848974, 49.384358, -66.885444]
            }
        };

        var olSourceState = {
            READY: 'ready'
        };

        function getAreaOfExtent(extent) {
            var area = 0;
            if (!ol.extent.isEmpty(extent)) {
                area = ol.extent.getWidth(extent) * ol.extent.getHeight(extent);
            }
            return area;
        }

        function triangulateGrid(numRows, numCols, triangleIndices, vertexOffset) {
            if (vertexOffset === void 0) {
                vertexOffset = 0;
            }

            if (!triangleIndices) {
                var numTriangles = numRows * numCols * 2;
                triangleIndices = new Uint16Array(numTriangles * 3);
            }

            var i, row, col, topLeft, topRight, bottomLeft, bottomRight, triangleVertexIndex;

            for (i=0, triangleVertexIndex = 0; i<numRows * numCols; ++i) {
                row = Math.floor(i/numCols);
                col = i%numCols;
                topLeft = vertexOffset + row * (numCols + 1) + col;
                topRight = topLeft + 1;
                bottomLeft = topLeft + numCols + 1;
                bottomRight = bottomLeft + 1;

            // note: follow CCW winding order for all triangles

            // first triangle
                triangleIndices[triangleVertexIndex++] = topLeft;
                triangleIndices[triangleVertexIndex++] = bottomLeft;
                triangleIndices[triangleVertexIndex++] = topRight;

            // second triangle
                triangleIndices[triangleVertexIndex++] = topRight;
                triangleIndices[triangleVertexIndex++] = bottomLeft;
                triangleIndices[triangleVertexIndex++] = bottomRight;
            }

            return triangleIndices;
        }

        function isProjectionGlobe(projectionType) {
            return projectionType === blinkConstants.geo3dProjectionTypes.GLOBE;
        }

        function isProjectionMap(projectionType) {
            return projectionType === blinkConstants.geo3dProjectionTypes.MAP;
        }

        function isProjectionPerspectivePlane(projectionType) {
            return projectionType === blinkConstants.geo3dProjectionTypes.PERSPECTIVE_PLANE;
        }

        function convertLatLongToXYZMercator(lat, lng, alt) {
            if (alt === void 0) {
                alt = 0;
            }

            var x = (Constants.MAP_WIDTH/(Constants.MAP_MAX_LONGITUDE - Constants.MAP_MIN_LONGITUDE)) * lng;

            var latRad = lat * Math.PI/180.0;
            var mercN = Math.log(Math.tan((Math.PI/4.0) + (latRad/2.0)));
            var y = Constants.MAP_HEIGHT/2.0 - (((Constants.MAP_HEIGHT/2.0)-(Constants.MAP_WIDTH * mercN/(2.0 * Math.PI))));

            return {
                x: x,
                y: y,
                z: alt
            };
        }

        function convertLatLongToXYZSpherical(lat, lng, alt) {
            if (alt === void 0) {
                alt = 0;
            }

            var phi = (90.0 - lat) * Math.PI/180.0;
            var theta = (180.0 - lng) * Math.PI/180.0 + 180.0;

            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            var x = Constants.EARTH_RADIUS * sinPhi * cosTheta;
            var y = Constants.EARTH_RADIUS * cosPhi;
            var z = Constants.EARTH_RADIUS * sinPhi * sinTheta;

            var altFactor = ((1.0 + alt)/Constants.EARTH_RADIUS);

            return {
                x: x * altFactor,
                y: y * altFactor,
                z: z * altFactor
            };
        }

        return {
            Constants: Constants,
            olSourceState: olSourceState,
            getAreaOfExtent: getAreaOfExtent,
            triangulateGrid: triangulateGrid,
            isProjectionGlobe: isProjectionGlobe,
            isProjectionMap: isProjectionMap,
            isProjectionPerspectivePlane: isProjectionPerspectivePlane,
            convertLatLongToXYZMercator: convertLatLongToXYZMercator,
            convertLatLongToXYZSpherical: convertLatLongToXYZSpherical
        };
    }]);
