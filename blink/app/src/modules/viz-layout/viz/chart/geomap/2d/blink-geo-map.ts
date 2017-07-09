/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileOverview A class to draw map representation of geographical user data. Usage: create an
 * instance attached to a dom node as the place to draw onto. Call setType followed by setData as
 * the type or data to draw change.
 */

import {Component, ngRequire} from 'src/base/decorators';
import {blinkConstants} from '../../../../../../base/blink-constants';
import GeoConfig from '../../../../../document-model/table-model/geo-config';
import {jsonConstants} from '../../../../answer/json-constants';
import {BaseChart} from '../../base-chart';
import {ChartModel} from '../../chart-model';
import ColorScaleComponent from '../../color-scale/color-scale';
import {
    ADMIN_DIV_0_AND_1_MAX_BUBBLE_SIZE, BACKGROUND_WORLD_MAP_BOUNDARY_COLOR,
    BACKGROUND_WORLD_MAP_FILL_COLOR, CHOROPLETH_DIV_1_BOUNDARY_COLOR,
    CHOROPLETH_DIV_2_BOUNDARY_COLOR, DATA_PROJECTION,
    DEFAULT_MAX_BUBBLE_SIZE, HEATMAP_WEIGHT_BASE, HEATMAP_WEIGHT_FRACTION,
    IMAGE_TILE_SIZE, MAX_DEFAULT_ZOOM_OTHERS, MAX_DEFAULT_ZOOM_ZIP_AND_POINT, MIN_BUBBLE_RADIUS,
    VIEW_PROJECTION
} from '../base/geo-constants';
import GeoDataLabelManager from '../base/geo-data-label-manager';
import {GeoDataProcessor} from '../base/geo-data-processor';
import {GeoUtils} from '../base/geo-utils';
import GeoEntityMatchingService from '../base/metadata-services/geo-entity-matching-service';
import {GeometryType} from '../base/metadata-services/geo-topology-data-store';
import BaseImageLayer from './layers/base-image-layer';
import BubbleLayer from './layers/bubble-layer';
import GeoObjectLayer from './layers/geo-object-layer';
import IGeoVectorLayer from './layers/geo-vector-layer';
import HeatMapLayer from './layers/heatmap-layer';
import TopologyLayer from './layers/topology-layer';
import PolygonFeatureLoader from './loaders/polygon-feature-loader';
import BaseVectorSource from './sources/base-vector-source';
let Logger = ngRequire('Logger');
let util = ngRequire('util');
let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let geoUtil = ngRequire('geoUtil');
let sessionService = ngRequire('sessionService');

declare let angular: any;
declare let flags: any;
declare let addStringFlag: any;

/* global addStringFlag */
addStringFlag(
    'geoTileSourceId',
    'This flag enables loading of image tiles in geomaps based on the value of the flag',
    null
);

/* global addStringFlag */
addStringFlag(
    'geoTileType',
    'This flag sets the type of tile imager loaded from the source id specified via ' +
    '`geoTileSourceId` flag',
    null
);

// Currently in openlayers3 there is no way to restrict a map to an area. Precisely, there is no
// way to tell openlayers3 that do not allow viewer to pan which result in viewing anything
// outside of the given rectangle.
// See http://gis.stackexchange.com/questions/127834/openlayers-3-restrict-map-to-an-area/
// As of Sept 2016, the closest thing supported is that we can restrict the center of the map
// to a given rectangle by passing 'extent' to the ol.View, which is what we are doing here too.
// Problem with restricted center is that, if we keep the rectangle too small, then viewer
// won't be able to zoom into features which are far from center (because then that will cause
// center to move out of the given rectangle) an if we keep the rectangle big to allow viewer
// to zoom into anything, then it will allow most map to go out of view in lower zoom levels.
// which will result in ugly white/blank area to show up in the view.
//
// This extent is chosen such that it disallows too much map to move out from the
// view while still allowing any polygon to be able to come to the center at all
// zoom levels.
let ALLOWED_WORLD_EXTENT: [number, number, number, number] = [-180, -60, 180, 80];

interface GeoTooltip {
    shown?: boolean;
    top?: number;
    left?: number;
    content?: {[key: string]: string};
}

@Component({
    name: 'bkGeoMap',
    templateUrl: 'src/modules/viz-layout/viz/chart/geomap/2d/blink-geo-map.html'
})
export default class GeoMapComponent extends BaseChart {

    public colorScaleCtrl: ColorScaleComponent;

