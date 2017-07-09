/**
 * Created by Xuan Zhang (shawn@thoughtspot.com), Shitong Shou
 * Created @ Mar 09, 2015
 * this file, together with keywords-[3,4,5]-scenarios.js, covers keyword tests using the TPCH tables
 * the test cases are listed in keyword_test_cases.js
 * each test case consists of a query and its expected result (table and headline values)
 * this test suite only covers keywords in table based queries. worksheet based queries are tested in a
 * separated test suite keywords-ws-[1,2,3,4]-scenarios.js
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Keyword Tests --', function() {
    var DATASET = [DATASET_1969_2040, DATASET_TPCH],
        kwChoice = 1,
        kwSticker = DATASET[kwChoice].sticker,
        kwTests = DATASET[kwChoice].tests,
        start = 0,
        interval = 30,
        end = start + interval > kwTests.length ? kwTests.length : start + interval;

    function test_keywords(index) {
        var kwQuery = kwTests[index].query,
            kwResults = kwTests[index].results,
            kwCount = kwTests[index].count;

        describe('keyword tests using ' + kwSticker + ' -- ' + kwCount, function() {
            beforeEach(function() {
                goToAnswer();
                deselectAllSources();
                selectSageSources(TPCH_TABLES);
            });

            it('should search query: ' + kwQuery, function() {
                sageInputElement().enter(kwQuery);
                waitForTableAnswerVisualizationMode();
                waitForHeadline();
                checkTableViewResults(kwResults);
            });
        });
    }

    for (var i = start; i < end; i++) {
        test_keywords(i);
    }
});
