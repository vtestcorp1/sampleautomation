/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Layer that draws 3D bubbles representing a measure corresponding to topological entities
 */

'use strict';

blink.app.factory('HeatMap3DLayer', ['$q', 'Logger', 'util', 'Bubble3DLayer',
    function($q, Logger, util, Bubble3DLayer) {

        var FEATURE_SHADERS = [
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.fragment.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.vertex.glsl',
            'src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.fragment.glsl'
        ];
        var COLOR_GRADIENT_COLORS = ["#00f", "#0ff", "#0f0", "#ff0", "#f00"];
        var POINT_CLOUD_POINT_SIZE = 20.0;


        var logger = Logger.create('heat-map-3d-layer');
        var colorGradient = null;

        function HeatMap3DLayer(projectionType, mapType, geoType, $canvas, renderer,
                            scene, camera, featureIds, featureToDataPointsMapper) {

            HeatMap3DLayer.__super.apply(this, arguments);

            this.pickingMesh = null;

            this.blendingScene = null;
            this.blendingTexture = null;
            this.blendingTextureSizeUniform = {
                type: 'v2',
                value: new THREE.Vector2($canvas.width(), $canvas.height())
            };
        }
        util.inherits(HeatMap3DLayer, Bubble3DLayer);

        HeatMap3DLayer.prototype.render = function () {
            if (this.blendingScene) {
                this.renderer.render(this.blendingScene, this.camera, this.blendingTexture, true);
            }
            HeatMap3DLayer.__super.prototype.render.call(this);
        };

        HeatMap3DLayer.prototype.resize = function (canvasWidth, canvasHeight, $resizeEvent) {
            if (this.blendingTextureSizeUniform) {
                this.blendingTextureSizeUniform.value = new THREE.Vector2(canvasWidth, canvasHeight);
            }
            if (this.blendingTexture) {
                this.blendingTexture.setSize(canvasWidth, canvasHeight);
            }
            HeatMap3DLayer.__super.prototype.resize.call(this);
        };

        HeatMap3DLayer.prototype.getFeatureShaderUrls = function () {
            return FEATURE_SHADERS;
        };

        HeatMap3DLayer.prototype.getPickingMesh = function () {
            return this.pickingMesh;
        };

        HeatMap3DLayer.prototype.drawFeatures = function (featureIdToFeatureData, shaders) {
            draw(this, featureIdToFeatureData, shaders);
        };

        HeatMap3DLayer.prototype.destroy = function () {
            HeatMap3DLayer.__super.prototype.destroy.call(this);

            this.blendingScene = null;
            this.blendingTexture = null;
            this.blendingTextureSizeUniform = null;
        };

        HeatMap3DLayer.prototype.getRelativeDataPointWeight = function (fractionalWeight) {
        // weights need to be non-zero for heat maps
            return fractionalWeight + (0.1 * (1 - fractionalWeight));
        };

        function getColorGradient() {
            if (!colorGradient) {
                var colorScale = chroma.scale(COLOR_GRADIENT_COLORS).mode('lab').domain([0, 255]);
                var colors = new Uint8Array(256 * 3);
                var i, j;

                for (i=0; i<256; ++i) {
                    var colorRGB = colorScale(i).rgb();
                    for (j=0; j<3; ++j) {
                        colors[3 * i + j] = Math.floor(Math.abs(colorRGB[j]));
                    }
                }
                colorGradient = colors;
            }
            return colorGradient;
        }

        function getFeatureShaderMaterial(heatMap3DLayer, vertexShader, fragmentShader,
                                      blendingTexture, blendingTextureSizeUniform, isPickingMesh) {

            var gradientTexture = new THREE.DataTexture(getColorGradient(), 256, 1, THREE.RGBFormat, THREE.UnsignedByteType);
            gradientTexture.needsUpdate = true;

            return heatMap3DLayer.getNewRawShaderMaterial({
                uniforms: {
                    pointSize: {
                        type: 'f',
                        value: POINT_CLOUD_POINT_SIZE
                    },
                    colorGradientTexture: {
                        type: 't',
                        value: gradientTexture
                    },
                    blendingTextureSize: blendingTextureSizeUniform,
                    blendingTexture: {
                        type: 't',
                        value: blendingTexture
                    },
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
                vertexColors: THREE.VertexColors
            });
        }

        function getBlendingTextureShaderMaterial(heatMap3DLayer, vertexShader, fragmentShader) {
            return heatMap3DLayer.getNewRawShaderMaterial({
                uniforms: {
                    pointSize: {
                        type: 'f',
                        value: POINT_CLOUD_POINT_SIZE
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

        function setUpBlendingScene(heatMap3DLayer, featureIdToFeatureData, vertexShader, fragmentShader) {

            heatMap3DLayer.blendingScene = new THREE.Scene();
            var width = heatMap3DLayer.$canvas.width();
            var height = heatMap3DLayer.$canvas.height();

            heatMap3DLayer.blendingTexture = new THREE.WebGLRenderTarget(width, height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            });

            var blendingGeometry = heatMap3DLayer.getGeometry(featureIdToFeatureData);
            var material = getBlendingTextureShaderMaterial(heatMap3DLayer, vertexShader, fragmentShader);
            $.extend(material.uniforms, heatMap3DLayer.getDataPointHighlightingUniforms());
            var pointCloud = new THREE.PointCloud(blendingGeometry, material);
            pointCloud.frustumCulled = false;

            heatMap3DLayer.blendingScene.add(pointCloud);
        }

        function setUpRenderedScene(heatMap3DLayer, featureIdToFeatureData, blendingTexture, vertexShader, fragmentShader) {

            var featureShaderMaterial = getFeatureShaderMaterial(
            heatMap3DLayer,
            vertexShader,
            fragmentShader,
            blendingTexture,
            heatMap3DLayer.blendingTextureSizeUniform,
            false
        );

            $.extend(featureShaderMaterial.uniforms, heatMap3DLayer.getDataPointHighlightingUniforms());

            var geometry = heatMap3DLayer.getGeometry(featureIdToFeatureData);
            var pointCloud = new THREE.PointCloud(geometry, featureShaderMaterial);
            pointCloud.frustumCulled = false;
            heatMap3DLayer.addObjectToRemoveOnDestroy(pointCloud);
            heatMap3DLayer.scene.add(pointCloud);

        // the picking mesh gets a different instance of the shader material so that
        // the uniform changes in the drawn mesh does not affect picking mesh
            var pickingMaterial = getFeatureShaderMaterial(
            heatMap3DLayer,
            vertexShader,
            fragmentShader,
            blendingTexture,
            heatMap3DLayer.blendingTextureSizeUniform,
            true
        );
            var pickingPointCloud = new THREE.PointCloud(geometry, pickingMaterial);
            pickingPointCloud.frustumCulled = false;
            heatMap3DLayer.pickingMesh = pickingPointCloud;
        }


        function draw(heatMap3DLayer, featureIdToFeatureData, shaders) {
            setUpBlendingScene(
            heatMap3DLayer,
            featureIdToFeatureData,
            shaders[0],
            shaders[1]
        );

            setUpRenderedScene(
            heatMap3DLayer,
            featureIdToFeatureData,
            heatMap3DLayer.blendingTexture,
            shaders[2],
            shaders[3]
        );
        }

        return HeatMap3DLayer;
    }]);
