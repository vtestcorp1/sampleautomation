/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Controller for Answers List Page
 */

'use strict';

blink.app.directive('dsListPage', [function() {
    return {
        restrict: 'E',
        templateUrl: 'src/modules/metadata-list/data-management/data-sources/data-sources-list-page.html',
        controller: 'DataSourcesPageController',
        scope: {}
    };
}]);

blink.app.controller('DataSourcesPageController', ['$q',
    '$scope',
    'blinkConstants',
    'strings',
    'dataManagementService',
    'jsonConstants',
    'loadingIndicator',
    'DataSourcesListController',
    'navService',
    'sessionService',
    function($q,
         $scope,
         blinkConstants,
         strings,
         dataManagementService,
         jsonConstants,
         loadingIndicator,
         DataSourcesListController,
         navService,
         sessionService) {
        $scope.shouldShowStatusViewer = false;
        $scope.sourceDetails = {
            onEdit : navService.goToImportDataSource,
            status: []
        };

        var onRowClick = function(row) {
            $scope.shouldShowStatusViewer = true;
            $scope.selectedDataSource = row;
            $scope.refreshStatus(row);
        };

        $scope.ctrl = new DataSourcesListController(
        onRowClick
    );

        $scope.hideStatusViewer = function() {
            $scope.shouldShowStatusViewer = false;
        };

        $scope.refreshStatus = function (dataSourceJson) {
            if( dataSourceJson === undefined) {
            // Datasource is undefined. So not refreshing.
                return;
            }
            $scope.sourceDetails.dataSource = dataSourceJson;
            loadingIndicator.show();
            dataManagementService.updateloadstatus(dataSourceJson.id).
            then(dataManagementService.getDataSourceDetails.bind(null, dataSourceJson.id))
            .then(function (refreshedDataSource) {
                $scope.sourceDetails.status = refreshedDataSource.getDetailedLoadStatus(
                    dataManagementService.getTableLoadSessionLog);
                $scope.sourceDetails.schedule = refreshedDataSource.getSchedule();
                dataSourceJson.statistics.dataLoadStatistics = refreshedDataSource.getLoadStatistics();
            })
            .catch(function (error) {
                $scope.sourceDetails.status = [];
                return $q.reject(error.data);
            })
            .finally(loadingIndicator.hide);
        };

        var isEtlEnabled = sessionService.isLightweightETLEnabled();
        var tooltip = isEtlEnabled ? '' : strings.importData.ETL_DISABLED;

        $scope.ctrl.dropdownMenu = {
            tooltip: tooltip,
            actions: [
                {
                    label: strings.metadataExplorer.newDataSource,
                    icon: "bk-style-icon-small-plus",
                    dropdownItemDisabled: !isEtlEnabled,
                    onClick: function() {
                        if(!isEtlEnabled) {
                            return;
                        }
                        navService.goToImportDataSource();
                    }
                }
            ]
        };
    }]);
