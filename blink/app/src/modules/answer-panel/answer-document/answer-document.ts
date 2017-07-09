/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is the answer component for viewing ad-hoc answer.
 * This component performs the following tasks.
 * - Initialize the answer model on load based on current route.
 * - Url management for the ad-hoc answer
 *   - Update the app route on answer model changes.
 *   - Watch for url changes and update answer model accordingly.
 *   - Integrate with answer restoration service to get and set context.
 * - Provide answer model and configurable properties to answer document.
 */

import {Component, ngRequire} from 'src/base/decorators';
import {BaseComponent} from '../../../base/base-types/base-component';
import IPromise = angular.IPromise;
import {AnswerPageComponent} from '../answer-page/answer-page';
import {AnswerDocumentConfig} from './answer-document-config';

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let AnswerDocumentModel = ngRequire('AnswerDocumentModel');
let AnswerSageClient = ngRequire('AnswerSageClient');
let answerService = ngRequire('answerService');
let autoCompleteObjectUtil = ngRequire('autoCompleteObjectUtil');
let blinkAutoCompleteService = ngRequire('blinkAutoCompleteService');
let formulaEditorPopupService = ngRequire('formulaEditorPopupService');
let jsonConstants = ngRequire('jsonConstants');
let Logger = ngRequire('Logger');
let sageDataSourceService = ngRequire('sageDataSourceService');
let sageUtil = ngRequire('sageUtil');
let UserAction = ngRequire('UserAction');
let worksheetService = ngRequire('worksheetService');

declare var sage: any;

interface ContextInfo {
    context: any;
    contextIndex: number;
}

@Component({
    name: 'bkAnswerDocument',
    templateUrl: 'src/modules/answer-panel/answer-document/answer-document.html'
})
export class AnswerDocumentComponent extends BaseComponent {
    public answerDocumentModel: any;
    public answerPageComponent: AnswerPageComponent;
    public sageClient: any;

    private isDestroyed: boolean;
    private isReadOnly: boolean;
    private logger: any;
    // TODO(Jasmeet): Can we remove this latest model?.
    private latestAnswerModel: any;
    private onAnswerModelChange: Function;
    private answerDocumentConfig: AnswerDocumentConfig;
    private formulaCallbacks: any;
    private pendingAnswerPromise: any;
    private answerRequestType: number;

    onDestroy() {
        this.isDestroyed = true;
        if (this.sageClient) {
            this.sageClient.destroy();
        }
    }

    constructor (
        answerModel: any,
        onAnswerModelChange: Function,
        answerDocumentConfig: AnswerDocumentConfig,
        answerRequestType: number
    ) {
        super();
        this.isDestroyed = false;
        this.isReadOnly = false;
        this.logger = Logger.create('answer-document-controller');
        this.latestAnswerModel = null;
        this.answerDocumentModel = null;
        this.sageClient = null;
        this.onAnswerModelChange = onAnswerModelChange;
        this.answerDocumentConfig = answerDocumentConfig;
        this.answerRequestType = answerRequestType;

        sageDataSourceService.invalidateCache();
        this.latestAnswerModel = answerModel;
        let contextInfo: ContextInfo = this.getInitializationContext(answerModel);
        this.setupDocumentAndClient(contextInfo.context, contextInfo.contextIndex);
        this.answerDocumentModel.setCurrentAnswerModel(answerModel);
        this.answerPageComponent = new AnswerPageComponent(
            this.latestAnswerModel,
            this.sageClient,
            this.onAddFormulaRequest,
            this.answerDocumentConfig.disableAutoTitle,
            this.answerDocumentConfig.sageSearchOnInit,
            this.answerDocumentConfig.actionsConfig
        );

        this.formulaCallbacks = {
            validateName: this.validateFormulaName,
            onAddFormula: this.onAddFormula,
            onCancel: this.onFormulaEditCancel
        };
    }

    public setAnswerModel = (answerModel?: any) : void => {
        if (this.latestAnswerModel === answerModel) {
            return;
        }
        this.cancelAnswerCall();

        this.latestAnswerModel = answerModel;
        let contextInfo: ContextInfo = this.getInitializationContext(answerModel);
        this.setupDocumentAndClient(contextInfo.context, contextInfo.contextIndex);
        this.answerDocumentModel.setCurrentAnswerModel(answerModel);
        this.answerPageComponent.setAnswerModel(answerModel);
    }

    public isCurrentIndex = (index: number) : boolean => {
        return this.answerDocumentModel.getCurrentIndex() === index;
    }

    public computeAnswerName = (table: any) : string => {
        return sageUtil.tokensToQuery(table.getTokens());
    }

