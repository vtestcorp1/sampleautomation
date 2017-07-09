/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Spec for Aggregated worksheet editor actions spec.
 */

'use strict';

describe('Aggregated worksheet editor actions spec', function() {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var aggregatedWorksheetEditorActions;

    beforeEach(inject(function(_aggregatedWorksheetEditorActions_) {
        /* eslint camelcase: 1 */
        aggregatedWorksheetEditorActions = _aggregatedWorksheetEditorActions_;
    }));

    it('SCAL-19847 Disable sharing from aggregated worksheet edit view', function () {
        var mockAnswer = {};
        var actionConfig = aggregatedWorksheetEditorActions.getAggrWorksheetEditorActionsConfig(
            mockAnswer
        );
        expect(actionConfig.containerActions.length).toBe(2);
        expect(actionConfig.containerActions[1].id).toBe('share');
        expect(actionConfig.containerActions[1].dropdownItemDisabled).toBe(true);
        expect(actionConfig.containerActions[1].dropdownItemTooltip)
            .toBe('Please share the worksheet from data tab.');
    });
});
