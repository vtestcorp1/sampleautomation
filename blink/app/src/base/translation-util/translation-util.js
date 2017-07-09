/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal
 *
 * @fileoverview Utility to translate between Sage and Callosum constants
 */

'use strict';

blink.app.factory('sageCallosumTranslator', ['Logger',
    function(Logger) {

        var _logger = Logger.create('sage-callosum-translator');

        var CALLOSUM_AGGR_TYPE_TO_SAGE_AGGR_TYPE = {
            SUM: 'SUM',
            AVERAGE: 'AVERAGE',
            MIN: 'MIN',
            MAX: 'MAX',
            COUNT: 'COUNT',
            COUNT_DISTINCT: 'UNIQUE_COUNT',
            STD_DEVIATION : 'STD_DEVIATION',
            VARIANCE : 'VARIANCE',
            NONE: 'NONE'
        };

    /**
     * Returns sage aggregation name for a give callosum aggregation name. In most cases these names are the same
     * but can be different in some cases (e.g callosum:COUNT_DISTINCT === sage:UNIQUE_COUNT)
     * @param {string} callosumAggrType
     * @returns {string}
     */
        var getSageAggrTypeForCallosumAggrType = function (callosumAggrType) {
            if (!CALLOSUM_AGGR_TYPE_TO_SAGE_AGGR_TYPE.hasOwnProperty(callosumAggrType)) {
                _logger.warn("unknown callosum aggr type", callosumAggrType);
                return null;
            }
            return CALLOSUM_AGGR_TYPE_TO_SAGE_AGGR_TYPE[callosumAggrType];
        };

        var SAGE_AGGR_TYPE_TO_CALLOSUM_AGGR_TYPE = (function() {
            var map = {};
            map[sage.AggregationType.SUM] = 'SUM';
            map[sage.AggregationType.AVERAGE] = 'AVERAGE';
            map[sage.AggregationType.MIN] = 'MIN';
            map[sage.AggregationType.MAX] = 'MAX';
            map[sage.AggregationType.COUNT] = 'COUNT';
            map[sage.AggregationType.UNIQUE_COUNT] = 'COUNT_DISTINCT';
            map[sage.AggregationType.STD_DEVIATION] = 'STD_DEVIATION';
            map[sage.AggregationType.VARIANCE] = 'VARIANCE';
            map[sage.AggregationType.NONE] = 'NONE';
            return map;
        })();

    /**
     * @param {sage.AggregationType} sageAggrType
     * @returns {string}
     */
        var getCallosumAggrTypeForSageAggrType = function (sageAggrType) {
            if (!SAGE_AGGR_TYPE_TO_CALLOSUM_AGGR_TYPE.hasOwnProperty(sageAggrType)) {
                _logger.warn("unknown sage aggr type", sageAggrType);
                return null;
            }
            return SAGE_AGGR_TYPE_TO_CALLOSUM_AGGR_TYPE[sageAggrType];
        };

        var CALLOSUM_DATA_TYPE_TO_SAGE_DATA_TYPE = {
            CHAR: 'CHAR',
            VARCHAR: 'CHAR',
            BOOL: 'BOOL',
            INT32: 'INT32',
            INT64: 'INT64',
            FLOAT: 'FLOAT',
            DOUBLE: 'DOUBLE',
            DATE: 'DATE',
            DATE_TIME: 'DATE_TIME',
            TIME: 'TIME'
        };

    /**
     * @param {string} callosumDataType
     * @returns {string}
     */
        var getSageDataTypeForCallosumDataType = function (callosumDataType) {
            if (!CALLOSUM_DATA_TYPE_TO_SAGE_DATA_TYPE.hasOwnProperty(callosumDataType)) {
                _logger.warn("unknown callosum data type", callosumDataType);
                return null;
            }
            return CALLOSUM_DATA_TYPE_TO_SAGE_DATA_TYPE[callosumDataType];
        };

        var SAGE_DATA_TYPE_TO_CALLOSUM_DATA_TYPE = (function() {
            var map = {};
            map[sage.DataType.CHAR] = 'CHAR';
            map[sage.DataType.BOOL] = 'BOOL';
            map[sage.DataType.INT32] = 'INT32';
            map[sage.DataType.INT64] = 'INT64';
            map[sage.DataType.FLOAT] = 'FLOAT';
            map[sage.DataType.DOUBLE] = 'DOUBLE';
            map[sage.DataType.DATE] = 'DATE';
            map[sage.DataType.DATE_TIME] = 'DATE_TIME';
            map[sage.DataType.TIME] = 'TIME';
            return map;
        })();

    /**
     * @param {sage.DataType} sageDataType
     * @returns {string}
     */
        var getCallosumDataTypeForSageDataType = function (sageDataType) {
            if (!SAGE_DATA_TYPE_TO_CALLOSUM_DATA_TYPE.hasOwnProperty(sageDataType)) {
                _logger.warn("unknown sage data type", sageDataType);
                return null;
            }
            return SAGE_DATA_TYPE_TO_CALLOSUM_DATA_TYPE[sageDataType];
        };

        var CALLOSUM_COLUMN_TYPE_TO_SAGE_COLUMN_TYPE = {
            ATTRIBUTE: 'ATTRIBUTE',
            MEASURE: 'MEASURE',
            UNKNOWN: 'UNKNOWN'
        };

    /**
     * @param {string} callosumColumnType
     * @returns {string}
     */
        var getSageColumnTypeForCallosumColumnType = function (callosumColumnType) {
            if (!CALLOSUM_COLUMN_TYPE_TO_SAGE_COLUMN_TYPE.hasOwnProperty(callosumColumnType)) {
                _logger.warn("unknown callosum column type", callosumColumnType);
                return null;
            }
            return CALLOSUM_COLUMN_TYPE_TO_SAGE_COLUMN_TYPE[callosumColumnType];
        };

        var SAGE_COLUMN_TYPE_TO_CALLOSUM_COLUMN_TYPE = (function() {
            var map = {};
            map[sage.ColumnType.ATTRIBUTE] = 'ATTRIBUTE';
            map[sage.ColumnType.MEASURE] = 'MEASURE';
            map[sage.ColumnType.UNKNOWN] = 'UNKNOWN';
            return map;
        })();

    /**
     * @param {sage.ColumnType} sageColumnType
     * @returns {string}
     */
        var getCallosumColumnTypeForSageColumnType = function (sageColumnType) {
            if (!SAGE_COLUMN_TYPE_TO_CALLOSUM_COLUMN_TYPE.hasOwnProperty(sageColumnType)) {
                _logger.warn("unknown sage column type", sageColumnType);
                return null;
            }
            return SAGE_COLUMN_TYPE_TO_CALLOSUM_COLUMN_TYPE[sageColumnType];
        };

        return {
            getSageAggrTypeForCallosumAggrType: getSageAggrTypeForCallosumAggrType,
            getCallosumAggrTypeForSageAggrType: getCallosumAggrTypeForSageAggrType,
            getSageDataTypeForCallosumDataType: getSageDataTypeForCallosumDataType,
            getCallosumDataTypeForSageDataType: getCallosumDataTypeForSageDataType,
            getSageColumnTypeForCallosumColumnType: getSageColumnTypeForCallosumColumnType,
            getCallosumColumnTypeForSageColumnType: getCallosumColumnTypeForSageColumnType
        };
    }]);

