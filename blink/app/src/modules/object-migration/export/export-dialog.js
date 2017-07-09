/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Vishwas B Sharma (vishwas.sharma@thoughtspot.com)
 *
 * @fileoverview Service for Export Dialog
 */

'use strict';

blink.app.factory('exportDialog', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'dialog',
    'jsonConstants',
    'metadataUtil',
    'migrationService',
    'UserAction',
    function ($q,
          alertService,
          blinkConstants,
          strings,
          dialog,
          jsonConstants,
          metadataUtil,
          migrationService,
          UserAction) {
        var pageRedirect = {
            PINBOARD_ANSWER_BOOK: '/#/pinboards',
            QUESTION_ANSWER_BOOK: '/#/answers'
        };

    /**
     * Disable confirm button based on certain conditions.
     * @param   {Object}    Dialog data object.
     */
        function disableConfirmButton (dialogData) {
            return !dialogData.exportURL;
        }

    /**
     * Shows the export dialog
     *
     * @param   {Array,<Object>}    Array of objects with metadata id and tags.
     * @param   {string}            Callosum type for object.
     * @return  {Object}            A promise that will resolve when object is exported.
     */
        function show (objectData, objectType) {
            var pageInfo = null;
            if (objectType === jsonConstants.metadataType.QUESTION_ANSWER_BOOK) {
                pageInfo = blinkConstants.ANSWER_TYPbE;
            } else {
                pageInfo = blinkConstants.PINBOARD_TYPE;
            }

            var dlg = dialog.show({
                cancelBtnLabel: strings.CANCEL,
                confirmAsyncBtnLabel: strings.CONFIRM,
                customBodyUrl: 'src/modules/object-migration/export/export-dialog.html',
                customData: {
                    exportURL: '',
                    objectData: objectData,
                    objectType: objectType,
                    stringConstants: {
                        EXPORT_URL: strings.migration.export.EXPORT_URL,
                        IMPORT_URL_MSG: strings.migration.export.IMPORT_URL_LINK_TEXT,
                        STEP: strings.migration.export.STEP,
                        STEP_INFO: strings.migration.export.STEP_INFO
                    },
                    disableURLField: false,
                    disablePasswordField: false,
                    showImportSteps: false,
                    importURL: '',
                    filePath: ''
                },
                skipConfirmBtn: true,
                title: strings.migration.export.TITLE.assign({ pageType: pageInfo }),
                isConfirmBtnDisabled: disableConfirmButton,
                noClearOnConfirm: true,
                onConfirmAsync: function(dialogData) {
                    var exportUrl = dialogData.exportURL;
                    var type = objectType;
                    var ids = dialogData.objectData.map(function (object) {
                        return object.id;
                    });
                    var tagnames = dialogData.objectData.map(function (object) {
                        return object.tags;
                    });
                    tagnames = _.flatten(tagnames);
                    tagnames = _.uniq(tagnames);
                    var userAction = new UserAction(UserAction.EXPORT_OBJECTS);

                    return migrationService.exportObjects(exportUrl, type, ids, tagnames).then(
                    function (response) {
                        var filePath = response.data;
                        alertService.showUserActionSuccessAlert(
                            userAction,
                            response,
                            {substitutions: [filePath]}
                        );
                        // Disable input fields.
                        dialogData.disableURLField = true;
                        dialogData.disablePasswordField = true;
                        // Prepare and display status.
                        dialogData.importURL = encodeURI(
                            dialogData.exportURL + pageRedirect[type]
                        );
                        dialogData.filePath = filePath;
                        dialogData.showImportSteps = true;
                        // Change dialog to reflect current user options.
                        dlg.update({
                            skipCancelBtn: true,
                            confirmAsyncBtnLabel: strings.DONE,
                            onConfirmAsync: function() {
                                dlg.close();
                            }
                        });
                    }, function (response) {
                        var debugData = JSON.parse(response.data.debug);
                        alertService.showUserActionFailureAlert(
                            userAction,
                            response,
                            {substitutions: [debugData[0]]}
                        );
                        dlg.close();
                    });
                }
            });
        }

        return {
            disableConfirmButton: disableConfirmButton,
            show: show
        };
    }]);
