/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  This service take an object a send back the appropriate vertex
 */

'use strict';

import _ from 'lodash';
import {ngRequire} from '../../../../../base/decorators';
import {strings} from '../../../../../base/strings';
import {jsonConstants} from '../../../../viz-layout/answer/json-constants';
import {ColumnItem, TableItem} from '../../schema-fetcher/schema-model';
import Edge from '../edge-model';
import Vertex from '../vertex-model';

let schemaTemplatesService = ngRequire('schemaTemplatesService');

class DataTypeVertex {
    public constructor( public headerPicture: string, public headerColor: string) { }

}
class DataTypeTableSchemaVertex extends DataTypeVertex {
    public constructor() {
        super(
            schemaTemplatesService.canvasStyle.fullSchema.tablePicture,
            schemaTemplatesService.canvasStyle.fullSchema.tableColor
        );
    }
}

class DataTypeWksSchemaVertex extends DataTypeVertex {
    public constructor() {
        super(
            schemaTemplatesService.canvasStyle.fullSchema.worksheetPicture,
            schemaTemplatesService.canvasStyle.fullSchema.worksheetColor
        );
    }
}

class DataTypeOtherSchemaVertex extends DataTypeVertex {
    public constructor() {
        super(
                schemaTemplatesService.canvasStyle.fullSchema.worksheetPicture,
                schemaTemplatesService.canvasStyle.fullSchema.unknownTypeColor
        );
    }
}

abstract class ContainerVertex {
    public constructor(
        public key: string,
        public tableName: string,
        public htmlToolTip: string,
        public stroke: string) {}
}
class FullSchemaContainerVertex extends ContainerVertex {

    public fields: any[];

    public constructor(table: TableItem) {
        super(
            table.getId(),
            table.getName(),
            table.getTooltip(),
            table.isDeleted() ?
                schemaTemplatesService.canvasStyle.fullSchema.errorColor:
                schemaTemplatesService.canvasStyle.fullSchema.joinStroke);
    }
}

class WorksheetContainerVertex extends FullSchemaContainerVertex {
    public constructor(table: TableItem) {
        super(table);
    }
}

class ViewerVertex extends Vertex {

    public fields: any[];

    public constructor(table: TableItem, typeVertex, visible: boolean = true) {
        super(table, table.getId());
        _.extend(this, typeVertex);
        _.extend(this, this.getContainerVertex(table));
    }

    protected getContainerVertex(table: TableItem) {
        return new FullSchemaContainerVertex(table);
    }

    public getEdges(filterDeletedEdges: boolean): Edge[] {
        let filterFunction = null;

        if (filterDeletedEdges) {
            filterFunction = (edge  => {
                return !edge.data.isDeleted();
            });
        }

        return super.getEdges(filterDeletedEdges, filterFunction);
    }

    protected determineKeyPicture(column: ColumnItem): string {

        if (column.isFormula()) {
            return schemaTemplatesService.canvasStyle.fullSchema.formulaPicture;
        }

        if (column.isPrimaryKey() && column.isForeignKey()) {
            return schemaTemplatesService.canvasStyle.fullSchema.pkFkPicture;
        } else if (column.isPrimaryKey()) {
            return schemaTemplatesService.canvasStyle.fullSchema.pkPicture;
        } else if (column.isForeignKey()) {
            return schemaTemplatesService.canvasStyle.fullSchema.fkPicture;
        }
        return null;
    }

    protected setupColumns(table: TableItem) {
        this.fields = table.getSortedColumnsForSchema()
            .filter((c) => {
                return !c.isDeleted();
            }).map((c) => {
                return {
                    key: c.getId(),
                    name: c.getName(),
                    textColor: 'black',
                    info: c.getDataType(),
                    pkImage: this.determineKeyPicture(c)
                };
            });
    }
}

class TableFullSchemaViewerVertex extends ViewerVertex {
    public constructor(table) {
        super(table, new DataTypeTableSchemaVertex());
    }
}

class WorksheetFullSchemaViewerVertex extends ViewerVertex {
    public constructor(table) {
        super(table, new DataTypeWksSchemaVertex());
    }

    protected determineKeyPicture(column: ColumnItem): string {
        if (column.isFormula()) {
            return schemaTemplatesService.canvasStyle.fullSchema.formulaPicture;
        }
    }
}

class OtherFullSchemaViewerVertex extends ViewerVertex {
    public constructor(table) {
        super(table, new DataTypeOtherSchemaVertex());
    }
}

class  GroupWksWorksheetViewerVertex extends Vertex {

    public key: string;
    public wksName: string;
    public isGroup: boolean;

    public constructor(table: TableItem) {
        super(table, table.getId());
        this.key = strings.schemaViewer.WKS_GROUP_KEY;
        this.wksName = table.getName();
        this.isGroup = true;
    }
}

class WksViewerVertex extends ViewerVertex {

    /**
     *
     * @param {TableItem} table
     * @param {DataTypeVertex} typeVertex
     * @param {Array<LogicalColumn>} worksheetColumns
     * @constructor
     */
    public constructor (
        table: TableItem,
        typeVertex: DataTypeVertex,
        private worksheetColumns:any[]
    ) {
        super(table, typeVertex);
        this.setupColumns(table);
        _.extend(this, typeVertex);
        _.extend(this, this.getContainerVertex(table));
    }
    protected getContainerVertex(table) {
        return new WorksheetContainerVertex(table);
    }

