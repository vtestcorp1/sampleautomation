/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Spec for saved answer actions spec.
 */

'use strict';

describe('Saved answer editor actions spec', function() {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var savedAnswerActions;

    beforeEach(inject(function(_savedAnswerActions_) {
        /* eslint camelcase: 1 */
        savedAnswerActions = _savedAnswerActions_;
    }));

    it('SCAL-20459 Disable save for read only answers', function () {
        var mockAnswer = {
            answerModel: {
                getPermission: function() {
                    return {
                        isReadOnly: function() {
                            return true;
                        }
                    };
                }
            }
        };
        var actionConfig = savedAnswerActions.getSavedAnswerPageActionsConfig(
            mockAnswer
        );

        var saveAction = actionConfig.containerActions[0];
        expect(saveAction.id).toBe('save');
        expect(saveAction.dropdownItemDisabled).toBe(true);
        expect(saveAction.dropdownItemTooltip)
            .toBe('To perform this action please request edit access.');
    });
});
