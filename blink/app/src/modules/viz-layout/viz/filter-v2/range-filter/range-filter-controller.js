/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Range filter controller
 */

'use strict';
blink.app.factory('RangeFilterController', ['filterTransformationUtil',
    'filterUtil',
    'Logger',
    'NumericRangeSelectController',
    'strings',
    'util',
    function(filterTransformationUtil,
         filterUtil,
         Logger,
         NumericRangeSelectController,
         strings,
         util) {
        var _logger = Logger.create('range-filter-controller');

        function RangeFilterController(
        filterModel,
        isReadOnly,
        firstOperandOnEnter,
        firstOperandOnEscape,
        secondOperandOnEnter,
        secondOperandOnEscape
    ) {

            this.filterModel = filterModel;
            this.strings = strings;
            var rangeDefinition = filterUtil.getRangeDefinitionFromModel(filterModel);
            var filterColumn = this.filterModel.getColumn();
            var dataType;
            if (filterColumn.isInteger()) {
                dataType = NumericRangeSelectController.dataTypes.INTEGER;
            }
            if (filterColumn.isFloat()) {
                dataType = NumericRangeSelectController.dataTypes.FLOAT;
            }

            RangeFilterController.__super.call(
            this,
            rangeDefinition,
            isReadOnly,
            dataType,
            firstOperandOnEnter,
            firstOperandOnEscape,
            secondOperandOnEnter,
            secondOperandOnEscape
        );
        }

        util.inherits(RangeFilterController, NumericRangeSelectController);

        RangeFilterController.prototype.setFilterModel = function (filterModel) {
            this.filterModel = filterModel;
            var rangeDefinition = filterUtil.getRangeDefinitionFromModel(filterModel);
            this.setRangeDefinition(rangeDefinition);
        };

        RangeFilterController.prototype.getRequiredQueryTransformations = function() {
            var rangeDefinition = this.getRangeDefinition();
            var queryTransformations = filterTransformationUtil.getRangeChangeTransformations(
            this.filterModel,
            rangeDefinition
        );

            return queryTransformations;
        };

        return RangeFilterController;
    }]);
