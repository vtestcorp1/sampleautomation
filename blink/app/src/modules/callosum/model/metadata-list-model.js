/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Data model for metadata list
 */

'use strict';

/**
 * Metadata List model
 */
blink.app.factory('MetadataListModel', ['dateUtil', 'sessionService', 'jsonConstants',
    function (dateUtil, sessionService, jsonConstants) {

        var HEADERS_KEY = 'headers',
            OWNER_KEY = 'owner';

    /**
     * @constructor
     * @param {Object} metadataList
     */
        var MetadataListModel = function (metadataList) {
            this._metadataList = metadataList;
            this._effectivePermissions = null;
        };

        MetadataListModel.prototype.getItems = function () {
            var myGuid = sessionService.getUserGuid();
            if (!myGuid) {
                return;
            }
            if (!this._metadataList || !this._metadataList[HEADERS_KEY] || !this._metadataList[HEADERS_KEY].length) {
                return [];
            }
            return this._metadataList[HEADERS_KEY].map(function (item) {
                item.timeAgo = dateUtil.epochToTimeAgoString(item.modified);
                if (item.author == myGuid) {
                // We use the "ownedByMe" property to track if an item is owned by the current user
                    item.ownedByMe = true;
                }
                var clientState = item[jsonConstants.CLIENT_STATE_KEY];
                item.mode = clientState ? clientState[jsonConstants.CLIENT_STATE_ANSWER_MODE_KEY] : null;
                return item;
            });
        };

        return MetadataListModel;

    }]);
