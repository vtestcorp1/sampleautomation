/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for filter util.
 */

'use strict';

describe('Filter util spec', function () {
    var filterUtil;
    var rangeOperatorUtil;

    var mockDataService = {};

    function getMockFilterValue(key) {
        return {
            getKey: function() {
                return key;
            },
            isSelected: function () {
                return true
            }
        }
    }
    function getMockFilterRow(operator, values) {
        return {
            getOperator: function () {
                return operator;
            },
            getValues: function () {
                return values.map(function(val) {
                    return getMockFilterValue(val);
                });
            }
        };
    }

    function initSuite() {
        beforeEach(function () {
            module('blink.app');
            module(function ($provide) {
                $provide.value('dataService', mockDataService);
            });
            inject(function($q){
                mockDataService.dataForViz = [];
                mockDataService.getDataForViz = function () {
                    var defer = $q.defer();
                    defer.resolve(this.dataForViz);
                    return defer.promise;
                };
            });
            inject(function ($injector) {
                filterUtil = $injector.get('filterUtil');
                rangeOperatorUtil = $injector.get('rangeOperatorUtil');
            });
        });
    }

    describe('filterValuesMatchingFilterColumnValues tests', function () {
        initSuite();

        it('verify invalid input values', function () {
            var mockFilterModel = {
                getContainingAnswerModel: function () {
                    return null;
                },
                getColumn: function () {
                    return {
                        getId: function () {
                            return 'id1';
                        }
                    };
                },
                getFilterRows: function () {
                    return [getMockFilterRow(rangeOperatorUtil.operatorTypes.IN, ['foo', 'bar'])]
                }
            };
            expect(filterUtil.filterValuesMatchingFilterColumnValues()).toBeUndefined();
            expect(filterUtil.filterValuesMatchingFilterColumnValues()).toBeUndefined(mockFilterModel);
        });

        it('verify empty values array', function () {
            var mockFilterModel = {
                getContainingAnswerModel: function () {
                    return null;
                },
                getColumn: function () {
                    return {
                        getId: function () {
                            return 'id1';
                        }
                    };
                },
                getFilterRows: function () {
                    return [getMockFilterRow(rangeOperatorUtil.operatorTypes.IN, ['foo', 'bar'])]
                }
            };
            var values = [];
            mockDataService.dataForViz = [["foo"], ["bar"]];
            filterUtil.filterValuesMatchingFilterColumnValues(mockFilterModel, values).
                then(function(matchingValues){
                    expect(matchingValues.length).toBe(0);
                });
        });

        it('verify array of string values', function () {
            var mockFilterModel = {
                getContainingAnswerModel: function () {
                    return null;
                },
                getColumn: function () {
                    return {
                        getId: function () {
                            return 'id1';
                        }
                    };
                },
                getFilterRows: function () {
                    return [getMockFilterRow(rangeOperatorUtil.operatorTypes.IN, ['foo', 'bar'])]
                }
            };
            var values = ['foo', 'bar'];
            mockDataService.dataForViz = [["foo"], ["bar"]];
            filterUtil.filterValuesMatchingFilterColumnValues(mockFilterModel, values).
                then(function(matchingValues){
                    expect(matchingValues.length).toBe(2);
                    expect(matchingValues[0]).toBe('foo');
                    expect(matchingValues[1]).toBe('bar');
                });
        });

        it('verify array of number values', function () {
            var mockFilterModel = {
                getContainingAnswerModel: function () {
                    return null;
                },
                getColumn: function () {
                    return {
                        getId: function () {
                            return 'id1';
                        }
                    };
                }
            };
            var values = [1, 2, 3];
            mockDataService.dataForViz = [[1], [2], [3]];
            filterUtil.filterValuesMatchingFilterColumnValues(mockFilterModel, values).
                then(function(matchingValues){
                    expect(matchingValues.length).toBe(3);
                    expect(matchingValues[0]).toBe(1);
                    expect(matchingValues[1]).toBe(2);
                    expect(matchingValues[2]).toBe(3);
                });
        });

        it('should be able to show summary for range filters', function () {
            // Double operator scenario
            var mockFilterModel = {
                getContainingAnswerModel: function () {
                    return null;
                },
                getColumn: function () {
                    return {
                        getId: function () {
                            return 'id1';
                        },
                        isMeasure: function () {
                            return true;
                        },
                        isDateColumn: function () {
                            return false;
                        }
                    };
                },
                getFilterRows: function () {
                    return [getMockFilterRow(rangeOperatorUtil.operatorTypes.BW, ['500', '600'])]
                }
            };
            expect(filterUtil.getFilterValueSummary(mockFilterModel)).toBe('> 500 < 600');

            // Single operator scenario
            _.assign(mockFilterModel, {
                getFilterRows: function () {
                    return [getMockFilterRow(rangeOperatorUtil.operatorTypes.GT, ['500'])]
                }
            });
            expect(filterUtil.getFilterValueSummary(mockFilterModel)).toBe('> 500');
        });
    });
});
