/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Service encapsulating common utilities to access worksheets.
 */

'use strict';

// TODO(Jasmeet): Clean up the unnecessary redundancy in the metadata calls in this server. Also refactor this
// to make /worksheet calls and move other functions to worksheet util.
blink.app.factory('worksheetUtil', ['$q',
    'alertService',
    'jsonConstants',
    'WorksheetModel',
    'LogicalTableModel',
    'Logger',
    'util',
    'metadataService',
    'dataService',
    'UserAction',
    function ($q,
          alertService,
          jsonConstants,
          WorksheetModel,
          LogicalTableModel,
          Logger,
          util,
          metadataService,
          dataService,
          UserAction) {

        var me = {};
        var _logger = Logger.create('worksheet-util');
    // Also given that this method is invoked for system tables also, should it not return a LogicalTableModel future?
    // Perhaps we can have the service expose 2 different methods corresponding to different instances?
        me.getWorksheetModel = function (worksheetId, numRows, fetchHiddenColumns) {

            var params = {
                includeMetadata: true,
                batchSize: numRows,
                showHidden: angular.isDefined(fetchHiddenColumns) ? fetchHiddenColumns : false
            };

            var userAction = new UserAction(UserAction.FETCH_WORKSHEET_DATA);

            return dataService.getTableData({id:worksheetId}, params)
            .then(function (response) {
                var data = response.data;
                // Hack(Shikhar) - callosum is sending blank response if a table has no columns/all hidden columns
                if (!data || !Object.keys(data).length) {
                    return $q.reject();
                }
                return new WorksheetModel(data);
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                $q.reject(response.data);
            }
        );
        };

        me.updateWorksheetData = function (worksheetModel, params) {
            var postParams = {};

            if (!worksheetModel.isCreatedOnServer()) {
                postParams.content = JSON.stringify(worksheetModel.getMetadataJson());
            } else {
                postParams.id = worksheetModel.getId();
            }

            return dataService.getTableData(postParams, params).then(function(response) {
                var data = response.data;
                worksheetModel.setData(data.tableData.data, data.columnIds);
                return;
            });
        };

        me.updateLogicalTableData = me.updateWorksheetData;

        me.getLogicalTableModelWithData = function (tableId, numRows, fetchHiddenColumns) {

            var params = {
                includeMetadata: true,
                batchSize: numRows,
                showHidden: angular.isDefined(fetchHiddenColumns) ? fetchHiddenColumns : false
            };

            return dataService.getTableData({id:tableId}, params)
            .then(function (response) {
                var data = response.data;
                // Hack(Shikhar) - callosum is sending blank response if a table has no columns/all hidden columns
                if (!data || !Object.keys(data).length) {
                    return $.reject();
                }
                response.data = new LogicalTableModel(data);
                return response;
            }
        );
        };

        me.getLogicalTableModels = function(ids, params) {

            var requestParams = {
                showHidden: !!params.showHidden,
                isIgnorable: !!params.isIgnorable
            };

            var metadataSubType = jsonConstants.metadataType.subType;

            return metadataService.getMetadataDetails(
            jsonConstants.metadataType.LOGICAL_TABLE,
            ids,
            requestParams.showHidden,
            requestParams.isIgnorable
        ).then(function (response) {
            var data = response.data;
            if (!data) {
                response.data = [];
                return response;
            }
            var modelsJson = response.data.storables.compact();
            response.data = modelsJson.map(function(data){
                var modelType = data.type;

                if (modelType === metadataSubType.WORKSHEET ||
                            modelType === metadataSubType.PRIVATE_WORKSHEET ||
                            modelType === metadataSubType.AGGR_WORKSHEET
                    ) {
                    return new WorksheetModel({
                        tableMetadata: data
                    });
                } else if (modelType === metadataSubType.SYSTEM_TABLE ||
                        modelType === metadataSubType.IMPORTED_DATA
                    ) {
                    return new LogicalTableModel({
                        tableMetadata: data
                    });
                } else {
                    _logger.warn('Unknown type from returned from callosum', modelType);
                }
            });
            return response;
        }
        );
        };

        me.getLogicalTableModel = function (id, params) {

            var requestParams = {
                showHidden: !!params.showHidden,
                isIgnorable: !!params.isIgnorable
            };

            return metadataService.getMetadataObjectDetails(
            jsonConstants.metadataType.LOGICAL_TABLE,
            id,
            requestParams
        ).then(function (response) {
            var data = response.data;
            if (params.asWorksheetModel) {
                response.data = new WorksheetModel({
                    tableMetadata: data
                });
            } else {
                response.data = new LogicalTableModel({
                    tableMetadata: data
                });
            }
            return response;
        }
        );
        };

        return me;
    }]);
