/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Class for bubble layer in a bubble type geo map.
 * Responsible for showing bubble of correct size/color in the layer
 * based on the data provided.
 */
import {ngRequire} from 'src/base/decorators';
import {
    ADMIN_DIV_0_AND_1_MAX_BUBBLE_SIZE,
    BOUNDARY_THICKNESS,
    BUBBLE_OPACITY,
    DEFAULT_BUBBLE_COLOR,
    DEFAULT_BUBBLE_RADIUS,
    HOVERED_BOUNDARY_COLOR, HOVERED_BOUNDARY_THICKNESS,
    MIN_BUBBLE_RADIUS
} from '../../base/geo-constants';
import ObservableFeatureLoader from '../loaders/observable-feature-loader';
import BaseImageLayer from './base-image-layer';

let geoUtil = ngRequire('geoUtil');

interface BubbleLayerOptions {
    features?: ol.Feature[];
    loader?: ObservableFeatureLoader;
    radius?: number|((feature: ol.Feature, maxAllowedRadius: number) => number);
    color?: string|((feature: ol.Feature) => string);
    label?: string|((feature: ol.Feature) => string|null);
}

export default class BubbleLayer extends BaseImageLayer {

    private radius: number|((feature: ol.Feature, maxAllowedRadius: number) => number);
    private color: string|((feature: ol.Feature) => string);
    private maxAllowedRadius?: number;
    private lastResolution?: number;
    private label: string|((feature: ol.Feature) => string|null);

    constructor(options: BubbleLayerOptions) {
        super({
            features: options.features,
            loader: options.loader
        });
        this.radius = options.radius;
        this.color = options.color;
        this.label = options.label;
    }

    public getStylesForFeature(
        feature: ol.Feature,
        resolution: number,
        isHovered: boolean
    ): ol.style.Style|ol.style.Style[] {
        if (this.maxAllowedRadius === void 0 || Math.abs(resolution - this.lastResolution) > 1) {
            let source,
                area,
                numFeatures,
                areaPerFeature,
                maxGeoRadius;

            source = this.getVectorSource();
            area = geoUtil.getAreaOfExtent(source.getExtent());
            numFeatures = source.getFeatures().length;
            areaPerFeature = area / numFeatures;
            maxGeoRadius = Math.sqrt(areaPerFeature / Math.PI);
            this.maxAllowedRadius = maxGeoRadius / resolution;
            if (numFeatures === 1) {
                // If there is only 1 feature, then the extent will have 0 area, which will result
                // in maxAllowedRadius set to MIN_BUBBLE_RADIUS, and then the one and only bubble
                // on the screen will be very tiny.
                this.maxAllowedRadius = ADMIN_DIV_0_AND_1_MAX_BUBBLE_SIZE;
            }
            this.maxAllowedRadius = Math.max(MIN_BUBBLE_RADIUS, this.maxAllowedRadius);
            this.lastResolution = resolution;
        }

        let radius = DEFAULT_BUBBLE_RADIUS;
        if (typeof this.radius === 'function') {
            radius = this.radius(feature, this.maxAllowedRadius);
        } else {
            radius = this.radius as number;
        }
        if (!radius) {
            return [];
        }

        let color = DEFAULT_BUBBLE_COLOR;
        if (typeof this.color === 'function') {
            color = this.color(feature);
        } else {
            color = this.color as string;
        }
        if (!color) {
            return [];
        }

        // TODO (sunny): use AtlasManager to improve rendering performance when we start using
        // webgl renderer
        let colorArray = ol.color.asArray(color) as any;
        // slice() is used to create a new color array. This is to avoid corrupting the
        // "color strings to color arrays" cache that the ol.color.asArray function maintains.
        colorArray = colorArray.slice();
        colorArray[3] = BUBBLE_OPACITY;

        let bubble = new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({
                color: colorArray
            }),
            stroke: new ol.style.Stroke({
                color: isHovered ? HOVERED_BOUNDARY_COLOR : colorArray,
                width: isHovered ? HOVERED_BOUNDARY_THICKNESS : BOUNDARY_THICKNESS
            })
        });
        let styles = [new ol.style.Style({
            image: bubble
        })];

        if (!!this.label) {
            let labelStyle = BaseImageLayer.geTextLabelStyle(feature, this.label);
            if (!!labelStyle) {
                styles.push(labelStyle);
            }
        }
        return styles;
    }
}
