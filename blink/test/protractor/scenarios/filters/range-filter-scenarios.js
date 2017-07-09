/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E tests for range filter scenarios.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var common = require('../common');
var filterPanel = require('./filter-panel');
var filterDialog = require('./filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel');
var rangeFilter = require('./range-filter');
var sage = require('../sage/sage');

describe('Range filter', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    it('should update answer and sage bar when filter is changed', function () {
        answerPage.queryAndWaitForAnswer('revenue for revenue > 1000000');
        filterPanel.clickFilterItem('Revenue');
        // Change to '<'
        rangeFilter.changeFirstPredicate('<');
        filterDialog.clickDone();
        var transformedQuery = 'revenue revenue < 1000000';
        sage.sageInputElement.waitForValueToBe(transformedQuery);
        answerPage.waitForAnswerWithQuery(transformedQuery);
    });

    it('should update answer and sage bar when another op row is added', function () {
        answerPage.queryAndWaitForAnswer('revenue for revenue > 1000000');
        filterPanel.clickFilterItem('Revenue');
        // select '<' for the second row.
        rangeFilter.changeSecondPredicate('<');
        rangeFilter.setSecondOperandValue('2000000');
        filterDialog.clickDone();
        var transformedQuery = 'revenue revenue > 1000000 revenue < 2000000';
        sage.sageInputElement.waitForValueToBe(transformedQuery);
        answerPage.waitForAnswerWithQuery(transformedQuery);
    });

    it('should set empty value in the first operand row', function () {
        answerPage.queryAndWaitForAnswer('revenue for revenue > 1000000');
        filterPanel.clickFilterItem('Revenue');
        // select '<' for the second row.
        rangeFilter.clearFirstOperandValue();
        filterDialog.clickDone();
        var transformedQuery = 'revenue';
        sage.sageInputElement.waitForValueToBe(transformedQuery);
        answerPage.waitForAnswerWithQuery(transformedQuery);
    });

    it('should disable second input when = or != are selected in the first ' +
        'operator dropdown', function () {
        answerPage.queryAndWaitForAnswer('revenue for revenue > 1000000');
        filterPanel.clickFilterItem('Revenue');

        rangeFilter.changeFirstPredicate('=');
        rangeFilter.waitForSecondPredicateDisabled();

        rangeFilter.changeFirstPredicate('<');
        rangeFilter.waitForSecondPredicateOptions(['...', '>', '>=']);

        rangeFilter.changeFirstPredicate('!=');
        rangeFilter.waitForSecondPredicateDisabled();
        filterDialog.clickCancel();
    });

    it('should not modify input value when operator is changed - SCAL-2250', function () {
        answerPage.queryAndWaitForAnswer('revenue for revenue > 1000000');
        filterPanel.clickFilterItem('Revenue');
        rangeFilter.changeFirstPredicate('=');
        rangeFilter.waitForFirstOperandValue('1000000');
        filterDialog.clickCancel();
    });

    it('should not show a filter for compound expression', function () {
        var column = 'Revenue';
        var query = 'revenue > 0 revenue != 100';
        sage.sageInputElement.enter(query);
        answerPage.waitForAnswerWithQuery(query);
        filterPanel.clickFilterItem(column);
        filterPanel.waitForUnsupportedFilterPlaceHolder();
        filterDialog.clickCancel();
    });

    it('should not show a filter for multiple negation', function () {
        var column = 'Revenue';
        var query = 'revenue != 0 revenue != 100';
        sage.sageInputElement.enter(query);
        answerPage.waitForAnswerWithQuery(query);
        filterPanel.clickFilterItem(column);
        filterPanel.waitForUnsupportedFilterPlaceHolder();
        filterDialog.clickCancel();
    });
});
