'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test system health pane: ', function() {
    it('should click on System Health tab and see the pinboard', function() {
        var systemHealthTabPageSelector = 'li:contains("System Health")';
        var answerBookName1 = 'Cluster Summary';
        adminMenuItem().click();
        waitForElement(systemHealthTabPageSelector);
        element(systemHealthTabPageSelector).click();
        waitForAnswerToLoad('Cluster Summary');
    });
});
