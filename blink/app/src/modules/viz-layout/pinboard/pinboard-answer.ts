import {UIComponent} from '../../../base/base-types/ui-component';
import {Component, ngRequire} from '../../../base/decorators';
import {SlideShowV2Component} from '../../../common/widgets/slide-show/slide-show';
import {PinboardPageConfig} from '../../pinboard/pinboard-page-config';
import {migrateLayoutTiles} from '../layout/layout-migration-service';
import {LayoutService, TileElement, TileLayout} from '../layout/layout-service';
import IQService = angular.IQService;
import _ from 'lodash';
import {UserWorkflowActionTypes} from '../../../base/proto/blink-types';
import {getRouteParameter} from '../../../base/route-service';
import {
    clearQueue
} from '../../../services/viz-render-queuing-service';
import {PbCardComponent} from '../../pinboard/pb-card/pb-card';
import {
    endWorkflow, terminateWorkflow
} from '../../user-workflow-manager/workflow-management-service';
import {PinboardVizModel} from '../viz/pinboard-viz-model';
import {transformVisualization} from './runtime-transformation-service';

let $q: IQService = ngRequire('$q');
let util = ngRequire('util');
let events = ngRequire('events');
let perfEvents = ngRequire('perfEvents');

declare var sage: any;

@Component({
    name: 'bkPinboardAnswer',
    templateUrl: 'src/modules/viz-layout/pinboard/pinboard-answer.html'
})
export class PinboardAnswerComponent extends UIComponent {
    private pinboardPageConfig: PinboardPageConfig;
    private layoutService: LayoutService;
    private pinboardAnswerModel: any;
    private slideShow: SlideShowV2Component;
    private slideOrder: Map<string, number>;
    private isRuntimeTransformationApplied: boolean;
    // TODO(Jasmeet): Understand zone in more detail.
    // Callbacks for error handling are bound to the zone object which is never cleaned up.
    // In the documentation its unclear how to delete/unregister a zone.
    // For now to work around the memory leak caused by zone onError, as that keeps the pinboard
    // answer model and other objects in its closure
    private pinboardVizCardComponents: {[id: string]: PbCardComponent} = {};
    private element;
    private vizIdToLayoutTileMap: {[id: string]: TileLayout} = {};

    /**
     * This set contains the IDs of the vizs that are supposed be loaded as part of the initial load
     * but haven't reached their final 'RENDERED' state in their fetching and rendering lifecycle.
     * This is used in tracking whether the pinboard has finished initial loading or not.
     */
    private vizIDsToLoad: Set<string>;
    /**
     * Tracks whether the pinboard has finished initial loading or not.
     */
    private isPinboardLoaded: boolean = false;

    constructor(pinboardPageConfig: PinboardPageConfig) {
        super();

        this.pinboardPageConfig = pinboardPageConfig;

        this.init();

        var slideShowConfiguration = {
            getTitle: () => {
                return this.pinboardAnswerModel.getName();
            },
            showNavigator: 'auto',
            isPresentable: function ($candidate) {
                return true;
            },
            sortPredicate: ($el1, $el2) => {
                var id1 = $el1.attr('viz-id'),
                    id2 = $el2.attr('viz-id');

                var pos1 = this.slideOrder[id1] || -1,
                    pos2 = this.slideOrder[id2] || -1;

                return pos1 - pos2;
            },
            onStart: () => {
                terminateWorkflow();
                this.layoutService.disableDragging();
            },
            onStop: () => {
                this.layoutService.enableDragging();
            },
            onGoToSlide: ($el) => {
                let id = $el.attr('viz-id');
                let pinboardVizCardComponent = this.pinboardVizCardComponents[id];
                this.loadViz(pinboardVizCardComponent);
            }
        };
        this.slideShow = new SlideShowV2Component(slideShowConfiguration);

        this.on(events.PINBOARD_VISUALIZATION_QUERY_CHANGED_D,
            (evt: any, vizIds: Array<string>) => {
                vizIds.forEach((vizId) => {
                    this.pinboardVizCardComponents[vizId].reset();
                });
                this.loadVizs();
            }
        );
    }

    public postLink(element: JQuery) {
        this.element = element;
        let container: JQuery = element.find('.bk-answer-canvas');

        this.layoutService = new LayoutService(
            container,
            this.getTile,
            this.onTileDestroyed,
            this.onLayoutReflowDone,
            this.onViewportChanged
        );

        this._render();
    }

