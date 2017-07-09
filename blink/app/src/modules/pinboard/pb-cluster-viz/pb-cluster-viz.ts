/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view a pinboard visualization cluster.
 */

import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import NameDescriptionComponent from '../../name-description/name-description';
import {PinboardVizModel} from '../../viz-layout/viz/pinboard-viz-model';
import {VizClusterModel} from '../../viz-layout/viz/viz-cluster/viz-cluster-model';
import {PbCardContentComponent} from '../pb-card/pb-card';
import {PinboardDataVizComponent} from '../pinboard-data-viz/pinboard-data-viz';
import {PinboardDataVizCardConfigImpl} from '../pinboard-data-viz/pinboard-data-viz-config';

@Component({
    name: 'bkPbClusterViz',
    templateUrl: 'src/modules/pinboard/pb-cluster-viz/pb-cluster-viz.html'
})
export class PbClusterVizComponent
extends BaseComponent
implements PbCardContentComponent {
    public activeVizIndex;
    public nameDescriptionComponent: NameDescriptionComponent;

    private dataVisualizations: PinboardDataVizComponent[];

    constructor(
        vizModel: PinboardVizModel
    ) {
        super();
        this.nameDescriptionComponent = new NameDescriptionComponent(
            () => {
                return vizModel.getTitle();
            },
            () => {
                return vizModel.getDescription();
            }
        );

        let vizClusterModel = <VizClusterModel>vizModel.getReferencedVisualization();
        this.dataVisualizations = vizClusterModel.clusteredVisualizations.map((viz) => {
            return new PinboardDataVizComponent(
                <PinboardVizModel>viz,
                _.noop,
                new PinboardDataVizCardConfigImpl({})
            );
        });
        if (this.dataVisualizations.length > 0) {
            this.activeVizIndex = 0;
        }
    }

    public onActiveSlideChangeCallback = (index) => {
        this.dataVisualizations[index].load();
    }

    public load () {
        this.dataVisualizations[this.activeVizIndex].load();
    }

    public reflow () {
        this.dataVisualizations[this.activeVizIndex].reflow();
    }

    public getRolledUpActions() : any[] {
        return [];
    }

    public disallowCopyLink() : boolean {
        return false;
    }

    public reset() : void {
        this.dataVisualizations[this.activeVizIndex].reset();
    }
}
