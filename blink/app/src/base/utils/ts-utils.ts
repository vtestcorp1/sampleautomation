/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Common TS utilities exported as decorators.
 */

import {ngRequire} from '../decorators';

let $timeout = ngRequire('$timeout');

export function debounce(time: number, applyChange: boolean = false) {
    time = time || 100; // default debouncing.
    return function(target: Object, pKey: string, descriptor: PropertyDescriptor) {
        descriptor = descriptor || Object.getOwnPropertyDescriptor(target, pKey);
        let originalMethod = descriptor.value;
        let timer = null;
        descriptor.value = function() {
            if (!!timer) {
                $timeout.cancel(timer);
                timer = null;
            }
            let args = Array.prototype.slice.call(arguments);
            timer = $timeout(() => {
                originalMethod.apply(this, args);
            }, time, !!applyChange);
        };
        return descriptor;
    };
}

/**
 * Utility function to define string based enums. This is how all the new string enum must be
 * defined going forward.
 * Example:
 *
 * // Create a K:V
 * const Direction = strEnum([
 *   'North',
 *   'South',
 *   'East',
 *   'West'
 * ]);
 * // Create a Type
 * type Direction = keyof typeof Direction;
 *
 * // Sample using a string enum
 * let sample: Direction;
 *
 * sample = Direction.North; // Okay
 * sample = 'North'; // Okay
 * sample = 'AnythingElse'; // ERROR!
 *
 * @see https://basarat.gitbooks.io/typescript/docs/types/literal-types.html
 *
 * @param o
 * @returns {any}
 */
export function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}

export class MapWithArray<K,V> {
    private _elements:V[] = [];
    private _elementsByKey:Map<K, V> = new Map<K, V>() ;
    public getArray(): V[] {
        return this._elements;
    }
    /**
     *
     * @param key
     * @param value
     * @returns {boolean} true if the element was added,
     *  false otherwise ( if the elements is already there)
     */
    public addElement(key:K, value:V):boolean {
        if (this._elementsByKey.has(key)) {
            return false;
        }
        this._elementsByKey.set(key, value);
        this._elements.push(value);
        return true;
    }
    public getElementByKey(key: K) {
        return this._elementsByKey.get(key);
    }
    public removeElementByKey(key: K): boolean {
        if (!this._elementsByKey.has(key)) {
            return false;
        }
        this._elementsByKey.delete(key);
        this._elements.splice(
            this._elements.indexOf(this._elementsByKey.get(key)), 1
        );
        return true;
    }

    public clear() {
        this._elements = [];
        this._elementsByKey.clear();
    }
}

export function getDOMClassesFromSelector(selector: string): string {
    return selector.replace(/\./, '').replace(/\./g, ' ');
}

// Refer: https://www.typescriptlang.org/docs/handbook/mixins.html
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
