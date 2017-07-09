/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller manages a panel for editing role
 */

'use strict';


blink.app.factory('AdminRoleItemDialogController', ['AdminDialogController',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'AdminItemFormController',
    'AdminTabModel',
    'util',
    function (AdminDialogController,
          blinkConstants,
          strings,
          jsonConstants,
          AdminItemFormController,
          AdminTabModel,
          util) {
        function AdminRoleItemDialogController(editedRole, isRoleEnabled, groups ,users) {
            AdminRoleItemDialogController.__super.call(this, editedRole, isRoleEnabled);
            this.formController = new AdminItemFormController(editedRole);

            var groupCheckboxController = this.getCheckBoxListControllerForItems(
            jsonConstants.metadataType.GROUP,
            editedRole.groups,
            groups,
            function() {
                return false;
            });

            var userCheckboxController = this.getCheckBoxListControllerForItems(
            jsonConstants.metadataType.USER,
            editedRole.users,
            users,
            function() {
                return false;
            }, true);

            var blinkStrings = strings.adminUI;
            var constants = blinkConstants.adminUI;

            var options =
                [
                    new AdminTabModel(blinkStrings.captions.MANAGE_GROUPS_TAB,
                    constants.tabId.GROUPS_TAB,
                    editedRole.groups,
                    groupCheckboxController,
                    blinkStrings.captions.GROUPS_IN_ROLE),
                    new AdminTabModel(blinkStrings.captions.MANAGE_USERS_TAB,
                    constants.tabId.USERS_TAB,
                    editedRole.users,
                    userCheckboxController,
                    blinkStrings.captions.USERS_IN_ROLE)
                ];

            this.tabsController = this.buildTabsControllerFromModels(options);
        }
        util.inherits(AdminRoleItemDialogController, AdminDialogController);

        return AdminRoleItemDialogController;
    }]);
