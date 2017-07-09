/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Wizard class that encapsulates logic for a step-by-step workflow.
 *               Usage:
 *               var listOfStepConfigs = [{
 *                   title: 'step 1',
 *                   contentUrl: 'step-1-content-template-url',
 *                   getNextStepPromise: callbackThatReturnsAPromiseToMoveToNextStep,
 *                   onBack: callback that is called when Back button is clicked in the present step to go to previous one
 *                   onRevisitFromNextStep: callback that is called when this step is revisited when clicked
 *                      on Back in the next state
 *               }, {
 *                   title: 'step 2',
  *                  .....
 *               }];
 *               var wizard = new Wizard(listOfStepConfigs);
 *
 *               wizard.getCurrentStep().getContentUrl();
 *               onNextBtnClick(function () {
 *                  wizard.goToNextStep();
 *               });
 */

'use strict';

blink.app.factory('Wizard', ['loadingIndicator', 'Logger', 'events', function (loadingIndicator, Logger, events) {
    var _logger = Logger.create('user-data-wizard');

    /**
     *
     * @param {Array.<Object>} stepConfigs A list of config objects corresponding to each step.
     *      See detail about a stepConfig object below.
     * @constructor
     */
    function Wizard(stepConfigs) {
        stepConfigs = stepConfigs || [];
        this.steps = stepConfigs.map(function (stepConfig) {
            return new Wizard.Step(stepConfig);
        });
        if (this.steps.length) {
            this.steps[this.steps.length - 1].isLast = true;
        }

        this._currentStep = 0;
        this.isTransitioningToNextStep = false;

        this.start();
    }

    Wizard.prototype.start = function () {
        var currentStep = this.getCurrentStep();
        if (!currentStep || !currentStep.getStartPromise) {
            return;
        }

        loadingIndicator.show({
            showInstantly: true,
            loadingText: 'Loading'
        });
        currentStep.getStartPromise().finally(function () {
            loadingIndicator.hide();
        });
    };

    Wizard.prototype.reset = function () {
        this._currentStep = 0;
    };

    /**
     *
     * @param {number} stepNum
     * @return {Wizard.Step=}
     */
    Wizard.prototype.getStep = function (stepNum) {
        if (stepNum >= this.steps.length) {
            return null;
        }

        return this.steps[stepNum];
    };

    /**
     * @return {Wizard.Step=}
     */
    Wizard.prototype.getCurrentStep = function () {
        return this.getStep(this._currentStep);
    };

    /**
     * True if the given step number 'index' is also the current step number.
     *
     * @param {number} index
     * @return {boolean}
     */
    Wizard.prototype.isCurrentStep = function (index) {
        return index === this._currentStep;
    };

    /**
     * True if the given step number 'index' is before the current step number.
     *
     * @param {number} index
     * @return {boolean}
     */
    Wizard.prototype.isCompletedStep = function (index) {
        return index < this._currentStep;
    };

    /**
     * True if the current step is the last step.
     *
     * @return {boolean}
     */
    Wizard.prototype.isLastStep = function () {
        var currentStep = this.getCurrentStep();
        if (!currentStep) {
            return false;
        }
        return currentStep.isLast;
    };

    /**
     * See Wizard.Step.prototype.getContentUrl documentation below.
     *
     * @return {string}
     */
    Wizard.prototype.getContentUrl = function () {
        var currentStep = this.getCurrentStep();
        if (!currentStep) {
            return '';
        }
        return currentStep.getContentUrl();
    };

    /**
     * See Wizard.Step.prototype.getFooterUrl documentation below.
     *
     * @return {string}
     */
    Wizard.prototype.getFooterUrl = function () {
        var currentStep = this.getCurrentStep();
        if (!currentStep) {
            return '';
        }
        return currentStep.getFooterUrl();
    };

    /**
     * See Wizard.Step.prototype.getProceedInstructions documentation below.
     *
     * @return {string}
     */
    Wizard.prototype.getProceedInstructions = function () {
        var currentStep = this.getCurrentStep();
        if (!currentStep) {
            return '';
        }
        return currentStep.getProceedInstructions();
    };

    Wizard.prototype.isNextDisabled = function () {
        if (this.isTransitioningToNextStep) {
            return true;
        }
        var currentStep = this.getCurrentStep();
        if (!currentStep) {
            return true;
        }
        return currentStep.isNextDisabled();
    };

    /**
     * @return {boolean}
     */
    Wizard.prototype.hideFooterForCurrentStep = function () {
        var currentStep = this.getCurrentStep();
        if (!currentStep) {
            return false;
        }
        return currentStep.hideFooter;
    };

    /**
     * If the wizard can proceed to next step, then invokes the promise for next step and on success
     * advances the current step.
     */
    Wizard.prototype.goToNextStep = function () {
        if (this.isNextDisabled()) {
            return;
        }

        var currentStep = this.getCurrentStep();
        if (!currentStep || !currentStep.getNextStepPromise) {
            return;
        }
        this.isTransitioningToNextStep = true;

        var self = this;
        loadingIndicator.show({
            showInstantly: true,
            loadingText: 'Loading'
        });
        currentStep.getNextStepPromise().then(function () {
            self.isTransitioningToNextStep = false;
            loadingIndicator.hide();
            self._currentStep = Math.min(self._currentStep + 1, self.steps.length);
        }, function () {
            self.isTransitioningToNextStep = false;
            loadingIndicator.hide();
        });

    };

    /**
     * Makes the wizard go to previous step.
     */
    Wizard.prototype.goToPreviousStep = function () {
        var currentStep = this.getCurrentStep();
        if (currentStep && currentStep.onBack) {
            currentStep.onBack();
        }
        // Call onRevisitFromNextStep of the previous step
        if (this._currentStep > 0 && this.getStep(this._currentStep - 1).onRevisitFromNextStep) {
            this.getStep(this._currentStep - 1).onRevisitFromNextStep();
        }

        this._currentStep = Math.max(0, this._currentStep - 1);
    };

    Wizard.prototype.finish = function () {
        if (this.isNextDisabled()) {
            return;
        }

        var currentStep = this.getCurrentStep();
        if (!this.isLastStep() || !currentStep || !currentStep.getNextStepPromise) {
            return;
        }

        this.isTransitioningToNextStep = true;

        loadingIndicator.show({
            showInstantly: true,
            loadingText: 'Loading'
        });
        var self = this,
            promise = currentStep.getNextStepPromise();
        if (promise) {
            promise.then(function (){
                self.isTransitioningToNextStep = false;
                loadingIndicator.hide();
            }, function () {
                self.isTransitioningToNextStep = false;
                loadingIndicator.hide();
            });
        }
    };

    /**
     *
     * @param {Object} stepConfig A configuration object with following properties on a step:
     *      - @type {string} title
     *      - @type {boolean} isLast
     *      - @type {boolean} isOptional
     *      - @type {string} contentUrl
     *      - @type {string} footerUrl
     *      - @type {string} proceedInstructions
     *      - @type {Function} getProceedInstructions
     *      - @type {Function} getNextStepPromise
     *
     * @constructor
     */
    Wizard.Step = function (stepConfig) {
        stepConfig = stepConfig || {};

        /**
         *
         * @type {string}
         */
        this.title = stepConfig.title || '';

        /**
         *
         * @type {boolean}
         */
        this.isLast = stepConfig.isLast || false;

        /**
         *
         * @type {boolean}
         */
        this.isOptional = stepConfig.isOptional || false;

        /**
         *
         * @type {string}
         */
        this.contentUrl = stepConfig.contentUrl || '';

        /**
         *
         * @type {string}
         */
        this.footerUrl = stepConfig.footerUrl || '';

        /**
         *
         * @type {string}
         */
        this.proceedInstructions = stepConfig.proceedInstructions || '';

        /**
         *
         * @type {Function:string}
         */
        this.getProceedInstructionsFn = stepConfig.getProceedInstructions;

        /**
         *
         * @type {Function}
         */
        this.getNextStepPromise = stepConfig.getNextStepPromise;

        /**
         * If supplied, the promise will be resolved before showing
         * the start step of the wizard.
         * @type {Function}
         */
        this.getStartPromise = stepConfig.getStartPromise;

        /**
         *
         * @type {Function}
         */
        this.onBack = stepConfig.onBack;

        /**
         *
         * @type {Function}
         */
        this.onRevisitFromNextStep = stepConfig.onRevisitFromNextStep;

        /**
         *
         * @type {Function}
         */
        this.isNextDisabled = stepConfig.isNextDisabled || function () {
            return false;
        };

        /**
         *
         * @type {boolean}
         */
        this.hideFooter = stepConfig.hideFooter || false;

    };

    /**
     * If the step configuration provided a function to retrieve proceed instructions, it call that. Otherwise,
     * returns the proceedInstructions provided in the config.
     *
     * @return {string=}
     */
    Wizard.Step.prototype.getProceedInstructions = function () {
        if (this.getProceedInstructionsFn) {
            return this.getProceedInstructionsFn();
        }

        return this.proceedInstructions;
    };

    /**
     *
     * @return {string}
     */
    Wizard.Step.prototype.getContentUrl = function () {
        return this.contentUrl;
    };

    /**
     *
     * @return {string}
     */
    Wizard.Step.prototype.getFooterUrl = function () {
        return this.footerUrl;
    };

    return Wizard;
}]);
