/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */
'use strict';

var answerListPage = require('../answers/answer-list-page.js');
var answer = require('../viz-layout/answer/answer');
var charts = require('../charts/charts');
var checkboxFilters = require('./checkbox-filter');
var dialog = require('../dialog');
var filterPanel = require('./filter-panel');
var filterDialog = require('./filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel.js');
var sage = require('../sage/sage.js');
var table = require('../table/table');
var common = require('../common');

describe('Exclude filter scenarios', function () {
    // Client state of the panel is persisted by Callosum, so we make sure
    // that no sources are left selected before and after the test
    beforeEach(function(){
        answerListPage.goToAnswer();
        leftPanel.deselectAllSources();
    });

    afterEach(function() {
        leftPanel.deselectAllSources();
    });

    xit('[SMOKE] should be able to exclude filter values', function () {
        leftPanel.openAndChooseSources(['LINEORDER']);
        leftPanel.clickDone();
        sage.sageInputElement.enter('revenue color color = red');
        answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        charts.waitForColumnCountToBe(null, 1);
        filterPanel.clickFilterItem('Color');
        checkboxFilters.openExcludeSection();
        checkboxFilters.toggleCheckboxState('almond', true);
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color color = red color != almond');
        leftPanel.deselectAllSources();
    });
});