    public switchAnswerIndex = (context, index) => {
        let table = context.getTables()[index];
        let formattedTokens = table.getFormattedTokens();
        if (this.sageClient) {
            this.sageClient.update(this.answerDocumentModel, formattedTokens, this.onQueryUpdate);
        } else {
            this.sageClient = new AnswerSageClient(
                this.answerDocumentModel,
                formattedTokens,
                this.onQueryUpdate
            );
        }
        this.answerDocumentModel.setCurrentIndex(index);

        if (!this.isReadOnly) {
            // TODO(Jasmeet): This looks like a convoluted way to bootstrap things. We should notify
            // sage model of through a better mechanism.
            // This edit table call acts as a proxy for now to trigger/bootstrap
            // callbacks on all the subscribers of sageModelUpdate.
            let emptyTableRequest = autoCompleteObjectUtil.getNewACTableRequest();
            emptyTableRequest.setInputTokens(formattedTokens.getTokens());

            this.sageClient.editTable(emptyTableRequest);
        }
    }

    // TODO(Jasmeet): Hook this in based on the QOQ workflow.
    // tslint:disable-next-line
    private addLastQueryAsTable = (): void => {
        let answerModel = this.answerDocumentModel.getCurrentAnswerModel();
        let sageContext = this.sageClient.getContext();
        let tables = sageContext.getTables();
        let queryIndex = this.sageClient.getCurrentIndex();

        // In case when user searches on top of a table which is already added as worksheet
        // we launch a new query instance in QoQ flow.
        if (queryIndex !== tables.length - 1) {
            this.logger.error('Search on top only supported for last query.');
            return;
        }

        // Otherwise we persist the latest answer as aggregated worksheet and then allow
        // search on top.
        let table = tables.last();
        let params = {
            description: 'Query on Query aggregated worksheet',
            hide: true
        };

        let userAction = new UserAction(UserAction.CREATE_AGGR_WORKSHEET);
        let createWSPromise = worksheetService.createAggregatedWorksheet(
            answerModel,
            table.getSystemGeneratedName(),
            params
        );

        let self = this;
        createWSPromise.then(
            () => { // Success Handler
                // TODO(Rahul): This is perhaps not fully wired. Investigate if this
                // broken in QOQ workflow.
                let context = self.answerDocumentModel.getContext();
                self.addTable(context);
            }, (response) => { // Failure Handler
                let substitutions = [answerModel.getName()];
                alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
            }
        );
    }

    private handleAnswerModelUpdate = (answerModel: any) : void => {
        if (this.isDestroyed) {
            return;
        }

        this.answerPageComponent.setAnswerModel(answerModel);
        let index = answerModel.getSageContextIndex();

        this.updateContextInAnswerDocumentModelFromAnswerModel(answerModel, index);

        this.latestAnswerModel = answerModel;
        this.answerDocumentModel.setCurrentAnswerModel(answerModel);
        this.onAnswerModelChange(answerModel);
    }

    private onQueryUpdate = (sanitizedContext, answerIndex, accessibleTables) => {
        this.cancelAnswerCall();

        let currentTable = sanitizedContext.getTables()[answerIndex];
        let query = currentTable.getQuery();

        if (!(query && sage.serialize(query).length)) {
            this.onAnswerModelChange(null);
            this.answerDocumentModel.setCurrentAnswerModel(null);
            this.answerPageComponent.setAnswerModel(null);
        } else {
            let questionParams = {};
            questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = sanitizedContext;
            questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = answerIndex;

            let optionalParams = {
                answerModel: this.latestAnswerModel,
                requestType: this.answerRequestType
            };

            let userAction = new UserAction(UserAction.FETCH_ANSWER);
            this.pendingAnswerPromise = answerService.getAnswer(questionParams, optionalParams);
            this.pendingAnswerPromise.then(
                (response) => { // Success Handler
                    let newAnswerModel = response.data;
                    newAnswerModel.setAccessibleTables(accessibleTables);
                    return newAnswerModel;
                }, (response) => { // Failure Handler
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                }).then(
                this.handleAnswerModelUpdate, // Success Handler
                () => { // Failure Handler
                    if (this.isDestroyed) {
                        return;
                    }
                    this.answerDocumentModel.setCurrentAnswerModel(null);
                    this.answerPageComponent.setAnswerModel(null);
                }
            );
        }
    }

    private updateContextInAnswerDocumentModelFromAnswerModel = (answerModel, answerIndex) => {
        let context = this.answerDocumentModel.getContext();
        let table = context.getTables()[answerIndex];

        let tableVisualization = answerModel.getCurrentAnswerSheet().getTableVisualizations()[0];
        table.clearColumnNames();
        tableVisualization.getVizColumns().forEach((visualizationColumn) => {
            table.setColumnName(
                visualizationColumn.getSageOutputColumnId(),
                visualizationColumn.getName()
            );
        });
    }

