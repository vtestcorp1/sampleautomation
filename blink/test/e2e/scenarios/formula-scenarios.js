'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Answer Formula - ', function() {
    var SAVED_ANSWER_NAME = '[Formula in answers]';

    // TODO(Rahul): Enable this once the fix for alerting is in.
    xit('should be able to edit formulae created in answers', function(){
        sageInputElement().enter('revenue customer region');
        waitForTableAnswerVisualizationMode();

        formulaFunctions.createAndSaveNewFormulaInAnswer('revenue + tax', 'Answer Formula Column');

        waitForAnswerToLoad('revenue customer region answer formula column');

        formulaFunctions.expandFormulaSourceInAnswer();
        formulaFunctions.openExistingFormulaInAnswer('Answer Formula Column');

        expect(element(formulaFunctions.selectors.FORMULA_EDITOR).count()).toBe(1);
        formulaFunctions.expectFormulaTextToMatch(/revenue \+ tax /gi);

        formulaFunctions.focusFormulaEditor();
        formulaFunctions.clearFormulaEditor();
        formulaFunctions.typeInFormulaEditor('revenue + tax - discount');
        formulaFunctions.waitForFormulaToResolve();
        formulaFunctions.saveCurrentFormula('Answer Formula Column 2');

        waitForAnswerToLoad('revenue customer region answer formula column 2');

        formulaFunctions.openExistingFormulaInAnswer('Answer Formula Column 2');
        formulaFunctions.waitForFormulaToResolve();
        formulaFunctions.expectFormulaTextToMatch(/revenue \+ tax \- discount /gi);
        formulaFunctions.closePopup();

        saveCurrentAnswer(SAVED_ANSWER_NAME);

        tableFunctions.verifyTableColumnNameAtIndex(/customer region/i, 1);
        tableFunctions.verifyTableColumnNameAtIndex(/revenue/i, 2);
        tableFunctions.verifyTableColumnNameAtIndex(/Answer Formula Column 2/, 3);

        formulaFunctions.expandFormulaSourceInAnswer();
        formulaFunctions.openExistingFormulaInAnswer('Answer Formula Column 2');
        formulaFunctions.expectFormulaTextToMatch(/revenue \+ tax \- discount /gi);
        formulaFunctions.closePopup();

        answersTab().click();
        deleteSavedAnswer(SAVED_ANSWER_NAME);
    });

    // Note (sunny): disabled until SCAL-10882 is fixed.
    xit('should show names of formulae created in worksheets: SCAL-10208', function(){
        var worksheetName = 'SCAL-10208-worksheet';
        var savedAnswerName = 'SCAL-10208-answer';
        var formulaName = 'SCAL-10208-Formula';

        dataTab().click();
        deleteMetadataListItems([worksheetName], true);

        createSimpleWorksheet({
            title: worksheetName,
            sources: ['CUSTOMER', 'LINEORDER']
        });

        formulaFunctions.createAndSaveNewFormulaInWorksheet('revenue + tax', formulaName);
        saveBtn().click();

        createSavedAnswerBasedOnWorksheet(worksheetName, savedAnswerName, 'revenue tax ' + formulaName.toLowerCase() + ' ');
        waitForTableAnswerVisualizationMode();

        expect(element(first(TABLE_COLUMN_NAME)).text()).toMatch(/revenue/i);
        expect(element(second(TABLE_COLUMN_NAME)).text()).toMatch(/tax/i);
        // SCAL-10796 : Enable test once this is fixed.
        //expect(element(nth(TABLE_COLUMN_NAME, 3)).text()).toMatch(/SCAL\-10208 Formula/);

        dataTab().click();
        deleteWorksheet(worksheetName);
    });
});
