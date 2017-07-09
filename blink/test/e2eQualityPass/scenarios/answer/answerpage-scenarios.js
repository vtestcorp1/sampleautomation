/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving functionality around creating and managing answerbooks.
 * answer editing is tested in a separate file answer-editing-scenarios.js
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Answer Operations', function () {

    it('should be able to ask a question from header action item', function() {
        answersTab().click();
        answerTab().click();
        waitForElement(SAGE_INPUT, 'waiting for sage bar');
    });

    it('should be able to create and delete an answerbook', function () {
        var sageQuery = 'revenue color';
        var answerBookName = '[saved answerbook]';
        selectSageSources(TPCH_TABLES);

        sageInputElement().enter(sageQuery);
        waitForTableAnswerVisualizationMode();
        saveAsBtn().click();
        expect(saveDialog().count()).toBe(1);
        input('data.customData.questionHeader').enter(answerBookName);
        primaryDialogBtn().click();
        expect(element('.bk-answer-title .bk-editable').text()).toMatch(answerBookName);

        // verify answer shows up correctly on Answers page
        answersTab().click();
        waitFor(function (appWindow) {
            return appWindow.$('.bk-list-content');
        });
        expect(element('.bk-list-content ul li:contains(' + answerBookName + ')').count()).toBe(1);
        deleteMetadataListItems([answerBookName]);
        expect(element('.bk-list-content ul li:contains(' + answerBookName + ')').count()).toBe(0);
    });

    it('should be able to save an answerbook with table and chart ', function () {
        var sageQuery = 'revenue color';
        var answerBookName = '[saved answerbook with chart]';
        selectSageSources(TPCH_TABLES);
        createAndSaveAnswer(sageQuery, answerBookName);
        waitForHighcharts();

        expect(element(CHART_VIZ).count()).toBe(1);
        waitForTableAnswerVisualizationMode();
        expect(element(TABLE_VIZ).count()).toBe(1);

        // Save the answer with some title and verify default naming conventions
        expect(callFunctionWithElement(element(vizTitleInput(TABLE_VIZ)), function ($e) {
            return $e.attr('name').trim();
        })).toEqual(answerBookName + ' table');
        selectViz('column');
        expect(callFunctionWithElement(element(vizTitleInput(CHART_VIZ)), function ($e) {
            return $e.attr('name').trim();
        })).toEqual(answerBookName + ' chart');

        deleteSavedAnswer(answerBookName);
    });

    // disabled due to SCAL-10379
    xit('should be able to rename an answerbook from answerbook header', function () {
        var sageQuery = 'revenue color';
        var answerBookName = '[rename answerbook test]';
        var newAnswerBookName = '[new saved answerbook 1]';
        selectSageSources(TPCH_TABLES);
        createAndSaveAnswer(sageQuery, answerBookName);
        openSavedAnswerContaining(answerBookName);
        // two ways to rename an answer
        // method 1: enter new name in the header text box and save
        setMetaItemHeaderTextTo(newAnswerBookName);
        selectViz('table');

        expect(callFunctionWithElement(element(vizTitleInput(TABLE_VIZ)), function ($e) {
            return $e.attr('name').trim();
        })).toEqual(newAnswerBookName + ' table');

        selectViz('column');
        expect(callFunctionWithElement(element(vizTitleInput(CHART_VIZ)), function ($e) {
            return $e.attr('name').trim();
        })).toEqual(newAnswerBookName + ' chart');

        saveBtn().click();
        answersTab().click();
        expect(answerContaining(answerBookName).count()).toBe(0);
        expect(answerContaining(newAnswerBookName).count()).toBe(1);
        deleteSavedAnswer(newAnswerBookName);
    });

    it('should be able to rename an answerbook from the make a copy dialog', function () {
        // method 2: change name through the save as dialog
        var sageQuery = 'revenue color';
        var answerBookName = '[make a copy test]';
        var newAnswerBookName = '[new saved answerbook 2]';
        selectSageSources(TPCH_TABLES);
        createAndSaveAnswer(sageQuery, answerBookName);
        openSavedAnswerContaining(answerBookName);
        makeACopyBtn().click();
        expect(saveDialog().count()).toBe(1);
        input('data.customData.questionHeader').enter(newAnswerBookName);
        primaryDialogBtn().click();
        expect(saveDialog().count()).toBe(0);
        answersTab().click();
        // when saving as another answer, the original does not go away
        expect(answerContaining(answerBookName).count()).toBe(1);
        expect(answerContaining(newAnswerBookName).count()).toBe(1);
        deleteSavedAnswer(newAnswerBookName);
        deleteSavedAnswer(answerBookName);
    });
});


describe('Filter / Tag / Search for', function() {

    it('should be able to search for an answer from the search bar', function() {
        var query = 'customer city revenue color',
            name = '[search bar filtering test]';
        createAndSaveAnswer(query, name);
        answersTab().click();
        searchByName('[search');
        expect(element('.bk-name-content').count()).toBeGreaterThan(0);
        deleteSavedAnswer(name);
    });
});
