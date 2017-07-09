/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Button widget unit tests
 */

'use strict';

describe('blink button collection spec', function () {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var $rootScope, $compile;

    /* eslint camelcase: 1 */
    beforeEach(inject(function(_$rootScope_, _$compile_) {
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        $compile = _$compile_;
    }));

    describe('verify blink button', function () {

        it('should create base button', function () {
            var template = '<div><bk-button button-class="my-class" button-icon="my-icon" button-text="my-text"></bk-button></div>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            $compile(elm)(scope);
            scope.$digest();
            var $baseClass = elm.find('.bk-button-body');
            expect($baseClass.length).toBe(1);
            expect($baseClass).toHaveClass('my-class');
            expect($baseClass.find('.bk-icons')).toHaveClass('my-icon');
            expect($baseClass.find('.bk-text').text()).toMatch('my-text');
        });

        it('should create primary button', function () {
            var template = '<bk-primary-button icon="my-primary-icon" text="my-primary-text"></bk-primary-button>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            $compile(elm)(scope);
            scope.$digest();
            var $baseClass = elm.find('.bk-button-body');
            expect($baseClass).toHaveClass('bk-primary-button');
            expect($baseClass.find('.bk-icons')).toHaveClass('my-primary-icon');
            expect($baseClass.find('.bk-text').text()).toMatch('my-primary-text');
        });

        it('should create secondary button', function () {
            var template = '<bk-secondary-button icon="my-secondary-icon" text="my-secondary-text"></bk-secondary-button>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            $compile(elm)(scope);
            scope.$digest();
            var $baseClass = elm.find('.bk-button-body');
            expect($baseClass).toHaveClass('bk-secondary-button');
            expect($baseClass.find('.bk-icons')).toHaveClass('my-secondary-icon');
            expect($baseClass.find('.bk-text').text()).toMatch('my-secondary-text');
        });

        it('should create icon button', function () {
            var template = '<bk-icon-button icon="my-icons-icon"></bk-icon-button>';
            var elm = angular.element(template);
            var scope = $rootScope.$new();
            $compile(elm)(scope);
            scope.$digest();
            var $baseClass = elm.find('.bk-button-body');
            expect($baseClass).toHaveClass('bk-icons-button');
            expect($baseClass.find('.bk-icons')).toHaveClass('my-icons-icon');
        });

        it('should create action button dropdown', function () {
            var menu = {
                actions: [
                    {
                        class: "class1",
                        icon: "icon2",
                        label: "Label 1",
                        showWhen:function () { return true;}
                    },
                    {
                        class: "class2",
                        icon: "icon2",
                        label: "Label 2",
                        showWhen:function () { return true;}
                    }
                ]
            };
            var scope = $rootScope.$new();
            scope.actionMenuConfig = menu;
            var template = '<bk-action-button-dropdown menu="actionMenuConfig"></bk-action-button-dropdown>';
            var elm = angular.element(template);
            $compile(elm)(scope);
            scope.$digest();
            var $baseClass = elm.find('.bk-button-body');
            expect($baseClass).toHaveClass('bk-action-button-dropdown');
        });
    });

    it('should create secondary button if there is only one menu item in action dropdown', function () {
        var menu = {
            actions: [
                {
                    class: "class1",
                    icon: "icon2",
                    label: "Label 1",
                    showWhen:function () { return true;}
                }
            ]
        };
        var scope = $rootScope.$new();
        scope.actionMenuConfig = menu;
        var template = '<bk-action-button-dropdown menu="actionMenuConfig"></bk-action-button-dropdown>';
        var elm = angular.element(template);
        $compile(elm)(scope);
        scope.$digest();
        var $baseClass = elm.find('.bk-button-body');
        expect($baseClass).toHaveClass('bk-secondary-button');
    });

    it('should hide action button when showWhen returns false for all items', function () {
        var menu = {
            actions: [
                {
                    class: "class1",
                    icon: "icon2",
                    label: "Label 1",
                    showWhen:function () { return false;}
                },
                {
                    class: "class2",
                    icon: "icon2",
                    label: "Label 2",
                    showWhen:function () { return false;}
                }
            ]
        };
        var scope = $rootScope.$new();
        scope.actionMenuConfig = menu;
        var template = '<bk-action-button-dropdown menu="actionMenuConfig"></bk-action-button-dropdown>';
        var elm = angular.element(template);
        $compile(elm)(scope);
        scope.$digest();
        var $baseClass = elm.find('.bk-dropdown-button-wrapper');
        expect($baseClass).not.toBeVisible();
    });

    it('should hide action button when showWhen state changes to false', function () {
        var hideShowMenuItem = true;
        var menu = {
            actions: [
                {
                    class: "class1",
                    icon: "icon2",
                    label: "Label 1",
                    showWhen:function () { return hideShowMenuItem;}
                },
                {
                    class: "class2",
                    icon: "icon2",
                    label: "Label 2",
                    showWhen:function () { return hideShowMenuItem;}
                }
            ]
        };
        var scope = $rootScope.$new();
        scope.actionMenuConfig = menu;
        var template = '<bk-action-button-dropdown menu="actionMenuConfig"></bk-action-button-dropdown>';
        var elm = angular.element(template);
        $compile(elm)(scope);
        scope.$digest();
        var $buttonBodyClass = elm.find('.bk-button-body');
        expect($buttonBodyClass).toHaveClass('bk-action-button-dropdown');
        hideShowMenuItem = false;
        var $buttonWrapperClass = elm.find('.bk-dropdown-button-wrapper');
        scope.$digest();
        expect($buttonWrapperClass).not.toBeVisible();
    });
});
