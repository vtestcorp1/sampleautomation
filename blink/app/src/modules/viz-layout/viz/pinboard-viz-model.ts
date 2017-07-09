/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import _ from 'lodash';
import {Provide} from '../../../base/decorators';
import {QuestionModel} from '../../callosum/model/question-model';
import {jsonConstants} from '../answer/json-constants';
import {VisualizationModel} from './visualization-model';

@Provide('PinboardVizModel')
export class PinboardVizModel extends VisualizationModel {
    // This is the qustion from the underlying viz context.
    // NOTE: This should never be set by the client. On changes in viz Context when they are
    // persisted on reload this should get updated.
    private originalQuestion = null;

    // This is the effective question which is persisted on the server as the last saved
    // question state when there are pinboard filters applied.
    // NOTE: Again this should not be set by client, when the pinboard is loaded this
    // will be updated to reflect the state on server.
    private effectiveQuestion = null;

    // This is the question override for pinboard vizs which reflects the question state
    // on the client when pinboard contains local filter changes.
    // When the pinboard is saved this will be reloaded to empty and the original and effective
    // question will reflect the above mentioned states on server.
    private overrideQuestion = null;

    // This flag indicates whether the visualization has been transformed using pinboard
    // ad hoc analysis, eg sort, drill etc.
    private isTransformedState = null;

    // Actual visualization that is rendered.
    private referencedViz: VisualizationModel = null;

    constructor(params,
                referencedVisualization: VisualizationModel
    ) {
        super(params);
        this.referencedViz = referencedVisualization;
        this.referencedViz.setReferencingViz(this);
    }

    public getReferencedVisualization() : VisualizationModel {
        return this.referencedViz;
    }

    public getAnswerSheetId() {
        let json = this.getJson() || {};
        return _.get(json, [jsonConstants.REF_ANSWER_SHEET_KEY, jsonConstants.ID_KEY]);
    }

    public getReferencedAnswerBookId () : string {
        let json = this.getJson() || {};
        return <string>_.get(json, [jsonConstants.REF_ANSWER_SHEET_KEY, jsonConstants.OWNER_KEY]);
    }

    public getOriginalQuestion () {
        if (!this.originalQuestion) {
            var answerSheetInfo = this.getRefAnswerSheetInfo();
            var questionJson = answerSheetInfo[jsonConstants.REF_ANSWER_SHEET_QUESTION_KEY];
            this.originalQuestion = new QuestionModel(questionJson);
        }

        return this.originalQuestion;
    }

    public getEffectiveQuestion () {
        if (!this.effectiveQuestion) {
            var questionJson = _.get(this, '_vizJson.vizContent.effectiveQuestion');
            this.effectiveQuestion = !!questionJson ? new QuestionModel(questionJson) : null;
        }

        return this.effectiveQuestion;
    }

    public getOverrideQuestion() {
        return this.overrideQuestion;
    }

    public setOverrideQuestion(overrideQuestion) {
        this.overrideQuestion = overrideQuestion;
    }

    public isTransformed() {
        return !!this.isTransformedState;
    }

    public setIsTransformed(isTransformedState) {
        this.isTransformedState = isTransformedState;
    }

    public getBatchSize() {
        return this.referencedViz.getBatchSize();
    }

    public setBatchSize(batchSize) {
        return this.referencedViz.setBatchSize(batchSize);
    }

    public getDisplayedViz() {
        return this.getReferencedVisualization();
    }

    public getRelatedLinksCount() {
        return this.getReferencedVisualization().getRelatedLinksCount();
    }

    public getQuestion() {
        return this.getReferencedQuestion();
    }

    public getTitle() {
        let title = super.getTitle();
        return !!title ? title : this.getReferencedVisualization().getTitle();
    }

    public getDescription() {
        let title = super.getDescription();
        return !!title ? title : this.getReferencedVisualization().getDescription();
    }

    public allowResizing() {
        return this.getReferencedVisualization().getVizType() !== jsonConstants.vizType.HEADLINE;
    }
}
