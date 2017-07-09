/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Class for the geo map layer for the topology shown in the map.
 */

import {ngRequire} from 'src/base/decorators';
import {
    BOUNDARY_THICKNESS, DEFAULT_BOUNDARY_COLOR, DEFAULT_FILL_COLOR,
    HOVERED_BOUNDARY_COLOR, HOVERED_BOUNDARY_THICKNESS
} from '../../base/geo-constants';
import ObservableFeatureLoader from '../loaders/observable-feature-loader';
import BaseImageLayer from './base-image-layer';

let Logger = ngRequire('Logger');

interface TopologyLayerOptions {

    /**
     * Array of features to render. Must provide either this or 'loader' param.
     */
    features?: ol.Feature[];
    /**
     * Loader that will load features into the source of this layer. Must provide either this or
     * 'features' param.
     */
    loader?: ObservableFeatureLoader;
    /**
     * Color to use for drawing the boundaries of features, takes either a fixed rgb string like
     * 'red', '#fafafa', 'rgb(100, 100, 100)', 'rgba(150, 150, 150, 0.3)', or a function that takes
     * feature as an argument and returns the color string.
     * Default is grey.
     */
    boundaryColor?: string|((feature: ol.Feature) => string);
    /**
     * Color to use for filling the polygons in the features, takes either a fixed rgb string like
     * '#fafafa' or 'rgb(100, 100, 100)' or 'rgba(150, 150, 150, 0.3)', or a function that takes
     * feature as argument and returns the color string.
     * Default is 'transparent'
     */
    fillColor?: string|((feature: ol.Feature) => string);

    /**
     * If the stroke should be dotted, default is false.
     */
    isDottedStroke?: boolean;

    /**
     * Text label to show on top of the feature.
     */
    label?: string|((feature: ol.Feature) => string|null);
}

export default class TopologyLayer extends BaseImageLayer {

    private logger: any;
    private boundaryColor: string|((feature: ol.Feature) => string)|undefined;
    private fillColor: string|((feature: ol.Feature) => string)|undefined;
    private isDottedStroke: boolean;
    private label: ((feature: ol.Feature) => string)|string|undefined;

    constructor(options: TopologyLayerOptions) {
        super({
            features: options.features,
            loader: options.loader
        });
        this.boundaryColor = options.boundaryColor;
        this.fillColor = options.fillColor;
        this.isDottedStroke = options.isDottedStroke || false;
        this.label = options.label;
        this.logger = Logger.create('topology-layer');
    }

    public getStylesForFeature(
        feature: ol.Feature,
        resolution: number,
        isHovered: boolean,
    ): ol.style.Style|ol.style.Style[] {
        let strokeColor;
        if (isHovered) {
            strokeColor = HOVERED_BOUNDARY_COLOR;
        } else {
            if (!!this.boundaryColor) {
                if (typeof this.boundaryColor === 'function') {
                    strokeColor = this.boundaryColor(feature);
                } else {
                    strokeColor = this.boundaryColor as string;
                }
            }
        }
        strokeColor = strokeColor || DEFAULT_BOUNDARY_COLOR;

        let fillColor;
        if (!!this.fillColor) {
            if (typeof this.fillColor === 'function') {
                fillColor = this.fillColor(feature);
            } else {
                fillColor = this.fillColor as string;
            }
        }
        fillColor = fillColor || DEFAULT_FILL_COLOR;

        let strokeWidth = isHovered ? HOVERED_BOUNDARY_THICKNESS : BOUNDARY_THICKNESS;
        let strokeProps: olx.style.StrokeOptions = {
            color: strokeColor,
            width: strokeWidth
        };
        if (this.isDottedStroke) {
            strokeProps.lineDash = [12, 12];
        }
        let styles = [
            new ol.style.Style({
                fill: new ol.style.Fill({
                    color: fillColor
                }),
                stroke: new ol.style.Stroke(strokeProps),
            })
        ];
        if (!!this.label) {
            let labelStyle = BaseImageLayer.geTextLabelStyle(feature, this.label);
            if (!!labelStyle) {
                styles.push(labelStyle);
            }
        }
        return styles;
    }
}
