/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview An interface of a model associated with a document.
 *               This encapsulates the header json and also exposes methods that are expected from different types of models
 *               like answerModel, logicalTableModel by sage, sharable item, etc.
 *
 */

'use strict';

blink.app.factory('DocumentModel', ['DocumentPermissionFactory',
    'jsonConstants',
    'Logger',
    'util',
    function (DocumentPermissionFactory,
          jsonConstants,
          Logger,
          util) {

        var _logger = Logger.create('document-model');

    /**
     * Constructs DocumentModel object.
     * @param headerJson - json object representing the header of the document. It should have id as a field.
     * @constructor
     */
        var DocumentModel = function (headerJson) {
            if (!headerJson || !headerJson[jsonConstants.ID_KEY]) {
                throw new Error('Invalid document model json: ' + JSON.stringify(headerJson));
            }

            this._header = headerJson;

            this._docPermission = DocumentPermissionFactory.createPermissiveInstance(jsonConstants.metadataType.LOGICAL_TABLE);

        // TODO(Jasmeet): Move non document scoped data like tokens out of this model.
            this._recognizedTokens = [];

            this._isCorrupted = false;
            this._isAutoUpgraded = false;
            this._incompletionDetails = null;

        /**
         * Whether on attempt to save this document on
         * callosum, callosum should be forced to save
         * the model even if the model has broken columns.
         * @type {boolean}
         * @private
         */
            this._shouldForceSave = false;
        };

    // Section 1: Methods related to header json

    /**
     * Gets the header json
     * @returns {*}
     */
        DocumentModel.prototype.getHeaderJson = function () {
            return this._header;
        };

    /**
     * Gets the Id from the header json
     * @returns {*}
     */
        DocumentModel.prototype.getId = function () {
            return this._header[jsonConstants.ID_KEY];
        };

    /**
     *
     * @param id {string}
     */
        DocumentModel.prototype.setId = function (id) {
            this._header[jsonConstants.ID_KEY] = id;
        };

    /**
     * Gets the name from the header json
     * @returns {*}
     */
        DocumentModel.prototype.getName = function () {
            return this._header[jsonConstants.NAME_KEY];
        };

    /**
     * Gets the description from the header json
     * @returns {*}
     */
        DocumentModel.prototype.getDescription = function () {
            return this._header[jsonConstants.DESCRIPTION_KEY];
        };

    /**
     * Gets the author Id from the header json
     * @returns {*}
     */
        DocumentModel.prototype.getAuthorId = function () {
            return this._header[jsonConstants.AUTHOR_KEY];
        };

        /**
         * Gets the author name from the header json
         * @returns {*}
         */
        DocumentModel.prototype.getAuthorName = function () {
            return this._header[jsonConstants.AUTHOR_NAME];
        };

        /**
         * Gets the author name from the header json
         * @returns {*}
         */
        DocumentModel.prototype.getAuthorDisplayName = function () {
            return this._header[jsonConstants.AUTHOR_DISPLAY_NAME];
        };

    /**
     * Returns if the document model is hidden.
     * @returns {*}
     */
        DocumentModel.prototype.isHidden = function () {
            return !!this._header[jsonConstants.IS_HIDDEN_KEY];
        };

    /**
     * Sets the name of the document in the header json
     * @param name
     */
        DocumentModel.prototype.setName = function (name) {
            if (!name || !name.length) {
                return;
            }

            this._header[jsonConstants.NAME_KEY] = name;
        };

    /**
     * Sets the description in the header json
     * @param description
     */
        DocumentModel.prototype.setDescription = function (description) {
            this._header[jsonConstants.DESCRIPTION_KEY] = description;
        };

    /**
     * @return {string}
     */
        DocumentModel.prototype.getMetadataType = angular.noop;

    /**
     * @return {string}
     */
        DocumentModel.prototype.getMetadataSubType = angular.noop;

    /**
     * @return {Object}
     */
        DocumentModel.prototype.getMetadataJson = angular.noop;

    /**
     *
     * @param {Object} json
     */
        DocumentModel.prototype.fromMetadataJson = angular.noop;

    /**
     * Use the prototype to navigate the given json and find the document id from it.
     *
     * @param {Object} json
     * @return {string}
     */
        DocumentModel.prototype.getDocumentIdFromJson = function (json) {
            return util.prop(json, [jsonConstants.HEADER_KEY, jsonConstants.ID_KEY]);
        };

    // Section 2: Interfaces of methods common to different kinds of documents

    /**
     *
     * @param {DocumentPermission} docPermission
     */
        DocumentModel.prototype.setPermission = function (docPermission) {
            this._docPermission = docPermission;
        };

    /**
     *
     * @return {DocumentPermission}
     */
        DocumentModel.prototype.getPermission = function () {
            return this._docPermission;
        };

    /**
     * Return true if the document has been created on the backend datastore (postgres).
     * @return {boolean}
     */
        DocumentModel.prototype.isCreatedOnServer = function () {
            return this._header && this._header[jsonConstants.GENERATION_NUM_KEY] >= 0;
        };

        DocumentModel.prototype.setCreatedOnServer = function () {
            if (this._header && this._header[jsonConstants.GENERATION_NUM_KEY]) {
                if (!this._header[jsonConstants.GENERATION_NUM_KEY] || this._header[jsonConstants.GENERATION_NUM_KEY] < 0) {
                    this._header[jsonConstants.GENERATION_NUM_KEY] = 1;
                }
            }
        };

        DocumentModel.prototype.shouldForceSave = function () {
            return this._shouldForceSave;
        };

        DocumentModel.prototype.setShouldForceSave = function (shouldForceSave) {
            this._shouldForceSave = !!shouldForceSave;
        };

        DocumentModel.prototype.getCreatedTime = function () {
            var date = new Date(this._header[jsonConstants.CREATED_KEY]);
            var options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString(void 0, options);
        };

        DocumentModel.prototype.metadataEquals = function (model1, model2) {
            return angular.equals(model1, model2);
        };

        DocumentModel.prototype.containsChangesFromStateStoredOnServer = function(referenceMetadataJson) {
            return this.hasBeenModified(referenceMetadataJson);
        };

    // TODO(Jasmeet): Migrate to a model where we only have two kinds of constructs
    // 1. Has model state changed for properties stored on server.
    // 2. Support diffing logic with params to ignore certain properties.
        DocumentModel.prototype.hasBeenModified = function (referenceMetadataJson) {
            if (!referenceMetadataJson) {
                _logger.error("invalid referenceMetadataJson", referenceMetadataJson);
                return false;
            }

            if (this.hasUserTriggeredChanges()) {
                return true;
            }

            return !this.metadataEquals(referenceMetadataJson, this.getMetadataJson());
        };

        DocumentModel.prototype.setHasUserTriggeredChanges = function (hasUserTriggeredChanges) {
            this._hasUserTriggeredChanges = hasUserTriggeredChanges;
        };

        DocumentModel.prototype.hasUserTriggeredChanges = function () {
            return this._hasUserTriggeredChanges;
        };

    /**
     *
     * @return {boolean}
     */
        DocumentModel.prototype.hasAnyEditorialWarnings = function () {
            return false;
        };

    /**
     *
     * @return {string}
     */
        DocumentModel.prototype.getEditorialWarnings = function () {
            return '';
        };

    /**
     *
     * @return {boolean}
     */
        DocumentModel.prototype.isPermittedToSave = function () {
            return true;
        };

    /**
     * Returns if the Document model is corrupted in any way
     * @returns {boolean}
     */
        DocumentModel.prototype.isCorrupted = function() {
            return this._isCorrupted;
        };

    /**
     * Returns the incompletionDetails
     * @returns {Object}
     */
        DocumentModel.prototype.getCorruptionDetails = function() {
            return this._incompletionDetails;
        };

    // Section 3: Methods related to Sage Driven Documents.
        function getTableGuidsFromTokens(tokens) {
            return tokens.filter(function (rt) {
                return rt.hasTableMetadata();
            }).map(function (rt) {
                return rt.getTableGuid();
            }) || [];
        }

        function getTableGuidsFromContext(quesionInfo) {
            var sageContext = quesionInfo[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
            var sageContextIndex = quesionInfo[jsonConstants.SAGE_CONTEXT_INDEX_KEY];

            var tokens = sageContext.getTables()[sageContextIndex].getTokens();

            var tableGuids = getTableGuidsFromTokens(tokens);

            sageContext.getFormulae().forEach(function(formula) {
                tokens = formula.getTokens();

                tableGuids.concat(getTableGuidsFromTokens(tokens));
            });

            return tableGuids.unique();
        }

    /**
     * Reads the sage tokens in the given document and returns the list of tables that the tokens belong to.
     *
     * @return {Array.<string>=}
     */
        DocumentModel.prototype.getSageDataScope = function () {
            var tableGuids = getTableGuidsFromContext(this.getQuestionInfo());
        // NOTE: In case of tokens like 'average' etc table guid is null.
            return tableGuids.filter(function(tableGuid){
                return !!tableGuid;
            });
        };

    /**
     * @returns {Array<string>} the table guid of the root table of the current query in
     * the document
     */
        DocumentModel.prototype.getQueryRoots = function () {
            var recognizedTokens = this.getRecognizedTokens();

            if (!recognizedTokens || !recognizedTokens.length) {
                return null;
            }

            var queryRoots = [];

            recognizedTokens.forEach(function(recognizedToken) {
                var joinPaths = recognizedToken.getJoinPaths();
                if (!joinPaths || !joinPaths.length) {
                    _logger.warn('join path missing from recognized token', recognizedTokens[0]);
                    return null;
                }

                joinPaths.forEach(function(joinPath) {
                    var joinPathRoot = joinPath.getRootTableGuid();
                    if (queryRoots.indexOf(joinPathRoot) < 0) {
                        queryRoots.push(joinPathRoot);
                    }
                });
            });

            return queryRoots;
        };

        DocumentModel.prototype.isAutoUpgraded = function () {
            return this._isAutoUpgraded;
        };

        DocumentModel.prototype.setIsAutoUpgraded = function (isAutoUpgraded) {
            this._isAutoUpgraded = !!isAutoUpgraded;
        };

        DocumentModel.prototype.getRecognizedTokens = function () {
            return this._recognizedTokens;
        };

        DocumentModel.prototype.setRecognizedTokens = function (recognizedTokes) {
            this._recognizedTokens = recognizedTokes;
        };

        DocumentModel.prototype.inheritNonJsonProperties = function (baseDocument) {
            this.setPermission(baseDocument.getPermission());
            this.setIsAutoUpgraded(baseDocument.isAutoUpgraded());
            this._isCorrupted = baseDocument.isCorrupted();
            this._incompletionDetails = baseDocument.getCorruptionDetails();
            this.setShouldForceSave(baseDocument.shouldForceSave());
            this.setRecognizedTokens(baseDocument.getRecognizedTokens());
        };

        DocumentModel.prototype.getTimeToLive = function () {
            return -1;
        }

        return DocumentModel;
    }]);
