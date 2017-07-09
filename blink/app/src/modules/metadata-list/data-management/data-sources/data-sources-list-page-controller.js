/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

blink.app.factory('DataSourcesListController', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'CheckboxComponent',
    'dataManagementService',
    'jsonConstants',
    'listActionUtil',
    'listFiltersService',
    'listUtils',
    'loadingIndicator',
    'MetadataListController',
    'UserAction',
    'util',
    function($q,
         alertService,
         blinkConstants,
         strings,
         CheckboxComponent,
         dataManagementService,
         jsonConstants,
         listActionUtil,
         listFiltersService,
         listUtils,
         loadingIndicator,
         MetadataListController,
         UserAction,
         util) {

        var DataSourcesListController = function (onRowClick, onRefresh) {
            var blinkStrings = strings.metadataListPage.dataManagement.dataSources;
            var constants = blinkConstants.metadataListPage.dataManagement.dataSources;

            var columns =  [
                listUtils.columns.nameCol,
                listUtils.columns.authorCol,
                listUtils.columns.dateModifiedCol,
                listUtils.columns.dataSourceTypeCol,
                listUtils.columns.dataSourceScheduledCol,
                listUtils.columns.dataSourceLoadStatusCol
            ];

            var filters = [
                listFiltersService.standardFilters.authorFilter
            ];

            var actionItems = [
                listActionUtil.getDeleteAction(this)
            ];

            DataSourcesListController.__super.call(
            this,
            blinkStrings,
            jsonConstants.metadataType.DATA_SOURCE,
            columns,
            filters,
            actionItems,
            onRowClick,
            onRefresh
        );
        };

        util.inherits(DataSourcesListController, MetadataListController);

        DataSourcesListController.prototype.refreshList = function(pageNumber) {
            loadingIndicator.show();

            return this.loadData(pageNumber)
            .finally(function(){
                loadingIndicator.hide();
            });
        };

        DataSourcesListController.prototype.canDelete = function(items) {
            return true;
        };

        var deleteTables = false;
        DataSourcesListController.prototype.fetchCustomDataForDialog = function(items, metadataType) {
            var optionalTableDeleteCtrl = new CheckboxComponent(
                strings.importData.DELETE_TABLES,
                function() {
                    return deleteTables;
                }
            ).setOnClick(function($event) {
                deleteTables = !deleteTables;
            });
            return optionalTableDeleteCtrl;
        };

        DataSourcesListController.prototype.delete = function(items) {
            loadingIndicator.show();
            var ids = items.map(function(item) {
                return item.id;
            });

            var userAction = new UserAction(UserAction.DELETE_DATA_SOURCE);
            return dataManagementService.deleteDataSources(ids, deleteTables)
            .then(function (response) {
                alertService.showUserActionSuccessAlert(userAction, response);
                return response.data;
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            })
            .finally(loadingIndicator.hide);
        };

        return DataSourcesListController;
    }]);

