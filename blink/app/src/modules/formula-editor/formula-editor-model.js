/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Data model for formula editor
 */

'use strict';

blink.app.factory('FormulaEditorModel', ['ExpressionEditorModel',
    'Logger',
    function (ExpressionEditorModel,
          Logger) {

        var _logger = Logger.create('formula-editor-model');

        var FormulaEditorModel = function(dataScope, sageContext, formulaId) {
            var isRLS = false;
            this.expressionEditorModel = new ExpressionEditorModel(
            dataScope,
            sageContext,
            formulaId,
            isRLS);

            this.formulaName = 'Untitled Formula';
            this.overriddenType = null;
            this.overriddenDataType = null;
            this.overriddenAggrType = null;
        };

    /**
     * Static factory function to create a new model given state.
     *
     * @param {string} formulaName
     * @param {Array<sage.RecognizedToken>} recognizedTokens
     * @param {Array<string>} dataScope
     * @param sageContext
     * @param {string} formulaId - GUID of the formula being edited, will be empty if GUID is not yet assigned.
     * @param overriddenType
     * @param overriddenDataType
     * @param overriddenAggrType
     * @returns {FormulaEditorModel}
     */
        FormulaEditorModel.createModelFromExistingState = function (formulaName,recognizedTokens,
                                                                dataScope, sageContext, formulaId, overriddenType,
                                                                overriddenDataType, overriddenAggrType) {
            var model = new FormulaEditorModel(dataScope, sageContext, formulaId);
            model.setFormulaName(formulaName);
            model.expressionEditorModel.setNewTokens(recognizedTokens);
            model.setOverriddenType(overriddenType);
            model.setOverriddenDataType(overriddenDataType);
            model.setOverriddenAggrType(overriddenAggrType);
            return model;
        };

        FormulaEditorModel.prototype.setFormulaName = function (formulaName) {
            this.formulaName = formulaName;
        };

        FormulaEditorModel.prototype.getFormulaName = function () {
            return this.formulaName;
        };

        FormulaEditorModel.prototype.setOverriddenType = function (overriddenType) {
            this.overriddenType = overriddenType;
        };

        FormulaEditorModel.prototype.getOverriddenType = function () {
            return this.overriddenType;
        };

        FormulaEditorModel.prototype.clearTypeOverride = function () {
            this.overriddenType = null;
        };

        FormulaEditorModel.prototype.setOverriddenDataType = function (overriddenDataType) {
            this.overriddenDataType = overriddenDataType;
        };

        FormulaEditorModel.prototype.getOverriddenDataType = function () {
            return this.overriddenDataType;
        };

        FormulaEditorModel.prototype.clearDataTypeOverride = function () {
            this.overriddenDataType = null;
        };

        FormulaEditorModel.prototype.setOverriddenAggrType = function (overriddenAggrType) {
            this.overriddenAggrType = overriddenAggrType;
        };

        FormulaEditorModel.prototype.getOverriddenAggrType = function () {
            return this.overriddenAggrType;
        };

        FormulaEditorModel.prototype.clearAggrTypeOverride = function () {
            this.overriddenAggrType = null;
        };

        FormulaEditorModel.prototype.resetOverridesToMatchFormulaColumn = function (formulaColumn) {
            this.setOverriddenDataType(formulaColumn.getDataType());
            this.setOverriddenAggrType(formulaColumn.getAggregateType());
            this.setOverriddenType(formulaColumn.getType());
        };

        return FormulaEditorModel;
    }]);
