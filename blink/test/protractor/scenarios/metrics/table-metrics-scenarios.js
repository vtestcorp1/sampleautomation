/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 * francois.chabbey(francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for metrics on table.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var answerListPage = require('../answers/answer-list-page');
var common = require('../common');
var dataPanel = require('../sage/data-panel/data-panel');
var metricPanel = require('./metric-panel');
var share = require('../share/share-ui');
var table = require('../table/table');
var tableMetrics = require('../table/table-metrics');

var util = common.util;
var nav = common.navigation;

describe('Table metrics', function () {

    var METRIC_RANGES = [[0, 9000000], [10000000, 20000000]];

    var METRIC_COLORS = [
        ['rgba(0, 0, 255, 0.8)', /rgba\(0, 0, 255,/, /rgba\(0, 0, 255/],
        ['rgba(0, 255, 255, 0.8)', /rgba\(0, 255, 255,/, /rgba\(0, 255, 255/]
    ];

    var METRICS = [
        [
            METRIC_RANGES[0][0], METRIC_RANGES[0][1], METRIC_COLORS[0]
        ],
        [
            METRIC_RANGES[1][0], METRIC_RANGES[1][1], METRIC_COLORS[1]
        ]
    ];

    var EXPECTED_COLORS = [METRIC_COLORS[1][1], METRIC_COLORS[0][1]];

    var SAVED_ANSWER_NAME = '[Chart Column Metrics Test]';
    var DEFAULT_CELL_COLOR_REGEX = /rgba\(0, 0, 0, 0\)/;

    beforeEach(function(){
        nav.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['CUSTOMER', 'LINEORDER', 'PART']);
        dataPanel.clickDone();
        answerPage.clearVizDisplayPreference();
    });

    it('[SMOKE][IE] should be able to apply metrics on a numeric column', function () {
        tableMetrics.createAndAddMetrics(METRICS);
        metricPanel.applyMetrics();
        tableMetrics.verifyMetricsApplied(EXPECTED_COLORS);
    });

    it('should preserve applied metrics on answerPage save', function(){
        tableMetrics.createAndAddMetrics(METRICS);
        metricPanel.applyMetrics();
        answerPage.saveCurrentAnswer(SAVED_ANSWER_NAME);
        tableMetrics.verifyMetricsApplied(EXPECTED_COLORS);
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(SAVED_ANSWER_NAME);
    });

    it('should not throw exceptions when adding a new metric while ' +
        'having invalid metrics in the popup: SCAL-12508',
        function(){
            tableMetrics.createAndAddMetrics(METRICS);
            metricPanel.addNewMetric('text 1', 'text 2', '#000');
            metricPanel.applyMetrics(true);
            $(util.joinSelectors(
                metricPanel.selectors.METRICS_WIDGET,
                metricPanel.selectors.ADD_METRIC_BUTTON)
            ).click();
            util.waitForElementCountToBe(metricPanel.selectors.METRIC_ROW, 4);
            metricPanel.cancel();
        }
    );

    it('should preserve applied metrics after column menu closure', function(){
        tableMetrics.createAndAddMetrics(METRICS);
        metricPanel.applyMetrics();
        //expect(element(visible(TABLE_COLUMN_MENU)).count()).toBe(0);
        table.openColumnMenu('Revenue');
        table.chooseColumnMenuItem('Conditional Formatting');
        expect(metricPanel.getMetricsCount()).toBe(2);
        expect(metricPanel.getMetricMin(0)).toBe('' + METRIC_RANGES[0][0]);
        expect(metricPanel.getMetricMax(0)).toBe('' + METRIC_RANGES[0][1]);
        expect(metricPanel.getMetricColor(0)).toMatch(METRIC_COLORS[0][2]);
        expect(metricPanel.getMetricMin(1)).toBe('' + METRIC_RANGES[1][0]);
        expect(metricPanel.getMetricMax(1)).toBe('' + METRIC_RANGES[1][1]);
        expect(metricPanel.getMetricColor(1)).toMatch(METRIC_COLORS[1][2]);
    });

    it('should not apply metrics when cancel button is clicked', function(){
        tableMetrics.createAndAddMetrics(METRICS);
        metricPanel.cancel();
        tableMetrics.exceptCellToHaveBackgroundMatching(0, 1, DEFAULT_CELL_COLOR_REGEX);
        tableMetrics.exceptCellToHaveBackgroundMatching(0, 0, DEFAULT_CELL_COLOR_REGEX);
    });


    it('should display read-only panel for table metrics', function(){
        tableMetrics.createAndAddMetrics(METRICS);
        metricPanel.applyMetrics();
        answerPage.saveCurrentAnswer(SAVED_ANSWER_NAME);
        answerListPage.shareAnswer(SAVED_ANSWER_NAME, ['guest4'], true);
        util.reLogin('guest4','guest4');
        nav.goToAnswerSection();
        answerPage.openAnswerByName(SAVED_ANSWER_NAME);
        // check for column headers button
        util.waitForInvisibilityOf(table.getColumnMenuButton('Customer Address'));
        util.waitForVisibilityOf(table.getColumnMenuButton('Revenue'));
        // metrics are read-only
        table.openColumnMenu('Revenue');
        table.chooseColumnMenuItem('Conditional Formatting');
        util.waitForVisibilityOf(metricPanel.selectors.READ_ONLY_FILTER);
        metricPanel.cancel();
        util.reLogin();
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(SAVED_ANSWER_NAME);
    });
});
