/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit tests for scoped component.
 */

'use strict';

describe('Filter model', function() {
    var basePath = getBasePath(document.currentScript.src);
    var ScopedComponent;

    beforeEach(function(done) {
        module('blink.app');
        Promise.all([
            freshImport(basePath, './scoped-component')
        ]).then(function(modules) {
            inject();
            ScopedComponent = modules[0].ScopedComponent;
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('Should call emit and broadcast with right params', function() {
        var scopedComponent = new ScopedComponent();
        var mockScope = {
            $broadcast: jasmine.createSpy(),
            $emit: jasmine.createSpy()
        };
        scopedComponent.setScope(mockScope);
        scopedComponent.broadcast('a', 'b', 'c');
        expect(mockScope.$broadcast).toHaveBeenCalledWith('a', 'b', 'c');

        scopedComponent.emit('a', 'b', 'c');
        expect(mockScope.$emit).toHaveBeenCalledWith('a', 'b', 'c');
    });
});
