/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view viz-context-answer.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {Component, ngRequire} from '../../../base/decorators';
import {RequestTypes} from '../../../base/proto/callosum-types';
import {strings} from '../../../base/strings';
import * as dialog from '../../../common/widgets/dialog/dialog-service';
import {AnswerDocumentComponent} from '../../answer-panel/answer-document/answer-document';
import {AnswerDocumentConfig} from '../../answer-panel/answer-document/answer-document-config';
import {setSources} from '../../sage/data-scope/sage-data-scope-service';
import {BaseSavedAnswerComponent} from '../../search-pages/base-saved-answer';
import {saveAnswer} from '../../search-pages/search-pages-utils';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';
import {getVizContextActionsConfig} from './viz-context-answer-actions';

let DocumentLoader = ngRequire('DocumentLoader');
let documentUtil = ngRequire('documentUtil');
let events = ngRequire('events');
let jsonConstants = ngRequire('jsonConstants');
let Logger = ngRequire('Logger');

@Component({
    name: 'bkVizContextAnswer',
    templateUrl: 'src/modules/pinboard/viz-context/viz-context.html'
})
export class VizContextAnswerComponent
extends BaseSavedAnswerComponent {
    public isVizContextAnswerUpdated: boolean;
    public showLoading: boolean;
    public pinboardModel: any;
    public vizName: string;
    public headerTitle: string;

    private answerId: string;
    private isAnswerPinnedAgain: boolean;
    private onContextClosed: Function;
    private notifyPinboardChangesCallback: Function;
    private pbVizId: string;

    private logger: any;

    private static shouldDisallowSaveInVizContext(
        answerModel,
        originalVizModel: VisualizationModel
    ) : boolean {
        // In case of viz context answer which is opened using a headling in pinboard
        // We need to ensure that update is only available when there is a headline
        // in the current answer matching the original viz id used to open context.
        let headlineVizType = jsonConstants.VIZ_TYPE_HEADLINE.toUpperCase();
        let editedVizType = originalVizModel.getVizType();
        let vizId = originalVizModel.getId();
        let disableSaveInContext = editedVizType === headlineVizType
            && !answerModel.getCurrentAnswerSheet().containsVisualization(vizId);
        return disableSaveInContext;
    }

    constructor(vizName: string,
                pinboardModel: any,
                answerId: string,
                pbVizId: string,
                onContextClosed: Function,
                notifyPinboardChangesCallback: Function) {
        super();
        this.logger = Logger.create('viz-context-answer');

        this.vizName = vizName;
        this.answerId = answerId;
        this.pinboardModel = pinboardModel;
        this.pbVizId = pbVizId;
        this.onContextClosed = onContextClosed;
        this.notifyPinboardChangesCallback = notifyPinboardChangesCallback;

        this.isAnswerPinnedAgain = false;
        this.isVizContextAnswerUpdated = false;
        this.showLoading = false;

        this.headerTitle = strings.vizContext.title.assign(
            {
                vizName: vizName,
                pinboardModel: pinboardModel.getName()
            }
        );

        this.loadAnswer();
        this.on(events.VIZ_ADDED_TO_PINBOARD_U, this.onPinboardModelUpdate);
    }

    public get answerModel() : any {
        return this._answerModel;
    }

    public set answerModel(newAnswerModel: any) {
        this._answerModel = newAnswerModel;
    }

    public clear() {
        this.onContextClosed();
    }

    public close () {
        if (this.pinboardModel.getPermission().isReadOnly()) {
            this.clear();
            return;
        }

        // If the pinboard was corrupted we can't update
        // anything on that pinboard. The only useful
        // case is if the user fixed the source of corruption
        // by making changes to the underlying answer.
        // To reflect any possible fix up of the pinboard
        // in this case we have no choice but to refresh
        // the entire pinboard
        if (this.pinboardModel.isCorrupted()) {
            this.clear();
            return;
        }

        let hasAnswerChanged: boolean = !!this.answerModel ?
            this.answerModel.containsChangesFromStateStoredOnServer(
                this.savedAnswerOnServer.getMetadataJson()
            ) :
            true;
        if (hasAnswerChanged) {
            let config: dialog.DialogConfig = documentUtil.getUnsavedDocumentAlertConfig(
                blinkConstants.PINBOARD_TYPE,
                false,
                _.noop
            );
            config.onConfirm = () => {
                this.notifyParentOfChangesIfNeeded();
                this.clear();
                return true;
            };
            config.onConfirmAsync = () => {
                this.showLoading = true;
                let savePromise = saveAnswer(this.answerModel)
                    .then(() => {
                        this.savedAnswerOnServer = this.answerModel;
                        this.isVizContextAnswerUpdated = true;
                        this.notifyParentOfChangesIfNeeded();
                        this.clear();
                    });
                savePromise.finally(() => {
                    this.showLoading = false;
                });

                return savePromise;
            };
            config.isConfirmBtnDisabled = () => {
                return this.disableUpdateOfAnswer();
            };

            dialog.show(config);
            return;
        }


        this.notifyParentOfChangesIfNeeded();
        this.clear();
    }

    public disableUpdateOfAnswer() : boolean {
        if (!this.answerModel) {
            return true;
        }
        let originalVizModel = this.getOriginalReferencedVizModel();
        return VizContextAnswerComponent.shouldDisallowSaveInVizContext(
            this.answerModel, originalVizModel
        );
    }

    private getOriginalReferencedVizModel() : VisualizationModel {
        return this.pinboardModel.getVizById(this.pbVizId).getReferencedVisualization();
    }

    // TODO(Jasmeet): We need to think of what is best way to handle such cases. In this
    // case bubbling of the event comes from 5 levels deep, is it warranted to switch
    // to callbacks in this case or is it an overkill.
    private onPinboardModelUpdate = ($evt, updatePinboardModel) => {
        if (updatePinboardModel.getId() === this.pinboardModel.getId()) {
            this.pinboardModel = updatePinboardModel;
            this.isAnswerPinnedAgain = true;
        }
    }

    private notifyParentOfChangesIfNeeded() {
        if (this.isVizContextAnswerUpdated || this.isAnswerPinnedAgain) {
            this.notifyPinboardChangesCallback(
                this.pbVizId,
                this.pinboardModel,
                this.savedAnswerOnServer
            );
        }
    }

    private loadAnswer() {
        let documentLoader = new DocumentLoader(_.noop);
        documentLoader.loadDocument(
            this.answerId,
            jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
            true
        ).then((answerModel) => {
            let onAnswerModelChange = (changedAnswerModel) => {
                this.answerModel = changedAnswerModel;
            };
            this.answerModel = answerModel;
            this.savedAnswerOnServer = answerModel;
            setSources(answerModel.getSageDataScope());

            var answerDocumentConfig = new AnswerDocumentConfig(
                false, //sageSearchOnInit
                true, // disableAutoTitle
                getVizContextActionsConfig(this)
            );
            this.answerDocumentComponent = new AnswerDocumentComponent(
                answerModel,
                onAnswerModelChange,
                answerDocumentConfig,
                RequestTypes.ANSWER_PINBOARD_CONTEXT
            );
        });
    }
}
