/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Base class for Image layers that draw vector data using ImageVector class.
 */

import {
    DATA_LABEL_FILL_COLOR, DATA_LABEL_FONT,
    DATA_LABEL_STROKE_COLOR, DATA_LABEL_STROKE_WIDTH, VIEW_PROJECTION
} from '../../base/geo-constants';
import {GeoUtils} from '../../base/geo-utils';
import ObservableFeatureLoader from '../loaders/observable-feature-loader';
import BaseVectorSource from '../sources/base-vector-source';
import IGeoVectorLayer from './geo-vector-layer';

interface BaseImageLayerOptions {
    /**
     * Specify this if you are loading the features asynchronously from some remote source.
     */
    loader?: ObservableFeatureLoader;
    /**
     * Specify this if you have the features already available.
     */
    features?: ol.Feature[];
}

// Note: Earlier we were using VectorLayer with VectorSource to draw boundaries.
// But that was very slow for anything more granular than state level boundaries, because it
// re-renders the entire map during transitions.
// In the current approach of using ImageLayer with ImageVector source, the boundaries are not
// re-rendered again while view is transitioning, so it is faster.
// See http://openlayers.org/workshop/layers/imagevector.html for more details.
abstract class BaseImageLayer extends ol.layer.Image implements IGeoVectorLayer {

    /**
     * Utility function which subclasses case use to add the data label style.
     * @param feature
     * @param label
     */
    protected static geTextLabelStyle(
        feature: ol.Feature,
        label: string|((feature) => string|null)
    ): ol.style.Style {
        let labelText: string;
        if (typeof label === 'function') {
            labelText = label(feature);
        } else {
            labelText = label as string;
        }
        if (!!labelText) {
            return new ol.style.Style({
                text: new ol.style.Text({
                    font: DATA_LABEL_FONT,
                    text: labelText,
                    fill: new ol.style.Fill({
                        color: DATA_LABEL_FILL_COLOR
                    }),
                    stroke: new ol.style.Stroke({
                        color: DATA_LABEL_STROKE_COLOR,
                        width: DATA_LABEL_STROKE_WIDTH
                    })
                }),
                geometry: GeoUtils.getInteriorPoint,
            });
        }
        return null;
    }

    constructor(options: BaseImageLayerOptions = {}) {
        let source: ol.source.Image = new ol.source.ImageVector({
            source: new BaseVectorSource({
                loader: options.loader,
                features: options.features
            }),
            projection: VIEW_PROJECTION,
            style: (feature, resolution) =>
                this.getStylesForFeature(
                    feature as ol.Feature,
                    resolution,
                    false /* isHovered */
                ),
        });
        // Note: Tyepscript compiler seems to get confused when an interface type has 'map' as the
        // key. So we are using 'any' as the type to suppress the error.
        let superOptions: any = {
            source: source
        };
        super(superOptions);
    }

    /**
     * Returns the source used to plot the political geo boundaries in this layer.
     * @returns {BaseVectorSource}
     */
    public getVectorSource(): BaseVectorSource {
        let imageVectorSource = this.getSource() as ol.source.ImageVector;
        return imageVectorSource.getSource() as BaseVectorSource;
    }

    public abstract getStylesForFeature(
        feature: ol.Feature,
        resolution: number,
        isHovered: boolean,
    ): ol.style.Style|ol.style.Style[];
}

export default BaseImageLayer;
