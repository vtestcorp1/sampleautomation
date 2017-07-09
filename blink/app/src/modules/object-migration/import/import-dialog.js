/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Vishwas B Sharma (vishwas.sharma@thoughtspot.com)
 *
 * @fileoverview Service for Import Dialog
 */

'use strict';

blink.app.factory('importDialog', ['$q',
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
    /**
     * Disable confirm button based on certain conditions.
     * @param   {Object}    Dialog data object.
     */
        function disableConfirmButton (dialogData) {
            return !dialogData.filePath;
        }

    /**
     * Shows the export dialog
     *
     * @return {Object} A promise that will resolve when object is exported
     */
        function show (objectType) {
            var defer = $q.defer();

            var pageInfo = null;
            if (objectType === jsonConstants.metadataType.QUESTION_ANSWER_BOOK) {
                pageInfo = blinkConstants.ANSWER_TYPE;
            } else {
                pageInfo = blinkConstants.PINBOARD_TYPE;
            }

            var dlg = dialog.show({
                cancelBtnLabel: strings.CANCEL,
                confirmAsyncBtnLabel: strings.CONFIRM,
                customBodyUrl: 'src/modules/object-migration/import/import-dialog.html',
                customData: {
                    filePath: '',
                    stringConstants: {
                        IMPORT_FILE: strings.migration.import.IMPORT_FILE,
                        SUMMARY_LABEL: strings.migration.import.STATUS_LABEL.SUMMARY,
                        IMPORTED_LABEL: strings.migration.import.STATUS_LABEL.IMPORTED
                        .assign({ pageType: pageInfo }),
                        UNIMPORTED_LABEL: strings.migration.import.STATUS_LABEL.UNIMPORTED
                        .assign({ pageType: pageInfo }),
                        NONE_LABEL: strings.migration.import.STATUS_LABEL.NONE
                    },
                    disableFilePathField: false,
                    showStatusMsg: false,
                    summary: '',
                    importedObjectNames: '',
                    unimportedObjectNames: ''
                },
                skipConfirmBtn: true,
                title: strings.migration.import.TITLE.assign({ pageType: pageInfo }),
                isConfirmBtnDisabled: disableConfirmButton,
                noClearOnConfirm: true,
                onConfirmAsync: function(dialogData) {
                    var filePath = dialogData.filePath;
                    var userAction = new UserAction(UserAction.IMPORT_OBJECTS);
                    return migrationService.importObjects(objectType, filePath).then(
                    function (response) {
                        // Disable input fields.
                        dialogData.disableFilePathField = true;
                        // Prepare and display status.
                        dialogData.importedObjectNames =
                            Object.keys(response.data.IMPORTED).map(function (key) {
                                return JSON.parse(key).name;
                            });
                        // Show success message only if atleast one object is imported.
                        if (dialogData.importedObjectNames.length) {
                            alertService.showUserActionSuccessAlert(userAction, response);
                        }
                        dialogData.unimportedObjectNames =
                            Object.keys(response.data.UNIMPORTED).map(function (key) {
                                return JSON.parse(key).name;
                            });
                        dialogData.showStatusMsg = true;
                        var numImported = dialogData.importedObjectNames.length;
                        var numUnimported = dialogData.unimportedObjectNames.length;
                        var totalObjects = numImported + numUnimported;
                        var genericInfo = '';
                        if (numImported < totalObjects) {
                            genericInfo = strings.migration.import.GENERIC_INFO;
                        }
                        dialogData.summary = strings.migration.import.SUMMARY_INFO.assign({
                            importedCount: numImported,
                            totalCount: totalObjects,
                            genInfo: genericInfo
                        });
                        // Change dialog to reflect current user options.
                        dlg.update({
                            skipCancelBtn: true,
                            confirmAsyncBtnLabel: strings.DONE,
                            onConfirmAsync: function() {
                                dlg.close();
                            }
                        });

                        defer.resolve();
                    },
                    function (response) {
                        var debugData = JSON.parse(response.data.debug);
                        alertService.showUserActionFailureAlert(
                            userAction,
                            response,
                            {substitutions: [debugData[0]]}
                        );
                        dlg.close();
                        defer.reject();
                    }
                );
                }
            });
            return defer.promise;
        }

        return {
            disableConfirmButton: disableConfirmButton,
            show: show
        };
    }]);
