/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Service for a generic confirm dialog
 */

'use strict';

blink.app.factory('confirmDialog', ['$q',
    'dialog',
    'strings',
    function ($q,
              dialog,
              strings) {

        var me = {};

        /**
         * Shows the confirm dialog
         *
         * @return {Object} A promise that will resolve when the new user is created
         */
        me.show = function (title, message) {
            var deferred = $q.defer();
            dialog.show({
                title: title,
                customBodyUrl: 'src/common/widgets/dialogs/templates/confirm-dialog.html',
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: strings.DELETE,
                onConfirm: function () {
                    deferred.resolve();
                    return true;
                },
                customData: {
                    message: message
                }
            });
            return deferred.promise;
        };
        return me;
    }
]);
