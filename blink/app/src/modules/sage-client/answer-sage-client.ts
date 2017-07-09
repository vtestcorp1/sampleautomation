/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * The interface used by answer components to talk to sage and update the answer state.
 * Also a carrier of sageModel which acts as a state for sage bar.
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../base/decorators';
import {debounce} from '../../base/utils/ts-utils';

let autoCompleteObjectUtil = ngRequire('autoCompleteObjectUtil');
let autoCompleteService = ngRequire('autoCompleteService');
let blinkAutoCompleteService = ngRequire('blinkAutoCompleteService');
let CancelablePromise = ngRequire('CancelablePromise');
let Logger = ngRequire('Logger');
let sessionService = ngRequire('sessionService');
let sageUtil = ngRequire('sageUtil');
let SageModel = ngRequire('SageModel');
let $q = ngRequire('$q');

declare let addBooleanFlag: any;
declare let addNumberFlag: any;
declare let flags: any;
declare let sage: any;

addBooleanFlag(
    'enableSageUserFeedback',
    'This flag enables SageUserFeedback',
    false
);

addNumberFlag(
    'queryUpdateDebounceThreshold',
    'Threshold to wait for query changes to settle before system tries to fetch answer',
    750
);

@Provide('AnswerSageClient')
//TODO (Rahul): Add deferred chaining.
export class AnswerSageClient {
    private _logger = Logger.create('answer-sage-client');
    private pendingPromise;
    private sageModel;
    private documentModel;
    private onQueryUpdate;
    private onClientUse;
    private sageModelUpdateCallbacks;
    private replayRequest;
    private enableSageUserFeedback;
    private lastQueryContext;

    /**
     *
     * @param oldSageContext {sage.ACContext}
     * @param newSageContext {sage.ACContext}
     * @param index {number}
     * @returns {boolean}
     */
    static compareHashKeyAtIndex(oldSageContext, newSageContext, index) {
        var oldHashKey = sageUtil.getHashKey(oldSageContext, index);
        var newHashKey = sageUtil.getHashKey(newSageContext, index);
        return  oldHashKey !== newHashKey;
    }

    static isSageModelBeingEdited(sageModel) {
        return (sageModel.hasNonEmptyUnrecognizedTokensInTheMiddle()
        || sageModel.needsJoinPathDisambiguation());
    }

    /**
     * @param {AnswerDocumentModel} documentModel
     * @param {sage.FormattedTokens} formattedTokens
     * @param {function} onQueryUpdate
     *
     * @constructor
     */
    constructor(documentModel, formattedTokens, onQueryUpdate, onClientUse) {
        this.sageModel = new SageModel();
        this.sageModel.updateUsingFormattedTokens(formattedTokens);
        this.documentModel = documentModel;
        this.lastQueryContext = this.getContext();
        this.onQueryUpdate = onQueryUpdate;
        this.onClientUse = onClientUse || _.noop;
        this.sageModelUpdateCallbacks = [];
        this.replayRequest = _.noop;
        this.pendingPromise = null;
        this.enableSageUserFeedback = flags.getValue('enableSageUserFeedback') ||
            sessionService.isSageUserFeedbackEnabled();
    }

    /**
     * Destroy removes all future callback handling from this object
     */
    public destroy = function() {
        this.onQueryUpdate = _.noop;
        this.onClientUse = _.noop;
        this.sageModelUpdateCallbacks = [];
    };

    /**
     *
     * @param {AnswerDocumentModel} documentModel
     * @param {sage.FormattedTokens} formattedTokens
     * @param {function} onQueryUpdate
     */
    public update(documentModel, formattedTokens, onQueryUpdate, onClientUse) {
        this.sageModel = new SageModel();
        this.sageModel.updateUsingFormattedTokens(formattedTokens);
        this.documentModel = documentModel;
        this.onQueryUpdate = onQueryUpdate;
        this.onClientUse = onClientUse;
    }

    public addSageModelUpdateCallback(callback) {
        this.sageModelUpdateCallbacks.push(callback);
    }

    public removeSageModelUpdateCallback(callback) {
        this.sageModelUpdateCallbacks.remove(callback);
    }

    public getSageModel() {
        return this.sageModel;
    }

    public setContext = function(context) {
        this.documentModel.setContext(context);
        let formattedTokens = context.getTable()[0].getFormatted();
        this.sageModel.updateUsingFormattedTokens(formattedTokens);
    };

