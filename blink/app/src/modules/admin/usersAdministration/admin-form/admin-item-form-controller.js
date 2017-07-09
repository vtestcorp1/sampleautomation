/**
* Copyright: ThoughtSpot Inc. 2012-2015
* Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
*
* @fileoverview Controller showing admin tabsd
*/

'use strict';

blink.app.factory('AdminItemFormController', ['blinkConstants',
    'AdminItemFieldModel',
    'strings',

    function (blinkConstants, AdminItemFieldModel, strings) {

        function AdminItemFormController(editedViewModel) {
            this.model = editedViewModel;
            var caption = strings.adminUI.captions;
            var formBlinkConst = blinkConstants.adminUI.formFields;
            this.fields = [
                new AdminItemFieldModel(formBlinkConst.fields.NAME,
                    formBlinkConst.fields.NAME,
                    formBlinkConst.type.PLAIN,
                    formBlinkConst.inputType.TEXT,
                    caption.NAME,
                    null,
                    true,
                    true),
                new AdminItemFieldModel(formBlinkConst.fields.DISPLAYNAME,
                    formBlinkConst.fields.DISPLAYNAME,
                    formBlinkConst.type.PLAIN,
                    formBlinkConst.inputType.TEXT,
                    caption.DISPLAYED_NAME,
                    null,
                    true,
                    false),
                new AdminItemFieldModel(formBlinkConst.fields.DESCRIPTION,
                    formBlinkConst.fields.DESCRIPTION,
                    formBlinkConst.type.PLAIN,
                    formBlinkConst.inputType.TEXT,
                    caption.DESCRIPTION)
            ];
        }
        return AdminItemFormController;
    }
]);

blink.app.factory('GroupItemFormController', ['AdminItemFormController',
    'blinkConstants',
    'strings',
    'util',
    function (AdminItemFormController,

          blinkConstants,
          strings,
          util) {

        function GroupItemFormController(editedViewModel) {
            GroupItemFormController.__super.call(this, editedViewModel);
        }

        util.inherits(GroupItemFormController, AdminItemFormController);

        return GroupItemFormController;
    }
]);

blink.app.factory('UserItemFormController', ['AdminItemFormController',
    'AdminItemFieldModel',
    'blinkConstants',
    'strings',
    'util',
    function (AdminItemFormController,
          AdminItemFieldModel,
          blinkConstants,
          strings,
          util) {

        function UserItemFormController(editedViewModel) {

            var caption = strings.adminUI.captions;
            var formBlinkConst = blinkConstants.adminUI.formFields;
            UserItemFormController.__super.call(this, editedViewModel);

            var onChange = this.onPasswordChange.bind(this);
            this.model.matchingPasswords = true;

            this.fields[0].disabled = this.model.isSystemPrincipal;

        // if the user is a new user, password fields are mandatory
            this.fields[2] =   new AdminItemFieldModel(formBlinkConst.fields.PASSWORD,
                formBlinkConst.fields.PASSWORD,
                formBlinkConst.type.PLAIN,
                formBlinkConst.inputType.PASSWORD,
                editedViewModel.isNew ? caption.NEW_PASSWORD : caption.PASSWORD,
                onChange,
                editedViewModel.isNew ? true : false
            );
            this.fields[2].onChange = onChange;
            this.fields.push(new AdminItemFieldModel(formBlinkConst.fields.CONFIRM_PASSWORD,
                formBlinkConst.fields.CONFIRM_PASSWORD,
                formBlinkConst.type.PLAIN,
                formBlinkConst.inputType.PASSWORD,
                caption.PASSWORD_CONFIRMATION,
                onChange
            ));

            this.fields.push(new AdminItemFieldModel(formBlinkConst.fields.EMAIL,
                formBlinkConst.fields.EMAIL,
                formBlinkConst.type.EMAIL,
                formBlinkConst.inputType.EMAIL,
                caption.EMAIL
            ));
        }

        util.inherits(UserItemFormController, AdminItemFormController);

        UserItemFormController.prototype.onPasswordChange = function() {
            if (!this.model.password && !this.model.confirmPassword) {
                this.model.matchingPasswords = true;
            } else {
                this.model.matchingPasswords = (this.model.password == this.model.confirmPassword);
            }
        };

        return UserItemFormController;
    }]);

blink.app.component('adminForm', {
    bindings: {
        bkCtrl: '<'
    },
    controller: blink.app.DynamicController,
    templateUrl: 'src/modules/admin/usersAdministration/admin-form/admin-item-form.html'
}
);
