/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview spec for role-cache-service
 */

'use strict';

describe('Roles-cache-service ', function () {

    var $q,
        roleCacheService,
        mockUserAdminService = {},
        scope,
        roleJson,
        RoleModel;

    var numOfRoles;

    /* eslint camelcase: 1 */

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('userAdminService', mockUserAdminService);
        });
        inject(function (_$q_,
                         _$rootScope_,
                         _RoleModel_,
                         _rolesCacheService_) {

            $q = _$q_;
            roleJson = [];
            RoleModel = _RoleModel_;
            roleCacheService = _rolesCacheService_;
            scope = _$rootScope_;
            angular.copy(blink.app.fakeData.adminUI.fakeRoles, roleJson);
            numOfRoles = roleJson.length;
            mockUserAdminService.getRolesList = function () {
                var roles = roleJson.map(function (roleJson) {
                    return new RoleModel(roleJson);
                });
                return $q.when({data: roles});
            };
            // TODO(chab) switch to sessionService when ready
            spyOn(mockUserAdminService, 'getRolesList').and.callThrough();

            roleCacheService.syncFromBackend();
            scope.$digest();
        });


    });

    it("should expose a list of roles", function () {
        expect(roleCacheService.getRoles().count()).toBe(numOfRoles);
        expect(mockUserAdminService.getRolesList.calls.count()).toBe(1);
    });

    it("should return a role when asked", function () {
        expect(roleCacheService.getRoleById('test1')).toBeDefined();
        expect(roleCacheService.getRoleById('test1').getName()).toBe('test1');
    });

    it("should return no user if wrong id is provided", function () {
        expect(roleCacheService.getRoleById('dummyValue')).not.toBeDefined();
    });

    it("sort users and groups by name, in increasing order", function () {
        addCustomMatchers()();
        var roles = roleCacheService.getRoles();

        var comparator = function (elementA, elementB) {
            var firstUserName = elementA.getDisplayName().toLowerCase();
            var secondUserName = elementB.getDisplayName().toLowerCase();

            if (firstUserName > secondUserName) {
                return 1;
            }
            if (firstUserName < secondUserName) {
                return -1;
            }

            var nameA = elementA.getName();
            var nameB = elementB.getName();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            var idA = elementA.getId();
            var idB = elementB.getId();

            if (idA < idB) {
                return -1;
            }
            if (idA > idB) {
                return 1;
            }

            return 0;
        };

        expect(roles).toBeSortedUsingComparator(comparator, true);
    });
});
