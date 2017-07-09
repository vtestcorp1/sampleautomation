/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Range filter controller
 */

'use strict';
blink.app.factory('DateFilterController', ['DateRangeSelectController',
    'filterTransformationUtil',
    'filterUtil',
    'Logger',
    'strings',
    'util',
    function(DateRangeSelectController,
         filterTransformationUtil,
         filterUtil,
         Logger,
         strings,
         util) {
        var _logger = Logger.create('date-filter-controller');

        function DateFilterController(
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

            DateFilterController.__super.call(
            this,
            rangeDefinition,
            isReadOnly,
            firstOperandOnEnter,
            firstOperandOnEscape,
            secondOperandOnEnter,
            secondOperandOnEscape
        );
        }

        util.inherits(DateFilterController, DateRangeSelectController);

        DateFilterController.prototype.setFilterModel = function (filterModel) {
            this.filterModel = filterModel;

            var rangeDefinition = filterUtil.getRangeDefinitionFromModel(filterModel);

            this.setRangeDefinition(rangeDefinition);
        };

        DateFilterController.prototype.getRequiredQueryTransformations = function() {
            var rangeDefinition = this.getRangeDefinition();
            var queryTransformations = filterTransformationUtil.getRangeChangeTransformations(
            this.filterModel,
            rangeDefinition
        );

            return queryTransformations;
        };

        return DateFilterController;
    }]);
