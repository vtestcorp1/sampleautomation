/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for Pinboard Content
 */

'use strict';

blink.app.controller('PinboardContentController', ['$scope',
    '$q',
    'alertService',
    'blinkConstants',
    'events',
    'strings',
    'dialog',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'metadataService',
    'navService',
    'PinboardSelectorComponent',
    'UserAction',
    'util',
    function ($scope,
              $q,
              alertService,
              blinkConstants,
              events,
              strings,
              dialog,
              jsonConstants,
              loadingIndicator,
              Logger,
              metadataService,
              navService,
              PinboardSelectorComponent,
              UserAction,
              util) {
        var _logger = Logger.create('pinboard-content-controller');
        $scope.strings = strings;
        function pinboardSelectionHandler(selectedPinboards) {
            var selectedPinboard = selectedPinboards[0];
            navService.goToPinboard(selectedPinboard[jsonConstants.OWNER_KEY]);
        }

        function saveDocument(name, description) {
            loadingIndicator.show({
                loadingText: strings.SAVING,
                showInstantly: true
            });

            var documentModel = $scope.config.model;
            var metadataJson = documentModel.getMetadataJson();
            var oldName = documentModel.getName();
            var oldDescription = documentModel.getDescription();

            documentModel.setName(name);
            documentModel.setDescription(description);

            var userAction = new UserAction(UserAction.SAVE_PINBOARD_MODEL);
            metadataService.save(documentModel.getMetadataType(), JSON.stringify(metadataJson))
                .then(function (response) {
                    var pinboardSelector = $scope.pluginConfig.pinboardSelectorComponent;
                    var selectedItems = pinboardSelector.getSelectedItems();
                    if (selectedItems.length > 0) {
                        selectedItems[0].name = name;
                    }

                    $scope.updatePinboardChosenDropdown();
                    var substitutions = [name];
                    $scope.$emit(events.DOCUMENT_SAVED, documentModel);
                    alertService.showUserActionSuccessAlert(
                        userAction,
                        response,
                        {substitutions: substitutions}
                    );

                }, function (response) {
                    documentModel.setName(oldName);
                    documentModel.setDescription(oldDescription);
                    var substitutions = [name];
                    alertService.showUserActionFailureAlert(
                        userAction,
                        response,
                        {substitutions: substitutions}
                    );
                    return $q.reject(response.data);
                })
                .finally(function(){
                    loadingIndicator.hide();
                });
        }

        function editDetailsHandler() {
            var documentModel = $scope.config.model,
                param = {
                    header: documentModel.getName(),
                    description: documentModel.getDescription(),
                    title: strings.editPinboardDetails
                };

            dialog.show({
                title: param.title,
                customBodyUrl: 'src/common/widgets/dialogs/templates/save-dialog.html',
                cancelBtnLabel: 'Cancel',
                confirmBtnLabel: 'Save',
                onConfirm: function (customData) {
                    var name = customData.questionHeader,
                        description = customData.questionDescription;
                    saveDocument(name, description);
                    return true;
                },
                customData: {
                    // Optionally, pre-populate the dialog with the current sage question for ease of usability.
                    questionHeader: param.header,
                    questionDescription: param.description
                }
            });
        }

        $scope.$watch(function () {
            return $scope.config.model.getId();
        }, function (newId) {
            if ($scope.pluginConfig.pinboardSelectorComponent) {
                $scope.pluginConfig.pinboardSelectorComponent.setSelectedItem(
                    $scope.config.model.getHeaderJson()
                );
            }
        });

        function initializePlugin () {
            if ($scope.config.isInsightsPinboard) {
                return;
            }
            $scope.pluginConfig.pluginUrl = 'src/modules/pinboard/pinboard-sharable-item-plugin.html';
            $scope.pluginConfig.pinboardSelectorComponent = new PinboardSelectorComponent(
                pinboardSelectionHandler
            );
            $scope.pluginConfig.pinboardSelectorComponent
                .setSelectedItem($scope.config.model.getHeaderJson());
            $scope.pluginConfig.onPinboardSelection = pinboardSelectionHandler;
            $scope.pluginConfig.onEditDetails = editDetailsHandler;
            $scope.pluginConfig.editIconTooltip = strings.editPinboardDetails;
            $scope.pluginConfig.leftAlign = true;

            $scope.pluginConfig.reload =
                $scope.pluginConfig.pinboardSelectorComponent.reload.bind(
                    $scope.pluginConfig.pinboardSelectorComponent
                );
        }

        initializePlugin();
    }]);
