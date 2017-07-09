/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is the aggregated worksheet component.
 * This component performs the following tasks.
 * - Initialize the answer model on load based on current route.
 * - Url management watch for url changes and update answer model accordingly.
 * - Provide answer model and configurable properties to answer document.
 */

import {Component, ngRequire} from 'src/base/decorators';
import {getRouteParameter} from 'src/base/route-service';
import {getAnswer} from 'src/modules/search-pages/search-pages-utils';
import IPromise = angular.IPromise;
import {blinkConstants} from 'src/base/blink-constants';
import {strings} from 'src/base/strings';
import {CanvasComponent} from '../../../base/app-canvas/canvas-component';
import {RequestTypes} from '../../../base/proto/callosum-types';
import {AnswerDocumentComponent} from '../../answer-panel/answer-document/answer-document';
import {AnswerDocumentConfig} from '../../answer-panel/answer-document/answer-document-config';
import {getUnsavedDocumentAlertConfig} from '../../document-model/document-util';
import {setSources} from '../../sage/data-scope/sage-data-scope-service';
import {ShareDialogComponent} from '../../share/share-dialog-component';
import {BaseSavedAnswerComponent} from '../base-saved-answer';
import {getAggrWorksheetEditorActionsConfig} from './aggregated-worksheet-editor-actions';
import {updateWorksheetFromAnswer} from './aggregated-worksheet-utils';

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let jsonConstants = ngRequire('jsonConstants');
let metadataService = ngRequire('metadataService');
let navAlertService = ngRequire('navAlertService');
let QuestionModel = ngRequire('QuestionModel');
let UserAction = ngRequire('UserAction');

@Component({
    name: 'bkAggregatedWorksheetEditor',
    templateUrl: 'src/modules/search-pages/aggregated-worksheet-editor/' +
                 'aggregated-worksheet-editor.html'
})

export class AggregatedWorksheetEditorComponent
extends BaseSavedAnswerComponent
implements CanvasComponent {
    private static documentIdParam = 'documentId';

    public answerDocumentComponent: AnswerDocumentComponent;
    public showShareDialog: boolean;
    public shareDialogComponent: ShareDialogComponent;

    private documentId: string;
    private navAlertDeregisterer: Function;
    private worksheetName:string;
    private worksheetDescription: string;

    public get answerModel() : any {
        return this._answerModel;
    }

    public set answerModel(newAnswerModel: any) {
        this._answerModel = newAnswerModel;
        setSources(newAnswerModel.getSageDataScope());
        this.updateAnswerDocumentComponent();
    }

    constructor () {
        super();
        let documentId = getRouteParameter(AggregatedWorksheetEditorComponent.documentIdParam);
        this.setAnswerModel(documentId);
        this.showShareDialog = false;
        this.registerNavigationAlert();
    }

    onDestroy() {
        this.navAlertDeregisterer();
    }

    public onCanvasStateChange = (params) => {
        let documentId = params[AggregatedWorksheetEditorComponent.documentIdParam];
        this.setAnswerModel(documentId);
    }

    public onAnswerModelChange(answerModel) : void {
        if (!answerModel) {
            return;
        }
        answerModel.setIsAggregatedWorksheet(true);
        this.answerModel = answerModel;
    }

    public onShareDialogClearCallback = () => {
        this.showShareDialog = false;
    }

    private updateAnswerDocumentComponent() {
        if (this.answerDocumentComponent) {
            this.answerDocumentComponent.setAnswerModel(this.answerModel);
        } else {
            let onAnswerModelChangeCallback = this.onAnswerModelChange.bind(this);
            let answerDocumentConfig = new AnswerDocumentConfig(
                false, //sageSearchOnInit
                true, // disableAutoTitle
                getAggrWorksheetEditorActionsConfig(this)
            );
            this.answerDocumentComponent = new AnswerDocumentComponent(
                this.answerModel,
                onAnswerModelChangeCallback,
                answerDocumentConfig,
                RequestTypes.ANSWER_AGGREGATED_WORKSHEET
            );
        }
    }

    private onAggregateWorksheetRequestSuccess(metadata) : IPromise<any> {
        let tableContent = metadata[jsonConstants.LOGICAL_TABLE_CONTENT_KEY];
        let question = new QuestionModel(tableContent[jsonConstants.QUESTION_KEY]);
        let sageContext = question[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
        let index = sageContext.getTables().length - 1;
        let header = metadata[jsonConstants.HEADER_KEY];
        this.worksheetName = header[jsonConstants.NAME_KEY];
        this.worksheetDescription = header[jsonConstants.DESCRIPTION_KEY];
        // NOTE: in case of missing objects query can be empty we would want to avoid
        // sending answer request in that case.
        if(!!sageContext.getTables()[index].getQuery()) {
            return getAnswer(sageContext, index, RequestTypes.ANSWER_AGGREGATED_WORKSHEET_VIEW)
                .then((answerModel) => {
                    answerModel.setName(this.worksheetName);
                    answerModel.setDescription(this.worksheetDescription);
                    answerModel.setId(this.documentId);
                    answerModel.setIsAggregatedWorksheet(true);
                    return answerModel;
                });
        } else {
            alertService.showAlert({
                type: alertService.alertConstants.type.ERROR,
                message: strings.alert.FAILED_TO_BUILD_SEARCH_RESULT
            });
            return $q.reject();
        }
    }

    private loadAggregatedWorksheet(aggrWorksheetId) : IPromise<any> {
        var userAction = new UserAction(UserAction.FETCH_TABLE_DETAILS);
        return metadataService.getMetadataObjectDetails(
            jsonConstants.metadataType.LOGICAL_TABLE,
            aggrWorksheetId
        ).then(function(response) {
            return response.data;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        }).then(this.onAggregateWorksheetRequestSuccess.bind(this));
    }

    private setAnswerModel(documentId) : IPromise<any> {
        if (documentId === this.documentId) {
            return $q.when();
        }
        this.documentId = documentId;
        return this.loadAggregatedWorksheet(documentId)
            .then((answerModel) => {
                this.answerModel = answerModel;
                this.savedAnswerOnServer = answerModel;
            });
    }

    private shouldWarnOnNavigationCallback = () : boolean | any => {
        let showAlert = this.answerModel.containsChangesFromStateStoredOnServer(
            this.savedAnswerOnServer.getMetadataJson()
        );
        if (!showAlert) {
            return showAlert;
        }
        let onConfirm = () => {
            return updateWorksheetFromAnswer(
                this.savedAnswerOnServer,
                this.answerModel
            ).then(() => this.savedAnswerOnServer = this.answerModel);
        };
        return getUnsavedDocumentAlertConfig(
            blinkConstants.WORKSHEET_TYPE,
            false,
            onConfirm
        );
    }

    private registerNavigationAlert() {
        this.navAlertDeregisterer = navAlertService.registerListener(
            this.shouldWarnOnNavigationCallback
        );
    }
}
