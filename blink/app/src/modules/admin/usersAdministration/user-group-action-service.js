/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Stateless service that handles CRUD action for users and groups with the backend
 * and delegates to usersService and groupsService for maintaining the state of the
 * users and groups list on the front end
 *
 */

'use strict';

blink.app.factory('userGroupActionService', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'groupsCacheService',
    'Logger',
    'rolesCacheService',
    'sessionService',
    'UserAction',
    'userAdminService',
    'UserModel',
    'usersCacheService',
    'util',
    function ($q,
          alertService,
          blinkConstants,
          strings,
          groupsService,
          Logger,
          rolesCacheService,
          sessionService,
          UserAction,
          userAdminService,
          UserModel,
          usersCacheService,
          util) {

        var _logger = Logger.create('user-group-action-service');

    //region private methods

    /**
     *
     * This method is used to update the users after a group has been updated by the backend
     * It removes or adds the updated group to the users that have been affected by the changes
     *
     * @param {GroupModel} group
     * @param {Array<string>} usersIds
     */
        function updateGroupMembership(group, updatedUserIdList) {
            _logger.log('will update users from group', group);
            if (!updatedUserIdList) {
                return;
            }

            var usersMap = util.mapArrayToBooleanHash(updatedUserIdList),
                groupId = group.getId();

            usersCacheService.getUsers().forEach(function(user) {
                var isUserInGroup = !!usersMap[user.getId()],
                    wasUserInGroup = user.hasGroup(groupId);

                if (isUserInGroup == wasUserInGroup) {
                    return;
                }
                if (isUserInGroup) {
                    user.addToGroups([groupId]);
                } else {
                    user.removeFromGroups([groupId]);
                }
            });
        }

    /**
     *
     * Generate copy of given users, with the passed groups added.
     *
     * @param {Array<UserModel>} users
     * @param {Array<string>} groupsId - id of groups to add to users
     * @returns {Array<UserModel>}
     */
        function generateTransientUsersWithAddedGroups(users,groupsId) {

            return users.map(function(userModel) {
                var transientUser = angular.copy(userModel);
                transientUser = UserModel.prototype.addToGroups.call(transientUser, groupsId);
                return transientUser.getJson();
            });
        }

    /**
     * Returns the appropriate object for the backend
     *
     * @param {Object} editedUserViewModel
     * @returns UserModel
     */
        function generateTransientUserWithUpdateProperties(editedUserViewModel) {
            var user = angular.copy(editedUserViewModel.source);
            user.mergeViewModel(editedUserViewModel);
            return user;
        }

        function generateTransientRoleWithUpdateProperties(editedRoleViewModel) {
            var role = angular.copy(rolesCacheService.source);
            role.mergeViewModel(editedRoleViewModel);
            return role;
        }

    /**
     * Returns the appropriated object for the backend
     *
     * @params editedGroupViewModel
     * @returns GroupModel
     */
        function generateTransientGroupForSave(editedGroupViewModel) {
            var group = angular.copy(editedGroupViewModel.source);
            group.mergeViewModel(editedGroupViewModel);
            return group;
        }
    //endregion

    /**
     * Fetch user, roles and groups from backend
     *
     * @param {boolean} flag for fetching role
     * @returns {Promise<Array<Array>>}
     */
        function syncUsersAndGroupsAndRoles(fetchRole) {
            var syncUsersPromise = usersCacheService.syncFromBackend(),
                syncGroupsPromise = groupsService.syncFromBackend();
            var promises = [syncUsersPromise, syncGroupsPromise];

            if (!!fetchRole) {
                promises.push(rolesCacheService.syncFromBackend());
            }

            return util.getAggregatedPromise(promises).then(function(response){

                var lists =  {
                    users: response[0],
                    groups: response[1]
                };

                if (fetchRole) {
                    lists.roles = response[2];
                }

                return lists;
            });
        }

    /**
     *
     * @params {*} editedRoleViewModel
     * @returns {Promise<UserModel>}
     *
     */
        function saveRole(editedRoleViewModel) {
            if (!editedRoleViewModel.id) {
                return createNewRole(editedRoleViewModel);
            } else {
                return updateRole(editedRoleViewModel);
            }
        }

        function createNewRole(editedRoleViewModel) {
            var createRoleAction = new UserAction(UserAction.CREATE_ROLE);
            var createRolePromise = userAdminService.createRole(
            editedRoleViewModel.displayName,
            editedRoleViewModel.name,
            editedRoleViewModel.description);
            return createRolePromise.then(
            function(response) {
                var roleJson = response.data;
                roleJson.groupIds = editedRoleViewModel.groups;
                roleJson.userIds = editedRoleViewModel.users;
                return roleJson;
            }).then(_updateRole)
            .then(function(response) {
                alertService.showUserActionSuccessAlert(createRoleAction, response);
            }, handleFailureFunction(createRoleAction)
        );
        }

        function updateRole(editedRoleViewModel) {
            var transientRole = generateTransientRoleWithUpdateProperties(editedRoleViewModel);
            var userAction = new UserAction(UserAction.UPDATE_ROLE);

            return _updateRole(transientRole.getJson()).then(
            function(response) {
                alertService.showUserActionSuccessAlert(userAction, response);
                return transientRole;
            }, handleFailureFunction(userAction)
        );
        }

        function _updateRole(roleJson) {
            return userAdminService.updateRole(roleJson.header.id, roleJson);
        }

    /**
     *
     * @param {string} id
     * @param {string} displayName
     * @param {string} name
     * @param {string} email
     * @param {string} password
     * @param {Array<string>} groups - array of groups ids
     * @param {Array<string>} groups - array of roles
     *
     * @returns {Promise<UserModel>}
     *
     */
        function saveUser(editedUserViewModel) {
            if (!editedUserViewModel.id) {
                return createNewUser(editedUserViewModel);
            } else {
                return updateUser(editedUserViewModel);
            }
        }

        function createNewUser(editedUserViewModel) {
            var properties = {};
            properties[strings.userPropertiesKeys.EMAIL] = editedUserViewModel.email;
            var displayName = editedUserViewModel.displayName,
                name = editedUserViewModel.name,
                password = editedUserViewModel.password,
                groups = editedUserViewModel.groupIds,
                roles = editedUserViewModel.roleIds;
            var createUserAction = new UserAction(UserAction.CREATE_USER);
            var createUserPromise = userAdminService.createUser(displayName, name, password, properties, groups, roles);

            return createUserPromise.then(
            function(response) {
                alertService.showUserActionSuccessAlert(createUserAction, response);
                var userJson = response.data;
                userJson.assignedRoles = roles;
                return userJson;
            }).then(function(userJson) {
                _updateUser(userJson, password);
            }).then(function(response) {
                alertService.showUserActionSuccessAlert(createUserAction, response);
            }, handleFailureFunction(createUserAction)
        );
        }

        function updateUser(editedUserViewModel) {

            var transientUser = generateTransientUserWithUpdateProperties(editedUserViewModel);
            var updateUserAction = new UserAction(UserAction.UPDATE_USER);
            var updateUserPromise = _updateUser(transientUser.getJson(), editedUserViewModel.password);

            return updateUserPromise.then(
            function(response) {
                alertService.showUserActionSuccessAlert(updateUserAction, response);
            }, handleFailureFunction(updateUserAction)
        );
        }

        function _updateUser(userJson, pwd) {
            return userAdminService.updateUser(userJson.header.id, userJson, pwd);
        }

    /**
     *
     * @param {Array<UserModel>} users - Users to delete
     *
     * @returns {Promise}
     *
     */
        function deleteUsers(users) {

            var usersId = users.map(function(user) {
                return user.getId();
            });

            var deleteUsersAction = new UserAction(UserAction.DELETE_USERS);

            return userAdminService.deleteUsers(usersId).then(function(response) {
                alertService.showUserActionSuccessAlert(deleteUsersAction, response);
                usersCacheService.deleteUsers(usersId);
            }, handleFailureFunction(deleteUsersAction));
        }

    /**
     *
     * @param {Array<GroupModel>} groups
     *
     * @returns {Promise}
     *
     */
        function deleteGroups(groups) {

            var groupsId = groups.map(function(group){ return group.getId();});
            var deleteGroupsAction = new UserAction(UserAction.DELETE_GROUPS);

            return userAdminService.deleteGroups(groupsId).then(function(response) {
                alertService.showUserActionSuccessAlert(deleteGroupsAction, response);
                groupsService.deleteGroups(groupsId);
            }, handleFailureFunction(deleteGroupsAction));
        }

    /**
     *
     * @param {Array<RoleModel>} roles
     *
     * @returns {Promise}
     *
     */
        function deleteRoles(roles) {

            var rolesIds = roles.map(function(role){ return role.getId();});
            var deleteRolesAction = new UserAction(UserAction.DELETE_GROUPS);

            return userAdminService.deleteRoles(rolesIds).then(function(response) {
                alertService.showUserActionSuccessAlert(deleteRolesAction, response);
            }, handleFailureFunction(deleteRolesAction));
        }

    /**
     *
     * @param {Array<UserModel>} users
     * @param {Array<string>}    groupsIds
     *
     * @returns {Promise}
     */
        function addGroupsToUsers(users, groupsIds) {

            var transientUsers = generateTransientUsersWithAddedGroups(users, groupsIds);
            var updateUserAction = new UserAction(UserAction.UPDATE_USERS);

            return userAdminService.updateUsers(transientUsers)
            .then(function(response) {
                users.forEach(function (userModel) {
                    userModel.addToGroups(groupsIds);
                });
                alertService.showUserActionSuccessAlert(updateUserAction, response);
            }, handleFailureFunction(updateUserAction)
        );
        }

    /**
     *
     * @param {*} editedGroupViewModel
     *
     * @returns {Promise<GroupModel>}
     */

        function saveGroup(editedGroupViewModel) {
        // a group without id is a new group
            if (!editedGroupViewModel.id) {
                return createNewGroup(editedGroupViewModel);
            } else {
                return updateGroup(editedGroupViewModel);
            }
        }

        function createNewGroup(editedGroupViewModel) {

            var createGroupAction = new UserAction(UserAction.CREATE_GROUP);
            var createGroupPromise = userAdminService.createGroup(editedGroupViewModel.name,
            editedGroupViewModel.displayName,
            editedGroupViewModel.description,
            editedGroupViewModel.privileges);
            var users = editedGroupViewModel.userIds;
            var roles = editedGroupViewModel.roleIds;
            var groups = editedGroupViewModel.groupIds;
            var freshGroup;

            return createGroupPromise.then(
            function (response) {
                var groupJson = response.data;
                freshGroup = groupsService.addGroup(groupJson);
                groupJson.assignedRoles = roles;
                return userAdminService.updateGroup(groupJson.header.id, groupJson);
            }).then(function() {
                return userAdminService.assignUsersToGroup(users, freshGroup.getId());
            }).then(function() {
                updateGroupMembership(freshGroup, users);
                return userAdminService.assignGroupsToGroup(groups, freshGroup.getId());
            }).then(function(response) {
                alertService.showUserActionSuccessAlert(createGroupAction, response);
                return freshGroup;
            }, handleFailureFunction(createGroupAction)
        );
        }

        function updateGroup(editedGroupViewModel) {

            var transientGroup =  generateTransientGroupForSave(editedGroupViewModel);
            var updateGroupAction = new UserAction(UserAction.UPDATE_GROUP);
            var id = editedGroupViewModel.id;

        // Note (chab): callosum does not allow to update systemPrincipal groups,
        // but we want to allow administrators to add users and groups such groups,
        // so we bypass the update request in case of systemPrincipal group

            var updateGroupPromise = !transientGroup.isSystemPrincipal() ?
            userAdminService.updateGroup(id, transientGroup.getJson()).then(function(response) {
                return response.data;
            }) :
            $q.when(transientGroup.getJson());

            return updateGroupPromise.then(function() {

                return userAdminService.assignUsersToGroup(editedGroupViewModel.userIds, id);
            }).then(function(){
                return userAdminService.assignGroupsToGroup(editedGroupViewModel.groupIds, id);
            }).then(function(response){
                alertService.showUserActionSuccessAlert(updateGroupAction, response);
                return transientGroup;
            }, handleFailureFunction(updateGroupAction));
        }

    /**
     *
     * Private function that generates a failure handler
     *
     * @param userAction
     * @returns {Function}
     */

        function handleFailureFunction(userAction) {
            return function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            };
        }

    /**
     * Delegates to groupsCacheService
     *
     * @param groupModel
     * @returns {{key: string, label: string, isEnabled: boolean}}
     */
        function getExposedGroupPrivileges(groupModel) {
            return groupsService.getExposedGroupPrivileges(groupModel);
        }

    /**
     * Delegates to usersCacheService
     *
     * @param groupModel
     * @returns {Array.<string>}
     */
        function getUsersIdsForGroup(groupModel) {
            return usersCacheService.getUsersIdsForGroup(groupModel);
        }

        function invalidateCache() {
            usersCacheService.invalidate();
            groupsService.invalidate();
        }

        return {
            addGroupsToUsers: addGroupsToUsers,
            deleteGroups: deleteGroups,
            deleteRoles: deleteRoles,
            deleteUsers: deleteUsers,
            getExposedGroupPrivileges: getExposedGroupPrivileges,
            getUsersIdsForGroup: getUsersIdsForGroup,
            invalidateCache: invalidateCache,
            saveGroup: saveGroup,
            saveRole: saveRole,
            saveUser: saveUser,
            syncUsersAndGroupsAndRoles: syncUsersAndGroupsAndRoles
        };
    }]);
