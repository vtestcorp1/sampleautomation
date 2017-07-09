/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Tests for ts utils
 */

'use strict';

describe('ts utils', function() {
    var strEnum, MapArray, getClasses;
    var basePath = getBasePath(document.currentScript.src);

    beforeEach(function(done) {
        module('blink.app');
        freshImport(basePath, './ts-utils')
            .then(function(module) {
                strEnum = module.strEnum;
                MapArray = module.MapWithArray;
                getClasses = module.getDOMClassesFromSelector;
                done();
            });
    });

    it('should create the enums correctly', function() {
        // Create a K:V
        var Direction = strEnum([
            'North',
            'South',
            'East',
            'West'
        ]);
        expect(Direction.North).toBe('North');
        expect(Direction.South).toBe('South');
        expect(Direction.East).toBe('East');
        expect(Direction.West).toBe('West');
    });

    describe('Map With array', function() {
        var map, elements;
        beforeEach(function() {
            map = new MapArray();
            elements = [{a:0}, {a:2}, {b:3}];
            map.addElement('a', elements[0]);
            map.addElement('b', elements[1]);
            map.addElement('c', elements[2]);
        });
        it('should return correct element', function() {
            expect(map.getElementByKey('a')).toBe(elements[0]);
            expect(map.getElementByKey('b')).toBe(elements[1]);
            expect(map.getElementByKey('c')).toBe(elements[2]);
        });
        it('should return correct array', function(){
            expect(map.getArray().length).toBe(elements.length);
            map.getArray().forEach((e, i) => {
                expect(e).toBe(elements[i])
            })
        });
        it('it should clear array and map', function() {
            map.clear();
            expect(map.getArray().length).toBe(0);
            expect(map.getElementByKey('a')).toBeUndefined();
        });
        it('it should return false if object was not inserted', function(){
            expect(map.addElement('f', elements[0])).toBe(true);
            expect(map.addElement('f', elements[0])).toBe(false);
        });
        it('changing returned should not break the map', function(){
            var array = map.getArray();
            map.addElement('f', { a: 4});
            expect(array.length).toBe(4);
        });
        it('should remove elements correctly', function(){
            expect(map.removeElementByKey('a')).toBe(true);
            expect(map.getArray().length).toBe(2);
            expect(map.removeElementByKey('a')).toBe(false);
            expect(map.getElementByKey('a')).toBeUndefined();
        });
        it('should remove . from selector', function() {
            expect(getClasses('.test')).toBe('test');
            expect(getClasses('.test.testB')).toBe('test testB');
        })
    })
});
