/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou (shitong@thoughtspot.com)
 *
 * @fileoverview tpch worksheet keywords
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Keyword Tests on worksheets', function() {
    var kwTests = DATASET_TPCH.tests;


    function test_keywords(index) {
        var kwQuery = kwTests[index].query,
            kwResults = kwTests[index].results,
            kwCount = kwTests[index].count;

        describe('keyword tests using TPCH worksheet 2' + ' -- ' + kwCount, function() {

            beforeEach(function() {
                goToAnswer();
                deselectAllSources();
                selectWorksheetsAsSources(TPCH_WORKSHEET_NAME);
            });

            it('should search query: ' + kwQuery, function() {
                sageInputElement().enter(kwQuery);
                waitForTableAnswerVisualizationMode();
                waitForHeadline();
                checkTableViewResults(kwResults);
            });
        });
    }

    for (var i = 30; i < 60; i++) {
        if (!kwTests[i].disable_ws) {
            test_keywords(i);
        }
    }
});
