/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Service for a generic confirm dialog
 */

'use strict';

blink.app.factory('adminItemDialogUtil', ['blinkConstants',
    'strings',
    'dialog',
    function (blinkConstants, strings) {


    //Todo(chab) get ride of the deferred and use a chainable model
        function getDialogConfigForItem(adminItem,
                                    deferred,
                                    dialogController,
                                    templateURL,
                                    cssClass,
                                    title) {

            return {
                customBodyUrl: templateURL,
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: (adminItem.isNew ? strings.SAVE: strings.UPDATE),
                customCssClass: cssClass,
                onConfirm: function (customData) {

                    if (this.isConfirmBtnDisabled(customData)) {
                        return false;
                    }
                    deferred.resolve(customData);
                    return true;
                },
                onCancel: function() {
                    deferred.reject();
                },
                onDismiss: function() {
                    deferred.reject();
                    return true;
                },
                title: title,
                customData: {
                    dialogController: dialogController
                }
            };
        }

        return {
            getDialogConfigForItem: getDialogConfigForItem
        };
    }]);
