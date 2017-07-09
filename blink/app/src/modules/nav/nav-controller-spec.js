/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Unit test for NavController
 */

'use strict';

describe('NavController', function () {

    var _scope,
        mockedSessionService,
        mockSession,
        manuallyLoggedOut;

    beforeEach(function () {
        module('blink.app');

        inject(function ($rootScope, $controller, $q, $route) {
            _scope = $rootScope.$new();
            $route.current = {
                canvasState: null
            };

            // Mocked implementation of the session service
            mockedSessionService = {
                doLogout: function () {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                },
                hasAdminPrivileges: function() {
                    return true;
                }
            };

            manuallyLoggedOut = false;
            mockSession = {
                markManualLoggedOut: function() {
                    manuallyLoggedOut = true;
                },
                setInfo: function () {
                    angular.noop
                },
                setLast401Path: function () {
                    angular.noop
                }
            };

            // Instantiate the controller
            $controller('NavController', {
                $scope: _scope,
                sessionService: mockedSessionService,
                session: mockSession
            });
        });
    });

    it('should set manuallyLoggedOut to true on manual logout', function () {
        spyOn(_scope, 'logout').and.callThrough();
        expect(manuallyLoggedOut).toBe(false);
        _scope.logout();
        _scope.$apply();
        expect(manuallyLoggedOut).toBeTruthy();
    });

});

