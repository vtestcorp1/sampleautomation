/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to load shaders. Supports including shaders within shaders.
 *
 */

'use strict';

blink.app.factory('mapTileService', ['Logger', 'geoUtil',
    function (Logger, geoUtil) {

        var TILE_SIZE = 256;
        var MIN_ZOOM = 0;
        var MAX_ZOOM = 18;
        var TILE_COMPUTATION_EDGE_CONSTANT = 0.00001;

    // A fail safe to ensure we never try to load too many tile images and hang the
    // browser in case there is an logical error
        var MAX_TILE_COUNT = 16;

        var TILE_TEXTURE_CACHE_SIZE = 128;

        var TileServiceProvider = {
            GOOGLE_MAPS: 'GOOGLE_MAPS',
            OPEN_STREET_MAPS: 'OPEN_STREET_MAPS'
        };

        var LOCALE = 'en';

        var logger = Logger.create('shader-service');

    // Note (sunny): we can't use $cacheFactory as we need purge callbacks to be
    // able to properly dispose textures.
        var tileTextureCache = new Cache(TILE_TEXTURE_CACHE_SIZE);

    /**
     * We can't re-use textures across contexts. This method provides a way to
     * clear the cache when the context is destroyed.
     * TODO (sunny): Let the owner of the context have its own copy of cache
     * and pass it around. This code assumes there is only one context operating
     * at a time.
     */
        function clearTileTextureCache() {
            tileTextureCache.clear();
        }

        function getTextureForTileUrl(tileUrl) {
            var texture = tileTextureCache.getItem(tileUrl);
            if (!texture) {
                THREE.ImageUtils.crossOrigin = 'anonymous';
                texture = THREE.ImageUtils.loadTexture(tileUrl);
                tileTextureCache.setItem(tileUrl, texture, {
                    callback: function (cacheTileUrl, cacheTileTexture) {
                        cacheTileTexture.dispose();
                    }
                });
            }
            return texture;
        }

        function Tile(tileUrl, tileX, tileY) {
        // TODO(sunny): wade through the crappy THREEjs docs to verify that we need
        // our own caching layer of textures.
            this.tileTexture = getTextureForTileUrl(tileUrl);
            this.tileX = tileX;
            this.tileY = tileY;
        }

        Tile.prototype.getTileTexture = function () {
            return this.tileTexture;
        };

        Tile.prototype.getTileXIndex = function () {
            return this.tileX;
        };

        Tile.prototype.getTileYIndex = function () {
            return this.tileY;
        };


        function getCoordinateTile(geoCoordinate, zoomLevel) {
            var numTilesOnOneAxis = Math.pow(2, zoomLevel);

            var lonRange = (geoUtil.Constants.MAP_MAX_LONGITUDE - geoUtil.Constants.MAP_MIN_LONGITUDE);
        // points on the edge fall on the next bucket (e.g. 180/-180 longitude). we correct for that
        // source: https://developers.google.com/maps/documentation/javascript/examples/map-coordinates
            geoCoordinate.longitude = (geoCoordinate.longitude).clamp(
            geoUtil.Constants.MAP_MAX_LONGITUDE - TILE_COMPUTATION_EDGE_CONSTANT,
            geoUtil.Constants.MAP_MIN_LONGITUDE + TILE_COMPUTATION_EDGE_CONSTANT
        );

            geoCoordinate.latitude = (geoCoordinate.latitude).clamp(
            geoUtil.Constants.MAP_MAX_LATITUDE - TILE_COMPUTATION_EDGE_CONSTANT,
            geoUtil.Constants.MAP_MIN_LATITUDE + TILE_COMPUTATION_EDGE_CONSTANT
        );

        // formulae source: http://stackoverflow.com/a/14457180
            var x = Math.floor(((geoCoordinate.longitude - geoUtil.Constants.MAP_MIN_LONGITUDE)/lonRange) * numTilesOnOneAxis);

            var latRad = geoCoordinate.latitude * Math.PI/180;
            var mercN = Math.log(Math.tan((Math.PI/4.0) + (latRad/2.0)));
            var y = Math.floor(((numTilesOnOneAxis/2.0)-(numTilesOnOneAxis * mercN/(2.0 * Math.PI))));

            if (x < 0 || x >= numTilesOnOneAxis || y < 0 || y >= numTilesOnOneAxis) {
                logger.error('tile index out of bounds', x, y, numTilesOnOneAxis);
                x = 0;
                y = 0;
            }

            return {
                x: x,
                y: y
            };
        }

        function getTileUrl(zoomLevel, tileX, tileY, tileServiceProvider, tileIndex) {
            switch (tileServiceProvider) {
                case TileServiceProvider.GOOGLE_MAPS:
                    return 'http://mt{index}.google.com/vt/lyrs=m@169000000&hl={locale}&x={x}&y={y}&z={zoom}'.assign({
                        index: tileIndex%4,
                        locale: LOCALE,
                        x: tileX,
                        y: tileY,
                        zoom: zoomLevel
                    });
                case TileServiceProvider.OPEN_STREET_MAPS:
                    return 'http://{subDomain}.tile.openstreetmap.org/{zoom}/{x}/{y}.png'.assign({
                        subDomain: ['a', 'b', 'c'][tileIndex%3],
                        x: tileX,
                        y: tileY,
                        zoom: zoomLevel
                    });
                default:
                    logger.error('unknown tileServiceProvider', tileServiceProvider);
                    return null;
            }
        }

        function getZoomLevel(canvasWidth, canvasHeight, viewportGeoBounds) {
        // we assume that we'll need tiles to cover the entire canvas. this won't always be
        // true (e.g. on globe or if the map view is zoom out too far). while this means
        // we'll be loading more tiles than absolutely necessary we are taking this route
        // for simplicity.
        // TODO (sunny): improve the accuracy here.

            var viewportGeoArea = viewportGeoBounds.getArea();
            var latRange = geoUtil.Constants.MAP_MAX_LATITUDE - geoUtil.Constants.MAP_MIN_LATITUDE;
            var lonRange = geoUtil.Constants.MAP_MAX_LONGITUDE - geoUtil.Constants.MAP_MIN_LONGITUDE;
            var earthArea = latRange * lonRange;
            var viewportGeoEarthFraction = viewportGeoArea/earthArea;
            var pixelEarthArea = (canvasWidth * canvasHeight)/viewportGeoEarthFraction;
            var numEarthTiles = pixelEarthArea/(TILE_SIZE * TILE_SIZE);

        // number of tiles to cover the earth at zoom level z is 2^2z
            var zoomLevel = Math.floor(Math.log(numEarthTiles)/(Math.log(2) * 2));
            zoomLevel = (zoomLevel).clamp(MIN_ZOOM, MAX_ZOOM);

            return zoomLevel;
        }
    /**
     *
     * @param viewportGeoBounds
     * @param zoomLevel
     * @param tileServiceProvider
     * @returns {Array<Tile>}
     */
        function getTiles(viewportGeoBounds, zoomLevel, tileServiceProvider) {
            var numEarthTiles = Math.pow(2, 2 * zoomLevel);
            var topLeftTile = getCoordinateTile(viewportGeoBounds.topLeft, zoomLevel);
            var topRightTile = getCoordinateTile(viewportGeoBounds.topRight, zoomLevel);
            var bottomLeftTile = getCoordinateTile(viewportGeoBounds.bottomLeft, zoomLevel);

            var tileXRanges = [];
        // the bound crosses date line
            if (topLeftTile.x > topRightTile.x) {
                tileXRanges = [[0, topRightTile.x], [topLeftTile.x, numEarthTiles - 1]];
            } else {
                tileXRanges = [[topLeftTile.x, topRightTile.x]];
            }

            var tiles = [];
            var tileIndex = -1;
            var tileCoordsDebug = [];
            tileXRanges.forEach(function(tileXRange){
                for (var y=topLeftTile.y; y<=bottomLeftTile.y; ++y) {
                    for (var x=tileXRange[0]; x<=tileXRange[1]; ++x) {
                        tileIndex++;
                        var tileUrl = getTileUrl(zoomLevel, x, y, tileServiceProvider, tileIndex);
                        var tile = new Tile(tileUrl, x, y);
                        tiles.push(tile);
                        tileCoordsDebug.push([x, y]);
                    }
                }
            });

            console.log(tileIndex + 1, zoomLevel, JSON.stringify(tileCoordsDebug), viewportGeoBounds);
            console.log(viewportGeoBounds.bottomLeft.latitude, viewportGeoBounds.bottomLeft.longitude,
            viewportGeoBounds.topRight.latitude, viewportGeoBounds.topRight.longitude);

            if (tiles.length > MAX_TILE_COUNT) {
                logger.error('attempt to load too many map tiles', tiles.length, tiles);
                return [];
            }

            return tiles;
        }

        return {
            TileServiceProvider: TileServiceProvider,
            getZoomLevel: getZoomLevel,
            getTiles: getTiles,
            clearTileTextureCache: clearTileTextureCache
        };

    }]);
