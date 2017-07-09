/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This service cache a list of users that it gets
 * from the backend and maintains its state.
 *
 *
 */

'use strict';

blink.app.factory('usersCacheService', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'Logger',
    'UserAction',
    'userAdminService',
    'UserModel',
    'util',
    function ($q,
          alertService,
          blinkConstants,
          strings,
          Logger,
          UserAction,
          userAdminService,
          UserModel,
          util) {

    // user has groups in json
    // group does not have users in json

        var users = [], usersTable = {};
        var _logger = Logger.create('users-cache-service');


    // private methods
        function fetchUsers() {
            var userAction = new UserAction(UserAction.FETCH_USERS_LIST);
            return userAdminService.getUserList().then(function(response) {
                var userList = response.data;
                return  userList.sort(userComparator);
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        function userComparator(userA, userB) {
            var displayedNameA = userA.getDisplayName().toLowerCase();
            var displayedNameB = userB.getDisplayName().toLowerCase();

            if (displayedNameA < displayedNameB) {
                return -1;
            }
            if (displayedNameA > displayedNameB) {
                return 1;
            }
        // fall back to name if displayed name are equals
            var nameA = userA.getName();
            var nameB = userB.getName();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

        // this should not happen, as names are guaranteed to be unique
            _logger.warn('Two users have got same name, fall back to guid');
            var idA = userA.getId();
            var idB = userB.getId();

            if (idA < idB) {
                return -1;
            }
            if (idA > idB) {
                return 1;
            }
            return 0;
        }

    /**
     * Refresh service state from backend
     *
     * @return {promise}
     */
        function  syncFromBackend() {
            return fetchUsers().then(function(fetchedUsers) {
                users = fetchedUsers;
                users.forEach(function (d) {
                    usersTable[d.getId()] = d;
                });
                return fetchedUsers;
            });
        }


        function invalidateCache() {
            users = [];
            usersTable = {};
        }

    /**
     * @params {string} userId
     * @returns {UserModel} User
     */
        function getUserById(userId) {
            return usersTable[userId];
        }

    /**
     * @returns Array{UserModel}
     */
        function getUsers() {
            return users;
        }

    /**
     *
     * Add an user to the cached users
     *
     * @param {Object} userJson
     * @return {UserModel}
     */
        function addUser(userJson) {
            var user = new UserModel(userJson);
        // name is unique for user, but not display name, this prevents the binary insertion
        // from inserting element when a user with similar display name already exists
            util.binaryInsert(user, users, userComparator);
            usersTable[user.getId()] = user;
            return user;
        }

    /**
     * Update a given user in the cache
     *
     * @param {UserModel} user
     * @return {UserModel}
     */
        function updateUser(user) {
            var cachedUser = usersTable[user.getId()];
            cachedUser.update(user);
        // users array must stay ordered, see comment above
            users.remove(cachedUser);
            util.binaryInsert(cachedUser, users, userComparator);
            return cachedUser;
        }

    /**
     * @param {string} userId
     */
        function deleteUser(userId) {
            var user = usersTable[userId];
            if (!user) {
                return;
            }
            users.remove(user);
            delete usersTable[userId];
        }

    /**
     * @param {Array<string>} usersIds
     */
        function deleteUsers(usersIds) {
            usersIds.forEach(function(userId){
                deleteUser(userId);
            });
        }

    /**
     * @param {GroupModel} group
     * @return {Array<string>}
     *
     */
        function getUsersIdsForGroup(group) {
            var groupId = group.getId();
            return users.filter(function(user){
                return user.hasGroup(groupId);
            }).map(function(user) {
                return user.getId();
            });
        }

    /**
     * @param  {string} userId
     * @return {string}
     */
        function getUserName(userId) {
            var user = getUserById(userId);
            if (user) {
                return  user.getName();
            } else {
                return null;
            }
        }

    /**
     * @param  {string} userId
     * @return {string}
     */
        function getUserDisplayName(userId) {
            var user = getUserById(userId);
            if (user) {
                return user.getDisplayName();
            } else {
                return null;
            }
        }

        return {
            addUser: addUser,
            deleteUser: deleteUser,
            deleteUsers: deleteUsers,
            getUsers: getUsers,
            getUserById: getUserById,
            getUsersIdsForGroup: getUsersIdsForGroup,
            getUserName: getUserName,
            getUserDisplayName: getUserDisplayName,
            invalidate: invalidateCache,
            syncFromBackend: syncFromBackend,
            updateUser: updateUser
        };
    }]);
