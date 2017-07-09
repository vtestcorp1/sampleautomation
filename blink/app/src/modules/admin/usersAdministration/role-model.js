/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Francois Chabbey (joy@thoughtspot.com)
 *
 * @fileoverview Data model for role
 */

'use strict';

blink.app.factory('RoleModel', ['AdminItemModel',
    'dateUtil',
    'util',
    function (AdminItemModel,
          dateUtil,
          util) {

        /**
         * @constructor
         * @param {Object} roleJson
         */
        function RoleModel(roleJson) {
            RoleModel.__super.call(this, roleJson);
        }

        RoleModel.fromHeaderJson = function(headerJson) {
            var item = new RoleModel({
                header: headerJson
            });
            return item;
        };

        util.inherits(RoleModel, AdminItemModel);

        RoleModel.prototype.getGroups = function () {
            if (!this._itemJson.groupIds) {
                return [];
            }
            return this._itemJson.groupIds || [];
        };

        RoleModel.prototype.setGroups = function (groupsIds) {
            this._itemJson.groupIds = groupsIds;
            return this;
        };

        RoleModel.prototype.getUsers = function () {
            if (!this._itemJson.userIds) {
                return [];
            }
            return this._itemJson.userIds || [];
        };

        RoleModel.prototype.setUsers = function (usersIds) {
            this._itemJson.userIds = usersIds;
            return this;
        };

        RoleModel.prototype.hasUser  = function(userId) {
            return  this.getUsers().any(userId);
        };

        RoleModel.prototype.hasGroup = function(groupId) {
            return  this.getGroups().any(groupId);
        };

        RoleModel.prototype.getViewModel = function() {
            var viewModel = RoleModel.__super.prototype.getViewModel.call(this);
            if (!this || !this._itemJson) {
                viewModel.users = [];
                viewModel.groups = [];
            } else {
                viewModel.users = this.getUsers();
                viewModel.groups = this.getGroups();
            }
            return viewModel;
        };

        RoleModel.prototype.mergeViewModel = function(viewModel) {
            RoleModel.__super.prototype.mergeViewModel.call(this, viewModel);
            this.setUsers(viewModel.users);
            this.setGroups(viewModel.groups);
        };

        return RoleModel;
    }
]);
