/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Service for Role Create Dialog
 */

'use strict';

blink.app.factory('adminDialogs', ['$q',
    'adminItemDialogUtil',
    'AdminGroupItemDialogController',
    'AdminRoleItemDialogController',
    'AdminUserItemDialogController',
    'blinkConstants',
    'strings',
    'dialog',
    'sessionService',
    function ($q,
          adminItemDialogUtil,
          AdminGroupItemDialogController,
          AdminRoleItemDialogController,
          AdminUserItemDialogController,
          blinkConstants,
          strings,
          dialog,
          sessionService) {
    /**
     * Shows the edit and create role dialog
     *
     * @param {Object} editedRole - View representation of the role
     */
        var blinkStrings = strings.adminUI;

        function showEditRoleDialog(editedRole) {

            var isRoleEnabled = sessionService.isRoleEnabled();
            var dialogController = new AdminRoleItemDialogController(editedRole, isRoleEnabled);
            var deferred = $q.defer();
            var dialogOptions = adminItemDialogUtil.getDialogConfigForItem(editedRole,
            deferred,
            dialogController,
            'src/common/widgets/dialogs/templates/create-edit-admin-item-dialog.html',
            'bk-big',
            editedRole.isNew ? blinkStrings.captions.ADD_NEW_ROLE :
                blinkStrings.captions.EDIT_ROLE
        );
            dialogOptions.hasAnyRequiredField = true;
            dialogOptions.isConfirmBtnDisabled = function() {
                return !editedRole.name || !editedRole.displayName;
            };
            dialog.show(dialogOptions);

            return deferred.promise;
        }
        function showEditGroupDialog(editedGroup) {

            var deferred = $q.defer();
            var isRoleEnabled = sessionService.isRoleEnabled();
            var dialogController = new AdminGroupItemDialogController(editedGroup, isRoleEnabled);

            var dialogOptions = adminItemDialogUtil.getDialogConfigForItem(editedGroup,
            deferred,
            dialogController,
            'src/common/widgets/dialogs/templates/create-edit-admin-item-dialog.html',
            editedGroup.isSystemPrincipal ? '' : 'bk-big',
            editedGroup.isNew ? blinkStrings.captions.ADD_NEW_GROUP :
                blinkStrings.captions.EDIT_GROUP
        );
            dialogOptions.hasAnyRequiredField = true;

            dialogOptions.isConfirmBtnDisabled = function() {
                return !editedGroup.name || !editedGroup.displayName;
            };

            dialog.show(dialogOptions);
            return deferred.promise;
        }

    /**
     * Shows the edit user dialog
     *
     * @param {Object} editedUser - View Model for the edited user
     */
        function showEditUserDialog(editedUser) {

            var deferred = $q.defer();
            var isRoleEnabled = sessionService.isRoleEnabled();
            var dialogController = new AdminUserItemDialogController(editedUser, isRoleEnabled);
            var dialogOptions = adminItemDialogUtil.getDialogConfigForItem(editedUser,
            deferred,
            dialogController,
            'src/common/widgets/dialogs/templates/create-edit-admin-item-dialog.html',
            'bk-big',
            editedUser.isNew ? blinkStrings.captions.ADD_NEW_USER :
                blinkStrings.captions.EDIT_USER
        );

            dialogOptions.hasAnyRequiredField = true;
            dialogOptions.isConfirmBtnDisabled = function(customData) {
                var userName = editedUser.name, pwd = editedUser.password,
                    isEmailNotDefined = (editedUser.email === void 0);

                if (editedUser.isNew) {
                    return (!editedUser.displayName || !userName || !pwd
                    || !editedUser.matchingPasswords) || isEmailNotDefined;
                }

                var hasPassword = !!(pwd && pwd.length);
                return !editedUser.displayName || ( hasPassword && !editedUser.matchingPasswords) ||
                isEmailNotDefined;
            };
            dialogOptions.customData.hidePasswordField = false;

            dialog.show(dialogOptions);
            return deferred.promise;
        }

        return {
            showEditGroupDialog: showEditGroupDialog,
            showEditRoleDialog: showEditRoleDialog,
            showEditUserDialog: showEditUserDialog
        };
    }]);
