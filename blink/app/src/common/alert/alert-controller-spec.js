/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Unit test for alert controller
 */

'use strict';

describe('AlertController', function() {
    var _$scope, _$controller, _events, _alertConstants,
        elem;

    beforeEach(function() {
        module('blink.app');

        inject(function($rootScope, $compile, $controller, events, alertConstants) {
            _$scope = $rootScope.$new();
            _$controller = $controller;
            _events = events;
            _alertConstants = alertConstants;
            var template = '<div blink-alert></div>';

            elem = $compile(angular.element(template))(_$scope);
        });

        var ctrl = _$controller('AlertController', { $scope: _$scope });
        _$scope.showAlertUI = angular.noop;

    });

    it('should have correct initial state', function() {
        expect(_$scope.message).toBe('');
        expect(_$scope.type).toBe('');
    });

    it('should not be close-able for alert type PROBLEM', function() {
        expect(_$scope.canClose()).toBeFalsy();
        _$scope.showAlert({ type: _alertConstants.type.PROBLEM });
        expect(_$scope.canClose()).toBeFalsy();
        _$scope.showAlert({ type: _alertConstants.type.SUCCESS });
        expect(_$scope.canClose()).toBeTruthy();
    });

    it('should be able to execute a custom action ', function() {
        var customActionCalled = false;
        var customActionFunction = function () {
            customActionCalled = true;
        };
        _$scope.showAlert({ action: { handler: customActionFunction }});
        expect(customActionCalled).toBeFalsy();
        _$scope.handleAction();
        expect(customActionCalled).toBeTruthy();
    });

    it('should render a clickable link instead of \'span\' when action.link is passed', inject(function($rootScope) {
        $rootScope.$digest();
        elem.isolateScope().showAlert({
            action: {
                handler: function () {},
                link: 'http://example.com',
                message: 'dummy message'
            },
            message: 'dummy message',
            type: _alertConstants.type.SUCCESS
        });

        $rootScope.$digest();
        // <a> tag should be rendered
        expect(elem.find('a.bk-action-link').length).toBe(1);
        // and <span> should not
        expect(elem.find('span.bk-link').length).toBe(0);
    }));

    it('should dismiss alerts without action after timeout', function () {
        _$scope.showAlert({
            message: 'dummy message',
            type: _alertConstants.type.SUCCESS
        });
        expect(!!_$scope.hideTimer).toBeTruthy();
    });

});

