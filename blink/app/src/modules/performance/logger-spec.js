/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for logger-service
 */

'use strict';

/* global flags */

describe('logger service', function() {
    beforeEach(module('blink.app'));

    var logger = null;

    beforeEach(inject(function (PerfLogger) {
        flags.setValue('trackPerformance', true);
        logger = new PerfLogger();
    }));

    it('retrieve should properly filter by from/to params', function () {
        var tsTime = 0;
        logger._mockTimestamp(function () {
            tsTime += 1000.0;
            return tsTime;
        });

        for (var i = 0; i < 10; i++) {
            logger.push({});
        }

        var log = logger.retrieve();
        expect(log.length).toEqual(10);

        log = logger.retrieve(3000.0, 5000.0);
        expect(log.length).toEqual(3);

        logger._resetTimestampMock();
    });

    it('should maintain log size under maxLogSize constraint', function () {
        for (var i = 0; i < 2 * logger.getMaxLogSize(); i++) {
            logger.push({});
        }
        expect(logger.log.length).toBeLessThan(logger.getMaxLogSize() + 1);
        expect(logger.log.length).toBeGreaterThan(logger.getMaxLogSize() * 0.7 - 1);
    });

});
