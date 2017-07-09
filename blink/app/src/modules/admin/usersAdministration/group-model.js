/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Data model for user group
 */

'use strict';

blink.app.factory('GroupModel', ['PrincipalModel',
    'dateUtil',
    'util',
    function (PrincipalModel,
          dateUtil,
          util) {

    /**
     * @constructor
     * @param {Object} groupJson
     */
        function GroupModel (groupJson) {
            GroupModel.__super.call(this, groupJson);
            this._isGroup = true;
        }

        GroupModel.fromHeaderJson = function(headerJson) {
            var item = new GroupModel({
                header: headerJson
            });

            return item;
        };

        util.inherits(GroupModel, PrincipalModel);

        GroupModel.prototype.setPrivileges = function(privileges) {
            this._itemJson.privileges = privileges;
            return this;
        };

        GroupModel.prototype.getPrivileges = function() {
            return this._itemJson.privileges;
        };

    /**
     * Whether a group has a privilege
     *
     * @param {string}  privilege  The privilege to read
     * @param {boolean}            True if the group has the given privilege
     */
        GroupModel.prototype.hasPrivilege = function (privilege) {
            var privileges = this._itemJson.privileges;
            return privileges.some(privilege);
        };

    /**
     * Set whether a group has a privilege
     *
     * @param {string}  privilege  The privilege to set
     * @param {boolean} isEnabled  If true give the privilege, if false remove it
     */
        GroupModel.prototype.setPrivilege = function (privilege, isEnabled) {
            var privileges = this._itemJson.privileges,
                alreadyHasPrivilege = this.hasPrivilege(privilege);
            if (!alreadyHasPrivilege && isEnabled) {
            // If the group doesn't have the privilege and user wants to set it, add it
                privileges.push(privilege);
            } else if (alreadyHasPrivilege && !isEnabled) {
            // If the group has the privilege and user wants to remove it, remove it
                privileges.remove(privilege);
            }
            return this;
        };

    /**
     * This method updates the internal state of a group.
     * This is currently a workaround as Callosum does not send us back JSON after an update.
     * We would use the JSON sent back in an ideal scenario
     *
     * @param groupModel
     * @returns {GroupModel}
     */
        GroupModel.prototype.update = function (groupModel) {
            this._itemJson = groupModel.getJson();
            return this;
        };

    /** Callosum does not allow update for groups with this flag turned on.
     *  In this case we just allow user to update members of the group and
     *  then bypass the update request to callosum
     */
        GroupModel.prototype.isSystemPrincipal = function() {
            return this._itemJson.isSystemPrincipal;
        };

        GroupModel.prototype.getViewModel = function() {
            var viewModel = GroupModel.__super.prototype.getViewModel.call(this);
            if (!this || !this._itemJson) {
                viewModel.isSystemPrincipal = false;
            } else {
                viewModel.isSystemPrincipal = this.isSystemPrincipal();
            }
            return viewModel;
        };

        GroupModel.prototype.mergeViewModel = function(viewModel) {
            GroupModel.__super.prototype.mergeViewModel.call(this, viewModel);
            this.setPrivileges(viewModel.privileges);
        };

        return GroupModel;
    }]);
