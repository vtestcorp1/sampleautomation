/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Unit tests for Runtime filters
 */

'use strict';
describe('runtime-filter-util unit tests', function () {

    var RuntimeFilterUtil,
        FilterRowOperators;

    beforeEach(function() {
        module('blink.app');
        inject(function ($injector) {
            RuntimeFilterUtil = $injector.get('RuntimeFilterUtil');
            FilterRowOperators = $injector.get('filterTypes').FilterRowOperators;
        });
    });

    it('should get filter condition summary', function () {

        var label = RuntimeFilterUtil.getFilterLabel('eq', '2');
        expect(label).toBe('= 2');

        label = RuntimeFilterUtil.getFilterLabel('NE', '2');
        expect(label).toBe('!= 2');

        label = RuntimeFilterUtil.getFilterLabel(
            FilterRowOperators[FilterRowOperators.CONTAINS], '2');
        expect(label).toBe('CONTAINS 2');

        label = RuntimeFilterUtil.getFilterLabel(
            'Fake', '2');
        expect(label).toBe('Fake 2');
    });

    it('should get correct filter for apply as runtime filter action', function () {
        var column = {
            getName : function () {
                return 'columnName';
            },
            getDataFormatter : function () {
                return function (name) {
                    return name;
                }
            },
            getEffectiveDataType : function () {
                return 'DATE';
            },
            getDateBucketBoundaries: function (value) {
                return [1,2];
            }
        };
        var columnValuePairs = [{
            column : column,
            value : 'columnValue'

        }];

        var contextMenuData = {
            columnValuePairs : columnValuePairs
        };
        var filters = RuntimeFilterUtil.getApplyAsFilters(contextMenuData);
        var expected = {
            col1: 'columnName',
            op1: 'BW',
            val1: [ 1, 2 ]
        };
        expect(RuntimeFilterUtil.areRuntimeParamsEqual(expected, filters)).toBeTruthy();
    });
});
