import _ from 'lodash';
import {ngRequire} from '../../../base/decorators';
import {jsonConstants} from '../answer/json-constants';
import {TileLayout} from '../layout/layout-service';
import {VisualizationModel} from '../viz/visualization-model';

let answerMetadataUtil = ngRequire('answerMetadataUtil');

export enum PinboardVizState {
    INITIAL,
    DATA_FETCH_PENDING,
    DATA_FETCHED,
    RENDER_PENDING,
    RENDERED_PARTIAL,
    RENDERED
}

export class PinboardVizInfo {
    private _onVizRenderedCb : Function = _.noop;
    private _viz: VisualizationModel;
    private _referencedViz: VisualizationModel;
    private _answerModel: any;
    private _sageClient: any;
    private _layoutTile: TileLayout;
    private _state: PinboardVizState;

    constructor(viz: VisualizationModel,
                referencedViz: VisualizationModel,
                sageClient: any,
                layoutTile: TileLayout) {
        this._viz = viz;
        this._referencedViz = referencedViz;
        this._answerModel = null;
        this._sageClient = sageClient;
        this._layoutTile = layoutTile;
        let isAlreadyRendered = this._referencedViz.isRenderReady()
            || this._referencedViz.isSecondaryRenderReady();
        this._state = isAlreadyRendered
            ? PinboardVizState.RENDERED
            : PinboardVizState.INITIAL;
    }

    public onVizRendered(callback: () => any) : void {
        this._onVizRenderedCb = callback;
    }

    public populateAnswer(): PromiseLike<any> {
        if (this.answerModel !== null) {
            return Promise.resolve();
        }

        var answerId = this.viz.getReferencedAnswerBookId();
        var metadataType = jsonConstants.metadataType.QUESTION_ANSWER_BOOK;
        return answerMetadataUtil.getModelMetadata(answerId, false, metadataType)
            .then((response) => {
                this._answerModel = response.data;
            });
    }

    public getName(): string {
        return !!this.referencedViz ? this.referencedViz.getTitle() : null;
    }

    get viz(): VisualizationModel {
        return this._viz;
    }

    get referencedViz(): VisualizationModel {
        return this._referencedViz;
    }

    get answerModel(): any {
        return this._answerModel;
    }

    get sageClient(): any {
        return this._sageClient;
    }

    get layoutTile(): TileLayout {
        return this._layoutTile;
    }

    get state(): PinboardVizState {
        return this._state;
    }

    set referencedViz(value: VisualizationModel) {
        this._referencedViz = value;
    }

    set answerModel(value: any) {
        this._answerModel = value;
    }

    set state(value: PinboardVizState) {
        this._state = value;

        if(this._state === PinboardVizState.RENDERED) {
            this._onVizRenderedCb();
        }
    }

    set sageClient(sageClient: any) {
        this._sageClient = sageClient;
    }
}
