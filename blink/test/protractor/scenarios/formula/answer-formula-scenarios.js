/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var answer = require('../viz-layout/answer/answer');
var answerListPage = require('../answers/answer-list-page');
var sage = require('../sage/sage');
var table = require('../table/table');
var formula = require('./formula');
var dataPanel = require('../sage/data-panel/data-panel');

describe('Answer Formula - ', function() {
    beforeEach(function () {
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER', 'CUSTOMER', 'DATE']);
        dataPanel.clickDone();
    });

    it('[SMOKE][IE] should be able to add formulae to answers', function () {
        sage.sageInputElement.enter('revenue customer region');
        answer.selectTableType();
        table.waitForTableColumnAtIndex(0, 'Customer Region');
        table.waitForTableColumnAtIndex(1, 'Revenue');

        formula.createAndSaveFormulaInAnswer('revenue + tax', 'Answer Formula Column');

        answer.waitForAnswerWithQuery('revenue customer region answer formula column');
        table.waitForTableColumnAtIndex(0, 'Customer Region');
        table.waitForTableColumnAtIndex(1, 'Revenue');
        table.waitForTableColumnAtIndex(2, 'Answer Formula Column');
    });

    it('should be able to add formula on existing formula',function(){
        var formulaName = 'Answer Formula Column';
        var anotherFormulaName = 'FoF'
        sage.sageInputElement.enter('revenue customer region');
        answer.selectTableType();
        table.waitForTableColumnAtIndex(0, 'Customer Region');
        table.waitForTableColumnAtIndex(1, 'Revenue');
        formula.createAndSaveFormulaInAnswer('revenue + tax', formulaName);

        formula.createAndSaveFormulaInAnswer(formulaName+'+1',anotherFormulaName)
        //check the sage bar
        answer.waitForAnswerWithQuery('revenue customer region answer formula column fof');
        //check the table title
        table.waitForTableColumnAtIndex(0, 'Customer Region');
        table.waitForTableColumnAtIndex(1, 'Revenue');
        table.waitForTableColumnAtIndex(2, 'Answer Formula Column');
        table.waitForTableColumnAtIndex(3, 'FoF');
        //check the table value
        expect(table.getNthCell(0, 2).getText()).toBe('3,386,580,070');
        expect(table.getNthCell(0, 3).getText()).toBe('3,386,581,019');
    });

    it('formulae added to answers should be preserved when saving answers', function(){
        var savedAnswerName = 'Saved Answer';
        sage.sageInputElement.enter('revenue customer region');
        answer.selectTableType();
        formula.createAndSaveFormulaInAnswer('revenue + tax', 'Answer Formula Column');

        answer.waitForAnswerWithQuery('revenue customer region answer formula column');
        answer.saveCurrentAnswer(savedAnswerName);

        table.waitForTableColumnAtIndex(0, 'Customer Region');
        table.waitForTableColumnAtIndex(1, 'Revenue');
        table.waitForTableColumnAtIndex(2, 'Answer Formula Column');

        common.navigation.goToAnswerSection();
        answerListPage.deleteAnswer(savedAnswerName);
    });

    it('should allow constant formula in answer', function() {
        sage.sageInputElement.enter('revenue customer region');
        answer.selectTableType();
        table.waitForTableColumnAtIndex(0, 'Customer Region');
        table.waitForTableColumnAtIndex(1, 'Revenue');

        formula.createAndSaveFormulaInAnswer('1 + 1', 'Answer Formula Column');

        answer.waitForAnswerWithQuery('revenue customer region answer formula column');
        table.waitForTableColumnAtIndex(0, 'Customer Region');
        table.waitForTableColumnAtIndex(1, 'Revenue');
        table.waitForTableColumnAtIndex(2, 'Answer Formula Column');
    });

    it('should show numbers for month_number formula values: SCAL-10349', function(){
        sage.sageInputElement.enter('revenue commit date monthly');
        answer.selectTableType();

        formula.createAndSaveFormulaInAnswer('month_number(commit date)', 'Answer Formula Column');

        answer.waitForAnswerWithQuery('revenue commit date monthly answer formula column');
        expect(table.getNthCell(0, 1).getText()).toBe('2');
    });

    it('should not show out of scope suggestions', function() {
        sage.sageInputElement.enter('revenue commit date monthly');
        answer.waitForAnswerWithQuery('revenue commit date monthly');

        formula.openFormulaEditorInAnswer();
        formula.focusFormulaEditor();

        formula.typeInFormulaEditor('cus');
        formula.waitForSuggestion('customer region');

        formula.clearFormulaEditor();
        formula.typeInFormulaEditor('color');

        formula.waitForOutOfScopeSuggestionError();

        formula.discardCurrentFormula();
    });

    it('should clear growth phrases containing formula on formula deletion', function() {
        var query = 'revenue color';
        var formulaName = 'rev+tax';

        sage.sageInputElement.enter(query);
        answer.waitForAnswerWithQuery(query);
        answer.selectTableType();

        formula.createAndSaveFormulaInAnswer('revenue + tax', formulaName);
        answer.waitForAnswerWithQuery('revenue color rev+tax');

        var growthQueryWithFormula = 'growth of rev+tax by commit date';
        sage.sageInputElement.enter(growthQueryWithFormula);
        answer.waitForAnswerWithQuery(growthQueryWithFormula);

        formula.expandFormulaSourceInAnswer();
        formula.deleteFormulaInAnswer(formulaName);
        answer.waitForAnswerWithQuery('');
    });

    it('should clear growth phrases containing formula on formula deletion', function() {
        var query = 'revenue color';
        var formulaName = 'rev+tax';

        sage.sageInputElement.enter(query);
        answer.waitForAnswerWithQuery(query);
        answer.selectTableType();

        formula.createAndSaveFormulaInAnswer('revenue + tax', formulaName);
        answer.waitForAnswerWithQuery('revenue color rev+tax');

        var growthQueryWithFormula = 'rev+tax by commit date rev+tax > 50';
        sage.sageInputElement.enter(growthQueryWithFormula);
        answer.waitForAnswerWithQuery(growthQueryWithFormula);

        formula.expandFormulaSourceInAnswer();
        formula.deleteFormulaInAnswer(formulaName);
        answer.waitForAnswerWithQuery('by commit date');
    });

    it('should support different format patterns uppercase/lowercase', function () {
        var query = 'datekey detailed';
        sage.sageInputElement.enter(query);
        answer.waitForAnswerWithQuery(query);
        answer.selectTableType();

        formula.createAndSaveFormulaInAnswer('to_string(datekey, \'%h\')', 'monthname');
        answer.waitForAnswerWithQuery('datekey detailed monthname');

        formula.createAndSaveFormulaInAnswer('to_string(datekey, \'%H\')', 'hour');
        answer.waitForAnswerWithQuery('datekey detailed monthname hour');

        expect(table.getNthCell(0, 0).getText()).toBe('12/31/1991');
        expect(table.getNthCell(0, 1).getText()).toBe('Dec');
        expect(table.getNthCell(0, 2).getText()).toBe('00');

    });

    it('should insert formula suggestions in the correct places following ' +
        'multi-word quoted string', function () {
        var query = 'revenue customer region';
        sage.sageInputElement.enter(query);
        answer.waitForAnswerWithQuery(query);

        formula.openFormulaEditorInAnswer();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('concat("My name is",');
        formula.clickSuggestion('ship priority');

        formula.waitForFormulaEditorText('concat("my name is", ship priority');

        formula.discardCurrentFormula();
    });

    //SCAL-19096
    it('should throws when adding windowing function to query with chasm-trap', function(){
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['PRODUCTS', 'PURCHASES', 'SALES']);
        dataPanel.clickDone();
        dataPanel.expandSource('PURCHASES');
        dataPanel.addColumn('Product Cost');
        answer.waitForAnswerToLoad();
        formula.createAndSaveFormulaInAnswer('cumulative_sum ( sale id , sale cost)');
        dataPanel.expandSource('PRODUCTS');
        dataPanel.addColumn('Product Id');
        common.util.expectAndDismissNotif();
        sage.sageInputElement.deleteToken(1);
        answer.waitForAnswerToLoad();
        dataPanel.expandSource('Formulas');
        dataPanel.addColumn('undefined');
        common.util.expectAndDismissNotif();
    });
});