    private chartModel: ChartModel;
    private config: any;
    private dataProcessor: GeoDataProcessor;
    private layerGroup: ol.layer.Group;
    private tooltip: GeoTooltip = {};
    private interactionsEnabled: boolean;
    private zoomInteraction: ol.interaction.DoubleClickZoom;
    private dragInteraction: ol.interaction.DragPan;
    private zoomControl: ol.control.Zoom;
    private onPointerMove: (event: any) => void;
    private onHoverHighlightInteraction: ol.interaction.Select;
    private map: ol.Map;
    private previousZoom: number;

    /**
     * Features that contains data and that we are going to show on map.
     */
    private features: ol.Feature[]|undefined;
    /**
     * Set of feature Ids that are currently showing data labels on top of them.
     * @type {Set<string>}
     */
    private labeledFeatureIds: Set<string> = new Set<string>();
    /**
     * Map of featureId to data label text for all the features that have data, not just those which
     * we are showing data labels on.
     * @type {Map<string, string>}
     */
    private dataLabels: Map<string, string> = new Map<string, string>();
    /**
     * Whether data labels are currently being shown on the map.
     */
    private dataLabelsEnabled: boolean;
    /**
     * Reference of the 'moveend' event callback function.
     */
    private onMoveEnd: () => void;
    /**
     * HTML element inside which the map canvas is added.
     */
    private container: JQuery;

    private static getLayerLoadPromise(layer): Promise<any> {
        // If a layer is not visible, then we don't need to wait for anything.
        if (!layer.getVisible()) {
            return Promise.resolve();
        }
        // If the layer is our custom layer then have an ability to track load state better
        // and we use that.
        if (GeoMapComponent.isIGeoVectorLayer(layer)) {
            return layer.getVectorSource().getPromise();
        }

        // Openlayers enum only work in dev mode.
        // (See https://github.com/openlayers/ol3/issues/3671). So we can't
        // use library defined ol.source.State enums.
        if (layer.getSource().getState() === geoUtil.olSourceState.READY) {
            return Promise.resolve();
        }
        // Note (sunny): I don't know of a way in the API to check
        // whether a layer has already been composed but if we
        // know that source is not yet ready the layer is not yet
        // composed so we use this invariant to water for the more
        // desirable state in the life of layer
        return new Promise((resolve, reject) => {
            layer.once('postcompose', () => {
                resolve();
            });
        });
    }

    /**
     * User defined type guard
     * @see type guards https://www.typescriptlang.org/docs/handbook/advanced-types.html
     * @param layer
     * @returns {boolean}
     */
    private static isIGeoVectorLayer(layer: any): layer is IGeoVectorLayer {
        return !!layer && layer.getVectorSource !== void 0;
    }

    private static shouldDrawFeatureBoundaries(geoConfig, chartType) {
        // For zip code and county level maps, do not show boundaries while showing bubbles or heat
        // map.
        if ((geoConfig.getType() === jsonConstants.geoConfigType.ZIP_CODE ||
            geoConfig.getType() === jsonConstants.geoConfigType.ADMIN_DIV_2 ||
            geoConfig.getType() === jsonConstants.geoConfigType.POINT) &&
            (chartType === chartTypeSpecificationService.chartTypes.GEO_BUBBLE ||
            chartType === chartTypeSpecificationService.chartTypes.GEO_HEATMAP)) {
            return false;
        }
        return true;
    }

    /**
     * Create a function to translate meters to map units.
     * @param viewResolution is the view resolution of the current view.
     * @param viewProjection is the projection of the current view.
     * @returns a function that accepts a @coordinate (a latitude and
     * longitude pair) and a distance in @meters and translates meters to
     * map units.
     */
    private static metersToMapUnitFactory(viewResolution, viewProjection) {
        return function (coordinate, meters) {
            let pointResolution =
                viewProjection.getPointResolution(viewResolution, coordinate);
            return (meters / ol.proj.METERS_PER_UNIT['m']) *
                (viewResolution / pointResolution);
        };
    }

    private static getMaxBubbleRadiusForGeoConfig(geoConfig: GeoConfig): number {
        switch (geoConfig.getType()) {
            case jsonConstants.geoConfigType.ADMIN_DIV_0:
            case jsonConstants.geoConfigType.ADMIN_DIV_1:
                return ADMIN_DIV_0_AND_1_MAX_BUBBLE_SIZE;
            default:
                return DEFAULT_MAX_BUBBLE_SIZE;
        }
    }

    constructor(config: any) {
        super();
        this.logger = Logger.create('blink-geomap');
        this.config = config;
        this.chartModel = config.chartModel;
        this.dataProcessor = new GeoDataProcessor(this.chartModel);
        this.layerGroup = new ol.layer.Group();
        this.dataLabelsEnabled = config.chartModel.isDataLabelsEnabled();
    }

