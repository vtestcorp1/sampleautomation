/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for info card feature.
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Info Card', function () {

    beforeEach(function() {
        selectSageSources(TPCH_TABLES);
        sageInputElement().enter('revenue color');
        waitForTableAnswerVisualizationMode();
    });

    it('should disappear when sage bar is cleared', function() {
        element(INFO_CARD_BUTTON).click();

        // toMatch is a regex match operation
        expect(element(visible(INFO_CARD)).count()).toBe(1);
    });

});

