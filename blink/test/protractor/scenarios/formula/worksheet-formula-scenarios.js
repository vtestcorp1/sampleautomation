/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var worksheets = require('../worksheets/worksheets');
var dataPanel = require('../sage/data-panel/data-panel');
var formula = require('./formula');

describe('Worksheet Formulae', function () {
    beforeAll(function() {
        common.navigation.goToHome();
        common.navigation.addUrlParameter('successAlertHidingDelay', 5000);
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    afterAll(function() {
        common.navigation.goToHome();
        common.navigation.removeUrlParameter('successAlertHidingDelay');
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    beforeEach(function () {
        worksheets.createEmptyWorksheet();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER', 'PART']);
        dataPanel.clickDone();
        worksheets.selectColumnFromTable('PART', 'Container');
    });

    it('with an incomplete types, should move highlighted element when' +
        ' user type on keyboard', function () {
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('re');
        formula.waitForActiveSuggestion('revenue');
        formula.nextSuggestion();
        formula.waitForActiveSuggestion('manufacturer');
        formula.discardCurrentFormula();
    });

    it('should be able to select a suggestion by clicking', function () {
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + re');
        formula.clickSuggestion('revenue');
        formula.waitForFormulaEditorText('discount + revenue');
        formula.waitForValidFormula();
        formula.discardCurrentFormula();
    });

    it('[SMOKE][IE] should be able to add formula to the worksheet', function () {
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + revenue');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.waitForFormulasInLeftPanel(1);
    });

    it('should be able to delete formula from worksheet', function () {
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + revenue');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        worksheets.deleteFormula(formulaName);
        worksheets.waitForFormulaDeletion(formulaName);
        formula.waitForFormulasInLeftPanel(1);
    });

    it('should be able to delete formula from context', function () {
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + revenue');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        worksheets.waitForColumnCountToBe(2);
        formula.deleteFormulaInWorksheet(formulaName);
        formula.waitForFormulasInLeftPanel(0);
        worksheets.waitForColumnCountToBe(1);
    });

    it('should throw error on delete formula from context when has dependents', function () {
        var formulaName = 'FormulaName';
        var formulaName1 = 'FormulaName1';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + revenue');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('FormulaName + 1');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName1);
        formula.deleteFormulaInWorksheet(formulaName);
        common.util.waitForVisibilityOf(common.util.selectors.ERROR_NOTIF);
        common.util.dismissErrorNotif();
    });

    it('should be able to add formula from worksheet by double click', function () {
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + revenue');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        worksheets.deleteFormula(formulaName);
        worksheets.waitForFormulaDeletion(formulaName);
        formula.waitForFormulasInLeftPanel(1);
        formula.addFormulaToWorksheetFromLeftPanel(formulaName);
        worksheets.waitForColumnCountToBe(2);
    });

    it('should throw error on save formula with conflicting names', function () {
        // #1. Create two formula and try saving the second formula with the same name.
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + revenue');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('FormulaName + 1');
        formula.waitForValidFormula();
        formula.tryToSaveCurrentFormulaInWorksheet(formulaName);
        // #3. Verify that we get an error message.
        expect(formula.getSaveErrorMessage()).toEqual(
            'Formula FormulaName already exists. Please choose a different name.'
        );
        // #4. Verify we don't loose the typed tokens in formula editor.
        formula.waitForFormulaEditorText('FormulaName + 1');
        formula.discardCurrentFormula();
    });

    it('should throw error on renaming formula with conflicting names', function () {
        // #1. Create two formula.
        var formulaName = 'FormulaName';
        var formulaName1 = 'FormulaName1';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('discount + revenue');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('FormulaName + 1');
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName1);
        // #2. Try to edit FormulaName1 and rename it to FormulaName.
        formula.openExistingFormulaInWorksheet(formulaName1);
        formula.focusFormulaEditor();
        formula.clearFormulaEditor();
        formula.typeInFormulaEditor('revenue / 100');
        formula.tryToSaveCurrentFormulaInWorksheet(formulaName);
        // #3. Verify that we get an error message.
        expect(formula.getSaveErrorMessage()).toEqual(
            'Formula FormulaName already exists. Please choose a different name.'
        );
        // #4. Verify we don't loose edited tokens in the formula editor.
        formula.waitForFormulaEditorText('revenue / 100');
        // #5 Must be able to save with its existing name.
        formula.tryToSaveCurrentFormulaInWorksheet(formulaName1);
    });

    it('should show ghost even if there are extra spaces at the end', function(){
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('revenue       ');
        formula.waitForGhostToken();
        formula.discardCurrentFormula();
    });

    it('should change the formula type (measure/attribute) when formula data type changes - SCAL-6689', function(){
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor("if (revenue > 0) then 2 else 3");
        formula.waitForValidFormula();
        formula.expectCurrentFormulaType('MEASURE');
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.openExistingFormulaInWorksheet(formulaName);
        formula.waitForValidFormula();
        formula.expectCurrentFormulaType('MEASURE');
        formula.focusFormulaEditor();
        formula.clearFormulaEditor();
        formula.typeInFormulaEditor('if (revenue > 0) then "a" else "b"');
        formula.waitForValidFormula();
        formula.expectCurrentFormulaType('ATTRIBUTE');
        formula.discardCurrentFormula();
    });

    it('should not show out of scope suggestions', function() {
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor('customer nation');

        formula.waitForOutOfScopeSuggestionError();

        formula.discardCurrentFormula();
    });

    it('should be able to change the type (MEASURE/ATTRIBUTE) of a formula', function() {
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.clearFormulaEditor();
        formula.typeInFormulaEditor("if (revenue > 0) then 2 else 3");
        formula.waitForValidFormula();
        formula.expectCurrentFormulaType('MEASURE');
        formula.changeCurrentFormulaType('ATTRIBUTE');
        formula.saveCurrentFormula(formulaName);
        formula.openExistingFormulaInWorksheet(formulaName);
        formula.waitForValidFormula();
        formula.expectCurrentFormulaType('ATTRIBUTE');

        formula.discardCurrentFormula();
    });

    it('should recognize typed tokens with spaces in them', function(){
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor("add_days(commit     date, 4)");
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.openExistingFormulaInWorksheet(formulaName);
        formula.waitForValidFormula();
        formula.waitForFormulaEditorText('add_days ( commit date , 4 )');
        formula.discardCurrentFormula();
    });

    it('should recognize typed tokens with spaces in them - II', function(){
        var formulaName = 'FormulaName';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor("revenue    +    tax +      quantity");
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.openExistingFormulaInWorksheet(formulaName);
        formula.waitForValidFormula();
        formula.waitForFormulaEditorText('revenue + tax + quantity');
        formula.discardCurrentFormula();
    });

    it('SCAL-18763 should allow editing of formula with a very long name', function () {
        var formulaName = 'ThisisaverylongFormulaNameWhichDoesntFitDefaultWidth';
        var formulaText = 'discount + revenue';
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
        formula.typeInFormulaEditor(formulaText);
        formula.waitForValidFormula();
        formula.saveCurrentFormulaInWorksheet(formulaName);
        formula.openExistingFormulaInWorksheet(formulaName);
        formula.waitForFormulaEditorText(formulaText);
        formula.discardCurrentFormula();
    });
});

describe('WorkSheet Formula about Chasm Trap',function(){

    beforeEach(function(){
        var worksheetName = 'Chasmtrap';
        worksheets.openWorksheet(worksheetName);
        formula.openFormulaEditorInWorksheet();
        formula.focusFormulaEditor();
    });

    afterEach(function(){
        formula.discardCurrentFormula();
    });

    it('User should be able to create group function that span across chasm trap',function(){
        var formulaText = 'group_sum( product cost ) + group_sum(sale cost )';
        formula.typeInFormulaEditor(formulaText);
        formula.waitForValidFormula();
    });

    it('Should be able to change the root of an existing formula to span across chasm trap',function(){
        var formulaText = 'sum( product cost )';
        formula.typeInFormulaEditor(formulaText);
        formula.waitForValidFormula();
        formula.typeInFormulaEditor('+ sum(sale cost)');
        formula.waitForValidFormula();
    });

    it('Should be able to delete a root from formula',function(){
        var formulaText = 'sum( product cost ) + sum(sale cost )';
        formula.typeInFormulaEditor(formulaText);
        formula.waitForValidFormula();
        formula.clearFormulaEditor();
        formula.typeInFormulaEditor('sum(product cost)');
        formula.waitForValidFormula();
    });

    it('Should not be able to create a formula spanning chasm trap in single aggregation',function(){
        var formulaText = '(product cost + sale cost)';
        formula.typeInFormulaEditor(formulaText);
        formula.waitForNotValidFormula();
        formula.waitForErrorMessage('Formula not supported where we mix quantities across a many-to-many join.');
    });
});
