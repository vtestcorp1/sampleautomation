import {Component} from '../../base/decorators';
import {DataVizComponent} from '../data-viz/data-viz';
import {AnswerSageClient} from '../sage-client/answer-sage-client';
import {ChartModel} from '../viz-layout/viz/chart/chart-model';
import {VisualizationModel} from '../viz-layout/viz/visualization-model';
import IPromise = angular.IPromise;

@Component({
    name: 'bkChartViz',
    templateUrl: 'src/modules/chart-viz/chart-viz.html'
})
export class ChartVizComponent extends DataVizComponent {
    public chartViz: any;
    public sageClient: AnswerSageClient;

    constructor(
        chartModel: ChartModel,
        sageClient: AnswerSageClient,
        allowPinning: boolean,
        dataLoader: () => IPromise<void>,
        onRenderComplete: (vizModel: VisualizationModel) => void
    ) {
        super(
            chartModel,
            DataVizComponent.TYPES.CHART,
            allowPinning,
            dataLoader,
            onRenderComplete
        );
        this.chartViz = {
            getModel: () => { return chartModel; },
            init: () => { return true; },
            isEmpty: () => { return chartModel.hasNoData(); },
            isPendingDataLoad: () => { return false; }
        };
        this.sageClient = sageClient;
    }
}
