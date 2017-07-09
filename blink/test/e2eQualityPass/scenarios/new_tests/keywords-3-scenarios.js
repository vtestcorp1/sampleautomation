/**
 * Created by Xuan Zhang (shawn@thoughtspot.com)
 * Created @ Mar 09, 2015
 * Last Modified @ Jul 16, 2015
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */



describe('Keyword Tests --', function() {
    var DATASET = [DATASET_1969_2040, DATASET_TPCH],
        kwChoice = 1,
        kwSticker = DATASET[kwChoice].sticker,
        kwTests = DATASET[kwChoice].tests,
        start = 30,
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
