/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Unit test for HomeActivityController
 */

'use strict';

describe('Home Activity Controller', function () {

    var _scope,

        _mockActivityService,

        _returnActivityItems = true,

        activityItems  = [
            { id: 1 },
            { id: 2 },
            { id: 3 }
        ];

    beforeEach(function () {
        module('blink.app');

        inject(function ($rootScope, $controller, $q) {
            _scope = $rootScope.$new();

            function getItems() {
                var deferred = $q.defer();
                deferred.resolve({
                    getItems: function () {
                        return (_returnActivityItems) ? activityItems : [];
                    }
                });
                return deferred.promise;
            }

            _mockActivityService = {
                getModel: jasmine.createSpy().and.returnValue(getItems())
            };

            var mockUserService = {
                getProfilePicUrl: function () {
                    return 'profile-pic-url';
                }
            };

            // Instantiate the controller
            $controller('HomeActivityController', {
                $scope: _scope,
                activityService: _mockActivityService,
                userService: mockUserService
            });
        });
    });

    it('should not load data until shown', function () {
        _scope.$apply();
        expect(_mockActivityService.getModel).not.toHaveBeenCalled();
        _scope.handleVisibilityChange(true);
        _scope.$apply();
        expect(_mockActivityService.getModel).toHaveBeenCalled();
    });

    it('should set the showEmptyState scope property to false if some activity items are available', function () {
        _scope.handleVisibilityChange(true);
        _scope.$apply();
        expect(_mockActivityService.getModel).toHaveBeenCalled();
        expect(_scope.showEmptyState).toBe(false);
    });

    it('should set the showEmptyState scope property to true if no activity items are available', function () {
        _returnActivityItems =  false;
        _scope.handleVisibilityChange(true);
        _scope.$apply();
        expect(_mockActivityService.getModel).toHaveBeenCalled();
        expect(_scope.showEmptyState).toBe(true);
        _returnActivityItems =  true;
    });

});
