/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview A wrapper over proto interface provided by sage
 *               to give accessor methods and utility functions.
 */


'use strict';
/* eslint camelcase: 1, no-undef: 0 */

// This wrapping is needed so that the strict mode only applies to this scope
(function() {

    sage.EntityHeader.prototype.getGuid = function() {
        return this.guid;
    };

    sage.EntityHeader.prototype.getName = function() {
        return this.name;
    };

    /**
     * @param {string} guid
     * @param {string} name
     */
    sage.AuthToken.prototype.setUser = function (guid, name) {
        this.user = new sage.EntityHeader({
            guid: guid,
            name: name
        });
    };

    /**
     * @param {number} mask
     */
    sage.AuthToken.prototype.setGroupMask = function (mask) {
        this.group_mask = mask;
    };

    /**
     * @return {sage.RecognizedToken}
     */
    sage.Completion.prototype.getRecognizedToken = function () {
        return this.recognized_token;
    };

    sage.Completion.prototype.setRecognizedToken = function (recognizedToken) {
        this.recognized_token = recognizedToken;
    };

    sage.Completion.prototype.getNumTokensToReplace = function () {
        return this.num_tokens_to_replace;
    };

    sage.Completion.prototype.setNumTokensToReplace = function (numTokensToReplace) {
        this.num_tokens_to_replace = numTokensToReplace;
    };

    /**
     * @param {sage.Completion} c1
     * @param {sage.Completion} c2
     * @return {number}
     */
    sage.Completion.sortFn = function (c1, c2) {
        var t1 = c1.getRecognizedToken();
        var t2 = c2.getRecognizedToken();

        if (t1.getRank() >= t2.getRank()) {
            return -1;
        }

        return 1;
    };

    /**
     * Calculate and return a rank based on token type. Currently we want this order: attribute, measure, others
     * @return {number}
     */
    sage.RecognizedToken.prototype.getRank = function () {
        return (this.type_enum == sage.TokenType.ATTRIBUTE? 3 : (this.type_enum == sage.TokenType.MEASURE? 2 : 1));
    };

    /**
     * @return {sage.TokenType}
     */
    sage.RecognizedToken.prototype.getTypeEnum = function () {
        return this.type_enum;
    };

    /**
     *
     * @param {sage.TokenType} type_enum
     */
    sage.RecognizedToken.prototype.setTypeEnum = function (type_enum) {
        this.type_enum = type_enum;
    };

    sage.RecognizedToken.prototype.markUnrecognized = function () {
        this.setTypeEnum(sage.TokenType.UNRECOGNIZED);
    };

    /**
     * @return {string}
     */
    sage.RecognizedToken.prototype.getTokenTextLowerCase = function () {
        if (!this._tokenTextLowerCase) {
            this._tokenTextLowerCase = this.getTokenText().toLowerCase();
        }
        return this._tokenTextLowerCase;
    };

    /**
     * @param {string}
     */
    sage.RecognizedToken.prototype.setTokenTextLowerCase = function (token_text) {
        this._tokenTextLowerCase = token_text.toLowerCase();
    };

    /**
     * @param {string}
     */
    sage.RecognizedToken.prototype.setToken = function (token) {
        this.token = token;
    };

    /**
     * @returns {sage.ClientState|*|null} associated with the token.
     */
    sage.RecognizedToken.prototype.getClientState = function () {
        if (this.client_state === null) {
            this.client_state = new sage.ClientState();
        }
        return this.client_state;
    };

    sage.RecognizedToken.prototype.getOriginalTokenText = function () {
        // For backward compatibility.
        if (!this.getClientState().original_token && !!this.deprecated_original_token) {
            this.getClientState().original_token = this.deprecated_original_token;
        }
        return this.getClientState().original_token;
    };

    /**
     * @param {boolean} hasSpaceAfterToken
     */
    sage.RecognizedToken.prototype.setHasSpaceAfter = function (hasSpaceAfterToken) {
        this.has_space_after = hasSpaceAfterToken;
    };

    /**
     * @returns {boolean}
     */
    sage.RecognizedToken.prototype.getHasSpaceAfter = function () {
        return this.has_space_after;
    };

    sage.RecognizedToken.prototype.getStartPosition = function () {
        return this.startPosition;
    };

    /**
     * Returns true if this token is a possible expansion of the given substring.
     *
     * @param {string} substring
     * @return {boolean}
     */
    sage.RecognizedToken.prototype.isExpansionCandidateOf = function (substring) {
        return this.getTokenTextLowerCase().indexOf(substring.toLowerCase().trim()) >= 0;
    };

    /**
     * This is a special token text accessor that converts all spaces in a multi-word token to '&nbsp;'. This is so that
     * we can display a multi-word token correctly in the pulse layer.
     *
     * @return {string}
     */
    sage.RecognizedToken.prototype.getTokenTextForPulseLayer = function () {
        return this.getTokenTextLowerCase().escapeHTML().replace(/ /g, '&nbsp;');
    };

    /**
     * @return {string}
     * Returns the token's text.
     */
    sage.RecognizedToken.prototype.getTokenText = function() {
        return !!this.token ? (this.token) : '';
    };

    /**
     * @return {sage.TokenMetadata}
     */
    sage.RecognizedToken.prototype.getTokenMetadata = function () {
        return this.token_metadata;
    };

    /**
     * @return {string}
     */
    sage.RecognizedToken.prototype.getSourceGuid = function () {
        if (!this.isDataToken()) {
            return "";
        }
        if (this.token_metadata.table && this.token_metadata.table.guid) {
            return this.token_metadata.table.guid;
        }
        return this.token_metadata.deprecated_table_guid;
    };

    /**
     * @return {Array}
     */
    sage.RecognizedToken.prototype.getTokenMetaInfo = function () {
        var tmd = this.token_metadata;
        if (!tmd) {
            return [];
        }

        if (!this.isDataToken()) {
            return [];
        }

        var sourceName = this.getTableName();
        if (!!sourceName) {
            var info = [];

            var joinPathLabel = this.getJoinPathLabel();
            if (!!joinPathLabel) {
                sourceName += ' (' + joinPathLabel + ')';
            }

            info.add({
                name: 'SOURCE',
                value: sourceName
            });

            if ((this.isValueToken() || this.isDateBucketToken()) && !!tmd.name) {
                info.add({
                    name: 'COLUMN',
                    value: tmd.name
                });
            }

            return info;
        }

        return [];
    };

    sage.RecognizedToken.prototype.getLogicalKey = function (excludeTokenGuid) {
        if (this.isFormulaToken()) {
            return this.getFormulaId();
        }

        if (!this.isDataToken()) {
            return null;
        }

        var logicalKey = '';
        if (!excludeTokenGuid) {
            logicalKey = this.getGuid();
        }

        if (!this.join_path || !this.join_path.length) {
            return logicalKey;
        }

        // TODO(Jasmeet): This also needs thinking for chasm trap case.
        var pathToRoot = this.join_path[0];
        if (!pathToRoot.join.length) {
            return logicalKey;
        }

        logicalKey += '.';

        logicalKey += pathToRoot.join.map(function (join) {
            return join.getGuid();
        }).join(',');

        return logicalKey;
    };

    /**
     * This is logical key without column guid
     * @returns {string}
     */
    sage.RecognizedToken.prototype.getJoinPathKey = function () {
        return this.getLogicalKey(true);
    };

    sage.RecognizedToken.prototype.getJoinPathLabel = function () {
        if (!this.can_edit_join_path || !this.join_path || !this.join_path.length) {
            return '';
        }

        // TODO(Jasmeet): Handle this for the chasm trap case.
        // Only use the first join path from root. (Multiple root aka chasm multiple join path is not yet supported).
        var pathToRoot = this.join_path[0];
        if (!pathToRoot.join.length) {
            return 'All types of ' + pathToRoot.root_table.name;
        }

        return pathToRoot.join.slice(0).reverse().map(function (join) {
            return join.getName();
        }).join(', ');
    };

    // TODO(Shikhar) - use getJoinPathLabel after SCAL-4803
    sage.RecognizedToken.prototype.getJoinPathLabelForLeafData = function () {
        if (!this.join_path || !this.join_path.length) {
            return '';
        }

        // TODO(Jasmeet): Handle this for chasm trap case.
        // Only use the first join path from root. (Multiple root aka chasm multiple join path is not yet supported).
        var pathToRoot = this.join_path[0];
        if (!pathToRoot.join.length) {
            return 'All types of ' + pathToRoot.root_table.name;
        }

        return pathToRoot.join.slice(0).reverse().map(function (join) {
            return join.getName();
        }).join(', ');
    };

    /**
     * Return direct lineage info for disambiguation purpose.
     * @param {boolean=} needFullLineage  If true, all lineage info that is available is used.
     *
     * @return {string}
     */
    sage.RecognizedToken.prototype.getImmediateLineage = function (needFullLineage) {
        needFullLineage = needFullLineage || false;

        if (!this.isDataToken()) {
            return '';
        }
        if (!this.token_metadata) { return ''; }
        if (this.isValueToken()) {
            var lineage = this.token_metadata.name || '';
            return '- {1} in {2}'.assign(lineage.capitalize(true), this.getTableName().capitalize(true));
        } else {
            if (needFullLineage) {
                return ' - {1} in {2}'.assign(this.token_metadata.name || '', this.getTableName().capitalize(true));
            }
            return '- in {1}'.assign(this.getTableName().capitalize(true));
        }
    };

    /**
     * Return the table name of the token
     * @returns {*}
     */
    sage.RecognizedToken.prototype.getTableName = function () {
        if (!this.token_metadata) {
            return '';
        }

        if (this.token_metadata.table && this.token_metadata.table.name) {
            return this.token_metadata.table.name;
        }
        return this.token_metadata.deprecated_table_name || '';
    };

    /**
     * Return the table name of the token
     * @returns {*}
     */
    sage.RecognizedToken.prototype.getTableGuid = function () {
        if (!this.token_metadata) {
            return null;
        }
        if (this.token_metadata.table && this.token_metadata.table.guid) {
            return this.token_metadata.table.guid;
        }
        return this.token_metadata.deprecated_table_guid;
    };

    sage.RecognizedToken.prototype.hasTableMetadata = function () {
        return angular.isDefined(this.token_metadata);
    };

    /**
     * Return the column name of the token
     * @returns {string}
     */
    sage.RecognizedToken.prototype.getColumnName = function () {
        if (!this.token_metadata) {
            return '';
        }

        return this.token_metadata.name || '';
    };

    /**
     * @param {sage.TokenType} expectedType
     * @return {boolean} Return true if this token type matches the expectedType.
     */
    sage.RecognizedToken.prototype.isTokenType = function(expectedType) {
        return this.getTypeEnum() === expectedType;
    };

    /**
     * Highly used function
     * @return {boolean} Return true if this token type is UNRECOGNIZED.
     */
    sage.RecognizedToken.prototype.isUnrecognized = function() {
        return this.getTypeEnum() === sage.TokenType.UNRECOGNIZED;
    };

    sage.RecognizedToken.prototype.isNonEmptyUnrecognizedToken = function () {
        return this.isUnrecognized() && !this.isEmpty();
    };

    /**
     * Returns if the token can be extended
     * @returns {boolean}
     */
    sage.RecognizedToken.prototype.isExtensible = function () {
        return !!this.can_be_extended;
    };

    /**
     * Highly used function
     * @return {boolean} Return true if this token type is Empty token.
     */
    sage.RecognizedToken.prototype.isEmpty = function() {
        return !this.getTokenTextLowerCase();
    };

    /**
     * @param {string} tokenText
     * @param {boolean=} caseInSensitive If true, the token text match is relaxed to be case insensitive.
     * @return {boolean} Return true if this token text matches the the given tokenText.
     */
    sage.RecognizedToken.prototype.isTokenText = function(tokenText, caseInSensitive) {
        tokenText = '' + tokenText;
        if (!!caseInSensitive) {
            return this.getTokenTextLowerCase() === tokenText.toLowerCase();
        }
        return this.getTokenText() === tokenText;
    };

    /**
     * @param {string=} colName
     * @param {boolean=} caseInSensitive If true, the token text match is relaxed to be case insensitive.
     * @return {boolean} Return true if this token is an attribute or measure that matches the given colName.
     *     If no colName is provided, it only checks if the token is attribute or measure.
     */
    sage.RecognizedToken.prototype.isColumnToken = function(colName, caseInSensitive) {
        if (!this.isAttributeToken() && !this.isMeasureToken()) {
            return false;
        }

        // If no arguments were passed, this is a column token (attribute or measure).
        if (!arguments.length) {
            return true;
        }

        return this.isTokenText(colName, caseInSensitive);
    };

    /**
     * @return {boolean} Return true if this token is a value token.
     */
    sage.RecognizedToken.prototype.isValueToken = function() {
        return this.isTokenType(sage.TokenType.VALUE);
    };
    sage.RecognizedToken.prototype.isDateBucketToken = function() {
        return this.isTokenType(sage.TokenType.DATE_BUCKET);
    };
    /**
     * @param {string=} msrName
     * @param {boolean=} caseInSensitive If true, the token text match is relaxed to be case insensitive.
     * @return {boolean} Return true if this token is a measure that matches the given msrName.
     *     If no msrName is provided, it only checks if the token is measure.
     */
    sage.RecognizedToken.prototype.isMeasureToken = function(msrName, caseInSensitive) {
        if (!this.isTokenType(sage.TokenType.MEASURE)) {
            return false;
        }

        // If no arguments were passed, this is a measure token.
        if (!arguments.length) {
            return true;
        }

        return this.isTokenText(msrName, caseInSensitive);
    };

    /**
     * @param {string=} attrName
     * @param {boolean=} caseInSensitive If true, the token text match is relaxed to be case insensitive.
     * @return {boolean} Return true if this token is an attribute that matches the given attrName.
     *     If no attrName is provided, it only checks if the token is attribute.
     */
    sage.RecognizedToken.prototype.isAttributeToken = function(attrName, caseInSensitive) {
        if (!this.isTokenType(sage.TokenType.ATTRIBUTE)) {
            return false;
        }

        // If no arguments were passed, this is an attribute token.
        if (!arguments.length) {
            return true;
        }

        return this.isTokenText(attrName, caseInSensitive);
    };

    /**
     * Returns true if the token is attribute, measure, value, or date bucket
     * @returns {boolean}
     */
    sage.RecognizedToken.prototype.isDataToken = function () {
        return this.isAttributeToken() || this.isMeasureToken() || this.isValueToken() || this.isDateBucketToken();
    };

    /**
     * @param {string=} kwName
     * @param {boolean=} caseInSensitive If true, the token text match is relaxed to be case insensitive.
     * @return {boolean} Return true if this token is a keyword that matches the given kwName.
     *     If no kwName is provided, it only checks if the token is a keyword.
     */
    sage.RecognizedToken.prototype.isKeywordToken = function(kwName, caseInSensitive) {
        if (!this.isTokenType(sage.TokenType.KEYWORD)) {
            return false;
        }

        // If no arguments were passed, this is a keyword token.
        if (!arguments.length) {
            return true;
        }

        return this.isTokenText(kwName, caseInSensitive);
    };

    /**
     * @param {string=} opName
     * @param {boolean=} caseInSensitive If true, the token text match is relaxed to be case insensitive.
     * @return {boolean} Return true if this token is an operator that matches the given opName.
     *     If no opName is provided, it only checks if the token is an operator.
     */
    sage.RecognizedToken.prototype.isOperatorToken = function(opName, caseInSensitive) {
        if (!this.isTokenType(sage.TokenType.OPERATOR)) {
            return false;
        }

        // If no arguments were passed, this is an operator token.
        if (!arguments.length) {
            return true;
        }

        return this.isTokenText(opName, caseInSensitive);
    };

    sage.RecognizedToken.prototype.isFormulaToken = function() {
        // TODO(sunny): in case of formulae in answers sage does not set the type of the token
        // to formula, we use the presence of formula id to determine if the token is of formula
        // type. We need to get sage to give us an explicit way to tell if a token is a formula
        // token.
        return this.isTokenType(sage.TokenType.FORMULA) || !!this.getFormulaId();
    };

    sage.RecognizedToken.prototype.isFunctionToken = function() {
        return this.isTokenType(sage.TokenType.FUNCTION_NAME);
    };

    sage.RecognizedToken.prototype.isDelimiterToken = function() {
        return this.isTokenType(sage.TokenType.DELIMITER);
    };

    sage.RecognizedToken.prototype.setIsAutoInsertedSpace = function(isAutoInsertedSpace) {
        this.auto_inserted_space = !!isAutoInsertedSpace;
    };

    sage.RecognizedToken.prototype.isAutoInsertedSpace = function() {
        return !!this.auto_inserted_space;
    };

    /**
     * Tests for equality of this recognized token with another.
     * @param {sage.RecognizedToken} token The other token to compare equality with.
     * @return {boolean}
     */
    sage.RecognizedToken.prototype.equals = function (token) {
        if (!this.isTokenText(token.getTokenTextLowerCase(), true)) {
            return false;
        }
        // TODO(satyam): Also check token join path.
        return this.getTypeEnum() === token.getTypeEnum() &&
            (!this.isDataToken() || this.guid === token.guid);
    };

    /**
     * Returns the placeholder text for recognized token.
     * @return {string}
     */
    sage.RecognizedToken.prototype.getPlaceholderText = function () {
        return this.placeholder_text || '';
    };

    /**
     * Returns the guid of the column that this token represents.
     *
     * @return {string}
     */
    sage.RecognizedToken.prototype.getGuid = function () {
        return this.guid;
    };

    sage.RecognizedToken.prototype.getFormulaId = function () {
        return this.formula_id;
    };

    sage.RecognizedToken.prototype.getOutputGuid = function () {
        return this.output_guid;
    };

    sage.RecognizedToken.prototype.setOutputGuid = function (id) {
        this.output_guid = id;
    };

    /**
     * Typically a token will only be part of one query and thus there should be one root and only path leading to it.
     * However, in the interesting "chasm-trap" case we can have multiple query roots.
     * Example:
     * - There is a sales fact table that joins with person table using a "sales person id" foreign key.
     * - There is a purchase fact table that joins the person table using a "purchaser id" foreign key.
     *
     * For a query like "sales tax purchase tax person name" query, the token "person name" has 2 join paths:
     * first joining with sales root table and second joining with the purchase root table.
     *
     * @return {Array.<sage.JoinPath>}
     */
    sage.RecognizedToken.prototype.getJoinPaths = function () {
        return this.join_path;
    };

    /**
     * Returns the leaf table guid of the first join path
     * @returns {string=}
     */
    sage.RecognizedToken.prototype.getLeafTableGuid = function () {
        if (!this.join_path.length) {
            return null;
        }

        return this.join_path[0].getLeafTableGuid();
    };
    /**
     *
     * @param {Object} root
     */
    sage.RecognizedToken.prototype.clearPathFromRoot = function (root) {
        if (!this.join_path) {
            return;
        }
        var indexOfPathWithRoot = this.join_path.findIndex(function(joinPath) {
            return joinPath.root.guid === root.guid;
        });

        if (indexOfPathWithRoot > -1) {
            this.join_path.splice(indexOfPathWithRoot, 1);
        }
    };

    /**
     *
     * @param {sage.JoinPath} path
     */
    sage.RecognizedToken.prototype.addJoinPath = function (path) {
        if (!this.join_path) {
            this.join_path = [];
        }
        this.clearPathFromRoot(path.root);
        this.join_path.push(path);
    };

    /**
     *
     * @param {sage.JoinPath} path
     * @param {number} index
     */
    sage.RecognizedToken.prototype.setJoinPathAtIndex = function (path, index) {
        if (!this.join_path) {
            this.join_path = [];
        }
        this.join_path[index] = path;
    };

    /**
     * Clears the join path of this token
     */
    sage.RecognizedToken.prototype.clearJoinPath = function () {
        this.join_path = [];
    };

    /**
     * Clears the disconnected join paths of this token
     */
    sage.RecognizedToken.prototype.clearDisconnectedJoinPaths = function () {
        this.join_path = this.join_path.filter(function(joinPath) {
            return joinPath.is_connected;
        });
    };

    /**
     *
     * @return {boolean}
     */
    sage.RecognizedToken.prototype.canEditJoinPath = function () {
        return !!this.can_edit_join_path;
    };

    /**
     *
     * NOTE(vibhor): Ideally, the can_edit_join_path should be a readonly bit for the client (computed purely on server).
     * But because server side computation for this is not yet implemented, we drive the logic to set this bit on
     * client. However, this logic breaks down for cases where server automatically choses a join path and no user
     * disambiguation was needed.
     * TODO(vibhor): Remove this logic once server side support is ready.
     *
     * @param {boolean} canEditJoinPath
     */
    sage.RecognizedToken.prototype.setCanEditJoinPath = function (canEditJoinPath) {
        this.can_edit_join_path = canEditJoinPath;
    };

    /**
     *
     * @param {boolean}
     */
    sage.RecognizedToken.prototype.setExplicitJoinPathEdit = function (explicitJoinPathEdit) {
        this.explicit_join_path_edit = explicitJoinPathEdit;
    };

    /**
     * @return {boolean}
     */
    sage.RecognizedToken.prototype.getExplicitJoinPathEditBit = function () {
        return this.explicit_join_path_edit;
    };

    /**
     * Returns true if the token is recognized by server as one of the measure/attr/value but does not have a join path
     * bound to it. We show such tokens visually differently on the sage bar.
     *
     * @return {boolean}
     */
    sage.RecognizedToken.prototype.needsAJoinPath = function () {
        if (this.isMeasureToken() || this.isAttributeToken() || this.isValueToken()) {
            return this.getJoinPaths().length === 0;
        }
        return false;
    };

    function cleanupToken(token) {
        return token.replace('\n', '');
    }

    var MAX_TOKEN_LENGTH = 80;
    var MIN_TOKEN_LENGTH_AFTER_TRUNCATION = 60;
    sage.RecognizedToken.prototype.cleanupAndTruncateToken = function () {
        this.getClientState().original_token = this.getTokenText();
        var text = this.token = cleanupToken(this.getClientState().original_token);
        if (text.length <= MAX_TOKEN_LENGTH) {
            return;
        }

        this.getClientState().truncated = true;
        var truncatedText = text.truncateOnWord(MAX_TOKEN_LENGTH);
        if (truncatedText.length < MIN_TOKEN_LENGTH_AFTER_TRUNCATION) {
            truncatedText = text.truncate(MAX_TOKEN_LENGTH);
        }
        this.token = truncatedText;
        return;
    };

    sage.RecognizedToken.prototype.restoreOriginalToken = function () {
        if (!this.getOriginalTokenText()) {
            return;
        }

        this.getClientState().truncated = false;
        this.token = this.getOriginalTokenText();
    };

    /**
     * The child tokens for a formula token. Ignored for a non-formula token.
     * @param {Array.<sage.RecognizedToken>} formulaTokens
     */
    sage.RecognizedToken.prototype.setFormulaTokens = function (formulaTokens) {
        if (!this.isFormulaToken()) {
            console.warn('setFormulaTokens may not be called on non-formula tokens');
            return;
        }

        formulaTokens = formulaTokens || [];

        // Cached to avoid de-serializing every time the getter is called.
        this._formula_tokens = formulaTokens;
        this.getClientState().serialized_formula_tokens = sage.RecognizedToken.serializeArray(formulaTokens);
    };

    /**
     * @returns {Array.<sage.RecognizedToken>|null} returns the list of child tokens for a formula token.
     *                                                     returns null for a non formula token or if the child
     *                                                     tokens have not yet been set on this formula token
     */
    sage.RecognizedToken.prototype.getFormulaTokens = function () {
        if (!!this._formula_tokens) {
            return this._formula_tokens;
        }
        // For backward compatibility.
        if (!this.getClientState().serialized_formula_tokens && !!this.deprecated_serialized_formula_tokens) {
            this.getClientState().serialized_formula_tokens = this.deprecated_serialized_formula_tokens;
        }

        this._formula_tokens = sage.RecognizedToken.parseArray(this.getClientState().serialized_formula_tokens);
        return this._formula_tokens || null;
    };

    sage.RecognizedToken.prototype.getFormulaQuery = function () {
        return this.sage_expression || null;
    };

    /**
     * @param {string} keyword
     * @return {sage.RecognizedToken} Creates and returns a keyword type token with token text keyword.
     */
    sage.RecognizedToken.createKeywordToken = function(keyword) {
        return new sage.RecognizedToken({
            token: keyword,
            type_enum: sage.TokenType.KEYWORD
        });
    };

    /**
     * @param {string} operator
     * @return {sage.RecognizedToken} Creates and returns an operator type token with token text operator.
     */
    sage.RecognizedToken.createOperatorToken = function(operator) {
        return new sage.RecognizedToken({
            token: operator,
            type_enum: sage.TokenType.OPERATOR
        });
    };

    /**
     * @param {string} functionName
     * @return {sage.RecognizedToken} Creates and returns an function name type token.
     */
    sage.RecognizedToken.createFunctionNameToken = function(functionName) {
        return new sage.RecognizedToken({
            token: functionName,
            type_enum: sage.TokenType.FUNCTION_NAME
        });
    };

    /**
     * @param {string} functionName
     * @return {sage.RecognizedToken} Creates and returns an delimiter type token.
     */
    sage.RecognizedToken.createDelimiterToken = function(delimiter) {
        return new sage.RecognizedToken({
            token: delimiter,
            type_enum: sage.TokenType.DELIMITER
        });
    };

    /**
     * @param {string} measure
     * @return {sage.RecognizedToken} Creates and returns a measure type token with token text measure.
     */
    sage.RecognizedToken.createMeasureToken = function(measure) {
        return new sage.RecognizedToken({
            token: measure,
            type_enum: sage.TokenType.MEASURE
        });
    };

    /**
     * @param {string} attr
     * @return {sage.RecognizedToken} Creates and returns an attribute type token with token text attr.
     */
    sage.RecognizedToken.createAttributeToken = function(attr) {
        return new sage.RecognizedToken({
            token: attr,
            type_enum: sage.TokenType.ATTRIBUTE
        });
    };

    /**
     * @param {string} col
     * @param {string} val
     * @return {sage.RecognizedToken} Creates and returns an value type token with column type of col and token
     *     text of val.
     */
    sage.RecognizedToken.createColumnValueToken = function(col, val) {
        return new sage.RecognizedToken({
            token: val,
            type_enum: sage.TokenType.VALUE
        });
    };

    /**
     * @param {string} val
     * @return {sage.RecognizedToken} Creates and returns a positive int type token with token text val.
     */
    sage.RecognizedToken.createPositiveIntToken = function(val) {
        return new sage.RecognizedToken({
            token: val,
            type_enum: sage.TokenType.POSITIVE_INT
        });
    };

    /**
     * @param {string=} str
     * @return {sage.RecognizedToken} Creates and returns an unrecognized type token with token text str.
     */
    sage.RecognizedToken.createUnrecognizedToken = function(str) {
        return new sage.RecognizedToken({
            token: str || '',
            type_enum: sage.TokenType.UNRECOGNIZED
        });
    };

    /**
     * @param {sage.RecognizedToken} token
     * @return {sage.RecognizedToken} Creates and returns a copy of token.
     */
    sage.RecognizedToken.createCopy = function(token) {
        var copy = new sage.RecognizedToken();
        angular.copy(token, copy);
        return copy;
    };

    /**
     * When we serialize a token, we can only save the string version so JSON.stringify is enough for that purpose.
     * But when deserializing from a json string, we need to make any proper object get its prototype bag back.
     *
     * Since we are not having new internal objects everyday, it is ok to manually add them.
     *
     * @param jsonToken
     */
    sage.RecognizedToken.createFromJsonToken = function (jsonToken) {
        var token = new sage.RecognizedToken(jsonToken);

        // the only reason we are checking this despite the assumption that it should exist, is for
        // backward compatibility.
        if (token.token_metadata) {
            token.token_metadata = new sage.TokenMetadata(token.token_metadata);
        }
        if (!token.join_path) {
            token.join_path = [];
        }

        return token;
    };

    /**
     * This utility creates a mock logical column with limited API set.
     * @param {sage.RecognizedToken} token
     */
    sage.RecognizedToken.createFakeLogicalColumn = function(token) {
        // TODO(Jasmeet): Evaluate how formula tokens should be handled here.
        return {
            getGuid: function () {
                return token.getGuid();
            },
            getName: function () {
                return token.getColumnName();
            },
            isFormula: function () {
                return false;
            },
            getSourceName: function () {
                return '';
            },
            isHidden: function () {
                return false;
            }
        };
    };

    /**
     *  Serializes an array of RecognizedTokens by serializing each token into an array
     *  and then using JSON to serialize the array.
     *  @param {Array.<sage.RecognizedToken>} tokens
     *  @returns {string}
     */
    sage.RecognizedToken.serializeArray = function(tokens) {
        var serializedArray = tokens.map(function (token) {
            return token.serialize();
        });
        return JSON.stringify(serializedArray);
    };

    /**
     *
     * @param string serializedString
     * @returns {Array.<sage.RecognizedToken>}
     */
    sage.RecognizedToken.parseArray = function (serializedString) {
        var serializedArray = JSON.parse(serializedString);
        if (serializedArray.length === 0) {
            return [];
        }
        if (typeof serializedArray[0] == 'string') {
            angular.forEach(serializedArray, function (item, idx) {
                serializedArray[idx] = sage.RecognizedToken.createFromSerializedString(item);
            });
        } else {
            angular.forEach(serializedArray, function (item, idx) {
                serializedArray[idx] = sage.RecognizedToken.createFromJsonToken(item);
            });
        }
        return serializedArray;
    };

    /**
     * Deserialize a Recognized token from a serialized string.
     * @param serializedString
     * @returns {sage.RecognizedToken}
     */
    sage.RecognizedToken.createFromSerializedString = function(serializedString) {
        // Old serialized recognized tokens may have been done using json stringify,
        // so we try to read it using thrift deserialization first, but if it fails then we try
        // createFromJsonToken
        var token = new sage.RecognizedToken();
        try {
            deserialize(serializedString, token);
        } catch (err) {
            token = sage.RecognizedToken.createFromJsonToken(JSON.parse(serializedString));
        }
        return token;
    };

    /**
     *
     * @param val
     * @return {string=}
     * @private
     */
    function stringifyOrNull(val) {
        if (!angular.isDefined(val)) {
            return null;
        }
        return '' + val;
    }

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {[*]} params.bulkValues
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddBulkFilterTransformation = function (params) {
        var transformationParams = {
            type: sage.QueryTransformType.ADD_IN_FILTER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            combine_value_tokens: true
        };

        transformationParams.bulk_value = params.bulkValues.map(function(value){
            return stringifyOrNull(value);
        });

        return new sage.QueryTransform(transformationParams);
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {*} params.value
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddInFilterTransformation = function (params) {
        var transformationParams = {
            type: sage.QueryTransformType.ADD_IN_FILTER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            op: sage.CompareType.IN
        };

        if (params.negateOp) {
            transformationParams.negate_op = true;
        }
        if(!!params.bulkValues){
            transformationParams.bulk_value = params.bulkValues.map(function(value){
                return stringifyOrNull(value);
            });
        } else {
            transformationParams.value = stringifyOrNull(params.value);
        }
        return new sage.QueryTransform(transformationParams);
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {*} params.value
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveInFilterTransformation = function (params) {
        var transformationParams = {
            type: sage.QueryTransformType.REMOVE_IN_FILTER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            op: sage.CompareType.IN
        };

        if (params.negateOp) {
            transformationParams.negate_op = true;
        }

        if(!!params.bulkValues){
            transformationParams.bulk_value = params.bulkValues.map(function(value){
                return stringifyOrNull(value);
            });
        } else {
            transformationParams.value = stringifyOrNull(params.value);
        }

        return new sage.QueryTransform(transformationParams);
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @params {number=} params.op
     * @param {*} params.value1
     * @param {*} params.value2
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddPredicateFilterTransformation = function (params) {
        var resolveValueToken = angular.isDefined(params.resolveValueToken)
            ? !!params.resolveValueToken : angular.isDefined(params.value1) || angular.isDefined(params.value2);

        return new sage.QueryTransform({
            type: sage.QueryTransformType.ADD_PREDICATE_FILTER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            value: stringifyOrNull(params.value1),
            value2: stringifyOrNull(params.value2),
            op: params.op,
            resolve_value_token: resolveValueToken
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @params {number=} params.op
     * @param {*} params.value1
     * @param {*} params.value2
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemovePredicateFilterTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_PREDICATE_FILTER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            value: stringifyOrNull(params.value1),
            value2: stringifyOrNull(params.value2),
            op: params.op
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveAllFilterTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_ALL_FILTERS_FOR_COLUMN,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveAllDateRangeFilterTransformation = function (params) {
        // For definition of what sage considers as date range filter, see
        // sage/auto_complete/date/date_filter.cpp GetFilterGranularity() and look for is_interpreted_as_epoch_range.
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_ALL_DATE_RANGE_FILTERS_FOR_COLUMN,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid
        });
    };

    /**
     *
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddEmptyGroupByTransformation = function () {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.ADD_EMPTY_GROUP_BY
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {Array.<sage.JoinPath>} params.joinPath
     * @param {string=} params.columnGuid
     * @param {int} params.aggregation
     * @param {boolean=} params.prepend
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddColumnTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.ADD_COLUMN,
            token_output_guid: params.tokenOutputGuid,
            join_path: params.joinPath,
            column_guid: params.columnGuid,
            aggregation: params.aggregation,
            prepend_new_phrase: params.prepend || false
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {Array.<sage.JoinPath>} params.joinPath
     * @param {string=} params.columnGuid
     * @param {int} params.aggregation
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveColumnTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_COLUMN,
            token_output_guid: params.tokenOutputGuid,
            join_path: params.joinPath,
            column_guid: params.columnGuid,
            aggregation: params.aggregation
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string} params.sageQuery  base64 encoded sage expression proto for the formula
     * @param {string} params.formulaName
     * @param {string} params.formulaId
     * @param {string=} params.formulaOutputGuid
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddFormulaTransformation = function (params) {
        if (angular.isUndefined(params.formulaTokenType)) {
            params.formulaTokenType = sage.TokenType.FORMULA;
        }

        var queryTransformParams = {
            type: sage.QueryTransformType.ADD_FORMULA,
            formula_name: params.formulaName,
            formula_id: params.formulaId,
            formula_token_type: params.formulaTokenType
        };

        if (angular.isDefined(params.formulaOutputGuid)) {
            queryTransformParams.formula_output_guid = params.formulaOutputGuid;
        }

        return new sage.QueryTransform(queryTransformParams);
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.formulaId
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveFormulaTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_FORMULA,
            formula_id: params.formulaId
        });
    };

    sage.QueryTransform.createRemoveAllHavingFiltersTransformation = function () {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_ALL_HAVING_FILTERS
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {int} params.aggregation
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveHavingFilterTransformationsByAggregation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_ALL_HAVING_FILTERS_BY_AGGREGATE,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            aggregation: params.aggregation
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {int} params.aggregation
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddHavingFilterTransformation = function (params) {
        var resolveValueToken = _.isNumber(params.value1) || !!params.value1;

        return new sage.QueryTransform({
            type: sage.QueryTransformType.ADD_HAVING_FILTER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            aggregation: params.aggregation,
            op: params.op,
            value: stringifyOrNull(params.value1),
            resolve_value_token: resolveValueToken
        });
    };

    /**
     *
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveNonFilterPhrasesTransformation = function () {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_NON_FILTER_PHRASES
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {boolean=} params.ascending
     * @param {number} params.aggregation
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddSortColumnTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.ADD_SORT_COLUMN,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            ascending: !params.hasOwnProperty('ascending') || params.ascending,
            aggregation: params.aggregation
        });
    };

    /**
     *
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveAllSortPhrasesTransformation = function () {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_ALL_SORT_PHRASES
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {number} params.timeBucket
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddTimeBucketTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.ADD_TIME_BUCKET,
            column_guid: params.columnGuid,
            token_output_guid: params.tokenOutputGuid,
            time_bucket: params.timeBucket
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveTimeBucketTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_TIME_BUCKET,
            column_guid: params.columnGuid,
            token_output_guid: params.tokenOutputGuid
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createAddTimeBucketQualifierTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.ADD_TIME_BUCKET_QUALIFIER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            time_bucket_qualifier: params.timeBucketQualifier
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createRemoveTimeBucketQualifierTransformation = function (params) {
        return new sage.QueryTransform({
            type: sage.QueryTransformType.REMOVE_TIME_BUCKET_QUALIFIER,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid
        });
    };

    /**
     *
     * @param {Object} params
     * @param {string=} params.serializedColumn
     * @param {string=} params.tokenOutputGuid
     * @param {string=} params.columnGuid
     * @param {int} params.oldAggregation
     * @param {int} params.newAggregation
     * @return {sage.QueryTransform}
     */
    sage.QueryTransform.createChangeAggregationTransformation = function (params) {
        var changeAggregationTranformArgs = {
            old_aggregation: params.oldAggregation,
            default_aggregation: params.defaultAggregation
        };
        var changeAggregationTransformParams = new sage.ChangeAggregationParam(changeAggregationTranformArgs);

        return new sage.QueryTransform({
            type: sage.QueryTransformType.CHANGE_AGGREGATION,
            token_output_guid: params.tokenOutputGuid,
            column_guid: params.columnGuid,
            aggregation: params.newAggregation,
            change_aggregation_param: changeAggregationTransformParams
        });
    };

    var SAGE_AGGR_NAME_TO_BLINK_NAME = {
        'AVERAGE': 'AVG',
        'STD_DEVIATION': 'STDDEV',
        'UNIQUE_COUNT': 'UNIQUE COUNT'
    };
    var sageAggrTypeToAggrName = {};
    Object.keys(sage.AggregationType).each(function(name){
        var sageType = sage.AggregationType[name];
        sageAggrTypeToAggrName[sageType] = SAGE_AGGR_NAME_TO_BLINK_NAME[name] || name;
    });

    sage.QueryTransform.getAggrNameForAggrSageType = function (aggrSageType) {
        return sageAggrTypeToAggrName[aggrSageType];
    };

    /**
     *
     * @returns {sage.EntityHeader}
     */
    sage.Join.prototype.getHeader = function () {
        return this.id;
    };

    /**
     *
     * @returns {string}
     */
    sage.Join.prototype.getDisplayName = function () {
        return this.id && this.id.name || '';
    };

    /**
     *
     * @returns {string}
     */
    sage.Join.prototype.getSourceName = function () {
        return this.source && this.source.name || '';
    };

    /**
     *
     * @returns {string}
     */
    sage.Join.prototype.getDestinationName = function () {
        return this.destination && this.destination.name || '';
    };

    sage.Join.prototype.getGuid = function () {
        return this.id && this.id.guid || null;
    };

    sage.Join.prototype.getName = function () {
        return this.id && this.id.name || null;
    };

    sage.Join.prototype.isEqualTo = function (otherJoin) {
        if (!this.id || !otherJoin.id ||
            !this.source || !otherJoin.source ||
            !this.destination || !otherJoin.destination) {
            return false;
        }

        return this.id.guid === otherJoin.id.guid &&
            this.source.guid === otherJoin.source.guid &&
            this.destination.guid === otherJoin.destination.guid;
    };

    sage.Join.create = function (name, source, destination) {
        return new sage.Join({
            id: new sage.EntityHeader({
                guid: name,
                name: name
            }),
            source: new sage.EntityHeader({
                guid: source,
                name: source
            }),
            destination: new sage.EntityHeader({
                guid: destination,
                name: destination
            })
        });
    };

    sage.JoinPath.create = function (root, leaf, joins) {
        return new sage.JoinPath({
            root_table: new sage.EntityHeader({
                guid: root,
                name: root
            }),
            leaf_table: new sage.EntityHeader({
                guid: leaf,
                name: leaf
            }),
            join: joins
        });
    };

    sage.JoinPath.prototype.getJoins = function () {
        return this.join;
    };

    /**
     * If the appendPath is a prefix of this path, then this path is updated with the new root and join links.
     *
     * @param {sage.JoinPath} appendPath
     */
    sage.JoinPath.prototype.attachToNewRoot = function (appendPath) {
        if (!appendPath.isAncestorOf(this)) {
            return;
        }
        this.root_table.guid = appendPath.root_table.guid;
        var appendJoins = appendPath.join || [];
        this.join = appendJoins.concat(this.join);
    };

    /**
     * Tests if this path is an ancestor of the given childPath i.e. if this path's leaf is same as the root of the
     * childPath.
     *
     * @param {sage.JoinPath} childPath
     * @returns {boolean}
     */
    sage.JoinPath.prototype.isAncestorOf = function (childPath) {
        return this.leaf_table.guid === childPath.root_table.guid;
    };

    sage.JoinPath.prototype.isPrefixOf = function (otherPath) {
        if (!otherPath || !otherPath.root_table) {
            return false;
        }

        if (this.root_table.guid !== otherPath.root_table.guid) {
            return false;
        }

        if (!this.join) {
            return true;
        }

        if (!otherPath.join) {
            return false;
        }

        if (this.join.length > otherPath.join.length) {
            return false;
        }

        var mismatch = false;
        this.join.each(function (join, idx) {
            if (mismatch) {
                return;
            }
            mismatch = (join.getGuid() !== otherPath.join[idx].getGuid());
        });

        return !mismatch;
    };

    function isPathEmpty(path) {
        return (!path || !path.join || !path.join.length);
    }

    sage.JoinPath.prototype.isEmpty = function () {
        return isPathEmpty(this);
    };

    /**
     *
     * @param {sage.JoinPath} thatPath
     * @return {boolean}
     */
    sage.JoinPath.prototype.isEqual = function (thatPath) {
        if (!thatPath) {
            return false;
        }

        if (!this.root_table || !thatPath.root_table ||
            this.root_table.guid !== thatPath.root_table.guid) {
            return false;
        }

        if (this.isEmpty() !== thatPath.isEmpty() || this.join.length !== thatPath.join.length) {
            return false;
        }

        return this.join.every(function (join, index) {
            return join.getGuid() === thatPath.join[index].getGuid();
        });
    };

    /**
     *
     * @param {string} linkGuid
     * @return {boolean}
     */
    sage.JoinPath.prototype.containsLink = function (linkGuid) {
        if (this.isEmpty()) {
            return false;
        }

        return this.join.any(function (join) {
            return join.getGuid() === linkGuid;
        });
    };

    sage.JoinPath.prototype.getRootTableGuid = function () {
        return this.root_table && this.root_table.guid || null;
    };

    sage.JoinPath.prototype.getLeafTableGuid = function () {
        return this.leaf_table && this.leaf_table.guid || null;
    };

    /**
     *
     * @returns {Array.<number>}
     */
    sage.JoinPathChoice.prototype.getAffectedExistingTokens = function () {
        return this.affected_token;
    };

    /**
     * @param indices {Array.<number>}
     */
    sage.JoinPathChoice.prototype.setAffectedToken = function (indices) {
        this.affected_token = indices;
    };

    /**
     *
     * @returns {sage.JoinPath}
     */
    sage.JoinPathChoice.prototype.getAppendPathForExistingTokens = function () {
        return this.prepend_path;
    };

    /**
     *
     * @returns {sage.JoinPath}
     */
    sage.JoinPathChoice.prototype.getPathForNewToken = function () {
        return this.new_token_path;
    };

    /**
     * @param path {sage.JoinPath}
     */
    sage.JoinPathChoice.prototype.setPrependPath = function (path) {
        this.prepend_path = path;
    };

    /**
     * @param path {sage.JoinPath}
     */
    sage.JoinPathChoice.prototype.setNewTokenPath = function (path) {
        this.new_token_path = path;
    };

    /**
     * Returns true if the requested fragment path of this choice contains the given link. The fragment to be checked
     * can be requested using checkPathForNewToken param.
     *
     * @param {string} linkGuid
     * @param {boolean} checkPathForNewToken If true, the linkGuid is checked for presence in the new token path,
     *                  otherwise, in the append path for existing tokens.
     * @return {boolean}
     */
    sage.JoinPathChoice.prototype.containsLink = function (linkGuid, checkPathForNewToken) {
        return (checkPathForNewToken && this.new_token_path && this.new_token_path.containsLink(linkGuid)) ||
            (!checkPathForNewToken && this.prepend_path &&
            this.prepend_path.containsLink(linkGuid));
    };

    sage.JoinPathChoice.prototype.getRootTableGuid = function () {
        return this.new_token_path && this.new_token_path.getRootTableGuid() ||
            this.prepend_path && this.prepend_path.getRootTableGuid();
    };

    /**
     * Returns true if the new token added to trigger the join choice should be marked editable (Change mapping).
     *
     * @return {boolean}
     */
    sage.JoinPathChoice.prototype.isNewTokenEditable = function () {
        return this.new_token_editable;
    };

    /**
     * Returns true if the existing tokens should be marked editable (Change mapping).
     *
     * @return {boolean}
     */
    sage.JoinPathChoice.prototype.areOldTokensEditable = function () {
        return this.old_tokens_editable;
    };

    /**
     *
     * @returns {number|*}
     */
    sage.JoinPathCollection.prototype.getNewTokenIndex = function () {
        return this.new_token_index;
    };

    /**
     *
     * @returns {Array|*}
     */
    sage.JoinPathCollection.prototype.getJoinPathCandidates = function () {
        return this.choice;
    };

    /**
     *
     * @returns {number}
     */
    sage.JoinPathCollection.prototype.getRootIndex = function () {
        return this.root_index;
    };

    /**
     *
     * @returns {number}
     */
    sage.QueryCompletion.prototype.getNumPrefixTokens = function () {
        return this.num_prefix_tokens;
    };

    /**
     *
     * @returns {number}
     */
    sage.QueryCompletion.prototype.getNumSuffixTokens = function () {
        return this.num_suffix_tokens;
    };

    /**
     *
     * @returns {Array.<sage.RecognizedToken>}
     */
    sage.QueryCompletion.prototype.getQuery = function () {
        return this.query || [];
    };

    /**
     *
     * @returns {string}
     */
    sage.QueryCompletion.prototype.getSearchText = function () {
        return this.search_text || '';
    };

    /**
     * Gets the new tokens.
     * Note - This method returns a copy, so not to be used in ng-repeat, etc
     * @returns {Array.<sage.RecognizedToken>}
     */
    sage.QueryCompletion.prototype.getNewTokens = function () {
        var numPrefixTokens = this.getNumPrefixTokens() || 0,
            queryTokens = this.getQuery() || [];
        if (numPrefixTokens >= queryTokens.length) {
            return [];
        }

        return queryTokens.slice(numPrefixTokens);
    };

    /**
     * Gets the prefix tokens.
     * Note - This method returns a copy, so not to be used in ng-repeat, etc
     * @returns {Array.<sage.RecognizedToken>}
     */
    sage.QueryCompletion.prototype.getPrefixTokens = function () {
        var numPrefixTokens = this.getNumPrefixTokens() || 0,
            queryTokens = this.getQuery() || [];
        if (numPrefixTokens > queryTokens.length || !numPrefixTokens) {
            return [];
        }

        return queryTokens.slice(0, numPrefixTokens);
    };

    /**
     * Gets the new suffix tokens. It assumes that query completion has been preprocessed to set
     * all tokens from the sage response
     * Note - This method returns a copy, so not to be used in ng-repeat, etc
     * @returns {Array.<sage.RecognizedToken>}
     */
    sage.QueryCompletion.prototype.getSuffixTokens = function () {
        var numSuffixTokens = this.getNumSuffixTokens() || 0,
            allTokens = this.getAllTokens() || [];
        if (numSuffixTokens > allTokens.length || !numSuffixTokens) {
            return [];
        }

        return allTokens.slice(allTokens.length - numSuffixTokens);
    };

    /**
     * Gets the new suffix tokens from the new tokens in the sage response
     * Note - This method returns a copy, so not to be used in ng-repeat, etc
     * @param {Array.<sage.RecognizedToken>} tokens
     * @returns {Array.<sage.RecognizedToken>}
     */
    sage.QueryCompletion.prototype.getSuffixTokensFromNewTokens = function (tokens) {
        var numSuffixTokens = this.getNumSuffixTokens() || 0,
            allNewTokens = tokens || [];
        if (numSuffixTokens > allNewTokens.length || !numSuffixTokens) {
            return [];
        }

        return allNewTokens.slice(allNewTokens.length - numSuffixTokens);
    };

    /**
     * Returns the string representation of tokens in query field
     * @returns {string}
     */
    sage.QueryCompletion.prototype.getCompleteQueryString = function () {
        var queryTokens = this.getQuery() || [];
        return queryTokens.map(function (token) {
            return token.getTokenTextLowerCase();
        }).join(' ') || '';
    };

    /**
     * Returns the string representation of prefix tokens
     * @returns {string}
     */
    sage.QueryCompletion.prototype.getPrefixTokensQueryString = function () {
        var queryTokens = this.getPrefixTokens();
        return queryTokens.map(function (token) {
            return token.getTokenTextLowerCase();
        }).join(' ') || '';
    };

    /**
     * Returns the string representation of new tokens
     * @returns {string}
     */
    sage.QueryCompletion.prototype.getNewTokensNormalizedQueryString = function () {
        var queryTokens = this.getNewTokens();
        return queryTokens.map(function (token) {
            if (token.getTypeEnum() == sage.TokenType.VALUE) {
                return token.getTokenTextLowerCase().replace(/^'(.*)'$/, '$1')
            } else {
                return token.getTokenTextLowerCase();
            }
        }).join(' ') || '';
    };

    /**
     * Returns the string representation of new tokens
     * @returns {string}
     */
    sage.QueryCompletion.prototype.getNewTokensQueryString = function () {
        var queryTokens = this.getNewTokens();
        return queryTokens.map(function (token) {

            return token.getTokenTextLowerCase();
        }).join(' ') || '';
    };

    /**
     * Returns the string representation of suffix tokens
     * @returns {string}
     */
    sage.QueryCompletion.prototype.getSuffixTokensQueryString = function () {
        var queryTokens = this.getSuffixTokens();
        var str = queryTokens.map(function (token) {
            return token.getTokenTextLowerCase();
        }).join(' ') || '';

        return str.trim();
    };

    /**
     * Returns true if there is a single space suffix token
     * @returns {boolean}
     */
    sage.QueryCompletion.prototype.isSuffixTokenTypeSpace = function () {
        var numSuffixTokens = this.getNumSuffixTokens();

        // Check if the suffix token is just space token
        return numSuffixTokens == 1 && !this.getSuffixTokensQueryString();
    };

    sage.QueryCompletion.prototype.getEffectiveNumSuffixTokens = function () {
        var effNumSuffixTokens = this.getNumSuffixTokens();
        return effNumSuffixTokens == 1 && !this.getSuffixTokensQueryString() ? 0 : effNumSuffixTokens;
    };

    /**
     *
     * @param {Array.<sage.QueryCompletion>=} allCompletions A list of all completions that this query completion
     *    shows up with. This param is optional and can be used to compute the increased the information level for
     *    disambiguation.
     * @return {string}
     */
    sage.QueryCompletion.prototype.getLineage = function (requiresFullLineage) {
        var numPrefixTokens = this.getNumPrefixTokens() || 0,
            queryTokens = this.getQuery() || [];
        if (numPrefixTokens >= queryTokens.length) {
            return '';
        }

        return queryTokens[numPrefixTokens] ? queryTokens[numPrefixTokens].getImmediateLineage(requiresFullLineage) : '';
    };

    sage.QueryCompletion.prototype.getQueryStringDropdown = function () {
        var queryString = this.getCompleteQueryString(),
            suffixString = this.getSuffixTokensQueryString();
        if (!!queryString) {
            return queryString + ' ' + suffixString;
        }
        return suffixString;
    };

    sage.QueryCompletion.prototype.getAllTokens = function () {
        return this.all_tokens;
    };

    sage.QueryCompletion.prototype.setAllTokens = function (tokens) {
        this.all_tokens = tokens;
    };

    sage.QueryCompletion.CompletionTypes = {
        BASE: 0,
        JOIN: 1
    };

    /**
     *
     * @returns {sage.QueryCompletion.CompletionTypes.*}
     */
    sage.QueryCompletion.prototype.getCompletionType = function () {
        return sage.QueryCompletion.CompletionTypes.BASE;
    };

    /**
     * @returns {boolean}
     */
    sage.QueryCompletion.prototype.isOutOfScopeCompletion = function () {
        return this.scope === sage.CompletionScope.OUT_OF_SCOPE;
    };

    sage.QueryCompletion.prototype.isExactMatch = function () {
        return this.match_type === sage.MatchType.EXACT;
    };

    sage.QueryCompletion.prototype.isRewriteCompletion = function () {
        return this.completion_type === sage.QueryCompletionType.REWRITE;
    };
    sage.QueryCompletion.prototype.isSynonymCompletion = function () {
        return this.completion_type === sage.QueryCompletionType.SYNONYM;
    };
    sage.QueryCompletion.prototype.isSearchHistoryCompletion = function () {
        return this.completion_type === sage.QueryCompletionType.SEARCH_HISTORY_SELF;
    };
    sage.QueryCompletion.prototype.isFoldedCompletion = function () {
        return false;
    };

    /**
     * A subclass of QueryCompletion class to show a join ambiguity question option as a dropdown item.
     * This class is only used locally in Blink and is not serialized in the thrift protocol request back to Sage server.
     *
     * @param {Object} params
     * @constructor
     */
    sage.JoinAmbiguityQueryCompletion = function (params) {
        // Convert join ambiguity input to query completions structure.
        var workingTokenIndex = params.workingTokenIndex;
        var allTokens = params.allTokens;

        angular.extend(this, new sage.QueryCompletion({
            query: allTokens.slice(0, workingTokenIndex + 1),
            num_prefix_tokens: params.numPrefixTokens,
            num_suffix_tokens: params.numSuffixTokens,
            search_text: allTokens[workingTokenIndex].getTokenText()
        }));

        this.all_tokens = allTokens;
        this._joinChoice = params.joinChoice;
        this._workingTokenIndex = workingTokenIndex;
        this._joinHistoryList = params.history.filter(function (historyItem) {
            return historyItem.tokenIndex == workingTokenIndex;
        });
    };
    angular.extend(sage.JoinAmbiguityQueryCompletion.prototype, sage.QueryCompletion.prototype);

    /**
     *
     * @return {Object}
     */
    sage.JoinAmbiguityQueryCompletion.prototype.getJoinOption = function () {
        return this._joinChoice;
    };

    /**
     * Returns the string representation of new tokens
     * The method is largely same as QueryCompletion::getNewTokensQueryString except it may additionally append join
     * path labels.
     *
     * @return {string}
     * @override
     */
    sage.JoinAmbiguityQueryCompletion.prototype.getNewTokensQueryString = function () {
        var queryTokens = this.getNewTokens(),
            queryString = queryTokens.map(function (token) {
                return token.getTokenTextLowerCase();
            }).join(' ') || '';

        var contextLabel = '';
        if (this._joinHistoryList && this._joinHistoryList.length > 0) {
            contextLabel = this._joinHistoryList.first().question.selectedOption.link.getDisplayName();
            for (var i = 1; i < this._joinHistoryList.length; ++i) {
                contextLabel += ', ' + this._joinHistoryList[i].question.selectedOption.link.getDisplayName();
            }
        }

        if (!contextLabel) {
            return queryString;
        }

        return queryString + ' - ' + contextLabel;
    };

    /**
     * Method returns any labeling that can be used to disambiguate choices of same kind. In this version, this translates
     * the a join question option into a label for disambiguation.
     *
     * @return {string}
     * @override
     */
    sage.JoinAmbiguityQueryCompletion.prototype.getLineage = function () {
        return !!this._joinChoice.root ? 'All types' :
            'from {1} through {2}'.assign(this._joinChoice.link.getSourceName(), this._joinChoice.link.getDisplayName());
    };

    /**
     *
     * @returns {sage.QueryCompletion.CompletionTypes.*}
     */
    sage.JoinAmbiguityQueryCompletion.prototype.getCompletionType = function () {
        return sage.QueryCompletion.CompletionTypes.JOIN;
    };


    /**
     * A subclass of QueryCompletion class to show a folded query completion "europe (2 matches)".
     * This class is only used locally in Blink and is not serialized in the thrift protocol request back to Sage server.
     *
     * @param {sage.QueryCompletion} originalCompletion
     * @constructor
     */
    sage.FoldedQueryCompletion = function (originalCompletion) {
        angular.extend(this, originalCompletion);
    };
    angular.extend(sage.FoldedQueryCompletion.prototype, sage.QueryCompletion.prototype);

    sage.FoldedQueryCompletion.prototype.isFoldedCompletion = function () {
        return true;
    };
    sage.FoldedQueryCompletion.prototype.setNumDuplicates = function (numDuplicates) {
        this._numDuplicates = numDuplicates;
    };

    sage.FoldedQueryCompletion.prototype.getNumDuplicates = function () {
        return this._numDuplicates;
    };

    sage.FoldedQueryCompletion.prototype.getLineage = function () {
        return '({1} matches)'.assign(this._numDuplicates);
    };

    /**
     *
     * @returns {number}
     */
    sage.PhraseDefinition.prototype.getStartIndex = function () {
        return this.start_index;
    };

    /**
     *
     * @returns {number}
     */
    sage.PhraseDefinition.prototype.getNumTokens = function () {
        return this.num_tokens;
    };

    /**
     *
     * @returns {sage.PhraseType}
     */
    sage.PhraseDefinition.prototype.getPhraseType = function () {
        return this.phrase_type;
    };

    /**
     *
     * @returns {boolean}
     */
    sage.PhraseDefinition.prototype.isCompletePhrase = function () {
        return this.is_complete_phrase;
    };

    /**
     *
     * @param {number} start_index
     * @param {number} num_tokens
     * @param {sage.PhraseType} phrase_type
     * @returns {sage.PhraseDefinition}
     */
    sage.PhraseDefinition.create = function (start_index, num_tokens, phrase_type) {
        return new sage.PhraseDefinition({
            start_index: start_index,
            num_tokens: num_tokens,
            phrase_type: phrase_type
        });
    };

    sage.ColumnMetadata.prototype.isIndexed = function () {
        return this.is_indexed;
    };
})();
