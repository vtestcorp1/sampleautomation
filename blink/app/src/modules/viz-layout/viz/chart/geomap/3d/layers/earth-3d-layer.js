/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview The layer rendering the earth in different forms (plane, globe etc.)
 */

'use strict';

blink.app.factory('Earth3DLayer', ['Logger', 'util', 'BaseFeature3DLayer', 'geoUtil', 'GeoBounds', 'GeoCoordinates',
    'mapTileService',
    function(Logger, util, BaseFeature3DLayer, geoUtil, GeoBounds, GeoCoordinates, mapTileService) {

        var NUM_SEGMENTS = 40,
            TILE_UPDATE_DEBOUNCE_INTERVAL = 128,
            MAX_NUM_TILES = 16,
            INVALID_TILE_XY_VECTOR = new THREE.Vector2(-1, -1);


        var EARTH_SHADERS = [
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.fragment.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.fragment.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.fragment.glsl'
        ];

        var logger = Logger.create('earth-3d-layer');

        function Earth3DLayer(projectionType, mapType, geoConfigType, $canvas, renderer, scene, camera) {

            this.viewportXComputationScene = null;
            this.viewportXTexture = null;

            this.viewportYComputationScene = null;
            this.viewportYTexture = null;

            Earth3DLayer.__super.apply(this, arguments);

            var earth3DLayer = this;
            this.updateTilesDebounced = util.debounce(function(){
                updateTileTextures(earth3DLayer);
            }, TILE_UPDATE_DEBOUNCE_INTERVAL);

            var defaultTileXYIndices = [];
            var defaultTileTextures = [];
            for (var i=0; i<MAX_NUM_TILES; ++i) {
                defaultTileXYIndices.push(INVALID_TILE_XY_VECTOR);
                defaultTileTextures.push(null);
            }

            this.tileTextureUniforms = {
                uZoomLevel: {
                    type: 'f',
                    value: 0
                },
                uTextureTileXYIndices: {
                    type: 'v2v',
                    value: defaultTileXYIndices
                },
                uTileTextures: {
                    type: 'tv',
                    value: defaultTileTextures
                }
            };
        }
        util.inherits(Earth3DLayer, BaseFeature3DLayer);

        Earth3DLayer.prototype.getFeatureShaderUrls = function () {
            return EARTH_SHADERS;
        };

        Earth3DLayer.prototype.onCameraPositionChanged = function () {
            Earth3DLayer.__super.prototype.onCameraPositionChanged.call(this);
            this.updateTilesDebounced();
        };

        Earth3DLayer.prototype.resize = function (canvasWidth, canvasHeight, $resizeEvent) {
            Earth3DLayer.__super.prototype.resize.call(this);

            if (this.viewportXTexture) {
                this.viewportXTexture.setSize(canvasWidth, canvasHeight);
            }
            if (this.viewportYTexture) {
                this.viewportYTexture.setSize(canvasWidth, canvasHeight);
            }
        };

        Earth3DLayer.prototype.drawFeatures = function (featureIdToFeatureData, shaders) {
            Earth3DLayer.__super.prototype.drawFeatures.apply(this, arguments);
            draw(this, shaders);

        // give tiling update a chance to run as the initial trigger might
        // have arrived before we the layer was initialized.
        // don't execute in the same event loop to avoid race
            util.executeInNextEventLoop(this.updateTilesDebounced);
        };

        function getPlaneEarthGeometry(numSegments, minLatitude, maxLatitude, minLongitude, maxLongitude) {
            var numVertices = Math.pow(numSegments + 1, 2);
            if (numVertices > 65535) {
                logger.error('<=65535 vertices supported, use drawCalls/offsets to batch draw calls');
                return;
            }

            var vertexPositions = new Float32Array(numVertices * 3);
            var vertexUVs = new Float32Array(numVertices * 2);

            var lonRange = maxLongitude - minLongitude;
            var latRange = minLatitude - maxLatitude;
            var lonDeltaPerX = lonRange/numSegments;
            var latDeltaPerY = latRange/numSegments;

            var i, x, y, lat, lon;

            for (i=0; i<numVertices; ++i) {
                y = Math.floor(i/(numSegments + 1));
                x = i%(numSegments + 1);

            // lon: min -> max
            // lat: max -> min
                lon = minLongitude + lonDeltaPerX * x;
                lat = maxLatitude + latDeltaPerY * y;

                vertexPositions[i * 3] = lat;
                vertexPositions[i * 3 + 1] = lon;

                vertexUVs[i * 2] = x/numSegments;
                vertexUVs[i * 2 + 1] = y/numSegments;
            }

            var triangleIndices = geoUtil.triangulateGrid(numSegments, numSegments);

            var earthGeometry = new THREE.BufferGeometry();

            earthGeometry.addAttribute('index', new THREE.BufferAttribute(triangleIndices, 1));
            earthGeometry.addAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
            earthGeometry.addAttribute('uv', new THREE.BufferAttribute(vertexUVs, 2));

            return earthGeometry;
        }

        function getShaderMaterial(earth3DLayer, vertexShader, fragmentShader, uniforms) {
            return earth3DLayer.getNewRawShaderMaterial({
                uniforms: uniforms || {},
                attributes: {
                    index: {
                        type: 'v3',
                        value: []
                    },
                    position: {
                        type: 'v3',
                        value: []
                    }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
                side: THREE.DoubleSide
            });
        }

        function draw(earth3DLayer, shaders) {
            var earthGeometry = getPlaneEarthGeometry(
            NUM_SEGMENTS,
            geoUtil.Constants.MAP_MIN_LATITUDE_MERCATOR,
            geoUtil.Constants.MAP_MAX_LATITUDE_MERCATOR,
            geoUtil.Constants.MAP_MIN_LONGITUDE,
            geoUtil.Constants.MAP_MAX_LONGITUDE
        );

            var earthSurfaceMaterial = getShaderMaterial(earth3DLayer, shaders[0], shaders[1]);
            var earthSurfaceMesh = new THREE.Mesh(earthGeometry, earthSurfaceMaterial);
            earthSurfaceMesh.frustumCulled = false;
            earth3DLayer.addObjectToRemoveOnDestroy(earthSurfaceMesh);
            earth3DLayer.scene.add(earthSurfaceMesh);

            var earthTilesMaterial = getShaderMaterial(earth3DLayer, shaders[2], shaders[3], earth3DLayer.tileTextureUniforms);
            var earthTilesMesh = new THREE.Mesh(earthGeometry, earthTilesMaterial);
            earthTilesMesh.frustumCulled = false;
            earth3DLayer.addObjectToRemoveOnDestroy(earthTilesMesh);
            earth3DLayer.scene.add(earthTilesMesh);

            setUpViewportComputation(earth3DLayer, earthGeometry, shaders[4], shaders[5]);
        }

        function setUpViewportComputation(earth3DLayer, earthGeometry, vertexShader, fragmentShader) {
            var width = earth3DLayer.$canvas.width();
            var height = earth3DLayer.$canvas.height();

            earth3DLayer.viewportXComputationScene = createViewportComputationScene(
            earth3DLayer,
            earthGeometry,
            vertexShader,
            fragmentShader,
            false
        );
            earth3DLayer.viewportXTexture = createViewportComputationTexture(width, height);

            earth3DLayer.viewportYComputationScene = createViewportComputationScene(
            earth3DLayer,
            earthGeometry,
            vertexShader,
            fragmentShader,
            true
        );
            earth3DLayer.viewportYTexture = createViewportComputationTexture(width, height);
        }

        function createViewportComputationScene(earth3DLayer, earthGeometry, vertexShader,
                                            fragmentShader, uIsLatitudeViewportComputer) {

            var viewportComputationScene = new THREE.Scene();

            var material = getShaderMaterial(earth3DLayer, vertexShader, fragmentShader, {
                uIsLatitudeViewportComputer: {
                    type: 'f',
                    value: uIsLatitudeViewportComputer ? 1 : 0
                }
            });

            var viewportComputationMesh = new THREE.Mesh(earthGeometry, material);
            viewportComputationMesh.frustumCulled = false;
            viewportComputationScene.add(viewportComputationMesh);
            earth3DLayer.addObjectToRemoveOnDestroy(viewportComputationMesh);

            return viewportComputationScene;
        }

        function createViewportComputationTexture(width, height) {
            var texture = new THREE.WebGLRenderTarget(width, height, {
                minFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                generateMipmaps: false
            });

            return texture;
        }

        function getViewportBounds(earth3DLayer) {
            var canvasSize = earth3DLayer.getCanvasSize();

            var longitudeRange = getViewportRange(
            earth3DLayer.renderer,
            earth3DLayer.camera,
            earth3DLayer.viewportXComputationScene,
            earth3DLayer.viewportXTexture,
            canvasSize.width,
            canvasSize.height,
            geoUtil.Constants.MAP_MIN_LONGITUDE,
            geoUtil.Constants.MAP_MAX_LONGITUDE
        );

            var latitudeRange = getViewportRange(
            earth3DLayer.renderer,
            earth3DLayer.camera,
            earth3DLayer.viewportYComputationScene,
            earth3DLayer.viewportYTexture,
            canvasSize.width,
            canvasSize.height,
            geoUtil.Constants.MAP_MIN_LATITUDE_MERCATOR,
            geoUtil.Constants.MAP_MAX_LATITUDE_MERCATOR
        );

        // when the edges of the viewport are empty, i.e. the scene is zoomed out too much
        // the lat/long range bounds are set to NaN, we set them to the right boundary values
        // here
            if (isNaN(longitudeRange.bottomLeft)) {
                longitudeRange.bottomLeft = geoUtil.Constants.MAP_MIN_LONGITUDE;
            }
            if (isNaN(longitudeRange.topRight)) {
                longitudeRange.topRight = geoUtil.Constants.MAP_MAX_LONGITUDE;
            }
            if (isNaN(longitudeRange.center)) {
                longitudeRange.center = 0;
            }

            if (isNaN(latitudeRange.bottomLeft)) {
                latitudeRange.bottomLeft = geoUtil.Constants.MAP_MIN_LATITUDE_MERCATOR;
            }
            if (isNaN(latitudeRange.topRight)) {
                latitudeRange.topRight = geoUtil.Constants.MAP_MAX_LATITUDE_MERCATOR;
            }
            if (isNaN(latitudeRange.center)) {
                latitudeRange.center = 0;
            }

        // Note (Sunny): the bounds could cross the international date line, don't use
        // GeoBounds.fromBounds.
            return new GeoBounds(
            new GeoCoordinates(latitudeRange.bottomLeft, longitudeRange.bottomLeft),
            new GeoCoordinates(latitudeRange.topRight, longitudeRange.topRight)
        );
        }

        function getViewportRange(renderer, camera, scene, texture, width, height, minCoordinate, maxCoordinate) {
            renderer.render(scene, camera, texture, true);

            var bottomLeft = getGeoCoordinateAtWindowCoordinates(
            texture,
            renderer,
            1,
            1,
            minCoordinate,
            maxCoordinate
        );
            var topRight = getGeoCoordinateAtWindowCoordinates(
            texture,
            renderer,
            width - 1,
            height - 1,
            minCoordinate,
            maxCoordinate
        );
        // TODO (sunny): can this call be avoided?
            var center = getGeoCoordinateAtWindowCoordinates(
            texture,
            renderer,
            width/2,
            height/2,
            minCoordinate,
            maxCoordinate
        );

            return {
                bottomLeft: bottomLeft,
                topRight: topRight,
                center: center
            };
        }

        function getGeoCoordinateAtWindowCoordinates(texture, renderer, x, y, minCoordinate, maxCoordinate) {
            var pixelBuffer = new Uint8Array(4);
            renderer.readRenderTargetPixels(
            texture,
            x,
            y,
            1,
            1,
            pixelBuffer
        );

            if (pixelBuffer[0] === 0 && pixelBuffer[1] === 0 && pixelBuffer[2] === 0 && pixelBuffer[3] === 0) {
                return NaN;
            }

        // while packing the lat/long of the vertices we transform them into the range [0,1]
        // for convenience of packing them into a vec4. Here we undo that.
        // Reference: http://stackoverflow.com/a/18454838
            var fractionalCoordinate = 0;
            var bitShifts = [256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0];

            for (var i=0; i<4; ++i) {
                fractionalCoordinate += (pixelBuffer[i]/255)/bitShifts[i];
            }
            return fractionalCoordinate * (maxCoordinate - minCoordinate) + minCoordinate;
        }

        function updateTileTextures(earth3DLayer) {
            if (!earth3DLayer.isInitialized()) {
                return;
            }

            var canvasSize = earth3DLayer.getCanvasSize();
            var viewportBounds = getViewportBounds(earth3DLayer);
            var zoomLevel = mapTileService.getZoomLevel(canvasSize.width, canvasSize.height, viewportBounds);

            var tiles = mapTileService.getTiles(
            viewportBounds,
            zoomLevel,
            mapTileService.TileServiceProvider.GOOGLE_MAPS
        );

            earth3DLayer.tileTextureUniforms.uZoomLevel.value = zoomLevel;

            var i;
            for (i=0; i<earth3DLayer.tileTextureUniforms.uTextureTileXYIndices.value.length; ++i) {
                earth3DLayer.tileTextureUniforms.uTextureTileXYIndices.value[i] = INVALID_TILE_XY_VECTOR;
            }
            for (i=0; i<earth3DLayer.tileTextureUniforms.uTileTextures.value.length; ++i) {
                earth3DLayer.tileTextureUniforms.uTileTextures.value[i] = null;
            }

            if (tiles.length > MAX_NUM_TILES) {
                logger.error('too many tiles:', tiles.length, tiles, MAX_NUM_TILES);
                tiles = tiles.slice(0, MAX_NUM_TILES);
            }

            tiles.forEach(function(tile, index){
                var texture = tile.getTileTexture();
                earth3DLayer.tileTextureUniforms.uTileTextures.value[index] = texture;

                var tileXY = new THREE.Vector2(tile.getTileXIndex(), tile.getTileYIndex());
                earth3DLayer.tileTextureUniforms.uTextureTileXYIndices.value[index] = tileXY;
            });
        }

        return Earth3DLayer;
    }]);
