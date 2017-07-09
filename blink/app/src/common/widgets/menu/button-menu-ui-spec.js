/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for the <blink-button-menu> element.
 */

'use strict';

describe('Button menu', function () {
    beforeEach(module('blink.app'));

    var $buttonMenu, scope, _$compile, _$rootScope;
    beforeEach(inject(function ($compile, $rootScope) {
        _$compile = $compile;
        _$rootScope = $rootScope;
    }));


    function compileButtonMenu(params) {
        var html = params.html || '<blink-button-menu menu="menu"></blink-button-menu>';
        $buttonMenu = $(html);
        scope = _$rootScope.$new();
        if (params.menu) {
            scope.menu = params.menu;
        }
        _$compile($buttonMenu)(scope);
        scope.$apply();
    }

    function getButton() {
        return $buttonMenu.find('.bk-menu-btn-group .dropdownButton');
    }

    function getMenuBody() {
        return $buttonMenu.find('.bk-menu-btn-group .bk-menu-body');
    }

    it('should initialize with no config', function () {
        compileButtonMenu({
            html: '<blink-button-menu></blink-button-menu>'
        });
        expect(getButton().length).toBe(1);
        // Without a config there is no name.
        expect(getButton().text().trim()).toBe('');
    });

    it('should show menu and handle clicks with basic config', function () {
        compileButtonMenu({
            menu: {
                btnLabel: 'My menu',
                className: 'my-menu-class',
                btnArrowClass: 'my-button-arrow-class',
                submenus: [
                    [{
                        label: 'S1I1',
                        iconClass: 's1i1-class',
                        event: 's1i1-event'
                    }, {
                        label: 'S1I2',
                        iconClass: 's1i2-class',
                        event: 's1i2-event'
                    }],
                    [{
                        label: 'S2I1',
                        iconClass: 's2i1-class',
                        event: 's2i1-event'
                    }, {
                        label: 'S2I2',
                        iconClass: 's2i2-class',
                        event: 's2i2-event'
                    }]
                ]
            }
        });

        expect($buttonMenu.find('.bk-menu-btn-group').hasClass('my-menu-class')).toBeTruthy();
        expect($buttonMenu.find('.bk-icon-arrow-down').hasClass('my-button-arrow-class')).toBeTruthy();
        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();

        // Click on the menu button to make the body visible.
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeFalsy();
        expect(getMenuBody().text()).toMatch('S1I1');
        expect(getMenuBody().text()).toMatch('S1I2');
        expect(getMenuBody().text()).toMatch('S2I1');
        expect(getMenuBody().text()).toMatch('S2I2');

        // Check that the proper icon class is applied on a given submenu item.
        expect(getMenuBody().find('.bk-submenu-item:contains(S1I1)').has('.s1i1-class')).toBeTruthy();

        // Now clicking on an item should broadcast the corresponding event but close the menu
        // (because the keepMenuOpen option is not set).
        var eventTriggered = false;
        scope.$on('s1i1-event', function () {
            eventTriggered = true;
        });
        getMenuBody().find('.bk-submenu-item:contains(S1I1)').click();
        expect(eventTriggered).toBeTruthy();
        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();
    });

    it('should keep menu body open', function () {
        compileButtonMenu({
            menu: {
                keepMenuOpenOnSelect: true,
                submenus: [
                    [{
                        label: 'label',
                        event: 'label-event'
                    }]
                ]
            }
        });

        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();

        // Click on the menu button to make the body visible.
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeFalsy();

        getMenuBody().find('.bk-submenu-item:contains(label)').click();
        expect(getMenuBody().hasClass('ng-hide')).toBeFalsy();
    });

    it('should close menu body when the button is clicked twice', function () {
        compileButtonMenu({
            menu: {
                submenus: [
                    [{
                        label: 'label',
                        event: 'label-event'
                    }]
                ]
            }
        });
        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();

        // Click on the menu button to make the body visible.
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeFalsy();
        // Click on the menu button again to make the body hide.
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();

        // Now test the same thing with the keepMenuOpen option.
        compileButtonMenu({
            menu: {
                keepMenuOpenOnSelect: true,
                submenus: [
                    [{
                        label: 'label',
                        event: 'label-event'
                    }]
                ]
            }
        });
        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();
        // Click on the menu button to make the body visible.
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeFalsy();
        // Click on the menu button again to make the body hide.
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();
    });

    it('should close the menu body when escape key is pressed', function () {
        compileButtonMenu({
            menu: {
                submenus: [
                    [{
                        label: 'label',
                        event: 'label-event'
                    }]
                ]
            }
        });
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeFalsy();

        var e = $.Event('keydown');
        e.which = 27;
        $(window).trigger(e);
        e = $.Event('keyup');
        e.which = 27;
        $(window).trigger(e);

        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();
    });

    it('should close the menu body when clicked outside of the menu', function () {
        compileButtonMenu({
            menu: {
                submenus: [
                    [{
                        label: 'label',
                        event: 'label-event'
                    }]
                ]
            }
        });
        $buttonMenu.find('.bk-menu-btn-group').mouseenter();
        getButton().click();
        expect(getMenuBody().hasClass('ng-hide')).toBeFalsy();

        $buttonMenu.find('.bk-menu-btn-group').mouseleave();
        $('body').click();
        expect(getMenuBody().hasClass('ng-hide')).toBeTruthy();
    });

});
