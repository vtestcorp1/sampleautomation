/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Testing for groups service
 */

'use strict';

describe('GroupsCacheService ', function () {

    var q,
        groupsCacheService,
        GroupModel,
        mockUserAdminService = {},
        mockUsersCacheService = {},
        mockSessionService = {
            isSchedulingJobEnabled: function() { return true; },
            isA3Enabled: function() { return true; }
        },
        groupsComparator,
        groupsJson,
        scope,
        usersJson,
        UserModel;

    /* eslint camelcase: 1 */

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('userAdminService', mockUserAdminService);
            $provide.value('usersCacheService', mockUsersCacheService);
            $provide.value('sessionService', mockSessionService);
        });
        inject(function (_$rootScope_, _$q_, _groupsCacheService_,
                         _userAdminService_, _GroupModel_, _UserModel_) {
            q = _$q_;
            groupsCacheService = _groupsCacheService_;
            GroupModel = _GroupModel_;
            groupsJson = [];
            scope = _$rootScope_;
            usersJson = [];
            UserModel = _UserModel_;


            // We copy the original JSON because userModel and groupModel directly reference
            // some piece of it. If we run all the tests sequentially without copying it
            // the 'backend' JSON will be altered
            angular.copy(blink.app.fakeData.adminUI.fakeUsers, usersJson);
            angular.copy(blink.app.fakeData.adminUI.fakeGroups, groupsJson);

            mockUserAdminService.getGroupList = function() {
                var groupModelsList = groupsJson.map(function (groupJson) {
                    return new GroupModel(groupJson);
                });
                return q.when({data: groupModelsList});
            };

            // we use a closure because we expect the state of users to be maintained
            // between different call
            var users =  usersJson.map(function (groupJson) {
                return new UserModel(groupJson);
            });
            mockUsersCacheService.getUsers = function() {
                return users;
            };

            groupsComparator = function(elementA,elementB) {
                var firstGroupName = elementA.getName().toLowerCase();
                var secondGroupName = elementB.getName().toLowerCase();

                if (firstGroupName > secondGroupName) {
                    return 1;
                }
                if (firstGroupName < secondGroupName) {
                    return -1;
                }

                return 0;
            };

            spyOn(mockUserAdminService, 'getGroupList').and.callThrough();
            groupsCacheService.syncFromBackend();
            scope.$digest();
        });
    });

    it("should expose a list of groups",function() {
        expect(groupsCacheService.getGroups().count())
            .toBe(blink.app.fakeData.adminUI.fakeGroups.length);
    });

    it("sort users and groups by name, in increasing order", function() {
        addCustomMatchers()();
        var groups = groupsCacheService.getGroups();
        expect(groups).toBeSortedUsingComparator(groupsComparator, true);
    });

    it("should delete group correctly",function () {
        var groups = groupsCacheService.getGroups(),
            group = groups[0],
            lengthBeforeRemoving = groups.length;

        groupsCacheService.deleteGroup(group.getId());

        expect(groupsCacheService.getGroups().count()).toBe(lengthBeforeRemoving - 1);
        expect(groupsCacheService.getGroups().indexOf(group)).toBe(-1);

    });

    it("should do nothing, when deleting an user that not exist", function() {
        var groups = groupsCacheService.getGroups();

        groupsCacheService.deleteGroup('dummyValue');

        expect(groupsCacheService.getGroups().count()).toBe(groups.length);
    });

    it("should delete groups correctly",function() {
        // Admin, Everybody, Nobody, Analysts are removed
        var groups = groupsCacheService.getGroups(),
            groupA = groups[0], groupB = groups[2], groupC = groups[4], groupD = groups[7],
            testedGroups = [groupA, groupB, groupC, groupD],
            lengthBeforeRemoving = groups.length;

        // TODO(chabbey) Make it generic and test all affected users
        var adminUser = mockUsersCacheService.getUsers()[6];
        var adminUserGroups = adminUser.getGroups();
        var adminUserGroupsLength = adminUserGroups.length;

        var otherUser= mockUsersCacheService.getUsers()[4];
        var otherUserGroups = otherUser.getGroups();
        var otherUserGroupsLength = otherUserGroups.length;

        groupsCacheService.deleteGroups([groupA.getId(),groupB.getId(),groupC.getId(),groupD.getId()]);

        expect(groupsCacheService.getGroups().indexOf(groupA)).toBe(-1);
        expect(groupsCacheService.getGroups().indexOf(groupB)).toBe(-1);
        expect(groupsCacheService.getGroups().indexOf(groupC)).toBe(-1);
        expect(groupsCacheService.getGroups().indexOf(groupD)).toBe(-1);
        expect(groupsCacheService.getGroups().count()).toBe(lengthBeforeRemoving - 4);

        // check if user have been updated
        expect(adminUserGroups.count()).toBe(adminUserGroupsLength - 3);
        expect(otherUserGroups.count()).toBe(otherUserGroupsLength - 1);
        testedGroups.forEach(function(group){
            expect(adminUserGroups.indexOf(group)).toBe(-1);
            expect(otherUserGroups.indexOf(group)).toBe(-1);
        });
    });

    it("should do nothing, when deleting users that not exist", function() {
        var length = groupsCacheService.getGroups().length;
        groupsCacheService.deleteGroups(['a','b','c']);
        expect(groupsCacheService.getGroups().count()).toBe(length);
    });

    it("should return no groups, after invalidation", function() {
        groupsCacheService.invalidate();
        expect(groupsCacheService.getGroups().count()).toBe(0);
    });

    it("should add a new group to the group list", function() {
        addCustomMatchers()();

        var newGroup = blink.app.fakeData.adminUI.fakeNewUser;
        var groupsLength = groupsCacheService.getGroups().length;
        groupsCacheService.addGroup(newGroup);
        var groups = groupsCacheService.getGroups();

        expect(groupsCacheService.getGroups().count()).toBe(groupsLength + 1);

        // check ordering
        expect(groups).toBeSortedUsingComparator(groupsComparator, true);
    });

    it("should return correct group when asked", function() {
        var group = groupsCacheService.getGroupById('analystGroup');
        expect(group.getDescription()).toBe('analysts');
        expect(group.getName()).toBe('Analyst');
    });

    it("should return correct exposed group privileges", function() {
        var group = groupsCacheService.getGroupById('analystGroup');
        groupsCacheService.getExposedGroupPrivileges(group).each(function(privilege){
            expect(privilege.isEnabled).toBe(group.getPrivileges().some(privilege.key));
        });
    });

    it('should return exposed group privileges with key and label properties', function () {
        expect(groupsCacheService.getExposedGroupPrivileges().length).toBeGreaterThan(1);
        expect(groupsCacheService.getExposedGroupPrivileges()[0].key).toBeDefined();
        expect(groupsCacheService.getExposedGroupPrivileges()[0].label).toBeDefined();
    });

    it('should return, for a given group, correct exposed privileges with correct keys', function () {
        var newGroup = new GroupModel(blink.app.fakeData.adminUI.fakeNewGroup);
        expect(groupsCacheService.getExposedGroupPrivileges(newGroup).length).toBeGreaterThan(1);
        expect(groupsCacheService.getExposedGroupPrivileges()[0].key).toBeDefined();
        expect(groupsCacheService.getExposedGroupPrivileges()[0].label).toBeDefined();
        expect(groupsCacheService.getExposedGroupPrivileges(newGroup)[0].isEnabled).toBe(true);
    });
});
