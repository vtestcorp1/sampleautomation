/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Schema models
 *
 *
 */


import _ from 'lodash';
import {ngRequire} from 'src/base/decorators';
import {strings} from 'src/base/strings';
import {jsonConstants} from  'src/modules/viz-layout/answer/json-constants';

let dateUtil = ngRequire('dateUtil');
let Logger = ngRequire('Logger');
let util = ngRequire('util');

interface ResolverKeysMap {
    TABLE: string;
    JOIN: string;
    COLUMN: string;
}

interface ResolverItemsMap {
    TABLE: {[idx:string] : TableItem};
    JOIN: {[idx:string] : JoinItem};
    COLUMN: {[idx:string] : ColumnItem};
}

interface InvolvedColumns {
    sourceColumns: Set<ColumnItem>;
    destinationColumns: Set<ColumnItem>;
}

const resolverKeysMap: ResolverKeysMap = {
    TABLE: 'TABLE',
    JOIN: 'JOIN',
    COLUMN: 'COLUMN'
};

export class BKSchema {

    public tables: TableItem[];

    public constructor(tables: any[],
                       public resolver: SchemaResolver = new SchemaResolver()) {
        this.tables = tables.map(tableJson => new TableItem(tableJson, this.resolver));
    }
}


export class ColumnItem {

    public sortedIdx: number;  //TODO(chab) get rid of that

    public constructor(
        public idx: number,
        private jsonContent: any,
        private tableId: string,
        public resolver: SchemaResolver
    ) {}

    public getName(): string {
        return _.get(this.jsonContent, 'header.name', '');
    }
    public isPrimaryKey() {
        return _.get(this.jsonContent, 'content.primary_key', false);
    }
    public isForeignKey(): boolean {
        return _.get(this.jsonContent, 'content.foreign_key', false);
    }
    public isFormula(): boolean {
        return _.get(this.jsonContent, 'content.sage_formula_id', false);
    }
    public isNorPkNorFk(): boolean {
        return !this.isForeignKey() && !this.isPrimaryKey();
    }
    public getId(): string {
        return _.get(this.jsonContent, 'header.id_guid', '');
    }

    public isDeleted(): boolean {
        return _.get(this.jsonContent, 'header.deleted', false);
    }

    public getSourceTableId(): string {
        return this.tableId;
    }

    public getSourceTable(): TableItem {
        return this.resolver.findTableById(this.getSourceTableId());
    }
    public getDisplayName(): string {
        return `${this.getName()}(${this.getSourceTable().getName()})`;
    }

    public getDataType(): string {
        return _.get(this.jsonContent, 'content.data_type',
            strings.schemaViewer.tooltip.common.NO_DATA);
    }

    public getTooltip = function() {
        let fullName = this.getName(),
            id = this.getId();

        let model = new util.NameValuePairs();

        model.add(strings.schemaViewer.tooltip.common.NAME, fullName);
        model.add(strings.schemaViewer.tooltip.common.TYPE, 'Column');
        let sourceTableName = this.getSourceTable().getName();
        model.add(strings.schemaViewer.tooltip.common.TABLE, sourceTableName);

        if(!!id) {
            model.add(strings.schemaViewer.tooltip.common.ID, id);
        }

        return model.getTemplate();
    };
}

class SchemaResolver {

    private objectIndex: ResolverItemsMap;
    private logger = Logger.create('schema-resolver');

    public constructor() {
        this.objectIndex = {
            TABLE: {},
            COLUMN: {},
            JOIN: {}
        };
    }

    public addTable(tableKey: string, table: TableItem) {
        this.addObject(resolverKeysMap.TABLE, tableKey, table);
    }

    public addColumn(columnKey: string, column: ColumnItem) {
        this.addObject(resolverKeysMap.COLUMN, columnKey, column);
    }

    public addJoin(columnKey: string, join: JoinItem) {
        this.addObject(resolverKeysMap.JOIN, columnKey, join);
    }

    public findTableById(tableKey: string): TableItem {
        return this.findObjectById(resolverKeysMap.TABLE, tableKey) as TableItem;
    }

