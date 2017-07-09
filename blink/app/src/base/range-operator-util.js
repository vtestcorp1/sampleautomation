/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Utility functions for range operators
 */

'use strict';

blink.app.factory('rangeOperatorUtil', ['util',
    'filterTypes',
    function (util,
              filterTypes
    ) {
        var operatorTypes = filterTypes.FilterRowOperators;

        var operatorLabelToTypeMap = {
            '>' : operatorTypes.GT,
            '>=' : operatorTypes.GE,
            '<' : operatorTypes.LT,
            '<=' : operatorTypes.LE,
            '=' : operatorTypes.EQ,
            '!=' : operatorTypes.NE
        };

        var operatorToLabelMap = util.invertObject(operatorLabelToTypeMap);

    // Create a mapping from one leaf operator to list of possible leaf operators
    // that can be simultaneously applied. This is used to show the options in the
    // second operator based on the choice in the first operator.
        var simultaneouslyApplicableOperatorMapping = util.createObject([
        [operatorTypes.EQ, []],
        [operatorTypes.NE, []],
        [operatorTypes.LT, [operatorTypes.GT, operatorTypes.GE]],
        [operatorTypes.LE, [operatorTypes.GT, operatorTypes.GE]],
        [operatorTypes.GT, [operatorTypes.LT, operatorTypes.LE]],
        [operatorTypes.GE, [operatorTypes.LT, operatorTypes.LE]]
        ]);

    // Build a mapping from between operator to individual operators.
        var betweenTypeToOpType = {};
        betweenTypeToOpType[operatorTypes.BW] = [operatorTypes.GT, operatorTypes.LT];
        betweenTypeToOpType[operatorTypes.BW_INC] = [operatorTypes.GE, operatorTypes.LE];
        betweenTypeToOpType[operatorTypes.BW_INC_MIN] = [operatorTypes.GE, operatorTypes.LT];
        betweenTypeToOpType[operatorTypes.BW_INC_MAX] = [operatorTypes.GT, operatorTypes.LE];

        function RangeDefinitionInLeafOperators(
        firstOperator,
        firstOperand,
        secondOperator,
        secondOperand
    ) {
            this.firstOperator = firstOperator;
            this.firstOperand = firstOperand;
            this.secondOperator = secondOperator;
            this.secondOperand = secondOperand;
        }

        RangeDefinitionInLeafOperators.prototype.setFirstOperator = function(firstOperator) {
            this.firstOperator = firstOperator;
        };

        RangeDefinitionInLeafOperators.prototype.setFirstOperand = function(firstOperand) {
            this.firstOperand = firstOperand;
        };

        RangeDefinitionInLeafOperators.prototype.setSecondOperator = function(secondOperator) {
            this.secondOperator = secondOperator;
        };

        RangeDefinitionInLeafOperators.prototype.setSecondOperand = function(secondOperand) {
            this.secondOperand = secondOperand;
        };

        RangeDefinitionInLeafOperators.prototype.equals = function(rangeDefinition) {
            return this.firstOperand === rangeDefinition.firstOperand
            && this.firstOperator === rangeDefinition.firstOperator
            && this.secondOperand === rangeDefinition.secondOperand
            && this.secondOperator === rangeDefinition.secondOperator;
        };

        function isEqualOperator(op) {
            return !!op && op === operatorTypes.EQ;
        }

        function isNotEqualOperator(op) {
            return !!op && op === operatorTypes.NE;
        }

        function isSingleValueOperator(op) {
            return isEqualOperator(op) || isNotEqualOperator(op);
        }

        function getCompatibleOperators (operator) {
            var compatibleOptions = simultaneouslyApplicableOperatorMapping[operator];
            compatibleOptions = compatibleOptions || [];
            return compatibleOptions;
        }

    /**
     * If the operator type is one of the between operators defined above.
     *
     * @param {string} operator
     * @return {boolean}
     */
        function isBetweenOperator(operator) {
            return betweenTypeToOpType.hasOwnProperty(operator);
        }

    /**
     * If the filterOperator string is one of the BETWEEN* operator types, then it reads the model and returns the
     * various components making up the between operations.
     *
     * @param {string} filterOperator
     * @return {Object=}
     */
        function mapBetweenToLeafOperators(filterOperator, filterValues) {
            if (!isBetweenOperator(filterOperator) || filterValues.length < 2) {
                return null;
            }

            var lbOp = betweenTypeToOpType[filterOperator][0],
                ubOp = betweenTypeToOpType[filterOperator][1],
                val1 = filterValues[0],
                val2 = filterValues[1];

            var rangeDefinition = new RangeDefinitionInLeafOperators(lbOp, val1, ubOp, val2);
            return rangeDefinition;
        }

    /**
     *
     * @param operator
     * @returns {*}
     */
        function getOperatorLabel(operator) {
            return operatorToLabelMap[operator];
        }

        return {
            operatorTypes: operatorTypes,
            operatorLabelToTypeMap: operatorLabelToTypeMap,
            getCompatibleOperators: getCompatibleOperators,
            isSingleValueOperator: isSingleValueOperator,
            mapBetweenToLeafOperators: mapBetweenToLeafOperators,
            RangeDefinitionInLeafOperators: RangeDefinitionInLeafOperators,
            isBetweenOperator: isBetweenOperator,
            getOperatorLabel: getOperatorLabel
        };
    }]);
