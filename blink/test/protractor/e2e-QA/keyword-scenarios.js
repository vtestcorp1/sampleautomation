/**
 * Copyright Thoughtspot Inc. 2016
 * Pavan Piratla (pavan@thoughtspot.com)
 */

'use strict';

var answer = require('../scenarios/viz-layout/answer/answer.js');
var base = require('../base-do-not-use.js');
var leftPanel = require('../scenarios/sage/data-panel/data-panel.js');
var testData = require('./keywords_test_cases.js')

describe('Keyword testing scenarios', function() {


    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        leftPanel.deselectAllSources();

        leftPanel.openAndChooseSources(['LINEORDER', 'CUSTOMER', 'PART', 'SUPPLIER', 'DATE']);
        leftPanel.clickDone();
    });

    testData.DATASET_TPCH.tests.forEach(function(test) {
        it('test: ' + test.count + ' with query (' + test.query + ')' , function () {
            answer.doAdhocQueryFromPreSelectedSources(test.query);
            answer.verifyTableDataFromAdhocQuery(test.results.table.val);
            answer.verifyTableHeaderColumnSelectors(test.results.table.sel /*['', 'TOTAL']*/);
            answer.verifyTableHeaderColumnNames(test.results.table.col /*['Customer Nation', 'Revenue']*/);
        });
    });
});
