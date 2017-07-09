/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for event-tracker-service
 */

'use strict';

/* global flags */

describe('event tracker service', function() {
    beforeEach(module('blink.app'));

    var tracker = null;
    var rootScope = null;

    /* eslint camelcase: 1 */
    beforeEach(inject(function (_$rootScope_, eventTracker) {
        flags.setValue('trackPerformance', true);
        eventTracker.reset();
        tracker = eventTracker;
        rootScope = _$rootScope_;
    }));

    it('should retrieve a proper log for a given time window', function () {
        var tsNum = 0;
        var tsSequence = [
            1000.0,
            2000.0,
            3000.0,
            4000.0,
            5000.0,
            6000.0,
            7000.0,
            8000.0,
            9000.0,
        ];
        tracker.log._mockTimestamp(function () {
            return tsSequence[tsNum++];
        });

        var e1 = tracker.trackEvent('tag1', 'e1');
        expect(e1.getStartTime()).toEqual(1000.0);

        var e2 = tracker.trackEvent('tag2', 'e2');
        expect(e2.getStartTime()).toEqual(2000.0);

        e2.finish();
        expect(e2.getEndTime()).toEqual(3000.0);

        var e3 = tracker.trackEvent('tag3', 'e3');
        expect(e3.getStartTime()).toEqual(4000.0);

        e3.finish();
        expect(e3.getEndTime()).toEqual(5000.0);

        e1.finish();
        expect(e1.getEndTime()).toEqual(6000.0);

        var e4 = tracker.trackEvent('tag1', 'e4');
        expect(e4.getStartTime()).toEqual(7000.0);

        e4.finish();
        expect(e4.getEndTime()).toEqual(8000.0);
        expect(e4.isFinished()).toBeTruthy();

        var e5 = tracker.trackEvent('tag1', 'e5');
        expect(e5.getStartTime()).toEqual(9000.0);
        expect(e5.isFinished()).toBeFalsy();

        tracker.log._resetTimestampMock();

        var log = tracker.getLog(500, 10000, ['tag1', 'tag2']);
        console.log(log);

        // e3 should be filtered out because it has a different tag
        // e5 should be filtered out becasue it is not finished yet
        expect(log.length).toEqual(3);
        expect(log[0].meta).toEqual('e1');
        expect(log[1].meta).toEqual('e2');
        expect(log[2].meta).toEqual('e4');

        expect(e1.getDuration()).toEqual(5000.00);
        expect(e2.getDuration()).toEqual(1000.00);
        expect(e4.getDuration()).toEqual(1000.00);
    });

    it('should be able to retrieve the whole event log', function () {
        tracker.trackEvent('tag', null).finish();
        tracker.trackEvent('tag', null).finish();
        tracker.trackEvent('tag', null).finish();

        var log = tracker.getLog();
        expect(log.length).toEqual(3);
    });

    it('should generate uniuqe guids for every event', function () {
        var e1 = tracker.trackEvent('tag', null);
        var e2 = tracker.trackEvent('tag', null);
        var e3 = tracker.trackEvent('tag', null);

        expect(e1.guid).not.toEqual(e2.guid);
        expect(e1.guid).not.toEqual(e3.guid);
        expect(e2.guid).not.toEqual(e3.guid);
    });

    it('should wait for specified events before finishing', function() {
        var scope = rootScope.$new();
        var e = tracker.trackEvent('tag', null);
        e.waitFor(scope, 'first')
            .waitFor(scope, 'second')
            .waitFor(scope, 'third', function(event, x) {
                return x === 1;
            })
            .finish();
        // Event should not finish till all the are received on @scope.
        expect(e.isFinished()).toEqual(false);
        scope.$emit('first');
        expect(e.isFinished()).toEqual(false);
        scope.$emit('second');
        expect(e.isFinished()).toEqual(false);
        // Event should still not finish since @filter for third event expects
        // argument to be 1.
        scope.$emit('third', 4);
        expect(e.isFinished()).toEqual(false);
        scope.$emit('third', 1);
        expect(e.isFinished()).toEqual(true);
    });

    it('should cancel tracked event when cancel is invoked', function() {
        var scope = rootScope.$new();
        var e = tracker.trackEvent('tag', null);
        e.waitFor(scope, 'first')
            .waitFor(scope, 'second')
            .waitFor(scope, 'third')
            .finish();
        // Event should not finish till all the are received on @scope.
        expect(e.isFinished()).toEqual(false);
        scope.$emit('first');
        expect(e.isFinished()).toEqual(false);
        e.cancel();
        expect(e.isFinished()).toEqual(true);
    });
});
