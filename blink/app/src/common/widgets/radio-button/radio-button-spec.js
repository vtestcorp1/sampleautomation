/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview  Radio button widget unit tests.
 *
 */

'use strict';

//TODO(chab) investigate why it doesn not work when using freshImport

describe('blink radio button spec', function () {

    var $rootScope, $compile, RadioButtonComponent;

    beforeEach(addCustomMatchers());

    beforeEach(module('blink.app'));

    beforeEach(function(){
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $compile =  $injector.get('$compile');
            RadioButtonComponent = $injector.get('RadioButtonComponent');
        });
    });

    describe('verify checked state', function () {
        it('should have the correct label', function () {
            var elm = angular.element('<bk-radio-button bk-ctrl="ctrl"></bk-radio-button>');
            var scope = $rootScope.$new();
            var label = "Radio Label";
            scope.ctrl = new RadioButtonComponent(label, _.noop, _.noop);
            $compile(elm)(scope);
            scope.$apply();
            var $radioButtonLabel = elm.find('.bk-form-radio .bk-radio-label');
            expect($radioButtonLabel.text().trim()).toBe(label);
        });

        it('should init with selected state', function () {
            var elm = angular.element('<bk-radio-button bk-ctrl="ctrl"></bk-radio-button>');
            var scope = $rootScope.$new();
            var label = "Radio Label FUCKER";
            scope.ctrl = new RadioButtonComponent(
                label,
                () => {
                    return true;
                },
                _.noop,
                _.noop);
            elm = $compile(elm)(scope);
            scope.$apply();
            var $radioButton = elm.find('.bk-form-radio');
            expect($radioButton).toHaveClass('bk-selected');
        });

        it('should not init with selected state', function () {
            var elm = angular.element('<bk-radio-button bk-ctrl="ctrl"></bk-radio-button>');
            var scope = $rootScope.$new();
            var label = "Radio Label";
            scope.ctrl = new RadioButtonComponent(
                label,
                function isSelectedChecker() {return false;},
                _.noop,
                _.noop);
            $compile(elm)(scope);
            scope.$digest();
            var $radioButton = elm.find('.bk-form-radio');
            expect($radioButton).not.toHaveClass('bk-selected');
        });

        it('should call the click handler', function () {
            var elm = angular.element('<bk-radio-button bk-ctrl="ctrl"></bk-radio-button>');
            var scope = $rootScope.$new();
            var label = "Radio Label";
            var clickHandler = jasmine.createSpy();
            scope.ctrl = new RadioButtonComponent(
                label,
                _.noop,
                clickHandler,
                _.noop);
            $compile(elm)(scope);
            scope.$digest();
            var $radioButton = elm.find('.bk-form-radio');
            $radioButton.click();
            expect(clickHandler).toHaveBeenCalled();
        });

        it('should not call the click handler if disabled', function () {
            var elm = angular.element('<bk-radio-button bk-ctrl="ctrl"></bk-radio-button>');
            var scope = $rootScope.$new();
            var label = "Radio Label";
            var clickHandler = jasmine.createSpy();
            scope.ctrl = new RadioButtonComponent(
                label,
                _.noop,
                clickHandler,
                function() {
                    return true;
                });
            $compile(elm)(scope);
            scope.$digest();
            var $radioButton = elm.find('.bk-form-radio');
            $radioButton.click();
            scope.$digest();
            expect(clickHandler).not.toHaveBeenCalled();
        });
        it('should have the correct disabled state', function () {
            var elm = angular.element('<bk-radio-button bk-ctrl="ctrl"></bk-radio-button>');
            var scope = $rootScope.$new();
            var label = "Radio Label";
            scope.disabled = true;
            var clickHandler = jasmine.createSpy();
            scope.ctrl = new RadioButtonComponent(
                label,
                _.noop,
                clickHandler,
                function() {
                    return scope.disabled;
                });
            $compile(elm)(scope);
            scope.$digest();
            var $radioButton = elm.find('.bk-form-radio');
            expect($radioButton).toHaveClass('bk-disabled');
            scope.disabled = false;
            scope.$digest();
            expect($radioButton).not.toHaveClass('bk-disabled');
        });
    });
});
