/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview E2E tests for alerts on navigating away from documents with unsaved changes
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Unsaved changes alert', function () {

    var SAVED_DOCUMENT_NAME_PREFIX = 'Unsaved changes alert';

    function initSuite() {
        beforeEach(function(){
            callFunctionWithElement(null, function($body, window, $){
                window.blink.env.enableUnsavedChangesAlert = true;
            });
        });
        afterEach(function(){
            callFunctionWithElement(null, function($body, window, $){
                window.blink.env.enableUnsavedChangesAlert = false;
            });
        });
    }

    function tryNavigatingAwayWithUnsavedChanges(shouldExpectAlert, currentDocumentType, doNotDismissDialog) {
        homeTab().click();
        expect(dialog().count()).toBe(shouldExpectAlert ? 1 : 0);
        if (shouldExpectAlert && doNotDismissDialog) {
            return;
        }

        if (shouldExpectAlert) {
            secondaryDialogBtn().click();
        }

        var url = browser().location().url();
        if (shouldExpectAlert) {
            expect(url).toMatch('/' + currentDocumentType + '/');
        } else {
            expect(url).toBe('/');
        }
    }

    function saveAndExit() {
        element('.bk-confirm-async-btn').click();
        waitForElementCountToBe('.bk-dialog.modal', 0);
    }

    function discardAndExit() {
        element('.bk-confirm-btn').click();
        waitForElementCountToBe('.bk-dialog.modal', 0);
    }


    describe('for pinboards', function(){
        var DOC_TYPE = 'pinboard',
            savedDocumentName = SAVED_DOCUMENT_NAME_PREFIX + ' saved pinboard';

        function createAndOpenPinboard() {
            var query = 'revenue color';
            sageInputElement().enter(query);
            waitForAnswerToLoad(query);
            addShowingVizToNewPinboard(CHART_VIZ);
            openPinboard();
            waitForHighcharts();
        }

        function deletePinboard(pinboardName) {
            pinboardsTab().click();
            expect(pinboardListItemContaining(pinboardName).count()).toBe(1);
            delPinboard(pinboardName);
        }

        initSuite();

        it('[SMOKE] should not show up for a new pinboard without changes', function(){
            createAndOpenPinboard();
            tryNavigatingAwayWithUnsavedChanges(false, DOC_TYPE);
            deletePinboard(TEST_PINBOARD_NAME);
        });

        it('should show up on viz position change', function (){
            createAndOpenPinboard();
            dragChart();
            endChartDrag();
            waitForElementCountToBe(PINBOARD_DRAG_PLACEHOLDER, 0);

            tryNavigatingAwayWithUnsavedChanges(true, DOC_TYPE);
            // The pinboard is saved to allow navigation out of the pinboard editing scope.
            saveCurrentPinboard(TEST_PINBOARD_NAME_2);

            deletePinboard(TEST_PINBOARD_NAME);
            deletePinboard(TEST_PINBOARD_NAME_2);
        });

        it('should not show up on updating viz from viz context', function (){
            createAndOpenPinboard();

            pinboardFunctions.openVizContext(CHART_VIZ);
            waitForTableAnswerVisualizationMode();
            pinboardFunctions.closeVizContextWithChanges(true);

            deletePinboard(TEST_PINBOARD_NAME);
        });
    });

    describe('for aggregated worksheets', function(){
        var DOC_TYPE = 'aggregated-worksheet',
            WORKSHEET_QUERY = 'revenue color',
            WORKSHEET_QUERY_2 = 'revenue color customer region',
            WORKSHEET_NAME = '[aggr ws]';

        it('should not trigger show up navigating away without changes: SCAL-12850', function(){
            aggregatedWorksheetFunctions.createAggregatedWorksheet(WORKSHEET_QUERY, WORKSHEET_NAME);
            tryNavigatingAwayWithUnsavedChanges(false, DOC_TYPE);
            deleteWorksheet(WORKSHEET_NAME);
        });

        it('[SMOKE] should not trigger alert after making changes, saving and then navigating away from an aggr ws', function () {
            aggregatedWorksheetFunctions.createAggregatedWorksheet(WORKSHEET_QUERY, WORKSHEET_NAME);
            sageInputElement().enter(WORKSHEET_QUERY_2);
            waitForAnswerToLoad(WORKSHEET_QUERY_2);
            saveBtn(true).click();
            tryNavigatingAwayWithUnsavedChanges(false, DOC_TYPE);
            deleteWorksheet(WORKSHEET_NAME);
        });
    });
});
