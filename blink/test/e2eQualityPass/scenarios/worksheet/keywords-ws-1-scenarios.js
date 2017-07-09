/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shitong Shou (shitong@thoughtspot.com)
 *
 * @fileoverview
 * this file covers keyword tests using TPCH worksheets, much like keyword tests using table sources
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('prepare for keyword test', function() {
    // note (Shitong)
    // for now all the other tests depend on successfully creating this worksheet
    // if no test is passing, check to see if the creation of this worksheet has failed
    it('creating tpch worksheet', function() {
        createTPCHWorksheet(TPCH_WORKSHEET_NAME, 'Commit');
    });
});

describe('Keyword Tests on worksheets 1', function() {
    var kwTests = DATASET_TPCH.tests;


    function test_keywords(index) {
        var kwQuery = kwTests[index].query,
            kwResults = kwTests[index].results,
            kwCount = kwTests[index].count;

        describe('keyword tests using TPCH worksheet' + ' -- ' + kwCount, function() {

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

    for (var i = 0; i < 30; i++) {
        if (!kwTests[i].disable_ws) {
            test_keywords(i);
        }
    }
});
