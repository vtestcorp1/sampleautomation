/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Layer that draws 3D bars representing a measure corresponding to topological entities
 */

'use strict';

blink.app.factory('Bar3DLayer', ['$q', 'Logger', 'util', 'BaseFeature3DLayer',
    function($q, Logger, util, BaseFeature3DLayer) {

        var FEATURE_SHADERS = [
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.fragment.glsl'
        ];

        var MAX_INDEX = 65535,
            DEFAULT_BAR_OPACITY = 0.85,
        // TODO (sunny): make this a function of current resolution
            BAR_HEIGHT_MIN = 0.1,
            BAR_HEIGHT_MAX = 0.5,
            BAR_WIDTH = 0.8;

        var logger = Logger.create('bar-3d-layer');

        function Bar3DLayer(projectionType, mapType, geoType, $canvas, renderer,
                           scene, camera, featureIds, dataSeries) {

            Bar3DLayer.__super.apply(this, arguments);

            this.pickingMesh = null;
        }
        util.inherits(Bar3DLayer, BaseFeature3DLayer);

        Bar3DLayer.prototype.getFeatureShaderUrls = function () {
            return FEATURE_SHADERS;
        };

        BaseFeature3DLayer.prototype.getPickingMesh = function () {
            return this.pickingMesh;
        };

        Bar3DLayer.prototype.drawFeatures = function (featureProperties,
                                                     featureCentroidCoordinates,
                                                     shaders) {
            Bar3DLayer.__super.prototype.drawFeatures.apply(this, arguments);
            draw(this, featureProperties, featureCentroidCoordinates, shaders);
        };

        function getFeatureShaderMaterial(bar3DLayer, vertexShader, fragmentShader, isPickingMesh) {
            return bar3DLayer.getNewRawShaderMaterial({
                uniforms: {
                    uOpacity: {
                        type: 'f',
                        value: DEFAULT_BAR_OPACITY
                    },
                    uBarWidth: {
                        type: 'f',
                        value: BAR_WIDTH
                    },
                    uMinBarHeight: {
                        type: 'f',
                        value: BAR_HEIGHT_MIN
                    },
                    uMaxBarHeight: {
                        type: 'f',
                        value: BAR_HEIGHT_MAX
                    },
                    uIsPickingMesh: {
                        type: 'f',
                        value: isPickingMesh ? 1 : 0
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
                    isTopVertex: {
                        type: 'f',
                        value: 0
                    },
                    featureWeight: {
                        type: 'f',
                        value: 0
                    },
                    featureColor: {
                        type: 'f',
                        value: 0
                    },
                    featureCenterLatitude: {
                        type: 'f',
                        value: 0
                    },
                    featureCenterLongitude: {
                        type: 'f',
                        value: 0
                    },
                    vertexDataPointIndex: {
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

        function getBufferGeometry(featureIdToFeatureData, dataSeries, numDataPoints,
                               weightFunction, dataPointIndexFunction) {

            var numCuboids = 0,
                numVerticesPerCube = 8,
                vertexPositions = new Float32Array(numDataPoints * numVerticesPerCube * 3),
                vertexDataPointIndices = new Float32Array(numDataPoints * numVerticesPerCube),
                isTopVertexValues = new Float32Array(numDataPoints * numVerticesPerCube),
                vertexWeights = new Float32Array(numDataPoints * numVerticesPerCube),
                vertexColors = new Float32Array(numDataPoints * numVerticesPerCube),
                vertexFeatureCenterLatitudes = new Float32Array(numDataPoints * numVerticesPerCube),
                vertexFeatureCenterLongitudes = new Float32Array(numDataPoints * numVerticesPerCube),
                numRectanglesPerCube = 5,
                numTrianglesPerCube = numRectanglesPerCube * 2,
                triangleVertexIndices = new Uint16Array(numDataPoints * numTrianglesPerCube * 3),
                geometryOffsets = [],
                i, j, k, m,
                vertexIndex = 0,
                cuboidStartVertexIndex = 0,
                halfBarWidth = BAR_WIDTH/2,
                color = new THREE.Color();

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

                    numCuboids++;
                    var weight = weightFunction(dataPoint.measureRangeFraction);
                    var dataPointIndex = dataPointIndexFunction(dataPoint);

                    color.set(dataPoint.mapColor);
                    var vertexColor = color.getHex();

                    cuboidStartVertexIndex = vertexIndex;

                // The cuboid geometry is defined using this vertex arrangement
                //           4--------5
                //           |        |
                //           |        |
                //  4--------0--------1--------5
                //  |        |        |        |
                //  |        |        |        |
                //  6--------2--------3--------7
                //           |        |
                //           |        |
                //           6--------7
                //
                //  We don't use any triangles at the bottom (0,1,3,2) as it will always be hidden.
                //  Note that (4, 5, 7, 6) form the top face.
                //  The visible triangles, ordered such that the normal is always outwards using
                //  right hand rule are:
                //  vertical back face: (4, 5, 1), (1, 0, 4)
                //  vertical front face: (6, 2, 3), (3, 7, 6)
                //  vertical right face: (3, 1, 5), (5, 7, 3)
                //  vertical left face: (4, 0, 2), (2, 6, 4)
                //  top face: (4, 6, 7), (7, 5, 4)

                // 8 vertices, 4 at the bottom face, 4 at the top
                // we set at altitude of all 8 to 0, the vertex shader will
                // dynamically decide the altitude of the top vertices (4, 5, 6, 7)
                // depending the value of the measure.
                    for (k=0; k<2; ++k) {
                    // first iteration is bottom face, second iteration is top face
                        var isTopVertex = k == 1 ? 1 : 0;

                        for (m=0; m<4; ++m) {
                            var offset = 3 * (vertexIndex++);
                            var row = Math.floor(m/2);
                            var col = m%2;

                            vertexPositions[offset] = centroid.latitude - halfBarWidth + (row * BAR_WIDTH);
                            vertexPositions[offset + 1] = centroid.longitude - halfBarWidth + (col * BAR_WIDTH);
                            vertexPositions[offset + 2] = 0;

                            vertexFeatureCenterLatitudes[vertexIndex - 1] = centroid.latitude;
                            vertexFeatureCenterLongitudes[vertexIndex - 1] = centroid.longitude;
                            isTopVertexValues[vertexIndex - 1] = isTopVertex;
                            vertexWeights[vertexIndex - 1] = weight;
                            vertexColors[vertexIndex - 1] = vertexColor;
                            vertexDataPointIndices[vertexIndex - 1] = dataPointIndex;
                        }
                    }

                // Note (sunny): the rationale here is explained in topojson-topogl-converter.
                    var startTriangleIndex = (numCuboids - 1) * numTrianglesPerCube;
                    var currentOffset = geometryOffsets.last();

                    if (!currentOffset || vertexIndex - currentOffset.index > MAX_INDEX) {
                        var newOffset = {
                            start: startTriangleIndex * 3,
                            count: 0,
                            index: cuboidStartVertexIndex
                        };
                        geometryOffsets.push(newOffset);
                        currentOffset = newOffset;
                    }

                    var vertexOffset = cuboidStartVertexIndex - currentOffset.index;
                    var triangleOffset = startTriangleIndex * 3;

                    var triangleVertices = [
                        4,5,1, 1,0,4,
                        6,2,3, 3,7,6,
                        3,1,5, 5,7,3,
                        4,0,2, 2,6,4,
                        4,6,7, 7,5,4
                    ];

                    for (m=0; m<triangleVertices.length; ++m) {
                        triangleVertexIndices[triangleOffset++] = vertexOffset + triangleVertices[m];
                    }

                    currentOffset.count += numTrianglesPerCube * 3;
                }
            }

            var numVertices = vertexIndex;
            var numTriangles = numCuboids * numTrianglesPerCube;

            vertexPositions = vertexPositions.subarray(0, numVertices * 3);
            vertexDataPointIndices = vertexDataPointIndices.subarray(0, numVertices);
            triangleVertexIndices = triangleVertexIndices.subarray(0, numTriangles * 3);
            isTopVertexValues = isTopVertexValues.subarray(0, numVertices);
            vertexWeights = vertexWeights.subarray(0, numVertices);
            vertexColors = vertexColors.subarray(0, numVertices);
            vertexFeatureCenterLatitudes = vertexFeatureCenterLatitudes.subarray(0, numVertices);
            vertexFeatureCenterLongitudes = vertexFeatureCenterLongitudes.subarray(0, numVertices);

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('index', new THREE.BufferAttribute(triangleVertexIndices, 1));
            geometry.addAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
            geometry.addAttribute('isTopVertex', new THREE.BufferAttribute(isTopVertexValues, 1));
            geometry.addAttribute('featureWeight', new THREE.BufferAttribute(vertexWeights, 1));
            geometry.addAttribute('featureColor', new THREE.BufferAttribute(vertexColors, 1));
            geometry.addAttribute('featureCenterLatitude', new THREE.BufferAttribute(vertexFeatureCenterLatitudes, 1));
            geometry.addAttribute('featureCenterLongitude', new THREE.BufferAttribute(vertexFeatureCenterLongitudes, 1));
            geometry.addAttribute('vertexDataPointIndex', new THREE.BufferAttribute(vertexDataPointIndices, 1));

            geometryOffsets.forEach(function(geometryOffset){
                geometry.addDrawCall(geometryOffset.start, geometryOffset.count, geometryOffset.index);
            });

            return geometry;
        }

        function draw(bar3DLayer, featureIdToFeatureData, shaders) {
            var geometry = getBufferGeometry(
            featureIdToFeatureData,
            bar3DLayer.dataSeries,
            bar3DLayer.getNumDataPoints(),
            bar3DLayer.getRelativeDataPointWeight.bind(bar3DLayer),
            bar3DLayer.getDataPointIndex.bind(bar3DLayer)
        );

            var material = getFeatureShaderMaterial(bar3DLayer, shaders[0], shaders[1], false);
            $.extend(material.uniforms, bar3DLayer.getDataPointHighlightingUniforms());
            var mesh = new THREE.Mesh(geometry, material);
            mesh.frustumCulled = false;

            bar3DLayer.addObjectToRemoveOnDestroy(mesh);
            bar3DLayer.scene.add(mesh);

            var pickingMaterial = getFeatureShaderMaterial(bar3DLayer, shaders[0], shaders[1], true);
            var pickingMesh = new THREE.Mesh(geometry, pickingMaterial);
            pickingMesh.furstumCulled = false;
            bar3DLayer.pickingMesh = pickingMesh;
        }

        return Bar3DLayer;
    }]);
