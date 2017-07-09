/**
 * Copyright: ThoughtSpot Inc. 2102-2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview  JSON for formula examples
 *
 */

'use strict';

blink.app.factory('formulaExamplesData',[ 'Logger', function (Logger) {
    var logger = Logger.create('formula-examples-data');

    var sortTree = (function () {
        var leafTypeIndices = {
            helpText: 0,
            fixedExample: 1,
            queryExample: 2
        };
        return function (root) {
            if (! root.children) {
                return;
            }
            root.children.each(function (child) {
                sortTree(child);
            });
            root.children.sort(function (childA, childB) {
                var leafTypeIndexA = leafTypeIndices[childA.type],
                    leafTypeIndexB = leafTypeIndices[childB.type];
                if (leafTypeIndexA != void 0 && leafTypeIndexB != void 0) {
                    return leafTypeIndexA - leafTypeIndexB;
                }
                if (leafTypeIndexA == void 0 && leafTypeIndexB == void 0) {
                    return childA.value > childB.value ? 1: -1;
                }
                logger.warn('one of the leaf types is not an expected value', childA, childB);
                return 0;
            });
        }
    })();

    var data = {
        children:[ {
            value: 'Operators',
            children:[ {
                value: 'and',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns true when both conditions are true, otherwise returns false.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: '('
                    }, {
                        value: '1'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '1'
                    }, {
                        value: ')',
                        spaceAfter: true
                    }, {
                        value: 'and',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: '3'
                    }, {
                        value: '>',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: 'true'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'lastname',
                        type: 'attribute'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '\'smith\'',
                        type: 'literal',
                        spaceAfter: true
                    }, {
                        value: 'and',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: 'state',
                        type: 'attribute'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '\'texas\'',
                        type: 'literal'
                    }]
                }]
            }, {
                value: 'or',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns true when either condition is true, otherwise returns false.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: '('
                    }, {
                        value: '1'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '5'
                    }, {
                        value: ')',
                        spaceAfter: true
                    }, {
                        value: 'or',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: '3'
                    }, {
                        value: '>',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: 'true'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'state',
                        type: 'attribute'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '\'california\'',
                        type: 'literal',
                        spaceAfter: true
                    }, {
                        value: 'or',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: 'state',
                        type: 'attribute'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '\'oregon\'',
                        type: 'literal'
                    }]
                }]
            }, {
                value: 'not',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns true if the condition is false, otherwise returns false.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'not',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: '3'
                    }, {
                        value: '>',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: 'false'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'not',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: 'state',
                        type: 'attribute'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '\'texas\'',
                        type: 'literal'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'if',
                displayValue: 'if...then...else',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Conditional operator.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'if',
                        type: 'function',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: '3'
                    }, {
                        value: '>',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: ')',
                        spaceAfter: true
                    }, {
                        value: 'then',
                        type: 'function',
                        spaceAfter: true
                    }, {
                        value: '\'bigger\'',
                        type: 'literal',
                        spaceAfter: true
                    }, {
                        value: 'else',
                        type: 'function',
                        spaceAfter: true
                    }, {
                        value: '\'not bigger\'',
                        type: 'literal'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'if',
                        type: 'function',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: 'cost',
                        type: 'measure'
                    }, {
                        value: '>',
                        type: 'operator'
                    }, {
                        value: '500'
                    }, {
                        value: ')',
                        spaceAfter: true
                    }, {
                        value: 'then',
                        type: 'function',
                        spaceAfter: true
                    }, {
                        value: '\'flag\'',
                        type: 'literal',
                        spaceAfter: true
                    }, {
                        value: 'else',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '\'approve\'',
                        type: 'literal'
                    }]
                }]
            }, {
                value: 'ifnull',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the first value if it is not null, otherwise returns the second.'
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'ifnull',
                        type: 'function',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: 'supplier',
                        type: 'attribute'
                    }, {
                        value: ','
                    }, {
                        value: '\'unknown\'',
                        type: 'literal'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'isnull',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns true if the value is null.'
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'isnull',
                        type: 'function',
                        spaceAfter: true
                    }, {
                        value: '('
                    }, {
                        value: 'phone',
                        type: 'attribute'
                    }, {
                        value: ')'
                    }]
                }]
            }]
        }, {
            value: 'Number',
            children:[ {
                value: '+',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the result of adding both numbers.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: '1'
                    }, {
                        value: '+',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '3'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'price',
                        type: 'measure'
                    }, {
                        value: '+',
                        type: 'operator'
                    }, {
                        value: 'shipping',
                        type: 'measure'
                    }]
                }]
            }, {
                value: '-',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the result of subtracting the second number from the first.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: '3'
                    }, {
                        value: '-',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '1'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'revenue',
                        type: 'measure'
                    }, {
                        value: '-',
                        type: 'operator'
                    }, {
                        value: 'tax',
                        type: 'measure'
                    }]
                }]
            }, {
                value: '*',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the result of multiplying both numbers.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: '3'
                    }, {
                        value: '*',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '6'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'price',
                        type: 'measure'
                    }, {
                        value: '*',
                        type: 'operator'
                    }, {
                        value: 'taxrate',
                        type: 'measure'
                    }]
                }]
            }, {
                value: '/',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the result of dividing the first number by the second. If the second number is 0, returns NaN (not a number).'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: '6'
                    }, {
                        value: '/',
                        type: 'operator'
                    }, {
                        value: '3'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '2'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'markup',
                        type: 'measure'
                    }, {
                        value: '/',
                        type: 'operator'
                    }, {
                        value: 'retail price',
                        type: 'measure'
                    }]
                }]
            }, {
                value: 'safe_divide',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the result of dividing the first number by the second. If the second number is 0, returns 0 ​instead of NaN (not a number).'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'safe_divide',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '(',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '12',
                        type: 'constant'
                    }, {
                        value: ',',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '0',
                        type: 'constant',
                        spaceAfter: true
                    }, {
                        value: ')',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '=',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '0',
                        type: 'constant'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'safe_divide',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: '(',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: 'total_cost',
                        type: 'measure'
                    }, {
                        value: ',',
                        type: 'operator',
                        spaceAfter: true
                    }, {
                        value: 'units',
                        type: 'measure',
                        spaceAfter: true
                    }, {
                        value: ')',
                        type: 'operator',
                        spaceAfter: true
                    }]
                }]
            }, {
                value: '^',
                type: 'operator',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the first number raised to the power of the second.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: '3'
                    }, {
                        value: '^',
                        type: 'operator'
                    }, {
                        value: '2'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '9'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'width',
                        type: 'measure'
                    }, {
                        value: '^',
                        type: 'operator'
                    }, {
                        value: '2'
                    }]
                }]
            }, {
                value: 'sq',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the square of a numeric value.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'sq',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '9'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '81'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'sq',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'width',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'sqrt',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the square root.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'sqrt',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '9'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '3'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'sqrt',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'area',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'cube',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the cube of a number.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'cube',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '3'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '27'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'cube',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'length',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'cbrt',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the cube root of a number.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'cbrt',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '27'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '3'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'cbrt',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'volume',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'abs',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the absolute value.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'abs',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '-10'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '10'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'abs',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'profit',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'ln',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the natural logarithm.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'ln',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '7.38905609893'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '2'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'ln',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'distance',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'log10',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the logarithm with base 10.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'log10',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '100'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '2'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'log10',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'volume',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'log2',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the logarithm with base 2, or binary logarithm.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'log2',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '32'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '5'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'log2',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'volume',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'exp',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns Euler\'s number (~2.718) raised to a power.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'exp',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '2'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '7.38905609893'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'exp',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'growth',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'exp2',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns 2 raised to a power.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'exp2',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '3'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '8'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'exp2',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'growth',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'greatest',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the larger of the values.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'greatest',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '20'
                    }, {
                        value: ','
                    }, {
                        value: '10'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '20'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'greatest',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'q1 revenue',
                        type: 'attribute'
                    }, {
                        value: ','
                    }, {
                        value: 'q2 revenue',
                        type: 'attribute'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'least',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the smaller of the values.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'least',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '20'
                    }, {
                        value: ','
                    }, {
                        value: '10'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '10'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'least',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'q1 revenue',
                        type: 'attribute'
                    }, {
                        value: ','
                    }, {
                        value: 'q2 revenue',
                        type: 'attribute'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'mod',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the remainder of first number divided by the second number.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'mod',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '8'
                    }, {
                        value: ','
                    }, {
                        value: '3'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '2'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'mod',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'revenue',
                        type: 'measure'
                    }, {
                        value: ','
                    }, {
                        value: 'quantity',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'pow',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the first number raised to the power of the second number.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'pow',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '5'
                    }, {
                        value: ','
                    }, {
                        value: '2'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '25'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'pow',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'width',
                        type: 'measure'
                    }, {
                        value: ','
                    }, {
                        value: '2'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'ceil',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the smallest following integer.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'ceil',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '5.9'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '6'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'ceil',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'growth rate',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'floor',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the largest previous integer.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'floor',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '5.1'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '5'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'floor',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'growth rate',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'sign',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns +1 if the number is greater than zero, -1 if less than zero, 0 if zero.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'sign',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '-250'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '-1'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'sign',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'growth rate',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'sin',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the sine of an angle (specified in degrees).'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'sin',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '35'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '0.57'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'sin',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'beam angle',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'cos',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the cosine of an angle (specified in degrees).'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'cos',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '63'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '0.45'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'cos',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'beam angle',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'tan',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the tangent of an angle (specified in degrees).'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'tan',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '35'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '0.7'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'tan',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'beam angle',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'asin',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the inverse sine in degrees.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'asin',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '0.5'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '30'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'asin',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'sin-satellite-angle',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'acos',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the inverse cosine in degrees.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'acos',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '0.5'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '60'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'acos',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'cos-satellite-angle',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'atan',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the inverse tangent in degrees.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'atan',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '1'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '45'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'atan',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'tan-satellite-angle',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'atan2',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the inverse tangent in degrees.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'atan2',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '10'
                    }, {
                        value: ','
                    }, {
                        value: '10'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '45'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'atan2',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'longitude',
                        type: 'measure'
                    }, {
                        value: ','
                    }, {
                        value: 'latitude',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'random',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns a random number between 0 and 1.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'random',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '.457718'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'random',
                        type: 'function-name'
                    }, {
                        value: '(',
                        spaceAfter: true
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'round',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Returns the first number rounded to the precision of the second number (1 by default).'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'round',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '45.67,',
                        spaceAfter: true
                    }, {
                        value: '10'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '50'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'round',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'clicks',
                        type: 'measure'
                    }, {
                        value: ',',
                        spaceAfter: true
                    }, {
                        value: '100'
                    }, {
                        value: ')'
                    }]
                }]
            }, {
                value: 'spherical_distance',
                type: 'function',
                children:[ {
                    type: 'helpText',
                    value: 'Used to calculate distance between two points on Earth, taking the Earth\'s spherical shape into account. Accepts two coordinates in the format spherical_distance (latitude_1, longitude_1, latitude_2, longitude_2). Returns the distance in meters between the two points.'
                }, {
                    type: 'fixedExample',
                    value:[ {
                        value: 'spherical_distance',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: '37.4210483'
                    }, {
                        value: ','
                    }, {
                        value: '-122.1444313'
                    }, {
                        value: ','
                    }, {
                        value: '36.0930727'
                    }, {
                        value: ','
                    }, {
                        value: '-115.1797873'
                    }, {
                        value: ')'
                    }, {
                        value: '=',
                        type: 'operator'
                    }, {
                        value: '637600'
                    }]
                }, {
                    type: 'queryExample',
                    value:[ {
                        value: 'spherical_distance',
                        type: 'function-name'
                    }, {
                        value: '('
                    }, {
                        value: 'start latitude',
                        type: 'measure'
                    }, {
                        value: ','
                    }, {
                        value: 'start longitude',
                        type: 'measure'
                    }, {
                        value: ','
                    }, {
                        value: 'end latitude',
                        type: 'measure'
                    }, {
                        value: ','
                    }, {
                        value: 'end longitude',
                        type: 'measure'
                    }, {
                        value: ')'
                    }]
                }]
            }]
        },
            {
                value: 'Date',
                children:[ {
                    value: 'day',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the number (1-31) of the day from a given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'day',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/15/2014',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '15'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'day',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'date ordered',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'month',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the month from a given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'month',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/15/2014',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'January'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'month',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'date ordered',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'year',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the year from a given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'year',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/15/2014',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '2014'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'year',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'date ordered',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'date',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the date portion of a given date.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'date',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'home visit',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'time',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the time portion of a given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'time',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '3/1/2002 10:32',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '10:32'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'time',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'call began',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'now',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the current timestamp.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'now',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'diff_days',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Subtracts the second date from the first date and returns the result in number of days, rounded down if not exact.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'diff_days',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/15/2014',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '01/17/2014',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '-2'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'diff_days',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'purchased',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'shipped',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'diff_time',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Subtracts the second date from the first date and returns the result in number of seconds.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'diff_time',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/01/2014',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '01/02/2014',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '-86,400'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'diff_time',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'clicked',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'submitted',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'add_days',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the result of adding the specified number of days to the given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'add_days',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/30/2015',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '5',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '02/04/2015'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'add_days',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'invoiced',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: '30'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'day_number_of_week',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the number (1-7) of the day in a week from the given date with 1 being Monday and 7 being Sunday.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'day_number_of_week',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/30/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '6'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'day_number_of_week',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'shipped',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'day_number_of_year',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the number (1-366) of the day in a year from a given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'day_number_of_year',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/30/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '30'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'day_number_of_year',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'invoiced',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'month_number',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the number (1-12) of the month from a given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'month_number',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '09/20/2014',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '9'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'month_number',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'purchased',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'hour_of_day',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the hour of the day for a given date.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'hour_of_day',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'received',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'day_of_week',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the day of the week for the given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'day_of_week',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/30/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'Friday'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'day_of_week',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'serviced',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'start_of_year',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the date for the first day of the year for the given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'start_of_year',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '02/15/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'FY 2015'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'start_of_year',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'joined',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'start_of_quarter',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the date for the first day of the quarter for the given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'start_of_quarter',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '09/18/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'Q3 FY 2015'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'start_of_quarter',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'sold',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'start_of_month',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the date for the first day of the month for the given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'start_of_month',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/31/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'Jan FY 2015'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'start_of_month',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'shipped',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'start_of_week',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the date for the first day of the week for the given date.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'start_of_week',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '06/01/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '05/30/2015 Week'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'start_of_week',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'emailed',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'is_weekend',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the given date falls on a Saturday or Sunday.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'is_weekend',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '01/31/2015',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'is_weekend',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'emailed',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }]
            }, {
                value: 'Text',
                children:[ {
                    value: 'contains',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the first string contains the second string, otherwise returns false.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'contains',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'broomstick\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'room\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'contains',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'product',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: '\'trial version\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'concat',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the two values as a concatenated text string.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'concat',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'hay\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'stack\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '\'haystack\''
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'concat',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'last_name',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'first_name',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'edit_distance',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Accepts two text strings. Returns the edit distance (minimum number of operations required to transform one string into the other) as an integer. Works with strings under 1023 characters.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'edit_distance',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'attorney\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'atty\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '4'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'edit_distance',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'color',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: '\'red\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'edit_distance_with_cap',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Accepts two text strings and an integer to specify the upper limit cap for the edit distance (minimum number of operations required to transform one string into the other). If the edit distance is less than or equal to the specified cap, returns the edit distance. If it is higher than the cap, returns the cap plus 1. Works with strings under 1023 characters.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'edit_distance_with_cap',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'pokemon go\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'minecraft pixelmon\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '3',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '4'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'edit_distance_with_cap',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'event',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: '\'burning man\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '3',
                            type: 'literal'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'spells_like',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Accepts two text strings. Returns true if they are spelled similarly and false if they are not. Works with strings under 1023 characters.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'spells_like',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'thouhgtspot\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'thoughtspot\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true',
                            type: 'literal'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'spells_like',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'studio',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'distributor',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'sounds_like',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Accepts two text strings. Returns true if they sound similar when spoken, and false if they do not.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'sounds_like',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'read\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'red\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true',
                            type: 'literal'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'sounds_like',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'owner',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'promoter',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'similarity',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Accepts a document text string and a search text string. Returns the relevance score (0-100) of the search string with respect to the document. Relevance is based on edit distance, number of words in the query, and length of words in the query which are present in the document. If the two strings are an exact match, returns 100.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'similarity',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'where is the burning man concert\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'burning man\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '46',
                            type: 'literal'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'similarity',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'tweet1',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'tweet2',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'similar_to',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Accepts a document text string and a search text string. Returns true if relevance score (0-100) of the search string with respect to the document is greater than or equal to 20. Relevance is based on edit distance, number of words in the query, and length of words in the query which are present in the document.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'similar_to',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'hello world\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'hello swirl\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true',
                            type: 'literal'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'similar_to',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'current team',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'drafted by',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'strlen',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the length of the text.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'strlen',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'smith\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '5'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'strlen',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'lastname',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'substr',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the portion of the given string, beginning at the location specified (starting from 0), and of the given length.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'substr',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'persnickety\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '3',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '7',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '\'snicket\''
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'substr',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'lastname',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: '0',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '5',
                            type: 'literal'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'strpos',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the numeric position (starting from 0) of the first occurrence of the second string in the first string, or -1 if not found.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: 'strpos',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: '\'haystack_with_needle\'',
                            type: 'literal'
                        }, {
                            value: ','
                        }, {
                            value: '\'needle\'',
                            type: 'literal'
                        }, {
                            value: ')'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: '14'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'strpos',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'complaint',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: '\'lawyer\''
                        }, {
                            value: ')'
                        }]
                    }]
                }]
            }, {
                value: 'Mixed',
                children:[ {
                    value: '=',
                    type: 'operator',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the first value is equal to the second value.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: '2',
                            spaceAfter: true
                        }, {
                            value: '=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '2'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'revenue',
                            type: 'measure',
                            spaceAfter: true
                        }, {
                            value: '=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '1000000'
                        }]
                    }]
                }, {
                    value: '>',
                    type: 'operator',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the first value is greater than the second value.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: '3',
                            spaceAfter: true
                        }, {
                            value: '>',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '2'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'revenue',
                            type: 'measure',
                            spaceAfter: true
                        }, {
                            value: '>',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '1000000'
                        }]
                    }]
                }, {
                    value: '<',
                    type: 'operator',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the first value is less than the second value.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: '3',
                            spaceAfter: true
                        }, {
                            value: '<',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '2'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'false'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'revenue',
                            type: 'measure',
                            spaceAfter: true
                        }, {
                            value: '<',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '1000000'
                        }]
                    }]
                }, {
                    value: '>=',
                    type: 'operator',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the first value is greater than or equal to the second value.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: '3',
                            spaceAfter: true
                        }, {
                            value: '>=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '2'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'revenue',
                            type: 'measure',
                            spaceAfter: true
                        }, {
                            value: '>=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '1000000'
                        }]
                    }]
                }, {
                    value: '<=',
                    type: 'operator',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the first value is less than or equal to the second value.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: '1',
                            spaceAfter: true
                        }, {
                            value: '<=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '2'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'revenue',
                            type: 'measure',
                            spaceAfter: true
                        }, {
                            value: '<=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '1000000'
                        }]
                    }]
                }, {
                    value: '!=',
                    type: 'operator',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns true if the first value is not equal to the second value.'
                    }, {
                        type: 'fixedExample',
                        value:[ {
                            value: '3',
                            spaceAfter: true
                        }, {
                            value: '!=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '2'
                        }, {
                            value: '=',
                            type: 'operator'
                        }, {
                            value: 'true'
                        }]
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'revenue',
                            type: 'measure',
                            spaceAfter: true
                        }, {
                            value: '!=',
                            type: 'operator',
                            spaceAfter: true
                        }, {
                            value: '1000000'
                        }]
                    }]
                }]
            }, {
                value: 'Aggregate',
                children:[ {
                    value: 'sum',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the sum of all the values of a column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'sum',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'average',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the average of all the values of a column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'average',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'variance',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the variance of all the values of a column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'variance',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'stddev',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the standard deviation of all values of a column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'stddev',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'count',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the number of rows in the table containing the column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'count',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'product',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'unique count',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the number of unique values of a column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'unique count',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'customer',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'min',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the minimum value of a column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'min',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'max',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the maximum value of a column.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'max',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'sales',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_sum',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the sum of the measure grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_sum',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'customer region',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_average',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the average of the measure grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_average',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'region',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'state',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_variance',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the variance of the measure grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_variance',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'customer region',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_stddev',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the standard deviation of the measure grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_stddev',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'customer region',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_count',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a column name and one or more attributes. Returns the total count of values in a column, grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_count',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'product',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'supplier',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'state',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_unique_count',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a column name and one or more attributes. Returns the number of unique values in a column, grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_unique_count',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'product',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'supplier',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_min',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the minimum of the measure grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_min',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'customer region',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'group_max',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the maximum of the measure grouped by the attribute(s).'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'group_max',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'customer region',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'cumulative_sum',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the sum of the measure, accumulated by the attribute(s) in the order specified.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'cumulative_sum',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'order date',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'cumulative_average',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the average of the measure, accumulated by the attribute(s) in the order specified.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'cumulative_average',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'order date',
                            type: 'attribute'
                        }, {
                            value: ','
                        }, {
                            value: 'state',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'cumulative_min',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the minimum of the measure, accumulated by the attribute(s) in the order specified.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'cumulative_min',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'campaign',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'cumulative_max',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure and one or more attributes. Returns the maximum of the measure, accumulated by the attribute(s) in the order specified.'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'cumulative_max',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ','
                        }, {
                            value: 'state',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'moving_sum',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure, two integers to define the window to aggregate over, and one or more attributes. Returns the sum of the measure over the given window. The attributes are the ordering columns used to compute the moving sum. The window is (current - Num1...Current + Num2) with both end points being included in the window. For example, "1,1" will have a window size of 3. To see periods in the past, use a negative number for the second endpoint, as in the example "moving_sum(sales, 1, -1, date)".'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'moving_sum',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ', 1, 1,'
                        }, {
                            value: 'order date',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'moving_average',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure, two integers to define the window to aggregate over, and one or more attributes. Returns the average of the measure over the given window. The attributes are the ordering columns used to compute the moving average. The window is (current - Num1...Current + Num2) with both end points being included in the window. For example, "1,1" will have a window size of 3. To see periods in the past, use a negative number for the second endpoint, as in the example "moving_average(sales, 1, -1, date)".'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'moving_average',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'revenue',
                            type: 'measure'
                        }, {
                            value: ', 2, 1,'
                        }, {
                            value: 'customer region',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'moving_min',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure, two integers to define the window to aggregate over, and one or more attributes. Returns the minimum of the measure over the given window. The attributes are the ordering columns used to compute the moving minimum. The window is (current - Num1...Current + Num2) with both end points being included in the window. For example, "1,1" will have a window size of 3. To see periods in the past, use a negative number for the second endpoint, as in the example "moving_min(sales, 1, -1, date)".'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'moving_min',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'defects',
                            type: 'measure'
                        }, {
                            value: ', 3, 1,'
                        }, {
                            value: 'product',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }, {
                    value: 'moving_max',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Takes a measure, two integers to define the window to aggregate over, and one or more attributes. Returns the maximum of the measure over the given window. The attributes are the ordering columns used to compute the moving maximum. The window is (current - Num1...Current + Num2) with both end points being included in the window. For example, "1,1" will have a window size of 3. To see periods in the past, use a negative number for the second endpoint, as in the example "moving_max(sales, 1, -1, date)".'
                    }, {
                        type: 'queryExample',
                        value:[ {
                            value: 'moving_max',
                            type: 'function-name'
                        }, {
                            value: '('
                        }, {
                            value: 'complaints',
                            type: 'measure'
                        }, {
                            value: ', 1, 2,'
                        }, {
                            value: 'store name',
                            type: 'attribute'
                        }, {
                            value: ')'
                        }]
                    }]
                }]
            }, {
                value: 'Conversion',
                children:[ {
                    value: 'to_bool',
                    type: 'function',
                    children:[ {
                        type: 'helpText',
                        value: 'Returns the input as a boolean (true or false).'
                    },
                        {
                            type: 'fixedExample',
                            value:[ {
                                value: 'to_bool',
                                type: 'function-name'
                            },
                                {
                                    value: '('
                                },
                                {
                                    value: '0',
                                    type: 'literal'
                                },
                                {
                                    value: ')'
                                },
                                {
                                    value: '=',
                                    type: 'operator'
                                },
                                {
                                    value: 'false'
                                }]
                        },
                        {
                            type: 'queryExample',
                            value:[ {
                                value: 'to_bool',
                                type: 'function-name'
                            },
                                {
                                    value: '('
                                },
                                {
                                    value: 'married',
                                    type: 'attribute'
                                },
                                {
                                    value: ')'
                                }]
                        }]
                },
                    {
                        value: 'to_date',
                        type: 'function',
                        children:[ {
                            type: 'helpText',
                            value: 'Accepts an integer or text string, and a date format using strptime format. Returns the input as a date. Does not accept epoch formatted dates as input.'
                        },
                            {
                                type: 'queryExample',
                                value:[ {
                                    value: 'to_date',
                                    type: 'function-name',
                                    spaceAfter: true
                                },
                                    {
                                        value: '(',
                                        type: 'operator',
                                        spaceAfter: true
                                    },
                                    {
                                        value: 'date_sold',
                                        type: 'attribute',
                                        spaceAfter: true
                                    },
                                    {
                                        value: ',',
                                        type: 'operator',
                                        spaceAfter: true
                                    },
                                    {
                                        value: '\'%Y-%m-%d\''
                                    },
                                    {
                                        value: ')',
                                        type: 'operator',
                                        spaceAfter: true
                                    }]
                            }]
                    },
                    {
                        value: 'to_double',
                        type: 'function',
                        children:[ {
                            type: 'helpText',
                            value: 'Returns the input as a double.'
                        },
                            {
                                type: 'fixedExample',
                                value:[ {
                                    value: 'to_double',
                                    type: 'function-name',
                                    spaceAfter: true
                                },
                                    {
                                        value: '(\'3.14\')'
                                    },
                                    {
                                        value: '=',
                                        type: 'operator'
                                    },
                                    {
                                        value: '3.14'
                                    }]
                            },
                            {
                                type: 'queryExample',
                                value:[ {
                                    value: 'to_double',
                                    type: 'function-name',
                                    spaceAfter: true
                                },
                                    {
                                        value: '('
                                    },
                                    {
                                        value: 'revenue',
                                        type: 'measure',
                                        spaceAfter: true
                                    },
                                    {
                                        value: '*',
                                        type: 'operator',
                                        spaceAfter: true
                                    },
                                    {
                                        value: '.01'
                                    },
                                    {
                                        value: ')'
                                    }]
                            }]
                    },
                    {
                        value: 'to_integer',
                        type: 'function',
                        children:[ {
                            type: 'helpText',
                            value: 'Returns the input as an integer.'
                        },
                            {
                                type: 'fixedExample',
                                value:[ {
                                    value: 'to_integer',
                                    type: 'function-name'
                                },
                                    {
                                        value: '('
                                    },
                                    {
                                        value: '\'45\'',
                                        type: 'literal'
                                    },
                                    {
                                        value: ')'
                                    },
                                    {
                                        value: '+'
                                    },
                                    {
                                        value: '1',
                                        type: 'literal'
                                    },
                                    {
                                        value: '=',
                                        type: 'operator'
                                    },
                                    {
                                        value: '46'
                                    }]
                            },
                            {
                                type: 'queryExample',
                                value:[ {
                                    value: 'to_integer',
                                    type: 'function-name'
                                },
                                    {
                                        value: '('
                                    },
                                    {
                                        value: 'price',
                                        type: 'literal'
                                    },
                                    {
                                        value: '+',
                                        type: 'operator'
                                    },
                                    {
                                        value: 'tax',
                                        type: 'attribute'
                                    },
                                    {
                                        value: '-',
                                        type: 'function-name'
                                    },
                                    {
                                        value: 'cost',
                                        type: 'attribute'
                                    },
                                    {
                                        value: ')'
                                    }]
                            }]
                    },
                    {
                        value: 'to_string',
                        type: 'function',
                        children:[ {
                            type: 'helpText',
                            value: 'Returns the input as a text string. To convert a date or time, add a second parameter with the format to use in strptime. For example, to_string(12/01/2014, "%y-%m-%d") returns 14-12-01.'
                        },
                            {
                                type: 'fixedExample',
                                value:[ {
                                    value: 'to_string',
                                    type: 'function-name'
                                },
                                    {
                                        value: '('
                                    },
                                    {
                                        value: '45',
                                        type: 'literal'
                                    },
                                    {
                                        value: '+'
                                    },
                                    {
                                        value: '1',
                                        type: 'literal'
                                    },
                                    {
                                        value: ')'
                                    },
                                    {
                                        value: '=',
                                        type: 'operator'
                                    },
                                    {
                                        value: '\'46\''
                                    }]
                            },
                            {
                                type: 'queryExample',
                                value:[ {
                                    value: 'to_string',
                                    type: 'function-name'
                                },
                                    {
                                        value: '('
                                    },
                                    {
                                        value: 'revenue',
                                        type: 'attribute'
                                    },
                                    {
                                        value: '-',
                                        type: 'operator'
                                    },
                                    {
                                        value: 'cost',
                                        type: 'attribute'
                                    },
                                    {
                                        value: ')'
                                    }]
                            }]
                    }]
            }]
    };
    sortTree(data);
    return data;
}]);