    public postLink(element: JQuery) {
        // A NOTE ABOUT PROJECTIONS:
        // We deal with two types of projections in our geo code.
        // 1. 'EPSG:3857' (Web mercator projection): Which is what we use to visualize our maps to
        //    viewers, we call it 'view projection'.
        // 2. 'EPSG:4326' (plate carrée projection): Sadly mercator projection is not good for
        //    storing data, so the topology data AND also our business data (lat long column values)
        //    is always in this 'plate carrée' projection. We call it 'data projection'.
        //
        // Fortunately openlayer has native support for converting coordinates b/w these two
        // projections. ol.proj.transform(coordinates, fromProjection, toProjection)
        // Whenever we set coordinates data into an ol.Feature object, we must ensure to convert
        // into view projection, and whenever we read coordinates from ol.Feature object and try
        // to use in some business logic, we should convert from view projection to data projection.
        let restrictCenterExtent = ol.proj.transformExtent(
            ALLOWED_WORLD_EXTENT,
            DATA_PROJECTION,
            VIEW_PROJECTION
        );
        let view = new ol.View({
            center: [0, 0], // Pass any value because we will move the map to fit our data later.
            zoom: 2,
            minZoom: 2,
            projection: VIEW_PROJECTION,
            extent: restrictCenterExtent
        });

        this.container = element.find('.bk-geomap-ol-container');
        this.map = new ol.Map({
            layers: [this.layerGroup],
            renderer: 'canvas',
            target: this.container[0],
            view: view,
            controls: [
                // collapsible:false is required by OSM
                new ol.control.Attribution({collapsible: false})
            ],
            interactions: ol.interaction.defaults({
                mouseWheelZoom: false,
                doubleClickZoom: false,
                dragPan: false
            })
        });

        this.setUpInteractions();
        this.setUpEventHandlers();
    }

    public setData(data) {
        this.dataProcessor.setData(data);
        return this.redraw();
    }

    public setSize() {
        if (!this.map || this.layerGroup.getLayers().getLength() === 0) {
            return;
        }
        this.map.updateSize();
        this.fitMapToData();
    }

    public supportsDownload() {
        return true;
    }

    public getSeries() {
        return this.dataProcessor.getAllSeries();
    }

    public getPlotSizeX() {
        return this.container.width();
    }

    public getPlotSizeY() {
        return this.container.height();
    }

    public destroy() {
        this.tooltip = {};
        if (this.map) {
            this.map.un('pointermove', this.onPointerMove);
            this.map.un('moveend', this.onMoveEnd);
            $(this.map.getTarget()).off('mouseleave.blink-geo-maps');
            $(this.map.getTarget()).off('contextmenu.blink-geo-maps');
            this.map.setTarget(null);
            this.labeledFeatureIds.clear();
            this.dataLabels.clear();
            this.features = void 0;
            this.map = null;
        }
    }

    public addSeries(series, doRedraw) {
        this.dataProcessor.addSeries(series);
        if (doRedraw) {
            this.redraw();
        }
    }

    public updateSeries(series, changes) {
        this.dataProcessor.updateSeries(series, changes);
        this.redraw();
    }

    public setSeriesVisibility(serie, visible, doRedraw) {
        this.dataProcessor.setSeriesVisibility(serie, visible);
        if (doRedraw) {
            this.redraw();
        }
    }

    public toBlob(options, callback) {
        if (!this.map) {
            callback(null);
            return;
        }

        this.map.once('postcompose', function (event) {
            let canvas = event.context.canvas;
            let newCanvas = document.createElement('canvas');
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;
            let newContext = newCanvas.getContext('2d');
            newContext.fillStyle = (options.chart && options.chart.backgroundColor) || '#ffffff';
            newContext.rect(0, 0, canvas.width, canvas.height);
            newContext.fill();

            newContext.drawImage(canvas, 0, 0);
            newCanvas.toBlob((blob) => {
                callback(blob);
            });
        });
        this.map.renderSync();
    }

    public isDataLabelsEnabled() {
        return this.dataLabelsEnabled;
    }

    public setDataLabelVisibility(visible: boolean) {
        if (visible !== this.dataLabelsEnabled) {
            this.dataLabelsEnabled = visible;
            this.updateDataLabels(visible);
        }
    }

    public supportsFullScreenMode() {
        return false;
    }

    private setUpInteractions() {
        this.interactionsEnabled = false;
        this.zoomInteraction = new ol.interaction.DoubleClickZoom();
        this.dragInteraction = new ol.interaction.DragPan();
        this.zoomControl = new ol.control.Zoom({
            duration: 500
        });
        this.configureInteractions(this.config.enableInteractions);
    }

