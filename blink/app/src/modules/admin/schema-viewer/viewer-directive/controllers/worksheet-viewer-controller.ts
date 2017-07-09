/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview
 *
 */


import {jsonConstants} from  'src/modules/viz-layout/answer/json-constants';
import {buildGraphForWorksheet} from '../../graph-model/factories/graph-factory-service';
import {BKSchema} from '../../schema-fetcher/schema-model';
import {options} from '../../schema-fetcher/schema-service';
import WorksheetSchemaNavigationListController
    from '../../schema-navigation-list/controllers/worksheet-navigation-list-controller';
import BaseViewerController from './base-viewer-controller';

import {ngRequire, Provide} from 'src/base/decorators';
let WorksheetGraphViewerController = ngRequire('WorksheetGraphViewerController');
let DocumentLoader = ngRequire('DocumentLoader');

/* eslint no-bitwise: 1 */
const filter = options.SYSTEM_TABLE.value |
    options.IMPORTED_DATA.value |
    options.WORKSHEET.value |
    options.AGGR_WKS_FLAG.value;

@Provide('WorksheetViewerController')
export default class  WorksheetViewerController extends BaseViewerController {

    private targetedObjectId: string;

    public constructor(worksheetId: string, legendColors, legendPictures) {
        super(legendColors, legendPictures, void 0, void 0);
        let graphDisplayedCallback = () => this.onGraphDisplayed(worksheetId);
        this.targetedObjectId = worksheetId;
        this.graphViewerController = new WorksheetGraphViewerController(null,
            graphDisplayedCallback,
            (type, id) => this.onColumnSelected(type, id));
        this.navigationController = new WorksheetSchemaNavigationListController([],
            (id, item) => this.onListItemClicked(id, item));
        this.shouldShowOverview = false;
        this.setSchemaFilter(filter);
    }
    public onListItemClicked = (id: string, item: any) => {
        // find item and select it in graph viewer;
        this.graphViewerController.highlightWorksheetColumn(item);
    }


    public setupOverview() {
        // in case of worksheet-viewer, we do not show the overview (TBD)
    }

    public onSchemaLoaded(schema: BKSchema) {
        super.onSchemaLoaded(schema);
        let documentLoader = new DocumentLoader();
        documentLoader
            .loadDocument(this.targetedObjectId, jsonConstants.metadataType.LOGICAL_TABLE)
            .then((worksheetModel) => {
                    let graph = buildGraphForWorksheet(this.schema, worksheetModel);
                    let items = worksheetModel.getColumns().map((column) =>
                        WorksheetSchemaNavigationListController.buildListItem(
                            column,
                            column.getGuid(),
                            void 0,
                            false
                    ));

                    this.navigationController.setItems(items);
                    this.setupGraphForViewer(graph, false);
                }, this.onFailure.bind(this)
            );
    }

    public onColumnSelected = (type: string, elementId: string) => {
        this.navigationController.selectItem(
            this.navigationController.findItemById(elementId)
        );
    }
}