    public onTileResized = (vizId: string, newSize) => {
        this.layoutService.onTileResized(vizId, newSize);
        this.pinboardAnswerModel.setHasUserTriggeredChanges(true);
    }

    public onRenderComplete = (vizModel: PinboardVizModel) => {
        let pbVizId = vizModel.getId();
        this.vizIDsToLoad.delete(pbVizId);

        if (this.vizIDsToLoad.size === 0) {
            return this.applyRuntimeTransformations().then(() => {
                this.emit(perfEvents.PINBOARD_RENDERED);
                endWorkflow(UserWorkflowActionTypes.PINBOARD_LOAD);
                this.isPinboardLoaded = true;
            });
        }
    }

    /**
     * Made public for the ease of testing. Do not call from outside.
     * @param isDragged
     */
    public onLayoutReflowDone = (isDragged: boolean) => {
        this.updateSlideOrder();
        this.loadVizs();
        if (isDragged) {
            this.pinboardAnswerModel.setHasUserTriggeredChanges(true);
        }
        // (TODO Rahul) should not be an event
        this.broadcast(events.LAYOUT_REFLOW_DONE_D);
    }

    public isLoaded(): boolean {
        return this.isPinboardLoaded;
    }

    public render(pinboardAnswerModel: any) {
        this.pinboardAnswerModel = pinboardAnswerModel;
        this.init();
        if (this.isLinked) {
            this._render();
        }
    }

    public reflow() {
        this.layoutService.reflow();
    }

    public onDestroy() {
        terminateWorkflow();
        clearQueue();
    }

    private init() {
        this.vizIDsToLoad = new Set<string>();
        this.isRuntimeTransformationApplied = false;

        let pinboardAnswerModel = this.pinboardAnswerModel;
        if (!pinboardAnswerModel) {
            return;
        }

        let vizIdToVizMap: {[id: string]: PinboardVizModel} =
            pinboardAnswerModel.getCurrentAnswerSheet().getVisualizations();
        let vizIdToReferencedModelMap: {[id: string]: any} =
            pinboardAnswerModel.getVizIdToReferencedVizMap();
        let layoutTiles: TileLayout[] =
            pinboardAnswerModel.getCurrentAnswerSheet().getLayoutTiles(
                this.pinboardPageConfig.flattenClusterVizs, // flattenClusters
                this.pinboardPageConfig.isAutoCreated // applyInsightsStyle
            );

        let vizIdsToShow: {[id: string]: string} = (!!this.pinboardPageConfig.vizIdsToShow)
            ? _.keyBy(this.pinboardPageConfig.vizIdsToShow, (id) => id)
            : null;

        if(!!vizIdsToShow) {
            layoutTiles = layoutTiles.filter((layoutTile) => {
                return !!vizIdsToShow[layoutTile.id];
            });
        }

        this.vizIdToLayoutTileMap = _.keyBy(layoutTiles, (tile: TileLayout) => {
            return tile.id;
        });

        layoutTiles.forEach((tile: TileLayout) => {
            let vizId: string = tile.id;
            let vizModel: PinboardVizModel = vizIdToVizMap[vizId];
            if (!this.pinboardVizCardComponents[vizId]) {
                let permission = this.pinboardAnswerModel.getPermission() || {};
                let perAnswerpermission = permission.answerDocumentPermissions || {};
                let vizAnswerBookId = vizModel.getReferencedAnswerBookId();
                let vizPermission = perAnswerpermission[vizAnswerBookId];
                let isMissingUnderlyingAccess: boolean = vizPermission
                    ? vizPermission.isMissingUnderlyingAccess()
                    : true;
                this.pinboardVizCardComponents[vizId] = new PbCardComponent(
                    vizModel,
                    this.onRenderComplete,
                    {
                        disallowTileMaximization: this.pinboardPageConfig.disallowTileMaximization,
                        disallowLayoutChanges: this.pinboardPageConfig.disallowLayoutChanges,
                        disallowTileRemoval: this.pinboardPageConfig.disallowTileRemoval,
                        disallowTranformations: isMissingUnderlyingAccess,
                        snapshotId: this.pinboardPageConfig.snapshotId,
                        isContextEditable: !this.pinboardPageConfig.disallowVizContextEdit
                    },
                    this.slideShow.start,
                    (id, size) => {
                        this.vizIdToLayoutTileMap[id].size = size;
                        this.pinboardAnswerModel.setHasUserTriggeredChanges(true);
                        this.layoutService.reflow();
                    }
                );
            }
        });

        migrateLayoutTiles(this.vizIdToLayoutTileMap, vizIdToReferencedModelMap);
    }

