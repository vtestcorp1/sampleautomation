/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import IPromise = angular.IPromise;
import {ChartVizComponent} from '../../chart-viz/chart-viz';
import {DataVizComponent} from '../../data-viz/data-viz';
import {HeadlineVizComponent} from '../../headline-viz/headline-viz';
import {AnswerSageClient} from '../../sage-client/answer-sage-client';
import {TableVizComponent} from '../../table-viz/table-viz';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {ChartModel} from '../../viz-layout/viz/chart/chart-model';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';

export function getDataVizComponent(
    vizModel: VisualizationModel,
    sageClient: AnswerSageClient,
    onRenderComplete: (vizModel: VisualizationModel) => void,
    allowPinning: boolean,
    dataLoader: () => IPromise<void>
) : DataVizComponent {
    switch (vizModel.getVizType()) {
        case jsonConstants.vizType.CHART:
            return new ChartVizComponent(
                <ChartModel> vizModel,
                sageClient,
                allowPinning,
                dataLoader,
                onRenderComplete
            );
        case jsonConstants.vizType.TABLE:
            return new TableVizComponent(
                vizModel,
                sageClient,
                allowPinning,
                dataLoader,
                onRenderComplete
            );
        case jsonConstants.vizType.HEADLINE:
            return new HeadlineVizComponent(
                vizModel,
                onRenderComplete,
                allowPinning,
                dataLoader
            );
    }
}
