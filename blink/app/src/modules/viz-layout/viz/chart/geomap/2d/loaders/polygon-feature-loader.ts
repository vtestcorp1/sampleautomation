/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview An PolygonFeatureLoader that loads boundary polygon features for a given admin
 * level and country. This currently supports only JSON based feature formats.
 */

import {Provide} from 'src/base/decorators';
import GeoTopologyDataStore from '../../base/metadata-services/geo-topology-data-store';
import ObservableFeatureLoader from './observable-feature-loader';

interface PolygonFeatureLoaderOptions {
    level: string;
    country?: string;
    customFileGuid?: string;
    filter?: (feature: ol.Feature) => boolean;
}

@Provide('PolygonFeatureLoader')
export default class PolygonFeatureLoader extends ObservableFeatureLoader {

    private level: string;
    private country: string|undefined;
    private filter: ((feature: ol.Feature) => boolean)|undefined;
    private customFileGuid: string|undefined;

    constructor(options: PolygonFeatureLoaderOptions) {
        super();
        this.level = options.level;
        this.country = options.country;
        this.filter = options.filter;
        this.customFileGuid = options.customFileGuid;
    }

    public createLoader() {
        let polygonLoader = this;
        // this is the function that will be called when the map needs to load features
        // for a particular bbox (or depending on config, the entire feature set)
        return function (extent: ol.Extent, resolution: number, projection: ol.proj.Projection) {
            let source = this;
            GeoTopologyDataStore.getFeatures(
                'POLYGON',
                polygonLoader.level,
                polygonLoader.country,
                polygonLoader.customFileGuid
            ).then((features: ol.Feature[]) => {
                if (!!polygonLoader.filter) {
                    features = features.filter(polygonLoader.filter);
                }
                source.addFeatures(features);
                polygonLoader.onLoad(null, features);
            });
        };
    }
}
