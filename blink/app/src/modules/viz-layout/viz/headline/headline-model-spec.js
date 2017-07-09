/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for headline model
 */

'use strict';
/* global addCustomMatchers */

describe('Headline model', function () {
    var HeadlineModel, VisualizationModel, util, dateUtil;

    beforeEach(addCustomMatchers());

    beforeEach(function () {
        module('blink.app');
        // This load will override the real definitions with the mocks specified above.
        inject(function ($injector) {
            HeadlineModel = $injector.get('HeadlineModel');
            VisualizationModel = $injector.get('VisualizationModel');
            util = $injector.get('util');
            dateUtil = $injector.get('dateUtil');
        });
    });

    function getMockHeadlineMetadata(aggrs, type, effectiveDataType, effectiveAggregateType, isAdditive, isGrowth) {
        return {
            header: {},
            vizContent: {
                vizType: 'HEADLINE',
                columns: [
                    {
                        aggrs: aggrs,
                        column: {
                            baseColumnName: 'Col1',
                            sageOutputColumnId: 'col1',
                            aggrApplied: true,
                            effectiveType: effectiveAggregateType ? 'MEASURE' : 'ATTRIBUTE',
                            effectiveDataType: effectiveDataType,
                            baseDataType: effectiveDataType,
                            effectiveAggrType: effectiveAggregateType,
                            growth: isGrowth,
                            baseType: type,
                            isBaseColumnAdditive: isAdditive,
                            referencedColumnHeaders: [
                                {
                                    name: 'Col1'
                                }
                            ]
                        }
                    }
                ]
            }
        };
    }

    it('should initialize with no data', function () {
        var metadata = getMockHeadlineMetadata(undefined, 'MEASURE', 'INT64'),
            data = {};

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).not.toThrow();

        var headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });
        expect(headlineModel.hasNoData()).toBeTruthy();
        expect(headlineModel.getDataValueFormatted()).toBeNull();

        angular.extend(data, {
            data: []
        });
        headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });
        expect(headlineModel.hasNoData()).toBeTruthy();
        expect(headlineModel.getDataValueFormatted()).toBeNull();
    });

    it('should have a column', function () {
        var metadata = getMockHeadlineMetadata(undefined, 'MEASURE', 'VARCHAR'),
            data = {};

        var headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });
        expect(headlineModel.hasNoData()).toBeTruthy();
        expect(headlineModel.getDataValueFormatted()).toBeNull();
        expect(headlineModel.getColumnCount()).toBe(1);
        expect(headlineModel.getColumnName()).toBe('Col1');
        expect(headlineModel.getAggregateSize(0)).toBe(0);
    });

    it('should have an aggregate', function () {
        var metadata = getMockHeadlineMetadata(['COUNT'], 'MEASURE', 'INT64'),
            data = {
                data: [
                    [1000]
                ]
            };

        var headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });
        expect(headlineModel.hasNoData()).toBeFalsy();
        expect(headlineModel.getDataValueFormatted()).toBe('1K');
        expect(headlineModel.getAggregateSize(0)).toBe(1);
        expect(headlineModel.getAggregateLabel(0)).toBe('TOTAL COUNT');

        var currentDate = new Date();
        metadata = getMockHeadlineMetadata(['MIN'], 'ATTRIBUTE', 'DATE');
        data = {
            data: [
                [currentDate.getTime() / 1000]
            ]
        };

        headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });
        var formattedValue = headlineModel.getDataValueFormatted(0);
        var expectedFormattedValue = dateUtil.formatDate(currentDate, 'MM/dd/yyyy');
        expect(formattedValue).toBe(expectedFormattedValue);

        metadata = getMockHeadlineMetadata(['COUNT'], 'ATTRIBUTE', 'DATE');
        data = {
            data: [
                [1000000]
            ]
        };

        headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });
        expect(headlineModel.getDataValueFormatted(0)).toBe('1M');
    });

    it('should throw for missing column definition', function () {
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'HEADLINE'
                }
            },
            data = {
                data: [
                    [0]
                ]
            };

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();

        angular.extend(metadata.vizContent, {
            columns: []
        });

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();

        angular.extend(metadata.vizContent, {
            columns: [
                {}
            ]
        });

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();

        angular.extend(metadata.vizContent, {
            columns: [
                {
                    column: {}
                }
            ]
        });

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();

        angular.extend(metadata.vizContent, {
            columns: [
                {
                    column: {
                        column: {}
                    }
                }
            ]
        });

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();

        angular.extend(metadata.vizContent, {
            columns: [
                {
                    column: {
                        column: {
                            id: 'col1'
                        }
                    }
                }
            ]
        });

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();
    });

    it('should throw for inconsistent data + definition', function () {
        var metadata = getMockHeadlineMetadata(['COUNT_DISTINCT', 'SUM'], 'MEASURE', 'INT64'),
            data = {
                data: [
                    [0]
                ]
            };

        expect(function () {
            new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });
        }).toThrow();
    });

    it('should add aggregate to the definition', function () {
        var metadata = getMockHeadlineMetadata(['COUNT'], 'MEASURE', 'INT64'),
            data = {
                data: [
                    [0]
                ]
            };

        var headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });

        headlineModel.addAggregate('SUM');
        expect(headlineModel.getAggregateSize()).toBe(2);
        expect(headlineModel.getAggregateType(0)).toBe('COUNT');
        expect(headlineModel.getAggregateType(1)).toBe('SUM');
        expect(headlineModel.getAggregateLabel(1)).toBe('TOTAL');
    });

    it('should delete aggregate from the definition', function () {
        var metadata = getMockHeadlineMetadata(['COUNT', 'SUM'], 'MEASURE', 'INT64'),
            data = {
                data: [
                    [0],
                    [0]
                ]
            };

        var headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });

        expect(headlineModel.getAggregateSize()).toBe(2);
        expect(headlineModel.getAggregateType(0)).toBe('COUNT');
        expect(headlineModel.getAggregateType(1)).toBe('SUM');
        expect(headlineModel.getAggregateLabel(1)).toBe('TOTAL');

        headlineModel.removeAggregate(0);
        expect(headlineModel.getAggregateSize()).toBe(1);
        expect(headlineModel.getAggregateType(0)).toBe('SUM');
        expect(headlineModel.getAggregateLabel(0)).toBe('TOTAL');

        // Now add one more and delete it.
        headlineModel.addAggregate('COUNT');
        headlineModel.removeAggregate(1);
        expect(headlineModel.getAggregateSize()).toBe(1);
        expect(headlineModel.getAggregateType(0)).toBe('SUM');
        expect(headlineModel.getAggregateLabel(0)).toBe('TOTAL');

        // no-op
        headlineModel.removeAggregate(-1);
        expect(headlineModel.getAggregateSize()).toBe(1);

        // no-op
        headlineModel.removeAggregate(1);
        expect(headlineModel.getAggregateSize()).toBe(1);

        // remove the last one too.
        headlineModel.removeAggregate(0);
        expect(headlineModel.getAggregateSize()).toBe(0);
    });

    describe('headline suppress tests', function () {
        afterEach(function () {
            /* global flags */
            flags.setValue('suppress_NA_Headlines', false);
        });

        it('should not suppress headline if flag is off', function () {
            var metadata = getMockHeadlineMetadata(['COUNT', 'SUM'], 'MEASURE', 'INT64'),
                data = {
                    data: [
                        [],
                        []
                    ]
                };

            var headlineModel = new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });

            /* global flags */
            flags.setValue('suppress_NA_Headlines', false);
            expect(headlineModel.shouldBeSuppressedInUI()).toBeFalsy();
        });

        it('should suppress headline if flag is on and headline is undefined', function () {
            var metadata = getMockHeadlineMetadata(['COUNT', 'SUM'], 'MEASURE', 'INT64'),
                data = {
                    data: [
                        [],
                        []
                    ]
                };

            var headlineModel = new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });

            /* global flags */
            flags.setValue('suppress_NA_Headlines', true);

            expect(headlineModel.shouldBeSuppressedInUI()).toBeTruthy();
        });

        it('should suppress headline if flag is on and one summary is defined and other undefined', function () {
            var metadata = getMockHeadlineMetadata(['COUNT', 'SUM'], 'MEASURE', 'INT64'),
                data = {
                    data: [
                        [0],
                        []
                    ]
                };

            var headlineModel = new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });

            /* global flags */
            flags.setValue('suppress_NA_Headlines', true);

            expect(headlineModel.shouldBeSuppressedInUI()).toBeTruthy();
        });

        it('should not suppress headline if flag is on and all summaries are defined', function () {
            var metadata = getMockHeadlineMetadata(['COUNT', 'SUM'], 'MEASURE', 'INT64'),
                data = {
                    data: [
                        [0],
                        [0]
                    ]
                };

            var headlineModel = new HeadlineModel({
                vizJson: metadata,
                vizData: data
            });

            /* global flags */
            flags.setValue('suppress_NA_Headlines', true);

            expect(headlineModel.shouldBeSuppressedInUI()).toBeFalsy();
        });
    });

    function verifyExpectedSummaryTypes(effectiveAggregateType, effectiveType, effectiveDataType, isAdditive, isGrowth, expectedTypes) {
        var metadata = getMockHeadlineMetadata([], effectiveType, effectiveDataType, effectiveAggregateType, isAdditive, isGrowth),
            data = {
                data: []
            };

        var headlineModel = new HeadlineModel({
            vizJson: metadata,
            vizData: data
        });
        expect(headlineModel.getSupportedSummaryTypes()).toBeSetOf(expectedTypes);
    }

    //begin: date column type tests
    it('should get supported summary types for a non-aggregated date column', function () {
        verifyExpectedSummaryTypes('NONE', 'ATTRIBUTE', 'DATE', undefined, undefined, [
            util.aggregateTypes.TOTAL_COUNT,
            util.aggregateTypes.UNIQUE_COUNT,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for average on a date column', function () {
        verifyExpectedSummaryTypes('SUM', 'ATTRIBUTE', 'DATE', undefined, undefined, []);
    });

    it('should get supported summary types for count on a date column', function () {
        verifyExpectedSummaryTypes('COUNT', 'ATTRIBUTE', 'DATE', undefined, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get supported summary types for unique count on a date column', function () {
        verifyExpectedSummaryTypes('COUNT_DISTINCT', 'ATTRIBUTE', 'DATE', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get supported summary types for min on a date column', function () {
        verifyExpectedSummaryTypes('MIN', 'ATTRIBUTE', 'DATE', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get supported summary types for max on a date column', function () {
        verifyExpectedSummaryTypes('MAX', 'ATTRIBUTE', 'DATE', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for average on a date column', function () {
        verifyExpectedSummaryTypes('AVERAGE', 'ATTRIBUTE', 'DATE', undefined, undefined, []);
    });

    it('should get summary types for std-dev on a date column', function () {
        verifyExpectedSummaryTypes('STD_DEVIATION', 'ATTRIBUTE', 'DATE', undefined, undefined, []);
    });

    it('should get summary types for variance on a date column', function () {
        verifyExpectedSummaryTypes('VARIANCE', 'ATTRIBUTE', 'DATE', undefined, undefined, []);
    });

    it('should get summary types for growth on a date column', function () {
        verifyExpectedSummaryTypes('VARIANCE', 'ATTRIBUTE', 'DATE', undefined, true, []);
    });
    //end: date column type tests

    //begin: measure column type testing
    it('should get summary types for a non-aggregated measure column', function () {
        verifyExpectedSummaryTypes('NONE', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.TOTAL_COUNT,
            util.aggregateTypes.UNIQUE_COUNT,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a sum on a measure column', function () {
        verifyExpectedSummaryTypes('SUM', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a count on a measure column', function () {
        verifyExpectedSummaryTypes('COUNT', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a unique count on a measure column', function () {
        verifyExpectedSummaryTypes('COUNT_DISTINCT', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a min on a measure column', function () {
        verifyExpectedSummaryTypes('MIN', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a max on a measure column', function () {
        verifyExpectedSummaryTypes('MAX', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for average on a measure column', function () {
        verifyExpectedSummaryTypes('AVERAGE', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for std-dev on a measure column', function () {
        verifyExpectedSummaryTypes('STD_DEVIATION', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for a variance on a measure column', function () {
        verifyExpectedSummaryTypes('VARIANCE', 'MEASURE', 'INT64', undefined, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });
    //end: measure column type testing

    //begin: additive numeric column type testing
    it('should get summary types for a non-aggregated additive numeric column', function () {
        verifyExpectedSummaryTypes('NONE', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.TOTAL_COUNT,
            util.aggregateTypes.UNIQUE_COUNT,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a sum on an additive numeric column', function () {
        verifyExpectedSummaryTypes('SUM', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a count on an additive numeric column', function () {
        verifyExpectedSummaryTypes('COUNT', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a unique count on an additive numeric column', function () {
        verifyExpectedSummaryTypes('COUNT_DISTINCT', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a min on an additive numeric column', function () {
        verifyExpectedSummaryTypes('MIN', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a max on an additive numeric column', function () {
        verifyExpectedSummaryTypes('MAX', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for average on an additive numeric column', function () {
        verifyExpectedSummaryTypes('AVERAGE', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for std-dev on an additive numeric column', function () {
        verifyExpectedSummaryTypes('STD_DEVIATION', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for a variance on an additive numeric column', function () {
        verifyExpectedSummaryTypes('VARIANCE', 'ATTRIBUTE', 'INT64', true, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for a growth on an additive numeric column', function () {
        verifyExpectedSummaryTypes('SUM', 'ATTRIBUTE', 'INT64', true, true, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });
    //end: additive numeric column type testing

    //begin: non-additive numeric column type testing
    it('should get summary types for a non-aggregated non-additive numeric column', function () {
        verifyExpectedSummaryTypes('NONE', 'ATTRIBUTE', 'INT64', false, undefined, [
            util.aggregateTypes.TOTAL_COUNT,
            util.aggregateTypes.UNIQUE_COUNT
        ]);
    });

    it('should get summary types for a sum on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('SUM', 'ATTRIBUTE', 'INT64', false, undefined, []);
    });

    it('should get summary types for a count on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('COUNT', 'ATTRIBUTE', 'INT64', false, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a unique count on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('COUNT_DISTINCT', 'ATTRIBUTE', 'INT64', false, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a min on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('MIN', 'ATTRIBUTE', 'INT64', false, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for a max on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('MAX', 'ATTRIBUTE', 'INT64', false, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for an average on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('AVERAGE', 'ATTRIBUTE', 'INT64', false, undefined, []);
    });

    it('should get summary types for an std-dev on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('STD_DEVIATION', 'ATTRIBUTE', 'INT64', false, undefined, []);
    });

    it('should get summary types for an std-dev on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('VARIANCE', 'ATTRIBUTE', 'INT64', false, undefined, []);
    });

    it('should get summary types for growth on a non-additive numeric column', function () {
        verifyExpectedSummaryTypes('SUM', 'ATTRIBUTE', 'INT64', false, true, []);
    });
    //end: non-additive numeric column type testing

    //begin: non-numeric column type testing
    it('should get summary types for a non-numeric column', function () {
        verifyExpectedSummaryTypes('NONE', 'ATTRIBUTE', 'VARCHAR', false, undefined, [
            util.aggregateTypes.TOTAL_COUNT,
            util.aggregateTypes.UNIQUE_COUNT
        ]);
    });

    it('should get summary types for a sum on a non-numeric column', function () {
        verifyExpectedSummaryTypes('SUM', 'ATTRIBUTE', 'VARCHAR', false, undefined, []);
    });

    it('should get summary types for a count on a non-numeric column', function () {
        verifyExpectedSummaryTypes('COUNT', 'ATTRIBUTE', 'VARCHAR', false, undefined, [
            util.aggregateTypes.SUM,
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a unique count on a non-numeric column', function () {
        verifyExpectedSummaryTypes('COUNT_DISTINCT', 'ATTRIBUTE', 'VARCHAR', false, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX,
            util.aggregateTypes.AVG,
            util.aggregateTypes.STD_DEVIATION,
            util.aggregateTypes.VARIANCE
        ]);
    });

    it('should get summary types for a min on a non-numeric column', function () {
        verifyExpectedSummaryTypes('MIN', 'ATTRIBUTE', 'VARCHAR', false, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for a max on a non-numeric column', function () {
        verifyExpectedSummaryTypes('MAX', 'ATTRIBUTE', 'VARCHAR', false, undefined, [
            util.aggregateTypes.MIN,
            util.aggregateTypes.MAX
        ]);
    });

    it('should get summary types for an average on a non-numeric column', function () {
        verifyExpectedSummaryTypes('AVERAGE', 'ATTRIBUTE', 'VARCHAR', false, undefined, []);
    });

    it('should get summary types for an std-dev on a non-numeric column', function () {
        verifyExpectedSummaryTypes('STD_DEVIATION', 'ATTRIBUTE', 'VARCHAR', false, undefined, []);
    });

    it('should get summary types for an std-dev on a non-numeric column', function () {
        verifyExpectedSummaryTypes('VARIANCE', 'ATTRIBUTE', 'VARCHAR', false, undefined, []);
    });

    it('should get summary types for growth on a non-numeric column', function () {
        verifyExpectedSummaryTypes('VARIANCE', 'ATTRIBUTE', 'VARCHAR', false, true, []);
    });
    //end: non-numeric column type testing
});

