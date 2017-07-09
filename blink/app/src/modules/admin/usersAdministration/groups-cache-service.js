/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Service that maintains a list of groups and update its state as needed
 *
 * Group JSON have no users array from the backend, so we should reconstruct manually the relation
 * between the two via this service.
 *
 */

'use strict';


blink.app.factory('groupsCacheService', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'Command',
    'GroupModel',
    'jsonConstants',
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
          Command,
          GroupModel,
          jsonConstants,
          sessionService,
          UserAction,
          userAdminService,
          UserModel,
          userCacheService,
          util) {

        var exposedGroupPrivileges = [
            {
                key: jsonConstants.privilegeType.ADMINISTRATION,
                label: strings.privilegesLabels.ADMINISTRATION,
            },
            {
                key: jsonConstants.privilegeType.USERDATAUPLOADING,
                label: strings.privilegesLabels.USERDATAUPLOADING
            },
            {
                key: jsonConstants.privilegeType.DATADOWNLOADING,
                label: strings.privilegesLabels.DATADOWNLOADING
            },
            {
                key: jsonConstants.privilegeType.SHAREWITHALL,
                label: strings.privilegesLabels.SHAREWITHALL
            },
            {
                key: jsonConstants.privilegeType.DATAMANAGEMENT,
                label: strings.privilegesLabels.DATAMANAGEMENT
            }
            ],
            defaultGroupPrivileges = [jsonConstants.privilegeType.USERDATAUPLOADING,
                jsonConstants.privilegeType.DATADOWNLOADING];

        if (sessionService.isSchedulingJobEnabled()) {
            exposedGroupPrivileges.push({
                key: jsonConstants.privilegeType.JOBSCHEDULING,
                label: strings.privilegesLabels.JOBSCHEDULING
            })
        }

        if (sessionService.isA3Enabled()) {
            exposedGroupPrivileges.push({
                key: jsonConstants.privilegeType.A3ANALYSIS,
                label: strings.privilegesLabels.A3ANALYSIS
            })
        }

    // TODO(chabbey) implement a sorted set data structure to get rid of the array
        var groups = [], groupIdToGroupMap = {};

        function groupComparator(groupA, groupB) {

            var nameA = groupA.getName();
            var nameB = groupB.getName();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
        // this should not happen has names are guarantees to be unique

            var idA = groupA.getId();
            var idB = groupB.getId();

            if (idA < idB) {
                return -1;
            }
            if (idA > idB) {
                return 1;
            }
            return 0;
        }


    /**
     *
     * @returns {promise} Promise is resolved when requests are done
     *
     */
        function syncFromBackend() {
            invalidate();
            return fetchGroups().then(function(_groups) {
                _groups.forEach(function (d) {
                    groupIdToGroupMap[d.getId()] = d;
                });
                groups = _groups;
                return _groups;
            });
        }

    /**
     *
     * @param {GroupModel} group
     *
     * @return {GroupModel} The updated group from the cache
     */
        function updateGroup(group) {
            var groupFromCache = groupIdToGroupMap[group.getId()];
            groupFromCache.update(group);
        // groups array must stay ordered
            groups.remove(groupFromCache);
            util.binaryInsert(groupFromCache, groups, groupComparator);
            return groupFromCache;
        }

    /**
     * Clear cache data.
     *
     */

        function invalidate() {
            groups = [];
            groupIdToGroupMap = {};
        }

    /**
     *
     * @returns {Array<GroupModel>}
     */
        function getGroups() {
            return groups;
        }

    /**
     * @params {string} groupId
     *
     * @returns {GroupModel}
     */
        function getGroupById(groupId) {
            return groupIdToGroupMap[groupId];
        }

    /**
     *
     * @param {object} group - JSON object from the backend
     */
        function addGroup(groupJson) {
            var group = new GroupModel(groupJson);
            util.binaryInsert(group, groups, groupComparator);
            groupIdToGroupMap[group.getId()] = group;
            return group;
        }

    /**
     *
     * @param {string} groupId
     */
        function deleteGroup(id) {
            if (!Object.has(groupIdToGroupMap, id)) {
                return;
            }
            var group = groupIdToGroupMap[id];
        // remove group for affected users
            userCacheService.getUsers().each(function(user){
                if (user.hasGroup(id)) {
                    user.removeFromGroups([id]);
                }
            });

        // remove group from list and map
            groups.remove(group);
            delete groupIdToGroupMap[id];
        }

    /**
     *
     * @param {Array<string>} groupsIds
     */
        function deleteGroups(groupsIds) {
            groupsIds.forEach(function(groupId){
                deleteGroup(groupId);
            });
        }

    /**
     * Returns the group privileges we want to expose to users as an array of objects
     *
     * @return {{key:string, label:string, isEnabled:boolean }}[]
     */
        function getExposedGroupPrivileges(groupModel) {
            var privileges = angular.copy(exposedGroupPrivileges);

            privileges.forEach(function (privilege) {
                if(groupModel) {
                // If a group model is provided, set the isEnabled properties
                // to reflect the privileges stored in the model
                    privilege.isEnabled = groupModel.hasPrivilege(privilege.key);
                } else {
                // Enable some privileges by default
                    privilege.isEnabled = defaultGroupPrivileges.some(privilege.key);
                }
            });

            return privileges;
        }

        function fetchGroups() {
            var userAction = new UserAction(UserAction.FETCH_GROUPS_LIST);
            return userAdminService.getGroupList().then(function (response) {
                var groupList = response.data;
                return groupList.sort(groupComparator);
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        return {
            addGroup: addGroup,
            deleteGroups: deleteGroups,
            deleteGroup: deleteGroup,
            getExposedGroupPrivileges: getExposedGroupPrivileges,
            getGroupById: getGroupById,
            getGroups: getGroups,
            invalidate: invalidate,
            syncFromBackend: syncFromBackend,
            updateGroup: updateGroup
        };
    }]);
