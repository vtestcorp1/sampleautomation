/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A common utility used by any component that wishes to show a filter ui.
 */

'use strict';

//TODO(Rahul): Need to make this agnostic of sage-client
blink.app.factory('filterUtil', ['$q',
    '$rootScope',
    'alertService',
    'answerService',
    'autoCompleteService',
    'blinkConstants',
    'callosumTypes',
    'strings',
    'cancelableQueryContextService',
    'dataService',
    'dateUtil',
    'env',
    'events',
    'filterExpressionService',
    'jsonConstants',
    'Logger',
    'rangeOperatorUtil',
    'sageCallosumTranslator',
    'UserAction',
    'util',
    function ($q,
              $rootScope,
              alertService,
              answerService,
              autoCompleteService,
              blinkConstants,
              callosumTypes,
              strings,
              cancelableQueryContextService,
              dataService,
              dateUtil,
              env,
              events,
              filterExpressionService,
              jsonConstants,
              Logger,
              rangeOperatorUtil,
              sageCallosumTranslator,
              UserAction,
              util) {
        var _logger = Logger.create('filter-util');
        var DATE_FORMAT_STRING = 'MM/dd/yyyy';
        var me = {};
        var cancellationNamespace = 'filterQuery';

        var filterTypeCssClasses = {
            RANGE_FILTER: 'bk-range-filter-container',
            DATE_FILTER: 'bk-date-filter-container',
            CHECKBOX_FILTER: 'bk-checkbox-filter-container',
            WAITING: 'bk-waiting-for-filter'
        };

        var allFilterTypeCssClasses = Object.values(filterTypeCssClasses).join(' ');

        me.triggerFilterCloseEvent = function () {
            $rootScope.$broadcast(events.CLEAR_AND_HIDE_POPUP_MENU);
        };

        me.clearLoadingIndicator = function($container){
            $container.removeClass(filterTypeCssClasses.WAITING);
        };

        /**
         *
         * @param {jQuery} $container
         */
        me.showNewFilterAsLoading = function ($container) {
            $container.addClass(filterTypeCssClasses.WAITING);
        };

        /**
         *
         * @param {jQuery} $container
         */
        me.showErrorLoadingFilter = function ($container) {
            $container.removeClass(filterTypeCssClasses.WAITING);
            $container.append('<div class="bk-unsupported-filter-placeholder">Oops! There was an error loading this filter.</div>');
        };

    /**
     *
     * @param {Array.<sage.RecognizedToken>} existingTokens
     * @param {LogicalTableModel.LogicalColumn} logicalColumn
     * @param {VisualizationColumnModel} vizColumn
     * @param {sage.AggregationType} aggr
     * @param {sage.CompareType} filterOperator
     *
     * @returns {Array.<sage.QueryTransform>}
     */
    //TODO(Rahul): Break this into separate vizCol and logCol functions.
        me.getFilterTokensByTransform = function (existingTokens,
            logicalColumn,
            vizColumn,
            aggr,
            filterOperator,
            addWildcards) {
            var queryTransformation = [],
                transformationParams = {};

            if (!!logicalColumn) {
                transformationParams.columnGuid = logicalColumn.getGuid();
            }

            if (!!vizColumn) {
                transformationParams.tokenOutputGuid = vizColumn.getSageOutputColumnId();
            }

            if (addWildcards) {
                transformationParams.value1 = '{wildcard}';
                transformationParams.value2 = '{wildcard}';
            }

            if (aggr !== sage.AggregationType.NONE) {
                transformationParams.aggregation = aggr;
                queryTransformation.push(sage.QueryTransform.createAddHavingFilterTransformation(transformationParams));
            } else {
                if (!filterOperator) {
                    transformationParams.op = sage.CompareType.EQ;
                } else {
                    transformationParams.op = filterOperator;
                }
                queryTransformation.push(sage.QueryTransform.createAddPredicateFilterTransformation(transformationParams));
            }

            return  queryTransformation;
        };

        /**
         * This method can only be used with a fully specified Visualization Column that has a join path defined.
         * Given this assumption, this method will always return a promise of a filter model in non-error cases.
         *
         * @param {VisualizationColumnModel} vizCol
         * @param {AnswerModel} answerModel
         * @param {AnswerSageClient} sageClient
         *
         * @returns {Promise | null}
         */
        me.fetchNewFilterModel = function (vizCol, answerModel, sageClient) {
            if (!vizCol) {
                return null;
            }

            var sageAggrType = sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(vizCol.getEffectiveAggregateType());
            var vizColumn = vizCol,
                aggr = sage.AggregationType[sageAggrType],
                existingTokens = answerModel.getRecognizedTokens();

            var filterOperator;
            if (vizCol.isDateColumn()) {
                filterOperator = sage.CompareType.GE;
            }

            var filterTransformations = me.getFilterTokensByTransform(existingTokens, null, vizColumn, aggr, filterOperator);

            var newFilterModelDeferred = $q.defer();

            //TODO(Rahul): Use WaterFall here.
            autoCompleteService.transformTable(sageClient.getContext(), sageClient.getCurrentIndex(), filterTransformations)
                .then(function (sageResponse) {
                    var answerResponse = sageResponse.answerResponse;

                    var questionParams = {};

                    questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = answerResponse.getContext();
                    questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = sageClient.getCurrentIndex();

                    var tables = questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY].getTables();
                    if (!tables[questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY]].getQuery()) {
                        _logger.error(
                            'Add filter transformation returned empty program',
                            JSON.stringify(questionParams),
                            JSON.stringify(filterTransformations),
                            JSON.stringify(answerResponse)
                        );

                        newFilterModelDeferred.reject();
                        return;
                    }
                    var optionalParams = {
                        includeData: false,
                        requestType: callosumTypes.RequestTypes.ANSWER_ADD_NEW_FILTER
                    };

                    var userAction = new UserAction(UserAction.FETCH_ANSWER);
                    answerService.getAnswer(questionParams, optionalParams)
                        .then(function (response) {
                            var answerModel = response.data;
                            var newFilterModel = answerModel.getCurrentAnswerSheet().getFilterModelByColumn(vizCol);
                            if (!newFilterModel) {
                                newFilterModelDeferred.reject('Can not find a matching filter for this column');
                                return;
                            }

                            var ignoreDataFetch = !!newFilterModel &&
                                (!newFilterModel.needsDataFromServer || !newFilterModel.isSupportedByUI());

                            if (ignoreDataFetch) {
                                newFilterModelDeferred.resolve(newFilterModel);
                                return;
                            }
                            me.updateFilterModelWithValues(
                                newFilterModel,
                                '',
                                true
                            ).then(function () {
                                newFilterModelDeferred.resolve(newFilterModel);
                            }, function(error){
                                _logger.error('filter data fetch failed', error);
                                newFilterModelDeferred.reject(error);
                            });
                        }, function (response) {
                            alertService.showUserActionFailureAlert(userAction, response);
                            _logger.error(
                                'Callosum query execution failed for temp filter generation query',
                                response,
                                sageClient.getContext()
                            );
                            newFilterModelDeferred.reject(response.data);
                        });
                }, function (error) {
                    _logger.error(
                        'Add filter transformation failed',
                        JSON.stringify(sageClient.getContext()),
                        JSON.stringify(sageClient.getCurrentIndex),
                        JSON.stringify(filterTransformations)
                    );
                    newFilterModelDeferred.reject(error);
                });

            return newFilterModelDeferred.promise;
        };

        // This function return data if it can be computed/returned without a network call
        /**
         *
         * @param {FilterModel} filterModel
         * @param {String} valueSearchQuery
         * @returns {*}
         */
        function getLocalDataForValueSearch (filterModel, valueSearchQuery, showRelevantValues) {
            // cache check
            var cacheResponse = filterModel.getFilterDataCacheValue(
                valueSearchQuery,
                !showRelevantValues
            );
            if (!!cacheResponse) {
                return cacheResponse;
            }

            var cache = filterModel.getFilterDataCache(!showRelevantValues);
            var matchingKey;
            util.iterateObject(cache, function (key) {
                if (!!matchingKey) {
                    return;
                }
                if (valueSearchQuery.indexOf(key) > -1 &&
                    cache[key].length < filterModel.getBatchSize()) {
                    matchingKey = key;
                }
            });

            // If a substring resulted in less than batch size results then use it locally.
            if (!!matchingKey) {
                var data = cache[matchingKey];
                var newData = data.filter(function (value) {
                    // we want to handle the case of nulls here if the search value is '' then we want to include
                    // null values which show as {null} in UI.
                    if (!value) {
                        return valueSearchQuery === '';
                    }
                    return value.toString().toLowerCase().indexOf(valueSearchQuery.toLowerCase()) > -1;
                });
                return newData;
            }
            return null;
        }

        /**
         *
         * @param {FilterModel} filterModel
         * @param {String} valueSearchQuery
         * @param {Array.<*>} dataValues
         */
        function processFilterDataResponse (filterModel, valueSearchQuery, dataValues, showRelevantValues) {
            filterModel.putFilterDataCache(valueSearchQuery, dataValues, !showRelevantValues);
            filterModel.updateFilterValues(dataValues, !showRelevantValues);
        }

        /**
         *
         * @param {FilterModel} filterModel
         * @param {String} valueSearchQuery
         * @param {String} previousSearchQuery
         * @returns {Promise}
         */
        me.updateFilterModelWithValues = function (
            filterModel,
            valueSearchQuery,
            showRelevantValues
        ) {
            cancelableQueryContextService.cancelPendingQueriesInNamespace(cancellationNamespace);

            var localDataValues = getLocalDataForValueSearch(
                filterModel,
                valueSearchQuery,
                showRelevantValues
            );
            if (!!localDataValues) {
                processFilterDataResponse(
                    filterModel,
                    valueSearchQuery,
                    localDataValues,
                    showRelevantValues
                );

                return $q.when();
            }

            var containsFilterExpression;
            if (valueSearchQuery) {
                containsFilterExpression = new filterExpressionService.SimpleFilterExpression(
                    filterModel.getColumn(),
                    valueSearchQuery,
                    filterExpressionService.filterOperators.CONTAINS);
            }

            return dataService.getDataForViz(
                filterModel.getContainingAnswerModel(),
                filterModel,
                {
                    showAllValues: !showRelevantValues
                },
                true,
                containsFilterExpression,
                cancellationNamespace
            )
                .then(function (response) {
                    var data = response.data;
                    if (!!data.data) {
                        var scalarDataValues = data.data.map(function(dataValueRow) {
                            if (dataValueRow.length !== 1) {
                                _logger.error('Single data values expected per row');
                            }
                            return dataValueRow[0];
                        });
                        processFilterDataResponse(
                            filterModel,
                            valueSearchQuery,
                            scalarDataValues,
                            showRelevantValues
                        );
                    }
                });
        };

        /**
         * filters values that exist in system for the column used to filter.
         * @param {FilterModel} filterModel
         * @param {Array[*]} values
         * @returns {Array[*]}
         */
        me.filterValuesMatchingFilterColumnValues = function (filterModel, values) {
            if (!filterModel) {
                _logger.error('filterValuesMatchingFilterColumnValues called with empty filter model');
                return;
            }
            if (!values) {
                _logger.error('filterValuesMatchingFilterColumnValues called with empty values');
                return;
            }
            if(!values.length){
                return $q.when([]);
            }
            var filterExpression = new filterExpressionService.SimpleFilterExpression(
                filterModel.getColumn(),
                values,
                filterExpressionService.filterOperators.IN);

            var userAction = new UserAction(UserAction.FETCH_FILTER_DATA);
            return dataService.getDataForViz(
                filterModel.getContainingAnswerModel(),
                filterModel,
                null,
                true,
                filterExpression).
            then(function (response) {
                var vizData = response.data;
                var dataArray = vizData.data.
                reduce(function(a,b){
                    return a.concat(b);
                }, []);

                var processedDataArray = dataArray.
                map(function(value){
                    return (typeof value === 'string') ? value.toLowerCase().trim() : value;
                });

                return processedDataArray;
            });
        };

        /**
         *
         * @param {FilterModel} filterModel
         * @param {String} valueSearchQuery
         *
         * @returns {Promise}
         */
        me.filterColumnContainsValue = function (
            filterModel,
            valueSearchQuery,
            showRelevantValues
        ) {
            var equalsFilterExpression;
            // TODO(Jasmeet): SCAL-13458 Handling of empty filter values and nulls in UI
            // Update the implementation when we have resolution on the ticket.
            if (!valueSearchQuery) {
                return $q.when(false);
            } else {
                equalsFilterExpression = new filterExpressionService.SimpleFilterExpression(
                    filterModel.getColumn(),
                    valueSearchQuery,
                    filterExpressionService.filterOperators.EQUALS);
            }

            return dataService.getDataForViz(
                filterModel.getContainingAnswerModel(),
                filterModel,
                {
                    showAllValues: !showRelevantValues
                },
                true,
                equalsFilterExpression)
                .then(function (response) {
                    var data = response.data;
                    if (data && data.data && data.data.length === 1) {
                        return true;
                    } else {
                        return false;
                    }
                });
        };

        /**
         *
         * @param {VisualizationColumnModel} columnModel
         * @param {VisualizationModel} vizModel
         * @param {AnswerSageClient} sageClient
         * @returns {Promise}
         */
        me.getMatchingFilterModel = function(columnModel, vizModel, sageClient) {
            var filterModel = vizModel.getMatchingFilterModel(columnModel);
            if (!filterModel) {
                _logger.debug('No filter model in answer corresponding to column: ', columnModel.getSageOutputColumnId());
                // make async call and resolve the promise when done.
                return me.fetchNewFilterModel(columnModel, vizModel.getContainingAnswerModel(), sageClient);
            } else {
                return $q.when(filterModel);
            }
        };

        me.getRangeDefinitionFromModel = function (filterModel) {
            var rangeDefinition = new rangeOperatorUtil.RangeDefinitionInLeafOperators();

            if (filterModel.getFilterRows().length !== 1) {
                _logger.error('Only one filter row expected in case of range definition');
                return;
            }
            var filterRow = filterModel.getFilterRows()[0];
            var firstOperator = filterRow.getOperator(),
                filterValues = filterRow.getValues().map(function(filterValue){
                    return filterValue.getKey();
                });

            if (!firstOperator) {
                _logger.error('Insufficient information to show a filter', filterModel);
                return;
            }

            var isBetweenOperator = rangeOperatorUtil.isBetweenOperator(firstOperator);
            if (isBetweenOperator && filterValues.length !== 2) {
                _logger.error('Incorrect filter state passed, between op should have 2 operands');
                return;
            }

            if (isBetweenOperator) {
                rangeDefinition = rangeOperatorUtil.mapBetweenToLeafOperators(
                    firstOperator,
                    filterValues
                );
            } else {
                rangeDefinition.setFirstOperator(firstOperator);
                if (filterValues && filterValues.length > 0) {
                    rangeDefinition.setFirstOperand(filterValues[0]);
                }
            }

            if (!rangeOperatorUtil.operatorTypes.hasOwnProperty(rangeDefinition.firstOperator)) {
                _logger.error('Not a range filter operator', rangeDefinition.firstOperator);
                return;
            }

            var filterColumn = filterModel.getColumn();
            if (filterColumn.isDateColumn()) {
                if (!!rangeDefinition.firstOperand) {
                    rangeDefinition.firstOperand =
                        getFormattedDateFromEpochInSeconds(rangeDefinition.firstOperand);
                }
                if (!!rangeDefinition.secondOperand) {
                    rangeDefinition.secondOperand =
                        getFormattedDateFromEpochInSeconds(rangeDefinition.secondOperand);
                }
            }

            return rangeDefinition;
        };

        me.findMatchingFilterModel = function(logicalColumn, aggr, filterModels) {
            var columnId = logicalColumn.getGuid();

            var matchingFilterModel = filterModels.find(function(filterModel) {
                var filterColumn = filterModel.getColumn();
                var filterColumnGuid = filterColumn.getBaseLogicalColumnGuid();
                var filterColumnAggr = filterColumn.getEffectiveAggregateType();
                var filterSageAggr = sage.AggregationType[filterColumnAggr];
                return columnId === filterColumnGuid && filterSageAggr === aggr;
            });

            return matchingFilterModel;
        };

        function getFormattedDateFromEpochInSeconds(epoch) {
            if (!epoch) {
                return null;
            }
            var epochInMs = parseInt(epoch, 10) * 1000;
            // Note (sunny): We ignore custom calendar in formatting here
            // because date range filter is not able to handle it.
            return dateUtil.formatDate(epochInMs, DATE_FORMAT_STRING, false, true);
        }

        function getFilterConditionSummary(operator, value) {
            var label = rangeOperatorUtil.getOperatorLabel(operator);
            return label + ' ' + value;
        }

        function getRangeFilterValueSummary(filterModel) {
            var rangeDefinition = me.getRangeDefinitionFromModel(filterModel);
            var summary = '';

            if (!_.isUndefined(rangeDefinition.firstOperand) &&
                !_.isUndefined(rangeDefinition.firstOperator) &&
                rangeDefinition.firstOperand !== null &&
                rangeDefinition.firstOperator !== null) {
                summary = getFilterConditionSummary(
                    rangeDefinition.firstOperator,
                    rangeDefinition.firstOperand
                );
            }

            if (!_.isUndefined(rangeDefinition.secondOperand) &&
                !_.isUndefined(rangeDefinition.secondOperator) &&
                rangeDefinition.secondOperand !== null &&
                rangeDefinition.secondOperator !== null) {
                summary = summary + ' ' + getFilterConditionSummary(
                        rangeDefinition.secondOperator,
                        rangeDefinition.secondOperand
                    );
            }

            return summary;
        }

        function getAttributeFilterValueSummary(filterModel) {
            var selectedItems = filterModel.getSelectedFilterItems();
            if (!selectedItems) {
                return '';
            }
            var values = Object.keys(selectedItems);
            return values.join(', ');
        }

        me.getFilterValueSummary = function(filterModel) {
            var filterColumn = filterModel.getColumn();
            if (filterColumn.isMeasure() || filterColumn.isDateColumn()) {
                return getRangeFilterValueSummary(filterModel);
            } else {
                return getAttributeFilterValueSummary(filterModel);
            }
        };

        me.isCompoundFilter = function(filterContentJson) {
            return filterContentJson.hasOwnProperty(jsonConstants.COMPOUND_INDICES_KEY) &&
                filterContentJson[jsonConstants.COMPOUND_INDICES_KEY].length > 0
        };

        return me;
    }]);
