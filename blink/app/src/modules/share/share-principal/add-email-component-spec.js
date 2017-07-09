/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for add-email-component
 */
'use strict';




describe('Add email component', function () {
    var addEmailComponent,
        addEmailHandler,
        compile,
        constructor,
        directiveElement,
        scope;

    var expectedResponse = [
        {
            id: 'test@gmail.com',
            name: 'test@gmail.com',
            displayName: 'test@gmail.com',
            isGroup: false,
            sharingType: 3 },
        {
            id: 'test2@gmail.com',
            name: 'test2@gmail.com',
            displayName: 'test2@gmail.com',
            isGroup: false,
            sharingType: 3
        }
    ];

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector, $compile, $rootScope) {
            constructor = $injector.get('AddEmailComponent');
            addEmailHandler = jasmine.createSpy();
            addEmailComponent = new constructor(addEmailHandler, ['gmail.com']);
            compile = $compile;
            scope = $rootScope.$new();
            scope.ctrl = addEmailComponent;
            directiveElement = getCompiledElement();
        });
    });

    function getCompiledElement(){
        var element = angular.element('<bk-add-email bk-ctrl="ctrl"></bk-add-email>');
        var compiledElement = compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should be disabled for invalid emails', function(){
        expect(scope.ctrl.isAddEmailDisabled()).toBe(true);
        scope.ctrl.emails = 'test@test.com';
        expect(scope.ctrl.isAddEmailDisabled()).toBe(true);
    });
    it('should be enabled for valid email', function(){
        expect(scope.ctrl.isAddEmailDisabled()).toBe(true);
        scope.ctrl.emails = 'test@gmail.com';
        expect(scope.ctrl.isAddEmailDisabled()).toBe(false);
    });
    it('should split email separated with a comma', function(){
        scope.ctrl.emails = 'test@gmail.com, test2@gmail.com';
        directiveElement.find('.bk-add-permissions-btn').click();
        scope.$apply();
        expect(addEmailHandler).toHaveBeenCalled();
        expect(addEmailHandler.calls.argsFor(0)[0].length).toBe(2);
    });
    it('should return correct objects', function(){
        scope.ctrl.emails = 'test@gmail.com, test2@gmail.com';
        directiveElement.find('.bk-add-permissions-btn').click();
        scope.$apply();
        expect(addEmailHandler).toHaveBeenCalledWith(expectedResponse);
    });
});
