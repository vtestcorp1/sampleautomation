/**
 * Copyright: ThoughtSpot Inc. 2014-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Tests for custom directives
 */

'use strict';

describe('Directives', function () {

    describe('blinkOnChange', function(){
        var $scope, elem;

        beforeEach(function() {
            module('blink.app');


            inject(function($rootScope, $compile) {
                $scope = $rootScope.$new();

                $scope.changeHandler = jasmine.createSpy();
                elem = $compile(angular.element('<div blink-on-change="changeHandler($event)"></div>'))($scope);
                $('body').append(elem);

                $rootScope.$digest();
            });
        });

        it('should call the change handler on change event with correct parameters', function(){
            var initialCallCount = $scope.changeHandler.calls.count();

            var event = $.Event('change');
            elem.trigger(event);
            expect($scope.changeHandler.calls.count()).toBe(initialCallCount + 1);
            expect($scope.changeHandler).toHaveBeenCalledWith(event);
        });
    });

    describe('blinkTooltip', function(){
        var $scope, originalTooltipFn;
        var destroyCallCount = 0;

        beforeEach(function() {
            module('blink.app');

            inject(function($rootScope, $compile) {
                $scope = $rootScope.$new();

                originalTooltipFn = $.fn.tooltip;

                $.fn.tooltip = function (arg) {
                    if (arg === 'destroy') {
                        destroyCallCount++;
                    }
                };

                var elem = $compile(angular.element('<div blink-tooltip></div>'))($scope);
                $('body').append(elem);

                $rootScope.$digest();
            });
        });

        afterEach(function () {
            $.fn.tooltip = originalTooltipFn;
        });

        it('should call tooltip destroy upon scope destroy', function(){
            $scope.$destroy();
            expect(destroyCallCount).toBe(1);
        });
    });
});
