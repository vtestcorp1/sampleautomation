/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for range filter controller
 */
'use strict';

describe('Range filter controller', function() {
    var $scope = null,
        mockFilterModel,
        RangeFilterController;
    var rangeOperatorUtil;

    beforeEach(module('blink.app'));

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

    /* eslint camelcase: 1 */
    beforeEach(inject(function (_$rootScope_, _RangeFilterController_, _rangeOperatorUtil_) {
        /* eslint camelcase: 1 */
        $scope = _$rootScope_.$new();
        /* eslint camelcase: 1 */
        RangeFilterController = _RangeFilterController_;
        rangeOperatorUtil = _rangeOperatorUtil_;

        mockFilterModel = {
            getFilterOperator: function () {},
            getFilterValues: function () {},
            getColumn: function () {
                return {
                    getGuid: function () {},
                    getSageOutputColumnId: function () {
                        return this.getGuid();
                    },
                    convertValueToSageValue: function () {},
                    isDoubleColumn: function() {
                        return true;
                    },
                    isDateColumn: function () {
                        return false;
                    },
                    hasAggregateOverride: function () {
                        return false;
                    },
                    getAggregateOverride: function () {
                        return 'NONE';
                    },
                    isInteger: function() {
                        return true;
                    },
                    isFloat: function() {
                        return false;
                    }
                };
            },
            getContainingAnswerModel: function() {
                return {
                    getSageContext: function() {
                        return null;
                    },
                    getSageContextIndex: function() {
                        return -1;
                    }
                };
            }
        };
    }));

    it('should have valid range selection', function () {
        var mockFilterRow = getMockFilterRow(rangeOperatorUtil.operatorTypes.GT, [1000]);
        angular.extend(mockFilterModel, {
            getFilterRows: function () {
                return [mockFilterRow];
            }
        });

        var rangeFilterController = new RangeFilterController(
            mockFilterModel,
            false // isReadOnly
        );

        var rangeDefinition = rangeFilterController.getRangeDefinition();

        expect(rangeDefinition.firstOperator).toBe(rangeOperatorUtil.operatorTypes.GT);
        expect(rangeDefinition.firstOperand).toBe(1000);
        expect(rangeDefinition.secondOperator).toBe(void 0);
        expect(rangeDefinition.secondOperand).toBe(void 0);
    });

    it('should set range selections for between operation', function () {
        var mockFilterRow = getMockFilterRow(rangeOperatorUtil.operatorTypes.BW, [1000, 2000]);
        angular.extend(mockFilterModel, {
            getFilterRows: function () {
                return [mockFilterRow];
            }
        });

        var rangeFilterController = new RangeFilterController(
            mockFilterModel,
            false // isReadOnly
        );

        var rangeDefinition = rangeFilterController.getRangeDefinition();

        expect(rangeDefinition.firstOperator).toBe(rangeOperatorUtil.operatorTypes.GT);
        expect(rangeDefinition.firstOperand).toBe(1000);
        expect(rangeDefinition.secondOperator).toBe(rangeOperatorUtil.operatorTypes.LT);
        expect(rangeDefinition.secondOperand).toBe(2000);
    });

    it('should update second operator when first operator is changed', function () {
        var mockFilterRow = getMockFilterRow(rangeOperatorUtil.operatorTypes.BW, [1000, 2000]);
        angular.extend(mockFilterModel, {
            getFilterRows: function () {
                return [mockFilterRow];
            }
        });

        var rangeFilterController = new RangeFilterController(
            mockFilterModel,
            false // isReadOnly
        );

        rangeFilterController.selectedFirstOperatorOption.operator = rangeOperatorUtil.operatorTypes.GE;
        rangeFilterController.onFirstOperatorChange();

        var rangeDefinition = rangeFilterController.getRangeDefinition();
        expect(rangeDefinition.firstOperator).toBe(rangeOperatorUtil.operatorTypes.GE);
        expect(rangeDefinition.secondOperator).toBe(rangeOperatorUtil.operatorTypes.LT);

        rangeFilterController.selectedFirstOperatorOption.operator = rangeOperatorUtil.operatorTypes.NE;
        rangeFilterController.onFirstOperatorChange();

        rangeDefinition = rangeFilterController.getRangeDefinition();
        expect(rangeDefinition.firstOperator).toBe(rangeOperatorUtil.operatorTypes.NE);
        expect(rangeDefinition.secondOperator).toBe(null);
    });
});
