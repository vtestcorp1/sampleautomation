/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class representing numeric range select model.
 */

'use strict';

blink.app.factory('NumericRangeSelectController', ['BaseRangeSelectController',
    'Logger',
    'strings',
    'util',
    function (BaseRangeSelectController,
          Logger,
          strings,
          util) {
        var _logger = Logger.create('numeric-range-select-controller');

        var DATA_TYPES = {
            INTEGER: 'INTEGER',
            FLOAT: 'FLOAT'
        };

        var VALIDATORS = {
            INTEGER: {
                test: function (value) {
                    return !isNaN(icu4js.numberFormat.parseInt(value, false));
                }
            },
            FLOAT:  {
                test: function (value) {
                    return !isNaN(icu4js.numberFormat.parseFloat(value, false));
                }
            }
        };

        function NumericRangeSelectController(
        rangeDefinitionInLeafOperators,
        isReadOnly,
        dataType,
        firstOperandOnEnter,
        firstOperandOnEscape,
        secondOperandOnEnter,
        secondOperandOnEscape
    ) {
            NumericRangeSelectController.__super.call(
            this,
            rangeDefinitionInLeafOperators,
            isReadOnly,
            firstOperandOnEnter,
            firstOperandOnEscape,
            secondOperandOnEnter,
            secondOperandOnEscape
        );

            this.dataType = dataType;
            this.strings = strings;
        }

        util.inherits(NumericRangeSelectController, BaseRangeSelectController);

        NumericRangeSelectController.dataTypes = DATA_TYPES;

        NumericRangeSelectController.prototype.getValidator = function () {
            switch(this.dataType) {
                case DATA_TYPES.INTEGER:
                    return VALIDATORS.INTEGER;
                case DATA_TYPES.FLOAT:
                    return VALIDATORS.FLOAT;
                default :
                    _logger.error('Unsupported data type', this.dataType);
                    return NumericRangeSelectController.__super.getValidator.call(this);
            }
        };

        return NumericRangeSelectController;
    }]);
