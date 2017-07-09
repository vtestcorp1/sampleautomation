/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Layer that draws graphs representing connections between geographical entities.
 */

'use strict';

blink.app.factory('Graph3DLayer', ['$q', 'Logger', 'util', 'BaseFeature3DLayer',
    function($q, Logger, util, BaseFeature3DLayer) {

        var FEATURE_SHADERS = [
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.fragment.glsl'
        ];

        var EDGE_MAX_ALTITUDE = 0.3,
            MAX_SEGMENTS_PER_EDGE = 500;

        var logger = Logger.create('graph-3d-layer');

        function Graph3DLayer(projectionType, mapType, geoType, $canvas, renderer,
                        scene, camera, featureIds, dataSeries) {

            Graph3DLayer.__super.apply(this, arguments);

            this.pickingMesh = null;
        }
        util.inherits(Graph3DLayer, BaseFeature3DLayer);

        Graph3DLayer.prototype.getFeatureShaderUrls = function () {
            return FEATURE_SHADERS;
        };

        BaseFeature3DLayer.prototype.getPickingMesh = function () {
            return this.pickingMesh;
        };

        Graph3DLayer.prototype.drawFeatures = function (featureProperties,
                                                  featureCentroidCoordinates,
                                                  shaders) {
            Graph3DLayer.__super.prototype.drawFeatures.apply(this, arguments);
            draw(this, featureProperties, featureCentroidCoordinates, shaders);
        };

        function getFeatureShaderMaterial(graph3DLayer, vertexShader, fragmentShader, isPickingMesh) {
            return graph3DLayer.getNewRawShaderMaterial({
                uniforms: {
                    uIsPickingMesh: {
                        type: 'f',
                        value: isPickingMesh ? 1 : 0
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
                    },
                    featureWeight: {
                        type: 'f',
                        value: 0
                    },
                    featureColor: {
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
                linewidth: 2,
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

            var numEdges = 0,
                maxEuclideanDistance = Math.sqrt(360 * 360 + 180 * 180),
                maxNumVertices = numDataPoints * (MAX_SEGMENTS_PER_EDGE + 2),
            // +2 for transparent vertices connecting edges in the combined geometry
                vertexPositions = new Float32Array(maxNumVertices * 3),
                vertexHiddenStates = new Float32Array(maxNumVertices),
                vertexWeights = new Float32Array(maxNumVertices),
                vertexColors = new Float32Array(maxNumVertices),
                vertexDataPointIndices = new Float32Array(maxNumVertices),
                i, j, k, numVerticesInEdge, offset, vertexIndexInSegment,
                latDelta, lonDelta, latPerSegment, lonPerSegment, euclideanDistance,
                vertexIndex = 0,
                edgeStartVertexIndex = 0,
                color = new THREE.Color();

            for (i=0; i<dataSeries.length; ++i) {
                var dataSerie = dataSeries[i];
                for (j=0; j<dataSerie.data.length; ++j) {
                    var dataPoint = dataSerie.data[j];

                    var originFeatureId = dataPoint.featureIds.x;
                    var destinationFeatureId = dataPoint.featureIds.y;

                    var originFeatureData = featureIdToFeatureData[originFeatureId];
                    if (!originFeatureData) {
                        logger.error('missing data for origin feature id', originFeatureId, featureIdToFeatureData);
                        continue;
                    }

                    var destinationFeatureData = featureIdToFeatureData[destinationFeatureId];
                    if (!destinationFeatureData) {
                        logger.error(
                        'missing data for destination feature id',
                        destinationFeatureData,
                        featureIdToFeatureData
                    );
                        continue;
                    }

                    var originCentroid = originFeatureData.centroid;
                    if (!originCentroid) {
                        continue;
                    }

                    var destinationCentroid = destinationFeatureData.centroid;
                    if (!destinationCentroid) {
                        continue;
                    }

                    latDelta = destinationCentroid.latitude - originCentroid.latitude;
                    lonDelta = destinationCentroid.longitude - originCentroid.longitude;

                    if (latDelta === 0 && lonDelta === 0) {
                        continue;
                    }

                    numEdges++;
                    var weight = weightFunction(dataPoint.measureRangeFraction);
                    var dataPointIndex = dataPointIndexFunction(dataPoint);

                    color.set(dataPoint.mapColor);
                    var vertexColor = color.getHex();

                    edgeStartVertexIndex = vertexIndex;

                    euclideanDistance = Math.sqrt(latDelta * latDelta + lonDelta * lonDelta);
                    numVerticesInEdge = Math.ceil(euclideanDistance * MAX_SEGMENTS_PER_EDGE/maxEuclideanDistance);
                    latPerSegment = latDelta/numVerticesInEdge;
                    lonPerSegment = lonDelta/numVerticesInEdge;

                // add a transparent vertex each at the beginning and the end of the segment
                    for (k=-1; k<=numVerticesInEdge; ++k) {

                        vertexIndexInSegment = Math.max(0, Math.min(numVerticesInEdge - 1, k));

                        offset = 3 * (vertexIndex++);

                        vertexPositions[offset] = originCentroid.latitude + (latPerSegment * vertexIndexInSegment);
                        vertexPositions[offset + 1] = originCentroid.longitude + (lonPerSegment * vertexIndexInSegment);
                    // assuming circular arc
                        vertexPositions[offset + 2] =
                        EDGE_MAX_ALTITUDE * Math.sin(Math.acos(1 - 2 * (vertexIndexInSegment/numVerticesInEdge)));

                    // if this is the additional vertex at beginning and end, it is transparent
                        vertexHiddenStates[vertexIndex - 1] = k != vertexIndexInSegment;
                        vertexWeights[vertexIndex - 1] = weight;
                        vertexColors[vertexIndex - 1] = vertexColor;
                        vertexDataPointIndices[vertexIndex - 1] = dataPointIndex;
                    }
                }
            }

            var numVertices = vertexIndex;

            vertexPositions = vertexPositions.subarray(0, numVertices * 3);
            vertexHiddenStates = vertexHiddenStates.subarray(0, numVertices);
            vertexDataPointIndices = vertexDataPointIndices.subarray(0, numVertices);
            vertexWeights = vertexWeights.subarray(0, numVertices);
            vertexColors = vertexColors.subarray(0, numVertices);

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(vertexPositions, 3));
            geometry.addAttribute('vertexHiddenState', new THREE.BufferAttribute(vertexHiddenStates, 1));
            geometry.addAttribute('featureWeight', new THREE.BufferAttribute(vertexWeights, 1));
            geometry.addAttribute('featureColor', new THREE.BufferAttribute(vertexColors, 1));
            geometry.addAttribute('vertexDataPointIndex', new THREE.BufferAttribute(vertexDataPointIndices, 1));

            return geometry;
        }

        function draw(graph3DLayer, featureIdToFeatureData, shaders) {
            var geometry = getBufferGeometry(
            featureIdToFeatureData,
            graph3DLayer.dataSeries,
            graph3DLayer.getNumDataPoints(),
            graph3DLayer.getRelativeDataPointWeight.bind(graph3DLayer),
            graph3DLayer.getDataPointIndex.bind(graph3DLayer)
        );

            var material = getFeatureShaderMaterial(graph3DLayer, shaders[0], shaders[1], false);
            $.extend(material.uniforms, graph3DLayer.getDataPointHighlightingUniforms());
            var mesh =  new THREE.Line(geometry, material, THREE.LineStrip);
            mesh.frustumCulled = false;

            graph3DLayer.addObjectToRemoveOnDestroy(mesh);
            graph3DLayer.scene.add(mesh);

            var pickingMaterial = getFeatureShaderMaterial(graph3DLayer, shaders[0], shaders[1], true);
            var pickingMesh = new THREE.Mesh(geometry, pickingMaterial);
            pickingMesh.furstumCulled = false;
            graph3DLayer.pickingMesh = pickingMesh;
        }

        return Graph3DLayer;
    }]);