    public findColumnById(columnKey: string): ColumnItem {
        return this.findObjectById(resolverKeysMap.COLUMN, columnKey) as ColumnItem;
    }

    public findJoinById(joinKey: string): JoinItem {
        return this.findObjectById(resolverKeysMap.JOIN, joinKey) as JoinItem;
    }

    public findObjectById(bucketId: string,
                          objectKey: string): TableItem | JoinItem | ColumnItem {
        let item = this.objectIndex[bucketId][objectKey];
        if (!item) {
            this.logger.warn('Item [', bucketId,'-',objectKey, '] was not found');
            return null;
        } else {
            return item;
        }
    }

    private addObject(bucketId: string, objectKey: string,
                      object: TableItem | JoinItem | ColumnItem) {
        if (this.objectIndex[bucketId][objectKey]) {
            this.logger.warn('Object[', resolverKeysMap,
                '-', objectKey, '] has already been added');
        }
        this.objectIndex[bucketId][objectKey] = object;
    }
}

export class TableItem {

    private columns: ColumnItem[] = [];

    // NOTE(chab), we want to display pk-fk columns, then pk columns, then fk columns
    // in all these sections, columns must be sorted alphabetically
    private sortedColumns: ColumnItem[] = [];
    private relationships: any[] = [];
    private logger = Logger.create('TableItem');

    public constructor(public jsonContent: any, private resolver: SchemaResolver) {
        let pkColumns = [],
            pkFkColumns = [],
            fkColumns = [],
            remainingColumns = [];

        // parse columns
        if (jsonContent.column) {
            let idx = 0;
            this.columns = jsonContent.column.map((columnJson) => {
                let column = new ColumnItem(idx, columnJson, jsonContent.header.id_guid, resolver);
                idx++;
                this.resolver.addColumn(column.getId(), column);
                return column;
            });
            //extract columns in proper sub-array
            this.columns.forEach((column) => {
                if (column.isPrimaryKey() && column.isForeignKey()) {
                    util.binaryInsert(column, pkFkColumns, columnSortPredicate);
                } else if (column.isPrimaryKey()) {
                    util.binaryInsert(column, pkColumns, columnSortPredicate);
                } else if (column.isForeignKey()) {
                    util.binaryInsert(column, fkColumns, columnSortPredicate);
                } else {
                    util.binaryInsert(column, remainingColumns, columnSortPredicate);
                }
            });

            this.sortedColumns = _.concat(pkFkColumns, pkColumns, fkColumns, remainingColumns);
            this.sortedColumns.forEach(function (column, index) {
                column.sortedIdx = index;
            });

            // parse relationships
            if (jsonContent.relationship) {
                this.relationships = jsonContent.relationship.map((relationshipJson) => {
                    let joinItem = new JoinItem(relationshipJson, resolver);
                    this.resolver.addJoin(joinItem.getId(), joinItem);
                    return joinItem;
                }, this);
            }
        }
        resolver.addTable(this.jsonContent.header.id_guid, this);
    }

    public getType(): string {
        return this.jsonContent.type;
    }

    public getAuthor(): string {
        return this.jsonContent.header.author_guid;
    }


    public isDeleted(): boolean {
        return this.jsonContent.header.deleted;
    }

    public getDisplayType(): string {
        let type = strings.schemaViewer.tableType[this.jsonContent.type];
        if (!type) {
            this.logger.error('No type found for table ', this.getId(), ' ', this.jsonContent.type);
        }
        return type;
    }
    public getDatabase(): string {
        return _.get(this.jsonContent, 'header.database_stripe',
            strings.schemaViewer.tooltip.common.NO_DATA);
    }

    public getColumns(): ColumnItem[] {
        return this.columns || [];
    }

    public getSortedColumnsForSchema(): ColumnItem[] {
        return this.sortedColumns || [];
    }

    public getColumnsName(): string[] {
        return this.jsonContent.columns.map(column => column.header.name);
    }

    public getDisplayName(): string {
        return _.get(this.jsonContent, 'header.name',
            strings.schemaViewer.tooltip.common.NO_DATA);
    }

