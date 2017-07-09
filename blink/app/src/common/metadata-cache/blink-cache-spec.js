/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit tests for the blink cache
 */

'use strict';

/* eslint camelcase: 1 */
describe('Blink-cache', function() {
    var cache;
    var timeout;
    var calls;

    describe('Cache with only one entry', function () {

        beforeEach(function () {
            module('blink.app');
            inject(function (_BlinkCache_) {
                cache = new _BlinkCache_(1, Infinity);
                cache.setItem('a', 'b');
            });
        });

        it ("should have always one item", function(){
            expect(cache.itemCount()).toBe(1);
            expect(cache.length()).toBe(1);

            cache.setItem('b', 'c');

            expect(cache.itemCount()).toBe(1);
            expect(cache.length()).toBe(1);
        });

        it ("should return the good item", function(){
            cache.setItem('b', 'c');
            var item = cache.getItem('b');

            expect(item).toBe('c');
        });
    });
    describe('Cache with two entries', function () {

        beforeEach(function () {
            module('blink.app');
            inject(function (_BlinkCache_) {
                cache = new _BlinkCache_(2, Infinity);
                cache.setItem('a', 'b');
            });
        });

        it ("should have at most two item", function(){
            expect(cache.itemCount()).toBe(1);
            expect(cache.length()).toBe(1);

            cache.setItem('b', 'b1');

            expect(cache.itemCount()).toBe(2);
            expect(cache.length()).toBe(2);

            cache.setItem('c', 'c1');

            expect(cache.itemCount()).toBe(2);
            expect(cache.length()).toBe(2);

        });

        it ("should return the good item", function(){
            cache.setItem('b', 'c');
            var item = cache.getItem('b');
            expect(item).toBe('c');
            item = cache.getItem('a');
            expect(item).toBe('b');
        });

        it('should evict the least used item', function(){
            cache.setItem('b', 'bb');
            cache.getItem('a');
            cache.setItem('c', 'cc');

            expect(cache.length()).toBe(2);
            expect(cache.itemCount()).toBe(2);
            expect(cache.getItem('b')).toBe(undefined);
            expect(cache.getItem('c')).toBe('cc');
            expect(cache.getItem('a')).toBe('b');

        });

        it('should evict the least used item', function(){
            cache.setItem('b', 'bb');
            cache.getItem('b');
            cache.setItem('c', 'cc');
            expect(cache.length()).toBe(2);
            expect(cache.itemCount()).toBe(2);
            expect(cache.getItem('a')).toBe(undefined);
            expect(cache.getItem('b')).toBe('bb');
            expect(cache.getItem('c')).toBe('cc');
        });

        it('it should reset the cache', function(){
            cache.reset();
            expect(cache.length()).toBe(0);
            expect(cache.itemCount()).toBe(0);
        });
    });

    describe("cache with aging", function(){
        beforeEach(function () {
            module('blink.app');
            inject(function (_BlinkCache_, _$timeout_) {
                cache = new _BlinkCache_(3, 500);
                cache.setItem('a', 'b');
                timeout = _$timeout_;
            });

        });
        it("it should not evict object", function(done){
            setTimeout(function() {
                cache.prune();
                expect(cache.length()).toBe(1);
                done();
            }, 100);
        });
        it("it should evict aged object", function(done){
            setTimeout(function() {
                cache.prune();
                expect(cache.length()).toBe(0);
                done();
            }, 1000);
        });
        it("object that override maxAge should not be evicted", function(done){
            cache.setItem('b', 'b', 3000);
            cache.setItem('c', 'c', 100);

            setTimeout(function() {
                cache.prune();
                expect(cache.length()).toBe(1);
                done();
            }, 1000);
        });
    });

    describe("Dispose function, ", function(){
        beforeEach(function () {
            module('blink.app');
            calls = 0;
            inject(function (_BlinkCache_) {
                var dispose = function(item) {
                    calls++;
                };
                cache = new _BlinkCache_(1, 10000, undefined, dispose);
                cache.setItem('a', 'a');
            });
        });
        it("should call dispose function", function(){
            cache.setItem('b', 'b');
            cache.setItem('c', 'c');

            expect(calls).toBe(2);
            expect(cache.length()).toBe(1);
        });
    });
    describe("Length function, ", function(){

        beforeEach(function () {
            module('blink.app');
            calls = 0;
            inject(function (_BlinkCache_) {
                var length = function(item) {
                    return item.length;
                };
                cache = new _BlinkCache_(10, 10000, length);
                cache.setItem('a', 'aaaaa');
            });
        });

        it("should takes length function into account", function(){
            expect(cache.itemCount()).toBe(1);
            expect(cache.length()).toBe(5);

            cache.setItem('b', 'bbbbb');
            cache.setItem('c', 'ccccc');

            expect(cache.itemCount()).toBe(2);
            expect(cache.length()).toBe(10);
        });

        it("should not put object too big in the cache", function(){
            cache.setItem('b', 'bbbbbbbbbbbbbbbbbbbbbbbb');
            expect(cache.itemCount()).toBe(1);
            expect(cache.length()).toBe(5);

        });

    });
});
