/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This is the base controller for all viewer
 *
 * This controller coordinates a navigation list and a canvas for a given schema
 *
 */


import {jsonConstants} from  'src/modules/viz-layout/answer/json-constants';
import {buildFullSchemaGraphForSchema} from '../../graph-model/factories/graph-factory-service';
import {options} from '../../schema-fetcher/schema-service';
import FullSchemaNavigationListController
    from '../../schema-navigation-list/controllers/full-schema-navigation-list-controller';
import BaseViewerController from './base-viewer-controller';

import {ngRequire, Provide} from 'src/base/decorators';
import {BKSchema, TableItem} from '../../schema-fetcher/schema-model';
import SchemaViewerModalComponent from '../modal-viewer-controller';

let FullSchemaGraphViewerController = ngRequire('FullSchemaGraphViewerController');
let sessionService = ngRequire('sessionService');
let schemaTemplatesService = ngRequire('schemaTemplatesService');
let WorksheetViewerController = ngRequire('WorksheetViewerController');
let listFiltersService = ngRequire('listFiltersService');

/* eslint no-bitwise: 1 */
const filter = options.SYSTEM_TABLE.value |
    options.IMPORTED_DATA.value |
    options.WORKSHEET.value |
    options.AGGR_WKS_FLAG.value;


@Provide('FullSchemaViewerController')
export class FullSchemaViewerController extends BaseViewerController {

    //TODO(remove)
    public baseItems: any[];
    public filters: any[];
    public stickers: any[];


    public constructor(tableId: string,
                       legendColors: {[id: string]: string},
                       legendPictures: {[id: string]: string}) {


        super(
            legendColors,
            legendPictures,
            void 0,
            void 0,
        );

        //TODO(chab) would be nice to move that to constructor
        this.navigationController = new FullSchemaNavigationListController(
            [],
            (id, item) => this.onListItemClicked(id, item),
            (id, item) => this.onListItemDblClicked(id, item)
        );
        this.graphViewerController = new FullSchemaGraphViewerController(
            null,
            () => this.onGraphDisplayed(tableId),
            this.onVertexSelected,
            this.onVertexDblClicked
        );
        this.setSchemaFilter(filter);

        this.filters = [
            listFiltersService.standardFilters.clientAuthorFilter,
            listFiltersService.standardFilters.typeFilter
        ];

        this.stickers = listFiltersService.standardFilters.stickers;

        this.applyFilters = function() {

            let itemsIdToItemMap = {};
            this.baseItems.forEach((item) => {

                let labelFiltered = this.stickers.isLabelledWith(item.values);
                let isFiltered = this.filters.every(function(filter) {
                    return filter.isFiltered(item.values);
                });
                let vertex = this.graphViewerController.graph.getVertex(item.id);

                let isVisible = labelFiltered && isFiltered;
                if (isVisible) {
                    itemsIdToItemMap[item.id] = item;
                }
                vertex.visible = isVisible;
            });

            // We are bypassing the library by setting directing the visible property on the
            // underlying model, and then we update the whole diagram
            this.graphViewerController.updateVisibility();
            let itemIds = Object.keys(itemsIdToItemMap),
                items = Object.values(itemsIdToItemMap);
            this.setupItemsForListController(items);

            let selectedItem = this.navigationController.selectedItem;
            if (selectedItem && itemsIdToItemMap[selectedItem.id]) {
                this.graphViewerController.goToObject(selectedItem.id);
                this.onVertexSelected(selectedItem.id);
            } else {
                if (itemIds.length > 0) {
                    this.graphViewerController.goToObject(itemIds[0]);
                    this.onVertexSelected(itemIds[0]);
                }
            }
        };
    }

    /**
     *
     * @override
     */
    public onGraphDisplayed(objectId: string)  {
        super.onGraphDisplayed(objectId);
        this.applyFilters(); // TODO(make some kind of applyFilters behaviour for our classes ?
        if (objectId) {
            this.graphViewerController.goToObject(objectId);
        } else {
            if (this.schema.tables.length > 0) {
                let firstNonDeletedTable = this.schema.tables.find(function(t) {
                    return !t.isDeleted();
                });
                this.graphViewerController.goToObject(firstNonDeletedTable.getId());
            }
        }
    }

    public onVertexSelected = (elementId: string) => {
        if(elementId) {
            this.navigationController.selectItem(
                this.navigationController.findItemById(elementId)
            );
        }
    }

    public onListItemDblClicked = (id: string, item: TableItem) => {
        this.onVertexDblClicked(item.getType(), id, item.getName());
    }

    public onVertexDblClicked = (type: string, elementId: string, name: string) => {
        if(!sessionService.isWorksheetViewerEnabled()) {
            return;
        }

        if (type === jsonConstants.metadataType.subType.WORKSHEET) {
            let controller = new WorksheetViewerController(
                elementId,
                schemaTemplatesService.schemaLegend,
                schemaTemplatesService.schemaLegendPicture
            );
            controller.canvasId = 'modal' + elementId;
            controller.outlineId = 'modalOutline' + elementId;
            controller.onSchemaLoaded(this.schema);
            controller.showModal = false;
            let closeCallback = () => this.closeModal();

            this.modalController = new SchemaViewerModalComponent(name,
                controller,
                closeCallback);
            this.showModal = true;
        }
    }


    public relayoutGraph() {
        this.graphViewerController.diagram.requestUpdate();
    }

    /**
     *
     * @override
     */
    public onSchemaLoaded(schema: BKSchema) {
        super.onSchemaLoaded(schema);
        this.baseItems = this.buildListItems(schema);
        this.setupGraphForViewer(this.buildGraph(schema), this.shouldShowOverview);
        this.setupItemsForListController(this.buildListItems(schema));
    }

    private buildGraph(schema: BKSchema) {
        return buildFullSchemaGraphForSchema(schema);
    }

    private buildListItems(schema: BKSchema) {
        /* eslint camelcase: 1 */
        // Note(chab) waiting for callosum to remove this mapping
        return schema.tables.filter((table) => {
            return !table.isDeleted();
        }).sortBy(function(table){
            return table.getName();
        }).map((table) => {
            let values = {
                author: table.getAuthor(),
                type: table.getType(),
                tags: table.getTags()
            };
            return FullSchemaNavigationListController.
                buildListItem(table, table.getId(), values ,false);
        });
    }
}
