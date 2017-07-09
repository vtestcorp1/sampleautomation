/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class for viz cards like, pinboard-viz-card, a3-insight-card,
 * learn-viz-card.
 */

import {ScopedComponent} from '../../../base/base-types/scoped-component';
import {Component, ngRequire} from '../../../base/decorators';
import {events} from '../../../base/events/events';
import {PresentableSlide} from '../../../common/widgets/slide-show/presentable-slide';
import {Slide} from '../../../common/widgets/slide-show/slide';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {PinboardVizModel} from '../../viz-layout/viz/pinboard-viz-model';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';
import {PbClusterVizComponent} from '../pb-cluster-viz/pb-cluster-viz';
import {PbGenericVizComponent} from '../pb-generic-viz/pb-generic-viz';
import {PinboardDataVizComponent} from '../pinboard-data-viz/pinboard-data-viz';
import {PinboardDataVizCardConfigImpl} from '../pinboard-data-viz/pinboard-data-viz-config';
import {getPbCardActions} from './pb-card-actions';
import {PbCardConfig} from './pb-card-config';

export interface PbCardContentComponent {
    reflow: () => void;
    load: () => void;
    getRolledUpActions: () => any[];
    disallowCopyLink: () => boolean;
    reset: () => void;
}

let Logger = ngRequire('Logger');

@Component({
    name: 'bkPbCard',
    templateUrl: 'src/modules/pinboard/pb-card/pb-card.html'
})
export class PbCardComponent
extends ScopedComponent
implements PresentableSlide {
    public slide: Slide;
    isPresented: boolean;
    cardConfig: PbCardConfig;
    vizModel: PinboardVizModel;
    startSlideShow: (id: string) => void;
    onSizeChange: (id: string, size: string) => void;
    remove: () => void;

    public contentType: string;
    public contentCtrl: PbCardContentComponent;

    private actionMenuConfig: any;
    private logger;
    // NOTE: This is only used in runtime transformation, we should get rid of
    // this adding of another callback post creation.
    private onRenderCompleteCallback: Function;

    constructor(
        vizModel: PinboardVizModel,
        onRenderComplete: (vizModel: VisualizationModel) => void,
        vizCardConfig: PbCardConfig,
        startSlideShow: (id: string) => void,
        onSizeChange: (id: string, size: string) => void
    ) {
        super();
        this.logger = Logger.create('pb-card');
        this.vizModel = vizModel;
        this.cardConfig = vizCardConfig;
        this.startSlideShow = startSlideShow;
        this.onSizeChange = onSizeChange;

        this.slide = new Slide(
            this.vizModel.getId(),
            () => {
                return this.vizModel.getTitle();
            },
            () => {
                this.isPresented = true;
                this.contentCtrl.reflow();
            },
            () => {
                this.contentCtrl.reflow();
            }, //onReflow
            () => {
                this.isPresented = false;
                this.contentCtrl.reflow();
            }
        );
        this.initPbCardContentCtrl(onRenderComplete);

        this.actionMenuConfig = getPbCardActions(this);
        this.actionMenuConfig.actions = this.contentCtrl.getRolledUpActions().concat(
            this.actionMenuConfig.actions
        );
    }

    public setOnRenderCompleteCallback(cb: Function) {
        this.onRenderCompleteCallback = cb;
    }

    public getSlide() : Slide {
        return this.slide;
    }

    public emitRemoveVizEvent = () => {
        this.emit(events.TILE_REMOVE_BTN_CLICKED_U, this.vizModel.getReferencedVisualization());
    }

    public loadCard() {
        this.contentCtrl.load();
    }

    public disallowCopyLink() {
        return this.contentCtrl.disallowCopyLink();
    }

    public reflow() {
        this.contentCtrl.reflow();
    }

    public reset() {
        this.contentCtrl.reset();
    }

    private initPbCardContentCtrl(
        onRenderComplete: (vizModel: VisualizationModel) => void
    ) : void {
        switch (this.vizModel.getReferencedVisualization().getVizType().toLowerCase()) {
            case jsonConstants.VIZ_TYPE_GENERIC:
                this.contentCtrl = new PbGenericVizComponent(
                    this.vizModel,
                    onRenderComplete
                );
                this.contentType = 'GENERIC';
                break;
            case jsonConstants.VIZ_TYPE_CHART:
            case jsonConstants.VIZ_TYPE_HEADLINE:
            case jsonConstants.VIZ_TYPE_TABLE:
                this.contentCtrl = new PinboardDataVizComponent(
                    this.vizModel,
                    onRenderComplete,
                    new PinboardDataVizCardConfigImpl({
                        disallowTranformations: this.cardConfig.disallowTranformations,
                        isContextEditable: this.cardConfig.isContextEditable,
                        snapshotId: this.cardConfig.snapshotId,
                        hideActions: true
                    })
                );
                this.contentType = 'DATA';
                break;
            case jsonConstants.VIZ_TYPE_CLUSTER.toLowerCase():
                this.contentCtrl = new PbClusterVizComponent(
                    this.vizModel
                );
                this.contentType = 'CLUSTER';
                break;

            default:
                this.logger.error('Unsupported viz referenced in pinboard');
        }
    }
}
