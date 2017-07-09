/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview  checkbox-collection widget unit tests
 *
 */

'use strict';

describe('blink checkbox collection spec', function () {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var $rootScope, $compile, CheckboxCollectionController;

    /* eslint camelcase: 1 */
    beforeEach(inject(function(_$rootScope_, _$compile_, _CheckboxCollectionController_) {
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        $compile = _$compile_;
        /* eslint camelcase: 1 */
        CheckboxCollectionController = _CheckboxCollectionController_;
    }));

    describe('verify blink checkbox collection', function () {
        it('should contain 0 blink checkbox for empty collection', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var checkboxCollectionController = new CheckboxCollectionController([], angular.noop);
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            scope.ctrl = checkboxCollectionController;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('bk-checkbox');
            expect($checkbox.length).toBe(0);
        });

        it('should contain n blink checkbox for collection with n items', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [
                {title: 'title1', isChecked: true},
                {title: 'title2', isChecked: false},
                {title: 'title3', isChecked: true},
                {title: 'title4', isChecked: false},
                {title: 'title5', isChecked: true}
            ];
            var ctrl = new CheckboxCollectionController(checkboxItems, angular.noop);
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('bk-checkbox');
            expect($checkbox.length).toBe(5);
        });

        it('should init with checked state true', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [{title: 'title', isChecked: true}];
            var ctrl = new CheckboxCollectionController(checkboxItems, angular.noop);
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).toHaveClass('bk-checked');
        });

        it('should init with checked state false', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [{title: 'title', isChecked: false}];
            var ctrl = new CheckboxCollectionController(checkboxItems, angular.noop);
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).not.toHaveClass('bk-checked');
        });

        it('should toggle checked state on click', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [{title: 'title', isChecked: false}];
            var onChange = jasmine.createSpy();
            var ctrl = new CheckboxCollectionController(checkboxItems, onChange);
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).not.toHaveClass('bk-checked');
            $checkbox.click();
            expect($checkbox).toHaveClass('bk-checked');
            expect(onChange).toHaveBeenCalledWith('title', true, 0);
            $checkbox.click();
            expect($checkbox).not.toHaveClass('bk-checked');
            expect(onChange).toHaveBeenCalledWith('title', false, 0);
        });

        it('should respect checkbox items ids', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [{title: 'title', isChecked: false, id: 'id1'}];
            var onChange = jasmine.createSpy();
            var ctrl = new CheckboxCollectionController(checkboxItems, onChange);
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();
            var $checkbox = elm.find('.bk-checkbox');
            expect($checkbox).not.toHaveClass('bk-checked');
            $checkbox.click();
            expect($checkbox).toHaveClass('bk-checked');
            expect(onChange).toHaveBeenCalledWith('title', true, 'id1');
            $checkbox.click();
            expect($checkbox).not.toHaveClass('bk-checked');
            expect(onChange).toHaveBeenCalledWith('title', false, 'id1');
        });

        it('should show selected/unselected All checkbox item', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [{title: 'title', isChecked: true}];
            var ctrl = new CheckboxCollectionController(
                checkboxItems,
                _.noop,
                false, // isReadonly
                true // allSelectAll
            );
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();

            var checkboxTitle = elm.find('.bk-checkbox-title:contains(\'All\')');
            expect(checkboxTitle.length).toBe(1);
            var $checkbox = elm.find('.bk-checkbox').first();
            expect($checkbox).toHaveClass('bk-checked');

            checkboxItems = [{title: 'title', isChecked: false}];
            ctrl = new CheckboxCollectionController(
                checkboxItems,
                _.noop,
                false, // isReadonly
                true // allSelectAll
            );
            scope.ctrl = ctrl;
            scope.$digest();

            checkboxTitle = elm.find('.bk-checkbox-title:contains(\'All\')');
            expect(checkboxTitle.length).toBe(1);
            $checkbox = elm.find('.bk-checkbox').first();
            expect($checkbox).not.toHaveClass('bk-checked');
        });

        it('should unselect all selected checkbox items on All unselection', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [
                {title: 'title', isChecked: true},
                {title: 'title1', isChecked: false},
                {title: 'title2', isChecked: true}
            ];
            var onChange = jasmine.createSpy();

            var ctrl = new CheckboxCollectionController(
                checkboxItems,
                onChange,
                false, // isReadonly
                true // allSelectAll
            );
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();

            var allCBTitle = elm.find('.bk-checkbox-title:contains(\'All\')');
            allCBTitle.click();

            var $checkbox = elm.find('.bk-checkbox').first();
            expect($checkbox).not.toHaveClass('bk-checked');

            expect(onChange).toHaveBeenCalledWith('title', false, 0);
            expect(onChange).toHaveBeenCalledWith('title2', false, 2);

            var checkedItems = elm.find('.bk-checked');
            expect(checkedItems.length).toBe(0);
        });

        it('should select all checkbox items on All selection', function () {
            var template = '<blink-checkbox-collection bk-ctrl="ctrl"></blink-checkbox-collection>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            var checkboxItems = [
                {title: 'title', isChecked: false},
                {title: 'title1', isChecked: false},
                {title: 'title2', isChecked: false}
            ];
            var onChange = jasmine.createSpy();

            var ctrl = new CheckboxCollectionController(
                checkboxItems,
                onChange,
                false, // isReadonly
                true // allSelectAll
            );
            scope.ctrl = ctrl;
            $compile(elm)(scope);
            scope.$digest();

            var allCBTitle = elm.find('.bk-checkbox-title:contains(\'All\')');
            allCBTitle.click();

            var $checkbox = elm.find('.bk-checkbox').first();
            expect($checkbox).toHaveClass('bk-checked');

            expect(onChange).toHaveBeenCalledWith('title', true, 0);
            expect(onChange).toHaveBeenCalledWith('title1', true, 1);
            expect(onChange).toHaveBeenCalledWith('title2', true, 2);

            var checkedItems = elm.find('.bk-checkbox-container.bk-checked');
            expect(checkedItems.length).toBe(4);
        });
    });
});
