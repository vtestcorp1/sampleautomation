/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service for Share
 */

'use strict';


var SharingReportType = {
    GROUP: 1,
    USER: 2,
    EMAIL: 3
};

blink.app.factory('shareService', ['$q',
    'alertService',
    'Logger',
    'Command',
    'userAdminService',
    'util',
    'jsonConstants',
    'MetadataCacheService',
    'metadataPermissionService',
    'metadataService',
    'sessionService',
    'UserAction',
    'metadataUtil',
    function ($q,
          alertService,
          Logger,
          Command,
          userAdminService,
          util,
          jsonConstants,
          MetadataCacheService,
          metadataPermissionService,
          metadataService,
          sessionService,
          UserAction,
          metadataUtil) {

        var me = {},
            _logger = Logger.create('share-service');

        var metadataCacheService = new MetadataCacheService();

    /**
     * Returns users and groups in the following format:
     * {
     *    1: {
     *       id: 1,
     *       name: 'First User'
     *    },
     *    2: {
     *       id: 2,
     *       name: 'First Group',
     *       isGroup: true
     *    }
     * }
     *
     * @return {Object}  All users and groups by id
     */
        function formatUsersAndGroupsById(response) {
            return response.users.concat(response.groups).reduce(function(usersAndGroupsMap, model){
                var modelId = model.getId();
                usersAndGroupsMap[modelId] = {
                    id: modelId,
                    name: model.getName(),
                    displayName: model.getDisplayName(),
                    isGroup: !!model.isGroup(),
                    sharingType: model.isGroup() ? SharingReportType.GROUP : SharingReportType.USER
                };
                return usersAndGroupsMap;
            }, {});
        }

    /**
     * Combines permissions for several shared objects into one permission object.
     * The bulkPermissions object is of the following format:
     * {
     *      <objectGuid>: {
     *          <entityId>: { shareMode: <shareMode> }
     *          <entityId>: { shareMode: <shareMode> }
     *          ...
     *      },
     *      <objectGuid>: {
     *          <entityId>: { shareMode: <shareMode> }
     *          <entityId>: { shareMode: <shareMode> }
     *          ...
     *      }
     *      ...
     * }
     *
     * The resulting permission object only lists entity ids (user or group ids), and the permission the entity has
     * accross all the shared objects. If permissions differ accross shared objects, the shareMode is set as VARIES.
     *  {
     *      <entityId>: <shareMode>
     *      <entityId>: <shareMode>
     *      ...
     *  }
     *
     * @param  {Object} bulkPermissions  The bulk permissions object
     * @return {Object}                  A promise that will resolve with the permission object
     */
        function flattenBulkPermissions(bulkPermissions) {
            var permissions = {};
            Object.keys(bulkPermissions).forEach(function (objectId, index) {
                if (!bulkPermissions[objectId]) {
                    return;
                }
                var objectPermissions = bulkPermissions[objectId].permissions || {},
                    objectPermissionEntities = Object.keys(objectPermissions);
                if (index === 0) {
                    objectPermissionEntities.forEach(function (entityId) {
                        var shareMode = objectPermissions[entityId].shareMode;
                        permissions[entityId] = shareMode;
                    });
                } else {
                    objectPermissionEntities.forEach(function (entityId) {
                        var shareMode = objectPermissions[entityId].shareMode;
                        if (permissions[entityId] != shareMode) {
                            permissions[entityId] = jsonConstants.permission.VARIES;
                        }
                    });
                    var permissionEntities = Object.keys(permissions);
                // Find entities that are in the permissions object (i.e. entity had permissions on another object) but
                // not in the current objectPermissions object (i.e. they don't have permissions to the current object).
                    var entitiesNotInObjectPermissions = permissionEntities.exclude(function (item) {
                        return objectPermissionEntities.some(item);
                    });
                // Mark all those entities as having "VARIES" permissions
                    entitiesNotInObjectPermissions.forEach(function (entityId) {
                        permissions[entityId] = jsonConstants.permission.VARIES;
                    });
                }
            });
            return permissions;
        }

    /**
     * True if the current user doesn't have MODIFY permissions for the given object
     *
     * @param  {Array}  objects  The array of shared objects
     * @param  {string} type     The type of the shared objects
     * @return {Object}          A promise
     */
        function isReadOnlyMode(objects, type) {
            var deferred = $q.defer();

            var userAction = new UserAction(metadataUtil.getPermissionUserActionForType(type));
            metadataPermissionService.getEffectivePermissions(
            objects,
            type,
            true
        ).then(function (response) {
            var bulkPermission = response.data;
            deferred.resolve(!bulkPermission.canEditObjects());
        }, function (response) {
            alertService.showUserActionFailureAlert(userAction, response);
            deferred.reject(response.data);
        });

            return deferred.promise;
        }

    /**
     * Given a permissions object and all users and groups by id, create a userPermissions array of the following format:
     * [
     *    {
     *       id: 1,
     *       name: 'First User',
     *       permissionType: 'READ_ONLY'
     *    },
     *    {
     *       id: 2,
     *       name: 'First Group',
     *       permissionType: 'MODIFY',
     *       isGroup: true
     *    }
     * ]
     *
     * @param  {Object} permissions         A permissions object
     * @param  {Object} usersAndGroups  An object containing all users and groups by id
     * @return {Array}                      A userPermissions array
     */
        function resolveUserPermissions(permissions, usersAndGroups) {
            var userPermissions = [];
            Object.keys(permissions).forEach(function (entityId) {
                var entity = angular.copy(usersAndGroups[entityId]);
                if (entity) {
                    entity.permissionType = permissions[entityId];
                    userPermissions.push(entity);
                } else {
                    _logger.warn('User or group id from permission list does not match any known user or group');
                }
            });
            return userPermissions;
        }

    /**
     * Fetch the list of columns for a given table
     *
     * @param  {string} tableId  The id of the table
     * @return {Object}          A promise
     */
        function getTableColumns(tableId) {
            var deferred = $q.defer();
            var params = {
                showHidden: sessionService.hasAdminPrivileges()
            };

            var userAction = new UserAction(UserAction.FETCH_TABLE_DETAILS);
            metadataService.getMetadataObjectDetails(
            jsonConstants.metadataType.LOGICAL_TABLE,
            tableId,
            params)
            .then(function (response) {
                var data = response.data;
                if (!data.columns) {
                    deferred.reject('No columns found in the table details.');
                    return;
                }
                deferred.resolve(data.columns);
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                deferred.reject(response.data);
            });

            return deferred.promise;
        }

    /**
     * Returns a particular user model from the list of all users
     *
     * @param  {string} id  The user id
     * @return {Object}     A promise that will resolve with the user model
     */
        me.getUser = function (id) {
            return metadataCacheService.getObject(id,
                MetadataCacheService.entityType.USER).then(function(response){
                    if (!response.users.length) {
                        return $q.reject(new Error('User not found'));
                    }
                    return response.users[0];
                });
        };

    /**
     * Return an object with all users and groups in the system.
     * If object is a table, will also return the list of columns in the tableColumns property.
     *
     * @param  {Array}   objects          An array of objects to share
     * @param  {string}  type             The type of the shared objects
     * @param  {boolean} fetchColumnData  If true, will fetch the list of columns if the object is a table
     * @param  {boolean} noUserCache      If true, force a fresh load of user and group data
     * @return {Object}                   A promise
     */
        me.getShareDialogData = function (objects, type, fetchColumnData, noUserCache) {
            var permissions, readOnlyMode, dialogData,
                permissionsUserAction = new UserAction(metadataUtil.getPermissionUserActionForType(type));

            var permissionsPromise = metadataPermissionService.getPermissions(objects, type).then(function (response) {
                    return response.data;
                }, function (response) {
                alertService.showUserActionFailureAlert(permissionsUserAction, response);
                return $q.reject(response.data);
            }),
                promises = [
                    permissionsPromise,
                    isReadOnlyMode(objects, type)
                ],
                isTable = (type == jsonConstants.metadataType.LOGICAL_TABLE),
                includeColumnData = (isTable && fetchColumnData && objects.length == 1);
            if (includeColumnData) {
                promises.push(getTableColumns(objects[0].id));
            }
        // Once all the promises are resolved, compile an object with the data we want to return
            return $q.all(promises).then(function (data) {
                permissions = flattenBulkPermissions(data[0]);
                readOnlyMode = data[1];
                dialogData = {
                    readOnlyMode: readOnlyMode
                };
                if (includeColumnData) {
                    dialogData.tableColumns = data[2];
                }

                return metadataCacheService.getObjects(Object.keys(permissions));

            }).then(function(response) {
                var usersAndGroups = formatUsersAndGroupsById(response);
                dialogData.usersAndGroups = usersAndGroups;
                dialogData.userPermissions = resolveUserPermissions(permissions, usersAndGroups);
                return dialogData;
            });
        };
        return me;
    }]);

