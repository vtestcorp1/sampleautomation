/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Visualization model for the viz cluster.
 */

import {Provide} from '../../../../base/decorators';
import {jsonConstants} from '../../answer/json-constants';
import {VisualizationModel} from '../visualization-model';

@Provide('VizClusterModel')
export class VizClusterModel extends VisualizationModel {
    public clusteredVisualizations: VisualizationModel[] = [];
    private vizJson : any;

    constructor(params) {
        super(params);
        this.vizJson = params.vizJson;
    }

    public resolveMembers(vizMap) : void {
        this.vizJson[jsonConstants.VIZ_CONTENT_KEY][jsonConstants.REF_VIZ_IDS_KEY].forEach((id) => {
            this.addVisualization(vizMap[id]);
        });
        this._isRenderReady = true;
        this._isSecondaryRenderReady = true;
    }

    public getQuestionText() {
        return '';
    }

    public getVizColumns() {
        return [];
    }

    public getReferencedVizIds() : string[] {
        return this.clusteredVisualizations.map((viz: VisualizationModel) => {
            return viz.getId();
        });
    }

    private addVisualization(visualizationModel: VisualizationModel) {
        this.clusteredVisualizations.push(visualizationModel);
    }
}
