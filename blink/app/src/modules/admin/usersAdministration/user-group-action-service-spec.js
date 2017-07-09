/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Testing for usersGroupsActionService
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0  */

describe('User-group-action-service', function () {

    var alertService,
        GroupModel,
        groups,
        groupsJson,
        mockGroupsService = {},
        mockRolesService = {},
        mockUsersService = {},
        newUserJSON,
        newGroupJSON,
        q,
        rolesJson,
        RoleModel,
        scope,
        userAdminService,
        usersGroupsActionsService,
        users,
        usersJson,
        UserModel,
        util;

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('usersCacheService', mockUsersService);
            $provide.value('groupsCacheService', mockGroupsService);
            $provide.value('rolesCacheService', mockGroupsService);
        });
        inject(function (_$q_, _$rootScope_, _alertService_, _GroupModel_, _RoleModel_, _userAdminService_,
                         _userGroupActionService_, _UserModel_, _util_)
        {
            alertService = _alertService_;
            q = _$q_;
            userAdminService = _userAdminService_;
            usersGroupsActionsService = _userGroupActionService_;
            UserModel = _UserModel_;
            GroupModel = _GroupModel_;
            RoleModel = _RoleModel_;
            scope = _$rootScope_;
            util = _util_;
            groupsJson = [];
            usersJson = [];
            newUserJSON = blink.app.fakeData.adminUI.fakeNewUser ;
            newGroupJSON = blink.app.fakeData.adminUI.fakeNewGroup;

            angular.copy(blink.app.fakeData.adminUI.fakeUsers, usersJson);
            angular.copy(blink.app.fakeData.adminUI.fakeGroups, groupsJson);
            angular.copy(blink.app.fakeData.adminUI.fakeRoles, rolesJson);

            mockUsersService.syncFromBackend = function() {
                users = usersJson.map(function (userJson) {
                    return new UserModel(userJson);
                });
                users = users.sort(function (userA, userB) {
                    return util.comparator(userA.getDisplayName(), userB.getDisplayName());
                });
                return q.when(users);
            };

            mockUsersService.addUser = function () {
                return new UserModel(newUserJSON);
            };

            mockUsersService.updateUser = mockUsersService.addUser;
            mockUsersService.getUserById = mockUsersService.addUser;
            mockUsersService.deleteUsers = angular.noop;

            mockGroupsService.syncFromBackend = function() {
                groups = groupsJson.map(function (groupsJson) {
                    return new GroupModel(groupsJson);
                });
                groups = groups.sort(function (groupA, groupB) {
                    return util.comparator(groupA.getName(), groupB.getName());
                });
                return q.when(groups);
            };

            mockRolesService.syncFromBackend = function() {
                var roles = rolesJson.map(function (roleJson) {
                    return new RoleModel(roleJson);
                });
                roles = roles.sort(function (groupA, groupB) {
                    return util.comparator(groupA.getName(), groupB.getName());
                });
                return q.when(roles);
            };

            mockGroupsService.addGroup = function () {
                return new GroupModel(newGroupJSON);
            };

            mockGroupsService.getGroupById = mockGroupsService.addGroup;
            mockGroupsService.getGroups = function() { return []; };
            mockGroupsService.updateGroup = angular.noop;
            mockGroupsService.deleteGroups = angular.noop;

            userAdminService.assignUsersToGroup = angular.noop;
        });
    });

    it("should expose a list of users", function(done) {
        usersGroupsActionsService.syncUsersAndGroupsAndRoles().then(function(results) {
            expect(results.users.count()).toBe(7);
            expect(results.groups.count()).toBe(10);
            done();
        });
        scope.$digest();
    });

    xit("should save an user on backend", function(done) {
        var resolvedPromise = q.when({data:newUserJSON});

        spyOn(userAdminService, 'createUser').and.returnValue(resolvedPromise);
        spyOn(userAdminService, 'updateUser').and.returnValue(resolvedPromise);
        spyOn(alertService, 'showUserActionSuccessAlert').and.returnValue({});
        // backend returns the JSON of the new user in case of success

        usersGroupsActionsService.saveUser(null, '0A NEW USER', '0A NEW USER', 'email', 'pwd',[], []).then(function(user){
            expect(userAdminService.createUser.calls.count()).toEqual(1);
            done();
        });

        scope.$digest();
    });

    xit('should update an user on backend', function(done){
        var resolvedPromise = q.when();

        spyOn(userAdminService, 'updateUser').and.returnValue(resolvedPromise);
        spyOn(userAdminService, 'createUser').and.returnValue(resolvedPromise);
        spyOn(alertService, 'showUserActionSuccessAlert').and.returnValue({});

        usersGroupsActionsService.saveUser('a', '0A NEW USER', '0A NEW USER', 'email', 'pwd',[], [], []).then(function(){
            expect(userAdminService.updateUser.calls.count()).toEqual(1);
            done();
        });

        scope.$digest();
    });

    xit("should save a group on backend, group has no user", function(done) {
        var resolvedCreateGroupPromise = q.when({data: newGroupJSON});
        var freshGroup = new GroupModel(newGroupJSON);
        var name = freshGroup.getName(), description = freshGroup.getDescription();
        var resolvedAssignUsersToGroupPromise = q.when();
        var resolvedAssignGroupsToGroupPromise = q.when();

        spyOn(userAdminService, 'createGroup').and.returnValue(resolvedCreateGroupPromise);
        spyOn(userAdminService, 'updateGroup').and.returnValue(resolvedCreateGroupPromise);
        spyOn(alertService, 'showUserActionSuccessAlert').and.returnValue({});
        spyOn(userAdminService, 'assignUsersToGroup').and.returnValue(resolvedAssignUsersToGroupPromise);
        spyOn(userAdminService, 'assignGroupsToGroup').and.returnValue(resolvedAssignGroupsToGroupPromise);


        // backend returns the JSON of the new group in case of success
        usersGroupsActionsService.saveGroup(null, name, description, null, null, false, []).then(function(group){
            expect(userAdminService.createGroup.calls.count()).toEqual(1);
            // we always call all the API endpoints
            expect(userAdminService.assignUsersToGroup.calls.count()).toEqual(1);
            expect(userAdminService.assignGroupsToGroup.calls.count()).toEqual(1);

            done();
        });

        scope.$digest();
    });

    // TODO(chab): Fill this test
    /*
    xit("should save a group on backend, group has users", function(done) {

    });*/

    xit('should update a group on backend', function(done){
        var resolvedPromise = q.when({data:{}});
        var resolvedAssignUsersToGroupPromise = q.when({data:{}});
        var resolvedAssignGroupsToGroupPromise = q.when();

        spyOn(alertService, 'showUserActionSuccessAlert').and.returnValue({});
        spyOn(userAdminService, 'updateGroup').and.returnValue(resolvedPromise);
        spyOn(userAdminService, 'assignUsersToGroup').and.returnValue(resolvedAssignUsersToGroupPromise);
        spyOn(userAdminService, 'assignGroupsToGroup').and.returnValue(resolvedAssignGroupsToGroupPromise);

        usersGroupsActionsService.saveGroup('a', 'group', 'group', null, null ,false, []).then(function(){
            expect(userAdminService.updateGroup.calls.count()).toEqual(1);
            expect(userAdminService.assignUsersToGroup.calls.count()).toEqual(1);
            expect(userAdminService.assignGroupsToGroup.calls.count()).toEqual(1);
            done();
        });

        scope.$digest();
    });

    xit("for system groups, it should only assign users on backend", function(done){
        var resolvedPromise = q.when();
        var resolvedAssignUsersToGroupPromise = q.when();
        var resolvedAssignGroupsToGroupPromise = q.when();

        spyOn(alertService, 'showUserActionSuccessAlert').and.returnValue({});
        spyOn(userAdminService, 'updateGroup').and.returnValue(resolvedPromise);
        spyOn(userAdminService, 'assignUsersToGroup').and.returnValue(resolvedAssignUsersToGroupPromise);
        spyOn(userAdminService, 'assignGroupsToGroup').and.returnValue(resolvedAssignGroupsToGroupPromise);

        usersGroupsActionsService.saveGroup('a', 'group', 'group', null, null, true, []).then(function(){
            expect(userAdminService.updateGroup.calls.count()).toEqual(0);
            expect(userAdminService.assignUsersToGroup.calls.count()).toEqual(1);
            expect(userAdminService.assignGroupsToGroup.calls.count()).toEqual(1);
            done();
        });

        scope.$digest();
    });

    it("should delete users on backend", function(done){
        var resolvedPromise = q.when();

        spyOn(userAdminService, 'deleteUsers').and.returnValue(resolvedPromise);
        spyOn(alertService, 'showUserActionSuccessAlert').and.returnValue({});

        usersGroupsActionsService.deleteUsers([users[0], users[1], users[2]]).then(function(){
            expect(userAdminService.deleteUsers.calls.count()).toEqual(1);
            done();
        });
        scope.$digest();
    });

    it("should delete groups on backend", function(done){
        var resolvedPromise = q.when();

        spyOn(userAdminService, 'deleteGroups').and.returnValue(resolvedPromise);
        spyOn(alertService, 'showUserActionSuccessAlert').and.returnValue({});
        usersGroupsActionsService.deleteGroups([groups[0], groups[1], groups[2]]).then(function(){
            expect(userAdminService.deleteGroups.calls.count()).toEqual(1);
            done();
        });

        scope.$digest();
    });
});
