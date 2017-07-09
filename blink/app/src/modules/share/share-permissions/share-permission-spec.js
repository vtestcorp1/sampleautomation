/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for Share permissions
 */
'use strict';


var principal = {
    id: 'id',
    name: 'name',
    displayName: 'displayName',
    isGroup: true,
    sharingType: 1,
    permissionType: 'READ_ONLY'
};

describe('Share row', function () {
    var constructor,
        sharePermission,
        compile,
        scope,
        directiveElement,
        deleteHandler,
        changeHandler;

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector, $compile, $rootScope) {
            constructor = $injector.get('SharingRowComponent');
            changeHandler = jasmine.createSpy();
            deleteHandler = jasmine.createSpy();

            sharePermission = new constructor(principal, true, deleteHandler, changeHandler);
            compile = $compile;
            scope = $rootScope.$new();
            scope.ctrl = sharePermission;
            directiveElement = getCompiledElement();
        });
    });
    function getCompiledElement(){
        var element = angular.element('<bk-sharing-row bk-ctrl="ctrl"></bk-sharing-row>');
        var compiledElement = compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }
    it('should have name and display name', function() {
        expect(directiveElement.find('.bk-display-name').text()).toBe('displayName');
        expect(directiveElement.find('.bk-name').text()).toBe('name');
    });

    it('should have correct icon', function(){
        expect(directiveElement.find('.bk-style-icon-users').length).toBe(1)
    });

    it('should call delete handler when cross is clicked', function(){
        directiveElement.find('.bk-delete-row-btn').click();
        scope.$digest();
        expect(deleteHandler).toHaveBeenCalled();
    });
});
