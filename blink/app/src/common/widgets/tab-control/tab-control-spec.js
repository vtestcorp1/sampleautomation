/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit tests for tab-control widget
 */

'use strict';

describe('TabControl', function() {

    var $scope, elem;

    beforeEach(function () {
        module('blink.app');

        var mockUtil = {
            executeInNextEventLoop: function(cb) { cb();}
        };

        inject(function ($rootScope, $compile, jsUtil) {
            $scope = $rootScope.$new();
            $scope.onTabActivated = angular.noop;
            spyOn($scope, 'onTabActivated');

            _.assign(jsUtil, mockUtil);

            var template =
                '<tab-control on-tab-activated="onTabActivated(activeTab)">' +
                    '<tab-control-tab tab-name="A" tab-id="a">' +
                        '<div class="a-content">A</div>' +
                    '</tab-control-tab>' +
                    '<tab-control-tab tab-name="B" tab-id="b">' +
                        '<div class="b-content">B</div>' +
                    '</tab-control-tab>' +
                '</tab-control>';

            elem = $compile(angular.element(template))($scope);
            $('body').append(elem);

            // directive's scope is the child of _$scope
            $scope = elem.scope();
            $rootScope.$digest();
        });
    });

    afterEach(function(){
        $('body').empty();
    });

    it('should show all the tab titles', function(){
        expect(elem.find('.tab-header-item :contains(A)').length).toBe(1);
        expect(elem.find('.tab-header-item :contains(B)').length).toBe(1);
    });

    it('should show first tab by default', function () {
        expect(elem.find('.a-content').length).toBe(1);
        expect(elem.find('.b-content').length).toBe(0);
    });

    it('clicking on the tab title should switch to the content of the tab', function(){
        expect(elem.find('.a-content').length).toBe(1);

        elem.find('.tab-header-item :contains(B)').click();
        $scope.$digest();

        expect(elem.find('.a-content').length).toBe(0);
        expect(elem.find('.b-content').length).toBe(1);

        elem.find('.tab-header-item :contains(A)').click();
        $scope.$digest();

        expect(elem.find('.a-content').length).toBe(1);
        expect(elem.find('.b-content').length).toBe(0);
    });

    it('clicking on the current tab title should have no effect', function(){
        expect(elem.find('.a-content').length).toBe(1);

        elem.find('.tab-header-item :contains(B)').click();
        $scope.$digest();

        expect(elem.find('.a-content').length).toBe(0);
        expect(elem.find('.b-content').length).toBe(1);

        var initialCallCount = $scope.onTabActivated.calls.count();

        elem.find('.tab-header-item :contains(B)').click();
        $scope.$digest();

        expect($scope.onTabActivated.calls.count()).toBe(initialCallCount);

        expect(elem.find('.a-content').length).toBe(0);
        expect(elem.find('.b-content').length).toBe(1);
    });

    it('tab activation callback should be called when switching to a tab', function(){
        expect(elem.find('.a-content').length).toBe(1);

        var initialCallCount = $scope.onTabActivated.calls.count();

        elem.find('.tab-header-item :contains(B)').click();
        $scope.$digest();

        expect(elem.find('.a-content').length).toBe(0);
        expect(elem.find('.b-content').length).toBe(1);

        expect($scope.onTabActivated).toHaveBeenCalled();
        expect($scope.onTabActivated.calls.count()).toBe(initialCallCount + 1);
    });
});
