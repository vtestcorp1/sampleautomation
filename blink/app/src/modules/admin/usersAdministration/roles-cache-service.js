/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This service cache a list of roles that it gets
 * from the backend. State is not maintained
 *
 */

'use strict';

blink.app.factory('rolesCacheService', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'Logger',
    'userAdminService',
    'RoleModel',
    'UserAction',
    'util',
    function ($q,
          alertService,
          blinkConstants,
          strings,
          Logger,
          userAdminService,
          RoleModel,
          UserAction,
          util) {

        var roles = [], rolesTable = {};
        var _logger = Logger.create('roles-cache-service');

        // private methods
        function fetchRoles() {
            var userAction = new UserAction(UserAction.FETCH_ROLES_LIST);
            return userAdminService.getRolesList().then(function (response) {
                var roleList = response.data;
                return roleList;
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        function roleComparator(roleA, roleB) {
            var displayedNameA = roleA.getName().toLowerCase();
            var displayedNameB = roleB.getName().toLowerCase();

            if (displayedNameA < displayedNameB) {
                return -1;
            }
            if (displayedNameA > displayedNameB) {
                return 1;
            }

            var idA = roleA.getId();
            var idB = roleB.getId();

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
        function syncFromBackend() {
            return fetchRoles().then(function (fetchedRoles) {
                roles = fetchedRoles.sort(roleComparator);
                roles.forEach(function (d) {
                    rolesTable[d.getId()] = d;
                });
                return roles;
            });
        }


        function invalidateCache() {
            roles = [];
            rolesTable = {};
        }

        /**
         * @params {string} userId
         * @returns {UserModel} User
         */
        function getRoleById(roleId) {
            return rolesTable[roleId];
        }

        /**
         * @returns Array{UserModel}
         */
        function getRoles() {
            return roles;
        }

        // NOTE(chab) Currently we do not maintain state and relationships between users, groups, and roles
        // We fetch back the JSON of all these guys after all CRUD operations,
        // so we do not need to care about updating role and relationships on client after such operation

        return {
            getRoles: getRoles,
            getRoleById: getRoleById,
            invalidate: invalidateCache,
            syncFromBackend: syncFromBackend
        };
    }
]);


