'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test search pane: ', function() {
    it('should click on Search Pane and take to Search Tab on left', function() {
        homeTab().click();
        expect(checkClass('.bk-primary-nav-search', 'bk-selected-nav-item')).toBe(false);
        element(HOME_SAGE_BAR).click();
        waitForElement('.bk-sage-data');
        expect(checkClass('.bk-primary-nav-search', 'bk-selected-nav-item')).toBe(true);
    });

    it('should select pinboard to view in main page, verify correct pinboards are loaded', function() {
        var name = 'test_' + Math.floor(Math.random() * 1000),
            query = 'revenue by customer nation';

        goToAnswer();
        sageInputElement().enter(query);
        waitForHighcharts();
        addToPinboards(name, 'column', true, true);

        pinboardsTab().click();
        element(FIRST_ELEMENT + ' .bk-name-content').click();
        waitForTable();
        waitForHighcharts();

        homeTab().click();
        selectChosenOption('.bk-select-box select', name);
        waitForTable();
        waitForHighcharts();
        delPinboard(name);
    });
});
