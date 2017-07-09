/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Data model for expression editor
 */

'use strict';

blink.app.factory('ExpressionEditorModel', ['Logger', 'util', function (Logger, util) {

    var _logger = Logger.create('expression-editor-model');

    var MAX_COMPLETIONS = 5;


    var ExpressionEditorModel = function(dataScope, sageContext, formulaId, isRLS) {
        this.dataScope = dataScope;
        this.sageContext = sageContext;
        this.formulaId = formulaId;
        this.isRLS = isRLS;

        this.newTokens = [];
        this.ghostTokens = [];
        this.tokenCompletions = [];
        this.completionTokenPosition = -1;
        this.completionTokenCursorOffset = 0;
        this.completionError = null;
        this.joinPathAmbiguities = [];
        this.encodedSageQuery = null;
    };

    ExpressionEditorModel.prototype.createUpdatedModelFromSageResponse = function (expressionResponse) {
        var tableResponse = expressionResponse.getResponse();
        var currentCursorOffset = this.completionTokenCursorOffset;

        var model = new ExpressionEditorModel(this.dataScope, this.sageContext, this.formulaId, this.isRLS);
        model.setCompletionTokenCursorOffset(currentCursorOffset);

        model.setNewTokens(tableResponse.getNewTokens());

        model.setGhostTokens(tableResponse.getFormulaGhost());
        model.setTokenCompletions(tableResponse.getFormulaCompletions().slice(0));

        model.setCompletionTokenPosition(tableResponse.getCompletionPosition());
        model.setJoinPathAmbiguities(tableResponse.getJoinPathAmbiguities());

        var error = expressionResponse.getError();
        var errorCode = error.getErrorCode();
        if (!errorCode) {
            model.clearCompletionError();
            model.setFormulaExpression(expressionResponse.getWorksheet().getExpression());
        } else {
            model.setCompletionError({
                error: errorCode,
                errorMessage: error.getErrorMessage(),
                errorMessagePosition: error.getErrorMessagePosition(),
                errorSpan: error.getErrorSpan(),
                severity: error.getSeverity()
            });
            model.clearEncodedSageQuery();
        }

        return model;
    };

    ExpressionEditorModel.createModelFromExistingState = function (recognizedTokens) {
        var model = new ExpressionEditorModel();
        model.setNewTokens(recognizedTokens);
        return model;
    };

    ExpressionEditorModel.prototype.setNewTokens = function (newTokens) {
        this.newTokens = newTokens;
    };

    ExpressionEditorModel.prototype.getNewTokens = function () {
        return this.newTokens || [];
    };

    ExpressionEditorModel.prototype.hasTokens = function () {
        return this.newTokens && this.newTokens.length > 0;
    };

    ExpressionEditorModel.prototype.setGhostTokens = function (ghostTokens) {
        this.ghostTokens = ghostTokens;
    };

    ExpressionEditorModel.prototype.getGhostTokens = function () {
        return this.ghostTokens;
    };

    ExpressionEditorModel.prototype.setTokenCompletions = function (tokenCompletions) {
        this.tokenCompletions = tokenCompletions;
    };

    ExpressionEditorModel.prototype.getTokenCompletions = function () {
        return this.tokenCompletions;
    };

    ExpressionEditorModel.prototype.setCompletionTokenPosition = function (completionTokenPosition) {
        this.completionTokenPosition = completionTokenPosition;
    };

    ExpressionEditorModel.prototype.getCompletionTokenPosition = function () {
        return this.completionTokenPosition;
    };

    ExpressionEditorModel.prototype.setCompletionTokenCursorOffset = function (completionTokenCursorOffset) {
        this.completionTokenCursorOffset = completionTokenCursorOffset;
    };

    ExpressionEditorModel.prototype.getCompletionTokenCursorOffset = function () {
        return this.completionTokenCursorOffset;
    };


    ExpressionEditorModel.prototype.setCompletionError = function (completionError) {
        this.completionError = completionError;

        //patch for sage bug where for join path ambiguity in some cases
        //severity is set to error and not warning
        if (this.completionError.error === sage.ErrorCode.JOIN_PATH_AMBIGUITY) {
            this.completionError.severity = sage.ErrorSeverity.WARNING;
        }
    };

    ExpressionEditorModel.prototype.clearCompletionError = function () {
        this.completionError = null;
    };

    ExpressionEditorModel.prototype.getCompletionError = function () {
        return this.completionError;
    };

    ExpressionEditorModel.prototype.hasCompletionError = function () {
        return !!this.completionError;
    };

    ExpressionEditorModel.prototype.getCompletionErrorMessages = function () {
        if (!this.completionError) {
            return [];
        }
        return [this.completionError.errorMessage];
    };

    ExpressionEditorModel.prototype.setJoinPathAmbiguities = function (joinPathAmbiguities) {
        this.joinPathAmbiguities = joinPathAmbiguities;
    };

    ExpressionEditorModel.prototype.getJoinPathAmbiguities = function () {
        return this.joinPathAmbiguities;
    };

    ExpressionEditorModel.prototype.getSageContext = function () {
        return this.sageContext;
    };

    ExpressionEditorModel.prototype.getFormulaId = function () {
        return this.formulaId
    };

    ExpressionEditorModel.prototype.setFormulaExpression = function (formulaExpression) {
        this.formulaExpression = formulaExpression;
    };

    ExpressionEditorModel.prototype.getFormulaExpression = function () {
        return this.formulaExpression;
    };

    ExpressionEditorModel.prototype.clearEncodedSageQuery = function () {
        this.formulaExpression = null;
    };

    ExpressionEditorModel.prototype.hasValidFormula = function () {
        return !this.hasCompletionError() && !!this.getFormulaExpression();
    };

    return ExpressionEditorModel;
}]);
