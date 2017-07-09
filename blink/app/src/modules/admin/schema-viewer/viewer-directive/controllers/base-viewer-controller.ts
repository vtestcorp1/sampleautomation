/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This is the base controller for all viewer
 *
 * This controller offers basic functionality for drawing various graphs
 * and navigating amongst its elements
 *
 */

'use strict';

import {ngRequire, Provide} from 'src/base/decorators';
import {BaseComponent} from '../../../../../base/base-types/base-component';
import GraphLegendComponent from '../../legend/blink-graph-legend';
import {BKSchema} from '../../schema-fetcher/schema-model';
import {getSchema} from '../../schema-fetcher/schema-service';
import {
    ListItem, NavigationListController
}
    from '../../schema-navigation-list/controllers/navigation-list-controller';

let loadingIndicator = ngRequire('loadingIndicator');

@Provide('BaseViewerController')
export default class BaseViewerController extends BaseComponent {

    public legendController: GraphLegendComponent;

    public graphIsReady: boolean = false;
    public shouldShowLegend: boolean = true;
    public shouldShowOverview: boolean = false;
    public hasError: boolean = false;
    public schemaFilter: number;

    public schema: BKSchema;

    public canvasId: string = 'graphContainer';
    public outlineId: string = 'outlineContainer';

    public modalController: BaseComponent;
    public showModal: boolean;
    public applyFilters: any;

    private s: any;

    public constructor(legendColors: {[id: string]: string},
                       legendPictures: {[id: string]: string},
                       public graphViewerController: any,
                       public navigationController: NavigationListController) {
        super();

        this.s = this.strings.schemaViewer;
        this.legendController = new GraphLegendComponent(legendColors,
            legendPictures);
        this.graphIsReady = false;
        this.shouldShowOverview = true;
        this.schema = null;
        this.graphViewerController = graphViewerController;
        this.navigationController = navigationController;
        this.hasError = false;
    }

    public onGraphDisplayed(objectId: string) {
        this.graphIsReady = true;
        this.hideIndicator();
    }

    public zoom(zoomIn: boolean) {
        if (zoomIn) {
            this.graphViewerController.zoomIn();
        } else {
            this.graphViewerController.zoomOut();
        }
    }

    public loadSchema() {
        this.showIndicator();
        let done =  (schema:BKSchema) => this.onSchemaLoaded(schema);

        getSchema(this.schemaFilter)
            .then(done, () => this.onFailure());
    }

    public onFailure = () => {
        this.hasError = true;
    }

    public showIndicator = function() {
        loadingIndicator.show(
            {
                anchorElementOrSelector : 'body',
                showInstantly: true,
                additionalStyleClasses: ['bk-darker-overlay']
            }
        );
    };

    public hideIndicator = function() {
         loadingIndicator.hide();
    };

    public onListItemClicked = (id:string, item: ListItem) => {
        this.graphViewerController.goToObject(id);
    }

    public onSchemaLoaded(schema: BKSchema) {
        this.schema = schema;
    }

    public setSchemaFilter(filter) {
        this.schemaFilter = filter;
    }

    public setupItemsForListController(items: ListItem[]) {
        this.navigationController.setItems(items);
    }

    public setupGraphForViewer(graph, hasOverview: boolean) {
        this.graphViewerController.setGraph(graph);
        this.graphViewerController.initDiagramCanvas(this.canvasId);
        this.graphViewerController.setupModel();
        this.graphViewerController.setupDiagram();
        this.graphViewerController.setupLayout();
        this.graphViewerController.defineTemplates();

        if (hasOverview) {
            this.graphViewerController.setupOverview();
        }
    }
    public closeModal() {
        this.modalController = null;
        this.showModal = false;
    }

}
