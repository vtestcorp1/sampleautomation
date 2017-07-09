'use strict';

/* eslint no-undef: 0 */

describe('Pinboard', function () {

    var FILTER_OPTION_1 = 'azure',
        FILTER_OPTION_2 = 'black',
        FILTER_OPTION_3 = 'coral',
        CHART_LEGEND_SELECTOR = '.bk-legend .bk-legend-header',
        SAGE_QUERY_FOR_CHART_WITH_LEGEND = 'order date revenue ship priority';

    //TODO(Ashish): Enable once the semantics of reset layout are clear.
    xit('should re-render charts on reset layout', function () {
        var pinboardName = 'chartRerenderOnReset';
        createPinboard(true, SAGE_QUERY_FOR_CHART_WITH_LEGEND, CHART_VIZ, pinboardName);
        openPinboard(pinboardName);
        waitForElementCountToBe(CHART_LEGEND_SELECTOR, 1);
        expect(element(visible(CHART_LEGEND_SELECTOR)).count()).toBe(1);

        resizeVizHeight('.bk-viz[type=chart]', -300);
        expect(element(CHART_LEGEND_SELECTOR).count()).toBe(0);
        expect(element(visible(CHART_LEGEND_SELECTOR)).count()).toBe(0);

        element(RESET_LAYOUT_BTN).click();
        expect(element(CHART_LEGEND_SELECTOR).count()).toBe(1);
        expect(element(visible(CHART_LEGEND_SELECTOR)).count()).toBe(1);

        delPinboard(pinboardName);
    });

    xit('should not try to save and reload a read-only pinboard on viz-context close action (SCAL-9281)', function(){
        createPinboard(true, 'revenue customer region', CHART_VIZ);
        openPinboard();

        shareBtn().click();

        // Click the add user header to expand the section
        element('.bk-share-dialog .bk-add-users-header').click();
        // Pick a user through the add user autocomplete input
        selectUiSelectOption(shareFunctions.selectors.SHARE_DIALOG_ADD_USER_SELECT, 'guest');
        // Give edit permissions
        select('newPermissionType').option('Can View');
        element('.bk-share-dialog .bk-add-permissions-btn').click();
        // Expect a new row in the permission list with correct user name and permission type
        element('.bk-share-dialog .bk-done-btn').click();

        reLogin('guest', 'guest');
        openPinboard();
        pinboardFunctions.openVizContext(CHART_VIZ);
        waitForElement(getSelectorInVizContext(CHART_VIZ));
        element('.bk-viz-context .bk-close').click();
        waitForElementCountToBe(VIZ_CONTEXT, 0);
        reLogin(ADMIN_USERNAME, ADMIN_PASSWORD);

        delPinboard();
    });

    it('should allow keyboard navigation in presentation mode even if a chart viz is empty: SCAL-10149', function(){
        var pinboardName = 'keyboardNavInPresentation';
        createPinboard(true, 'revenue customer region', CHART_VIZ, pinboardName);
        var query = 'revenue customer region revenue < 0';
        sageInputElement().enter(query);
        waitForAnswerToLoad(query);
        waitForElementCountToBe(visible('.bk-viz-chart .bk-no-content-placeholder'), 1);
        addChartVizToPinboard(pinboardName);
        openPinboard(pinboardName);
        maximizeChart(0);

        waitForElementCountToBe(visible('.bk-viz-chart .bk-no-content-placeholder'), 0);
        chartFunctions.presentationModeNavigateNext();
        waitForElementCountToBe(visible('.bk-viz-chart .bk-no-content-placeholder'), 1);
        chartFunctions.presentationModeNavigatePrevious();
        waitForElementCountToBe(visible('.bk-viz-chart .bk-no-content-placeholder'), 0);

        delPinboard(pinboardName);
    });
});