    protected setupColumns(tableItem: TableItem) {
        super.setupColumns(tableItem);
        // We need to highlight the column of the worksheet
        this.fields.forEach((field) => {
            let key: string = field.key;
            if (this.worksheetColumns.indexOf(key) === -1) {
                field.textColor =
                    schemaTemplatesService.canvasStyle.fullSchema.columnNotInWorksheetTextColor;
                field.textFont = schemaTemplatesService.canvasStyle.fullSchema.rightPanelFont;
                field.isInWKS = false;
            } else {
                field.textFont = schemaTemplatesService.canvasStyle.fullSchema.rightPanelBoldFont;
                field.textColor = schemaTemplatesService.canvasStyle.fullSchema.columnTextColor;
                field.isInWKS = true;
            }
        });
    }
}

class TableWksViewerVertex extends WksViewerVertex {
    public constructor(table: TableItem, wksColumns) {
        super(
            table,
            new DataTypeTableSchemaVertex(),
            wksColumns
        );
    }
}

class WorksheetWksViewerVertex extends WksViewerVertex {
    public constructor(table: TableItem, wksColumns) {
        super(
            table,
            new DataTypeWksSchemaVertex(),
            wksColumns
        );
    }
}

class OtherWksViewerVertex extends WksViewerVertex {
    public constructor(table: TableItem, wksColumns) {
        super(
            table,
            new DataTypeOtherSchemaVertex(),
            wksColumns
        );
    }
}

/**
 * This holds the column of the worksheet
 *
 * @param {Array<LogicalColumnItem>} table
 * @constructor
 */
//TODO(chab) try to make an intermediate subclass like edge
export class WKSColumnsVertex extends Vertex {

    public key: string;
    public tableName: string;
    public group: string;
    public headerPicture: string;
    public headerColor: string;
    public visible: boolean;
    public fields: any[];
    public htmlToolTip: string;

    public constructor(table) {
        // we want a simple vertex
        super(
            table,
            strings.schemaViewer.WKS_COLUMNS_TABLE_KEY
        );

        this.key = strings.schemaViewer.WKS_COLUMNS_TABLE_KEY;
        this.tableName = strings.schemaViewer.WKS_TITLE;
        this.group = strings.schemaViewer.WKS_GROUP_KEY;

        this.headerPicture = schemaTemplatesService.canvasStyle.fullSchema.worksheetPicture;
        this.headerColor = schemaTemplatesService.canvasStyle.fullSchema.worksheetColor;

        this.headerColor = chroma(this.headerColor).darken(1).hex();
        this.visible = false;
        this.fields = table.map(function (column) {
            return {
                key: column.getGuid(),
                name: column.getName(),
                isFormula: column.isFormula(),
                textColor: 'black',
                info: column.getDataType(),
                traversal: column.traversal,
                targets: column.targets,
                pkImage: column.isFormula() ?
                    schemaTemplatesService.canvasStyle.fullSchema.formulaPicture : null
            };
        });
    }
}

export function getMasterVertexForWKS(table) {
    return new GroupWksWorksheetViewerVertex(table);
}

/**
 * Return the appropriate vertex for a wks
 * @param {TableItem} table
 * @param {Array<string>} wksColumns
 *
 */
export function getVertexForTableForWKSViewer(table: TableItem, wksColumns) {

    let vertex;
    // a table that has no columns in a worksheet
    // is part of the joinPath
    let isImplicit = wksColumns.length === 0;
    switch (table.getType()) {
        case jsonConstants.metadataType.subType.WORKSHEET:
        case jsonConstants.metadataType.subType.AGGR_WORKSHEET:
            vertex = new WorksheetWksViewerVertex(table, wksColumns);
            break;
        case jsonConstants.metadataType.subType.IMPORTED_DATA:
        case jsonConstants.metadataType.subType.SYSTEM_TABLE:
            vertex = new TableWksViewerVertex(table, wksColumns);
            break;
        default:
            vertex = new OtherWksViewerVertex(table, wksColumns);
    }

    vertex.group = strings.schemaViewer.WKS_GROUP_KEY;

    // header of table that are used in a join path but not in a WKS are brighter
    if (isImplicit) {
        // make it lighter
        vertex.headerColor = chroma(vertex.headerColor).brighten(1).hex();
    }

    return vertex;
}

export function getVertexForTable(table: TableItem): ViewerVertex {
    switch (table.getType()) {
        case jsonConstants.metadataType.subType.AGGR_WORKSHEET:
        case jsonConstants.metadataType.subType.WORKSHEET:
            return new WorksheetFullSchemaViewerVertex(table);
        case jsonConstants.metadataType.subType.IMPORTED_DATA:
        case jsonConstants.metadataType.subType.SYSTEM_TABLE:
            return new TableFullSchemaViewerVertex(table);
        default:
            return new OtherFullSchemaViewerVertex(table);
    }
}

