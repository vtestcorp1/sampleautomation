/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com), Francois Chabbey (francois@thoughtspot.com)
 *
 * @fileoverview Tests for Admin Controller
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Admin Controller', function () {

    var $q,
        adminDialogs,
        confirmDialog = {
            show: angular.noop
        },
        groupDialogs,
        GroupModel,
        metadataService,
        mockUserAdminService = {},
        mockMetadataService = {},
        roleDialogs,
        sessionService,
        scope,
        UserModel,
        userService,
        userGroupActionService = jasmine.createSpyObj('userGroupActionService',
            ['createUserViewModelObject', 'createGroupViewModelObject','syncUsersAndGroupsAndRoles',
                'getGroupList', 'createUser', 'saveGroup', 'saveUser', 'deleteUsers', 'deleteRoles',
                'deleteGroups','getExposedGroupPrivileges', 'getUsersIdsForGroup', 'saveRole']),
        userDialogs,
        usersAndGroupsDefer,
        util;

    /* eslint camelcase: 1 */

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('userAdminService', mockUserAdminService);
            $provide.value('metadataService', mockMetadataService);
            $provide.value('confirmDialog', confirmDialog);
            $provide.value('userGroupActionService', userGroupActionService);
        });

        inject(function ($rootScope,
                         _$q_,
                         $controller,
                         alertConstants,
                         events,
                         _GroupModel_,
                         _UserModel_,
                         _util_) {
            scope = $rootScope.$new();
            GroupModel = _GroupModel_;
            UserModel = _UserModel_;
            $q = _$q_;
            util = _util_;
            usersAndGroupsDefer = $q.defer();
            sessionService = {
                isRoleEnabled: function() {
                    return true;
                },
                isStyleCustomizationEnabled: function() {
                    return false;
                },
                isA3Enabled: function() {
                    return true;
                },
                isSchedulingJobEnabled: function() {
                    return false;
                }
            };
            // Mock userService
            userService = jasmine.createSpyObj('userService', ['getProfilePicUrl']);
            userService.getProfilePicUrl.and.returnValue('dummyProfilePicUrl');
            // Mock userAdminService

            userGroupActionService.createUserViewModelObject.and.returnValue({});
            userGroupActionService.syncUsersAndGroupsAndRoles.and.returnValue(usersAndGroupsDefer.promise);
            userGroupActionService.getExposedGroupPrivileges.and.returnValue([]);
            userGroupActionService.getUsersIdsForGroup.and.returnValue([]);

            mockUserAdminService.getGroupsForGroup = function() {
                return $q.when({ data : [] });
            };
            mockUserAdminService.getGroupsForUser = function() {
                return $q.when({ data : [] });
            };
            mockUserAdminService.getUsersForGroup = function() {
                return $q.when({ data : [] });
            };
            mockUserAdminService.getGroup = function() {
                return $q.when( getMockGroupModel());
            };
            mockUserAdminService.getUser = function() {
                return $q.when( getMockUserModel());
            };
            mockUserAdminService.getRole = function() {
                return $q.when( getMockRoleModel());
            };
            mockUserAdminService.deleteGroups = function() {
                return $q.when({});
            };
            mockUserAdminService.deleteUsers = function() {
                return $q.when({});
            };

            mockMetadataService.getMetadataList = function(type) {
                switch (type) {
                    case 'USER':
                        var usersData = {
                            data:
                            {
                                headers : [{
                                    id: 'test2',
                                    name: 'test2',
                                    displayName: 'test2'
                                }]
                            }
                        };
                        return $q.when(usersData);
                    case 'USER_GROUP':
                        var groupsData = {
                            data: {
                                headers: [{
                                    id: 'test1',
                                    name: 'test1',
                                    displayName: 'test1'
                                }]
                            }
                        };
                        return $q.when(groupsData);
                    case 'ROLE':
                        var rolesData = {
                            data: {
                                headers: [{
                                    id: 'test3',
                                    name: 'test3',
                                    displayName: 'test3'
                                }]
                            }
                        };
                        return $q.when(rolesData);
                }
            };

            confirmDialog.show = function() {
                return $q.when();
            };

            spyOn(mockMetadataService, 'getMetadataList').and.callThrough();
            spyOn(confirmDialog, 'show').and.callThrough();
            userDialogs = jasmine.createSpyObj('userDialogs', ['showCreateDialog', 'showEditDialog']);
            adminDialogs = jasmine.createSpyObj('adminDialogs', ['showEditUserDialog', 'showEditGroupDialog', 'showEditRoleDialog']);

            $controller('AdminController', {
                $scope: scope,
                adminDialogs: adminDialogs,
                userService: userService,
                userGroupActionService: userGroupActionService,
                groupDialogs: groupDialogs,
                roleDialogs: roleDialogs,
                userDialogs: userDialogs,
                confirmDialog: confirmDialog,
                sessionService: sessionService,
                util: util
            });

            userGroupActionService.saveUser.calls.reset();
            userGroupActionService.saveGroup.calls.reset();
            userGroupActionService.saveRole.calls.reset();
            userGroupActionService.deleteRoles.calls.reset();
            userGroupActionService.deleteUsers.calls.reset();
            userGroupActionService.deleteGroups.calls.reset();
        });
    });

    var newUserCustomData = {
            displayName: 'new',
            userInGroup: {
                a: true
            }
        },
        editUserCustomData = {
            displayName: 'edit',
            userEmail: 'user@thoughtspot.com',
            userInGroup: {
                a: false,
                b: undefined,
                c: true
            }
        };

    var privileges = [
        {
            key: 'ADMINISTRATION',
            label: 'Has administration privileges',
            isEnabled: false
        },
        {
            key: 'USERDATAUPLOADING',
            label: 'Can upload user data',
            isEnabled: true
        }
        ],
        newGroupCustomData = {
            name: 'new',
            privileges: angular.copy(privileges)
        },
        editGroupCustomData = {
            name: 'edit',
            privileges: angular.copy(privileges)
        },
        newRoleCustomData = {
            name: 'new'
        },
        editRoleCustomData = {
            name: 'edit'
        };

    function resolve(deferred, data, isResolve) {
        if (isResolve) {
            deferred.resolve(data);
        } else {
            deferred.reject(data);
        }
        scope.$apply();
    }

    function getMockUserModel() {
        return {
            displayName: 'a',
            id: 'a',
            groups: ['q'],
            email: 'user@ts.com',
            setName: function() {return this;},
            setDisplayName: function(arg) {
                this.displayName = arg;
                return this;
            },
            setGroups: function(arg) {
                this.groups = arg;
                return this;
            },
            setEmail: function(arg) {
                this.email = arg;
                return this;
            },
            getDescription: angular.noop,
            getDisplayName: angular.noop,
            getName: angular.noop,
            getEmail: function() {
                return this.email;
            },
            getId: function() {
                return this.id;
            },
            getGroups: function() {
                return this.groups;
            },
            getAssignedRoles: function(){
                return [];
            },
            setAssignedRoles: function(arg){
                return this;
            },
            getJson: angular.noop,
            isSystemPrincipal: angular.noop
        };
    }

    function getMockGroupModel() {
        return {
            name: '',
            setName: function(arg) {
                this.name = arg;
                return this;
            },
            getAssignedRoles: function(){
                return [];
            },
            setAssignedRoles: function(arg){
                return this;
            },
            getGroups: function() {
                return [];
            },
            setGroups: angular.noop,
            setDescription: function() {return this;},
            getDisplayName: angular.noop,
            getDescription: angular.noop,
            getName: angular.noop,
            getId: angular.noop,
            getJson: angular.noop,
            isSystemPrincipal: angular.noop
        };
    }

    function getMockRoleModel() {
        return {
            displayName: 'a',
            id: 'a',
            groups: ['q'],
            users: ['a'],
            email: 'user@ts.com',
            setName: function() {return this;},
            setDisplayName: function(arg) {
                this.displayName = arg;
                return this;
            },
            setGroups: function(arg) {
                this.groups = arg;
                return this;
            },
            getDisplayName: angular.noop,
            getName: angular.noop,
            getEmail: function() {
                return this.email;
            },
            getId: function() {
                return this.id;
            },
            getGroups: function() {
                return this.groups;
            },
            getUsers: function() {
                return this.users;
            },
            setUsers: function(arg) {
                this.users = arg;
            },
            getJson: angular.noop,
            isSystemPrincipal: angular.noop
        };
    }

    function createUser(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer();
        adminDialogs.showEditUserDialog.and.returnValue(defer1.promise);
        scope.createUser();
        expect(adminDialogs.showEditUserDialog.calls.count()).toBe(1);

        userGroupActionService.saveUser.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, newUserCustomData, true);
        expect(userGroupActionService.saveUser.calls.count()).toBe(1);

        // Resolve the admin service
        resolve(defer2, new UserModel(newUserCustomData), isSuccess);
    }

    function editUser(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer(),
            mockUserModel = getMockUserModel();
        adminDialogs.showEditUserDialog.and.returnValue(defer1.promise);
        scope.editUser(mockUserModel);
        userGroupActionService.saveUser.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, editUserCustomData, true);
        expect(adminDialogs.showEditUserDialog.calls.count()).toBe(1);
        // Resolve the admin service
        resolve(defer2, mockUserModel, isSuccess);
        expect(userGroupActionService.saveUser.calls.count()).toBe(1);
    }

    function deleteUser(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer(),
            mockUserModel = getMockUserModel();
        confirmDialog.show.and.returnValue(defer1.promise);
        scope.userListCtrl.showConfirmDeleteDialog([mockUserModel])
            .then(scope.userListCtrl.delete([mockUserModel]));
        expect(confirmDialog.show.calls.count()).toBe(1);

        userGroupActionService.deleteUsers.and.returnValue(defer2.promise);
        // Resolve the admin service
        resolve(defer1, null, true);
        resolve(defer2, null, isSuccess);
        // Resolve the dialog box
        scope.$digest();
        expect(userGroupActionService.deleteUsers.calls.count()).toBe(1);

    }

    function createGroupAndVerify(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer();
        adminDialogs.showEditGroupDialog.and.returnValue(defer1.promise);
        scope.createGroup();
        expect(adminDialogs.showEditGroupDialog.calls.count()).toBe(1);

        userGroupActionService.saveGroup.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, newGroupCustomData, true);
        expect(userGroupActionService.saveGroup.calls.count()).toBe(1);
        // Resolve with a simple mock
        var newGroup = {};
        newGroup.getName = function() { return newGroupCustomData.name; };

        resolve(defer2, newGroup, isSuccess);
    }


    function editGroupAndVerify(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer(),
            mockGroupModel = getMockGroupModel();
        adminDialogs.showEditGroupDialog.and.returnValue(defer1.promise);
        scope.editGroup(mockGroupModel);
        scope.$digest();
        expect(adminDialogs.showEditGroupDialog.calls.count()).toBe(1);

        userGroupActionService.saveGroup.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, editGroupCustomData, true);
        expect(userGroupActionService.saveGroup.calls.count()).toBe(1);
        // Resolve the actions service
        var editedGroup = {};
        editedGroup.getName = function() { return mockGroupModel.name; };
        resolve(defer2, editedGroup, isSuccess);
    }

    function createRoleAndVerify(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer();
        adminDialogs.showEditRoleDialog.and.returnValue(defer1.promise);
        scope.createRole();
        expect(adminDialogs.showEditRoleDialog.calls.count()).toBe(1);

        userGroupActionService.saveRole.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, newRoleCustomData, true);
        expect(userGroupActionService.saveRole.calls.count()).toBe(1);
        // Resolve with a simple mock
        var newGroup = {};
        newGroup.getName = function() { return newRoleCustomData.name; };

        resolve(defer2, newGroup, isSuccess);
    }


    function editRoleAndVerify(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer();
        adminDialogs.showEditRoleDialog.and.returnValue(defer1.promise);
        scope.createRole();
        expect(adminDialogs.showEditRoleDialog.calls.count()).toBe(1);

        userGroupActionService.saveRole.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, newRoleCustomData, true);
        expect(userGroupActionService.saveRole.calls.count()).toBe(1);
        // Resolve with a simple mock
        var newGroup = {};
        newGroup.getName = function() { return newRoleCustomData.name; };

        resolve(defer2, newGroup, isSuccess);
    }



    function deleteGroupAndVerify(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer(),
            mockGroupModel = getMockGroupModel();
        confirmDialog.show.and.returnValue(defer1.promise);

        scope.groupListCtrl.showConfirmDeleteDialog([mockGroupModel])
            .then(scope.groupListCtrl.delete([mockGroupModel]));

        expect(confirmDialog.show.calls.count()).toBe(1);

        userGroupActionService.deleteGroups.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, null, true);
        expect(userGroupActionService.deleteGroups.calls.count()).toBe(1);

        // Resolve the admin service
        resolve(defer2, null, isSuccess);
    }
    function deleteRoleAndVerify(isSuccess) {
        var defer1 = $q.defer(),
            defer2 = $q.defer(),
            mockRoleModel = getMockRoleModel();
        confirmDialog.show.and.returnValue(defer1.promise);
        scope.roleListCtrl.delete([mockRoleModel]);
        expect(confirmDialog.show.calls.count()).toBe(1);

        userGroupActionService.deleteRoles.and.returnValue(defer2.promise);
        // Resolve the dialog box
        resolve(defer1, null, true);
        expect(userGroupActionService.deleteRoles.calls.count()).toBe(1);

        // Resolve the admin service
        resolve(defer2, null, isSuccess);
    }

    it('Success - Checking the initial state of the controller - users and groups should be fetched', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        scope.$digest();

        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);

        expect(scope.userListCtrl.listModel.data.length).toBe(1);
        expect(scope.userListCtrl.listModel.data[0].getDisplayName()).toBe('test2');
        // this should NOT trigger a request
        scope.onSecondaryTabActivated({tabId: "group"});
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);

        expect(scope.groupListCtrl.listModel.data.length).toBe(1);
        expect(scope.groupListCtrl.listModel.data[0].getDisplayName()).toBe('test1');

        /* Role will be fixed in 3.4
         scope.onSecondaryTabActivated({tabId: "roles"});
         expect(scope.rolesListModel.data.length).toBe(1);
         expect(scope.rolesListModel.data[0].getDisplayName()).toBe('test3');
         `       */
    });

    it('Failure - Checking the initial state of the controller', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
        resolve(usersAndGroupsDefer, null, false);
    });

    it('Successfully create user', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        createUser(true);

    });

    it('Successfully edit user', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        editUser(true);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(4);
    });

    it('Successfully delete user', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        deleteUser(true);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    it('Failure creating user', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        createUser(false);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    it('Failure edit user', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        editUser(false);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    it('Failure delete user', function () {
        scope.onSecondaryTabActivated({tabId: "user"});
        deleteUser(false);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    it('Successfully create group', function () {
        scope.onSecondaryTabActivated({tabId: "group"});
        createGroupAndVerify(true);
        // we refetch the whole data after updating/creating a group
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(4);
    });

    it('Successfully edit group', function () {
        scope.onSecondaryTabActivated({tabId: "group"});
        editGroupAndVerify(true);
        // we refetch the whole data after updating/creating a group
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(4);
    });

    it('Successfully delete group', function () {
        scope.onSecondaryTabActivated({tabId: "group"});
        deleteGroupAndVerify(true);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    it('Failure creating group', function () {
        scope.onSecondaryTabActivated({tabId: "group"});
        createGroupAndVerify(false);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    it('Failure edit group', function () {
        scope.onSecondaryTabActivated({tabId: "group"});
        editGroupAndVerify(false);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    it('Failure delete group', function () {
        scope.onSecondaryTabActivated({tabId: "group"});
        deleteGroupAndVerify(false);
        expect(mockMetadataService.getMetadataList.calls.count()).toBe(2);
    });

    xit('Successfully delete role', function () {
        scope.onPrimaryTabActivated({tabId: "role"});
        deleteRoleAndVerify(true);
        expect(userGroupActionService.syncUsersAndGroupsAndRoles.calls.count()).toBe(2);
    });

    xit('Failure delete role', function () {
        scope.onPrimaryTabActivated({tabId: "role"});
        deleteRoleAndVerify(false);
        expect(userGroupActionService.syncUsersAndGroupsAndRoles.calls.count()).toBe(1);
    });

    xit('Successfully create role', function () {
        scope.onPrimaryTabActivated({tabId: "role"});
        createRoleAndVerify(true);
        // we refetch the whole data after updating/creating a group
        expect(userGroupActionService.syncUsersAndGroupsAndRoles.calls.count()).toBe(2);
    });

    xit('Failure create role', function () {
        scope.onPrimaryTabActivated({tabId: "role"});
        createRoleAndVerify(false);
        // we refetch the whole data after updating/creating a group
        expect(userGroupActionService.syncUsersAndGroupsAndRoles.calls.count()).toBe(1);
    });


    xit('Success edit role', function () {
        scope.onPrimaryTabActivated({tabId: "role"});
        createRoleAndVerify(true);
        // we refetch the whole data after updating/creating a group
        expect(userGroupActionService.syncUsersAndGroupsAndRoles.calls.count()).toBe(2);
    });

    xit('Failure edit role', function () {
        scope.onPrimaryTabActivated({tabId: "role"});
        editRoleAndVerify(false);
        // we refetch the whole data after updating/creating a group
        expect(userGroupActionService.syncUsersAndGroupsAndRoles.calls.count()).toBe(1);
    });
});
