/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for api commands
 */

'use strict';

describe('command', function() {
    var $httpBackend,
        env,
        Command,
        $rootScope,
        events,
        alertConstants,

        API_BASE_PATH = '/callosum/v1',
        API_TEST_CALL = '/foo/bar',
        API_TEST_CALL_REGEXP = /\/callosum\/v1\/foo\/bar/,
        API_CALL_PATH = API_BASE_PATH + API_TEST_CALL,
        USER_ACTION_TYPE = 'test-user-action';


    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            env = $injector.get('env');
            Command = $injector.get('Command');
            $rootScope = $injector.get('$rootScope');
            events = $injector.get('events');
            alertConstants = $injector.get('alertConstants');
        });
    });

    it('should increase callosum call id after calling an ignorable command', function() {
        var command = new Command().setPath(API_TEST_CALL);
        command.setIgnorable();
        $httpBackend.expectGET(API_TEST_CALL_REGEXP).respond();
        expect(Command.callosumCallIds[API_CALL_PATH]).toBeUndefined();
        command.execute();
        $httpBackend.flush();
        expect(Command.callosumCallIds[API_CALL_PATH]).toEqual(0);
    });

    it('should not increase callosum call id after calling a non-ignorable command', function() {
        var command = new Command().setPath(API_TEST_CALL);
        $httpBackend.expectGET(API_TEST_CALL_REGEXP).respond();
        expect(Command.callosumCallIds[API_CALL_PATH]).toBeUndefined();
        command.execute();
        $httpBackend.flush();
        expect(Command.callosumCallIds[API_CALL_PATH]).toBeUndefined();
    });

    it('should trigger a default error notification when backend returns a 500 error', function() {
        var command = new Command().setPath(API_TEST_CALL),
            expectedEventParams = {
                data : { code: void 0},
                status : 500,
                timedout : false,
                traceId : null
            };
        $httpBackend.expectGET(API_TEST_CALL_REGEXP).respond(500, '');
        spyOn($rootScope, "$broadcast");
        command.execute();
        $httpBackend.flush();
        expect($rootScope.$broadcast).toHaveBeenCalledWith(events.API_ALERT_D, expectedEventParams);
    });

    it('should trigger a custom notification when backend returns a 500 error with a valid callosum error code', function() {
        var command = new Command().setPath(API_TEST_CALL),
            callosumErrorCode = 'NO_DATA',
            errorData = { code: callosumErrorCode },
            expectedEventParams = {
                data : { code : 'NO_DATA' },
                status : 500,
                timedout : false,
                traceId : null
            };
        $httpBackend.expectGET(API_TEST_CALL_REGEXP).respond(500, errorData);
        spyOn($rootScope, "$broadcast");
        command.execute();
        $httpBackend.flush();
        expect($rootScope.$broadcast).toHaveBeenCalledWith(events.API_ALERT_D, expectedEventParams);
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
