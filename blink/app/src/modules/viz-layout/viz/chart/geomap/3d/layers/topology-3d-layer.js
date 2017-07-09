/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Layer that draw topological entities on a 3d map.
 */

'use strict';

blink.app.factory('Topology3DLayer', ['$q',
    'Logger',
    'util',
    'BaseFeature3DLayer',
    'jsonConstants',
    'topoGlService',
    'geoUtil',
    'chartTypeSpecificationService',
    'GeoEntityMatchingService',
    function($q,
         Logger,
         util,
         BaseFeature3DLayer,
         jsonConstants,
         topoGlService,
         geoUtil,
         chartTypeSpecificationService,
         GeoEntityMatchingService) {

        var BOUNDARIES_SHADERS = [
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.fragment.glsl'
        ];
        var SHAPES_SHADERS = [
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.fragment.glsl'
        ];

        var SHAPE_OPACITY = 0.55;

        var logger = Logger.create('topology-3d-layer');

        function Topology3DLayer(projectionType, mapType, geoConfig, $canvas, renderer, scene,
                             camera, featureIds, dataSeries, featureToDataPointsMapper) {

            this.featureToDataPointsMapper = featureToDataPointsMapper;
            this.fillColors = mapType === chartTypeSpecificationService.chartTypes.GEO_EARTH_AREA;

            this.featureIdToFeatureIndex = {};
            this.featureIndexToFeatureId = {};

        // keep track of meshes we have drawn in the original (non-picking) scene that we would
        // want to remove on destruction
            this.drawnMeshes = [];

            this.shapeMaterial = null;

            this.pickingScene = null;
            this.pickingTexture = null;

            Topology3DLayer.__super.call(
            this,
            projectionType,
            mapType,
            geoConfig,
            $canvas,
            renderer,
            scene,
            camera,
            featureIds,
            dataSeries
        );

        }
        util.inherits(Topology3DLayer, BaseFeature3DLayer);

        function disposeScene(scene, meshes) {
            meshes.forEach(function(mesh){
                scene.remove(mesh);
                mesh.material.dispose();
                mesh.geometry.dispose();
            });
            meshes.length = 0;
        }

        Topology3DLayer.prototype.destroy = function () {
        // call subclass cleanup first otherwise the base class cleanup might remove
        // references to scene before we get a chance to clean up
            if (this.shapeMaterial) {
                this.shapeMaterial.dispose();
                this.shapeMaterial = null;
            }

            disposeScene(this.scene, this.drawnMeshes);

            this.pickingScene = null;

            Topology3DLayer.__super.prototype.destroy.call(this);
        };


        Topology3DLayer.prototype.resize = function (canvasWidth, canvasHeight, $resizeEvent) {
            Topology3DLayer.__super.prototype.resize.call(this);

            if (this.pickingTexture) {
                this.pickingTexture.setSize(canvasWidth, canvasHeight);
            }
        };

        Topology3DLayer.prototype.getDataPointsAtPixel = function (x, y) {
            if (!this.pickingScene) {
                return [];
            }
            this.renderer.render(this.pickingScene, this.camera, this.pickingTexture);

            var pixelBuffer = new Uint8Array(4);
            this.renderer.readRenderTargetPixels(
            this.pickingTexture,
            x,
            this.pickingTexture.height - y,
            1,
            1,
            pixelBuffer
        );

        /* eslint no-bitwise: 1 */
            var featureIndex = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
            if (featureIndex <= 0) {
                return [];
            }

        // feature id is offset by 1 to avoid 0 color on picking texture, we undo that offset
        // before looking up in the list of feature properties
            featureIndex--;

            var featureId = this.featureIndexToFeatureId[featureIndex];
            if (featureId === void 0) {
                return [];
            }

            var featurePropertiesList = GeoEntityMatchingService.matchFeaturesFromCache(
                [featureId],
                'POLYGON',
                this.geoConfig.getType(),
                this.geoConfig.getParent() && this.geoConfig.getParent().getFixedValue(),
                this.geoConfig.getCustomFileGuid()
            );
            if (featurePropertiesList[0].length !== 1) {
                return [];
            }

            var featureProperties = featurePropertiesList[0][0];
            var dataPoints = this.featureToDataPointsMapper(featureProperties);
            return dataPoints;
        };

        Topology3DLayer.prototype.highlightDataPoint = function (dataPoint) {
            if (!this.shapeMaterial) {
                return;
            }
            if (dataPoint === null) {
                this.shapeMaterial.uniforms.uHighlightedFeatureIndex.value = -1;
                return;
            }
            var featureIndex = getFeatureIndexForFeatureId(
            dataPoint.featureIds.x,
            this.featureIdToFeatureIndex,
            this.geoConfig
        );
            if (featureIndex < 0) {
                featureIndex = getFeatureIndexForFeatureId(
                dataPoint.featureIds.y,
                this.featureIdToFeatureIndex,
                this.geoConfig
            );
            }

            if (featureIndex < 0) {
                logger.warn('no feature found for data point', dataPoint);
                this.shapeMaterial.uniforms.uHighlightedFeatureIndex.value = -1;
                return;
            }
            this.shapeMaterial.uniforms.uHighlightedFeatureIndex.value = featureIndex;
        };

        Topology3DLayer.prototype.getFeatureShaderUrls = function () {
            return BOUNDARIES_SHADERS.concat(SHAPES_SHADERS);
        };

        Topology3DLayer.prototype.drawFeatures = function (featureIdToFeatureData, shaders) {
            draw(this, shaders);
        };

        function getFeatureIndexForFeatureId(featureId, featureIdToFeatureIndex, geoConfig) {

            var featureIndex = -1;
            if (featureId === void 0 || featureId === null) {
                return featureIndex;
            }

            if (Object.has(featureIdToFeatureIndex, featureId)) {
                featureIndex = featureIdToFeatureIndex[featureId];
            } else {
                var featurePropertiesList = GeoEntityMatchingService.matchFeaturesFromCache(
                    [featureId],
                    'POINT',
                    geoConfig.getType(),
                    geoConfig.getParent() && geoConfig.getParent().getFixedValue(),
                    geoConfig.getCustomFileGuid()
                );
                if (featurePropertiesList[0].length !== 1) {
                    return -1;
                }

                var featureProperties = featurePropertiesList[0][0];
            // featureId => featureIndex map is created by us always using default id properties
            // hence the default id of the feature will work and an exhaustive search through all
            // possible feature ids is not necessary
                var defaultFeatureId = geoUtil.getDefaultFeatureId(featureProperties, geoConfig.getType());
                featureIndex = featureIdToFeatureIndex[defaultFeatureId];
                if (featureIndex !== void 0) {
                // cache it for later use
                    featureIdToFeatureIndex[featureId] = featureIndex;
                } else {
                    logger.warn('no feature index found for feature with default feature id', defaultFeatureId);
                }
            }

            return featureIndex === void 0 ? -1 : featureIndex;
        }

        function draw(topology3DLayer, shaders) {
        // always load country outlines otherwise the world looks empty
            if (topology3DLayer.geoConfig.getType() !== jsonConstants.geoConfigType.ADMIN_DIV_0) {
                var deferred = $q.defer();
                drawGeoType(topology3DLayer, jsonConstants.geoConfigType.ADMIN_DIV_0, shaders, false, false)
                .then(function(){
                    var drawPromise = drawGeoType(
                        topology3DLayer,
                        topology3DLayer.geoConfig.getType(),
                        shaders,
                        true,
                        topology3DLayer.fillColors
                    );

                    util.executeDeferredOnPromise(drawPromise, deferred);
                }, function(error){
                    deferred.reject(error);
                });
                return deferred.promise;
            } else {
                return drawGeoType(topology3DLayer, topology3DLayer.geoConfig.getType(), shaders, true, topology3DLayer.fillColors);
            }
        }

        function drawGeoType(topology3DLayer, geoType, shaders, enablePicking, fillColors) {
            return topoGlService.getTopoGLForGeoType(geoType).then(function(topoGl){
                if (!topoGl) {
                    return null;
                }
                return drawTopologyData(topology3DLayer, geoType, shaders, topoGl, enablePicking, fillColors);
            });
        }

        function drawTopologyData(topology3DLayer, geoType, shaders, topoGlData, enablePicking, fillColors) {
        // if picking is needed we need to triangulate the polygons of the topological
        // features even if we don't fill visible colors into them so that we can
        // a) fill highlight color if needed b) fill picking color in the picking scene
            if (!enablePicking && !fillColors) {
                return drawTopologyBoundaries(topology3DLayer, geoType, shaders, topoGlData);
            } else {
                var error = drawTopologyBoundaries(topology3DLayer, geoType, shaders, topoGlData);
                if (!!error) {
                    return error;
                }
                return drawTopologyShapes(topology3DLayer, shaders, topoGlData, enablePicking, fillColors);
            }
        }

        function addMesh(topology3DLayer, mesh) {
            mesh.frustumCulled = false;
            topology3DLayer.drawnMeshes.push(mesh);
            topology3DLayer.scene.add(mesh);
        }

        function getLineMaterial(topology3DLayer, vertexShader, fragmentShader, color) {
            return topology3DLayer.getNewRawShaderMaterial({
                uniforms: {
                    uLineColor: {
                        type: 'v4',
                        value: color
                    }
                },
                attributes: {
                    position: {
                        type: 'v3',
                        value: []
                    },
                    vertexHiddenState: {
                        type: 'f',
                        value: 0
                    }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide,
                transparent: true,
                polygonOffset: true,
                polygonOffsetFactor: 0,
                polygonOffsetUnits: -1,
                linewidth: 1.0
            });
        }

        function getBoundaryColorForGeoType(geoType) {
            switch (geoType) {
                case jsonConstants.geoConfigType.ZIP_CODE:
                    return new THREE.Vector4(0.95, 0.95, 0.95, 0.05);
                default:
                    return new THREE.Vector4(0.75, 0.75, 0.75, 0.5);
            }
        }

        function drawTopologyBoundaries(topology3DLayer, geoType, shaders, topoGlData) {
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(topoGlData.vertexPositions, 3));
            geometry.addAttribute('vertexHiddenState', new THREE.BufferAttribute(topoGlData.vertexHiddenStates, 1));

            var lineColor = getBoundaryColorForGeoType(geoType);
            var lineMaterial = getLineMaterial(topology3DLayer, shaders[0], shaders[1], lineColor);
            var boundariesMesh = new THREE.Line(geometry, lineMaterial, THREE.LineStrip);
            addMesh(topology3DLayer, boundariesMesh);
        }

        function getShapeShaderMaterial(topology3DLayer, vertexShader, fragmentShader, opacity) {
            return topology3DLayer.getNewRawShaderMaterial({
                uniforms: {
                    uHighlightedFeatureIndex: {
                        type: 'f',
                        value: -1
                    },
                    uOpacity: {
                        type: 'f',
                        value: isNaN(opacity) ? 1.0 : opacity
                    }
                },
                attributes: {
                    index: {
                        type: 'v3',
                        value: []
                    },
                    position: {
                        type: 'v3',
                        value: []
                    },
                    vertexHiddenState: {
                        type: 'f',
                        value: 0
                    },
                    vertexFeatureIndex: {
                        type: 'f',
                        value: -1
                    },
                    color: {
                        type: 'f',
                        value: 0
                    }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide,
                transparent: true,
                polygonOffset: true,
                polygonOffsetFactor: 0,
                polygonOffsetUnits: -1,
                vertexColors: THREE.VertexColors
            });
        }

        function getIndexedGeometryOffsets(topoGlData) {
            var batchBoundaries = topoGlData.triangleBatchBoundaries;
            var offsets = [];
            for (var i=0; i<batchBoundaries.length; ++i) {
                var batchBoundary = batchBoundaries[i],
                    count = 0;

                if (i < batchBoundaries.length - 1) {
                    var nextBatchBoundary = batchBoundaries[i + 1];
                    count = (nextBatchBoundary.triangleIndex - batchBoundary.triangleIndex) * 3;
                } else {
                    count = topoGlData.triangleIndices.length - (batchBoundary.triangleIndex * 3);
                }

                var offset = {
                    start: batchBoundary.triangleIndex * 3,
                    count: count,
                    index: batchBoundary.vertexIndex
                };
                offsets.push(offset);
            }
            return offsets;
        }

        function getTopologyShapesGeometry(topoGlData, colorAttributesBuffer) {
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('index', new THREE.BufferAttribute(topoGlData.triangleIndices, 1));
            geometry.addAttribute('position', new THREE.BufferAttribute(topoGlData.vertexPositions, 3));
            geometry.addAttribute('vertexHiddenState', new THREE.BufferAttribute(topoGlData.vertexHiddenStates, 1));
            geometry.addAttribute('vertexFeatureIndex', new THREE.BufferAttribute(topoGlData.vertexFeatureIndices, 1));
            geometry.addAttribute('color', colorAttributesBuffer);

            var offsets = getIndexedGeometryOffsets(topoGlData);
            Array.prototype.push.apply(geometry.offsets, offsets);

            return geometry;
        }

        function getFeatureColors(topology3DLayer, featureProperties, allTransparent) {
            var featureColors = new Float32Array(featureProperties.length);
            if (allTransparent) {
                return featureColors;
            }

            var color = new THREE.Color();

            for (var i=0; i<featureProperties.length; ++i) {
                var featureProps = featureProperties[i];
                var featureDataPoints = topology3DLayer.featureToDataPointsMapper(featureProps);

                if (featureDataPoints && featureDataPoints.length > 0) {
                // TODO (sunny): support multiple data points per feature
                    var featureDataPoint = featureDataPoints[0];
                    if (!!featureDataPoint && featureDataPoint.mapColor) {
                    // dataPoint.mapColor is a hex string
                        color.set(featureDataPoint.mapColor);
                        featureColors[i] = color.getHex();
                    }
                }
            }
            return featureColors;
        }

        function getVertexFeatureColors(topoGlData, featureColors) {
            var vertexFeatureColors = new Float32Array(topoGlData.numVertices);
            for (var i=0; i<topoGlData.numVertices; ++i) {
                var featureIndex = topoGlData.vertexFeatureIndices[i];
                vertexFeatureColors[i] = featureColors[featureIndex];
            }
            return vertexFeatureColors;
        }

        function updatePickingFeatures(topology3DLayer, featureProperties) {
            topology3DLayer.featureIdToFeatureIndex = {};
            featureProperties.forEach(function(props, index){
                var featureId = geoUtil.getDefaultFeatureId(props, topology3DLayer.ge);
                if (!featureId) {
                    return;
                }
                topology3DLayer.featureIdToFeatureIndex[featureId] = index;
                topology3DLayer.featureIndexToFeatureId[index] = featureId;
            });
        }

        function drawTopologyShapes(topology3DLayer, shaders, topoGlData, enablePicking, fillColors) {
            if (!enablePicking && !fillColors) {
                var errorMessage = 'At least one of \'enablePicking\' and \'fillColors\' must be true.';
                logger.error(errorMessage);
                return new Error(errorMessage);
            }

            var i;

        // Note (sunny): even if we don't want to fill colors we still draw the shapes with
        // transparent color. This is needed for us to be able to highlight the shapes if needed
            var featureColors = getFeatureColors(topology3DLayer, topoGlData.featureProperties, !fillColors);
            var vertexFeatureColors = getVertexFeatureColors(topoGlData, featureColors);

            for (i=0; i<topoGlData.numVertices; ++i) {
                var featureIndex = topoGlData.vertexFeatureIndices[i];
                vertexFeatureColors[i] = featureColors[featureIndex];
            }

            var shapeMaterial = topology3DLayer.shapeMaterial =
            getShapeShaderMaterial(topology3DLayer, shaders[2], shaders[3], SHAPE_OPACITY);

            var drawnGeometry = getTopologyShapesGeometry(
            topoGlData,
            new THREE.BufferAttribute(vertexFeatureColors, 1)
        );
            var drawnMesh = new THREE.Mesh(drawnGeometry, shapeMaterial);
            addMesh(topology3DLayer, drawnMesh);

            if (enablePicking) {
            // the default color of pixels on the picking texture is 0 hence we
            // needs colors for features to be > 0 which is achieved by setting
            // color to index + 1. the picker code will undo this offset
                var pickingColors = new Float32Array(topoGlData.vertexFeatureIndices.length);
                for (i=0; i<topoGlData.vertexFeatureIndices.length; ++i) {
                    pickingColors[i] = topoGlData.vertexFeatureIndices[i] + 1;
                }
                var pickingGeometry = getTopologyShapesGeometry(
                topoGlData,
                new THREE.BufferAttribute(pickingColors, 1)
            );

                var width = topology3DLayer.$canvas.width();
                var height = topology3DLayer.$canvas.height();

                topology3DLayer.pickingScene = new THREE.Scene();
                topology3DLayer.pickingTexture = new THREE.WebGLRenderTarget(width, height);
                topology3DLayer.pickingTexture.minFilter = THREE.LinearFilter;
                topology3DLayer.pickingTexture.generateMipmaps = false;
                updatePickingFeatures(topology3DLayer, topoGlData.featureProperties);

            // the picking mesh gets a different instance of the shader material so that
            // the uniform changes in the drawn mesh does not affect picking mesh
                shapeMaterial = getShapeShaderMaterial(topology3DLayer, shaders[2], shaders[3]);
                var pickingMesh = new THREE.Mesh(pickingGeometry, shapeMaterial);
                pickingMesh.frustumCulled = false;
                topology3DLayer.pickingScene.add(pickingMesh);
            }
        }

        return Topology3DLayer;
    }]);
