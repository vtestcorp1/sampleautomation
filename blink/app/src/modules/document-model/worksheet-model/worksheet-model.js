/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Model for worksheet. Worksheet model on high level extends the  logical table model.
 */

'use strict';

blink.app.factory('WorksheetModel', ['autoCompleteObjectUtil',
    'jsonConstants',
    'LogicalTableModel',
    'Logger',
    'QuestionModel',
    'TableModel',
    'blinkConstants',
    'strings',
    'util',
    function (autoCompleteObjectUtil,
          jsonConstants,
          LogicalTableModel,
          Logger,
          QuestionModel,
          TableModel,
          blinkConstants,
          strings,
          util) {

        var _logger = Logger.create('worksheet-model');

    /**
     * @param json
     * @constructor
     */
        var WorksheetModel = function (json) {
            WorksheetModel.__super.call(this, json);

            var questionJson = this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY]
            [jsonConstants.QUESTION_KEY];
            this.questionInfo = new QuestionModel(questionJson);
        };

        util.inherits(WorksheetModel, LogicalTableModel);

    /**
     * Gets the question object from the json
     *
     * @return {*}
     */
        WorksheetModel.prototype.getQuestionInfo = function () {
            return this.questionInfo;
        };
    /**
     * @param {sage.ACContext} context
     * @param {index} index
     */
        WorksheetModel.prototype.setSageContext = function(context) {
            var questionInfo = this.getQuestionInfo();

            questionInfo[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;
            questionInfo[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = 0;
        };

    /**
     * @returns {sage.ACContext}
     */
        WorksheetModel.prototype.getSageContext = function() {
            try {
                var questionInfo = this.getQuestionInfo();
                if (!questionInfo) {
                    return null;
                }
                return _.cloneDeep(questionInfo[jsonConstants.SAGE_CONTEXT_PROTO_KEY]);
            } catch(error) {
                _logger.warn('error in deserializing context', error);
                return null;
            }
        };

    /**
     * @returns {int}
     */
        WorksheetModel.prototype.getSageContextIndex = function() {
            var questionInfo = this.getQuestionInfo();
            if (!questionInfo) {
                return null;
            }
            return questionInfo[jsonConstants.SAGE_CONTEXT_INDEX_KEY];
        };

    /**
     *
     * @return {string}
     * @override
     */
        WorksheetModel.prototype.getMetadataSubType = function () {
            return this._metadataJson[jsonConstants.TYPE_KEY];
        };

    /**
     * Gets the sage recognized tokens. If not cached, Parses the json string form of list of recognized tokens and converts each json
     * object into a first class RecognizedToken.
     *
     * @return {Array.<sage.RecognizedToken>}
     */
        WorksheetModel.prototype.getRecognizedTokens = function () {
            var sageContext = this.getSageContext();
            var contextIndex = this.getSageContextIndex();
            var table = sageContext.getTables()[contextIndex];
            return table.getTokens();
        };

    /**
     * Return the natural query object for the worksheet
     *
     * @return {Object}  The natural query object
     */
        WorksheetModel.prototype.getNaturalQuery = function () {
            if (!this._tableJson.naturalQuery || !Object.keys(this._tableJson.naturalQuery).length) {
                return null;
            }
            var naturalQueryKeys = Object.keys(this._tableJson.naturalQuery),
                naturalQuery = this._tableJson.naturalQuery[naturalQueryKeys[0]];
            naturalQuery.queryType = 'worksheetList';
        // Remove this blink fix when callosum team has fixed SCAL-4169
            naturalQuery.topCount = 0;
            return naturalQuery;
        };

        WorksheetModel.prototype.getWorksheetType = function () {
            if (!this._metadataJson || !this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY]) {
                return '';
            }

            return this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY][jsonConstants.WORKSHEET_TYPE];
        };

        WorksheetModel.prototype.setWorksheetType = function (worksheetType) {
            if (!this._metadataJson || !this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY]) {
                return;
            }

            this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY][jsonConstants.WORKSHEET_TYPE] = worksheetType;
            return;
        };

        WorksheetModel.prototype.fromMetadataJson = function (json) {
            var worksheetJson = _.cloneDeep(this.getJson());
            worksheetJson[jsonConstants.LOGICAL_TABLE_METADATA_KEY] = json;
            var worksheetModel = new WorksheetModel(worksheetJson);
            worksheetModel.inheritNonJsonProperties(this);
            return worksheetModel;
        };

    /**
     *
     * @return {boolean}
     * @override
     */
        WorksheetModel.prototype.hasAnyEditorialWarnings = function () {
            if (!this._slickTableModel) {
                return false;
            }

            return this._slickTableModel.hasAnyColumnsWithRepeatedNames();
        };

    /**
     *
     * @return {string}
     * @override
     */
        WorksheetModel.prototype.getEditorialWarnings = function () {
            return strings.worksheets.MULTIPLE_COL_SAME_NAME_WARNING;
        };

        return WorksheetModel;
    }]);
