/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for performance-analyzer-service
 */

'use strict';

/* global flags */

describe('performance analyzer service', function() {
    beforeEach(module('blink.app'));

    var analyzer = null;
    var tracker = null;

    beforeEach(inject(function (PerformanceAnalyzer, eventTracker, debugInfoCollector) {
        flags.setValue('trackPerformance', true);
        analyzer = new PerformanceAnalyzer(eventTracker, debugInfoCollector);
        tracker = eventTracker;
        tracker.reset();
    }));

    function generateLog() {
        /*
         * Should generate a log that looks like this:
         *    e3[tag3]         e6[tag3] e7[tag5]
         *       --              --      --
         *    e2[tag2]            e5[tag4]
         *     -------        --------------------
         *    e1[tag1]            e4[tag1]
         * ---------------- ------------------
         */
        var tsTime = 0;
        tracker.log._mockTimestamp(function () {
            tsTime += 1000.0;
            return tsTime;
        });

        var e1 = tracker.trackEvent('tag1', 'e1');
        var e2 = tracker.trackEvent('tag2', 'e2');
        var e3 = tracker.trackEvent('tag3', 'e3');
        e3.finish();
        e2.finish();
        e1.finish();
        var e4 = tracker.trackEvent('tag1', 'e4');
        var e5 = tracker.trackEvent('tag4', 'e5');
        var e6 = tracker.trackEvent('tag3', 'e6');
        e6.finish();
        var e7 = tracker.trackEvent('tag5', 'e7');
        e7.finish();
        e4.finish();
        e5.finish();
        tracker.log._resetTimestampMock();
    }

    it('should retrieve list of AnnotatedEvents', function () {
        generateLog();
        var log = analyzer.getLog(0, 20000);
        var expectedSequence = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'];
        var i = 0;
        expectedSequence.forEach(function (expectedName) {
            expect(log[i++].meta).toEqual(expectedName);
        });
    });

    it('getGroupedLog should properly group events', function () {
        generateLog();
        var log = analyzer.getGroupedLog(0, 20000, [['tag1'], ['tag2', 'tag5'], ['tag3']]);
        expect(log.length).toEqual(2);
        expect(log[0].meta).toEqual('e1');
        expect(log[1].meta).toEqual('e4');

        expect(log[0].children.length).toEqual(1);
        expect(log[0].children[0].meta).toEqual('e2');

        expect(log[1].children.length).toEqual(1);
        expect(log[1].children[0].meta).toEqual('e7');

        expect(log[0].children[0].children.length).toEqual(1);
        expect(log[0].children[0].children[0].meta).toEqual('e3');

        expect(log[1].children[0].children.length).toEqual(0);
        expect(log[0].children[0].children[0].children.length).toEqual(0);
    });
});
