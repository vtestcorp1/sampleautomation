/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Controller for Answers List Page
 */

'use strict';

blink.app.directive('tablesListPage', [function() {
    return {
        restrict: 'E',
        templateUrl: 'src/modules/metadata-list/data-management/tables/tables-list-page.html',
        controller: 'TablesPageController',
        scope: {}
    };
}]);

blink.app.controller('TablesPageController', ['$scope',
    '$route',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'navService',
    'sessionService',
    'TableListController',
    function($scope,
         $route,
         blinkConstants,
         strings,
         jsonConstants,
         navService,
         sessionService,
         TableListController) {
        $scope.shouldShowExplorer = false;

        var onRowClick = function(row) {
            $scope.shouldShowExplorer = true;
            $scope.ctrl.swapHeaderItems = true;
            $scope.selectedTableId = row.id;
        };

        var onRefresh = function() {
            if ($scope.selectedTableId) {
                $scope.shouldShowExplorer = true;
                $scope.ctrl.swapHeaderItems = true;
            }
        };

        $scope.ctrl = new TableListController(
        onRowClick,
        onRefresh
    );

        $scope.hideExplorer = function() {
            $scope.shouldShowExplorer = false;
            $scope.ctrl.swapHeaderItems = false;
            $scope.selectedTableId = null;
        };

        var canImportData = sessionService.hasUserDataUploadPrivileges() ||
        sessionService.hasAdminPrivileges();
        var canCreateWorksheet = sessionService.canUserManageData();

        var dropdownMenu = {
            actions: [
                {
                    label: strings.metadataExplorer.createWorksheet,
                    icon: 'bk-style-icon-table',
                    onClick: function() {
                        navService.goToWorksheet();
                    },
                    dropdownItemDisabled: !canCreateWorksheet,
                    dropdownItemTooltip: strings.metadataExplorer.createWorksheetTip
                },
                {
                    label: strings.metadataExplorer.importData,
                    icon: 'bk-style-icon-upload',
                    onClick: function() {
                        navService.goToImportData();
                    },
                    dropdownItemDisabled: !canImportData,
                    dropdownItemTooltip: strings.metadataExplorer.importPermissionTip
                }
            ]
        };

        if(sessionService.hasAdminPrivileges()) {

            dropdownMenu.actions.push(
                {
                    label: strings.schemaViewer.TITLE,
                    icon: 'bk-style-icon-view-schema',
                    onClick:  function($evt) {
                        navService.goToSchemaViewer();
                    }
                },
                {
                    label: strings.createSchema.CREATE_SCHEMA,
                    icon: 'bk-style-icon-upload',
                    onClick: function ($evt) {
                        navService.goToCreateSchema();
                    }
                }
        );
        }

        $scope.ctrl.dropdownMenu = dropdownMenu;

        var getTable = function(tableId) {
            return $scope.ctrl.getData().find(function (row) {
                return row.owner == tableId;
            });
        };

        $scope.$watch(function() {
            return $route.current.params.selectedTableId;
        }, function(newVal) {
            $scope.selectedTableId = newVal;
        });

        $scope.updateSelectedTableProps = function (name, description) {
            var selectedTable = getTable($scope.selectedTableId);
            if (selectedTable) {
                selectedTable.name = name;
                selectedTable.description = description;
            }
        };

        var routeModeToDataExplorerMode = {};
        routeModeToDataExplorerMode[blink.app.modes.RELATIONSHIP_MODE] =
        blinkConstants.DataExplorerViewModes.RELATIONSHIP_VIEW;
        routeModeToDataExplorerMode[blink.app.modes.SECURITY_MODE] =
        blinkConstants.DataExplorerViewModes.SECURITY_VIEW;

        $scope.$watch(function() {
            return $route.current.mode;
        }, function(newVal) {
            $scope.mode = routeModeToDataExplorerMode[newVal];
        });
    }]);
