/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var answer = require('../../scenarios/viz-layout/answer/answer');
var benchmark = require('./../benchmark');
var common = require('../../scenarios/common');
var dataPanel = require('../../scenarios/sage/data-panel/data-panel');
var dataset = browser.params.dataset.answerPageScenarios;
var leftPanel = require('../../scenarios/sage/data-panel/data-panel');
var navigation = common.navigation;
var sage = require('../../scenarios/sage/sage');
var util = common.util;

var suite = benchmark.suite('answer-page');

var input = dataset.loadAnswerPage;

suite.register('load-answer-page')
    .beforeAll(function () {
        navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(input.sources);
        return leftPanel.clickDone();
    })
    .withBounds(input.bounds)
    .before(function () {
        return navigation.goToAdminSection();
    })
    .then(function() {
        navigation.goToQuestionSection();
        leftPanel.waitForLeftPanelSourcesCount(input.sources.length);
        return sage.waitForSageDropdown();
    });

suite.report();


var suite = benchmark.suite('answer-page');

var sources = dataset.selectAllSources;
suite.register('select-all-sources')
    .withBounds(sources.bounds)
    .before(function() {
        navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
        return navigation.goToQuestionSection();
    })
    .then(function() {
        leftPanel.selectAllSources();
        leftPanel.clickDone();
        return leftPanel.waitForNonZeroLeftPanelSources();
    });

suite.report();


var suite = benchmark.suite('adhoc-query');

dataset.adhocQueries.forEach(function(query) {
    suite.register(query.text)
        .withBounds(query.bounds)
        .before(function() {
            navigation.goToQuestionSection();
            leftPanel.deselectAllSources();
            leftPanel.openAndChooseSources(query.sources);
            leftPanel.clickDone();
            return util.waitForInvisibilityOf(
                dataPanel.selectors.SOURCE_PANEL);
        })
        .then(function() {
            sage.sageInputElement.fastEnter(query.text);
            return answer.waitForAnswerToLoad();
        });
});

suite.report();


var suite = benchmark.suite('choose-sources');

dataset.chooseSources.forEach(function(test) {
    suite.register(test.name)
        .withBounds(test.bounds)
        .before(function() {
            navigation.goToQuestionSection();
            leftPanel.deselectAllSources();
            leftPanel.clickDone();
            return util.waitForInvisibilityOf(dataPanel.selectors.SOURCE_PANEL);
            // TODO(satyam): Clear blink cache here.
        })
        .then(function() {
            leftPanel.openAndChooseSources(test.sources);
            leftPanel.clickDone();
            return util.waitForInvisibilityOf(dataPanel.selectors.SOURCE_PANEL);
        });
});

suite.report();
