/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class representing range select model.
 */

'use strict';

blink.app.factory('BaseRangeSelectController', ['blinkConstants',
    'strings',
    'rangeOperatorUtil',
    function (blinkConstants,
          strings,
          rangeOperatorUtil) {
        var EMPTY_OPTION = {
            label: '...',
            operator: null
        };

        var operatorTypes = rangeOperatorUtil.operatorTypes;
        var operatorLabelToTypeMap = rangeOperatorUtil.operatorLabelToTypeMap;

        var selectableOptions = Object.keys(operatorLabelToTypeMap)
        .map(function(label){
            return {
                label: label,
                operator: operatorLabelToTypeMap[label]
            };
        });

        var defaultValidator = {
            test: function (value) {
                return true;
            }
        };

    /**
     *
     * @param [RangeDefinitionInLeafOperators] rangeDefinitionInLeafOperators
     * @param [boolean] isReadOnly
     * @param [function] firstOperandOnEnter
     * @param [function] firstOperandOnEscape
     * @param [function] secondOperandOnEnter
     * @param [function] secondOperandOnEscape
     *
     * @constructor
     */
        function BaseRangeSelectController(
        rangeDefinitionInLeafOperators,
        isReadOnly,
        firstOperandOnEnter,
        firstOperandOnEscape,
        secondOperandOnEnter,
        secondOperandOnEscape
    ){
        // Input state variables.
            this.rangeDefinition = rangeDefinitionInLeafOperators;
            this.isReadOnly = !!isReadOnly;
            this.firstOperandOnEnter = firstOperandOnEnter || angular.noop;
            this.firstOperandOnEscape = firstOperandOnEscape || angular.noop;
            this.secondOperandOnEnter = secondOperandOnEnter || angular.noop;
            this.secondOperandOnEscape = secondOperandOnEscape || angular.noop;

        // Controller state variables.
            this.disableSecondOperator = false;
            this.firstOperatorOptions = [];
            this.secondOperatorOptions = [];

            this.setOperatorOptions();
            this.selectOperatorOptionFromModel();
        }

        BaseRangeSelectController.prototype.setRangeDefinition = function(rangeDefinition) {
            this.rangeDefinition = rangeDefinition;
            this.selectOperatorOptionFromModel();
        };

        BaseRangeSelectController.prototype.setIsReadOnly = function(isReadOnly) {
            this.isReadOnly = isReadOnly;
        };

        BaseRangeSelectController.prototype.setSecondOperatorOptions = function() {
            var compatibleSecondOperators = rangeOperatorUtil.getCompatibleOperators(
            this.rangeDefinition.firstOperator
        );
            var compatibleOptions = selectableOptions.filter(function(option){
                return compatibleSecondOperators.any(option.operator);
            });

            this.secondOperatorOptions = [EMPTY_OPTION].concat(compatibleOptions);
        };

        BaseRangeSelectController.prototype.setOperatorOptions = function() {
            var self = this;
            if (this.isReadOnly) {
                this.firstOperatorOptions = selectableOptions
                .filter(function(option) {
                    return option.operator === self.rangeDefinition.firstOperator;
                });

                this.secondOperatorOptions = selectableOptions
                .filter(function(option) {
                    return option.operator === self.rangeDefinition.secondOperator;
                });
            } else {
                this.firstOperatorOptions = selectableOptions;

                this.setSecondOperatorOptions();
            }

            this.disableSecondOperator =
            rangeOperatorUtil.isSingleValueOperator(this.rangeDefinition.firstOperator);
        };

        BaseRangeSelectController.prototype.selectOperatorOptionFromModel = function() {
            var firstOperatorInModel = this.rangeDefinition.firstOperator;
            this.selectedFirstOperatorOption =
            this.firstOperatorOptions.find(function(option){
                return option.operator === firstOperatorInModel;
            });

            if (!this.selectedFirstOperatorOption) {
                this.selectedFirstOperatorOption =
                this.firstOperatorOptions.find(function(option){
                    return option.operator === operatorTypes.EQ;
                });
            }

            var secondOperatorInModel = this.rangeDefinition.secondOperator;
            this.selectedSecondOperatorOption =
            this.secondOperatorOptions.find(function(option){
                return option.operator === secondOperatorInModel;
            });

            if (!this.selectedSecondOperatorOption) {
                this.selectedSecondOperatorOption =
                this.secondOperatorOptions.find(function(option){
                    return option.operator === null;
                });
            }
        };

        BaseRangeSelectController.prototype.onFirstOperatorChange = function() {
            this.rangeDefinition.firstOperator =
            this.selectedFirstOperatorOption.operator;
            this.setSecondOperatorOptions();

            var secondOperator = this.rangeDefinition.secondOperator;

            var compatibleSecondOperators = this.secondOperatorOptions.map(function(option){
                return option.operator;
            });

            if (compatibleSecondOperators.none(secondOperator)) {
                secondOperator = null;
            }

            this.rangeDefinition.secondOperator = secondOperator;
            this.selectedSecondOperatorOption =
            this.secondOperatorOptions.find(function(option){
                return option.operator === secondOperator;
            });

            this.disableSecondOperator =
            rangeOperatorUtil.isSingleValueOperator(this.rangeDefinition.firstOperator);
        };

        BaseRangeSelectController.prototype.onSecondOperatorChange = function() {
            this.rangeDefinition.secondOperator =
            this.selectedSecondOperatorOption.operator;
        };

        BaseRangeSelectController.prototype.getPlaceholderText = function (op) {
            if (op === operatorTypes.GT || op === operatorTypes.GE) {
                return strings.rangeSelect.ENTER_MIN_VALUE;
            } else if (op === operatorTypes.LT || op === operatorTypes.LE) {
                return strings.rangeSelect.ENTER_MAX_VALUE;
            } else {
                return strings.rangeSelect.ENTER_A_VALUE;
            }
        };

        BaseRangeSelectController.prototype.autoSelectSecondOperator = function () {
            if (this.rangeDefinition.firstOperand && !this.rangeDefinition.secondOperator) {
                if (this.rangeDefinition.firstOperator === operatorTypes.GE) {
                    this.rangeDefinition.secondOperator = operatorTypes.LE;
                } else if (this.rangeDefinition.firstOperator === operatorTypes.GT) {
                    this.rangeDefinition.secondOperator = operatorTypes.LT;
                }
            }

            this.selectOperatorOptionFromModel();
        };

        BaseRangeSelectController.prototype.getValidator = function () {
            return defaultValidator;
        };

        BaseRangeSelectController.prototype.getRangeDefinition = function(){
            return this.rangeDefinition;
        };

        BaseRangeSelectController.operatorTypes = operatorTypes;

        return BaseRangeSelectController;
    }]);
