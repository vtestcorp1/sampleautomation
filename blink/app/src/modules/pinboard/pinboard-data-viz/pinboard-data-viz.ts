/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component for the pinboard data viz.
 * This component has two usages right now, one it is used to create a
 * pinboard data viz card and its used as a child of cluster viz in
 * pinboards.
 */

import {Component, ngRequire} from '../../../base/decorators';
import {events} from '../../../base/events/events';
import {applyMixins} from '../../../base/utils/ts-utils';
import {DataVizComponent} from '../../data-viz/data-viz';
import NameDescriptionComponent from '../../name-description/name-description';
import {AdHocSageClient} from '../../sage-client/ad-hoc-sage-client';
import {fetchData} from '../../viz-layout/pinboard/pinboard-data-fetch-util';
import {PinboardVizModel} from '../../viz-layout/viz/pinboard-viz-model';
import IPromise = angular.IPromise;
import _ from 'lodash';
import {ScopedComponent} from '../../../base/base-types/scoped-component';
import GenericVizComponent from '../../clusterstatus/vizs/generic-viz/blink-generic-viz';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';
import {PbCardContentComponent} from '../pb-card/pb-card';
import {getDataVizComponent} from './data-viz-component-factory';
import {getDataVizActions} from './pinboard-data-viz-actions';
import {PinboardDataVizConfig} from './pinboard-data-viz-config';
import {TransformableViz} from './transformable-viz-mixin';

let Logger = ngRequire('Logger');

@Component({
    name: 'bkPinboardDataViz',
    templateUrl: 'src/modules/pinboard/pinboard-data-viz/pinboard-data-viz.html'
})
export class PinboardDataVizComponent
extends ScopedComponent
implements TransformableViz, PbCardContentComponent {
    public actionMenuConfig: any;
    public nameDescriptionComponent: NameDescriptionComponent;
    public config: PinboardDataVizConfig;
    public size: string;
    public onSizeChange: Function;
    public isContextEditable: boolean = true;
    public isRemovable: boolean = true;
    public adHocQueryAnswer: any;
    public dataVizComponent: DataVizComponent;
    public vizModel: PinboardVizModel;
    public sageClient: AdHocSageClient;
    public onRenderComplete: (vizModel: VisualizationModel) => void;
    public genericVizComponent: GenericVizComponent;

    // Mixin functions.
    // Transformable Viz
    public initTransformableViz: () => void;
    public isTransformed: () => boolean;
    public getTransformedQuestion: () => string;
    public populateAnswer: () => PromiseLike<any>;
    public resetTransformation: () => void;
    public showLoading: boolean = false;
    public getDisplayVizType: () => void;
    public onAdHocQueryUpdate: (any, number) => PromiseLike<any>;
    public onAdHocQueryFailure: () => void;

    private logger;
    // NOTE: This is only used in runtime transformation, we should get rid of
    // this adding of another callback post creation.
    private onRenderCompleteCallback: Function;

    constructor(
        vizModel: PinboardVizModel,
        onRenderComplete: Function,
        config: PinboardDataVizConfig
    ) {
        super();
        this.logger = Logger.create('pinboard-viz-card');
        this.vizModel = vizModel;
        this.onRenderComplete = (vizModel: VisualizationModel) => {
            let pbVizModel = vizModel.getReferencingViz();
            onRenderComplete(pbVizModel);
            if (_.isFunction(this.onRenderCompleteCallback)) {
                this.onRenderCompleteCallback();
            }
        };
        this.config = config;

        this.nameDescriptionComponent = new NameDescriptionComponent(
            () => { return vizModel.getTitle(); },
            () => { return vizModel.getDescription(); }
        );

        if (!this.config.disallowTranformations) {
            this.initTransformableViz();
        }

        this.dataVizComponent = getDataVizComponent(
            vizModel.getReferencedVisualization(),
            this.sageClient,
            this.onRenderComplete,
            false,
            this.dataLoader
        );

        this.actionMenuConfig = getDataVizActions(this);
    }

    public setOnRenderCompleteCallback(cb: Function) {
        this.onRenderCompleteCallback = cb;
    }

    public onEdit = () => {
        let answerId = this.vizModel.getAnswerBookIdThroughReferencingViz();
        this.emit(
            events.SHOW_VIZ_CONTEXT_U,
            answerId,
            this.vizModel.getReferencedVisualization()
        );
    }

    public downloadTable = (format: string) => {
        this.broadcast(events.DOWNLOAD_TABLE, format);
    }

    public downloadChart = () => {
        this.broadcast(events.DOWNLOAD_CHART);
    }

    public load() {
        this.dataVizComponent.loadViz();
    }

    public reflow() {
        this.dataVizComponent.reflow();
    }

    public getRolledUpActions() : any[] {
        return this.actionMenuConfig.actions;
    }

    public disallowCopyLink() : boolean {
        return this.isTransformed();
    }

    public reset() : void {
        this.dataVizComponent.reset();
    }

    private dataLoader = () : IPromise<void> => {
        let id: string = this.vizModel.getId();
        let pinboardModel: any = this.vizModel.getContainingAnswerModel();
        let referencedVizModel = this
            .vizModel
            .getReferencedVisualization();
        return fetchData(
            id,
            referencedVizModel,
            pinboardModel,
            this.config.snapshotId,
            false
        );
    }
}
applyMixins(PinboardDataVizComponent, [TransformableViz]);
