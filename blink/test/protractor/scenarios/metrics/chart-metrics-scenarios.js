/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 * francois.chabbey(francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for metrics on charts.
 */

'use strict';

var answer = require('../viz-layout/answer/answer');
var answerListPage = require('../answers/answer-list-page');
var chartMetrics = require('../charts/chart-metrics');
var common = require('../common');
var dataPanel = require('../sage/data-panel/data-panel');
var metricPanel = require('./metric-panel');
var share = require('../share/share-ui');

var util = common.util;
var nav = common.navigation;

describe('Chart metrics', function () {
    var METRIC_PARAMS = [
        [0, 3200000000, 'rgba(0, 0, 255, 1)'],
        [3200000000, 3800000000, 'rgba(0, 255, 255, 1)']
    ];
    var METRIC_PARAMS_INFINITY = [
        ['', 3200000000, 'rgba(0, 0, 255, 1)'],
        [3200000000, '', 'rgba(0, 255, 255, 1)']
    ];
    var SAVED_ANSWER_NAME = '[Chart Column Metrics Test]';

    beforeEach(function(){
        nav.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['CUSTOMER', 'LINEORDER', 'PART']);
        dataPanel.clickDone();
        answer.clearVizDisplayPreference();
    });

    it('[SMOKE] should be able to apply metrics on a numeric column', function () {
        chartMetrics.createAndAddMetrics(METRIC_PARAMS);
        metricPanel.applyMetrics();
        chartMetrics.verifyMetricsApplied(METRIC_PARAMS);
    });

    it('should be able to handle empty metrics SCAL-11221', function(){
        nav.goToQuestionSection();
        var answerName = 'SCAL-11221';
        answer.queryAndWaitForChart('revenue market segment');
        chartMetrics.addEmptyMetrics();
        answer.saveCurrentAnswer(answerName);
        nav.goToAnswerSection();
        answer.openAnswerByName(answerName);
        answer.waitForAnswerToLoad();
        answerListPage.deleteAnswer(answerName);
    });

    it('should preserve applied metrics on answer save', function(){
        chartMetrics.createAndAddMetrics(METRIC_PARAMS);
        metricPanel.applyMetrics();
        chartMetrics.verifyMetricsApplied(METRIC_PARAMS);
        answer.saveCurrentAnswer(SAVED_ANSWER_NAME);
        nav.goToAnswerSection();
        answer.openAnswerByName(SAVED_ANSWER_NAME);
        chartMetrics.verifyMetricsApplied(METRIC_PARAMS);
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(SAVED_ANSWER_NAME);
    });


    it('should treat empty min/max as -Infinity/+Infinity and the effect should persist', function(){
        chartMetrics.createAndAddMetrics(METRIC_PARAMS_INFINITY);
        metricPanel.applyMetrics();

        chartMetrics.verifyMetricsApplied(METRIC_PARAMS_INFINITY, METRIC_PARAMS_INFINITY[1][2]);
        answer.saveCurrentAnswer(SAVED_ANSWER_NAME);

        nav.goToAnswerSection();
        answer.openAnswerByName(SAVED_ANSWER_NAME);
        chartMetrics.verifyMetricsApplied(METRIC_PARAMS_INFINITY, METRIC_PARAMS_INFINITY[1][2]);
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(SAVED_ANSWER_NAME);
    });

    it('should apply metrics to the correct series in case of multiple y-axes: SCAL-10116', function(){
        chartMetrics.createAndAddMetrics([['1K', '6K', 'rgba(0, 0, 255, 1)']], "customer region tax supply cost");
        metricPanel.applyMetrics();
        chartMetrics.expectColumnToHaveFillMatching(5, 'rgba(0, 0, 255, 1)');
    });

    it('should have read-only panel when user has no access to underlying tables', function(){
        chartMetrics.createAndAddMetrics(METRIC_PARAMS);
        metricPanel.applyMetrics();
        answer.saveCurrentAnswer(SAVED_ANSWER_NAME);
        answerListPage.shareAnswer(SAVED_ANSWER_NAME, ['guest4'], true);
        util.reLogin('guest4','guest4');
        nav.goToAnswerSection();
        answer.openAnswerByName(SAVED_ANSWER_NAME);
        answer.waitForAnswerToLoad();
        chartMetrics.verifyMetricsApplied(METRIC_PARAMS);
        util.reLogin();
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(SAVED_ANSWER_NAME);
    });
});
