/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Service for Dependency Dialog
 */

'use strict';

blink.app.factory('dependencyDialogService', ['clientState',
    'dialog',
    'metadataUtil',
    function (clientState,
              dialog,
              metadataUtil) {

        function showDependencyDialog(title, message, dependents) {
            var dependencyItems = dependents.map(function (dependent) {
                return {
                    name: dependent.name,
                    embedApp: clientState.isAppEmbedded(),
                    href: '#/{1}/{2}'.assign(
                        metadataUtil.getUrlPrefixForMetadataType(dependent.type, dependent.subType),
                        dependent.id
                    ),
                    typeName: metadataUtil.getDisplayNameForMetadataType(dependent.type, dependent.subType)
                };
            });

            var customData = {
                message: message,
                items: dependencyItems
            };

            dialog.show({
                skipCancelBtn: true,
                confirmBtnLabel: 'OK',
                title: title,
                onConfirm: function () {
                    return true;
                },
                customBodyUrl: 'src/common/widgets/dialogs/templates/list-dialog.html',
                customData: customData
            });
        }

        return {
            showDependencyDialog: showDependencyDialog
        };
    }]);
