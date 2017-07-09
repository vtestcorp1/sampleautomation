/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller manages a panel for editing role
 *
 *
 */

'use strict';

blink.app.factory('AdminUserItemDialogController', ['AdminDialogController',
    'AdminTabModel',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'sessionService',
    'UserItemFormController',
    'util',
    function (AdminDialogController,
          AdminTabModel,
          blinkConstants,
          strings,
          jsonConstants,
          sessionService,
          UserItemFormController,
          util) {
        function AdminUserItemDialogController(editedUser, isRoleEnabled, groups ,roles) {
            AdminUserItemDialogController.__super.call(this,
            editedUser,
            isRoleEnabled);
            this.formController = new UserItemFormController(editedUser);
            this.shouldShowErrors = true;
            var groupCheckboxController = this.getCheckBoxListControllerForItems(
            jsonConstants.metadataType.GROUP,
            editedUser.groups,
            function(group) {
                if  (group.id !== blinkConstants.ADMIN_GROUP_GUID) {
                    return false;
                }
                if (editedUser.isSystemPrincipal ||
                    (sessionService.hasAdminPrivileges() && editedUser.id === sessionService.getUserGuid()))
                {
                    return true;
                }
            }
        );

            var blinkStrings = strings.adminUI;
            var constants = blinkConstants.adminUI;

            var options = [
                new AdminTabModel(blinkStrings.captions.MANAGE_GROUPS_TAB,
                constants.tabId.GROUPS_TAB,
                editedUser.groupIds,
                groupCheckboxController,
                blinkStrings.captions.GROUPS_IN_USER)
            ];

            if (isRoleEnabled) {
                var roleCheckboxController = this.getCheckBoxListControllerForItems(editedUser.roles, roles, function() {
                    return false;
                });
                options.push(new AdminTabModel(blinkStrings.captions.MANAGE_ROLES_TAB,
                constants.tabId.ROLES_TAB,
                editedUser.roleIds,
                roleCheckboxController,
                blinkStrings.captions.ROLES_IN_USER
            ));
            }

            this.tabsController = this.buildTabsControllerFromModels(options);

        }
        util.inherits(AdminUserItemDialogController, AdminDialogController);

        return AdminUserItemDialogController;
    }]);

