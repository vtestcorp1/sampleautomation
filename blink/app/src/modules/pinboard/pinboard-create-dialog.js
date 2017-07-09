/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service for Pinboard Create Dialog
 */

'use strict';

blink.app.factory('pinboardCreateDialog', ['$q',
    'alertService',
    'dialog',
    'jsonConstants',
    'metadataService',
    'UserAction',
    function ($q,
          alertService,
          dialog,
          jsonConstants,
          metadataService,
          UserAction) {

        var me = {};

    /**
     * Shows the create pinboard dialog
     *
     * @return {Object} A promise that will resolve when the new pinboard is created
     */
        me.show = function () {
            var deferred = $q.defer();
            dialog.show({
                title: 'New Pinboard',
                customBodyUrl: 'src/common/widgets/dialogs/templates/create-pinboard-dialog.html',
                cancelBtnLabel: 'Cancel',
                confirmBtnLabel: 'Create',
                onConfirm: function (dialogData) {
                    var pinboardName = dialogData.pinboardName;
                    if (!pinboardName) {
                    // No name was entered, don't clear the window
                        return false;
                    }

                    var userAction = new UserAction(UserAction.CREATE_PINBOARD);
                    metadataService.createMetadataObject(
                    jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
                    pinboardName,
                    dialogData.pinboardDescription
                )
                    .then(function(response) {
                        var substitutions = [pinboardName];
                        alertService.showUserActionSuccessAlert(userAction, response, {substitutions: substitutions});
                        var newPinboard = response.data;
                        deferred.resolve(newPinboard);
                    }, function(response) {
                        var substitutions = [pinboardName];
                        alertService.showUserActionFailureAlert(userAction, response, {substitutions: substitutions});
                        deferred.reject(response.data);
                    });
                    return true;
                }
            });
            return deferred.promise;
        };

        return me;

    }]);
