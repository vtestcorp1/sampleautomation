/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';

blink.app.factory('TableFilterModel', ['jsonConstants',
    'jsUtil',
    function (jsonConstants,
    jsUtil) {

        function TableFilterModel (definition) {
            definition = definition || {};
            this._header = definition.header || {};
            this._content = definition.content || {};
            var serializedResolvedText = this._content[jsonConstants.TABLE_FILTER_RESOLVED_TEXT_KEY];
            if(serializedResolvedText) {
                this._tokens = serializedResolvedText.map(function(serializedToken) {
                    return sage.deserialize(serializedToken, sage.RecognizedToken);
                });
            }
        }

        TableFilterModel.prototype.getName = function () {
            return this._header.name;
        };

        TableFilterModel.prototype.setName = function (name) {
            this._header.name = name;
        };

        TableFilterModel.prototype.getDescription = function () {
            return this._header.description;
        };

        TableFilterModel.prototype.setDescription = function (desc) {
            this._header.description = desc;
        };

        TableFilterModel.prototype.getOwner = function () {
            return this._header.owner;
        };

        TableFilterModel.prototype.setOwner = function (owner) {
            this._header.owner = owner;
        };

        TableFilterModel.prototype.getExpression = function () {
            return this._content.filterProto;
        };

        TableFilterModel.prototype.setExpression = function (expression) {
            this._content.filterProto = expression;
        };

        TableFilterModel.prototype.getResolvedText = function () {
            return this._content[jsonConstants.TABLE_FILTER_RESOLVED_TEXT_KEY];
        };

        TableFilterModel.prototype.getTokens = function () {
            return this._tokens;
        };

        TableFilterModel.prototype.setTokens = function (tokens) {
            this._tokens = tokens;
            this._content[jsonConstants.TABLE_FILTER_RESOLVED_TEXT_KEY] =
            tokens.map(sage.serialize);
        };

        TableFilterModel.prototype.setResolvedText = function (resolvedText) {
            this._content[jsonConstants.TABLE_FILTER_RESOLVED_TEXT_KEY] = resolvedText;
            this._tokens = resolvedText.map(function(serializedToken) {
                return sage.deserialize(serializedToken, sage.RecognizedToken);
            });
        };

        TableFilterModel.prototype.getFilterToken = function () {
            return this._content[jsonConstants.TABLE_FILTER_RESOLVED_TOKEN_KEY] &&
            sage.deserialize(this._content[jsonConstants.TABLE_FILTER_RESOLVED_TOKEN_KEY], sage.RecognizedToken);
        };

        TableFilterModel.prototype.setFilterToken = function (resolvedToken) {
            this._content[jsonConstants.TABLE_FILTER_RESOLVED_TOKEN_KEY] = sage.serialize(resolvedToken);
        };

        TableFilterModel.prototype.canEditJoinPath = function () {
            var filterToken = this.getFilterToken();
            return !!filterToken && filterToken.canEditJoinPath();
        };

        TableFilterModel.prototype.getDefinition = function () {
            var content = angular.copy(this._content);
            content.filterProto = sage.serialize(content.filterProto);

            return JSON.stringify({
                header: this._header,
                content: content
            });
        };

        TableFilterModel.prototype.generateId = function () {
            this._header.id = this._header.id || jsUtil.generateUUID();
        };

        TableFilterModel.prototype.getId = function () {
            return this._header.id;
        };

        return TableFilterModel;
    }]);
