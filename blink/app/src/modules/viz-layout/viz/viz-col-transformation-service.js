/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview A service to help column transformation operations in visualizations.
 */

'use strict';

blink.app.factory('vizColTransformationService', ['Logger',
    'sageCallosumTranslator',
    'dateUtil',
    function(Logger,
         sageCallosumTranslator,
         dateUtil) {
        var me = {};
        var _logger = Logger.create('vizColTransformationService');

        /**
         * @param vizModel              VisualizationModel to generate sort transformation for.
         * @param columnIdSortingPairs  List of pairs of columnId and desired sorting
         *                              for the column. Of the form [{id: _id_, isAscending: _isAsc_}].
         * @returns {[*]}
         */
        me.getSortingTransform = function(vizModel, columnIdSortingPairs) {
            var colEffectiveIdToColumn = {};
            vizModel.getVizColumns().each(function(vizCol){
                colEffectiveIdToColumn[vizCol.getSageOutputColumnId()] = vizCol;
            });

            var queryTransforms = [sage.QueryTransform.createRemoveAllSortPhrasesTransformation()];
            angular.forEach(columnIdSortingPairs, function(colSortPair) {
                var vizColId = colSortPair.id,
                    vizCol = colEffectiveIdToColumn[vizColId],
                    aggrType = vizCol.getAggregateOverride(),
                    aggrSageType = sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(aggrType),
                    aggrTypeSageValue = sage.AggregationType[aggrSageType];

                var newSortingOrder = colSortPair.isAscending;

                queryTransforms.push(
                sage.QueryTransform.createAddSortColumnTransformation({
                    tokenOutputGuid: vizCol.getSageOutputColumnId(),
                    ascending: newSortingOrder,
                    aggregation: aggrTypeSageValue
                })
            );
            });

            return queryTransforms;
        };

        me.getDateBucketingTransform = function(column, timeBucket) {

            var sageOutputColumnGuid = column.getSageOutputColumnId();
            var queryTransformations = [
                sage.QueryTransform.createRemoveTimeBucketTransformation({
                    tokenOutputGuid: sageOutputColumnGuid
                }),
                sage.QueryTransform.createAddTimeBucketTransformation({
                    tokenOutputGuid: sageOutputColumnGuid,
                    timeBucket: dateUtil.timeBucketValueToSageValue[timeBucket]
                })
            ];

        // Handle yearly
            if (dateUtil.timeBucketValueToSageValue[timeBucket] === sage.TimeBucket.YEARLY) {
                queryTransformations.push(sage.QueryTransform.createRemoveTimeBucketQualifierTransformation({
                    tokenOutputGuid: sageOutputColumnGuid
                }));
            }

            return queryTransformations;
        };

        me.getAggregationTransform = function(column, aggregationType) {
            var sageOutputColumnGuid = column.getSageOutputColumnId();

            var oldAggregation =
            sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(column.getEffectiveAggregateType());
            var oldAggregationEnum = sage.AggregationType[oldAggregation];

            var defaultAggregation =
            sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(column.getBaseAggregationType());
            var defaultAggregationEnum = sage.AggregationType[defaultAggregation];

            var newAggregation =
            sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(aggregationType);
            var newAggregationEnum = sage.AggregationType[newAggregation];

            return [
                sage.QueryTransform.createChangeAggregationTransformation({
                    tokenOutputGuid: sageOutputColumnGuid,
                    newAggregation: newAggregationEnum,
                    oldAggregation: oldAggregationEnum,
                    defaultAggregation: defaultAggregationEnum
                })
            ];
        };

        return me;
    }]);
