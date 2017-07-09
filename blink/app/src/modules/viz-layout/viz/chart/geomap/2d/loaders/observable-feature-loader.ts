/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Extended version of the default xhr feature loader adding a loading callback.
 */

abstract class ObservableFeatureLoader {

    private promise: Promise<ol.Feature[]>;
    private loader: ol.FeatureLoader;
    private resolvePromise: (features: ol.Feature[]) => void;
    private rejectPromise: (error: string) => void;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
        this.loader = this.createLoader();
    }

    abstract createLoader(): ol.FeatureLoader;

    public onLoad(error: any, features: Array<ol.Feature>) {
        if (!!error) {
            this.rejectPromise(error);
        } else {
            this.resolvePromise(features);
        }
    }

    public getLoader() {
        return this.loader;
    }

    /**
     * Promise returned from this method will be resolved with the loaded features (or rejected
     * with the error).
     * @returns {*}
     */
    public getPromise(): Promise<ol.Feature[]> {
        return this.promise;
    }
}
// Apparently TS has a bug that cause it to not able to support
// "export default abstract class Foo {...}" in one line. So we have to export in new line.
export default ObservableFeatureLoader;
