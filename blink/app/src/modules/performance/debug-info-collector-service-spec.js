/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for debug-info-collector-service
 */

'use strict';

/* global flags */

describe('debug info collector service', function() {
    beforeEach(module('blink.app'));

    var collector = null;

    beforeEach(inject(function (debugInfoCollector) {
        flags.setValue('trackPerformance', true);
        collector = debugInfoCollector;
        collector.reset();
    }));

    it('retrieve() should return collected entries', function () {
        var tsTime = 0;
        collector.log._mockTimestamp(function () {
            tsTime += 1000.0;
            return tsTime;
        });

        var mockDebugInfo = {
            debugInfo: {
                info: 'foo'
            },
            url: '/callosum',
            method: 'POST'
        };

        for (var i = 0; i < 10; i++) {
            collector.collect('callosum', mockDebugInfo);
        }

        var log = collector.retrieve();
        expect(log.length).toEqual(10);
        expect(log[0].debugInfo).toBeTruthy();

        log = collector.retrieve(5000.0, 7000.0, ['callosum']);
        expect(log.length).toEqual(3);

        log = collector.retrieve(5000.0, 7000.0, ['oracle']);
        expect(log.length).toEqual(0);

        collector.log._resetTimestampMock();
    });
});
