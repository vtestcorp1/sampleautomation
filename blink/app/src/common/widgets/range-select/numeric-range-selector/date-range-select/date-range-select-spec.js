/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview  Date range select spec.
 *
 */

'use strict';

describe('blink date range select spec', function () {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var $rootScope,
        $compile,
        DateRangeSelectController,
        rangeOperatorUtil;

    /* eslint camelcase: 1 */
    beforeEach(inject(function(
        _$rootScope_,
        _$compile_,
        _DateRangeSelectController_,
        _rangeOperatorUtil_
    ) {
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        $compile = _$compile_;
        /* eslint camelcase: 1 */
        DateRangeSelectController = _DateRangeSelectController_;
        /* eslint camelcase: 1 */
        rangeOperatorUtil = _rangeOperatorUtil_;
    }));

    describe('verify range operators', function () {
        var tpl = '<blink-date-range-select ctrl="ctrl"></blink-date-range-select>';

        it('should init with >= and <= in ctrl', function () {
            var rangeDef = new rangeOperatorUtil.RangeDefinitionInLeafOperators(
                rangeOperatorUtil.operatorTypes.EQ
            );

            var dateRangeSelectCtrl = new DateRangeSelectController(rangeDef);
            var initRangeDef = dateRangeSelectCtrl.getRangeDefinition();

            expect(initRangeDef.firstOperator).toBe(rangeOperatorUtil.operatorTypes.GE);
            expect(initRangeDef.secondOperator).toBe(rangeOperatorUtil.operatorTypes.LE);
        });

        it('should init with >= and <= in component', function () {
            var elm = angular.element(tpl);
            var scope = $rootScope.$new();

            var rangeDef = new rangeOperatorUtil.RangeDefinitionInLeafOperators(
                rangeOperatorUtil.operatorTypes.EQ
            );
            var dateRangeSelectCtrl = new DateRangeSelectController(rangeDef);

            scope.ctrl = dateRangeSelectCtrl;
            $compile(elm)(scope);
            scope.$digest();

            var initRangeDef = dateRangeSelectCtrl.getRangeDefinition();

            expect(initRangeDef.firstOperator).toBe(rangeOperatorUtil.operatorTypes.GE);
            expect(initRangeDef.secondOperator).toBe(rangeOperatorUtil.operatorTypes.LE);
        });

        it('should allow changing operator without value change', function () {
            var rangeDef = new rangeOperatorUtil.RangeDefinitionInLeafOperators(
                rangeOperatorUtil.operatorTypes.EQ
            );
            var dateRangeSelectCtrl = new DateRangeSelectController(rangeDef);

            // TODO(Jasmeet): Find a way to trigger chosen update in UTs.
            dateRangeSelectCtrl.selectedFirstOperatorOption.operator = 'LT';
            dateRangeSelectCtrl.onFirstOperatorChange();

            var updatedRangeDef = dateRangeSelectCtrl.getRangeDefinition();

            var expectedOperator =
                rangeOperatorUtil.operatorTypes[rangeOperatorUtil.operatorTypes.LT];
            expect(updatedRangeDef.firstOperator).toBe(expectedOperator);
            expect(updatedRangeDef.secondOperator).toBe(null);
        });
    });
});
