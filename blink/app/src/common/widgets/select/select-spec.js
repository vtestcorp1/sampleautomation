/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview  bk-select unit tests
 *
 */

'use strict';

describe('select widget', function() {

    beforeEach(module('blink.app'));

    var SelectComponent, $rootScope, $compile;

    /* eslint camelcase: 1 */
    beforeEach(inject(function(_SelectComponent_, _$rootScope_, _$compile_) {
        SelectComponent = _SelectComponent_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    it('should render initial state correctly', function() {
        var selectComponent = new SelectComponent({
            options: [
                {id: 'a', caption: 'Hi'},
                {id: 'b', caption: 'Hello'}
            ]
        });
        expect(selectComponent.getSelectedID()).toBe(null);
        expect(selectComponent.getSelectedText()).toBe('Select an option');
        expect(selectComponent.isDropdownOpen()).toBe(false);

        var elem = renderComponent(selectComponent);
        expect(elem.find('.bk-selected-value').text().trim()).toBe('Select an option');
        // Because by default the select-body will be inside document body.
        expect(elem.find('.bk-select-body').length).toBe(0);

        var selectBody = $('body').find('.bk-select-body');
        expect(selectBody.length).toBe(1);
        expect(selectBody.hasClass('ng-hide')).toBe(true);
        expect(selectBody.find('.bk-select-option').length).toBe(2);
    });

    it('should render disabled selector properly', function() {
        var selectComponent = new SelectComponent({
            options: [
                {id: 'a', caption: 'Hi', isDisabled: true},
                {id: 'b', caption: 'Hello'}
            ],
            selectedID: 'b',
            isDisabled: true
        });
        var elem = renderComponent(selectComponent);
        expect(elem.find('.bk-selected-value').text().trim()).toBe('Hello');
        console.log(elem[0]);
        expect(elem.find('.bk-select').hasClass('bk-disabled')).toBe(true);
        expect(elem.find('.bk-select-head').hasClass('bk-disabled')).toBe(true);
        elem.find('.bk-select-head').click();
        // Should not open dropdown if disabled
        var selectBody = $('body').find('.bk-select-body');
        expect(selectBody.hasClass('ng-hide')).toBe(true);
    });

    it('should render disabled item properly', function() {
        var selectComponent = new SelectComponent({
            options: [
                {id: 'a', caption: 'Hi', isDisabled: true},
                {id: 'b', caption: 'Hello'}
            ]
        });
        var elem = renderComponent(selectComponent);
        // open selector
        elem.find('.bk-select-head').click();
        var selectBody = $('body').find('.bk-select-body');
        var disabledOption = selectBody.find('.bk-select-option').eq(0);
        expect(disabledOption.hasClass('bk-disabled')).toBe(true);

        // clicking on disabled option should not close dropdown
        disabledOption.click();
        expect(selectBody.hasClass('ng-hide')).toBe(false);
    });

    it('should allow dropdown toggle and selecting an item', function() {
        var selectComponent = new SelectComponent({
            options: [
                {id: 'a', caption: 'Hi'},
                {id: 'b', caption: 'Hello'}
            ]
        });
        var elem = renderComponent(selectComponent);
        var selectHead = elem.find('.bk-select-head');
        var selectBody = $('body').find('.bk-select-body');

        // Test dropdown toggle
        selectHead.click();
        expect(selectBody.hasClass('ng-hide')).toBe(false);
        selectHead.click();
        expect(selectBody.hasClass('ng-hide')).toBe(true);

        selectHead.click();
        selectBody.find('.bk-select-option').eq(1).click();
        expect(selectBody.hasClass('ng-hide')).toBe(true);
        expect(elem.find('.bk-selected-value').text().trim()).toBe('Hello');
    });

    it('should work if not appended to body', function() {
        var selectComponent = new SelectComponent({
            options: [
                {id: 'a', caption: 'Hi'},
                {id: 'b', caption: 'Hello'}
            ],
            placeholder: 'Please select',
            appendToBody: false
        });
        var elem = renderComponent(selectComponent);
        expect(elem.find('.bk-selected-value').text().trim()).toBe('Please select');
        // Now the selector body is inside element itself.
        var selectBody = elem.find('.bk-select-body');
        expect(selectBody.length).toBe(1);
        expect(selectBody.hasClass('ng-hide')).toBe(true);
        expect(selectBody.find('.bk-select-option').length).toBe(2);
        var selectHead = elem.find('.bk-select-head');
        selectHead.click();
        expect(selectBody.hasClass('ng-hide')).toBe(false);
    });

    function renderComponent(selectComponent) {
        var elem =
            angular.element('<bk-select bk-ctrl="ctrl"></bk-select>');
        var scope = $rootScope.$new();
        scope.ctrl = selectComponent;
        $compile(elem)(scope);
        scope.$digest();
        return elem;
    }
});
