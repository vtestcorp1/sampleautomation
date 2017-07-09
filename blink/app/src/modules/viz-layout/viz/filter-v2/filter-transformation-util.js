/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com
 *
 * @fileoverview Util to generate transformations needed to apply on filter changes.
 */

'use strict';

blink.app.factory('filterTransformationUtil', ['dateUtil',
    'filterTypes',
    'filterUtil',
    'Logger',
    'sageCallosumTranslator',
    'util',
    function (dateUtil,
              filterTypes,
              filterUtil,
              Logger,
              sageCallosumTranslator,
              util) {
        var _logger = Logger.create('filter-transformation-util');
        var USE_BULK_IN_FILTER_THRESHOLD = 15;

    /*
     * Formats the value as needed by sage in the QueryTransform.
     * @param filterColumn column on which transformation is being applied.
     * @param raw value stored in FilterModel.
     */
        function getSageTransformValue(filterColumn, value) {
        // For datetime filters we want to send only date component because
        //      - Current date filter widget don't have support for sending time.
        //      - "01/01/2015 00:00:00" creates EXACT_DATE_TIME filter whereas "01/01/2015" creates EXACT_DATE filter.
            if(filterColumn.isDateTimeColumn()) {
                return dateUtil.formatDate(value, 'MM/dd/yyyy', true, true);
            }
            return filterColumn.convertValueToSageValue(value);
        }

        function getSageOperator(filterOperatorType) {
            return sage.CompareType[filterTypes.FilterRowOperators[filterOperatorType]];
        }

    /**
     * Gets all the transformations needed to apply the current filter state.
     * @param rangeDefinition
     * @param filterColumn
     * @returns {Array}
     */
        function getAddRangeFilterTransformations(rangeDefinition, filterColumn) {
            var queryTransformations = [];
            var sageOutputColumnGuid = filterColumn.getSageOutputColumnId();
            var isHavingFilter = filterColumn.hasAggregateOverride();
            var aggrType = filterColumn.getAggregateOverride();
            var aggrSageType = sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(aggrType);
            var aggrTypeSageValue = sage.AggregationType[aggrSageType];
            var transformParams;

            if (!angular.isDefined(aggrTypeSageValue)) {
                _logger.error("no known corresponding sage value for aggrTypeOverride", aggrType);
            }

            if (rangeDefinition.firstOperand) {
                transformParams = {
                    tokenOutputGuid: sageOutputColumnGuid,
                    op: getSageOperator(rangeDefinition.firstOperator),
                    value1: getSageTransformValue(filterColumn, rangeDefinition.firstOperand)
                };

                if (isHavingFilter) {
                    transformParams.aggregation = aggrTypeSageValue;
                    queryTransformations.push(
                    sage.QueryTransform.createAddHavingFilterTransformation(
                        transformParams
                    )
                );
                } else {
                    queryTransformations.push(
                    sage.QueryTransform.createAddPredicateFilterTransformation(
                        transformParams
                    )
                );
                }
            }

            if (!!rangeDefinition.secondOperator && rangeDefinition.secondOperand) {
                transformParams = {
                    tokenOutputGuid: sageOutputColumnGuid,
                    op: getSageOperator(rangeDefinition.secondOperator),
                    value1: getSageTransformValue(filterColumn, rangeDefinition.secondOperand)
                };

                if (isHavingFilter) {
                    transformParams.aggregation = aggrTypeSageValue;
                    queryTransformations.push(
                    sage.QueryTransform.createAddHavingFilterTransformation(
                        transformParams
                    )
                );
                } else {
                    queryTransformations.push(
                    sage.QueryTransform.createAddPredicateFilterTransformation(
                        transformParams
                    )
                );
                }
            }

            return queryTransformations;
        }

    /**
     * Compares the difference between range in filter model and the new range definition
     * to generate the list of transformations to be applied on answer.
     * @param [FilterModel] filterModel
     * @param [RangeDefinitionInLeafOperators] rangeDefinition
     * @returns {Array}
     */
        function getRangeChangeTransformations(filterModel, rangeDefinition) {
            var baseRangeDefinition = filterUtil.getRangeDefinitionFromModel(filterModel);
            if (baseRangeDefinition.equals(rangeDefinition)) {
                return [];
            }

            var filterColumn = filterModel.getColumn();
            var sageOutputColumnGuid = filterColumn.getSageOutputColumnId();
            var isHavingFilter = filterColumn.hasAggregateOverride();
            var aggrType = filterColumn.getAggregateOverride();
            var aggrSageType = sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(aggrType);
            var aggrTypeSageValue = sage.AggregationType[aggrSageType];
            var transformParams;

            if (!angular.isDefined(aggrTypeSageValue)) {
                _logger.error("no known corresponding sage value for aggrTypeOverride", aggrType);
            }

            var queryTransformations = [];
            if (isHavingFilter) {
                var removeHavingTransform = sage.QueryTransform
                .createRemoveHavingFilterTransformationsByAggregation({
                    tokenOutputGuid: sageOutputColumnGuid,
                    aggregation: aggrTypeSageValue
                });
                queryTransformations.push(removeHavingTransform);
            } else {
                if (filterColumn.isDateColumn()) {
                    var removeAllDateRangeTransform = sage.QueryTransform
                    .createRemoveAllDateRangeFilterTransformation({
                        tokenOutputGuid: sageOutputColumnGuid
                    });
                    queryTransformations.push(removeAllDateRangeTransform);
                } else {
                    var removeAllFilterTransform = sage.QueryTransform
                    .createRemoveAllFilterTransformation({
                        tokenOutputGuid: sageOutputColumnGuid
                    });
                    queryTransformations.push(removeAllFilterTransform);
                }
            }

            var addFilterTransformations =
            getAddRangeFilterTransformations(rangeDefinition, filterColumn);

            Array.prototype.push.apply(queryTransformations, addFilterTransformations);

            return queryTransformations;
        }

        function getDeltaKeys(currentSelection, originalSelection) {
            var keysToAdd = [];
            var keysToRemove = [];

            util.iterateObject(currentSelection, function(key) {
                var isSelectedInPreviousSelection = !!originalSelection[key];

                if (!isSelectedInPreviousSelection) {
                    keysToAdd.push(key);
                }
            });

            util.iterateObject(originalSelection, function(key) {
                var isSelectedInUI = !!currentSelection[key];

                if (!isSelectedInUI) {
                    keysToRemove.push(key);
                }
            });

            return {
                keysToAdd: keysToAdd,
                keysToRemove: keysToRemove
            };
        }

        function getAttributeFilterInclusionTransforms(
            sageOutputId,
            keysToAdd,
            keysToRemove,
            filterColumn
        ) {
            var queryTransformations = [];
            if (keysToAdd.length < USE_BULK_IN_FILTER_THRESHOLD) {
                keysToAdd.each(function(key){
                    queryTransformations.push(
                        sage.QueryTransform.createAddInFilterTransformation({
                            tokenOutputGuid: sageOutputId,
                            value: filterColumn.convertValueToSageValue(key)
                        })
                    );
                });
            } else {
                queryTransformations.push(sage.QueryTransform.createAddBulkFilterTransformation({
                    tokenOutputGuid: sageOutputId,
                    bulkValues: keysToAdd
                }));
            }

            keysToRemove.each(function(key){
                queryTransformations.push(
                    sage.QueryTransform.createRemoveInFilterTransformation({
                        tokenOutputGuid: sageOutputId,
                        value: filterColumn.convertValueToSageValue(key)
                    })
                );
            });

            return queryTransformations;
        }

        function getAttributeFilterExclusionTransforms(
            sageOutputId,
            keysToAdd,
            keysToRemove,
            filterColumn
        ) {
            var queryTransformations = [];
            keysToAdd.each(function(key){
                queryTransformations.push(
                    sage.QueryTransform.createAddPredicateFilterTransformation({
                        tokenOutputGuid: sageOutputId,
                        op: sage.CompareType.NE,
                        value1: filterColumn.convertValueToSageValue(key)
                    })
                );
            });
            keysToRemove.each(function(key){
                queryTransformations.push(
                    sage.QueryTransform.createRemovePredicateFilterTransformation({
                        tokenOutputGuid: sageOutputId,
                        op: sage.CompareType.NE,
                        value1: filterColumn.convertValueToSageValue(key)
                    })
                );
            });

            return queryTransformations;
        }
    /**
     * Gets list of transformations to be applied to the answer based on existing selected items
     * in an answer and the new selected items.
     * @param [FilterModel] filterModel
     * @param [Object] selectedItems
     * @returns {Array}
     */
        function getAttributeChangeTransformations(filterModel, selectedItems, excludedValues) {
            var queryTransformations = [];
            var filterColumn = filterModel.getColumn();
            var filterSageOutputColumnId = filterColumn.getSageOutputColumnId();
            var baseSelectedItems = filterModel.getSelectedFilterItems();
            var inclusionDelta = getDeltaKeys(selectedItems, baseSelectedItems);
            var inclusionTransforms = getAttributeFilterInclusionTransforms(
                filterSageOutputColumnId,
                inclusionDelta.keysToAdd,
                inclusionDelta.keysToRemove,
                filterColumn
            );
            Array.prototype.push.apply(queryTransformations, inclusionTransforms);
            var baseExcludedItems = filterModel.getExcludedFilterItems();
            var exclusionDelta = getDeltaKeys(excludedValues, baseExcludedItems);
            var exclusionTransforms = getAttributeFilterExclusionTransforms(
                filterSageOutputColumnId,
                exclusionDelta.keysToAdd,
                exclusionDelta.keysToRemove,
                filterColumn
            );
            Array.prototype.push.apply(queryTransformations, exclusionTransforms);

            return queryTransformations;
        }

    /**
     * Gets transformations to apply the selected items as bulk filter.
     * @param filterModel
     * @param selectedItems
     * @returns {Array}
     */
        function getBulkFilterTransform(filterModel, selectedItems) {
            var queryTransformations = [];
            var values = Object.keys(selectedItems);

            if (values.length === 0) {
                return queryTransformations;
            }

            var filterSageOutputColumnId = filterModel.getColumn().getSageOutputColumnId();
            var column = filterModel.getColumn();
            var keysToAdd = values.map(function(key) {
                return column.convertValueToSageValue(key);
            });

            queryTransformations.push(sage.QueryTransform.createAddBulkFilterTransformation({
                tokenOutputGuid: filterSageOutputColumnId,
                bulkValues: keysToAdd
            }));

            return queryTransformations;
        }

    /**
     * Gets the list of transformation which will apply net effect of current filter state.
     * @param filterModel
     * @returns {Array}
     */
        function getEffectiveAttributeFilterTransformations(filterModel) {
            var queryTransformations = [];
            var selectedItems = filterModel.getSelectedFilterItems();
            var values = Object.keys(selectedItems);

            if(values.length === 0) {
                return queryTransformations;
            }

            var filterSageOutputColumnId = filterModel.getColumn().getSageOutputColumnId();
            var column = filterModel.getColumn();
            var keysToAdd = values.map(function(key) {
                return column.convertValueToSageValue(key);
            });

            queryTransformations.push(sage.QueryTransform.createAddBulkFilterTransformation({
                tokenOutputGuid: filterSageOutputColumnId,
                bulkValues: keysToAdd
            }));

            return queryTransformations;
        }

    /**
     * Gets the list of transformation which will apply net effect of current filter state.
     * @param filterModel
     * @returns {*}
     */
        function getEffectiveRangeFilterTransformations(filterModel) {
            var rangeDefinition = filterUtil.getRangeDefinitionFromModel(filterModel);
            var filterColumn = filterModel.getColumn();

            return getAddRangeFilterTransformations(rangeDefinition, filterColumn);
        }

    /**
     * This functions returns an array of transformations representing the current state of the
     * filter.
     * For eg. For a range definition it returns add transformation with the current range.
     * For attribute filter this returns a bulk filter transformation that contains all values.
     * @param [FilterModel] filterModel
     * @returns {Array}
     */
        function getTransformations(filterModel) {
            var filterColumn = filterModel.getColumn();
            if (filterColumn.isMeasure() || filterColumn.isDateColumn()) {
                return getEffectiveRangeFilterTransformations(filterModel);
            } else {
                return getEffectiveAttributeFilterTransformations(filterModel);
            }
        }

    /**
     * Gets transformations needed to remove the given filter model.
     * @param filterModel
     * @returns {Array}
     */
        function getFilterRemovalTransformations(filterModel) {
            var queryTransforms = [];
            var filterColumn = filterModel.getColumn();
            var tokenOutputGuid = filterColumn.getSageOutputColumnId();
            var aggregation = filterColumn.getEffectiveAggregateType();
            if (aggregation !== util.aggregateTypes.NONE) {
                var sageAggregation = sage.AggregationType[aggregation];
                queryTransforms.push(
                sage.QueryTransform.createRemoveHavingFilterTransformationsByAggregation({
                    tokenOutputGuid: tokenOutputGuid,
                    aggregation: sageAggregation
                }));
            } else {
                queryTransforms.push(sage.QueryTransform.createRemoveAllFilterTransformation({
                    tokenOutputGuid: tokenOutputGuid
                }));
            }
            return queryTransforms;
        }

    /**
     * Gets a collection of transformations to apply effect of passed in filters.
     * @param filterModels List of filter models.
     * @returns {Array} Array of array of transformations.
     */
        function getAllFilterTransformations(filterModels) {
            var filterTransformations = filterModels.map(function(filterModel){
                return getTransformations(filterModel);
            });

            return filterTransformations;
        }

        return {
            getRangeChangeTransformations: getRangeChangeTransformations,
            getAttributeChangeTransformations: getAttributeChangeTransformations,
            getBulkFilterTransform: getBulkFilterTransform,
            getTransformations: getTransformations,
            getFilterRemovalTransformations: getFilterRemovalTransformations,
            getAllFilterTransformations: getAllFilterTransformations,
            getEffectiveAttributeFilterTransformations: getEffectiveAttributeFilterTransformations
        };
    }]);
