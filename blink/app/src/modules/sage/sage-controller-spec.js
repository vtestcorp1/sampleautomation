/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Unit tests for sage controller
 */
'use strict';

describe('Sage controller', function() {
    var _$scope = null,
        _$route = null,
        _sessionService = null,
        _sageCache = null,
        _events = null;

    beforeEach(function () {
        module('blink.app');
        inject(function ($rootScope, $controller, $route, events) {
            _$scope = $rootScope.$new();
            _$route = $route;
            _events = events;
            $route.current = {};

            _$scope.sageModel = {
                tokens: []
            };

            _sageCache = {};

            var sageCtrl = $controller('SageController', {
                $scope: _$scope,
                sageCache: _sageCache
            });
        });
    });
});