    public getContext = function() {
        return this.documentModel.getContext();
    };

    public getCurrentIndex = function() {
        return this.documentModel.getCurrentIndex();
    };

    public getReplayRequest = function() {
        return this.replayRequest;
    };

    /**
     *
     * @param {sage.ACTableRequest} tableRequest
     * @param {Boolean} [shouldNotOverrideQuery]
     * @param {Boolean} [isSubRequest] This boolean represents that the current request
     *                                 is part of another request, such requests should not cancel
     *                                 old promise and does not need to mark clientUse, as the
     *                                 original query should have already marked it as such.
     *
     * @returns {Promise}
     */
    public editTable = (tableRequest, shouldNotOverrideQuery?, isSubRequest?) => {
        if (this.pendingPromise && !isSubRequest) {
            this.pendingPromise.cancel();
        }
        if (!isSubRequest) {
            this.onClientUse();
        }

        var self: AnswerSageClient = this;

        var currentContext = self.getContext();
        var currentIndex = self.getCurrentIndex();
        var dataScopeTables = tableRequest.getDataScopeLogicalTables();
        var tables = currentContext.getTables();
        tables.forEach(function(table, index) {
            if (index < currentIndex && dataScopeTables.indexOf(table) < 0) {
                dataScopeTables.push(table.getId());
            }
        });

        /**
         * @param {sage.AnswerResponse} answerResponse
         */
        var onSuccess = function (sageResponse) {

            if ( self.isSageUserFeedbackEnabled() && !!sageResponse.debugCallback ) {
                self.replayRequest = sageResponse.debugCallback;
            }

            var answerResponse = sageResponse.answerResponse;
            var newContext = answerResponse.getContext();

            self.documentModel.setContext(newContext);

            self.sageModel.objectResults = answerResponse.getObjectResults();

            var tableResponse = answerResponse.getTableResponse();
            var tableError = answerResponse.getTableError(self.documentModel.getCurrentIndex());

            self._processTableResponse(tableResponse, tableError);

            self.sageModel.showingExactMatches = tableRequest.isExactMatchOnly();
            self.sageModel.shouldOverrideTokenText = !shouldNotOverrideQuery;

            self._fireSageModelUpdateCallbacks();

            self.updateAnswerIfRequired(currentContext, newContext, currentIndex);

            var sageResponseErrorInfo = self.sageModel.sageResponseErrorInfo;
            return sageResponseErrorInfo;
        };

        var onFailure = function () {
            return $q.reject();
        };

        this.pendingPromise = new CancelablePromise(
            autoCompleteService.editTable(
                self.documentModel.getContext(),
                self.documentModel.getCurrentIndex(),
                tableRequest,
                self.isSageUserFeedbackEnabled()
            )
        );

        return this.pendingPromise.then(onSuccess, onFailure);
    }

    /**
     *
     * @param {Array.<sage.QueryTransform>} transformations
     * @param {Boolean} [isSubRequest] This boolean represents that the current request
     *                                 is part of another request, such requests should not cancel
     *                                 old promise and does not need to mark clientUse, as the
     *                                 original query should have already marked it as such.
     * @returns {Promise}
     */
    public transformTable = (transformations, isSubRequest?) => {
        if (this.pendingPromise && !isSubRequest) {
            this.pendingPromise.cancel();
        }
        if (!isSubRequest) {
            this.onClientUse();
        }

        var self: AnswerSageClient = this;
        var currentContext = self.getContext();
        var currentIndex = self.getCurrentIndex();
        var tableAtIndex = currentContext.getTables()[currentIndex];
        tableAtIndex.setTokens(self.sageModel.getOnlyRecognizedTokens());

        /**
         * @param {sage.AnswerResponse} answerResponse
         */
        var onSuccess = function (sageResponse) {

            var answerResponse = sageResponse.answerResponse;
            var newContext = answerResponse.getContext();

            self.documentModel.setContext(newContext);

            var tableResponse = answerResponse.getTableResponse();
            var tableError = answerResponse.getTableError(self.documentModel.getCurrentIndex());

            self._processTableResponse(tableResponse, tableError);

            self.sageModel.shouldOverrideTokenText = true;
            self._fireSageModelUpdateCallbacks();

            self.updateAnswerIfRequired(currentContext, newContext, currentIndex);

            var sageResponseErrorInfo = self.sageModel.sageResponseErrorInfo;
            return sageResponseErrorInfo;
        };

        var onFailure = function () {
            return $q.reject();
        };

        this.pendingPromise = new CancelablePromise(
            autoCompleteService.transformTable(
                self.documentModel.getContext(),
                self.documentModel.getCurrentIndex(),
                transformations
            )
        );

        return this.pendingPromise.then(onSuccess, onFailure);
    }

