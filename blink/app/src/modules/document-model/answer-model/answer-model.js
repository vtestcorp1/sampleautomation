/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Data model for answers
 */

'use strict';

/**
 * AnswerModel encapsulates the detail of an answer data returned by Callosum. An answer is usually composed of one or
 * more answer sheet(s) (AnswerSheetModel) which itself is composed of one or more visualizations and their layout
 * information.
 */
blink.app.factory('AnswerModel', ['Logger',
    'AnswerSheetModel',
    'DocumentPermissionFactory',
    'DocumentModel',
    'jsonConstants',
    'sageUtil',
    'sessionService',
    'util',
    function (Logger,
          AnswerSheetModel,
          DocumentPermissionFactory,
          DocumentModel,
          jsonConstants,
          sageUtil,
          sessionService,
          util) {

        var _logger = Logger.create('answer-model');

        function init(answerModel, answerJson) {
            answerModel._answerJson = answerJson;

        /**
         * A list of containing answer sheets in this answer book.
         * @type {Array.<AnswerSheetModel>}
         */
            answerModel._answerSheets = [];

        // Flag that is set to true when callosum returns a NO_DATA error (i.e. when answer is empty)
            answerModel._hasNoData = false;

        // TODO (sunny): we should not store this information inside the instance as this
        // forces us to always call setMetadataType on every new instance created from
        // json arriving from the server. Instead we should derive this info from the
        // info from inside the json.
            answerModel._metadataType = 'REPORT_BOOK';

            _logger.time(Logger.ProfileMessages.ANSWER_MODEL_PARSING);
            answerModel._parseAnswerSheets();
            _logger.timeEnd(Logger.ProfileMessages.ANSWER_MODEL_PARSING);

            if (!!answerModel.getCurrentAnswerSheet()) {
                var type = answerModel.getCurrentAnswerSheet().getSheetType() + '_ANSWER_BOOK';
                answerModel._docPermission = DocumentPermissionFactory.createPermissiveInstance(type);
            }

        // List of accessible tables from this answer.
            answerModel._accessibleTables = null;
            answerModel._hasUserDefinedName = false;
        }

    /**
     * @constructor
     * @extends DocumentModel
     * @param {Object} answerJson
     */
        var AnswerModel = function (answerJson, isFromDetailsCall) {
            AnswerModel.__super.call(this, answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.HEADER_KEY]);
            init(this, answerJson);

            this.fromDetailsCall = isFromDetailsCall;

        // SCAL-11624: blink needs to ignore incomplete details if the complete flag is set to true
            var isComplete = !!answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.COMPLETE];
            if (!isComplete) {
                this._isCorrupted = true;
                var incompletionDetails = answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.INCOMPLETE_DETAIL];
                if (!!incompletionDetails  && !!incompletionDetails.length) {
                    this._incompletionDetails = incompletionDetails;
                }
            }
        };
        util.inherits(AnswerModel, DocumentModel);

        AnswerModel.prototype.isFromDetailsCall = function () {
            return this.fromDetailsCall;
        };

    /**
     * Returns whether the answer was authored by the current user
     * @return {boolean}
     */
        AnswerModel.prototype.isMine = function () {
            var userId = sessionService.getUserGuid();
            if (!userId) {
                return false;
            }
            return (this.getAuthorId() == userId);
        };

    /**
     *
     * @returns {boolean}
     */
        AnswerModel.prototype.isCorrupted =function () {
            return this._isCorrupted;
        };

    /**
     * Returns the raw json
     * @return {Object}     The AnswerBook json
     */
        AnswerModel.prototype.getJson = function () {
            return this._answerJson;
        };

    /**
     * Returns the AnswerBook metadata
     * @return {Object}     The metadata object
     */
        AnswerModel.prototype.getMetadata = function () {
            return this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY];
        };

    /**
     * Will return true if callosum has returned a JSON that doesn't have a data property
     * @return {boolean}     Whether the answer is empty
     */
        AnswerModel.prototype.hasNoData = function () {
            return this._hasNoData;
        };

    /**
     * Parses the answer json sent by callosum and creates a model for each containing answer sheets.
     * @private
     */
        AnswerModel.prototype._parseAnswerSheets = function () {
            if (!this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY] ||
            !this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY] ||
            !this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY][jsonConstants.SHEETS_KEY]) {
                throw new Error('No answer sheet json specified.');
            }
        // If the json doesn't have a data property, set the _hasNoData flag to true
            if (!this._answerJson[jsonConstants.REPORT_BOOK_DATA_KEY]) {
                this._hasNoData = true;
            }
            var sheets = this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY][jsonConstants.SHEETS_KEY];
            for (var i = 0; i < sheets.length; ++i) {
                this._answerSheets.push(new AnswerSheetModel({
                    sheetJson: sheets[i],
                    sheetData: this._getSheetData(sheets[i]),
                    objectResolver: this.getObjectResolver(),
                    answerModel: this
                }));
            }
        };

    /**
     */
        AnswerModel.prototype.getObjectResolver = function () {
            if (!this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY] ||
            !this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.HEADER_KEY]) {
                return null;
            }

            return this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.HEADER_KEY][jsonConstants.REPORT_BOOK_RESOLVED_OBJECTS_KEY] || null;
        };

    /**
     * Returns the json corresponding to the report book meta data.
     * @return {Object}
     */
        AnswerModel.prototype.getReportBookJson = function () {
            return this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY] || null;
        };

    /**
     * @param {Object} sheetJson
     * @private
     */
        AnswerModel.prototype._getSheetData = function (sheetJson) {
            if (!sheetJson || !sheetJson[jsonConstants.HEADER_KEY]) {
                return null;
            }

            var sheetName = sheetJson[jsonConstants.HEADER_KEY][jsonConstants.ID_KEY] || null;
            if (!sheetName) {
                return null;
            }

            if (!this._answerJson[jsonConstants.REPORT_BOOK_DATA_KEY]) {
                return null;
            }
            var pageData = this._answerJson[jsonConstants.REPORT_BOOK_DATA_KEY][sheetName];
            return pageData || null;
        };

    /**
     * This clears the unwanted state is answer model before sent to callosum to get answers.
     */
        AnswerModel.prototype.cleanStateForAnswerQuery = function () {
            var answerSheet = this.getCurrentAnswerSheet();
            if (!answerSheet) {
                return;
            }
            answerSheet.setVizSelectionAnswerMode(null);
        };

    /**
     * Returns an object containing the metadata and data for a visualization
     * @param {string} id
     * @param {number=} sheetIndex
     * @return {Object}
     */
        AnswerModel.prototype.getVizById = function (id, sheetIndex) {
            sheetIndex = sheetIndex || 0;
            return this.getAnswerSheet(sheetIndex).getVisualization(id);
        };

    /**
     * @param {number} sheetIndex Index in a list of answer sheet in an answer book.
     * @return {AnswerSheetModel} The answer sheet corresponding to sheetIndex
     */
        AnswerModel.prototype.getAnswerSheet = function (sheetIndex) {
            if (sheetIndex >= this._answerSheets.length || sheetIndex < 0) {
                return null;
            }

            return this._answerSheets[sheetIndex];
        };

    /**
     * @return {AnswerSheetModel} The answer sheet that is being shown.
     */
        AnswerModel.prototype.getCurrentAnswerSheet = function () {
        // Note that we currently only have one sheet per answer, so the first
        // sheet is the current sheet. This may change in future.
            return this.getAnswerSheet(0);
        };

    /**
     * Returns the name of this answerbook.
     * @return {string}
     * @override
     */
        AnswerModel.prototype.getName = function () {
            return this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.HEADER_KEY][jsonConstants.NAME_KEY];

        };

    /**
     * Returns the description of this answerbook.
     * @return {string}
     * @override
     */
        AnswerModel.prototype.getDescription = function () {
            return this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.HEADER_KEY][jsonConstants.DESCRIPTION_KEY];
        };

    /**
     * Sets the name of this answerbook (and current answer sheet's name) to name.
     * @param {string} name
     * @override
     */
        AnswerModel.prototype.setName = function (name) {
            this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.HEADER_KEY][jsonConstants.NAME_KEY] = name;
            var answerSheet = this.getCurrentAnswerSheet();
        // TODO(vibhor/shikhar): Clean up the sheet name/description if not needed.
            answerSheet.setName(name);

            if (answerSheet.getSheetType() != 'QUESTION') {
                return;
            }

            var vizs = angular.extend({},
            answerSheet.getVisualizationsOfType('TABLE'),
            answerSheet.getVisualizationsOfType('CHART'));
            Object.values(vizs).each(function (viz) {
                if (!viz.isTitleUserDefined()) {
                    viz.setAutoTitle(name);
                }
            });
        };

        AnswerModel.prototype.hasUserDefinedName = function () {
            return this._hasUserDefinedName;
        };

        AnswerModel.prototype.setHasUserDefinedName = function (hasUserDefinedName) {
            this._hasUserDefinedName = hasUserDefinedName;
        };

    /**
     * Sets the description of this answerbook (and current answer sheet's description) to desc.
     * @param {string} desc
     * @override
     */
        AnswerModel.prototype.setDescription = function (desc) {
            this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.HEADER_KEY][jsonConstants.DESCRIPTION_KEY] = desc;
            this.getCurrentAnswerSheet().setDescription(desc);
        };

    /**
     * Gets the question object from the json of the current answer sheet
     * @return {Object}
     * @override
     */
        AnswerModel.prototype.getQuestionInfo = function () {
            return this.getCurrentAnswerSheet().getQuestionInfo();
        };

        AnswerModel.prototype.isChasmTrapQuery = function () {
            var questionModel = this.getQuestionInfo();
            var isChasmTrapQuery = !!questionModel
            ? questionModel[jsonConstants.IS_CHASM_TRAP_QUERY_KEY]
            : false;
            return isChasmTrapQuery;
        };

    /**
     * Gets the sage question text
     *
     * @return {string}
     */
        AnswerModel.prototype.getQuestionText = function () {
            var questionInfo = this.getQuestionInfo();
            if (!questionInfo || !questionInfo.text) {
                return '';
            }

            return questionInfo.text;
        };

    /**
     * See AnswerSheetModel.getRecognizedTokens.
     * @return {Array.<sage.RecognizedToken>}
     * @override
     */
        AnswerModel.prototype.getRecognizedTokens = function () {
            return this.getCurrentAnswerSheet().getRecognizedTokens();
        };

        AnswerModel.prototype.getQueryTextFromTokens = function () {
            var tokens = this.getRecognizedTokens();
            var query = sageUtil.tokensToQuery(tokens);
            return query;
        };

    /**
     * Return the natural query object for the answer
     *
     * @return {Object}  The natural query object
     */
        AnswerModel.prototype.getNaturalQuery = function () {
            if (!this._answerJson.naturalQuery || !Object.keys(this._answerJson.naturalQuery).length) {
                return null;
            }
            var naturalQueryKeys = Object.keys(this._answerJson.naturalQuery);
            return this._answerJson.naturalQuery[naturalQueryKeys[0]];
        };

    /**
     *
     * @return {number}
     */
        AnswerModel.prototype.getCompletionRatio = function () {
            return this._answerJson.completionRatio;
        };

    /**
     *
     * @param {number} completionRatio
     */
        AnswerModel.prototype.setCompletionRatio = function (completionRatio) {
            this._answerJson.completionRatio = completionRatio;
        };

        AnswerModel.prototype.setNameForFormulaId = function(id, name) {
            if (!this._answerSheets || !this._answerSheets.length || !this.getCurrentAnswerSheet()) {
                return;
            }
        // currently we limit to only one sheet
            this.getCurrentAnswerSheet().setNameForFormulaId(id, name);
        };

    /**
     *
     * @return {string}
     * @override
     */
        AnswerModel.prototype.getMetadataType = function () {
            return this._metadataType;
        };

    /**
     *
     * @param {string} metadataType
     */
        AnswerModel.prototype.setMetadataType = function (metadataType) {
            this._metadataType = metadataType;
        };

    /**
     *
     * @return {string}
     * @override
     */
        AnswerModel.prototype.getMetadataSubType = function () {
            if (this.isAggregatedWorksheet()) {
                return jsonConstants.metadataType.subType.AGGR_WORKSHEET;
            }
            return void 0;
        };

    /**
     *
     * @return {Object}
     * @override
     */
        AnswerModel.prototype.getMetadataJson = function () {
            return this._answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY];
        };

    /**
     * Returns if leaf data is allowed on the answer.
     * @returns {boolean}
     */
        AnswerModel.prototype.canGenerateLeafData = function () {
            return this.getCurrentAnswerSheet().canGenerateLeafData();
        };

    /**
     *
     * @param {Object} json
     * @override
     */
        AnswerModel.prototype.fromMetadataJson = function (json) {
            var answerJson = angular.copy(this._answerJson);
            answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY] = json;
            var answerModel = new AnswerModel(answerJson);
            answerModel.inheritNonJsonProperties(this);
            return answerModel;
        };

    /**
     * @returns {sage.ACContext}
     */
        AnswerModel.prototype.getSageContext = function () {
            return this.getCurrentAnswerSheet().getSageContext();
        };

    /**
     * @returns {int}
     */
        AnswerModel.prototype.getSageContextIndex = function () {
            return this.getCurrentAnswerSheet().getSageContextIndex();
        };

    /**
     *
     * @returns {string}
     */
        AnswerModel.prototype.getCurrentQueryHashKey = function () {
            var context = this.getSageContext();
            if (!context){
                return null;
            }
            var index = this.getSageContextIndex() || 0;
        // NOTE: Callosum migrates legacy queries to wrap in a dummy context where the index is set to -1
            index = index > -1 ? index : 0;
            var currentTable = context.getTables()[index];
            return currentTable.getHashKey();
        };

    /**
     * @param {sage.ACContext} context
     * @param {int} index
     */
        AnswerModel.prototype.setSageContext = function (context, index) {
            this.getCurrentAnswerSheet().setSageContext(context, index);
        };

        function trimModelClientStateForDiff(header, isPinboardRefViz) {
            if (!Object.isObject(header.clientState)) {
                return;
            }

        // we allow the user to play with the chart by changing
        // the legend selection and zooming in/out but since
        // the changes can't (currently) be directly persisted
        // via pinboards we ignore such changes when comparing
            if (isPinboardRefViz) {
                delete header.clientState.visibleSeriesNames;
                delete header.clientState.axisExtremes;
                delete header.clientState.multiColorSeriesColors;
                delete header.clientState.seriesColors;
            }

        //we ignore any dataOffset changes. i.e navigating a chart's pages in pinboard is ignored
            delete header.clientState.dataOffset;

            if (header.clientState.axisExtremes) {
                Object.keys(header.clientState.axisExtremes).each(function(axisType){
                //userMin, userMax, dataMin, dataMax can be dynamically updated by highcharts
                //we have stopped saving these props (SCAL-4711) but we need to keep this logic
                //here for saved answers/pinboards from before the change
                    header.clientState.axisExtremes[axisType].each(function(axisExtremes){
                        delete axisExtremes.userMin;
                        delete axisExtremes.userMax;
                        delete axisExtremes.dataMin;
                        delete axisExtremes.dataMax;
                    });
                });
            }

        // Since ordered column ids field can change due to changes in effective id computation, we do not want
        // to diff on it unless the user has explicitly changed the order.
        // Note that one side effect of change in effective id is that we can also not preserve a previously saved
        // column order but our current product philosophy is to ignore such rare events.

        /* eslint camelcase: 1 */
            if (header.clientState.ordered_column_ids) {
                delete header.clientState.ordered_column_ids;
            }

            if (header.clientState.seriesColors) {
                delete header.clientState.seriesColors;
            }

            if (Object.size(header.clientState) === 0) {
            //an old save viz once loaded will have an empty client state in tables because of a recent change
                delete header.clientState;
            }
        }

        AnswerModel.prototype.containsChangesFromStateStoredOnServer = function(referenceMetadataJson) {
            return this.hasBeenModified(referenceMetadataJson) ||
            this.hasVizSelectionChanged(referenceMetadataJson, this.getMetadataJson());
        };

        AnswerModel.prototype.hasVizSelectionChanged = function(model1, model2) {
            var content1 = !!model1 ? model1.reportContent : null;
            var sheets1 = !!content1 ? content1.sheets : null;
            var content2 = !!model2 ? model2.reportContent : null;
            var sheets2 = !!content2 ? content2.sheets : null;
            var didVizSelectionChanged = false;
            sheets1.each(function(sheet, index){
                if(!sheets2[index]) {
                    didVizSelectionChanged = true;
                    return false;
                }
                var clientState1 = sheet.header.clientState;
                var clientState2 = sheets2[index].header.clientState;
                var vizSelection1 = !!clientState1 ?
                clientState1[jsonConstants.CLIENT_STATE_VIZ_SELECTION_ANSWER_MODE_KEY] : null;
                var vizSelection2 = !!clientState2 ?
                clientState2[jsonConstants.CLIENT_STATE_VIZ_SELECTION_ANSWER_MODE_KEY] : null;

            // In older version of json we didn't have a node for viz-selection.
            // When processed by a new version of our code we automatically add such a
            // node. If this is the only change, since it's automatic, we don't want
            // to prompt the user for saving this change.
            // SCAL-12388, SCAL-11306, SCAL-12607
                var hasVizSelectionBeenIntroduced = (!vizSelection1) && vizSelection2 !== null;
                if (!hasVizSelectionBeenIntroduced && vizSelection1 != vizSelection2) {
                    didVizSelectionChanged = true;
                    return false;
                }
            });
            return didVizSelectionChanged;
        };

        AnswerModel.prototype.metadataEquals = function (model1, model2) {
        // it's 5-10x faster to use native JSON.stringify to compare two models
        // than to copy them using angular.copy and then compare. since in most
        // cases the comparison will result in an early termination it saves
        // CPU to do this check early.
            if (JSON.stringify(model1) === JSON.stringify(model2)) {
                return true;
            }

            model1 = _.cloneDeep(model1);
            model2 = _.cloneDeep(model2);

        //remove the transient state in the json that does not affect comparison of JSONs
            [model1, model2].each(function(model){
                delete model.debugInfo;
                if (model.reportContent && model.reportContent.sheets) {
                    model.reportContent.sheets.each(function(sheet){
                        var clientState = sheet.header.clientState;
                    // CHART answer mode is set as a default. in case of older answers this field is not
                    // set causing spurious warnings about change. Deleting only the default value
                    // ensures that if the value is set to anything other than the default value
                    // changes are still detected (non-default-valid-value != undefined)
                        if (!!clientState) {
                            delete clientState[jsonConstants.CLIENT_STATE_VIZ_SELECTION_ANSWER_MODE_KEY];
                            if (Object.size(clientState) === 0) {
                                delete sheet.header.clientState;
                            }
                        }

                        if (sheet.sheetContent.layout) {
                        //tiles info is ignored in auto layout mode
                            if (sheet.sheetContent.layout.layoutMode === void 0
                            || sheet.sheetContent.layout.layoutMode === 'auto') {
                                delete sheet.sheetContent.layout;
                            } else if (sheet.sheetContent.layout.tiles) {
                            //even in custom layout, a newly added viz can be auto positioned
                            //we don't want to worry about such tiles' positions
                                sheet.sheetContent.layout.tiles = [];
                            }
                        }

                        if (sheet.sheetContent.visualizations) {
                        //for chart viz, there is a default value for visibleSeriesNames in clientState
                        // that is automatically set and should be ignored while looking for user's changes
                            sheet.sheetContent.visualizations.each(function(viz){
                                delete viz.vizContent.title;
                                var vizType = viz.vizContent.vizType;
                                if (vizType === 'FILTER') {
                                    delete viz.vizContent.dataOnDemand;
                                }

                                if (viz.header) {
                                    delete viz.header.name;
                                    delete viz.header.description;
                                    trimModelClientStateForDiff(viz.header, false);
                                }
                            });
                        }
                    });
                }


            //an old save viz once loaded will have an empty client state in tables because of a recent change
                if (model.header && model.header.resolvedObjects) {
                    Object.keys(model.header.resolvedObjects).each(function(refVizId){
                        var refViz = model.header.resolvedObjects[refVizId];
                        if (refViz && refViz.header && refViz.header.clientState) {
                            trimModelClientStateForDiff(refViz.header, true);
                        }
                    });
                }

                if (model.header.resolvedObjects) {
                    Object.keys(model.header.resolvedObjects).each(function(vizId){
                        delete model.header.resolvedObjects[vizId].vizContent.locked;
                    });
                }

            });

            return angular.equals(model1, model2);
        };

        function getClientState(model) {
            if (!model._answerJson) {
                return null;
            }
            var clientState = model._header.clientState;
            if (!clientState) {
                clientState = model._header.clientState = {};
            }
            return clientState;
        }

        AnswerModel.prototype.setUserData = function (key, value) {
            var clientState = getClientState(this);
            clientState[key] = value;
        };

        AnswerModel.prototype.getUserData = function (key) {
            var clientState = getClientState(this);
            return clientState && clientState[key];
        };

        AnswerModel.prototype.clearUserData = function (key) {
            var clientState = getClientState(this);
            if (clientState) {
                delete clientState[key];
            }
        };

        AnswerModel.prototype.hasUserData = function (key) {
            var clientState = getClientState(this);
            return clientState && Object.has(clientState, key);
        };

        AnswerModel.prototype.clone = function () {
            return new AnswerModel(JSON.parse(JSON.stringify(this._answerJson)));
        };

        AnswerModel.prototype.setIsAggregatedWorksheet = function (isAggregatedWorksheet) {
            this._isAggregatedWorksheet = !!isAggregatedWorksheet;
        };

        AnswerModel.prototype.isAggregatedWorksheet = function () {
            return this._isAggregatedWorksheet;
        };

        AnswerModel.prototype.getTableColumns = function() {
            return this.getCurrentAnswerSheet().getTableColumns();
        };

        AnswerModel.prototype.setAccessibleTables = function (accessibleTables) {
            this._accessibleTables = accessibleTables;
        };

        AnswerModel.prototype.getAccessibleTables = function () {
            return this._accessibleTables;
        };


        return AnswerModel;
    }]);
