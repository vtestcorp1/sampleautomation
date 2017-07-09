/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller manages a panel for editing a group
 *
 *
 */

'use strict';

blink.app.factory('AdminGroupItemDialogController', ['AdminDialogController',
    'AdminTabModel',
    'blinkConstants',
    'strings',
    'GroupItemFormController',
    'jsonConstants',
    'PrivilegesListController',
    'sessionService',
    'util',
    function (AdminDialogController,
          AdminTabModel,
          blinkConstants,
          strings,
          GroupItemFormController,
          jsonConstants,
          PrivilegesListController,
          sessionService,
          util) {

    /**
     *
     * @param {GroupModel} editedGroup
     * @constructor
     */
        function AdminGroupItemDialogController(editedGroup, isRoleEnabled, roles, groups, users) {
            AdminGroupItemDialogController.__super.call(this, editedGroup, isRoleEnabled);
            this.formController = new GroupItemFormController(editedGroup);
            var onPrivilegesChange = this.onPrivilegesChange.bind(this);
            this.privilegesListController = new PrivilegesListController(editedGroup.privileges, onPrivilegesChange);
            this.shouldCollapseFormPanel = editedGroup.isSystemPrincipal;

            var userCheckBoxController = this.getCheckBoxListControllerForItems(
            jsonConstants.metadataType.USER,
            editedGroup.users,
            function(user) {
                // we do not allow Administrator group from themselves
                return (editedGroup.isSystemPrincipal && user.id === sessionService.getUserGuid());
            }, true);
            var groupCheckboxController = this.getCheckBoxListControllerForItems(
            jsonConstants.metadataType.GROUP,
            editedGroup.groups, function(group) {
                return group.id === editedGroup.id;
            }
        );

            var blinkStrings = strings.adminUI;
            var constants = blinkConstants.adminUI;
            var options =  [
                new AdminTabModel(blinkStrings.captions.MANAGE_GROUPS_TAB,
                constants.tabId.MANAGE_GROUPS_TAB,
                editedGroup.groups,
                groupCheckboxController,
                blinkStrings.captions.GROUPS_IN_GROUP),
                new AdminTabModel( blinkStrings.captions.MANAGE_USERS_TAB,
                constants.tabId.USERS_TAB,
                editedGroup.users,
                userCheckBoxController,
                blinkStrings.captions.USERS_IN_GROUP)
            ];

            if (isRoleEnabled) {
                var roleCheckboxController = this.getCheckBoxListControllerForItems(editedGroup.roles, roles, function() {
                    return false;
                });
                options.push(new AdminTabModel(blinkStrings.captions.MANAGE_ROLES_TAB,
                constants.tabId.ROLES_TAB,
                editedGroup.roles,
                roleCheckboxController,
                blinkStrings.captions.ROLES_IN_GROUP
            ));
            }

            this.tabsController = this.buildTabsControllerFromModels(options);
        }
        util.inherits(AdminGroupItemDialogController, AdminDialogController);

        AdminGroupItemDialogController.prototype.onPrivilegesChange = function(privilege, isEnabled) {
            privilege.isEnabled = isEnabled;
        };

        return AdminGroupItemDialogController;
    }]);

