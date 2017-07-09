/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Misc utility functions for expressions
 */

'use strict';

blink.app.factory('expressionUtil', ['Logger', 'formulaExamplesData',
    function (Logger, formulaExamplesData) {

        var me = {},
            logger = Logger.create('expression-util');

        me.CssClasses = {
            CONTENT_EDITOR: 'content-editor',
            TOKEN: 'token',
            WHITESPACE: 'whitespace',
            EMPTY_WHITESPACE: 'empty-whitespace',
            EMPTY: 'empty',
            LINE_BREAK: 'line-break',
            UNRECOGNIZED_TOKEN: 'unrecognized-token',
            RECOGNIZED_TOKEN: 'recognized-token',
            GHOST_SEPARATOR: 'ghost-separator',
            GHOST: 'ghost',
            ATTRIBUTE_TOKEN: 'attribute',
            MEASURE_TOKEN: 'measure',
            CONTEXT_MENU: 'expression-editor-context-menu',
            EXPRESSION_EDITOR: 'bk-expression-editor',
            FUNCTION_NAME: 'function-name',
            OPERATOR: 'operator',
            FUNCTION_PARAMETER_PLACEHOLDER: 'function-parameter-placeholder',
            TOKEN_ERROR: 'token-error',
            TOKEN_WARNING: 'token-warning'
        };

        me.getTokenDisplayCSSClass = function (token) {
            if (!token.isUnrecognized()) {
                if (token.isAttributeToken()) {
                    return me.CssClasses.ATTRIBUTE_TOKEN;
                } else if (token.isMeasureToken()) {
                    return me.CssClasses.MEASURE_TOKEN;
                } else if (token.isFunctionToken() || token.isDelimiterToken()) {
                    return me.CssClasses.FUNCTION_NAME;
                } else if (token.isOperatorToken()) {
                    return me.CssClasses.OPERATOR;
                }
            }
            return '';
        };

        me.getHelpDataForFunction = function (functionName) {
            functionName = functionName.toLowerCase();
            for (var i=0; i<formulaExamplesData.children.length; i++) {
                var exampleSection = formulaExamplesData.children[i];
                for (var j=0; j<exampleSection.children.length; j++) {
                    var example = exampleSection.children[j];
                    if (example.type === 'function' && example.value.toLowerCase() === functionName) {
                        var data = {};
                        example.children.each(function(item){
                            data[item.type] = item.value;
                        });
                        return data;
                    }
                }
            }
            logger.warn('no help data found for function', functionName);
            return null;
        };

        return me;
    }]);
