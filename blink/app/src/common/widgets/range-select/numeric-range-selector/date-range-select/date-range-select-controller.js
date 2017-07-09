/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for date range select.
 */

'use strict';

blink.app.factory('DateRangeSelectController', ['BaseRangeSelectController',
    'rangeOperatorUtil',
    'strings',
    'util',
    function (BaseRangeSelectController,
          rangeOperatorUtil,
          strings,
          util) {
        function DateRangeSelectController(
        rangeDefinitionInLeafOperators,
        isReadOnly,
        firstOperandOnEnter,
        firstOperandOnEscape,
        secondOperandOnEnter,
        secondOperandOnEscape
    ) {
            DateRangeSelectController.__super.call(
            this,
            rangeDefinitionInLeafOperators,
            isReadOnly,
            firstOperandOnEnter,
            firstOperandOnEscape,
            secondOperandOnEnter,
            secondOperandOnEscape
        );
        // Note (sunny): the UI for date range filter only supports
        // day level ranges (neither higher, nor lower) hence the filter
        // epoch values always need to be formatted to days.
        // The toLowerCase call is to handle the interpretation of date formats between
        // icu and date picker.
            this.dateFormat = icu4js.dateFormat.getLocalizedPattern('MM/dd/yyyy').toLowerCase();
            this.strings = strings;
        }

        util.inherits(DateRangeSelectController, BaseRangeSelectController);

        DateRangeSelectController.prototype.getPlaceholderText = function() {
            return this.dateFormat;
        };

    // @Override
        DateRangeSelectController.prototype.selectOperatorOptionFromModel = function() {
            var firstOperator = (void 0 != this.rangeDefinition.firstOperand)
            ? this.rangeDefinition.firstOperator : BaseRangeSelectController.operatorTypes.GE;

            this.rangeDefinition.firstOperator = firstOperator;
            this.selectedFirstOperatorOption =
            this.firstOperatorOptions.find(function(option){
                return option.operator === firstOperator;
            });

            this.setOperatorOptions();

        // NOTE: In the case when user clicks the second operand we try to select the operator.
        // Now if the second operator is defined here, it means that user made that choice.
        // So we just try to retain that.
            var secondOperator = this.rangeDefinition.secondOperator
            || BaseRangeSelectController.operatorTypes.LE;

            var compatibleSecondOperators = rangeOperatorUtil.getCompatibleOperators(
            this.rangeDefinition.firstOperator
        );

            if (compatibleSecondOperators.none(secondOperator)) {
                secondOperator = null;
            }

            this.rangeDefinition.secondOperator = secondOperator;
            this.selectedSecondOperatorOption =
            this.secondOperatorOptions.find(function(option){
                return option.operator === secondOperator;
            });
        };

        return DateRangeSelectController;
    }]);
