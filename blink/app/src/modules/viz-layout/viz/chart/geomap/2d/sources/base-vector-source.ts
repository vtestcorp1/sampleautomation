/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview A subclass of ol.source.Vector that encapsulates some common
 * operations around vector geo data loading and parsing.
 */
import {Provide} from 'src/base/decorators';
import ObservableFeatureLoader from '../loaders/observable-feature-loader';

interface BaseVectorSourceOptions {
    /**
     * Specify this if you are loading the features asynchronously from some remote source.
     */
    loader?: ObservableFeatureLoader;
    /**
     * Specify this if you have the features already available.
     */
    features?: ol.Feature[];
}

@Provide('BaseVectorSource')
export default class BaseVectorSource extends ol.source.Vector {

    private promise: Promise<ol.Feature[]>;

    constructor(options: BaseVectorSourceOptions = {}) {
        if (!options.features && !options.loader) {
            throw new Error('Must provide either features or loader');
        }

        let config: olx.source.VectorOptions = {
            wrapX: false
        };
        if (!!options.loader) {
            config.loader = options.loader.getLoader();
        }
        if (!!options.features) {
            config.features = options.features;
        }
        super(config);

        if (!!options.loader) {
            this.promise = options.loader.getPromise();
        }
        if (!!options.features) {
            this.promise = Promise.resolve(options.features);
        }
    }

    public addFeatures(features: Array<ol.Feature>): Array<ol.Feature> {
        ol.source.Vector.prototype.addFeatures.call(this, features);
        return features;
    }

    public getPromise(): Promise<ol.Feature[]> {
        return this.promise;
    }
}
