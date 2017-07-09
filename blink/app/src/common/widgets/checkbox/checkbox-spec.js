/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview  checkbox widget unit tests
 *
 */

'use strict';

describe('blink checkbox spec', function() {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var $rootScope, $compile, CheckboxComponent;

    beforeEach(inject(function(_$rootScope_, _$compile_, _CheckboxComponent_) {
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        $compile = _$compile_;
        /* eslint camelcase: 1 */
        CheckboxComponent = _CheckboxComponent_;
    }));

    describe('verify checked state', function() {
        it('should init with checked state true', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var checkboxComponent = new CheckboxComponent("checkbox title", () => true);
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).toHaveClass('bk-checked');
        });

        it('should init with checked state false', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var checkboxComponent = new CheckboxComponent("checkbox title", () => false);
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).not.toHaveClass('bk-checked');
        });

        it('should toggle checked state on click', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var onChange = jasmine.createSpy();
            var title = "checkbox title";
            var id = 'id';
            var state = false;
            var checkboxComponent = new CheckboxComponent(title, () => state)
                .setID(id)
                .setOnClick(($event) => {
                    state = !state;
                    onChange(title, state, id);
                });
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).not.toHaveClass('bk-checked');
            $checkbox.click();
            expect($checkbox).toHaveClass('bk-checked');
            expect(onChange).toHaveBeenCalledWith(title, true, id);
            //expect(scope.ctrl.isChecked).toBe(true);
            $checkbox.click();
            expect($checkbox).not.toHaveClass('bk-checked');
            expect(onChange).toHaveBeenCalledWith(title, false, id);
        });

        it('should not toggle checked state on click when read only', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var onChange = jasmine.createSpy();
            var title = "checkbox title";
            var id = 'id';
            var state = false;
            var checkboxComponent = new CheckboxComponent(title, () => state)
                .setID(id)
                .setReadOnly(true)
                .setOnClick(($event) => {
                    state = !state;
                    onChange(title, state, id);
                });
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).not.toHaveClass('bk-checked');
            $checkbox.click();
            expect($checkbox).not.toHaveClass('bk-checked');
            expect(onChange.calls.count()).toEqual(0);
            $checkbox.click();
            expect($checkbox).not.toHaveClass('bk-checked');
            expect(onChange.calls.count()).toEqual(0);
        });
    });

    describe('verify title visibility', function() {
        it('should not add title for undefined title', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var checkboxComponent = new CheckboxComponent(null, () => true);
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();
            var checkboxTitle = elm.find('.bk-checkbox-title');
            expect(checkboxTitle.length).toBe(0);
        });

        it('should not add title for empty title', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var checkboxComponent = new CheckboxComponent('', () => true);
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();
            var checkboxTitle = elm.find('.bk-checkbox-title');
            expect(checkboxTitle.length).toBe(0);
        });

        it('should show title for valid string title', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var checkboxComponent = new CheckboxComponent("checkbox title", () => true);
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();
            var checkboxTitle = elm.find('.bk-checkbox-title:contains(\'checkbox title\')');
            expect(checkboxTitle.length).toBe(1);
        });
    });

    describe('verify object handling', function() {
        it('should updated based on new checkbox ctrl instance', function() {
            var elm = angular.element('<bk-checkbox bk-ctrl="ctrl"></bk-checkbox>');
            var scope = $rootScope.$new();
            var checkboxComponent = new CheckboxComponent('Name1', () => true);
            scope.ctrl = checkboxComponent;
            $compile(elm)(scope);
            scope.$digest();

            var checkboxTitle = elm.find('.bk-checkbox-title:contains(\'Name1\')');
            expect(checkboxTitle.length).toBe(1);
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).toHaveClass('bk-checked');

            checkboxComponent = new CheckboxComponent('Name2', () => false);
            scope.ctrl = checkboxComponent;
            scope.$digest();

            checkboxTitle = elm.find('.bk-checkbox-title:contains(\'Name2\')');
            expect(checkboxTitle.length).toBe(1);
            $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).not.toHaveClass('bk-checked');
        });
    });
});