    private updateSlideOrder() {
        var comparator = function(order, viz: TileLayout, i) {
            order[viz.id] = isNaN(viz.order) ? i : viz.order;
            return order;
        };
        this.slideOrder = this.layoutService.getTiles().reduce(comparator, {});
    }

    private _render() {
        // Null or empty pinboard model
        if (!this.pinboardAnswerModel || this.pinboardAnswerModel.hasNoData()) {
            this.layoutService.redraw({}, false);
            return $q.when();
        }

        let layoutTiles: TileLayout[] =
            this.pinboardAnswerModel.getCurrentAnswerSheet().getLayoutTiles(
                this.pinboardPageConfig.flattenClusterVizs, // flattenClusters
                this.pinboardPageConfig.isAutoCreated // applyInsightsStyle
            );

        let vizIdsToShow: {[id: string]: string} = (!!this.pinboardPageConfig.vizIdsToShow)
            ? _.keyBy(this.pinboardPageConfig.vizIdsToShow, (id) => id)
            : null;

        if(!!vizIdsToShow) {
            layoutTiles = layoutTiles.filter((layoutTile) => {
                return !!vizIdsToShow[layoutTile.id];
            });
        }

        var allowEdit = this.isAllowedToEditLayout(this.pinboardAnswerModel);

        util.executeInNextEventLoop(() => {
            this.layoutService.redraw(
                this.vizIdToLayoutTileMap,
                allowEdit
            );
            this.updateSlideOrder();
        });
    }

    private onTileDestroyed = (tile: TileElement) => {
        var $node = tile.$node;
        var tileScope = $node.isolateScope();
        if(!!tileScope) {
            tileScope.$destroy();
        }
    }

    private onViewportChanged = () => {
        terminateWorkflow();
        this.loadVizs();
    }

    private loadVizs() {
        let tiles: TileLayout[] = this.pinboardPageConfig.eagerLoadVizs ?
            this.layoutService.getTiles() :
            this.layoutService.getTilesInViewport();

        let tileIds: string[] = tiles.map((tile: TileLayout) => tile.id);

        if (tileIds.length === 0) {
            this.isPinboardLoaded = true;
        } else {
            tileIds.forEach((id: string) => {
                let pinboardVizCardCompoent = this.pinboardVizCardComponents[id];
                this.loadViz(pinboardVizCardCompoent);
            });
        }
    }

    private loadViz(pinboardVizCardComponent: PbCardComponent) {
        let id = pinboardVizCardComponent.vizModel.getId();
        if (!this.vizIDsToLoad.has(id)) {
            this.vizIDsToLoad.add(id);
            pinboardVizCardComponent.loadCard();
        }
    }

    private getTile = (vizId: string): Promise<TileElement> => {
        let elem = this.element.find('#' + vizId);
        return new Promise((resolve)=> {
            resolve({
                id: vizId,
                $node: elem
            });
        });
    }

    /**
     * Returns whether layout edits (dragging and resizing vizs) are allowed
     *
     * @return {boolean}  True if layout edits are allowed
     */
    private isAllowedToEditLayout(answerModel: any) {
        var allowLayoutEdit = !this.pinboardPageConfig.disallowLayoutChanges;
        if (answerModel) {
            allowLayoutEdit = allowLayoutEdit && answerModel.getPermission().isLayoutAllowed();
        }
        return allowLayoutEdit;
    }

    /**
     * Applies any transformations passed as a url parameter.
     * Currently works only when showing a single Viz.
     */
    private applyRuntimeTransformations() : PromiseLike<void> {
        if(this.isRuntimeTransformationApplied) {
            return $q.when();
        }
        let runtimeTransformation = getRouteParameter('transformation');
        this.isRuntimeTransformationApplied = true;

        // Runtime transforms currently supported only when showing single viz.
        if(_.values(this.pinboardVizCardComponents).length !== 1 || !runtimeTransformation) {
            return $q.when();
        }

        let pinboardVizCardComponent = _.values(this.pinboardVizCardComponents)[0];
        runtimeTransformation = decodeURIComponent(runtimeTransformation);
        return transformVisualization(pinboardVizCardComponent, runtimeTransformation);
    }
}
