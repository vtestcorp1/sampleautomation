/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Base class for all the data visualizations.
 */

import {ScopedComponent} from '../../base/base-types/scoped-component';
import {Component, ngRequire} from '../../base/decorators';
import {events} from '../../base/events/events';
import {
    enqueuePrimaryRenderRequest,
    enqueueSecondaryRenderRequest, renderComplete
} from '../../services/viz-render-queuing-service';
// tslint:disable-next-line
import {VisualizationPinnerLauncherComponent} from '../viz-layout/viz/common/pinboard-drop-down/visualization-pinner/visualization-pinner-launcher-component';
import {VisualizationModel} from '../viz-layout/viz/visualization-model';
import IPromise = angular.IPromise;

let Logger = ngRequire('Logger');
declare let Zone: any;

@Component({
    name: 'bkDataViz',
    templateUrl: 'src/modules/data-viz/data-viz.html'
})
export class DataVizComponent extends ScopedComponent {
    public static TYPES = {
        CHART: 'chart',
        HEADLINE: 'headline',
        TABLE: 'table'
    };

    public static STATES = {
        INITIAL: 'initial',
        LOADING_DATA: 'loadingData',
        DATA_LOADED: 'dataLoaded',
        // TODO(Jasmeet): Eventually we need to bring out primary and secondary render
        // state out of viz model into the view component.
        RENDER: 'render',
        CORRUPT: 'corrupt',
        DATA_LOAD_FAILED: 'dataLoadFailed'
    };

    public type: string;
    public state: string;
    public allowPinning: boolean;
    public vizPinnerLauncherComponent: VisualizationPinnerLauncherComponent;

    private dataLoader: () => IPromise<void>;
    private logger;
    private onRenderComplete: (vizModel: VisualizationModel) => void;
    private vizModel: VisualizationModel;
    private vizRenderZone: any;

    constructor(
        vizModel: VisualizationModel,
        type: string,
        allowPinning: boolean,
        dataLoader: () => IPromise<any>,
        onRenderComplete: (vizModel: VisualizationModel) => void
    ) {
        super();
        this.logger = Logger.create('data-viz');
        this.vizModel = vizModel;
        this.type = type;
        this.allowPinning = allowPinning;
        this.dataLoader = dataLoader;
        this.onRenderComplete = onRenderComplete;

        this.state = DataVizComponent.STATES.INITIAL;

        if (allowPinning) {
            this.vizPinnerLauncherComponent = new VisualizationPinnerLauncherComponent(vizModel);
        }
    }

    public loadViz() {
        switch (this.state) {
            case DataVizComponent.STATES.INITIAL:
                this.state = DataVizComponent.STATES.LOADING_DATA;
                this.dataLoader()
                    .then(
                        () => {
                            this.onVizDataUpdate();
                        },
                        () => {
                            this.state = DataVizComponent.STATES.DATA_LOAD_FAILED;
                        }
                    );
            default:
                this.logger.info('viz already loading', this.vizModel.getId());
        }
    }

    public onRenderCompleteCallback = (vizModel: VisualizationModel, isPartial: boolean) => {
        renderComplete(vizModel.getId());
        if (!isPartial) {
            // NOTE: The public contract of render complete is not aware of primary and
            // secondary render.
            this.onRenderComplete(vizModel);
        }
    }

    public reflow() {
        // NOTE: Once all the vizs(chart, table) have been migrated to TS this eventing will
        // go away and we will add public reflow function on the objects.
        this.broadcast(events.REFLOW_VIZ);
    }

    public onDestroy() {
        if (this.vizRenderZone) {
            this.vizRenderZone.onError = null;
        }
    }

    public reset() {
        this.vizModel.setRenderReady(false);
        this.vizModel.setSecondaryRenderReady(false);
        this.state = DataVizComponent.STATES.INITIAL;
    }

    private onVizDataUpdate = () => {
        this.state = DataVizComponent.STATES.DATA_LOADED;
        let vizId = this.vizModel.getId();
        enqueuePrimaryRenderRequest(vizId)
            .then(() => {
                this.vizModel.setRenderReady(true);
                this.renderVisualizationInZone();
                this.state = DataVizComponent.STATES.RENDER;
            });
        enqueueSecondaryRenderRequest(vizId)
            .then(() => {
                this.vizModel.setSecondaryRenderReady(true);
                this.renderVisualizationInZone();
            });
    }

    /*
     * Zonejs adds thread locals to Javascript, by doing the below
     * we can catch exceptions in async workflows as well.
     */
    private renderVisualizationInZone() {
        this.vizRenderZone = Zone.current.fork({});
        this.vizRenderZone.onError = () => {
            // On error
            this.onRenderCompleteCallback(
                this.vizModel,
                false
            );
        };
        this.vizRenderZone.run(() => {
            this.forceRender();
        });
    }
}
