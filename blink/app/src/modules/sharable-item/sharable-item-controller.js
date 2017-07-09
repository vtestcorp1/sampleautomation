/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview TODO
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('disableAutoUpgradeAutoSave', 'This flag disables auto-saving of worksheets after auto upgrade.' +
    ' Intended to be used while testing.', false);

/* eslint max-params: 1 */
blink.app.controller('SharableItemController', ['$rootScope',
    '$route',
    '$scope',
    '$timeout',
    '$q',
    'alertConstants',
    'autoCompleteObjectUtil',
    'alertService',
    'blinkConstants',
    'strings',
    'DataSourcePreviewComponent',
    'EmptyPagePlaceholderComponent',
    'env',
    'events',
    'formulaEditorPopupService',
    'InfoCardIconComponent',
    'Logger',
    'metadataService',
    'navService',
    'SageBarComponent',
    'sageDataScopeService',
    'sageUtil',
    'sessionService',
    'UserAction',
    'worksheetBuilder',
    function ($rootScope,
          $route,
          $scope,
          $timeout,
          $q,
          alertConstants,
          autoCompleteObjectUtil,
          alertService,
          blinkConstants,
          strings,
          DataSourcePreviewComponent,
          EmptyPagePlaceholderComponent,
          env,
          events,
          formulaEditorPopupService,
          InfoCardIconComponent,
          Logger,
          metadataService,
          navService,
          SageBarComponent,
          sageDataScopeService,
          sageUtil,
          sessionService,
          UserAction,
          worksheetBuilder) {

        $scope.pluginConfig = {};

        var _logger = Logger.create('sharable-item-controller'),
            DATA_PANEL_ANIMATION_DURATION = 200,
            COMMENT_PANEL_ANIMATION_DURATION = 200;

        var DataPanelStates = strings.preferenceValues.panelState;
        var _panelExpansionState;

    // Reset layout button is emitted by button (a part of sharable item),
    // this need to be broadcasted to pinboard (child of sharable item)
        $scope.$on(events.LAYOUT_RESET_U, function ($evt) {
            $evt.stopPropagation();
            $scope.$broadcast(events.LAYOUT_RESET_D);
        });

        $scope.$on('$routeChangeSuccess', function (){
            $rootScope.$broadcast(events.CLEAR_AND_HIDE_POPUP_MENU);
        });

        $scope.getMissingUnderlyingAccessMessage = function () {
            if (!$scope.config) {
                return '';
            }

            var msg = "To edit the question, ask your admin for access to the underlying data.",
                type = $scope.config.type !== 'WORKSHEET' ? 'answer' : 'worksheet';

            return msg.assign(type);
        };

    ////////////////////
    ////            ////
    //// DATA-PANEL ////
    ////            ////
    ////////////////////

        function isReadonlyOrCorruptedWorksheet() {
            if ($scope.config.type !== blinkConstants.documentType.WORKSHEET) {
                return false;
            }

            if (!$scope.config.permission) {
                return true;
            }

            if ($scope.config.permission.isReadOnly()) {
                return true;
            }

            var isWorksheetModelCorrupted = $scope.config.model && $scope.config.model.isCorrupted();
            if (isWorksheetModelCorrupted) {
                return true;
            }

            return false;
        }

        function isCorruptedAnswer() {
            if ($scope.config.type !== blinkConstants.documentType.ANSWER) {
                return false;
            }

            return $scope.config.model && $scope.config.model.isCorrupted();
        }

        $scope.isDataPanelNeeded = function () {
            switch ($scope.config.type) {
                case blinkConstants.documentType.PINBOARD:
                    return $scope.shouldShowDataPanel;
                case blinkConstants.documentType.ANSWER:
                    return !!$scope.config.sageClient;
                case blinkConstants.documentType.WORKSHEET:
                    return !isReadonlyOrCorruptedWorksheet();
                default:
                    return false;
            }
        };

        $scope.shouldShowSage = function () {
            return $scope.config.isSageAllowed();
        };

    /**
     * Returns true if sage should be shown in edit mode. This assumes that sage can be shown ie shouldShowSage() = true
     * @returns {boolean}
     */
        $scope.canShowSageInEditMode = function () {
            return $scope.config.isSageInteractionAllowed();
        };

        function hasAnySources() {
            if ($scope.config && $scope.config.model) {
                return $scope.config.model.getSageDataScope().length;
            }

            return sessionService.getSageDataSource().length;
        }

        function isWorksheet() {
            if (!$scope.config) {
                return true;
            }

            return $scope.config.type.toLowerCase() === blinkConstants.WORKSHEET_TYPE;
        }

        $scope.isWorksheet = isWorksheet;

        $scope.isPinboard = function() {
            if (!$scope.config) {
                return true;
            }

            return $scope.config.type.toLowerCase() === blinkConstants.PINBOARD_TYPE;
        };

        $scope.isAnswer = function() {
            if (!$scope.config) {
                return true;
            }

            return $scope.config.type.toLowerCase() === blinkConstants.ANSWER_TYPE;
        };

        $scope.isAnswerSavingDisabled = function () {
            return sessionService.isAnswerDisabled() && $scope.isAnswer();
        };

        $scope.shouldShowDataPanel = !$scope.isPinboard();

        function initPanelState() {
        // Unless we are in e2e test, we use the fact if any sources are selected or not to determine the initial state of
        // panel.
            if(isWorksheet() || env.e2eTest || $scope.isPinboard()) {
                _panelExpansionState = DataPanelStates.EXPANDED;
                return;
            }

            if(sessionService.getPanelExpandedState() === DataPanelStates.COLLAPSED) {
                _panelExpansionState = DataPanelStates.COLLAPSED;
                return;
            }

            _panelExpansionState = DataPanelStates.AUTO;
        }

        function setPanelExpandedState(state) {
            _panelExpansionState = state;
            sessionService.setPanelStateInPreference(state);
        }

        $scope.isDataPanelExplicitlyExpanded = function () {
            return _panelExpansionState === DataPanelStates.EXPANDED;
        };

        $scope.isDataPanelExplicitlyCollapsed = function () {
            return _panelExpansionState === DataPanelStates.COLLAPSED;
        };

        $scope.expandDataPanel = function () {
            if ($scope.isDataPanelExplicitlyExpanded()) {
                return;
            }
            setPanelExpandedState(DataPanelStates.EXPANDED);
            $scope.reflowContent();
        };

        $scope.reflowContent = function(){
            $timeout(function () {
                $scope.$broadcast(events.LAYOUT_REFLOW_REQUIRED_U);
                $rootScope.$broadcast(events.SAGE_DATA_EXPANSION_STATE_CHANGED_D);
            }, DATA_PANEL_ANIMATION_DURATION);
        };

        $scope.collapseDataPanel = function () {
            $scope.dataSourcePreviewComponent.setHide(false);
            setPanelExpandedState(DataPanelStates.COLLAPSED);
            $scope.reflowContent();
        };

        $scope.showDataPanel = function (state) {
            $scope.shouldShowDataPanel = state;
            $scope.reflowContent();
        };

        $scope.getSourcesCount = function () {
            return (sageDataScopeService.getSources()).length;
        };

        var _scaleUpAnimationDone = false, _scaleUpAnimationNeeded = true;
        $scope.needsScaleUpAnimation = function () {
            if (!_scaleUpAnimationNeeded) {
                return false;
            }

            if ($scope.config.model) {
                _scaleUpAnimationNeeded = false;
                return false;
            }

            return !_scaleUpAnimationDone;
        };

        $scope.scaleUpAnimationDone = function () {
            _scaleUpAnimationDone = true;
        };


    ///////////////////////
    ////               ////
    //// COMMENT-PANEL ////
    ////               ////
    ///////////////////////
        var _commentPanelExpanded = false;
        var commentPanelExpandTimer = null;

        function setCommentPanelExpandedState(state) {
            _commentPanelExpanded = state;
        }

        $scope.isCommentPanelExpanded = function () {
            return _commentPanelExpanded;
        };

        $scope.toggleCommentPanel = function() {
            setCommentPanelExpandedState(!$scope.isCommentPanelExpanded());
            if (commentPanelExpandTimer) {
                $timeout.cancel(commentPanelExpandTimer);
            }
            commentPanelExpandTimer = $timeout(function () {
                $scope.$broadcast(events.LAYOUT_REFLOW_REQUIRED_U);
            }, COMMENT_PANEL_ANIMATION_DURATION);
        };

        $scope.isCommentable = function() {
        /* global flags */
            return flags.getValue('enableCommentService')
            && !!$scope.config.model
            && $scope.config.model.getMetadataType() === "PINBOARD_ANSWER_BOOK";
        };

    ////////////////////
    ////            ////
    //// INFO-CARD  ////
    ////            ////
    ////////////////////

        $scope.showInfoCard = false;
        $scope.toggleInfoCard = function () {
            $scope.showInfoCard = !$scope.showInfoCard;
            $scope.config.infoCardVisible = $scope.showInfoCard;
        };

        $scope.closeInfoCard = function () {
            $scope.showInfoCard = false;
            $scope.config.infoCardVisible = $scope.showInfoCard;
        };

        $scope.isTitleEditingAllowed = function () {
            return !$scope.isAnswerSavingDisabled()
            && $scope.config.permission.isEditingDocumentTitleAllowed();
        };

        function initFormulaHandling() {
            var worksheetFormulaCallbacks = {
                validateName: function (formulaColumn) {
                    var worksheetModel = $scope.config.model;

                    return !worksheetBuilder.hasADifferentFormulaWithSameName(formulaColumn, worksheetModel);
                },
                onAddFormula: function (formulaColumn) {
                    var documentConfig = $scope.config;
                    var sageFormula = autoCompleteObjectUtil.getNewACFormula(formulaColumn);

                    return worksheetBuilder.addFormulaColumn(sageFormula, documentConfig);
                },
                onCancel: function (formulaColumn) {
                    var documentConfig = $scope.config;

                    worksheetBuilder.clearFormulaState(formulaColumn, documentConfig);
                }
            };

            $scope.$on(events.ADD_FORMULA_COLUMN_U, function ($evt, sageFormula) {
                $evt.stopPropagation();

                if (!!$scope.config.addFormulaRequestHandler) {
                    $scope.config.addFormulaRequestHandler(sageFormula);
                    return;
                }

            // TODO(Rahul): Worksheet page should also migrate to just pass in the handler.
                var documentType = $scope.config && $scope.config.type.toLowerCase();
                if (documentType != blinkConstants.WORKSHEET_TYPE) {
                    _logger.error('Sharable item only handles formula addition for worksheets.');
                    return;
                }

                var sageModel = !!$scope.config.sageClient ? $scope.config.sageClient.getSageModel() : null;
                var sageContext = !!$scope.config.sageClient ? $scope.config.sageClient.getContext() : null;
                var dataScope = sageUtil.getEffectiveDataScope(sageModel);

                formulaEditorPopupService.show(
                sageFormula,
                dataScope,
                sageContext,
                worksheetFormulaCallbacks
            );
            });
        }

        $scope.panelHeaderClicked = function (hasAnyDataSources) {
            var config = $scope.config;
            var hidePanel = _.get(config, 'leftPanelConfig.hidePanelOnHeaderClick');

            if ((!hasAnyDataSources && !hidePanel) || $scope.isWorksheet()) {
                return;
            }

            if (!!hidePanel) {
                $scope.showDataPanel(false);
            } else {
                $scope.collapseDataPanel();
            }
        };

        function initPlaceholderComponent() {
            if ($scope.isWorksheet()) {
                $scope.emptyPagePlaceholderComponent = new EmptyPagePlaceholderComponent(
                blinkConstants.CREATE_YOUR_WORKSHEET
            );
            }
        }

        $scope.init = function () {
            initPlaceholderComponent();
            initPanelState();
            initFormulaHandling();
        };
    }]);

