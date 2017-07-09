/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Controller for the natural query
 */

'use strict';

blink.app.controller('NaturalQueryController', ['$scope',
    '$q',
    'alertService',
    'dateUtil',
    'Logger',
    'dataService',
    'strings',
    'UserAction',
    'util',
    function ($scope,
          $q,
          alertService,
          dateUtil,
          Logger,
          dataService,
          strings,
          UserAction,
          util) {

        var _logger = Logger.create('natural-query-controller');

        var naturalQueryCallPromise;

        $scope.maxGroupingColumnsToShow = $scope.maxGroupingColumnsToShow || 4;
        $scope.maxMeasuresToShow = $scope.maxMeasuresToShow || 4;
        $scope.maxListColumnsToShow = $scope.maxListColumnsToShow || 4;
        $scope.strings = strings.naturalQuery;

        $scope.pendingNaturalQueryCall = false;

        function getQueryType(naturalQuery) {
            if (naturalQuery.queryType) {
                return naturalQuery.queryType;
            }

            var aggrOutputColumns = naturalQuery.outputColumns.filter(function (col) {
                return !!col.aggregation && col.aggregation != 'NONE';
            });

            if (!aggrOutputColumns.length) {
                return 'list';
            }

            return 'aggregated';
        }

    /**
     * Process outputColumns.
     * The result is of the form {Aggr1: [array of columns], Aggr2: [array of columns],...}
     * @param outputColumns
     * @returns {*}
     */
        function getOutputColumnValues(outputColumns) {
            if (!outputColumns || !outputColumns.length) {
                return null;
            }

            var values = {};

            var i = 0;
            for (; i < outputColumns.length; i++) {
                var outputColumn = outputColumns[i];
                if (!outputColumn.aggregation || outputColumn.aggregation == 'NONE') {
                    continue;
                }

                if (!(outputColumn.aggregation in values)) {
                    values[outputColumn.aggregation] = [];
                }

                values[outputColumn.aggregation].push(outputColumn.column);
            }

            return values;
        }

        $scope.template = function (template) {
            return 'src/modules/natural-query/clause-templates/' + template + '.html';
        };

    /**
     * Converts back-end aggregation to user-friendly text.
     * @type {{SUM: string, AVERAGE: string, COUNT: string, COUNT_DISTINCT: string, MIN: string, MAX: string}}
     */
        $scope.aggregationTranslation = {
            SUM: 'total',
            AVERAGE: 'average',
            COUNT: 'total number of',
            COUNT_DISTINCT: 'unique number of',
            MIN: 'minimum',
            MAX: 'maximum',
            STD_DEVIATION: 'standard deviation of',
            VARIANCE: 'variance of'
        };

        $scope.growthBucketTranslation = {
            DAY: strings.timeBucketLabels.d,
            WEEK: strings.timeBucketLabels.w,
            MONTH: strings.timeBucketLabels.M,
            QUARTER: strings.timeBucketLabels.Q,
            YEAR: strings.timeBucketLabels.y,
            HOUR: strings.timeBucketLabels.h
        };

    // TODO(Shikhar): Currently everything is of type "including" because we are not showing
    // Including and Excluding as separate sections
        $scope.filterOperatorDescription = {
            EQ: ['being equal to', 'INCLUDING'],
            GT: ['more than', 'INCLUDING'],
            GE: ['not less than', 'INCLUDING'],
            LT: ['less than', 'INCLUDING'],
            LE: ['not more than', 'INCLUDING'],
            IN: ['in the list', 'INCLUDING'],
            NOT_IN: ['is not one of', 'EXCLUDING'],
            BW: ['between', 'INCLUDING'],
            BW_INC: ['between', 'INCLUDING'],
            BW_INC_MIN: ['between', 'INCLUDING'],
            BW_INC_MAX: ['between', 'INCLUDING'],
            CONTAINS: ['containing text', 'INCLUDING'],
            NOT_CONTAINS: ['not containing text', 'INCLUDING'],
            BEGINS_WITH: ['beginning with', 'INCLUDING'],
            NOT_BEGINS_WITH: ['not beginning with', 'INCLUDING'],
            ENDS_WITH: ['ending with', 'INCLUDING'],
            NOT_ENDS_WITH: ['not ending with', 'INCLUDING'],

        // Make the second element 'EXCLUDING' if you want to separate the negative filters
            NE: ['not equal to', 'INCLUDING'],

        // Customized blink specific Operators. These are not present in callosum
        // For date
            GT_D: ['after', 'INCLUDING'],
            GE_D: ['not before', 'INCLUDING'],
            LT_D: ['before', 'INCLUDING'],
            LE_D: ['not after', 'INCLUDING']
        };

    /**
     * Applies format pattern to the value.
     * @param formatPattern
     * @param effectiveDataType
     * @param value
     * @returns {*}
     */
        function getFormattedValue(formatPattern, effectiveDataType, value) {
            if (!formatPattern || !effectiveDataType) {
                return value;
            }

        // TODO(rahul): Use the column code in visualizationModel
            if (effectiveDataType === 'DATE' || effectiveDataType === 'DATE_TIME') {
                return dateUtil.formatDate(parseInt(value, 10) * 1000, formatPattern);
            }

            if (Object.has(dateUtil.dateNumTypes, effectiveDataType)) {
                return dateUtil.formatDateNum(effectiveDataType, value);
            }

            return value;
        }

        function getFormattedValueForUserFilter(userFilter, value) {
            return getFormattedValue(userFilter.filterColumn.formatPattern, userFilter.filterColumn.effectiveDataType,
            value.key);
        }

    /**
     * Processes userFilters.
     * Output is of the form: INCLUDING:{columnid: {column: column, opAndVal: {EQ: [32], LE: [12, 34]}, havingFilterPredicate: null/COUNT_DISTINCT/SUM}}
     * @param userFilters
     * @returns {*}
     */
        function getUserFiltersValues(userFilters) {
            if (!userFilters || !userFilters.length) {
                return null;
            }

            var filterValues = {},
                HAVING_FILTER_PREDICATE_KEY = 'havingFilterPredicate';
            userFilters.forEach (function (filters, userFilterIndex) {
                filters.forEach (function (userFilter, filterRowIndex) {
                // TODO(shikhar): Do we need to perform all these checks?
                    if (!userFilter.filterColumn || !userFilter.filterColumn.column || !userFilter.filterColumn.column.id) {
                        return;
                    }

                    var column = userFilter.filterColumn.column;

                    var columnValue,
                        filterType,
                        effectiveOpAndValue;
                    if (userFilter.value && userFilter.value.length) {
                        columnValue = userFilter.value.map(
                        angular.bind(null, getFormattedValueForUserFilter, userFilter));

                        filterType = $scope.filterOperatorDescription[userFilter.filterOperator][1];

                        effectiveOpAndValue = getEffectiveOpAndValue(
                        userFilter.filterOperator, columnValue, userFilter.filterColumn.effectiveDataType);

                        addFilterValues(filterType, column, effectiveOpAndValue, filterValues);

                    } else if (userFilter.multiOperatorsValues && userFilter.multiOperatorsValues.length) {
                        for (var operIndex = 0; operIndex < userFilter.multiOperatorsValues.length; operIndex++) {
                            columnValue = userFilter.multiOperatorsValues[operIndex].values.map(
                            angular.bind(null, getFormattedValueForUserFilter, userFilter));

                            filterType = $scope.filterOperatorDescription[
                            userFilter.multiOperatorsValues[operIndex].operator][1];

                            effectiveOpAndValue = getEffectiveOpAndValue(
                            userFilter.multiOperatorsValues[operIndex].operator, columnValue,
                            userFilter.filterColumn.effectiveDataType);

                            addFilterValues(filterType, column, effectiveOpAndValue, filterValues);
                        }
                    } else {
                        return;
                    }

                    filterValues[filterType][column.id][HAVING_FILTER_PREDICATE_KEY] =
                    !!userFilter.isHavingFilter ? userFilter.filterColumn.aggregation : null;
                });
            });
            return filterValues;
        }

    /**
     * Function to add single filter operator and values to collection of filter values group by filterType, columnId.
     *
     * @param filterType Filter type INCLUDING / EXCLUDING.
     * @param column Column Description.
     * @param effectiveOpAndValue single operator and its operands.
     * @param filterValues collection of filter values group by filterType, columnId.
     */
        function addFilterValues(filterType, column, effectiveOpAndValue, filterValues) {
            var COLUMN_KEY = 'column',
                OP_AND_VAL_KEY = 'opAndVal';

            if (!filterValues.hasOwnProperty(filterType)) {
                filterValues[filterType] = {};
            }

            if (!filterValues[filterType].hasOwnProperty(column.id)) {
                filterValues[filterType][column.id] = {};
                filterValues[filterType][column.id][COLUMN_KEY] = column;
                filterValues[filterType][column.id][OP_AND_VAL_KEY] = [];
            }

            filterValues[filterType][column.id][OP_AND_VAL_KEY].push(effectiveOpAndValue);
        }

    /**
     * Arranges the given columns in 2 groups: ascending and descending
     * @param sortColumns
     */
        function getSortColumnValues(sortColumns) {
            if (!sortColumns || !sortColumns.length) {
                return null;
            }

            var columnValues = {};
            for (var i = 0; i < sortColumns.length; i++) {
                var column = sortColumns[i];
                var sort = 'ascending';
                if (!column.ascending) {
                    sort = 'descending';
                }

                if (!(sort in columnValues)) {
                    columnValues[sort] = [];
                }

                columnValues[sort].push(column.column);
            }

            return columnValues;
        }

    /**
     * This is a list of display query templates where each member gives the order of display.
     * We may want to choose different templates depending number of outputColumns, join conditions and so on.
     */
        var queryTemplate = {
            base: ['MEASURE_GROUP', 'FILTER', 'SORT', 'JOIN', 'TOP', 'GROWTH', 'SECURITY']
        };

    // Currently there is only one template
        function getQueryTemplate() {
            return queryTemplate.base;
        }

        function getEffectiveOpAndValue(operator, values, dataType) {
            var effectiveValues = values;
            if (operator == 'IN' && values.length <= 1) {
                operator = 'EQ';
            }

            if (operator == 'BW_INC') {
                if (values.length == 2) {
                    if (values[0] == values[1]) {
                        operator = 'EQ';
                        effectiveValues = [values[0]];
                    }
                } else {
                    _logger.error('Invalid number of values for BW_INC filter', values);
                }
            }

            if (dataType === 'DATE') {
                if (operator === 'GT' || operator === 'GE' || operator === 'LT' || operator === 'LE') {
                    operator += '_D';
                }
            }

            return {
                operator: operator,
                effectiveValues: effectiveValues
            };
        }

        $scope.getColumnColor = function (column) {
            column = column || {};
            return util.getColorForGuid(column.id);
        };

    /**
     * values must be an array, this method does not work for dictionary.
     */
        $scope.getSequenceSymbol = function (pos, values) {
            if (pos === 0) {
                return '';
            }

            if (pos == values.length - 1) {
                return ' and ';
            }

            return ', ';
        };

        $scope.truncateLongString = function (str) {
            str = '' + str;
            return str.truncateOnWord(80);
        };

        function updateNaturalQuery () {
            if (!$scope.answerModel) {
                _logger.error("Info card opened when there was no answer model");
                return;
            }
            if (!!naturalQueryCallPromise) {
                naturalQueryCallPromise.cancel();
            }
            var answerModel = $scope.answerModel;
            var naturalQueryModel = answerModel.getNaturalQuery();
            if (!!naturalQueryModel) {
                if (!!naturalQueryModel.outputColumns) {
                    onNaturalQueryAvailable(naturalQueryModel);
                } else {
                    _logger.error("Natural query model with no output columns");
                    return;
                }
            } else {
                $scope.pendingNaturalQueryCall = true;
                var userAction = new UserAction(UserAction.FETCH_NATURAL_QUERY);
                naturalQueryCallPromise = dataService.getNaturalQueryRepresentation(
                null,
                answerModel
            );
                naturalQueryCallPromise.then(function (naturalQueryModel) {
                    onNaturalQueryAvailable(naturalQueryModel);
                    $scope.pendingNaturalQueryCall = false;
                    naturalQueryCallPromise = null;
                    return naturalQueryModel;
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    $scope.pendingNaturalQueryCall = false;
                    naturalQueryCallPromise = null;
                    return $q.reject(response.data);
                });
            }
        }

        function onNaturalQueryAvailable (naturalQueryModel) {
            $scope.query = naturalQueryModel;

            $scope.queryType = getQueryType($scope.query);
            $scope.outputColumnValues = getOutputColumnValues($scope.query.outputColumns);
            $scope.userFiltersValues = getUserFiltersValues($scope.query.userFilters);
            $scope.sortColumnValues = getSortColumnValues($scope.query.sortColumns);
            $scope.queryTemplate = getQueryTemplate();
        }

        $scope.$watch(function natQueryModelWatch() {
            return $scope.answerModel;
        }, function natQueryModelWatchAction(newModel, oldModel) {
            if (!newModel) {
                return;
            } else if (newModel === oldModel) {
                return;
            } else {
                updateNaturalQuery();
            }
        });

        updateNaturalQuery();
    }]);

