/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for filter expression
 */

'use strict';

describe('Filter expression spec', function () {
    var filterExpressionServiceInstance;

    function initSuite() {
        beforeEach(function () {
            module('blink.app');
            inject(function ($injector) {
                filterExpressionServiceInstance = $injector.get('filterExpressionService');
            });
        });
    }

    describe('simple filter expression tests', function () {
        initSuite();

        function verifySimpleFilterExpressionObject(expression, vizColumn, value, operator) {
            expect(expression.vizColumn).toBe(vizColumn);
            expect(expression.value).toBe(value);
            expect(expression.operator).toBe(operator);
        }

        it('verify constructor', function () {
            var simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression();
            verifySimpleFilterExpressionObject(simpleFilterExpression);

            simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression({});
            verifySimpleFilterExpressionObject(simpleFilterExpression);

            var vizColumn = {
                getId: function(){
                    return 'id1';
                }
            };
            simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(vizColumn);
            verifySimpleFilterExpressionObject(simpleFilterExpression);

            simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(vizColumn, 'value');
            verifySimpleFilterExpressionObject(simpleFilterExpression);

            simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(
                vizColumn,
                'value',
                filterExpressionServiceInstance.filterOperators.CONTAINS);

            verifySimpleFilterExpressionObject(
                simpleFilterExpression,
                vizColumn,
                'value',
                filterExpressionServiceInstance.filterOperators.CONTAINS);
        });

        it('verify operator in json object', function () {
            var vizColumn = {
                getId: function(){
                    return 'id1';
                }
            };

            var simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(
                vizColumn,
                'value',
                filterExpressionServiceInstance.filterOperators.CONTAINS);

            var jsonObject = simpleFilterExpression.getJsonObject();
            expect(jsonObject.operator).toBe('OP_CONTAINS');

            simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(
                vizColumn,
                'value',
                filterExpressionServiceInstance.filterOperators.IN);

            jsonObject = simpleFilterExpression.getJsonObject();
            expect(jsonObject.operator).toBe('OP_IN');

            simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(
                vizColumn,
                'value',
                filterExpressionServiceInstance.filterOperators.EQUALS);

            jsonObject = simpleFilterExpression.getJsonObject();
            expect(jsonObject.operator).toBe('OP_EQUALS');
        });

        it('verify value in json object', function () {
            var vizColumn = {
                getId: function(){
                    return 'id1';
                }
            };

            var simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(
                vizColumn,
                'value',
                filterExpressionServiceInstance.filterOperators.CONTAINS);

            var jsonObject = simpleFilterExpression.getJsonObject();
            expect(jsonObject.child[simpleFilterExpression.valueNodeIndex].value.length).toBe(1);
            /* eslint camelcase: 1*/
            expect(jsonObject.child[simpleFilterExpression.valueNodeIndex].value[0].string_val).toBe('value');
        });

        it('verify values in json object', function () {
            var vizColumn = {
                getId: function(){
                    return 'id1';
                }
            };

            var simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(
                vizColumn,
                ['value1', 'value2'],
                filterExpressionServiceInstance.filterOperators.CONTAINS);

            var jsonObject = simpleFilterExpression.getJsonObject();
            expect(jsonObject.child[simpleFilterExpression.valueNodeIndex].value.length).toBe(2);
            /* eslint camelcase: 1*/
            expect(jsonObject.child[simpleFilterExpression.valueNodeIndex].value[0].string_val).toBe('value1');
            expect(jsonObject.child[simpleFilterExpression.valueNodeIndex].value[1].string_val).toBe('value2');
        });

        it('verify column id and type in json object', function () {
            var vizColumn = {
                getId: function(){
                    return 'id1';
                }
            };

            var simpleFilterExpression = new filterExpressionServiceInstance.SimpleFilterExpression(
                vizColumn,
                ['value1', 'value2'],
                filterExpressionServiceInstance.filterOperators.CONTAINS);

            var jsonObject = simpleFilterExpression.getJsonObject();
            expect(jsonObject.child[simpleFilterExpression.columnInfoNodeIndex].id).toBe('id1');
            /* eslint camelcase: 1*/
            expect(jsonObject.child[simpleFilterExpression.columnInfoNodeIndex].column_type).toBe('VIZ_COLUMN');
        });
    });
});

