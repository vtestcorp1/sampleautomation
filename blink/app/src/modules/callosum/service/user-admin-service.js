/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com), Francois Chabbey (francois@thoughtspot.com)
 *
 * @fileoverview Service for user and group admin functionality
 */

'use strict';

blink.app.factory('userAdminService', ['$q',
    'Command',
    'util',
    'UserModel',
    'GroupModel',
    'metadataService',
    'RoleModel',
    'sessionService',
    'jsonConstants',
    'blinkConstants',
    'strings',
    function ($q,
              Command,
              util,
              UserModel,
              GroupModel,
              metadataService,
              RoleModel,
              sessionService,
              jsonConstants,
              blinkConstants, strings) {
        /* eslint camelcase: 1, no-undef: 0 */

        /**
         * Get the list of all users
         *
         * @return {object}  A promise
         */
        function getUserList() {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/list');

            command.execute()
                .then(function (response) {
                    response.data = response.data.map(function (userJson) {
                        return new UserModel(userJson);
                    });
                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        /**
         * Get the list of all groups
         *
         * @param  {boolean} includeAllGroup  Whether to include the ALL group
         * @return {object}                   A promise
         */
        function getGroupList(includeAllGroup) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/group/list');

            command.execute()
                .then(function (response) {
                    var data = response.data;
                    if (!includeAllGroup) {
                        // Filter out the ALL group
                        data = data.filter(function (group) {
                            return group.header.id != blinkConstants.ALL_GROUP_GUID;
                        });
                    }
                    data = data.map(function (groupJson) {
                        return new GroupModel(groupJson);
                    });
                    response.data = data;
                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        /**
         * Return an object containing two properties, "users" and "groups",
         * that together contain all user and group models in the system.
         * The list includes the ALL group.
         *
         *
         * @return {object}  A promise
         */
        function getUserAndGroupLists() {
            var promisesArray = [getUserList(), getGroupList(true)];

            return util.getAggregatedPromise(promisesArray).then(function(response) {
                return {
                    users: response[0],
                    groups: response[1]
                };
            });
        }

        /**
         * @param {string} displayName
         * @param {string} userName
         * @param {string} password
         * @param {Object} userProperties
         * @param {Array.<string>} groupIds
         * @param {Array.<string>} roleIds
         */
        function createUser(displayName, userName, password, userProperties, groupIds, roleIds) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/create')
                .setPostMethod()
                .setPostParams({
                    name: userName,
                    password: password,
                    displayname: displayName,
                    properties: JSON.stringify(userProperties),
                    groups: JSON.stringify(groupIds),
                    roles: JSON.stringify(roleIds)
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * @param {string} userId
         * @param {Object} contentJson
         */
        function updateUser(userId, contentJson, password) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/update')
                .setPostMethod()
                .setPostParams({
                    userid: userId,
                    content: JSON.stringify(contentJson),
                    password: password
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * @param {Array.<Object>} contentJSONs
         */
        function updateUsers(contentJSONs) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/updateusers')
                .setPostMethod()
                .setPostParams({
                    contentlist: JSON.stringify(contentJSONs)
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * Update the password for a certain user
         * @param {string} userId          The guid of the user
         * @param {string} currentPassword The current password
         * @param {string} password        The new password
         * @return {Object}                Promise
         */
        function updatePassword(userId, currentPassword, password) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/updatepassword')
                .setPostMethod()
                .setPostParams({
                    userid: userId,
                    currentpassword: currentPassword,
                    password: password
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * Updates the slack id for a certain user.
         *
         * @param userId
         * @param slackId
         * @returns {deferred.promise|{then, always}}
         */
        function updateSlackId(userId, slackId) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/updateslackid')
                .setPostMethod()
                .setPostParams({
                    userid: userId,
                    slackid: slackId
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * Update the exposed user preferences for current user
         * @param {Object} exposedUserPreferences   Map of exposed user preferences key-value
         * @return {Object}                         Promise
         */
        function updateExposedUserPreferences(exposedUserPreferences) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/updatepreference')
                .setPostMethod()
                .setPostParams({
                    userid: sessionService.getUserGuid(),
                    preferences: JSON.stringify(exposedUserPreferences)
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * Update the exposed user preferences for current user
         * @param {Object} preferenceProtoObj   Preference proto object
         * @return {Object}                         Promise
         */
        function updateUserPreferenceProto(preferenceProtoObj) {
            var encodedString = preferenceProtoObj.encode64();
            sessionService.setUserPreferenceProto(encodedString);
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/updatepreference')
                .setPostMethod()
                .setPostParams({
                    userid: sessionService.getUserGuid(),
                    preferencesProto: encodedString
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * Update the password for the current user
         * @param {string} currentPassword  The current password
         * @param {string} password         The new password
         * @return {Object}                 Promise
         */
        function updateCurrentUserPassword(currentPassword, password) {
            var userId = sessionService.getUserGuid();
            return updatePassword(userId, currentPassword, password);
        }

        /**
         * Updates the slackId for the current user.
         *
         * @param slackId
         * @returns {deferred.promise|{then, always}}
         */
        function updateCurrentUserSlackId(slackId) {
            var userId = sessionService.getUserGuid();
            return updateSlackId(userId, slackId);
        }

        /**
         * @param {string} userId
         */
        function deleteUser(userId) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/delete/' + userId)
                .setDeleteMethod();

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * @param {Array.<string>} userIds
         */
        function deleteUsers(userIds) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/user/deleteusers')
                .setPostMethod()
                .setPostParams({
                    ids: JSON.stringify(userIds)
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * @param {string} name         The group name
         * @param {string} displayName  The group display name
         * @param {string} description  The group description
         * @param {Array}  privileges   The group privileges
         */

        function createGroup(name, displayName, description, privileges) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/group/create')
                .setPostMethod()
                .setPostParams({
                    name: name,
                    display_name: displayName,
                    description: description,
                    privileges: JSON.stringify(privileges)
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * @param {Array.<string>} groupIds
         */
        function deleteGroups(groupIds) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/group/deletegroups')
                .setPostMethod()
                .setPostParams({
                    ids: JSON.stringify(groupIds)
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * @param {string} groupId
         * @param {Object} contentJson
         */
        function updateGroup(groupId, contentJson) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/group/update')
                .setPostMethod()
                .setPostParams({
                    groupid: groupId,
                    content: JSON.stringify(contentJson)
                });

            command.run(deferred);
            return deferred.promise;
        }

        /**
         * @param {string} groupId
         */
        function deleteGroup(groupId) {
            var deferred = $q.defer();
            var command = new Command()
                .setPath('/session/group/delete/' + groupId)
                .setDeleteMethod();

            command.run(deferred);
            return deferred.promise;
        }
        /**
         * @param {string} userId
         * @param {string} groupId
         * @return {Object} Promise
         */
        function removeUserFromGroup(userId, groupId) {
            var command = new Command()
                .setPath('/session/group/removeuser')
                .setPostMethod()
                .setPostParams({
                    groupid: groupId,
                    userid: userId
                });

            return command.execute();
        }

        /**
         * @param {string} userId
         * @param {string} groupId
         * @return {Object} Promise
         */
        function addUserToGroup(userId, groupId) {
            var command = new Command()
                .setPath('/session/group/adduser')
                .setPostMethod()
                .setPostParams({
                    groupid: groupId,
                    userid: userId
                });
            return command.execute();
        }

        /**
         * @param {Array<string>} usersIds
         * @param {string} groupId
         */
        function assignUsersToGroup(usersIds, groupId) {
            var command = new Command()
                .setPath('/session/group/updateusersingroup')
                .setPostMethod()
                .setPostParams({
                    groupid: groupId,
                    userids: JSON.stringify(usersIds)
                });

            return command.execute();
        }


        /**
         * @param {Array<string>} groupsIds
         * @param {string} groupId
         * @returns {*}
         */
        function assignGroupsToGroup(groupsIds, groupId) {

            var command = new Command()
                .setPath('/session/group/updategroupsingroup')
                .setPostMethod()
                .setPostParams({
                    principalids: JSON.stringify(groupsIds),
                    groupid: groupId
                });

            return command.execute();
        }

        /**
         *
         * @param {string} groupId
         * @returns {*}
         */
        function getGroupsForGroup(groupId) {
            var command = new Command()
                .setPath('/session/group/listgroup/' + groupId);

            return command.execute();
        }
        /**
         *
         * @returns {IPromise<Array<RoleModel>>}
         */
        function getRolesList() {

            var command = new Command()
                .setPath('/role/list');
            var deferred = $q.defer();

            command.execute()
                .then(function (response) {
                    response.data = response.data.map(function (userJson) {
                        return new RoleModel(userJson);
                    });
                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        /**
         *
         * @param {string} displayName
         * @param {string} name
         * @param {string} description
         * @returns {IPromise<T>}
         */
        function createRole(displayName, name, description) {

            var deferred = $q.defer();
            var command = new Command()
                .setPath('/role/create')
                .setPostMethod()
                .setPostParams({
                    name: name,
                    description: description,
                    display_name: displayName
                });

            return command.execute();
        }

        /**
         *
         * @param {string} id
         * @param {*} contentJson
         * @returns {IPromise<T>}
         */
        function updateRole(id, contentJson) {
            var command = new Command()
                .setPath('/role/update')
                .setPostMethod()
                .setPostParams({
                    id: id,
                    content: JSON.stringify(contentJson)
                });

            return command.execute();
        }

        /**
         *
         * @param {string} groupId
         * @returns {*}
         */
        function getUsersForGroup(groupId) {
            var command = new Command()
                .setPath('/session/group/listuser/' + groupId);

            return command.execute();
        }

        /**
         *
         * @param {string} userId
         * @returns {*}
         */
        function getGroupsForUser(userId) {
            var command = new Command()
                .setPath('/session/user/listgroup/' + userId);

            return command.execute();
        }

        /**
         *
         * @param {Array<String>} roleIds
         * @returns {IPromise<T>}
         */
        function deleteRoles(roleIds) {
            var command = new Command()
                .setPath('/role/delete')
                .setPostMethod()
                .setPostParams({
                    ids: JSON.stringify(roleIds)
                });

            return command.execute();
        }

        /**
         *
         * @param {Array<String>} principalIds
         * @param {string} id
         * @returns {IPromise<T>}
         */
        function assignPrincipalsToRole(principalIds, id) {
            var command = new Command()
                .setPath('  /role/updateprincipals')
                .setPostMethod()
                .setPostParams({
                    principalids: JSON.stringify(principalIds, id),
                    id: id
                });

            return command.execute();
        }

        /**
         *
         * @param {string} id
         * @returns {IPromise<GroupModel>}
         *
         */
        function getGroup(id) {
            var type = jsonConstants.metadataType.GROUP;
            return metadataService.getMetadataDetails(type, [id], true).then(function(response){
                return new GroupModel(response.data.storables[0]);
            });
        }
        /**
         *
         * @param {string} id
         * @returns {IPromise<UserModel>}
         *
         */
        function getUser(id) {
            var type = jsonConstants.metadataType.USER;
            return metadataService.getMetadataDetails(type, [id], true)
                .then(function(response){
                    return new UserModel(response.data.storables[0]);
                });
        }

        /**
         *
         * @param {Array} id
         * @returns {IPromise<UserModel>}
         *
         */
        function getUsers(id) {
            var type = jsonConstants.metadataType.USER;
            return metadataService.getMetadataDetails(type, id, true)
                .then(function(response){
                    return response.data.storables.map(function(json){
                        return new UserModel(json);
                    });
                });
        }

        /**
         *
         * @param {string} id
         * @returns {IPromise<RoleModel>}
         *
         */
        function getRole(id) {
            var type = jsonConstants.metadataType.ROLE;
            return metadataService.getMetadataDetails(type, [id], true)
                .then(function(response){
                    return new RoleModel(response.data.storables[0]);
                });
        }

        return {
            addUserToGroup: addUserToGroup,
            assignGroupsToGroup: assignGroupsToGroup,
            assignPrincipalsToRole: assignPrincipalsToRole,
            assignUsersToGroup: assignUsersToGroup,
            createUser: createUser,
            createGroup: createGroup,
            createRole: createRole,
            deleteGroup: deleteGroup,
            deleteGroups: deleteGroups,
            deleteRoles: deleteRoles,
            deleteUser: deleteUser,
            deleteUsers: deleteUsers,
            getGroupsForGroup: getGroupsForGroup,
            getGroup: getGroup,
            getGroupsForUser: getGroupsForUser,
            getUsersForGroup: getUsersForGroup,
            getUser: getUser,
            getUsers: getUsers,
            getGroupList: getGroupList,
            getRole: getRole,
            getRolesList: getRolesList,
            getUserAndGroupLists: getUserAndGroupLists,
            getUserList: getUserList,
            removeUserFromGroup: removeUserFromGroup,
            updateCurrentUserPassword: updateCurrentUserPassword,
            updateCurrentUserSlackId: updateCurrentUserSlackId,
            updateExposedUserPreferences: updateExposedUserPreferences,
            updateGroup: updateGroup,
            updateRole: updateRole,
            updateUser: updateUser,
            updateUsers: updateUsers,
            updateUserPreferenceProto: updateUserPreferenceProto
        };
    }
]);
