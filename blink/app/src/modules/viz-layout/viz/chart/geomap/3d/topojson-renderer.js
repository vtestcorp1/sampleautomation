/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A service that renders topojson features onto a THREE.js scene
 * (e.g. zip, state).
 */

'use strict';

blink.app.factory('topoJSONRenderer', ['$q', '$http', 'Logger', 'geoUtil', 'util',
    'jsonConstants', 'topoGlService',
    function ($q, $http, Logger, geoUtil, util, jsonConstants, topoGlService) {

        var logger = Logger.create('topo-json-renderer');

        var Shaders = {
            Boundaries: {
                vertex: [
                    'precision mediump float;',
                    'precision mediump int;',

                    'uniform mat4 modelViewMatrix;',
                    'uniform mat4 projectionMatrix;',

                    'attribute vec3 position;',
                    'attribute float vertexHiddenState;',

                    'varying float vVertexHiddenState;',
                    'varying vec4 vVertexViewSpacePosition;',
                    'varying vec4 vOriginViewSpacePosition;',

                    'void main(){',
                    'vVertexHiddenState = vertexHiddenState;',

                    'vVertexViewSpacePosition = modelViewMatrix * vec4( position, 1.0 );',
                    'vOriginViewSpacePosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0 );',

                    'gl_Position = projectionMatrix * vVertexViewSpacePosition;',
                    '}'
                ].join('\n'),

                fragment: [
                    '#extension GL_EXT_frag_depth : enable',

                    'precision mediump float;',
                    'precision mediump int;',

                    'varying float vVertexHiddenState;',
                    'varying vec4 vVertexViewSpacePosition;',
                    'varying vec4 vOriginViewSpacePosition;',

                    'void main(){',

                    'vec4 color = vec4(1.0, 1.0, 1.0, vVertexHiddenState == 1.0 ? 0.0 : 0.1);',
                    'gl_FragColor = color;',

                    'float fragment_distance_from_camera = length(vVertexViewSpacePosition);',
                    'bool isCloserPOI = abs(dot(vVertexViewSpacePosition,' +
                ' vOriginViewSpacePosition)/(fragment_distance_from_camera * fragment_distance_from_camera)) >=' +
                ' 1.0;',
                    'gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? 0.004 : 0.001);',

                    '}'
                ].join('\n')
            },
            Shapes: {
                vertex: [
                    'precision mediump float;',
                    'precision mediump int;',

                    'uniform mat4 modelViewMatrix;',
                    'uniform mat4 projectionMatrix;',

                    'attribute vec3 position;',
                    'attribute float vertexHiddenState;',
                    'attribute float color;',

                    'varying float vVertexHiddenState;',
                    'varying vec4 vColor;',

                    'varying vec4 vVertexViewSpacePosition;',
                    'varying vec4 vOriginViewSpacePosition;',

                    'void main(){',
                    'vVertexHiddenState = vertexHiddenState;',

                    'float r = floor(color / 256.0 / 256.0);',
                    'float g = floor((color - r * 256.0 * 256.0) / 256.0);',
                    'float b = floor(color - r * 256.0 * 256.0 - g * 256.0);',
                    'vColor = vec4(r/255.0, g/255.0, b/255.0, vVertexHiddenState == 1.0 ? 0.0 : 1.0);',

                    'vVertexViewSpacePosition = modelViewMatrix * vec4( position, 1.0 );',
                    'vOriginViewSpacePosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0 );',

                    'gl_Position = projectionMatrix * vVertexViewSpacePosition;',

                    '}'
                ].join('\n'),

                fragment: [
                    '#extension GL_EXT_frag_depth : enable',
                    'precision mediump float;',
                    'precision mediump int;',

                    'varying float vVertexHiddenState;',
                    'varying vec4 vColor;',

                    'varying vec4 vVertexViewSpacePosition;',
                    'varying vec4 vOriginViewSpacePosition;',

                    'void main(){',
                    'gl_FragColor = vec4(vColor[0], vColor[1], vColor[2], vVertexHiddenState == 1.0 && length(vColor) !=' +
                ' 0.0 ' +
                ' ?' +
                ' 0.0 : 1.0);',
                    'float fragment_distance_from_camera = length(vVertexViewSpacePosition);',
                    'bool isCloserPOI = abs(dot(vVertexViewSpacePosition,' +
                ' vOriginViewSpacePosition)/(fragment_distance_from_camera * fragment_distance_from_camera)) >=' +
                ' 1.0;',
                    'gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? 0.004 : 0.001);',
                    '}'
                ].join('\n')
            }
        };


        function renderTopologyData(topoGlData, drawingScene, pickingScene, featurePropertiesDataPointsGetter) {
            var featureProperties = topoGlData.featureProperties;

            var i;
            var color = new THREE.Color();

            var featureColors = new Float32Array(featureProperties.length);
            for (i=0; i<featureProperties.length; ++i) {
                var featureProps = featureProperties[i];
                var featureDataPoints = featurePropertiesDataPointsGetter(featureProps);
                if (featureDataPoints && featureDataPoints.length > 0) {
                // TODO (sunny): support multiple data points per feature
                    var featureDataPoint = featureDataPoints[0];
                    if (!!featureDataPoint && featureDataPoint.color) {
                    // dataPoint.color is a hex string
                        color.set(featureDataPoint.color);
                        featureColors[i] = color.getHex();
                    }
                }
            }

            var vertexFeatureColors = new Float32Array(topoGlData.numVertices);
            for (i=0; i<topoGlData.numVertices; ++i) {
                var featureIndex = topoGlData.vertexFeatureIndices[i];
                vertexFeatureColors[i] = featureColors[featureIndex];
            }

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(topoGlData.vertexPositions, 3));
            geometry.addAttribute('vertexHiddenState', new THREE.BufferAttribute(topoGlData.vertexHiddenStates, 1));

            var lineMaterial = new THREE.RawShaderMaterial({
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
                vertexShader: Shaders.Boundaries.vertex,
                fragmentShader: Shaders.Boundaries.fragment,
                side: THREE.DoubleSide,
                transparent: true,
                linewidth: 1
            });

            var boundariesMesh = new THREE.Line(geometry, lineMaterial, THREE.LineStrip);
            drawingScene.add(boundariesMesh);

            var scenes = [drawingScene, pickingScene];
            scenes.forEach(function(scene, index){
                geometry = new THREE.BufferGeometry();
                geometry.addAttribute('index', new THREE.BufferAttribute(topoGlData.triangleIndices, 1));
                geometry.addAttribute('normal', new THREE.BufferAttribute(topoGlData.vertexPositions, 3));
                geometry.addAttribute('position', new THREE.BufferAttribute(topoGlData.vertexPositions, 3));
                geometry.addAttribute('vertexHiddenState', new THREE.BufferAttribute(topoGlData.vertexHiddenStates, 1));
                if (index === 0) {
                    geometry.addAttribute('color', new THREE.BufferAttribute(vertexFeatureColors, 1));
                } else {
                    geometry.addAttribute('color', new THREE.BufferAttribute(topoGlData.vertexFeatureIndices, 1));
                }

                var batchBoundaries = topoGlData.triangleBatchBoundaries;
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
                    geometry.offsets.push(offset);
                }
                geometry.computeBoundingSphere();

                var shapeMaterial = new THREE.RawShaderMaterial({
                    attributes: {
                        index: {
                            type: 'v3',
                            value: []
                        },
                        normal: {
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
                        color: {
                            type: 'f',
                            value: 0
                        }
                    },
                    vertexShader: Shaders.Shapes.vertex,
                    fragmentShader: Shaders.Shapes.fragment,
                    side: THREE.DoubleSide,
                    transparent: true,
                    vertexColors: THREE.VertexColors
                });

                var shapesMesh = new THREE.Mesh(geometry, shapeMaterial);
                scene.add(shapesMesh);
            });
        }

        function renderGeoType(geoType, drawingScene, pickingScene, featurePropertiesDataPointsGetter, callback) {
            topoGlService.getTopoGLForGeoType(geoType).then(function(topoGl){
                if (topoGl) {
                    renderTopologyData(topoGl, drawingScene, pickingScene, featurePropertiesDataPointsGetter);
                }
                if (callback) {
                    callback();
                }
            }, function(error){
                logger.error('error in getting topology data', arguments);
                if (callback) {
                    callback(error);
                }
            });
        }

        function render(dataGeoType, scene, pickingScene, featurePropertiesDataPointsGetter, callback) {
            if (dataGeoType !== jsonConstants.geoType.COUNTRY) {
                renderGeoType(jsonConstants.geoType.COUNTRY, scene, null, function(){
                    renderGeoType(dataGeoType, scene, pickingScene, featurePropertiesDataPointsGetter, callback);
                });
            } else {
                renderGeoType(dataGeoType, scene, pickingScene, featurePropertiesDataPointsGetter, callback);
            }
        }

        return {
            render: render
        };
    }]);
