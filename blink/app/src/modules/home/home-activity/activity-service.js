/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service that returns the data for the activity feed
 */

'use strict';

blink.app.factory('activityService', ['$q',
    'alertService',
    'Logger',
    'metadataService',
    'ActivityModel',
    'jsonConstants',
    'blinkConstants',
    'strings',
    'UserAction',
    'util',
    function ($q,
          alertService,
          Logger,
          metadataService,
          ActivityModel,
          jsonConstants,
          blinkConstants,
          strings,
          UserAction,
          util) {

        var me = {},

            _logger = Logger.create('activity-service'),

            NUMBER_OF_ACTIVITY_ITEMS = 100;

        function getMetadataListModelPromise(type, subTypes) {
            var userAction = new UserAction(UserAction.FETCH_METADATA_LIST);
            return metadataService.getMetadataListModel(type,
                {
                    batchSize: NUMBER_OF_ACTIVITY_ITEMS,
                    subTypes: subTypes
                }
        ).then(function(reponse) {
            return reponse.data;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
        }

    /**
     * Returns a model for recent metadata activity, used to populate the activity feed
     * @return {Object}     A promise that will resolve with the activity model.
     */
        me.getModel = function () {
            var deferred = $q.defer(),
                requests = [
                    getMetadataListModelPromise(jsonConstants.metadataType.QUESTION_ANSWER_BOOK),
                    getMetadataListModelPromise(jsonConstants.metadataType.PINBOARD_ANSWER_BOOK),
                    getMetadataListModelPromise(
                    jsonConstants.metadataType.LOGICAL_TABLE,
                    [jsonConstants.metadataType.subType.WORKSHEET]
                ),
                    getMetadataListModelPromise(
                    jsonConstants.metadataType.LOGICAL_TABLE,
                    [jsonConstants.metadataType.subType.IMPORTED_DATA]
                )
                ];

        // Make the all the requests in parallel using the once util function
            util.getAggregatedPromise(requests).then(function (data) {
                if (!data || data.length != 4) {
                    _logger.error('Error retrieving data in the activity service - Incomplete response');
                    return;
                }
            // The once util returns responses in an array
                var answerItems    = data[0].getItems(),
                    pinboardItems  = data[1].getItems(),
                    worksheetItems = data[2].getItems(),
                    importedDataItems = data[3].getItems();
                if (!answerItems instanceof Array || !pinboardItems instanceof Array || !worksheetItems instanceof Array || !importedDataItems instanceof Array) {
                    _logger.error('Error retrieving data in the activity service - Invalid response');
                }
            // Add a type property to each item so we can tell them apart once combined all together in the activity feed
                answerItems.forEach(function (item) {
                    item.type = blinkConstants.SAVED_ANSWER_TYPE;
                });
                pinboardItems.forEach(function (item) {
                    item.type = blinkConstants.PINBOARD_TYPE;
                });
                worksheetItems.forEach(function (item) {
                    item.type = blinkConstants.WORKSHEET_TYPE;
                });
                importedDataItems.forEach(function (item) {
                    item.type = blinkConstants.IMPORTED_DATA_TYPE;
                });
            // Concatenate all items into one unsorted array
                var allItems = answerItems.concat(pinboardItems).concat(worksheetItems).concat(importedDataItems);
                deferred.resolve(new ActivityModel(allItems, NUMBER_OF_ACTIVITY_ITEMS));
            }, function () {
                _logger.error('Error retrieving data in the activity service');
            });
            return deferred.promise;
        };

        return me;

    }]);
