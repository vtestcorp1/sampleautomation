/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Testing for use service
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Users-cache-service ', function () {

    var $q,
        usersCacheService,
        GroupModel,
        UserModel,
        groupsJson,
        mockUserAdminService = {},
        scope,
        usersJson;

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('userAdminService', mockUserAdminService);
        });
        inject(function (_$q_,
                         _$rootScope_,
                         _GroupModel_,
                         _UserModel_,
                         _usersCacheService_) {

            GroupModel = _GroupModel_;
            UserModel = _UserModel_;
            $q = _$q_;
            usersCacheService = _usersCacheService_;
            groupsJson = [];
            scope = _$rootScope_;
            usersJson = [];

            angular.copy(blink.app.fakeData.adminUI.fakeUsers, usersJson);
            angular.copy(blink.app.fakeData.adminUI.fakeGroups, groupsJson);
            mockUserAdminService.getUserList = function() {
                var users = usersJson.map(function (userJson) {
                    return new UserModel(userJson);
                });
                return $q.when({data: users});
            };

            // TODO(chab) switch to sessionService when ready
            spyOn(mockUserAdminService, 'getUserList').and.callThrough();


            usersCacheService.syncFromBackend();
            scope.$digest();
        });


    });

    it("should expose a list of users", function() {
        expect(usersCacheService.getUsers().count()).toBe(7);
        expect(mockUserAdminService.getUserList.calls.count()).toBe(1);
    });

    it("should return an user when asked", function(){
        expect(usersCacheService.getUserById('ts_admin')).toBeDefined();
        expect(usersCacheService.getUserById('ts_admin').getName()).toBe('tsadmin');
    });

    it("should return no user if wrong id is provided", function(){
        expect(usersCacheService.getUserById('dummyValue')).not.toBeDefined();
    });

    it("sort users and groups by name, in increasing order", function() {
        addCustomMatchers()();
        var users = usersCacheService.getUsers();

        var comparator = function(elementA,elementB) {
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

        expect(users).toBeSortedUsingComparator(comparator,true);
    });

    it ("should return return user with correct groups", function(){
        var user = usersCacheService.getUsers()[2];
        expect(user.getGroups().count()).toBe(4);
    });

    it("should delete user correctly", function () {
        var users = usersCacheService.getUsers();
        var user = users[0];
        var length = users.length;
        usersCacheService.deleteUser(user.getId());
        expect(usersCacheService.getUsers().count()).toBe(length - 1);
        expect(usersCacheService.getUsers().indexOf(user)).toBe(-1);
    });

    it("should do nothing, when deleting an user that not exist", function() {
        var users = usersCacheService.getUsers();
        var length = users.length;
        usersCacheService.deleteUser('dummyValue');
        expect(usersCacheService.getUsers().count()).toBe(length);
    });

    it("should delete users correctly", function() {
        var users = usersCacheService.getUsers();
        var length = users.length;
        var userA = users[0];
        var userB = users[1];
        var userC = users[2];

        usersCacheService.deleteUsers([userA.getId(), userB.getId(), userC.getId()]);
        expect(usersCacheService.getUsers().count()).toBe(length - 3);
        expect(usersCacheService.getUsers().indexOf(userA)).toBe(-1);
        expect(usersCacheService.getUsers().indexOf(userB)).toBe(-1);
        expect(usersCacheService.getUsers().indexOf(userC)).toBe(-1);
    });

    it("should do nothing when deleting users that do not exist", function() {
        var users = usersCacheService.getUsers();
        usersCacheService.deleteUsers(['a', 'b', 'c']);
        expect(usersCacheService.getUsers().count()).toBe(users.length);
    });

    it("should return no users, after invalidation",function() {
        usersCacheService.invalidate();
        expect( usersCacheService.getUsers().count()).toBe(0);
    });

    it("should return the right users for a given group ",function() {
        // everybody group has all users
        var group = new GroupModel(groupsJson[0]);
        var users = usersCacheService.getUsersIdsForGroup(group);
        expect(users.count()).toBe(1);
        expect(usersCacheService.getUserById(users[0]).getDisplayName()).toBe("Administrator");

    });

    it("should return the right users for a given group (edge case, group has all users) ", function() {
        // everybody group has all users
        var group = new GroupModel(groupsJson[4]);
        var users = usersCacheService.getUsersIdsForGroup(group);
        expect(users.count()).toBe(usersCacheService.getUsers().count());
        usersCacheService.getUsers().forEach(function(user){
            expect(user.getGroups().some(group.getId())).toBe(true);
        });
    });
    it("should return the right users for a given group (edgce case, group has no user) / 2", function() {
        // everybody group has all users
        var group = new GroupModel(groupsJson[7]);
        var users = usersCacheService.getUsersIdsForGroup(group);
        expect(users.count()).toBe(0);
        usersCacheService.getUsers().forEach(function(user){
            expect(user.getGroups().none(group.getId())).toBe(true);
        });
    });

    it("should return user name", function(){
        expect(usersCacheService.getUserName("ts_admin")).toBe('tsadmin');
    });

    it("should return user displayName", function(){
        expect(usersCacheService.getUserDisplayName("ts_admin")).toBe('Administrator');
    });

    it("should return null if no user match", function() {
        expect(usersCacheService.getUserDisplayName("NONEXISTENTUSER")).toBeNull();
        expect(usersCacheService.getUserName("NONEXISTENTUSER")).toBeNull();
    });

    it("should insert a new user at the right place", function(){
        var newUser = blink.app.fakeData.adminUI.fakeNewUser;
        var usersLength = usersCacheService.getUsers().length;
        usersCacheService.addUser(newUser);
        expect(usersCacheService.getUsers().count()).toBe(usersLength+1);
        expect(usersCacheService.getUserDisplayName(newUser.header.id)).toBe(newUser.header.displayName);
        expect(usersCacheService.getUserName(newUser.header.id)).toBe(newUser.name);

    });

    it("should not insert an already existing user at the right place", function(){
        var newUser = angular.copy(blink.app.fakeData.adminUI.duplicateNameUser);
        newUser.header.id = "__SOMENEWUSER";
        var usersLength = usersCacheService.getUsers().length;
        usersCacheService.addUser(newUser);
        expect(usersCacheService.getUsers().count()).toBe(usersLength+1);
    });

    it("should not insert an already existing user at the right place", function(){
        var newUser = blink.app.fakeData.adminUI.duplicateNameUser;
        var usersLength = usersCacheService.getUsers().length;
        usersCacheService.addUser(newUser);
        expect(usersCacheService.getUsers().count()).toBe(usersLength);
    });
});