    public getId(): string {
        return _.get(this.jsonContent, 'header.id_guid', '');
    }

    public getName(): string {
        return _.get(this.jsonContent, 'header.name', '');
    }

    public getTags() {
        return _.get(this.jsonContent, 'header.tag', []);
    }

    public getRelationShips(): JoinItem[] {
        return this.relationships;
    }

    public getCreatedAt(): string {
        return dateUtil.epochToTimeAgoString(this.jsonContent.header.created);
    }

    public getUpdatedAt(): string {
        return dateUtil.epochToTimeAgoString(this.jsonContent.header.modified);
    }

    public getTooltip() {
        let fullName = this.getName(),
            lastUpdate = this.getUpdatedAt(),
            createdAt = this.getCreatedAt(),
            model = new util.NameValuePairs();

        model.add(strings.schemaViewer.tooltip.common.NAME, fullName);
        model.add(strings.schemaViewer.tooltip.common.TYPE, this.getDisplayType());
        model.add(strings.schemaViewer.tooltip.common.DATABASE, this.getDatabase());

        if (!!lastUpdate) {
            model.add(strings.schemaViewer.tooltip.common.CREATED_AT, createdAt);
        }
        if (!!createdAt) {
            model.add(strings.schemaViewer.tooltip.common.UPDATED_AT, lastUpdate);
        }

        return model.getTemplate();
    }
}

export class JoinItem {

    private logger = Logger.create('JoinItemLogger');

    public constructor(private jsonContent: any, private resolver: SchemaResolver) {}

    public getSourceTableId(): string {
        return _.get(this.jsonContent, 'source_table_guid', '');
    }
    public getDestinationTableId(): string {
        return _.get(this.jsonContent, 'destination_table_guid', '');
    }
    public getDestinationTable(): TableItem {
        return this.resolver.findTableById(this.getDestinationTableId());
    }
    public getSourceTable(): TableItem {
        return this.resolver.findTableById(this.getSourceTableId());
    }
    public getType(): string {
        return _.get(this.jsonContent, 'type', '');
    }
    public getJoinType(): string {
        return _.get(this.jsonContent, 'join_type', '');
    }
    public getName(): string {
        return _.get(this.jsonContent, 'header.name', '');
    }
    public getId(): string {
        return _.get(this.jsonContent, 'header.id_guid', '');
    }
    public getContent(): any {
        return this.jsonContent.content;
    }

    public getDisplayString(): string {
        let sourceTable = this.getSourceTable().getName(),
            destinationTable = this.getDestinationTable().getName(),
            name = this.getName();

        return `${name}, (${sourceTable}, ${destinationTable})`;
    }

    public getInvolvedColumns(): InvolvedColumns {
        if (this.getType() === jsonConstants.relationshipMetadataType.GENERIC) {
            // there is no concept of source, destination in generic join
            // we must traverse the tree to collect the column and check to which table they belong
            return this.extractColumnsFromGenericJoin();
        }
        return this.extractColumns();
    }

    /**
     * Returns the targeted column of the join with an uniform representation that stays
     * the same for every type of join
     *
     * @returns {RelationShipItem}
     */
    public getRelationShips(): RelationShipItem {
        return new RelationShipItem(this);
    }

    public isDeleted(): boolean {
        return _.get(this.jsonContent, 'header.deleted', false);
    }

