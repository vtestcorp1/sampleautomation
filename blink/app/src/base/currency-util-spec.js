/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Unit test for answer-ui
 */

'use strict';
/* eslint camelcase: 1 */

describe('currencyUtil', function() {

    beforeEach(module('blink.app'));

    var jsonConstants, CurrencyTypeInfo, currencyUtil;
    beforeEach(inject(function(
        _CurrencyTypeInfo_,
        _jsonConstants_,
        _currencyUtil_) {
        CurrencyTypeInfo = _CurrencyTypeInfo_;
        jsonConstants = _jsonConstants_;
        currencyUtil = _currencyUtil_;
    }
    ));

    function getVizColumn(logicalColumnGuid, dataRowIndex, currencyInfoJson) {
        var currencyTypeInfo = new CurrencyTypeInfo(currencyInfoJson);
        var col = jasmine.createSpyObj('vizColumn', [
            'getLogicalColumn',
            'getCurrencyTypeInfo',
            'getBaseLogicalColumnGuid',
            'setUniqueCurrencyCode',
            'getDataRowIndex'
        ]);

        col.getCurrencyTypeInfo.and.returnValue(currencyTypeInfo);
        col.getBaseLogicalColumnGuid.and.returnValue(logicalColumnGuid);
        col.getDataRowIndex.and.returnValue(dataRowIndex);

        return col;
    }

    function getTableVizModel(vizId, vizColumns) {
        return {
            getId: function () {
                return vizId;
            },
            getVizType: function () {
                return 'TABLE';
            },
            getVizColumns: function () {
                return vizColumns;
            }
        };
    }

    function getPinboardVizModel(vizId, referencedTableVizId, vizColumns) {
        var referencedVizModel = getTableVizModel(referencedTableVizId, vizColumns);
        return {
            getId: function() {
                return vizId;
            },
            getVizType: function () {
                return 'PINBOARD_VIZ';
            },
            getReferencedVisualization: function() {
                return referencedVizModel;
            }
        };
    }

    function getChartVizModel(vizId, vizColumns) {
        return {
            getId: function () {
                return vizId;
            },
            getVizType: function () {
                return 'CHART';
            },
            getQueryDefinitions: function () {
                return [
                    {
                        getColumnsInDataOrder: function() {
                            return vizColumns;
                        }
                    }
                ];
            }
        };
    }

    it('should update the data rows for table model', function() {
        var vizColums = [
            getVizColumn('c1', 1, {
                setting: jsonConstants.currencyTypes.FROM_COLUMN,
                columnGuid: 'c2'
            }),
            getVizColumn('c2', 0, null)
        ];
        var vizModels = [
            getTableVizModel('v1', vizColums),
            getChartVizModel('v2', vizColums)
        ];

        var vizIdToDataMap = {
            v1: {
                data: [
                    ['INR', 1234]
                ]
            },
            v2: [{
                data: [
                    ['USD', 2345]
                ]
            }]
        };

        currencyUtil.addCurrencyInfo(vizModels, vizIdToDataMap);

        vizIdToDataMap.v1.data.forEach(function (row) {
            expect(Array.isArray(row[1])).toBe(true);
        });
        // It should not alter data for chart viz.
        vizIdToDataMap.v2.forEach(function(queryData) {
            queryData.data.forEach(function (row) {
                expect(Array.isArray(row[1])).toBe(false);
            });
        });
    });

    it('should be able to handle pinboard viz too', function() {
        var vizModel = getPinboardVizModel('v1', 'refTableViz1', [
            getVizColumn('c1', 0, {
                setting: jsonConstants.currencyTypes.FROM_COLUMN,
                columnGuid: 'c2'
            }),
            getVizColumn('c2', 1, null)
        ]);

        var vizIdToDataMap = {
            v1: {
                data: [
                    [1234, 'INR']
                ]
            }
        };

        currencyUtil.addCurrencyInfo([vizModel], vizIdToDataMap);
        vizIdToDataMap.v1.data.forEach(function (row) {
            expect(Array.isArray(row[0])).toBe(true);
        });
    });

    it('should set the currency code for chart model if there is a unique currency code',
        function() {
            function getColumnsFromChartModel(chartModel) {
                return chartModel.getQueryDefinitions()[0].getColumnsInDataOrder();
            }

            var vizModels = [1, 2].map(function (i) {
                return getChartVizModel('v' + i, [
                    getVizColumn('c1', 0, null),
                    getVizColumn('c2', 1, {
                        setting: jsonConstants.currencyTypes.FROM_COLUMN,
                        columnGuid: 'c3'
                    }),
                    getVizColumn('c3', 2, null)
                ]);
            });
            var vizIdToDataMap = {
                v1: [{
                    data: [
                        [1, 100, 'USD'],
                        [2, 200, 'USD']
                    ]
                }],
                v2: [{
                    data: [
                        [3, 300, 'USD'],
                        [4, 400, 'INR']
                    ]
                }]
            };
            currencyUtil.addCurrencyInfo(vizModels, vizIdToDataMap);
            expect(getColumnsFromChartModel(vizModels[0])[1].setUniqueCurrencyCode)
                .toHaveBeenCalledWith('USD');
            expect(getColumnsFromChartModel(vizModels[1])[1].setUniqueCurrencyCode)
                .not.toHaveBeenCalled();
        }
    );

    it('isValidCurrencyTypeInfo should be able to detect invalid data', function() {
        // null is a valid value
        expect(currencyUtil.isValidCurrencyTypeInfo(null, [])).toBe(true);
        // The one with missing iso code.
        expect(currencyUtil.isValidCurrencyTypeInfo(new CurrencyTypeInfo({
            setting: jsonConstants.currencyTypes.FROM_ISO_CODE
        }), [])).toBe(false);
        // The one with missing column guid
        expect(currencyUtil.isValidCurrencyTypeInfo(new CurrencyTypeInfo({
            setting: jsonConstants.currencyTypes.FROM_COLUMN
        }), [])).toBe(false);
        // The one with corrupt column guid.
        expect(currencyUtil.isValidCurrencyTypeInfo(new CurrencyTypeInfo({
            setting: jsonConstants.currencyTypes.FROM_COLUMN,
            columnGuid: 'someInvalidGuid'
        }), [])).toBe(false);

        // Following two are valid.
        expect(currencyUtil.isValidCurrencyTypeInfo(new CurrencyTypeInfo({
            setting: jsonConstants.currencyTypes.FROM_USER_LOCALE
        }), [])).toBe(true);
        expect(currencyUtil.isValidCurrencyTypeInfo(
            new CurrencyTypeInfo({
                setting: jsonConstants.currencyTypes.FROM_COLUMN,
                columnGuid: '123'
            }),
            [{
                getGuid: function() {
                    return '123';
                }
            }]
        )).toBe(true);

    });
});

