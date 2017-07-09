/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view a visualization cluster.
 */

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {VisualizationModel} from '../visualization-model';
import {VizClusterVisualization} from './viz-cluster-visualization';

@Component({
    name: 'bkVizCluster',
    templateUrl: 'src/modules/viz-layout/viz/viz-cluster/viz-cluster.html'
})
export class VizClusterComponent extends BaseComponent {
    public vizClusterVisualizations: VizClusterVisualization[] = [];
    public activeVizIndex;
    private onSlideChange;

    constructor(
        vizClusterVisualizations: VizClusterVisualization[],
        onSlideChange: (vizModel: VisualizationModel) => void
    ) {
        super();
        this.vizClusterVisualizations = vizClusterVisualizations || [];
        this.onSlideChange = onSlideChange;
        if (this.vizClusterVisualizations.length > 0) {
            this.activeVizIndex = 0;
        }
    }

    public onActiveSlideChangeCallback = (index) => {
        let vizModel = this.vizClusterVisualizations[index].vizModel;
        this.onSlideChange(vizModel);
    }
}
