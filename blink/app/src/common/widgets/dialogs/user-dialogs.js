/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com),
 * Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Service for User Create Dialog
 */

'use strict';

/* eslint max-params: 1 */
blink.app.factory('userDialogs', ['$q',
    'adminItemDialogUtil',
    'alertService',
    'AdminUserItemDialogController',
    'blinkConstants',
    'strings',
    'CurrencyTypeEditorController',
    'dialog',
    'GeoConfigEditorComponent',
    'jsonConstants',
    'ListModel',
    'metadataService',
    'pinboardMetadataService',
    'PrivilegesListController',
    'session',
    'sessionService',
    'SmartCheckboxCollectionController',
    'SmartCheckboxCollectionConfig',
    'UserAction',
    'util',

    function ($q,
          adminItemDialogUtil,
          alertService,
          AdminUserItemDialogController,
          blinkConstants,
          strings,
          CurrencyTypeEditorController,
          dialog,
          GeoConfigEditorComponent,
          jsonConstants,
          ListModel,
          metadataService,
          pinboardMetadataService,
          PrivilegesListController,
          session,
          sessionService,
          SmartCheckboxCollectionController,
          SmartCheckboxCollectionConfig,
          UserAction,
          util) {

    /**
     * Shows the add users to group dialog
     *
     * @param {Array.<GroupModel>} groups to show the available groups this user can be added to
     * @return {Object} A promise that will resolve when the user clicks on the confirm button
     */
        function showAddUsersToGroupsDialog() {
            var deferred = $q.defer();

            var selectedItems = {};
            function checkboxCollectionGetter(readOnlyItems, searchString) {
            // send a request to metadata list and return
                var pattern = '%{1}%'.assign(searchString);
                var params = {
                    offset: 0,
                    sort: 'NAME',
                    batchSize: 100,
                    pattern: pattern
                };

                return metadataService.getMetadataList(jsonConstants.metadataType.GROUP, params)
                .then(function (response) {
                    return response.data;
                })
                .then(function (data) {
                    var items = data.headers.reduce(function (array, header) {
                        // we do not want to let people remove the ALL_GROUP_GUID
                        array.push({
                            isChecked: selectedItems[header.id],
                            title: header.displayName,
                            id: header.id
                        });
                        return array;
                    }, []);
                    return {
                        checkboxItems: items
                    };
                }
            );
            }

            var onChange =  function(title, isChecked, id) {
                if (isChecked) {
                    selectedItems[id] = {
                        id: id,
                        title : title,
                        isChecked: true
                    };
                } else {
                    delete selectedItems[id];
                }
            };

            var customData = {
                selectedGroups: selectedItems,
                onChange: onChange,
                checkboxController: new SmartCheckboxCollectionController(
                checkboxCollectionGetter.bind(null, false),
                function() {
                    return $q.when(
                        {
                            checkboxItems: []
                        }
                    );
                },
                onChange,
                new SmartCheckboxCollectionConfig()
            )
            };

            dialog.show({
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: strings.SAVE,
                customBodyUrl: 'src/common/widgets/dialogs/templates/add-users-to-groups-dialog.html',
                customCssClass: 'bk-add-user-dialog',
                customData: customData,
                title: strings.adminUI.captions.ADD_USER_TO_GROUP,
                isConfirmBtnDisabled: function(customData) {
                    return !!customData.selectedGroups && !!customData.selectedGroups.length;
                },
                onConfirm: function (customData) {
                    if (this.isConfirmBtnDisabled(customData)) {
                        return false;
                    }
                    deferred.resolve(customData);
                    return true;
                }
            });
            return deferred.promise;
        }

    /**
     * Shows scheduler dialog
     *
     * @param scheduleConfig config for scheduler
     * @param datasourceId datasource id
     * @return {Object} A promise that will resolve when the user clicks on the Ok button
     */
        function showSchedulerDialog(scheduleConfig, datasource, confirmAsync) {
            var deferred = $q.defer();
            dialog.show({
                title: 'Scheduler',
                customBodyUrl: 'src/common/widgets/dialogs/templates/scheduler-dialog.html',
                customCssClass: 'bk-scheduler-dialog',
                cancelBtnLabel: strings.CANCEL,
                skipConfirmBtn: true,
                confirmAsyncBtnLabel: 'Ok',
                showErrorOnFooter: true,
                onConfirmAsync: confirmAsync,
                customData: {
                    schedulerConfig: scheduleConfig,
                    datasource: datasource
                }
            });

            return deferred.promise;
        }

    /**
     * Shows scheduler dialog
     *
     * @param scheduleConfig config for scheduler
     * @return {Object} A promise that will resolve when the user clicks on the Ok button
     */
        function showSageFeedbackDialog(submitCallback, finishCallback) {
            dialog.show({
                title: strings.sageUserFeedback.DIALOG_TITLE,
                customBodyUrl: 'src/common/widgets/dialogs/templates/sage-feedback-dialog.html',
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: strings.SUBMIT,
                onConfirm: function (customData) {
                    if (this.isConfirmBtnDisabled(customData)) {
                        return;
                    }
                    var userAction = new UserAction(UserAction.SUBMIT_SAGE_FEEDBACK);
                    submitCallback(customData).then(function (response) {
                        alertService.showUserActionSuccessAlert(userAction, response);
                    }, function (response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                    });
                    finishCallback();
                    return true;
                },
                onCancel: finishCallback,
                isConfirmBtnDisabled: function (customData) {
                    return (customData.userRating === void(0) ||
                customData.userRating === sage.UserRating.UNKNOWN);
                },
                cancelCbOnClose: true,
                customData: {
                    ratingList: $.map(sage.UserRating, function (intValue, strValue) {
                        if (intValue !== sage.UserRating.UNKNOWN) {
                            return {text: strValue, number: intValue};
                        }
                    }),
                    strings: strings.sageUserFeedback
                }
            });
        }

    /**
     * Shows the edit schema dialog
     *
     * @param schema text with DDL commands
     * @param importDataCallback callback which invokes importData
     * @return {Object} A promise that will resolve when the user clicks on the confirm button
     */
        function showEditSchemaDialog(schemaText, importDataCallback) {
            var deferred = $q.defer();
            dialog.show({
                title: strings.importData.EDIT_SCHEMA,
                customBodyUrl: 'src/common/widgets/dialogs/templates/edit-schema-dialog.html',
                cancelBtnLabel: strings.CANCEL,
                skipConfirmBtn: true,
                noConfirmOnEnter: true,
                showErrorOnFooter: true,
                confirmAsyncBtnLabel: 'Load',
                onConfirmAsync: importDataCallback,
                customData: {
                    schemaText:schemaText,
                    strings: strings.importData
                }
            });

            return deferred.promise;
        }

    /**
     * Shows the create connection dialog
     *
     * @param configProperties properties to show in the ui
     * @param connectionCreateCallBack call back when user clicks on ok
     * @return {Object} A promise that will resolve when the user clicks on the ok button
     */
        function showCreateConnectionDialog(connProperties, connectionCreateCallBack) {
            var deferred = $q.defer();
            dialog.show({
                title: strings.importData.CREATE_CONN,
                customCssClass: 'bk-create-connection-dialog',
                customBodyUrl: 'src/common/widgets/dialogs/templates/create-connection-dialog.html',
                cancelBtnLabel: strings.CANCEL,
                showErrorOnFooter: true,
                skipConfirmBtn: true,
                hasAnyRequiredField: true,
                connectionName: strings.importData.CONN_NAME,
                confirmAsyncBtnLabel: strings.importData.CONN_DIALOG.TEST_AND_CREATE,
                translateBoolSelection: function(type) {
                    if( type === strings.true) {
                        return strings.Yes;
                    } else {
                        return strings.No;
                    }
                },
                getBoolTypeListOptions: function() {
                    return [strings.true, strings.false];
                },
                initializeWithDefaultValue: function(attribute){
                    attribute.value = attribute.defaultValue;
                },
                onConfirmAsync: function (data) {
                    return connectionCreateCallBack(data).
                    then(deferred.resolve, function (error) {
                        return $q.reject(error);
                    });
                },
                customData: connProperties
            });
            return deferred.promise;
        }

    /**
     * Shows the edit connection dialog
     *
     * @param configProperties properties to show in the ui
     * @param connectionCreateCallBack call back when user clicks on ok
     * @return {Object} A promise that will resolve when the user clicks on the ok button
     */
        function showEditConnectionDialog(connProperties, connectionEditCallBack) {
            var deferred = $q.defer();
            dialog.show({
                title: strings.importData.EDIT_CONN,
                customCssClass: 'bk-create-connection-dialog',
                customBodyUrl: 'src/common/widgets/dialogs/templates/create-connection-dialog.html',
                cancelBtnLabel: strings.CANCEL,
                showErrorOnFooter: true,
                skipConfirmBtn: true,
                hasAnyRequiredField: true,
                connectionName: strings.importData.CONN_NAME,
                confirmAsyncBtnLabel: strings.importData.CONN_DIALOG.TEST_AND_EDIT,
                translateBoolSelection: function(type) {
                    if( type === strings.true) {
                        return strings.Yes;
                    } else {
                        return strings.No;
                    }
                },
                getBoolTypeListOptions: function() {
                    return [strings.true, strings.false];
                },
                initializeWithDefaultValue: function(attribute){
                    attribute.value = attribute.defaultValue;
                },
                onConfirmAsync: function (data) {
                    return connectionEditCallBack(data).
                    then(deferred.resolve, function (error) {
                        return $q.reject(error);
                    });
                },
                onDismiss: function() {
                    deferred.resolve();
                    return true;
                },
                onCancel: function(data) {
                    deferred.resolve();
                },
                customData: connProperties
            });
            return deferred.promise;
        }


    /**
     * Shows the data filter dialog
     *
     * @param dataFilterConfig config to show values in the ui
     * @param callback call back when user clicks on ok
     */
        function showDataFilterDialog (dataFilterConfig, callback) {
            dialog.show({
                title: 'Data Filter',
                customBodyUrl: 'src/common/widgets/dialogs/templates/data-filter-dialog.html',
                customCssClass: 'bk-data-filter-dialog',
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: strings.OK,
                onConfirm: function (customData) {
                    if(this.isConfirmBtnDisabled(customData)) {
                        return;
                    }
                    callback(customData);
                    return true;
                },
                isConfirmBtnDisabled: function (customData) {
                    return !dataFilterConfig.isValidFilter(customData.config);
                },
                customData: {
                    config:dataFilterConfig,
                    constants:blinkConstants.dataFilter
                }
            });
        }

    /**
     * Shows a dialog that allows user to edit the currency type setting.
     * @param logicalColumns List of logical column models of a table.
     * @param forColumnGuid GUID of the column for which the currency type is being edited.
     * @param currencyTypeInfo Model of the existing currency type info of the column.
     * @param dialogCssClass css class to add to the top level.
     * @param confirmCallback callback to execute when OK is clicked.
     * @param cancelCallback  callback to execute when dialog is canceled.
     */
        function showCurrencyTypeEditDialog(
            logicalColumns,
            forColumnGuid,
            currencyTypeInfo,
            dialogCssClass,
            confirmCallback,
            cancelCallback,
            openCallback) {
            function onCurrencyTypeInfoChange(newCurrencyTypeInfo) {
                ctrl.currencyTypeInfo = newCurrencyTypeInfo;
            }
        // We have to exclude the current column.
            var currencyColumnOptions = logicalColumns.filter(function (column) {
                return column.getGuid() != forColumnGuid &&
                column.getDataType() === util.dataTypes.VARCHAR;
            });
            var ctrl = new CurrencyTypeEditorController(
            currencyColumnOptions,
            currencyTypeInfo,
            onCurrencyTypeInfoChange
        );
            return dialog.show({
                title: strings.metadataExplorer.currencyEditor.DIALOG_TITLE,
                customBodyUrl: 'src/common/widgets/dialogs/templates/currency-type-editor-dialog.html',
                customCssClass: dialogCssClass,
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: strings.OK,
                onConfirm: function (customData) {
                    if(this.isConfirmBtnDisabled(customData)) {
                        return;
                    }
                    confirmCallback(customData.ctrl.currencyTypeInfo);
                    return true;
                },
                onCancel: function(customData) {
                    cancelCallback();
                },
                onDismiss: function(customData) {
                    cancelCallback();
                    return true;
                },
                onOpen: openCallback,
                isConfirmBtnDisabled: function (customData) {
                    return !customData.ctrl.isCurrentSelectionValid();
                },
                customData: {
                    ctrl: ctrl
                }
            });
        }

        function showGeoConfigEditorDialog(
            forColumnGuid,
            geoConfig,
            dialogCssClass,
            confirmCallback,
            cancelCallback,
            openCallback
        ) {
            return dialog.show({
                title: strings.metadataExplorer.geoConfigEditor.EDIT_GEO_CONFIG,
                customBodyUrl: 'src/common/widgets/dialogs/templates/geo-config-editor-dialog.html',
                customCssClass: dialogCssClass,
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: strings.OK,
                onConfirm: function (customData) {
                    if(this.isConfirmBtnDisabled(customData)) {
                        return;
                    }
                    confirmCallback(customData.ctrl.getGeoConfig());
                    return true;
                },
                onCancel: function(customData) {
                    cancelCallback();
                },
                onDismiss: function(customData) {
                    cancelCallback();
                    return true;
                },
                onOpen: openCallback,
                isConfirmBtnDisabled: function (customData) {
                    return !customData.ctrl.isCurrentSelectionValid();
                },
                customData: {
                    ctrl: new GeoConfigEditorComponent(geoConfig)
                }
            });
        }

        function showVisualizationPinnerDialog(vizModel) {
            dialog.show({
                title: strings.visualizationPinner.modal.TITLE,
                customBodyUrl: 'src/common/widgets/dialogs/templates/visualization-pinner-dialog.html',
                skipCancelBtn: true,
                confirmBtnLabel: strings.DONE,
                onConfirm: function () {
                    return true;
                },
                customData: {
                    vizModel: vizModel
                }
            });
        }

        function showMetadataListDeleteDialog(message, checkBoxController) {
            var deferred = $q.defer();
            dialog.show({
                title: strings.importData.DELETE_DATASOURCE.TITLE,
                customBodyUrl: 'src/common/widgets/dialogs/templates/delete-checkbox-dialog.html',
                confirmBtnLabel: strings.DELETE,
                message: message,
                customData : {
                    ctrl:  checkBoxController
                },
                onConfirm: function() {
                    deferred.resolve();
                    return true;
                },
                onCancel: function() {
                    deferred.reject();
                    return true;
                },
                onDismiss: function() {
                    deferred.reject();
                    return true;
                }
            });
            return deferred.promise;
        }

        function showPinboardSnapshotDialog(model) {
            dialog.show({
                title: 'Pinboard Snapshots for ' + model.getName(),
                customBodyUrl: 'src/common/widgets/dialogs/templates/pinboard-snapshot-dialog.html',
                skipCancelBtn: true,
                confirmBtnLabel: strings.DONE,
                onConfirm: function (customData) {
                    return true;
                },
                customData: {
                    pinboardModel: model,
                }
            });
        }

        return {
            showAddUsersToGroupsDialog: showAddUsersToGroupsDialog,
            showCreateConnectionDialog: showCreateConnectionDialog,
            showEditConnectionDialog: showEditConnectionDialog,
            showDataFilterDialog: showDataFilterDialog,
            showDataConnectionDialog: showDataFilterDialog,
            showEditSchemaDialog: showEditSchemaDialog,
            showSchedulerDialog: showSchedulerDialog,
            showSageFeedbackDialog: showSageFeedbackDialog,
            showCurrencyTypeEditDialog: showCurrencyTypeEditDialog,
            showGeoConfigEditorDialog: showGeoConfigEditorDialog,
            showVisualizationPinnerDialog: showVisualizationPinnerDialog,
            showMetadataListDeleteDialog: showMetadataListDeleteDialog,
            showPinboardSnapshotDialog: showPinboardSnapshotDialog
        };
    }]);
