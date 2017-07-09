import {Component} from '../../base/decorators';
import {DataVizComponent} from '../data-viz/data-viz';
import {AnswerSageClient} from '../sage-client/answer-sage-client';
import {VisualizationModel} from '../viz-layout/viz/visualization-model';
import IPromise = angular.IPromise;

@Component({
    name: 'bkTableViz',
    templateUrl: 'src/modules/table-viz/table-viz.html'
})
export class TableVizComponent extends DataVizComponent {
    public tableViz: any;
    public sageClient: AnswerSageClient;

    constructor(
        tableModel: any,
        sageClient: AnswerSageClient,
        allowPinning: boolean,
        dataLoader: () => IPromise<void>,
        onRenderComplete: (vizModel: VisualizationModel) => void
    ) {
        super(
            tableModel,
            DataVizComponent.TYPES.TABLE,
            allowPinning,
            dataLoader,
            onRenderComplete
        );
        this.tableViz = {
            getModel: () => { return tableModel; },
            init: () => { return true; },
            isEmpty: () => { return tableModel.hasNoData(); }
        };
        this.sageClient = sageClient;
    }
}
