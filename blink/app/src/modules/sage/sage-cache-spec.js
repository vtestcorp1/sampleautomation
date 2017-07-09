/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for sage cache
 */

'use strict';

describe('sage cache', function() {
    var env, sageCache;

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            env = $injector.get('env');
            sageCache = $injector.get('sageCache');
        });
    });

    it('should have a working setState() and getState()', function() {
        var key = 'k1', savedState = { foo: 'bar' };
        sageCache.setState(key, savedState);
        var retrievedState = sageCache.getState(key);
        expect(retrievedState).toBeDefined();
        expect(retrievedState.foo).toBe('bar');
    });

    it('should only save a max number of items', function() {
        var key1 = 'k1',
            key2 = 'k2',
            key3 = 'k3',
            key4 = 'k4';
        env.maxItemsInSageCache = 2;
        sageCache.setState(key1, { foo: key1 });
        sageCache.setState(key2, { foo: key2 });
        sageCache.setState(key3, { foo: key3 });

        // most recent key, must be found
        var retrievedState = sageCache.getState(key3);
        expect(retrievedState).not.toBeNull();
        expect(retrievedState.foo).toBe(key3);

        // oldest key that should have fallen out
        retrievedState = sageCache.getState(key1);
        expect(retrievedState).toBeNull();

        // bump key2 and add key4, so key3 falls out
        sageCache.setState(key2, { foo: key2 });
        sageCache.setState(key4, { foo: key4 });
        retrievedState = sageCache.getState(key3);
        expect(retrievedState).toBeNull();
    });
});
