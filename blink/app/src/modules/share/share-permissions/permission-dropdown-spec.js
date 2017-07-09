/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for PermissiondropDown
 */
'use strict';

describe('Share Dialog Controller', function () {
    var constructor, permissionDropdown, compile, scope, directiveElement;
    var permissions = {
        NO_ACCESS: 'NO_ACCESS',
        READ_ONLY: 'READ_ONLY',
        MODIFY: 'MODIFY',
        VARIES: 'VARIES'
    };
    beforeEach(function () {
        module('blink.app');
        inject(function ($injector, $compile, $rootScope) {
            constructor = $injector.get('PermissionDropdownComponent');
            permissionDropdown = new constructor();
            compile = $compile;
            scope = $rootScope.$new();
            scope.ctrl = permissionDropdown;
            directiveElement = getCompiledElement();
        });
    });
    function getCompiledElement(){
        var element = angular.element('<bk-permission-dropdown bk-ctrl="ctrl"></bk-permission-dropdown>');
        var compiledElement = compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should implement a getPermissionTypes method that returns the right permission options for the various drop downs', function () {
        expect(permissionDropdown.getPermissionTypes(permissions.VARIES)).toEqual([permissions.READ_ONLY, permissions.MODIFY, permissions.VARIES]);
        expect(permissionDropdown.getPermissionTypes()).toEqual([permissions.READ_ONLY, permissions.MODIFY]);
    });
    // SCAL-12729
    it('should allow system tables to be shared in both mode', function () {

        var modifyPermission = (permissionDropdown.getPermissionTypes(permissions.MODIFY));
        var readOnlyPermission = (permissionDropdown.getPermissionTypes(permissions.READ_ONLY));

        expect(modifyPermission).toEqual([permissions.READ_ONLY, permissions.MODIFY]);
        expect(readOnlyPermission).toEqual([permissions.READ_ONLY, permissions.MODIFY]);
    });
    it('it should have READ_ONLY  as default value', function(){
        expect(permissionDropdown.getPermissionType()).toEqual(permissions.READ_ONLY);
    });
});
