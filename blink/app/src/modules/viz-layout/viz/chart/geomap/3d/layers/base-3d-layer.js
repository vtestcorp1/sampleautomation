/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Base class for all 3d geo maps layers.
 */

'use strict';

blink.app.factory('Base3DLayer', ['Logger', 'jsUtil', 'blinkConstants', 'strings', 'geoUtil',
    function(Logger, jsUtil, blinkConstants, strings, geoUtil) {

        var CAMERA_POSITION_CHANGE_TOLERANCE = 0.001;

        var logger = Logger.create('base-3d-layer');

        function Base3DLayer(projectionType, mapType, geoConfig, $canvas, renderer, scene, camera) {
            this.geoConfig = geoConfig;
            this.mapType = mapType;
            this.$canvas = $canvas;
            this.renderer = renderer;
            this.scene = scene;
            this.camera = camera;

            this.isLoaded = false;
            this.loadError = null;
            this.onLoadHandlers = [];
        // uniquely identifies this instance of 3d layer
        // used to remove event handlers for a particular layer
            this.id = jsUtil.generateUUID();

            this.destroyed = false;
            this.objectsToRemoveOnDestroy = [];

            this.projectionTypeUniforms = [];
            this.projectionMixUniforms = [];

            this.clock = null;
            this.clockRestartPending = false;

            this.cameraLastPosition = new THREE.Vector3();

            var base3dLayer = this;
            $(window).on(getNameSpacedEvent('resize', this.id), function($evt){
                var width = $canvas.width();
                var height = $canvas.height();
                base3dLayer.resize(width, height, $evt);
            });

            this.setProjectionType(projectionType);
        }

    /**
     * A callback that returns all the data points in the layer at the
     * pixel identified by its x,y coordinates with origin at top left
     * @param x
     * @param y
     * @returns {Array}
     */
        Base3DLayer.prototype.getDataPointsAtPixel = function (x, y) {
            return [];
        };

        Base3DLayer.prototype.highlightDataPoint = function (dataPoint) {
        };

        Base3DLayer.prototype.setProjectionType = function (projectionType) {
            var oldProjectionType = this.projectionType;
            this.projectionType = projectionType;

            this.projectionTypeUniforms.forEach(function(projectionTypeUniform){
                projectionTypeUniform.value = getUniformValueForProjectionType(projectionType);
            });

            if (!!oldProjectionType) {
                var oldIsSpherical = isSphericalProjection(oldProjectionType);
                var newIsSpherical = isSphericalProjection(this.projectionType);
                if (oldIsSpherical != newIsSpherical) {
                    if (this.clock) {
                        this.clock.stop();
                    }
                    this.clock = null;
                // CPU could be busy with angular stuff between updating projection type
                // and next render loop. If we start the clock here we could miss the
                // animation duration entirely. Hence we wait for the next render
                // cycle before we restart the clock
                    this.clockRestartPending = true;
                }
            }
        };

        Base3DLayer.prototype.getCanvasSize = function () {
            var width = this.$canvas.width();
            var height = this.$canvas.height();

            return {
                width: width,
                height: height
            };
        };

    /**
     * Hook to customize render loop
     */
        Base3DLayer.prototype.render = function () {
            var cameraDisplacement = this.camera.position.distanceTo(this.cameraLastPosition);
            if (cameraDisplacement > CAMERA_POSITION_CHANGE_TOLERANCE) {
                this.cameraLastPosition.copy(this.camera.position);
                this.onCameraPositionChanged();
            }

            if (!this.clockRestartPending && !this.clock) {
                return;
            }
            if (this.clockRestartPending) {
                this.clockRestartPending = false;
                this.clock = new THREE.Clock();
            }

            var elapsedTime = this.clock.getElapsedTime();
            var timeFraction = elapsedTime * 1000/geoUtil.Constants.PROJECTION_TRANSITION_DURATION;
            var isFinalProjectionSpherical = isSphericalProjection(this.projectionType);
            var projectionMix = isFinalProjectionSpherical ? Math.min(1, timeFraction) : Math.max(0, 1 - timeFraction);
            if (timeFraction >= 1) {
                if (this.clock) {
                    this.clock.stop();
                }
                this.clock = null;
            }

            this.projectionMixUniforms.forEach(function(projectionMixUniform){
                projectionMixUniform.value = projectionMix;
            });
        };

    /**
     * Hook to customize behavior on camera position change. This can potentially
     * be called on every animation frame (e.g if the camera is animating). The
     * subclass is responsible for any throttling/debouncing.
     */
        Base3DLayer.prototype.onCameraPositionChanged = function () {

        };

    /**
     * Hook to customize canvas resize handling
     */
        Base3DLayer.prototype.resize = function (canvasWidth, canvasHeight, $resizeEvent) {

        };

    /**
     * Adds an object to the list of objects the need to be removed from the scene once
     * the layer is destroyed.
     * @param objectToRemoveOnDestroy
     */
        Base3DLayer.prototype.addObjectToRemoveOnDestroy = function (objectToRemoveOnDestroy) {
            this.objectsToRemoveOnDestroy.push(objectToRemoveOnDestroy);
        };

        Base3DLayer.prototype.onLoad = function (error) {
            this.isLoaded = true;
            this.loadError = !!error ? error : null;

        // create a new array to avoid an infinite loop.
        // although in the current code it is not possible
        // for the onLoadHandlers to inject new onLoadHandlers
        // as we'll call their handlers right away after load
        // is done, it is safer to create a new array.
            var existingLoadHandlers = this.onLoadHandlers;
            this.onLoadHandlers = [];
            while (existingLoadHandlers.length) {
                var loadHandler = existingLoadHandlers.shift();
                try {
                    loadHandler(this.loadError);
                } catch (e) {
                    logger.error(e);
                }
            }

        };

        Base3DLayer.prototype.addOnLoadHandler = function (onLoad) {
            if (this.isLoaded) {
                onLoad(this.loadError);
                return;
            }
            this.onLoadHandlers.push(onLoad);
        };

        Base3DLayer.prototype.destroy = function () {
            this.destroyed = true;
            this.onLoadHandlers = [];
            this.projectionTypeUniforms = [];
            $(window).off(getNameSpacedEvent('resize', this.id));

            var objectsToRemove = this.objectsToRemoveOnDestroy;
            var scene = this.scene;
            objectsToRemove.forEach(function(objectToRemove){
                scene.remove(objectToRemove);
            });
        };

        Base3DLayer.prototype.isDestroyed = function () {
            return this.destroyed;
        };

        function getUniformValueForProjectionType(projectionType) {
            switch (projectionType) {
                case blinkConstants.geo3dProjectionTypes.GLOBE:
                    return 0;
                case blinkConstants.geo3dProjectionTypes.MAP:
                    return 1;
                case blinkConstants.geo3dProjectionTypes.PERSPECTIVE_PLANE:
                    return 2;
                default:
                    logger.warn('unknown projection type', projectionType);
                    return 0;
            }
        }

        function isSphericalProjection(projectionType) {
            return projectionType === blinkConstants.geo3dProjectionTypes.GLOBE;
        }

        function getProjectionMixForProjectionType(projectionType) {
            return isSphericalProjection(projectionType) ? 1 : 0;
        }

    /**
     * Factory for constructing THREE.RawShaderMaterial instances used by subclass layers.
     * The materials constructed using this method have certain uniforms automatically
     * synced with corresponding layer properties (e.g. projectionType).
     *
     * @param config
     * @returns {THREE.RawShaderMaterial}
     */
        Base3DLayer.prototype.getNewRawShaderMaterial = function (config) {
            if (!config.uniforms) {
                config.uniforms = {};
            }
            if (!config.uniforms.uProjectionType) {
                config.uniforms.uProjectionType = {
                    type: 'i',
                    value: getUniformValueForProjectionType(this.projectionType)
                };
                this.projectionTypeUniforms.push(config.uniforms.uProjectionType);
            }
            if (!config.uniforms.uProjectionMix) {
                config.uniforms.uProjectionMix = {
                    type: 'f',
                    value: getProjectionMixForProjectionType(this.projectionType)
                };
                this.projectionMixUniforms.push(config.uniforms.uProjectionMix);
            }

            return new THREE.RawShaderMaterial(config);
        };

        function getNameSpacedEvent(eventName, layerId) {
            return '{1}.{2}'.assign(eventName, layerId);
        }

        return Base3DLayer;
    }]);
