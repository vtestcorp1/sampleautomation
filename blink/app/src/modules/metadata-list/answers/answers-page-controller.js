/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Controller for Answers List Page
 */

'use strict';

blink.app.controller('AnswersPageController', ['$scope',
    'AnswerListController',
    'blinkConstants',
    'strings',
    'CheckboxComponent',
    'dialog',
    'sessionService',
    'navService',
    function($scope,
         AnswerListController,
         blinkConstants,
         strings,
         CheckboxComponent,
         dialog,
         sessionService,
         navService) {

        $scope.strings = strings.metadataListPage.answers;

        $scope.isAnswerDisabled = function () {
            return sessionService.isAnswerDisabled();
        };

        $scope.isAlertDisabled = function () {
            return sessionService.getAnswerTabAlertPreference();
        };

        function showDisabledAnswerAlert() {
            dialog.show({
                title: $scope.strings.disableAnswerAlert.TITLE,
                confirmBtnLabel: $scope.strings.disableAnswerAlert.CONFIRM_BUTTON_LABEL,
                skipCancelBtn: true,
                customBodyUrl: 'src/modules/metadata-list/answers/answer-disabled-alert-dialog.html',
                customData: {
                    messagePartA: $scope.strings.disableAnswerAlert.MESSAGE,
                },
                onConfirm: function() {
                    sessionService.setAnswerTabAlertPreference(true);
                    return true;
                }
            });
        }

        if(sessionService.isAnswerDisabled() && !$scope.isAlertDisabled()) {
            showDisabledAnswerAlert();
        }

        var onRowClick = function(row) {
            navService.goToSavedAnswer(row.owner);
        };

        $scope.ctrl = new AnswerListController(
        onRowClick
    );
    }]);
