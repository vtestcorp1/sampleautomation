/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Controller for Pinboards List Page
 */

'use strict';

blink.app.controller('PinboardsPageController', ['$scope',
    'blinkConstants',
    'blinkTypes',
    'PinboardListController',
    'navService',
    'pinboardCreateDialog',
    'strings',
    'workflowManagementService',
    function($scope,
             blinkConstants,
             blinkTypes,
             PinboardListController,
             navService,
             pinboardCreateDialog,
             strings,
             workflowManagementService) {
        $scope.blinkConstants = blinkConstants.metadataListPage.pinboards;
        $scope.strings = strings.metadataListPage.pinboards;

        var onRowClick = function(row) {
            workflowManagementService.startWorkflow(
                blinkTypes.UserWorkflowActionTypes.PINBOARD_LOAD
            );
            navService.goToPinboard(row.owner);
        };

        $scope.ctrl = new PinboardListController(
        onRowClick
    );

        $scope.ctrl.button = {
            text: $scope.strings.button.title,
            icon: $scope.blinkConstants.button.icon,
            class: $scope.blinkConstants.button.class,
            onClick: function() {
                pinboardCreateDialog.show()
                    .then(function() {
                        $scope.ctrl.refreshList();
                    });
            }
        };
    }]);
