/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving saving and deleting of answer.
 */

'use strict';

var answerListPage = require('../answers/answer-list-page');
var answerPage = require('../viz-layout/answer/answer');
var chart = require('../charts/charts');
var common = require('../common');
var leftPanel = require('../sage/data-panel/data-panel');
var sage = require('../sage/sage');
var table = require('../table/table');

describe('Answerbook save and delete cases', function () {
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

    it('[SMOKE][IE] should save and delete an answerbook', function () {
        var answerName = 'saved answer name 1';
        var query = 'revenue color';
        answerPage.createAndSaveAnswer(query, answerName, false, chart.vizTypes.CHART);
        answerListPage.goToSavedAnswer(answerName);
        answerPage.waitForAnswerWithQuery(query);
        answerListPage.deleteAnswer(answerName);
    });

    it('[SMOKE] should save, open, modify and delete an answerbook', function () {
        var answerName = 'saved answer name 2';
        var query = 'revenue color';
        answerPage.createAndSaveAnswer(query, answerName, false, chart.vizTypes.CHART);
        answerListPage.goToSavedAnswer(answerName);
        answerPage.waitForAnswerWithQuery(query);
        sage.sageInputElement.waitForValueToBe(query);
        chart.waitForChartVizToLoad();

        // Modify
        sage.sageInputElement.append(' ship mode');
        var updatedQuery = 'revenue color ship mode';
        answerPage.waitForAnswerWithQuery(updatedQuery);
        answerPage.updateSavedAnswer();
        answerListPage.goToSavedAnswer(answerName);
        answerPage.waitForAnswerWithQuery(updatedQuery);
        sage.sageInputElement.waitForValueToBe(updatedQuery);

        // Delete the saved answer.
        answerListPage.deleteAnswer(answerName);
    });

    it('should retain saved answer metadata when we make sage query empty', function () {
        var answerName = 'SCAL-4889';
        var query = 'revenue color';
        answerPage.createAndSaveAnswer(query, answerName, false, chart.vizTypes.CHART);
        answerListPage.goToSavedAnswer(answerName);
        answerPage.waitForAnswerWithQuery(query);
        sage.sageInputElement.waitForValueToBe(query);
        sage.sageInputElement.enter('');
        var query2 = 'quantity type';
        answerPage.queryAndWaitForChart(query2);
        answerPage.waitForAnswerWithQuery(query2);
        answerPage.waitForAnswerName(answerName);
        answerPage.updateSavedAnswer();
        answerListPage.goToSavedAnswer(answerName);
        answerPage.waitForAnswerWithQuery(query2);
        answerPage.waitForAnswerName(answerName);
        // Delete the saved answer.
        answerListPage.deleteAnswer(answerName);
    });

    it('should save a copy of an answer and preserve the existing saved' +
        ' answer - SCAL-10168', function () {
        var query1 = 'revenue color';
        var testBook1Name = 'test book1';
        var query2 = 'revenue for color red';
        var testBook2Name = 'test book2';

        answerPage.createAndSaveAnswer(query1, testBook1Name, false, chart.vizTypes.CHART);
        answerPage.waitForAnswerName(testBook1Name);

        sage.sageInputElement.enter(query2);
        answerPage.waitForAnswerWithQuery(query2);
        table.waitForTable();
        answerPage.makeACopy(testBook2Name);
        answerPage.waitForAnswerName(testBook2Name);
        answerListPage.verifyAnswersExist([testBook1Name, testBook2Name]);

        // Delete the saved books.
        answerListPage.deleteAnswer(testBook1Name);
        answerListPage.deleteAnswer(testBook2Name);
    });
});