    /**
     *
     * @param {sage.ACFormula} formula
     * @returns {Promise}
     */
    public saveFormula = (formula) => {
        if (this.pendingPromise) {
            this.pendingPromise.cancel();
        }
        this.onClientUse();

        var context = this.getContext();
        var currentIndex = this.getCurrentIndex();
        var initialFormulae = context.getFormulae();

        var self: AnswerSageClient = this;

        /**
         * @param {sage.AnswerResponse} answerResponse
         */
        var onSuccess = function (sageResponse) {

            var answerResponse = sageResponse.answerResponse;
            var newContext = answerResponse.getContext();

            self.sageModel.tokens = newContext.getTables()[currentIndex].getTokens();
            self.documentModel.setContext(newContext);

            var formulaId = formula.getId();
            var initialFormulaIndex = initialFormulae.findIndex(function(formula) {
                return formula.getId() === formulaId;
            });

            var promise;
            if (initialFormulaIndex === -1) {
                var addFormulaTransform = sage.QueryTransform.createAddColumnTransformation({
                    columnGuid: formulaId
                });
                promise = self.transformTable([addFormulaTransform], true);
            } else {
                // Note(Rahul): Here we do not call updateAnswerIsRequired
                // because formula name change wants to call
                // callosum even in absense of sage query update.
                self.updateAnswer(newContext, currentIndex);

                var table = newContext.getTables()[currentIndex];
                var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                tableRequest.setInputTokens(table.getTokens());

                promise = self.editTable(tableRequest, false, true);
            }

            return promise;
        };

        var onFailure = function () {
            return $q.reject();
        };

        this.pendingPromise = new CancelablePromise(
            blinkAutoCompleteService.saveFormula(
                self.documentModel.getContext(),
                formula
            )
        );

        return this.pendingPromise.then(onSuccess, onFailure);
    }

    /**
     *
     * @param {sage.ACFormula} formula
     * @returns {Promise}
     */
    public removeFormula = (formula) => {
        if (this.pendingPromise) {
            this.pendingPromise.cancel();
        }
        this.onClientUse();

        var context = this.getContext();
        var currentIndex = this.getCurrentIndex();

        var self: AnswerSageClient = this;

        /**
         * @param {sage.AnswerResponse} answerResponse
         */
        var onSuccess = function (sageResponse) {
            var answerResponse = sageResponse.answerResponse;
            var newContext = answerResponse.getContext();

            self.sageModel.tokens = newContext.getTables()[currentIndex].getTokens();
            self.documentModel.setContext(newContext);

            self.updateAnswerIfRequired(context, newContext, currentIndex);

            var table = newContext.getTables()[currentIndex];
            var tableTokens = table.getTokens();

            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
            tableRequest.setInputTokens(tableTokens);

            return self.editTable(tableRequest, false, true);
        };

        var onFailure = function () {
            return $q.reject();
        };

        this.pendingPromise = new CancelablePromise(
            blinkAutoCompleteService.removeFormula(
                self.documentModel.getContext(),
                formula
            )
        );

        return this.pendingPromise.then(onSuccess, onFailure);
    }

