/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 *
 * RelatedLinkCache is used to send data across html pages:
 * From the source visualization we need to send two sets of data to relatedLink page.
 * - The selected context menu data of the source visualization that that will form the filters.
 * - The relatedLink data that is selected to get to the target pinboard, visualization and the
 *   column mappings.
 *
 * We use RelatedLinkCache service to store the item in memory as well as write it to session
 * manager. Writing to session manager helps to relaod the data from session when navigating
 * back and forth from the browser.
 */

import {ngRequire, Provide} from '../../base/decorators';
import {RelatedLink} from './related-link-model';

let util = ngRequire('util');

@Provide('RelatedLinkCacheService')
export class RelatedLinkCache {
    private static singletonInstance: RelatedLinkCache;
    private static relatedLinkPrefix: string ='relatedLink:';
    private static localCache : Map<string, RelatedLinkCacheItem> =
        new Map<string, RelatedLinkCacheItem>();
    private static maxElementsToHold : number = 100;

    constructor() {
        if (!RelatedLinkCache.singletonInstance) {
            RelatedLinkCache.singletonInstance = this;
        }
        return RelatedLinkCache.singletonInstance;
    }

    public deleteObject(key: string) {
        if (RelatedLinkCache.localCache.has(key)) {
            RelatedLinkCache.localCache.delete(key);
        }
         util.deleteSessionStoreKey(this.getKey(key));
    }

    public getObject(key: string) : RelatedLinkCacheItem {
        if (RelatedLinkCache.localCache.has(key)) {
            return RelatedLinkCache.localCache.get(key);
        } else {
            return util.getSessionStoreValue(this.getKey(key));
        }
    }

    public putObject(key: string, value : RelatedLinkCacheItem) {
        this.resetIfMaxReached();
        RelatedLinkCache.localCache.set(key, value);
        util.setSessionStoreValue(this.getKey(key), value);
    }

    private getKey(key : string) : string {
        return RelatedLinkCache.relatedLinkPrefix + key;
    }

    private resetIfMaxReached() {
        if (RelatedLinkCache.localCache.size > RelatedLinkCache.maxElementsToHold) {
            RelatedLinkCache.localCache.clear();
        }
    }
}

export class RelatedLinkCacheItem {
    public filters : any;
    public relatedLink: any;
    constructor(relatedLink: RelatedLink, filters: any) {
        this.filters = filters;
        this.relatedLink = relatedLink;
    }
}

