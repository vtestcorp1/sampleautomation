/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Generic viz used to display system details in Admin UI.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import GenericVizComponent from '../../clusterstatus/vizs/generic-viz/blink-generic-viz';
import NameDescriptionComponent from '../../name-description/name-description';
import {PinboardVizModel} from '../../viz-layout/viz/pinboard-viz-model';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';
import {PbCardContentComponent} from '../pb-card/pb-card';

let Logger = ngRequire('Logger');

@Component({
    name: 'bkPbGenericViz',
    templateUrl: 'src/modules/pinboard/pb-generic-viz/pb-generic-viz.html'
})
export class PbGenericVizComponent
extends BaseComponent
implements PbCardContentComponent {
    public nameDescriptionComponent:NameDescriptionComponent;
    public genericVizComponent:GenericVizComponent;

    private logger;

    constructor(vizModel:PinboardVizModel,
                onRenderComplete:(vizModel:VisualizationModel) => void) {
        super();
        this.logger = Logger.create('pinboard-data-viz-card');
        this.nameDescriptionComponent = new NameDescriptionComponent(
            () => {
                return vizModel.getTitle();
            },
            () => {
                return vizModel.getDescription();
            }
        );
        this.genericVizComponent = new GenericVizComponent(
            vizModel.getReferencedVisualization(),
            onRenderComplete
        );
    }

    public load () {
        this.logger.info('load called');
    }

    public reflow () {
        this.logger.info('reflow called');
    }

    public getRolledUpActions() : any[] {
        return [];
    }

    public disallowCopyLink() : boolean {
        return false;
    }

    public reset() : void {
        this.logger.info('reset called');
    }
}
