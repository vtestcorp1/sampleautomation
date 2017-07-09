/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Data model for activity feed
 */

'use strict';

blink.app.factory('ActivityModel', ['util', function (util) {

    var feedProperties = {
        'saved-answer': {
            createdMessage: 'asked a question',
            editedMessage: 'edited a question',
            route: 'saved-answer',
            linkToOwnerGuid: true
        },
        'pinboard': {
            createdMessage: 'created a pinboard',
            editedMessage: 'edited a pinboard',
            route: 'pinboard',
            linkToOwnerGuid: true
        },
        'worksheet': {
            createdMessage: 'created a worksheet',
            editedMessage: 'edited a worksheet',
            route: 'worksheet',
            linkToOwnerGuid: true
        },
        'imported-data': {
            createdMessage: 'imported some data',
            editedMessage: 'edited imported data',
            route: 'data/importeddata',
            linkToOwnerGuid: false
        }
    };

    /**
     * Add an href property to activity items that will be used so that clicking on the item
     * opens the corresponding answer, pinboard, or worksheet
     *
     * @param  {Object} item  An activity feed item
     */
    function addHref(item) {
        var owner = item.owner,
            itemRoute = feedProperties[item.type].route,
            linkToOwnerGuid = feedProperties[item.type].linkToOwnerGuid;
        if (!itemRoute || linkToOwnerGuid && !owner) {
            return;
        }
        item.href = '#/' + itemRoute;
        if (linkToOwnerGuid) {
            item.href = item.href + '/' + owner;
        }
    }

    /**
     * Returns whether an item was newly created by comparing modified and created timestamps
     * Right now, if the two timestamps are less than 10ms appart, we consider the item newly created
     *
     * @param  {Object} item    An activity feed item
     * @return {boolean}        True if the item was newly created and never modified, false otherwise
     */
    function isNewlyCreated(item) {
        return Math.abs(item.modified - item.created) < 10;
    }

    /**
     * Adds href and message properties and sorts the items in order to generate the activity feed data
     *
     * @param  {Array}  items                 An array of metadata list items
     * @param  {number} maxNbOfActivityItems  The maximum number of activity items
     * @return {Array}                        The sorted feed items with href and message properties
     */
    function generateFeedData(items, maxNbOfActivityItems) {
        // Sort by descending modified date
        items.sort(function (itemA, itemB) {
            return itemB.modified - itemA.modified;
        });
        // Now that the items are sorted, limit the number of items to the limit defined in maxNbOfActivityItems
        items = items.first(maxNbOfActivityItems);
        items.forEach(function (item) {
            var itemProperties = feedProperties[item.type];
            item.message = isNewlyCreated(item) ? itemProperties.createdMessage : itemProperties.editedMessage;
            addHref(item);
        });
        return items;
    }

    /**
     * Constructor for the activity model
     *
     * @constructor
     * @param {Array} items  An array of metadata list items
     */
    var ActivityModel = function (items, maxNbOfActivityItems) {
        this._items = generateFeedData(items, maxNbOfActivityItems);
    };

    /**
     * Get activity feed items
     *
     * @return {Array}  The feed items
     */
    ActivityModel.prototype.getItems = function () {
        return this._items;
    };

    return ActivityModel;

}]);
