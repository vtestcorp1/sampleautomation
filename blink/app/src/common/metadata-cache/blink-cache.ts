/**
 * @author francois.chabbey
 * @fileoverview  this a simple wrapper around the lru-cache library
 * https://github.com/isaacs/node-lru-cache
 *
 * This cache has LRU semantics and can fix an age limit in milliseconds
 * either globally, or per object.
 *
 * Aged objects are NOT removed eagerly. Their are dropped from the cache
 * when you query for them or use the .prune method.
 *
 * Look at the constructor function for options
 *
 * For generating the library, use browserify
 *
 * 1. npm install browserifiy -g
 * 2. browserify -s lru  lru-cache.js > lru-browserified.js
 *
 * You need to use the -s flag to expose the module as a global
 *
 */

'use strict';

import {Cache, Options} from 'lru-cache';
import {Provide} from 'src/base/decorators';
// default settings
const MAX = 10;
const MAX_AGE = 1000 * 60 * 60;
const STALE_DEFAULT = false;

declare var LRU: any;

@Provide('BlinkCache')
export class BlinkCache<T> {

    private lruCacheInstance: Cache<T>;

    /**
     *
     * @param max - Maximum number of items
     * @param maxAge - Maximum age of items, in ms
     * ( Pruning is done lazily, use prune to do eager pruning)
     * @param length - Function used to compute the length of an item, returns 1 by default
     * @param dispose - Function called just before an object is removed from the cache
     * @param stale - If set to true, cache will return a stale maxAged value before deleting it
     */
    public constructor(max: number = MAX,
                       maxAge = MAX_AGE,
                       length?: (value: T) => number,
                       dispose?: (key: string, value: T) => void,
                       stale: boolean = STALE_DEFAULT) {

        var options: Options<T> = {
            max: max,
            maxAge: maxAge,
            stale: stale,
            length: undefined,
            dispose: undefined
        };

        if (!!length) {
            options.length = length;
        }
        if (!!dispose) {
            options.dispose = dispose;
        }
        this.lruCacheInstance = LRU(options);
    }

    // TODO(chab) the day we have a correct object metadata objects hierarchy,
    // we can use the metadata object root class
    public getItem(key: string): any {
        return this.lruCacheInstance.get(key);
    }

    public keys(): any[] {
        return this.lruCacheInstance.keys();
    }
    public values(): T[] {
        return this.lruCacheInstance.values();
    }

    /**
     * Removes all maxAged items
     */
    public prune(): void {
        this.lruCacheInstance.prune();
    }

    /**
     * Clears the cache
     */
    public reset(): void {
        this.lruCacheInstance.reset();
    }

    /**
     *
     * @returns {number}
     */
    public itemCount(): number {
        return this.lruCacheInstance.itemCount;
    }

    /**
     *
     * By default, an item has a length of one, so itemCount and length are the same
     * If you override the length function, you'll get different result
     * You want this behavior if you cache buffer or strings.
     *
     * @returns {number}
     */
    public length(): number {
        return this.lruCacheInstance.length;
    }

    public forEach(iter: (value: T, key: any, cache: Cache<T>) => void, thisp?: any): void {
        this.lruCacheInstance.forEach(iter, thisp);
    }

    /**
     *
     * @param key
     * @param value
     * @param maxAge - maximum age in milliseconds
     */
    public setItem(key:any, value:T, maxAge?:number): void {
        this.lruCacheInstance.set(key, value, maxAge);
    }
}

