/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit test for user-data-wizard.js
 */

'use strict';

describe('Wizard', function () {
    var Wizard;
    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            Wizard = $injector.get('Wizard');
        });
    });

    it('should initialize with zero steps', function () {
        var wizard = new Wizard();
        expect(wizard.steps.length).toBe(0);
        expect(wizard.getCurrentStep()).toBeNull();
    });

    it('should initialize with one step', function () {
        var wizard = new Wizard([{}]);
        expect(wizard.steps.length).toBe(1);
        expect(wizard.getCurrentStep()).not.toBeNull();

        expect(wizard.isLastStep()).toBeTruthy();
        expect(wizard.getStep(1)).toBeNull();
        expect(wizard.isCurrentStep(0)).toBeTruthy();
        expect(wizard.isCompletedStep(0)).toBeFalsy();
        wizard.goToNextStep();
        expect(wizard.isCurrentStep(1)).toBeFalsy();
        expect(wizard.isCompletedStep(0)).toBeFalsy();
    });

    it('should initialize with multiple steps', function () {
        var wizard = new Wizard([{
            getNextStepPromise: function () {
                return {
                    then: function (callback) {
                        callback();
                    }
                };
            }
        }, {}]);
        expect(wizard.steps.length).toBe(2);
        expect(wizard.getCurrentStep()).not.toBeNull();

        expect(wizard.isLastStep()).toBeFalsy();
        expect(wizard.getStep(1)).not.toBeNull();
        expect(wizard.isCurrentStep(0)).toBeTruthy();
        expect(wizard.isCompletedStep(0)).toBeFalsy();
        wizard.goToNextStep();
        expect(wizard.isCurrentStep(1)).toBeTruthy();
        expect(wizard.isCompletedStep(0)).toBeTruthy();
        expect(wizard.isLastStep()).toBeTruthy();

        wizard.goToPreviousStep();
        expect(wizard.isCurrentStep(0)).toBeTruthy();
    });

    it('should return proceed instructions per the step configuration', function () {
        var wizard = new Wizard([{
            proceedInstructions: 'foo'
        }]);
        expect(wizard.getProceedInstructions()).toBe('foo');

        wizard = new Wizard([{
            proceedInstructions: 'foo',
            getProceedInstructions: function () {
                return 'bar';
            }
        }]);
        expect(wizard.getProceedInstructions()).toBe('bar');
    });
});
