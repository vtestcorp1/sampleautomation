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

import {blinkConstants} from 'src/base/blink-constants';
import {Component, ngRequire} from 'src/base/decorators';
import {getRouteParameter} from 'src/base/route-service';
import {getAnswer, getSageContextHash} from 'src/modules/search-pages/search-pages-utils';
import {CanvasComponent} from '../../../base/app-canvas/canvas-component';
import {AnswerDocumentComponent} from '../../answer-panel/answer-document/answer-document';
import {AnswerDocumentConfig} from '../../answer-panel/answer-document/answer-document-config';
import IPromise = angular.IPromise;
import _ from 'lodash';
import {RequestTypes} from '../../../base/proto/callosum-types';
import {setSources, unionOfSources} from '../../sage/data-scope/sage-data-scope-service';
import {BaseAnswerComponent} from '../base-answer';
import {getAdhocAnswerPageActionsConfig} from './answer-actions';

let $q = ngRequire('$q');
let answerRestorationDataStore = ngRequire('answerRestorationDataStore');
let navService = ngRequire('navService');
let events = ngRequire('events');
let eventTracker = ngRequire('eventTracker');
let sessionService = ngRequire('sessionService');
let perfEvents = ngRequire('perfEvents');

@Component({
    name: 'bkAnswer',
    templateUrl: 'src/modules/search-pages/answer/answer.html'
})
export class AnswerComponent extends BaseAnswerComponent implements CanvasComponent {
    private static sageContextIdParam = 'sageContextId';

    private currentSageContextId: string;

    constructor () {
        super();
        let currentSageContextId = getRouteParameter(AnswerComponent.sageContextIdParam);
        this.routeChangeHandler(currentSageContextId);
    }

    public onCanvasStateChange = (params) => {
        let sageContextId = params[AnswerComponent.sageContextIdParam];
        this.routeChangeHandler(sageContextId);
    }

    public get answerModel() : any {
        return this._answerModel;
    }

    public setAnswerModelAndUpdateDocument(newAnswerModel: any) {
        this._answerModel = newAnswerModel;
        if (!!newAnswerModel) {
            setSources(unionOfSources(newAnswerModel.getSageDataScope(),
                sessionService.getSageDataSource()));
        }
        this.updateAnswerDocumentComponent();
    }

    private setAnswerModel(newSageContextId: string): IPromise<any> {
        eventTracker.trackEvent(perfEvents.LOAD_ANSWER_PAGE)
            .waitFor(void 0, events.LEFT_PANEL_RENDERED_U)
            .finish();
        if (this.currentSageContextId === newSageContextId) {
            // NOTE: This is not a noop. This triggers the set answerModel flow.
            this.setAnswerModelAndUpdateDocument(this.answerModel);
            return $q.when();
        }
        this.currentSageContextId = newSageContextId;
        if (!newSageContextId) {
            this.setAnswerModelAndUpdateDocument(null);
            return $q.when();
        }
        let cachedAnswerDocument = answerRestorationDataStore
            .getSageContextAndIndexForTableHash(newSageContextId);

        if (!cachedAnswerDocument) {
            return $q.reject();
        } else {
            let context = cachedAnswerDocument.context;
            let index = cachedAnswerDocument.index;
            let accessibleTables = cachedAnswerDocument.accessibleTables;
            return getAnswer(context, index, RequestTypes.ANSWER_UNSAVED)
                .then((answerModel) => {
                    answerModel.setAccessibleTables(accessibleTables);
                    this.setAnswerModelAndUpdateDocument(answerModel);
                });
        }
    }

    private updateAnswerDocumentComponent() {
        if (this.answerDocumentComponent) {
            this.answerDocumentComponent.setAnswerModel(this.answerModel);
        } else {
            let onAnswerModelChangeCallback = this.onAnswerModelChange.bind(this);
            let answerDocumentConfig = new AnswerDocumentConfig(
                true, //sageSearchOnInit
                false, // disableAutoTitle
                getAdhocAnswerPageActionsConfig(this)
            );
            this.answerDocumentComponent = new AnswerDocumentComponent(
                this.answerModel,
                onAnswerModelChangeCallback,
                answerDocumentConfig,
                RequestTypes.ANSWER_UNSAVED
            );
        }
    }

    private routeChangeHandler = (newSageContextId) => {
        this.setAnswerModel(newSageContextId).then(
            _.noop,
            () => { // Failure handling
                navService.goToAnswer();
            }
        );
    }

    private onAnswerModelChange(answerModel) : void {
        if (!answerModel) {
            this._answerModel = null;
            return;
        }
        let currentSageContextId = getSageContextHash(answerModel);
        this.currentSageContextId = currentSageContextId;
        var context = answerModel.getSageContext();
        var index = answerModel.getSageContextIndex();
        answerRestorationDataStore.setSageContextAndIndexForTableHash(
            context,
            index,
            answerModel.getAccessibleTables()
        );
        this.setAnswerModelAndUpdateDocument(answerModel);

        var newPath = '/{1}/{2}'.assign(blinkConstants.ANSWER_TYPE, currentSageContextId);
        var oldPath = navService.getPath();
        if (newPath !== oldPath) {
            navService.goToPath(newPath);
        }
    }
}
