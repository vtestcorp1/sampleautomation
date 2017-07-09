/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 * Francois Chabbey(francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for sage data filters
 */
'use strict';

var sage = require('./sage.js');
var admin = require('../admin-ui/admin-ui');
var headline = require('../viz-layout/headline/headline');
var common = require('../common.js');
var nav = common.navigation;
var base = require('../../base-do-not-use.js');
var answer = require('../viz-layout/answer/answer.js');
var leftPanel = require('./data-panel/data-panel.js');
var checkboxFilter = require('../filters/checkbox-filter');
var filterPanel = require('../filters/filter-panel.js');
var filterDialog = require('../filters/filter-dialog');

describe('Sage data filters', function () {

    beforeEach(function(){
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['CUSTOMER', 'LINEORDER']);
        leftPanel.clickDone();
    });

    afterEach(function () {
        nav.goToQuestionSection();
        leftPanel.openAndChooseSources();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    it('should show a filter popup when we apply a filter from panel', function () {
        answer.queryAndWaitForTable('customer name');

        var colName1 = 'Customer Address',
            colName2 = 'Customer City';

        leftPanel.expandSource('CUSTOMER');
        leftPanel.openFilter(colName1);
        filterDialog.clickCancel();
        filterPanel.waitForFilterItems(1);

        leftPanel.openFilter(colName2);
        filterDialog.clickCancel();
        filterPanel.waitForFilterItems(2);
        filterPanel.removeFilter(colName1);
        filterPanel.removeFilter(colName2);
        filterPanel.waitForFilterItems(0);
    });

    it('should show a filter popup when filter is added to empty answer', function () {
        var colName1 = 'Customer Address',
            colName2 = 'Customer Nation';

        leftPanel.expandSource('CUSTOMER');
        leftPanel.openFilter(colName1);
        filterDialog.clickCancel();
        filterPanel.waitForFilterItems(1);
        // add one more
        leftPanel.openFilter(colName2);
        filterDialog.clickCancel();
        filterPanel.waitForFilterItems(2);

        // delete
        filterPanel.removeFilter(colName1);
        filterPanel.removeFilter(colName2);
        filterPanel.waitForFilterItems(0);

        // check that question is updated after adding a filter
        leftPanel.openFilter(colName2);
        filterPanel.waitForFilterItems(1);

        checkboxFilter.toggleCheckboxState('brazil');
        filterDialog.clickDone();

        answer.waitForAnswerToLoad('customer nation = brazil');
    });
});
