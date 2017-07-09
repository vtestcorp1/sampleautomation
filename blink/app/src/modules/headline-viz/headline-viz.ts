import {Component} from '../../base/decorators';
import {DataVizComponent} from '../data-viz/data-viz';
import {VisualizationModel} from '../viz-layout/viz/visualization-model';
import IPromise = angular.IPromise;

@Component({
    name: 'bkHeadlineViz',
    templateUrl: 'src/modules/headline-viz/headline-viz.html'
})
export class HeadlineVizComponent extends DataVizComponent {
    public headlineViz: any;

    constructor(
        headlineModel: any,
        onRenderComplete: (vizModel: VisualizationModel) => void,
        allowPinning: boolean,
        dataLoader: () => IPromise<void>
    ) {
        super(
            headlineModel,
            DataVizComponent.TYPES.HEADLINE,
            allowPinning,
            dataLoader,
            onRenderComplete
        );
        this.headlineViz = {
            getModel: () => { return headlineModel; },
            init: () => { return true; },
            isEmpty: () => { return headlineModel.hasNoData(); },
            isPendingDataLoad: () => { return false; }
        };
    }
}
