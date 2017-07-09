/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in cluster admin pinboard to show statistics
 * information of different service.
 */

import {UIComponent} from '../../../../base/base-types/ui-component';
import {Component} from '../../../../base/decorators';
import {VisualizationModel} from '../../../viz-layout/viz/visualization-model';

@Component({
    name: 'bkGenericViz',
    templateUrl: 'src/modules/clusterstatus/vizs/generic-viz/blink-generic-viz.html'
})
export default class GenericVizComponent extends UIComponent {
    public viz: any;
    public tile: any;

    constructor(
        private vizModel: VisualizationModel,
        private onRenderComplete: (vizModel: VisualizationModel) => void) {
        super();
        this.viz = {};
        this.viz.getModel = () => {
            return this.vizModel;
        };
        this.tile = {};
        this.tile.setTitle = () => {
            //
        };
    }

    public postLink() {
        this.onRenderComplete(this.vizModel);
    }
}