    private configureInteractions(enableInteractions) {
        if (enableInteractions !== this.interactionsEnabled) {
            if (enableInteractions) {
                this.map.addInteraction(this.zoomInteraction);
                this.map.addInteraction(this.dragInteraction);
                this.map.addControl(this.zoomControl);
            } else {
                this.map.removeInteraction(this.zoomInteraction);
                this.map.removeInteraction(this.dragInteraction);
                this.map.removeControl(this.zoomControl);
            }
            this.interactionsEnabled = enableInteractions;
        }
    }

    private setUpEventHandlers() {
        this.onPointerMove = util.debounce((event) => {
            if (event.dragging) {
                return;
            }
            this.onMouseMove(event);
        }, 125);
        this.map.on('pointermove', this.onPointerMove);

        $(this.map.getTarget()).on('mouseleave.blink-geo-maps', util.debounce((event) => {
           this.tooltip.shown = false;
        }, 250));

        $(this.map.getTarget()).on('contextmenu.blink-geo-maps', (event) => {
            event.preventDefault();
            this.onMouseRightClick(event);
        });

        this.onHoverHighlightInteraction = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove,
            style: (feature, resolution) => {
                // Note (sunny): the freq. of calls to this function are limited by
                // how fast the user can select a point in the chart hence it is
                // okay to look for the top most layer each time instead of saving
                // a reference to it somewhere
                let topLayer = this.getTopLayer() as BaseImageLayer;
                return topLayer.getStylesForFeature(
                    (feature as ol.Feature),
                    resolution,
                    true /* isHovered */
                );
            },
            layers: (layer) => {
                // SCAL-8898: we don't need to highlight heatmap points on hover. Given the
                // clustering it's not useful.
                if (layer instanceof HeatMapLayer) {
                    return false;
                }
                return this.isUnmanagedOrTopLayer(layer);
            }
        });
        this.map.addInteraction(this.onHoverHighlightInteraction);
        this.previousZoom = this.map.getView().getZoom();
        // Saving the function reference in an instance variable so that we can remove the
        // listener in the destroy() function.
        this.onMoveEnd = () => this.updateDataLabels(this.dataLabelsEnabled);
        this.map.on('moveend', this.onMoveEnd);
    }

    private updateDataLabels(showDataLabels: boolean): void {
        if (!this.features || this.features.length === 0) {
            // Features haven't been fetched yet.
            return;
        }

        let newLabeledFeatures: Set<string> = new Set<string>();
        if (showDataLabels) {
            let is_zoom_event = false;
            if (this.previousZoom !== this.map.getView().getZoom()) {
                this.previousZoom = this.map.getView().getZoom();
                is_zoom_event = true;
            }
            if (this.dataLabels.size === 0) {
                this.buildDataLabelsMap(this.features);
            }
            let $target = $(this.map.getTarget());
            newLabeledFeatures = GeoDataLabelManager.chooseFeaturesForLabeling({
                features: this.features,
                width: $target.width(),
                height: $target.height(),
                coordinateFunc: feature => this.map.getPixelFromCoordinate(
                    GeoUtils.getInteriorPoint(feature).getCoordinates()
                ),
                labels: this.dataLabels,
                prioritize_existing: !is_zoom_event,
                existing_labeled_features: this.labeledFeatureIds,
            });
        }
        if (this.labeledFeatureIds.size > 0 || newLabeledFeatures.size > 0) {
            // Check for each feature whether we are changing the visibility of data label on it.
            // We need to re-render a feature only if we didn't show data label on it previously
            // but decided to show it in this pass, or vice versa.
            this.features.forEach((feature) => {
                let fid = feature.getId() as string;
                if (this.labeledFeatureIds.has(fid) && !newLabeledFeatures.has(fid) ||
                    !this.labeledFeatureIds.has(fid) && newLabeledFeatures.has(fid)) {
                    feature.changed();
                }
            });
            this.labeledFeatureIds = newLabeledFeatures;
        }
    }

    private getDataPointsForMouseEvent(event) {
        let features = this.getFeaturesForMouseEvent(event),
            // TODO (sunny): handle multiple features
            selectedFeature = features[0];

        return this.getFeatureDataPoints(selectedFeature);
    }

    private getFeaturesForMouseEvent(event) {
        if (!this.map) {
            return [];
        }
        let offset = util.getMouseEventOffset(event.originalEvent),
            mouseCoordinatesInMapPixels: [number, number] = [offset.x, offset.y];

        let features = [];
        // Note(mahesh): typings or forEachFeatureAtPixel function is incorrect, typings for this
        // function is according to how it is in 3.20 version of openlayers, even though we are
        // using typings of 3.18 version. That's why we need to untype this.map here before calling
        // forEachFeatureAtPixel function.
        // When we upgrade openlayers and typings again to the latest version then this problem will
        // disappear.
        let map: any = this.map;
        map.forEachFeatureAtPixel(
            mouseCoordinatesInMapPixels, (feature, layer) => {
                features.push(feature);
            }, null,
            (layer) => {
                return this.isUnmanagedOrTopLayer(layer);
            });
        return features;
    }

    private getFeatureDataPoints(feature) {
        if (!feature || !this.dataProcessor || !this.dataProcessor.hasData()) {
            return [];
        }
        return this.dataProcessor.getDataPointsForFeature(feature.getProperties());
    }

    private getFillColorForFeature(feature) {
        if (this.chartModel.getChartType() !== chartTypeSpecificationService.chartTypes.GEO_AREA) {
            return null;
        }
        let dataPointsForFeature = this.getFeatureDataPoints(feature);
        if (!dataPointsForFeature || !dataPointsForFeature.length) {
            this.logger.everyN('warn', 20, 'no data point found for feature', feature);
            return null;
        }
        let dataPoint = dataPointsForFeature[0];
        return chroma(dataPoint.mapColor).css();
    }

    private getDataLabelForFeature(feature) {
        if (this.chartModel.getChartType() ===
            chartTypeSpecificationService.chartTypes.GEO_HEATMAP) {
            return null;
        }
        if (!this.labeledFeatureIds.has(feature.getId())) {
            return null;
        }
        let dataPoints = this.getFeatureDataPoints(feature);
        if (!dataPoints || dataPoints.length === 0) {
            return null;
        }
        return this.getLabelForDataPoint(dataPoints[0]);
    }

    private getLabelForDataPoint(dataPoint: any) {
        let xNameValuePair = this.dataProcessor.getFormattedXValue(dataPoint),
            yNameValuePair = this.dataProcessor.getFormattedYValue(dataPoint);
        return xNameValuePair.value + '\n'
            + yNameValuePair.value;
    }

    private getBubbleRadiusForFeature(feature: ol.Feature, maxBubbleRadius: number): number {
        let dataPoints = this.dataProcessor.getDataPointsForFeature(
            feature.getProperties()
        );
        if (!dataPoints || dataPoints.length === 0) {
            return 0;
        }
        let dataPoint = dataPoints[0],
            measureRangeFraction = dataPoint.hasOwnProperty('measureRangeFraction')
                ? dataPoint.measureRangeFraction : 1.0;

        return MIN_BUBBLE_RADIUS +
            (maxBubbleRadius - MIN_BUBBLE_RADIUS) *
            Math.sqrt(measureRangeFraction);
    }

    private getBubbleColorForFeature(feature: ol.Feature): string {
        let dataPoints = this.dataProcessor.getDataPointsForFeature(
            feature.getProperties()
        );
        if (!dataPoints || dataPoints.length === 0) {
            return null;
        }
        return dataPoints[0].mapColor;
    }

    private onMouseMove(event) {
        let featureDataPoints = this.getDataPointsForMouseEvent(event);
        if (featureDataPoints.length === 0) {
            this.tooltip.shown = false;
            this.forceRender();
            return;
        }

        // TODO (sunny): handle multiple data points for a feature
        let tooltipContent = {},
            featureDataPoint = featureDataPoints[0],
            xNameValuePair = this.dataProcessor.getFormattedXValue(featureDataPoint),
            yNameValuePair = this.dataProcessor.getFormattedYValue(featureDataPoint);

        tooltipContent[xNameValuePair.name] = xNameValuePair.value;
        tooltipContent[yNameValuePair.name] = yNameValuePair.value;
        this.tooltip.content = tooltipContent;
        this.tooltip.shown = true;
        this.tooltip.left = event.originalEvent.clientX;
        this.tooltip.top = event.originalEvent.clientY;
        this.forceRender();
    }

    private onMouseRightClick(event) {
        let featureDataPoints = this.getDataPointsForMouseEvent(event);
        if (featureDataPoints.length === 0) {
            return;
        }
        if (this.config.onRightClick) {
            let offset = util.getMouseEventOffset(event.originalEvent),
                dataPoint = angular.copy(featureDataPoints[0]);

            dataPoint.series = this.dataProcessor.getSeriesForDataPoint(dataPoint);

            let clickData = {
                chartX: offset.x,
                chartY: offset.y,
                point: dataPoint
            };
            this.config.onRightClick(clickData, dataPoint.series.color, dataPoint.series.name);
        }
    }

    private getTopLayer() {
        return this.getLayerAtIndex(-1);
    }

    private getLayerAtIndex(index) {
        let layers = this.layerGroup.getLayers().getArray();
        if (index < 0) {
            index = layers.length + index;
        }
        return layers[index];
    }

    private getExtentOfDataLayer(): ol.Extent {
        let dataLayer = this.getTopLayer();
        if (GeoMapComponent.isIGeoVectorLayer(dataLayer)) {
            let dummySource = new BaseVectorSource({
                features: this.features
            });
            return dummySource.getExtent();
        }
        throw new Error('Invalid top layer');
    }

    private fitMapToData() {
        if (this.features.length === 0) {
            return;
        }
        let extent = this.getExtentOfDataLayer();
        let geoConfigType = this.dataProcessor.getGeoConfig().getType();
        let maxZoom = MAX_DEFAULT_ZOOM_OTHERS;
        if (geoConfigType === jsonConstants.geoConfigType.POINT||
            geoConfigType === jsonConstants.geoConfigType.ZIP_CODE) {
            maxZoom = MAX_DEFAULT_ZOOM_ZIP_AND_POINT;
        }
        this.map.getView().fit(extent, this.map.getSize());
        let newZoom = this.map.getView().getZoom();
        if (newZoom > maxZoom) {
            this.map.getView().setZoom(maxZoom);
        }
    }

    private shouldDrawFeature(hasTileLayer, feature) {
        // For more granular geo levels, to improve performance and clarity we only draw
        // features that have data for, even when we don't have background tiles.
        let geoCofig = this.dataProcessor.getGeoConfig();
        if (hasTileLayer || GeoUtils.isGeoConfigWithPartialDrawing(geoCofig)) {
            return this.getFeatureDataPoints(feature).length > 0;
        }
        return true;
    }

    private getAllLayersLoadedPromise(): Promise<any[]> {
        let layers = this.layerGroup.getLayers().getArray();
        let layerLoadPromises = layers.map((layer) => {
            return GeoMapComponent.getLayerLoadPromise(layer);
        });
        return Promise.all(layerLoadPromises);
    }

    private getTileLayer() {
        /* global flags */
        let geoTileSourceId = flags.getValue('geoTileSourceId');

        if (!geoTileSourceId && sessionService.areMapTilesEnabled()) {
            geoTileSourceId = blinkConstants.geoTypeSourceIds.THOUGHTSPOT_LOCAL;
        }

        if (!geoTileSourceId) {
            return null;
        }

        let url = null;
        let crossOrigin = void 0;
        let maxZoom = 0;
        let attribution = null;

        switch (geoTileSourceId) {
            case blinkConstants.geoTypeSourceIds.THOUGHTSPOT_LOCAL:
                url = blinkConstants.geoTileUrls.THOUGHTSPOT_LOCAL;
                maxZoom = blinkConstants.geoTileMaxZoom.THOUGHTSPOT_LOCAL;
                attribution = blinkConstants.geoTileAttribution.THOUGHTSPOT_LOCAL;
                break;
            case blinkConstants.geoTypeSourceIds.MAPBOX:
                /* global flags */
                let tileType = flags.getValue('geoTileType');
                if (!tileType) {
                    tileType = blinkConstants.geoTileTypes.MAPBOX.LIGHT;
                }
                url = blinkConstants.geoTileUrls.MAPBOX.assign({
                    tileType: tileType
                });
                maxZoom = blinkConstants.geoTileMaxZoom.MAPBOX;
                crossOrigin = 'anonymous';
                break;
            default:
                this.logger.warn('Unhandled map tile source', geoTileSourceId);
        }

        if (!url) {
            return null;
        }

        let sourceConfig: any = {
            tileSize: [IMAGE_TILE_SIZE, IMAGE_TILE_SIZE],
            url: url,
            maxZoom: maxZoom
        };
        if (!!crossOrigin) {
            // We need to set the crossOrigin if tiles are being downloaded from some other
            // domain, otherwise download map functionality will not work.
            sourceConfig.crossOrigin = crossOrigin;
        }
        if (!!attribution) {
            sourceConfig.attributions = [attribution];
        }

        let tileOptions: any = {
            source: new ol.source.XYZ(sourceConfig)
        };

        return new ol.layer.Tile(tileOptions);
    }

    /**
     * Returns whether the given layer is the top layer or an unmanaged layer.
     * An unmanaged layer is something that openlayers' Select interaction maintains
     * internally and and is not added to the geoMap.layerGroup.getLayers().
     * Whenever a feature is selected, openlayer removes it from the main layer and add it to this
     * internal unmanaged layer.
     * While looking for a feature to highlight of select, we only need to consider the top layer
     * and this unmanaged layer, that's where this utility function comes in the picture.
     * @param layer
     * @returns {boolean}
     */
    private isUnmanagedOrTopLayer(layer) {
        let layers = this.layerGroup.getLayers().getArray(),
            layerPosition = layers.indexOf(layer);
        return layerPosition === -1 || layerPosition === layers.length - 1;
    }

    private getTopologyData(): Promise<ol.Feature[]> {
        let geoColumnValues = this.dataProcessor.getAllFeatureIdsOfSeries(),
            geoConfig = this.dataProcessor.getGeoConfig();

        if (geoConfig.getType() === jsonConstants.geoConfigType.POINT) {
            // For lat, long points we will simply build Point feature for each lat, long pair.
            // There will be no caching involved because number of possible set of points is
            // infinite.
            return this.getTopologyDataForPointsGeoType(geoColumnValues);
        }

        let geomType: GeometryType = 'POINT';
        if (this.chartModel.getChartType() === chartTypeSpecificationService.chartTypes.GEO_AREA) {
            geomType = 'POLYGON';
        }
        return GeoEntityMatchingService.findMatchingFeatures(
            geoColumnValues,
            geomType,
            geoConfig.getType(),
            geoConfig.getParent() && geoConfig.getParent().getFixedValue(),
            geoConfig.getCustomFileGuid()
        ).then((matchedFeatures: ol.Feature[][]) => {
            let features: Array<ol.Feature|null> =
                matchedFeatures.map((features: ol.Feature[], index) => {
                    if (features.length === 1) {
                        return features[0];
                    }
                    this.logger.warn(
                        'could not find unique matching entity for ',
                        geoColumnValues[index]
                    );
                    return null;
                });
            this.dataProcessor.buildUniqueFeatureIdToDataPointsMap(features);
            return this.features = features.filter((feature) => !!feature);
        });
    }

    private getTopologyDataForPointsGeoType(latLongPairs: string[]): Promise<ol.Feature[]> {
        let features = latLongPairs.map((latLongPair: string) => {
            let props: any = {
                GEOID: latLongPair
            };
            let latLong = latLongPair.split(', ');
            let coords: [number, number] = [+latLong[1], +latLong[0]];
            if (isNaN(coords[0]) || isNaN(coords[1])) {
                this.logger.warn('Invalid geo coordinate', latLongPair);
                return null;
            }
            // Convert to view projection. See note at the top of GeoMapComponent class about
            // projections.
            coords = ol.proj.transform(coords, DATA_PROJECTION, VIEW_PROJECTION);
            props.geometry = new ol.geom.Point(coords);
            let feature = new ol.Feature(props);
            feature.setId(props.GEOID);
            return feature;
        });
        this.dataProcessor.buildUniqueFeatureIdToDataPointsMap(features);
        return Promise.resolve(this.features = features.filter((feature => !!feature)));
    }

    private redraw() {
        return this.getTopologyData()
            .then((features) => {
                this.dataLabels.clear();
                return this.redrawFeatures();
            }).then(() => {
                this.updateColorScale();
                this.forceRender();
            });
    }

    private buildDataLabelsMap(features: ol.Feature[]): ol.Feature[] {
        features.forEach((feature) => {
            let dataPoint = this.getFeatureDataPoints(feature)[0];
            if (!dataPoint) {
                throw new Error('data point must be present for feature');
            }
            this.dataLabels.set('' + feature.getId(), this.getLabelForDataPoint(dataPoint));
        });
        return features;
    }

    private redrawFeatures() {
        if (!!this.layerGroup) {
            this.layerGroup.getLayers().clear();
        }

        let tileLayer = this.getTileLayer(),
            layers = [];
        if (!!tileLayer) {
            layers.push(tileLayer);
        }

        let backgroundWorldMapLayer = new TopologyLayer({
            loader: new PolygonFeatureLoader({
                level: jsonConstants.geoConfigType.ADMIN_DIV_0,
            }),
            boundaryColor: BACKGROUND_WORLD_MAP_BOUNDARY_COLOR,
            fillColor: BACKGROUND_WORLD_MAP_FILL_COLOR
        });
        layers.push(backgroundWorldMapLayer);

        // IDs of features that we have data for.
        let geoConfig = this.dataProcessor.getGeoConfig(),
            chartType = this.chartModel.getChartType();
        // As for zip and county level, we will only be drawing those boundaries which we have data
        // for, so we will add a layer to draw US state level boundaries so that the map still looks
        // complete and connected.
        let stateBoundariesLayer: TopologyLayer|null = null;
        if (GeoUtils.isGeoConfigWithPartialDrawing(geoConfig)) {
            stateBoundariesLayer = new TopologyLayer({
                loader: new PolygonFeatureLoader({
                    level: jsonConstants.geoConfigType.ADMIN_DIV_1,
                    country: geoConfig.getParent().getFixedValue(),
                }),
                boundaryColor: CHOROPLETH_DIV_1_BOUNDARY_COLOR,
                isDottedStroke: true
            });
            layers.push(stateBoundariesLayer);
        }

        // Background world boundaries and state boundaries should remain hidden if map tiles are
        // enabled, unless the loading of tiles fails, then they should show up.
        if (tileLayer) {
            backgroundWorldMapLayer.setVisible(false);
            if (!!stateBoundariesLayer) {
                stateBoundariesLayer.setVisible(false);
            }
            tileLayer.getSource().once('tileloaderror', (event) => {
                backgroundWorldMapLayer.setVisible(true);
                if (!!stateBoundariesLayer) {
                    stateBoundariesLayer.setVisible(true);
                }
            });
        }

        let featureIdsOfGeoObjects = this.dataProcessor.getAllFeatureIdsOfGeoObjects();
        if (featureIdsOfGeoObjects.length > 0) {
            let viewProjection = this.map.getView().getProjection();
            let viewResolution = this.map.getView().getResolution();
            let geoObjectLayer = new GeoObjectLayer(
                featureIdsOfGeoObjects,
                featureId => this.dataProcessor.getGeoObjectsForFeature(featureId),
                GeoMapComponent.metersToMapUnitFactory(viewResolution, viewProjection),
                viewProjection.getCode()
            );
            layers.push(geoObjectLayer);
        }

        if (GeoMapComponent.shouldDrawFeatureBoundaries(geoConfig, chartType)) {
            let topologyLayer = new TopologyLayer({
                loader: new PolygonFeatureLoader({
                    level: geoConfig.getType(),
                    country: geoConfig.getParent() && geoConfig.getParent().getFixedValue(),
                    customFileGuid: geoConfig.getCustomFileGuid(),
                    filter: (feature) => this.shouldDrawFeature(!!tileLayer, feature),
                }),
                boundaryColor: CHOROPLETH_DIV_2_BOUNDARY_COLOR,
                fillColor: (feature) => this.getFillColorForFeature(feature),
                label: (feature) => this.getDataLabelForFeature(feature)
            });
            layers.push(topologyLayer);
        }

        if (chartType === chartTypeSpecificationService.chartTypes.GEO_BUBBLE) {
            let maxBubbleRadius = GeoMapComponent.getMaxBubbleRadiusForGeoConfig(geoConfig);
            let bubbleLayer = new BubbleLayer({
                features: this.features,
                radius: (feature, maxAllowedRadius) => this.getBubbleRadiusForFeature(
                    feature,
                    Math.min(maxBubbleRadius, maxAllowedRadius)
                ),
                color: (feature) => this.getBubbleColorForFeature(feature),
                label: (feature) => this.getDataLabelForFeature(feature)
            });
            layers.push(bubbleLayer);
        } else if (chartType === chartTypeSpecificationService.chartTypes.GEO_HEATMAP) {
            let heatMapLayer = new HeatMapLayer({
                features: this.features,
                weight: (feature: ol.Feature) => {
                    let dataPoints = this.dataProcessor.getDataPointsForFeature(
                        feature.getProperties()
                    );
                    if (!dataPoints || dataPoints.length === 0) {
                        return 0;
                    }
                    return HEATMAP_WEIGHT_BASE
                        + HEATMAP_WEIGHT_FRACTION * dataPoints[0].measureRangeFraction;
                }
            });
            layers.push(heatMapLayer);
        }

        this.layerGroup.getLayers().extend(layers);

        return this.getAllLayersLoadedPromise().then(
            () => this.fitMapToData()
        );
    }

    private updateColorScale(): void {
        if (this.chartModel.getChartType() !== chartTypeSpecificationService.chartTypes.GEO_AREA) {
            this.colorScaleCtrl = null;
            return;
        }
        let series = this.dataProcessor.getAllSeries();
        let visibleSeries = series.filter((serie) => {
            return !Object.has(serie, 'visible') || serie.visible === true;
        });
        this.colorScaleCtrl = null;
        if (visibleSeries.length === 1) {
            let serie = visibleSeries[0];
            if (!!serie.isRangeValid) {
                this.colorScaleCtrl = new ColorScaleComponent({
                    colors: chroma.scale(serie.scale),
                    leftText: this.dataProcessor.getFormattedYValue(serie.minDataPoint).value,
                    rightText: this.dataProcessor.getFormattedYValue(serie.maxDataPoint).value,
                });
            }
        }
    }
}
