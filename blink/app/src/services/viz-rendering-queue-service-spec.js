/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit tests for viz rendering queue.
 */

'use strict';

describe('Viz rendering queue', function() {
    var vizRenderQueueService;
    var $rootScope;
    var $timeout;

    beforeEach(function() {
        module('blink.app');
        inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            $timeout = $injector.get('$timeout');
            vizRenderQueueService = $injector.get('vizRenderQueueService');
            vizRenderQueueService.initVizRenderService();
            vizRenderQueueService.setIgnoreRenderDelay(true);
            vizRenderQueueService.clearQueue();
        });
    });

    xit('should render viz on enque in primary queue', function(done) {
        var vizId = 'viz1';
        vizRenderQueueService.enqueuePrimaryRenderRequest(vizId)
            .then(function() {
                done();
            });
        $rootScope.$digest();
    });

    xit('should render viz on enque in secondary queue', function(done) {
        var vizId = 'viz1';
        vizRenderQueueService.enqueueSecondaryRenderRequest(vizId)
            .then(function() {
                done();
            });
        $rootScope.$digest();
    });

    xit('should prioritize primary queue over secondary', function(done) {
        var vizId = 'viz1';
        var vizId1 = 'viz2';
        var vizId2 = 'viz3';
        var renderedIds = [];

        vizRenderQueueService.enqueueSecondaryRenderRequest(vizId)
            .then(function() {
                renderedIds.push(vizId);
                expect(renderedIds.length).toBe(1);
                vizRenderQueueService.renderComplete(vizId);
            });
        vizRenderQueueService.enqueueSecondaryRenderRequest(vizId1)
            .then(function() {
                expect(renderedIds.length).toBe(2);
                vizRenderQueueService.renderComplete(vizId1);
                done();
            });
        vizRenderQueueService.enqueuePrimaryRenderRequest(vizId2)
            .then(function() {
                renderedIds.push(vizId2);
                expect(renderedIds.length).toBe(2);
                vizRenderQueueService.renderComplete(vizId2);
            });
        $rootScope.$digest();
    });

    xit('should render next viz only when first render is complete', function(done) {
        var vizId = 'viz1';
        var vizId2 = 'viz2';
        var renderedIds = [];

        var p1 = vizRenderQueueService.enqueuePrimaryRenderRequest(vizId);
        p1.then(function() {
            renderedIds.push(vizId);
            expect(renderedIds.length).toBe(1);
            vizRenderQueueService.renderComplete(vizId);
        });
        var p2 = vizRenderQueueService.enqueueSecondaryRenderRequest(vizId2);
        p2.then(function() {
            renderedIds.push(vizId2);
            done();
        });
        $rootScope.$digest();
    });
});
