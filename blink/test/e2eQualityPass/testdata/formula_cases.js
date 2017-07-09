/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jeff Tran, Shitong Shou
 *
 * @fileoverview enumerate all formula testcases
 * group aggregation formulas are listed in a separate file tpch_formula_cases.js
 * each formula has the following structure
 * FORMULA = {
 *   repr: 'formulaName',
 *   tests: [{input1, expectedResult1}, {input2, expectedResult2}, ...]
 * }
 */
Number.prototype.padLeft = function(base,chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0? new Array(len).join(chr || '0') + this : this;
};
var d = new Date,
    dformat = [ (d.getMonth()+1).padLeft(),
        d.getDate().padLeft(),
        d.getFullYear()].join('/');

// list all test cases here
var EQUAL_TO = { // Mixed
    repr: 'equalTo',
    tests: [{ inputValue: "3 = 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "-3 = 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "3 = -3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "-3 = -3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 = 0", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "0 = 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "3 = 2", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "cities = 'san jose'", expectedResult: ['false', 'false', 'true'] },
        { inputValue: "date1 = 01/02/2010", expectedResult: ['true', 'false', 'false'] },
        { inputValue: "integer1 = integer2", expectedResult: ['false', 'false', 'false'] }]
};
var GREATER_THAN = {
    repr: 'greaterThan',
    tests: [{ inputValue: "3 > 2", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 > 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "-3 > 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "3 > -3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "-3 > -3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "0 > 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "3 > 0", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "0 > 0", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "integer3 > 5", expectedResult: ['true', 'true', 'false'] },
        { inputValue: "integer1 > integer2", expectedResult: ['true', 'false', 'false'] }]
};
var SMALLER_THAN = {
    repr: 'smallerThan',
    tests: [{ inputValue: "2 < 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 < 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "-3 < 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 < -3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "-3 < -3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "0 < 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 < 0", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "0 < 0", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "integer1 < 10", expectedResult: ['true', 'false', 'true'] },
        { inputValue: "integer1 < integer2", expectedResult: ['false', 'true', 'true'] }]
};
var GREATER_THAN_OR_EQUAL_TO = {
    repr: 'greaterThanOrEqualTo',
    tests: [{ inputValue: "3 >= 1", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 >= 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "-3 >= 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "3 >= -3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "0 >= 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "3 >= 0", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "0 >= 0", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "1 >= 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "integer1 >= 5", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "integer1 >= integer2", expectedResult: ['true', 'false', 'false'] }]
};
var SMALLER_THAN_OR_EQUAL_TO = {
    repr: 'smallerThanOrEqualTo',
    tests: [{ inputValue: "1 <= 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 <= 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "-3 <= 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 <= -3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "-3 <= -3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 <= 0", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "0 <= 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "0 <= 0", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 <= 1", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "integer1 <= 10", expectedResult: ['true', 'false', 'true'] },
        { inputValue: "integer1 <= integer2", expectedResult: ['false', 'true', 'true'] }]
};
var NOT_EQUAL_TO = {
    repr: 'notEqualTo',
    tests: [{ inputValue: "3 != 1", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 != 3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "-3 != 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 != -3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "-3 != -3", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "0 != 3", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "3 != 0", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "0 != 0", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "integer1 != 9", expectedResult: ['false', 'true', 'false'] },
        { inputValue: "cities != 'san jose'", expectedResult: ['true', 'true', 'false'] },
        { inputValue: "date1 != 01/01/2014", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "integer1 != integer2", expectedResult: ['true', 'true', 'true'] }]
};
var LEAST = {
    repr: 'least',
    tests: [{ inputValue: "least( 10, 20)", expectedResult: ['10', '10', '10'] },
        { inputValue: "least( 10, 10)", expectedResult: ['10', '10', '10'] },
        { inputValue: "least( -10, 10)", expectedResult: ['-10', '-10', '-10'] },
        { inputValue: "least( 10, -10)", expectedResult: ['-10', '-10', '-10'] },
        { inputValue: "least( -10, -10)", expectedResult: ['-10', '-10', '-10'] },
        { inputValue: "least( 0, 10)", expectedResult: ['0', '0', '0'] },
        { inputValue: "least( 10, 0)", expectedResult: ['0', '0', '0'] },
        { inputValue: "least( 0, 0)", expectedResult: ['0', '0', '0'] },
        { inputValue: "least( integer1, integer2)", expectedResult: ['6', '20', '9'] },
        { inputValue: "least( integer1, 10)", expectedResult: ['9', '10', '9'] }]
};
var GREATEST = {
    repr: 'greatest',
    tests: [{ inputValue: "greatest( 10, 20)", expectedResult: ['20', '20', '20'] },
        { inputValue: "greatest( 10, 10)", expectedResult: ['10', '10', '10'] },
        { inputValue: "greatest( -10, 10)", expectedResult: ['10', '10', '10'] },
        { inputValue: "greatest( 10, -10)", expectedResult: ['10', '10', '10'] },
        { inputValue: "greatest( -10, -10)", expectedResult: ['-10', '-10', '-10'] },
        { inputValue: "greatest( 0, 10)", expectedResult: ['10', '10', '10'] },
        { inputValue: "greatest( 10, 0)", expectedResult: ['10', '10', '10'] },
        { inputValue: "greatest( 0, 0)", expectedResult: ['0', '0', '0'] },
        { inputValue: "greatest( integer1, integer2)", expectedResult: ['9', '24', '19'] },
        { inputValue: "greatest( integer1, 10)", expectedResult: ['10', '20', '10'] }]
};
var COUNT = {
    repr: 'count',
    type: 'aggregation',
    tests: [{ inputValue: "count( cities)", expectedResult: '19' },
        { inputValue: "count( integer1)", expectedResult: '19' },
        { inputValue: "count( date1)", expectedResult: '19' }]
};
var UNIQUE_COUNT = {
    repr: 'uniqueCount',
    type: 'aggregation',
    tests: [{ inputValue: "unique count( cities)", expectedResult: '19' },
        { inputValue: "unique count( integer1)", expectedResult: '15' },
        { inputValue: "unique count( date1)", expectedResult: '19' }]
};
var MIN = {
    repr: 'min',
    type: 'aggregation',
    tests: [{ inputValue: "min( integer1)", expectedResult: '1' }]
};
var MAX = {
    repr: 'max',
    type: 'aggregation',
    tests: [{ inputValue: "max( integer2)", expectedResult: '24' }]
};

var AND = { // Operator
    repr: 'and',
    // list all test cases you want to run
    tests: [{ inputValue: "true and true", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "false and true", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "true and false", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "false and false", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "(5 = 5) and (5> 3)", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "cities = 'san jose' and integer1 = 9", expectedResult: ['false', 'false', 'true'] },
        { inputValue: "date1 = 01/02/2011 and null = '1'", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "(0 = 1) and (5 > 10)", expectedResult: ['false', 'false', 'false'] }]};
var OR = {
    repr: 'or',
    tests: [{ inputValue: "true or true", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "true or false", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "false or true", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "false or false", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "(5 = 5) or (5 > 3)", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "cities = 'san jose' or integer1 = 20", expectedResult: ['false', 'true', 'true'] },
        { inputValue: "date1 = 01/02/2011 or null = 'a'", expectedResult: ['false', '{Blank}', 'true'] },
        { inputValue: "(0 = 1) or (5 > 10)", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "(0 = 1) or (5 < 10)", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "(0 != 1) or (5 > 10)", expectedResult: ['true', 'true', 'true'] }]};
var NOT = {
    repr: 'not',
    tests: [{ inputValue: "not( 5 = 5)", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "not( true)", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "not( false)", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "not( cities = 'san francisco')", expectedResult: ['false', 'true', 'true'] }]
};
var IF_THEN_ELSE = {
    repr: 'if..then..else',
    tests: [{ inputValue: "if( 3 > 2) then 'bigger' else 'not bigger'", expectedResult: ['bigger','bigger','bigger'] },
        { inputValue: "if( true) then 'a' else 'b'", expectedResult: ['a','a','a'] },
        { inputValue: "if( false) then 'a' else 'b'", expectedResult: ['b','b','b'] },
        { inputValue: "if( cities = 'san jose') then 'large' else 'small'", expectedResult: ['small', 'small', 'large'] },
        { inputValue: "if( integer1 > 10) then integer2 else integer3", expectedResult: ['16','24','0'] }]
};
var IFNULL = {
    repr: 'ifnull',
    tests: [{ inputValue: "ifnull( null, 'unknown')", expectedResult: ['1', 'unknown', 'a'] },
        { inputValue: "ifnull( date1, 01/01/1992)", expectedResult: ['01/02/2010','02/03/2010','03/07/2010'] },
        { inputValue: "ifnull( integer1 , 0)", expectedResult: ['9', '20', '9'] }]
};
var ISNULL = {
    repr: 'isnull',
    tests: [{ inputValue: "isnull( null)", expectedResult: ['false', 'true', 'false'] },
        { inputValue: "isnull( date1)", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "isnull( integer1)", expectedResult: ['false', 'false', 'false'] }]
};

var ADDITION = { // Number
    repr: 'addition',
    tests: [{ inputValue: "2 + 2", expectedResult: ['4','4','4'] },
        { inputValue: "2 + (-2)", expectedResult: ['0','0','0'] },
        { inputValue: "(-2) + (-2)", expectedResult: ['-4','-4','-4'] },
        { inputValue: "0 + 2", expectedResult: ['2','2','2'] },
        { inputValue: "10 + integer1", expectedResult: ['19','30','19'] },
        { inputValue: "integer1 + integer2", expectedResult: ['15','44','28'] }]
};
var SUBTRACTION = {
    repr: 'subtraction',
    tests: [{ inputValue: "3 - 2", expectedResult: ['1','1','1'] },
        { inputValue: "2 - (-2)", expectedResult: ['4','4','4'] },
        { inputValue: "(-2) - 2", expectedResult: ['-4','-4','-4'] },
        { inputValue: "(-2) - (-2)", expectedResult: ['0','0','0'] },
        { inputValue: "0 - 2", expectedResult: ['-2','-2','-2'] },
        { inputValue: "10 - integer1", expectedResult: ['1','-10','1'] },
        { inputValue: "integer1 - integer2", expectedResult: ['3','-4','-10'] }]
};
var MULTIPLICATION = {
    repr: 'multiplication',
    tests: [{ inputValue: "3 * 2", expectedResult: ['6','6','6'] },
        { inputValue: "2 * (-2)", expectedResult: ['-4','-4','-4'] },
        { inputValue: "(-2) * (-2)", expectedResult: ['4','4','4'] },
        { inputValue: "0 * 2", expectedResult: ['0','0','0'] },
        { inputValue: "0 * 0", expectedResult: ['0','0','0'] },
        { inputValue: "2 * integer1", expectedResult: ['18','40','18'] },
        { inputValue: "integer1 * integer2", expectedResult: ['54','480','171'] }]
};
var DIVISION = {
    repr: 'division',
    tests: [{ inputValue: "1 / 2", expectedResult: ['0.50','0.50','0.50'] },
        { inputValue: "2 / (-2)", expectedResult: ['-1.00','-1.00','-1.00'] },
        { inputValue: "(-2) / (-2)", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "0 / 2", expectedResult: ['0.00','0.00','0.00'] },
        { inputValue: "10 / integer1", expectedResult: ['1.11','0.50','1.11'] },
        { inputValue: "integer1 / integer2", expectedResult: ['1.50','0.83','0.47'] }]
};
var POWER_1 = {
    repr: 'power1',
    tests: [{ inputValue: "8 ^ 2", expectedResult: ['64.00','64.00','64.00'] },
        { inputValue: "2 ^ (-2)", expectedResult: ['0.25','0.25','0.25'] },
        { inputValue: "(-2) ^ 2", expectedResult: ['4.00','4.00','4.00'] },
        { inputValue: "(-2) ^ (-2)", expectedResult: ['0.25','0.25','0.25'] },
        { inputValue: "0 ^ 2", expectedResult: ['0.00','0.00','0.00'] },
        { inputValue: "2 ^ 0", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "0 ^ 0", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "integer1 ^ 2", expectedResult: ['81.00','400.00','81.00'] },
        { inputValue: "integer1 ^ integer2", expectedResult: ['531,441.00','16,777,216,000,000,000,000,000,000,000,000.00','1,350,851,717,672,990,000.00'] }]
};
var SQUARE = {
    repr: 'square',
    tests: [{ inputValue: "sq( 8)", expectedResult: ['64','64','64'] },
        { inputValue: "sq( -8)", expectedResult: ['64','64','64'] },
        { inputValue: "sq( 0)", expectedResult: ['0','0','0'] },
        { inputValue: "sq( integer1)", expectedResult: ['81','400','81'] },
        { inputValue: "sq( .5)", expectedResult: ['0.25','0.25','0.25'] }]
};
var SQUARE_ROOT = {
    repr: 'squareRoot',
    tests: [{ inputValue: "sqrt( 8)", expectedResult: ['2.83','2.83','2.83'] },
        { inputValue: "sqrt( 0)", expectedResult: ['0.00','0.00','0.00'] },
        { inputValue: "sqrt( integer1)", expectedResult: ['3.00','4.47','3.00'] },
        { inputValue: "sqrt( .5)", expectedResult: ['0.71','0.71','0.71'] },
        { inputValue: "sqrt( -.5)", expectedResult: ['NaN','NaN','NaN'] }]
};
var CUBE = {
    repr: 'cube',
    tests: [{ inputValue: "cube( 2)", expectedResult: ['8','8','8'] },
        { inputValue: "cube( -2)", expectedResult: ['-8','-8','-8'] },
        { inputValue: "cube ( 0)", expectedResult: ['0','0','0'] },
        { inputValue: "cube( integer1)", expectedResult: ['729','8,000','729'] },
        { inputValue: "cube( .5)", expectedResult: ['0.12','0.12','0.12'] },
        { inputValue: "cube( -.5)", expectedResult: ['-0.12','-0.12','-0.12'] }]
};
var CUBIC_ROOT = {
    repr: 'cubicRoot',
    tests: [{ inputValue: "cbrt( 8)", expectedResult: ['2.00','2.00','2.00'] },
        { inputValue: "cbrt( 0)", expectedResult: ['0.00','0.00','0.00'] },
        { inputValue: "cbrt( -8)", expectedResult: ['-2.00','-2.00','-2.00'] },
        { inputValue: "cbrt( integer1)", expectedResult: ['2.08','2.71','2.08'] },
        { inputValue: "cbrt( .5)", expectedResult: ['0.79','0.79','0.79'] },
        { inputValue: "cbrt( -.5)", expectedResult: ['-0.79','-0.79','-0.79'] }]
};
var ABSOLUTE = {
    repr: 'absolute',
    tests: [{ inputValue: "abs( 5)", expectedResult: ['5','5','5'] },
        { inputValue: "abs( -5)", expectedResult: ['5','5','5'] },
        { inputValue: "abs( 0)", expectedResult: ['0','0','0'] },
        { inputValue: "abs( integer3)", expectedResult: ['16','24','0'] },
        { inputValue: "abs( -.5)", expectedResult: ['0.50','0.50','0.50'] }]
};
var NATURAL_LOG = {
    repr: 'naturalLog',
    tests: [{ inputValue: "ln( 7.38905609893)", expectedResult: ['2.00','2.00','2.00'] },
        { inputValue: "ln( 0)", expectedResult: ['Infinity','Infinity','Infinity'] },
        { inputValue: "ln( 1)", expectedResult: ['0.00','0.00','0.00'] },
        { inputValue: "ln( integer1)", expectedResult: ['2.20','3.00','2.20'] },
        { inputValue: "ln( .5)", expectedResult: ['-0.69','-0.69','-0.69'] }]
};
var COMMON_LOG = {
    repr: 'commonLog',
    tests: [{ inputValue: "log10( 10)", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "log10( 0)", expectedResult: ['Infinity','Infinity','Infinity'] },
        { inputValue: "log10( 1)", expectedResult: ['0.00','0.00','0.00'] },
        { inputValue: "log10( integer1)", expectedResult: ['0.95','1.30','0.95'] },
        { inputValue: "log10( .5)", expectedResult: ['-0.30','-0.30','-0.30'] }]
};
var BINARY_LOG = {
    repr: 'binaryLog',
    tests: [{ inputValue: "log2( 2)", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "log2( 0)", expectedResult: ['Infinity','Infinity','Infinity'] },
        { inputValue: "log2( 1)", expectedResult: ['0.00','0.00','0.00'] },
        { inputValue: "log2( integer1)", expectedResult: ['3.17','4.32','3.17'] },
        { inputValue: "log2( .5)", expectedResult: ['-1.00','-1.00','-1.00'] }]
};
var NATURAL_EXP = {
    repr: 'naturalExp',
    tests: [{ inputValue: "exp( 2)", expectedResult: ['7.39','7.39','7.39'] },
        { inputValue: "exp( 0)", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "exp( -1)", expectedResult: ['0.37','0.37','0.37'] },
        { inputValue: "exp( 1/2)", expectedResult: ['1.65','1.65','1.65'] },
        { inputValue: "exp( integer1)", expectedResult: ['8,103.08','485,165,195.41','8,103.08'] }]
};
var BINARY_EXP = {
    repr: 'binaryExp',
    tests: [{ inputValue: "exp2( 2)", expectedResult: ['4.00','4.00','4.00'] },
        { inputValue: "exp2( 0)", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "exp2( -1)", expectedResult: ['0.50','0.50','0.50'] },
        { inputValue: "exp2( 1/2)", expectedResult: ['1.41','1.41','1.41'] },
        { inputValue: "exp2( integer1)", expectedResult: ['512.00','1,048,576.00','512.00'] }]
};
var MODULAR = {
    repr: 'mod',
    tests: [{ inputValue: "mod( 8, 3)", expectedResult: ['2','2','2'] },
        { inputValue: "mod( 10, -3)", expectedResult: ['1','1','1'] },
        { inputValue: "mod( -10, 3)", expectedResult: ['-1','-1','-1'] },
        { inputValue: "mod( -10, -3)", expectedResult: ['-1','-1','-1'] },
        { inputValue: "mod( 0, 3)", expectedResult: ['0','0','0'] },
        { inputValue: "mod( integer1, 2)", expectedResult: ['1','0','1'] },
        { inputValue: "mod( integer1, integer2)", expectedResult: ['3','20','9'] }]
};
var POWER_2 = {
    repr: 'power2',
    tests: [{ inputValue: "pow( 5, 2)", expectedResult: ['25.00','25.00','25.00'] },
        { inputValue: "pow( 5, 0)", expectedResult: ['1.00','1.00','1.00'] },
        { inputValue: "pow( integer1, 2)", expectedResult: ['81.00','400.00','81.00'] }]
};
var CEILING = {
    repr: 'ceil',
    tests: [{ inputValue: "ceil( integer4)", expectedResult: ['5','3','11'] },
        { inputValue: "ceil( integer1)", expectedResult: ['9','20','9'] },
        { inputValue: "ceil( 0)", expectedResult: ['0','0','0'] }]
};
var FLOOR = {
    repr: 'floor',
    tests: [{ inputValue: "floor( integer4)", expectedResult: ['4','2','10'] },
        { inputValue: "floor( integer1)", expectedResult: ['9','20','9'] },
        { inputValue: "floor( 0)", expectedResult: ['0','0','0'] }]
};
var SIGN = {
    repr: 'sign',
    tests: [{ inputValue: "sign( -5)", expectedResult: ['-1','-1','-1'] },
        { inputValue: "sign( 0)", expectedResult: ['0','0','0'] },
        { inputValue: "sign( 5)", expectedResult: ['1','1','1'] },
        { inputValue: "sign( integer1)", expectedResult: ['1','1','1'] },]
};
var SIN = {
    repr: 'sin',
    tests: [{ inputValue: "sin( trig)", expectedResult: ['0.00','1.00','0.87'] }]
};
var COS = {
    repr: 'cos',
    tests: [{ inputValue: "cos( trig)", expectedResult: ['-1.00','0.00','0.50'] }]
};
var TAN = {
    repr: 'tan',
    tests: [{ inputValue: "cos( trig)", expectedResult: ['-1.00','0.00','0.50'] }]
};
var ASIN = {
    repr: 'asin',
    tests: []
};
var ACOS = {
    repr: 'acos',
    tests: []
};
var ATAN = {
    repr: 'atan',
    tests: []
};
var ATAN_2 = {
    repr: 'atan2',
    tests: [{ inputValue: "atan2( 10, 10)", expectedResult: ['45.00','45.00','45.00'] },
        { inputValue: "atan2( integer1, integer2)", expectedResult: ['56.31','39.81','25.35'] }]
};
var RANDOM = {
    repr: 'random',
    tests: [{ inputValue: "floor(random())", expectedResult: ['0','0','0'] },
        { inputValue: "ceil(random())", expectedResult: ['1','1','1'] }]
};
var ROUND = {
    repr: 'round',
    tests: [{ inputValue: "round( 4.5)", expectedResult: ['5','5','5'] },
        { inputValue: "round( integer4)", expectedResult: ['4','2','10'] }]
};
var SPHERICAL_DISTANCE = {
    repr: 'sphericalDistance',
    tests: [{ inputValue: "spherical_distance( 37.465191 , -122.153617 , 37.421962 , -122.142174 )", expectedResult: ['4,911.86','4,911.86','4,911.86'] }]
};
var SUM = {
    repr: 'sum',
    type: 'aggregation',
    tests: [{ inputValue: "sum( integer1)", expectedResult: '224' }]
};
var AVERAGE = {
    repr: 'average',
    type: 'aggregation',
    tests: [{ inputValue: "average( integer1)", expectedResult: '11.79' }]
};
var VARIANCE = {
    repr: 'variance',
    type: 'aggregation',
    tests: [{ inputValue: "variance( integer1)", expectedResult: '50.48' }]
};
var STD_DEV = {
    repr: 'stddev',
    type: 'aggregation',
    tests: [{ inputValue: "stddev( integer1)", expectedResult: '7.11' }]
};

var DAY = { // Date
    repr: 'day',
    tests: [{ inputValue: "day( 01/15/2014)", expectedResult: ['15','15','15'] },
        { inputValue: "day( date1)", expectedResult: ['2','3','7'] }]
};
var MONTH = {
    repr: 'month',
    tests: [{ inputValue: "month( 01/15/2014)", expectedResult: ['january','january','january'] },
        { inputValue: "month( date1)", expectedResult: ['january','february','march'] },
        { inputValue: "month( datetime1)", expectedResult: ['january','january','january'] }]
};
var YEAR = {
    repr: 'year',
    tests: [{ inputValue: "year( 01/15/2014)", expectedResult: ['2014','2014','2014'] },
        { inputValue: "year( date1)", expectedResult: ['2010','2010','2010'] },
        { inputValue: "year( datetime1)", expectedResult: ['2012','2012','2012'] }]
};
var DATE = {
    repr: 'date',
    tests: [{inputValue: "date( 01/15/2014)", expectedResult: ['01/15/2014', '01/15/2014', '01/15/2014']},
        {inputValue: "date( date1)", expectedResult: ['01/02/2010', '02/03/2010', '03/07/2010']},
        {inputValue: "date( datetime1)", expectedResult: ['01/10/2012', '01/12/2012', '01/14/2012']}]
};
var NOW = {
    repr: 'now',
    tests: [{inputValue: "date(now())", expectedResult: [dformat, dformat, dformat]},]
};
var DIFF_DAYS = {
    repr: 'diffdays',
    tests: [{inputValue: "diff_days( 01/15/2014 , 01/17/2014)", expectedResult: ['-2', '-2', '-2']},
        {inputValue: "diff_days( date1, date2)", expectedResult: ['-1,526', '-1,556', '-1,586']}]
};
var ADD_DAYS = {
    repr: 'adddays',
    tests: [{ inputValue: "add_days( 01/30/2015 , 5 )", expectedResult: ['02/04/2015','02/04/2015','02/04/2015'] },
        { inputValue: "add_days( date1, 25)", expectedResult: ['01/27/2010','02/28/2010','04/01/2010'] }]
};
var DAY_NUMBER_OF_WEEK = {
    repr: 'dayNumberOfWeek',
    tests: [{ inputValue: "day_number_of_week( 01/30/2015 )", expectedResult: ['5','5','5'] },
        { inputValue: "day_number_of_week( date1)", expectedResult: ['6','3','7'] }]
};
var DAY_NUMBER_OF_YEAR = {
    repr: 'dayNumberOfYear',
    tests: [{ inputValue: "day_number_of_year( 01/30/2015)", expectedResult: ['30','30','30'] },
        { inputValue: "day_number_of_year( datetime1)", expectedResult: ['10','12','14'] }]
};
var HOUR_OF_DAY = {
    repr: 'hourOfDay',
    tests: [{ inputValue: "hour_of_day( datetime1)", expectedResult: ['1','1','1'] }]
};
var DAY_OF_WEEK = {
    repr: 'dayOfWeek',
    tests: [{ inputValue: "day_of_week( 01/30/2015)", expectedResult: ['friday','friday','friday'] },
        { inputValue: "day_of_week( date1)", expectedResult: ['saturday','wednesday','sunday'] }]
};
var IS_WEEKEND = {
    repr: 'isWeekend',
    tests: [{ inputValue: "is_weekend( 01/30/2014)", expectedResult: ['false', 'false', 'false'] },
        { inputValue: "is_weekend( date1)", expectedResult: ['true', 'false', 'true'] }]
};
var TIME = {
    repr: 'time',
    tests: [{ inputValue: "time(datetime2)", expectedResult: ['00:34:00', '00:34:00', '00:34:00'] },
        { inputValue: "time(datetime1)", expectedResult: ['01:23:00', '01:23:00', '01:23:00'] }]
};
var MONTH_NUMBER = {
    repr: 'monthNumber',
    tests: [{ inputValue: "month_number(date1)", expectedResult: ['1', '2', '3'] },
        { inputValue: "month_number(datetime2)", expectedResult: ['3', '3', '4'] }]
};

var CONTAINS = { // Text
    repr: 'contains',
    tests: [{ inputValue: "contains( 'broomstick', 'room')", expectedResult: ['true', 'true', 'true'] },
        { inputValue: "contains( cities, 'san')", expectedResult: ['true', 'false', 'true'] }]
};
var STRLEN = {
    repr: 'strlen',
    tests: [{ inputValue: "strlen( cities)", expectedResult: ['13','7','8'] }]
};
var SUBSTR = {
    repr: 'substr',
    tests: [{ inputValue: "substr( 'persnickety', 3, 7 )", expectedResult: ['snicket','snicket','snicket'] },
        { inputValue: "substr( cities, 3, 8)", expectedResult: [' francis','land',' jose'] }]
};
var STRPOS = {
    repr: 'strpos',
    tests: [{ inputValue: "strpos( 'haystack_with_needle' , 'needle' )", expectedResult: ['14','14','14'] },
        { inputValue: "strpos( cities, 'l')", expectedResult: ['-1','3','-1'] }]
};



/**/
var OPERATOR_ = {
    repr: 'OPERATOR',
    testcases: [AND, OR, NOT, IF_THEN_ELSE, IFNULL, ISNULL] // list the operators you want to test
};
var NUMBER_ = {
    repr: 'NUMBER',
    testcases: [ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, POWER_1, SQUARE, SQUARE_ROOT, CUBE, CUBIC_ROOT, ABSOLUTE, NATURAL_LOG, COMMON_LOG, BINARY_LOG, NATURAL_EXP, BINARY_EXP, MODULAR, POWER_2, CEILING, FLOOR, SIGN, SUM, AVERAGE, VARIANCE, STD_DEV, SIN, COS, TAN, ASIN, ACOS, ATAN, ATAN_2, RANDOM, ROUND, SPHERICAL_DISTANCE]
};
var MIXED_ = {
    repr: 'MIXED',
    testcases: [EQUAL_TO, GREATER_THAN, SMALLER_THAN, GREATER_THAN_OR_EQUAL_TO, SMALLER_THAN_OR_EQUAL_TO, NOT_EQUAL_TO, LEAST, GREATEST, COUNT, UNIQUE_COUNT, MIN, MAX]
};
var DATE_ = {
    repr: 'DATE',
    testcases: [DAY, MONTH, YEAR, DATE, NOW, DIFF_DAYS, ADD_DAYS, DAY_NUMBER_OF_WEEK, DAY_NUMBER_OF_YEAR, HOUR_OF_DAY, DAY_OF_WEEK, IS_WEEKEND, TIME, MONTH_NUMBER]
};
var TEXT_ = {
    repr: 'TEXT',
    testcases: [CONTAINS, STRLEN, SUBSTR, STRPOS]
};
