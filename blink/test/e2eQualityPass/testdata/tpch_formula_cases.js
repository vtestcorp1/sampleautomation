/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou (shitong@thoughtspot.com)
 *
 * @fileoverview tpch formula testcases
 */

// list all test cases here
var GROUP_AVERAGE = {
    repr: 'groupAverage',
    type: 'group',
    tests: [{ inputValue: "group_average(revenue, customer region)", expectedResult: '3,568,573.66,3,686,052.65,3,621,940.30,3,626,402.58,3,553,765.86' }]
};
var GROUP_COUNT = {
    repr: 'groupCount',
    type: 'group',
    tests: [{ inputValue: "group_count(revenue, customer region)", expectedResult: '949,975,1,032,950,1,094' }]
};
var GROUP_MAX = {
    repr: 'groupMax',
    type: 'group',
    tests: [{ inputValue: "group_max(revenue, customer region)", expectedResult: '10,024,850,10,304,950,9,432,482,9,884,750,9,986,004' }]
};
var GROUP_MIN = {
    repr: 'groupMin',
    type: 'group',
    tests: [{ inputValue: "group_min(revenue, customer region)", expectedResult: '107,609,92,453,103,885,96,712,94,284' }]
};
var GROUP_STDDEV = {
    repr: 'groupStddev',
    type: 'group',
    tests: [{ inputValue: "group_stddev(revenue, customer region)", expectedResult: '2,220,096.13,2,243,710.76,2,168,915.76,2,226,696.11,2,223,759.75' }]
};
var GROUP_SUM = {
    repr: 'groupSum',
    type: 'group',
    tests: [{ inputValue: "group_sum(revenue, customer region)", expectedResult: '3,386,576,402,3,593,901,337,3,737,842,392,3,445,082,451,3,887,819,853' }]
};
var GROUP_VARIANCE = {
    repr: 'groupVariance',
    type: 'group',
    tests: [{ inputValue: "group_variance(revenue, customer region)", expectedResult: '4,928,826,847,309.25,5,034,237,954,071.58,4,704,195,553,036.75,4,958,175,575,339.69,4,945,107,420,794.28' }]
};


/**/
var GROUP_QUERIES = {
    repr: 'GROUPBY_QUERIES',
    testcases: [GROUP_AVERAGE, GROUP_COUNT, GROUP_MAX, GROUP_MIN, GROUP_STDDEV, GROUP_SUM, GROUP_VARIANCE] // list the operators you want to test
};