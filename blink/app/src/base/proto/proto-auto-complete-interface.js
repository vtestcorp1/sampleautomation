/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com), Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview A wrapper over the AutoComplete Types and Service
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

(function() {

    //region ACRequestInfo setters
    /**
     * Sets the auth token in request info.
     * @param authToken
     */
    sage.ACRequestInfo.prototype.setAuthToken = function(authToken) {
        this.auth_token = authToken;
    };

    /**
     * Sets client timestamp in request info.
     * @param clientTimestamp
     */
    sage.ACRequestInfo.prototype.setClientTimestamp = function(clientTimestamp) {
        this.client_timestamp_ms = clientTimestamp;
    };

    /**
     * Disables out of scope matches the current request.
     */
    sage.ACRequestInfo.prototype.enableOutOfScopeMatches = function() {
        this.addFlag(sage.FeatureFlag.ENABLE_OUT_OF_SCOPE_MATCHES);
    };

    /**
     * Writes out scope matches the current request.
     */
    sage.ACRequestInfo.prototype.enableWriteRequestSnapshot = function() {
        this.addFlag(sage.FeatureFlag.WRITE_REQUEST_SNAPSHOT);
    };

    /**
     * Enable suggestions from search history.
     */
    sage.ACRequestInfo.prototype.enableSearchHistory = function() {
        this.addFlag(sage.FeatureFlag.ENABLE_SEARCH_HISTORY);
    };

    /**
     * Disables object search for the current request.
     */
    sage.ACRequestInfo.prototype.disableObjectSearch = function() {
        this.addFlag(sage.FeatureFlag.DISABLE_OBJECT_SEARCH);
    };

    /**
     * Sets flag for sage requests.
     * @param {int} flag
     */
    sage.ACRequestInfo.prototype.addFlag = function (flag) {
        if (!this.flag) {
            this.flag = [];
        }

        var alreadyExists = this.flag.indexOf(flag) > 0;
        if (!alreadyExists) {
            this.flag.push(flag);
        }
    };

    sage.ACRequestInfo.prototype.setIsAnswerPage = function () {
        this.is_answer_page = true;
    };

    /**
     *
     * @param locale_type {LocalType.E}
     */
    sage.ACRequestInfo.prototype.setLocale = function(locale) {
        this.locale = locale;
    };

    /**
     *
     * @param worksheetId {String}
     */
    sage.ACRequestInfo.prototype.setWorksheetId = function (worksheetId) {
        this.worksheet_guid = worksheetId;
    };

    sage.ACRequestInfo.prototype.setTimeBudget = function (timeBudget) {
        this.time_budget_ms = timeBudget;
    };

    sage.ACRequestInfo.prototype.setDeleteInvalidPhrases = function (deleteInvalidPhrases) {
        this.delete_invalid_phrases = deleteInvalidPhrases;
    };

    sage.ACRequestInfo.prototype.setUserFeedback = function (userFeedback) {
        this.user_feedback = new sage.UserFeedback();
        this.user_feedback.user_rating = userFeedback.userRating || sage.UserRating.UNKNOWN;
        this.user_feedback.description = userFeedback.description || "";
    };

    //endregion

    //region ACTableRequest getters
    /**
     * Gets the list input tokens from table request.
     * @returns [sage.RecognizedToken]
     */
    sage.ACTableRequest.prototype.getInputTokens = function () {
        return this.input_token;
    };

    /**
     * Gets the currently edited token index in the table request.
     * @returns {*|sage.ACTableRequest.currently_edited_token}
     */
    sage.ACTableRequest.prototype.getCurrentlyEditedTokenIndex = function () {
        return this.currently_edited_token;
    };

    /**
     * @return {boolean} exactMatchOnly
     */
    sage.ACTableRequest.prototype.isExactMatchOnly = function () {
        return this.exact_match_only;
    };

    /**
     * Sets input tokens for the table request
     * @param tokens
     */
    sage.ACTableRequest.prototype.setInputTokens = function (tokens) {
        this.input_token = tokens;
    };

    /**
     * Sets the currently edited token index in the table request.
     * @param tokenIndex
     */
    sage.ACTableRequest.prototype.setCurrentlyEditedToken = function (tokenIndex) {
        this.currently_edited_token = tokenIndex;
    };

    /**
     * Sets the end token index non-inclusive (only accounted when exact match is set).
     */
    sage.ACTableRequest.prototype.setEndIndexExactMatch = function (tokenIndex) {
        this.end_index_for_exact_match = tokenIndex;
    };

    /**
     * Sets the cursor offset in the edited token for table requests.
     * @param cursorOffsetInToken
     */
    sage.ACTableRequest.prototype.setCursorOffsetInToken = function (cursorOffsetInToken) {
        this.cursor_offset_in_token = cursorOffsetInToken;
    };

    /**
     * @returns {Array.<String>}
     */
    sage.ACTableRequest.prototype.getDataScopeLogicalTables = function () {
        if (this.data_scope && this.data_scope.logical_table) {
            return this.data_scope.logical_table;
        }
        return [];
    };

    /**
     * @param {Array.<String>} tables
     */
    sage.ACTableRequest.prototype.setDataScopeLogicalTables = function (tables) {
        tables = tables || [];
        this.data_scope = this.data_scope || new sage.DataScope();
        this.data_scope.logical_table = tables;
    };

    /**
     * @param {String} rootGuid
     */
    sage.ACTableRequest.prototype.setDataScopeForcedRoot = function (rootGuid) {
        this.data_scope = this.data_scope || new sage.DataScope();
        this.data_scope.forced_root = rootGuid;
    };

    /**
     * Sets boolean flag in table request to fetch exact matches only.
     * @param exactMatchOnly
     */
    sage.ACTableRequest.prototype.setExactMatchOnly = function (exactMatchOnly) {
        this.exact_match_only = exactMatchOnly;
    };

    /**
     * Sets boolean flag in table request fetch single token completions.
     * @param singleTokenCompletionsOnly
     */
    sage.ACTableRequest.prototype.setSingeTokenCompletionsOnly = function (singleTokenCompletionsOnly) {
        this.single_token_completions_only = singleTokenCompletionsOnly;
    };

    /**
     * Sets the count of max join paths in table request.
     * @param maxJoinPaths
     */
    sage.ACTableRequest.prototype.setMaxJoinPaths = function (maxJoinPaths) {
        this.max_join_paths = maxJoinPaths;
    };

    /**
     * Sets the count of max completions in table request.
     * @param maxCompletions
     */
    sage.ACTableRequest.prototype.setMaxCompletions = function (maxCompletions) {
        this.max_completions = maxCompletions;
    };

    /**
     * Sets whether the type of formula is row level Security
     * @param {boolean} isRowSecurityFormula
     */
    sage.ACTableRequest.prototype.setIsRowSecurityFormula =
        function(isRowSecurityFormula) {
            this.is_row_security_formula = !!isRowSecurityFormula;
        };
    //endregion

    //region ACContext getters
    /**
     * Gets the list of tables from ACContext.
     * @returns {Array.<sage.ACTable>}
     */
    sage.ACContext.prototype.getTables = function () {
        return this.table;
    };

    /**
     * @returns {Array.<sage.ACJoin>}
     */
    sage.ACContext.prototype.getJoins = function () {
        return this.join;
    };

    /**
     * @returns {Array.<sage.ACFormula>}
     */
    sage.ACContext.prototype.getFormulae = function () {
        return Object.values(this.formula);
    };

    /**
     * @returns {Object}
     */
    sage.ACContext.prototype.getFormulaeMap = function () {
        return this.formula;
    };

    /**
     *
     * @param formulaeMap
     */
    sage.ACContext.prototype.setFormulaeMap = function (formulaeMap) {
        this.formula = formulaeMap;
    };

    /**
     * Sets the list of tables from ACContext.
     * @param {Array.<sage.ACTable>} tables
     */
    sage.ACContext.prototype.setTables = function (tables) {
        this.table = tables;
    };

    /**
     * Sets the list of table joins in the ACContext.
     * @param {Array.<sage.ACJoin>} joins
     */
    sage.ACContext.prototype.setJoins = function (joins) {
        this.join = joins;
    };
    //endregion

    //region ACTable getters
    /**
     * Gets the tokens for the current table.
     * @returns {Array.<sage.RecognizedToken>}
     */
    sage.ACTable.prototype.getTokens = function() {
        return this.token;
    };

    /**
     * Gets the query for the current table.
     * @returns {String}
     */
    sage.ACTable.prototype.getQuery = function() {
        return this.query;
    };

    /**
     *
     * @returns {string}
     */
    sage.ACTable.prototype.getHashKey = function () {
        return this.hash_key;
    };
    //endregion

    //region FilterResponse getters
    /**
     * Gets the filter token
     * @returns {thrift.Sage.RecognizedToken}
     */
    sage.TableFilterResponse.prototype.getFilterToken = function () {
        return this.added_filter;
    };

    /**
     * Gets the filter binary expression
     * @returns {String}
     */
    sage.TableFilterResponse.prototype.getExpression = function () {
        return this.filter_expression;
    };

    /**
     * @returns {Array.<sage.JoinPathCollection>} List of join path choices.
     */
    sage.TableFilterResponse.prototype.getJoinPathAmbiguities = function () {
        return this.join_path_ambiguity;
    };

    /**
     *
     * @returns {boolean}
     */
    sage.TableFilterResponse.prototype.hasMultipleJoinPathChoices = function () {
        if (!this.join_path_ambiguity || !this.join_path_ambiguity.length) {
            return false;
        }

        var joinChoices = this.join_path_ambiguity[0].getJoinPathCandidates();
        return joinChoices && joinChoices.length > 1;
    };
    //endregion

    //region AnswerResponse getters
    /**
     * Gets the sage error from the table response wrapper.
     * @returns {sage.ErrorCode}
     */
    sage.AnswerResponse.prototype.getErrorCode = function () {
        return this.error_code;
    };

    /**
     * Gets the error message from the table response wrapper.
     * @returns {sage.AnswerResponse.error_message|*}
     */
    sage.AnswerResponse.prototype.getErrorMessage = function () {
        return this.error_message;
    };

    /**
     * Gets the response info from the table response wrapper.
     * @returns {sage.AnswerResponse.info|*}
     */
    sage.AnswerResponse.prototype.getInfo = function () {
        return this.info;
    };

    /**
     * Gets the context from the table response wrapper.
     * @returns {sage.AnswerResponse.context|*}
     */
    sage.AnswerResponse.prototype.getContext = function () {
        return this.context;
    };

    /**
     * Gets the table response from the table response wrapper.
     * @returns {sage.ACTableResponse}
     */
    sage.AnswerResponse.prototype.getTableResponse = function () {
        return this.resp;
    };

    /**
     * @return {Array.<sage.Object>}
     */
    sage.AnswerResponse.prototype.getObjectResults = function () {
        return this.object_result;
    };
    //endregion

    //region AnswerResponse Extension functions
    /**
     * Gets the table error for table at given index.
     *
     * @param tableIndex
     * @returns {sage.ErrorCollection}
     */
    sage.AnswerResponse.prototype.getTableError = function (tableIndex) {
        return this.getContext().getTables()[tableIndex].getTableError();
    };

    /**
     * Gets the table query for table at given index.
     *
     * @param tableIndex
     * @returns {*}
     */
    sage.AnswerResponse.prototype.getTableQuery = function (tableIndex) {
        return this.getContext().getTables()[tableIndex].query;
    };

    /**
     * Gets the tokens corresponding the table at the given index.
     * @param tableIndex
     * @returns {*}
     */
    sage.AnswerResponse.prototype.getTableTokens = function (tableIndex) {
        return this.getContext().getTables()[tableIndex].token;
    };
    //endregion

    //region WorksheetResponse getters
    /**
     * Gets the table representing the worksheet.
     * @returns {sage.ACContext}
     */
    sage.WorksheetResponse.prototype.getContext = function () {
        return this.context;
    };

    /**
     * Gets the table response for the request
     * @returns {sage.ACTableResponse}
     */
    sage.WorksheetResponse.prototype.getResponse = function () {
        return this.resp;
    };

    /**
     * Gets the sage error from the worksheet response wrapper.
     * @returns {sage.ErrorCollection}
     */
    sage.WorksheetResponse.prototype.getTableError = function (tableIndex) {
        return this.getContext().getTables()[tableIndex].getTableError();
    };

    /**
     * Gets the response info from the table response wrapper.
     * @returns {sage.AnswerResponse.info|*}
     */
    sage.WorksheetResponse.prototype.getInfo = function () {
        return this.info;
    };

    /**
     * Gets the error message from the worksheet response wrapper.
     * @returns {String}
     */
    sage.WorksheetResponse.prototype.getErrorMessage = function () {
        return this.error_message;
    };
    //endregion

    //region FormulaResponse getters
    /**
     * Gets the table representing the worksheet.
     * @returns {sage.ACTable}
     */
    sage.FormulaResponse.prototype.getWorksheet = function () {
        return this.table;
    };

    /**
     * Gets the table response for the request
     * @returns {sage.ACTableResponse}
     */
    sage.FormulaResponse.prototype.getResponse = function () {
        return this.resp;
    };

    /**
     * Gets the sage error from the formula response.
     * @returns {sage.Error}
     */
    sage.FormulaResponse.prototype.getError = function () {
        return this.table.error.error;
    };

    /**
     * Gets the error message from the worksheet response wrapper.
     * @returns {String}
     */
    sage.FormulaResponse.prototype.getErrorMessage = function () {
        return this.error_message;
    };
    //endregion

    //region ACFormula getters setters
    /**
     * returns {string}
     */
    sage.ACFormula.prototype.getHeader = function() {
        if (!this.header) {
            this.header = new sage.EntityHeader();
        }
        return this.header;
    };

    sage.ACFormula.prototype.getId = function() {
        return this.getHeader().guid;
    };

    /**
     * @returns {string} name
     */
    sage.ACFormula.prototype.getName = function() {
        return this.getHeader().name;
    };

    /**
     * param {string} id
     */
    sage.ACFormula.prototype.setId = function(id) {
        this.getHeader().guid = id;
    };

    /**
     * @param {string} name
     */
    sage.ACFormula.prototype.setName = function(name) {
        this.getHeader().name = name;
    };

    /**
     * @returns {string}
     */
    sage.ACFormula.prototype.getExpression = function() {
        return this.expression;
    };

    /**
     * param {string} expression
     */
    sage.ACFormula.prototype.setExpression = function(expression) {
        this.expression = expression;
    };

    /**
     * @returns {sage.RecognizedToken}
     */
    sage.ACFormula.prototype.getTokens = function() {
        return this.token;
    };

    /**
     * param {Array.<sage.RecognizedToken> tokens
     */
    sage.ACFormula.prototype.setTokens = function(tokens) {
        this.token = tokens;
    };

    /**
     * @returns {sage.ColumnType}
     */
    sage.ACFormula.prototype.getColumnType = function() {
        return this.column_type;
    };

    /**
     * param {Array.<sage.ColumnType> type
     */
    sage.ACFormula.prototype.setColumnType = function(type) {
        this.column_type = type;
    };

    /**
     * @returns {sage.DataType}
     */
    sage.ACFormula.prototype.getDataType = function() {
        return this.data_type;
    };

    /**
     * param {Array.<sage.DataType> type
     */
    sage.ACFormula.prototype.setDataType = function(type) {
        this.data_type = type;
    };

    /**
     * @returns {sage.AggregationType}
     */
    sage.ACFormula.prototype.getAggregationType = function() {
        return this.aggregation_type;
    };

    /**
     * param {sage.AggregationType} type
     */
    sage.ACFormula.prototype.setAggregationType = function(type) {
        this.aggregation_type = type;
    };
    //endregion

    //region FormattedTokens
    /**
     *
     * @returns {sage.RecognizedToken[]}
     */
    sage.FormattedTokens.prototype.getTokens = function () {
        return this.token;
    };

    /**
     *
     * @returns {sage.PhraseDefinition[]}
     */
    sage.FormattedTokens.prototype.getPhrases = function () {
        return this.phrase;
    };
    //endregion

    //region ACTable getters
    /**
     *
     * @returns {String}
     */
    sage.ACTable.prototype.getId = function () {
        return this.header.guid;
    };

    /**
     *
     * @returns {sage.FormattedTokens|*}
     */
    sage.ACTable.prototype.getFormattedTokens = function () {
        if (!this.formatted) {
            this.formatted = new sage.FormattedTokens();
        }
        return this.formatted;
    };

    /**
     *
     * @returns {sage.RecognizedToken[]}
     */
    sage.ACTable.prototype.getTokens = function () {
        return !!this.formatted ? this.formatted.token : null;
    };

    /**
     *
     * @returns {sage.PhraseDefinition[]}
     */
    sage.ACTable.prototype.getPhrases = function () {
        return !!this.formatted ? this.formatted.phrase : null;
    };

    /**
     * @param {String} guid
     * @param {String} name
     */
    sage.ACTable.prototype.setColumnName = function(guid, name) {
        if (!this.column_name) {
            this.column_name = {};
        }
        this.column_name[guid] = name;
    };

    sage.ACTable.prototype.clearColumnNames = function() {
        this.column_name = {};
    };

    /**
     * Gets the sage error from the ACTable response.
     * @returns {sage.Error}
     */
    sage.ACTable.prototype.getTableError = function() {
        return this.error.error;
    };
    //endregion

    //region ACTable extensions
    /**
     *
     * @returns {string}
     */
    sage.ACTable.prototype.getSystemGeneratedName = function () {
        var tokens = this.getTokens();
        return tokens.map(function(token){
            return token.getTokenText();
        }).join(' ');
    };

    // TODO(Jasmeet): 3.1 blink should not be setting tokens in the Table.
    /**
     * {Array.<sage.RecognizedToken>} tokens
     */
    sage.ACTable.prototype.setTokens = function(tokens) {
        if (!this.formatted) {
            this.formatted = new sage.FormattedTokens();
        }
        this.formatted.token = tokens;
    };
    //endregion

    //region ErrorCollection getters
    /**
     * Gets the error for the table.
     * @returns {sage.ErrorCode}
     */
    sage.ErrorCollection.prototype.getErrorCode = function () {
        return this.error_code;
    };

    /**
     * Gets the error message for the table.
     * @returns {String}
     */
    sage.ErrorCollection.prototype.getErrorMessage = function () {
        return this.error_message;
    };

    /**
     * Gets the error severity for the table.
     * @returns {sage.ErrorCollection.severity|*}
     */
    sage.ErrorCollection.prototype.getSeverity = function () {
        return this.severity;
    };

    /**
     * Gets the error message position for the table.
     * @returns {sage.ErrorCollection.error_message_position|*}
     */
    sage.ErrorCollection.prototype.getErrorMessagePosition = function () {
        return this.error_message_position;
    };

    /**
     * Gets the error span for the table.
     * @returns {sage.ErrorCollection.error_span|*}
     */
    sage.ErrorCollection.prototype.getErrorSpan = function () {
        return this.error_span;
    };
    //endregion

    //region ACTableResponse response getters
    /**
     * Gets the header for table response.
     * @returns {sage.ACTableResponse.header|*}
     */
    sage.ACTableResponse.prototype.getHeader = function () {
        return this.header;
    };

    /**
     * Gets the new tokens for the table.
     * @return {Array.<sage.RecognizedToken>}
     */
    sage.ACTableResponse.prototype.getNewTokens = function () {
        return this.new_token;
    };

    /**
     * Language completions are the keyword and operator tokens like 'sum', 'count', '=' etc
     *
     * @return {Array.<sage.Completion>}
     */
    sage.ACTableResponse.prototype.getLanguageCompletions = function () {
        return this.language_completion;
    };

    /**
     * Data completions are the value tokens like 'revenue', 'quantity' etc.
     *
     * @return {Array.<sage.Completion>}
     */
    sage.ACTableResponse.prototype.getDataCompletions = function () {
        return this.data_completion;
    };

    /**
     * Gets the query completions from the table response.
     * @returns {Array.<sage.QueryCompletion>}
     */
    sage.ACTableResponse.prototype.getQueryCompletions = function () {
        return this.query_completion;
    };

    /**
     * Gets the formula completions from the table response.
     * @returns {sage.ACTableResponse.formula_completions|*}
     */
    sage.ACTableResponse.prototype.getFormulaCompletions = function () {
        return this.formula_completion;
    };

    /**
     * @returns {number} token index where the completion should be.
     */
    sage.ACTableResponse.prototype.getCompletionPosition = function () {
        return this.completion_position;
    };

    /**
     * @return {boolean}
     */
    sage.ACTableResponse.prototype.getUniqueCompletionUsedForQuery = function () {
        return this.unique_completion_used_for_query;
    };

    /**
     * @returns {sage.ACTableResponse.formula_ghost|*}
     */
    sage.ACTableResponse.prototype.getFormulaGhost = function () {
        return this.formula_ghost;
    };

    /**
     * @returns {sage.ACTableResponse.phrases|*}
     */
    sage.ACTableResponse.prototype.getPhrases = function () {
        return this.phrase;
    };

    /**
     * @returns {Array.<sage.JoinPathCollection>} List of join path choices.
     */
    sage.ACTableResponse.prototype.getJoinPathAmbiguities = function () {
        return this.join_path_ambiguity;
    };

    /**
     * @return {Array=}
     */
    sage.ACTableResponse.prototype.getAccessibleTables = function () {
        return this.accessible_table;
    };
    //endregion

    //region ACTableResponse setters
    /**
     * @param {Array.<sage.QueryCompletion>} queryCompletions
     */
    sage.ACTableResponse.prototype.setQueryCompletions = function (queryCompletions) {
        this.query_completion = queryCompletions;
    };

    /**
     * @param {number} error_message_position
     */
    sage.ACTableResponse.prototype.setErrorMessagePosition = function (error_message_position) {
        this.error_message_position = error_message_position;
    };
    //endregion

    //region ACTableResponse extensions
    /**
     * Returns true if the query completions have duplicates if short lineage is used.
     * @returns {boolean}
     */
    sage.ACTableResponse.prototype.hasDuplicatesInQueryCompletionShortLineages = function () {
        // NOTE(Jasmeet): Caching removed here as this object is set by client code while processing completions.
        var lineageTextMap = {},
            hasDuplicates = this.getQueryCompletions().any(function(completion){
                var lineageText = completion.getQueryStringDropdown() + completion.getLineage();
                // If this text already exists in the map, we know we want to use table prefix.
                if (Object.has(lineageTextMap, lineageText)) {
                    return true;
                }
                lineageTextMap[lineageText] = true;
                return false;
            });

        return hasDuplicates;
    };

    /**
     * Returns true if there is non zero join path ambiguities.
     * @returns {sage.ACTableResponse.join_path_ambiguities|*|boolean}
     */
    sage.ACTableResponse.prototype.needsJoinDisambiguation = function() {
        return this.join_path_ambiguity && this.join_path_ambiguity.length > 0;
    };

    sage.ACTableResponse.prototype.hasMultipleJoinPathChoices = function () {
        if (!this.join_path_ambiguity || !this.join_path_ambiguity.length) {
            return false;
        }

        var joinChoices = this.join_path_ambiguity [0].getJoinPathCandidates();
        return joinChoices && joinChoices.length > 1;
    };
    //endregion

    //region ACJoin setters
    /**
     * Sets the left columns in ACJoin
     * @param leftColumns {[sage.EntityHeader]}
     */
    sage.ACJoin.prototype.setLeftColumns = function (leftColumns) {
        this.left_column = leftColumns;
    };

    /**
     * Sets the right columns in ACJoin
     * @param rightColumns {[sage.EntityHeader]}
     */
    sage.ACJoin.prototype.setRightColumns = function (rightColumns) {
        this.right_column = rightColumns;
    };
    //endregion

    //region ACResponseInfo getters
    /**
     * Gets the incident Id.
     * @returns {String}
     */
    sage.ACResponseInfo.prototype.getIncidentId = function () {
        return this.incident_id;
    };
    //endregion

    //region ACJoin setters
    /**
     * Sets the left columns in ACJoin
     * @param leftColumns {[sage.EntityHeader]}
     */
    sage.ACJoin.prototype.setLeftColumns = function (leftColumns) {
        this.left_column = leftColumns;
    };

    /**
     * Sets the right columns in ACJoin
     * @param rightColumns {[sage.EntityHeader]}
     */
    sage.ACJoin.prototype.setRightColumns = function (rightColumns) {
        this.right_column = rightColumns;
    };
    //endregion

    //region JoinResponse getters
    /**
     *
     * @returns {sage.ACContext}
     */
    sage.JoinResponse.prototype.getContext = function () {
        return this.context;
    };

    /**
     *
     * @returns {sage.ErrorCode}
     */
    sage.JoinResponse.prototype.getErrorCode = function () {
        return this.error_code;
    };
    //endregion

    //region RefreshGuidsResponse
    /**
     *
     * @returns {sage.ACContext}
     */
    sage.RefreshGuidsResponse.prototype.getContext = function () {
        return this.context;
    };
    //endregion
})();