    private onAddTableSuccess = (newTableIndex, answerResponse) => {
        if (this.isDestroyed) {
            return;
        }
        var context = answerResponse.getContext();

        this.answerDocumentModel.setContext(context);

        this.switchAnswerIndex(context, newTableIndex);
    }

    private onAddTableFailure = (error) => {
        if (this.isDestroyed) {
            return;
        }
        this.logger.error('add table failed', error);
    }

    private addTable = (context, tokens?: any) => {
        let newTableIndex = context.getTables().length;
        let tableRequest = autoCompleteObjectUtil.getNewACTableRequest();

        if (!!tokens) {
            tableRequest.setInputTokens(tokens);
        }

        blinkAutoCompleteService.addTable(context, tableRequest)
            .then(this.onAddTableSuccess.bind(void 0, newTableIndex), this.onAddTableFailure);
    }

    private setupDocumentAndClient = (context, index) => {
        if(!!this.answerDocumentModel) {
            this.updateDocumentAndClient(context, index);
        } else {
            this.initializeDocumentAndClient(context, index);
        }
    }

    private initializeDocumentAndClient = (context, index) => {
        this.answerDocumentModel = new AnswerDocumentModel(context);
        this.answerDocumentModel.setCurrentIndex(index);
        let table = context.getTables()[index];
        let formattedTokens = !!table ? table.getFormattedTokens() : [];
        this.sageClient = new AnswerSageClient(
            this.answerDocumentModel,
            formattedTokens,
            this.onQueryUpdate,
            this.onSageClientUse
        );
    }

    private updateDocumentAndClient = (context, index) => {
        this.answerDocumentModel.setContext(context);
        this.answerDocumentModel.setCurrentIndex(index);
        let table = context.getTables()[index];
        let formattedTokens = !!table ? table.getFormattedTokens() : [];
        this.sageClient.update(
            this.answerDocumentModel,
            formattedTokens,
            this.onQueryUpdate,
            this.onSageClientUse
        );
    }

    private getInitializationContext = (answerModel?: any) : ContextInfo => {
        if (answerModel) {
            let currentSheet = answerModel.getCurrentAnswerSheet();
            return {
                context: currentSheet.getSageContext(),
                contextIndex: currentSheet.getSageContextIndex()
            };
        } else {
            let context = autoCompleteObjectUtil.getNewACContext();
            let table = autoCompleteObjectUtil.getNewACTable();
            context.getTables().push(table);
            return {
                context: context,
                contextIndex: context.getTables().length - 1
            };
        }
    }

    private cancelAnswerCall() {
        if (!!this.pendingAnswerPromise) {
            this.pendingAnswerPromise.cancel();
        }
    }

    private onSageClientUse = () => {
        // NOTE: Sage client use should not abort the update of last answer or document
        // init.
        // Case 1: When answer document is in init state all updates using sage client should be
        // ignored. Reason here is if user uses back button or url change etc then the parent
        // will notify this component to update which is higher priority than any other changes
        // in the answer document and hence should be ignored. This is handled in onQueryUpdate.
        // Case 2: User types in sage bar and answer document is in process of loading the answer
        // now user modifies the query text but the query doesnt change. In this case user should
        // still be displayed the answer for last valid query.
        // If the user formulated a new query, then the hash will change and the onQueryUpdate
        // method will get triggered.
    }

    private validateFormulaName = (formulaColumn: any) : boolean => {
        let existingFormulaNames = this.sageClient.getContext()
            .getFormulae()
            .filter(formula => formula.getId() !== formulaColumn.getFormulaId())
            .map(formula => formula.getName());
        return existingFormulaNames.indexOf(formulaColumn.getName()) === -1;
    }

    private onAddFormula = (formulaColumn: any) : IPromise<any> => {
        let sageFormula = autoCompleteObjectUtil.getNewACFormula(formulaColumn);
        return this.sageClient.saveFormula(sageFormula);
    }

    private onFormulaEditCancel = () : IPromise<any> => {
        return $q.when();
    }

    // tslint:disable-next-line
    private onAddFormulaRequest = (sageFormula: any) : void => {
        let sageModel = !!this.sageClient ? this.sageClient.getSageModel() : null;
        let dataScope = sageUtil.getEffectiveDataScope(sageModel);
        let sageContext = this.latestAnswerModel.getSageContext();

        formulaEditorPopupService.show(
            sageFormula,
            dataScope,
            sageContext,
            this.formulaCallbacks
        );
    }
}
