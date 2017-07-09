/**
 * Created by rahul.balakavi on 4/20/17.
 */
'use strict';

describe('Data management page controller', function () {

    var scope, sessionService, route;

    beforeEach(function() {
        module('blink.app');
        inject(function (_$q_,
                         $location,
                         $rootScope,
                         $route,
                         _sessionService_) {
            scope = $rootScope.$new();

            sessionService = _sessionService_;
            $route.current  = {
                canvasSubstate : 'test-state'
            };
        });
    });

    it('User without datamanagement priveleges should see the datasource tab disabled', function () {
        inject(function($controller) {
            spyOn(sessionService, 'getUserPrivileges').and.returnValue( [
                'USERMANAGEMENT'
            ] );
            $controller('DataManagementPageController', {
                $scope: scope,
                sessionService: sessionService
            });
            scope.$apply();

            expect(sessionService.getUserPrivileges).toHaveBeenCalled();
            expect(Object.keys(scope.disabledTabs).length).toBe(1);
            expect(scope.disabledTabs[scope.constants.dataSources.tabId]).toBe(1);
        });
    });

});
