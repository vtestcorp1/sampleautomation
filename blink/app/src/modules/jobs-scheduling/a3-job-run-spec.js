/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Spec for A3 job run.
 */

'use strict';

describe('A3 job spec', function() {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var A3JobRun;

    beforeEach(inject(function(_A3JobRun_) {
        /* eslint camelcase: 1 */
        A3JobRun = _A3JobRun_;
    }));

    it('getRunStateString tests', function () {
        var a3JobRunProto = new tsProto.scheduler.JobRunProto();
        var a3JobRunState = new tsProto.scheduler.JobRunStateProto();
        a3JobRunState.setState(tsProto.scheduler.JobRunStateProto.State.RUNNING);
        a3JobRunProto.setRunState(a3JobRunState);
        var a3JobRun = new A3JobRun(a3JobRunProto);
        expect(a3JobRun.getRunStateString()).toBe('Running');
    });
});
