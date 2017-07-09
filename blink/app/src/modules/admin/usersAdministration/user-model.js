/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Data model for user
 */

'use strict';

blink.app.factory('UserModel', ['PrincipalModel',
    'dateUtil',
    'blinkConstants',
    'strings',
    'util',
    function (PrincipalModel,
              dateUtil,
              blinkConstants,
              strings,
              util) {

        /**
         * @constructor
         * @param {Object} userJson
         */
        function UserModel(userJson) {
            UserModel.__super.call(this, userJson);
            this._groupsMap = computeGroupsMapFromGroupsIds(this.getGroups());
            this._isGroup = false;
        }
        UserModel.fromHeaderJson = function(headerJson) {
            var item = new UserModel({
                header: headerJson
            });

            return item;
        };

        util.inherits(UserModel, PrincipalModel);

        UserModel.prototype.getEmail = function () {
            return util.prop(this._itemJson.userContent,
                ['userProperties', strings.userPropertiesKeys.EMAIL]) || '';
        };

        UserModel.prototype.setEmail = function (mail) {
            if (!this._itemJson.userContent.userProperties) {
                this._itemJson.userContent.userProperties = {};
            }
            this._itemJson.userContent.userProperties[strings.userPropertiesKeys.EMAIL] = mail;
            return this;
        };

        UserModel.prototype.getGroups = function () {
            return (this._itemJson.assignedGroups) || [];
        };

        UserModel.prototype.setGroups = function (groupsIds) {
            this._itemJson.assignedGroups = groupsIds;
            this._groupsMap = computeGroupsMapFromGroupsIds(this.getGroups());
            return this;
        };

        UserModel.prototype.addToGroups = function (groupIds) {
            var groups = this._itemJson.assignedGroups;
            groupIds.forEach(function (groupId) {
                this._groupsMap[groupId] = true;
                if (!groups.any(groupId)) {
                    groups.push(groupId);
                }
            }, this);
            return this;
        };

        UserModel.prototype.removeFromGroups = function (groupIds) {
            var groups = this._itemJson.assignedGroups;
            groupIds.forEach(function (groupId) {
                this._groupsMap[groupId] = false;
                groups.remove(groupId);
            }, this);
            return this;
        };

        UserModel.prototype.hasGroup = function (groupId) {
            return !!this._groupsMap[groupId];
        };

        UserModel.prototype.update = function (userModel) {
            this._itemJson = userModel._itemJson;
            this._groupsMap = userModel._groupsMap;
            return this;
        };

        UserModel.prototype.isSuperUser = function () {
            return this._itemJson.isSuperUser;
        };

        UserModel.prototype.getViewModel = function() {
            var viewModel = UserModel.__super.prototype.getViewModel.call(this);
            if (!this || !this._itemJson) {
                viewModel.email = "";
                viewModel.groups = [];
            } else {
                viewModel.email = this.getEmail();
                viewModel.groups = this.getGroups();
                viewModel.groups.remove(blinkConstants.ALL_GROUP_GUID);
            }
            return viewModel;
        };

        function computeGroupsMapFromGroupsIds(groupsIds) {
            var groupMap = {};
            groupsIds.forEach(function (groupId) {
                groupMap[groupId] = true;
            });
            return groupMap;
        }

        UserModel.prototype.mergeViewModel = function(viewModel) {
            UserModel.__super.prototype.mergeViewModel.call(this, viewModel);
            this.setEmail(viewModel.email);
            viewModel.groups.add(blinkConstants.ALL_GROUP_GUID);
            this.setGroups(viewModel.groupIds);
        };

        return UserModel;
    }
]);
