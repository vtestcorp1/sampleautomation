/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Data model for user group
 */

'use strict';

blink.app.factory('AdminItemModel', ['dateUtil', function (dateUtil) {

    /**
     * @constructor
     * @param {Object} groupJson
     */
    function AdminItemModel(groupJson) {
        this._itemJson = groupJson;
    }

    AdminItemModel.fromHeaderJson = function(headerJson) {
        var item = new AdminItemModel({
            header: headerJson
        });

        return item;
    };

    AdminItemModel.prototype.toCheckboxModel = function(checked) {
        return {
            isChecked: checked,
            title: this.getName(),
            id: this.getId()
        };
    };

    AdminItemModel.prototype.getName = function () {
        return this._itemJson.header.name;
    };

    /**
     *
     * @param {string} name
     * @returns {AdminItemModel}
     */
    AdminItemModel.prototype.setName = function (name) {
        this._itemJson.header.name = name || '';
        return this;
    };

    AdminItemModel.prototype.getDescription = function () {
        return this._itemJson.header.description;
    };

    /**
     *
     * @param {string} name
     * @returns {AdminItemModel}
     */
    AdminItemModel.prototype.setDescription = function (description) {
        this._itemJson.header.description = description || '';
        return this;
    };

    AdminItemModel.prototype.getId = function () {
        return this._itemJson.header.id;
    };

    AdminItemModel.prototype.getCreatedTimeAgo = function () {
        return dateUtil.epochToTimeAgoString(this._itemJson.header.created);
    };

    AdminItemModel.prototype.getCreatedTimestamp = function () {
        return this._itemJson.header.created;
    };

    AdminItemModel.prototype.getJson = function () {
        return this._itemJson;
    };

    AdminItemModel.prototype.getDisplayName = function () {
        return this._itemJson.header.displayName;
    };

    /**
     *
     * @param {string} displayName
     * @returns {AdminItemModel}
     */
    AdminItemModel.prototype.setDisplayName = function (displayName) {
        this._itemJson.header.displayName = displayName;
        // metadata-list just push displayName in the header, so we need
        // to update it in the JSON and in the header when we change it
        this._itemJson.displayName = displayName;
        return this;
    };

    AdminItemModel.prototype.getViewModel = function() {
        if (!this || !this._itemJson) {
            return {
                id: null,
                isNew: true,
                name: '',
                displayName: '',
                description: '',
                groups: []
            };
        } else {
            return {
                id: this.getId(),
                name: this.getName(),
                displayName: this.getDisplayName(),
                description: this.getDescription(),
                groups: []
            };
        }
    };

    AdminItemModel.prototype.mergeViewModel = function(viewModel) {
        this.setDescription(viewModel.description);
        this.setName(viewModel.name);
        this.setDisplayName(viewModel.displayName);
    };

    return AdminItemModel;
}]);