    /**
     * Processes TableResponse to populate changes in SageModel
     *
     * @param {sage.ACTableResponse} tableResponse
     * @param {sage.ACTableError} tableError
     * @private
     */
    private _processTableResponse = (tableResponse, tableError) => {
        // start time profiling
        this._logger.time(Logger.ProfileMessages.SAGE_RESPONSE_PROCESSING);

        var self: AnswerSageClient = this;

        sageUtil.preProcessQueryCompletions(tableResponse);

        var newTokens = tableResponse.getNewTokens();
        self.sageModel.queryCompletions = sageUtil.getQueryCompletions(tableResponse);
        self.sageModel.dataCompletions= tableResponse.getDataCompletions();
        self.sageModel.languageCompletions = tableResponse.getLanguageCompletions();
        self.sageModel.completionStartPosition = tableResponse.getCompletionPosition();

        // Caching this here to reuse when we avoid the sage Round trip query.
        self.sageModel.requiresFullLineage =
            tableResponse.hasDuplicatesInQueryCompletionShortLineages();

        // newTokens is always the complete set of tokens representing the sage bar state.
        // unless user is editing in the middle
        // unrecognized tokens will be at the end of the newTokens array.
        self.sageModel.tokens = newTokens;
        self.sageModel.parseQueryFragments(newTokens, tableResponse.getPhrases());
        var accessibleTables = tableResponse.getAccessibleTables();
        self.sageModel.setAccessibleTables(accessibleTables);

        // note down if there was any unique tokens used to derive the sage query
        // example: user typed "reve" to get a sage query. we should note that the
        // unique token was "revenue"
        if (tableResponse.getUniqueCompletionUsedForQuery()
            && self.sageModel.queryCompletions.length) {
            var qCompNewTokens = self.sageModel.queryCompletions[0].getNewTokens();
            self.sageModel.tokenForUniqueCompletion =
                qCompNewTokens.length ? qCompNewTokens[0] : null;
        } else {
            self.sageModel.tokenForUniqueCompletion = null;
        }

        self.sageModel.joinDisambiguationHelper = sageUtil.setupSageForJoinDisambiguation(
            tableResponse,
            function (resolvedTokens) {
                self.sageModel.setTokens(resolvedTokens);
            }
        );

        self.sageModel.dropdownTokenIndex = tableResponse.getCompletionPosition();

        if (self.sageModel.needsJoinPathDisambiguation()) {
            self.sageModel.dropdownTokenIndex =
                self.sageModel.joinDisambiguationHelper.getWorkingTokenIndex();
        }

        if (!!tableError) {
            //TODO(Rahul/QoQ): TableError can be used directly
            this.sageModel.sageResponseErrorInfo = {
                severity: tableError.getSeverity(),
                errorMessage: tableError.getErrorMessage(),
                errorMessagePosition: tableError.getErrorMessagePosition(),
                errorSpan: tableError.getErrorSpan(),
                errorCode: tableError.getErrorCode()
            };

            if (self.sageModel.needsJoinPathDisambiguation()) {
                //NOTE(Rahul) Join Disambiguation is sent by sage as error,
                // we are simulating this as a warning.
                this.sageModel.sageResponseErrorInfo.severity = sage.ErrorSeverity.WARNING;
            }
        } else {
            this.sageModel.sageResponseErrorInfo = {};
        }

        // end time profiling
        this._logger.timeEnd(Logger.ProfileMessages.SAGE_RESPONSE_PROCESSING);
    }

    private _fireSageModelUpdateCallbacks = () => {
        this.sageModelUpdateCallbacks.forEach(function(callback) {
            callback();
        });
    }

    /**
     *
     * @param newSageContext {sage.ACContext}
     * @param index {number}
     */
    @debounce(flags.getValue('queryUpdateDebounceThreshold'), true)
    private updateAnswer(newSageContext, index) {
        var contextClone = _.cloneDeep(newSageContext);
        this.lastQueryContext = contextClone;

        var tableAtIndex = contextClone.getTables()[index];
        tableAtIndex.setTokens(this.sageModel.getOnlyRecognizedTokens());
        let accessibleTables = this.sageModel.getAccessibleTables();

        this.onQueryUpdate(contextClone, index, accessibleTables);
    }

    private isSageUserFeedbackEnabled = () => {
        return this.enableSageUserFeedback;
    }

    /**
     *
     * @param oldSageContext {sage.ACContext}
     * @param newSageContext {sage.ACContext}
     * @param index {number}
     * @returns {boolean}
     */
    private updateAnswerIfRequired = (oldSageContext, newSageContext, index) => {
        var hasHashKeyChanged =
            AnswerSageClient.compareHashKeyAtIndex(this.lastQueryContext, newSageContext, index);
        var isSageModelInEditState =
            AnswerSageClient.isSageModelBeingEdited(this.sageModel);

        if (!isSageModelInEditState && hasHashKeyChanged) {
            this.updateAnswer(newSageContext, index);
        }
    }
}
