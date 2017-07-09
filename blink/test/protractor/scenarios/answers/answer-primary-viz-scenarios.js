/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E scenarios verifying the primary-viz displayed in different scenarios.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var answerListPage = require('./answer-list-page');
var bootstrap = require('../libs/bootstrap-lib');
var chart = require('../charts/charts');
var common = require('../common');
var dataSourcesPreview = require('../data-source-preview/data-source-preview');
var leftPanel = require('../sage/data-panel/data-panel');
var table = require('../table/table');


describe('Answer primary viz', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
        answerPage.clearVizDisplayPreference();
    });

    afterAll(function(){
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
    });

    it('Should retain table selection on refresh', function () {
        var query = 'revenue color';
        answerPage.queryAndWaitForAnswer(query);
        answerPage.selectTableType();
        browser.refresh();
        table.waitForTable();
    });

    it('Should retain table selection after navigation to home', function () {
        var query = 'revenue color';
        answerPage.queryAndWaitForAnswer(query);
        answerPage.selectTableType();
        common.navigation.goToHome();
        common.navigation.goToQuestionSection();
        answerPage.queryAndWaitForAnswer(query);
        table.waitForTable();
    });

    it('Should show table on saved chart answer after table selection', function () {
        var sageQuery = 'revenue color';
        var answerName = 'testAns';
        answerPage.createAndSaveAnswer(sageQuery, answerName, false, chart.vizTypes.TABLE);
        answerListPage.goToSavedAnswer(answerName);
        table.waitForTable();
        answerListPage.deleteAnswer(answerName);
    });


    // TODO(Jasmeet): Using chartmodel.getId() as key in chart persisted store is not a good
    // strategy. We should come up with a better way to retaining the viz preference.
    // fit('change of viz type should not impact viz selection on back button', function () {
    //     var query1 = 'revenue color';
    //     var query2 = 'revenue color tax';
    //     answerPage.queryAndWaitForAnswer(query1);
    //     chart.waitForChartVizToLoad();
    //     answerPage.queryAndWaitForAnswer(query2);
    //     answerPage.selectTableType();
    //     browser.navigate().back();
    //     answerPage.waitForAnswerWithQuery(query1);
    //     chart.waitForChartVizToLoad();
    // });
});
