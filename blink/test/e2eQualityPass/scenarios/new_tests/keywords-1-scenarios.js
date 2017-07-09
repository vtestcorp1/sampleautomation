/**
 * Created by Xuan Zhang (shawn@thoughtspot.com), Shitong Shou
 * Created @ Mar 09, 2015
 * this file covers keyword tests for date, using DATASET_1969_2040 as the underlying table source
 * the test cases are listed in keywords_test_cases.js
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */



describe('Keyword Tests --', function() {
    var DATASET = [DATASET_1969_2040, DATASET_TPCH],
        kwChoice = 0,
        kwSticker = DATASET[kwChoice].sticker,
        kwTests = DATASET[kwChoice].tests,
        start = 0,
        interval = 50,
        end = start + interval > kwTests.length ? kwTests.length : start + interval;

    function test_keywords(index) {
        var kwQuery = kwTests[index].query,
            kwResults = kwTests[index].results,
            kwCount = kwTests[index].count;

        describe('keyword tests using ' + kwSticker + ' -- ' + kwCount, function() {
            beforeEach(function() {
                goToAnswer();
                deselectAllSources();
                selectSageSources(['1969_2040_date']);
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
