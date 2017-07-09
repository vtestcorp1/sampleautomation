/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Francois Chabbey (francois.chabbey@thoughtpsot.com)
 *
 * @fileoverview Unit tests for sage data scope service
 */

'use strict';

describe('Sage data scope service spec', function() {
    var service;
    var listener = {}, spy, deregister;

    var moduleName = 'src/modules/sage/data-scope/sage-data-scope-service';

    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());

    /* eslint camelcase: 1 */
    beforeEach(function(done) {
        System.import(moduleName)
            .then(function(module) {
                inject(function () {
                    service = module;
                    spy = {
                        f : function () {}
                    };
                    listener.fn = function(a, b) {
                        spy.f(a,b);
                    };
                    deregister = service.subscribeToSourcesChanged(listener.fn);
                    spyOn(spy, 'f');
                });
                done();
            }, function (error) {
                console.log('Errored', error.originalErr);
            });
    });

    afterEach(function(done) {
        System.delete(
            System.normalizeSync(moduleName));
        setTimeout(done, 0);
    });

    it('should call listeners properly', function(){
        service.setSources(['a']);
        expect(spy.f).toHaveBeenCalledWith(['a'], {});
    });

    it('should deregister listeners properly', function() {
        deregister();
        service.setSources(['a']);
        expect(spy.f).not.toHaveBeenCalledWith(['a'], {});
    });
});