    public getTooltip() {
        let fullName = this.getName(),
            id = this.getId(),
            model = new util.NameValuePairs(),
            relationShips = this.getRelationShips(),
            sourceColumnsName = relationShips.getSourceColumns()
                .map(col => col.getName()),
            destinationColumnsName = relationShips.getDestinationColumns()
                .map(col => col.getName());

        model.add(strings.schemaViewer.tooltip.common.ID , id);
        model.add(strings.schemaViewer.tooltip.common.NAME, fullName);
        model.add(strings.schemaViewer.tooltip.common.TYPE, this.getType());
        model.add(strings.schemaViewer.tooltip.join.JOIN_TYPE , this.getJoinType());
        model.add(strings.schemaViewer.tooltip.join.SOURCE_TABLE,
            this.getSourceTable().getName());
        model.add(strings.schemaViewer.tooltip.join.DESTINATION_TABLE,
            this.getDestinationTable().getName());
        model.add(strings.schemaViewer.tooltip.join.SOURCE_COLUMNS,
            sourceColumnsName.join(', '));
        model.add(strings.schemaViewer.tooltip.join.DESTINATION_COLUMNS,
            destinationColumnsName.join(', '));

        if (this.getType() === jsonConstants.relationshipMetadataType.GENERIC) {
            model.add(strings.schemaViewer.tooltip.join.GENERIC_EXPRESSION,
                this.jsonContent.content.generic_join.name);
        }
        return model.getTemplate();
    }

    private extractColumns(): InvolvedColumns {
        let sourcesColumns: Set<ColumnItem> = new Set<ColumnItem>(),
            destinationColumns: Set<ColumnItem> = new Set<ColumnItem>();
        let checkColumn = (columnId: string, set: Set<ColumnItem>) => {
            let columnObject = this.resolver.findColumnById(columnId);
            if (!!columnObject) {
                set.add(columnObject);
            } else {
                this.logger.error('column', columnId, 'not found');
            }
        };
        this.getContent().relationship.forEach((rel) => {
            checkColumn(rel.source_column_guid, sourcesColumns);
            checkColumn(rel.destination_column_guid, destinationColumns);
        });
        return {
            sourceColumns: sourcesColumns,
            destinationColumns: destinationColumns
        };
    }

    private extractColumnsFromGenericJoin(): InvolvedColumns {
        let rootNode = this.getContent().generic_join,
            sourceTableId = this.getSourceTableId(),
            destinationTableId = this.getDestinationTableId(),
            sourcesColumns: Set<ColumnItem> = new Set<ColumnItem>(),
            destinationColumns: Set<ColumnItem> = new Set<ColumnItem>();

        visit(rootNode, (node: any) => {
            let column = this.resolver.findColumnById(node.id);

            if (!column) {
                this.logger.error('Column ', node.id, 'not present');
                return;
            }
            let sourceId = column.getSourceTable().getId();

            if (sourceId === sourceTableId) {
                sourcesColumns.add(column);
            } else if (sourceId === destinationTableId) {
                destinationColumns.add(column);
            } else {
                this.logger.warn
                (`Column source ${sourceId} not matching source or destination table id`);
            }
        });

        return {
            sourceColumns: sourcesColumns,
            destinationColumns: destinationColumns
        };
    }
}


/**
 * RelationShipItem is an uniform representation of the columns and tables
 * involved in a join
 *
 * @param joinItem
 * @param resolver
 * @constructor
 */
class RelationShipItem {

    private sourceColumns: ColumnItem[] = [];
    private destinationColumns: ColumnItem[] = [];

    public constructor(joinItem: JoinItem) {
        let involvedColumns = joinItem.getInvolvedColumns();
        this.sourceColumns = Array.from(involvedColumns.sourceColumns);
        this.destinationColumns = Array.from(involvedColumns.destinationColumns);
    }

    public getSourceColumns(): ColumnItem[] {
        return this.sourceColumns;
    }

    public getDestinationColumns():ColumnItem[] {
        return this.destinationColumns;
    }
}


function columnSortPredicate (columnA: ColumnItem, columnB: ColumnItem) {
    let a = columnA.getName(),
        b = columnB.getName();

    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else if (columnA.getId() > columnB.getId()) {
        return 1;
    } else if (columnA.getId() < columnB.getId()) {
        return -1;
    }
    this.logger.error('Find two columns with same id in same table', columnA.getId(),
        columnB.getId());
    return 0;
}


function visit(node, visitFunction:(any) => void) {
    if (node.child) {
        visit(node.child[0], visitFunction);
        visit(node.child[1], visitFunction);
    } else {
        if (node.column_type !== 'NONE') {
            visitFunction(node);
        }
    }
}
