/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Vijay Ganesan (vijay@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for session service.
 */

'use strict';

describe('session service', function () {
    var basePath = getBasePath(document.currentScript.src);
    var sessionService,
        mockSessionInfo = {'userPreferences':{'notifyOnShare': true}},
        mockSession = {
            getInfo: function () {
                return mockSessionInfo;
            }
        };

    beforeEach(function (done) {
        module('blink.app');
        mock(basePath,'../../../base/user/session', mockSession);
        freshImport(basePath, './session-service').
            then((module) => {
                inject();
                sessionService = module;
                done();
            });
    });

    it('should get notifyOnShare setting', function () {
        expect(sessionService.shouldNotifyOnShare()).toEqual(true);
        sessionService.setNotifyOnShare(false);
        expect(sessionService.shouldNotifyOnShare()).toEqual(false);
    });

    it('should get set locale preference', function() {
        expect(sessionService.getPreferredLocale()).toEqual('en-US');
        sessionService.setPreferredLocale('ja');
        expect(sessionService.getPreferredLocale()).toEqual('ja');
    })
});
