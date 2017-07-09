/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A Geographic Globe visualization
 */

'use strict';

/* eslint max-params:1 */
blink.app.factory('BlinkGeoEarth', ['Logger',
    '$http',
    'GeoDataProcessor',
    'geoUtil',
    'util',
    'Topology3DLayer',
    'BlinkPositionablePopover',
    'Bubble3DLayer',
    'Bar3DLayer',
    'HeatMap3DLayer',
    'Graph3DLayer',
    'chartTypeSpecificationService',
    'Earth3DLayer',
    'GeoCameraControls',
    'blinkConstants',
    'strings',
    'AnimationLoopManager',
    'mapTileService',
    function (Logger,
          $http,
          GeoDataProcessor,
          geoUtil,
          util,
          Topology3DLayer,
          BlinkPositionablePopover,
          Bubble3DLayer,
          Bar3DLayer,
          HeatMap3DLayer,
          Graph3DLayer,
          chartTypeSpecificationService,
          Earth3DLayer,
          GeoCameraControls,
          blinkConstants,
          strings,
          AnimationLoopManager,
          mapTileService) {

        var FRAG_DEPTH_EXTENSION_NAME = 'EXT_frag_depth';

        var logger = Logger.create('blink-geo-earth');


        function DataPointSelection(layer, dataPoints) {
            this.layer = layer;
            this.dataPoints = dataPoints;
        }

        DataPointSelection.prototype.isEmpty = function () {
            return this.dataPoints.length === 0;
        };

        DataPointSelection.prototype.getTopMostDataPoint = function () {
            return this.dataPoints.last();
        };

        DataPointSelection.prototype.highlight = function () {
            this.layer.highlightDataPoint(this.getTopMostDataPoint());
        };


        function BlinkGeoEarth(config) {
            this.destroyed = false;
            this.animationLoopManager = null;

            this.config = config;
            this.chartModel = config.chartModel;
            this.dataProcessor = new GeoDataProcessor(this.chartModel);

            this.map = null;
            this.earthContainer = null;

            this.config.container.empty();
            this.config.container.addClass('bk-geo-earth');

            this.scene = null;

            this.camera = null;

            this.mouseRelativePosition = new THREE.Vector2(0, 0);
            this.mouseGlobalPosition = new THREE.Vector2(0, 0);

            this.cameraControls = null;
            this.renderer = null;

            this.layers = [];

            this.tooltip = new BlinkPositionablePopover(null, ['bk-geomap-tooltip']);


            this.rendererStats = null;

            initGlobe(this, this.config.onLoad);
        //initRendererStats(this);
        }

        function initRendererStats(geoEarth) {
        // this is present only in debug build
            if (!window.THREEx || !THREEx.RendererStats) {
                return;
            }

            geoEarth.rendererStats = new THREEx.RendererStats();
            $(geoEarth.rendererStats.domElement).css({
                position: 'absolute',
                left: 0,
                bottom: 0
            }).appendTo(geoEarth.config.container);
        }

        function enableExtensions(renderer) {
            renderer.context.getExtension(FRAG_DEPTH_EXTENSION_NAME);
        }

        function setUpEvents(geoEarth) {
            var isDragging = false;

            geoEarth.earthContainer.on('mousedown.blink-geo-earth', function(){
                isDragging = true;
            });
            geoEarth.earthContainer.on('mouseup.blink-geo-earth', function(){
                isDragging = false;
            });

            geoEarth.earthContainer
            .on(
            'mousemove.blink-geo-earth',
            util.debounce(function(event){
                if (isDragging) {
                    return;
                }

                var mouseOffset = util.getMouseEventOffset(event);
                var x = mouseOffset.x;
                var y = mouseOffset.y;

                geoEarth.mouseRelativePosition.x = x;
                geoEarth.mouseRelativePosition.y = y;

                geoEarth.mouseGlobalPosition.x = event.clientX;
                geoEarth.mouseGlobalPosition.y = event.clientY;

                updateActiveDataPoint(geoEarth);

            }, 64)
        );

        // no need to debounce right click handlers, right click events don't
        // happen in quick succession
            geoEarth.earthContainer.on('contextmenu.blink-geo-maps', function($event){
                $event.preventDefault();
                if (!geoEarth.config.onRightClick) {
                    return;
                }

                var mouseOffset = util.getMouseEventOffset($event);
                var x = mouseOffset.x;
                var y = mouseOffset.y;

                var dataPointSelection = getCurrentActiveDataPointSelection(geoEarth, x, y);
            // TODO (sunny): support multiple data points at one pixel point
                if (!dataPointSelection || dataPointSelection.isEmpty()) {
                    return;
                }

            // take the one from the top most layer
                var dataPoint = dataPointSelection.getTopMostDataPoint();
                dataPoint.series = geoEarth.dataProcessor.getSeriesForDataPoint(dataPoint);

                var clickData = {
                    chartX: x,
                    chartY: y,
                    point: dataPoint
                };
                geoEarth.config.onRightClick(clickData);
            });
        }

        function getCurrentActiveDataPointSelection(geoEarth, x, y) {
        // return the data point under mouse, searching from the top most layer
        // this assumes that the z-order of the layers is in the order in which
        // they were added to the scene.
            for (var i=geoEarth.layers.length - 1; i>=0; --i) {
                var layer = geoEarth.layers[i];
                var layerDataPoints = layer.getDataPointsAtPixel(x, y);
                if (layerDataPoints.length) {
                    return new DataPointSelection(layer, layerDataPoints);
                }
            }
            return null;
        }

        function highlightCurrentActiveSelection(geoEarth, currentSelection) {
        // clear up any previous highlight in any other layer
            geoEarth.layers.forEach(function(layer){
                layer.highlightDataPoint(null);
            });
            if (currentSelection) {
                currentSelection.highlight();
            }
        }

        function updateActiveDataPoint(geoEarth) {
            var currentSelection = getCurrentActiveDataPointSelection(
            geoEarth,
            geoEarth.mouseRelativePosition.x,
            geoEarth.mouseRelativePosition.y
        );

        // take the top most feature (assuming layers and features within layers are in z-order)
            if (!currentSelection || currentSelection.isEmpty()) {
                geoEarth.tooltip.hide();
                highlightCurrentActiveSelection(geoEarth, null);
                return;
            }

            var dataPoint = currentSelection.getTopMostDataPoint();
        // TODO (sunny): handle multiple data points under mouse
            var tooltipContent = {},
                xNameValuePair = geoEarth.dataProcessor.getFormattedXValue(dataPoint),
                yNameValuePair = geoEarth.dataProcessor.getFormattedYValue(dataPoint),
                zNameValuePair = geoEarth.dataProcessor.getFormattedZValue(dataPoint);

            tooltipContent[xNameValuePair.name] = xNameValuePair.value;
            tooltipContent[yNameValuePair.name] = yNameValuePair.value;
            if (zNameValuePair) {
                tooltipContent[zNameValuePair.name] = zNameValuePair.value;
            }

            geoEarth.tooltip.show(geoEarth.mouseGlobalPosition.x, geoEarth.mouseGlobalPosition.y, tooltipContent);
            highlightCurrentActiveSelection(geoEarth, currentSelection);
        }

        function setUpCamera(width, height) {
            var camera = new THREE.PerspectiveCamera(40, width/height, 0.00001, 100);

            camera.up = new THREE.Vector3(0,1,0);
            camera.lookAt(new THREE.Vector3(0,0,0));

            camera.position.z = 5;
            camera.position.y = 0;
            camera.position.x = 0;

            return camera;
        }

        function addStars(scene, radius, segments) {
            var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            new THREE.MeshBasicMaterial({
                map:  THREE.ImageUtils.loadTexture('resources/img/geomaps/3d/galaxy.png'),
                side: THREE.BackSide
            })
        );
            scene.add(mesh);
        }

        function getRenderFunction(geoEarth) {
            return function renderScene() {
                geoEarth.cameraControls.update();
                geoEarth.camera.updateProjectionMatrix();

                geoEarth.layers.forEach(function(layer){
                    layer.render(geoEarth.camera);
                });

                geoEarth.renderer.render(geoEarth.scene, geoEarth.camera);

                if (geoEarth.rendererStats) {
                    geoEarth.rendererStats.update(geoEarth.renderer);
                }
            };
        }

        function initGlobe(geoEarth, callback) {
            geoEarth.earthContainer = $('<div>');
            geoEarth.earthContainer.addClass('bk-earth-container');
            geoEarth.config.container.append(geoEarth.earthContainer);

            var width = geoEarth.earthContainer.width(),
                height = geoEarth.earthContainer.height();

            var scene = geoEarth.scene = new THREE.Scene();
            var camera = geoEarth.camera = setUpCamera(width, height);

            var renderer = geoEarth.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            enableExtensions(renderer);
            renderer.setSize(width, height);

            geoEarth.earthContainer.append(renderer.domElement);
            setUpEvents(geoEarth);

            geoEarth.cameraControls = new GeoCameraControls(
            camera, renderer.domElement,
            geoEarth.config.projectionType
        );

            addStars(scene, 20, 64);

            var renderFunction = getRenderFunction(geoEarth);
            geoEarth.animationLoopManager = new AnimationLoopManager(geoEarth.earthContainer[0], renderFunction);

            util.executeInNextEventLoop(callback);
        }

        function updateSize(geoEarth) {
            geoEarth.setSize(geoEarth.getPlotSizeX(), geoEarth.getPlotSizeY());
        }

        function getDataPointsForFeatureProperties(geoEarth, featureProperties) {
            return geoEarth.dataProcessor.getDataPointsForFeature(featureProperties);
        }

        function getFeatureToDataPointsMapper(geoEarth) {
            return function (featureProperties) {
                return getDataPointsForFeatureProperties(geoEarth, featureProperties);
            };
        }

        function loadAndShowEarth(geoEarth, featureIds, callback) {
            var earthLayer = new Earth3DLayer(
            geoEarth.config.projectionType,
            geoEarth.chartModel.getChartType(),
            geoEarth.dataProcessor.getGeoConfig().getType(),
            geoEarth.earthContainer,
            geoEarth.renderer,
            geoEarth.scene,
            geoEarth.camera,
            featureIds,
            geoEarth.dataProcessor.getAllSeries()
        );
            earthLayer.addOnLoadHandler(function(error){
                callback(error);
            });
            geoEarth.layers.push(earthLayer);
        }

        function loadAndShowTopology(geoEarth, featureIds, callback) {
            var topologyLayer = new Topology3DLayer(
            geoEarth.config.projectionType,
            geoEarth.chartModel.getChartType(),
            geoEarth.dataProcessor.getGeoConfig(),
            geoEarth.earthContainer,
            geoEarth.renderer,
            geoEarth.scene,
            geoEarth.camera,
            featureIds,
            geoEarth.dataProcessor.getAllSeries(),
            getFeatureToDataPointsMapper(geoEarth)
        );
            topologyLayer.addOnLoadHandler(function (error) {
                callback(error);
            });
            geoEarth.layers.push(topologyLayer);
        }

        function loadAndShowFeatureLayer(layerClass, geoEarth, featureIds, callback) {
            var layer = new (Function.prototype.bind.call(
            layerClass,
            null,

            geoEarth.config.projectionType,
            geoEarth.chartModel.getChartType(),
            geoEarth.dataProcessor.getGeoConfig(),
            geoEarth.earthContainer,
            geoEarth.renderer,
            geoEarth.scene,
            geoEarth.camera,
            featureIds,
            geoEarth.dataProcessor.getAllSeries()
        ));

            layer.addOnLoadHandler(function(error){
                callback(error);
            });
            geoEarth.layers.push(layer);
        }

        function loadAndShowBubbleLayer(geoEarth, featureIds, callback) {
            loadAndShowFeatureLayer(Bubble3DLayer, geoEarth, featureIds, callback);
        }

        function loadAndShowBarLayer(geoEarth, featureIds, callback) {
            loadAndShowFeatureLayer(Bar3DLayer, geoEarth, featureIds, callback);
        }

        function loadAndShowHeatMapLayer(geoEarth, featureIds, callback) {
            loadAndShowFeatureLayer(HeatMap3DLayer, geoEarth, featureIds, callback);
        }

        function loadAndShowGraphLayer(geoEarth, featureIds, callback) {
            loadAndShowFeatureLayer(Graph3DLayer, geoEarth, featureIds, callback);
        }

        function zoomCameraToFitBounds(geoEarth) {
            geoEarth.dataProcessor.getBounds()
            .then(function(bounds){
                if (!bounds.isEmpty()) {
                    geoEarth.cameraControls.zoomToFit(bounds);
                }
            }, function(error){
                logger.error('error in zoomCameraToFitBounds', error);
            });
        }

        function getMapLoadHandler(geoEarth, callback) {
            return function(error) {
                zoomCameraToFitBounds(geoEarth);
                if (callback) {
                    callback(error);
                }
            };
        }

        function redraw(geoEarth, callback) {
            updateSize(geoEarth);

            var existingLayers = geoEarth.layers;
            geoEarth.layers = [];
            existingLayers.forEach(function(layer){
                layer.destroy();
            });

            var featureIds = geoEarth.dataProcessor.getAllFeatureIdsOfSeries();
            var onLoadHandler = getMapLoadHandler(geoEarth, callback);

            loadAndShowEarth(geoEarth, featureIds, function(error){
                if (!!error) {
                    logger.error('error in loading and showing earth layer', error);
                    callback(error);
                    return;
                }

                loadAndShowTopology(geoEarth, featureIds, function(error){
                    if (!!error) {
                        logger.error('error in loading and showing topology layer', error);
                        callback(error);
                        return;
                    }

                    switch (geoEarth.chartModel.getChartType()) {
                        case chartTypeSpecificationService.chartTypes.GEO_EARTH_AREA:
                            onLoadHandler();
                            break;
                        case chartTypeSpecificationService.chartTypes.GEO_EARTH_BUBBLE:
                            loadAndShowBubbleLayer(geoEarth, featureIds, onLoadHandler);
                            break;
                        case chartTypeSpecificationService.chartTypes.GEO_EARTH_BAR:
                            loadAndShowBarLayer(geoEarth, featureIds, onLoadHandler);
                            break;
                        case chartTypeSpecificationService.chartTypes.GEO_EARTH_HEATMAP:
                            loadAndShowHeatMapLayer(geoEarth, featureIds, onLoadHandler);
                            break;
                        case chartTypeSpecificationService.chartTypes.GEO_EARTH_GRAPH:
                            loadAndShowGraphLayer(geoEarth, featureIds, onLoadHandler);
                            break;
                        default:
                            logger.error('unhandled geo 3d type', geoEarth.chartModel.getChartType());
                            if (callback) {
                                callback(new Error('unhandled geo 3d type ' + geoEarth.chartModel.getChartType()));
                            }
                    }
                });
            });
        }

        BlinkGeoEarth.prototype.redraw = function () {
            redraw(this, null);
        };

        BlinkGeoEarth.prototype.isDataLabelsEnabled = function () {
            return false;
        };

        BlinkGeoEarth.prototype.setProjectionType = function (projectionType) {
            this.animationLoopManager.onExternalActivity();

            this.config.projectionType = projectionType;
            this.cameraControls.setProjectionType(projectionType);
            zoomCameraToFitBounds(this);

            this.layers.forEach(function(layer){
                layer.setProjectionType(projectionType);
            });
        };

        BlinkGeoEarth.prototype.getProjectionType = function () {
            return this.config.projectionType;
        };

        BlinkGeoEarth.prototype.setData = function (data, callback) {
            this.dataProcessor.setData(data);
            redraw(this, callback);
        };

        BlinkGeoEarth.prototype.getSupportedProjections = function () {
            var supportedProjections = [
                blinkConstants.geo3dProjectionTypes.MAP,
                blinkConstants.geo3dProjectionTypes.PERSPECTIVE_PLANE
            ];
            if (!!this.renderer) {
                var extensionsSupportedByThisBrowser = this.renderer.context.getSupportedExtensions();
                if (extensionsSupportedByThisBrowser.indexOf(FRAG_DEPTH_EXTENSION_NAME) >= 0) {
                    supportedProjections.push(blinkConstants.geo3dProjectionTypes.GLOBE);
                }
            }
        };

        BlinkGeoEarth.prototype.destroy = function () {
            $(this.earthContainer).off('.blink-geo-earth');

            if (this.config.container) {
                this.config.container.removeClass('bk-geo-earth');
            }
            if (this.tooltip) {
                this.tooltip.destroy();
            }
            if (this.cameraControls) {
                this.cameraControls.destroy();
            }
            if (this.animationLoopManager) {
                this.animationLoopManager.destroy();
            }

        // Note (sunny): life of tile texture cache is associated with
        // the webgl context and not any particular layer.
            mapTileService.clearTileTextureCache();
        };

        BlinkGeoEarth.prototype.supportsDownloadAsImage = function () {
            return false;
        };

        BlinkGeoEarth.prototype.supportsFullScreenMode = function () {
            return true;
        };

        BlinkGeoEarth.prototype.setSize = function (width, height) {
            if (!this.renderer) {
                return;
            }
            this.renderer.setSize(width, height);
            this.camera.aspect = width/height;
            this.camera.updateProjectionMatrix();
            this.cameraControls.handleResize();
        };

        BlinkGeoEarth.prototype.getSeries = function () {
            return this.dataProcessor.getAllSeries();
        };

        BlinkGeoEarth.prototype.updateSeries = function (series, changes) {
            this.dataProcessor.updateSeries(series, changes);
            redraw(this);
        };

        BlinkGeoEarth.prototype.setSeriesVisibility = function (serie, visible, redraw) {
            this.dataProcessor.setSeriesVisibility(serie, visible);
            if (redraw) {
                redraw(this);
            }
        };

        BlinkGeoEarth.prototype.getPlotSizeX = function () {
            if (!this.renderer) {
                return 0;
            }
            return this.renderer.domElement.width;
        };

        BlinkGeoEarth.prototype.getPlotSizeY = function () {
            if (!this.renderer) {
                return 0;
            }
            return this.renderer.domElement.height;
        };

        return BlinkGeoEarth;

    }]);
