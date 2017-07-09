/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Content-editable widget unit tests
 *
 */

'use strict';

describe('content editable', function () {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var elm, scope, $compile, $window;

    describe('content editable with description', function () {
        /* eslint camelcase: 1 */
        beforeEach(inject(function(_$rootScope_, _$compile_, _$window_) {
            elm = angular.element(
                '<div blink-content-editable ng-model="title" on-change="onEditTitleConfirm()"' +
                 'description="vizModel.description" not-editable="!isTitleEditingAllowed()"' +
                'disallow-empty></div>');

            /* eslint camelcase: 1 */
            scope = _$rootScope_;
            /* eslint camelcase: 1 */
            $compile = _$compile_;
            /* eslint camelcase: 1 */
            $window = _$window_;

            scope.title = "sample title";
            scope.onEditTitleConfirm = jasmine.createSpy();
            scope.isTitleEditingAllowed = function () {
                return true;
            };
            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should create an input field, description hidden', function () {
            var input = elm.find('input');
            var descDropdown = elm.find('.bk-description-edit-dropdown');
            expect(input.length).toBe(1);
            expect(descDropdown).not.toHaveClass('bk-visible');
        });

        it('should bind the text', function () {
            var input = elm.find('input');
            expect(input.val()).toBe("sample title");
        });

        it('show description when clicked', function () {
            var input = elm.find('input');
            var descDropdown = elm.find('.bk-description-edit-dropdown');
            input.click();
            scope.$digest();
            expect(descDropdown).toHaveClass('bk-visible');
        });

        it('hides description when mousdowned on window', function () {
            var descDropdown = elm.find('.bk-description-edit-dropdown');
            var input = elm.find('input');
            input.click();
            scope.$digest();
            expect(descDropdown).toHaveClass('bk-visible');
            angular.element($window).mousedown();
            expect(descDropdown).not.toHaveClass('bk-visible');
        });

        it('calls onChange callback after the input is changed', function () {
            var input = elm.find('input');
            input.click();
            angular.element(input).val('Some text').trigger('input');
            scope.$apply();
            input.blur();
            scope.$apply();
            expect(scope.onEditTitleConfirm).toHaveBeenCalled();
        });

        it('restores original text, if disallowEmpty and new title is empty/undefined', function () {
            var input = elm.find('input');
            input.click();
            angular.element(input).val('').trigger('input');
            scope.$apply();
            input.blur();
            scope.$apply();
            expect(input.val()).toBe("sample title");

            input.click();
            angular.element(input).val(undefined).trigger('input');
            scope.$apply();
            input.blur();
            scope.$apply();
            expect(input.val()).toBe("sample title");
        });

        it('show description when clicked for not editable', function () {
            scope.isTitleEditingAllowed = function () {
                return false;
            };
            var input = elm.find('input');
            var descDropdown = elm.find('.bk-description-edit-dropdown');
            input.click();
            scope.$digest();
            expect(descDropdown).toHaveClass('bk-visible');
        });

        it('should add tooltip to body', function () {
            scope.isTitleEditingAllowed = function () {
                return true;
            };
            var input = elm.find('input');
            scope.$digest();
            expect(input.attr('tooltip-append-to-body')).toBe('true');
        });
    });
});
