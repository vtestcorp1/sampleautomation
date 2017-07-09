/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 * Chabbey Francois (francois@thoughtspot.com)
 *
 * @fileoverview Metadata Permission Service
 */

'use strict';

blink.app.factory('metadataPermissionService', ['$q',
    'Command',
    'jsonConstants',
    'Logger',
    'permissionFactory',
    'sessionService',
    'util',
    function ($q,
          Command,
          jsonConstants,
          Logger,
          permissionFactory,
          sessionService,
          util) {

    /**
     * Get the list of individual and group permissions for several objects by calling the /security/definedpermission api
     *
     * @param  {Array}  objects  The array of objects for which to get permissions
     * @param  {string} type     The type of the shared objects
     * @return {Object}          A promise
     */
        function getPermissions(objects, type) {
            var  objectIds = objects.map(function (object) {
                return object.id;
            });
            var command = new Command()
            .setPath('/security/definedpermission')
            .setPostMethod()
            .setPostParams({
                id: JSON.stringify(objectIds),
                type: type
            });
            return command.execute()
            .then(function (bulkPermissions) {
                objectIds.forEach(function (objectId) {
                    bulkPermissions[objectId] = bulkPermissions[objectId] || { permissions: {} };
                });
                // TODO renenable rejection here when permissions property is sent by callosum for empty permission objects
                // deferred.reject('Permission object is not of the expected format');
                return bulkPermissions;
            }
        );
        }

    /**
     * Save permissions to the server, for one or multiple objects
     *
     * @param  {Array}  objectIds    The list of ids for the objects to share
     * @param  {string} type         The type of the shared objects
     * @param  {Object} permissions  A permissions object
     * @return {Object}              A promise
     */
        function savePermissions(objectIds, type, permissions) {

            var command = new Command()
            .setPath('/security/share')
            .setPostMethod()
            .setPostParams({
                type: type,
                id: JSON.stringify(objectIds),
                permission: JSON.stringify({
                    permissions: permissions
                })
            });

            return command.execute();
        }

        function transformResponseDataToPermissionsObjectByType(response) {
            var bulkPermissionsByType = response.data;
            response.data = util.mapObjectValues(
            bulkPermissionsByType,
            function(type, bulkPermissions) {
                return new permissionFactory.BulkEffectivePermissionModel(bulkPermissions);
            }
        );
            return response;
        }

        function transformResponseDataToPermissionsObject(response) {
            var bulkPermissions = response.data;
            response.data = new permissionFactory.BulkEffectivePermissionModel(bulkPermissions);
            return response;
        }

        function getEffectivePermissionsJson(objects, type, includeDependents) {
            includeDependents = includeDependents || false;

            var objectIds = objects.map(function (object) {
                return object.id;
            });

            var command = new Command()
            .setPath('/security/effectivepermission')
            .setPostMethod()
            .setPostParams({
                id: JSON.stringify(objectIds),
                type: type,
                dependentshare: includeDependents,
            });

            return command.execute();
        }

        function getEffectivePermissionsJsonByType(typeToObjectsMap, includeDependents) {
            includeDependents = includeDependents || false;

            var command = new Command()
            .setPath('/security/effectivepermissionbulk')
            .setPostMethod()
            .setPostParams({
                idsbytype: JSON.stringify(typeToObjectsMap),
                dependentshare: includeDependents,
            });

            return command.execute();
        }

    /**
     * Fetches effective permissions for a set of objects, for a given user.
     * The effective permission is the permission the user has after all individual
     * and group level permissions have been taken into account.
     *
     * @param  {Array.<Object>} objects     An array of objects
     * @param  {string}         type        Type of objects
     * @param  {boolean=}       [includeDependents]  Whether to get permissions for dependent objects
     * @return {Object}         promise
     */
        function getEffectivePermissions(objects, type, includeDependents) {
            return getEffectivePermissionsJson(
            objects,
            type,
            includeDependents
        ).then(transformResponseDataToPermissionsObject);
        }

    /**
     * Fetches effective permissions for a set of objects, for a given user.
     * The effective permission is the permission the user has after all individual
     * and group level permissions have been taken into account.
     *
     * @param  {Object}         typeToIdsMap
     * @param  {boolean=}       [includeDependents]  Whether to get permissions for dependent objects
     * @return {Object}         promise
     */
        function getEffectivePermissionsByType(typeToIdsMap, includeDependents) {
            return getEffectivePermissionsJsonByType(
            typeToIdsMap,
            includeDependents
        ).then(transformResponseDataToPermissionsObjectByType);
        }

    /**
     * Whether the current user is admin or the author of all the passed in objects
     *
     * @param  {Array.<Object>} objects  An array of objects
     * @return {boolean}                 True if user is admin or author of all the objects
     */
        function isAdminOrAuthorOfAllObjects(objects) {
            if (sessionService.hasAdminPrivileges()) {
                return true;
            }
            var currentUserId = sessionService.getUserGuid();
            return objects.every(function (item) {
                return (item.author == currentUserId);
            });
        }

    /**
     * Whether a set of objects can be shared by the current user
     *
     * @param  {Array.<Object>} objects  An array of the objects
     * @param  {string}         type     The callosum type of the objects
     * @params {string}         subtype  The callosum subtype of the objects
     * @return {boolean}                 True if user is allowed to share all the objects
     */
        function isShareable(objects, type, subtype) {
            return !(!objects || !objects.length);
        }

    /**
     * Given a set of objects and their bulk effective permission model,
     * returns whether all the objects can be tagged by the current user
     *
     * @param  {Array.<Object>} objects                       An array of objects
     * @param  {Object}         bulkEffectivePermissionModel  The bulk effective permission model
     * @return {boolean}                                      True if user is allowed to tag all the objects
     */
        function isTaggable(objects, bulkEffectivePermissionModel) {
            if (!objects || !objects.length) {
                return false;
            }
            return bulkEffectivePermissionModel.canEditObjects(objects);
        }

    /**
     * Given a set of objects and their bulk effective permission model,
     * returns whether all the objects can be deleted by the current user
     *
     * @param  {Array.<Object>} objects                       An array of objects
     * @param  {string}         type                          The type of objects
     * @params {string}         subtype                       The callosum subtype of the objects
     * @param  {Object}         bulkEffectivePermissionModel  The bulk effective permission model
     * @return {boolean}                                      True if user is allowed to delete all the objects
     */
        function isDeletable(objects, type, subtype, bulkEffectivePermissionModel) {
            if (!objects || !objects.length) {
                return false;
            }
            //NOTE(chab) IMPORTED_DATA is a legacy check
            if ((type == jsonConstants.metadataType.LOGICAL_TABLE
                || type == jsonConstants.metadataType.IMPORTED_DATA)
                && !isAdminOrAuthorOfAllObjects(objects)) {
                return false;
            }
            return bulkEffectivePermissionModel.canEditObjects(objects);
        }

    /**
     * Given a set of objects and their bulk effective permission model,
     * returns whether all the objects can be edited by the current user
     *
     * @param  {Array.<Object>} objects                       An array of objects
     * @param  {string}         type                          The type of objects
     * @params {string}         subtype                       The callosum subtype of the objects
     * @param  {Object}         bulkEffectivePermissionModel  The bulk effective permission model
     * @return {boolean}                                      True if user is allowed to edit all the objects
     */
        function isEditable(objects, type, subtype, bulkEffectivePermissionModel) {
            if (!objects || !objects.length) {
                return false;
            }

            // legacy stuff ?
            if (type == jsonConstants.metadataType.IMPORTED_DATA) {
                return true;
            }
        // SCAL-4632 && SCAL-11142 && SCAL-16504
        // Note(chab) in case of table, the notion of isEditable corresponds to the ability of
        // uploading data
            if (type == jsonConstants.metadataType.LOGICAL_TABLE) {
                if (subtype === jsonConstants.metadataType.subType.IMPORTED_DATA
                    || subtype === jsonConstants.metadataType.subType.USER_DEFINED
                    || subtype === jsonConstants.metadataType.subType.SYSTEM_TABLE
                    || subtype === jsonConstants.metadataType.subType.WORKSHEET
                    || subtype === jsonConstants.metadataType.subType.AGGR_WORKSHEET
            ) {
                    return bulkEffectivePermissionModel.canEditObjects(objects)
                    && (sessionService.hasDataManagementPrivileges()
                        || sessionService.hasAdminPrivileges());
                } else {
                    return false;
                }
            }
            return bulkEffectivePermissionModel.canEditObjects(objects);
        }

    /**
     * Given an object and a bulk effective permission model,
     * returns whether the object can be edited should the user has access
     * to the underlying data
     *
     * @param  {string} objectId
     * @param  {Object}         bulkEffectivePermissionModel  The bulk effective permission model
     * @return {boolean}                                      True if user is allowed to edit all the objects
     */
        function isEditableWithUnderlyingAccess(objectId, bulkEffectivePermissionModel) {
            if (!objectId) {
                return false;
            }
            var effectivePermission = bulkEffectivePermissionModel.getObjectPermission(objectId);

            if (!effectivePermission ||
            effectivePermission.getShareMode() != jsonConstants.permission.MODIFY ||
            effectivePermission.getDependents().length === 0)
        {
                return false;
            }

            return !effectivePermission.hasUnderlyingAccess();
        }

    /**
     * Fetch permissions for all the metadata items in the list and instantiate
     * a bulkEffectivePermissionModel
     *
     * @param {Array}        data           Metadata list data object
     * @param {string}       type           The callosum type of the objects
     */
        function fetchItemPermissions(data, type) {
            if (!data || !type) {
                return $q.reject();
            }
            var objects = data.map(function (item) {
                return { id: item.values.id };
            });
            return getEffectivePermissions(objects, type);
        }

        return {
            fetchItemPermissions: fetchItemPermissions,
            getEffectivePermissions: getEffectivePermissions,
            getEffectivePermissionsByType: getEffectivePermissionsByType,
            getPermissions: getPermissions,
            isDeletable: isDeletable,
            isEditable: isEditable,
            isShareable: isShareable,
            isTaggable: isTaggable,
            isEditableWithUnderlyingAccess: isEditableWithUnderlyingAccess,
            savePermissions: savePermissions
        };
    }]);
