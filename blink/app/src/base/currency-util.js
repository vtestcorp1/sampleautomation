/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma
 *
 * @fileoverview Some utility code related to currency type formatting feature.
 */

'use strict';

blink.app.factory('currencyUtil', ['Logger',
    'jsonConstants',
    function (Logger,
          jsonConstants) {

        var me = {};
        var _logger = Logger.create('currency-util');

    /**
     * Returns if given currencyTypeInfo object represent a valid configuration that
     * can be persisted. Note that any falsey value (undefined/null) is a valid value, because
     * it is equivalent to having no currency type at all.
     * @param currencyTypeInfo .
     * @param allColumns Array of all logical columns of the table which this currencyTypeInfo
     * belongs to.
     * @returns {boolean}
     */
        me.isValidCurrencyTypeInfo = function(currencyTypeInfo, allColumns) {
            if (!currencyTypeInfo) {
                return true;
            }
            if (currencyTypeInfo.getSettingType() === jsonConstants.currencyTypes.FROM_COLUMN) {
                if (!currencyTypeInfo.getColumnGuid()) {
                    return false;
                }
                var currencyColumn = allColumns.find(function (column) {
                    return column.getGuid() === currencyTypeInfo.getColumnGuid();
                });
                return !!currencyColumn;
            }
            if (currencyTypeInfo.getSettingType() === jsonConstants.currencyTypes.FROM_ISO_CODE &&
            !currencyTypeInfo.getIsoCode()) {
                return false;
            }
            return true;
        };

    /**
     * Does 2 things.
     *
     * 1. For table viz data, if a column is a currency column, and currency type setting is
     * FROM_COLUMN then extract currency code from that other column and attach it to this column's
     * value. i.e. change 100 to [100, 'INR']. This will make it simple to format the cell data,
     * because the currency code needed to format the cell will be with the cell itself.
     *
     * 2. If a chart viz column is a currency column and currency type setting is FROM_COLUMN, and
     * there is exactly one distinct type of currency code in the data of column that has currency
     * codes, then set that unique currency code in the underlying logical column. We will use this
     * code to format chart's y axis data points. The reason why we don't set it if there is more
     * than one distinct currency code is because in that case y axis will be used for numeric
     * values in multiple currencies, hence we can't show any currency code there.
     *
     * @param vizModels
     * @param vizIdToDataMap
     */
        me.addCurrencyInfo = function (vizModels, vizIdToDataMap) {
            vizModels.forEach(function (vizModel) {
                var vizId = vizModel.getId();
                if (vizModel.getVizType() === jsonConstants.vizType.PINBOARD_VIZ) {
                    vizModel = vizModel.getReferencedVisualization();
                }
                var vizType = vizModel.getVizType();
                if (vizType !== jsonConstants.vizType.TABLE &&
                vizType !== jsonConstants.vizType.CHART) {
                    return;
                }

                if (vizType === jsonConstants.vizType.CHART) {
                    var queryDefs = vizModel.getQueryDefinitions();
                    vizIdToDataMap[vizId].forEach(function (queryData, index) {
                        var columns = queryDefs[index].getColumnsInDataOrder();
                        var dataArray = queryData.data;
                        addCurrencyInfoInternal(vizType, columns, dataArray);
                    });
                } else {
                    addCurrencyInfoInternal(
                    vizType,
                    vizModel.getVizColumns(),
                    vizIdToDataMap[vizId].data
                );
                }
            });
        };

        function addCurrencyInfoInternal(vizType, vizColumns, data) {
            vizColumns.forEach(function (vizColumn) {
                var currencyTypeInfo = vizColumn.getCurrencyTypeInfo();
                if (!currencyTypeInfo) {
                    return;
                }
                if (currencyTypeInfo.getSettingType() !== jsonConstants.currencyTypes.FROM_COLUMN) {
                    return;
                }
                var currencyColumnGuid = currencyTypeInfo.getColumnGuid();
                var currencyColumnIndex = vizColumns.findIndex(function (col) {
                    return col.getBaseLogicalColumnGuid() === currencyColumnGuid;
                });
                if (currencyColumnIndex === -1) {
                    _logger.error('Currency code column is missing in columns list');
                    return;
                }

                var currentColDataRowIndex = vizColumn.getDataRowIndex();
                var currencyColDataRowIndex = vizColumns[currencyColumnIndex]
                .getDataRowIndex();
                if (currencyColDataRowIndex === -1) {
                    _logger.warn('Data for currency code column is missing');
                    return;
                }
                var distinctCurrencies = {};
                data.forEach(function (row) {
                    var currencyCode = row[currencyColDataRowIndex];
                    distinctCurrencies[currencyCode] = 1;
                    if (vizType === jsonConstants.vizType.TABLE) {
                        var value = row[currentColDataRowIndex];
                        row[currentColDataRowIndex] = [value, currencyCode];
                    }
                });

                var currencyCodes = Object.keys(distinctCurrencies);
                if (currencyCodes.length === 1) {
                    vizColumn.setUniqueCurrencyCode(currencyCodes[0]);
                }
            });
        }

    /**
     * Returns whether all the given columns have same currency type info. This is used in the
     * cases like where we want to check if we multiple columns can share Y-axis or not.
     * @param vizColumns .
     * @returns {boolean}
     */
        me.haveIdenticalCurrencyTypeInfo = function (vizColumns) {
            var currencyTypeInfo;
            for (var i = 0; i < vizColumns.length; i++) {
                var vizColumn = vizColumns[i];
                if (i === 0) {
                    currencyTypeInfo = vizColumn.getCurrencyTypeInfo();
                } else {
                    if (!_.isEqual(currencyTypeInfo, vizColumn.getCurrencyTypeInfo())) {
                        return false;
                    }
                }
            }
            return true;
        };

        return me;
    }]);

