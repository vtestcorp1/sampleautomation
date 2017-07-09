/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Utility to help build tsProto auto complete objects.
 */

'use strict';

blink.app.factory('autoCompleteObjectUtil', ['sageCallosumTranslator',
    'sageDataScopeService',
    function(sageCallosumTranslator,
         sageDataScopeService) {

    /**
     *
     * @returns {sage.ACTableRequest}
     */
        function getNewACTableRequest () {
            var request = new sage.ACTableRequest();
            var dataScope = sageDataScopeService.getSources();
            request.setDataScopeLogicalTables(dataScope);
            request.setInputTokens([]);
            return request;
        }

    /**
     *
     * @returns {sage.ACContext}
     */
        function getNewACContext() {
            var context = new sage.ACContext();
            context.setTables([]);
            context.setJoins([]);

            return context;
        }

    /**
     *
     * @returns {sage.ACContext}
     */
        function getNewACContextWithTable() {
            var context = new sage.ACContext();
            var table = new sage.ACTable();
            table.setTokens([]);
            context.setTables([table]);
            context.setJoins([]);

            return context;
        }

        function getNewACTable() {
            return new sage.ACTable();
        }

    /**
     * @param formulaColumn
     * @returns {sage.ACFormula}
     */
        function getNewACFormula(formulaColumn) {
            var formula = new sage.ACFormula();

            formula.setId(formulaColumn.getFormulaId());
            formula.setName(formulaColumn.getName());
            formula.setExpression(formulaColumn.getFormulaQuery());
            formula.setTokens(formulaColumn.getFormulaTokens());

            var sageAggregationType =
            sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(formulaColumn.getAggregateType());
            if (sage.AggregationType[sageAggregationType]) {
                formula.setAggregationType(sage.AggregationType[sageAggregationType]);
            }

            var sageDataType =
            sageCallosumTranslator.getSageDataTypeForCallosumDataType(formulaColumn.getDataType());
            if (sage.DataType[sageDataType]) {
                formula.setDataType(sage.DataType[sageDataType]);
            }

            var sageColumnType =
            sageCallosumTranslator.getSageColumnTypeForCallosumColumnType(formulaColumn.getType());
            if (sage.ColumnType[sageColumnType]) {
                formula.setColumnType(sage.ColumnType[sageColumnType]);
            }

            return formula;
        }

        /**
         * Creates an ACTable request from the array of recognized tokens.
         * @param recognizedTokens
         * @returns {Array<sage.ACTableRequest>}
         */
        function createACTableRequestFromTokens(recognizedTokens) {
            var actableRequest = new sage.ACTableRequest();
            actableRequest.setInputTokens(recognizedTokens);
            actableRequest.setMaxCompletions(1);
            var inputTokens = actableRequest.getInputTokens();
            actableRequest.setCurrentlyEditedToken(inputTokens.length - 1);
            actableRequest.setCursorOffsetInToken(inputTokens[inputTokens.length - 1].token.length);
            return actableRequest;
        }

    /**
     *
     * @param filterModel
     * @returns {sage.ACFormula}
     */
        function getNewACFormulaFromFilter(filterModel) {
            var formula = new sage.ACFormula();
            formula.setId(filterModel.getId());
            formula.setName(filterModel.getName());
            formula.setExpression(filterModel.getExpression());
            formula.setTokens(filterModel.getTokens());

            return formula;
        }

        return {
            createACTableRequestFromTokens: createACTableRequestFromTokens,
            getNewACTableRequest: getNewACTableRequest,
            getNewACContext: getNewACContext,
            getNewACContextWithTable: getNewACContextWithTable,
            getNewACFormula: getNewACFormula,
            getNewACFormulaFromFilter: getNewACFormulaFromFilter,
            getNewACTable: getNewACTable
        };
    }]);
