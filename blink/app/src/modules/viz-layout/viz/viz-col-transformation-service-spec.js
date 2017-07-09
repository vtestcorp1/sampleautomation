/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Unit tests for viz-col-transformation-service
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Viz Col Transformation Service', function() {
    var vizColTransformationService, dateUtil, mockVizModel, mockVizCol,
        vizColId, aggregation, sageColId, sortAscending, isSorted;

    beforeEach(function() {
        module('blink.app');
        mockVizModel = jasmine.createSpyObj('vizModel', ['getVizColumns']);
        mockVizCol = jasmine.createSpyObj('vizColumn', [
            'getSageOutputColumnId', 'getAggregateOverride', 'getSageOutputColumnId', 'isAscendingSort', 'isSorted',
            'getBaseAggregationType', 'getEffectiveAggregateType', 'getNewSortingOrder'
        ]);

        mockVizModel.getVizColumns.and.returnValue([mockVizCol]);

        vizColId = 'vizColId';
        aggregation = 'SUM';
        sageColId = 'sageColId';
        isSorted = true;
        sortAscending = false;

        mockVizCol.getSageOutputColumnId.and.returnValue(vizColId);
        mockVizCol.getAggregateOverride.and.returnValue(aggregation);
        mockVizCol.getSageOutputColumnId.and.returnValue(sageColId);
        mockVizCol.isAscendingSort.and.returnValue(sortAscending);
        mockVizCol.getNewSortingOrder.and.returnValue(!sortAscending);
        mockVizCol.isSorted.and.returnValue(isSorted);
        mockVizCol.getEffectiveAggregateType.and.returnValue(aggregation);

        inject(function($injector) {
            vizColTransformationService = $injector.get('vizColTransformationService');
            dateUtil = $injector.get('dateUtil');
        });
    });

    it('should create sort transformation object', function() {
        var colSortPair = {
            id: mockVizCol.getSageOutputColumnId(),
            isAscending: mockVizCol.getNewSortingOrder()
        };
        var sortingTransformations = vizColTransformationService
            .getSortingTransform(mockVizModel, [colSortPair]);
        expect(sortingTransformations.length).toBe(2);
        expect(sortingTransformations[0].type).toBe(sage.QueryTransformType.REMOVE_ALL_SORT_PHRASES);
        expect(sortingTransformations[1].type).toBe(sage.QueryTransformType.ADD_SORT_COLUMN);
        expect(sortingTransformations[1].token_output_guid).toBe(sageColId);
        expect(sortingTransformations[1].ascending).toBe(!sortAscending);
        expect(sortingTransformations[1].aggregation).toBe(window.sage.AggregationType.SUM);
    });

    it('should create a change aggregate transform object', function() {
        mockVizCol.getBaseAggregationType.and.returnValue('AVERAGE');

        var aggregationTransformations = vizColTransformationService.getAggregationTransform(mockVizCol, 'COUNT');

        expect(aggregationTransformations.length).toBe(1);

        expect(aggregationTransformations[0].type).toBe(sage.QueryTransformType.CHANGE_AGGREGATION);
        expect(aggregationTransformations[0].token_output_guid).toBe(sageColId);
        expect(aggregationTransformations[0].aggregation).toBe(window.sage.AggregationType.COUNT);
    });

    it('should create a date-bucketing transformation object', function() {
        var dateBucketingTransformations =
            vizColTransformationService.getDateBucketingTransform(mockVizCol, dateUtil.timeBuckets.YEARLY);

        expect(dateBucketingTransformations.length).toBe(3);

        expect(dateBucketingTransformations[0].type).toBe(sage.QueryTransformType.REMOVE_TIME_BUCKET);
        expect(dateBucketingTransformations[0].token_output_guid).toBe(sageColId);

        expect(dateBucketingTransformations[1].type).toBe(sage.QueryTransformType.ADD_TIME_BUCKET);
        expect(dateBucketingTransformations[1].token_output_guid).toBe(sageColId);
        expect(dateBucketingTransformations[1].time_bucket).toBe(sage.TimeBucket.YEARLY);

        expect(dateBucketingTransformations[2].type).toBe(sage.QueryTransformType.REMOVE_TIME_BUCKET_QUALIFIER);
        expect(dateBucketingTransformations[2].token_output_guid).toBe(sageColId);
    });

    it('should should not have remove qualifier transform for weekly bucketing', function() {
        var dateBucketingTransformations =
            vizColTransformationService.getDateBucketingTransform(mockVizCol, dateUtil.timeBuckets.WEEKLY);

        expect(dateBucketingTransformations.length).toBe(2);

        expect(dateBucketingTransformations[0].type).toBe(sage.QueryTransformType.REMOVE_TIME_BUCKET);
        expect(dateBucketingTransformations[0].token_output_guid).toBe(sageColId);

        expect(dateBucketingTransformations[1].type).toBe(sage.QueryTransformType.ADD_TIME_BUCKET);
        expect(dateBucketingTransformations[1].token_output_guid).toBe(sageColId);
        expect(dateBucketingTransformations[1].time_bucket).toBe(sage.TimeBucket.WEEKLY);
    });
});
