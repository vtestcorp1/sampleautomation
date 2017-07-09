/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is the saved answer component.
 * This component performs the following tasks.
 * - Initialize the answer model on load based on current route.
 * - Url management watch for url changes and update answer model accordingly.
 * - Provide answer model and configurable properties to answer document.
 */

import {Component, ngRequire} from 'src/base/decorators';
import {getRouteParameter} from 'src/base/route-service';
import IPromise = angular.IPromise;
import _ from 'lodash';
import {CanvasComponent} from '../../../base/app-canvas/canvas-component';
import {blinkConstants} from '../../../base/blink-constants';
import {RequestTypes} from '../../../base/proto/callosum-types';
import {AnswerDocumentComponent} from '../../answer-panel/answer-document/answer-document';
import {AnswerDocumentConfig} from '../../answer-panel/answer-document/answer-document-config';
import {getUnsavedDocumentAlertConfig} from '../../document-model/document-util';
import {setSources} from '../../sage/data-scope/sage-data-scope-service';
import {ShareDialogComponent} from '../../share/share-dialog-component';
import {BaseSavedAnswerComponent} from '../base-saved-answer';
import {saveAnswer} from '../search-pages-utils';
import {getSavedAnswerPageActionsConfig} from './saved-answer-actions';

declare var blink: any;

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let DocumentLoader = ngRequire('DocumentLoader');
let events = ngRequire('events');
let eventTracker = ngRequire('eventTracker');
let jsonConstants = ngRequire('jsonConstants');
let navAlertService = ngRequire('navAlertService');
let perfEvents = ngRequire('perfEvents');
let UserAction = ngRequire('UserAction');

@Component({
    name: 'bkSavedAnswer',
    templateUrl: 'src/modules/search-pages/saved-answer/saved-answer.html'
})
export class SavedAnswerComponent
extends BaseSavedAnswerComponent
implements CanvasComponent {
    private static documentIdParam = 'documentId';

    public answerDocumentComponent: AnswerDocumentComponent;
    public navAlertDeregisterer: Function;
    public showShareDialog: boolean;
    public shareDialogComponent: ShareDialogComponent;

    private documentLoader: any;
    private documentId: string;

    constructor () {
        super();
        this.documentLoader = new DocumentLoader(_.noop);
        let documentId = getRouteParameter(SavedAnswerComponent.documentIdParam);
        this.setAnswerModel(documentId);
        this.showShareDialog = false;
        this.registerNavigationAlert();
    }

    onDestroy() {
        this.navAlertDeregisterer();
    }

    public onCanvasStateChange = (params) => {
        let documentId = params[SavedAnswerComponent.documentIdParam];
        this.setAnswerModel(documentId);
    }

    public onAnswerModelChange(answerModel) : void {
        // NOTE: When the answer model is changed to null we dont want to update the answer
        // document to update as we want to always retain the original metadata.
        if (!answerModel) {
            return;
        }
        this.answerModel = answerModel;
    }

    public get answerModel() : any {
        return this._answerModel;
    }

    public set answerModel(newAnswerModel: any) {
        this._answerModel = newAnswerModel;
        setSources(newAnswerModel.getSageDataScope());
        this.updateAnswerDocumentComponent();
    }

    public onShareDialogClearCallback = () => {
        this.showShareDialog = false;
    }

    public registerNavigationAlert() {
        this.navAlertDeregisterer = navAlertService.registerListener(
            this.shouldWarnOnNavigationCallback
        );
    }

    private updateAnswerDocumentComponent() {
        if (this.answerDocumentComponent) {
            this.answerDocumentComponent.setAnswerModel(this.answerModel);
        } else {
            let onAnswerModelChangeCallback = this.onAnswerModelChange.bind(this);
            let answerDocumentConfig = new AnswerDocumentConfig(
                false, //sageSearchOnInit
                true, // disableAutoTitle
                getSavedAnswerPageActionsConfig(this)
            );
            this.answerDocumentComponent = new AnswerDocumentComponent(
                this.answerModel,
                onAnswerModelChangeCallback,
                answerDocumentConfig,
                RequestTypes.ANSWER_SAVED
            );
        }
    }

    private setAnswerModel(documentId) : IPromise<any> {
        if (documentId === this.documentId) {
            return $q.when();
        }
        this.documentId = documentId;
        eventTracker.trackEvent(perfEvents.LOAD_SAVED_ANSWER)
            .waitFor(void 0, events.LEFT_PANEL_RENDERED_U)
            .waitFor(void 0, events.ANSWER_UI_RENDERED_U)
            .finish();

        var userAction = new UserAction(UserAction.LOAD_SAVED_ANSWER);
        return this.documentLoader.loadDocument(
            documentId,
            jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
            true
        ).then(
            (answerModel) => {
                this.answerModel = answerModel;
                this.savedAnswerOnServer = answerModel;
            },
            (response) => {
                let substitutions = [
                    documentId,
                    this.strings.ANSWER
                ];
                alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {
                        substitutions: substitutions
                    }
                );
                return $q.reject(response.data);
            }
        );
    }

    private shouldWarnOnNavigationCallback = () : boolean | any => {
        let showAlert = this.answerModel.containsChangesFromStateStoredOnServer(
            this.savedAnswerOnServer.getMetadataJson()
        );
        if (!showAlert) {
            return showAlert;
        }
        let onConfirm = () => {
            return saveAnswer(this.answerModel)
                .then(() => this.savedAnswerOnServer = this.answerModel);
        };
        let permission = this.answerModel.getPermission();
        let disableSave = permission.isReadOnly();

        return getUnsavedDocumentAlertConfig(
            blinkConstants.ANSWER_TYPE,
            disableSave,
            onConfirm
        );
    }
}