// TODO(vibhor): There is also an automatic draft saving mode that will be added soon.
// The proposal is following:
// 1. Generate an untitled answer book with a guid (draft) when the user arrives at a save-able answer for the
//    first time in a sage session.
// 2. For any subsequent sage searches, the draft is automatically updated (and persisted).
// 3. If the user then completes a save-as operation, it becomes a named answer book.
// 4. On a subsequent sage search, user gets an option to either continue in the same book or start new sage
//    session.
// 5. If the user navigates away without saving, the draft is saved (until the draft quota is reached). In a
//    saved answer book, the unsaved changes are preserved with a draft indicator and can optionally be
//    reverted.

/* eslint max-params: 1 */
blink.app.controller('DocumentController', ['$scope',
    '$rootScope',
    '$q',
    '$route',
    'alertService',
    'answerService',
    'autoCompleteService',
    'dependencyDialogService',
    'dialog',
    'documentService',
    'documentUtil',
    'embeddingInfoDialogService',
    'ExpirationButtonComponent',
    'dependencyService',
    'dataService',
    'metadataService',
    'navService',
    'navAlertService',
    'util',
    'PinboardAnswerModel',
    'WorksheetModel',
    'Logger',
    'events',
    'blinkConstants',
    'strings',
    'alertConstants',
    'jsonConstants',
    'env',
    '$timeout',
    'loadingIndicator',
    'ShareDialogComponent',
    'UserAction',
    'worksheetService',
    'worksheetUpgradeService',
    function ($scope,
          $rootScope,
          $q,
          $route,
          alertService,
          answerService,
          autoCompleteService,
          dependencyDialogService,
          dialog,
          documentService,
          documentUtil,
          embeddingInfoDialogService,
          ExpirationButtonComponent,
          dependencyService,
          dataService,
          metadataService,
          navService,
          navAlertService,
          util,
          PinboardAnswerModel,
          WorksheetModel,
          Logger,
          events,
          blinkConstants,
          strings,
          alertConstants,
          jsonConstants,
          env,
          $timeout,
          loadingIndicator,
          ShareDialogComponent,
          UserAction,
          worksheetService,
          worksheetUpgradeService) {
        var _logger = Logger.create('document-controller'),
            navAlertDeregisterer = null,
            oldAnswerCopy = null,
            hasBeenReSavedSinceInit = false;

        $scope.$on(events.DOCUMENT_SAVED, function($evt, newModel) {
            $scope.config.model = newModel;
            oldAnswerCopy = _.cloneDeep($scope.config.model);
        });

    /**
     * Updates the current model with the newDocumentJson received from callosum,
     * and snapshots the model to compare changes to trigger unsaved changes alert.
     * Note that in case of aggregated Worksheets we do not receive new answer model,
     * so we only do the snapshoting with the available answer model
     *
     * @param newDocumentJson
     */
        function updateStateWithNewDocumentJsonOnSave(newDocumentJson) {
        // Note(Rahul): Can be null for aggr WS
            if (!!newDocumentJson) {
                $scope.config.model = $scope.config.model.fromMetadataJson(newDocumentJson);
            }
            oldAnswerCopy = _.cloneDeep($scope.config.model);
        }

    //TODO(Rahul): Handle Aggr WS case.
        function getSaveUserAction(documentType) {
            switch (documentType) {
                case blinkConstants.ANSWER_TYPE:
                    return new UserAction(UserAction.SAVE_ANSWER_MODEL);
                case blinkConstants.PINBOARD_TYPE:
                    return new UserAction(UserAction.SAVE_PINBOARD_MODEL);
                case blinkConstants.WORKSHEET_TYPE:
                    return new UserAction(UserAction.SAVE_WORKSHEET_MODEL);
            }
            return '';
        }

        function onDocumentSaveComplete(newJson) {
            hasBeenReSavedSinceInit = true;
            $scope.config.model.setHasUserTriggeredChanges(false);

            updateStateWithNewDocumentJsonOnSave(newJson);
            $scope.updateMenu();
        }

    /**
     * Saves a document
     */
        var saveDocument = function (optCallback, userAction) {
            var documentModel = $scope.config.model,
                documentType = $scope.config.type.toLowerCase();

            if (!documentModel.isPermittedToSave()) {
                return;
            }

            userAction = !!userAction ? userAction : getSaveUserAction(documentType);
            var navCallback = getSavedDocumentNavCallback(documentType);

            $scope.config.isSaveOperationInProgress = true;

            var savePromise = $scope.config.saveOverride ? $scope.config.saveOverride()
            : documentService.saveModel(documentModel);

            savePromise.then(function (response) {
                var json = response.data;

                onDocumentSaveComplete(json);

                if (optCallback) {
                    optCallback();
                }

                if (!documentModel.isCreatedOnServer()) {
                    navCallback(documentModel.getDocumentIdFromJson(json));
                }

                var substitutions = [documentModel.getName()];
                alertService.showUserActionSuccessAlert(
                userAction,
                response,
                {substitutions: substitutions}
            );

                return json;
            }, function (response) {
                var substitutions = [documentModel.getName()];
                alertService.showUserActionFailureAlert(
                userAction,
                response,
                {substitutions: substitutions}
            );
                return $q.reject(response.data);
            }).finally(function() {
                $scope.config.isSaveOperationInProgress = false;
            });
        };

        function getSavedDocumentNavCallback(documentType) {
            switch (documentType) {
                case blinkConstants.ANSWER_TYPE:
                    return navService.goToSavedAnswer;
                case blinkConstants.PINBOARD_TYPE:
                    return navService.goToPinboard;
                case blinkConstants.WORKSHEET_TYPE:
                    return navService.goToWorksheet;
                case blinkConstants.AGGREGATED_WORKSHEET_TYPE:
                    return navService.goToAggregatedWS;
            }

            return angular.noop;
        }

        function getSaveAsUserAction(documentType) {
            switch (documentType) {
                case blinkConstants.ANSWER_TYPE:
                    return new UserAction(UserAction.SAVE_AS_ANSWER_MODEL);
                case blinkConstants.PINBOARD_TYPE:
                    return new UserAction(UserAction.SAVE_AS_PINBOARD_MODEL);
                case blinkConstants.WORKSHEET_TYPE:
                    return new UserAction(UserAction.SAVE_AS_WORKSHEET_MODEL);
            }
            return '';
        }

    /**
     * Creates a copy of the document. Implements Save As functionality
     *
     * @param {Object}  documentModel  The answer model to save
     * @param {string}  documentType   The type (e.g. Pinboard or answer)
     * @param {object=} saveAsData     An object containing name and description for save as
     */
        function copyDocument(documentModel, documentType, saveAsData) {
            if (saveAsData) {
            // NOTE(vibhor): We are mutating the source object even though we are trying to create a copy.
            // This will not be a problem when the copy on server succeeds (since we navigate away from source
            // page anyways). However, if the copy operation on server fails, we will need to restore.
                documentModel.setName(saveAsData.name);
                documentModel.setDescription(saveAsData.description);
            }

            var userAction = getSaveAsUserAction(documentType),
                navCallback = getSavedDocumentNavCallback(documentType);

            loadingIndicator.show({
                loadingText: 'Saving',
                showInstantly: true
            });

            var saveAsPromise = $scope.config.saveAsOverride
            ? $scope.config.saveAsOverride(saveAsData.name, saveAsData.description)
            : documentService.saveAsModel(documentModel);

            saveAsPromise
            .then(function (response) {
                var json = response.data;
                if (navAlertDeregisterer) {
                    navAlertDeregisterer();
                }

                if (documentType === blinkConstants.PINBOARD_TYPE) {
                    $scope.pluginConfig.reload();
                }

                navCallback(documentModel.getDocumentIdFromJson(json));
                var substitutions = [documentModel.getName()];
                alertService.showUserActionSuccessAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                return json;
            }, function(response) {
                var substitutions = [documentModel.getName()];
                alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                return $q.reject(response.data);
            })
            .finally(loadingIndicator.hide);
        }

        function getSaveAsDialogConfig(documentModel, documentType) {
        // SCAL-8485 Editing an answer from within a pinboard and saving a copy is ugly
        // Saved answer is used to back the pinboard tile and is a hidden object, in that case we should not fetch
        // name and description from model.
            if (!!documentModel.isHidden()) {
                return {
                    header: strings.UNTITLED_OBJECT_NAME,
                    title: strings.SAVE_AS_DIALOG_TITLE.assign(documentType)
                };
            }
            return {
                header: documentModel.getName(),
                description: documentModel.getDescription(),
                title: strings.SAVE_AS_DIALOG_TITLE.assign(documentType)
            };
        }

        function getSaveDialogSharedConfig(param) {
            return {
                title: param.title,
                customBodyUrl: 'src/common/widgets/dialogs/templates/save-dialog.html',
                cancelBtnLabel: strings.CANCEL,
                confirmBtnLabel: strings.SAVE,
                customData: {
                // Optionally, pre-populate the dialog with the current sage question for ease of usability.
                    questionHeader: param.header,
                    questionDescription: param.description
                }
            };
        }

    /**
     * Creates the config for the save as dialog
     */
        function createSaveAsDialogConfig() {
            var documentModel = $scope.config.model,
                documentType = $scope.config.type.toLowerCase(),
                param = getSaveAsDialogConfig(documentModel, documentType);

            if (!documentModel.isPermittedToSave()) {
                _logger.error('Save As dialog creation called on document which cannot be saved', documentModel);
                return;
            }

            var onConfirm = function (customData) {
                var name = customData.questionHeader,
                    description = customData.questionDescription;
                if (!name) {
                    return false;
                }

                $scope.config.model.setName(name);
                $scope.config.model.setDescription(description);

                saveDocument();
                return true;
            };

            var config = getSaveDialogSharedConfig(param);
            config.onConfirm = onConfirm;

            return config;
        }

    /**
     * Creates the config for the make a copy dialog
     */
        function createCopyDialogConfig() {
            var documentModel = $scope.config.model,
                documentType = $scope.config.type.toLowerCase(),
                param = getSaveAsDialogConfig(documentModel, documentType);

            if (!documentModel.isPermittedToSave()) {
                _logger.error(
                'Make a copy dialog creation called on document which cannot be saved',
                documentModel
            );
                return;
            }

            param.title = strings.MAKE_A_COPY;
            param.header = strings.COPY_OF.assign(param.header);

            var onConfirm = function (customData) {
                var name = customData.questionHeader,
                    description = customData.questionDescription;
                if (!name) {
                    return false;
                }
                copyDocument(documentModel, documentType, {
                    name: name,
                    description: description
                });
                return true;
            };

            var config = getSaveDialogSharedConfig(param);
            config.onConfirm = onConfirm;

            return config;
        }

        function showShareDialog(documentModel, documentType, onClear) {
            var isWorksheet = (documentType == blinkConstants.WORKSHEET_TYPE),
                documentId = documentModel.getId();
            var shareDialogConfig = {
                objects: [{
                    id: documentId,
                    name: documentModel.getName(),
                    authorId: documentModel.getAuthorId()
                }],
                type: documentModel.getMetadataType(),
                subtype: documentModel.getMetadataSubType()
            };
            var onShareDialogClear = function () {
                $scope.showShareDialog = false;
                if (_.isFunction(onClear)) {
                    onClear();
                }
            };
            $scope.shareDialogComponent = new ShareDialogComponent(shareDialogConfig, onShareDialogClear);
            $scope.showShareDialog = true;
        }

        $scope.$on(events.FOOLSCAP_DOWNLOAD_AS_PDF_BUTTON_CLICKED_D, function () {
            var documentModel = $scope.config.model;
            var userAction = new UserAction(UserAction.FETCH_PINBOARD_AS_PDF);
            $scope.showLoadingIndicator();
            return dataService.downloadPinboardAsPdf(documentModel.getId())
                .then(_.noop, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                }).finally(function () {
                    $scope.hideLoadingIndicator();
                })
        });

        $scope.$on(events.VIEW_SCHEDULE_BUTTON_CLICKED_D, function () {
            var documentModel = $scope.config.model;
            navService.goToPinboardScheduledReports(documentModel.getId());
        });

        $scope.$on(events.SHARE_BUTTON_CLICKED_D, function ($evt) {
            var documentModel = $scope.config.model,
                documentType = $scope.config.type.toLowerCase();
            if (!documentModel || !documentModel.isPermittedToSave()) {
                return;
            }

        // Aggregated Worksheets are always already saved.
            if (documentModel.isAggregatedWorksheet && documentModel.isAggregatedWorksheet()) {
                showShareDialog(documentModel, documentType);
                return;
            }

            if (!documentModel.isCreatedOnServer()) {
                dialog.show({
                    title: strings.NAME_BEFORE_SHARING_DIALOG_TITLE.assign(documentType),
                    customBodyUrl: 'src/common/widgets/dialogs/templates/simple-save-dialog.html',
                    cancelBtnLabel: 'Cancel',
                    confirmBtnLabel: 'Save',
                    onConfirm: function (customData) {
                        if (!customData.documentName) {
                            return false;
                        }
                        documentModel.setName(customData.documentName);
                        saveDocument(function () {
                            showShareDialog(documentModel, documentType, function () {
                                getSavedDocumentNavCallback(documentType)(documentModel.getId());
                            });
                        });
                        return true;
                    },
                    customData: {
                        documentName: documentModel.getName()
                    }
                });
                return;
            }
            showShareDialog(documentModel, documentType);
        });

        $scope.$on(events.SAVE_ANSWER_U, function ($ev) {
            saveDocument();
        });

        $scope.$on(events.UPGRADE_ANSWER_U, function ($ev) {
            var logPrefix = '[Auto Upgrade]: ';

            if (!$rootScope.workingIndicator) {
                $rootScope.workingIndicator = {};
            }

            $rootScope.workingIndicator.enabled = true;
            $rootScope.workingIndicator.text = strings.UPGRADING_ANSWER_MSG;

            _logger.debug(logPrefix, 'saving answer as part of upgrade');
            saveDocument(function () {
            // Force the 'upgrading...' indicator to run for at least 3 seconds.
                $timeout(function () {
                    $rootScope.workingIndicator.enabled = false;
                }, 3000);
            }, new UserAction(UserAction.UPGRADE_ANSWER));
        });

        $scope.$on(events.SAVE_BUTTON_CLICKED_D, function ($ev) {
            saveDocument();
        });

        function showCopyDialog(){
            if (!$scope.config.model || !$scope.config.model.isPermittedToSave()) {
                return;
            }
            dialog.show(createCopyDialogConfig());
        }

        function showSaveAsDialog(){
            if (!$scope.config.model || !$scope.config.model.isPermittedToSave()) {
                return;
            }
            dialog.show(createSaveAsDialogConfig());
        }

        $scope.$on(events.SAVEAS_BUTTON_CLICKED_D, function(){
            var model = $scope.config.model;
            showSaveAsDialog();
        });

        $scope.$on(events.MAKECOPY_BUTTON_CLICKED_D, function(){
            showCopyDialog();
        });

        $scope.$on(events.COPY_LINK_BUTTON_CLICKED_D, function($event){
            if (!$scope.config.model) {
                return;
            }

            var documentId = $scope.config.model.getId();
            embeddingInfoDialogService.showEmbeddingInfoPopup(documentId);
        });

        $scope.$on(events.ADD_FILTER, function(){
            $scope.showDataPanel(true);
        });

        var documentName;
        $scope.documentTitle = {
            get name() {
                var documentModel = $scope.config.model;
                if(!documentModel) {
                    return null;
                }
                if(angular.isDefined(documentName)) {
                    return documentName;
                } else if (angular.isDefined(documentModel.getName())) {
                    return documentModel.getName();
                }
                return null;
            },
            set name(n) {
                documentName = n;
                if ($scope.config.model.setHasUserDefinedName) {
                    $scope.config.model.setHasUserDefinedName(true);
                }
                return $scope.config.model && $scope.config.model.setName(n);
            },
            get desc() {
                return $scope.config.model && $scope.config.model.getDescription();
            },
            set desc(d) {
                return $scope.config.model && $scope.config.model.setDescription(d);
            }
        };

        $scope.getPlaceholder = function() {
            return 'Untitled';
        };

        $scope.validate = function () {
            if(!$scope.config.model) {
                return null;
            }
        // If the documentTitle set via the UI was reject by the model.setName
        // call (because it was invalid according to model.setName) we will
        // call the current documentTitle invalid
            if ($scope.documentTitle.name != $scope.config.model.getName()) {
                return strings.sharableItem.INVALID_ITEM_NAME_MESSAGE;
            } else {
                return null;
            }
        };

        $scope.shouldAllowInPlaceTitleEditing = function () {
            var documentModel = $scope.config.model;
            if(!documentModel) {
                return false;
            }
            if (!documentModel.isPermittedToSave()) {
                return false;
            }
            var isCreatedOnServer = documentModel.isCreatedOnServer();
            var isAggregatedWorksheet = documentModel.isAggregatedWorksheet
            && documentModel.isAggregatedWorksheet();
            var isAnswer = $scope.isAnswer();

        // When saving aggregated Worksheet, only the context is saved and the model is recreated
        // on the fly when editing. Thus createdOnServer is false for Aggregated WS.
            if (isCreatedOnServer || isAggregatedWorksheet || isAnswer) {
                return true;
            }

            dialog.show(createSaveAsDialogConfig());
            return false;
        };

        function upgradeAndAutoSaveDocument() {
            var model = $scope.config.model;
            if (!model) {
                return $q.reject(new Error('Can\'t upgrade null model'));
            }

            var skipUpgrade = false;
            if (model.isCorrupted()) {
                skipUpgrade = true;
            } else {
                var permission = model.getPermission();
                if (permission.isReadOnly() || permission.isMissingUnderlyingAccess()) {
                    skipUpgrade = true;
                }
            }

            if (skipUpgrade) {
                return $q.when(model);
            }

        // only worksheets are upgraded at the moment
            var metadataType = model.getMetadataType();
            var metadataSubType = model.getMetadataSubType();
            if (metadataType !== jsonConstants.metadataType.LOGICAL_TABLE
                || metadataSubType != jsonConstants.metadataType.subType.WORKSHEET) {
                return $q.when(model);
            }

            var upgradePromise = worksheetUpgradeService.upgradeWorksheetIfNecessary(model);

            return upgradePromise
            .then(function(upgradedModel){
                if (!upgradedModel) {
                    _logger.debug('worksheet upgrade was not required');
                    return $scope.config.model;
                }

                _logger.debug('worksheet upgraded successfully to', upgradedModel);
                // even though we are updating the scope property inside the watch for
                // it, once upgraded the next time we won't update the model on the scope
                upgradedModel.setIsAutoUpgraded(false);
                $scope.config.model = upgradedModel;

                /* global flags */
                if (!!flags.getValue('disableAutoUpgradeAutoSave')) {
                    upgradedModel.setIsAutoUpgraded(true);
                    return $q.when($scope.config.model);
                }

                return autoSaveDocument()
                    .then(function(){
                        upgradedModel.setIsAutoUpgraded(true);
                        return $scope.config.model;
                    }, function(error){
                        _logger.error('Error in saving upgraded worksheet', error);
                        return error;
                    });

            }, function(error){
                _logger.error('Error in upgrading worksheet', error);
                return error;
            });
        }

        if($scope.isPinboard()) {
            $scope.showDataPanel(false);
        }

        // model can keep changing (e.g. when the user changes the query
        // in a saved answer) but we do not change the snapshot because
        // of that. we change the snapshot only when the document itself
        // changes.
        $scope.$watch(function(){
            return $scope.config && $scope.config.model;
        }, onModelChanged);


        function onModelChanged(newModel, oldModel) {
            if (oldAnswerCopy
                && newModel
                && oldModel
                && newModel.getId() === oldModel.getId()){

                // after auto-upgrade and befor saving (auto or manual)
                // we need to update the snapshot
                if (!newModel.isAutoUpgraded()) {
                    return;
                }
            }

            $scope.showDataPanel(!$scope.isPinboard());

            if (newModel) {
                oldAnswerCopy = _.cloneDeep(newModel);

                loadingIndicator.show({
                    loadingText: strings.worksheets.upgrade.UPGRADE_IN_PROGRESS_MESSAGE
                });
                upgradeAndAutoSaveDocument()
                    .then(
                        function(){
                            _logger.debug('Successfully upgraded and auto-saved worksheet');
                        },
                        function (error) {
                            alertService.showAlert({
                                message: error.message,
                                type: alertService.alertConstants.type.ERROR
                            });

                            _logger.error(
                                'Error in upgrading and auto-saving worksheet',
                                error
                            );
                        }
                    )
                    .finally(function(){
                        loadingIndicator.hide();
                    });

            } else {
                oldAnswerCopy = null;
            }
            util.executeInNextEventLoop(function() {
                // We need to call setupScroll in next event loop as the required
                // viz porportions have not yet been rendered to page at
                // time of this being called.
                $scope.setupScroll();
            });
        }

    // function shouldActivateActionMenu() {
    //     // TODO(Jasmeet): We should decouple this active state from the action menu
    //     // and make this state per action item. We can take this up with the design
    //     // 2.0 work.
    //     if (!$scope.config || !$scope.config.model) {
    //         return false;
    //     }
    //     var currentDocType = getDocumentTypeForCurrentCanvasState();
    //     if (currentDocType === null) {
    //         _logger.error("unknown doc type at current route", $route.current);
    //         return false;
    //     }
    //
    //     var documentModel = $scope.config.model;
    //     var permission = documentModel.getPermission();
    //     // In case of read only user should only see making a copy options.
    //     if (permission.isReadOnly()) {
    //         return true;
    //     }
    //     if (permission.isMissingUnderlyingAccess()) {
    //         return $scope.config.type === blinkConstants.documentType.PINBOARD;
    //     }
    //
    //     // Note (sunny): for performance reason we don't check for model
    //     // metadata json changes. `Save` button will always be enabled
    //     // for a document regardless of whether the user made any changes.
    //     return true;
    // }
    //
    // // TODO(Jasmeet): Ensure only state that can be persisted on server is part of the
    // // metadataJson of the document model. And then this watch should be just metadata
    // // json compare.
    // // NOTE: This watch is used to set the state on the action menu.
    // $scope.$watch(shouldActivateActionMenu, function(newVal){
    //     if (!!$scope.config.actionMenu) {
    //         $scope.config.actionMenu.inactive = !newVal;
    //     }
    // });

        $scope.$on(events.ANSWERSHEET_CONTENT_UPDATED_D, function($evt, answerSheetIndex, newAnswerSheetData){
            var answerJson = $scope.config.model.getJson();
            answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY][jsonConstants.SHEETS_KEY][answerSheetIndex] = newAnswerSheetData;

        //it is assumed that any content update of answersheet, the change has already been explicitly confirmed by
        //the user (e.g., deletion of a pin from a pinboard). hence it is okay to silently update the metadata
        //snapshot
            var newModel = new PinboardAnswerModel(answerJson);
            oldAnswerCopy = _.cloneDeep(newModel);
            $scope.config.model = newModel;
        });

        function getDocumentTypeForCurrentCanvasState() {
            var type = $scope.config.model.getMetadataType();
            if (type === jsonConstants.metadataType.QUESTION_ANSWER_BOOK) {
                return alertConstants.documentType.ANSWER;
            }
            if (type === jsonConstants.metadataType.LOGICAL_TABLE) {
                return alertConstants.documentType.WORKSHEET;
            }
            if (type === jsonConstants.metadataType.PINBOARD_ANSWER_BOOK) {
                return alertConstants.documentType.PINBOARD;
            }
            return null;
        }

        function getDocumentId(path) {
            var match = path.match('#/(saved-answer|worksheet|pinboard)/([^/]+)(/|$)');
            return match && match[2];
        }

        function isUnsavedAnswerPage(path) {
            return !!path.match('#/answer/');
        }

        function isWorksheetCreationPage(path) {
            return !!path.match('#/worksheet/create/');
        }

        function areSameDocument(path1, path2) {
        //in case of locally new answers/worksheets, document id is not available so we consider all
        //two answer/worksheet creation locations (e.g. #/worksheet/create/revenue,
        //#/worksheet/create/revenue+discount) to belong to the same document
            if (isUnsavedAnswerPage(path1) && isUnsavedAnswerPage(path2)) {
                return true;
            }
            if (isWorksheetCreationPage(path1) && isWorksheetCreationPage(path2)) {
                return true;
            }

            var oldDocumentId = getDocumentId(path1),
                newDocumentId = getDocumentId(path2);
            return !!newDocumentId && !!oldDocumentId && newDocumentId === oldDocumentId;
        }

        function autoSaveDocument() {
            var defer = $q.defer();
            if (!$scope.config || !$scope.config.model) {
                defer.resolve();
                return defer;
            }
            var documentModel = $scope.config.model;
            var isLocalNew = !$scope.config.model.isCreatedOnServer();
            var documentType = $scope.config.type.toLowerCase();
        // TODO(Rahul): Do we want to show a more customized message in
        // case of auto-save. For example in case of auto save after auto
        // upgrade do we want to say "WS-X auto upgraded" instead of
        // "WS-X saved"?
            var userAction = getSaveUserAction(documentType);
            if (isLocalNew && !(documentModel.isAggregatedWorksheet && documentModel.isAggregatedWorksheet())) {
                var saveAsPromise = $scope.config.saveAsOverride
                ? $scope.config.saveAsOverride(documentModel.getName(), documentModel.getDescription())
                : documentService.saveAsModel(documentModel);

                saveAsPromise.then(function (response) {
                    var json = response.data;
                    updateStateWithNewDocumentJsonOnSave(json);
                    var substitutions = [documentModel.getName()];
                    alertService.showUserActionSuccessAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                    defer.resolve();
                }, function(response) {
                    var substitutions = [documentModel.getName()];
                    alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                    defer.reject(response.data);
                });
            } else {
                var savePromise = null;
                if (!!$scope.config.saveOverride) {
                    savePromise = $scope.config.saveOverride();
                } else {
                    savePromise = documentService.saveModel(documentModel);
                }

                savePromise.then(function (response) {
                    var json = response.data;
                    hasBeenReSavedSinceInit = true;
                    documentModel.setHasUserTriggeredChanges(false);
                    updateStateWithNewDocumentJsonOnSave(json);

                    var substitutions = [documentModel.getName()];
                    alertService.showUserActionSuccessAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                    defer.resolve();
                }, function(response) {
                    var substitutions = [documentModel.getName()];
                    alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                    defer.reject(response.data);
                });
            }

            return defer.promise;
        }

        function shouldWarnOnNavigation(newPath, oldPath) {
            if (env.enableUnsavedChangesAlert === false) {
                return false;
            }

            if (env.e2eTest
            && !blink.env.enableUnsavedChangesAlert) {
                return false;
            }

            if (!$scope.config || !$scope.config.model) {
                return false;
            }

            var model = $scope.config.model;
            var permission = model.getPermission();
            if (permission && permission.isReadOnly()) {
                return false;
            }

        //paths are not known in case user is navigating away from the app
            if (newPath && oldPath) {
            //when the user changes the query there is a route change, we don't want to warn in that case
                if (areSameDocument(newPath, oldPath)) {
                    return false;
                }
            }

            var currentDocType = getDocumentTypeForCurrentCanvasState();
            if (currentDocType === null) {
                _logger.error("unknown doc type at current route", $route.current);
                return false;
            }

            var isLocalNew = !model.isCreatedOnServer();

        //Rules to show alert:
        //REPLAY ANSWER:
        //    no: theoretically should not be necessary as no changes would have happened,
        //    but we are adding redundancy in case of bugs (such as SCAL-13041)
        //ANSWER:
        //    local new: no
        //    saved at least once: yes iff changed
        //WORKSHEET/PINBOARD:
        //    local new: yes
        //    saved at least once: yes iff changed

            var disableSave = !!$scope.modelValidationError.message;

        // TODO (Jordie) - this is not working currently, must investigate
            if (navService.isCurrentReplayAnswerPath()) {
                return false;
            }

            if (currentDocType === alertConstants.documentType.ANSWER) {
                var disableNavigateAwayNotifications = $scope.isAnswerSavingDisabled();

                if (isLocalNew
                || !model.containsChangesFromStateStoredOnServer(oldAnswerCopy.getMetadataJson())
                || disableNavigateAwayNotifications) {
                    return false;
                }

                return documentUtil.getUnsavedDocumentAlertConfig(
                currentDocType,
                disableSave,
                autoSaveDocument
            );
            } else {
                if (isLocalNew) {
                    var metadataSubType = model.getMetadataSubType();
                    var isAggrWorksheet = metadataSubType === jsonConstants.metadataType.subType.AGGR_WORKSHEET;
                // SCAL-12850: aggregated worksheet answer models are always new
                    if (!isAggrWorksheet) {
                        return documentUtil.getUnsavedDocumentAlertConfig(
                        currentDocType,
                        disableSave,
                        autoSaveDocument
                    );
                    }
                }

                var oldMetadataJson = oldAnswerCopy.getMetadataJson();
                var hasChanges = model.containsChangesFromStateStoredOnServer(oldMetadataJson);
                if (hasChanges) {
                    return documentUtil.getUnsavedDocumentAlertConfig(
                    currentDocType,
                    disableSave,
                    autoSaveDocument
                );
                }

                return false;
            }
        }

        $scope.getContentUrl = function () {
            return $scope.config.contentUrl;
        };

        $scope.getPluginUrl = function () {
            if (!!$scope.pluginConfig.pluginUrl) {
                return $scope.pluginConfig.pluginUrl;
            }

            return '';
        };

        $scope.getRibbonUrl = function () {
            return $scope.config.ribbonConfig.ribbonUrl;
        };

        $scope.showRibbon = function () {
            return $scope.config.ribbonConfig && $scope.config.ribbonConfig.showRibbon;
        };

        $scope.showPanel = function () {
            return !$scope.config.hidePanel;
        };

        function confirmDocumentMutationEvent(evt, payload, confirmationEvent) {
        // broadcast events don't allow stopPropagation
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else {
                evt.preventDefault();
            }

        // Hijack the event before it is handled by the Pinboard page controller. This is to do the unsaved changes
        // check before we let the action pass through.
            if ($scope.config.model &&
            $scope.config.model.containsChangesFromStateStoredOnServer(oldAnswerCopy.getMetadataJson())) {
                dialog.show({
                    title: 'Unsaved Changes',
                    message: 'You have unsaved changes in this pinboard that maybe lost after this action. Do you want to discard them?',
                    cancelBtnLabel: 'Cancel',
                    confirmBtnLabel: 'Discard & Continue',
                    confirmAsyncBtnLabel: 'Save & Continue',
                    onConfirm: function () {
                    // User decided to discard the changes. Restore the answer to the last snapshot.
                        $scope.config.model = $scope.config.model.fromMetadataJson(oldAnswerCopy.getMetadataJson());
                    // Propagate the event further.
                        $scope.$emit.apply($scope, [confirmationEvent, hasBeenReSavedSinceInit].concat(payload));
                        return true;
                    },
                    onConfirmAsync: function () {
                        var defer = $q.defer();
                        saveDocument(function () {
                            $scope.$emit.apply($scope, [confirmationEvent, hasBeenReSavedSinceInit].concat(payload));
                            defer.resolve();
                        });
                        return defer.promise;
                    }
                });
            } else {
                $scope.$emit.apply($scope, [confirmationEvent, hasBeenReSavedSinceInit].concat(payload));
            }
        }

        $scope.$on(events.SHOW_VIZ_CONTEXT_U, function (evt) {
            var eventPayload = Array.prototype.slice.call(arguments, 1);
            confirmDocumentMutationEvent(evt, eventPayload, events.SHOW_VIZ_CONTEXT_USER_CONFIRMED_U);
        });

        $scope.$on(events.TILE_REMOVE_BTN_CLICKED_U, function(evt){
            var eventPayload = Array.prototype.slice.call(arguments, 1);
            confirmDocumentMutationEvent(evt, eventPayload, events.TILE_REMOVE_USER_CONFIRMED_U);
        });

        function registerNavigationAlert() {
            navAlertDeregisterer = navAlertService.registerListener(shouldWarnOnNavigation);
            $scope.$on('$destroy', function () {
                navAlertDeregisterer();
            });
        }

        registerNavigationAlert();

        if ($scope.config.model) {
            $scope.config.showTTLTimer = ($scope.config.model.getTimeToLive() > 0);
        }

        function instantiateExpirationTimer() {
            if ($scope.config.showTTLTimer) {
                var expirationTime = $scope.config.model.getTimeToLive();
                var keepAutoDeletedCallback = metadataService.disableAutoDelete;
                var isDisabled = false;
                var model = $scope.config.model;
                var type = $scope.config.model.getMetadataType();

                $scope.expirationButtonComponent = new ExpirationButtonComponent(
                    expirationTime,
                    keepAutoDeletedCallback,
                    isDisabled,
                    model,
                    type
                );
            }
        }

        instantiateExpirationTimer();
    }]);
