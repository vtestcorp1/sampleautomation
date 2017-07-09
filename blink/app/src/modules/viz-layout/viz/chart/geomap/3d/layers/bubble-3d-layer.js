/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Layer that draws 3D bubbles representing a measure corresponding to topological entities
 */

'use strict';

blink.app.factory('Bubble3DLayer', ['$q', 'Logger', 'util', 'BaseFeature3DLayer',
    function($q, Logger, util, BaseFeature3DLayer) {

        var FEATURE_SHADERS = [
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.fragment.glsl'
        ];

        var DEFAULT_BUBBLE_OPACITY = 0.85,
        // TODO (sunny): make this a function of current resolution
            BUBBLE_RADIUS_MIN = 16,
            BUBBLE_RADIUS_MAX = 70;

        var logger = Logger.create('bubble-3d-layer');

        function Bubble3DLayer(projectionType, mapType, geoType, $canvas, renderer,
                           scene, camera, featureIds, dataSeries) {

            Bubble3DLayer.__super.apply(this, arguments);

            this.pickingMesh = null;

        }
        util.inherits(Bubble3DLayer, BaseFeature3DLayer);

        Bubble3DLayer.prototype.getFeatureShaderUrls = function () {
            return FEATURE_SHADERS;
        };

        Bubble3DLayer.prototype.getPickingMesh = function () {
            return this.pickingMesh;
        };

        Bubble3DLayer.prototype.drawFeatures = function (featureIdToFeatureData, shaders) {
            Bubble3DLayer.__super.prototype.drawFeatures.apply(this, arguments);
            draw(this, featureIdToFeatureData, shaders);
        };

        Bubble3DLayer.prototype.getGeometry = function (featureIdToFeatureData) {
            return getGeometry(
            featureIdToFeatureData,
            this.dataSeries,
            this.getNumDataPoints(),
            this.getRelativeDataPointWeight.bind(this),
            this.getDataPointIndex.bind(this)
        );
        };

        function getGeometry(featureIdToFeatureData, dataSeries, numDataPoints, weightFunction, dataPointIndexFunction) {
            var bufferAttributes = getBufferAttributes(
            featureIdToFeatureData,
            dataSeries,
            numDataPoints,
            weightFunction,
            dataPointIndexFunction
        );

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(bufferAttributes.vertexPositions, 3));
            geometry.addAttribute('weight', new THREE.BufferAttribute(bufferAttributes.vertexWeights, 1));
            geometry.addAttribute('vertexDataPointIndex',
            new THREE.BufferAttribute(bufferAttributes.vertexDataPointIndices, 1));
            geometry.addAttribute('color', new THREE.BufferAttribute(bufferAttributes.vertexColors, 1));

            return geometry;
        }

        function getFeatureShaderMaterial(bubble3DLayer, vertexShader, fragmentShader, isPickingGeometry) {
            return bubble3DLayer.getNewRawShaderMaterial({
                uniforms: {
                    uOpacity: {
                        type: 'f',
                        value: DEFAULT_BUBBLE_OPACITY
                    },
                    uMinBubbleRadius: {
                        type: 'f',
                        value: BUBBLE_RADIUS_MIN
                    },
                    uMaxBubbleRadius: {
                        type: 'f',
                        value: BUBBLE_RADIUS_MAX
                    },
                    uIsPickingMesh: {
                        type: 'f',
                        value: isPickingGeometry ? 1 : 0
                    }
                },
                attributes: {
                    position: {
                        type: 'v3',
                        value: []
                    },
                    weight: {
                        type: 'f',
                        value: 0
                    },
                    vertexDataPointIndex: {
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

        function getBufferAttributes(featureIdToFeatureData, dataSeries, numDataPoints,
                                 weightFunction, dataPointIndexFunction) {

            var vertexPositions = new Float32Array(3 * numDataPoints);
            var vertexWeights = new Float32Array(numDataPoints);
            var vertexDataPointIndices = new Float32Array(numDataPoints);
        // TODO (sunny): color as u_int32?
            var vertexColors = new Float32Array(numDataPoints);
            var finalVertexCount = 0;
            var color = new THREE.Color();
            var i, j;

            for (i=0; i<dataSeries.length; ++i) {
                var dataSerie = dataSeries[i];
                for (j=0; j<dataSerie.data.length; ++j) {
                    var dataPoint = dataSerie.data[j];

                    var featureId = dataPoint.featureIds.x;
                    var featureData = featureIdToFeatureData[featureId];
                    if (!featureData) {
                        logger.error('missing data for feature id', featureId, featureIdToFeatureData);
                        continue;
                    }
                    var centroid = featureData.centroid;
                    if (!centroid) {
                        continue;
                    }

                    var vertexOffset = finalVertexCount * 3;
                    vertexPositions[vertexOffset] = centroid.latitude;
                    vertexPositions[vertexOffset + 1] = centroid.longitude;
                    vertexPositions[vertexOffset + 2] = 0;

                    vertexWeights[finalVertexCount] = weightFunction(dataPoint.measureRangeFraction);

                    color.set(dataPoint.mapColor);
                    vertexColors[finalVertexCount] = color.getHex();

                    vertexDataPointIndices[finalVertexCount] = dataPointIndexFunction(dataPoint);

                    finalVertexCount++;
                }
            }

            vertexPositions = vertexPositions.subarray(0, 3 * finalVertexCount);
            vertexWeights = vertexWeights.subarray(0, finalVertexCount);
            vertexDataPointIndices = vertexDataPointIndices.subarray(0, finalVertexCount);
            vertexColors = vertexColors.subarray(0, finalVertexCount);

            return {
                vertexPositions: vertexPositions,
                vertexWeights: vertexWeights,
                vertexDataPointIndices: vertexDataPointIndices,
                vertexColors: vertexColors
            };
        }

        function draw(bubble3DLayer, featureIdToFeatureData, shaders) {
            var geometry = bubble3DLayer.getGeometry(featureIdToFeatureData);
            var material = getFeatureShaderMaterial(bubble3DLayer, shaders[0], shaders[1], false);
            $.extend(material.uniforms, bubble3DLayer.getDataPointHighlightingUniforms());

            var pointCloud = new THREE.PointCloud(geometry, material);
            pointCloud.frustumCulled = false;

            bubble3DLayer.addObjectToRemoveOnDestroy(pointCloud);
            bubble3DLayer.scene.add(pointCloud);

        // the picking mesh gets a different instance of the shader material so that
        // the uniform changes in the drawn mesh does not affect picking mesh
            var pickingMaterial = getFeatureShaderMaterial(bubble3DLayer, shaders[0], shaders[1], true);
            var pickingPointCloud = new THREE.PointCloud(geometry, pickingMaterial);
            pickingPointCloud.frustumCulled = false;
            bubble3DLayer.pickingMesh = pickingPointCloud;
        }

        return Bubble3DLayer;
    }]);
