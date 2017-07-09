/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service managing metadata about data sources
 */

'use strict';

blink.app.factory('sageDataSourceService', ['$q',
    'alertService',
    'dataService',
    'jsonConstants',
    'Logger',
    'LogicalTableModel',
    'metadataService',
    'UserAction',
    'util',
    function ($q,
          alertService,
          dataService,
          jsonConstants,
          Logger,
          LogicalTableModel,
          metadataService,
          UserAction,
          util) {

        var sourceIdToModel = {},
            sourceIdToDataDeferred = {};

        var logger = Logger.create('sage-data-source-service');

        function getAvailableModels(sourceIds) {
            return util.mapArrayToHash(sourceIds, angular.identity, function(id){
                return sourceIdToModel[id] || null;
            });
        }

        function addModelsToCache(models) {
            models.each(function(model){
                sourceIdToModel[model.getId()] = model;
            });
        }

    // Note(sunny): we can limit further by queueing up requests
    // (to handle pathological cases like a quick bunch of select-all
    // de-select all). Leaving that out for now
    /**
     * This function gets the LogicalTableModels for the given ids. It supports getting
     * values from cache if available and also capability to pass ids which are always fetched
     * from server.
     * We use this in case of QoQ where we dont want to cache the adhoc tables.
     * @param sourceIds {String[]}
     * @param unCachedSourceIds {String[]}
     * @returns {*}
     */
        function getSourcesModels(sourceIds, unCachedSourceIds) {
            unCachedSourceIds = unCachedSourceIds || [];

            var deferred = $q.defer(),
                unavailableSources = sourceIds.filter(function(id){
                    return !Object.has(sourceIdToModel, id);
                });

            unavailableSources = unavailableSources.concat(unCachedSourceIds);

            if (unavailableSources.length === 0) {
                deferred.resolve(getAvailableModels(sourceIds));
            } else {
                var userAction = new UserAction(UserAction.FETCH_TABLES_DETAILS);
                metadataService.getMetadataDetails(
                jsonConstants.metadataType.LOGICAL_TABLE,
                unavailableSources,
                true,
                true
            )
                .then(function (response) {
                    var data = response.data;
                    var models = data.storables.filter(function(metadata) {
                        return !!metadata;
                    }).map(function(metadata){
                        return new LogicalTableModel({
                            tableMetadata: metadata
                        });
                    });
                    addModelsToCache(models);
                    var tableIds = sourceIds.concat(unCachedSourceIds);
                    var tableModels = getAvailableModels(tableIds);
                    deferred.resolve(tableModels);
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    deferred.reject(response.data);
                }
            );
            }

            return deferred.promise;
        }

        function getTableSampleValues(logicalTable, numSamples) {
            var sourceId = logicalTable.getId();
            sourceIdToDataDeferred[sourceId] = sourceIdToDataDeferred[sourceId]
            || dataService.getTableData(
                {id: sourceId},
                {batchSize: numSamples * 50}
            ).then(function (response) {
                return response.data;
            });

            return sourceIdToDataDeferred[sourceId];
        }

        function invalidateCache() {
            sourceIdToModel = {};
            sourceIdToDataDeferred = {};
        }

        function updateModelCache(model) {
            var id = model.getId();
            if(Object.has(sourceIdToModel, id)) {
                sourceIdToModel[id] = model;
            }
        }

        return {
            getSourcesModels: getSourcesModels,
            getTableSampleValues: getTableSampleValues,
            invalidateCache: invalidateCache,
            updateModelCache: updateModelCache
        };
    }]);
