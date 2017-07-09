/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Data model for user group
 */

'use strict';

blink.app.factory('PrincipalModel', ['AdminItemModel',
    'util',
    function (AdminItemModel,
              util) {

    /**
     * @constructor
     * @param {Object} itemJson
     */
        function PrincipalModel (itemJson) {
            PrincipalModel.__super.call(this, itemJson);
        }
        util.inherits(PrincipalModel, AdminItemModel);

        PrincipalModel.prototype.isSystemPrincipal = function () {
            return this._itemJson.isSystemPrincipal;
        };

    /**
     * Assigned roles are first-level roles.
     * We only allow modification of first-level roles
     *
     * @returns {Array<string}
     */
        PrincipalModel.prototype.getAssignedRoles = function() {
            return this._itemJson.assignedRoles || [];
        };

        PrincipalModel.prototype.setAssignedRoles = function(roles) {
            this._itemJson.assignedRoles = roles;
        };

    /**
     * Inherited roles are second-and-more level roles
     *
     * @returns {Array<string}
     */
        PrincipalModel.prototype.getInheritedRoles = function() {
            return this._itemJson.inheritedRoles || [];
        };

        PrincipalModel.prototype.getViewModel = function() {
            var viewModel = PrincipalModel.__super.prototype.getViewModel.call(this);
            if (!this || !this._itemJson) {
                viewModel.roles = [];
                viewModel.isSystemPrincipal = false;

            } else
        {
                viewModel.roles = this.getAssignedRoles();
                viewModel.isSystemPrincipal = this.isSystemPrincipal();
            }
            return viewModel;
        };

        PrincipalModel.prototype.mergeViewModel = function(viewModel) {
            PrincipalModel.__super.prototype.mergeViewModel.call(this, viewModel);
            this.setAssignedRoles(viewModel.roles);
        };

        PrincipalModel.prototype.isGroup = function() {
            return this._isGroup;
        };

        return PrincipalModel;
    }]);
