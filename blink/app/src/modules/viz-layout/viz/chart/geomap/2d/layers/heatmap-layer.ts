/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview A subclass of ol.layer.Heatmap that works with feature
 * vectors represented by their centroids.
 */

import {HEATMAP_GRADIENT_COLORS} from '../../base/geo-constants';
import ObservableFeatureLoader from '../loaders/observable-feature-loader';
import BaseVectorSource from '../sources/base-vector-source';
import IGeoVectorLayer from './geo-vector-layer';

interface HeatMapLayerOptions {
    features?: ol.Feature[];
    loader?: ObservableFeatureLoader;
    weight: number|((feature: ol.Feature) => number);
}

export default class HeatMapLayer extends ol.layer.Heatmap implements IGeoVectorLayer {

    constructor(options: HeatMapLayerOptions) {
        let weight;
        if (typeof options.weight === 'function') {
            weight = options.weight;
        } else {
            weight = (feature: ol.Feature) => {
                return options.weight;
            };
        }
        super({
            source: new BaseVectorSource({
                features: options.features,
                loader: options.loader
            }),
            gradient: HEATMAP_GRADIENT_COLORS,
            weight: weight
        });
    }

    /**
     * Returns the source used to plot the political geo boundaries in this layer.
     * @returns {BaseVectorSource}
     */
    public getVectorSource(): BaseVectorSource {
        return this.getSource() as BaseVectorSource;
    }
}
