/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
import _ from 'lodash';
import {runAfterAppReady} from './decorators';

declare var Proxy:any;
declare var window: any;

/**
 * Creates a Proxy on the underlying dependency Object.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * It intercepts gets/sets/constructs on the underlying object via handlers.
 * Since ng dependencies might not be available during load time, we return
 * a proxy initially. And when the first call to get a property on the dependency
 * is made, we use the injector to inject that dependency lazily.
 * @param dependencyName
 * @param getInjector
 * @returns {any}
 */
export function createProxy(dependencyName, getInjector) {
    // ES6 Proxy support is in limited browsers only.
    let realDep;

    // _.isFunction fails on Safari 10 for window.Proxy, so we add this test
    if(_.isFunction(window.Proxy) || typeof window.Proxy === 'function') {
        return new Proxy(_.noop, {
            get: function(target, property) {
                realDep = realDep || getRealDependency(getInjector, dependencyName);
                return realDep[property];
            },
            set: function(target, property, value) {
                realDep = realDep || getRealDependency(getInjector, dependencyName);
                realDep[property] = value;
                return true;
            },
            construct: function (target, args) {
                realDep = realDep || getRealDependency(getInjector, dependencyName);
                return new realDep(...args);
            },
            apply: function(target, thisArg, argumentsList) {
                realDep = realDep || getRealDependency(getInjector, dependencyName);
                return realDep.apply(thisArg, argumentsList);
            }
        });
    } else {
        let FakeProxy:any = function () {
            return FakeProxy.___super.apply(this, arguments);
        };

        runAfterAppReady(function() {
            realDep = getInjector().get(dependencyName);
            if(_.isFunction(realDep)) {
                inherits(FakeProxy, realDep);
            }
            _.assignIn(FakeProxy, realDep);
        });
        return FakeProxy;
    }
}

function getRealDependency(getInjector, dependencyName) {
    return getInjector().get(dependencyName);
}

function inherits(ctor, superCtor) {
    ctor.___super = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
}
