/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Base class for all 3D feature layers (bubble, heatmap etc.)
 */

'use strict';

blink.app.factory('BaseFeature3DLayer', ['$q', 'Logger', 'util', 'Base3DLayer', 'jsonConstants',
    'shaderService', 'geoUtil', 'GeoEntityMatchingService',
    function($q, Logger, util, Base3DLayer, jsonConstants, shaderService, geoUtil, GeoEntityMatchingService) {

        var logger = Logger.create('base-feature-3d-layer');

        function BaseFeature3DLayer(projectionType, mapType, geoConfig, $canvas, renderer,
                                scene, camera, featureIds, dataSeries) {

            BaseFeature3DLayer.__super.call(this, projectionType, mapType, geoConfig, $canvas, renderer, scene, camera);

            this.featureIds = featureIds;
            this.dataSeries = dataSeries;
            this.initialized = false;

            this.pickingScene = null;
            this.pickingTexture = null;

            this.dataPointHighlightingUniforms = {
                uLastHighlightedDataPointIndex: {
                    type: 'f',
                    value: -1
                },
                uHighlightedDataPointIndex: {
                    type: 'f',
                    value: -1
                },
                uHighlightTransitionInterval: {
                    type: 'f',
                    value: 0
                }
            };
            this.highlightingTween = null;

            var baseFeature3DLayer = this;
            draw(this).then(function(){
                baseFeature3DLayer.onLoad(null);
            }, function(error){
                baseFeature3DLayer.onLoad(error);
            });
        }
        util.inherits(BaseFeature3DLayer, Base3DLayer);

        BaseFeature3DLayer.prototype.render = function () {
            BaseFeature3DLayer.__super.prototype.render.apply(this, arguments);

            if (this.highlightingTween) {
                TWEEN.update();
            }
        };

    /**
     * Returns true iff all the shaders have been loaded, all initial objects
     * drawn and the instance has not been destroyed.
     * @returns {Boolean}
     */
        BaseFeature3DLayer.prototype.isInitialized = function () {
            return this.initialized && !this.isDestroyed();
        };

        BaseFeature3DLayer.prototype.getNumDataPoints = function () {
            return this.dataSeries.reduce(function(sum, dataSerie){
                return sum + dataSerie.data.length;
            }, 0);
        };

    /**
     * Returns a list of urls for all the shaders the layer wants to load.
     * @returns {Array}
     */
        BaseFeature3DLayer.prototype.getFeatureShaderUrls = function () {
            return [];
        };

        BaseFeature3DLayer.prototype.resize = function (canvasWidth, canvasHeight, $resizeEvent) {
            BaseFeature3DLayer.__super.prototype.resize.call(this);

            if (this.pickingTexture) {
                this.pickingTexture.setSize(canvasWidth, canvasHeight);
            }
        };

    /**
     * A hook to customize the weight values for series data points. The default implementation
     * is an identity function.
     *
     * @param fractionalWeight the basic weight of a data point as a fraction of the range
     * [seriesMin, seriesMax]
     *
     * @returns {Number}
     */
        BaseFeature3DLayer.prototype.getRelativeDataPointWeight = function (fractionalWeight) {
            return fractionalWeight;
        };

        BaseFeature3DLayer.prototype.getDataPointIndex = function (dataPoint) {
        // dataPointIndex also servers as color for picking scene, needs to be > 0
        // as black is out clear color, hence the 1 offset
            return dataPoint.dataPointIndex + 1;
        };

        BaseFeature3DLayer.prototype.getDataPointHighlightingUniforms = function () {
            return this.dataPointHighlightingUniforms;
        };

    /**
     * Implements the actual drawing of the features of the layer.
     * @param featureIdToFeatureData An object of the form
     *     {
     *         featureId: {
     *             centroid: {latitude: X, longitude: Y},
     *             properties: {name: A, iso_a3: B}
     *         }
     *     }
     * @param shaders
     */
        BaseFeature3DLayer.prototype.drawFeatures = function (featureIdToFeatureData, shaders) {
        };

    /**
     * A hook to provide the Mesh (or equivalent Object3D instance, e.g., PointCloud)
     * that will be used as the picking mesh. It is the responsibility of the subclass
     * to ensure that the mesh's shaders are set up to follow the transformations of
     * the visible mesh.
     */
        BaseFeature3DLayer.prototype.getPickingMesh = function () {
            return null;
        };

        BaseFeature3DLayer.prototype.getDataPointsAtPixel = function (x, y) {
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
            var dataPointIndexAtPixel = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
            if (dataPointIndexAtPixel <= 0) {
                return [];
            }

        // data point index is offset by 1 to avoid 0 color on picking texture, we undo that offset
        // before looking up in the list of feature properties
            dataPointIndexAtPixel--;

            var dataPointIndex = 0,
                dataPoint = null;

            for (var i=0; i<this.dataSeries.length; ++i) {
                var dataSerie = this.dataSeries[i];
                var seriesNumPoints = dataSerie.data.length;
                if (dataPointIndexAtPixel >= dataPointIndex && dataPointIndexAtPixel < dataPointIndex + seriesNumPoints) {
                    dataPoint = dataSerie.data[dataPointIndexAtPixel - dataPointIndex];
                    break;
                }
                dataPointIndex += seriesNumPoints;
            }

            if (!dataPoint) {
                return [];
            }
            return [dataPoint];
        };

        BaseFeature3DLayer.prototype.highlightDataPoint = function (dataPoint) {
            var uniforms = this.dataPointHighlightingUniforms;
            if (uniforms.uHighlightedDataPointIndex < 0 && !dataPoint) {
                return;
            }
            if (!!dataPoint && uniforms.uHighlightedDataPointIndex.value === dataPoint.dataPointIndex + 1) {
                return;
            }

            uniforms.uLastHighlightedDataPointIndex.value = uniforms.uHighlightedDataPointIndex.value;

            if (this.highlightingTween) {
                this.highlightingTween.stop();
                this.highlightingTween = null;
            }

            var layer = this,
                transitionInterval = geoUtil.Constants.DATA_POINT_HIGHLIGHT_TRANSITION_DURATION,
                timer = {completion: 0},
                timerEnd = {completion: 1};

            this.highlightingTween = new TWEEN.Tween({completion: 0})
            .to({completion: 1}, transitionInterval)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(function(){
                uniforms.uHighlightTransitionInterval.value = (this.completion).clamp(0, 1);
            })
            .onComplete(function(){
                layer.highlightingTween = null;
                uniforms.uHighlightTransitionInterval.value = 1;
                uniforms.uLastHighlightedDataPointIndex.value = -1;
            })
            .start();

            if (!dataPoint) {
                uniforms.uHighlightedDataPointIndex.value = -1;
                return;
            }

            if (!Object.has(dataPoint, 'dataPointIndex')) {
                logger.warn('no dataPointIndex found on data point to highlight', dataPoint);
                uniforms.uHighlightedDataPointIndex.value = -1;
                return;
            }
            uniforms.uHighlightedDataPointIndex.value = dataPoint.dataPointIndex + 1;
        };

        BaseFeature3DLayer.prototype.getNewRawShaderMaterial = function (config) {
            if (!Object.has(config, 'polygonOffsetUnits')) {
                config.polygonOffset = true;
                config.polygonOffsetFactor = 3;
                config.polygonOffsetUnits = -1;
            }
            return BaseFeature3DLayer.__super.prototype.getNewRawShaderMaterial.call(this, config);
        };

        function draw(baseFeature3DLayer) {
            if (baseFeature3DLayer.isDestroyed()) {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }

            var geoConfig = baseFeature3DLayer.geoConfig;
            var centroidsPromise = GeoEntityMatchingService.findMatchingFeatures(
                baseFeature3DLayer.featureIds,
                'POINT',
                geoConfig.getType(),
                geoConfig.getParent() && geoConfig.getParent().getFixedValue(),
                geoConfig.getCustomFileGuid()
            ).then(function(featuresList) {
                return featuresList.map(function(features) {
                    if (features.length === 1) {
                        return features[0];
                    }
                    return null;
                });
            });

            var propertiesPromise = GeoEntityMatchingService.findMatchingFeatures(
                baseFeature3DLayer.featureIds,
                'POLYGON',
                geoConfig.getType(),
                geoConfig.getParent() && geoConfig.getParent().getFixedValue(),
                geoConfig.getCustomFileGuid()
            ).then(function(featuresList) {
                return featuresList.map(function(features) {
                    if (features.length === 1) {
                        return features[0].getProperties();
                    }
                    return null;
                });
            });
            var shadersPromise = shaderService.getShaders(baseFeature3DLayer.getFeatureShaderUrls());

            return util.getAggregatedPromise([propertiesPromise, centroidsPromise, shadersPromise])
            .then(function(resultsArray) {
                var featurePropertiesList = resultsArray[0],
                    centroidCoordinates = resultsArray[1],
                    shaders = resultsArray[2],
                    featureIdToFeatureData = {};

                for (var i=0; i<baseFeature3DLayer.featureIds.length; ++i) {
                    var featureId = baseFeature3DLayer.featureIds[i];
                    var featureProperties = featurePropertiesList[i];
                    var featureCentroidCoordinates = centroidCoordinates[i] ? {
                        latitude: centroidCoordinates[i][1],
                        longitude: centroidCoordinates[i][0]
                    } : null;

                    featureIdToFeatureData[featureId] = {
                        properties: featureProperties,
                        centroid: featureCentroidCoordinates
                    };
                }

                var rv = baseFeature3DLayer.drawFeatures(featureIdToFeatureData, shaders);
                setUpPicking(baseFeature3DLayer);

                baseFeature3DLayer.initialized = true;
                return rv;
            });
        }

        function setUpPicking(baseFeature3DLayer) {
            var pickingMesh = baseFeature3DLayer.getPickingMesh();
            if (!pickingMesh) {
                return;
            }

            var width = baseFeature3DLayer.$canvas.width();
            var height = baseFeature3DLayer.$canvas.height();

            baseFeature3DLayer.pickingScene = new THREE.Scene();
            baseFeature3DLayer.pickingTexture = new THREE.WebGLRenderTarget(width, height);
            baseFeature3DLayer.pickingTexture.minFilter = THREE.LinearFilter;
            baseFeature3DLayer.pickingTexture.generateMipmaps = false;

        // the picking mesh gets a different instance of the shader material so that
        // the uniform changes in the drawn mesh does not affect picking mesh
            baseFeature3DLayer.addObjectToRemoveOnDestroy(pickingMesh);
            pickingMesh.frustumCulled = false;
            baseFeature3DLayer.pickingScene.add(pickingMesh);
        }

        return BaseFeature3DLayer;
    }]);
