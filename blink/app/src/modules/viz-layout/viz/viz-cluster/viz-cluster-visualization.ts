/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class to represent a visualization to be displayed in
 * a visualization cluster
 */

import {AnswerSageClient} from '../../../sage-client/answer-sage-client';
import {VisualizationModel} from '../visualization-model';

export class VizClusterVisualization {
    constructor(
        public vizModel: VisualizationModel,
        public sageClient: AnswerSageClient,
        public onRenderComplete: Function
    ) {
    }
}
