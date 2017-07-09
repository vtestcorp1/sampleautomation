'use strict';

/* eslint no-undef: 0 */

describe('Pinboard Filter Scenarios', function () {
    var FILTER_OPTION_1 = 'azure',
        FILTER_OPTION_2 = 'black',
        FILTER_OPTION_3 = 'coral',
        CHART_LEGEND_SELECTOR = '.bk-legend .bk-legend-header',
        SAGE_QUERY_FOR_CHART_WITH_LEGEND = 'order date revenue ship priority';

    it('should be able to add pinboard filter with in-answer formula', function() {
        var PINBOARD_FILTER = 'pfwithInAnswerFormula';
        deselectAllSources();
        selectSourcesByName(['Formula Worksheet']);

        queryAndWaitForTable('supplier region const3');

        formulaFunctions.createAndSaveNewFormulaInAnswer('revenue + tax', 'Answer Formula Column');

        waitForAnswerToLoad('supplier region const3 answer formula column');
        addShowingVizToNewPinboard(TABLE_VIZ, false, PINBOARD_FILTER);

        openPinboard(PINBOARD_FILTER);
        pinboardFunctions.openAddFilterPanel();

        sageDataPanelFunctions.openSource('Formula Worksheet');
        sageDataPanelFunctions.addColumn('Supplier Region');

        filterPanelFunctions.waitForFilterPopover(true);
        filterFunctions.checkboxFilters.toggleCheckboxState('asia');
        clickFilterDoneButton();

        waitFor(function (appWindow) {
            return appWindow.$(first(TABLE_ROW) + ' .slick-cell').text() === 'asia3,3574,040,252,700';
        }, 'waiting for correct table value');
        deletePinboard(PINBOARD_FILTER);
    });
});
