/**
* Copyright: ThoughtSpot Inc. 2012-2013
* Author: Joy Dutta (joy@thoughtspot.com)
*         Francois Chabbey  (francois.chabbey@thoughtspot.com)
* @fileoverview Controller for admin page
*/

'use strict';


/* eslint max-params: 1 */
blink.app.controller('AdminController', ['$scope',
    '$rootScope',
    '$templateCache',
    'adminDialogs',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'strings',
    'confirmDialog',
    'CustomStylingService',
    'DocumentLoader',
    'env',
    'events',
    'GroupItemListController',
    'GroupModel',
    'JobStatusViewerComponent',
    'jsonConstants',
    'listActionUtil',
    'PaginatedListModel',
    'Logger',
    'loadingIndicator',
    'metadataService',
    'PinboardPageConfig',
    'RoleItemListController',
    'RoleModel',
    'AdminJobListController',
    'sessionService',
    'StyleCustomizerComponent',
    'userAdminService',
    'userDialogs',
    'userGroupActionService',
    'UserAction',
    'UserItemListController',
    'UserModel',
    'util',
    function ($scope,
          $rootScope,
          $templateCache,
          adminDialogs,
          alertConstants,
          alertService,
          blinkConstants,
          strings,
          confirmDialog,
          CustomStylingService,
          DocumentLoader,
          env,
          events,
          GroupItemListController,
          GroupModel,
          JobStatusViewerComponent,
          jsonConstants,
          listActionUtil,
          PaginatedListModel,
          Logger,
          loadingIndicator,
          metadataService,
          PinboardPageConfig,
          RoleItemListController,
          RoleModel,
          AdminJobListController,
          sessionService,
          StyleCustomizerComponent,
          userAdminService,
          userDialogs,
          userGroupActionService,
          UserAction,
          UserItemListController,
          UserModel,
          util) {

        var _logger = Logger.create('admin-controller');

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
        $scope.fileName = blinkConstants.adminSection.dataManagement;
        $scope.isStyleCustomizationEnabled = env.customBrandingEnabled
        || sessionService.isStyleCustomizationEnabled();


    /**
     * Show the user edit dialog and update underlying model on success
     *
     * @param {UserModel} userModel
     */
        $scope.editUser = function (userModel) {
            loadingIndicator.show();
            return userAdminService.getUser(userModel.getId())
            .then(function(completUserModel){
                userModel = completUserModel;
                return userAdminService.getGroupsForUser(userModel.getId());
            })
            .then(function(response){
                var groups = response.data
                    .filter(function(group){
                        return group.header.id !== blinkConstants.ALL_GROUP_GUID;
                    })
                    .map(function(group){
                        return new GroupModel(group);
                    }
                );
                var roleIds =  userModel.getAssignedRoles().slice();
                var editedUser = createUserViewModelObject(userModel, groups, roleIds);
                return adminDialogs.showEditUserDialog(editedUser)
                    .then(saveUser(editedUser))
                    .then(syncLists);
            }).finally(loadingIndicator.hide.bind(loadingIndicator));
        };

    /**
     *
     * @return {Object}
     */
        $scope.getSemanticModelingFileUploadConfig = function () {
            return {
                targetPath: '/modeling/uploadfile',
                multiPartFormPath: '/modeling/upload',
                fileName: 'model.csv'
            };
        };

    /**
     *
     * @return {Object}
     */
        $scope.getSecurityModelingFileUploadConfig = function () {
            return {
                targetPath: '/security/uploadfile',
                multiPartFormPath: '/security/upload',
                fileName: 'model.csv'
            };
        };

    /**
     * Show the user create dialog and refreshes the list of users on success
     */
        $scope.createUser = function () {
            var editedUser = createUserViewModelObject(null, [], []);
            adminDialogs.showEditUserDialog(editedUser)
            .then(saveUser(editedUser))
            .then(syncLists)
            .finally(loadingIndicator.hide);
        };

        function saveUser(editedUser) {
            return function() {
                loadingIndicator.show();
                return userGroupActionService.saveUser(editedUser);
            };
        }

        $scope.addActionBtn = {
            actions: [
                {
                    title: strings.adminUI.captions.ADD_GROUP,
                    onClick: function() {
                        $scope.createGroup();
                    }
                },
                {
                    title: strings.adminUI.captions.ADD_USER,
                    onClick: function() {
                        $scope.createUser();
                    }
                },
                {
                    title: strings.adminUI.captions.ADD_ROLE,
                    onClick: function() {
                        $scope.createRole();
                    }
                }
            ]
        };

    /**
     * Show the add users to groups dialog and refreshes the list of users on success
     *
     * @param {Array.<UserModel>} userModels
     */
        $scope.addUsersToGroups = function(selectedUsers) {

            userAdminService.getUsers(selectedUsers
            .map(function(user) {
                return user.getId();
            })
        ).then(function(users) {
            userDialogs.showAddUsersToGroupsDialog().then(function (data) {
                loadingIndicator.show();
                var groupsIds = Object.keys(data.selectedGroups);
                userGroupActionService.addGroupsToUsers(users, groupsIds)
                    .then(syncLists)
                    .finally(loadingIndicator.hide.bind(loadingIndicator));
            });
        });
        };

        $scope.superUserFilter = function (user) {
            return !user.isSuperUser();
        };

    /**
     * Show the group create dialog and refreshes the list of groups on success
     */
        $scope.createGroup = function () {
            var editedGroup = createGroupViewModelObject(null, [], [], []);
            adminDialogs.showEditGroupDialog(editedGroup).then(function () {
                loadingIndicator.show();
                saveGroup(editedGroup)
                .then(syncLists)
                .finally(loadingIndicator.hide);

            }
        );
        };

    /**
     * Show the group edit dialog and refreshes the list of groups on success
     *
     * @param {GroupModel} groupModel
     */
        $scope.editGroup = function (groupModel) {
            loadingIndicator.show();
            var promise =
            util.getAggregatedPromise([
                userAdminService.getGroupsForGroup(groupModel.getId()),
                userAdminService.getUsersForGroup(groupModel.getId()),
                userAdminService.getGroup(groupModel.getId())
            ]);
            promise.then(function(response){
                groupModel = response[2];
                var users = response[1].data
                .filter(function(user){
                    return user.header.id != blinkConstants.SUPER_USER_GUID;
                })
                .map(function(user) {
                    return UserModel.fromHeaderJson(user.header);
                }
            );
                var groups = response[0].data
                .filter(function(group){
                    return group.header.id != blinkConstants.ALL_GROUP_GUID;
                })
                .map(function(group) {
                    return GroupModel.fromHeaderJson(group.header);
                }
            );
                var roles = groupModel.getAssignedRoles();
                var editedGroup = createGroupViewModelObject(groupModel,
                users,
                groups,
                roles);

                return adminDialogs.showEditGroupDialog(editedGroup)
                .then(function () {
                    saveGroup(editedGroup, groupModel)
                        .then(syncLists);
                }
            );
            }).finally(loadingIndicator.hide.bind(loadingIndicator));
        };

        function saveGroup(editedGroup) {
            loadingIndicator.show();
            var privileges = getPrivilegesArrayForEditedGroup(editedGroup);
            editedGroup.privileges = privileges;
            return userGroupActionService.saveGroup(editedGroup);
        }

    /**
     * Show the role edit dialog and refreshes the list of groups on success
     *
     * @param {GroupModel} groupModel
     */
        $scope.editRole = function (roleModel) {

            var editedRole = createRoleViewModelObject(roleModel,
            roleModel.getUsers().slice(),
            roleModel.getGroups().slice()
        );

            adminDialogs.showEditRoleDialog(editedRole)
            .then(function () {
                // reset user list for dialog box
                loadingIndicator.show();
                return userGroupActionService.saveRole(editedRole);
            }).then(syncLists)
            .finally(loadingIndicator.hide);
        };

    /**
     * Show the role create dialog and refreshes the list of roles on success
     */
        $scope.createRole = function () {
            var editedRole = createRoleViewModelObject(null, [], []);
            adminDialogs.showEditRoleDialog(editedRole)
            .then(function () {
                loadingIndicator.show();
                return userGroupActionService.saveRole(editedRole);
            })
            .then(syncLists)
            .finally(loadingIndicator.hide);
        };

    /**
     * Show a confirmation dialog and delete rolesif Ok is clicked
     *
     * @param {Array.<RoleModel>} roleModels
     * @param {Array.<RoleModel>} roleModels
     */
        $scope.deleteRoles = function (roleModels) {
            var numRoles = roleModels.length;
            var roleName = roleModels[0].getName();
            var message = (numRoles == 1) ?
            strings.alert.ROLE_DELETE_DIALOG_MESSAGE_SINGULAR.assign(roleName) :
            strings.alert.ROLE_DELETE_DIALOG_MESSAGE_PLURAL;

            confirmDialog.show(strings.alert.ROLE_DELETE_DIALOG_TITLE, message)
            .then(function() {
                loadingIndicator.show();
                return userGroupActionService.deleteRoles(roleModels);
            })
            .then(syncLists)
            .finally(loadingIndicator.hide);
        };

        $scope.$on("$destroy", function() {
            userGroupActionService.invalidateCache();
        });

    /**
     * @params {UserModel} User to be edited
     * @params {Array<string>}  Array of group ids for the edited user
     * @params {Array<string>} Array of role ids for the edited user
     *
     * @return {Object} a JSON object for the view
     */
        function createUserViewModelObject(userModel, groups, roles) {
            var user = UserModel.prototype.getViewModel.call(userModel);
            user.roles = roles;
            user.groups = groups.map(function(group){
                return group.toCheckboxModel(true);
            });
            user.source = userModel;
            return user;
        }

    /**
     *
     * @params {GroupModel}
     * @userIds {array} userIds - Array of user ids belonging to group
     * @groupIds {array} groupIds - Array of group ids belonging to group
     * @groupIds {array} roleIds
     *
     *
     *
     * @return {Object} a JSON object for the view
     */

        function createGroupViewModelObject(groupModel, users, groups, roles) {
            var group = GroupModel.prototype.getViewModel.call(groupModel);
            group.groups = groups.map(function(group){
                return group.toCheckboxModel(true);
            });
            group.users = users.map(function(user){
                return user.toCheckboxModel(true);
            });
            group.roles = roles.map(function(role){
                return role.toCheckboxModel(true);
            });
            group.source = groupModel;
            group.privileges = userGroupActionService.getExposedGroupPrivileges(groupModel);
            return group;
        }

    /**
     * @params {RoleModel}
     *
     * @return {Object} a JSON object for the view
     * @userIds {array} userIds - Array of user ids belonging to group
     * @groupIds {array} groupIds - Array of group ids belonging to group
     */
        function createRoleViewModelObject(roleModel, userIds, groupIds) {
            var role = RoleModel.prototype.getViewModel.call(roleModel);
            role.groups = groupIds;
            role.users = userIds;
            return role;
        }

        function getPrivilegesArrayForEditedGroup(editedGroup) {
            return editedGroup.privileges.reduce(function(privilegeArray, privilege){
                if (privilege.isEnabled) {
                    privilegeArray.add(privilege.key);
                }
                return privilegeArray;
            }, []);
        }

        $scope.userManagement = blinkConstants.adminSection.userManagement;
        $scope.dataManagement = blinkConstants.adminSection.dataManagement;
        $scope.healthManagement = blinkConstants.adminSection.healthManagement;
        $scope.styleCustomization = blinkConstants.adminSection.styleCustomization;
        $scope.jobManagement = blinkConstants.adminSection.jobManagement;

    // TODO(Jasmeet): Migrate admin ui to use pinboard page.
        function loadPinboard(pinboardToLoad) {
            var pinboardLoader = new DocumentLoader(angular.noop);
            pinboardLoader.loadDocument(pinboardToLoad, jsonConstants.metadataType.PINBOARD_ANSWER_BOOK)
            .then(function (metadataModel) {
                $scope.metadataModel = metadataModel;
            }, function (error) {
                _logger.error(error);
            });
        }

        function resetAddUserGroupButtons() {
            $scope.showAddGroupButtonDropdown = false;
            $scope.showAddUserButtonDropdown = false;
        }

        $scope.onPrimaryTabActivated = function (activeTab) {
            resetAddUserGroupButtons();

            if (activeTab.tabId === $scope.dataManagement.tabId || activeTab.tabId === $scope.healthManagement.tabId) {
                $scope.showAddGroupButtonDropdown = false;
                $scope.showAddUserButtonDropdown = false;
                $scope.showAddRoleButtonDropdown = false;
            }
        };

        $scope.onSecondaryTabActivated = function (activeTab) {
            resetAddUserGroupButtons();

            if (activeTab.tabId === $scope.userManagement.tabUsers.id) {
                $scope.showAddGroupButtonDropdown = false;
                $scope.showAddUserButtonDropdown = true;
                $scope.showAddRoleButtonDropdown = false;
            } else if (activeTab.tabId === $scope.userManagement.tabGroups.id) {
                $scope.showAddUserButtonDropdown = false;
                $scope.showAddGroupButtonDropdown = true;
                $scope.showAddRoleButtonDropdown = false;
            } else if (activeTab.tabId === $scope.userManagement.tabRoles.id) {
                $scope.showAddUserButtonDropdown = false;
                $scope.showAddGroupButtonDropdown = false;
                $scope.showAddRoleButtonDropdown = true;
            }else if (activeTab.tabId === $scope.healthManagement.tabOverview.id) {
                loadPinboard($scope.healthManagement.tabOverview.guid);
            } else if (activeTab.tabId === $scope.healthManagement.tabData.id) {
                loadPinboard($scope.healthManagement.tabData.guid);
            } else if (activeTab.tabId === $scope.healthManagement.tabDatabase.id) {
                loadPinboard($scope.healthManagement.tabDatabase.guid);
            } else if (activeTab.tabId === $scope.healthManagement.tabCluster.id) {
                loadPinboard($scope.healthManagement.tabCluster.guid);
            } else if (activeTab.tabId === $scope.healthManagement.tabAlert.id) {
                loadPinboard($scope.healthManagement.tabAlert.guid);
            }
        };

        $scope.pinboardPageConfig = new PinboardPageConfig({
            disallowTileRemoval: true,
            disallowLayoutChanges: true
        });

        $scope.isRoleEnabled = sessionService.isRoleEnabled();
        $scope.isSchedulingEnabled = sessionService.isSchedulingJobEnabled();
        $scope.isA3Enabled = sessionService.isA3Enabled();

        if ($scope.isStyleCustomizationEnabled) {
            var customStylingConfig = CustomStylingService.getConfig();
            $scope.styleCustomizer = new StyleCustomizerComponent(customStylingConfig);
        }

        $scope.userListCtrl = new  UserItemListController($scope.editUser,
        null,
        listActionUtil.getAssignAction($scope));
        $scope.groupListCtrl = new GroupItemListController($scope.editGroup);




        if ($scope.isSchedulingEnabled) {
            $scope.shouldShowStatusViewer = false;
            $scope.jobsListCtrl = new AdminJobListController(function(row){
                $scope.shouldShowStatusViewer = true;
                $scope.jobStatusViewerCtrl.setJob(row);
            });
            $scope.onJobRunStatusHide = function() {
                $scope.shouldShowStatusViewer = false;
                this.jobStatusViewerCtrl.setJob(null);
            };
            $scope.jobStatusViewerCtrl = new JobStatusViewerComponent($scope.onJobRunStatusHide.bind(this));
        }


        if (sessionService.isRoleEnabled()) {
            $scope.roleListCtrl = new RoleItemListController($scope.editRole);
        }

        function syncLists() {
            $scope.userListCtrl.refreshList();
            $scope.groupListCtrl.refreshList();
        }
    }]);
