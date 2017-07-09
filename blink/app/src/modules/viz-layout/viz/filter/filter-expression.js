/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides a service to create filter expressions
 */

'use strict';

blink.app.factory('filterExpressionService', ['jsonConstants',
    'Logger',
    'jsUtil',
    function (jsonConstants,
          Logger,
          jsUtil) {
        var _logger = Logger.create('filter-expression-service');

        var filterOperators = {
            CONTAINS: 'OP_CONTAINS',
            IN: 'OP_IN',
            EQUALS: 'OP_EQUALS'
        };

        var SimpleFilterExpression = function (vizColumn, value, operator) {
            if (!vizColumn) {
                _logger.error('Cannot create filter expression, missing visualization column');
                return;
            }
            if (!vizColumn.getId || !vizColumn.getId()) {
                _logger.error('Cannot create filter expression, visualization column missing id');
                return;
            }
            if (!value) {
                _logger.error('Cannot create filter expression, missing value');
                return;
            }
            if (!operator) {
                _logger.error('Cannot create filter expression, missing operator');
                return;
            }

            this.vizColumn = vizColumn;
            this.value = value;
            this.operator = operator;
            this.columnInfoNodeIndex = 0;
            this.valueNodeIndex = 1;
        };

        SimpleFilterExpression.prototype.getJsonObject = function () {
            var jsonObjectMap = {
                id: jsUtil.generateUUID(),
                child: [
                    {
                        id: this.vizColumn.getId(),
                    /* eslint camelcase: 1*/
                        column_type: jsonConstants.clientExpressionColumnType.VIZ_COLUMN
                    },
                    {
                        id: jsUtil.generateUUID()
                    }
                ],
                operator: this.operator
            };

            var valueArray = Array.isArray(this.value) ? this.value : [this.value];
            jsonObjectMap.child[this.valueNodeIndex].value = valueArray.map(function(value){
                return {
                    string_val: value
                };
            });

            return jsonObjectMap;
        };

        SimpleFilterExpression.prototype.getJsonString = function () {
            var jsonObjectMap = this.getJsonObject();
            return JSON.stringify(jsonObjectMap);
        };

        return {
            SimpleFilterExpression: SimpleFilterExpression,
            filterOperators: filterOperators
        };
    }]);
