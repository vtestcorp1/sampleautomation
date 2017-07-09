/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Mixin for the transformable viz cards.
 */

import _ from 'lodash';
import {ngRequire} from '../../../base/decorators';
import {RequestTypes} from '../../../base/proto/callosum-types';
import {QuestionModel} from '../../callosum/model/question-model';
import {DataVizComponent} from '../../data-viz/data-viz';
import {AdHocSageClient} from '../../sage-client/ad-hoc-sage-client';
import {decideAnswerDisplayMode} from '../../search-pages/search-pages-utils';
import {terminateWorkflow} from '../../user-workflow-manager/workflow-management-service';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {PinboardVizModel} from '../../viz-layout/viz/pinboard-viz-model';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';
import {getDataVizComponent} from './data-viz-component-factory';

let alertService = ngRequire('alertService');
let answerMetadataUtil = ngRequire('answerMetadataUtil');
let answerService = ngRequire('answerService');
let dataService = ngRequire('dataService');
let metadataUtil = ngRequire('metadataUtil');
let UserAction = ngRequire('UserAction');
let util = ngRequire('util');
let $q = ngRequire('$q');

export class TransformableViz {
    vizModel: PinboardVizModel;
    dataVizComponent: DataVizComponent;
    showLoading: boolean;

    adHocQueryAnswer: any = null;
    sageClient: AdHocSageClient;

    public initTransformableViz() {
        let question: QuestionModel = this.vizModel.getEffectiveQuestion()
            || this.vizModel.getOriginalQuestion();

        this.sageClient = new AdHocSageClient(
            question[jsonConstants.SAGE_CONTEXT_PROTO_KEY],
            this.onAdHocQueryUpdate.bind(this),
            this.onAdHocQueryFailure.bind(this),
            () => {
                terminateWorkflow();
            }
        );
    }

    public isTransformed() : boolean {
        return this.vizModel.isTransformed();
    }

    public getTransformedQuestion() : string {
        return '';
    }

    public resetTransformation() : void {
        let originalReferencedViz = this.vizModel.getReferencedVisualization();
        originalReferencedViz.setRenderReady(false);
        originalReferencedViz.setSecondaryRenderReady(false);
        this.vizModel.setIsTransformed(false);
        let question: QuestionModel = this.vizModel.getEffectiveQuestion()
            || this.vizModel.getOriginalQuestion();
        this.sageClient.setContext(question[jsonConstants.SAGE_CONTEXT_PROTO_KEY]);
        this.dataVizComponent = getDataVizComponent(
            originalReferencedViz,
            this.sageClient,
            _.noop, // onRenderComplete
            false,
            () => {
                return $q.when();
            }
        );
        this.dataVizComponent.loadViz();
    }

    // TODO(Jasmeet): Explore how runtime tranformation can be changed, this shouldnt
    // be public.
    public populateAnswer(): PromiseLike<any> {
        if (this.adHocQueryAnswer !== null) {
            return Promise.resolve();
        }

        var answerId = this.vizModel.getReferencedAnswerBookId();
        var metadataType = jsonConstants.metadataType.QUESTION_ANSWER_BOOK;
        return answerMetadataUtil.getModelMetadata(answerId, false, metadataType)
            .then((response) => {
                this.adHocQueryAnswer = response.data;
            });
    }

    public getDisplayVizType(oldVizType, answerModel) {
        if(oldVizType === jsonConstants.vizType.HEADLINE
            || oldVizType === jsonConstants.vizType.TABLE) {
            return jsonConstants.vizType.TABLE;
        }

        let displayMode = decideAnswerDisplayMode(answerModel);
        return util.displayModeToVizType[displayMode];
    }

    public onAdHocQueryUpdate(context: any, index: number) {
        let referencedViz = this.vizModel.getReferencedVisualization();
        referencedViz.setRenderReady(false);
        referencedViz.setSecondaryRenderReady(false);
        this.showLoading = true;

        return this.populateAnswer()
            .then(() => {
                var questionParams = {};
                questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;
                questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = index;

                var optionalParams = {
                    answerModel: this.adHocQueryAnswer,
                    requestType: RequestTypes.PINBOARD_AD_HOC
                };

                var userAction = new UserAction(UserAction.FETCH_ANSWER);

                var fetchAnswerPromise = answerService.getAnswer(questionParams, optionalParams);
                return metadataUtil.getDataFromResponse(fetchAnswerPromise, userAction);
            })
            .then((questionsAnswerModel) => {
                this.adHocQueryAnswer = questionsAnswerModel;
                var oldVizType = this.vizModel.getReferencedVisualization().getVizType();
                var newVizType = this.getDisplayVizType(oldVizType, questionsAnswerModel);
                var answerSheet = questionsAnswerModel.getCurrentAnswerSheet();
                let visualization = <VisualizationModel>_.values(
                    answerSheet.getVisualizationsOfType(newVizType)
                )[0];
                this.showLoading = false;
                this.dataVizComponent = getDataVizComponent(
                    visualization,
                    this.sageClient,
                    _.noop, // onRenderComplete
                    false,
                    () => {
                        var userAction = new UserAction(UserAction.FETCH_VIZ_DATA);
                        var vizDataPromise = dataService.getDataForViz(
                            this.adHocQueryAnswer,
                            visualization,
                            {},
                            true
                        );
                        return metadataUtil.getDataFromResponse(vizDataPromise, userAction)
                            .then((newVizData) => {
                                visualization.updateData(newVizData);
                                let pbViz: PinboardVizModel = this.vizModel;
                                this.adHocQueryAnswer.getCurrentAnswerSheet().setDataForViz(
                                    pbViz.getId(),
                                    visualization.getVizType(),
                                    newVizData
                                );
                            });
                    }
                );
                let pbViz: PinboardVizModel = this.vizModel;
                pbViz.setIsTransformed(true);
                visualization.setReferencingViz(pbViz);
                this.dataVizComponent.loadViz();
            }, () => {
                this.onAdHocQueryFailure();
            });
    }

    public onAdHocQueryFailure() {
        alertService.showAlert({
            type: alertService.alertConstants.type.ERROR,
            message: alertService.alertConstants.message.AD_HOC_TRANSFORMATION_FAILED
        });
    }
}
