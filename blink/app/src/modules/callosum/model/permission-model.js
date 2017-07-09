/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Encapsulates the callosum permissions api return object.
 */

'use strict';

blink.app.factory('permissionFactory', ['Logger',
    'jsonConstants',
    function (Logger,
          jsonConstants) {

        var _logger = Logger.create('user-permission-model');

    /**
     *
     * @param {Object} json
     * @constructor
     */
        function EffectivePermissionModel(json) {
            this._json = json;
        }

    /**
     * @return {string}
     */
        EffectivePermissionModel.prototype.getShareMode = function () {
            return this._json.shareMode;
        };

    /**
     *
     * @return {Array.<Object>}
     */
        EffectivePermissionModel.prototype.getDependents = function () {
            return this._json.dependents || [];
        };

    /**
     *
     * @return {boolean}
     */
        EffectivePermissionModel.prototype.hasUnderlyingAccess = function () {
            var dependents = this.getDependents();
            if (!dependents.length) {
                return true;
            }

        // Even if one of the dependencies have NO_ACCESS for this user, then we deny the underlying access.
            return !dependents.any(function (dependent) {
                return dependent.shareMode === jsonConstants.permission.NO_ACCESS;
            });
        };

        EffectivePermissionModel.createPermissiveModel = function () {
            return new EffectivePermissionModel({
                shareMode: jsonConstants.permission.MODIFY
            });
        };

        EffectivePermissionModel.createReadOnlyModel = function () {
            return new EffectivePermissionModel({
                shareMode: jsonConstants.permission.READ_ONLY
            });
        };

        function getEffectivePermissionJson(objectJson) {
            if (!objectJson.permissions || Object.keys(objectJson.permissions).length != 1) {
                return {};
            }

            return objectJson.permissions[Object.keys(objectJson.permissions)[0]];
        }

    /**
     *
     * @param {Object} json
     * @constructor
     */
        function BulkEffectivePermissionModel(json) {
            this._json = json;
            this._objectToPermission = {};

            var self = this;
            Object.keys(this._json).each(function (objectId) {
                self._objectToPermission[objectId] = new EffectivePermissionModel(
                getEffectivePermissionJson(self._json[objectId])
            );
            });
        }

    /**
     *
     * @param {string} objId
     * @return {EffectivePermissionModel=}
     */
        BulkEffectivePermissionModel.prototype.getObjectPermission = function (objId) {
            return this._objectToPermission[objId] || null;
        };

    /**
     * Returns whether all objects in a set have edit permissions.
     * If an objects array is passed in, returns whether all objects passed in
     * have edit permissions. If no objects array is provided, returns whether
     * all objects in the bulkEffectivePermissionModel have edit permissions.
     *
     * @param  {Array=}  objects  An array of objects
     * @return {boolean}          True if all the objects have edit permissions
     */
        BulkEffectivePermissionModel.prototype.canEditObjects = function (objects) {
            var objectIds,
                self = this;
            if (objects) {
                if (!Array.isArray(objects)) {
                    objects = [objects];
                }
            // Get the ids of all the objects in the objects array
                objectIds = objects.map(function (item) {
                    return item.id;
                });
            } else {
            // Get the ids of all the objects in the bulkPermissionModel
                objectIds = Object.keys(this._objectToPermission);
            }
            return objectIds.all(function (objectId) {
                var objectPermission = self.getObjectPermission(objectId);
                return (objectPermission && objectPermission.getShareMode() === jsonConstants.permission.MODIFY
                && objectPermission.hasUnderlyingAccess());
            });
        };

        var permissionFactory = {
            BulkEffectivePermissionModel: BulkEffectivePermissionModel,
            EffectivePermissionModel: EffectivePermissionModel
        };

        return permissionFactory;
    }]);
